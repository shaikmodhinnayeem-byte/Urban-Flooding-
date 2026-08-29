from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.models.schema import Alert, AuditLog, get_db
from app.schemas.dto import AlertCreate, AlertOut
from app.core.security import get_current_user, require_admin, User

router = APIRouter(prefix="/alerts", tags=["Emergency Alerts"])

@router.get("", response_model=List[AlertOut])
def get_alerts(area_id: int = None, active_only: bool = False, db: Session = Depends(get_db)):
    query = db.query(Alert)
    if area_id:
        query = query.filter(Alert.area_id == area_id)
    if active_only:
        query = query.filter(Alert.is_active == True)
    return query.order_by(Alert.created_at.desc()).all()

@router.post("", response_model=AlertOut)
def create_manual_alert(
    alert_in: AlertCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    new_alert = Alert(
        title=alert_in.title,
        description=alert_in.description,
        severity=alert_in.severity,
        area_id=alert_in.area_id,
        alert_type=alert_in.alert_type,
        is_active=True,
        is_acknowledged=False
    )
    db.add(new_alert)
    db.add(AuditLog(
        username=current_user.email,
        action="MANUAL_ALERT_BROADCAST",
        severity=alert_in.severity,
        details=f"Dispatched alert '{alert_in.title}' for Ward/Area {alert_in.area_id}"
    ))
    db.commit()
    db.refresh(new_alert)
    return new_alert

@router.patch("/{alert_id}/acknowledge", response_model=AlertOut)
def acknowledge_alert(alert_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.is_acknowledged = True
    db.commit()
    db.refresh(alert)
    return alert
