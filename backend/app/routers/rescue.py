from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.models.schema import RescueTeam, RescueTask, AuditLog, get_db
from app.schemas.dto import RescueTeamOut, RescueTaskOut, RescueTaskCreate
from app.core.security import require_rescue_or_admin, User

router = APIRouter(prefix="/rescue", tags=["Rescue Operations & Dispatch"])

@router.get("/teams", response_model=List[RescueTeamOut])
def get_rescue_teams(db: Session = Depends(get_db)):
    return db.query(RescueTeam).all()

@router.get("/tasks", response_model=List[RescueTaskOut])
def get_rescue_tasks(db: Session = Depends(get_db)):
    return db.query(RescueTask).order_by(RescueTask.created_at.desc()).all()

@router.post("/tasks", response_model=RescueTaskOut)
def create_rescue_task(
    task_in: RescueTaskCreate,
    current_user: User = Depends(require_rescue_or_admin),
    db: Session = Depends(get_db)
):
    new_task = RescueTask(
        title=task_in.title,
        area_id=task_in.area_id,
        priority=task_in.priority,
        target_lat=task_in.target_lat,
        target_lng=task_in.target_lng,
        location_name=task_in.location_name,
        water_depth_cm=task_in.water_depth_cm,
        stranded_count=task_in.stranded_count,
        instructions=task_in.instructions,
        assigned_team_id=task_in.assigned_team_id,
        task_status="ASSIGNED" if task_in.assigned_team_id else "PENDING"
    )
    db.add(new_task)
    
    if task_in.assigned_team_id:
        team = db.query(RescueTeam).filter(RescueTeam.id == task_in.assigned_team_id).first()
        if team:
            team.status = "DISPATCHED"
            
    db.add(AuditLog(
        username=current_user.email,
        action="DISPATCH_RESCUE_TASK",
        severity=task_in.priority,
        details=f"Dispatched task '{task_in.title}' at {task_in.location_name}"
    ))
    
    db.commit()
    db.refresh(new_task)
    return new_task

@router.patch("/tasks/{task_id}/status", response_model=RescueTaskOut)
def update_task_status(
    task_id: int,
    status_str: str,
    current_user: User = Depends(require_rescue_or_admin),
    db: Session = Depends(get_db)
):
    task = db.query(RescueTask).filter(RescueTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Rescue task not found")
    task.task_status = status_str.upper()
    if status_str.upper() == "COMPLETED" and task.assigned_team_id:
        team = db.query(RescueTeam).filter(RescueTeam.id == task.assigned_team_id).first()
        if team:
            team.status = "AVAILABLE"
            
    db.commit()
    db.refresh(task)
    return task
