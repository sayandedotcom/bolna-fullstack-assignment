import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./appointments.db")


@asynccontextmanager
async def lifespan(app: FastAPI):
    from sqlmodel import SQLModel, create_engine
    engine = create_engine(DATABASE_URL, echo=False, connect_args={"check_same_thread": False})
    SQLModel.metadata.create_all(engine)
    yield


app = FastAPI(
    title="Apollo HealthLine API",
    description="Backend API for Apollo HealthLine Voice AI Scheduling Agent",
    version="1.0.0",
    lifespan=lifespan,
)

CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from routers.appointments import router as appointments_router
from routers.webhooks import router as webhooks_router
from routers.analytics import router as analytics_router

app.include_router(appointments_router)
app.include_router(webhooks_router)
app.include_router(analytics_router)


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "apollo-healthline-api"}