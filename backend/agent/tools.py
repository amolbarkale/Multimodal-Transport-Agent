from typing import List
from langchain.tools import tool
from sqlalchemy.orm import Session
from database.models import Vehicle, DailyTrip, Deployment, Stop, Path, Route, Driver
from database.connection import SessionLocal
from database.models import Driver, Path, Route, Stop, DailyTrip, Vehicle, Deployment, StatusEnum


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

def check_trip_consequences(trip_display_name: str, db: Session) -> dict:
    """Helper to check consequences for a trip-related action."""
    
    trip = db.query(DailyTrip).filter(DailyTrip.display_name == trip_display_name).first()
    if not trip or trip.booking_status_percentage == 0:
        return {"has_consequences": False}
    
    return {
        "has_consequences": True,
        "details": f"The trip '{trip_display_name}' is already {trip.booking_status_percentage}% booked by employees."
    }

# Helper function for route deactivation consequence checks
def check_route_deactivation_consequences(route_display_name: str, db: Session) -> dict:
    """Helper to check if deactivating a route will affect any scheduled trips."""
    route = db.query(Route).filter(Route.display_name == route_display_name).first()
    
    if not route:
        return {"has_consequences": False, "details": "Route not found."}

    # Find any trips for today that use this route and are not already completed or cancelled
    active_trips = db.query(DailyTrip).filter(
        DailyTrip.route_id == route.id,
        DailyTrip.live_status.in_(['scheduled', 'in_progress'])
    ).all()

    if not active_trips:
        return {"has_consequences": False}

    trip_names = [trip.display_name for trip in active_trips]
    
    return {
        "has_consequences": True,
        "details": (
            f"This route is used by {len(active_trips)} active trip(s) today: {', '.join(trip_names)}. "
            "Deactivating the route may cause issues with these trips."
        )
    }

@tool
def list_stops_for_path(path_name: str) -> str:
    """Returns an ordered list of stop names for a given path name."""
    db: Session = SessionLocal()
    path = db.query(Path).filter(Path.name == path_name).first()
    if not path:
        db.close()
        return f"Path '{path_name}' not found."
    
    stop_ids = [int(sid) for sid in path.ordered_stop_ids.split(',')]
    stops = db.query(Stop).filter(Stop.id.in_(stop_ids)).all()
    
    # Order the stops correctly based on the path's ordered_stop_ids
    stop_map = {stop.id: stop.name for stop in stops}
    ordered_stop_names = [stop_map[sid] for sid in stop_ids if sid in stop_map]
    
    db.close()
    return f"Stops for '{path_name}': {', '.join(ordered_stop_names)}"

@tool
def find_routes_for_path(path_name: str) -> str:
    """Finds all routes that are based on a specific path name."""
    db: Session = SessionLocal()
    path = db.query(Path).filter(Path.name == path_name).first()
    if not path:
        db.close()
        return f"Path '{path_name}' not found."
    
    routes = db.query(Route).filter(Route.path_id == path.id).all()
    if not routes:
        db.close()
        return f"No routes found for path '{path_name}'."
    
    db.close()
    return f"Routes using '{path_name}': {[r.display_name for r in routes]}"

@tool
def assign_vehicle_to_trip(vehicle_license_plate: str, driver_name: str, trip_display_name: str) -> str:
    """Assigns a vehicle and a driver to a specific daily trip."""
    db: Session = SessionLocal()
    
    trip = db.query(DailyTrip).filter(DailyTrip.display_name == trip_display_name).first()
    if not trip:
        db.close()
        return f"Error: Trip '{trip_display_name}' not found."
        
    vehicle = db.query(Vehicle).filter(Vehicle.license_plate == vehicle_license_plate).first()
    if not vehicle:
        db.close()
        return f"Error: Vehicle '{vehicle_license_plate}' not found."
        
    driver = db.query(Driver).filter(Driver.name == driver_name).first()
    if not driver:
        db.close()
        return f"Error: Driver '{driver_name}' not found."

    # Check if trip already has a deployment
    existing_deployment = db.query(Deployment).filter(Deployment.trip_id == trip.id).first()
    if existing_deployment:
        db.close()
        return f"Error: Trip '{trip_display_name}' already has a vehicle assigned. Please remove it first."

    new_deployment = Deployment(trip_id=trip.id, vehicle_id=vehicle.id, driver_id=driver.id)
    db.add(new_deployment)
    db.commit()
    db.close()
    
    return f"Successfully assigned vehicle {vehicle_license_plate} and driver {driver_name} to trip '{trip_display_name}'."

@tool
def create_new_stop(stop_name: str, latitude: float, longitude: float) -> str:
    """Creates a new stop in the database."""
    db: Session = SessionLocal()
    existing_stop = db.query(Stop).filter(Stop.name == stop_name).first()
    if existing_stop:
        db.close()
        return f"Error: A stop with the name '{stop_name}' already exists."
    
    new_stop = Stop(name=stop_name, latitude=latitude, longitude=longitude)
    db.add(new_stop)
    db.commit()
    db.close()
    
    return f"Successfully created new stop: '{stop_name}'."

@tool
def create_new_path(path_name: str, stop_names: List[str]) -> str:
    """Creates a new path using an ordered list of existing stop names."""
    if len(stop_names) < 2:
        return "Error: A path requires at least two stops."
    
    db: Session = SessionLocal()
    
    stops = db.query(Stop).filter(Stop.name.in_(stop_names)).all()
    stop_map = {stop.name: stop.id for stop in stops}
    
    # Check if all stops were found
    if len(stops) != len(stop_names):
        found_names = set(stop_map.keys())
        missing_names = [name for name in stop_names if name not in found_names]
        db.close()
        return f"Error: The following stops were not found: {', '.join(missing_names)}. Please create them first."
    
    # Ensure the order is preserved
    ordered_stop_ids = [str(stop_map[name]) for name in stop_names]
    
    new_path = Path(name=path_name, ordered_stop_ids=",".join(ordered_stop_ids))
    db.add(new_path)
    db.commit()
    db.close()
    
    return f"Successfully created new path '{path_name}' with stops: {', '.join(stop_names)}."

@tool
def update_route_status(route_display_name: str, new_status: str) -> str:
    """Updates the status of a route. Valid statuses are 'active' or 'deactivated'."""
    db: Session = SessionLocal()
    route = db.query(Route).filter(Route.display_name == route_display_name).first()
    if not route:
        db.close()
        return f"Error: Route '{route_display_name}' not found."
    
    if new_status.lower() not in ['active', 'deactivated']:
        db.close()
        return "Error: Invalid status. Please use 'active' or 'deactivated'."
    
    route.status = StatusEnum[new_status.lower()]
    db.commit()
    db.close()
    
    return f"Successfully updated status of route '{route_display_name}' to {new_status}."

@tool
def get_deployment_details(trip_display_name: str) -> str:
    """Gets the assigned vehicle and driver details for a specific trip."""
    db: Session = SessionLocal()
    trip = db.query(DailyTrip).filter(DailyTrip.display_name == trip_display_name).first()
    if not trip:
        db.close()
        return f"Trip '{trip_display_name}' not found."

    deployment = db.query(Deployment).filter(Deployment.trip_id == trip.id).first()
    if not deployment:
        db.close()
        return f"No vehicle is currently deployed for the trip '{trip_display_name}'."

    vehicle = db.query(Vehicle).get(deployment.vehicle_id)
    driver = db.query(Driver).get(deployment.driver_id)
    db.close()
    
    return (
        f"Deployment for '{trip_display_name}':\n"
        f"- Vehicle: {vehicle.license_plate} ({vehicle.type}, {vehicle.capacity} seats)\n"
        f"- Driver: {driver.name} (Contact: {driver.phone_number})"
    )

# ... (add this function anywhere in the file)

@tool
def create_new_trip(route_display_name: str, trip_display_name: str, live_status: str = "scheduled") -> str:
    """Creates a new daily trip for a given route with a specific display name and status."""
    db: Session = SessionLocal()
    
    # Find the route to link the trip to
    route = db.query(Route).filter(Route.display_name == route_display_name).first()
    if not route:
        db.close()
        return f"Error: The route '{route_display_name}' could not be found. Please ensure the route exists."
        
    # Check if a trip with the same name already exists for today (optional, but good practice)
    existing_trip = db.query(DailyTrip).filter(DailyTrip.display_name == trip_display_name).first()
    if existing_trip:
        db.close()
        return f"Error: A trip named '{trip_display_name}' already exists for today."

    new_trip = DailyTrip(
        route_id=route.id,
        display_name=trip_display_name,
        live_status=live_status,
        booking_status_percentage=0 # Trips start with 0 bookings
    )
    db.add(new_trip)
    db.commit()
    db.close()
    
    return f"Successfully created new trip '{trip_display_name}' for route '{route_display_name}' with status '{live_status}'."