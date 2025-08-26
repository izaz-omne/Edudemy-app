from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from .models import UserRole, NotificationType, MessageType, FeedbackType, BehaviorType

class Token(BaseModel):
    access_token: str
    token_type: str
    user: 'UserRead'

class TokenPayload(BaseModel):
    sub: Optional[str] = None

class UserCreate(BaseModel):
    email: str
    username: str
    full_name: Optional[str] = None
    password: str
    role: UserRole = UserRole.TEACHER
    designation: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    is_active: bool = True

class UserUpdate(BaseModel):
    email: Optional[str] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    designation: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None

class UserRead(BaseModel):
    id: int
    email: str
    username: str
    full_name: Optional[str]
    role: UserRole
    designation: Optional[str]
    is_active: bool
    phone: Optional[str]
    department: Optional[str]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

class LoginRequest(BaseModel):
    username: str
    password: str

class StudentCreate(BaseModel):
    full_name: str
    phone: Optional[str]
    email: Optional[str]
    batch_id: Optional[int]

class StudentRead(BaseModel):
    id: int
    full_name: str
    phone: Optional[str]
    email: Optional[str]
    batch_id: Optional[int]
    student_id: Optional[str]
    date_of_birth: Optional[datetime]
    address: Optional[str]
    parent_name: Optional[str]
    parent_phone: Optional[str]
    admission_date: Optional[datetime]

# Permission Schemas
class PermissionCreate(BaseModel):
    name: str
    description: Optional[str] = None
    resource: str
    action: str

class PermissionRead(BaseModel):
    id: int
    name: str
    description: Optional[str]
    resource: str
    action: str
    created_at: Optional[datetime]

# Role Permission Schemas
class RolePermissionCreate(BaseModel):
    role: UserRole
    permission_id: int
    granted: bool = True

class UserPermissionCreate(BaseModel):
    user_id: int
    permission_id: int
    granted: bool = True

# Teacher Schemas
class TeacherCreate(BaseModel):
    user_id: int
    subjects: Optional[str] = None
    employee_id: Optional[str] = None
    joining_date: Optional[datetime] = None
    qualification: Optional[str] = None
    experience_years: Optional[int] = None

class TeacherRead(BaseModel):
    id: int
    user_id: int
    subjects: Optional[str]
    employee_id: Optional[str]
    joining_date: Optional[datetime]
    qualification: Optional[str]
    experience_years: Optional[int]

# Batch Schemas
class BatchCreate(BaseModel):
    name: str
    course: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    max_students: Optional[int] = 30
    fee_amount: Optional[float] = None

class BatchRead(BaseModel):
    id: int
    name: str
    course: Optional[str]
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    max_students: Optional[int]
    fee_amount: Optional[float]
    created_at: Optional[datetime]

# Class Assignment Schemas
class ClassAssignmentCreate(BaseModel):
    batch_id: int
    teacher_id: int
    subject: str
    scheduled_at: datetime
    duration_minutes: Optional[int] = 60
    classroom: Optional[str] = None
    is_recurring: bool = False
    recurring_days: Optional[str] = None

class ClassAssignmentRead(BaseModel):
    id: int
    batch_id: int
    teacher_id: int
    subject: str
    scheduled_at: datetime
    duration_minutes: Optional[int]
    classroom: Optional[str]
    is_recurring: bool
    recurring_days: Optional[str]

# Messaging Schemas
class ChatGroupCreate(BaseModel):
    name: str
    description: Optional[str] = None

class ChatGroupRead(BaseModel):
    id: int
    name: str
    description: Optional[str]
    created_by: int
    is_active: bool
    created_at: Optional[datetime]

class ChatGroupMemberAdd(BaseModel):
    user_ids: List[int]
    is_admin: bool = False

class MessageCreate(BaseModel):
    receiver_id: int
    content: str
    message_type: MessageType = MessageType.TEXT
    file_url: Optional[str] = None

class MessageRead(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    content: str
    message_type: MessageType
    file_url: Optional[str]
    is_read: bool
    sent_at: Optional[datetime]

class GroupMessageCreate(BaseModel):
    group_id: int
    content: str
    message_type: MessageType = MessageType.TEXT
    file_url: Optional[str] = None

class GroupMessageRead(BaseModel):
    id: int
    group_id: int
    sender_id: int
    content: str
    message_type: MessageType
    file_url: Optional[str]
    sent_at: Optional[datetime]

# Notification Schemas
class NotificationCreate(BaseModel):
    user_id: int
    title: str
    message: str
    notification_type: NotificationType
    data: Optional[Dict[str, Any]] = None

class NotificationRead(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    notification_type: NotificationType
    is_read: bool
    data: Optional[Dict[str, Any]]
    created_at: Optional[datetime]

# Task Management Schemas
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    assigned_to: int
    due_date: Optional[datetime] = None
    priority: str = "medium"

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: Optional[str] = None
    status: Optional[str] = None

class TaskRead(BaseModel):
    id: int
    title: str
    description: Optional[str]
    created_by: int
    assigned_to: int
    due_date: Optional[datetime]
    priority: str
    status: str
    created_at: Optional[datetime]
    completed_at: Optional[datetime]

# Academic Schemas
class ExamCreate(BaseModel):
    title: str
    subject: str
    batch_id: int
    exam_date: datetime
    max_marks: float
    duration_minutes: int

class ExamRead(BaseModel):
    id: int
    title: str
    subject: str
    batch_id: int
    exam_date: datetime
    max_marks: float
    duration_minutes: int
    created_at: Optional[datetime]

class ExamResultCreate(BaseModel):
    exam_id: int
    student_id: int
    marks_obtained: float
    grade: Optional[str] = None
    remarks: Optional[str] = None

class ExamResultRead(BaseModel):
    id: int
    exam_id: int
    student_id: int
    teacher_id: int
    marks_obtained: float
    grade: Optional[str]
    remarks: Optional[str]
    entered_at: Optional[datetime]

class AttendanceCreate(BaseModel):
    student_id: int
    class_date: datetime
    subject: str
    is_present: bool
    remarks: Optional[str] = None

class AttendanceRead(BaseModel):
    id: int
    student_id: int
    teacher_id: int
    class_date: datetime
    subject: str
    is_present: bool
    marked_at: Optional[datetime]
    remarks: Optional[str]

class BehaviorRecordCreate(BaseModel):
    student_id: int
    behavior_type: BehaviorType
    title: str
    description: str
    severity: Optional[str] = "medium"

class BehaviorRecordRead(BaseModel):
    id: int
    student_id: int
    teacher_id: int
    behavior_type: BehaviorType
    title: str
    description: str
    severity: Optional[str]
    date_recorded: Optional[datetime]

# Payment Schemas
class PaymentCreate(BaseModel):
    student_id: int
    amount: float
    payment_type: str = "fee"
    payment_method: str = "cash"
    due_date: Optional[datetime] = None
    remarks: Optional[str] = None

class PaymentRead(BaseModel):
    id: int
    student_id: int
    amount: float
    payment_type: str
    payment_method: str
    payment_date: Optional[datetime]
    due_date: Optional[datetime]
    status: str
    remarks: Optional[str]
    collected_by: Optional[int]

# Feedback Schemas
class FeedbackCreate(BaseModel):
    feedback_type: FeedbackType
    subject: str
    message: str
    is_anonymous: bool = False

class FeedbackRead(BaseModel):
    id: int
    student_id: int
    feedback_type: FeedbackType
    subject: str
    message: str
    is_anonymous: bool
    status: str
    priority: str
    submitted_at: Optional[datetime]
    resolved_at: Optional[datetime]
    resolved_by: Optional[int]
    admin_response: Optional[str]

class FeedbackResponse(BaseModel):
    admin_response: str
    status: str = "resolved"

# Report Card Schemas
class ReportCardCreate(BaseModel):
    student_id: int
    term: str
    academic_year: str
    overall_grade: Optional[str] = None
    overall_percentage: Optional[float] = None
    attendance_percentage: Optional[float] = None
    teacher_remarks: Optional[str] = None
    subject_grades: Optional[Dict[str, Any]] = None
    behavior_summary: Optional[Dict[str, Any]] = None

class ReportCardRead(BaseModel):
    id: int
    student_id: int
    term: str
    academic_year: str
    overall_grade: Optional[str]
    overall_percentage: Optional[float]
    attendance_percentage: Optional[float]
    teacher_remarks: Optional[str]
    generated_by: int
    generated_at: Optional[datetime]
    subject_grades: Optional[Dict[str, Any]]
    behavior_summary: Optional[Dict[str, Any]]

# Dashboard Schemas
class DashboardStats(BaseModel):
    total_students: int
    total_teachers: int
    total_batches: int
    pending_tasks: int
    unread_messages: int
    pending_feedback: int

class StudentDashboard(BaseModel):
    upcoming_classes: List[ClassAssignmentRead]
    recent_results: List[ExamResultRead]
    attendance_summary: Dict[str, Any]
    unread_messages: int
    notifications: List[NotificationRead]
