# create_missing.py
"""Create all 26 missing files for Smart Academic Portal"""
import os

BASE = r"C:\Users\Vaibhavakanna\OneDrive\ドキュメント\AcadAssist"

def write_file(rel_path, content):
    full_path = os.path.join(BASE, rel_path.replace("/", os.sep))
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"✅ Created: {rel_path}")

# 1. backend/.env
write_file("backend/.env", """SECRET_KEY=mystic-coders-secret-key-2024
DATABASE_URL=sqlite:///./smart_portal.db
DEBUG=True
ALLOWED_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000"]
MODEL_PATH=./data/models
UPLOAD_DIR=./data/uploads
""")

# 2. backend/requirements.txt
write_file("backend/requirements.txt", """fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
pydantic==2.5.0
pydantic-settings==2.1.0
python-dotenv==1.0.0
transformers==4.36.2
torch==2.1.2
sentence-transformers==2.2.2
scikit-learn==1.3.2
nltk==3.8.1
pandas==2.1.4
numpy==1.26.2
websockets==12.0
aiofiles==23.2.1
""")

# 3. backend/app/api/__init__.py
write_file("backend/app/api/__init__.py", "from app.api.routes import auth, chatbot, resources, questions, live_chat\n")

# 4. backend/app/api/routes/__init__.py
write_file("backend/app/api/routes/__init__.py", "")

# 5. backend/app/api/routes/auth.py
write_file("backend/app/api/routes/auth.py", """from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.core.security import verify_password, get_password_hash, create_access_token
from pydantic import BaseModel, EmailStr
from datetime import timedelta

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: str
    department: str
    year: int = None

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: str
    department: str
    role: str

@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(
        (User.username == user.username) | (User.email == user.email)
    ).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username or email already registered")
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username, email=user.email,
        hashed_password=hashed_password, full_name=user.full_name,
        department=user.department, year=user.year
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    access_token = create_access_token(data={"sub": user.username}, expires_delta=timedelta(hours=24))
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {"username": user.username, "role": user.role.value, "department": user.department, "full_name": user.full_name, "email": user.email}
    }
""")

# 6. backend/app/api/routes/chatbot.py
write_file("backend/app/api/routes/chatbot.py", """from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.core.security import get_current_user
from app.services.llm_service import llm_service
from typing import Optional

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = None

class ChatResponse(BaseModel):
    response: str

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, current_user=Depends(get_current_user)):
    try:
        response = llm_service.get_chatbot_response(request.message, request.context)
        return ChatResponse(response=response['response'])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/summarize")
async def summarize(text: str, current_user=Depends(get_current_user)):
    try:
        summary = llm_service.summarize_content(text)
        return {"summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
""")

# 7. backend/app/api/routes/resources.py
write_file("backend/app/api/routes/resources.py", """from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.resource import Resource, ResourceType
from pydantic import BaseModel
from datetime import datetime
import os, shutil

router = APIRouter()

class ResourceCreate(BaseModel):
    title: str
    description: str
    resource_type: ResourceType
    department: str
    semester: int
    subject: str
    content_text: Optional[str] = None

class ResourceResponse(BaseModel):
    id: int
    title: str
    description: str
    resource_type: str
    department: str
    semester: int
    subject: str
    download_count: int
    created_at: datetime

@router.get("/", response_model=List[ResourceResponse])
async def get_resources(
    resource_type: Optional[ResourceType] = None,
    department: Optional[str] = None,
    semester: Optional[int] = None,
    search: Optional[str] = None,
    skip: int = 0, limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Resource)
    if resource_type: query = query.filter(Resource.resource_type == resource_type)
    if department: query = query.filter(Resource.department == department)
    if semester: query = query.filter(Resource.semester == semester)
    if search: query = query.filter(Resource.title.contains(search) | Resource.description.contains(search))
    return query.offset(skip).limit(limit).all()

@router.get("/{resource_id}")
async def get_resource(resource_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource: raise HTTPException(status_code=404, detail="Resource not found")
    resource.download_count += 1
    db.commit()
    return resource

@router.post("/", response_model=ResourceResponse)
async def create_resource(resource: ResourceCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    new_resource = Resource(**resource.dict(), uploaded_by=current_user.id)
    db.add(new_resource)
    db.commit()
    db.refresh(new_resource)
    return new_resource

@router.post("/upload")
async def upload_resource(file: UploadFile = File(...), resource_type: ResourceType = Query(...), department: str = Query(...), semester: int = Query(...), subject: str = Query(...), db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    upload_dir = f"backend/data/uploads/{department}/{resource_type.value}/"
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, file.filename)
    with open(file_path, "wb") as buffer: shutil.copyfileobj(file.file, buffer)
    resource = Resource(title=file.filename, description=f"Uploaded {resource_type.value}", resource_type=resource_type, department=department, semester=semester, subject=subject, file_url=file_path, uploaded_by=current_user.id)
    db.add(resource)
    db.commit()
    db.refresh(resource)
    return {"message": "File uploaded", "resource_id": resource.id}
""")

# 8. backend/app/api/routes/questions.py
write_file("backend/app/api/routes/questions.py", """from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.core.security import get_current_user
from app.services.question_generator import question_generator
from typing import List, Dict

router = APIRouter()

class QuestionRequest(BaseModel):
    content: str
    num_questions: int = 5
    question_type: str = "descriptive"

@router.post("/generate")
async def generate_questions(request: QuestionRequest, current_user=Depends(get_current_user)):
    try:
        if request.question_type == "mcq":
            questions = question_generator.generate_mcq_questions(request.content, request.num_questions)
        else:
            questions = question_generator.generate_descriptive_questions(request.content, request.num_questions)
        return {"questions": questions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
""")

# 9. backend/app/api/routes/live_chat.py
write_file("backend/app/api/routes/live_chat.py", """from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db, SessionLocal
from app.core.security import get_current_user_ws
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
""")

# 10-13. __init__.py files
for path in ["backend/app/core/__init__.py", "backend/app/models/__init__.py", "backend/app/ml_models/__init__.py", "backend/app/services/__init__.py"]:
    write_file(path, "")

# 14. backend/app/services/scheduler_service.py
write_file("backend/app/services/scheduler_service.py", """from datetime import datetime, timedelta
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from app.models.resource import Resource, ResourceType

class SchedulerService:
    def __init__(self):
        self.schedule_cache = {}
    
    def get_lab_schedule(self, department: str, semester: int, db: Session) -> List[Dict]:
        schedules = db.query(Resource).filter(Resource.resource_type == ResourceType.LAB_SCHEDULE, Resource.department == department, Resource.semester == semester).all()
        return [{"id": s.id, "title": s.title, "description": s.description, "subject": s.subject} for s in schedules]
    
    def get_upcoming_events(self, department: str, db: Session) -> List[Dict]:
        events = db.query(Resource).filter(Resource.resource_type == ResourceType.EVENT, Resource.department == department).all()
        return [{"id": e.id, "title": e.title, "description": e.description} for e in events]

scheduler_service = SchedulerService()
""")

# 15-18. Data directories
for d in ["backend/data/syllabi", "backend/data/question_banks", "backend/data/notes", "backend/data/datasets"]:
    os.makedirs(os.path.join(BASE, d), exist_ok=True)
    print(f"✅ Created directory: {d}")

# 19. frontend/src/contexts/AuthContext.js
write_file("frontend/src/contexts/AuthContext.js", """import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try { setUser(JSON.parse(userData)); } catch (e) {}
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { username: email, password });
    const { access_token, user: userData } = response.data;
    localStorage.setItem('token', access_token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    toast.success('Welcome back!');
  };

  const register = async (userData) => {
    await api.post('/auth/register', userData);
    toast.success('Registration successful!');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
};
""")

# 20. Login.js
write_file("frontend/src/pages/Login.js", """import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="card p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6 gradient-text">Welcome Back!</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" required /></div>
          <div><label className="block text-sm font-medium mb-1">Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" required /></div>
          <button type="submit" className="btn-gradient w-full py-3">Login</button>
        </form>
        <p className="text-center mt-4 text-sm text-gray-600">Don't have an account? <Link to="/register" className="text-primary-500 hover:underline">Register</Link></p>
      </div>
    </div>
  );
};

export default Login;
""")

# 21. Register.js
write_file("frontend/src/pages/Register.js", """import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '', full_name: '', department: '', year: '' });
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      navigate('/login');
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="card p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6 gradient-text">Create Account</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input name="full_name" placeholder="Full Name" onChange={handleChange} className="input-field" required />
          <input name="username" placeholder="Username" onChange={handleChange} className="input-field" required />
          <input name="email" type="email" placeholder="Email" onChange={handleChange} className="input-field" required />
          <input name="password" type="password" placeholder="Password" onChange={handleChange} className="input-field" required />
          <input name="department" placeholder="Department" onChange={handleChange} className="input-field" required />
          <input name="year" type="number" placeholder="Year" onChange={handleChange} className="input-field" required />
          <button type="submit" className="btn-gradient w-full py-3">Register</button>
        </form>
        <p className="text-center mt-4 text-sm text-gray-600">Already have an account? <Link to="/login" className="text-primary-500 hover:underline">Login</Link></p>
      </div>
    </div>
  );
};

export default Register;
""")

# 22. Chatbot.js
write_file("frontend/src/pages/Chatbot.js", """import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import { FiSend } from 'react-icons/fi';

const Chatbot = () => {
  const [messages, setMessages] = useState([{ type: 'bot', content: "Hello! I'm your AI assistant. Ask me anything about your courses! 📚" }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const msgEnd = useRef(null);

  useEffect(() => { msgEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages(prev => [...prev, { type: 'user', content: input }]);
    setInput(''); setLoading(true);
    try {
      const res = await api.post('/chatbot/chat', { message: input });
      setMessages(prev => [...prev, { type: 'bot', content: res.data.response }]);
    } catch { setMessages(prev => [...prev, { type: 'bot', content: 'Sorry, error occurred.' }]); }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto"><div className="card h-[600px] flex flex-col">
      <h1 className="text-2xl font-bold p-4 border-b">🤖 AI Assistant</h1>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => <div key={i} className={`flex ${m.type === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[70%] px-4 py-2 rounded-2xl ${m.type === 'user' ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>{m.content}</div></div>)}
        {loading && <div className="text-gray-500">Thinking...</div>}
        <div ref={msgEnd} />
      </div>
      <form onSubmit={send} className="p-4 border-t flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask about syllabus, notes..." className="input-field" />
        <button type="submit" className="btn-primary px-4"><FiSend /></button>
      </form>
    </div></div>
  );
};

export default Chatbot;
""")

# 23. Resources.js
write_file("frontend/src/pages/Resources.js", """import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ResourceCard from '../components/ResourceCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get('/resources/').then(r => setResources(r.data)).finally(() => setLoading(false)); }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">📚 Resources</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map(r => <ResourceCard key={r.id} resource={r} />)}
      </div>
    </div>
  );
};

export default Resources;
""")

# 24. QuestionGenerator.js
write_file("frontend/src/pages/QuestionGenerator.js", """import React, { useState } from 'react';
import api from '../services/api';
import QuestionDisplay from '../components/QuestionDisplay';

const QuestionGenerator = () => {
  const [content, setContent] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const generate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/questions/generate', { content, num_questions: 5 });
      setQuestions(res.data.questions);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card p-6">
        <h1 className="text-2xl font-bold mb-4">📝 Question Generator</h1>
        <form onSubmit={generate}>
          <textarea value={content} onChange={e => setContent(e.target.value)} rows="6" className="input-field mb-4" placeholder="Paste study material here..." required />
          <button type="submit" className="btn-gradient w-full" disabled={loading}>{loading ? 'Generating...' : 'Generate Questions'}</button>
        </form>
        {questions.length > 0 && <div className="mt-6 space-y-4">{questions.map((q, i) => <QuestionDisplay key={i} question={q} index={i} />)}</div>}
      </div>
    </div>
  );
};

export default QuestionGenerator;
""")

# 25. LiveDiscussion.js
write_file("frontend/src/pages/LiveDiscussion.js", """import React from 'react';
import LiveChatBox from '../components/LiveChatBox';
import { useAuth } from '../contexts/AuthContext';

const LiveDiscussion = () => {
  const { user } = useAuth();
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">💬 Live Discussion</h1>
      <div className="card p-6 text-center">
        <p className="text-gray-500 mb-4">Join a discussion room to chat with your peers!</p>
        <LiveChatBox roomId={1} roomName="General Discussion" currentUser={user} />
      </div>
    </div>
  );
};

export default LiveDiscussion;
""")

# 26. Profile.js
write_file("frontend/src/pages/Profile.js", """import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card p-8">
        <h1 className="text-3xl font-bold mb-6">👤 Profile</h1>
        <div className="space-y-4">
          <div className="flex justify-between py-2 border-b"><span className="font-medium">Name</span><span>{user?.full_name}</span></div>
          <div className="flex justify-between py-2 border-b"><span className="font-medium">Email</span><span>{user?.email}</span></div>
          <div className="flex justify-between py-2 border-b"><span className="font-medium">Department</span><span>{user?.department}</span></div>
          <div className="flex justify-between py-2 border-b"><span className="font-medium">Role</span><span className="capitalize">{user?.role}</span></div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
""")

print("\n✅ ALL 26 MISSING FILES CREATED SUCCESSFULLY!")
print("\nNow run verify.py again to confirm everything is complete!")