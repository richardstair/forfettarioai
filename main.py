from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List
import os
import re
from dotenv import load_dotenv
from pinecone import Pinecone
from pinecone_plugins.assistant.models.chat import Message

# Carica le variabili d'ambiente
load_dotenv()

# Verifica la presenza dell'API key di Pinecone
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
if not PINECONE_API_KEY:
    raise ValueError("PINECONE_API_KEY non trovata nel file .env")

app = FastAPI(title="ForfettarioAI")

# Configura CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Monta i file statici
app.mount("/static", StaticFiles(directory="static"), name="static")

# Inizializza Pinecone e l'assistente
pc = Pinecone(api_key=PINECONE_API_KEY)
assistant = pc.assistant.Assistant(
    assistant_name="forfettarioai"
)

def clean_response(text: str) -> str:
    # Rimuove i riferimenti e gli URL alla fine della risposta
    if "References:" in text:
        text = text.split("References:")[0].strip()
    # Rimuove eventuali [1] o altri riferimenti numerici
    text = re.sub(r'\[\d+\]', '', text)
    return text.strip()

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

@app.post("/api/chat")
async def chat(request: ChatRequest):
    try:
        # Converti i messaggi nel formato richiesto da Pinecone
        pinecone_messages = [
            Message(role=msg.role, content=msg.content)
            for msg in request.messages
        ]
        
        # Ottieni la risposta dall'assistente usando chat_completions con il modello specificato
        response = assistant.chat_completions(
            messages=pinecone_messages,
            stream=True,
            model="claude-3-5-sonnet"
        )
        
        # Accumula la risposta completa dallo stream
        full_response = ""
        for chunk in response:
            if chunk and hasattr(chunk, 'choices') and chunk.choices:
                content = chunk.choices[0].delta.content
                if content:
                    full_response += content
        
        # Pulisci la risposta prima di inviarla
        cleaned_response = clean_response(full_response)
        
        return {"response": cleaned_response}
        
    except Exception as e:
        print(f"Errore: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Rotta per servire l'interfaccia web
@app.get("/")
async def root():
    return FileResponse("static/index.html")