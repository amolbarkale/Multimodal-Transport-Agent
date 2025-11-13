from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from crud import vehicle
from schemas import VehicleCreate, VehicleResponse
from backend.database.models import VehicleType

router = APIRouter(prefix="/vehicles", tags=["vehicles"])


@router.post("/", response_model=VehicleResponse, status_code=status.HTTP_201_CREATED)
def create_vehicle(vehicle_data: VehicleCreate, db: Session = Depends(get_db)):
    if vehicle.get_vehicle_by_license_plate(db, vehicle_data.license_plate):
        raise HTTPException(status_code=400, detail="License plate already exists")
    return vehicle.create_vehicle(db, vehicle_data)


@router.get("/", response_model=List[VehicleResponse])
def get_vehicles(
    skip: int = 0, 
    limit: int = 100, 
    vehicle_type: VehicleType = None,
    db: Session = Depends(get_db)
):
    return vehicle.get_vehicles(db, skip=skip, limit=limit, vehicle_type=vehicle_type)


@router.get("/all", response_model=List[VehicleResponse])
def get_all_vehicles(db: Session = Depends(get_db)):
    return vehicle.get_all_vehicles(db)


@router.get("/available", response_model=List[VehicleResponse])
def get_available_vehicles(
    vehicle_type: VehicleType = None,
    db: Session = Depends(get_db)
):
    return vehicle.get_available_vehicles(db, vehicle_type=vehicle_type)


@router.get("/type/{vehicle_type}", response_model=List[VehicleResponse])
def get_vehicles_by_type(vehicle_type: VehicleType, db: Session = Depends(get_db)):
    return vehicle.get_vehicles_by_type(db, vehicle_type)


@router.get("/search", response_model=List[VehicleResponse])
def search_vehicles(
    search_term: str,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    return vehicle.search_vehicles(db, search_term, skip, limit)


@router.get("/capacity", response_model=List[VehicleResponse])
def get_vehicles_by_capacity(
    min_capacity: int,
    max_capacity: int,
    db: Session = Depends(get_db)
):
    return vehicle.get_vehicles_by_capacity_range(db, min_capacity, max_capacity)


@router.get("/status/{status}", response_model=List[VehicleResponse])
def get_vehicles_by_status(status: str, db: Session = Depends(get_db)):
    return vehicle.get_vehicles_by_status(db, status)


@router.get("/count")
def get_vehicle_count(vehicle_type: VehicleType = None, db: Session = Depends(get_db)):
    return {"count": vehicle.get_vehicle_count(db, vehicle_type)}


@router.get("/{vehicle_id}", response_model=VehicleResponse)
def get_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    db_vehicle = vehicle.get_vehicle(db, vehicle_id)
    if not db_vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return db_vehicle


@router.put("/{vehicle_id}", response_model=VehicleResponse)
def update_vehicle(
    vehicle_id: int,
    vehicle_data: VehicleCreate,
    db: Session = Depends(get_db)
):
    db_vehicle = vehicle.update_vehicle(db, vehicle_id, vehicle_data)
    if not db_vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return db_vehicle


@router.delete("/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    if not vehicle.delete_vehicle(db, vehicle_id):
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return None


@router.post("/bulk", response_model=List[VehicleResponse], status_code=status.HTTP_201_CREATED)
def bulk_create_vehicles(vehicles: List[VehicleCreate], db: Session = Depends(get_db)):
    return vehicle.bulk_create_vehicles(db, vehicles)
