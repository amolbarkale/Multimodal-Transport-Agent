from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

from agent.graph import create_movi_agent_graph
from langchain_core.messages import HumanMessage, AIMessage

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

# --- Agent Initialization ---
# We create a single, reusable instance of our agent graph.
movi_agent = create_movi_agent_graph()

# --- API Endpoint ---
@app.post("/invoke_agent")
async def invoke_agent(request: AgentRequest):
    """
    The single endpoint to interact with the Movi agent.
    It receives the conversation history and current page context from the frontend.
    """
    # Convert the generic messages from the frontend into LangChain's message format.
    langchain_messages = []
    for msg in request.messages:
        if msg.role == "user":
            langchain_messages.append(HumanMessage(content=msg.content))
        elif msg.role == "assistant":
            langchain_messages.append(AIMessage(content=msg.content))

    # The input for our graph must match the AgentState structure.
    inputs = {
        "messages": langchain_messages,
        "currentPage": request.currentPage,
    }

    # Invoke the graph to get the final state.
    final_state = movi_agent.invoke(inputs)

    # The final response is the last message added by the AI.
    ai_response = final_state['messages'][-1]

    return {"role": "assistant", "content": ai_response.content}


@app.get("/")
def read_root():
    return {"message": "Movi Agent Backend is running."}

@app.get("/health")
def read_root():
    return {"message": "Movi Agent server is healthy."}