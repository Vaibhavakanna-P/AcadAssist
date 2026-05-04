# backend/app/api/routes/live_chat.py
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict
from app.core.database import get_db, SessionLocal
from app.core.security import get_current_user_ws
from app.models.user import User
from app.models.chat_message import ChatMessage, DiscussionRoom
from pydantic import BaseModel
from datetime import datetime
import json

router = APIRouter()

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {}
        self.user_rooms: Dict[int, List[int]] = {}
    
    async def connect(self, websocket: WebSocket, room_id: int, user_id: int):
        await websocket.accept()
        
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
        self.active_connections[room_id].append(websocket)
        
        if user_id not in self.user_rooms:
            self.user_rooms[user_id] = []
        if room_id not in self.user_rooms[user_id]:
            self.user_rooms[user_id].append(room_id)
    
    def disconnect(self, websocket: WebSocket, room_id: int, user_id: int):
        if room_id in self.active_connections:
            self.active_connections[room_id].remove(websocket)
        if user_id in self.user_rooms:
            if room_id in self.user_rooms[user_id]:
                self.user_rooms[user_id].remove(room_id)
    
    async def broadcast_to_room(self, message: str, room_id: int, sender_ws: WebSocket = None):
        if room_id in self.active_connections:
            for connection in self.active_connections[room_id]:
                if connection != sender_ws:
                    await connection.send_text(message)
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

manager = ConnectionManager()

class RoomCreate(BaseModel):
    name: str
    subject: str = None
    department: str = None
    semester: int = None

# WebSocket endpoint for live chat
@router.websocket("/ws/{room_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    room_id: int
):
    # Create new DB session for this connection
    db = SessionLocal()
    
    try:
        # Authenticate user
        user = await get_current_user_ws(websocket, db)
        if not user:
            return
        
        await manager.connect(websocket, room_id, user.id)
        
        # Notify others that user joined
        join_message = json.dumps({
            "type": "system",
            "message": f"{user.full_name} joined the room",
            "user_id": user.id,
            "timestamp": datetime.utcnow().isoformat()
        })
        await manager.broadcast_to_room(join_message, room_id, websocket)
        
        # Save system message to database
        db_message = ChatMessage(
            content=f"{user.full_name} joined the room",
            message_type="system",
            sender_id=user.id,
            room_id=room_id
        )
        db.add(db_message)
        db.commit()
        
        while True:
            # Receive message
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Save message to database
            db_message = ChatMessage(
                content=message_data.get("content", ""),
                message_type=message_data.get("type", "text"),
                sender_id=user.id,
                room_id=room_id
            )
            db.add(db_message)
            db.commit()
            
            # Broadcast message to room
            broadcast_data = json.dumps({
                "type": "chat",
                "message": message_data.get("content", ""),
                "user_id": user.id,
                "username": user.full_name,
                "timestamp": datetime.utcnow().isoformat()
            })
            await manager.broadcast_to_room(broadcast_data, room_id, websocket)
            
    except WebSocketDisconnect:
        if user:
            manager.disconnect(websocket, room_id, user.id)
            
            # Notify others that user left
            leave_message = json.dumps({
                "type": "system",
                "message": f"{user.full_name} left the room",
                "user_id": user.id,
                "timestamp": datetime.utcnow().isoformat()
            })
            await manager.broadcast_to_room(leave_message, room_id)
            
            # Save leave message
            db_message = ChatMessage(
                content=f"{user.full_name} left the room",
                message_type="system",
                sender_id=user.id,
                room_id=room_id
            )
            db.add(db_message)
            db.commit()
    finally:
        db.close()

# REST endpoints for rooms
@router.post("/rooms")
async def create_room(
    room: RoomCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new discussion room"""
    new_room = DiscussionRoom(
        **room.dict(),
        created_by=current_user.id
    )
    
    db.add(new_room)
    db.commit()
    db.refresh(new_room)
    
    return new_room

@router.get("/rooms")
async def get_rooms(
    department: str = None,
    semester: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all discussion rooms"""
    query = db.query(DiscussionRoom).filter(DiscussionRoom.is_active == True)
    
    if department:
        query = query.filter(DiscussionRoom.department == department)
    if semester:
        query = query.filter(DiscussionRoom.semester == semester)
    
    return query.all()

@router.get("/rooms/{room_id}/messages")
async def get_room_messages(
    room_id: int,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get messages from a room"""
    messages = db.query(ChatMessage)\
        .filter(ChatMessage.room_id == room_id)\
        .order_by(ChatMessage.created_at.desc())\
        .limit(limit)\
        .all()
    
    return messages