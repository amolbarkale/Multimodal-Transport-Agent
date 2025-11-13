"""
Format Response Node
Formats tool results into natural language responses
"""
import os
from dotenv import load_dotenv
from agents.state import MoviState
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

# Load environment variables
load_dotenv()

# Initialize OpenAI LLM
llm = ChatOpenAI(
    model=os.getenv("OPENAI_MODEL", "gpt-4"),
    temperature=0.7,
    api_key=os.getenv("OPENAI_API_KEY")
)


RESPONSE_FORMATTING_PROMPT = """You are Movi, a helpful AI assistant for a bus management system.

The user asked: "{user_query}"

The system performed: {action_type} on {target_entity}

Tool result:
{tool_result}

Generate a natural, conversational response that:
1. Directly answers the user's question
2. Presents data in a clear, readable format
3. Is friendly and helpful
4. Uses emojis sparingly when appropriate

If there's an error, explain it clearly and suggest what the user can do.
"""


def format_response_node(state: MoviState) -> MoviState:
    """
    Formats tool results into natural language responses.
    """
    
    tool_result = state.get("tool_result")
    error = state.get("error")
    user_intent = state.get("user_intent", "")
    action_type = state.get("action_type", "unknown")
    target_entity = state.get("target_entity", "unknown")
    messages = state.get("messages", [])
    
    # Handle errors
    if error:
        response_text = f"❌ Sorry, I encountered an error: {error}"
        messages.append(AIMessage(content=response_text))
        return {
            **state,
            "response_text": response_text,
            "messages": messages
        }
    
    # Format tool result
    if tool_result:
        try:
            # Use LLM to format the response naturally
            prompt = RESPONSE_FORMATTING_PROMPT.format(
                user_query=user_intent,
                action_type=action_type,
                target_entity=target_entity,
                tool_result=str(tool_result)
            )
            
            response = llm.invoke([
                SystemMessage(content="You are Movi, a helpful bus management assistant."),
                HumanMessage(content=prompt)
            ])
            
            response_text = response.content
            
        except Exception as e:
            # Fallback to simple formatting
            if isinstance(tool_result, dict):
                if tool_result.get("error"):
                    response_text = f"❌ {tool_result['error']}"
                elif tool_result.get("success"):
                    response_text = f"✅ {tool_result.get('message', 'Action completed successfully!')}"
                else:
                    # Format dict as bullet points
                    response_text = "Here's what I found:\n\n"
                    for key, value in tool_result.items():
                        if key not in ["error", "success"]:
                            response_text += f"• **{key}**: {value}\n"
            else:
                response_text = str(tool_result)
        
        messages.append(AIMessage(content=response_text))
        
        return {
            **state,
            "response_text": response_text,
            "messages": messages
        }
    
    # No result
    response_text = "I processed your request, but there's no data to show."
    messages.append(AIMessage(content=response_text))
    
    return {
        **state,
        "response_text": response_text,
        "messages": messages
    }
