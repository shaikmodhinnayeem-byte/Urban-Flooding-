from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from app.models.schema import RainfallRecord, Area, get_db
from app.schemas.dto import RainfallOut
from app.services.live_weather_service import fetch_live_weather

router = APIRouter(prefix="/rainfall", tags=["Rainfall & IMD Radar"])

@router.get("/current", response_model=List[RainfallOut])
def get_current_rainfall(db: Session = Depends(get_db)):
    return db.query(RainfallRecord).all()

@router.get("/live-weather")
def get_live_weather(
    area_id: int = Query(default=1, description="Selected Chennai Ward ID"),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    area = db.query(Area).filter(Area.id == area_id).first()
    lat = area.center_lat if area else 13.0827
    lng = area.center_lng if area else 80.2707
    area_name = area.name if area else "Chennai Metro"

    live_data = fetch_live_weather(lat=lat, lng=lng, area_name=area_name)
    
    # Enrich with area record
    rec = db.query(RainfallRecord).filter(RainfallRecord.area_id == area_id).first()
    if rec:
        live_data["radar_reflectivity_dbz"] = rec.radar_reflectivity_dbz
        live_data["simulated_storm_intensity_mm_hr"] = rec.intensity_mm_hr
        live_data["imd_station_code"] = rec.imd_station_code
    else:
        live_data["radar_reflectivity_dbz"] = 36.0
        live_data["simulated_storm_intensity_mm_hr"] = 24.0
        live_data["imd_station_code"] = "IMD-DWR-CHENNAI"

    return live_data

@router.get("/radar-nowcast/{area_id}")
def get_radar_nowcast(area_id: int, db: Session = Depends(get_db)) -> Dict[str, Any]:
    record = db.query(RainfallRecord).filter(RainfallRecord.area_id == area_id).first()
    area = db.query(Area).filter(Area.id == area_id).first()
    
    intensity = record.intensity_mm_hr if record else 24.0
    radar_dbz = record.radar_reflectivity_dbz if record else 36.0
    
    # 0-3 hour temporal forecast curve
    forecast_timeline = [
        {"lead_time": "+00m (NOW)", "intensity_mm_hr": intensity, "dbz": radar_dbz, "risk": "NORMAL" if intensity < 20 else "WATCH"},
        {"lead_time": "+30m", "intensity_mm_hr": round(intensity * 1.3, 1), "dbz": round(radar_dbz + 4, 1), "risk": "WATCH" if intensity < 35 else "WARNING"},
        {"lead_time": "+60m (1h)", "intensity_mm_hr": round(intensity * 1.8, 1), "dbz": round(radar_dbz + 8, 1), "risk": "WARNING" if intensity < 50 else "CRITICAL"},
        {"lead_time": "+120m (2h)", "intensity_mm_hr": round(intensity * 1.5, 1), "dbz": round(radar_dbz + 6, 1), "risk": "WARNING"},
        {"lead_time": "+180m (3h)", "intensity_mm_hr": round(intensity * 0.9, 1), "dbz": round(radar_dbz - 2, 1), "risk": "WATCH"},
    ]
    
    return {
        "area_name": area.name if area else "Chennai Metro",
        "station_code": record.imd_station_code if record else "IMD-DWR-CHENNAI",
        "current_intensity_mm_hr": intensity,
        "radar_reflectivity_dbz": radar_dbz,
        "echo_top_km": 12.4,
        "storm_motion_dir": "WNW (290°)",
        "storm_speed_kmh": 22.0,
        "convective_available_potential_energy_cape": 2450,
        "forecast_timeline": forecast_timeline
    }
