from sqlalchemy.orm import Session
from sqlalchemy import and_
from backend.database.models import Route, Path, PathStop, Stop
from schemas import RouteCreate, RouteStatus
from datetime import time
from typing import Optional, List


# ----------------------------
# CREATE
# ----------------------------

def create_route(db: Session, route: RouteCreate) -> Route:
    """
    Create a new route.
    Automatically populates start_point and end_point from the Path's first and last stops.
    """
    # Validate that path exists
    path = db.query(Path).filter(Path.path_id == route.path_id).first()
    if not path:
        raise ValueError(f"Path with id {route.path_id} does not exist")
    
    # Get ordered stops for the path
    path_stops = (
        db.query(PathStop, Stop)
        .join(Stop, PathStop.stop_id == Stop.stop_id)
        .filter(PathStop.path_id == route.path_id)
        .order_by(PathStop.stop_order)
        .all()
    )
    
    if not path_stops or len(path_stops) < 2:
        raise ValueError(f"Path {route.path_id} must have at least 2 stops")
    
    # Auto-populate start_point and end_point from first and last stops
    start_stop_name = path_stops[0].Stop.name
    end_stop_name = path_stops[-1].Stop.name
    
    # Create route with auto-populated start/end points
    db_route = Route(
        path_id=route.path_id,
        route_display_name=route.route_display_name,
        shift_time=route.shift_time,
        direction=route.direction,
        start_point=start_stop_name,
        end_point=end_stop_name,
        capacity=route.capacity,
        allocated_waitlist=route.allocated_waitlist,
        status=route.status
    )
    
    db.add(db_route)
    db.commit()
    db.refresh(db_route)
    return db_route


# ----------------------------
# READ
# ----------------------------

def get_route(db: Session, route_id: int) -> Optional[Route]:
    """Get a route by ID."""
    return db.query(Route).filter(Route.route_id == route_id).first()


def get_all_routes(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    status: Optional[RouteStatus] = None
) -> List[Route]:
    """
    Get all routes with optional filtering by status.
    """
    query = db.query(Route)
    
    if status:
        query = query.filter(Route.status == status)
    
    return query.offset(skip).limit(limit).all()


def get_routes_by_path(db: Session, path_id: int) -> List[Route]:
    """Get all routes for a specific path."""
    return db.query(Route).filter(Route.path_id == path_id).all()


def get_routes_by_status(db: Session, status: RouteStatus) -> List[Route]:
    """Get all routes with a specific status."""
    return db.query(Route).filter(Route.status == status).all()


def get_routes_by_direction(db: Session, direction: str) -> List[Route]:
    """Get all routes with a specific direction."""
    return db.query(Route).filter(Route.direction == direction).all()


def get_routes_by_shift_time_range(
    db: Session, 
    start_time: time, 
    end_time: time
) -> List[Route]:
    """Get routes within a specific shift time range."""
    return db.query(Route).filter(
        and_(
            Route.shift_time >= start_time,
            Route.shift_time <= end_time
        )
    ).all()


def search_routes(db: Session, search_term: str) -> List[Route]:
    """Search routes by display name (case-insensitive)."""
    return db.query(Route).filter(
        Route.route_display_name.ilike(f"%{search_term}%")
    ).all()


def get_routes_sorted_by_shift_time(
    db: Session, 
    ascending: bool = True
) -> List[Route]:
    """Get all routes sorted by shift time."""
    if ascending:
        return db.query(Route).order_by(Route.shift_time.asc()).all()
    else:
        return db.query(Route).order_by(Route.shift_time.desc()).all()


def get_route_count(db: Session, status: Optional[RouteStatus] = None) -> int:
    """Get total count of routes, optionally filtered by status."""
    query = db.query(Route)
    if status:
        query = query.filter(Route.status == status)
    return query.count()


def check_route_exists(
    db: Session, 
    path_id: int, 
    shift_time: time, 
    direction: str,
    exclude_route_id: Optional[int] = None
) -> bool:
    """
    Check if a route with the same path, shift time, and direction already exists.
    Useful for preventing duplicates.
    """
    query = db.query(Route).filter(
        and_(
            Route.path_id == path_id,
            Route.shift_time == shift_time,
            Route.direction == direction
        )
    )
    
    # Exclude current route when updating
    if exclude_route_id:
        query = query.filter(Route.route_id != exclude_route_id)
    
    return query.first() is not None


# ----------------------------
# UPDATE
# ----------------------------

def update_route(db: Session, route_id: int, route_data: RouteCreate) -> Optional[Route]:
    """
    Update a route.
    If path_id is changed, automatically updates start_point and end_point.
    """
    db_route = get_route(db, route_id)
    if not db_route:
        return None
    
    # Validate that new path exists
    path = db.query(Path).filter(Path.path_id == route_data.path_id).first()
    if not path:
        raise ValueError(f"Path with id {route_data.path_id} does not exist")
    
    # If path_id changed, update start_point and end_point
    if db_route.path_id != route_data.path_id:
        # Get ordered stops for the new path
        path_stops = (
            db.query(PathStop, Stop)
            .join(Stop, PathStop.stop_id == Stop.stop_id)
            .filter(PathStop.path_id == route_data.path_id)
            .order_by(PathStop.stop_order)
            .all()
        )
        
        if not path_stops or len(path_stops) < 2:
            raise ValueError(f"Path {route_data.path_id} must have at least 2 stops")
        
        # Update start and end points
        db_route.start_point = path_stops[0].Stop.name
        db_route.end_point = path_stops[-1].Stop.name
    
    # Update all fields
    db_route.path_id = route_data.path_id
    db_route.route_display_name = route_data.route_display_name
    db_route.shift_time = route_data.shift_time
    db_route.direction = route_data.direction
    db_route.capacity = route_data.capacity
    db_route.allocated_waitlist = route_data.allocated_waitlist
    db_route.status = route_data.status
    
    db.commit()
    db.refresh(db_route)
    return db_route


def partial_update_route(
    db: Session, 
    route_id: int, 
    update_data: dict
) -> Optional[Route]:
    """
    Partially update a route (only specified fields).
    If path_id is in update_data, automatically updates start_point and end_point.
    """
    db_route = get_route(db, route_id)
    if not db_route:
        return None
    
    # If updating path_id, validate and update start/end points
    if "path_id" in update_data:
        new_path_id = update_data["path_id"]
        
        # Validate path exists
        path = db.query(Path).filter(Path.path_id == new_path_id).first()
        if not path:
            raise ValueError(f"Path with id {new_path_id} does not exist")
        
        # Get stops for new path
        path_stops = (
            db.query(PathStop, Stop)
            .join(Stop, PathStop.stop_id == Stop.stop_id)
            .filter(PathStop.path_id == new_path_id)
            .order_by(PathStop.stop_order)
            .all()
        )
        
        if not path_stops or len(path_stops) < 2:
            raise ValueError(f"Path {new_path_id} must have at least 2 stops")
        
        # Auto-update start and end points
        update_data["start_point"] = path_stops[0].Stop.name
        update_data["end_point"] = path_stops[-1].Stop.name
    
    # Apply updates
    for key, value in update_data.items():
        if hasattr(db_route, key):
            setattr(db_route, key, value)
    
    db.commit()
    db.refresh(db_route)
    return db_route


def update_route_status(
    db: Session, 
    route_id: int, 
    status: RouteStatus
) -> Optional[Route]:
    """Update only the status of a route."""
    db_route = get_route(db, route_id)
    if not db_route:
        return None
    
    db_route.status = status
    db.commit()
    db.refresh(db_route)
    return db_route


def update_route_capacity(
    db: Session, 
    route_id: int, 
    capacity: int
) -> Optional[Route]:
    """Update only the capacity of a route."""
    db_route = get_route(db, route_id)
    if not db_route:
        return None
    
    db_route.capacity = capacity
    db.commit()
    db.refresh(db_route)
    return db_route


def update_route_waitlist(
    db: Session, 
    route_id: int, 
    allocated_waitlist: int
) -> Optional[Route]:
    """Update only the allocated waitlist of a route."""
    db_route = get_route(db, route_id)
    if not db_route:
        return None
    
    db_route.allocated_waitlist = allocated_waitlist
    db.commit()
    db.refresh(db_route)
    return db_route


# ----------------------------
# DELETE
# ----------------------------

def delete_route(db: Session, route_id: int) -> bool:
    """Delete a route by ID. Returns True if deleted, False if not found."""
    db_route = get_route(db, route_id)
    if not db_route:
        return False
    
    db.delete(db_route)
    db.commit()
    return True


def delete_routes_by_path(db: Session, path_id: int) -> int:
    """Delete all routes associated with a path. Returns count of deleted routes."""
    count = db.query(Route).filter(Route.path_id == path_id).delete()
    db.commit()
    return count


# ----------------------------
# BULK OPERATIONS
# ----------------------------

def bulk_create_routes(db: Session, routes: List[RouteCreate]) -> List[Route]:
    """
    Create multiple routes at once.
    Auto-populates start_point and end_point for each route.
    """
    db_routes = []
    
    for route in routes:
        # Validate path exists
        path = db.query(Path).filter(Path.path_id == route.path_id).first()
        if not path:
            raise ValueError(f"Path with id {route.path_id} does not exist")
        
        # Get stops for the path
        path_stops = (
            db.query(PathStop, Stop)
            .join(Stop, PathStop.stop_id == Stop.stop_id)
            .filter(PathStop.path_id == route.path_id)
            .order_by(PathStop.stop_order)
            .all()
        )
        
        if not path_stops or len(path_stops) < 2:
            raise ValueError(f"Path {route.path_id} must have at least 2 stops")
        
        # Create route with auto-populated start/end points
        db_route = Route(
            path_id=route.path_id,
            route_display_name=route.route_display_name,
            shift_time=route.shift_time,
            direction=route.direction,
            start_point=path_stops[0].Stop.name,
            end_point=path_stops[-1].Stop.name,
            capacity=route.capacity,
            allocated_waitlist=route.allocated_waitlist,
            status=route.status
        )
        db_routes.append(db_route)
    
    db.add_all(db_routes)
    db.commit()
    
    for db_route in db_routes:
        db.refresh(db_route)
    
    return db_routes


def bulk_update_route_status(
    db: Session, 
    route_ids: List[int], 
    status: RouteStatus
) -> int:
    """Bulk update status for multiple routes. Returns count of updated routes."""
    count = db.query(Route).filter(
        Route.route_id.in_(route_ids)
    ).update(
        {Route.status: status},
        synchronize_session=False
    )
    db.commit()
    return count
