from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from models import Base
from database import engine
from routes.vehicle import router as vehicle_router
from routes.driver import router as driver_router
from routes.stop import router as stop_router
from routes.path import router as path_router
from routes.route import router as route_router
from routes.daily_trip import router as daily_trip_router
from routes.deployment import router as deployment_router
from routes.movi import router as movi_router

# Load environment variables
load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Move In Sync API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(vehicle_router)
app.include_router(driver_router)
app.include_router(stop_router)
app.include_router(path_router)
app.include_router(route_router)
app.include_router(daily_trip_router)
app.include_router(deployment_router)
app.include_router(movi_router)

@app.get("/health")
def health_check():
    return {"status": "healthy"}