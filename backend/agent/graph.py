import os
from typing import TypedDict, Annotated, List, Optional
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from dotenv import load_dotenv

from .tools import (
    get_unassigned_vehicles, get_trip_status, remove_vehicle_from_trip, 
    check_trip_consequences, list_stops_for_path, find_routes_for_path,
    assign_vehicle_to_trip, create_new_stop, create_new_path,
    update_route_status, get_deployment_details,
    check_route_deactivation_consequences, create_new_trip
)
from database.connection import SessionLocal

# --- 1. Load Environment Variables ---
load_dotenv()

# --- 2. Define Tools ---
tools = [
    get_unassigned_vehicles, get_trip_status, remove_vehicle_from_trip,
    list_stops_for_path, find_routes_for_path, assign_vehicle_to_trip,
    create_new_stop, create_new_path, update_route_status, get_deployment_details, create_new_trip
]

tool_node = ToolNode(tools)

# Define the set of tools that require a consequence check before execution
HIGH_IMPACT_TOOLS = {"remove_vehicle_from_trip", "update_route_status"}

# --- 3. Define Agent State ---
class AgentState(TypedDict):
    messages: Annotated[List[BaseMessage], lambda x, y: x + y]
    currentPage: str
    # tool_calls is the key LangGraph uses to pass tool invocations to the ToolNode
    tool_calls: Optional[list] = None
    consequence_info: Optional[str] = None
    image: Optional[str] = None

# --- 4. Define Graph Nodes ---

def call_model(state: AgentState):
    """
    The primary node that calls the LLM. It dynamically handles
    text-only or multimodal (text + image) inputs.
    """
    print("---CALLING MODEL---")
    
    system_prompt = (
        "You are 'Movi', an AI assistant for transport managers. You are helpful, expert, and concise. "
        "Your primary goal is to accurately call tools based on the user's request. "
        "CRITICAL INSTRUCTION: When identifying entities like trips, routes, or paths, "
        "you MUST use the exact, full name provided by the system or the user. Do not abbreviate or infer names. "
        "ADDITIONAL INSTRUCTION: If an image is provided, it is the primary context. "
        "Use the visual information in the image to identify what the user is referring to. "
        "For example, if the user says 'this trip' and there's an arrow in the image pointing to a row "
        "with the text 'Bulk - 00:01', you must identify the trip name as 'Bulk - 00:01'."
    )
    
    # Check if an image was provided in the state
    if state.get("image"):
        print("---HANDLING MULTIMODAL INPUT---")
        # Get the last human message for its text content
        last_human_message = ""
        for msg in reversed(state["messages"]):
            if isinstance(msg, HumanMessage):
                last_human_message = msg.content
                break
        
        # Construct the multimodal message content
        multimodal_content = [
            {"type": "text", "text": last_human_message},
            {"type": "image_url", "image_url": {"url": state["image"]}}
        ]
        
        # Create a new message history for this call
        # We replace the last human message with our new multimodal one
        messages_for_llm = [SystemMessage(content=system_prompt)] + state["messages"][:-1] + [HumanMessage(content=multimodal_content)]
    else:
        # Standard text-only flow
        messages_for_llm = [SystemMessage(content=system_prompt)] + state["messages"]

    model = ChatOpenAI(model="gpt-4o", temperature=0, streaming=True)
    model_with_tools = model.bind_tools(tools)
    
    response = model_with_tools.invoke(messages_for_llm)
    
    return {"messages": [response], "tool_calls": response.tool_calls}
def check_consequences(state: AgentState):
    """
    The 'Tribal Knowledge' node. It checks for negative consequences
    before executing a high-impact tool.
    """
    print("---CHECKING CONSEQUENCES---")
    if not state.get("tool_calls"):
        return {}
        
    tool_call = state["tool_calls"][-1]
    tool_name = tool_call['name']
    tool_args = tool_call['args']

    db = SessionLocal()
    consequence_result = {}
    
    if tool_name == "remove_vehicle_from_trip":
        consequence_result = check_trip_consequences(tool_args["trip_display_name"], db)
    
    elif tool_name == "update_route_status" and tool_args.get("new_status") == "deactivated":
        consequence_result = check_route_deactivation_consequences(tool_args["route_display_name"], db)

    db.close()

    if consequence_result.get("has_consequences"):
        return {"consequence_info": consequence_result["details"]}
    else:
        return {"consequence_info": None}

# --- 5. Define Conditional Edges ---

def should_continue(state: AgentState) -> str:
    """
    The main router. It decides the next step after the LLM has been called.
    """
    print("---ROUTING---")
    if not state.get("tool_calls"):
        print("ROUTE: The LLM responded, ending.")
        return "end"

    tool_name = state["tool_calls"][-1]['name']
    if tool_name in HIGH_IMPACT_TOOLS:
        print(f"ROUTE: High-impact tool '{tool_name}' detected. Checking consequences.")
        return "check_consequences"
    else:
        print(f"ROUTE: Safe tool '{tool_name}' detected. Executing.")
        return "continue"

def after_consequence_check(state: AgentState) -> str:
    """
    This router runs after the consequence check to decide whether to
    proceed with the tool or ask the user for confirmation.
    """
    print("---ROUTING AFTER CONSEQUENCE CHECK---")
    if state.get("consequence_info"):
        print("ROUTE: Consequences found. Asking for confirmation.")
        confirmation_message = AIMessage(
            content=(
                f"I can do that, but please be aware: {state['consequence_info']}. "
                "This may cancel bookings and affect trip sheets. Do you want to proceed?"
            )
        )
        # We modify the state to prevent the tool call from executing
        state['messages'].append(confirmation_message)
        state['tool_calls'] = None
        state['consequence_info'] = None
        return "end"
    else:
        print("ROUTE: No consequences. Proceeding with tool execution.")
        return "continue"

# --- 6. Assemble the Graph ---
def create_movi_agent_graph():
    workflow = StateGraph(AgentState)

    # Add the nodes to the graph
    workflow.add_node("agent", call_model)
    # We use the pre-built ToolNode instead of our own 'call_tool' function
    workflow.add_node("action", tool_node) 
    workflow.add_node("check_consequences", check_consequences)

    # Set the entry point
    workflow.set_entry_point("agent")

    # Add the conditional edges
    workflow.add_conditional_edges(
        "agent",
        should_continue,
        {
            "continue": "action",
            "check_consequences": "check_consequences",
            "end": END,
        },
    )
    workflow.add_conditional_edges(
        "check_consequences",
        after_consequence_check,
        {
            "continue": "action",
            "end": END,
        },
    )

    # The ToolNode now needs to loop back to the agent to process the results
    workflow.add_edge("action", "agent")

    # Compile the graph into a runnable app
    app = workflow.compile()
    return app