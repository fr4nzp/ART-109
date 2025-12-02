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
            <div style="padding: 8px; height: 100%; display: flex; flex-direction: column;">
                <div style="background: #ffffff; border: 2px inset #808080; flex: 1; overflow-y: auto; padding: 4px;">
                    <table style="width: 100%; font-size: 11px; border-collapse: collapse;">
                        <thead>
                            <tr style="background: #000080; color: #ffffff;">
                                <th style="text-align: left; padding: 4px; border: 1px solid #808080;">Name</th>
                                <th style="text-align: left; padding: 4px; border: 1px solid #808080;">Original Location</th>
                                <th style="text-align: left; padding: 4px; border: 1px solid #808080;">Date Deleted</th>
                                <th style="text-align: left; padding: 4px; border: 1px solid #808080;">Type</th>
                                <th style="text-align: right; padding: 4px; border: 1px solid #808080;">Size</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style="cursor: pointer;" onmouseover="this.style.background='#0000ff'; this.style.color='#ffffff'" onmouseout="this.style.background=''; this.style.color=''">
                                <td style="padding: 4px; border-bottom: 1px solid #e0e0e0;">
                                    <span style="margin-right: 4px;">📝</span>my_secret_diary.txt
                                </td>
                                <td style="padding: 4px; border-bottom: 1px solid #e0e0e0;">C:\\My Documents</td>
                                <td style="padding: 4px; border-bottom: 1px solid #e0e0e0;">3/15/2003</td>
                                <td style="padding: 4px; border-bottom: 1px solid #e0e0e0;">Text Document</td>
                                <td style="padding: 4px; border-bottom: 1px solid #e0e0e0; text-align: right;">2 KB</td>
                            </tr>
                            <tr style="cursor: pointer;" onmouseover="this.style.background='#0000ff'; this.style.color='#ffffff'" onmouseout="this.style.background=''; this.style.color=''">
                                <td style="padding: 4px; border-bottom: 1px solid #e0e0e0;">
                                    <span style="margin-right: 4px;">🎵</span>linkin_park_discography.zip
                                </td>
                                <td style="padding: 4px; border-bottom: 1px solid #e0e0e0;">C:\\Downloads\\LimeWire</td>
                                <td style="padding: 4px; border-bottom: 1px solid #e0e0e0;">6/22/2004</td>
                                <td style="padding: 4px; border-bottom: 1px solid #e0e0e0;">ZIP Archive</td>
                                <td style="padding: 4px; border-bottom: 1px solid #e0e0e0; text-align: right;">487 MB</td>
                            </tr>
                            <tr style="cursor: pointer;" onmouseover="this.style.background='#0000ff'; this.style.color='#ffffff'" onmouseout="this.style.background=''; this.style.color=''">
                                <td style="padding: 4px; border-bottom: 1px solid #e0e0e0;">
                                    <span style="margin-right: 4px;">⚠️</span>definitely_not_a_virus.exe
                                </td>
                                <td style="padding: 4px; border-bottom: 1px solid #e0e0e0;">C:\\Downloads</td>
                                <td style="padding: 4px; border-bottom: 1px solid #e0e0e0;">8/10/2005</td>
                                <td style="padding: 4px; border-bottom: 1px solid #e0e0e0;">Application</td>
                                <td style="padding: 4px; border-bottom: 1px solid #e0e0e0; text-align: right;">666 KB</td>
                            </tr>
                            <tr style="cursor: pointer;" onmouseover="this.style.background='#0000ff'; this.style.color='#ffffff'" onmouseout="this.style.background=''; this.style.color=''">
                                <td style="padding: 4px; border-bottom: 1px solid #e0e0e0;">
                                    <span style="margin-right: 4px;">�</span>homework (real)
                                </td>
                                <td style="padding: 4px; border-bottom: 1px solid #e0e0e0;">C:\\My Documents</td>
                                <td style="padding: 4px; border-bottom: 1px solid #e0e0e0;">11/3/2002</td>
                                <td style="padding: 4px; border-bottom: 1px solid #e0e0e0;">Folder</td>
                                <td style="padding: 4px; border-bottom: 1px solid #e0e0e0; text-align: right;">1.2 GB</td>
                            </tr>
                            <tr style="cursor: pointer;" onmouseover="this.style.background='#0000ff'; this.style.color='#ffffff'" onmouseout="this.style.background=''; this.style.color=''">
                                <td style="padding: 4px; border-bottom: 1px solid #e0e0e0;">
                                    <span style="margin-right: 4px;">📧</span>AOL_free_trial_cd.img
                                </td>
                                <td style="padding: 4px; border-bottom: 1px solid #e0e0e0;">C:\\</td>
                                <td style="padding: 4px; border-bottom: 1px solid #e0e0e0;">1/20/2001</td>
                                <td style="padding: 4px; border-bottom: 1px solid #e0e0e0;">Disc Image</td>
                                <td style="padding: 4px; border-bottom: 1px solid #e0e0e0; text-align: right;">650 MB</td>
                            </tr>
                            <tr style="cursor: pointer;" onmouseover="this.style.background='#0000ff'; this.style.color='#ffffff'" onmouseout="this.style.background=''; this.style.color=''">
                                <td style="padding: 4px; border-bottom: 1px solid #e0e0e0;">
                                    <span style="margin-right: 4px;">🖼️</span>my_myspace_profile_pic.jpg
                                </td>
                                <td style="padding: 4px; border-bottom: 1px solid #e0e0e0;">C:\\My Pictures</td>
                                <td style="padding: 4px; border-bottom: 1px solid #e0e0e0;">4/8/2006</td>
                                <td style="padding: 4px; border-bottom: 1px solid #e0e0e0;">JPEG Image</td>
                                <td style="padding: 4px; border-bottom: 1px solid #e0e0e0; text-align: right;">89 KB</td>
                            </tr>
                            <tr style="cursor: pointer;" onmouseover="this.style.background='#0000ff'; this.style.color='#ffffff'" onmouseout="this.style.background=''; this.style.color=''">
                                <td style="padding: 4px; border-bottom: 1px solid #e0e0e0;">
                                    <span style="margin-right: 4px;">🎮</span>pokemon_red_save.sav
                                </td>
                                <td style="padding: 4px; border-bottom: 1px solid #e0e0e0;">C:\\Emulators\\Saves</td>
                                <td style="padding: 4px; border-bottom: 1px solid #e0e0e0;">7/14/2004</td>
                                <td style="padding: 4px; border-bottom: 1px solid #e0e0e0;">Save File</td>
                                <td style="padding: 4px; border-bottom: 1px solid #e0e0e0; text-align: right;">32 KB</td>
                            </tr>
                            <tr style="cursor: pointer;" onmouseover="this.style.background='#0000ff'; this.style.color='#ffffff'" onmouseout="this.style.background=''; this.style.color=''">
                                <td style="padding: 4px; border-bottom: 1px solid #e0e0e0;">
                                    <span style="margin-right: 4px;">🌐</span>geocities_backup.html
                                </td>
                                <td style="padding: 4px; border-bottom: 1px solid #e0e0e0;">C:\\Websites</td>
                                <td style="padding: 4px; border-bottom: 1px solid #e0e0e0;">9/12/1999</td>
                                <td style="padding: 4px; border-bottom: 1px solid #e0e0e0;">HTML Document</td>
                                <td style="padding: 4px; border-bottom: 1px solid #e0e0e0; text-align: right;">14 KB</td>
                            </tr>
                            <tr style="cursor: pointer;" onmouseover="this.style.background='#0000ff'; this.style.color='#ffffff'" onmouseout="this.style.background=''; this.style.color=''">
                                <td style="padding: 4px; border-bottom: 1px solid #e0e0e0;">
                                    <span style="margin-right: 4px;">💿</span>totally_legal_windows_xp.iso
                                </td>
                                <td style="padding: 4px; border-bottom: 1px solid #e0e0e0;">C:\\Downloads\\Kazaa</td>
                                <td style="padding: 4px; border-bottom: 1px solid #e0e0e0;">10/25/2001</td>
                                <td style="padding: 4px; border-bottom: 1px solid #e0e0e0;">ISO Image</td>
                                <td style="padding: 4px; border-bottom: 1px solid #e0e0e0; text-align: right;">699 MB</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div style="margin-top: 8px; padding: 4px; background: #e0e0e0; border-top: 1px solid #808080; display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 11px;">9 items in Recycle Bin (3.8 GB)</span>
                    <button onclick="emptyRecycleBin()" style="padding: 4px 12px; font-size: 11px; cursor: pointer;">Empty Recycle Bin</button>
                </div>
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
            <div style="display: flex; flex-direction: column; height: 100%; background: #c0c0c0;">
                <!-- Browser Toolbar -->
                <div style="padding: 4px; display: flex; gap: 4px; background: #e0e0e0; border-bottom: 1px solid #808080;">
                    <button onclick="ieGoBack()" style="padding: 2px 8px; font-size: 11px;">← Back</button>
                    <button onclick="ieGoForward()" style="padding: 2px 8px; font-size: 11px;">Forward →</button>
                    <button onclick="ieRefresh()" style="padding: 2px 8px; font-size: 11px;">↻ Refresh</button>
                    <button onclick="ieGoHome()" style="padding: 2px 8px; font-size: 11px;">🏠 Home</button>
                </div>
                
                <!-- Address Bar -->
                <div style="padding: 4px; background: #f0f0f0; border-bottom: 1px solid #808080; display: flex; gap: 4px; align-items: center;">
                    <span style="font-size: 11px;">Address:</span>
                    <input id="ie-address-bar" type="text" value="http://www.nostalgia.os/welcome.html" 
                           style="flex: 1; padding: 2px 4px; font-size: 11px; font-family: 'Courier New', monospace;" readonly>
                    <button onclick="ieNavigate()" style="padding: 2px 8px; font-size: 11px;">Go</button>
                </div>
                
                <!-- Tab Bar -->
                <div style="display: flex; background: #e0e0e0; border-bottom: 2px solid #808080;">
                    <div class="ie-tab active" onclick="ieShowTab('home')" style="padding: 6px 16px; background: #ffffff; border: 1px solid #808080; border-bottom: none; cursor: pointer; font-size: 11px; margin-right: 2px;">
                        📄 Welcome
                    </div>
                    <div class="ie-tab" onclick="ieShowTab('error')" style="padding: 6px 16px; background: #d0d0d0; border: 1px solid #808080; border-bottom: none; cursor: pointer; font-size: 11px;">
                        ⚠️ Error Page
                    </div>
                </div>
                
                <!-- Content Area -->
                <div id="ie-content" style="flex: 1; padding: 16px; background: white; overflow: auto;">
                    <!-- Home Page Content (default) -->
                    <div id="ie-page-home" class="ie-page">
                        <div style="text-align: center; margin-bottom: 24px;">
                            <h1 style="font-size: 32px; color: #000080; margin: 0 0 8px 0; font-family: Arial, sans-serif;">
                                🖥️ Nostalgia OS
                            </h1>
                            <p style="font-size: 13px; color: #666; font-style: italic;">
                                A Digital Time Capsule from 1995-2005
                            </p>
                        </div>
                        
                        <div style="max-width: 600px; margin: 0 auto; font-size: 11px; line-height: 1.6;">
                            <h2 style="color: #000080; font-size: 16px; border-bottom: 2px solid #000080; padding-bottom: 4px;">
                                Welcome to Nostalgia OS
                            </h2>
                            
                            <p style="margin: 16px 0;">
                                <strong>Nostalgia OS</strong> is an interactive browser-based recreation of the Windows 95 
                                desktop environment, celebrating the early era of personal computing and the internet.
                            </p>
                            
                            <h3 style="color: #000080; font-size: 14px; margin-top: 20px;">🎯 Project Purpose</h3>
                            <p style="margin: 12px 0;">
                                This project explores <strong>digital nostalgia</strong> and the impermanence of technology. 
                                Just as Windows 95, MSN Messenger, and Geocities have disappeared, this experience reminds 
                                us that all digital artifacts are temporary.
                            </p>
                            
                            <h3 style="color: #000080; font-size: 14px; margin-top: 20px;">✨ Features</h3>
                            <ul style="margin: 12px 0; padding-left: 20px;">
                                <li>Authentic Windows 95 interface with draggable windows</li>
                                <li>MSN Messenger with nostalgic contacts</li>
                                <li>Clippy, the "helpful" Office Assistant</li>
                                <li>Recycle Bin filled with lost digital memories</li>
                                <li>Classic applications: Notepad, Paint, Minesweeper</li>
                                <li>Hidden Easter eggs and surprises</li>
                            </ul>
                            
                            <h3 style="color: #000080; font-size: 14px; margin-top: 20px;">🎓 About This Project</h3>
                            <p style="margin: 12px 0;">
                                Created as a final project for <strong>ART-109 Web Development</strong> at HfG Schwäbisch Gmünd.
                                Built with vanilla HTML, CSS, and JavaScript to demonstrate modern web development skills 
                                while recreating vintage aesthetics.
                            </p>
                            
                            <p style="margin: 20px 0; padding: 12px; background: #ffffcc; border: 1px solid #ffcc00;">
                                <strong>💡 Tip:</strong> Double-click desktop icons to explore different applications. 
                                Wait for Clippy to appear with "helpful" suggestions!
                            </p>
                            
                            <div style="text-align: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid #cccccc;">
                                <p style="font-size: 10px; color: #999;">
                                    © 2024 Nostalgia OS | Made with 💾 by Franz<br>
                                    <em>Best viewed in Internet Explorer 3.0 at 800x600 resolution</em>
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Error Page Content (hidden by default) -->
                    <div id="ie-page-error" class="ie-page" style="display: none;">
                        <div style="max-width: 500px; margin: 40px auto;">
                            <div style="display: flex; gap: 16px; align-items: flex-start;">
                                <div style="font-size: 48px;">⚠️</div>
                                <div>
                                    <h2 style="font-size: 18px; color: #000000; margin: 0 0 16px 0;">
                                        The page cannot be displayed
                                    </h2>
                                    
                                    <p style="font-size: 11px; line-height: 1.6; margin-bottom: 16px;">
                                        The page you are looking for is currently unavailable. The Web site might 
                                        be experiencing technical difficulties, or you may need to adjust your browser settings.
                                    </p>
                                    
                                    <hr style="border: none; border-top: 1px solid #cccccc; margin: 20px 0;">
                                    
                                    <h3 style="font-size: 12px; margin-bottom: 12px;">Please try the following:</h3>
                                    
                                    <ul style="font-size: 11px; line-height: 1.8; padding-left: 20px;">
                                        <li>Click the <strong>Refresh</strong> button, or try again later.</li>
                                        <li>If you typed the page address in the Address bar, make sure that it is spelled correctly.</li>
                                        <li>Open the <strong>localhost</strong> home page, and then look for links to the information you want.</li>
                                        <li>Click the <button onclick="alert('Search functionality not available. This is a 1999 website.')" style="font-size: 10px; padding: 2px 6px; cursor: pointer;">Search</button> button to look for information on the Internet.</li>
                                    </ul>
                                    
                                    <div style="background: #f0f0f0; padding: 12px; margin-top: 20px; border-left: 4px solid #000080;">
                                        <p style="font-size: 10px; margin: 0; line-height: 1.5;">
                                            <strong>HTTP 404 - File not found</strong><br>
                                            Internet Explorer
                                        </p>
                                    </div>
                                    
                                    <p style="font-size: 9px; color: #666; margin-top: 20px; font-style: italic;">
                                        (This error page is intentionally part of Nostalgia OS. Remember when the internet 
                                        felt this fragile? When nothing worked and we just accepted it?)
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Status Bar -->
                <div style="padding: 2px 8px; background: #e0e0e0; border-top: 1px solid #808080; font-size: 10px; display: flex; justify-content: space-between;">
                    <span>🌐 Internet zone</span>
                    <span id="ie-status">Done</span>
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
// HELPER FUNCTIONS
// =============================================================================

/**
 * Empty Recycle Bin
 */
function emptyRecycleBin() {
    // Show confirmation dialog
    const confirmed = confirm('Are you sure you want to permanently delete these 9 items?\n\nThey will be gone forever... like your childhood.');
    
    if (confirmed) {
        // Find recycle bin window
        const recycleBinWindow = Array.from(WindowManager.windows.values())
            .find(w => w.config.app === 'recycle-bin');
        
        if (recycleBinWindow) {
            const content = recycleBinWindow.element.querySelector('.window-content');
            content.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 32px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">🗑️</div>
                    <p style="font-size: 11px; margin-bottom: 8px;">The Recycle Bin is empty.</p>
                    <p style="font-size: 10px; color: #666; font-style: italic; margin-top: 16px; text-align: center;">
                        All your memories are gone now.<br>
                        Just like Geocities. Just like Myspace.<br>
                        Everything is temporary.
                    </p>
                </div>
            `;
        }
        
        console.log('🗑️ Recycle Bin emptied');
    }
}

/**
 * Internet Explorer Tab Navigation
 */
function ieShowTab(tabName) {
    // Hide all pages
    const pages = document.querySelectorAll('.ie-page');
    pages.forEach(page => page.style.display = 'none');
    
    // Show selected page
    const selectedPage = document.getElementById(`ie-page-${tabName}`);
    if (selectedPage) {
        selectedPage.style.display = 'block';
    }
    
    // Update tab styles
    const tabs = document.querySelectorAll('.ie-tab');
    tabs.forEach(tab => {
        tab.style.background = '#d0d0d0';
    });
    
    // Highlight active tab
    event.target.style.background = '#ffffff';
    
    // Update address bar
    const addressBar = document.getElementById('ie-address-bar');
    if (addressBar) {
        if (tabName === 'home') {
            addressBar.value = 'http://www.nostalgia.os/welcome.html';
        } else if (tabName === 'error') {
            addressBar.value = 'http://www.nostalgia.os/404.html';
        }
    }
    
    console.log(`🌐 IE: Switched to ${tabName} page`);
}

function ieGoBack() {
    document.getElementById('ie-status').textContent = 'Going back...';
    setTimeout(() => {
        document.getElementById('ie-status').textContent = 'Done';
    }, 500);
}

function ieGoForward() {
    document.getElementById('ie-status').textContent = 'Going forward...';
    setTimeout(() => {
        document.getElementById('ie-status').textContent = 'Done';
    }, 500);
}

function ieRefresh() {
    document.getElementById('ie-status').textContent = 'Refreshing...';
    setTimeout(() => {
        document.getElementById('ie-status').textContent = 'Done';
    }, 800);
}

function ieGoHome() {
    ieShowTab('home');
    document.getElementById('ie-status').textContent = 'Loading home page...';
    setTimeout(() => {
        document.getElementById('ie-status').textContent = 'Done';
    }, 500);
}

function ieNavigate() {
    document.getElementById('ie-status').textContent = 'Connecting...';
    setTimeout(() => {
        alert('Error: Unable to connect to server.\n\nThe Internet is not available.');
        document.getElementById('ie-status').textContent = 'Done';
    }, 1000);
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
window.emptyRecycleBin = emptyRecycleBin;

console.log('✅ Window Manager loaded');