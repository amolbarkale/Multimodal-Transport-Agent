from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import time

from database import get_db
from schemas import RouteCreate, RouteResponse, RouteStatus
import crud.route as route_crud

router = APIRouter(prefix="/routes", tags=["routes"])


# ----------------------------
# CREATE ENDPOINTS
# ----------------------------

@router.post("/", response_model=RouteResponse, status_code=201)
def create_route(route: RouteCreate, db: Session = Depends(get_db)):
    """
    Create a new route.
    start_point and end_point are automatically populated from the path's first and last stops.
    """
    try:
        return route_crud.create_route(db, route)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating route: {str(e)}")


@router.post("/bulk", response_model=List[RouteResponse], status_code=201)
def bulk_create_routes(routes: List[RouteCreate], db: Session = Depends(get_db)):
    """
    Create multiple routes at once.
    All routes will have auto-populated start_point and end_point.
    """
    try:
        return route_crud.bulk_create_routes(db, routes)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating routes: {str(e)}")


# ----------------------------
# READ ENDPOINTS
# ----------------------------

@router.get("/", response_model=RouteResponse)
def get_route_by_id(route_id: int = Query(..., description="Route ID"), db: Session = Depends(get_db)):
    """Get a specific route by ID."""
    route = route_crud.get_route(db, route_id)
    if not route:
        raise HTTPException(status_code=404, detail=f"Route with id {route_id} not found")
    return route


@router.get("/all", response_model=List[RouteResponse])
def get_all_routes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[RouteStatus] = Query(None, description="Filter by status"),
    db: Session = Depends(get_db)
):
    """
    Get all routes with optional pagination and status filtering.
    """
    return route_crud.get_all_routes(db, skip=skip, limit=limit, status=status)


@router.get("/{route_id}", response_model=RouteResponse)
def get_route(route_id: int, db: Session = Depends(get_db)):
    """Get a specific route by ID."""
    route = route_crud.get_route(db, route_id)
    if not route:
        raise HTTPException(status_code=404, detail=f"Route with id {route_id} not found")
    return route


@router.get("/path/{path_id}", response_model=List[RouteResponse])
def get_routes_by_path(path_id: int, db: Session = Depends(get_db)):
    """Get all routes for a specific path."""
    return route_crud.get_routes_by_path(db, path_id)


@router.get("/status/{status}", response_model=List[RouteResponse])
def get_routes_by_status(status: RouteStatus, db: Session = Depends(get_db)):
    """Get all routes with a specific status (active or deactivated)."""
    return route_crud.get_routes_by_status(db, status)


@router.get("/direction/{direction}", response_model=List[RouteResponse])
def get_routes_by_direction(direction: str, db: Session = Depends(get_db)):
    """Get all routes with a specific direction (e.g., 'LOGIN', 'LOGOUT')."""
    return route_crud.get_routes_by_direction(db, direction)


@router.get("/search/name", response_model=List[RouteResponse])
def search_routes(
    query: str = Query(..., min_length=1, description="Search term for route display name"),
    db: Session = Depends(get_db)
):
    """Search routes by display name (case-insensitive)."""
    return route_crud.search_routes(db, query)


@router.get("/sorted/shift-time", response_model=List[RouteResponse])
def get_routes_sorted_by_shift_time(
    ascending: bool = Query(True, description="Sort in ascending order"),
    db: Session = Depends(get_db)
):
    """Get all routes sorted by shift time."""
    return route_crud.get_routes_sorted_by_shift_time(db, ascending)


@router.get("/filter/shift-time-range", response_model=List[RouteResponse])
def get_routes_by_shift_time_range(
    start_time: str = Query(..., description="Start time in HH:MM:SS format"),
    end_time: str = Query(..., description="End time in HH:MM:SS format"),
    db: Session = Depends(get_db)
):
    """Get routes within a specific shift time range."""
    try:
        # Parse time strings
        start = time.fromisoformat(start_time)
        end = time.fromisoformat(end_time)
        return route_crud.get_routes_by_shift_time_range(db, start, end)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid time format. Use HH:MM:SS format. Error: {str(e)}")


@router.get("/count/total", response_model=int)
def get_route_count(
    status: Optional[RouteStatus] = Query(None, description="Filter count by status"),
    db: Session = Depends(get_db)
):
    """Get total count of routes, optionally filtered by status."""
    return route_crud.get_route_count(db, status)


@router.get("/check/exists", response_model=bool)
def check_route_exists(
    path_id: int = Query(..., description="Path ID"),
    shift_time: str = Query(..., description="Shift time in HH:MM:SS format"),
    direction: str = Query(..., description="Direction"),
    exclude_route_id: Optional[int] = Query(None, description="Route ID to exclude (for updates)"),
    db: Session = Depends(get_db)
):
    """
    Check if a route with the same path, shift time, and direction already exists.
    Useful for preventing duplicates.
    """
    try:
        shift = time.fromisoformat(shift_time)
        return route_crud.check_route_exists(db, path_id, shift, direction, exclude_route_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid time format. Use HH:MM:SS format. Error: {str(e)}")


# ----------------------------
# UPDATE ENDPOINTS
# ----------------------------

@router.put("/{route_id}", response_model=RouteResponse)
def update_route(route_id: int, route: RouteCreate, db: Session = Depends(get_db)):
    """
    Update a route.
    If path_id is changed, start_point and end_point are automatically updated.
    """
    try:
        updated_route = route_crud.update_route(db, route_id, route)
        if not updated_route:
            raise HTTPException(status_code=404, detail=f"Route with id {route_id} not found")
        return updated_route
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating route: {str(e)}")


@router.patch("/{route_id}", response_model=RouteResponse)
def partial_update_route(route_id: int, update_data: dict, db: Session = Depends(get_db)):
    """
    Partially update a route (only specified fields).
    If path_id is updated, start_point and end_point are automatically updated.
    """
    try:
        updated_route = route_crud.partial_update_route(db, route_id, update_data)
        if not updated_route:
            raise HTTPException(status_code=404, detail=f"Route with id {route_id} not found")
        return updated_route
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating route: {str(e)}")


@router.patch("/{route_id}/status", response_model=RouteResponse)
def update_route_status(
    route_id: int,
    status: RouteStatus = Query(..., description="New status"),
    db: Session = Depends(get_db)
):
    """Update only the status of a route."""
    updated_route = route_crud.update_route_status(db, route_id, status)
    if not updated_route:
        raise HTTPException(status_code=404, detail=f"Route with id {route_id} not found")
    return updated_route


@router.patch("/{route_id}/capacity", response_model=RouteResponse)
def update_route_capacity(
    route_id: int,
    capacity: int = Query(..., ge=0, description="New capacity"),
    db: Session = Depends(get_db)
):
    """Update only the capacity of a route."""
    updated_route = route_crud.update_route_capacity(db, route_id, capacity)
    if not updated_route:
        raise HTTPException(status_code=404, detail=f"Route with id {route_id} not found")
    return updated_route


@router.patch("/{route_id}/waitlist", response_model=RouteResponse)
def update_route_waitlist(
    route_id: int,
    allocated_waitlist: int = Query(..., ge=0, description="New allocated waitlist"),
    db: Session = Depends(get_db)
):
    """Update only the allocated waitlist of a route."""
    updated_route = route_crud.update_route_waitlist(db, route_id, allocated_waitlist)
    if not updated_route:
        raise HTTPException(status_code=404, detail=f"Route with id {route_id} not found")
    return updated_route


@router.patch("/bulk/status", response_model=dict)
def bulk_update_route_status(
    route_ids: List[int],
    status: RouteStatus = Query(..., description="New status for all routes"),
    db: Session = Depends(get_db)
):
    """Bulk update status for multiple routes."""
    try:
        count = route_crud.bulk_update_route_status(db, route_ids, status)
        return {"updated_count": count, "message": f"Updated {count} routes"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating routes: {str(e)}")


# ----------------------------
# DELETE ENDPOINTS
# ----------------------------

@router.delete("/{route_id}", status_code=204)
def delete_route(route_id: int, db: Session = Depends(get_db)):
    """Delete a route by ID."""
    success = route_crud.delete_route(db, route_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Route with id {route_id} not found")
    return None


@router.delete("/path/{path_id}/all", response_model=dict)
def delete_routes_by_path(path_id: int, db: Session = Depends(get_db)):
    """Delete all routes associated with a specific path."""
    count = route_crud.delete_routes_by_path(db, path_id)
    return {"deleted_count": count, "message": f"Deleted {count} routes for path {path_id}"}
