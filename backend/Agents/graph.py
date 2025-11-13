"""
Movi LangGraph Agent
Main graph definition for the Movi AI Assistant
"""
from langgraph.graph import StateGraph, END, START
from agents.state import MoviState
from agents.nodes.parse_input import parse_input_node
from agents.nodes.extract_intent import extract_intent_node
from agents.nodes.execute_action import execute_action_node
from agents.nodes.format_response import format_response_node
from dotenv import load_dotenv

load_dotenv()


def create_movi_graph():
    """
    Creates the Movi agent graph.
    
    Flow (Simple version for Phase 1-2):
    START → parse_input → extract_intent → execute_action → format_response → END
    
    Later we'll add conditional routing for consequence checking.
    """
    
    # Create the graph with our state schema
    workflow = StateGraph(MoviState)
    
    # Add nodes
    workflow.add_node("parse_input", parse_input_node)
    workflow.add_node("extract_intent", extract_intent_node)
    workflow.add_node("execute_action", execute_action_node)
    workflow.add_node("format_response", format_response_node)
    
    # Define edges (simple linear flow for now)
    workflow.add_edge(START, "parse_input")
    workflow.add_edge("parse_input", "extract_intent")
    workflow.add_edge("extract_intent", "execute_action")
    workflow.add_edge("execute_action", "format_response")
    workflow.add_edge("format_response", END)
    
    # Compile the graph
    return workflow.compile()


# Create the compiled graph instance
movi_graph = create_movi_graph()
