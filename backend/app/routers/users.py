from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from datetime import datetime
from typing import List
from ..database import get_session
from ..models import User, UserRole
from ..schemas import UserRead, UserUpdate, UserCreate
from ..core.deps import require_role, require_admin, get_current_user
from ..core.security import get_password_hash

router = APIRouter(prefix="/users", tags=["users"])

@router.get('/me', response_model=UserRead)
def me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get('/', response_model=List[UserRead])
def list_users(
    skip: int = 0,
    limit: int = 100,
    role: str = None,
    is_active: bool = None,
    session: Session = Depends(get_session), 
    _=Depends(require_admin)
):
    stmt = select(User)
    if role:
        stmt = stmt.where(User.role == role)
    if is_active is not None:
        stmt = stmt.where(User.is_active == is_active)
    stmt = stmt.offset(skip).limit(limit)
    users = session.exec(stmt).all()
    return users

@router.get('/{user_id}', response_model=UserRead)
def get_user(user_id: int, session: Session = Depends(get_session), _=Depends(require_admin)):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put('/{user_id}', response_model=UserRead)
def update_user(
    user_id: int,
    user_update: UserUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_admin)
):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check for username/email conflicts
    if user_update.username and user_update.username != user.username:
        existing = session.exec(select(User).where(User.username == user_update.username)).first()
        if existing:
            raise HTTPException(status_code=400, detail="Username already exists")
    
    if user_update.email and user_update.email != user.email:
        existing = session.exec(select(User).where(User.email == user_update.email)).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already exists")
    
    update_data = user_update.model_dump(exclude_unset=True)
    
    # Handle password update
    if 'password' in update_data:
        update_data['hashed_password'] = get_password_hash(update_data.pop('password'))
    
    # Update timestamp
    update_data['updated_at'] = datetime.utcnow()
    
    for field, value in update_data.items():
        setattr(user, field, value)
    
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

@router.delete('/{user_id}')
def delete_user(
    user_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_admin)
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    session.delete(user)
    session.commit()
    return {"message": "User deleted successfully"}

@router.post('/{user_id}/toggle-status', response_model=UserRead)
def toggle_user_status(
    user_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_admin)
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate your own account")
    
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_active = not user.is_active
    user.updated_at = datetime.utcnow()
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

@router.get('/roles/list')
def get_user_roles(_=Depends(require_admin)):
    return {
        "roles": [
            {"value": role.value, "label": role.value.replace('_', ' ').title()}
            for role in UserRole
        ]
    }
