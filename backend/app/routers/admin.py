from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from ..database import get_session
from ..models import (
    User, Student, Teacher, Permission, RolePermission, UserPermission,
    Batch, Task, Notification, FeedbackForm, ExamResult, Attendance,
    ClassAssignment, Exam, Payment
)
from ..schemas import (
    UserCreate, UserRead, UserUpdate, StudentCreate, StudentRead,
    TeacherCreate, TeacherRead, PermissionRead, DashboardStats
)
from ..core.deps import get_current_user, require_role
from ..core.security import get_password_hash

router = APIRouter(prefix="/admin", tags=["admin"])

# User Management
@router.post("/users/", response_model=UserRead)
def create_user(
    user: UserCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role("admin", "superadmin"))
):
    # Check if username or email already exists
    existing_user = session.exec(
        select(User).where((User.username == user.username) | (User.email == user.email))
    ).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username or email already exists")
    
    # Only superadmin can create admin users
    if user.role == "admin" and current_user.role != "superadmin":
        raise HTTPException(status_code=403, detail="Only superadmin can create admin users")
    
    db_user = User(
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        role=user.role,
        designation=user.designation,
        phone=user.phone,
        department=user.department,
        is_active=user.is_active,
        hashed_password=get_password_hash(user.password),
        created_by=current_user.id
    )
    
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    
    return db_user

@router.get("/users/", response_model=List[UserRead])
def get_all_users(
    limit: int = 100,
    offset: int = 0,
    role: Optional[str] = None,
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role("admin", "superadmin"))
):
    query = select(User)
    
    # Apply filters
    if role:
        query = query.where(User.role == role)
    if is_active is not None:
        query = query.where(User.is_active == is_active)
    if search:
        query = query.where(
            (User.username.contains(search)) |
            (User.full_name.contains(search)) |
            (User.email.contains(search))
        )
    
    users = session.exec(
        query.order_by(User.created_at.desc())
        .offset(offset)
        .limit(limit)
    ).all()
    
    return users

@router.get("/users/{user_id}", response_model=UserRead)
def get_user(
    user_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role("admin", "superadmin"))
):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/users/{user_id}", response_model=UserRead)
def update_user(
    user_id: int,
    user_update: UserUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role("admin", "superadmin"))
):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Only superadmin can update admin users
    if user.role == "admin" and current_user.role != "superadmin":
        raise HTTPException(status_code=403, detail="Only superadmin can update admin users")
    
    # Only superadmin can assign admin role
    if user_update.role == "admin" and current_user.role != "superadmin":
        raise HTTPException(status_code=403, detail="Only superadmin can assign admin role")
    
    update_data = user_update.model_dump(exclude_unset=True)
    
    # Handle password update
    if "password" in update_data:
        update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
    
    update_data["updated_at"] = datetime.utcnow()
    
    for key, value in update_data.items():
        setattr(user, key, value)
    
    session.commit()
    session.refresh(user)
    
    return user

@router.delete("/users/{user_id}", response_model=dict)
def delete_user(
    user_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role("superadmin"))
):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    
    # Instead of hard delete, deactivate the user
    user.is_active = False
    session.commit()
    
    return {"message": "User deactivated successfully"}

# Student Management
@router.post("/students/", response_model=StudentRead)
def create_student_with_user(
    student_data: Dict[str, Any],
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role("admin", "superadmin"))
):
    """Create a student record with associated user account"""
    
    # Extract user data
    user_data = {
        "email": student_data["email"],
        "username": student_data["username"],
        "full_name": student_data["full_name"],
        "password": student_data.get("password", "student123"),
        "role": "student",
        "phone": student_data.get("phone"),
        "is_active": True
    }
    
    # Create user first
    user = UserCreate(**user_data)
    db_user = User(
        **user.model_dump(exclude={"password"}),
        hashed_password=get_password_hash(user.password),
        created_by=current_user.id
    )
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    
    # Create student record
    student = Student(
        user_id=db_user.id,
        full_name=student_data["full_name"],
        phone=student_data.get("phone"),
        email=student_data["email"],
        batch_id=student_data.get("batch_id"),
        student_id=student_data.get("student_id"),
        date_of_birth=student_data.get("date_of_birth"),
        address=student_data.get("address"),
        parent_name=student_data.get("parent_name"),
        parent_phone=student_data.get("parent_phone"),
        admission_date=student_data.get("admission_date", datetime.utcnow())
    )
    session.add(student)
    session.commit()
    session.refresh(student)
    
    return student

@router.get("/students/", response_model=List[StudentRead])
def get_all_students(
    limit: int = 100,
    offset: int = 0,
    batch_id: Optional[int] = None,
    search: Optional[str] = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role("admin", "superadmin", "academics", "management"))
):
    query = select(Student)
    
    # Apply filters
    if batch_id:
        query = query.where(Student.batch_id == batch_id)
    if search:
        query = query.where(
            (Student.full_name.contains(search)) |
            (Student.email.contains(search)) |
            (Student.student_id.contains(search))
        )
    
    students = session.exec(
        query.order_by(Student.admission_date.desc())
        .offset(offset)
        .limit(limit)
    ).all()
    
    return students

# Teacher Management
@router.post("/teachers/", response_model=TeacherRead)
def create_teacher_with_user(
    teacher_data: Dict[str, Any],
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role("admin", "superadmin"))
):
    """Create a teacher record with associated user account"""
    
    # Extract user data
    user_data = {
        "email": teacher_data["email"],
        "username": teacher_data["username"],
        "full_name": teacher_data["full_name"],
        "password": teacher_data.get("password", "teacher123"),
        "role": "teacher",
        "phone": teacher_data.get("phone"),
        "department": teacher_data.get("department"),
        "is_active": True
    }
    
    # Create user first
    user = UserCreate(**user_data)
    db_user = User(
        **user.model_dump(exclude={"password"}),
        hashed_password=get_password_hash(user.password),
        created_by=current_user.id
    )
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    
    # Create teacher record
    teacher = Teacher(
        user_id=db_user.id,
        subjects=teacher_data.get("subjects"),
        employee_id=teacher_data.get("employee_id"),
        joining_date=teacher_data.get("joining_date", datetime.utcnow()),
        qualification=teacher_data.get("qualification"),
        experience_years=teacher_data.get("experience_years")
    )
    session.add(teacher)
    session.commit()
    session.refresh(teacher)
    
    return teacher

@router.get("/teachers/", response_model=List[TeacherRead])
def get_all_teachers(
    limit: int = 100,
    offset: int = 0,
    department: Optional[str] = None,
    search: Optional[str] = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role("admin", "superadmin", "academics", "management"))
):
    query = select(Teacher)
    
    # Join with User table for search and department filter
    if department or search:
        query = query.join(User, Teacher.user_id == User.id)
        if department:
            query = query.where(User.department == department)
        if search:
            query = query.where(
                (User.full_name.contains(search)) |
                (User.email.contains(search)) |
                (Teacher.employee_id.contains(search))
            )
    
    teachers = session.exec(
        query.order_by(Teacher.joining_date.desc())
        .offset(offset)
        .limit(limit)
    ).all()
    
    return teachers

# System Analytics and Reports
@router.get("/analytics/overview", response_model=dict)
def get_system_overview(
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role("admin", "superadmin"))
):
    # User statistics
    total_users = len(session.exec(select(User)).all())
    active_users = len(session.exec(select(User).where(User.is_active == True)).all())
    
    # Role-wise counts
    superadmins = len(session.exec(select(User).where(User.role == "superadmin")).all())
    admins = len(session.exec(select(User).where(User.role == "admin")).all())
    management = len(session.exec(select(User).where(User.role == "management")).all())
    teachers = len(session.exec(select(User).where(User.role == "teacher")).all())
    students = len(session.exec(select(User).where(User.role == "student")).all())
    academics = len(session.exec(select(User).where(User.role == "academics")).all())
    
    # Academic statistics
    total_batches = len(session.exec(select(Batch)).all())
    total_exams = len(session.exec(select(Exam)).all())
    total_classes = len(session.exec(select(ClassAssignment)).all())
    
    # Activity statistics
    pending_feedback = len(session.exec(select(FeedbackForm).where(FeedbackForm.status == "pending")).all())
    pending_tasks = len(session.exec(select(Task).where(Task.status == "pending")).all())
    
    # Recent activity (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent_users = len(session.exec(
        select(User).where(User.created_at >= thirty_days_ago)
    ).all())
    recent_exam_results = len(session.exec(
        select(ExamResult).where(ExamResult.entered_at >= thirty_days_ago)
    ).all())
    
    return {
        "users": {
            "total": total_users,
            "active": active_users,
            "inactive": total_users - active_users,
            "by_role": {
                "superadmin": superadmins,
                "admin": admins,
                "management": management,
                "teachers": teachers,
                "students": students,
                "academics": academics
            }
        },
        "academic": {
            "total_batches": total_batches,
            "total_exams": total_exams,
            "total_classes": total_classes
        },
        "activity": {
            "pending_feedback": pending_feedback,
            "pending_tasks": pending_tasks
        },
        "recent": {
            "new_users": recent_users,
            "exam_results_entered": recent_exam_results
        }
    }

@router.get("/analytics/attendance", response_model=dict)
def get_attendance_analytics(
    batch_id: Optional[int] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role("admin", "superadmin", "academics"))
):
    query = select(Attendance)
    
    if batch_id:
        # Join with Student to filter by batch
        query = query.join(Student, Attendance.student_id == Student.id)
        query = query.where(Student.batch_id == batch_id)
    
    if start_date:
        query = query.where(Attendance.class_date >= start_date)
    if end_date:
        query = query.where(Attendance.class_date <= end_date)
    
    attendance_records = session.exec(query).all()
    
    total_records = len(attendance_records)
    present_records = len([r for r in attendance_records if r.is_present])
    
    overall_percentage = (present_records / total_records * 100) if total_records > 0 else 0
    
    # Subject-wise attendance
    subject_stats = {}
    for record in attendance_records:
        if record.subject not in subject_stats:
            subject_stats[record.subject] = {"total": 0, "present": 0}
        subject_stats[record.subject]["total"] += 1
        if record.is_present:
            subject_stats[record.subject]["present"] += 1
    
    for subject in subject_stats:
        stats = subject_stats[subject]
        stats["percentage"] = (stats["present"] / stats["total"] * 100) if stats["total"] > 0 else 0
    
    return {
        "overall": {
            "total_classes": total_records,
            "present": present_records,
            "absent": total_records - present_records,
            "percentage": round(overall_percentage, 2)
        },
        "by_subject": subject_stats
    }

@router.get("/analytics/performance", response_model=dict)
def get_performance_analytics(
    batch_id: Optional[int] = None,
    subject: Optional[str] = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role("admin", "superadmin", "academics"))
):
    query = select(ExamResult, Exam).join(Exam, ExamResult.exam_id == Exam.id)
    
    if batch_id:
        query = query.where(Exam.batch_id == batch_id)
    if subject:
        query = query.where(Exam.subject == subject)
    
    results = session.exec(query).all()
    
    if not results:
        return {"message": "No results found"}
    
    # Calculate statistics
    total_results = len(results)
    total_marks = sum([result.marks_obtained for result, _ in results])
    total_possible = sum([exam.max_marks for _, exam in results])
    
    overall_percentage = (total_marks / total_possible * 100) if total_possible > 0 else 0
    
    # Grade distribution
    grade_distribution = {}
    for result, _ in results:
        grade = result.grade
        grade_distribution[grade] = grade_distribution.get(grade, 0) + 1
    
    # Subject-wise performance
    subject_performance = {}
    for result, exam in results:
        subject_name = exam.subject
        if subject_name not in subject_performance:
            subject_performance[subject_name] = {
                "total_marks": 0,
                "total_possible": 0,
                "count": 0,
                "grades": {}
            }
        
        subject_performance[subject_name]["total_marks"] += result.marks_obtained
        subject_performance[subject_name]["total_possible"] += exam.max_marks
        subject_performance[subject_name]["count"] += 1
        
        grade = result.grade
        subject_performance[subject_name]["grades"][grade] = \
            subject_performance[subject_name]["grades"].get(grade, 0) + 1
    
    # Calculate percentages for each subject
    for subject_name in subject_performance:
        stats = subject_performance[subject_name]
        stats["percentage"] = (stats["total_marks"] / stats["total_possible"] * 100) \
            if stats["total_possible"] > 0 else 0
    
    return {
        "overall": {
            "total_results": total_results,
            "average_percentage": round(overall_percentage, 2),
            "grade_distribution": grade_distribution
        },
        "by_subject": subject_performance
    }

# Bulk Operations
@router.post("/bulk/activate-users", response_model=dict)
def bulk_activate_users(
    user_ids: List[int],
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role("admin", "superadmin"))
):
    activated_count = 0
    for user_id in user_ids:
        user = session.get(User, user_id)
        if user and not user.is_active:
            user.is_active = True
            activated_count += 1
    
    session.commit()
    return {"message": f"Activated {activated_count} users"}

@router.post("/bulk/deactivate-users", response_model=dict)
def bulk_deactivate_users(
    user_ids: List[int],
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role("admin", "superadmin"))
):
    deactivated_count = 0
    for user_id in user_ids:
        user = session.get(User, user_id)
        if user and user.is_active and user.id != current_user.id:  # Can't deactivate self
            user.is_active = False
            deactivated_count += 1
    
    session.commit()
    return {"message": f"Deactivated {deactivated_count} users"}

@router.post("/bulk/assign-batch", response_model=dict)
def bulk_assign_batch_to_students(
    student_ids: List[int],
    batch_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role("admin", "superadmin", "academics"))
):
    # Verify batch exists
    batch = session.get(Batch, batch_id)
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    assigned_count = 0
    for student_id in student_ids:
        student = session.get(Student, student_id)
        if student:
            student.batch_id = batch_id
            assigned_count += 1
    
    session.commit()
    return {"message": f"Assigned {assigned_count} students to batch {batch.name}"}

# System Logs and Audit Trail
@router.get("/logs/user-activity", response_model=List[dict])
def get_user_activity_logs(
    limit: int = 100,
    offset: int = 0,
    user_id: Optional[int] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role("superadmin"))
):
    # This would typically come from an audit log table
    # For now, we'll return recent user updates as an example
    query = select(User)
    
    if user_id:
        query = query.where(User.id == user_id)
    if start_date:
        query = query.where(User.updated_at >= start_date)
    if end_date:
        query = query.where(User.updated_at <= end_date)
    
    users = session.exec(
        query.order_by(User.updated_at.desc())
        .offset(offset)
        .limit(limit)
    ).all()
    
    # Format as activity logs
    logs = []
    for user in users:
        logs.append({
            "user_id": user.id,
            "username": user.username,
            "full_name": user.full_name,
            "action": "profile_updated",
            "timestamp": user.updated_at,
            "details": {
                "role": user.role,
                "is_active": user.is_active,
                "last_updated_by": user.created_by
            }
        })
    
    return logs

# Database Maintenance
@router.post("/maintenance/cleanup-notifications", response_model=dict)
def cleanup_old_notifications(
    days_old: int = 30,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role("superadmin"))
):
    cutoff_date = datetime.utcnow() - timedelta(days=days_old)
    
    old_notifications = session.exec(
        select(Notification).where(
            Notification.created_at < cutoff_date,
            Notification.is_read == True
        )
    ).all()
    
    deleted_count = len(old_notifications)
    for notification in old_notifications:
        session.delete(notification)
    
    session.commit()
    return {"message": f"Deleted {deleted_count} old notifications"}

# Export Data
@router.get("/export/users", response_model=List[dict])
def export_users_data(
    role: Optional[str] = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role("admin", "superadmin"))
):
    query = select(User)
    
    if role:
        query = query.where(User.role == role)
    
    users = session.exec(query).all()
    
    # Format for export
    export_data = []
    for user in users:
        export_data.append({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "department": user.department,
            "phone": user.phone,
            "is_active": user.is_active,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "updated_at": user.updated_at.isoformat() if user.updated_at else None
        })
    
    return export_data
