/**
 * Windows XP Shutdown Sound
 * Plays when clicking Shut Down in Start Menu
 */

class ShutdownSound {
    constructor() {
        this.audioContext = null;
        this.init();
    }

    init() {
        // Create audio context on first user interaction
        document.addEventListener('click', () => {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
        }, { once: true });
    }

    // Generate Windows XP-style shutdown sound
    play() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // Create oscillators for the iconic 4-note sequence
        const notes = [
            { freq: 523.25, start: 0, duration: 0.15 },      // C5
            { freq: 392.00, start: 0.15, duration: 0.15 },   // G4
            { freq: 329.63, start: 0.3, duration: 0.15 },    // E4
            { freq: 261.63, start: 0.45, duration: 0.4 }     // C4 (longer)
        ];

        notes.forEach(note => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.frequency.value = note.freq;
            osc.type = 'sine';

            // Envelope
            gain.gain.setValueAtTime(0, now + note.start);
            gain.gain.linearRampToValueAtTime(0.3, now + note.start + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, now + note.start + note.duration);

            osc.start(now + note.start);
            osc.stop(now + note.start + note.duration);
        });

        console.log('🔊 Shutdown sound played');
    }
}

// Create global instance
window.shutdownSound = new ShutdownSound();

// Function to be called by shutdown button
function playShutdownSound() {
    window.shutdownSound.play();
    
    // Show shutdown screen
    setTimeout(() => {
        const shutdownMsg = document.createElement('div');
        shutdownMsg.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: #0c5da5;
            color: white;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 99998;
            font-family: 'MS Sans Serif', sans-serif;
        `;
        shutdownMsg.innerHTML = `
            <div style="font-size: 32px; margin-bottom: 20px;">💻</div>
            <div style="font-size: 24px; margin-bottom: 10px;">It's now safe to turn off</div>
            <div style="font-size: 24px;">your computer.</div>
            <div style="font-size: 12px; margin-top: 40px; opacity: 0.7;">(Click anywhere to return)</div>
        `;
        shutdownMsg.addEventListener('click', () => shutdownMsg.remove());
        document.body.appendChild(shutdownMsg);
    }, 1000);
}
