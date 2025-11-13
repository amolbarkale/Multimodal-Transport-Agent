from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db
from schemas import DailyTripCreate, DailyTripResponse
import crud.daily_trip as daily_trip_crud

router = APIRouter(prefix="/trips", tags=["daily_trips"])


# ----------------------------
# CREATE ENDPOINTS
# ----------------------------

@router.post("/", response_model=DailyTripResponse, status_code=201)
def create_daily_trip(trip: DailyTripCreate, db: Session = Depends(get_db)):
    """
    Create a new daily trip.
    Validates that the route exists.
    """
    try:
        return daily_trip_crud.create_daily_trip(db, trip)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating trip: {str(e)}")


@router.post("/bulk", response_model=List[DailyTripResponse], status_code=201)
def bulk_create_daily_trips(trips: List[DailyTripCreate], db: Session = Depends(get_db)):
    """
    Create multiple daily trips at once.
    """
    try:
        return daily_trip_crud.create_bulk_daily_trips(db, trips)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating trips: {str(e)}")


# ----------------------------
# READ ENDPOINTS
# ----------------------------

@router.get("/", response_model=DailyTripResponse)
def get_daily_trip_by_id(
    trip_id: int = Query(..., description="Daily Trip ID"), 
    db: Session = Depends(get_db)
):
    """Get a specific daily trip by ID."""
    trip = daily_trip_crud.get_daily_trip_by_id(db, trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")
    return trip


@router.get("/all", response_model=List[DailyTripResponse])
def get_all_daily_trips(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """
    Get all daily trips with pagination.
    """
    return daily_trip_crud.get_all_daily_trips(db, skip=skip, limit=limit)


@router.get("/{trip_id}", response_model=DailyTripResponse)
def get_daily_trip(trip_id: int, db: Session = Depends(get_db)):
    """Get a specific daily trip by ID."""
    trip = daily_trip_crud.get_daily_trip_by_id(db, trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")
    return trip


@router.get("/route/{route_id}", response_model=List[DailyTripResponse])
def get_daily_trips_by_route(route_id: int, db: Session = Depends(get_db)):
    """
    Get all daily trips for a specific route.
    """
    return daily_trip_crud.get_daily_trips_by_route(db, route_id)


@router.get("/status/{live_status}", response_model=List[DailyTripResponse])
def get_daily_trips_by_status(live_status: str, db: Session = Depends(get_db)):
    """
    Get all daily trips with a specific live status.
    Examples: scheduled, in_progress, completed, cancelled
    """
    return daily_trip_crud.get_daily_trips_by_live_status(db, live_status)


@router.get("/search/name", response_model=List[DailyTripResponse])
def search_daily_trips(
    query: str = Query(..., min_length=1, description="Search query for trip name"),
    db: Session = Depends(get_db)
):
    """
    Search daily trips by display name (case-insensitive partial match).
    """
    return daily_trip_crud.search_daily_trips_by_name(db, query)


@router.get("/filter/booking-range", response_model=List[DailyTripResponse])
def get_daily_trips_by_booking_range(
    min_percentage: float = Query(0.0, ge=0.0, le=100.0),
    max_percentage: float = Query(100.0, ge=0.0, le=100.0),
    db: Session = Depends(get_db)
):
    """
    Get daily trips where booking status percentage falls within a range.
    """
    if min_percentage > max_percentage:
        raise HTTPException(status_code=400, detail="min_percentage must be <= max_percentage")
    return daily_trip_crud.get_daily_trips_by_booking_range(db, min_percentage, max_percentage)


@router.get("/sorted/booking-status", response_model=List[DailyTripResponse])
def get_sorted_by_booking_status(
    ascending: bool = Query(False, description="Sort in ascending order"),
    db: Session = Depends(get_db)
):
    """
    Get all daily trips sorted by booking status percentage.
    """
    return daily_trip_crud.get_daily_trips_sorted_by_booking_status(db, ascending)


@router.get("/filter/fully-booked", response_model=List[DailyTripResponse])
def get_fully_booked_trips(
    threshold: float = Query(90.0, ge=0.0, le=100.0, description="Minimum booking percentage"),
    db: Session = Depends(get_db)
):
    """
    Get trips that are nearly or fully booked (above threshold percentage).
    """
    return daily_trip_crud.get_fully_booked_trips(db, threshold)


@router.get("/filter/available", response_model=List[DailyTripResponse])
def get_available_trips(
    threshold: float = Query(50.0, ge=0.0, le=100.0, description="Maximum booking percentage"),
    db: Session = Depends(get_db)
):
    """
    Get trips that still have significant availability (below threshold percentage).
    """
    return daily_trip_crud.get_available_trips(db, threshold)


@router.get("/count/total", response_model=dict)
def get_total_count(db: Session = Depends(get_db)):
    """
    Get the total count of daily trips.
    """
    count = daily_trip_crud.get_total_daily_trips_count(db)
    return {"total_count": count}


@router.get("/count/route/{route_id}", response_model=dict)
def get_count_by_route(route_id: int, db: Session = Depends(get_db)):
    """
    Get count of daily trips for a specific route.
    """
    count = daily_trip_crud.get_daily_trips_count_by_route(db, route_id)
    return {"route_id": route_id, "trip_count": count}


@router.get("/check/exists", response_model=dict)
def check_trip_exists(
    trip_id: int = Query(..., description="Trip ID to check"),
    db: Session = Depends(get_db)
):
    """
    Check if a daily trip exists.
    """
    exists = daily_trip_crud.check_daily_trip_exists(db, trip_id)
    return {"trip_id": trip_id, "exists": exists}


# ----------------------------
# UPDATE ENDPOINTS
# ----------------------------

@router.put("/{trip_id}", response_model=DailyTripResponse)
def update_daily_trip(
    trip_id: int, 
    trip_update: DailyTripCreate, 
    db: Session = Depends(get_db)
):
    """
    Update an existing daily trip (full update).
    """
    try:
        updated_trip = daily_trip_crud.update_daily_trip(db, trip_id, trip_update)
        if not updated_trip:
            raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")
        return updated_trip
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating trip: {str(e)}")


@router.patch("/{trip_id}", response_model=DailyTripResponse)
def partial_update_daily_trip(
    trip_id: int, 
    trip_update: DailyTripCreate, 
    db: Session = Depends(get_db)
):
    """
    Partially update an existing daily trip.
    """
    try:
        updated_trip = daily_trip_crud.update_daily_trip(db, trip_id, trip_update)
        if not updated_trip:
            raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")
        return updated_trip
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating trip: {str(e)}")


@router.patch("/{trip_id}/booking-status", response_model=DailyTripResponse)
def update_booking_status(
    trip_id: int,
    booking_percentage: float = Query(..., ge=0.0, le=100.0, description="Booking percentage"),
    db: Session = Depends(get_db)
):
    """
    Quick update for just the booking status percentage.
    """
    updated_trip = daily_trip_crud.update_daily_trip_booking_status(db, trip_id, booking_percentage)
    if not updated_trip:
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")
    return updated_trip


@router.patch("/{trip_id}/live-status", response_model=DailyTripResponse)
def update_live_status(
    trip_id: int,
    live_status: str = Query(..., description="Live status (scheduled, in_progress, completed, cancelled)"),
    db: Session = Depends(get_db)
):
    """
    Quick update for just the live status.
    """
    updated_trip = daily_trip_crud.update_daily_trip_live_status(db, trip_id, live_status)
    if not updated_trip:
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")
    return updated_trip


@router.patch("/bulk/live-status", response_model=dict)
def bulk_update_live_status(
    trip_ids: List[int] = Query(..., description="List of trip IDs"),
    live_status: str = Query(..., description="Live status to set"),
    db: Session = Depends(get_db)
):
    """
    Update live status for multiple trips at once.
    """
    try:
        count = daily_trip_crud.bulk_update_live_status(db, trip_ids, live_status)
        return {"updated_count": count, "live_status": live_status}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating trips: {str(e)}")


# ----------------------------
# DELETE ENDPOINTS
# ----------------------------

@router.delete("/{trip_id}", response_model=dict)
def delete_daily_trip(trip_id: int, db: Session = Depends(get_db)):
    """
    Delete a daily trip by ID.
    This will cascade delete related deployments.
    """
    success = daily_trip_crud.delete_daily_trip(db, trip_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")
    return {"message": f"Trip {trip_id} deleted successfully"}


@router.delete("/route/{route_id}/all", response_model=dict)
def delete_daily_trips_by_route(route_id: int, db: Session = Depends(get_db)):
    """
    Delete all daily trips for a specific route.
    """
    count = daily_trip_crud.delete_daily_trips_by_route(db, route_id)
    return {"message": f"Deleted {count} trips for route {route_id}", "deleted_count": count}


@router.delete("/status/{live_status}/all", response_model=dict)
def delete_daily_trips_by_status(live_status: str, db: Session = Depends(get_db)):
    """
    Delete all daily trips with a specific live status.
    """
    count = daily_trip_crud.delete_daily_trips_by_status(db, live_status)
    return {"message": f"Deleted {count} trips with status {live_status}", "deleted_count": count}


@router.delete("/bulk", response_model=dict)
def bulk_delete_daily_trips(
    trip_ids: List[int] = Query(..., description="List of trip IDs to delete"),
    db: Session = Depends(get_db)
):
    """
    Delete multiple daily trips by their IDs.
    """
    count = daily_trip_crud.bulk_delete_daily_trips(db, trip_ids)
    return {"message": f"Deleted {count} trips", "deleted_count": count}
