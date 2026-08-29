import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any
from app.models.schema import Area, Road, DrainNode, DrainSegment, RainfallRecord, Alert, RescueTask, get_db

router = APIRouter(prefix="/reports", tags=["Reports & Analytics"])

@router.get("/ward-summary/{area_id}")
def get_ward_report(area_id: int, db: Session = Depends(get_db)) -> Dict[str, Any]:
    area = db.query(Area).filter(Area.id == area_id).first()
    roads = db.query(Road).filter(Road.area_id == area_id).all()
    nodes = db.query(DrainNode).filter(DrainNode.area_id == area_id).all()
    rain = db.query(RainfallRecord).filter(RainfallRecord.area_id == area_id).first()
    alerts = db.query(Alert).filter(Alert.area_id == area_id).all()
    
    return {
        "report_id": f"REP-CHN-WD{area.ward_number if area else '00'}-{datetime.datetime.utcnow().strftime('%Y%m%d%H%M')}",
        "generated_at": datetime.datetime.utcnow().isoformat(),
        "area_name": area.name if area else "Chennai Ward",
        "zone_number": area.zone_number if area else 13,
        "population_at_risk": area.population if area else 0,
        "impervious_surface_ratio": area.impervious_ratio if area else 0.85,
        "current_rainfall_intensity_mm_hr": rain.intensity_mm_hr if rain else 0,
        "accum_3h_rainfall_mm": rain.accum_3h_mm if rain else 0,
        "total_monitored_streets": len(roads),
        "inundated_streets_count": sum(1 for r in roads if r.current_water_depth_cm > 15.0),
        "max_street_water_depth_cm": max((r.current_water_depth_cm for r in roads), default=0),
        "surcharged_manholes_count": sum(1 for n in nodes if n.status in ["SURCHARGE", "OVERFLOW"]),
        "active_disaster_warnings": len([a for a in alerts if a.is_active]),
        "recommended_action": "Deploy mobile high-capacity dewatering units to Vijayanagar Underpass; alert traffic police for diversions via 100ft corridor."
    }
