# Apollo HealthLine — Voice AI Scheduling Agent

A full-stack demo showcasing a Voice AI agent (built on Bolna) integrated with a React/Next.js web app and Python/FastAPI backend.

## Architecture

```
Patient → Web Form → FastAPI Backend → Bolna API → Asha (Voice AI Agent)
                                                      ↓
Admin Dashboard ← Webhook Updates ← Call Completes ← Bolna
```

## Quick Start

### Backend (FastAPI)

```bash
cd apps/api
cp .env.example .env  # Add your BOLNA_API_KEY and BOLNA_AGENT_ID
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API docs available at `http://localhost:8000/docs`

### Frontend (Next.js)

```bash
cd apps/web
cp ../../.env.example .env.local  # Set NEXT_PUBLIC_API_URL
pnpm install
pnpm dev
```

Visit `http://localhost:3000`

## Project Structure

```
bolna/
├── apps/
│   ├── api/                    # FastAPI Backend
│   │   ├── main.py             # App entry + CORS
│   │   ├── database.py         # SQLite/SQLModel
│   │   ├── models.py           # Pydantic + SQLModel schemas
│   │   ├── routers/
│   │   │   ├── appointments.py # CRUD + Bolna trigger
│   │   │   ├── webhooks.py     # Bolna webhook receiver
│   │   │   └── analytics.py    # Dashboard stats
│   │   └── services/
│   │       └── bolna.py        # Bolna API client
│   └── web/                    # Next.js Frontend
│       ├── app/
│       │   ├── patient/page.tsx     # Patient intake form
│       │   ├── dashboard/page.tsx   # Admin dashboard
│       │   ├── appointments/[id]/   # Transcript viewer
│       │   └── api/                # Proxy routes to FastAPI
│       └── components/
└── packages/
    └── ui/                     # Shared shadcn/ui components
```

## Key Features

- **Patient Intake Form**: Multi-step form collecting patient info, specialty, branch, date/time
- **Voice Agent Integration**: Triggers outbound call via Bolna API on form submission
- **Admin Dashboard**: Live polling table with status badges, analytics strip
- **Transcript Viewer**: Full call transcript with conversation bubbles
- **Webhook Receiver**: Real-time status updates when calls complete
- **Send Reminder**: One-click reminder call to patients

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, shadcn/ui, Tailwind CSS |
| Backend | FastAPI, SQLModel, SQLite |
| Voice AI | Bolna (Asha agent) |
| Deployment | Vercel (frontend), Railway (backend) |

## Environment Variables

### Backend (`apps/api/.env`)
```env
BOLNA_API_KEY=your_api_key
BOLNA_AGENT_ID=your_agent_id
BOLNA_API_URL=https://api.bolna.dev
DATABASE_URL=sqlite:///./appointments.db
CORS_ORIGINS=http://localhost:3000
```

### Frontend (`apps/web/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Bolna API Integration

### Trigger Outbound Call
```http
POST https://api.bolna.dev/call
Authorization: Bearer {BOLNA_API_KEY}
{
  "agent_id": "your-agent-id",
  "recipient_phone_number": "+91XXXXXXXXXX",
  "variables": {
    "name": "Rahul Mehta",
    "specialty": "Cardiology",
    "date": "Friday",
    "time": "2:30 PM",
    "doctor": "Dr. Priya Sharma",
    "branch": "Jubilee Hills"
  }
}
```

### Webhook Payload (received at `/webhook/bolna`)
```json
{
  "call_id": "abc123",
  "status": "completed",
  "transcript": [...],
  "duration": 119,
  "outcome": "confirmed"
}
```

## Demo Flow

1. Patient visits `/patient`, fills multi-step form
2. On submit, backend creates appointment record + triggers Bolna call
3. Asha (Bolna voice agent) calls patient's phone
4. Patient confirms appointment details via voice
5. Bolna sends webhook to backend with call outcome
6. Dashboard updates in real-time showing confirmed status
7. Admin can view full transcript at `/appointments/[id]`

## Deployment

1. **Backend**: Deploy `apps/api/` to Railway/Render
   - Set `BOLNA_API_KEY`, `BOLNA_AGENT_ID` env vars
   - Set `CORS_ORIGINS` to your Vercel domain

2. **Frontend**: Deploy `apps/web/` to Vercel
   - Set `NEXT_PUBLIC_API_URL` to your backend URL

3. **Webhook**: Use ngrok for local dev, or update Bolna dashboard with production webhook URL

## Screenshots

See `/docs` folder for demo screenshots.