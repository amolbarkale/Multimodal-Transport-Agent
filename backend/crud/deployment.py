from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from backend.database.models import Deployment, DailyTrip, Vehicle, Driver
from schemas import DeploymentCreate
from typing import Optional, List


# ----------------------------
# CREATE
# ----------------------------

def create_deployment(db: Session, deployment: DeploymentCreate) -> Deployment:
    """
    Create a new deployment.
    Validates that trip, vehicle, and driver exist before creating.
    Also checks for conflicts (vehicle/driver already deployed).
    """
    # Validate that trip exists
    trip = db.query(DailyTrip).filter(DailyTrip.trip_id == deployment.trip_id).first()
    if not trip:
        raise ValueError(f"Trip with id {deployment.trip_id} does not exist")
    
    # Validate that vehicle exists
    vehicle = db.query(Vehicle).filter(Vehicle.vehicle_id == deployment.vehicle_id).first()
    if not vehicle:
        raise ValueError(f"Vehicle with id {deployment.vehicle_id} does not exist")
    
    # Validate that driver exists
    driver = db.query(Driver).filter(Driver.driver_id == deployment.driver_id).first()
    if not driver:
        raise ValueError(f"Driver with id {deployment.driver_id} does not exist")
    
    # Check if vehicle is already deployed to this trip
    existing_vehicle_deployment = db.query(Deployment).filter(
        and_(
            Deployment.trip_id == deployment.trip_id,
            Deployment.vehicle_id == deployment.vehicle_id
        )
    ).first()
    if existing_vehicle_deployment:
        raise ValueError(f"Vehicle {deployment.vehicle_id} is already deployed to trip {deployment.trip_id}")
    
    # Check if driver is already deployed to this trip
    existing_driver_deployment = db.query(Deployment).filter(
        and_(
            Deployment.trip_id == deployment.trip_id,
            Deployment.driver_id == deployment.driver_id
        )
    ).first()
    if existing_driver_deployment:
        raise ValueError(f"Driver {deployment.driver_id} is already deployed to trip {deployment.trip_id}")
    
    db_deployment = Deployment(
        trip_id=deployment.trip_id,
        vehicle_id=deployment.vehicle_id,
        driver_id=deployment.driver_id
    )
    db.add(db_deployment)
    db.commit()
    db.refresh(db_deployment)
    return db_deployment


def create_bulk_deployments(db: Session, deployments: List[DeploymentCreate]) -> List[Deployment]:
    """
    Create multiple deployments at once.
    """
    db_deployments = []
    for deployment in deployments:
        # Validate trip, vehicle, and driver exist
        trip = db.query(DailyTrip).filter(DailyTrip.trip_id == deployment.trip_id).first()
        if not trip:
            raise ValueError(f"Trip with id {deployment.trip_id} does not exist")
        
        vehicle = db.query(Vehicle).filter(Vehicle.vehicle_id == deployment.vehicle_id).first()
        if not vehicle:
            raise ValueError(f"Vehicle with id {deployment.vehicle_id} does not exist")
        
        driver = db.query(Driver).filter(Driver.driver_id == deployment.driver_id).first()
        if not driver:
            raise ValueError(f"Driver with id {deployment.driver_id} does not exist")
        
        db_deployment = Deployment(
            trip_id=deployment.trip_id,
            vehicle_id=deployment.vehicle_id,
            driver_id=deployment.driver_id
        )
        db_deployments.append(db_deployment)
    
    db.add_all(db_deployments)
    db.commit()
    for deployment in db_deployments:
        db.refresh(deployment)
    return db_deployments


# ----------------------------
# READ
# ----------------------------

def get_deployment_by_id(db: Session, deployment_id: int) -> Optional[Deployment]:
    """
    Get a deployment by its ID.
    """
    return db.query(Deployment).filter(Deployment.deployment_id == deployment_id).first()


def get_all_deployments(db: Session, skip: int = 0, limit: int = 100) -> List[Deployment]:
    """
    Get all deployments with pagination.
    """
    return db.query(Deployment).offset(skip).limit(limit).all()


def get_deployments_by_trip(db: Session, trip_id: int) -> List[Deployment]:
    """
    Get all deployments for a specific trip.
    """
    return db.query(Deployment).filter(Deployment.trip_id == trip_id).all()


def get_deployments_by_vehicle(db: Session, vehicle_id: int) -> List[Deployment]:
    """
    Get all deployments for a specific vehicle.
    """
    return db.query(Deployment).filter(Deployment.vehicle_id == vehicle_id).all()


def get_deployments_by_driver(db: Session, driver_id: int) -> List[Deployment]:
    """
    Get all deployments for a specific driver.
    """
    return db.query(Deployment).filter(Deployment.driver_id == driver_id).all()


def get_deployment_by_trip_and_vehicle(
    db: Session, 
    trip_id: int, 
    vehicle_id: int
) -> Optional[Deployment]:
    """
    Get deployment for a specific trip-vehicle combination.
    """
    return db.query(Deployment).filter(
        and_(
            Deployment.trip_id == trip_id,
            Deployment.vehicle_id == vehicle_id
        )
    ).first()


def get_deployment_by_trip_and_driver(
    db: Session, 
    trip_id: int, 
    driver_id: int
) -> Optional[Deployment]:
    """
    Get deployment for a specific trip-driver combination.
    """
    return db.query(Deployment).filter(
        and_(
            Deployment.trip_id == trip_id,
            Deployment.driver_id == driver_id
        )
    ).first()


def check_vehicle_availability(db: Session, vehicle_id: int, trip_id: int) -> bool:
    """
    Check if a vehicle is available (not already deployed) for a trip.
    """
    deployment = db.query(Deployment).filter(
        and_(
            Deployment.trip_id == trip_id,
            Deployment.vehicle_id == vehicle_id
        )
    ).first()
    return deployment is None


def check_driver_availability(db: Session, driver_id: int, trip_id: int) -> bool:
    """
    Check if a driver is available (not already deployed) for a trip.
    """
    deployment = db.query(Deployment).filter(
        and_(
            Deployment.trip_id == trip_id,
            Deployment.driver_id == driver_id
        )
    ).first()
    return deployment is None


def get_available_vehicles_for_trip(db: Session, trip_id: int) -> List[Vehicle]:
    """
    Get all vehicles that are not yet deployed to a specific trip.
    """
    deployed_vehicle_ids = db.query(Deployment.vehicle_id).filter(
        Deployment.trip_id == trip_id
    ).all()
    deployed_ids = [vid[0] for vid in deployed_vehicle_ids]
    
    return db.query(Vehicle).filter(
        Vehicle.vehicle_id.notin_(deployed_ids)
    ).all()


def get_available_drivers_for_trip(db: Session, trip_id: int) -> List[Driver]:
    """
    Get all drivers that are not yet deployed to a specific trip.
    """
    deployed_driver_ids = db.query(Deployment.driver_id).filter(
        Deployment.trip_id == trip_id
    ).all()
    deployed_ids = [did[0] for did in deployed_driver_ids]
    
    return db.query(Driver).filter(
        Driver.driver_id.notin_(deployed_ids)
    ).all()


def get_deployment_count_by_trip(db: Session, trip_id: int) -> int:
    """
    Get count of deployments for a specific trip.
    """
    return db.query(Deployment).filter(Deployment.trip_id == trip_id).count()


def get_deployment_count_by_vehicle(db: Session, vehicle_id: int) -> int:
    """
    Get count of deployments for a specific vehicle.
    """
    return db.query(Deployment).filter(Deployment.vehicle_id == vehicle_id).count()


def get_deployment_count_by_driver(db: Session, driver_id: int) -> int:
    """
    Get count of deployments for a specific driver.
    """
    return db.query(Deployment).filter(Deployment.driver_id == driver_id).count()


def get_total_deployments_count(db: Session) -> int:
    """
    Get the total count of all deployments.
    """
    return db.query(Deployment).count()


def check_deployment_exists(db: Session, deployment_id: int) -> bool:
    """
    Check if a deployment exists.
    """
    return db.query(Deployment).filter(
        Deployment.deployment_id == deployment_id
    ).first() is not None


# ----------------------------
# UPDATE
# ----------------------------

def update_deployment(
    db: Session, 
    deployment_id: int, 
    deployment_update: DeploymentCreate
) -> Optional[Deployment]:
    """
    Update an existing deployment.
    Validates all foreign keys and checks for conflicts.
    """
    db_deployment = db.query(Deployment).filter(
        Deployment.deployment_id == deployment_id
    ).first()
    if not db_deployment:
        return None
    
    # Validate trip if changed
    if deployment_update.trip_id != db_deployment.trip_id:
        trip = db.query(DailyTrip).filter(DailyTrip.trip_id == deployment_update.trip_id).first()
        if not trip:
            raise ValueError(f"Trip with id {deployment_update.trip_id} does not exist")
    
    # Validate vehicle if changed
    if deployment_update.vehicle_id != db_deployment.vehicle_id:
        vehicle = db.query(Vehicle).filter(Vehicle.vehicle_id == deployment_update.vehicle_id).first()
        if not vehicle:
            raise ValueError(f"Vehicle with id {deployment_update.vehicle_id} does not exist")
        
        # Check for conflicts
        existing = db.query(Deployment).filter(
            and_(
                Deployment.trip_id == deployment_update.trip_id,
                Deployment.vehicle_id == deployment_update.vehicle_id,
                Deployment.deployment_id != deployment_id
            )
        ).first()
        if existing:
            raise ValueError(f"Vehicle {deployment_update.vehicle_id} is already deployed to trip {deployment_update.trip_id}")
    
    # Validate driver if changed
    if deployment_update.driver_id != db_deployment.driver_id:
        driver = db.query(Driver).filter(Driver.driver_id == deployment_update.driver_id).first()
        if not driver:
            raise ValueError(f"Driver with id {deployment_update.driver_id} does not exist")
        
        # Check for conflicts
        existing = db.query(Deployment).filter(
            and_(
                Deployment.trip_id == deployment_update.trip_id,
                Deployment.driver_id == deployment_update.driver_id,
                Deployment.deployment_id != deployment_id
            )
        ).first()
        if existing:
            raise ValueError(f"Driver {deployment_update.driver_id} is already deployed to trip {deployment_update.trip_id}")
    
    db_deployment.trip_id = deployment_update.trip_id
    db_deployment.vehicle_id = deployment_update.vehicle_id
    db_deployment.driver_id = deployment_update.driver_id
    
    db.commit()
    db.refresh(db_deployment)
    return db_deployment


def update_deployment_vehicle(
    db: Session, 
    deployment_id: int, 
    vehicle_id: int
) -> Optional[Deployment]:
    """
    Quick update for just the vehicle in a deployment.
    """
    db_deployment = db.query(Deployment).filter(
        Deployment.deployment_id == deployment_id
    ).first()
    if not db_deployment:
        return None
    
    # Validate vehicle exists
    vehicle = db.query(Vehicle).filter(Vehicle.vehicle_id == vehicle_id).first()
    if not vehicle:
        raise ValueError(f"Vehicle with id {vehicle_id} does not exist")
    
    # Check for conflicts
    existing = db.query(Deployment).filter(
        and_(
            Deployment.trip_id == db_deployment.trip_id,
            Deployment.vehicle_id == vehicle_id,
            Deployment.deployment_id != deployment_id
        )
    ).first()
    if existing:
        raise ValueError(f"Vehicle {vehicle_id} is already deployed to this trip")
    
    db_deployment.vehicle_id = vehicle_id
    db.commit()
    db.refresh(db_deployment)
    return db_deployment


def update_deployment_driver(
    db: Session, 
    deployment_id: int, 
    driver_id: int
) -> Optional[Deployment]:
    """
    Quick update for just the driver in a deployment.
    """
    db_deployment = db.query(Deployment).filter(
        Deployment.deployment_id == deployment_id
    ).first()
    if not db_deployment:
        return None
    
    # Validate driver exists
    driver = db.query(Driver).filter(Driver.driver_id == driver_id).first()
    if not driver:
        raise ValueError(f"Driver with id {driver_id} does not exist")
    
    # Check for conflicts
    existing = db.query(Deployment).filter(
        and_(
            Deployment.trip_id == db_deployment.trip_id,
            Deployment.driver_id == driver_id,
            Deployment.deployment_id != deployment_id
        )
    ).first()
    if existing:
        raise ValueError(f"Driver {driver_id} is already deployed to this trip")
    
    db_deployment.driver_id = driver_id
    db.commit()
    db.refresh(db_deployment)
    return db_deployment


# ----------------------------
# DELETE
# ----------------------------

def delete_deployment(db: Session, deployment_id: int) -> bool:
    """
    Delete a deployment by ID.
    """
    db_deployment = db.query(Deployment).filter(
        Deployment.deployment_id == deployment_id
    ).first()
    if not db_deployment:
        return False
    
    db.delete(db_deployment)
    db.commit()
    return True


def delete_deployments_by_trip(db: Session, trip_id: int) -> int:
    """
    Delete all deployments for a specific trip.
    Returns the number of deleted deployments.
    """
    count = db.query(Deployment).filter(Deployment.trip_id == trip_id).count()
    db.query(Deployment).filter(Deployment.trip_id == trip_id).delete(synchronize_session=False)
    db.commit()
    return count


def delete_deployments_by_vehicle(db: Session, vehicle_id: int) -> int:
    """
    Delete all deployments for a specific vehicle.
    Returns the number of deleted deployments.
    """
    count = db.query(Deployment).filter(Deployment.vehicle_id == vehicle_id).count()
    db.query(Deployment).filter(Deployment.vehicle_id == vehicle_id).delete(synchronize_session=False)
    db.commit()
    return count


def delete_deployments_by_driver(db: Session, driver_id: int) -> int:
    """
    Delete all deployments for a specific driver.
    Returns the number of deleted deployments.
    """
    count = db.query(Deployment).filter(Deployment.driver_id == driver_id).count()
    db.query(Deployment).filter(Deployment.driver_id == driver_id).delete(synchronize_session=False)
    db.commit()
    return count


def bulk_delete_deployments(db: Session, deployment_ids: List[int]) -> int:
    """
    Delete multiple deployments by their IDs.
    Returns the number of deleted deployments.
    """
    count = db.query(Deployment).filter(Deployment.deployment_id.in_(deployment_ids)).count()
    db.query(Deployment).filter(Deployment.deployment_id.in_(deployment_ids)).delete(synchronize_session=False)
    db.commit()
    return count
