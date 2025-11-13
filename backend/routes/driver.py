from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from crud import driver
from schemas import DriverCreate, DriverResponse

router = APIRouter(prefix="/drivers", tags=["drivers"])


@router.post("/", response_model=DriverResponse, status_code=status.HTTP_201_CREATED)
def create_driver(driver_data: DriverCreate, db: Session = Depends(get_db)):
    if driver.check_phone_exists(db, driver_data.phone_number):
        raise HTTPException(status_code=400, detail="Phone number already exists")
    return driver.create_driver(db, driver_data)


@router.get("/", response_model=List[DriverResponse])
def get_drivers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return driver.get_drivers(db, skip=skip, limit=limit)


@router.get("/all", response_model=List[DriverResponse])
def get_all_drivers(db: Session = Depends(get_db)):
    return driver.get_all_drivers(db)


@router.get("/available", response_model=List[DriverResponse])
def get_available_drivers(db: Session = Depends(get_db)):
    return driver.get_available_drivers(db)


@router.get("/search", response_model=List[DriverResponse])
def search_drivers(
    search_term: str,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    return driver.search_drivers(db, search_term, skip, limit)


@router.get("/search/name", response_model=List[DriverResponse])
def search_drivers_by_name(
    name: str,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    return driver.search_drivers_by_name(db, name, skip, limit)


@router.get("/sorted", response_model=List[DriverResponse])
def get_drivers_sorted(
    ascending: bool = True,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    return driver.get_drivers_sorted_by_name(db, ascending, skip, limit)


@router.get("/count")
def get_driver_count(db: Session = Depends(get_db)):
    return {"count": driver.get_driver_count(db)}


@router.get("/{driver_id}", response_model=DriverResponse)
def get_driver(driver_id: int, db: Session = Depends(get_db)):
    db_driver = driver.get_driver(db, driver_id)
    if not db_driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    return db_driver


@router.put("/{driver_id}", response_model=DriverResponse)
def update_driver(
    driver_id: int,
    driver_data: DriverCreate,
    db: Session = Depends(get_db)
):
    if driver.check_phone_exists(db, driver_data.phone_number, exclude_driver_id=driver_id):
        raise HTTPException(status_code=400, detail="Phone number already exists")
    
    db_driver = driver.update_driver(db, driver_id, driver_data)
    if not db_driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    return db_driver


@router.delete("/{driver_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_driver(driver_id: int, db: Session = Depends(get_db)):
    if not driver.delete_driver(db, driver_id):
        raise HTTPException(status_code=404, detail="Driver not found")
    return None


@router.post("/bulk", response_model=List[DriverResponse], status_code=status.HTTP_201_CREATED)
def bulk_create_drivers(drivers: List[DriverCreate], db: Session = Depends(get_db)):
    return driver.bulk_create_drivers(db, drivers)
