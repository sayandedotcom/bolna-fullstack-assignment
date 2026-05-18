from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
from datetime import datetime

from database import get_session
from models import Appointment, AppointmentCreate, AppointmentResponse, AppointmentStatus
from services.bolna import bolna_service

router = APIRouter(prefix="/api/appointments", tags=["appointments"])


@router.post("", response_model=AppointmentResponse)
async def create_appointment(
    appointment: AppointmentCreate,
    session: Session = Depends(get_session),
):
    db_appointment = Appointment(
        patient_name=appointment.patient_name,
        phone=appointment.phone,
        specialty=appointment.specialty,
        preferred_date=appointment.preferred_date,
        preferred_time=appointment.preferred_time,
        doctor_name=appointment.doctor_name,
        branch=appointment.branch,
        status=AppointmentStatus.PENDING.value,
    )
    session.add(db_appointment)
    session.commit()
    session.refresh(db_appointment)

    try:
        bolna_response = await bolna_service.trigger_call(
            phone=appointment.phone,
            patient_name=appointment.patient_name,
            specialty=appointment.specialty,
            preferred_date=appointment.preferred_date,
            preferred_time=appointment.preferred_time,
            doctor_name=appointment.doctor_name,
            branch=appointment.branch,
        )

        if bolna_response.get("call_id"):
            db_appointment.bolna_call_id = bolna_response["call_id"]
            db_appointment.status = AppointmentStatus.CALLED.value
            session.commit()
            session.refresh(db_appointment)

    except Exception as e:
        print(f"Bolna API error: {e}")

    return db_appointment


@router.get("", response_model=List[AppointmentResponse])
async def list_appointments(session: Session = Depends(get_session)):
    appointments = session.exec(select(Appointment).order_by(Appointment.created_at.desc())).all()
    return appointments


@router.get("/{appointment_id}", response_model=AppointmentResponse)
async def get_appointment(appointment_id: int, session: Session = Depends(get_session)):
    appointment = session.get(Appointment, appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appointment


@router.post("/{appointment_id}/reminder")
async def send_reminder(appointment_id: int, session: Session = Depends(get_session)):
    appointment = session.get(Appointment, appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    try:
        bolna_response = await bolna_service.trigger_call(
            phone=appointment.phone,
            patient_name=appointment.patient_name,
            specialty=appointment.specialty,
            preferred_date=appointment.preferred_date,
            preferred_time=appointment.preferred_time,
            doctor_name=appointment.doctor_name,
            branch=appointment.branch,
        )

        if bolna_response.get("call_id"):
            appointment.bolna_call_id = bolna_response["call_id"]
            appointment.status = AppointmentStatus.CALLED.value
            session.commit()

        return {"success": True, "call_id": bolna_response.get("call_id")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send reminder: {str(e)}")