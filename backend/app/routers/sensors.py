from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.models.schema import Sensor, SensorReading, get_db
from app.schemas.dto import SensorOut, SensorReadingOut

router = APIRouter(prefix="/sensors", tags=["IoT Sensors"])

@router.get("", response_model=List[SensorOut])
def get_sensors(area_id: int = None, db: Session = Depends(get_db)):
    query = db.query(Sensor)
    if area_id:
        query = query.filter(Sensor.area_id == area_id)
    return query.all()

@router.get("/{sensor_id}", response_model=SensorOut)
def get_sensor(sensor_id: int, db: Session = Depends(get_db)):
    sensor = db.query(Sensor).filter(Sensor.id == sensor_id).first()
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor node not found")
    return sensor

@router.get("/{sensor_id}/readings", response_model=List[SensorReadingOut])
def get_sensor_readings(sensor_id: int, db: Session = Depends(get_db)):
    return db.query(SensorReading).filter(SensorReading.sensor_id == sensor_id).order_by(SensorReading.timestamp.desc()).limit(20).all()
