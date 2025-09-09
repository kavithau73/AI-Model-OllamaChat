AI-Model-OllamaChat is a full-stack chat application that allows users to interact with AI models locally using Ollama. The project combines a React frontend (gemma-ui) for a user-friendly chat interface, a FastAPI backend for processing requests, and a local LLM (Gemma/LLaMA) model for AI-generated responses. Users can upload documents, ask questions, and receive intelligent answers in real-time. This project demonstrates integrating modern frontend and backend technologies with local AI models for interactive and responsive AI-powered applications.

# AI-Model-OllamaChat
# AI Model Chat (Frontend + Backend + Ollama)

This project is a full-stack chat application built with:
- **Frontend**: React (gemma-ui)
- **Backend**: FastAPI (Python)
- **AI Model**: Ollama (local LLM runtime)

It allows users to interact with AI models (like LLaMA/Gemma) via a clean chat UI.

---

## 🚀 Project Structure
my-project/
├── backend/ # FastAPI backend server
├── gemma-ui/ # React frontend
└── README.md # Project instructions

---

## ⚙️ Requirements

- Node.js (>=16)
- Python (>=3.9)
- Pip / Virtualenv
- Ollama installed locally → [Install guide](https://ollama.ai/download)

---

## ▶️ Running the Backend (FastAPI)

1. Open terminal in `backend/`:
   ```bash
   cd backend
2. Create a virtual environment:
  venv\Scripts\activate
3. Activate it: On Windows:
   venv\Scripts\activate
4. Install dependencies:
   pip install -r requirements.txt
5. Run the backend server:
   uvicorn server:app --reload --port 5000
6.Start the React app:
  npm start


🤖 Running Ollama
1. Make sure Ollama is installed.
2. Pull a model (example: gemma):
    ollama pull gemma
3. Start the Ollama server:
    ollama run gemma

The backend will connect to Ollama for AI responses.

📝 How it Works
Frontend (gemma-ui) → Sends user messages to the backend API.
Backend (FastAPI) → Handles requests, forwards prompts to Ollama, and returns AI responses.
Ollama → Runs the AI model locally and generates answers.

🔮 Future Improvements
Add user authentication
Support for multiple models (LLaMA, Gemma, Mistral, etc.)
Save chat history in database
