from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import time
from enum import Enum


# ----------------------------
# ENUMS
# ----------------------------
class RouteStatus(str, Enum):
    active = "active"
    deactivated = "deactivated"


class VehicleType(str, Enum):
    bus = "bus"
    cab = "cab"


# ----------------------------
# STATIC ASSETS
# ----------------------------

class StopBase(BaseModel):
    name: str
    latitude: float
    longitude: float


class StopCreate(StopBase):
    pass


class StopResponse(StopBase):
    stop_id: int

    class Config:
        orm_mode = True


class PathStopBase(BaseModel):
    stop_id: int
    stop_order: int


class PathBase(BaseModel):
    path_name: str
    stops: List[PathStopBase]


class PathCreate(PathBase):
    pass


class PathResponse(BaseModel):
    path_id: int
    path_name: str
    stops: List[PathStopBase]

    class Config:
        orm_mode = True


class RouteBase(BaseModel):
    path_id: int
    route_display_name: str
    shift_time: time
    direction: str
    start_point: str
    end_point: str
    capacity: int
    allocated_waitlist: int = 0
    status: RouteStatus = RouteStatus.active


class RouteCreate(RouteBase):
    pass


class RouteResponse(RouteBase):
    route_id: int

    class Config:
        orm_mode = True


# ----------------------------
# DYNAMIC ASSETS
# ----------------------------

class VehicleBase(BaseModel):
    license_plate: str
    type: VehicleType
    capacity: int
    status: str = "active"


class VehicleCreate(VehicleBase):
    pass


class VehicleResponse(VehicleBase):
    vehicle_id: int

    class Config:
        orm_mode = True


class DriverBase(BaseModel):
    name: str
    phone_number: str


class DriverCreate(DriverBase):
    pass


class DriverResponse(DriverBase):
    driver_id: int

    class Config:
        orm_mode = True


class DailyTripBase(BaseModel):
    route_id: int
    display_name: str
    booking_status_percentage: float = 0.0
    live_status: str = "scheduled"


class DailyTripCreate(DailyTripBase):
    pass


class DailyTripResponse(DailyTripBase):
    trip_id: int

    class Config:
        orm_mode = True


class DeploymentBase(BaseModel):
    trip_id: int
    vehicle_id: int
    driver_id: int


class DeploymentCreate(DeploymentBase):
    pass


class DeploymentResponse(DeploymentBase):
    deployment_id: int

    class Config:
        orm_mode = True
