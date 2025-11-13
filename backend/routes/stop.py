from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from crud import stop
from schemas import StopCreate, StopResponse

router = APIRouter(prefix="/stops", tags=["stops"])


@router.post("/", response_model=StopResponse, status_code=status.HTTP_201_CREATED)
def create_stop(stop_data: StopCreate, db: Session = Depends(get_db)):
    return stop.create_stop(db, stop_data)


@router.get("/", response_model=List[StopResponse])
def get_stops(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return stop.get_stops(db, skip=skip, limit=limit)


@router.get("/all", response_model=List[StopResponse])
def get_all_stops(db: Session = Depends(get_db)):
    return stop.get_all_stops(db)


@router.get("/search", response_model=List[StopResponse])
def search_stops(
    search_term: str,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    return stop.search_stops(db, search_term, skip, limit)


@router.get("/sorted", response_model=List[StopResponse])
def get_stops_sorted(
    ascending: bool = True,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    return stop.get_stops_sorted_by_name(db, ascending, skip, limit)


@router.get("/location", response_model=List[StopResponse])
def get_stops_by_location(
    min_lat: float,
    max_lat: float,
    min_lng: float,
    max_lng: float,
    db: Session = Depends(get_db)
):
    return stop.get_stops_by_location(db, min_lat, max_lat, min_lng, max_lng)


@router.get("/count")
def get_stop_count(db: Session = Depends(get_db)):
    return {"count": stop.get_stop_count(db)}


@router.get("/{stop_id}", response_model=StopResponse)
def get_stop(stop_id: int, db: Session = Depends(get_db)):
    db_stop = stop.get_stop(db, stop_id)
    if not db_stop:
        raise HTTPException(status_code=404, detail="Stop not found")
    return db_stop


@router.put("/{stop_id}", response_model=StopResponse)
def update_stop(
    stop_id: int,
    stop_data: StopCreate,
    db: Session = Depends(get_db)
):
    db_stop = stop.update_stop(db, stop_id, stop_data)
    if not db_stop:
        raise HTTPException(status_code=404, detail="Stop not found")
    return db_stop


@router.delete("/{stop_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_stop(stop_id: int, db: Session = Depends(get_db)):
    if not stop.delete_stop(db, stop_id):
        raise HTTPException(status_code=404, detail="Stop not found")
    return None


@router.post("/bulk", response_model=List[StopResponse], status_code=status.HTTP_201_CREATED)
def bulk_create_stops(stops: List[StopCreate], db: Session = Depends(get_db)):
    return stop.bulk_create_stops(db, stops)
