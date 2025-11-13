Movi: The Multimodal Transport Agent

This repository contains the source code for "Movi," a next-generation, knowledge-aware AI agent designed to assist transport managers. Movi is built on a robust, stateful, and multimodal architecture using langgraph.

1. Overall System Architecture
The Movi system is designed as a modern web application with a clear separation of concerns between the frontend, backend, and data layer. This modularity ensures maintainability and scalability.

```
graph TD
    subgraph Browser
        A[React Frontend]
        B[Web Speech API for STT/TTS]
    end

    subgraph Backend Server (Python/FastAPI)
        C[API Gateway - FastAPI]
        D{Movi Agent Core - LangGraph}
        E[Tooling Layer]
        F[Database Abstraction - SQLAlchemy ORM]
    end

    subgraph External Services
        G[Multimodal LLM - e.g., GPT-4o, Claude 3]
    end

    subgraph Data Store
        H[Database - SQLite/PostgreSQL]
    end

    A -- HTTP/WebSocket Request (Text, Image, Context) --> C
    B -- Voice Input --> A
    A -- Text/Audio Output --> B
    C -- Invokes --> D
    D -- Executes Tools --> E
    E -- DB Operations --> F
    F -- CRUD --> H
    D -- Reasons with --> G
    ```

uvicorn main:app --reload


Example Prompts to Try:

List all stops for Path-1
Show me all routes that use Tech-Loop
Assign vehicle KA-01-7890 and driver Sunita to the Path Path - 00:02 trip (This should work, as the trip is unassigned)
Create a new stop called Metro Station with latitude 12.99 and longitude 77.60
Create a new path called Metro-Link using stops [Peenya, Temple, Metro Station]
What vehicle is on the Bulk - 00:01 trip?
(High-Impact Test) Deactivate the Tech-Loop - 19:45 route (This should trigger a consequence check, though we haven't defined one for it yet. The router will still catch it.)