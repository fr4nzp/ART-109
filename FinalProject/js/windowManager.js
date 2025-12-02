/* =============================================================================
   NOSTALGIA OS - WINDOW MANAGER
   Window creation, management, dragging, and z-index handling
   ============================================================================= */

// =============================================================================
// WINDOW MANAGER STATE
// =============================================================================

const WindowManager = {
    windows: new Map(),           // Map of window ID to window data
    activeWindow: null,           // Currently active window ID
    nextZIndex: 100,              // Next z-index to assign
    nextWindowId: 1,              // Counter for unique window IDs
    dragState: null               // Current drag state (if dragging)
};

// =============================================================================
// WINDOW CREATION
// =============================================================================

/**
 * Create a new window
 * @param {Object} config - Window configuration
 * @returns {string} Window ID
 */
function createWindow(config) {
    const windowId = `window-${WindowManager.nextWindowId++}`;
    
    // Default configuration
    const defaultConfig = {
        app: 'untitled',
        title: 'Untitled',
        icon: '📄',
        width: 400,
        height: 300,
        x: 100,
        y: 100,
        dialog: false,
        menuBar: false,
        statusBar: false,
        resizable: true,
        minimizable: true,
        maximizable: true
    };
    
    // Merge with provided config
    const windowConfig = { ...defaultConfig, ...config };
    
    // Get window template
    const template = document.getElementById('window-template');
    const windowElement = template.content.cloneNode(true).querySelector('.window');
    
    // Set window attributes
    windowElement.id = windowId;
    windowElement.dataset.app = windowConfig.app;
    windowElement.style.width = `${windowConfig.width}px`;
    windowElement.style.height = `${windowConfig.height}px`;
    windowElement.style.left = `${windowConfig.x}px`;
    windowElement.style.top = `${windowConfig.y}px`;
    windowElement.style.zIndex = WindowManager.nextZIndex++;
    
    // Set title and icon
    const titleText = windowElement.querySelector('.window-title-text');
    const titleIcon = windowElement.querySelector('.window-icon');
    titleText.textContent = windowConfig.title;
    titleIcon.textContent = windowConfig.icon;
    
    // Handle dialog windows
    if (windowConfig.dialog) {
        windowElement.classList.add('dialog');
    }
    
    // Show/hide menu bar
    const menuBar = windowElement.querySelector('.window-menu-bar');
    if (windowConfig.menuBar) {
        menuBar.removeAttribute('hidden');
    } else {
        menuBar.setAttribute('hidden', '');
    }
    
    // Show/hide status bar
    const statusBar = windowElement.querySelector('.window-status-bar');
    if (windowConfig.statusBar) {
        statusBar.removeAttribute('hidden');
    } else {
        statusBar.setAttribute('hidden', '');
    }
    
    // Disable buttons if needed
    if (!windowConfig.minimizable) {
        windowElement.querySelector('.minimize-button').disabled = true;
    }
    if (!windowConfig.maximizable) {
        windowElement.querySelector('.maximize-button').disabled = true;
    }
    
    // Set up window content
    const content = windowElement.querySelector('.window-content');
    content.innerHTML = getAppContent(windowConfig.app);
    
    // Set up event listeners
    setupWindowEventListeners(windowElement, windowId, windowConfig);
    
    // Set up app-specific listeners
    setupAppListeners(windowConfig.app, windowElement);
    
    // Add to DOM
    const container = document.getElementById('windows-container');
    container.appendChild(windowElement);
    
    // Add opening animation
    windowElement.classList.add('opening');
    setTimeout(() => {
        windowElement.classList.remove('opening');
    }, 150);
    
    // Store window data
    WindowManager.windows.set(windowId, {
        id: windowId,
        element: windowElement,
        config: windowConfig,
        state: 'normal', // normal, minimized, maximized
        originalPosition: { x: windowConfig.x, y: windowConfig.y },
        originalSize: { width: windowConfig.width, height: windowConfig.height }
    });
    
    // Make this the active window
    setActiveWindow(windowId);
    
    // Add to taskbar
    addToTaskbar(windowId, windowConfig);
    
    console.log(`✅ Created window: ${windowId} (${windowConfig.app})`);
    
    return windowId;
}

/**
 * Get application-specific content HTML
 */
function getAppContent(appName) {
    const content = {
        'notepad': `
            <textarea class="notepad-textarea text-selectable" 
                      style="width: 100%; height: 100%; border: none; 
                             outline: none; resize: none; font-family: 'Courier New', monospace; 
                             font-size: 12px; padding: 4px;"
                      placeholder="Type here..."></textarea>
        `,
        'about': `
            <div style="display: flex; gap: 16px; align-items: flex-start;">
                <div class="dialog-icon">🖥️</div>
                <div>
                    <h2 style="margin: 0 0 12px 0; font-size: 14px;">Nostalgia OS</h2>
                    <p style="margin: 0 0 8px 0; font-size: 11px;">Version 1.0</p>
                    <p style="margin: 0 0 12px 0; font-size: 11px;">
                        A retro Windows 95 experience with a digital decay twist.
                    </p>
                    <p style="margin: 0 0 8px 0; font-size: 11px;">
                        Created by Franz for ART-109 Web Development Course
                    </p>
                    <p style="margin: 0; font-size: 11px;">
                        © 2025 - Final Project
                    </p>
                    <div class="dialog-buttons" style="margin-top: 16px;">
                        <button class="dialog-button" onclick="closeWindow('${window.currentWindowId}')">OK</button>
                    </div>
                </div>
            </div>
        `,
        'my-computer': `
            <div style="display: grid; grid-template-columns: repeat(auto-fill, 80px); gap: 16px; padding: 8px;">
                <div style="text-align: center; cursor: pointer;">
                    <div style="font-size: 32px;">💾</div>
                    <div style="font-size: 11px; margin-top: 4px;">(A:)</div>
                </div>
                <div style="text-align: center; cursor: pointer;">
                    <div style="font-size: 32px;">💿</div>
                    <div style="font-size: 11px; margin-top: 4px;">(C:)</div>
                </div>
                <div style="text-align: center; cursor: pointer;">
                    <div style="font-size: 32px;">💿</div>
                    <div style="font-size: 11px; margin-top: 4px;">(D:)</div>
                </div>
            </div>
        `,
        'recycle-bin': `
            <div style="text-align: center; padding: 32px;">
                <div style="font-size: 48px; margin-bottom: 16px;">🗑️</div>
                <p style="font-size: 11px;">The Recycle Bin is empty.</p>
            </div>
        `,
        'paint': `
            <div style="background: #fff; height: 100%; display: flex; flex-direction: column;">
                <div style="padding: 4px; border-bottom: 1px solid #808080; display: flex; gap: 4px;">
                    <button style="width: 32px; height: 32px;">✏️</button>
                    <button style="width: 32px; height: 32px;">🪣</button>
                    <button style="width: 32px; height: 32px;">⬜</button>
                </div>
                <canvas id="paint-canvas" style="flex: 1; cursor: crosshair;"></canvas>
            </div>
        `,
        'internet-explorer': `
            <div style="display: flex; flex-direction: column; height: 100%;">
                <div style="padding: 4px; display: flex; gap: 4px; background: #e0e0e0;">
                    <input type="text" value="http://www.nostalgia.os/welcome.html" 
                           style="flex: 1; padding: 2px 4px;" readonly>
                    <button style="padding: 2px 8px;">Go</button>
                </div>
                <div style="flex: 1; padding: 16px; background: white; overflow: auto;">
                    <h1 style="font-size: 24px; color: #000080; margin: 0 0 16px 0;">
                        🌟 Welcome to Nostalgia OS! 🌟
                    </h1>
                    <p style="font-size: 11px; line-height: 1.6;">
                        You've entered a digital time capsule from 1995...
                    </p>
                    <p style="font-size: 11px; line-height: 1.6;">
                        Explore the desktop, open applications, and watch as the system 
                        gradually decays with digital glitch effects.
                    </p>
                    <marquee style="margin-top: 16px; font-size: 11px;">
                        ⭐ This site is best viewed in Internet Explorer 3.0 ⭐
                    </marquee>
                </div>
            </div>
        `,
        'minesweeper': `
            <div style="text-align: center; padding: 32px;">
                <div style="font-size: 48px; margin-bottom: 16px;">💣</div>
                <p style="font-size: 11px;">Minesweeper game coming soon...</p>
                <p style="font-size: 11px; margin-top: 8px; color: #808080;">
                    (Phase 2 feature)
                </p>
            </div>
        `,
        'msn-messenger': `
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
                            <span class="contact-group-count">(3)</span>
                        </div>
                        <ul class="contact-list">
                            <li class="contact-item" data-contact="Tom from MySpace">
                                <div class="contact-avatar">👤</div>
                                <div class="contact-info">
                                    <div class="contact-name">Tom from MySpace</div>
                                    <div class="contact-message">Thanks for the add!</div>
                                </div>
                                <span class="status-indicator online"></span>
                            </li>
                            <li class="contact-item" data-contact="xXSkaterBoyXx">
                                <div class="contact-avatar">🛹</div>
                                <div class="contact-info">
                                    <div class="contact-name">xXSkaterBoyXx</div>
                                    <div class="contact-message">avril lavigne 4ever</div>
                                </div>
                                <span class="status-indicator online"></span>
                            </li>
                            <li class="contact-item" data-contact="angelfire_princess">
                                <div class="contact-avatar">👸</div>
                                <div class="contact-info">
                                    <div class="contact-name">angelfire_princess</div>
                                    <div class="contact-message">check out my new geocities page!!</div>
                                </div>
                                <span class="status-indicator online"></span>
                            </li>
                        </ul>
                    </div>
                    
                    <div class="contact-group">
                        <div class="contact-group-header">
                            <span>▼ Away</span>
                            <span class="contact-group-count">(2)</span>
                        </div>
                        <ul class="contact-list">
                            <li class="contact-item" data-contact="AIMgirl2003">
                                <div class="contact-avatar">👧</div>
                                <div class="contact-info">
                                    <div class="contact-name">AIMgirl2003</div>
                                    <div class="contact-message">brb mom is calling</div>
                                </div>
                                <span class="status-indicator away"></span>
                            </li>
                            <li class="contact-item" data-contact="Dancing Baby">
                                <div class="contact-avatar">👶</div>
                                <div class="contact-info">
                                    <div class="contact-name">Dancing Baby</div>
                                    <div class="contact-message">oogachaka oogachaka</div>
                                </div>
                                <span class="status-indicator away"></span>
                            </li>
                        </ul>
                    </div>
                    
                    <div class="contact-group">
                        <div class="contact-group-header">
                            <span>▼ Busy</span>
                            <span class="contact-group-count">(1)</span>
                        </div>
                        <ul class="contact-list">
                            <li class="contact-item" data-contact="CoolDude98">
                                <div class="contact-avatar">😎</div>
                                <div class="contact-info">
                                    <div class="contact-name">CoolDude98</div>
                                    <div class="contact-message">Do not disturb</div>
                                </div>
                                <span class="status-indicator busy"></span>
                            </li>
                        </ul>
                    </div>
                    
                    <div class="contact-group">
                        <div class="contact-group-header">
                            <span>▼ Offline</span>
                            <span class="contact-group-count">(2)</span>
                        </div>
                        <ul class="contact-list">
                            <li class="contact-item offline" data-contact="LonelyGirl15">
                                <div class="contact-avatar">📹</div>
                                <div class="contact-info">
                                    <div class="contact-name">LonelyGirl15</div>
                                </div>
                                <span class="status-indicator offline"></span>
                            </li>
                            <li class="contact-item offline" data-contact="Clippy">
                                <div class="contact-avatar">📎</div>
                                <div class="contact-info">
                                    <div class="contact-name">Clippy</div>
                                </div>
                                <span class="status-indicator offline"></span>
                            </li>
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
        `
    };
    
    return content[appName] || '<p style="padding: 16px;">Application content not found.</p>';
}

// =============================================================================
// WINDOW EVENT LISTENERS
// =============================================================================

/**
 * Set up event listeners for a window
 */
function setupWindowEventListeners(windowElement, windowId, config) {
    // Store current window ID for use in content
    window.currentWindowId = windowId;
    
    // Title bar - make window active on click
    windowElement.addEventListener('mousedown', () => {
        setActiveWindow(windowId);
    });
    
    // Title bar dragging
    const titleBar = windowElement.querySelector('.window-title-bar');
    titleBar.addEventListener('mousedown', (e) => {
        startDrag(windowId, e);
    });
    
    // Close button
    const closeButton = windowElement.querySelector('.close-button');
    closeButton.addEventListener('click', () => {
        closeWindow(windowId);
    });
    
    // Minimize button
    const minimizeButton = windowElement.querySelector('.minimize-button');
    minimizeButton.addEventListener('click', () => {
        minimizeWindow(windowId);
    });
    
    // Maximize button
    const maximizeButton = windowElement.querySelector('.maximize-button');
    maximizeButton.addEventListener('click', () => {
        toggleMaximizeWindow(windowId);
    });
}

/**
 * Set up app-specific event listeners
 */
function setupAppListeners(appName, windowElement) {
    // MSN Messenger specific listeners
    if (appName === 'msn-messenger') {
        // Need to wait for next tick so DOM is ready
        setTimeout(() => {
            if (typeof MSNMessenger !== 'undefined') {
                const msn = new MSNMessenger();
                // Pass window content as container to scope queries
                const content = windowElement.querySelector('.window-content');
                msn.attachListeners(content);
            }
        }, 0);
    }
    
    // Add more app-specific listeners here as needed
}

// =============================================================================
// WINDOW ACTIONS
// =============================================================================

/**
 * Close a window
 */
function closeWindow(windowId) {
    const windowData = WindowManager.windows.get(windowId);
    if (!windowData) return;
    
    const { element } = windowData;
    
    // Add closing animation
    element.classList.add('closing');
    
    setTimeout(() => {
        // Remove from DOM
        element.remove();
        
        // Remove from window manager
        WindowManager.windows.delete(windowId);
        
        // Remove from taskbar
        removeFromTaskbar(windowId);
        
        // If this was the active window, activate another
        if (WindowManager.activeWindow === windowId) {
            const remainingWindows = Array.from(WindowManager.windows.keys());
            if (remainingWindows.length > 0) {
                setActiveWindow(remainingWindows[remainingWindows.length - 1]);
            } else {
                WindowManager.activeWindow = null;
            }
        }
        
        console.log(`🗑️ Closed window: ${windowId}`);
    }, 150);
}

/**
 * Minimize a window
 */
function minimizeWindow(windowId) {
    const windowData = WindowManager.windows.get(windowId);
    if (!windowData) return;
    
    const { element } = windowData;
    
    // Add minimize animation
    element.classList.add('minimizing');
    
    setTimeout(() => {
        element.classList.remove('minimizing');
        element.classList.add('minimized');
        windowData.state = 'minimized';
        
        // Update taskbar button
        const taskbarButton = document.querySelector(`[data-window-id="${windowId}"]`);
        if (taskbarButton) {
            taskbarButton.classList.remove('active');
        }
        
        console.log(`➖ Minimized window: ${windowId}`);
    }, 200);
}

/**
 * Restore a minimized window
 */
function restoreWindow(windowId) {
    const windowData = WindowManager.windows.get(windowId);
    if (!windowData) return;
    
    const { element } = windowData;
    
    if (windowData.state === 'minimized') {
        element.classList.add('restoring');
        
        setTimeout(() => {
            element.classList.remove('minimized', 'restoring');
            windowData.state = 'normal';
            setActiveWindow(windowId);
        }, 200);
    } else {
        setActiveWindow(windowId);
    }
}

/**
 * Toggle maximize/restore window
 */
function toggleMaximizeWindow(windowId) {
    const windowData = WindowManager.windows.get(windowId);
    if (!windowData) return;
    
    const { element } = windowData;
    
    if (windowData.state === 'maximized') {
        // Restore to original size
        element.classList.remove('maximized');
        element.style.left = `${windowData.originalPosition.x}px`;
        element.style.top = `${windowData.originalPosition.y}px`;
        element.style.width = `${windowData.originalSize.width}px`;
        element.style.height = `${windowData.originalSize.height}px`;
        windowData.state = 'normal';
    } else {
        // Maximize
        element.classList.add('maximized');
        windowData.state = 'maximized';
    }
}

/**
 * Set a window as active
 */
function setActiveWindow(windowId) {
    // Remove active class from all windows
    WindowManager.windows.forEach((data, id) => {
        data.element.classList.remove('active');
        const taskbarButton = document.querySelector(`[data-window-id="${id}"]`);
        if (taskbarButton) {
            taskbarButton.classList.remove('active');
        }
    });
    
    // Set new active window
    const windowData = WindowManager.windows.get(windowId);
    if (!windowData) return;
    
    windowData.element.classList.add('active');
    windowData.element.style.zIndex = WindowManager.nextZIndex++;
    WindowManager.activeWindow = windowId;
    
    // Update taskbar
    const taskbarButton = document.querySelector(`[data-window-id="${windowId}"]`);
    if (taskbarButton) {
        taskbarButton.classList.add('active');
    }
}

// =============================================================================
// WINDOW DRAGGING
// =============================================================================

/**
 * Start dragging a window
 */
function startDrag(windowId, event) {
    const windowData = WindowManager.windows.get(windowId);
    if (!windowData || windowData.state === 'maximized') return;
    
    const { element } = windowData;
    const rect = element.getBoundingClientRect();
    
    WindowManager.dragState = {
        windowId,
        startX: event.clientX,
        startY: event.clientY,
        offsetX: event.clientX - rect.left,
        offsetY: event.clientY - rect.top
    };
    
    // Add event listeners
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', stopDrag);
    
    // Prevent text selection while dragging
    event.preventDefault();
}

/**
 * Handle dragging movement
 */
function handleDrag(event) {
    if (!WindowManager.dragState) return;
    
    const { windowId, offsetX, offsetY } = WindowManager.dragState;
    const windowData = WindowManager.windows.get(windowId);
    if (!windowData) return;
    
    const { element } = windowData;
    
    // Calculate new position
    let newX = event.clientX - offsetX;
    let newY = event.clientY - offsetY;
    
    // Constrain to viewport
    const maxX = window.innerWidth - element.offsetWidth;
    const maxY = window.innerHeight - element.offsetHeight - 28; // Account for taskbar
    
    newX = Math.max(0, Math.min(newX, maxX));
    newY = Math.max(0, Math.min(newY, maxY));
    
    // Apply new position
    element.style.left = `${newX}px`;
    element.style.top = `${newY}px`;
    
    // Update stored position
    windowData.originalPosition = { x: newX, y: newY };
}

/**
 * Stop dragging
 */
function stopDrag() {
    WindowManager.dragState = null;
    document.removeEventListener('mousemove', handleDrag);
    document.removeEventListener('mouseup', stopDrag);
}

// =============================================================================
// TASKBAR INTEGRATION
// =============================================================================

/**
 * Add window to taskbar
 */
function addToTaskbar(windowId, config) {
    const taskbarApps = document.getElementById('taskbar-apps');
    
    const button = document.createElement('button');
    button.className = 'taskbar-app-button active';
    button.dataset.windowId = windowId;
    
    button.innerHTML = `
        <span class="taskbar-app-icon">${config.icon}</span>
        <span class="taskbar-app-label">${config.title}</span>
    `;
    
    button.addEventListener('click', () => {
        const windowData = WindowManager.windows.get(windowId);
        if (windowData && windowData.state === 'minimized') {
            restoreWindow(windowId);
        } else if (WindowManager.activeWindow === windowId) {
            minimizeWindow(windowId);
        } else {
            setActiveWindow(windowId);
        }
    });
    
    taskbarApps.appendChild(button);
}

/**
 * Remove window from taskbar
 */
function removeFromTaskbar(windowId) {
    const button = document.querySelector(`[data-window-id="${windowId}"]`);
    if (button) {
        button.remove();
    }
}

// =============================================================================
// EXPORTS
// =============================================================================

// Make functions available globally
window.WindowManager = WindowManager;
window.createWindow = createWindow;
window.closeWindow = closeWindow;
window.minimizeWindow = minimizeWindow;
window.restoreWindow = restoreWindow;
window.toggleMaximizeWindow = toggleMaximizeWindow;
window.setActiveWindow = setActiveWindow;
window.bringWindowToFront = setActiveWindow; // Alias for MSN Messenger

console.log('✅ Window Manager loaded');