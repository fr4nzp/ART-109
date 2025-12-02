/* =============================================================================
   MSN MESSENGER APP
   Windows Live Messenger recreation with buddy list and chat
   ============================================================================= */

class MSNMessenger {
    constructor() {
        this.contacts = [
            { name: 'Tom from MySpace', avatar: '👤', status: 'online', message: 'Thanks for the add!' },
            { name: 'AIMgirl2003', avatar: '👧', status: 'away', message: 'brb mom is calling' },
            { name: 'xXSkaterBoyXx', avatar: '🛹', status: 'online', message: 'avril lavigne 4ever' },
            { name: 'CoolDude98', avatar: '😎', status: 'busy', message: 'Do not disturb' },
            { name: 'angelfire_princess', avatar: '👸', status: 'online', message: 'check out my new geocities page!!' },
            { name: 'LonelyGirl15', avatar: '📹', status: 'offline', message: '' },
            { name: 'Clippy', avatar: '📎', status: 'online', message: 'It looks like you\'re writing a letter...' },
            { name: 'Dancing Baby', avatar: '👶', status: 'away', message: 'oogachaka oogachaka' }
        ];
        
        this.chatWindows = new Map();
    }
    
    /**
     * Get main MSN window content (Buddy List)
     */
    getContent() {
        return `
            <div class="msn-messenger">
                <!-- User Header -->
                <div class="msn-header">
                    <div class="msn-avatar">🙂</div>
                    <div class="msn-user-info">
                        <div class="msn-username">You (Online)</div>
                        <div class="msn-status">
                            <span class="status-indicator online"></span>
                            <span class="status-text">Feeling nostalgic...</span>
                        </div>
                    </div>
                </div>
                
                <!-- Search Box -->
                <div class="msn-search">
                    <input type="text" placeholder="Search contacts..." disabled>
                </div>
                
                <!-- Contacts List -->
                <div class="msn-contacts">
                    <div class="contact-group">
                        <div class="contact-group-header">
                            <span>▼ Online</span>
                            <span class="contact-group-count">(${this.getOnlineCount()})</span>
                        </div>
                        <ul class="contact-list">
                            ${this.renderContacts('online')}
                        </ul>
                    </div>
                    
                    <div class="contact-group">
                        <div class="contact-group-header">
                            <span>▼ Away</span>
                            <span class="contact-group-count">(${this.getAwayCount()})</span>
                        </div>
                        <ul class="contact-list">
                            ${this.renderContacts('away')}
                        </ul>
                    </div>
                    
                    <div class="contact-group">
                        <div class="contact-group-header">
                            <span>▼ Busy</span>
                            <span class="contact-group-count">(${this.getBusyCount()})</span>
                        </div>
                        <ul class="contact-list">
                            ${this.renderContacts('busy')}
                        </ul>
                    </div>
                    
                    <div class="contact-group">
                        <div class="contact-group-header">
                            <span>▼ Offline</span>
                            <span class="contact-group-count">(${this.getOfflineCount()})</span>
                        </div>
                        <ul class="contact-list">
                            ${this.renderContacts('offline')}
                        </ul>
                    </div>
                </div>
                
                <!-- Status Toolbar -->
                <div class="msn-toolbar">
                    <select class="status-dropdown">
                        <option value="online">● Available</option>
                        <option value="away">🌙 Away</option>
                        <option value="busy">🚫 Busy</option>
                        <option value="brb">⏰ Be Right Back</option>
                        <option value="phone">📞 On The Phone</option>
                        <option value="lunch">🍔 Out To Lunch</option>
                        <option value="offline">⚫ Appear Offline</option>
                    </select>
                    <button class="msn-button">Options</button>
                </div>
            </div>
        `;
    }
    
    /**
     * Render contacts by status
     */
    renderContacts(status) {
        return this.contacts
            .filter(c => c.status === status)
            .map(contact => `
                <li class="contact-item ${contact.status === 'offline' ? 'offline' : ''}" 
                    data-contact="${contact.name}">
                    <div class="contact-avatar">${contact.avatar}</div>
                    <div class="contact-info">
                        <div class="contact-name">${contact.name}</div>
                        ${contact.message ? `<div class="contact-message">${contact.message}</div>` : ''}
                    </div>
                    <span class="status-indicator ${contact.status}"></span>
                </li>
            `).join('');
    }
    
    getOnlineCount() {
        return this.contacts.filter(c => c.status === 'online').length;
    }
    
    getAwayCount() {
        return this.contacts.filter(c => c.status === 'away').length;
    }
    
    getBusyCount() {
        return this.contacts.filter(c => c.status === 'busy').length;
    }
    
    getOfflineCount() {
        return this.contacts.filter(c => c.status === 'offline').length;
    }
    
    /**
     * Attach event listeners to buddy list
     */
    attachListeners(container = document) {
        // Contact double-click to open chat
        const contactItems = container.querySelectorAll('.contact-item:not(.offline)');
        contactItems.forEach(item => {
            item.addEventListener('dblclick', () => {
                const contactName = item.dataset.contact;
                this.openChat(contactName);
            });
        });
        
        // Status dropdown change
        const statusDropdown = container.querySelector('.status-dropdown');
        if (statusDropdown) {
            statusDropdown.addEventListener('change', (e) => {
                this.changeStatus(e.target.value);
            });
        }
    }
    
    /**
     * Open chat window with contact
     */
    openChat(contactName) {
        const contact = this.contacts.find(c => c.name === contactName);
        if (!contact || contact.status === 'offline') return;
        
        // Check if chat window already exists
        const existingWindow = document.querySelector(`[data-chat="${contactName}"]`);
        if (existingWindow) {
            // Bring to front
            if (typeof bringWindowToFront === 'function') {
                bringWindowToFront(existingWindow);
            }
            return;
        }
        
        // Create new chat window
        if (typeof createWindow === 'function') {
            const chatWindow = createWindow({
                app: 'msn-chat',
                title: `Chat with ${contactName}`,
                icon: '💬',
                width: 450,
                height: 400,
                x: Math.random() * 200 + 150,
                y: Math.random() * 150 + 100
            });
            
            // Add contact identifier
            chatWindow.setAttribute('data-chat', contactName);
            
            // Set chat content
            const content = chatWindow.querySelector('.window-content');
            if (content) {
                content.innerHTML = this.getChatContent(contact);
                this.attachChatListeners(chatWindow, contact);
            }
        }
    }
    
    /**
     * Get chat window content
     */
    getChatContent(contact) {
        return `
            <div class="msn-chat">
                <div class="chat-header">
                    <div class="contact-avatar">${contact.avatar}</div>
                    <div class="chat-contact-name">${contact.name}</div>
                </div>
                
                <div class="chat-toolbar">
                    <button class="chat-tool-button" title="Font">🔤</button>
                    <button class="chat-tool-button" title="Emoticon">😊</button>
                    <button class="chat-tool-button nudge-button" title="Nudge!">🔔</button>
                    <button class="chat-tool-button" title="Wink">😉</button>
                    <button class="chat-tool-button" title="Send file">📎</button>
                </div>
                
                <div class="chat-messages">
                    <div class="message">
                        <div class="message-header">
                            ${contact.name} says: 
                            <span class="message-time">${this.getCurrentTime()}</span>
                        </div>
                        <div class="message-text">${this.getRandomGreeting()}</div>
                    </div>
                </div>
                
                <div class="chat-input-area">
                    <textarea class="chat-input" placeholder="Type a message..."></textarea>
                </div>
                
                <div class="chat-send-toolbar">
                    <span style="font-size: 10px; color: #666;">Press Enter to send</span>
                    <button class="chat-send-button">Send</button>
                </div>
            </div>
        `;
    }
    
    /**
     * Attach chat window listeners
     */
    attachChatListeners(chatWindow, contact) {
        const sendButton = chatWindow.querySelector('.chat-send-button');
        const chatInput = chatWindow.querySelector('.chat-input');
        const messagesContainer = chatWindow.querySelector('.chat-messages');
        const nudgeButton = chatWindow.querySelector('.nudge-button');
        
        // Send message
        const sendMessage = () => {
            const message = chatInput.value.trim();
            if (!message) return;
            
            // Add your message
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message sent';
            messageDiv.innerHTML = `
                <div class="message-header">
                    You say: 
                    <span class="message-time">${this.getCurrentTime()}</span>
                </div>
                <div class="message-text">${this.escapeHtml(message)}</div>
            `;
            messagesContainer.appendChild(messageDiv);
            
            // Clear input
            chatInput.value = '';
            
            // Scroll to bottom
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            
            // Auto-reply after delay
            setTimeout(() => {
                this.addAutoReply(contact, messagesContainer);
            }, 1000 + Math.random() * 2000);
        };
        
        // Send button click
        if (sendButton) {
            sendButton.addEventListener('click', sendMessage);
        }
        
        // Enter key to send
        if (chatInput) {
            chatInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });
        }
        
        // Nudge button
        if (nudgeButton) {
            nudgeButton.addEventListener('click', () => {
                this.sendNudge(chatWindow, contact, messagesContainer);
            });
        }
    }
    
    /**
     * Send nudge animation
     */
    sendNudge(chatWindow, contact, messagesContainer) {
        // Add nudge animation to window
        chatWindow.classList.add('nudge-active');
        
        // Add nudge message
        const nudgeDiv = document.createElement('div');
        nudgeDiv.className = 'nudge-message';
        nudgeDiv.textContent = `🔔 You have sent a nudge!`;
        messagesContainer.appendChild(nudgeDiv);
        
        // Remove animation class
        setTimeout(() => {
            chatWindow.classList.remove('nudge-active');
        }, 500);
        
        // Contact nudges back
        setTimeout(() => {
            chatWindow.classList.add('nudge-active');
            const replyNudge = document.createElement('div');
            replyNudge.className = 'nudge-message';
            replyNudge.textContent = `🔔 ${contact.name} sent you a nudge!`;
            messagesContainer.appendChild(replyNudge);
            
            setTimeout(() => {
                chatWindow.classList.remove('nudge-active');
            }, 500);
            
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 1500);
        
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    /**
     * Add auto-reply from contact
     */
    addAutoReply(contact, messagesContainer) {
        const replies = [
            'lol',
            'brb',
            'g2g',
            'ttyl',
            'omg really?',
            'haha nice',
            'yeah i know right',
            'wait what',
            'no way!',
            'that\'s so cool',
            'same tbh',
            'ASL? jk jk',
            'check ur email i sent u something',
            'did u see the new episode?'
        ];
        
        const reply = replies[Math.floor(Math.random() * replies.length)];
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        messageDiv.innerHTML = `
            <div class="message-header">
                ${contact.name} says: 
                <span class="message-time">${this.getCurrentTime()}</span>
            </div>
            <div class="message-text">${reply}</div>
        `;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    /**
     * Get random greeting
     */
    getRandomGreeting() {
        const greetings = [
            'hey!',
            'whats up?',
            'hi there!',
            'yo',
            'heyy',
            'wassup',
            'how r u?',
            'long time no see!',
            'omg hi!!',
            'hey stranger'
        ];
        return greetings[Math.floor(Math.random() * greetings.length)];
    }
    
    /**
     * Get current time
     */
    getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
    }
    
    /**
     * Change status
     */
    changeStatus(status) {
        console.log('Status changed to:', status);
        // Visual feedback
        const statusIndicator = document.querySelector('.msn-header .status-indicator');
        if (statusIndicator) {
            statusIndicator.className = `status-indicator ${status}`;
        }
    }
    
    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Make globally available
window.MSNMessenger = MSNMessenger;
