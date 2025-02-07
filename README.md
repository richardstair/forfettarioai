# ForfettarioAI Chat

Un'applicazione web per interagire con un chatbot basato su Pinecone e Claude 3.5 Sonnet.

## Requisiti

- Python 3.10+
- Pinecone API Key

## Configurazione Locale

1. Clona il repository
2. Crea un file `.env` nella root del progetto con le seguenti variabili:
```
PINECONE_API_KEY=your_pinecone_api_key
```

3. Installa le dipendenze:
```bash
pip install -r requirements.txt
```

## Avvio Locale

Per avviare l'applicazione in locale:

```bash
uvicorn main:app --reload
```

L'applicazione sarà disponibile all'indirizzo: http://localhost:8000

## Deployment su Render

Per deployare l'applicazione su Render:

1. Crea un account su [Render](https://render.com)

2. Crea un nuovo Web Service:
   - Vai su Dashboard > New + > Web Service
   - Collega il tuo repository GitHub
   - Seleziona il repository
   - Configura il servizio:
     - Name: forfettarioai (o altro nome a scelta)
     - Environment: Python
     - Build Command: `pip install -r requirements.txt`
     - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

3. Aggiungi la variabile d'ambiente:
   - Vai nella sezione Environment
   - Aggiungi `PINECONE_API_KEY` con il tuo valore

4. Clicca su "Create Web Service"

Render genererà automaticamente un URL per la tua applicazione (es. https://forfettarioai.onrender.com)

### Note sul Piano Gratuito di Render

- Il servizio va in sleep mode dopo 15 minuti di inattività
- Al primo accesso potrebbe impiegare circa 1 minuto per "svegliarsi"
- Hai 750 ore gratuite al mese
- Prestazioni limitate ma sufficienti per testing

## Struttura del Progetto

```
forfettarioai/
├── .env                # File configurazione API keys
├── main.py            # Backend FastAPI
├── requirements.txt   # Dipendenze Python
├── render.yaml        # Configurazione Render
├── README.md          # Documentazione
└── static/            # Frontend
    ├── index.html     # Pagina principale
    ├── style.css      # Stili CSS
    └── script.js      # Logica frontend
```

## Caratteristiche

- Interfaccia chat moderna e responsive
- Supporto tema chiaro/scuro
- Streaming delle risposte
- Gestione sicura delle API key
- Integrazione con Pinecone e Claude 3.5 Sonnet