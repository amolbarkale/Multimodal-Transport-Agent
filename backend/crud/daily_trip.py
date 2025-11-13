from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from backend.database.models import DailyTrip, Route, Deployment
from schemas import DailyTripCreate
from typing import Optional, List


# ----------------------------
# CREATE
# ----------------------------

def create_daily_trip(db: Session, trip: DailyTripCreate) -> DailyTrip:
    """
    Create a new daily trip.
    Validates that the route exists before creating.
    """
    # Validate that route exists
    route = db.query(Route).filter(Route.route_id == trip.route_id).first()
    if not route:
        raise ValueError(f"Route with id {trip.route_id} does not exist")
    
    db_trip = DailyTrip(
        route_id=trip.route_id,
        display_name=trip.display_name,
        booking_status_percentage=trip.booking_status_percentage,
        live_status=trip.live_status
    )
    db.add(db_trip)
    db.commit()
    db.refresh(db_trip)
    return db_trip


def create_bulk_daily_trips(db: Session, trips: List[DailyTripCreate]) -> List[DailyTrip]:
    """
    Create multiple daily trips at once.
    """
    db_trips = []
    for trip in trips:
        # Validate route exists
        route = db.query(Route).filter(Route.route_id == trip.route_id).first()
        if not route:
            raise ValueError(f"Route with id {trip.route_id} does not exist")
        
        db_trip = DailyTrip(
            route_id=trip.route_id,
            display_name=trip.display_name,
            booking_status_percentage=trip.booking_status_percentage,
            live_status=trip.live_status
        )
        db_trips.append(db_trip)
    
    db.add_all(db_trips)
    db.commit()
    for trip in db_trips:
        db.refresh(trip)
    return db_trips


# ----------------------------
# READ
# ----------------------------

def get_daily_trip_by_id(db: Session, trip_id: int) -> Optional[DailyTrip]:
    """
    Get a daily trip by its ID.
    """
    return db.query(DailyTrip).filter(DailyTrip.trip_id == trip_id).first()


def get_all_daily_trips(db: Session, skip: int = 0, limit: int = 100) -> List[DailyTrip]:
    """
    Get all daily trips with pagination.
    """
    return db.query(DailyTrip).offset(skip).limit(limit).all()


def get_daily_trips_by_route(db: Session, route_id: int) -> List[DailyTrip]:
    """
    Get all daily trips for a specific route.
    """
    return db.query(DailyTrip).filter(DailyTrip.route_id == route_id).all()


def get_daily_trips_by_live_status(db: Session, live_status: str) -> List[DailyTrip]:
    """
    Get all daily trips with a specific live status.
    Examples: 'scheduled', 'in_progress', 'completed', 'cancelled'
    """
    return db.query(DailyTrip).filter(DailyTrip.live_status == live_status).all()


def get_daily_trips_by_booking_range(
    db: Session, 
    min_percentage: float = 0.0, 
    max_percentage: float = 100.0
) -> List[DailyTrip]:
    """
    Get daily trips where booking status percentage falls within a range.
    """
    return db.query(DailyTrip).filter(
        and_(
            DailyTrip.booking_status_percentage >= min_percentage,
            DailyTrip.booking_status_percentage <= max_percentage
        )
    ).all()


def search_daily_trips_by_name(db: Session, query: str) -> List[DailyTrip]:
    """
    Search daily trips by display name (case-insensitive partial match).
    """
    return db.query(DailyTrip).filter(
        DailyTrip.display_name.ilike(f"%{query}%")
    ).all()


def get_daily_trips_sorted_by_booking_status(
    db: Session, 
    ascending: bool = False
) -> List[DailyTrip]:
    """
    Get all daily trips sorted by booking status percentage.
    """
    if ascending:
        return db.query(DailyTrip).order_by(DailyTrip.booking_status_percentage.asc()).all()
    return db.query(DailyTrip).order_by(DailyTrip.booking_status_percentage.desc()).all()


def get_fully_booked_trips(db: Session, threshold: float = 90.0) -> List[DailyTrip]:
    """
    Get trips that are nearly or fully booked (above threshold percentage).
    """
    return db.query(DailyTrip).filter(
        DailyTrip.booking_status_percentage >= threshold
    ).all()


def get_available_trips(db: Session, threshold: float = 50.0) -> List[DailyTrip]:
    """
    Get trips that still have significant availability (below threshold percentage).
    """
    return db.query(DailyTrip).filter(
        DailyTrip.booking_status_percentage < threshold
    ).all()


def check_daily_trip_exists(db: Session, trip_id: int) -> bool:
    """
    Check if a daily trip exists.
    """
    return db.query(DailyTrip).filter(DailyTrip.trip_id == trip_id).first() is not None


def get_total_daily_trips_count(db: Session) -> int:
    """
    Get the total count of daily trips.
    """
    return db.query(DailyTrip).count()


def get_daily_trips_count_by_route(db: Session, route_id: int) -> int:
    """
    Get count of daily trips for a specific route.
    """
    return db.query(DailyTrip).filter(DailyTrip.route_id == route_id).count()


# ----------------------------
# UPDATE
# ----------------------------

def update_daily_trip(db: Session, trip_id: int, trip_update: DailyTripCreate) -> Optional[DailyTrip]:
    """
    Update an existing daily trip.
    """
    db_trip = db.query(DailyTrip).filter(DailyTrip.trip_id == trip_id).first()
    if not db_trip:
        return None
    
    # Validate route if changed
    if trip_update.route_id != db_trip.route_id:
        route = db.query(Route).filter(Route.route_id == trip_update.route_id).first()
        if not route:
            raise ValueError(f"Route with id {trip_update.route_id} does not exist")
    
    db_trip.route_id = trip_update.route_id
    db_trip.display_name = trip_update.display_name
    db_trip.booking_status_percentage = trip_update.booking_status_percentage
    db_trip.live_status = trip_update.live_status
    
    db.commit()
    db.refresh(db_trip)
    return db_trip


def update_daily_trip_booking_status(
    db: Session, 
    trip_id: int, 
    booking_percentage: float
) -> Optional[DailyTrip]:
    """
    Quick update for just the booking status percentage.
    """
    db_trip = db.query(DailyTrip).filter(DailyTrip.trip_id == trip_id).first()
    if not db_trip:
        return None
    
    db_trip.booking_status_percentage = booking_percentage
    db.commit()
    db.refresh(db_trip)
    return db_trip


def update_daily_trip_live_status(
    db: Session, 
    trip_id: int, 
    live_status: str
) -> Optional[DailyTrip]:
    """
    Quick update for just the live status.
    """
    db_trip = db.query(DailyTrip).filter(DailyTrip.trip_id == trip_id).first()
    if not db_trip:
        return None
    
    db_trip.live_status = live_status
    db.commit()
    db.refresh(db_trip)
    return db_trip


def bulk_update_live_status(
    db: Session, 
    trip_ids: List[int], 
    live_status: str
) -> int:
    """
    Update live status for multiple trips at once.
    Returns the number of updated trips.
    """
    count = db.query(DailyTrip).filter(
        DailyTrip.trip_id.in_(trip_ids)
    ).update(
        {DailyTrip.live_status: live_status},
        synchronize_session=False
    )
    db.commit()
    return count


# ----------------------------
# DELETE
# ----------------------------

def delete_daily_trip(db: Session, trip_id: int) -> bool:
    """
    Delete a daily trip by ID.
    Note: This will cascade delete related deployments.
    """
    db_trip = db.query(DailyTrip).filter(DailyTrip.trip_id == trip_id).first()
    if not db_trip:
        return False
    
    db.delete(db_trip)
    db.commit()
    return True


def delete_daily_trips_by_route(db: Session, route_id: int) -> int:
    """
    Delete all daily trips for a specific route.
    Returns the number of deleted trips.
    """
    count = db.query(DailyTrip).filter(DailyTrip.route_id == route_id).count()
    db.query(DailyTrip).filter(DailyTrip.route_id == route_id).delete(synchronize_session=False)
    db.commit()
    return count


def delete_daily_trips_by_status(db: Session, live_status: str) -> int:
    """
    Delete all daily trips with a specific live status.
    Returns the number of deleted trips.
    """
    count = db.query(DailyTrip).filter(DailyTrip.live_status == live_status).count()
    db.query(DailyTrip).filter(DailyTrip.live_status == live_status).delete(synchronize_session=False)
    db.commit()
    return count


def bulk_delete_daily_trips(db: Session, trip_ids: List[int]) -> int:
    """
    Delete multiple daily trips by their IDs.
    Returns the number of deleted trips.
    """
    count = db.query(DailyTrip).filter(DailyTrip.trip_id.in_(trip_ids)).count()
    db.query(DailyTrip).filter(DailyTrip.trip_id.in_(trip_ids)).delete(synchronize_session=False)
    db.commit()
    return count
