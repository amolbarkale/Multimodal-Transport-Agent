# Script to populate the DB with dummy data

from database.connection import SessionLocal, engine
from database.models import Base, Stop, Path, Route, Vehicle, Driver, DailyTrip, Deployment, StatusEnum

def seed_database():
    # Create all tables
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    # Clean up existing data
    db.query(Deployment).delete()
    db.query(DailyTrip).delete()
    db.query(Vehicle).delete()
    db.query(Driver).delete()
    db.query(Route).delete()
    db.query(Path).delete()
    db.query(Stop).delete()
    db.commit()

    try:
        # Create Stops
        stop1 = Stop(name="Gavipuram", latitude=12.95, longitude=77.56)
        stop2 = Stop(name="Temple", latitude=12.96, longitude=77.57)
        stop3 = Stop(name="Peenya", latitude=12.97, longitude=77.58)
        stop4 = Stop(name="Odeon Circle", latitude=12.98, longitude=77.59)
        db.add_all([stop1, stop2, stop3, stop4])
        db.commit()

        # Create Paths
        path1 = Path(name="Path-1", ordered_stop_ids=f"{stop1.id},{stop2.id},{stop3.id}")
        path2 = Path(name="Tech-Loop", ordered_stop_ids=f"{stop4.id},{stop1.id},{stop2.id}")
        db.add_all([path1, path2])
        db.commit()

        # Create Routes
        route1 = Route(path_id=path1.id, display_name="Path-1 - 00:01", shift_time="00:01")
        route2 = Route(path_id=path1.id, display_name="Path-1 - 00:02", shift_time="00:02")
        route3 = Route(path_id=path2.id, display_name="Tech-Loop - 19:45", shift_time="19:45", status=StatusEnum.deactivated)
        db.add_all([route1, route2, route3])
        db.commit()

        # Create Vehicles
        vehicle1 = Vehicle(license_plate="MH-12-3456", type="Bus", capacity=50)
        vehicle2 = Vehicle(license_plate="KA-01-7890", type="Cab", capacity=4)
        vehicle3 = Vehicle(license_plate="TN-07-1122", type="Bus", capacity=40)
        db.add_all([vehicle1, vehicle2, vehicle3])
        db.commit()

        # Create Drivers
        driver1 = Driver(name="Amit", phone_number="9876543210")
        driver2 = Driver(name="Sunita", phone_number="9876543211")
        db.add_all([driver1, driver2])
        db.commit()
        
        # Create Daily Trips
        trip1 = DailyTrip(route_id=route1.id, display_name="Bulk - 00:01", booking_status_percentage=25)
        trip2 = DailyTrip(route_id=route2.id, display_name="Path Path - 00:02", booking_status_percentage=0)
        db.add_all([trip1, trip2])
        db.commit()

        # Create Deployments (Link trips to vehicles/drivers)
        deployment1 = Deployment(trip_id=trip1.id, vehicle_id=vehicle1.id, driver_id=driver1.id)
        db.add(deployment1)
        db.commit()

        print("Database seeded successfully!")
    except Exception as e:
        print(f"An error occurred during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()