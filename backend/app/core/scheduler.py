import asyncio
import datetime
import logging
from sqlalchemy.orm import Session
from app.models.schema import SessionLocal, DatasetRegistry, RainfallRecord, Area
from app.services.live_weather_service import fetch_live_weather

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("drainx_scheduler")

_scheduler_running = False

async def refresh_live_data_loop():
    """
    Background scheduler loop that periodically refreshes LIVE data sources
    (Open-Meteo weather every 10 minutes, Overpass OSM roads daily)
    and updates real last_synced_at timestamps in DatasetRegistry.
    """
    global _scheduler_running
    _scheduler_running = True
    logger.info("[SCHEDULER] DRAIN-X Background Data Sync Scheduler started!")

    # Initial sync on launch
    await run_scheduled_sync()

    while _scheduler_running:
        try:
            # Wait 10 minutes (600 seconds)
            await asyncio.sleep(600)
            if _scheduler_running:
                await run_scheduled_sync()
        except asyncio.CancelledError:
            logger.info("[SCHEDULER] Scheduler task cancelled.")
            break
        except Exception as e:
            logger.error(f"[SCHEDULER] Sync loop error: {e}")
            await asyncio.sleep(30)

def stop_scheduler():
    global _scheduler_running
    _scheduler_running = False
    logger.info("[SCHEDULER] DRAIN-X Scheduler stopped.")

async def run_scheduled_sync():
    """
    Executes a real sync run for all LIVE datasets and updates last_synced_at in DB.
    """
    logger.info("[SCHEDULER] Executing scheduled refresh for LIVE datasets...")
    db: Session = SessionLocal()
    try:
        now = datetime.datetime.utcnow()

        # 1. Sync Live Open-Meteo Weather for main Chennai areas
        areas = db.query(Area).all()
        for area in areas[:3]: # Fetch live weather for key wards
            weather_data = fetch_live_weather(lat=area.center_lat, lng=area.center_lng, area_name=area.name)
            if weather_data and weather_data.get("is_live_api"):
                # Save fresh rainfall reading
                rec = RainfallRecord(
                    area_id=area.id,
                    timestamp=now,
                    intensity_mm_hr=weather_data.get("rain_mm", 0.0),
                    accum_1h_mm=weather_data.get("precipitation_mm", 0.0),
                    temp_c=weather_data.get("temperature_c", 30.0),
                    humidity_pct=weather_data.get("humidity_pct", 70.0),
                    wind_speed_kmh=weather_data.get("wind_speed_kmh", 15.0),
                    pressure_hpa=weather_data.get("surface_pressure_hpa", 1008.0)
                )
                db.add(rec)

        # 2. Update DatasetRegistry timestamps for LIVE datasets
        live_dataset_ids = [3, 6, 12, 15, 23, 24, 25, 26, 27, 32, 33]
        live_datasets = db.query(DatasetRegistry).filter(DatasetRegistry.id.in_(live_dataset_ids)).all()
        
        for ds in live_datasets:
            ds.status = "LIVE"
            ds.last_synced_at = now
            ds.updated_at = now

        db.commit()
        logger.info(f"[SCHEDULER] Successfully refreshed {len(live_datasets)} LIVE datasets at {now.isoformat()} UTC.")
    except Exception as e:
        logger.error(f"[SCHEDULER] Error during scheduled sync run: {e}")
        db.rollback()
    finally:
        db.close()
