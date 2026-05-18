# Apollo HealthLine — Voice AI Scheduling Agent

> A full-stack demo showcasing a Voice AI agent (Asha) built on Bolna, integrated with a Next.js web app and FastAPI backend. Patients book appointments via web form, confirm over a phone call with an AI agent, and admins monitor everything from a live dashboard.

## Demo Flow

```
Patient fills form → Asha calls patient → Patient confirms via voice
                                                      ↓
Admin Dashboard ← Webhook updates ← Call completes ← Bolna
```

**Watch the demo:** [Screen recording link]

---

## Features

- **Patient Intake Form** — Multi-step web form collecting patient info, specialty, branch, and preferred date/time
- **Voice AI Agent (Asha)** — Bolna-powered agent that calls patients to confirm appointments
- **Admin Dashboard** — Live polling table with status badges, analytics, and one-click reminder calls
- **Transcript Viewer** — Full call transcript with conversation bubbles
- **Real-time Webhooks** — Dashboard updates automatically when calls complete
- **Send Reminder** — One-click reminder call to any patient

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Python 3.11+, FastAPI, SQLModel, SQLite |
| Voice AI | [Bolna](https://bolna.ai) — Asha agent |
| Deployment | Vercel (frontend), Railway (backend) |

---

## Quick Start

### 1. Backend Setup

```bash
cd apps/api

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env — add your BOLNA_API_KEY and BOLNA_AGENT_ID

# Start server
uvicorn main:app --reload --port 8000
```

API docs available at `http://localhost:8000/docs`

### 2. Frontend Setup

```bash
cd apps/web

pnpm install

# Configure environment
cp ../../.env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8000

pnpm dev
```

Visit `http://localhost:3000`

### 3. Webhook (Local Dev)

For local webhook testing, use [ngrok](https://ngrok.com):

```bash
ngrok http 8000
# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
# Paste in Bolna dashboard → Webhook URL: https://abc123.ngrok.io/webhook/bolna
```

---

## Project Structure

```
bolna/
├── apps/
│   ├── api/                        # FastAPI Backend
│   │   ├── main.py                 # App entry, CORS, lifespan
│   │   ├── database.py             # SQLite/SQLModel setup
│   │   ├── models.py               # Pydantic + SQLModel schemas
│   │   ├── routers/
│   │   │   ├── appointments.py     # CRUD + Bolna trigger
│   │   │   ├── webhooks.py         # Async webhook receiver
│   │   │   └── analytics.py        # Dashboard statistics
│   │   └── services/
│   │       └── bolna.py            # Bolna API client + phone normaliser
│   │
│   └── web/                        # Next.js Frontend
│       ├── app/
│       │   ├── patient/page.tsx     # Patient intake form
│       │   ├── dashboard/page.tsx   # Admin dashboard + analytics
│       │   ├── appointments/[id]/  # Transcript viewer
│       │   └── api/               # Proxy routes → FastAPI
│       └── components/
│
└── packages/
    └── ui/                         # Shared shadcn/ui components
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/api/appointments` | Create appointment + trigger Bolna call |
| `GET` | `/api/appointments` | List all appointments |
| `GET` | `/api/appointments/{id}` | Get single appointment |
| `POST` | `/api/appointments/{id}/reminder` | Send reminder call |
| `POST` | `/webhook/bolna` | Receive Bolna call status webhook |
| `GET` | `/api/analytics` | Dashboard statistics |

---

## Environment Variables

### Backend (`apps/api/.env`)

```env
BOLNA_API_KEY=your_bolna_api_key
BOLNA_AGENT_ID=your_agent_id
BOLNA_API_URL=https://api.bolna.dev
DATABASE_URL=sqlite:///./appointments.db
CORS_ORIGINS=http://localhost:3000
```

### Frontend (`apps/web/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Bolna Integration

### Triggering a Call

```http
POST https://api.bolna.dev/call
Authorization: Bearer {BOLNA_API_KEY}
{
  "agent_id": "your-agent-id",
  "recipient_phone_number": "+919876543210",
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
  "outcome": "confirmed",
  "duration": 119,
  "transcript": [
    { "role": "agent", "content": "Hello, this is Asha from Apollo HealthLine..." },
    { "role": "patient", "content": "Yes, I'd like to confirm my appointment." }
  ]
}
```

---

## Build & Deploy

### Frontend (Vercel)

```bash
cd apps/web
vercel
# Set NEXT_PUBLIC_API_URL to your backend URL
```

### Backend (Railway)

```bash
cd apps/api
railway init
railway up
# Add environment variables in Railway dashboard
```

---

## Screenshots

| Patient Intake Form | Admin Dashboard |
|---------------------|-----------------|
| ![Patient Form]() | ![Dashboard]() |

| Transcript Viewer | Analytics |
|-------------------|-----------|
| ![Transcript]() | ![Analytics]() |

---

## License

MIT
