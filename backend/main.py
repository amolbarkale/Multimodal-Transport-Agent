from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session

import schemas
import database.models as models
from database.connection import get_db
from database.models import StatusEnum
from agent.graph import create_movi_agent_graph
from langchain_core.messages import HumanMessage, AIMessage

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Agent Models and Endpoint ---

class Message(BaseModel):
    role: str
    content: str

class AgentRequest(BaseModel):
    messages: List[Message]
    currentPage: Optional[str] = "unknown"
    image: Optional[str] = None

movi_agent = create_movi_agent_graph()

@app.post("/invoke_agent")
async def invoke_agent(request: AgentRequest):
    langchain_messages = [AIMessage(content=msg.content) if msg.role == 'assistant' else HumanMessage(content=msg.content) for msg in request.messages]
    if request.image:
        last_user_text = ""
        if langchain_messages and isinstance(langchain_messages[-1], HumanMessage):
             last_user_text = langchain_messages[-1].content
             langchain_messages = langchain_messages[:-1]
        multimodal_content = [{"type": "text", "text": last_user_text}, {"type": "image_url", "image_url": {"url": request.image}}]
        langchain_messages.append(HumanMessage(content=multimodal_content))
    inputs = {"messages": langchain_messages}
    final_state = movi_agent.invoke(inputs)
    ai_response = final_state['messages'][-1]
    return {"role": "assistant", "content": ai_response.content}

# --- All UI Data Endpoints ---

@app.get("/trips", response_model=List[schemas.DailyTrip])
def get_all_trips(db: Session = Depends(get_db)):
    return db.query(models.DailyTrip).order_by(models.DailyTrip.trip_id.desc()).all()

@app.get("/routes", response_model=List[schemas.Route])
def get_all_routes_by_status(status: str = "active", db: Session = Depends(get_db)):
    try:
        status_enum = StatusEnum[status]
    except KeyError:
        raise HTTPException(status_code=400, detail=f"Invalid status value: {status}.")
    return db.query(models.Route).filter(models.Route.status == status_enum).all()

@app.get("/vehicles", response_model=List[schemas.Vehicle])
def get_all_vehicles(db: Session = Depends(get_db)):
    return db.query(models.Vehicle).all()

@app.get("/drivers", response_model=List[schemas.Driver])
def get_all_drivers(db: Session = Depends(get_db)):
    return db.query(models.Driver).all()

@app.get("/stops", response_model=List[schemas.Stop])
def get_all_stops(db: Session = Depends(get_db)):
    return db.query(models.Stop).all()

@app.get("/paths", response_model=List[schemas.Path])
def get_all_paths(db: Session = Depends(get_db)):
    return db.query(models.Path).all()

@app.get("/trip-details/{trip_id}/route-stops", response_model=List[schemas.Stop])
def get_trip_route_stops(trip_id: int, db: Session = Depends(get_db)):
    trip = db.query(models.DailyTrip).filter(models.DailyTrip.trip_id == trip_id).first()
    if not trip:
        return []
    route = db.query(models.Route).filter(models.Route.route_id == trip.route_id).first()
    if not route:
        return []
    path = db.query(models.Path).filter(models.Path.path_id == route.path_id).first()
    if not path:
        return []
    stop_ids = [int(sid) for sid in path.ordered_stop_ids.split(',')]
    stops = db.query(models.Stop).filter(models.Stop.stop_id.in_(stop_ids)).all()
    stop_map = {stop.stop_id: stop for stop in stops}
    ordered_stops = [stop_map[sid] for sid in stop_ids if sid in stop_map]
    return ordered_stops
    
@app.post("/routes", response_model=schemas.Route)
def create_route(route: schemas.RouteCreate, db: Session = Depends(get_db)):
    path = db.query(models.Path).filter(models.Path.path_id == route.path_id).first()
    if not path: raise HTTPException(status_code=404, detail="Path not found")
    stops = db.query(models.Stop).filter(models.Stop.stop_id.in_([int(s) for s in path.ordered_stop_ids.split(',')])).all()
    stop_map = {s.stop_id: s for s in stops}
    ordered_ids = [int(s) for s in path.ordered_stop_ids.split(',')]
    start_point = stop_map[ordered_ids[0]].name
    end_point = stop_map[ordered_ids[-1]].name
    new_route_model = models.Route(start_point=start_point, end_point=end_point, **route.model_dump())
    db.add(new_route_model)
    db.commit()
    db.refresh(new_route_model)
    return new_route_model

@app.patch("/routes/{route_id}/status", response_model=schemas.Route)
def update_route_status_endpoint(route_id: int, status: str, db: Session = Depends(get_db)):
    # (Logic is correct and remains unchanged)
    route = db.query(models.Route).filter(models.Route.route_id == route_id).first()
    if not route: raise HTTPException(status_code=404, detail="Route not found")
    try:
        status_enum = StatusEnum[status]
    except KeyError:
        raise HTTPException(status_code=400, detail=f"Invalid status value: {status}.")
    route.status = status_enum
    db.commit()
    db.refresh(route)
    return route

@app.delete("/routes/{route_id}", status_code=204)
def delete_route(route_id: int, db: Session = Depends(get_db)):
    route = db.query(models.Route).filter(models.Route.route_id == route_id).first()
    if not route: raise HTTPException(status_code=404, detail="Route not found")
    db.delete(route)
    db.commit()
    return {"ok": True}