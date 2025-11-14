from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session

from agent.graph import create_movi_agent_graph
from langchain_core.messages import HumanMessage, AIMessage

import schemas
import database.models as models
from database.connection import get_db

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models for API ---
# These models define the expected request and response structure.
class Message(BaseModel):
    role: str
    content: str

class AgentRequest(BaseModel):
    messages: List[Message]
    currentPage: Optional[str] = "unknown"
    image: Optional[str] = None

# --- Agent Initialization ---
movi_agent = create_movi_agent_graph()

@app.post("/invoke_agent")
async def invoke_agent(request: AgentRequest):
    """
    Handles agent interactions. Now correctly constructs a multimodal message
    if an image is provided.
    """
    # 1. Convert message history from frontend format to LangChain format
    langchain_messages = []
    for msg in request.messages:
        if msg.role == "user":
            langchain_messages.append(HumanMessage(content=msg.content))
        elif msg.role == "assistant":
            langchain_messages.append(AIMessage(content=msg.content))
            
    # --- THIS IS THE CRITICAL FIX ---
    # 2. If an image is present, create a proper multimodal message
    if request.image:
        print("--- constructing multimodal message ---")
        # The user's text and image belong to the SAME message turn.
        # We find the last user message text to combine it with the image.
        last_user_text = ""
        if langchain_messages and isinstance(langchain_messages[-1], HumanMessage):
             last_user_text = langchain_messages[-1].content
             # Remove the now-redundant text-only message
             langchain_messages = langchain_messages[:-1]

        # Construct the multimodal content list
        multimodal_content = [
            {"type": "text", "text": last_user_text},
            {"type": "image_url", "image_url": {"url": request.image}}
        ]
        
        # Append a single, new HumanMessage containing both text and image
        langchain_messages.append(HumanMessage(content=multimodal_content))

    # 3. The agent's input is now just a clean list of messages
    inputs = {"messages": langchain_messages}

    final_state = movi_agent.invoke(inputs)
    ai_response = final_state['messages'][-1]

    return {"role": "assistant", "content": ai_response.content}

@app.get("/trips", response_model=List[schemas.DailyTrip])
def get_all_trips(db: Session = Depends(get_db)):
    trips = db.query(models.DailyTrip).order_by(models.DailyTrip.trip_id.desc()).all()
    return trips

@app.get("/routes", response_model=List[schemas.Route])
def get_all_routes(db: Session = Depends(get_db)):
    routes = db.query(models.Route).all()
    return routes

@app.get("/vehicles", response_model=List[schemas.Vehicle])
def get_all_vehicles(db: Session = Depends(get_db)):
    vehicles = db.query(models.Vehicle).all()
    return vehicles

@app.get("/drivers", response_model=List[schemas.Driver])
def get_all_drivers(db: Session = Depends(get_db)):
    drivers = db.query(models.Driver).all()
    return drivers

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
    