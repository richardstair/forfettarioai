// Gestione del tema
const themeToggle = document.getElementById('theme-toggle');
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

// Imposta il tema iniziale
function setInitialTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (prefersDarkScheme.matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
}

setInitialTheme();

themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

// Gestione della chat
const messagesContainer = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');

let conversationHistory = [];

// Auto-resize del campo di input
messageInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
    this.style.height = Math.min(this.scrollHeight, 150) + 'px';
});

// Funzione per aggiungere un messaggio alla chat
function addMessage(content, role) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    messageDiv.textContent = content;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Aggiorna la cronologia della conversazione
    conversationHistory.push({ role, content });
}

// Funzione per inviare un messaggio
async function sendMessage() {
    const content = messageInput.value.trim();
    if (!content) return;

    // Aggiungi il messaggio dell'utente
    addMessage(content, 'user');
    messageInput.value = '';
    messageInput.style.height = 'auto';

    // Disabilita l'input durante l'elaborazione
    messageInput.disabled = true;
    sendButton.disabled = true;

    try {
        console.log('Invio richiesta al server:', {
            messages: conversationHistory
        });

        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: conversationHistory
            })
        });

        console.log('Risposta ricevuta:', response);

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Errore dal server:', errorData);
            throw new Error(`Errore del server: ${response.status} - ${errorData}`);
        }

        const data = await response.json();
        console.log('Dati ricevuti:', data);
        
        if (!data.response) {
            throw new Error('Risposta del server non valida');
        }

        // Aggiungi la risposta dell'assistente
        addMessage(data.response, 'assistant');

    } catch (error) {
        console.error('Errore dettagliato:', error);
        addMessage(`Errore: ${error.message}`, 'assistant error');
    } finally {
        // Riabilita l'input
        messageInput.disabled = false;
        sendButton.disabled = false;
        messageInput.focus();
    }
}

// Event listeners per l'invio dei messaggi
sendButton.addEventListener('click', sendMessage);

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Funzione per gestire il ridimensionamento della finestra
function handleResize() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

window.addEventListener('resize', handleResize);
handleResize();