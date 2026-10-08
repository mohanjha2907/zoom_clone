from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import List

from database import get_db
import models
import schemas

router = APIRouter(prefix="/api/meetings/{meeting_code}/participants", tags=["participants"])

def get_meeting_or_404(meeting_code: str, db: Session):
    meeting = db.query(models.Meeting).filter(models.Meeting.meeting_code == meeting_code).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return meeting

@router.post("/join", response_model=schemas.ParticipantResponse)
def join_meeting(meeting_code: str, participant_in: schemas.ParticipantJoin, db: Session = Depends(get_db)):
    meeting = get_meeting_or_404(meeting_code, db)
    
    if meeting.status not in ["active", "scheduled"]:
        raise HTTPException(status_code=400, detail="Meeting is not active or scheduled")
        
    role = "participant"
    if participant_in.user_id and participant_in.user_id == meeting.host_id:
        role = "host"
        
    participant = models.Participant(
        meeting_id=meeting.id,
        user_id=participant_in.user_id,
        display_name=participant_in.display_name,
        role=role
    )
    db.add(participant)
    db.commit()
    db.refresh(participant)
    return participant

@router.get("/", response_model=List[schemas.ParticipantResponse])
def list_participants(meeting_code: str, db: Session = Depends(get_db)):
    meeting = get_meeting_or_404(meeting_code, db)
    participants = db.query(models.Participant).filter(
        models.Participant.meeting_id == meeting.id,
        models.Participant.left_at == None
    ).all()
    return participants

@router.put("/{participant_id}/toggle-mute", response_model=schemas.ParticipantResponse)
def toggle_mute(meeting_code: str, participant_id: int, db: Session = Depends(get_db)):
    participant = db.query(models.Participant).filter(models.Participant.id == participant_id).first()
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")
        
    participant.is_muted = not participant.is_muted
    db.commit()
    db.refresh(participant)
    return participant

@router.put("/{participant_id}/toggle-video", response_model=schemas.ParticipantResponse)
def toggle_video(meeting_code: str, participant_id: int, db: Session = Depends(get_db)):
    participant = db.query(models.Participant).filter(models.Participant.id == participant_id).first()
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")
        
    participant.is_video_on = not participant.is_video_on
    db.commit()
    db.refresh(participant)
    return participant

@router.put("/mute-all")
def mute_all_participants(meeting_code: str, db: Session = Depends(get_db)):
    meeting = get_meeting_or_404(meeting_code, db)
    db.query(models.Participant).filter(
        models.Participant.meeting_id == meeting.id,
        models.Participant.role != "host",
        models.Participant.left_at == None
    ).update({"is_muted": True})
    db.commit()
    return {"message": "All participants muted"}

@router.delete("/{participant_id}")
def remove_participant(meeting_code: str, participant_id: int, db: Session = Depends(get_db)):
    participant = db.query(models.Participant).filter(models.Participant.id == participant_id).first()
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")
        
    participant.left_at = datetime.now(timezone.utc)
    db.commit()
    return {"message": "Participant removed"}

@router.post("/leave")
def leave_meeting(meeting_code: str, participant_id: int, db: Session = Depends(get_db)):
    participant = db.query(models.Participant).filter(models.Participant.id == participant_id).first()
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")
        
    participant.left_at = datetime.now(timezone.utc)
    db.commit()
    return {"message": "Left meeting"}
