import httpx
import os
from typing import Optional, Dict, Any


def normalise_phone(phone: str) -> str:
    digits = "".join(filter(str.isdigit, phone))
    if len(digits) == 10:
        return f"+91{digits}"
    if len(digits) == 12 and digits.startswith("91"):
        return f"+{digits}"
    return f"+{digits}"


class BolnaService:
    def __init__(self):
        self.api_key = os.getenv("BOLNA_API_KEY")
        self.agent_id = os.getenv("BOLNA_AGENT_ID")
        self.api_url = os.getenv("BOLNA_API_URL", "https://api.bolna.dev")

    async def trigger_call(
        self,
        phone: str,
        patient_name: str,
        specialty: str,
        preferred_date: str,
        preferred_time: str,
        doctor_name: Optional[str] = None,
        branch: Optional[str] = None,
    ) -> Dict[str, Any]:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        payload = {
            "agent_id": self.agent_id,
            "recipient_phone_number": normalise_phone(phone),
            "variables": {
                "name": patient_name,
                "specialty": specialty,
                "date": preferred_date,
                "time": preferred_time,
                "doctor": doctor_name or "our doctor",
                "branch": branch or "our hospital",
            },
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{self.api_url}/call",
                headers=headers,
                json=payload,
            )
            response.raise_for_status()
            return response.json()

    async def get_call_transcript(self, call_id: str) -> Optional[Dict[str, Any]]:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{self.api_url}/call/{call_id}",
                headers=headers,
            )
            if response.status_code == 200:
                return response.json()
            return None


bolna_service = BolnaService()