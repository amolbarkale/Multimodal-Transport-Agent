from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from schemas import DeploymentCreate, DeploymentResponse, VehicleResponse, DriverResponse
import crud.deployment as deployment_crud

router = APIRouter(prefix="/deployments", tags=["deployments"])


# ----------------------------
# CREATE ENDPOINTS
# ----------------------------

@router.post("/", response_model=DeploymentResponse, status_code=201)
def create_deployment(deployment: DeploymentCreate, db: Session = Depends(get_db)):
    """
    Create a new deployment.
    Validates that trip, vehicle, and driver exist.
    Checks for conflicts (vehicle/driver already deployed to the trip).
    """
    try:
        return deployment_crud.create_deployment(db, deployment)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating deployment: {str(e)}")


@router.post("/bulk", response_model=List[DeploymentResponse], status_code=201)
def bulk_create_deployments(deployments: List[DeploymentCreate], db: Session = Depends(get_db)):
    """
    Create multiple deployments at once.
    """
    try:
        return deployment_crud.create_bulk_deployments(db, deployments)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating deployments: {str(e)}")


# ----------------------------
# READ ENDPOINTS
# ----------------------------

@router.get("/", response_model=DeploymentResponse)
def get_deployment_by_id(
    deployment_id: int = Query(..., description="Deployment ID"), 
    db: Session = Depends(get_db)
):
    """Get a specific deployment by ID."""
    deployment = deployment_crud.get_deployment_by_id(db, deployment_id)
    if not deployment:
        raise HTTPException(status_code=404, detail=f"Deployment with id {deployment_id} not found")
    return deployment


@router.get("/all", response_model=List[DeploymentResponse])
def get_all_deployments(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """
    Get all deployments with pagination.
    """
    return deployment_crud.get_all_deployments(db, skip=skip, limit=limit)


@router.get("/{deployment_id}", response_model=DeploymentResponse)
def get_deployment(deployment_id: int, db: Session = Depends(get_db)):
    """Get a specific deployment by ID."""
    deployment = deployment_crud.get_deployment_by_id(db, deployment_id)
    if not deployment:
        raise HTTPException(status_code=404, detail=f"Deployment with id {deployment_id} not found")
    return deployment


@router.get("/trip/{trip_id}", response_model=List[DeploymentResponse])
def get_deployments_by_trip(trip_id: int, db: Session = Depends(get_db)):
    """
    Get all deployments for a specific trip.
    """
    return deployment_crud.get_deployments_by_trip(db, trip_id)


@router.get("/vehicle/{vehicle_id}", response_model=List[DeploymentResponse])
def get_deployments_by_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    """
    Get all deployments for a specific vehicle.
    """
    return deployment_crud.get_deployments_by_vehicle(db, vehicle_id)


@router.get("/driver/{driver_id}", response_model=List[DeploymentResponse])
def get_deployments_by_driver(driver_id: int, db: Session = Depends(get_db)):
    """
    Get all deployments for a specific driver.
    """
    return deployment_crud.get_deployments_by_driver(db, driver_id)


@router.get("/trip/{trip_id}/vehicle/{vehicle_id}", response_model=DeploymentResponse)
def get_deployment_by_trip_and_vehicle(
    trip_id: int, 
    vehicle_id: int, 
    db: Session = Depends(get_db)
):
    """
    Get deployment for a specific trip-vehicle combination.
    """
    deployment = deployment_crud.get_deployment_by_trip_and_vehicle(db, trip_id, vehicle_id)
    if not deployment:
        raise HTTPException(
            status_code=404, 
            detail=f"No deployment found for trip {trip_id} and vehicle {vehicle_id}"
        )
    return deployment


@router.get("/trip/{trip_id}/driver/{driver_id}", response_model=DeploymentResponse)
def get_deployment_by_trip_and_driver(
    trip_id: int, 
    driver_id: int, 
    db: Session = Depends(get_db)
):
    """
    Get deployment for a specific trip-driver combination.
    """
    deployment = deployment_crud.get_deployment_by_trip_and_driver(db, trip_id, driver_id)
    if not deployment:
        raise HTTPException(
            status_code=404, 
            detail=f"No deployment found for trip {trip_id} and driver {driver_id}"
        )
    return deployment


@router.get("/check/vehicle-availability", response_model=dict)
def check_vehicle_availability(
    vehicle_id: int = Query(..., description="Vehicle ID"),
    trip_id: int = Query(..., description="Trip ID"),
    db: Session = Depends(get_db)
):
    """
    Check if a vehicle is available (not already deployed) for a trip.
    """
    available = deployment_crud.check_vehicle_availability(db, vehicle_id, trip_id)
    return {
        "vehicle_id": vehicle_id,
        "trip_id": trip_id,
        "available": available
    }


@router.get("/check/driver-availability", response_model=dict)
def check_driver_availability(
    driver_id: int = Query(..., description="Driver ID"),
    trip_id: int = Query(..., description="Trip ID"),
    db: Session = Depends(get_db)
):
    """
    Check if a driver is available (not already deployed) for a trip.
    """
    available = deployment_crud.check_driver_availability(db, driver_id, trip_id)
    return {
        "driver_id": driver_id,
        "trip_id": trip_id,
        "available": available
    }


@router.get("/trip/{trip_id}/available-vehicles", response_model=List[VehicleResponse])
def get_available_vehicles_for_trip(trip_id: int, db: Session = Depends(get_db)):
    """
    Get all vehicles that are not yet deployed to a specific trip.
    """
    return deployment_crud.get_available_vehicles_for_trip(db, trip_id)


@router.get("/trip/{trip_id}/available-drivers", response_model=List[DriverResponse])
def get_available_drivers_for_trip(trip_id: int, db: Session = Depends(get_db)):
    """
    Get all drivers that are not yet deployed to a specific trip.
    """
    return deployment_crud.get_available_drivers_for_trip(db, trip_id)


@router.get("/count/trip/{trip_id}", response_model=dict)
def get_count_by_trip(trip_id: int, db: Session = Depends(get_db)):
    """
    Get count of deployments for a specific trip.
    """
    count = deployment_crud.get_deployment_count_by_trip(db, trip_id)
    return {"trip_id": trip_id, "deployment_count": count}


@router.get("/count/vehicle/{vehicle_id}", response_model=dict)
def get_count_by_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    """
    Get count of deployments for a specific vehicle.
    """
    count = deployment_crud.get_deployment_count_by_vehicle(db, vehicle_id)
    return {"vehicle_id": vehicle_id, "deployment_count": count}


@router.get("/count/driver/{driver_id}", response_model=dict)
def get_count_by_driver(driver_id: int, db: Session = Depends(get_db)):
    """
    Get count of deployments for a specific driver.
    """
    count = deployment_crud.get_deployment_count_by_driver(db, driver_id)
    return {"driver_id": driver_id, "deployment_count": count}


@router.get("/count/total", response_model=dict)
def get_total_count(db: Session = Depends(get_db)):
    """
    Get the total count of all deployments.
    """
    count = deployment_crud.get_total_deployments_count(db)
    return {"total_count": count}


@router.get("/check/exists", response_model=dict)
def check_deployment_exists(
    deployment_id: int = Query(..., description="Deployment ID to check"),
    db: Session = Depends(get_db)
):
    """
    Check if a deployment exists.
    """
    exists = deployment_crud.check_deployment_exists(db, deployment_id)
    return {"deployment_id": deployment_id, "exists": exists}


# ----------------------------
# UPDATE ENDPOINTS
# ----------------------------

@router.put("/{deployment_id}", response_model=DeploymentResponse)
def update_deployment(
    deployment_id: int, 
    deployment_update: DeploymentCreate, 
    db: Session = Depends(get_db)
):
    """
    Update an existing deployment (full update).
    Validates all foreign keys and checks for conflicts.
    """
    try:
        updated_deployment = deployment_crud.update_deployment(db, deployment_id, deployment_update)
        if not updated_deployment:
            raise HTTPException(status_code=404, detail=f"Deployment with id {deployment_id} not found")
        return updated_deployment
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating deployment: {str(e)}")


@router.patch("/{deployment_id}", response_model=DeploymentResponse)
def partial_update_deployment(
    deployment_id: int, 
    deployment_update: DeploymentCreate, 
    db: Session = Depends(get_db)
):
    """
    Partially update an existing deployment.
    """
    try:
        updated_deployment = deployment_crud.update_deployment(db, deployment_id, deployment_update)
        if not updated_deployment:
            raise HTTPException(status_code=404, detail=f"Deployment with id {deployment_id} not found")
        return updated_deployment
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating deployment: {str(e)}")


@router.patch("/{deployment_id}/vehicle", response_model=DeploymentResponse)
def update_deployment_vehicle(
    deployment_id: int,
    vehicle_id: int = Query(..., description="New vehicle ID"),
    db: Session = Depends(get_db)
):
    """
    Quick update for just the vehicle in a deployment.
    """
    try:
        updated_deployment = deployment_crud.update_deployment_vehicle(db, deployment_id, vehicle_id)
        if not updated_deployment:
            raise HTTPException(status_code=404, detail=f"Deployment with id {deployment_id} not found")
        return updated_deployment
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating deployment vehicle: {str(e)}")


@router.patch("/{deployment_id}/driver", response_model=DeploymentResponse)
def update_deployment_driver(
    deployment_id: int,
    driver_id: int = Query(..., description="New driver ID"),
    db: Session = Depends(get_db)
):
    """
    Quick update for just the driver in a deployment.
    """
    try:
        updated_deployment = deployment_crud.update_deployment_driver(db, deployment_id, driver_id)
        if not updated_deployment:
            raise HTTPException(status_code=404, detail=f"Deployment with id {deployment_id} not found")
        return updated_deployment
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating deployment driver: {str(e)}")


# ----------------------------
# DELETE ENDPOINTS
# ----------------------------

@router.delete("/{deployment_id}", response_model=dict)
def delete_deployment(deployment_id: int, db: Session = Depends(get_db)):
    """
    Delete a deployment by ID.
    """
    success = deployment_crud.delete_deployment(db, deployment_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Deployment with id {deployment_id} not found")
    return {"message": f"Deployment {deployment_id} deleted successfully"}


@router.delete("/trip/{trip_id}/all", response_model=dict)
def delete_deployments_by_trip(trip_id: int, db: Session = Depends(get_db)):
    """
    Delete all deployments for a specific trip.
    """
    count = deployment_crud.delete_deployments_by_trip(db, trip_id)
    return {"message": f"Deleted {count} deployments for trip {trip_id}", "deleted_count": count}


@router.delete("/vehicle/{vehicle_id}/all", response_model=dict)
def delete_deployments_by_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    """
    Delete all deployments for a specific vehicle.
    """
    count = deployment_crud.delete_deployments_by_vehicle(db, vehicle_id)
    return {"message": f"Deleted {count} deployments for vehicle {vehicle_id}", "deleted_count": count}


@router.delete("/driver/{driver_id}/all", response_model=dict)
def delete_deployments_by_driver(driver_id: int, db: Session = Depends(get_db)):
    """
    Delete all deployments for a specific driver.
    """
    count = deployment_crud.delete_deployments_by_driver(db, driver_id)
    return {"message": f"Deleted {count} deployments for driver {driver_id}", "deleted_count": count}


@router.delete("/bulk", response_model=dict)
def bulk_delete_deployments(
    deployment_ids: List[int] = Query(..., description="List of deployment IDs to delete"),
    db: Session = Depends(get_db)
):
    """
    Delete multiple deployments by their IDs.
    """
    count = deployment_crud.bulk_delete_deployments(db, deployment_ids)
    return {"message": f"Deleted {count} deployments", "deleted_count": count}
