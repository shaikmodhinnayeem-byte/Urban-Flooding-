from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from app.models.schema import Road, Area, RainfallRecord, DrainSegment, Sensor, get_db
from app.services.ml_prediction_service import nowcast_ml_service

router = APIRouter(prefix="/prediction", tags=["AI / Deep Learning Nowcast"])

@router.get("/nowcast/{area_id}")
def get_area_nowcast(area_id: int, db: Session = Depends(get_db)) -> Dict[str, Any]:
    area = db.query(Area).filter(Area.id == area_id).first()
    if not area:
        raise HTTPException(status_code=404, detail="Area not found")
        
    rain_rec = db.query(RainfallRecord).filter(RainfallRecord.area_id == area_id).first()
    intensity = rain_rec.intensity_mm_hr if rain_rec else 25.0
    accum_3h = rain_rec.accum_3h_mm if rain_rec else 45.0
    radar_dbz = rain_rec.radar_reflectivity_dbz if rain_rec else 36.0
    
    roads = db.query(Road).filter(Road.area_id == area_id).all()
    
    # Calculate nowcast timeline for each street
    street_nowcasts = []
    for r in roads:
        nowcast = nowcast_ml_service.predict_nowcast_timeline(
            current_rainfall_mm_hr=intensity,
            accum_3h_mm=accum_3h,
            radar_dbz=radar_dbz,
            elevation_m=r.elevation_m,
            slope_deg=0.4,
            impervious_ratio=area.impervious_ratio,
            drain_utilization_pct=65.0,
            water_level_m=1.2,
            street_name=r.name
        )
        street_nowcasts.append({
            "road_id": r.id,
            "road_name": r.name,
            "elevation_m": r.elevation_m,
            "passability_status": r.passability_status,
            "is_critical_route": r.is_critical_route,
            "nowcast_data": nowcast
        })

    # Summary metrics across area
    max_predicted_depth = max((r.predicted_depth_3h_cm for r in roads), default=0.0)
    high_risk_count = sum(1 for r in roads if r.predicted_depth_3h_cm > 40.0)
    
    return {
        "area_id": area_id,
        "area_name": area.name,
        "current_rainfall_mm_hr": intensity,
        "radar_reflectivity_dbz": radar_dbz,
        "max_predicted_flood_depth_3h_cm": max_predicted_depth,
        "high_risk_streets_count": high_risk_count,
        "model_version": nowcast_ml_service.model_version,
        "lead_time_window": "0 - 180 Minutes (Lead step +30m)",
        "street_nowcasts": street_nowcasts
    }
