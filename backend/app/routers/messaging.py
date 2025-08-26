from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlmodel import Session, select
from typing import List, Dict
from datetime import datetime
from ..database import get_session
from ..models import User, Message, GroupMessage, ChatGroup, ChatGroupMember
from ..schemas import MessageCreate, MessageRead, GroupMessageCreate, GroupMessageRead, ChatGroupCreate, ChatGroupRead, ChatGroupMemberAdd
from ..core.deps import get_current_user

router = APIRouter(prefix="/messaging", tags=["messaging"])

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: int):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    async def send_personal_message(self, message: str, user_id: int):
        if user_id in self.active_connections:
            websocket = self.active_connections[user_id]
            await websocket.send_text(message)

    async def send_group_message(self, message: str, user_ids: List[int]):
        for user_id in user_ids:
            if user_id in self.active_connections:
                websocket = self.active_connections[user_id]
                await websocket.send_text(message)

manager = ConnectionManager()

# WebSocket endpoint for real-time messaging
@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming messages here if needed
    except WebSocketDisconnect:
        manager.disconnect(user_id)

# Direct Messages (1-to-1)
@router.post("/messages/", response_model=MessageRead)
def send_message(
    message: MessageCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    # Check if receiver exists
    receiver = session.get(User, message.receiver_id)
    if not receiver:
        raise HTTPException(status_code=404, detail="Receiver not found")
    
    # Create message
    db_message = Message(
        sender_id=current_user.id,
        receiver_id=message.receiver_id,
        content=message.content,
        message_type=message.message_type,
        file_url=message.file_url
    )
    session.add(db_message)
    session.commit()
    session.refresh(db_message)
    
    # Send real-time notification to receiver
    # In a real implementation, you might want to send a formatted message
    import json
    notification = {
        "type": "new_message",
        "message_id": db_message.id,
        "sender_id": current_user.id,
        "sender_name": current_user.full_name or current_user.username,
        "content": db_message.content,
        "sent_at": db_message.sent_at.isoformat() if db_message.sent_at else None
    }
    
    # This would be called asynchronously in a real app
    # await manager.send_personal_message(json.dumps(notification), message.receiver_id)
    
    return db_message

@router.get("/messages/conversations", response_model=List[dict])
def get_conversations(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    # Get all users who have conversations with current user
    sent_messages = session.exec(
        select(Message.receiver_id)
        .where(Message.sender_id == current_user.id)
        .distinct()
    ).all()
    
    received_messages = session.exec(
        select(Message.sender_id)
        .where(Message.receiver_id == current_user.id)
        .distinct()
    ).all()
    
    # Combine and get unique user IDs
    conversation_user_ids = set(sent_messages + received_messages)
    
    conversations = []
    for user_id in conversation_user_ids:
        user = session.get(User, user_id)
        if user:
            # Get last message
            last_message = session.exec(
                select(Message)
                .where(
                    ((Message.sender_id == current_user.id) & (Message.receiver_id == user_id)) |
                    ((Message.sender_id == user_id) & (Message.receiver_id == current_user.id))
                )
                .order_by(Message.sent_at.desc())
            ).first()
            
            # Count unread messages
            unread_count = session.exec(
                select(Message)
                .where(
                    Message.sender_id == user_id,
                    Message.receiver_id == current_user.id,
                    Message.is_read == False
                )
            ).all()
            
            conversations.append({
                "user_id": user.id,
                "username": user.username,
                "full_name": user.full_name,
                "profile_image": user.profile_image,
                "last_message": {
                    "content": last_message.content if last_message else None,
                    "sent_at": last_message.sent_at if last_message else None,
                    "is_from_me": last_message.sender_id == current_user.id if last_message else False
                },
                "unread_count": len(unread_count)
            })
    
    # Sort by last message time
    conversations.sort(key=lambda x: x["last_message"]["sent_at"] or datetime.min, reverse=True)
    return conversations

@router.get("/messages/{user_id}", response_model=List[MessageRead])
def get_messages_with_user(
    user_id: int,
    limit: int = 50,
    offset: int = 0,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    messages = session.exec(
        select(Message)
        .where(
            ((Message.sender_id == current_user.id) & (Message.receiver_id == user_id)) |
            ((Message.sender_id == user_id) & (Message.receiver_id == current_user.id))
        )
        .order_by(Message.sent_at.desc())
        .offset(offset)
        .limit(limit)
    ).all()
    
    # Mark messages as read
    session.exec(
        select(Message)
        .where(
            Message.sender_id == user_id,
            Message.receiver_id == current_user.id,
            Message.is_read == False
        )
    )
    for msg in session.exec(
        select(Message)
        .where(
            Message.sender_id == user_id,
            Message.receiver_id == current_user.id,
            Message.is_read == False
        )
    ).all():
        msg.is_read = True
    session.commit()
    
    return list(reversed(messages))  # Return in chronological order

# Group Chat functionality
@router.post("/groups/", response_model=ChatGroupRead)
def create_group(
    group: ChatGroupCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    db_group = ChatGroup(
        name=group.name,
        description=group.description,
        created_by=current_user.id
    )
    session.add(db_group)
    session.commit()
    session.refresh(db_group)
    
    # Add creator as admin member
    creator_membership = ChatGroupMember(
        group_id=db_group.id,
        user_id=current_user.id,
        is_admin=True
    )
    session.add(creator_membership)
    session.commit()
    
    return db_group

@router.get("/groups/", response_model=List[ChatGroupRead])
def get_my_groups(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    groups = session.exec(
        select(ChatGroup)
        .join(ChatGroupMember, ChatGroup.id == ChatGroupMember.group_id)
        .where(ChatGroupMember.user_id == current_user.id, ChatGroup.is_active == True)
    ).all()
    return groups

@router.post("/groups/{group_id}/members", response_model=dict)
def add_group_members(
    group_id: int,
    member_data: ChatGroupMemberAdd,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    # Check if group exists and user is admin
    group = session.get(ChatGroup, group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    # Check if current user is admin of the group
    admin_membership = session.exec(
        select(ChatGroupMember)
        .where(
            ChatGroupMember.group_id == group_id,
            ChatGroupMember.user_id == current_user.id,
            ChatGroupMember.is_admin == True
        )
    ).first()
    
    if not admin_membership:
        raise HTTPException(status_code=403, detail="Only group admins can add members")
    
    added_users = []
    for user_id in member_data.user_ids:
        # Check if user exists
        user = session.get(User, user_id)
        if not user:
            continue
        
        # Check if already a member
        existing_membership = session.exec(
            select(ChatGroupMember)
            .where(
                ChatGroupMember.group_id == group_id,
                ChatGroupMember.user_id == user_id
            )
        ).first()
        
        if not existing_membership:
            membership = ChatGroupMember(
                group_id=group_id,
                user_id=user_id,
                is_admin=member_data.is_admin
            )
            session.add(membership)
            added_users.append(user.username)
    
    session.commit()
    return {"message": f"Added {len(added_users)} members", "added_users": added_users}

@router.post("/groups/{group_id}/messages", response_model=GroupMessageRead)
def send_group_message(
    group_id: int,
    message: GroupMessageCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    # Check if user is member of the group
    membership = session.exec(
        select(ChatGroupMember)
        .where(
            ChatGroupMember.group_id == group_id,
            ChatGroupMember.user_id == current_user.id
        )
    ).first()
    
    if not membership:
        raise HTTPException(status_code=403, detail="You are not a member of this group")
    
    # Create group message
    db_message = GroupMessage(
        group_id=group_id,
        sender_id=current_user.id,
        content=message.content,
        message_type=message.message_type,
        file_url=message.file_url
    )
    session.add(db_message)
    session.commit()
    session.refresh(db_message)
    
    # Get all group members for real-time notification
    group_members = session.exec(
        select(ChatGroupMember.user_id)
        .where(ChatGroupMember.group_id == group_id)
    ).all()
    
    # Send real-time notification to all group members
    # In a real implementation, you might want to send a formatted message
    import json
    notification = {
        "type": "new_group_message",
        "group_id": group_id,
        "message_id": db_message.id,
        "sender_id": current_user.id,
        "sender_name": current_user.full_name or current_user.username,
        "content": db_message.content,
        "sent_at": db_message.sent_at.isoformat() if db_message.sent_at else None
    }
    
    # This would be called asynchronously in a real app
    # await manager.send_group_message(json.dumps(notification), group_members)
    
    return db_message

@router.get("/groups/{group_id}/messages", response_model=List[GroupMessageRead])
def get_group_messages(
    group_id: int,
    limit: int = 50,
    offset: int = 0,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    # Check if user is member of the group
    membership = session.exec(
        select(ChatGroupMember)
        .where(
            ChatGroupMember.group_id == group_id,
            ChatGroupMember.user_id == current_user.id
        )
    ).first()
    
    if not membership:
        raise HTTPException(status_code=403, detail="You are not a member of this group")
    
    messages = session.exec(
        select(GroupMessage)
        .where(GroupMessage.group_id == group_id)
        .order_by(GroupMessage.sent_at.desc())
        .offset(offset)
        .limit(limit)
    ).all()
    
    return list(reversed(messages))  # Return in chronological order

@router.get("/groups/{group_id}/members", response_model=List[dict])
def get_group_members(
    group_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    # Check if user is member of the group
    membership = session.exec(
        select(ChatGroupMember)
        .where(
            ChatGroupMember.group_id == group_id,
            ChatGroupMember.user_id == current_user.id
        )
    ).first()
    
    if not membership:
        raise HTTPException(status_code=403, detail="You are not a member of this group")
    
    members = session.exec(
        select(User, ChatGroupMember)
        .join(ChatGroupMember, User.id == ChatGroupMember.user_id)
        .where(ChatGroupMember.group_id == group_id)
    ).all()
    
    return [
        {
            "user_id": user.id,
            "username": user.username,
            "full_name": user.full_name,
            "profile_image": user.profile_image,
            "is_admin": member.is_admin,
            "joined_at": member.joined_at
        }
        for user, member in members
    ]
