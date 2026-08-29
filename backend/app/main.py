from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.models.schema import init_db, SessionLocal
from app.services.data_loader import seed_database
from app.routers import (
    auth, areas, gis, rainfall, sensors, drainage,
    prediction, routes, alerts, rescue, admin, simulation, reports
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Smart City Chennai High-Resolution Urban Flood Nowcasting & Early Warning Platform"
)

# CORS middleware for Frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include All Routers under settings.API_PREFIX
app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(areas.router, prefix=settings.API_PREFIX)
app.include_router(gis.router, prefix=settings.API_PREFIX)
app.include_router(rainfall.router, prefix=settings.API_PREFIX)
app.include_router(sensors.router, prefix=settings.API_PREFIX)
app.include_router(drainage.router, prefix=settings.API_PREFIX)
app.include_router(prediction.router, prefix=settings.API_PREFIX)
app.include_router(routes.router, prefix=settings.API_PREFIX)
app.include_router(alerts.router, prefix=settings.API_PREFIX)
app.include_router(rescue.router, prefix=settings.API_PREFIX)
app.include_router(admin.router, prefix=settings.API_PREFIX)
app.include_router(simulation.router, prefix=settings.API_PREFIX)
app.include_router(reports.router, prefix=settings.API_PREFIX)

@app.on_event("startup")
def startup_event():
    print("[INFO] Initializing DRAIN-X Database & Seeding Datasets...")
    init_db()
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    print("[INFO] DRAIN-X System is LIVE and ready!")

@app.get("/")
def root_status():
    return {
        "system": "DRAIN-X Chennai Urban Flood Nowcasting System",
        "status": "ONLINE",
        "lead_time": "0 - 3 Hours",
        "version": settings.VERSION,
        "docs_url": "/docs"
    }
