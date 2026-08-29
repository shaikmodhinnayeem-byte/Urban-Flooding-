from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any
from app.models.schema import get_db
from app.schemas.dto import SimulationEvent
from app.services.simulation_manager import simulation_manager

router = APIRouter(prefix="/simulation", tags=["Live Simulation Engine"])

@router.post("/trigger")
def trigger_scenario(event: SimulationEvent, db: Session = Depends(get_db)) -> Dict[str, Any]:
    result = simulation_manager.apply_scenario(
        db=db,
        scenario_type=event.scenario_type,
        custom_rainfall=event.custom_rainfall_mm_hr
    )
    return result

@router.post("/reset")
def reset_simulation(db: Session = Depends(get_db)) -> Dict[str, Any]:
    result = simulation_manager.apply_scenario(
        db=db,
        scenario_type="NORMAL"
    )
    return {
        "status": "RESET_SUCCESS",
        "message": "System state restored to baseline calm weather."
    }
