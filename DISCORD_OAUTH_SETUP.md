# 🎮 Discord OAuth2.0 Setup Guide

## 🔧 **Setting Up Discord OAuth2.0**

### **1. Create Discord Application**

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **"New Application"**
3. Give it a name (e.g., "Astral Nexus Blog")
4. Click **"Create"**

### **2. Configure OAuth2.0**

1. In your application, go to **"OAuth2"** → **"General"**
2. Add **Redirects**:

   ```
   http://localhost:3001/auth/discord/callback
   ```

   ⚠️ **Important**: Must match EXACTLY (no trailing slash)

3. **Scopes**: The following scopes are automatically used:
   - `identify` - Basic user info
   - `email` - User's email address

### **3. Get Credentials**

1. In **"OAuth2"** → **"General"**:

   - Copy **Client ID**
   - Copy **Client Secret** (click "Reset Secret" if needed)

2. Add to your `.env` file:
   ```env
   DISCORD_CLIENT_ID=your_client_id_here
   DISCORD_CLIENT_SECRET=your_client_secret_here
   DISCORD_REDIRECT_URI=http://localhost:3001/auth/discord/callback
   ```

## 🔗 **Understanding Redirect URIs**

### **What are Redirect URIs?**

- **Security measure**: Prevents OAuth code theft
- **Exact match required**: Must match your configuration exactly
- **Multiple URIs allowed**: Different URLs for dev/staging/production

### **Common Redirect URI Issues:**

❌ **These WON'T work:**

```
http://localhost:3001/auth/discord/callback/  ← Extra slash
https://localhost:3001/auth/discord/callback  ← Wrong protocol
http://127.0.0.1:3001/auth/discord/callback   ← Different host
```

✅ **This WILL work:**

```
http://localhost:3001/auth/discord/callback   ← Exact match
```

### **Production Setup:**

When deploying, add your production URL:

```
https://yourdomain.com/auth/discord/callback
```

## **Testing Discord OAuth**

### **1. Backend Test**

```bash
# Test Discord OAuth initiation
curl -I "http://localhost:3001/auth/discord"
# Should return 302 redirect to Discord
```

### **2. Frontend Test**

1. Start both servers:

   ```bash
   # Backend
   cd astralnexus_be && pnpm dev

   # Frontend
   cd astralnexus_ui && pnpm dev
   ```

2. Visit: `http://localhost:5173/login`
3. Click **"Sign in with Discord"**
4. Should redirect to Discord OAuth consent
5. After authorization → Dashboard with Discord profile

## **What Discord Provides**

Discord OAuth returns:

```json
{
  "id": "123456789",
  "email": "user@example.com",
  "username": "username",
  "global_name": "Display Name",
  "avatar": "avatar_hash",
  "discriminator": "0001"
}
```

**Avatar URL Format:**

- With avatar: `https://cdn.discordapp.com/avatars/{id}/{avatar}.png`
- Default: `https://cdn.discordapp.com/embed/avatars/{discriminator % 5}.png`

## **Security Features**

### **State Parameter**

- Prevents CSRF attacks
- Validates OAuth callback authenticity
- Generated unique per request

### **PKCE (Proof Key for Code Exchange)**

- Uses `code_verifier` and `code_challenge`
- Prevents authorization code interception
- Required for public clients

### **Session Management**

- HTTP-only cookies
- Secure flag in production
- 30-day expiration
- Server-side session storage

## **API Endpoints Added**

| Endpoint                 | Method | Description                                      |
| ------------------------ | ------ | ------------------------------------------------ |
| `/auth/discord`          | GET    | Initiate Discord OAuth                           |
| `/auth/discord/callback` | GET    | Handle Discord callback                          |
| `/auth/me`               | GET    | Get current user (works for both Google/Discord) |
| `/auth/logout`           | POST   | Logout (clears session)                          |

## **Frontend Integration**

**Login Button:**

```vue
<button @click="handleDiscordSignIn" class="discord-btn">
  <DiscordIcon /> Sign in with Discord
</button>
```

**Handler:**

```typescript
const handleDiscordSignIn = () => {
  window.location.href = "http://localhost:3001/auth/discord";
};
```

## 🛠️ **Troubleshooting**

### **"Invalid Redirect URI"**

- Check exact match in Discord Developer Portal
- Ensure no typos or extra characters
- Verify protocol (http vs https)

### **"Invalid Client"**

- Double-check Client ID and Secret
- Ensure credentials are from correct application

### **"Access Denied"**

- User clicked "Cancel" on Discord consent screen
- Normal behavior, user can try again

### **"Invalid State"**

- Usually means server restarted during OAuth flow
- Clear browser storage and try again

## **Complete .env Template**

```env
# Server Configuration
PORT=3001
NODE_ENV=development
CORS_ORIGIN=*

# Google OAuth2.0
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback

# Discord OAuth2.0
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_REDIRECT_URI=http://localhost:3001/auth/discord/callback

# Frontend Redirects
FRONTEND_SUCCESS_REDIRECT=http://localhost:5173/dashboard
FRONTEND_ERROR_REDIRECT=http://localhost:5173/login?error=oauth_failed

# Session Security
JWT_SECRET=your_jwt_secret_here
SESSION_SECRET=your_session_secret_here
```

Now you have **dual OAuth providers** - users can choose Google OR Discord! 🎮✨
