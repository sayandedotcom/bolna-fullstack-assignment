import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from database import create_db_and_tables
from routers.appointments import router as appointments_router
from routers.webhooks import router as webhooks_router
from routers.analytics import router as analytics_router

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
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

app.include_router(appointments_router)
app.include_router(webhooks_router)
app.include_router(analytics_router)


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "apollo-healthline-api"}