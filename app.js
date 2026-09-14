// ============================================
// Roblox Game Pass Maker - Pro Edition
// ============================================

const CONFIG = {
    ROBLOX_CLIENT_ID: 'YOUR_ROBLOX_CLIENT_ID',
    ROBLOX_API_BASE: 'https://apis.roblox.com',
    LOCAL_STORAGE_KEY: 'roblox_gamepass_maker',
    API_TIMEOUT: 10000
};

// ============================================
// STATE MANAGEMENT
// ============================================

let appState = {
    isLoggedIn: false,
    userId: null,
    username: null,
    accessToken: null,
    gamePasses: [],
    currentIcon: null
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
// LOCAL STORAGE MANAGEMENT
// ============================================

function saveStateToStorage() {
    const saveData = {
        isLoggedIn: appState.isLoggedIn,
        userId: appState.userId,
        username: appState.username,
        accessToken: appState.accessToken,
        gamePasses: appState.gamePasses
    };
    localStorage.setItem(CONFIG.LOCAL_STORAGE_KEY, JSON.stringify(saveData));
}

function loadStateFromStorage() {
    const stored = localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY);
    if (stored) {
        const data = JSON.parse(stored);
        appState = { ...appState, ...data };
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
// AUTHENTICATION
// ============================================

async function robloxLogin() {
    try {
        showStatus('🔐 Redirecting to Roblox login...', 'loading');
        
        // Simulate Roblox OAuth flow
        // In production, use real OAuth2 flow
        const mockUserId = Math.floor(Math.random() * 999999999);
        const mockUsername = `Player_${mockUserId}`;
        const mockToken = btoa(`${mockUserId}:${Date.now()}`);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        appState.isLoggedIn = true;
        appState.userId = mockUserId;
        appState.username = mockUsername;
        appState.accessToken = mockToken;
        
        saveStateToStorage();
        showAppSection();
        loadUserProfile();
        loadGamePassHistory();
        
        clearStatus();
        showStatus('✅ Successfully logged in!', 'success');
        setTimeout(() => clearStatus(), 3000);
        
    } catch (error) {
        showStatus('❌ Login failed. Please try again.', 'error');
        console.error('Login error:', error);
    }
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        appState = {
            isLoggedIn: false,
            userId: null,
            username: null,
            accessToken: null,
            gamePasses: [],
            currentIcon: null
        };
        
        localStorage.removeItem(CONFIG.LOCAL_STORAGE_KEY);
        clearForm();
        clearStatus();
        showLoginSection();
        
        showStatus('👋 You have been logged out.', 'success');
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
    userSubtext.textContent = `ID: ${appState.userId}`;
}

// ============================================
// FORM VALIDATION
// ============================================

function validateForm() {
    const name = document.getElementById('name').value.trim();
    const price = document.getElementById('price').value;
    
    if (!name) {
        showStatus('❌ Game Pass name is required', 'error');
        return false;
    }
    
    if (name.length < 3) {
        showStatus('❌ Game Pass name must be at least 3 characters', 'error');
        return false;
    }
    
    if (name.length > 50) {
        showStatus('❌ Game Pass name must not exceed 50 characters', 'error');
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
        showStatus('❌ Please select a valid image file', 'error');
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
        preview.innerHTML = `<img src="${imageData}" alt="Game Pass Icon">`;
        preview.classList.remove('empty');
    } else {
        preview.innerHTML = '🖼️';
        preview.classList.add('empty');
    }
}

function initializeDragDrop() {
    const fileLabel = document.getElementById('fileLabel');
    const fileInput = document.getElementById('iconFile');
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        fileLabel.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
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
        const dt = e.dataTransfer;
        const files = dt.files;
        fileInput.files = files;
        
        const event = new Event('change', { bubbles: true });
        fileInput.dispatchEvent(event);
    });
}

// ============================================
// GAME PASS CREATION
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
        showStatus(`<span class="spinner"></span>Creating your game pass...`, 'loading');
        
        // Simulate API call
        await simulateApiCall(2000);
        
        // Generate mock game pass ID
        const gamePassId = Math.floor(Math.random() * 999999999);
        
        // Create game pass object
        const gamePass = {
            id: gamePassId,
            name: name,
            description: desc,
            price: price,
            icon: appState.currentIcon,
            createdAt: new Date().toLocaleString(),
            robloxUrl: `https://www.roblox.com/game-pass/${gamePassId}`
        };
        
        // Add to history
        appState.gamePasses.unshift(gamePass);
        if (appState.gamePasses.length > 10) {
            appState.gamePasses = appState.gamePasses.slice(0, 10);
        }
        
        saveStateToStorage();
        
        // Display success
        showStatus('✅ Game Pass created successfully!', 'success');
        displayResult(gamePass);
        
        // Clear form
        setTimeout(() => {
            clearForm();
            loadGamePassHistory();
        }, 1000);
        
    } catch (error) {
        console.error('Creation error:', error);
        showStatus(`❌ Failed to create game pass: ${error.message}`, 'error');
    } finally {
        createBtn.disabled = false;
    }
}

function displayResult(gamePass) {
    const resultDiv = document.getElementById('result');
    const gpId = document.getElementById('gpId');
    const gpStats = document.getElementById('gpStats');
    const gpLink = document.getElementById('gpLink');
    
    gpId.textContent = gamePass.id;
    gpStats.innerHTML = `<strong>Price:</strong> ${gamePass.price} Robux<br><strong>Created:</strong> ${gamePass.createdAt}`;
    gpLink.href = gamePass.robloxUrl;
    
    resultDiv.classList.remove('hidden');
    resultDiv.scrollIntoView({ behavior: 'smooth' });
}

// ============================================
// GAME PASS HISTORY
// ============================================

function loadGamePassHistory() {
    const historyList = document.getElementById('historyList');
    
    if (appState.gamePasses.length === 0) {
        historyList.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;">No game passes created yet. Create your first one!</p>';
        return;
    }
    
    historyList.innerHTML = appState.gamePasses.map((gp, index) => `
        <div class="history-item">
            <div class="history-item-info">
                <h4>${gp.name}</h4>
                <p>💰 ${gp.price} Robux • ${gp.createdAt}</p>
            </div>
            <a href="${gp.robloxUrl}" target="_blank" class="history-item-link">View Pass →</a>
        </div>
    `).join('');
}

// ============================================
// STATUS & MESSAGES
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

function simulateApiCall(delay) {
    return new Promise(resolve => setTimeout(resolve, delay));
}

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
        if (nameField.value.trim()) {
            createGamePass();
        }
    }
    
    // Escape to clear form
    if (e.key === 'Escape' && appState.isLoggedIn) {
        clearForm();
    }
});

// ============================================
// ERROR HANDLING & LOGGING
// ============================================

window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled rejection:', event.reason);
});
