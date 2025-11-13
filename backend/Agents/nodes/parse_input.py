"""
Parse Input Node
Processes multimodal inputs (text, voice, image) and normalizes them
"""
from agents.state import MoviState
from langchain_core.messages import HumanMessage


def parse_input_node(state: MoviState) -> MoviState:
    """
    Parses and normalizes user input.
    
    For Phase 1-2: Just handles text messages
    Later: Will add audio transcription and image analysis
    """
    
    messages = state.get("messages", [])
    
    # Get the last user message
    if messages:
        last_message = messages[-1]
        if isinstance(last_message, HumanMessage):
            user_text = last_message.content
            
            # TODO Phase 4: Check for audio_input and transcribe
            # TODO Phase 4: Check for image_context and analyze
            
            # For now, just pass through text
            return {
                **state,
                "user_intent": user_text,  # Store raw text as intent for now
            }
    
    return {
        **state,
        "error": "No user message found"
    }
