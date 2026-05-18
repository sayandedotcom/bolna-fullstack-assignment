from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class AppointmentStatus(str, Enum):
    PENDING = "pending"
    CALLED = "called"
    CONFIRMED = "confirmed"
    NO_ANSWER = "no_answer"
    ESCALATED = "escalated"
    FAILED = "failed"


class Appointment(SQLModel, table=True):
    __tablename__ = "appointments"

    id: Optional[int] = Field(default=None, primary_key=True)
    patient_name: str = Field(index=True)
    phone: str = Field(index=True)
    specialty: str
    preferred_date: str
    preferred_time: str
    doctor_name: Optional[str] = None
    branch: Optional[str] = None
    status: str = Field(default="pending")
    bolna_call_id: Optional[str] = None
    call_outcome: Optional[str] = None
    transcript: Optional[str] = None
    duration: Optional[int] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None


from pydantic import BaseModel
from typing import Optional, List, Dict, Any


class AppointmentCreate(BaseModel):
    patient_name: str
    phone: str
    specialty: str
    preferred_date: str
    preferred_time: str
    doctor_name: Optional[str] = None
    branch: Optional[str] = None


class AppointmentResponse(BaseModel):
    id: int
    patient_name: str
    phone: str
    specialty: str
    preferred_date: str
    preferred_time: str
    doctor_name: Optional[str]
    branch: Optional[str]
    status: str
    bolna_call_id: Optional[str]
    call_outcome: Optional[str]
    transcript: Optional[str]
    duration: Optional[int]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class TranscriptEntry(BaseModel):
    role: str
    content: str
    timestamp: Optional[str] = None


class WebhookPayload(BaseModel):
    call_id: str
    status: str
    transcript: Optional[List[Dict[str, Any]]] = None
    duration: Optional[int] = None
    outcome: Optional[str] = None


class AnalyticsResponse(BaseModel):
    total: int
    pending: int
    called: int
    confirmed: int
    no_answer: int
    escalated: int
    failed: int
    confirmation_rate: float
    no_show_reduction: float
    cost_saved: float