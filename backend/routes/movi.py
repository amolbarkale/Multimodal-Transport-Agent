"""
Movi AI Assistant API Routes
FastAPI endpoints for interacting with the Movi agent
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import sys
from pathlib import Path

# Add backend directory to Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from agents.graph import movi_graph
from agents.state import MoviState
from langchain_core.messages import HumanMessage
import traceback


router = APIRouter(prefix="/movi", tags=["Movi AI Assistant"])


class ChatRequest(BaseModel):
    """Request model for chat endpoint"""
    message: str
    current_page: Optional[str] = "busDashboard"
    conversation_history: Optional[List[Dict[str, str]]] = []


class ChatResponse(BaseModel):
    """Response model for chat endpoint"""
    response: str
    action_type: Optional[str] = None
    target_entity: Optional[str] = None
    tool_result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


@router.post("/chat", response_model=ChatResponse)
async def chat_with_movi(request: ChatRequest):
    """
    Send a text message to Movi and get a response.
    
    This endpoint runs the LangGraph agent to process the user's request.
    """
    try:
        # Convert conversation history to messages
        messages = []
        for msg in request.conversation_history:
            if msg.get("role") == "user":
                messages.append(HumanMessage(content=msg.get("content", "")))
        
        # Add current message
        messages.append(HumanMessage(content=request.message))
        
        # Create initial state
        initial_state: MoviState = {
            "messages": messages,
            "user_intent": None,
            "action_type": None,
            "target_entity": None,
            "parameters": None,
            "consequences": None,
            "requires_confirmation": False,
            "confirmed": None,
            "current_page": request.current_page,
            "image_context": None,
            "audio_input": None,
            "tool_result": None,
            "error": None,
            "response_text": None,
            "response_audio_url": None,
        }
        
        # Run the graph
        final_state = movi_graph.invoke(initial_state)
        
        # Extract response
        response_text = final_state.get("response_text", "I'm not sure how to respond to that.")
        error = final_state.get("error")
        
        return ChatResponse(
            response=response_text,
            action_type=final_state.get("action_type"),
            target_entity=final_state.get("target_entity"),
            tool_result=final_state.get("tool_result"),
            error=error
        )
        
    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Movi encountered an error: {str(e)}")


@router.get("/health")
async def movi_health():
    """Check if Movi service is running"""
    return {
        "status": "healthy",
        "message": "Movi AI Assistant is ready to help!",
        "version": "0.1.0 (Phase 1-2)"
    }
