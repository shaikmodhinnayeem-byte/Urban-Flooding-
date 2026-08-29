from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.models.schema import DrainNode, DrainSegment, get_db
from app.schemas.dto import DrainNodeOut, DrainSegmentOut
from app.services.hydraulic_solver import HydraulicSolver

router = APIRouter(prefix="/drainage", tags=["Drainage & Hydraulic Capacity"])

@router.get("/nodes", response_model=List[DrainNodeOut])
def get_drain_nodes(area_id: int = None, db: Session = Depends(get_db)):
    query = db.query(DrainNode)
    if area_id:
        query = query.filter(DrainNode.area_id == area_id)
    return query.all()

@router.get("/segments", response_model=List[DrainSegmentOut])
def get_drain_segments(db: Session = Depends(get_db)):
    return db.query(DrainSegment).all()

@router.post("/calculate-capacity")
def calculate_custom_pipe_capacity(
    diameter_m: float = 2.0,
    slope_pct: float = 0.25,
    manning_n: float = 0.015,
    debris_blockage_pct: float = 10.0
) -> Dict[str, Any]:
    result = HydraulicSolver.calculate_pipe_capacity(
        diameter_m=diameter_m,
        slope_pct=slope_pct,
        manning_n=manning_n,
        blockage_pct=debris_blockage_pct
    )
    return result

@router.get("/network-health-summary")
def get_network_health(db: Session = Depends(get_db)) -> Dict[str, Any]:
    segments = db.query(DrainSegment).all()
    nodes = db.query(DrainNode).all()
    
    total_capacity_m3s = sum(s.design_capacity_m3s for s in segments)
    current_flow_m3s = sum(s.current_flow_m3s for s in segments)
    avg_utilization = (current_flow_m3s / max(total_capacity_m3s, 1.0)) * 100.0
    
    surcharged_nodes = [n.node_code for n in nodes if n.status == "SURCHARGE"]
    backflow_nodes = [n.node_code for n in nodes if n.status == "BACKFLOW"]
    overflow_segments = [s.segment_code for s in segments if s.condition_status == "OVERFLOW"]
    
    return {
        "total_drain_conduits": len(segments),
        "total_manhole_nodes": len(nodes),
        "network_design_capacity_m3s": round(total_capacity_m3s, 1),
        "total_current_discharge_m3s": round(current_flow_m3s, 1),
        "system_wide_capacity_utilization_pct": round(avg_utilization, 1),
        "surcharged_manholes_count": len(surcharged_nodes),
        "surcharged_manholes": surcharged_nodes,
        "backflow_nodes": backflow_nodes,
        "overflowing_conduits": overflow_segments,
        "critical_outfall_status": "Buckingham Canal High Water Level Surcharge Watch"
    }
