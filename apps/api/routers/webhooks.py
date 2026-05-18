from fastapi import APIRouter, BackgroundTasks
from sqlmodel import Session, select
from datetime import datetime
import json

from database import get_session
from models import Appointment, WebhookPayload, AppointmentStatus

router = APIRouter(prefix="/webhook", tags=["webhooks"])


async def process_webhook(call_id: str, status: str, outcome: str | None, duration: int | None, transcript: list | None, db_url: str):
    from sqlmodel import create_engine, Session
    engine = create_engine(db_url)
    with Session(engine) as session:
        appointment = session.exec(
            select(Appointment).where(Appointment.bolna_call_id == call_id)
        ).first()

        if not appointment:
            return

        appointment.status = status
        appointment.call_outcome = outcome
        appointment.duration = duration
        appointment.updated_at = datetime.utcnow()

        if transcript:
            appointment.transcript = json.dumps(transcript)

        if status == "completed" and outcome == "confirmed":
            appointment.status = AppointmentStatus.CONFIRMED.value
        elif status == "completed" and outcome == "no_answer":
            appointment.status = AppointmentStatus.NO_ANSWER.value
        elif status == "completed" and outcome == "escalated":
            appointment.status = AppointmentStatus.ESCALATED.value

        session.commit()


@router.post("/bolna")
async def receive_bolna_webhook(payload: WebhookPayload, background_tasks: BackgroundTasks, session: Session):
    call_id = payload.call_id
    if not call_id:
        return {"status": "ignored", "reason": "no call_id"}

    background_tasks.add_task(
        process_webhook,
        call_id=payload.call_id,
        status=payload.status,
        outcome=payload.outcome,
        duration=payload.duration,
        transcript=payload.transcript,
        db_url=session.bind.url.__str__(),
    )

    return {"status": "ok"}