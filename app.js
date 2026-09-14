// ============================================
// Roblox Game Pass Maker - DEMO EDITION
// Frontend only - LOCAL STORAGE ONLY
// ============================================
// 
// ⚠️ IMPORTANT:
// This is a FRONTEND DEMONSTRATION of the UI/UX.
// Game passes created here are stored in browser localStorage ONLY.
// They do NOT appear on Roblox.
//
// To create REAL Roblox Game Passes, you need:
// 1. A backend server (Node.js, Python, etc.)
// 2. Roblox OAuth credentials (from Roblox Developer Portal)
// 3. Real Roblox API integration
//
// See BACKEND_SETUP.md for implementation guide
// ============================================

const CONFIG = {
    // NOTE: These credentials are placeholders
    // Real deployment requires a secure backend
    ROBLOX_CLIENT_ID: 'YOUR_ROBLOX_CLIENT_ID',
    ROBLOX_API_BASE: 'https://apis.roblox.com',
    LOCAL_STORAGE_KEY: 'roblox_gamepass_maker_demo',
    DEMO_MODE: true
};

let appState = {
    isLoggedIn: false,
    userId: null,
    username: null,
    gamePasses: [],
    currentIcon: null
    // NOTE: accessToken is NOT stored for security reasons
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    loadStateFromStorage();
    initializeDragDrop();
    
    if (appState.isLoggedIn) {
        showAppSection();
        loadUserProfile();
        loadGamePassHistory();
    } else {
        showLoginSection();
    }
});

// ============================================
// LOCAL STORAGE (DEMO MODE ONLY)
// ============================================

function saveStateToStorage() {
    // NOTE: In production, don't store auth tokens in localStorage
    const saveData = {
        isLoggedIn: appState.isLoggedIn,
        userId: appState.userId,
        username: appState.username,
        gamePasses: appState.gamePasses
    };
    localStorage.setItem(CONFIG.LOCAL_STORAGE_KEY, JSON.stringify(saveData));
}

function loadStateFromStorage() {
    const stored = localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY);
    if (stored) {
        try {
            const data = JSON.parse(stored);
            appState = { ...appState, ...data };
        } catch (e) {
            console.warn('Failed to load stored state:', e);
        }
    }
}

// ============================================
// UI SECTION MANAGEMENT
// ============================================

function showLoginSection() {
    document.getElementById('login-section').classList.remove('hidden');
    document.getElementById('app-section').classList.add('hidden');
}

function showAppSection() {
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('app-section').classList.remove('hidden');
}

// ============================================
// DEMO AUTHENTICATION (NOT REAL ROBLOX)
// ============================================

async function robloxLogin() {
    try {
        showStatus('🔐 Demo Login (Frontend Only)', 'loading');
        
        // This is DEMO ONLY - simulates a login
        // Real implementation would redirect to Roblox OAuth
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        // Generate fake demo credentials
        const mockUserId = Math.floor(Math.random() * 999999999);
        const mockUsername = `DemoUser_${mockUserId}`;
        
        appState.isLoggedIn = true;
        appState.userId = mockUserId;
        appState.username = mockUsername;
        
        saveStateToStorage();
        showAppSection();
        loadUserProfile();
        loadGamePassHistory();
        
        clearStatus();
        showStatus('✅ Demo login successful (local storage)', 'success');
        setTimeout(() => clearStatus(), 3000);
        
    } catch (error) {
        showStatus('❌ Demo login error', 'error');
        console.error('Login error:', error);
    }
}

function logout() {
    if (confirm('Clear demo data and logout?')) {
        appState = {
            isLoggedIn: false,
            userId: null,
            username: null,
            gamePasses: [],
            currentIcon: null
        };
        
        localStorage.removeItem(CONFIG.LOCAL_STORAGE_KEY);
        clearForm();
        clearStatus();
        showLoginSection();
        
        showStatus('👋 Demo data cleared', 'success');
        setTimeout(() => clearStatus(), 2000);
    }
}

// ============================================
// USER PROFILE
// ============================================

function loadUserProfile() {
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    const userSubtext = document.getElementById('userSubtext');
    
    const initials = appState.username.substring(0, 2).toUpperCase();
    userAvatar.textContent = initials;
    userName.textContent = appState.username;
    userSubtext.textContent = `Demo ID: ${appState.userId} (Local Only)`;
}

// ============================================
// FORM VALIDATION
// ============================================

function validateForm() {
    const name = document.getElementById('name').value.trim();
    const price = document.getElementById('price').value;
    
    if (!name) {
        showStatus('❌ Name is required', 'error');
        return false;
    }
    
    if (name.length < 3) {
        showStatus('❌ Name must be at least 3 characters', 'error');
        return false;
    }
    
    if (name.length > 50) {
        showStatus('❌ Name must not exceed 50 characters', 'error');
        return false;
    }
    
    if (!price || price < 5) {
        showStatus('❌ Price must be at least 5 Robux', 'error');
        return false;
    }
    
    if (price > 100000) {
        showStatus('❌ Price cannot exceed 100,000 Robux', 'error');
        return false;
    }
    
    return true;
}

// ============================================
// ICON HANDLING
// ============================================

function previewIcon() {
    const fileInput = document.getElementById('iconFile');
    const file = fileInput.files[0];
    
    if (!file) {
        appState.currentIcon = null;
        updateIconPreview(null);
        return;
    }
    
    if (!file.type.startsWith('image/')) {
        showStatus('❌ Please select an image file', 'error');
        fileInput.value = '';
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        showStatus('❌ File size must not exceed 5MB', 'error');
        fileInput.value = '';
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        appState.currentIcon = e.target.result;
        updateIconPreview(e.target.result);
    };
    reader.readAsDataURL(file);
}

function updateIconPreview(imageData) {
    const preview = document.getElementById('iconPreview');
    
    if (imageData) {
        preview.innerHTML = `<img src="${imageData}" alt="Icon">`;
        preview.classList.remove('empty');
    } else {
        preview.innerHTML = '🖼️';
        preview.classList.add('empty');
    }
}

function initializeDragDrop() {
    const fileLabel = document.getElementById('fileLabel');
    if (!fileLabel) return;
    
    const fileInput = document.getElementById('iconFile');
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        fileLabel.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        }, false);
    });
    
    ['dragenter', 'dragover'].forEach(eventName => {
        fileLabel.addEventListener(eventName, () => {
            fileLabel.style.background = 'rgba(0, 176, 111, 0.3)';
            fileLabel.style.borderColor = 'rgba(0, 176, 111, 0.8)';
        });
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        fileLabel.addEventListener(eventName, () => {
            fileLabel.style.background = 'rgba(0, 176, 111, 0.2)';
            fileLabel.style.borderColor = 'rgba(0, 176, 111, 0.5)';
        });
    });
    
    fileLabel.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        fileInput.files = files;
        const changeEvent = new Event('change', { bubbles: true });
        fileInput.dispatchEvent(changeEvent);
    });
}

// ============================================
// DEMO GAME PASS CREATION (LOCAL STORAGE ONLY)
// ============================================

async function createGamePass() {
    if (!validateForm()) {
        return;
    }
    
    const createBtn = document.getElementById('createBtn');
    const name = document.getElementById('name').value.trim();
    const desc = document.getElementById('desc').value.trim();
    const price = parseInt(document.getElementById('price').value);
    
    try {
        createBtn.disabled = true;
        showStatus(`<span class="spinner"></span>Saving demo entry...`, 'loading');
        
        // Simulate brief processing
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generate a local ID (NOT a real Roblox ID)
        const localId = Math.floor(Math.random() * 999999999);
        
        // Create entry object
        const entry = {
            id: localId,
            name: name,
            description: desc,
            price: price,
            icon: appState.currentIcon,
            createdAt: new Date().toLocaleString(),
            isDemo: true
        };
        
        // Add to history
        appState.gamePasses.unshift(entry);
        if (appState.gamePasses.length > 10) {
            appState.gamePasses = appState.gamePasses.slice(0, 10);
        }
        
        saveStateToStorage();
        
        // Display result
        showStatus('✅ Demo entry saved (local storage only)', 'success');
        displayResult(entry);
        
        // Clear form
        setTimeout(() => {
            clearForm();
            loadGamePassHistory();
        }, 1000);
        
    } catch (error) {
        console.error('Error:', error);
        showStatus(`❌ Error: ${error.message}`, 'error');
    } finally {
        createBtn.disabled = false;
    }
}

function displayResult(entry) {
    const resultDiv = document.getElementById('result');
    const gpId = document.getElementById('gpId');
    const gpStats = document.getElementById('gpStats');
    
    gpId.textContent = `${entry.id} (Local Demo ID)`;
    gpStats.innerHTML = `<strong>Price:</strong> ${entry.price} Robux<br><strong>Saved:</strong> ${entry.createdAt}<br><strong>Status:</strong> Local Storage Only`;
    
    resultDiv.classList.remove('hidden');
    resultDiv.scrollIntoView({ behavior: 'smooth' });
}

// ============================================
// HISTORY DISPLAY
// ============================================

function loadGamePassHistory() {
    const historyList = document.getElementById('historyList');
    
    if (appState.gamePasses.length === 0) {
        historyList.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;">No entries yet. Create one to test!</p>';
        return;
    }
    
    historyList.innerHTML = appState.gamePasses.map((gp) => `
        <div class="history-item">
            <div class="history-item-info">
                <h4>${gp.name}</h4>
                <p>💰 ${gp.price} Robux • ${gp.createdAt}</p>
            </div>
        </div>
    `).join('');
}

// ============================================
// STATUS MESSAGES
// ============================================

function showStatus(message, type) {
    const statusDiv = document.getElementById('status');
    statusDiv.innerHTML = message;
    statusDiv.className = `status ${type}`;
}

function clearStatus() {
    const statusDiv = document.getElementById('status');
    statusDiv.innerHTML = '';
    statusDiv.className = 'status';
}

// ============================================
// FORM MANAGEMENT
// ============================================

function clearForm() {
    document.getElementById('name').value = '';
    document.getElementById('desc').value = '';
    document.getElementById('price').value = '';
    document.getElementById('iconFile').value = '';
    appState.currentIcon = null;
    updateIconPreview(null);
    document.getElementById('result').classList.add('hidden');
    clearStatus();
}

// ============================================
// UTILITIES
// ============================================

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && appState.isLoggedIn) {
        const nameField = document.getElementById('name');
        if (nameField && nameField.value.trim()) {
            createGamePass();
        }
    }
    
    // Escape to clear form
    if (e.key === 'Escape' && appState.isLoggedIn) {
        clearForm();
    }
});

// ============================================
// ERROR HANDLING
// ============================================

window.addEventListener('error', (event) => {
    console.error('Error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled rejection:', event.reason);
});

// ============================================
// STARTUP MESSAGE
// ============================================

console.log('%c🎮 Roblox Game Pass Maker - DEMO MODE', 'color: #00b06f; font-size: 16px; font-weight: bold;');
console.log('%cℹ️ This is a FRONTEND-ONLY DEMO\nGame passes are stored in localStorage ONLY\nThey do NOT appear on Roblox', 'color: #ffb74d; font-size: 12px;');
console.log('📖 See GitHub README for backend setup instructions');
