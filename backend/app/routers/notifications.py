from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List, Dict, Any
from datetime import datetime, timedelta
from ..database import get_session
from ..models import User, Notification, NotificationType, ClassAssignment, Exam, Task
from ..schemas import NotificationCreate, NotificationRead
from ..core.deps import get_current_user

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.post("/", response_model=NotificationRead)
def create_notification(
    notification: NotificationCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    # Check if target user exists
    target_user = session.get(User, notification.user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db_notification = Notification(**notification.model_dump())
    session.add(db_notification)
    session.commit()
    session.refresh(db_notification)
    return db_notification

@router.get("/", response_model=List[NotificationRead])
def get_my_notifications(
    limit: int = 50,
    offset: int = 0,
    unread_only: bool = False,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    query = select(Notification).where(Notification.user_id == current_user.id)
    
    if unread_only:
        query = query.where(Notification.is_read == False)
    
    notifications = session.exec(
        query.order_by(Notification.created_at.desc())
        .offset(offset)
        .limit(limit)
    ).all()
    
    return notifications

@router.put("/{notification_id}/read", response_model=NotificationRead)
def mark_notification_read(
    notification_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    notification = session.get(Notification, notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    if notification.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this notification")
    
    notification.is_read = True
    session.commit()
    session.refresh(notification)
    return notification

@router.put("/mark-all-read", response_model=dict)
def mark_all_notifications_read(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    notifications = session.exec(
        select(Notification).where(
            Notification.user_id == current_user.id,
            Notification.is_read == False
        )
    ).all()
    
    for notification in notifications:
        notification.is_read = True
    
    session.commit()
    return {"message": f"Marked {len(notifications)} notifications as read"}

@router.get("/unread-count", response_model=dict)
def get_unread_count(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    count = len(session.exec(
        select(Notification).where(
            Notification.user_id == current_user.id,
            Notification.is_read == False
        )
    ).all())
    
    return {"unread_count": count}

# Automated notification functions
def send_class_reminder_notifications(session: Session):
    """Send class reminder notifications to students"""
    # Get classes starting in the next 30 minutes
    start_time = datetime.utcnow()
    end_time = start_time + timedelta(minutes=30)
    
    upcoming_classes = session.exec(
        select(ClassAssignment)
        .where(
            ClassAssignment.scheduled_at >= start_time,
            ClassAssignment.scheduled_at <= end_time
        )
    ).all()
    
    for class_assignment in upcoming_classes:
        if class_assignment.batch:
            # Send notification to all students in the batch
            for student in class_assignment.batch.students:
                if student.user:
                    notification = Notification(
                        user_id=student.user.id,
                        title="Upcoming Class",
                        message=f"Your {class_assignment.subject} class is starting at {class_assignment.scheduled_at.strftime('%H:%M')}",
                        notification_type=NotificationType.CLASS_REMINDER,
                        data={
                            "class_id": class_assignment.id,
                            "subject": class_assignment.subject,
                            "scheduled_at": class_assignment.scheduled_at.isoformat(),
                            "classroom": class_assignment.classroom
                        }
                    )
                    session.add(notification)
    
    session.commit()

def send_exam_reminder_notifications(session: Session):
    """Send exam reminder notifications to students"""
    # Get exams in the next 24 hours
    start_time = datetime.utcnow()
    end_time = start_time + timedelta(hours=24)
    
    upcoming_exams = session.exec(
        select(Exam)
        .where(
            Exam.exam_date >= start_time,
            Exam.exam_date <= end_time
        )
    ).all()
    
    for exam in upcoming_exams:
        if exam.batch_id:
            # Get all students in the batch
            from ..models import Batch, Student
            batch = session.get(Batch, exam.batch_id)
            if batch:
                for student in batch.students:
                    if student.user:
                        notification = Notification(
                            user_id=student.user.id,
                            title="Upcoming Exam",
                            message=f"You have a {exam.subject} exam tomorrow at {exam.exam_date.strftime('%H:%M')}",
                            notification_type=NotificationType.EXAM_REMINDER,
                            data={
                                "exam_id": exam.id,
                                "subject": exam.subject,
                                "exam_date": exam.exam_date.isoformat(),
                                "max_marks": exam.max_marks,
                                "duration_minutes": exam.duration_minutes
                            }
                        )
                        session.add(notification)
    
    session.commit()

def send_task_assigned_notification(session: Session, task: Task):
    """Send notification when a task is assigned"""
    notification = Notification(
        user_id=task.assigned_to,
        title="New Task Assigned",
        message=f"You have been assigned a new task: {task.title}",
        notification_type=NotificationType.TASK_ASSIGNED,
        data={
            "task_id": task.id,
            "task_title": task.title,
            "due_date": task.due_date.isoformat() if task.due_date else None,
            "priority": task.priority,
            "created_by": task.created_by
        }
    )
    session.add(notification)
    session.commit()

def send_student_issue_notification(session: Session, feedback_id: int, admin_users: List[User]):
    """Send notification to management when student submits feedback"""
    from ..models import FeedbackForm
    feedback = session.get(FeedbackForm, feedback_id)
    
    if not feedback:
        return
    
    for admin_user in admin_users:
        if admin_user.role in ["admin", "management"]:
            notification = Notification(
                user_id=admin_user.id,
                title="New Student Feedback",
                message=f"New {feedback.feedback_type} feedback submitted: {feedback.subject}",
                notification_type=NotificationType.STUDENT_ISSUE,
                data={
                    "feedback_id": feedback.id,
                    "feedback_type": feedback.feedback_type,
                    "subject": feedback.subject,
                    "priority": feedback.priority,
                    "is_anonymous": feedback.is_anonymous
                }
            )
            session.add(notification)
    
    session.commit()

def send_report_due_notification(session: Session, management_users: List[User]):
    """Send notification about due reports"""
    for user in management_users:
        if user.role == "management":
            notification = Notification(
                user_id=user.id,
                title="Report Due",
                message="You have pending reports that need to be submitted",
                notification_type=NotificationType.REPORT_DUE,
                data={"reminder_type": "report_due"}
            )
            session.add(notification)
    
    session.commit()

# Batch notification endpoints for admin
@router.post("/send-bulk", response_model=dict)
def send_bulk_notification(
    user_ids: List[int],
    title: str,
    message: str,
    notification_type: NotificationType = NotificationType.GENERAL,
    data: Dict[str, Any] = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    # Only admin and management can send bulk notifications
    if current_user.role not in ["admin", "superadmin", "management"]:
        raise HTTPException(status_code=403, detail="Not authorized to send bulk notifications")
    
    notifications_created = 0
    for user_id in user_ids:
        user = session.get(User, user_id)
        if user:
            notification = Notification(
                user_id=user_id,
                title=title,
                message=message,
                notification_type=notification_type,
                data=data
            )
            session.add(notification)
            notifications_created += 1
    
    session.commit()
    return {"message": f"Sent {notifications_created} notifications"}

@router.post("/send-role-based", response_model=dict)
def send_role_based_notification(
    roles: List[str],
    title: str,
    message: str,
    notification_type: NotificationType = NotificationType.GENERAL,
    data: Dict[str, Any] = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    # Only admin can send role-based notifications
    if current_user.role not in ["admin", "superadmin"]:
        raise HTTPException(status_code=403, detail="Not authorized to send role-based notifications")
    
    users = session.exec(
        select(User).where(User.role.in_(roles), User.is_active == True)
    ).all()
    
    notifications_created = 0
    for user in users:
        notification = Notification(
            user_id=user.id,
            title=title,
            message=message,
            notification_type=notification_type,
            data=data
        )
        session.add(notification)
        notifications_created += 1
    
    session.commit()
    return {"message": f"Sent {notifications_created} notifications to users with roles: {', '.join(roles)}"}

# Admin endpoint to trigger automated notifications manually
@router.post("/trigger-class-reminders", response_model=dict)
def trigger_class_reminders(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "superadmin", "academics"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    send_class_reminder_notifications(session)
    return {"message": "Class reminder notifications sent"}

@router.post("/trigger-exam-reminders", response_model=dict)
def trigger_exam_reminders(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "superadmin", "academics"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    send_exam_reminder_notifications(session)
    return {"message": "Exam reminder notifications sent"}
