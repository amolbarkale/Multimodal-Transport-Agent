from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship, declarative_base
import enum

Base = declarative_base()

class StatusEnum(enum.Enum):
    active = 'active'
    deactivated = 'deactivated'

class Stop(Base):
    __tablename__ = 'stops'
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    latitude = Column(Float)
    longitude = Column(Float)

class Path(Base):
    __tablename__ = 'paths'
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    # Stored as a comma-separated string of stop IDs in order
    ordered_stop_ids = Column(String, nullable=False)

class Route(Base):
    __tablename__ = 'routes'
    id = Column(Integer, primary_key=True)
    path_id = Column(Integer, ForeignKey('paths.id'))
    display_name = Column(String, nullable=False)
    shift_time = Column(String, nullable=False) # e.g., "19:45"
    direction = Column(String) # e.g., "UP" or "DOWN"
    start_point = Column(String)
    end_point = Column(String)
    status = Column(Enum(StatusEnum), default=StatusEnum.active)
    path = relationship("Path")

class Vehicle(Base):
    __tablename__ = 'vehicles'
    id = Column(Integer, primary_key=True)
    license_plate = Column(String, unique=True, nullable=False)
    type = Column(String) # "Bus", "Cab"
    capacity = Column(Integer)

class Driver(Base):
    __tablename__ = 'drivers'
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    phone_number = Column(String, unique=True)

class DailyTrip(Base):
    __tablename__ = 'daily_trips'
    id = Column(Integer, primary_key=True)
    route_id = Column(Integer, ForeignKey('routes.id'))
    display_name = Column(String, nullable=False) # e.g., "Bulk - 00:01"
    trip_date = Column(DateTime)
    booking_status_percentage = Column(Integer, default=0)
    live_status = Column(String, default="NOT_STARTED")
    route = relationship("Route")

class Deployment(Base):
    __tablename__ = 'deployments'
    id = Column(Integer, primary_key=True)
    trip_id = Column(Integer, ForeignKey('daily_trips.id'), unique=True) # A trip has one deployment
    vehicle_id = Column(Integer, ForeignKey('vehicles.id'))
    driver_id = Column(Integer, ForeignKey('drivers.id'))
    trip = relationship("DailyTrip")
    vehicle = relationship("Vehicle")
    driver = relationship("Driver")