"""
CRUD operations for Path model
"""
from sqlalchemy.orm import Session
from typing import List, Optional
from models import Path, PathStop, Stop
from schemas import PathCreate, PathResponse, PathStopBase


def create_path(db: Session, path: PathCreate) -> Path:
    """
    Create a new path with ordered stops.
    
    Args:
        db: Database session
        path: PathCreate schema with path details and ordered stops
        
    Returns:
        Created Path object with stops
    """
    db_path = Path(path_name=path.path_name)
    db.add(db_path)
    db.flush()
    
    # Create PathStop entries for ordered stops
    for stop_data in path.stops:
        path_stop = PathStop(
            path_id=db_path.path_id,
            stop_id=stop_data.stop_id,
            stop_order=stop_data.stop_order
        )
        db.add(path_stop)
    
    db.commit()
    db.refresh(db_path)
    return db_path


def get_path(db: Session, path_id: int) -> Optional[Path]:
    """
    Get a path by ID with its ordered stops.
    
    Args:
        db: Database session
        path_id: ID of the path to retrieve
        
    Returns:
        Path object if found, None otherwise
    """
    return db.query(Path).filter(Path.path_id == path_id).first()


def get_path_by_name(db: Session, path_name: str) -> Optional[Path]:
    """
    Get a path by exact name.
    
    Args:
        db: Database session
        path_name: Name of the path
        
    Returns:
        Path object if found, None otherwise
    """
    return db.query(Path).filter(Path.path_name == path_name).first()


def get_paths(
    db: Session, 
    skip: int = 0, 
    limit: int = 100
) -> List[Path]:
    """
    Get all paths with pagination.
    
    Args:
        db: Database session
        skip: Number of records to skip (for pagination)
        limit: Maximum number of records to return
        
    Returns:
        List of Path objects
    """
    return db.query(Path).offset(skip).limit(limit).all()


def get_all_paths(db: Session) -> List[Path]:
    """
    Get all paths without pagination.
    
    Args:
        db: Database session
        
    Returns:
        List of all Path objects
    """
    return db.query(Path).all()


def update_path(
    db: Session, 
    path_id: int, 
    path_update: PathCreate
) -> Optional[Path]:
    """
    Update an existing path including its stops.
    
    Args:
        db: Database session
        path_id: ID of the path to update
        path_update: PathCreate schema with updated details
        
    Returns:
        Updated Path object if found, None otherwise
    """
    db_path = db.query(Path).filter(Path.path_id == path_id).first()
    
    if db_path:
        # Update path name
        db_path.path_name = path_update.path_name
        
        # Delete existing path stops
        db.query(PathStop).filter(PathStop.path_id == path_id).delete()
        
        # Add new path stops
        for stop_data in path_update.stops:
            path_stop = PathStop(
                path_id=path_id,
                stop_id=stop_data.stop_id,
                stop_order=stop_data.stop_order
            )
            db.add(path_stop)
        
        db.commit()
        db.refresh(db_path)
    
    return db_path


def delete_path(db: Session, path_id: int) -> bool:
    """
    Delete a path by ID (cascades to PathStop entries).
    
    Args:
        db: Database session
        path_id: ID of the path to delete
        
    Returns:
        True if deleted successfully, False if not found
    """
    db_path = db.query(Path).filter(Path.path_id == path_id).first()
    
    if db_path:
        db.delete(db_path)
        db.commit()
        return True
    
    return False


def get_path_count(db: Session) -> int:
    """
    Get the total count of paths.
    
    Args:
        db: Database session
        
    Returns:
        Total count of paths
    """
    return db.query(Path).count()


def search_paths(
    db: Session, 
    search_term: str,
    skip: int = 0,
    limit: int = 100
) -> List[Path]:
    """
    Search paths by name (partial match).
    
    Args:
        db: Database session
        search_term: Search string to match against path name
        skip: Number of records to skip
        limit: Maximum number of records to return
        
    Returns:
        List of matching Path objects
    """
    return db.query(Path)\
        .filter(Path.path_name.ilike(f"%{search_term}%"))\
        .offset(skip)\
        .limit(limit)\
        .all()


def get_path_stops_ordered(db: Session, path_id: int) -> List[tuple]:
    """
    Get all stops for a path in order with stop details.
    
    Args:
        db: Database session
        path_id: ID of the path
        
    Returns:
        List of tuples (PathStop, Stop) ordered by stop_order
    """
    return db.query(PathStop, Stop)\
        .join(Stop, PathStop.stop_id == Stop.stop_id)\
        .filter(PathStop.path_id == path_id)\
        .order_by(PathStop.stop_order)\
        .all()


def check_path_exists(db: Session, path_id: int) -> bool:
    """
    Check if a path exists by ID.
    
    Args:
        db: Database session
        path_id: ID of the path to check
        
    Returns:
        True if path exists, False otherwise
    """
    return db.query(Path).filter(Path.path_id == path_id).count() > 0


def get_paths_containing_stop(db: Session, stop_id: int) -> List[Path]:
    """
    Get all paths that contain a specific stop.
    
    Args:
        db: Database session
        stop_id: ID of the stop
        
    Returns:
        List of Path objects containing the stop
    """
    return db.query(Path)\
        .join(PathStop)\
        .filter(PathStop.stop_id == stop_id)\
        .distinct()\
        .all()


def get_paths_by_stop_count(
    db: Session,
    min_stops: int = None,
    max_stops: int = None
) -> List[Path]:
    """
    Get paths filtered by number of stops.
    
    Args:
        db: Database session
        min_stops: Minimum number of stops
        max_stops: Maximum number of stops
        
    Returns:
        List of Path objects
    """
    from sqlalchemy import func
    
    query = db.query(Path)\
        .join(PathStop)\
        .group_by(Path.path_id)
    
    if min_stops is not None:
        query = query.having(func.count(PathStop.id) >= min_stops)
    
    if max_stops is not None:
        query = query.having(func.count(PathStop.id) <= max_stops)
    
    return query.all()


def add_stop_to_path(
    db: Session,
    path_id: int,
    stop_id: int,
    stop_order: int
) -> Optional[PathStop]:
    """
    Add a stop to an existing path.
    
    Args:
        db: Database session
        path_id: ID of the path
        stop_id: ID of the stop to add
        stop_order: Order position of the stop
        
    Returns:
        Created PathStop object if successful, None otherwise
    """
    if not check_path_exists(db, path_id):
        return None
    
    path_stop = PathStop(
        path_id=path_id,
        stop_id=stop_id,
        stop_order=stop_order
    )
    db.add(path_stop)
    db.commit()
    db.refresh(path_stop)
    return path_stop


def remove_stop_from_path(
    db: Session,
    path_id: int,
    stop_id: int
) -> bool:
    """
    Remove a stop from a path.
    
    Args:
        db: Database session
        path_id: ID of the path
        stop_id: ID of the stop to remove
        
    Returns:
        True if removed successfully, False otherwise
    """
    result = db.query(PathStop)\
        .filter(PathStop.path_id == path_id)\
        .filter(PathStop.stop_id == stop_id)\
        .delete()
    
    db.commit()
    return result > 0


def get_paths_sorted_by_name(
    db: Session,
    ascending: bool = True,
    skip: int = 0,
    limit: int = 100
) -> List[Path]:
    """
    Get paths sorted by name.
    
    Args:
        db: Database session
        ascending: Sort in ascending order if True, descending if False
        skip: Number of records to skip
        limit: Maximum number of records to return
        
    Returns:
        List of Path objects sorted by name
    """
    query = db.query(Path)
    
    if ascending:
        query = query.order_by(Path.path_name.asc())
    else:
        query = query.order_by(Path.path_name.desc())
    
    return query.offset(skip).limit(limit).all()
