# All callable functions for the agent

from langchain.tools import tool
from sqlalchemy.orm import Session
from database.models import Vehicle, DailyTrip, Deployment, Stop, Path, Route, Driver
from database.connection import SessionLocal

@tool
def get_unassigned_vehicles() -> str:
    """Returns a list of license plates for vehicles that are not currently assigned to any trip."""
    
    db: Session = SessionLocal()
    assigned_vehicle_ids = [d.vehicle_id for d in db.query(Deployment).all()]
    unassigned_vehicles = db.query(Vehicle).filter(Vehicle.id.notin_(assigned_vehicle_ids)).all()
    db.close()
    if not unassigned_vehicles:
        return "All vehicles are currently assigned."
    return f"Unassigned vehicles: {[v.license_plate for v in unassigned_vehicles]}"

@tool
def get_trip_status(trip_display_name: str) -> str:
    """Gets the status, booking percentage, and deployment details for a specific trip by its display name."""
    
    db: Session = SessionLocal()
    trip = db.query(DailyTrip).filter(DailyTrip.display_name == trip_display_name).first()
    if not trip:
        db.close()
        return f"Trip '{trip_display_name}' not found."
    
    deployment = db.query(Deployment).filter(Deployment.trip_id == trip.id).first()
    if deployment:
        vehicle = db.query(Vehicle).get(deployment.vehicle_id)
        driver = db.query(Driver).get(deployment.driver_id)
        deployment_info = f"Assigned vehicle: {vehicle.license_plate}, Driver: {driver.name}."
    else:
        deployment_info = "No vehicle or driver assigned."

    db.close()
    return (
        f"Status of trip '{trip.display_name}':\n"
        f"- Live Status: {trip.live_status}\n"
        f"- Booking: {trip.booking_status_percentage}%\n"
        f"- {deployment_info}"
    )

@tool
def remove_vehicle_from_trip(trip_display_name: str) -> str:
    """Removes the assigned vehicle and driver from a specific trip."""
    
    db: Session = SessionLocal()
    trip = db.query(DailyTrip).filter(DailyTrip.display_name == trip_display_name).first()
    if not trip:
        db.close()
        return f"Trip '{trip_display_name}' not found."
    
    deployment = db.query(Deployment).filter(Deployment.trip_id == trip.id).first()
    
    if not deployment:
        db.close()
        return f"Trip '{trip_display_name}' has no vehicle assigned to it."

    db.delete(deployment)
    db.commit()
    db.close()
    return f"Successfully removed vehicle from trip '{trip_display_name}'. Bookings may be affected."

# Helper function for consequence checks
def check_trip_consequences(trip_display_name: str, db: Session) -> dict:
    """Helper to check consequences for a trip-related action."""
    
    trip = db.query(DailyTrip).filter(DailyTrip.display_name == trip_display_name).first()
    if not trip or trip.booking_status_percentage == 0:
        return {"has_consequences": False}
    
    return {
        "has_consequences": True,
        "details": f"The trip '{trip_display_name}' is already {trip.booking_status_percentage}% booked by employees."
    }