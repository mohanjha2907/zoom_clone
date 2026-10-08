from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import List, Optional

from database import get_db
import models
import schemas
from utils import generate_meeting_code, generate_invite_link, generate_passcode

router = APIRouter(prefix="/api/meetings", tags=["meetings"])

@router.post("/", response_model=schemas.MeetingResponse)
def create_instant_meeting(host_id: int = Query(...), db: Session = Depends(get_db)):
    """Create an instant meeting."""
    user = db.query(models.User).filter(models.User.id == host_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Host user not found")

    code = generate_meeting_code()
    meeting = models.Meeting(
        meeting_code=code,
        title=f"{user.name}'s Meeting",
        host_id=host_id,
        status="active",
        meeting_type="instant",
        invite_link=generate_invite_link(code),
        passcode=generate_passcode()
    )
    db.add(meeting)
    db.commit()
    db.refresh(meeting)
    return meeting

@router.post("/schedule", response_model=schemas.MeetingResponse)
def schedule_meeting(meeting_in: schemas.MeetingSchedule, db: Session = Depends(get_db)):
    """Schedule a meeting."""
    user = db.query(models.User).filter(models.User.id == meeting_in.host_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Host user not found")
        
    code = generate_meeting_code()
    meeting = models.Meeting(
        meeting_code=code,
        title=meeting_in.title,
        description=meeting_in.description,
        host_id=meeting_in.host_id,
        start_time=meeting_in.start_time,
        duration=meeting_in.duration,
        status="scheduled",
        meeting_type="scheduled",
        invite_link=generate_invite_link(code),
        passcode=meeting_in.passcode or generate_passcode()
    )
    db.add(meeting)
    db.commit()
    db.refresh(meeting)
    return meeting

@router.get("/", response_model=List[schemas.MeetingResponse])
def list_meetings(
    status: Optional[str] = None,
    type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Meeting)
    if status:
        query = query.filter(models.Meeting.status == status)
    if type:
        query = query.filter(models.Meeting.meeting_type == type)
    return query.all()

@router.get("/upcoming", response_model=List[schemas.MeetingResponse])
def get_upcoming_meetings(db: Session = Depends(get_db)):
    now = datetime.now(timezone.utc)
    # Comparing aware datetimes if start_time is set
    meetings = db.query(models.Meeting).filter(
        models.Meeting.start_time > now,
        models.Meeting.status == "scheduled"
    ).order_by(models.Meeting.start_time.asc()).all()
    return meetings

@router.get("/recent", response_model=List[schemas.MeetingResponse])
def get_recent_meetings(db: Session = Depends(get_db)):
    meetings = db.query(models.Meeting).filter(
        models.Meeting.status == "ended"
    ).order_by(models.Meeting.updated_at.desc()).limit(10).all()
    return meetings

@router.get("/{meeting_code}", response_model=schemas.MeetingResponse)
def get_meeting(meeting_code: str, db: Session = Depends(get_db)):
    meeting = db.query(models.Meeting).filter(models.Meeting.meeting_code == meeting_code).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return meeting

@router.put("/{meeting_code}", response_model=schemas.MeetingResponse)
def update_meeting(meeting_code: str, meeting_in: schemas.MeetingUpdate, db: Session = Depends(get_db)):
    meeting = db.query(models.Meeting).filter(models.Meeting.meeting_code == meeting_code).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    update_data = meeting_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(meeting, key, value)
        
    db.commit()
    db.refresh(meeting)
    return meeting

@router.put("/{meeting_code}/status", response_model=schemas.MeetingResponse)
def update_meeting_status(meeting_code: str, status_in: schemas.MeetingStatusUpdate, db: Session = Depends(get_db)):
    meeting = db.query(models.Meeting).filter(models.Meeting.meeting_code == meeting_code).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    if status_in.status not in ["scheduled", "active", "ended"]:
        raise HTTPException(status_code=400, detail="Invalid status")
        
    meeting.status = status_in.status
    db.commit()
    db.refresh(meeting)
    return meeting

@router.delete("/{meeting_code}")
def delete_meeting(meeting_code: str, db: Session = Depends(get_db)):
    meeting = db.query(models.Meeting).filter(models.Meeting.meeting_code == meeting_code).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
        
    db.delete(meeting)
    db.commit()
    return {"message": "Meeting deleted successfully"}
