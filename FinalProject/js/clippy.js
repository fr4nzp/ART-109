/* =============================================================================
   CLIPPY - THE OFFICE ASSISTANT
   Annoying but lovable paperclip that pops up with "helpful" tips
   ============================================================================= */

class Clippy {
    constructor() {
        this.tips = [
            "It looks like you're trying to feel nostalgic. Would you like help with that?",
            "Did you know? You can double-click icons to open them! (You probably already knew that...)",
            "I see you're exploring Nostalgia OS. Would you like me to go away?",
            "Fun fact: I was the most annoying feature of Microsoft Office!",
            "It looks like you're procrastinating. Would you like me to judge you silently?",
            "Remember dial-up internet? Me neither, I'm just a paperclip.",
            "Would you like to:\n• Close this window\n• Please close this window\n• Seriously, close me",
            "I'm here to help! (Citation needed)",
            "Did you save your work? Just kidding, I can't actually help with that.",
            "It looks like you're having fun. I can fix that!"
        ];
        
        this.hasAppeared = false;
        this.currentTipIndex = 0;
    }
    
    /**
     * Initialize Clippy - show after delay
     */
    init() {
        // Show Clippy after 15 seconds
        setTimeout(() => {
            this.show();
        }, 15000);
        
        console.log('📎 Clippy initialized - will appear in 15 seconds...');
    }
    
    /**
     * Show Clippy with a random tip
     */
    show() {
        // Don't show if already visible
        if (document.querySelector('.clippy-container')) {
            return;
        }
        
        // Get random tip
        const tip = this.getRandomTip();
        
        // Create Clippy HTML
        const clippyHTML = `
            <div class="clippy-container">
                <div class="clippy-bubble">
                    <div class="clippy-text">${tip}</div>
                    <div class="clippy-buttons">
                        <button class="clippy-button" onclick="clippy.hide()">OK</button>
                        <button class="clippy-button" onclick="clippy.dismiss()">Don't show again</button>
                    </div>
                </div>
                <div class="clippy-character">
                    <span class="clippy-paperclip">📎</span>
                </div>
            </div>
        `;
        
        // Add to body
        document.body.insertAdjacentHTML('beforeend', clippyHTML);
        
        this.hasAppeared = true;
        
        console.log('📎 Clippy appeared!');
    }
    
    /**
     * Hide Clippy temporarily
     */
    hide() {
        const container = document.querySelector('.clippy-container');
        if (container) {
            container.classList.add('hidden');
            setTimeout(() => {
                container.remove();
            }, 300);
        }
        
        // Show again after random delay (30-60 seconds)
        const delay = 30000 + Math.random() * 30000;
        setTimeout(() => {
            this.show();
        }, delay);
        
        console.log('📎 Clippy hidden, will return...');
    }
    
    /**
     * Dismiss Clippy permanently (for this session)
     */
    dismiss() {
        const container = document.querySelector('.clippy-container');
        if (container) {
            container.classList.add('hidden');
            setTimeout(() => {
                container.remove();
            }, 300);
        }
        
        // Save to localStorage
        localStorage.setItem('clippy-dismissed', 'true');
        
        console.log('📎 Clippy dismissed permanently (this session)');
    }
    
    /**
     * Get a random tip
     */
    getRandomTip() {
        // Get a different tip than last time
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.tips.length);
        } while (newIndex === this.currentTipIndex && this.tips.length > 1);
        
        this.currentTipIndex = newIndex;
        return this.tips[newIndex];
    }
    
    /**
     * Check if Clippy should appear
     */
    shouldAppear() {
        return localStorage.getItem('clippy-dismissed') !== 'true';
    }
}

// Create global Clippy instance
const clippy = new Clippy();

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    if (clippy.shouldAppear()) {
        clippy.init();
    } else {
        console.log('📎 Clippy dismissed in previous session');
    }
});

// Make available globally
window.clippy = clippy;
