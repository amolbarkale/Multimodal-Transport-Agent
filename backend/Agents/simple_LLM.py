# true_agent.py
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.tools import tool
from dotenv import load_dotenv
from typing import TypedDict, Annotated, Sequence
import operator
import requests

load_dotenv()


# ========== DEFINE TOOLS ==========
@tool
def get_weather(city: str) -> str:
    """Get the current weather for a given city.
    
    Args:
        city: The name of the city to get weather for
        
    Returns:
        A string describing the current weather
    """
    try:
        # Using wttr.in API for weather data
        url = f"https://wttr.in/{city}?format=%C+%t"
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        return f"Weather in {city}: {response.text}"
    except Exception as e:
        return f"Could not fetch weather for {city}: {str(e)}"

# List of all tools
tools = [get_weather]

# ========== DEFINE STATE ==========
class AgentState(TypedDict):
    messages: Annotated[Sequence[HumanMessage | AIMessage | SystemMessage], operator.add]

# ========== INITIALIZE LLM WITH TOOLS ==========
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
llm_with_tools = llm.bind_tools(tools)

# ========== DEFINE NODES ==========
def agent_node(state: AgentState):
    """The agent decides whether to use tools or respond directly"""
    messages = state["messages"]
    response = llm_with_tools.invoke(messages)
    return {"messages": [response]}

def should_continue(state: AgentState):
    """Router: Check if the agent wants to use tools or end"""
    last_message = state["messages"][-1]
    
    # If the LLM makes a tool call, continue to tools
    if hasattr(last_message, "tool_calls") and last_message.tool_calls:
        return "tools"
    # Otherwise, end the conversation
    return "end"

# ========== BUILD GRAPH ==========
workflow = StateGraph(AgentState)

# Add nodes
workflow.add_node("agent", agent_node)
workflow.add_node("tools", ToolNode(tools))

# Set entry point
workflow.set_entry_point("agent")

# Add conditional edges
workflow.add_conditional_edges(
    "agent",
    should_continue,
    {
        "tools": "tools",
        "end": END
    }
)

# After tools are called, go back to agent
workflow.add_edge("tools", "agent")

# Compile the graph
app = workflow.compile()

# ========== MAIN LOOP ==========
if __name__ == "__main__":
    print("🤖 True LangGraph Agent with Tool Calling")
    print("=" * 60)
    print("Ask me anything! I can:")
    print("  • Answer general questions")
    print("  • Check weather for any city")
    print("  • Reason about when to use tools")
    print("\nType 'exit' or 'quit' to stop")
    print("=" * 60)
    
    while True:
        user_input = input("\n👤 You: ")
        
        if user_input.lower() in ["exit", "quit"]:
            print("\n👋 Goodbye!")
            break
        
        try:
            # Create initial state with user message
            initial_state = {
                "messages": [HumanMessage(content=user_input)]
            }
            
            # Run the agent
            result = app.invoke(initial_state)
            
            # Get the last message (the agent's response)
            last_message = result["messages"][-1]
            
            # Print the response
            print(f"\n🤖 Agent: {last_message.content}")
            
        except Exception as e:
            print(f"\n❌ Error: {str(e)}")
            print("Make sure your OPENAI_API_KEY is set in the .env file")