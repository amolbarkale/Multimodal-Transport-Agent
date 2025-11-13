"""
CRUD operations for Vehicle model
"""
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.database.models import Vehicle, VehicleType
from schemas import VehicleCreate, VehicleResponse


def create_vehicle(db: Session, vehicle: VehicleCreate) -> Vehicle:
    """
    Create a new vehicle in the database.
    
    Args:
        db: Database session
        vehicle: VehicleCreate schema with vehicle details
        
    Returns:
        Created Vehicle object
    """
    db_vehicle = Vehicle(
        license_plate=vehicle.license_plate,
        type=vehicle.type,
        capacity=vehicle.capacity,
        status=vehicle.status
    )
    db.add(db_vehicle)
    db.commit()
    db.refresh(db_vehicle)
    return db_vehicle


def get_vehicle(db: Session, vehicle_id: int) -> Optional[Vehicle]:
    """
    Get a vehicle by ID.
    
    Args:
        db: Database session
        vehicle_id: ID of the vehicle to retrieve
        
    Returns:
        Vehicle object if found, None otherwise
    """
    return db.query(Vehicle).filter(Vehicle.vehicle_id == vehicle_id).first()


def get_vehicle_by_license_plate(db: Session, license_plate: str) -> Optional[Vehicle]:
    """
    Get a vehicle by license plate number.
    
    Args:
        db: Database session
        license_plate: License plate number
        
    Returns:
        Vehicle object if found, None otherwise
    """
    return db.query(Vehicle).filter(Vehicle.license_plate == license_plate).first()


def get_vehicles(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    vehicle_type: Optional[VehicleType] = None
) -> List[Vehicle]:
    """
    Get all vehicles with optional filtering and pagination.
    
    Args:
        db: Database session
        skip: Number of records to skip (for pagination)
        limit: Maximum number of records to return
        vehicle_type: Optional filter by vehicle type (Bus or Cab)
        
    Returns:
        List of Vehicle objects
    """
    query = db.query(Vehicle)
    
    if vehicle_type:
        query = query.filter(Vehicle.type == vehicle_type)
    
    return query.offset(skip).limit(limit).all()


def get_all_vehicles(db: Session) -> List[Vehicle]:
    """
    Get all vehicles without pagination.
    
    Args:
        db: Database session
        
    Returns:
        List of all Vehicle objects
    """
    return db.query(Vehicle).all()


def get_vehicles_by_type(db: Session, vehicle_type: VehicleType) -> List[Vehicle]:
    """
    Get all vehicles of a specific type.
    
    Args:
        db: Database session
        vehicle_type: Type of vehicle (Bus or Cab)
        
    Returns:
        List of Vehicle objects
    """
    return db.query(Vehicle).filter(Vehicle.type == vehicle_type).all()


def get_available_vehicles(db: Session, vehicle_type: Optional[VehicleType] = None) -> List[Vehicle]:
    """
    Get all vehicles that are not currently deployed (not assigned to any trip).
    This would need to be joined with Deployment table to check availability.
    For now, returns all vehicles - can be enhanced later.
    
    Args:
        db: Database session
        vehicle_type: Optional filter by vehicle type
        
    Returns:
        List of available Vehicle objects
    """
    # TODO: Add logic to check deployments and filter out assigned vehicles
    query = db.query(Vehicle)
    
    if vehicle_type:
        query = query.filter(Vehicle.type == vehicle_type)
    
    return query.all()


def update_vehicle(
    db: Session, 
    vehicle_id: int, 
    vehicle_update: VehicleCreate
) -> Optional[Vehicle]:
    """
    Update an existing vehicle.
    
    Args:
        db: Database session
        vehicle_id: ID of the vehicle to update
        vehicle_update: VehicleCreate schema with updated details
        
    Returns:
        Updated Vehicle object if found, None otherwise
    """
    db_vehicle = db.query(Vehicle).filter(Vehicle.vehicle_id == vehicle_id).first()
    
    if db_vehicle:
        db_vehicle.license_plate = vehicle_update.license_plate
        db_vehicle.type = vehicle_update.type
        db_vehicle.capacity = vehicle_update.capacity
        db_vehicle.status = vehicle_update.status
        
        db.commit()
        db.refresh(db_vehicle)
    
    return db_vehicle


def delete_vehicle(db: Session, vehicle_id: int) -> bool:
    """
    Delete a vehicle by ID.
    
    Args:
        db: Database session
        vehicle_id: ID of the vehicle to delete
        
    Returns:
        True if deleted successfully, False if not found
    """
    db_vehicle = db.query(Vehicle).filter(Vehicle.vehicle_id == vehicle_id).first()
    
    if db_vehicle:
        db.delete(db_vehicle)
        db.commit()
        return True
    
    return False


def get_vehicle_count(db: Session, vehicle_type: Optional[VehicleType] = None) -> int:
    """
    Get the total count of vehicles.
    
    Args:
        db: Database session
        vehicle_type: Optional filter by vehicle type
        
    Returns:
        Total count of vehicles
    """
    query = db.query(Vehicle)
    
    if vehicle_type:
        query = query.filter(Vehicle.type == vehicle_type)
    
    return query.count()


def search_vehicles(
    db: Session, 
    search_term: str,
    skip: int = 0,
    limit: int = 100
) -> List[Vehicle]:
    """
    Search vehicles by license plate (partial match).
    
    Args:
        db: Database session
        search_term: Search string to match against license plate
        skip: Number of records to skip
        limit: Maximum number of records to return
        
    Returns:
        List of matching Vehicle objects
    """
    return db.query(Vehicle)\
        .filter(Vehicle.license_plate.ilike(f"%{search_term}%"))\
        .offset(skip)\
        .limit(limit)\
        .all()


def get_vehicles_by_capacity_range(
    db: Session,
    min_capacity: int,
    max_capacity: int
) -> List[Vehicle]:
    """
    Get vehicles within a specific capacity range.
    
    Args:
        db: Database session
        min_capacity: Minimum capacity
        max_capacity: Maximum capacity
        
    Returns:
        List of Vehicle objects within the capacity range
    """
    return db.query(Vehicle)\
        .filter(Vehicle.capacity >= min_capacity)\
        .filter(Vehicle.capacity <= max_capacity)\
        .all()


def get_vehicles_by_status(db: Session, status: str) -> List[Vehicle]:
    """
    Get vehicles by status.
    
    Args:
        db: Database session
        status: Status to filter by
        
    Returns:
        List of Vehicle objects with the specified status
    """
    return db.query(Vehicle).filter(Vehicle.status == status).all()


def bulk_create_vehicles(db: Session, vehicles: List[VehicleCreate]) -> List[Vehicle]:
    """
    Create multiple vehicles at once.
    
    Args:
        db: Database session
        vehicles: List of VehicleCreate schemas
        
    Returns:
        List of created Vehicle objects
    """
    db_vehicles = [
        Vehicle(
            license_plate=vehicle.license_plate,
            type=vehicle.type,
            capacity=vehicle.capacity,
            status=vehicle.status
        )
        for vehicle in vehicles
    ]
    
    db.add_all(db_vehicles)
    db.commit()
    
    for vehicle in db_vehicles:
        db.refresh(vehicle)
    
    return db_vehicles
