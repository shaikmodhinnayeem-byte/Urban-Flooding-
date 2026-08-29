from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models.schema import Road, get_db
from app.schemas.dto import RouteRequest, RouteResponse
from app.services.route_engine import route_engine

router = APIRouter(prefix="/routes", tags=["Safe Route Navigation"])

@router.post("/calculate", response_model=RouteResponse)
def calculate_flood_safe_route(req: RouteRequest, db: Session = Depends(get_db)):
    roads = db.query(Road).all()
    roads_dicts = [
        {
            "id": r.id,
            "name": r.name,
            "start_lat": r.start_lat,
            "start_lng": r.start_lng,
            "end_lat": r.end_lat,
            "end_lng": r.end_lng,
            "length_km": r.length_km,
            "current_water_depth_cm": r.current_water_depth_cm,
            "predicted_depth_1h_cm": r.predicted_depth_1h_cm,
            "passability_status": r.passability_status
        }
        for r in roads
    ]
    
    result = route_engine.solve_flood_safe_route(
        origin_lat=req.origin_lat,
        origin_lng=req.origin_lng,
        dest_lat=req.dest_lat,
        dest_lng=req.dest_lng,
        roads=roads_dicts,
        vehicle_type=req.vehicle_type
    )
    return result
