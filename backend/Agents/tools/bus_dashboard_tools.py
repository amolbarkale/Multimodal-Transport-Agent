"""
Bus Dashboard Tools
Tools for managing trips, deployments, vehicles, and drivers
"""
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from database import get_db
from models import Vehicle, Driver, DailyTrip, Deployment
from langchain_core.tools import tool


@tool
def get_unassigned_vehicles() -> Dict[str, Any]:
    """
    Get count and list of vehicles that are not assigned to any trip.
    
    Returns:
        Dictionary with count and list of unassigned vehicles
    """
    db = next(get_db())
    try:
        # Get all active vehicles
        all_vehicles = db.query(Vehicle).filter(Vehicle.status == "active").all()
        
        # Get all deployed vehicle IDs
        deployed_vehicle_ids = db.query(Deployment.vehicle_id).distinct().all()
        deployed_ids = {vid[0] for vid in deployed_vehicle_ids}
        
        # Filter unassigned vehicles
        unassigned = [v for v in all_vehicles if v.vehicle_id not in deployed_ids]
        
        return {
            "count": len(unassigned),
            "vehicles": [
                {
                    "vehicle_id": v.vehicle_id,
                    "license_plate": v.license_plate,
                    "type": v.type.value,
                    "capacity": v.capacity,
                    "status": v.status
                }
                for v in unassigned
            ]
        }
    finally:
        db.close()


@tool
def get_trip_status(trip_identifier: str) -> Dict[str, Any]:
    """
    Get the status and details of a specific trip.
    
    Args:
        trip_identifier: Trip display name or trip_id
    
    Returns:
        Dictionary with trip status, booking percentage, deployments, etc.
    """
    db = next(get_db())
    try:
        # Try to find trip by ID first, then by display name
        trip = None
        if trip_identifier.isdigit():
            trip = db.query(DailyTrip).filter(DailyTrip.trip_id == int(trip_identifier)).first()
        
        if not trip:
            trip = db.query(DailyTrip).filter(DailyTrip.display_name.ilike(f"%{trip_identifier}%")).first()
        
        if not trip:
            return {"error": f"Trip '{trip_identifier}' not found"}
        
        # Get deployments for this trip
        deployments = db.query(Deployment).filter(Deployment.trip_id == trip.trip_id).all()
        
        # Get vehicle and driver details
        deployment_details = []
        for dep in deployments:
            vehicle = db.query(Vehicle).filter(Vehicle.vehicle_id == dep.vehicle_id).first()
            driver = db.query(Driver).filter(Driver.driver_id == dep.driver_id).first()
            
            deployment_details.append({
                "deployment_id": dep.deployment_id,
                "vehicle": {
                    "vehicle_id": vehicle.vehicle_id if vehicle else None,
                    "license_plate": vehicle.license_plate if vehicle else None
                },
                "driver": {
                    "driver_id": driver.driver_id if driver else None,
                    "name": driver.name if driver else None,
                    "phone": driver.phone_number if driver else None
                }
            })
        
        return {
            "trip_id": trip.trip_id,
            "display_name": trip.display_name,
            "route_id": trip.route_id,
            "live_status": trip.live_status,
            "booking_status_percentage": trip.booking_status_percentage,
            "deployments": deployment_details,
            "deployment_count": len(deployments)
        }
    finally:
        db.close()


@tool
def assign_vehicle_to_trip(
    trip_identifier: str,
    vehicle_identifier: str,
    driver_identifier: str
) -> Dict[str, Any]:
    """
    Assign a vehicle and driver to a trip (create deployment).
    
    Args:
        trip_identifier: Trip display name or ID
        vehicle_identifier: Vehicle registration number or ID
        driver_identifier: Driver name or ID
    
    Returns:
        Dictionary with deployment details or error
    """
    db = next(get_db())
    try:
        # Find trip
        trip = None
        if trip_identifier.isdigit():
            trip = db.query(DailyTrip).filter(DailyTrip.trip_id == int(trip_identifier)).first()
        if not trip:
            trip = db.query(DailyTrip).filter(DailyTrip.display_name.ilike(f"%{trip_identifier}%")).first()
        
        if not trip:
            return {"error": f"Trip '{trip_identifier}' not found"}
        
        # Find vehicle
        vehicle = None
        if vehicle_identifier.isdigit():
            vehicle = db.query(Vehicle).filter(Vehicle.vehicle_id == int(vehicle_identifier)).first()
        if not vehicle:
            vehicle = db.query(Vehicle).filter(Vehicle.license_plate.ilike(f"%{vehicle_identifier}%")).first()
        
        if not vehicle:
            return {"error": f"Vehicle '{vehicle_identifier}' not found"}
        
        # Find driver
        driver = None
        if driver_identifier.isdigit():
            driver = db.query(Driver).filter(Driver.driver_id == int(driver_identifier)).first()
        if not driver:
            driver = db.query(Driver).filter(Driver.name.ilike(f"%{driver_identifier}%")).first()
        
        if not driver:
            return {"error": f"Driver '{driver_identifier}' not found"}
        
        # Check if vehicle is already deployed to this trip
        existing = db.query(Deployment).filter(
            Deployment.trip_id == trip.trip_id,
            Deployment.vehicle_id == vehicle.vehicle_id
        ).first()
        
        if existing:
            return {"error": f"Vehicle '{vehicle.license_plate}' is already assigned to trip '{trip.display_name}'"}
        
        # Create deployment
        deployment = Deployment(
            trip_id=trip.trip_id,
            vehicle_id=vehicle.vehicle_id,
            driver_id=driver.driver_id
        )
        db.add(deployment)
        db.commit()
        db.refresh(deployment)
        
        return {
            "success": True,
            "message": f"Successfully assigned vehicle '{vehicle.license_plate}' and driver '{driver.name}' to trip '{trip.display_name}'",
            "deployment_id": deployment.deployment_id,
            "trip": trip.display_name,
            "vehicle": vehicle.license_plate,
            "driver": driver.name
        }
        
    except Exception as e:
        db.rollback()
        return {"error": f"Failed to assign vehicle: {str(e)}"}
    finally:
        db.close()


@tool
def remove_vehicle_from_trip(trip_identifier: str) -> Dict[str, Any]:
    """
    Remove all vehicles/deployments from a trip.
    
    Args:
        trip_identifier: Trip display name or ID
    
    Returns:
        Dictionary with success message or error
    """
    db = next(get_db())
    try:
        # Find trip
        trip = None
        if trip_identifier.isdigit():
            trip = db.query(DailyTrip).filter(DailyTrip.trip_id == int(trip_identifier)).first()
        if not trip:
            trip = db.query(DailyTrip).filter(DailyTrip.display_name.ilike(f"%{trip_identifier}%")).first()
        
        if not trip:
            return {"error": f"Trip '{trip_identifier}' not found"}
        
        # Get deployments
        deployments = db.query(Deployment).filter(Deployment.trip_id == trip.trip_id).all()
        
        if not deployments:
            return {"error": f"No vehicles assigned to trip '{trip.display_name}'"}
        
        # Delete deployments
        count = len(deployments)
        for dep in deployments:
            db.delete(dep)
        
        db.commit()
        
        return {
            "success": True,
            "message": f"Successfully removed {count} vehicle(s) from trip '{trip.display_name}'",
            "trip": trip.display_name,
            "removed_count": count
        }
        
    except Exception as e:
        db.rollback()
        return {"error": f"Failed to remove vehicle: {str(e)}"}
    finally:
        db.close()
