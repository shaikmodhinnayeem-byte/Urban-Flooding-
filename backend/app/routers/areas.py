from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.models.schema import Area, get_db
from app.schemas.dto import AreaOut

router = APIRouter(prefix="/areas", tags=["Areas & Wards"])

@router.get("", response_model=List[AreaOut])
def get_all_areas(db: Session = Depends(get_db)):
    return db.query(Area).all()

@router.get("/{area_id}", response_model=AreaOut)
def get_area_by_id(area_id: int, db: Session = Depends(get_db)):
    area = db.query(Area).filter(Area.id == area_id).first()
    if not area:
        raise HTTPException(status_code=404, detail="Chennai Ward/Area not found")
    return area
