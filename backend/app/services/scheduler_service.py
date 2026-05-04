from datetime import datetime, timedelta
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
