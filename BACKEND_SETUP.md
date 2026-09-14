# Backend Setup Guide - Real Roblox Integration

## ⚠️ Current Status

**This repository contains FRONTEND DEMO ONLY.**

- ✅ Beautiful UI/UX
- ✅ Form validation
- ✅ Local storage persistence
- ❌ **NOT creating real Roblox Game Passes**
- ❌ **No backend server included**
- ❌ **No Roblox OAuth integration**

Game passes created in the demo are stored in your **browser's localStorage only** and do NOT appear on Roblox.

---

## Architecture for Real Implementation

```
┌─────────────────────┐
│   Your Browser      │
│  (This Frontend)    │
└──────────┬──────────┘
           │ HTTPS
           ↓
┌─────────────────────┐
│  Your Backend       │
│  (Node/Python/Go)   │
│  - OAuth Handler    │
│  - Token Manager    │
│  - Roblox API Calls │
└──────────┬──────────┘
           │ HTTPS
           ↓
┌─────────────────────┐
│   Roblox APIs       │
│  - OAuth endpoint   │
│  - Game Pass API    │
│  - User API         │
└─────────────────────┘
```

**Why the backend is essential:**
- Roblox API keys must NEVER be exposed in frontend code
- OAuth tokens need secure, server-side storage
- GitHub Pages is public — all frontend code is visible to anyone
- Real Roblox API requires authentication that cannot be done client-side

---

## Step 1: Get Roblox Developer Credentials

### 1.1 Create a Roblox Creator Account

Visit [create.roblox.com](https://create.roblox.com) and ensure you have:
- A Roblox account
- A published game (or dummy game for testing)

### 1.2 Generate API Credentials

1. Go to [Roblox Creator Dashboard](https://create.roblox.com/docs/studio/publishing-to-roblox)
2. Navigate to **Creator Settings** → **API Tokens** or **Developer Console**
3. Create OAuth Application:
   - **App Name**: "Game Pass Maker"
   - **Redirect URI**: `https://your-backend.com/auth/callback`
   - **Scopes**: 
     - `openid`
     - `profile`
     - `universe.manage:manage/game_passes`
     - `universe.manage:read/game_passes`

4. Save your credentials:
   ```
   CLIENT_ID=xxxxxxxxxxxxx
   CLIENT_SECRET=xxxxxxxxxxxxx (KEEP PRIVATE!)
   REDIRECT_URI=https://your-backend.com/auth/callback
   ```

---

## Step 2: Choose a Backend Stack

### Option A: Node.js + Express (Recommended)

**Setup:**
```bash
mkdir roblox-gamepass-backend
cd roblox-gamepass-backend
npm init -y
npm install express axios dotenv cors
```

**Create `.env`:**
```env
PORT=3000
ROBLOX_CLIENT_ID=your_client_id
ROBLOX_CLIENT_SECRET=your_client_secret
ROBLOX_REDIRECT_URI=https://your-backend.com/auth/callback
FRONTEND_URL=https://your-frontend.com
JWT_SECRET=your_jwt_secret_key_here
```

**Create `server.js`:**
```javascript
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

// OAuth callback endpoint
app.get('/auth/callback', async (req, res) => {
    const { code } = req.query;
    
    if (!code) {
        return res.status(400).json({ error: 'No authorization code' });
    }
    
    try {
        // Exchange code for access token
        const response = await axios.post('https://apis.roblox.com/oauth/v1/token', {
            grant_type: 'authorization_code',
            code,
            client_id: process.env.ROBLOX_CLIENT_ID,
            client_secret: process.env.ROBLOX_CLIENT_SECRET,
            redirect_uri: process.env.ROBLOX_REDIRECT_URI
        });
        
        const { access_token } = response.data;
        
        // Redirect to frontend with token (or use httpOnly cookie)
        res.redirect(`${process.env.FRONTEND_URL}?token=${access_token}`);
    } catch (error) {
        console.error('OAuth error:', error.message);
        res.status(500).json({ error: 'OAuth failed' });
    }
});

// Create game pass endpoint
app.post('/api/gamepass/create', async (req, res) => {
    const { name, description, price, authToken } = req.body;
    
    if (!authToken) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    
    try {
        // Call Roblox API to create game pass
        const response = await axios.post(
            'https://apis.roblox.com/game-passes-api/v1/game-passes',
            {
                displayName: name,
                description: description,
                priceInRobux: price
            },
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            }
        );
        
        res.json({ success: true, gamePassId: response.data.id });
    } catch (error) {
        console.error('Game Pass creation error:', error.message);
        res.status(500).json({ error: 'Failed to create game pass' });
    }
});

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});
```

### Option B: Python + Flask

```bash
pip install flask python-dotenv requests flask-cors
```

**`app.py`:**
```python
from flask import Flask, request, redirect, jsonify
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route('/auth/callback', methods=['GET'])
def auth_callback():
    code = request.args.get('code')
    if not code:
        return jsonify({'error': 'No authorization code'}), 400
    
    try:
        # Exchange code for token
        token_response = requests.post(
            'https://apis.roblox.com/oauth/v1/token',
            data={
                'grant_type': 'authorization_code',
                'code': code,
                'client_id': os.getenv('ROBLOX_CLIENT_ID'),
                'client_secret': os.getenv('ROBLOX_CLIENT_SECRET'),
                'redirect_uri': os.getenv('ROBLOX_REDIRECT_URI')
            }
        )
        
        access_token = token_response.json()['access_token']
        return redirect(f"{os.getenv('FRONTEND_URL')}?token={access_token}")
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/gamepass/create', methods=['POST'])
def create_gamepass():
    data = request.json
    auth_token = data.get('authToken')
    
    if not auth_token:
        return jsonify({'error': 'Not authenticated'}), 401
    
    try:
        response = requests.post(
            'https://apis.roblox.com/game-passes-api/v1/game-passes',
            json={
                'displayName': data['name'],
                'description': data['description'],
                'priceInRobux': data['price']
            },
            headers={'Authorization': f'Bearer {auth_token}'}
        )
        
        return jsonify({'success': True, 'gamePassId': response.json()['id']})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
```

### Option C: Go + Gin

```bash
go mod init roblox-gamepass-backend
go get github.com/gin-gonic/gin
go get github.com/joho/godotenv
```

---

## Step 3: Update Frontend for Backend

Modify `app.js` to call your backend instead of using localStorage:

```javascript
// Replace robloxLogin() with:
async function robloxLogin() {
    const clientId = 'YOUR_ROBLOX_CLIENT_ID';
    const redirectUri = 'https://your-backend.com/auth/callback';
    const scope = 'openid profile universe.manage:manage/game_passes';
    
    const authUrl = `https://apis.roblox.com/oauth/v1/authorize?` +
        `client_id=${clientId}&` +
        `redirect_uri=${redirectUri}&` +
        `scope=${scope}&` +
        `response_type=code`;
    
    window.location.href = authUrl;
}

// Replace createGamePass() with:
async function createGamePass() {
    if (!validateForm()) return;
    
    const token = localStorage.getItem('roblox_token');
    if (!token) {
        showStatus('❌ Not authenticated', 'error');
        return;
    }
    
    try {
        const response = await fetch('https://your-backend.com/api/gamepass/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: document.getElementById('name').value,
                description: document.getElementById('desc').value,
                price: parseInt(document.getElementById('price').value),
                authToken: token
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showStatus('✅ Game Pass created on Roblox!', 'success');
            // Show real Roblox game pass ID
            document.getElementById('gpId').textContent = result.gamePassId;
        } else {
            showStatus('❌ ' + result.error, 'error');
        }
    } catch (error) {
        showStatus('❌ ' + error.message, 'error');
    }
}
```

---

## Step 4: Deploy Backend

### Option A: Heroku
```bash
heroku create your-app-name
heroku config:set ROBLOX_CLIENT_SECRET=your_secret
git push heroku main
```

### Option B: AWS Lambda + API Gateway
1. Package your Node.js/Python app
2. Deploy to Lambda
3. Set up API Gateway endpoints
4. Configure environment variables in Lambda

### Option C: DigitalOcean App Platform
1. Connect your GitHub repo
2. Create environment variables
3. Deploy (auto-redeploys on push)

### Option D: Self-hosted (VPS)
```bash
ssh user@your-server.com
cd /var/www/roblox-backend
npm install
npm start  # or use PM2
```

---

## Step 5: Security Checklist

- [ ] **NEVER commit `.env` file** — add to `.gitignore`
- [ ] **Use HTTPS everywhere** — both frontend and backend
- [ ] **Validate all inputs** — server-side validation is critical
- [ ] **Implement rate limiting** — prevent abuse
- [ ] **Use httpOnly cookies** — don't expose tokens in URLs
- [ ] **Implement CORS properly** — whitelist your frontend domain only
- [ ] **Log API calls** — for debugging and auditing
- [ ] **Monitor for errors** — use Sentry, DataDog, or New Relic
- [ ] **Regular security updates** — keep dependencies current

---

## Step 6: Testing

### Test OAuth Flow
```bash
curl -X GET "https://your-backend.com/auth/callback?code=test_code"
```

### Test Game Pass Creation
```bash
curl -X POST https://your-backend.com/api/gamepass/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Pass",
    "description": "Testing",
    "price": 99,
    "authToken": "your_token"
  }'
```

---

## Troubleshooting

### Problem: "OAuth failed"
- Check REDIRECT_URI matches exactly
- Verify CLIENT_ID and CLIENT_SECRET
- Check Roblox API status

### Problem: "Unauthorized" on game pass creation
- Verify token is still valid (tokens expire)
- Check user permissions in Roblox account
- Verify game exists and you own it

### Problem: CORS errors
- Add backend URL to CORS allowlist
- Check frontend calling correct backend URL
- Ensure credentials mode is set if using cookies

---

## Next Steps

1. Choose your backend stack
2. Get Roblox developer credentials
3. Implement OAuth flow
4. Test with curl/Postman
5. Deploy to production
6. Update frontend to use backend

---

## Resources

- [Roblox OAuth Documentation](https://create.roblox.com/docs/reference/cloud/authentication)
- [Roblox Game Pass API](https://create.roblox.com/docs/reference/cloud/game-passes-api)
- [Roblox API Reference](https://create.roblox.com/docs/reference/cloud/overview)
- [OAuth 2.0 Best Practices](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)

---

## Support

- 📚 Check the README.md for general info
- 🐛 Report issues on GitHub Issues
- 💬 Discuss on GitHub Discussions
- 📖 Read Roblox documentation

---

**Remember:** This frontend demo is just the UI. The real magic happens in your backend!
