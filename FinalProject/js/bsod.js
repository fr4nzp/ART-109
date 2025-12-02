/**
 * Blue Screen of Death Easter Egg
 * Appears after 3 minutes of use
 */

class BSOD {
    constructor() {
        this.triggered = false;
        this.keysPressed = {};
        this.init();
    }

    init() {
        // Create BSOD overlay
        this.createOverlay();
        
        // Trigger after 1 minute
        setTimeout(() => {
            this.show();
        }, 60000); // 1 minute
        
        // Manual trigger with just 'D' key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'd' || e.key === 'D') {
                this.show();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keysPressed[e.key] = false;
        });
    }

    createOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'bsod-overlay';
        overlay.id = 'bsod';
        
        overlay.innerHTML = `
            <div class="bsod-content">
                <div class="bsod-title">Windows</div>
                
                <div class="bsod-error">
                    A fatal exception 0E has occurred at 0028:C0011E36 in VXD VMM(01) +
                    00010E36. The current application will be terminated.
                </div>
                
                <div class="bsod-code">
                    * Press any key to terminate the current application.<br>
                    * Press CTRL+ALT+DEL again to restart your computer. You will<br>
                      lose any unsaved information in all applications.
                </div>
                
                <div style="margin: 30px 0;">
                    Error: 0E : 0028 : C0011E36<br><br>
                    
                    Press any key to continue _
                </div>
                
                <div class="bsod-instruction">
                    Press any key to continue
                </div>
            </div>
            
            <div class="bsod-footer">
                Just kidding! This is part of Nostalgia OS :)<br>
                Press any key to return to safety...
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Close on any key press
        document.addEventListener('keydown', (e) => {
            if (this.triggered) {
                this.hide();
            }
        });
        
        // Also close on click (for mobile/touch)
        overlay.addEventListener('click', () => {
            if (this.triggered) {
                this.hide();
            }
        });
    }

    show() {
        this.triggered = true;
        const overlay = document.getElementById('bsod');
        overlay.classList.add('active');
        console.log('💀 BSOD triggered!');
    }

    hide() {
        const overlay = document.getElementById('bsod');
        overlay.classList.remove('active');
        this.triggered = false;
        console.log('✅ BSOD dismissed');
    }
}

// Initialize BSOD on page load
window.addEventListener('DOMContentLoaded', () => {
    new BSOD();
});
