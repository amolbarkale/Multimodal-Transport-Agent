"""
Extract Intent Node
Uses LLM to understand user intent and extract structured parameters
"""
import os
from dotenv import load_dotenv
from agents.state import MoviState
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
import json

# Load environment variables
load_dotenv()

# Initialize OpenAI LLM
llm = ChatOpenAI(
    model=os.getenv("OPENAI_MODEL", "gpt-4"),
    temperature=0,
    api_key=os.getenv("OPENAI_API_KEY")
)


INTENT_EXTRACTION_PROMPT = """You are an AI assistant analyzing user intents for a bus management system.

The user can perform these actions:
- READ: Get information (e.g., "How many vehicles?", "What's the status of trip X?")
- CREATE: Add new records (e.g., "Assign vehicle X to trip Y", "Create a new stop")
- UPDATE: Modify existing records (e.g., "Change shift time", "Reorder stops")
- DELETE: Remove records (e.g., "Remove vehicle from trip", "Delete stop X")

Target entities: vehicle, driver, trip, route, stop, path, deployment

Extract the following from the user's message:
1. action_type: "read", "create", "update", or "delete"
2. target_entity: "vehicle", "driver", "trip", "route", "stop", "path", or "deployment"
3. parameters: A JSON object with relevant extracted values (e.g., vehicle_id, trip_name, stop_name, lat, lon)

Current page context: {current_page}

User message: {user_message}

Respond ONLY with valid JSON in this format:
{{
    "action_type": "read|create|update|delete",
    "target_entity": "vehicle|driver|trip|route|stop|path|deployment",
    "parameters": {{
        // Extracted parameters here
    }}
}}
"""


def extract_intent_node(state: MoviState) -> MoviState:
    """
    Uses LLM to extract structured intent from natural language.
    """
    
    user_intent = state.get("user_intent", "")
    current_page = state.get("current_page", "busDashboard")
    
    if not user_intent:
        return {
            **state,
            "error": "No user intent to extract"
        }
    
    try:
        # Create prompt
        prompt = INTENT_EXTRACTION_PROMPT.format(
            current_page=current_page,
            user_message=user_intent
        )
        
        # Call LLM
        response = llm.invoke([
            SystemMessage(content="You are a helpful intent extraction assistant."),
            HumanMessage(content=prompt)
        ])
        
        # Parse JSON response
        intent_data = json.loads(response.content)
        
        return {
            **state,
            "action_type": intent_data.get("action_type"),
            "target_entity": intent_data.get("target_entity"),
            "parameters": intent_data.get("parameters", {}),
        }
        
    except Exception as e:
        return {
            **state,
            "error": f"Intent extraction failed: {str(e)}"
        }
