from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Form, Query
from app.core.security import get_current_user
from app.services.document_loader import document_loader
from app.services.rag_service import rag_service
from app.models.user import User
import os
import shutil
from datetime import datetime

router = APIRouter(prefix="/api/upload", tags=["Document Upload"])

UPLOAD_DIR = "data/documents/user_uploads"

ALLOWED_EXTENSIONS = {'.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt'}

@router.post("/document")
async def upload_document(
    file: UploadFile = File(...),
    category: str = Form("notes"),
    current_user = Depends(get_current_user)
):
    """Upload a document with category"""
    
    # Validate extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"Unsupported format. Use: {', '.join(ALLOWED_EXTENSIONS)}")
    
    # Validate category
    valid_categories = ["syllabus", "notes", "question_papers", "lab_manuals"]
    if category not in valid_categories:
        raise HTTPException(400, f"Invalid category. Use: {', '.join(valid_categories)}")
    
    # Create user-specific directory
    user_dir = os.path.join(UPLOAD_DIR, str(current_user.id), category)
    os.makedirs(user_dir, exist_ok=True)
    
    # Save file
    file_path = os.path.join(user_dir, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Extract text and add to RAG
    chunks_added = 0
    try:
        text = document_loader.load_file(file_path)
        if text:
            chunks = document_loader.chunk_text(text)
            metadata = [{
                "source": file.filename,
                "uploaded_by": str(current_user.id),
                "category": category,
                "uploaded_at": datetime.now().isoformat()
            } for _ in chunks]
            rag_service.add_documents(chunks, metadata)
            chunks_added = len(chunks)
    except Exception as e:
        print(f"Text extraction error: {e}")
    
    return {
        "message": f"Uploaded {file.filename} successfully!",
        "filename": file.filename,
        "category": category,
        "chunks_added": chunks_added,
        "file_path": file_path
    }

@router.get("/documents")
async def get_user_documents(
    category: str = Query(None),
    current_user = Depends(get_current_user)
):
    """Get user's uploaded documents"""
    user_dir = os.path.join(UPLOAD_DIR, str(current_user.id))
    documents = []
    
    if os.path.exists(user_dir):
        categories = [category] if category else os.listdir(user_dir)
        for cat in categories:
            cat_path = os.path.join(user_dir, cat)
            if os.path.isdir(cat_path):
                for filename in os.listdir(cat_path):
                    file_path = os.path.join(cat_path, filename)
                    if os.path.isfile(file_path):
                        documents.append({
                            "filename": filename,
                            "category": cat,
                            "size": os.path.getsize(file_path),
                            "uploaded_at": datetime.fromtimestamp(
                                os.path.getmtime(file_path)
                            ).isoformat(),
                            "file_path": file_path
                        })
    
    return {
        "documents": documents,
        "total": len(documents),
        "categories": ["syllabus", "notes", "question_papers", "lab_manuals"]
    }

@router.delete("/document")
async def delete_document(
    filename: str = Query(...),
    category: str = Query(...),
    current_user = Depends(get_current_user)
):
    """Delete a user's document"""
    file_path = os.path.join(UPLOAD_DIR, str(current_user.id), category, filename)
    
    if os.path.exists(file_path):
        os.remove(file_path)
        return {"message": f"Deleted {filename}"}
    else:
        raise HTTPException(404, "Document not found")
