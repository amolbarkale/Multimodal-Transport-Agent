from typing import TypedDict, Annotated, List, Optional
from langchain_core.messages import BaseMessage, SystemMessage
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from dotenv import load_dotenv

from .tools import (
    get_unassigned_vehicles, get_trip_status, remove_vehicle_from_trip,
    check_trip_consequences, list_stops_for_path, find_routes_for_path,
    assign_vehicle_to_trip, create_new_stop, create_new_path,
    update_route_status, get_deployment_details, create_new_trip,
    check_route_deactivation_consequences,
    get_all_trips
)

load_dotenv()

tools = [
    get_unassigned_vehicles, get_trip_status, remove_vehicle_from_trip,
    list_stops_for_path, find_routes_for_path, assign_vehicle_to_trip,
    create_new_stop, create_new_path, update_route_status, get_deployment_details,
    create_new_trip,
    get_all_trips
]
tool_node = ToolNode(tools)

HIGH_IMPACT_TOOLS = {"remove_vehicle_from_trip", "update_route_status"}

# --- SIMPLIFIED AGENT STATE ---
# We no longer need a separate 'image' field. The image will be part of the message content.
class AgentState(TypedDict):
    messages: Annotated[List[BaseMessage], lambda x, y: x + y]
    tool_calls: Optional[list] = None
    consequence_info: Optional[str] = None

def call_model(state: AgentState):
    """
    The primary node that calls the LLM. It's now much simpler because the
    multimodal message is pre-formatted before the graph starts.
    """
    print("---CALLING MODEL---")
    
    system_prompt = (
        "You are 'Movi', an AI assistant for transport managers... "
        "CRITICAL INSTRUCTION: When identifying entities..., you MUST use the exact, full name... "
        "ADDITIONAL INSTRUCTION: If an image is provided with a message, it is the primary context. "
        "Use the visual information in the image to identify what the user is referring to."
    )
    
    messages_for_llm = [SystemMessage(content=system_prompt)] + state["messages"]

    model = ChatOpenAI(model="gpt-4o", temperature=0, streaming=True)
    model_with_tools = model.bind_tools(tools)
    
    response = model_with_tools.invoke(messages_for_llm)
    
    return {"messages": [response], "tool_calls": response.tool_calls}


def check_consequences(state: AgentState):
    print("---CHECKING CONSEQUENCES---")
    if not state.get("tool_calls"):
        return {}
    tool_call = state["tool_calls"][-1]
    tool_name = tool_call['name']
    tool_args = tool_call['args']
    from database.connection import SessionLocal
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

def should_continue(state: AgentState) -> str:
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
    from langchain_core.messages import AIMessage
    print("---ROUTING AFTER CONSEQUENCE CHECK---")
    if state.get("consequence_info"):
        print("ROUTE: Consequences found. Asking for confirmation.")
        confirmation_message = AIMessage(
            content=(
                f"I can do that, but please be aware: {state['consequence_info']}. "
                "This may cancel bookings and affect trip sheets. Do you want to proceed?"
            )
        )
        state['messages'].append(confirmation_message)
        state['tool_calls'] = None
        state['consequence_info'] = None
        return "end"
    else:
        print("ROUTE: No consequences. Proceeding with tool execution.")
        return "continue"

def create_movi_agent_graph():
    workflow = StateGraph(AgentState)
    workflow.add_node("agent", call_model)
    workflow.add_node("action", tool_node)
    workflow.add_node("check_consequences", check_consequences)
    workflow.set_entry_point("agent")
    workflow.add_conditional_edges(
        "agent",
        should_continue,
        {"continue": "action", "check_consequences": "check_consequences", "end": END},
    )
    workflow.add_conditional_edges(
        "check_consequences",
        after_consequence_check,
        {"continue": "action", "end": END},
    )
    workflow.add_edge("action", "agent")
    app = workflow.compile()
    return app