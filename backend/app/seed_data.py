#!/usr/bin/env python3

"""
Database seed script for Edudemy Application
Creates initial permissions, role permissions, and super admin user
"""

from sqlmodel import Session, select
from datetime import datetime
from .database import engine, init_db
from .models import (
    User, Permission, RolePermission, UserRole,
    Batch, Student, Teacher
)
from .core.security import get_password_hash

def create_permissions(session: Session):
    """Create all necessary permissions for the system"""
    permissions = [
        # User Management
        {"name": "create_users", "description": "Create new users", "resource": "users", "action": "create"},
        {"name": "read_users", "description": "View users", "resource": "users", "action": "read"},
        {"name": "update_users", "description": "Update users", "resource": "users", "action": "update"},
        {"name": "delete_users", "description": "Delete users", "resource": "users", "action": "delete"},
        
        # Student Management
        {"name": "create_students", "description": "Create students", "resource": "students", "action": "create"},
        {"name": "read_students", "description": "View students", "resource": "students", "action": "read"},
        {"name": "update_students", "description": "Update students", "resource": "students", "action": "update"},
        {"name": "delete_students", "description": "Delete students", "resource": "students", "action": "delete"},
        
        # Teacher Management
        {"name": "create_teachers", "description": "Create teachers", "resource": "teachers", "action": "create"},
        {"name": "read_teachers", "description": "View teachers", "resource": "teachers", "action": "read"},
        {"name": "update_teachers", "description": "Update teachers", "resource": "teachers", "action": "update"},
        {"name": "delete_teachers", "description": "Delete teachers", "resource": "teachers", "action": "delete"},
        
        # Batch Management
        {"name": "create_batches", "description": "Create batches", "resource": "batches", "action": "create"},
        {"name": "read_batches", "description": "View batches", "resource": "batches", "action": "read"},
        {"name": "update_batches", "description": "Update batches", "resource": "batches", "action": "update"},
        {"name": "delete_batches", "description": "Delete batches", "resource": "batches", "action": "delete"},
        
        # Class Management
        {"name": "create_classes", "description": "Create class assignments", "resource": "classes", "action": "create"},
        {"name": "read_classes", "description": "View class assignments", "resource": "classes", "action": "read"},
        {"name": "update_classes", "description": "Update class assignments", "resource": "classes", "action": "update"},
        {"name": "delete_classes", "description": "Delete class assignments", "resource": "classes", "action": "delete"},
        
        # Exam Management
        {"name": "create_exams", "description": "Create exams", "resource": "exams", "action": "create"},
        {"name": "read_exams", "description": "View exams", "resource": "exams", "action": "read"},
        {"name": "update_exams", "description": "Update exams", "resource": "exams", "action": "update"},
        {"name": "delete_exams", "description": "Delete exams", "resource": "exams", "action": "delete"},
        {"name": "grade_exams", "description": "Grade exam results", "resource": "exam_results", "action": "create"},
        
        # Attendance Management
        {"name": "mark_attendance", "description": "Mark attendance", "resource": "attendance", "action": "create"},
        {"name": "read_attendance", "description": "View attendance", "resource": "attendance", "action": "read"},
        {"name": "update_attendance", "description": "Update attendance", "resource": "attendance", "action": "update"},
        
        # Behavior Records
        {"name": "create_behavior_records", "description": "Create behavior records", "resource": "behavior", "action": "create"},
        {"name": "read_behavior_records", "description": "View behavior records", "resource": "behavior", "action": "read"},
        {"name": "update_behavior_records", "description": "Update behavior records", "resource": "behavior", "action": "update"},
        
        # Report Cards
        {"name": "generate_reports", "description": "Generate report cards", "resource": "reports", "action": "create"},
        {"name": "read_reports", "description": "View report cards", "resource": "reports", "action": "read"},
        {"name": "update_reports", "description": "Update report cards", "resource": "reports", "action": "update"},
        
        # Task Management
        {"name": "create_tasks", "description": "Create tasks", "resource": "tasks", "action": "create"},
        {"name": "read_tasks", "description": "View tasks", "resource": "tasks", "action": "read"},
        {"name": "update_tasks", "description": "Update tasks", "resource": "tasks", "action": "update"},
        {"name": "delete_tasks", "description": "Delete tasks", "resource": "tasks", "action": "delete"},
        
        # Payment Management
        {"name": "create_payments", "description": "Record payments", "resource": "payments", "action": "create"},
        {"name": "read_payments", "description": "View payments", "resource": "payments", "action": "read"},
        {"name": "update_payments", "description": "Update payments", "resource": "payments", "action": "update"},
        
        # Messaging
        {"name": "send_messages", "description": "Send messages", "resource": "messages", "action": "create"},
        {"name": "read_messages", "description": "Read messages", "resource": "messages", "action": "read"},
        {"name": "create_groups", "description": "Create message groups", "resource": "groups", "action": "create"},
        {"name": "manage_groups", "description": "Manage message groups", "resource": "groups", "action": "update"},
        
        # Feedback
        {"name": "submit_feedback", "description": "Submit feedback", "resource": "feedback", "action": "create"},
        {"name": "read_feedback", "description": "View feedback", "resource": "feedback", "action": "read"},
        {"name": "respond_feedback", "description": "Respond to feedback", "resource": "feedback", "action": "update"},
        
        # Notifications
        {"name": "send_notifications", "description": "Send notifications", "resource": "notifications", "action": "create"},
        {"name": "read_notifications", "description": "Read notifications", "resource": "notifications", "action": "read"},
        
        # Analytics & Reports
        {"name": "view_analytics", "description": "View system analytics", "resource": "analytics", "action": "read"},
        {"name": "export_data", "description": "Export system data", "resource": "export", "action": "create"},
        
        # System Administration
        {"name": "manage_permissions", "description": "Manage user permissions", "resource": "permissions", "action": "update"},
        {"name": "system_maintenance", "description": "Perform system maintenance", "resource": "system", "action": "update"},
        {"name": "view_logs", "description": "View system logs", "resource": "logs", "action": "read"},
    ]
    
    created_permissions = []
    for perm_data in permissions:
        # Check if permission already exists
        existing = session.exec(
            select(Permission).where(Permission.name == perm_data["name"])
        ).first()
        
        if not existing:
            permission = Permission(**perm_data)
            session.add(permission)
            created_permissions.append(permission)
    
    session.commit()
    
    # Refresh permissions to get IDs
    for permission in created_permissions:
        session.refresh(permission)
    
    return created_permissions

def create_role_permissions(session: Session):
    """Assign permissions to roles based on role hierarchy"""
    
    # Get all permissions
    all_permissions = session.exec(select(Permission)).all()
    permission_map = {p.name: p.id for p in all_permissions}
    
    # Define role-based permissions
    role_permissions = {
        UserRole.SUPERADMIN: list(permission_map.keys()),  # All permissions
        
        UserRole.ADMIN: [
            # User Management (except superadmin operations)
            "create_users", "read_users", "update_users",
            "create_students", "read_students", "update_students", "delete_students",
            "create_teachers", "read_teachers", "update_teachers", "delete_teachers",
            
            # Academic Management
            "create_batches", "read_batches", "update_batches", "delete_batches",
            "create_classes", "read_classes", "update_classes", "delete_classes",
            "create_exams", "read_exams", "update_exams", "delete_exams", "grade_exams",
            "mark_attendance", "read_attendance", "update_attendance",
            "create_behavior_records", "read_behavior_records", "update_behavior_records",
            "generate_reports", "read_reports", "update_reports",
            
            # Task & Payment Management
            "create_tasks", "read_tasks", "update_tasks", "delete_tasks",
            "create_payments", "read_payments", "update_payments",
            
            # Communication
            "send_messages", "read_messages", "create_groups", "manage_groups",
            "read_feedback", "respond_feedback",
            "send_notifications", "read_notifications",
            
            # Analytics
            "view_analytics", "export_data",
        ],
        
        UserRole.MANAGEMENT: [
            # Limited user viewing
            "read_users", "read_students", "read_teachers",
            
            # Academic viewing and reporting
            "read_batches", "read_classes", "read_exams",
            "read_attendance", "read_behavior_records", "read_reports",
            
            # Task management
            "create_tasks", "read_tasks", "update_tasks",
            
            # Communication
            "send_messages", "read_messages", "create_groups", "manage_groups",
            "read_feedback", "respond_feedback",
            "send_notifications", "read_notifications",
            
            # Basic analytics
            "view_analytics",
        ],
        
        UserRole.ACADEMICS: [
            # Academic full management
            "create_batches", "read_batches", "update_batches",
            "create_classes", "read_classes", "update_classes",
            "create_exams", "read_exams", "update_exams", "grade_exams",
            "mark_attendance", "read_attendance", "update_attendance",
            "create_behavior_records", "read_behavior_records", "update_behavior_records",
            "generate_reports", "read_reports", "update_reports",
            
            # Student/Teacher viewing
            "read_students", "read_teachers",
            
            # Communication
            "send_messages", "read_messages", "create_groups", "manage_groups",
            "read_notifications",
            
            # Academic analytics
            "view_analytics",
        ],
        
        UserRole.TEACHER: [
            # Limited academic management
            "read_classes", "create_exams", "read_exams", "update_exams", "grade_exams",
            "mark_attendance", "read_attendance",
            "create_behavior_records", "read_behavior_records",
            "read_reports",
            
            # Student viewing (only their students)
            "read_students",
            
            # Communication
            "send_messages", "read_messages",
            "read_notifications",
            
            # Task updates
            "read_tasks", "update_tasks",
        ],
        
        UserRole.STUDENT: [
            # Very limited permissions
            "read_classes",  # View their class schedule
            "read_exams",    # View their exams
            "read_attendance", "read_behavior_records", "read_reports",  # View their own records
            "read_payments",  # View their payment history
            
            # Communication
            "send_messages", "read_messages",
            "submit_feedback",
            "read_notifications",
        ],
    }
    
    # Create role permissions
    created_role_permissions = []
    for role, permission_names in role_permissions.items():
        for perm_name in permission_names:
            if perm_name in permission_map:
                # Check if role permission already exists
                existing = session.exec(
                    select(RolePermission).where(
                        RolePermission.role == role,
                        RolePermission.permission_id == permission_map[perm_name]
                    )
                ).first()
                
                if not existing:
                    role_perm = RolePermission(
                        role=role,
                        permission_id=permission_map[perm_name],
                        granted=True
                    )
                    session.add(role_perm)
                    created_role_permissions.append(role_perm)
    
    session.commit()
    return created_role_permissions

def create_superadmin(session: Session):
    """Create the initial superadmin user"""
    
    # Check if superadmin already exists
    existing_superadmin = session.exec(
        select(User).where(User.role == UserRole.SUPERADMIN)
    ).first()
    
    if existing_superadmin:
        print("Super admin already exists!")
        return existing_superadmin
    
    superadmin = User(
        email="superadmin@edudemy.com",
        username="superadmin",
        full_name="Super Administrator",
        role=UserRole.SUPERADMIN,
        designation="Super Administrator",
        is_active=True,
        hashed_password=get_password_hash("superadmin123"),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    session.add(superadmin)
    session.commit()
    session.refresh(superadmin)
    
    print(f"Created superadmin user: {superadmin.username}")
    return superadmin

def create_sample_data(session: Session, superadmin: User):
    """Create some sample data for testing"""
    
    # Create a sample batch
    existing_batch = session.exec(select(Batch).where(Batch.name == "Sample Batch 2024")).first()
    if not existing_batch:
        batch = Batch(
            name="Sample Batch 2024",
            course="Computer Science",
            start_date=datetime(2024, 1, 15),
            end_date=datetime(2024, 12, 15),
            max_students=30,
            fee_amount=50000.0,
            created_by=superadmin.id
        )
        session.add(batch)
        session.commit()
        session.refresh(batch)
        print(f"Created sample batch: {batch.name}")
    
    # Create sample admin user
    existing_admin = session.exec(
        select(User).where(User.username == "admin")
    ).first()
    
    if not existing_admin:
        admin_user = User(
            email="admin@edudemy.com",
            username="admin",
            full_name="System Administrator",
            role=UserRole.ADMIN,
            designation="Administrator",
            is_active=True,
            hashed_password=get_password_hash("admin123"),
            created_by=superadmin.id
        )
        session.add(admin_user)
        session.commit()
        session.refresh(admin_user)
        print(f"Created admin user: {admin_user.username}")
    
    # Create sample management user
    existing_mgmt = session.exec(
        select(User).where(User.username == "manager")
    ).first()
    
    if not existing_mgmt:
        mgmt_user = User(
            email="manager@edudemy.com",
            username="manager",
            full_name="Academic Manager",
            role=UserRole.MANAGEMENT,
            designation="Academic Manager",
            is_active=True,
            hashed_password=get_password_hash("manager123"),
            created_by=superadmin.id
        )
        session.add(mgmt_user)
        session.commit()
        session.refresh(mgmt_user)
        print(f"Created management user: {mgmt_user.username}")

def seed_database():
    """Main function to seed the database"""
    print("🌱 Starting database seeding...")
    
    # Initialize database
    init_db()
    
    with Session(engine) as session:
        print("1. Creating permissions...")
        permissions = create_permissions(session)
        print(f"   Created {len(permissions)} permissions")
        
        print("2. Setting up role-based permissions...")
        role_permissions = create_role_permissions(session)
        print(f"   Created {len(role_permissions)} role permissions")
        
        print("3. Creating superadmin user...")
        superadmin = create_superadmin(session)
        
        print("4. Creating sample data...")
        create_sample_data(session, superadmin)
        
        print("✅ Database seeding completed!")
        print("\n📋 Default Credentials:")
        print("   Super Admin - username: superadmin, password: superadmin123")
        print("   Admin - username: admin, password: admin123")
        print("   Manager - username: manager, password: manager123")
        print("\n🔗 API Documentation: http://localhost:8000/docs")

if __name__ == "__main__":
    seed_database()
