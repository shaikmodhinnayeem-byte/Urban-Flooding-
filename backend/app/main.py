# ==============================================================================
# DRAIN-X FASTAPI MAIN APPLICATION ENTRYPOINT (BACKEND ENGINE)
# ==============================================================================
# PURPOSE: This module initializes the central FastAPI web application server,
# configures Cross-Origin Resource Sharing (CORS) for frontend React communications,
# binds dual database sessions (PostgreSQL for Users + SQLite for Domain Digital Twins),
# registers all RESTful API router endpoints, and triggers automatic data seeding on startup.
# ==============================================================================

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.models.schema import init_db, SessionLocal, SecondarySessionLocal
from app.services.data_loader import seed_database

# Import all API router modules supplying microservices to the platform
from app.routers import (
    auth,       # JWT Authentication & PostgreSQL User Management
    areas,      # Chennai Metropolitan Wards & Catchment Areas API
    gis,        # GIS GeoJSON Layers & CartoDEM Elevation Sinks
    rainfall,   # IMD Doppler Radar & Atmospheric Telemetry Ingestion
    sensors,    # IoT Manhole Sensor Network Telemetry Stream API
    drainage,   # Subsurface Conduit & Box Drain Infrastructure Network
    prediction, # Spatiotemporal ML Nowcasting Engine (XGBoost + GBR)
    routes,     # Evacuation Navigation & Safe Route Graph Engine
    alerts,     # Disaster Warnings, Surcharge Alarms & Push Notifications
    rescue,     # NDRF / SDRF / GCC Evacuation Taskforce Command API
    admin,      # Audit Logging, System Health Diagnostics & Config
    simulation, # Cloudburst Scenario Hydrodynamic Stress-Testing Engine
    reports     # Municipal PDF/CSV Disaster Analytics & Export API
)

# ------------------------------------------------------------------------------
# FASTAPI APPLICATION INSTANTIATION
# ------------------------------------------------------------------------------
# Why this code is used: Creates the main ASGI application instance with title,
# version metadata, and automatic OpenAPI Swagger documentation at /docs.
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Smart City Chennai High-Resolution Urban Flood Nowcasting & Early Warning Platform"
)

# ------------------------------------------------------------------------------
# CROSS-ORIGIN RESOURCE SHARING (CORS) MIDDLEWARE CONFIGURATION
# ------------------------------------------------------------------------------
# Why this code is used: Enables cross-origin HTTP requests from Vite frontend
# running on http://localhost:5173 to this FastAPI server running on http://127.0.0.1:8000.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=r".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------------------------------------
# RESTFUL API ROUTER REGISTRATION
# ------------------------------------------------------------------------------
# Why this code is used: Registers modular router endpoints under the central
# API prefix (/api). Each router encapsulates specific domain business logic.
app.include_router(auth.router, prefix=settings.API_PREFIX)        # /api/auth endpoints
app.include_router(areas.router, prefix=settings.API_PREFIX)       # /api/areas endpoints
app.include_router(gis.router, prefix=settings.API_PREFIX)         # /api/gis endpoints
app.include_router(rainfall.router, prefix=settings.API_PREFIX)    # /api/rainfall endpoints
app.include_router(sensors.router, prefix=settings.API_PREFIX)     # /api/sensors endpoints
app.include_router(drainage.router, prefix=settings.API_PREFIX)    # /api/drainage endpoints
app.include_router(prediction.router, prefix=settings.API_PREFIX)  # /api/prediction & nowcast
app.include_router(routes.router, prefix=settings.API_PREFIX)      # /api/routes endpoints
app.include_router(alerts.router, prefix=settings.API_PREFIX)      # /api/alerts endpoints
app.include_router(rescue.router, prefix=settings.API_PREFIX)      # /api/rescue endpoints
app.include_router(admin.router, prefix=settings.API_PREFIX)       # /api/admin endpoints
app.include_router(simulation.router, prefix=settings.API_PREFIX)  # /api/simulation endpoints
app.include_router(reports.router, prefix=settings.API_PREFIX)     # /api/reports endpoints

# ------------------------------------------------------------------------------
# APPLICATION STARTUP EVENT HOOK
# ------------------------------------------------------------------------------
# Why this code is used: Executes once when the Uvicorn server starts.
# Automatically creates database tables (PostgreSQL for Users, SQLite for domain models)
# and populates seed data for Chennai wards, roads, sensors, and rescue teams.
@app.on_event("startup")
def startup_event():
    print("[INFO] Initializing DRAIN-X PostgreSQL Database & Datasets...")
    init_db()  # Ensures tables are created if missing
    pg_db = SessionLocal()            # Dual-engine session bound to PostgreSQL
    secondary_db = SecondarySessionLocal()  # Dual-engine session bound to SQLite
    try:
        # Populate initial users in primary Neon PostgreSQL database
        seed_database(pg_db)
        # Populate initial GIS boundaries, sensors, roads, and rescue teams
        seed_database(secondary_db)
    except Exception as e:
        print(f"[INFO] Database seed status: {e}")
    finally:
        # Guarantee database connections are gracefully returned to connection pool
        pg_db.close()
        secondary_db.close()
    print("[INFO] DRAIN-X System is LIVE and ready!")

# ------------------------------------------------------------------------------
# ROOT SYSTEM HEALTH ENDPOINT
# ------------------------------------------------------------------------------
# Why this code is used: Provides a lightweight ping endpoint for load balancers
# and monitoring tools to check system uptime and API docs location.
@app.get("/")
@app.get("/health")
def root_status():
    return {
        "system": "DRAIN-X Chennai Urban Flood Nowcasting System",
        "status": "ONLINE",
        "lead_time": "0 - 3 Hours",
        "version": settings.VERSION,
        "docs_url": "/docs"
    }
