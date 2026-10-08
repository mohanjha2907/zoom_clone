from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

# User Schemas
class UserBase(BaseModel):
    name: str
    email: str
    avatar_url: Optional[str] = None

class UserResponse(UserBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

# Participant Schemas
class ParticipantJoin(BaseModel):
    display_name: str
    user_id: Optional[int] = None

class ParticipantResponse(BaseModel):
    id: int
    meeting_id: int
    user_id: Optional[int]
    display_name: str
    role: str
    is_muted: bool
    is_video_on: bool
    joined_at: datetime
    left_at: Optional[datetime]
    class Config:
        from_attributes = True

# Meeting Schemas
class MeetingSchedule(BaseModel):
    title: str
    description: Optional[str] = None
    host_id: int
    start_time: datetime
    duration: int = 60
    passcode: Optional[str] = None

class MeetingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    duration: Optional[int] = None
    status: Optional[str] = None

class MeetingResponse(BaseModel):
    id: int
    meeting_code: str
    title: str
    description: Optional[str]
    host_id: int
    start_time: Optional[datetime]
    duration: int
    status: str
    meeting_type: str
    invite_link: str
    passcode: Optional[str]
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

class MeetingStatusUpdate(BaseModel):
    status: str
