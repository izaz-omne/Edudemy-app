from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
from ..database import get_session
from ..models import User, Permission, RolePermission, UserPermission, UserRole
from ..schemas import PermissionCreate, PermissionRead, RolePermissionCreate, UserPermissionCreate
from ..core.deps import get_current_user, require_role

router = APIRouter(prefix="/permissions", tags=["permissions"])

@router.post("/", response_model=PermissionRead)
def create_permission(
    permission: PermissionCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role("superadmin", "admin"))
):
    # Check if permission already exists
    existing = session.exec(
        select(Permission).where(Permission.name == permission.name)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Permission already exists")
    
    db_permission = Permission(**permission.model_dump())
    session.add(db_permission)
    session.commit()
    session.refresh(db_permission)
    return db_permission

@router.get("/", response_model=List[PermissionRead])
def list_permissions(
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role("superadmin", "admin"))
):
    permissions = session.exec(select(Permission)).all()
    return permissions

@router.post("/role-permissions/", response_model=dict)
def assign_role_permission(
    role_permission: RolePermissionCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role("superadmin", "admin"))
):
    # Check if permission exists
    permission = session.get(Permission, role_permission.permission_id)
    if not permission:
        raise HTTPException(status_code=404, detail="Permission not found")
    
    # Check if role permission already exists
    existing = session.exec(
        select(RolePermission).where(
            RolePermission.role == role_permission.role,
            RolePermission.permission_id == role_permission.permission_id
        )
    ).first()
    
    if existing:
        existing.granted = role_permission.granted
    else:
        db_role_permission = RolePermission(**role_permission.model_dump())
        session.add(db_role_permission)
    
    session.commit()
    return {"message": "Role permission updated successfully"}

@router.post("/user-permissions/", response_model=dict)
def assign_user_permission(
    user_permission: UserPermissionCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role("superadmin", "admin"))
):
    # Check if user and permission exist
    user = session.get(User, user_permission.user_id)
    permission = session.get(Permission, user_permission.permission_id)
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not permission:
        raise HTTPException(status_code=404, detail="Permission not found")
    
    # Check if user permission already exists
    existing = session.exec(
        select(UserPermission).where(
            UserPermission.user_id == user_permission.user_id,
            UserPermission.permission_id == user_permission.permission_id
        )
    ).first()
    
    if existing:
        existing.granted = user_permission.granted
        existing.granted_by = current_user.id
    else:
        db_user_permission = UserPermission(
            **user_permission.model_dump(),
            granted_by=current_user.id
        )
        session.add(db_user_permission)
    
    session.commit()
    return {"message": "User permission updated successfully"}

@router.get("/role/{role}/permissions", response_model=List[PermissionRead])
def get_role_permissions(
    role: UserRole,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role("superadmin", "admin"))
):
    role_permissions = session.exec(
        select(Permission)
        .join(RolePermission, Permission.id == RolePermission.permission_id)
        .where(RolePermission.role == role, RolePermission.granted == True)
    ).all()
    return role_permissions

@router.get("/user/{user_id}/permissions", response_model=List[PermissionRead])
def get_user_permissions(
    user_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role("superadmin", "admin"))
):
    # Get role-based permissions
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    role_permissions = session.exec(
        select(Permission)
        .join(RolePermission, Permission.id == RolePermission.permission_id)
        .where(RolePermission.role == user.role, RolePermission.granted == True)
    ).all()
    
    # Get user-specific permissions
    user_permissions = session.exec(
        select(Permission)
        .join(UserPermission, Permission.id == UserPermission.permission_id)
        .where(UserPermission.user_id == user_id, UserPermission.granted == True)
    ).all()
    
    # Combine and deduplicate
    all_permissions = {p.id: p for p in role_permissions}
    for p in user_permissions:
        all_permissions[p.id] = p
    
    return list(all_permissions.values())

# Helper function to check if user has specific permission
def has_permission(user: User, resource: str, action: str, session: Session) -> bool:
    # Check role-based permissions
    role_permission = session.exec(
        select(RolePermission)
        .join(Permission, RolePermission.permission_id == Permission.id)
        .where(
            RolePermission.role == user.role,
            Permission.resource == resource,
            Permission.action == action,
            RolePermission.granted == True
        )
    ).first()
    
    if role_permission:
        return True
    
    # Check user-specific permissions
    user_permission = session.exec(
        select(UserPermission)
        .join(Permission, UserPermission.permission_id == Permission.id)
        .where(
            UserPermission.user_id == user.id,
            Permission.resource == resource,
            Permission.action == action,
            UserPermission.granted == True
        )
    ).first()
    
    return user_permission is not None

@router.get("/my-permissions", response_model=List[PermissionRead])
def get_my_permissions(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    # Get role-based permissions
    role_permissions = session.exec(
        select(Permission)
        .join(RolePermission, Permission.id == RolePermission.permission_id)
        .where(RolePermission.role == current_user.role, RolePermission.granted == True)
    ).all()
    
    # Get user-specific permissions
    user_permissions = session.exec(
        select(Permission)
        .join(UserPermission, Permission.id == UserPermission.permission_id)
        .where(UserPermission.user_id == current_user.id, UserPermission.granted == True)
    ).all()
    
    # Combine and deduplicate
    all_permissions = {p.id: p for p in role_permissions}
    for p in user_permissions:
        all_permissions[p.id] = p
    
    return list(all_permissions.values())
