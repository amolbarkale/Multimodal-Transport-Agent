from sqlalchemy import (
    Column, Integer, String, Float, ForeignKey, Enum, Time
)
from sqlalchemy.orm import relationship, declarative_base
import enum
from database import Base

# ----------------------------
# ENUM DEFINITIONS
# ----------------------------
class RouteStatus(enum.Enum):
    active = "active"
    deactivated = "deactivated"


class VehicleType(enum.Enum):
    bus = "bus"
    cab = "cab"


# ----------------------------
# STATIC ASSETS
# ----------------------------

class Stop(Base):
    __tablename__ = "stops"

    stop_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

    # Relationships
    path_stops = relationship("PathStop", back_populates="stop")


class Path(Base):
    __tablename__ = "paths"

    path_id = Column(Integer, primary_key=True, index=True)
    path_name = Column(String, nullable=False)

    # Relationship to ordered stops
    stops = relationship("PathStop", back_populates="path", cascade="all, delete-orphan")

    # Relationship to routes
    routes = relationship("Route", back_populates="path")


class PathStop(Base):
    """
    Many-to-many with ordering between Path and Stop.
    Stores the stop sequence in a given path.
    """
    __tablename__ = "path_stops"

    id = Column(Integer, primary_key=True)
    path_id = Column(Integer, ForeignKey("paths.path_id"))
    stop_id = Column(Integer, ForeignKey("stops.stop_id"))
    stop_order = Column(Integer, nullable=False)

    path = relationship("Path", back_populates="stops")
    stop = relationship("Stop", back_populates="path_stops")


class Route(Base):
    __tablename__ = "routes"

    route_id = Column(Integer, primary_key=True, index=True)
    path_id = Column(Integer, ForeignKey("paths.path_id"))
    route_display_name = Column(String, nullable=False)
    shift_time = Column(Time, nullable=False)
    direction = Column(String, nullable=False)
    start_point = Column(String, nullable=False)
    end_point = Column(String, nullable=False)
    status = Column(Enum(RouteStatus), default=RouteStatus.active)
    capacity = Column(Integer, nullable=False)
    allocated_waitlist = Column(Integer, nullable=False, default=0)

    # Relationships
    path = relationship("Path", back_populates="routes")
    daily_trips = relationship("DailyTrip", back_populates="route")


class Vehicle(Base):
    __tablename__ = "vehicles"

    vehicle_id = Column(Integer, primary_key=True, index=True)
    license_plate = Column(String, unique=True, nullable=False)
    type = Column(Enum(VehicleType), nullable=False)
    capacity = Column(Integer, nullable=False)
    status = Column(String, nullable=False, default="active")

    deployments = relationship("Deployment", back_populates="vehicle")


class Driver(Base):
    __tablename__ = "drivers"

    driver_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    phone_number = Column(String, unique=True, nullable=False)

    deployments = relationship("Deployment", back_populates="driver")


class DailyTrip(Base):
    __tablename__ = "daily_trips"

    trip_id = Column(Integer, primary_key=True, index=True)
    route_id = Column(Integer, ForeignKey("routes.route_id"))
    display_name = Column(String, nullable=False)
    booking_status_percentage = Column(Float, nullable=False)
    live_status = Column(String, nullable=False)

    route = relationship("Route", back_populates="daily_trips")
    deployments = relationship("Deployment", back_populates="trip")


class Deployment(Base):
    __tablename__ = "deployments"

    deployment_id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("daily_trips.trip_id"))
    vehicle_id = Column(Integer, ForeignKey("vehicles.vehicle_id"))
    driver_id = Column(Integer, ForeignKey("drivers.driver_id"))

    trip = relationship("DailyTrip", back_populates="deployments")
    vehicle = relationship("Vehicle", back_populates="deployments")
    driver = relationship("Driver", back_populates="deployments")
