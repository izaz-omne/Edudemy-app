from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from datetime import timedelta, datetime
from ..database import get_session
from ..models import User
from ..schemas import Token, UserCreate, UserRead, LoginRequest, UserUpdate
from ..core.security import verify_password, get_password_hash, create_access_token
from ..core.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"]) 

@router.post('/register', response_model=UserRead)
def register(payload: UserCreate, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    # Only admin can create new users
    if current_user.role not in ["admin", "superadmin"]:
        raise HTTPException(status_code=403, detail="Only admin or superadmin can create new users")
    
    # Check if username or email already exists
    existing_user = session.exec(select(User).where((User.username == payload.username) | (User.email == payload.email))).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username or email already exists")
    
    user = User(
        email=payload.email,
        username=payload.username,
        full_name=payload.full_name,
        role=payload.role,
        designation=payload.designation,
        phone=payload.phone,
        department=payload.department,
        is_active=payload.is_active,
        hashed_password=get_password_hash(payload.password),
        created_by=current_user.id,
        updated_at=datetime.utcnow()
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

@router.post('/login', response_model=Token)
def login(login_data: LoginRequest, session: Session = Depends(get_session)):
    stmt = select(User).where((User.username == login_data.username) | (User.email == login_data.username))
    user = session.exec(stmt).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="User account is deactivated")
    
    access_token_expires = timedelta(minutes=60)
    token = create_access_token(user.username, expires_delta=access_token_expires)
    # Convert user to dict manually to avoid model validation issues
    user_data = {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "full_name": user.full_name,
        "role": user.role,
        "designation": user.designation,
        "is_active": user.is_active,
        "phone": user.phone,
        "department": user.department,
        "created_at": user.created_at,
        "updated_at": user.updated_at
    }
    
    return {
        "access_token": token, 
        "token_type": "bearer",
        "user": user_data
    }

# Endpoint for initial super admin creation (should be secured in production)
@router.post('/create-superadmin', response_model=UserRead)
def create_initial_superadmin(session: Session = Depends(get_session)):
    # Check if any superadmin already exists
    from ..models import UserRole
    existing_superadmin = session.exec(select(User).where(User.role == UserRole.SUPERADMIN)).first()
    if existing_superadmin:
        raise HTTPException(status_code=400, detail="Super admin user already exists")
    
    superadmin_user = User(
        email="superadmin@edudemy.com",
        username="superadmin",
        full_name="Super Administrator",
        role=UserRole.SUPERADMIN,
        designation="Super Administrator",
        is_active=True,
        hashed_password=get_password_hash("superadmin123"),
        updated_at=datetime.utcnow()
    )
    session.add(superadmin_user)
    session.commit()
    session.refresh(superadmin_user)
    return superadmin_user

@router.get('/me', response_model=UserRead)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

@router.put('/me', response_model=UserRead)
def update_current_user(payload: UserUpdate, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    # Users can update their own basic info
    update_data = payload.model_dump(exclude_unset=True)
    
    # Remove role and is_active from update if not admin/superadmin
    if current_user.role not in ["admin", "superadmin"]:
        update_data.pop("role", None)
        update_data.pop("is_active", None)
    
    # Handle password update
    if "password" in update_data:
        update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
    
    update_data["updated_at"] = datetime.utcnow()
    
    for key, value in update_data.items():
        setattr(current_user, key, value)
    
    session.commit()
    session.refresh(current_user)
    return current_user
