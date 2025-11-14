# Movi: The Multimodal Transport Agent

Welcome to the repository for "Movi," a next-generation, knowledge-aware AI assistant designed to help transport managers with complex operational tasks. This project is a working prototype built for the MoveInSync Shuttle platform.

Movi is a true multimodal assistant that understands text, voice, and images. It is powered by a robust, stateful, and multi-step agentic backend built with **`langgraph`**.

---

## 🚀 Core Features

*   **Multimodal Interaction:** Full support for Text, Voice (Speech-to-Text & Text-to-Speech), and Image (Vision) inputs.
*   **Knowledge-Aware Agent:** Movi understands the consequences of actions, preventing costly mistakes by asking for confirmation on high-impact operations.
*   **>10 Agentic Actions:** Movi can perform a wide range of CRUD operations on both static assets (Stops, Paths, Routes) and dynamic assets (Trips, Deployments).
*   **Stateful, Multi-Turn Conversations:** Movi remembers the context of the conversation, allowing for natural follow-up questions.
*   **UI Context-Awareness:** The agent's behavior and responses adapt based on which page the user is currently viewing (`busDashboard` vs. `manageRoute`).
*   **Dynamic UI:** A two-page admin console built with React and TypeScript that displays real-time data from the backend database.

---

## 🏛️ System Architecture

The Movi system is designed as a modern full-stack application with a clear separation of concerns between the frontend, backend agent, and database.

```mermaid
graph TD
    subgraph Browser
        A[React Frontend <br> (TypeScript, Vite)]
        B[Web Speech API <br> (for STT/TTS)]
    end

    subgraph "Backend Server (Python)"
        C[API Gateway <br> (FastAPI)]
        D{Movi Agent Core <br> (LangGraph)}
        E[Agent Tools <br> (Database Functions)]
        F[Database ORM <br> (SQLAlchemy)]
    end

    subgraph "External Services"
        G[Multimodal LLM <br> (OpenAI GPT-4o)]
    end

    subgraph "Data Store"
        H[Database <br> (SQLite)]
    end

    A -- "HTTP/WebSocket Request (Text, Image, Context)" --> C;
    B -- "Voice Input" --> A;
    A -- "Text/Audio Output" --> B;
    C -- "Invokes Agent" --> D;
    D -- "Executes Tools" --> E;
    E -- "DB Operations" --> F;
    F -- "CRUD" --> H;
    D -- "Reasons With" --> G;
```

---

## 🧠 LangGraph Agent Design

The core intelligence of Movi is its agent, which is implemented as a state machine (a "graph") using langgraph. This design allows for complex, multi-step logic and robust error handling.

### Agent Flow Diagram

This diagram visualizes the agent's decision-making process, highlighting the critical "Tribal Knowledge" flow.

```mermaid
graph TD
    A[User Input <br> (Text, Voice, or Image)] --> B(Movi Agent Core <br> call_model);
    B --> C{Initial Routing Logic <br> should_continue};
    
    C -->|No Tool Needed| H[Generate Final Response];
    C -->|Safe Tool Call| D[Execute Tool <br> tool_node];
    C -->|<b>High-Impact Tool Call</b>| E[<b style='color:red'>Check for Consequences</b> <br> check_consequences];
    
    D --> B;
    E --> F{Consequences Found? <br> after_consequence_check};
    F -->|<b>No, Safe to Proceed</b>| D;
    F -->|<b>Yes, Consequences Exist</b>| G[<b style='color:red'>Formulate Warning & Ask for Confirmation</b>];
    
    G --> Z([END: Wait for User's 'Yes/No']);
    H --> Z([END]);
    subgraph "Tribal Knowledge Flow"
        E
        F
        G
    end
    style E fill:#f9f,stroke:#333,stroke-width:2px
    style G fill:#f9f,stroke:#333,stroke-width:2px
```

### Explanation of the Graph

1. **Agent State (AgentState):** The agent's memory is a simple dictionary that holds the list of messages. The image data is pre-processed and embedded directly into the message history before the graph is invoked, simplifying the state.

2. **Nodes (The Actions):**
   * **call_model:** The agent's "brain." It uses the LLM (GPT-4o) to analyze the message history and decide whether to respond directly or call a tool. It is also responsible for vision-based analysis when an image is present.
   * **tool_node:** The "hands" of the agent. This is a pre-built LangGraph node that executes any tool function the agent decides to call (e.g., get_all_trips, remove_vehicle_from_trip).
   * **check_consequences:** The "conscience" of the agent. This custom node is the heart of the "Tribal Knowledge" feature. It contains the business logic to investigate the potential negative impacts of an action before it is executed.

3. **Conditional Edges (The Logic):**
   * **should_continue:** This is the main router. After the agent's brain makes a decision, this edge inspects the chosen tool. If the tool is in a predefined HIGH_IMPACT_TOOLS set, it diverts the flow to the check_consequences node. Otherwise, it proceeds directly to execution.
   * **after_consequence_check:** This edge runs after the consequence check. If the check found any issues, it routes the agent to formulate a warning and ask for confirmation, stopping the flow. If no issues were found, it allows the tool_node to execute the action.

This architecture ensures that Movi is not just a command-follower but a safe, intelligent partner for the transport manager.

---

## 🛠️ Setup and Installation

Follow these instructions to run the project locally.

### Prerequisites

* Python 3.8+
* Node.js 18+ and npm
* An OpenAI API key

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### 2. Backend Setup

The backend runs on Python with FastAPI and LangGraph.

```bash
# Navigate to the backend directory
cd backend

# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows, use `venv\Scripts\activate`

# Install the required Python packages
pip install -r requirements.txt
```

### 3. Frontend Setup

The frontend is a React application built with Vite and TypeScript.

```bash
# Navigate to the frontend directory from the root
cd ../frontend

# Install the required npm packages
npm install
```

### 4. Environment Variables

You need to provide your OpenAI API key for the agent to function.

1. In the root directory of the project, create a file named `.env`.
2. Add your API key to this file:

```
OPENAI_API_KEY="your_openai_api_key_here"
```

### 5. Initialize the Database

The application uses a self-contained SQLite database. The first time you run the project, you need to create and populate it with dummy data.

* From the root directory, run the seed script:

```bash
python backend/seed.py
```

* A file named `transport_agent.db` will be created in the root folder.

### 6. Run the Application

You will need to run the backend and frontend servers in two separate terminals.

**Terminal 1: Run the Backend Server (from the root directory)**

```bash
uvicorn backend.main:app --reload
```

* The backend will be running at http://127.0.0.1:8000.

**Terminal 2: Run the Frontend Server (from the root directory)**

```bash
cd frontend
npm run dev
```

* The frontend will be running at http://localhost:8080 (or another port if 8080 is in use).

You can now open your browser and navigate to the frontend URL to start using Movi!