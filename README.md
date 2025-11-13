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
