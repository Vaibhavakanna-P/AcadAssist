# backend/app/api/routes/resources.py
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.resource import Resource, ResourceType
from app.services.semantic_search import semantic_search
from pydantic import BaseModel
from datetime import datetime
import os
import shutil

router = APIRouter()

class ResourceCreate(BaseModel):
    title: str
    description: str
    resource_type: ResourceType
    department: str
    semester: int
    subject: str
    content_text: Optional[str] = None
    tags: Optional[str] = None

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
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all resources with optional filters"""
    query = db.query(Resource)
    
    if resource_type:
        query = query.filter(Resource.resource_type == resource_type)
    if department:
        query = query.filter(Resource.department == department)
    if semester:
        query = query.filter(Resource.semester == semester)
    if search:
        query = query.filter(
            Resource.title.contains(search) |
            Resource.description.contains(search) |
            Resource.content_text.contains(search)
        )
    
    resources = query.offset(skip).limit(limit).all()
    return resources

@router.get("/{resource_id}", response_model=ResourceResponse)
async def get_resource(
    resource_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific resource by ID"""
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    # Increment download count
    resource.download_count += 1
    db.commit()
    
    return resource

@router.post("/", response_model=ResourceResponse)
async def create_resource(
    resource: ResourceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new academic resource"""
    new_resource = Resource(
        **resource.dict(),
        uploaded_by=current_user.id
    )
    
    db.add(new_resource)
    db.commit()
    db.refresh(new_resource)
    
    return new_resource

@router.post("/upload")
async def upload_resource_file(
    file: UploadFile = File(...),
    resource_type: ResourceType = Query(...),
    department: str = Query(...),
    semester: int = Query(...),
    subject: str = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload a resource file"""
    # Validate file type
    allowed_types = ['application/pdf', 'text/plain', 'application/msword', 
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="File type not allowed")
    
    # Save file
    upload_dir = f"backend/data/uploads/{department}/{resource_type.value}/"
    os.makedirs(upload_dir, exist_ok=True)
    
    file_path = os.path.join(upload_dir, file.filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Create resource record
    resource = Resource(
        title=file.filename,
        description=f"Uploaded {resource_type.value} for {subject}",
        resource_type=resource_type,
        department=department,
        semester=semester,
        subject=subject,
        file_url=file_path,
        uploaded_by=current_user.id
    )
    
    db.add(resource)
    db.commit()
    db.refresh(resource)
    
    return {
        "message": "File uploaded successfully",
        "resource_id": resource.id,
        "file_path": file_path
    }

@router.get("/search/semantic")
async def semantic_resource_search(
    query: str,
    department: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Semantic search for resources"""
    # Get all resources
    query_filter = db.query(Resource)
    if department:
        query_filter = query_filter.filter(Resource.department == department)
    
    resources = query_filter.all()
    
    # Perform semantic search
    resource_texts = [
        f"{r.title} {r.description} {r.content_text or ''}" 
        for r in resources
    ]
    
    search_results = semantic_search.search(query, resource_texts)
    
    # Map results back to resources
    results = []
    for idx, score in search_results[:10]:
        if score > 0.1:  # Similarity threshold
            resource = resources[idx]
            results.append({
                'resource': ResourceResponse.from_orm(resource),
                'relevance_score': score
            })
    
    return results

@router.delete("/{resource_id}")
async def delete_resource(
    resource_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a resource"""
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    # Delete file if exists
    if resource.file_url and os.path.exists(resource.file_url):
        os.remove(resource.file_url)
    
    db.delete(resource)
    db.commit()
    
    return {"message": "Resource deleted successfully"}