# backend/app/models/resource.py
from sqlalchemy import Column, Integer, String, Text, DateTime, Enum as SQLEnum, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum
from datetime import datetime

class ResourceType(str, enum.Enum):
    SYLLABUS = "syllabus"
    NOTES = "notes"
    QUESTION_PAPER = "question_paper"
    LAB_SCHEDULE = "lab_schedule"
    EVENT = "event"
    OTHER = "other"

class Resource(Base):
    __tablename__ = "resources"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    resource_type = Column(SQLEnum(ResourceType), nullable=False)
    department = Column(String(100))
    semester = Column(Integer)
    subject = Column(String(200))
    file_url = Column(String(500))
    content_text = Column(Text)
    tags = Column(String(500))  # Comma-separated tags
    uploaded_by = Column(Integer, ForeignKey("users.id"))
    download_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    uploader = relationship("User", back_populates="resources_uploaded")