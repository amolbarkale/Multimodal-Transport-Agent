from pydantic import BaseModel
from typing import List

# Using from_attributes = True (formerly orm_mode) to auto-map from SQLAlchemy models

class Stop(BaseModel):
    stop_id: int
    name: str
    latitude: float
    longitude: float

    class Config:
        from_attributes = True

class Path(BaseModel):
    path_id: int
    name: str
    ordered_stop_ids: str

    class Config:
        from_attributes = True

class Route(BaseModel):
    route_id: int
    path_id: int
    display_name: str
    shift_time: str

    class Config:
        from_attributes = True

class Vehicle(BaseModel):
    vehicle_id: int
    license_plate: str
    type: str
    capacity: int

    class Config:
        from_attributes = True

class Driver(BaseModel):
    driver_id: int
    name: str
    phone_number: str

    class Config:
        from_attributes = True
        
class DailyTrip(BaseModel):
    trip_id: int
    route_id: int
    display_name: str
    booking_status_percentage: int
    live_status: str

    class Config:
        from_attributes = True