from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Query
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
