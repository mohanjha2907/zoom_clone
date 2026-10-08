from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from database import engine, Base, SessionLocal
import models
from utils import generate_meeting_code, generate_invite_link, generate_passcode

def seed_db():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    
    # Check if DB is already seeded
    if db.query(models.User).first():
        print("Database already seeded.")
        db.close()
        return

    print("Seeding database...")
    
    # 1. Create Default User
    user = models.User(name="John Doe", email="john@example.com")
    db.add(user)
    db.commit()
    db.refresh(user)

    now = datetime.now(timezone.utc)

    # 2. Create 3 Upcoming Scheduled Meetings
    for i in range(3):
        start_time = now + timedelta(days=i+1, hours=10)
        code = generate_meeting_code()
        meeting = models.Meeting(
            meeting_code=code,
            title=f"Upcoming Project Sync {i+1}",
            description="Discussing future roadmap",
            host_id=user.id,
            start_time=start_time,
            duration=60,
            status="scheduled",
            meeting_type="scheduled",
            invite_link=generate_invite_link(code),
            passcode=generate_passcode()
        )
        db.add(meeting)

    # 3. Create 2 Recent/Ended Meetings
    for i in range(2):
        start_time = now - timedelta(days=i+1, hours=2)
        code = generate_meeting_code()
        meeting = models.Meeting(
            meeting_code=code,
            title=f"Past Team Review {i+1}",
            description="Reviewing past action items",
            host_id=user.id,
            start_time=start_time,
            duration=45,
            status="ended",
            meeting_type="scheduled",
            invite_link=generate_invite_link(code),
            passcode=generate_passcode(),
            created_at=start_time,
            updated_at=start_time + timedelta(minutes=45)
        )
        db.add(meeting)
        db.commit()
        db.refresh(meeting)
        
        # Add participants for ended meetings
        host_participant = models.Participant(
            meeting_id=meeting.id,
            user_id=user.id,
            display_name=user.name,
            role="host",
            joined_at=start_time,
            left_at=start_time + timedelta(minutes=45)
        )
        guest_participant = models.Participant(
            meeting_id=meeting.id,
            display_name=f"Guest {i+1}",
            role="participant",
            joined_at=start_time + timedelta(minutes=2),
            left_at=start_time + timedelta(minutes=40)
        )
        db.add(host_participant)
        db.add(guest_participant)

    db.commit()
    print("Seeding complete.")
    db.close()

if __name__ == "__main__":
    seed_db()
