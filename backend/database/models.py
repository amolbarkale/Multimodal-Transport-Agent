from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey, DateTime, Enum as SQLAlchemyEnum
from sqlalchemy.orm import relationship, declarative_base
import enum

Base = declarative_base()

class StatusEnum(enum.Enum):
    active = 'active'
    deactivated = 'deactivated'

class Stop(Base):
    __tablename__ = 'stops'
    stop_id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    latitude = Column(Float)
    longitude = Column(Float)

class Path(Base):
    __tablename__ = 'paths'
    path_id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    ordered_stop_ids = Column(String, nullable=False)

class Route(Base):
    __tablename__ = 'routes'
    route_id = Column(Integer, primary_key=True)
    # --- CORRECTED FOREIGN KEY ---
    path_id = Column(Integer, ForeignKey('paths.path_id'))
    display_name = Column(String, nullable=False)
    shift_time = Column(String, nullable=False)
    direction = Column(String)
    start_point = Column(String)
    end_point = Column(String)
    status = Column(SQLAlchemyEnum(StatusEnum), default=StatusEnum.active)
    path = relationship("Path")

class Vehicle(Base):
    __tablename__ = 'vehicles'
    vehicle_id = Column(Integer, primary_key=True)
    license_plate = Column(String, unique=True, nullable=False)
    type = Column(String)
    capacity = Column(Integer)

class Driver(Base):
    __tablename__ = 'drivers'
    driver_id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    phone_number = Column(String, unique=True)

class DailyTrip(Base):
    __tablename__ = 'daily_trips'
    trip_id = Column(Integer, primary_key=True)
    # --- CORRECTED FOREIGN KEY ---
    route_id = Column(Integer, ForeignKey('routes.route_id'))
    display_name = Column(String, nullable=False)
    trip_date = Column(DateTime)
    booking_status_percentage = Column(Integer, default=0)
    live_status = Column(String, default="NOT_STARTED")
    route = relationship("Route")

class Deployment(Base):
    __tablename__ = 'deployments'
    deployment_id = Column(Integer, primary_key=True)
    # --- CORRECTED FOREIGN KEYS ---
    trip_id = Column(Integer, ForeignKey('daily_trips.trip_id'), unique=True)
    vehicle_id = Column(Integer, ForeignKey('vehicles.vehicle_id'))
    driver_id = Column(Integer, ForeignKey('drivers.driver_id'))
    trip = relationship("DailyTrip")
    vehicle = relationship("Vehicle")
    driver = relationship("Driver")