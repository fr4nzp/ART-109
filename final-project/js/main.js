/* =============================================================================
   NOSTALGIA OS - MAIN JAVASCRIPT
   Entry point, initialization, clock, and core event handlers
   ============================================================================= */

// =============================================================================
// APPLICATION STATE
// =============================================================================

const NostalgiaOS = {
    // Core state
    initialized: false,
    startTime: null,
    interactionTime: 0,
    glitchLevel: 0,
    
    // UI references
    elements: {
        desktop: null,
        taskbar: null,
        startButton: null,
        startMenu: null,
        clock: null,
        windowsContainer: null,
        taskbarApps: null
    },
    
    // Selected desktop icons
    selectedIcons: new Set(),
    
    // Interaction timer
    timerInterval: null
};

// =============================================================================
// INITIALIZATION
// =============================================================================

/**
 * Initialize the Nostalgia OS application
 */
function initializeNostalgiaOS() {
    console.log('🖥️ Initializing Nostalgia OS...');
    
    // Cache DOM elements
    cacheElements();
    
    // Set up event listeners
    setupEventListeners();
    
    // Start the clock
    startClock();
    
    // Start interaction timer
    startInteractionTimer();
    
    // Load saved state from localStorage
    loadState();
    
    // Mark as initialized
    NostalgiaOS.initialized = true;
    NostalgiaOS.startTime = Date.now();
    
    console.log('✅ Nostalgia OS initialized successfully!');
}

/**
 * Cache frequently accessed DOM elements
 */
function cacheElements() {
    NostalgiaOS.elements.desktop = document.getElementById('desktop');
    NostalgiaOS.elements.taskbar = document.getElementById('taskbar');
    NostalgiaOS.elements.startButton = document.getElementById('start-button');
    NostalgiaOS.elements.startMenu = document.getElementById('start-menu');
    NostalgiaOS.elements.clock = document.getElementById('system-clock');
    NostalgiaOS.elements.windowsContainer = document.getElementById('windows-container');
    NostalgiaOS.elements.taskbarApps = document.getElementById('taskbar-apps');
}

// =============================================================================
// EVENT LISTENERS
// =============================================================================

/**
 * Set up all event listeners
 */
function setupEventListeners() {
    // Start button click
    NostalgiaOS.elements.startButton.addEventListener('click', toggleStartMenu);
    
    // Close start menu when clicking outside
    document.addEventListener('click', handleOutsideClick);
    
    // Desktop icon interactions
    setupDesktopIconListeners();
    
    // Start menu item clicks
    setupStartMenuListeners();
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Prevent default context menu (we'll add our own later)
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
    
    console.log('✅ Event listeners set up');
}

/**
 * Set up desktop icon event listeners
 */
function setupDesktopIconListeners() {
    const desktopIcons = document.querySelectorAll('.desktop-icon');
    
    desktopIcons.forEach(icon => {
        // Single click - select icon
        icon.addEventListener('click', (e) => {
            e.stopPropagation();
            handleIconClick(icon, e);
        });
        
        // Double click - open application
        icon.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            handleIconDoubleClick(icon);
        });
        
        // Keyboard navigation
        icon.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleIconDoubleClick(icon);
            }
        });
    });
}

/**
 * Set up start menu item listeners
 */
function setupStartMenuListeners() {
    const menuItems = document.querySelectorAll('.start-menu-item');
    
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const appName = item.dataset.app;
            if (appName) {
                openApplication(appName);
                closeStartMenu();
            }
        });
    });
}

// =============================================================================
// ICON HANDLING
// =============================================================================

/**
 * Handle single click on desktop icon
 */
function handleIconClick(icon, event) {
    // Clear other selections if not holding Ctrl/Cmd
    if (!event.ctrlKey && !event.metaKey) {
        clearIconSelection();
    }
    
    // Toggle this icon's selection
    if (NostalgiaOS.selectedIcons.has(icon)) {
        icon.classList.remove('selected');
        NostalgiaOS.selectedIcons.delete(icon);
    } else {
        icon.classList.add('selected');
        NostalgiaOS.selectedIcons.add(icon);
    }
}

/**
 * Handle double click on desktop icon - open application
 */
function handleIconDoubleClick(icon) {
    const appName = icon.dataset.app;
    
    // Add opening animation
    icon.classList.add('opening');
    setTimeout(() => {
        icon.classList.remove('opening');
    }, 200);
    
    // Open the application
    if (appName) {
        openApplication(appName);
    }
    
    // Clear selection
    clearIconSelection();
}

/**
 * Clear all icon selections
 */
function clearIconSelection() {
    NostalgiaOS.selectedIcons.forEach(icon => {
        icon.classList.remove('selected');
    });
    NostalgiaOS.selectedIcons.clear();
}

// =============================================================================
// START MENU
// =============================================================================

/**
 * Toggle start menu visibility
 */
function toggleStartMenu(e) {
    e.stopPropagation();
    
    const isOpen = !NostalgiaOS.elements.startMenu.hasAttribute('hidden');
    
    if (isOpen) {
        closeStartMenu();
    } else {
        openStartMenu();
    }
}

/**
 * Open start menu
 */
function openStartMenu() {
    NostalgiaOS.elements.startMenu.removeAttribute('hidden');
    NostalgiaOS.elements.startButton.classList.add('active');
}

/**
 * Close start menu
 */
function closeStartMenu() {
    NostalgiaOS.elements.startMenu.setAttribute('hidden', '');
    NostalgiaOS.elements.startButton.classList.remove('active');
}

/**
 * Handle clicks outside start menu to close it
 */
function handleOutsideClick(e) {
    const startMenu = NostalgiaOS.elements.startMenu;
    const startButton = NostalgiaOS.elements.startButton;
    
    // Close start menu if clicking outside
    if (!startMenu.hasAttribute('hidden') && 
        !startMenu.contains(e.target) && 
        !startButton.contains(e.target)) {
        closeStartMenu();
    }
    
    // Clear icon selection if clicking on desktop
    if (e.target === NostalgiaOS.elements.desktop || 
        e.target.classList.contains('desktop')) {
        clearIconSelection();
    }
}

// =============================================================================
// APPLICATION LAUNCHER
// =============================================================================

/**
 * Open an application
 */
function openApplication(appName) {
    console.log(`🚀 Opening application: ${appName}`);
    
    // Get app configuration
    const appConfig = getAppConfig(appName);
    
    if (!appConfig) {
        console.error(`❌ Unknown application: ${appName}`);
        return;
    }
    
    // Create window using windowManager
    if (typeof createWindow === 'function') {
        createWindow(appConfig);
    } else {
        console.error('❌ WindowManager not loaded');
    }
}

/**
 * Get application configuration
 */
function getAppConfig(appName) {
    const configs = {
        'notepad': {
            app: 'notepad',
            title: 'Untitled - Notepad',
            icon: '📝',
            width: 500,
            height: 400,
            x: 100,
            y: 100
        },
        'paint': {
            app: 'paint',
            title: 'Paint',
            icon: '🎨',
            width: 600,
            height: 500,
            x: 150,
            y: 80
        },
        'my-computer': {
            app: 'my-computer',
            title: 'My Computer',
            icon: '💻',
            width: 480,
            height: 360,
            x: 120,
            y: 120
        },
        'internet-explorer': {
            app: 'internet-explorer',
            title: 'Internet Explorer',
            icon: '🌐',
            width: 700,
            height: 500,
            x: 80,
            y: 60
        },
        'minesweeper': {
            app: 'minesweeper',
            title: 'Minesweeper',
            icon: '💣',
            width: 320,
            height: 380,
            x: 200,
            y: 150
        },
        'about': {
            app: 'about',
            title: 'About Nostalgia OS',
            icon: 'ℹ️',
            width: 400,
            height: 300,
            x: 250,
            y: 180,
            dialog: true
        },
        'recycle-bin': {
            app: 'recycle-bin',
            title: 'Recycle Bin',
            icon: '🗑️',
            width: 450,
            height: 350,
            x: 140,
            y: 140
        }
    };
    
    return configs[appName] || null;
}

// =============================================================================
// SYSTEM CLOCK
// =============================================================================

/**
 * Start the system clock
 */
function startClock() {
    updateClock();
    // Update every second
    setInterval(updateClock, 1000);
}

/**
 * Update the clock display
 */
function updateClock() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;
    
    const clockElement = document.getElementById('clock-time');
    if (clockElement) {
        clockElement.textContent = timeString;
    }
}

// =============================================================================
// INTERACTION TIMER (for glitch effects)
// =============================================================================

/**
 * Start tracking interaction time
 */
function startInteractionTimer() {
    NostalgiaOS.timerInterval = setInterval(() => {
        NostalgiaOS.interactionTime++;
        
        // Update glitch level based on interaction time
        updateGlitchLevel();
    }, 1000); // Update every second
}

/**
 * Update glitch level based on interaction time
 */
function updateGlitchLevel() {
    const minutes = Math.floor(NostalgiaOS.interactionTime / 60);
    
    let newLevel = 0;
    if (minutes >= 10) newLevel = 3;      // 10+ min - Intense
    else if (minutes >= 5) newLevel = 2;  // 5-10 min - Moderate
    else if (minutes >= 2) newLevel = 1;  // 2-5 min - Subtle
    
    if (newLevel !== NostalgiaOS.glitchLevel) {
        NostalgiaOS.glitchLevel = newLevel;
        console.log(`⚡ Glitch level updated: ${newLevel}`);
        
        // Trigger glitch effects (to be implemented)
        if (typeof triggerGlitchEffects === 'function') {
            triggerGlitchEffects(newLevel);
        }
    }
}

// =============================================================================
// STATE PERSISTENCE
// =============================================================================

/**
 * Load saved state from localStorage
 */
function loadState() {
    try {
        const savedState = localStorage.getItem('nostalgiaOS-state');
        if (savedState) {
            const state = JSON.parse(savedState);
            NostalgiaOS.interactionTime = state.interactionTime || 0;
            console.log('📂 Loaded saved state');
        }
    } catch (error) {
        console.error('❌ Error loading state:', error);
    }
}

/**
 * Save current state to localStorage
 */
function saveState() {
    try {
        const state = {
            interactionTime: NostalgiaOS.interactionTime,
            lastSaved: Date.now()
        };
        localStorage.setItem('nostalgiaOS-state', JSON.stringify(state));
    } catch (error) {
        console.error('❌ Error saving state:', error);
    }
}

/**
 * Auto-save state periodically
 */
setInterval(saveState, 30000); // Save every 30 seconds

// Save state before page unload
window.addEventListener('beforeunload', saveState);

// =============================================================================
// KEYBOARD SHORTCUTS
// =============================================================================

/**
 * Handle keyboard shortcuts
 */
function handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + Escape - Close all windows (to be implemented)
    if ((e.ctrlKey || e.metaKey) && e.key === 'Escape') {
        e.preventDefault();
        console.log('🔒 Close all windows shortcut');
        // TODO: Implement close all windows
    }
    
    // Windows key / Cmd + S - Toggle start menu
    if ((e.metaKey && e.key === 's') || e.key === 'Meta') {
        e.preventDefault();
        toggleStartMenu(e);
    }
    
    // Escape - Close start menu
    if (e.key === 'Escape') {
        if (!NostalgiaOS.elements.startMenu.hasAttribute('hidden')) {
            closeStartMenu();
        }
    }
}

// =============================================================================
// INITIALIZATION ON DOM READY
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
    initializeNostalgiaOS();
});

// =============================================================================
// EXPORTS (for use by other modules)
// =============================================================================

// Make core functions available globally
window.NostalgiaOS = NostalgiaOS;
window.openApplication = openApplication;
window.closeStartMenu = closeStartMenu;
