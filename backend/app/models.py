from typing import Optional, List, Dict, Any
from sqlmodel import SQLModel, Field, Relationship, JSON, Column
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    SUPERADMIN = "superadmin"
    ADMIN = "admin"
    MANAGEMENT = "management"
    TEACHER = "teacher"
    STUDENT = "student"
    ACADEMICS = "academics"

class NotificationType(str, Enum):
    CLASS_REMINDER = "class_reminder"
    EXAM_REMINDER = "exam_reminder"
    TASK_ASSIGNED = "task_assigned"
    REPORT_DUE = "report_due"
    STUDENT_ISSUE = "student_issue"
    GENERAL = "general"

class MessageType(str, Enum):
    TEXT = "text"
    FILE = "file"
    IMAGE = "image"

class FeedbackType(str, Enum):
    ISSUE = "issue"
    SUGGESTION = "suggestion"
    COMPLAINT = "complaint"
    PRAISE = "praise"

class BehaviorType(str, Enum):
    STRENGTH = "strength"
    WEAKNESS = "weakness"
    BEHAVIOR = "behavior"

class UserBase(SQLModel):
    email: str
    username: str
    full_name: Optional[str] = None
    role: UserRole = UserRole.STUDENT
    designation: Optional[str] = None  # For management team specific titles
    is_active: bool = True
    phone: Optional[str] = None
    department: Optional[str] = None
    profile_image: Optional[str] = None
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    hashed_password: str
    teacher: Optional['Teacher'] = Relationship(back_populates='user')
    student: Optional['Student'] = Relationship(back_populates='user')
    created_by: Optional[int] = Field(default=None, foreign_key='user.id')
    last_login: Optional[datetime] = None
    
    # Relationships
    sent_messages: List['Message'] = Relationship(
        back_populates='sender',
        sa_relationship_kwargs={"foreign_keys": "[Message.sender_id]"}
    )
    received_messages: List['Message'] = Relationship(
        back_populates='receiver',
        sa_relationship_kwargs={"foreign_keys": "[Message.receiver_id]"}
    )
    notifications: List['Notification'] = Relationship(back_populates='user')
    created_tasks: List['Task'] = Relationship(
        back_populates='created_by_user',
        sa_relationship_kwargs={"foreign_keys": "[Task.created_by]"}
    )
    assigned_tasks: List['Task'] = Relationship(
        back_populates='assigned_to_user',
        sa_relationship_kwargs={"foreign_keys": "[Task.assigned_to]"}
    )

# Permission System Models
class Permission(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True)
    description: Optional[str] = None
    resource: str  # e.g., 'users', 'students', 'reports'
    action: str    # e.g., 'create', 'read', 'update', 'delete'
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

class RolePermission(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    role: UserRole
    permission_id: int = Field(foreign_key='permission.id')
    granted: bool = True
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

class UserPermission(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key='user.id')
    permission_id: int = Field(foreign_key='permission.id')
    granted: bool = True
    granted_by: Optional[int] = Field(default=None, foreign_key='user.id')
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

class Teacher(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(default=None, foreign_key='user.id')
    subjects: Optional[str] = None  # comma separated for MVP
    employee_id: Optional[str] = None
    joining_date: Optional[datetime] = None
    qualification: Optional[str] = None
    experience_years: Optional[int] = None
    user: Optional[User] = Relationship(back_populates='teacher')
    
    # Relationships
    class_assignments: List['ClassAssignment'] = Relationship(back_populates='teacher')
    exam_results: List['ExamResult'] = Relationship(back_populates='teacher')
    attendance_records: List['Attendance'] = Relationship(back_populates='teacher')

class Student(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(default=None, foreign_key='user.id')
    full_name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    batch_id: Optional[int] = Field(default=None, foreign_key='batch.id')
    student_id: Optional[str] = None  # Roll number or student ID
    date_of_birth: Optional[datetime] = None
    address: Optional[str] = None
    parent_name: Optional[str] = None
    parent_phone: Optional[str] = None
    admission_date: Optional[datetime] = None
    
    # Relationships
    user: Optional[User] = Relationship(back_populates='student')
    batch: Optional['Batch'] = Relationship(back_populates='students')
    exam_results: List['ExamResult'] = Relationship(back_populates='student')
    attendance_records: List['Attendance'] = Relationship(back_populates='student')
    behavior_records: List['BehaviorRecord'] = Relationship(back_populates='student')
    feedback_submissions: List['FeedbackForm'] = Relationship(back_populates='student')
    payments: List['Payment'] = Relationship(back_populates='student')

class Batch(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    course: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    max_students: Optional[int] = 30
    fee_amount: Optional[float] = None
    created_by: Optional[int] = Field(default=None, foreign_key='user.id')
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    
    # Relationships
    students: List[Student] = Relationship(back_populates='batch')
    class_assignments: List['ClassAssignment'] = Relationship(back_populates='batch')

class ClassAssignment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    batch_id: Optional[int] = Field(default=None, foreign_key='batch.id')
    teacher_id: Optional[int] = Field(default=None, foreign_key='teacher.id')
    subject: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    duration_minutes: Optional[int] = 60
    classroom: Optional[str] = None
    is_recurring: bool = False
    recurring_days: Optional[str] = None  # JSON string of days
    created_by: Optional[int] = Field(default=None, foreign_key='user.id')
    
    # Relationships
    batch: Optional[Batch] = Relationship(back_populates='class_assignments')
    teacher: Optional[Teacher] = Relationship(back_populates='class_assignments')

# Messaging System Models
class ChatGroup(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: Optional[str] = None
    created_by: int = Field(foreign_key='user.id')
    is_active: bool = True
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    
    # Relationships
    members: List['ChatGroupMember'] = Relationship(back_populates='group')
    messages: List['GroupMessage'] = Relationship(back_populates='group')

class ChatGroupMember(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    group_id: int = Field(foreign_key='chatgroup.id')
    user_id: int = Field(foreign_key='user.id')
    joined_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    is_admin: bool = False
    
    # Relationships
    group: Optional[ChatGroup] = Relationship(back_populates='members')

class Message(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    sender_id: int = Field(foreign_key='user.id')
    receiver_id: int = Field(foreign_key='user.id')
    content: str
    message_type: MessageType = MessageType.TEXT
    file_url: Optional[str] = None
    is_read: bool = False
    sent_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    
    # Relationships
    sender: Optional[User] = Relationship(
        back_populates='sent_messages',
        sa_relationship_kwargs={"foreign_keys": "[Message.sender_id]"}
    )
    receiver: Optional[User] = Relationship(
        back_populates='received_messages',
        sa_relationship_kwargs={"foreign_keys": "[Message.receiver_id]"}
    )

class GroupMessage(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    group_id: int = Field(foreign_key='chatgroup.id')
    sender_id: int = Field(foreign_key='user.id')
    content: str
    message_type: MessageType = MessageType.TEXT
    file_url: Optional[str] = None
    sent_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    
    # Relationships
    group: Optional[ChatGroup] = Relationship(back_populates='messages')

# Notification System
class Notification(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key='user.id')
    title: str
    message: str
    notification_type: NotificationType
    is_read: bool = False
    data: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))  # Additional data
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    
    # Relationships
    user: Optional[User] = Relationship(back_populates='notifications')

# Task Management System
class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: Optional[str] = None
    created_by: int = Field(foreign_key='user.id')
    assigned_to: int = Field(foreign_key='user.id')
    due_date: Optional[datetime] = None
    priority: str = "medium"  # low, medium, high
    status: str = "pending"   # pending, in_progress, completed
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    
    # Relationships
    created_by_user: Optional[User] = Relationship(
        back_populates='created_tasks',
        sa_relationship_kwargs={"foreign_keys": "[Task.created_by]"}
    )
    assigned_to_user: Optional[User] = Relationship(
        back_populates='assigned_tasks',
        sa_relationship_kwargs={"foreign_keys": "[Task.assigned_to]"}
    )

# Academic Management Models
class Exam(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    subject: str
    batch_id: int = Field(foreign_key='batch.id')
    exam_date: datetime
    max_marks: float
    duration_minutes: int
    created_by: int = Field(foreign_key='user.id')
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    
    # Relationships
    results: List['ExamResult'] = Relationship(back_populates='exam')

class ExamResult(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    exam_id: int = Field(foreign_key='exam.id')
    student_id: int = Field(foreign_key='student.id')
    teacher_id: int = Field(foreign_key='teacher.id')  # Who entered the marks
    marks_obtained: float
    grade: Optional[str] = None
    remarks: Optional[str] = None
    entered_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    
    # Relationships
    exam: Optional[Exam] = Relationship(back_populates='results')
    student: Optional[Student] = Relationship(back_populates='exam_results')
    teacher: Optional[Teacher] = Relationship(back_populates='exam_results')

class Attendance(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: int = Field(foreign_key='student.id')
    teacher_id: int = Field(foreign_key='teacher.id')
    class_date: datetime
    subject: str
    is_present: bool
    marked_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    remarks: Optional[str] = None
    
    # Relationships
    student: Optional[Student] = Relationship(back_populates='attendance_records')
    teacher: Optional[Teacher] = Relationship(back_populates='attendance_records')

class BehaviorRecord(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: int = Field(foreign_key='student.id')
    teacher_id: int = Field(foreign_key='teacher.id')
    behavior_type: BehaviorType
    title: str
    description: str
    severity: Optional[str] = "medium"  # low, medium, high
    date_recorded: Optional[datetime] = Field(default_factory=datetime.utcnow)
    
    # Relationships
    student: Optional[Student] = Relationship(back_populates='behavior_records')

# Payment System
class Payment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: int = Field(foreign_key='student.id')
    amount: float
    payment_type: str = "fee"  # fee, fine, other
    payment_method: str = "cash"  # cash, card, online
    payment_date: Optional[datetime] = Field(default_factory=datetime.utcnow)
    due_date: Optional[datetime] = None
    status: str = "paid"  # pending, paid, overdue
    remarks: Optional[str] = None
    collected_by: Optional[int] = Field(default=None, foreign_key='user.id')
    
    # Relationships
    student: Optional[Student] = Relationship(back_populates='payments')

# Feedback System
class FeedbackForm(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: int = Field(foreign_key='student.id')
    feedback_type: FeedbackType
    subject: str
    message: str
    is_anonymous: bool = False
    status: str = "pending"  # pending, reviewing, resolved
    priority: str = "medium"  # low, medium, high
    submitted_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[int] = Field(default=None, foreign_key='user.id')
    admin_response: Optional[str] = None
    
    # Relationships
    student: Optional[Student] = Relationship(back_populates='feedback_submissions')

# Report Card System
class ReportCard(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: int = Field(foreign_key='student.id')
    term: str  # e.g., "Semester 1", "Quarter 1"
    academic_year: str  # e.g., "2023-2024"
    overall_grade: Optional[str] = None
    overall_percentage: Optional[float] = None
    attendance_percentage: Optional[float] = None
    teacher_remarks: Optional[str] = None
    generated_by: int = Field(foreign_key='user.id')
    generated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    
    # Additional data stored as JSON
    subject_grades: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    behavior_summary: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
