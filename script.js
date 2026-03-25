document.addEventListener('DOMContentLoaded', () => {
    // Scroll reveal animation with IntersectionObserver
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // Triggers when 15% of the element is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                // Optional: Stop observing once revealed
                // observer.unobserve(entry.target);
            } else {
                // Removing this allows the animation to repeat on scroll up
                // If you want it only once, leave the line above uncommented and remove this else block
            }
        });
    }, observerOptions);

    const hiddenElements = document.querySelectorAll('.fade-in, .slide-left, .slide-right, .fade-up');
    hiddenElements.forEach((el) => {
        observer.observe(el);
    });

    // Navbar transparency effect on scroll
    const nav = document.querySelector('nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.style.background = 'rgba(5, 5, 5, 0.95)';
            nav.style.boxShadow = '0 5px 20px rgba(0,0,0,0.5)';
            nav.style.padding = '15px 50px';
        } else {
            nav.style.background = 'rgba(5, 5, 5, 0.8)';
            nav.style.boxShadow = 'none';
            nav.style.padding = '20px 50px';
        }
    });

    // --- AI Chatbot Logic ---
    const chatBtn = document.getElementById('ai-chat-btn');
    const chatWindow = document.getElementById('ai-chat-window');
    const closeChatBtn = document.getElementById('close-chat');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendChatBtn = document.getElementById('send-chat');

    // Toggle chat window
    chatBtn.addEventListener('click', () => {
        chatWindow.classList.toggle('chat-hidden');
        if (!chatWindow.classList.contains('chat-hidden')) {
            setTimeout(() => chatInput.focus(), 300);
        }
    });

    closeChatBtn.addEventListener('click', () => {
        chatWindow.classList.add('chat-hidden');
    });

    // Helper to append messages
    function appendMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}-message`;
        msgDiv.innerHTML = text;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return msgDiv;
    }

    // Helper to add loading dots
    function addLoadingIndicator() {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ai-message typing-indicator`;
        msgDiv.innerHTML = `<div class="typing-dots"><span></span><span></span><span></span></div>`;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return msgDiv;
    }

    // Handle sending message
    async function sendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        // 1. Show user message
        appendMessage(text, 'user');
        chatInput.value = '';

        // 2. Show loading
        const loadingDiv = addLoadingIndicator();

        // 3. Call Vercel Serverless Function
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });

            const data = await response.json();
            
            // Remove loading
            loadingDiv.remove();

            if (response.ok) {
                // Convert simple Markdown to HTML
                let formattedReply = data.reply
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/\n/g, '<br>');
                appendMessage(formattedReply, 'ai');
            } else {
                appendMessage('Xin lỗi, hệ thống AI đang bận hoặc bị lỗi. Vui lòng thử lại sau!', 'ai');
                console.error('Chat error:', data.error);
            }
        } catch (error) {
            loadingDiv.remove();
            appendMessage('Lỗi kết nối mạng hoặc máy chủ.', 'ai');
            console.error('Fetch error:', error);
        }
    }

    sendChatBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
});
