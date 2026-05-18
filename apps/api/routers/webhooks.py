from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from datetime import datetime
import json

from database import get_session
from models import Appointment, WebhookPayload, AppointmentStatus

router = APIRouter(prefix="/webhook", tags=["webhooks"])


@router.post("/bolna")
async def receive_bolna_webhook(payload: WebhookPayload, session: Session = Depends(get_session)):
    appointment = session.exec(
        select(Appointment).where(Appointment.bolna_call_id == payload.call_id)
    ).first()

    if not appointment:
        return {"status": "ignored", "reason": "call_id not found"}

    appointment.status = payload.status
    appointment.call_outcome = payload.outcome
    appointment.duration = payload.duration
    appointment.updated_at = datetime.utcnow()

    if payload.transcript:
        appointment.transcript = json.dumps(payload.transcript)

    if payload.status == "completed" and payload.outcome == "confirmed":
        appointment.status = AppointmentStatus.CONFIRMED.value
    elif payload.status == "completed" and payload.outcome == "no_answer":
        appointment.status = AppointmentStatus.NO_ANSWER.value
    elif payload.status == "completed" and payload.outcome == "escalated":
        appointment.status = AppointmentStatus.ESCALATED.value

    session.commit()

    return {"status": "success", "appointment_id": appointment.id}