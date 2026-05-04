from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import auth, chatbot, resources, questions, live_chat
from app.core.database import engine, Base, init_db
from app.core.config import settings

# Try to import upload routes
try:
    from app.api.routes import upload
    has_upload = True
except ImportError:
    has_upload = False
    print("Upload routes not available")

init_db()

app = FastAPI(
    title="AcadAssist - Mystic Coders",
    description="AI-Powered Academic Assistant with Qwen LLM and RAG",
    version="2.0.0",
    docs_url="/api/docs"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routes
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(chatbot.router, prefix="/api/chatbot", tags=["Chatbot"])
app.include_router(resources.router, prefix="/api/resources", tags=["Resources"])
app.include_router(questions.router, prefix="/api/questions", tags=["Questions"])
app.include_router(live_chat.router, prefix="/api/live-chat", tags=["Live Chat"])

# Register upload routes if available
if has_upload:
    app.include_router(upload.router, prefix="/api/upload", tags=["Upload"])

@app.get("/")
async def root():
    return {"message": "AcadAssist API", "team": "Mystic Coders", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
