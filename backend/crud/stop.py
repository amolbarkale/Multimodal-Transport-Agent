"""
CRUD operations for Stop model
"""
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.database.models import Stop
from schemas import StopCreate, StopResponse


def create_stop(db: Session, stop: StopCreate) -> Stop:
    """
    Create a new stop in the database.
    
    Args:
        db: Database session
        stop: StopCreate schema with stop details
        
    Returns:
        Created Stop object
    """
    db_stop = Stop(
        name=stop.name,
        latitude=stop.latitude,
        longitude=stop.longitude
    )
    db.add(db_stop)
    db.commit()
    db.refresh(db_stop)
    return db_stop


def get_stop(db: Session, stop_id: int) -> Optional[Stop]:
    """
    Get a stop by ID.
    
    Args:
        db: Database session
        stop_id: ID of the stop to retrieve
        
    Returns:
        Stop object if found, None otherwise
    """
    return db.query(Stop).filter(Stop.stop_id == stop_id).first()


def get_stop_by_name(db: Session, name: str) -> Optional[Stop]:
    """
    Get a stop by exact name.
    
    Args:
        db: Database session
        name: Name of the stop
        
    Returns:
        Stop object if found, None otherwise
    """
    return db.query(Stop).filter(Stop.name == name).first()


def get_stops(
    db: Session, 
    skip: int = 0, 
    limit: int = 100
) -> List[Stop]:
    """
    Get all stops with pagination.
    
    Args:
        db: Database session
        skip: Number of records to skip (for pagination)
        limit: Maximum number of records to return
        
    Returns:
        List of Stop objects
    """
    return db.query(Stop).offset(skip).limit(limit).all()


def get_all_stops(db: Session) -> List[Stop]:
    """
    Get all stops without pagination.
    
    Args:
        db: Database session
        
    Returns:
        List of all Stop objects
    """
    return db.query(Stop).all()


def update_stop(
    db: Session, 
    stop_id: int, 
    stop_update: StopCreate
) -> Optional[Stop]:
    """
    Update an existing stop.
    
    Args:
        db: Database session
        stop_id: ID of the stop to update
        stop_update: StopCreate schema with updated details
        
    Returns:
        Updated Stop object if found, None otherwise
    """
    db_stop = db.query(Stop).filter(Stop.stop_id == stop_id).first()
    
    if db_stop:
        db_stop.name = stop_update.name
        db_stop.latitude = stop_update.latitude
        db_stop.longitude = stop_update.longitude
        
        db.commit()
        db.refresh(db_stop)
    
    return db_stop


def delete_stop(db: Session, stop_id: int) -> bool:
    """
    Delete a stop by ID.
    
    Args:
        db: Database session
        stop_id: ID of the stop to delete
        
    Returns:
        True if deleted successfully, False if not found
    """
    db_stop = db.query(Stop).filter(Stop.stop_id == stop_id).first()
    
    if db_stop:
        db.delete(db_stop)
        db.commit()
        return True
    
    return False


def get_stop_count(db: Session) -> int:
    """
    Get the total count of stops.
    
    Args:
        db: Database session
        
    Returns:
        Total count of stops
    """
    return db.query(Stop).count()


def search_stops(
    db: Session, 
    search_term: str,
    skip: int = 0,
    limit: int = 100
) -> List[Stop]:
    """
    Search stops by name (partial match).
    
    Args:
        db: Database session
        search_term: Search string to match against stop name
        skip: Number of records to skip
        limit: Maximum number of records to return
        
    Returns:
        List of matching Stop objects
    """
    return db.query(Stop)\
        .filter(Stop.name.ilike(f"%{search_term}%"))\
        .offset(skip)\
        .limit(limit)\
        .all()


def get_stops_by_location(
    db: Session,
    min_lat: float,
    max_lat: float,
    min_lng: float,
    max_lng: float
) -> List[Stop]:
    """
    Get stops within a geographic bounding box.
    
    Args:
        db: Database session
        min_lat: Minimum latitude
        max_lat: Maximum latitude
        min_lng: Minimum longitude
        max_lng: Maximum longitude
        
    Returns:
        List of Stop objects within the bounds
    """
    return db.query(Stop)\
        .filter(Stop.latitude >= min_lat)\
        .filter(Stop.latitude <= max_lat)\
        .filter(Stop.longitude >= min_lng)\
        .filter(Stop.longitude <= max_lng)\
        .all()


def check_stop_exists(db: Session, stop_id: int) -> bool:
    """
    Check if a stop exists by ID.
    
    Args:
        db: Database session
        stop_id: ID of the stop to check
        
    Returns:
        True if stop exists, False otherwise
    """
    return db.query(Stop).filter(Stop.stop_id == stop_id).count() > 0


def bulk_create_stops(db: Session, stops: List[StopCreate]) -> List[Stop]:
    """
    Create multiple stops at once.
    
    Args:
        db: Database session
        stops: List of StopCreate schemas
        
    Returns:
        List of created Stop objects
    """
    db_stops = [
        Stop(
            name=stop.name,
            latitude=stop.latitude,
            longitude=stop.longitude
        )
        for stop in stops
    ]
    
    db.add_all(db_stops)
    db.commit()
    
    for stop in db_stops:
        db.refresh(stop)
    
    return db_stops


def get_stops_sorted_by_name(
    db: Session,
    ascending: bool = True,
    skip: int = 0,
    limit: int = 100
) -> List[Stop]:
    """
    Get stops sorted by name.
    
    Args:
        db: Database session
        ascending: Sort in ascending order if True, descending if False
        skip: Number of records to skip
        limit: Maximum number of records to return
        
    Returns:
        List of Stop objects sorted by name
    """
    query = db.query(Stop)
    
    if ascending:
        query = query.order_by(Stop.name.asc())
    else:
        query = query.order_by(Stop.name.desc())
    
    return query.offset(skip).limit(limit).all()
