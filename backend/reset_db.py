#!/usr/bin/env python3

from sqlmodel import SQLModel, Session
from app.database import engine
from app.models import *  # Import all models to ensure they're registered
from app.core.security import get_password_hash
from datetime import datetime

def reset_database():
    # Drop all tables
    SQLModel.metadata.drop_all(engine)
    print("All tables dropped.")
    
    # Create all tables with new schema
    SQLModel.metadata.create_all(engine)
    print("All tables created with updated schema.")
    
    # Create initial admin user
    with Session(engine) as session:
        admin_user = User(
            email="admin@edudemy.com",
            username="admin",
            full_name="System Administrator",
            role="admin",
            designation="System Administrator",
            is_active=True,
            hashed_password=get_password_hash("admin123"),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        session.add(admin_user)
        session.commit()
        print(f"Initial admin user created: username='admin', password='admin123'")
        
        # Also create a sample teacher for testing
        teacher_user = User(
            email="teacher@edudemy.com",
            username="teacher",
            full_name="Sample Teacher",
            role="teacher",
            designation="Senior Teacher",
            department="Mathematics",
            is_active=True,
            hashed_password=get_password_hash("teacher123"),
            created_by=admin_user.id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        session.add(teacher_user)
        session.commit()
        print(f"Sample teacher user created: username='teacher', password='teacher123'")

if __name__ == "__main__":
    reset_database()
