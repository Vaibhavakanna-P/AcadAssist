from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db, SessionLocal
from app.core.security import get_current_user_ws, get_current_user
from app.models.user import User
from app.models.chat_message import ChatMessage, DiscussionRoom
from pydantic import BaseModel
from datetime import datetime
import json

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections = {}
    async def connect(self, websocket: WebSocket, room_id: int):
        await websocket.accept()
        if room_id not in self.active_connections: self.active_connections[room_id] = []
        self.active_connections[room_id].append(websocket)
    def disconnect(self, websocket: WebSocket, room_id: int):
        if room_id in self.active_connections and websocket in self.active_connections[room_id]:
            self.active_connections[room_id].remove(websocket)
    async def broadcast(self, message: str, room_id: int, sender=None):
        if room_id in self.active_connections:
            for conn in self.active_connections[room_id]:
                if conn != sender:
                    await conn.send_text(message)

manager = ConnectionManager()

@router.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: int):
    db = SessionLocal()
    try:
        user = await get_current_user_ws(websocket, db)
        if not user: return
        await manager.connect(websocket, room_id)
        await manager.broadcast(json.dumps({"type": "system", "message": f"{user.full_name} joined", "timestamp": datetime.utcnow().isoformat()}), room_id, websocket)
        while True:
            data = await websocket.receive_text()
            msg_data = json.loads(data)
            db_msg = ChatMessage(content=msg_data.get("content", ""), message_type="chat", sender_id=user.id, room_id=room_id)
            db.add(db_msg); db.commit()
            await manager.broadcast(json.dumps({"type": "chat", "message": msg_data.get("content", ""), "username": user.full_name, "timestamp": datetime.utcnow().isoformat()}), room_id, websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id)
        await manager.broadcast(json.dumps({"type": "system", "message": f"{user.full_name} left", "timestamp": datetime.utcnow().isoformat()}), room_id)
    finally:
        db.close()

class RoomCreate(BaseModel):
    name: str; subject: str = None; department: str = None; semester: int = None

@router.post("/rooms")
async def create_room(room: RoomCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    new_room = DiscussionRoom(**room.dict(), created_by=current_user.id)
    db.add(new_room); db.commit(); db.refresh(new_room)
    return new_room

@router.get("/rooms")
async def get_rooms(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(DiscussionRoom).filter(DiscussionRoom.is_active == True).all()

@router.get("/rooms/{room_id}/messages")
async def get_messages(room_id: int, limit: int = 50, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(ChatMessage).filter(ChatMessage.room_id == room_id).order_by(ChatMessage.created_at.desc()).limit(limit).all()
