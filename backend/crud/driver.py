"""
CRUD operations for Driver model
"""
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.database.models import Driver
from schemas import DriverCreate, DriverResponse


def create_driver(db: Session, driver: DriverCreate) -> Driver:
    """
    Create a new driver in the database.
    
    Args:
        db: Database session
        driver: DriverCreate schema with driver details
        
    Returns:
        Created Driver object
    """
    db_driver = Driver(
        name=driver.name,
        phone_number=driver.phone_number
    )
    db.add(db_driver)
    db.commit()
    db.refresh(db_driver)
    return db_driver


def get_driver(db: Session, driver_id: int) -> Optional[Driver]:
    """
    Get a driver by ID.
    
    Args:
        db: Database session
        driver_id: ID of the driver to retrieve
        
    Returns:
        Driver object if found, None otherwise
    """
    return db.query(Driver).filter(Driver.driver_id == driver_id).first()


def get_driver_by_phone(db: Session, phone_number: str) -> Optional[Driver]:
    """
    Get a driver by phone number.
    
    Args:
        db: Database session
        phone_number: Phone number of the driver
        
    Returns:
        Driver object if found, None otherwise
    """
    return db.query(Driver).filter(Driver.phone_number == phone_number).first()


def get_drivers(
    db: Session, 
    skip: int = 0, 
    limit: int = 100
) -> List[Driver]:
    """
    Get all drivers with pagination.
    
    Args:
        db: Database session
        skip: Number of records to skip (for pagination)
        limit: Maximum number of records to return
        
    Returns:
        List of Driver objects
    """
    return db.query(Driver).offset(skip).limit(limit).all()


def get_all_drivers(db: Session) -> List[Driver]:
    """
    Get all drivers without pagination.
    
    Args:
        db: Database session
        
    Returns:
        List of all Driver objects
    """
    return db.query(Driver).all()


def get_available_drivers(db: Session) -> List[Driver]:
    """
    Get all drivers that are not currently deployed (not assigned to any trip).
    This would need to be joined with Deployment table to check availability.
    For now, returns all drivers - can be enhanced later.
    
    Args:
        db: Database session
        
    Returns:
        List of available Driver objects
    """
    # TODO: Add logic to check deployments and filter out assigned drivers
    return db.query(Driver).all()


def update_driver(
    db: Session, 
    driver_id: int, 
    driver_update: DriverCreate
) -> Optional[Driver]:
    """
    Update an existing driver.
    
    Args:
        db: Database session
        driver_id: ID of the driver to update
        driver_update: DriverCreate schema with updated details
        
    Returns:
        Updated Driver object if found, None otherwise
    """
    db_driver = db.query(Driver).filter(Driver.driver_id == driver_id).first()
    
    if db_driver:
        db_driver.name = driver_update.name
        db_driver.phone_number = driver_update.phone_number
        
        db.commit()
        db.refresh(db_driver)
    
    return db_driver


def partial_update_driver(
    db: Session,
    driver_id: int,
    name: Optional[str] = None,
    phone_number: Optional[str] = None
) -> Optional[Driver]:
    """
    Partially update a driver (update only provided fields).
    
    Args:
        db: Database session
        driver_id: ID of the driver to update
        name: Optional new name
        phone_number: Optional new phone number
        
    Returns:
        Updated Driver object if found, None otherwise
    """
    db_driver = db.query(Driver).filter(Driver.driver_id == driver_id).first()
    
    if db_driver:
        if name is not None:
            db_driver.name = name
        if phone_number is not None:
            db_driver.phone_number = phone_number
        
        db.commit()
        db.refresh(db_driver)
    
    return db_driver


def delete_driver(db: Session, driver_id: int) -> bool:
    """
    Delete a driver by ID.
    
    Args:
        db: Database session
        driver_id: ID of the driver to delete
        
    Returns:
        True if deleted successfully, False if not found
    """
    db_driver = db.query(Driver).filter(Driver.driver_id == driver_id).first()
    
    if db_driver:
        db.delete(db_driver)
        db.commit()
        return True
    
    return False


def get_driver_count(db: Session) -> int:
    """
    Get the total count of drivers.
    
    Args:
        db: Database session
        
    Returns:
        Total count of drivers
    """
    return db.query(Driver).count()


def search_drivers(
    db: Session, 
    search_term: str,
    skip: int = 0,
    limit: int = 100
) -> List[Driver]:
    """
    Search drivers by name or phone number (partial match).
    
    Args:
        db: Database session
        search_term: Search string to match against name or phone
        skip: Number of records to skip
        limit: Maximum number of records to return
        
    Returns:
        List of matching Driver objects
    """
    return db.query(Driver)\
        .filter(
            (Driver.name.ilike(f"%{search_term}%")) | 
            (Driver.phone_number.ilike(f"%{search_term}%"))
        )\
        .offset(skip)\
        .limit(limit)\
        .all()


def search_drivers_by_name(
    db: Session,
    name: str,
    skip: int = 0,
    limit: int = 100
) -> List[Driver]:
    """
    Search drivers by name only (partial match).
    
    Args:
        db: Database session
        name: Name to search for
        skip: Number of records to skip
        limit: Maximum number of records to return
        
    Returns:
        List of matching Driver objects
    """
    return db.query(Driver)\
        .filter(Driver.name.ilike(f"%{name}%"))\
        .offset(skip)\
        .limit(limit)\
        .all()


def check_driver_exists(db: Session, driver_id: int) -> bool:
    """
    Check if a driver exists by ID.
    
    Args:
        db: Database session
        driver_id: ID of the driver to check
        
    Returns:
        True if driver exists, False otherwise
    """
    return db.query(Driver).filter(Driver.driver_id == driver_id).count() > 0


def check_phone_exists(db: Session, phone_number: str, exclude_driver_id: Optional[int] = None) -> bool:
    """
    Check if a phone number already exists in the database.
    Useful for validation before creating/updating drivers.
    
    Args:
        db: Database session
        phone_number: Phone number to check
        exclude_driver_id: Optional driver ID to exclude from check (for updates)
        
    Returns:
        True if phone number exists, False otherwise
    """
    query = db.query(Driver).filter(Driver.phone_number == phone_number)
    
    if exclude_driver_id:
        query = query.filter(Driver.driver_id != exclude_driver_id)
    
    return query.count() > 0


def bulk_create_drivers(db: Session, drivers: List[DriverCreate]) -> List[Driver]:
    """
    Create multiple drivers at once.
    
    Args:
        db: Database session
        drivers: List of DriverCreate schemas
        
    Returns:
        List of created Driver objects
    """
    db_drivers = [
        Driver(
            name=driver.name,
            phone_number=driver.phone_number
        )
        for driver in drivers
    ]
    
    db.add_all(db_drivers)
    db.commit()
    
    for driver in db_drivers:
        db.refresh(driver)
    
    return db_drivers


def get_drivers_sorted_by_name(
    db: Session,
    ascending: bool = True,
    skip: int = 0,
    limit: int = 100
) -> List[Driver]:
    """
    Get drivers sorted by name.
    
    Args:
        db: Database session
        ascending: Sort in ascending order if True, descending if False
        skip: Number of records to skip
        limit: Maximum number of records to return
        
    Returns:
        List of Driver objects sorted by name
    """
    query = db.query(Driver)
    
    if ascending:
        query = query.order_by(Driver.name.asc())
    else:
        query = query.order_by(Driver.name.desc())
    
    return query.offset(skip).limit(limit).all()
