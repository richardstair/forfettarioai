// DOM Elements
const messagesContainer = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const themeToggle = document.getElementById('theme-toggle');
const userMessageTemplate = document.getElementById('user-message-template');
const assistantMessageTemplate = document.getElementById('assistant-message-template');
const typingIndicatorTemplate = document.getElementById('typing-indicator-template');

// Conversation history
let conversationHistory = [];

// Theme management
function initializeTheme() {
    // Check for saved theme preference or use system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
    } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
    }
}

function toggleTheme() {
    if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        localStorage.setItem('theme', 'light');
    } else {
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    }
    
    // Add subtle animation
    document.body.classList.add('dark-mode-transition');
    setTimeout(() => {
        document.body.classList.remove('dark-mode-transition');
    }, 300);
}

// Auto-resize textarea
function autoResizeTextarea() {
    messageInput.style.height = 'auto';
    messageInput.style.height = Math.min(messageInput.scrollHeight, 200) + 'px';
}

// Add message to chat
function addMessage(content, role) {
    // Select the appropriate template
    const template = role === 'user' 
        ? userMessageTemplate 
        : assistantMessageTemplate;
    
    // Clone the template
    const messageElement = template.content.cloneNode(true);
    
    // Set the message content
    const messageContent = messageElement.querySelector('.message-content');
    messageContent.textContent = content;
    
    // Add to the messages container
    messagesContainer.appendChild(messageElement);
    
    // Scroll to the bottom
    scrollToBottom();
    
    // Update conversation history
    conversationHistory.push({ role, content });
}

// Show typing indicator
function showTypingIndicator() {
    const indicator = typingIndicatorTemplate.content.cloneNode(true);
    indicator.querySelector('.typing-indicator').id = 'typing-indicator';
    messagesContainer.appendChild(indicator);
    scrollToBottom();
}

// Remove typing indicator
function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
        indicator.parentElement.parentElement.remove();
    }
}

// Scroll to bottom of messages
function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Send message to API
async function sendMessage() {
    const content = messageInput.value.trim();
    if (!content) return;
    
    // Add user message to chat
    addMessage(content, 'user');
    
    // Clear input and reset height
    messageInput.value = '';
    messageInput.style.height = 'auto';
    
    // Disable input during processing
    messageInput.disabled = true;
    sendButton.disabled = true;
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
        // Send request to API
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: conversationHistory
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        
        // Remove typing indicator
        removeTypingIndicator();
        
        // Add assistant response with typing effect
        if (data.response) {
            addMessageWithTypingEffect(data.response, 'assistant');
        } else {
            throw new Error('Empty response from server');
        }
        
    } catch (error) {
        console.error('Error:', error);
        removeTypingIndicator();
        
        // Add error message
        const errorMessage = 'Mi dispiace, si è verificato un errore. Riprova più tardi.';
        addMessage(errorMessage, 'assistant');
        
    } finally {
        // Re-enable input
        messageInput.disabled = false;
        sendButton.disabled = false;
        messageInput.focus();
    }
}

// Add message with typing effect
function addMessageWithTypingEffect(text, role) {
    // Select the appropriate template
    const template = role === 'user' 
        ? userMessageTemplate 
        : assistantMessageTemplate;
    
    // Clone the template
    const messageElement = template.content.cloneNode(true);
    
    // Get the message content element
    const messageContent = messageElement.querySelector('.message-content');
    messageContent.textContent = '';
    
    // Add to the messages container
    messagesContainer.appendChild(messageElement);
    
    // Update conversation history immediately
    conversationHistory.push({ role, content: text });
    
    // Scroll to the bottom
    scrollToBottom();
    
    // Typing effect
    let i = 0;
    const typingSpeed = 10; // ms per character
    
    function typeNextChar() {
        if (i < text.length) {
            messageContent.textContent += text.charAt(i);
            i++;
            scrollToBottom();
            setTimeout(typeNextChar, typingSpeed);
        }
    }
    
    // Start typing effect
    typeNextChar();
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme
    initializeTheme();
    
    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);
    
    // Auto-resize textarea
    messageInput.addEventListener('input', autoResizeTextarea);
    
    // Send message on button click
    sendButton.addEventListener('click', sendMessage);
    
    // Send message on Enter (but not with Shift+Enter)
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Focus input on page load
    messageInput.focus();
});

// Handle window resize
window.addEventListener('resize', () => {
    // Update any responsive elements if needed
});

// Add subtle hover effects to buttons
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('mouseenter', () => {
        button.style.transform = 'translateY(-1px)';
    });
    
    button.addEventListener('mouseleave', () => {
        button.style.transform = 'translateY(0)';
    });
});
