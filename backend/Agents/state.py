"""
Movi Agent State Schema
Defines the state structure for the LangGraph agent
"""
from typing import TypedDict, Optional, List, Dict, Any, Literal
from langchain_core.messages import BaseMessage


class MoviState(TypedDict):
    """
    State for the Movi AI Assistant agent.
    
    This state is passed through all nodes in the LangGraph.
    Each node can read from and write to this state.
    """
    
    # Conversation context
    messages: List[BaseMessage]  # Full conversation history
    
    # Intent extraction
    user_intent: Optional[str]  # Natural language intent
    action_type: Optional[Literal["read", "create", "update", "delete"]]  # CRUD operation
    target_entity: Optional[Literal["vehicle", "driver", "trip", "route", "stop", "path", "deployment"]]  # What to act on
    parameters: Optional[Dict[str, Any]]  # Extracted parameters (e.g., vehicle_id, trip_name)
    
    # Consequence checking (Tribal Knowledge)
    consequences: Optional[Dict[str, Any]]  # Impact analysis results
    requires_confirmation: bool  # Does this action need user approval?
    confirmed: Optional[bool]  # User's response to confirmation (yes/no)
    
    # Context
    current_page: Optional[Literal["routes", "busDashboard", "stopsPaths"]]  # Which page user is on
    
    # Multimodal inputs
    image_context: Optional[Dict[str, Any]]  # Extracted info from uploaded images
    audio_input: Optional[bytes]  # Raw audio data for transcription
    
    # Tool execution
    tool_result: Optional[Dict[str, Any]]  # Result from tool execution
    error: Optional[str]  # Error message if something fails
    
    # Response generation
    response_text: Optional[str]  # Final response to user
    response_audio_url: Optional[str]  # URL to TTS audio file
