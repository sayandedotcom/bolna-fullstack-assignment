from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func
from datetime import datetime

from database import get_session
from models import Appointment, AnalyticsResponse

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("", response_model=AnalyticsResponse)
async def get_analytics(session: Session = Depends(get_session)):
    appointments = session.exec(select(Appointment)).all()

    total = len(appointments)
    pending = sum(1 for a in appointments if a.status == "pending")
    called = sum(1 for a in appointments if a.status == "called")
    confirmed = sum(1 for a in appointments if a.status == "confirmed")
    no_answer = sum(1 for a in appointments if a.status == "no_answer")
    escalated = sum(1 for a in appointments if a.status == "escalated")
    failed = sum(1 for a in appointments if a.status == "failed")

    confirmation_rate = (confirmed / total * 100) if total > 0 else 0.0
    no_show_reduction = confirmation_rate * 0.4

    COST_PER_CALL = 0.15
    COST_HUMAN_AGENT = 2.50
    calls_made = confirmed + no_answer + escalated
    cost_saved = (COST_HUMAN_AGENT - COST_PER_CALL) * calls_made

    return AnalyticsResponse(
        total=total,
        pending=pending,
        called=called,
        confirmed=confirmed,
        no_answer=no_answer,
        escalated=escalated,
        failed=failed,
        confirmation_rate=round(confirmation_rate, 1),
        no_show_reduction=round(no_show_reduction, 1),
        cost_saved=round(cost_saved, 2),
    )