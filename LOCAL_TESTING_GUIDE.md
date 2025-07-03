# 🧪 Local Testing Guide for Google OAuth2.0

## Prerequisites Setup

### 1. **Get Google OAuth2.0 Credentials**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client IDs**
5. Choose **Web application**
6. Set **Authorized redirect URIs**:
   ```
   http://localhost:3001/auth/google/callback
   ```
7. Copy the **Client ID** and **Client Secret**

### 2. **Configure Environment Variables**

Create `.env` file in `astralnexus_be/`:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:5173,http://localhost:5174,http://localhost:5175

# Google OAuth2.0 (REQUIRED - Replace with your credentials)
GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# OAuth2.0 Redirect URIs
OAUTH_REDIRECT_URI=http://localhost:3001/auth/google/callback
FRONTEND_SUCCESS_REDIRECT=http://localhost:5173/dashboard
FRONTEND_ERROR_REDIRECT=http://localhost:5173/login?error=oauth_failed

# Session Configuration
JWT_SECRET=your_super_secure_jwt_secret_here_make_it_long_and_random
SESSION_SECRET=your_session_secret_here_also_make_it_random
```

## Testing Steps

### 1. **Start Backend Server**

```bash
cd astralnexus_be
pnpm install  # If you haven't already
pnpm dev
```

You should see:

```
🦊 Elysia server is running at http://:::3001
📚 API Documentation: http://:::3001/swagger
🌟 Environment: development
```

### 2. **Start Frontend Server**

```bash
cd astralnexus_ui
pnpm install  # If you haven't already
pnpm dev
```

You should see:

```
  ➜  Local:   http://localtest:3000/
  ➜  Network: use --host to expose
```

### 3. **Test OAuth2.0 Flow**

#### **Option A: Full Frontend Flow (Recommended)**

1. Open browser: `http://localtest.me:5173/login`
2. Click **"Sign in with Google"** button
3. Should redirect to Google OAuth consent screen
4. Grant permissions to your app
5. Should redirect back to `http://localtest.me:3000/dashboard`
6. Dashboard should show your Google profile info

#### **Option B: Direct API Testing**

1. **Test OAuth initiation**:

   ```bash
   curl -I "http://localhost:3001/auth/google"
   ```

   Should return `302 Found` with `Location` header pointing to Google

2. **Check Swagger docs**:
   Open `http://localhost:3001/swagger`

   - Should see Auth endpoints documented
   - Try the `/auth/google` endpoint

3. **Test session endpoint** (after successful OAuth):
   ```bash
   curl -H "Cookie: session=your-session-id" "http://localhost:3001/auth/me"
   ```

### 4. **Test User Session**

After successful OAuth login:

1. **Check if user is authenticated**:

   - In browser console on dashboard page:

   ```javascript
   fetch("http://localhost:3001/auth/me", { credentials: "include" })
     .then((r) => r.json())
     .then(console.log);
   ```

2. **Test logout**:
   ```javascript
   fetch("http://localhost:3001/auth/logout", {
     method: "POST",
     credentials: "include",
   })
     .then((r) => r.json())
     .then(console.log);
   ```

## Troubleshooting

### Common Issues & Solutions

#### 1. **"redirect_uri_mismatch"**

```
Error: redirect_uri_mismatch
```

**Solution**:

- Ensure your Google Console redirect URI is exactly: `http://localhost:3001/auth/google/callback`
- No trailing slash, exact match required

#### 2. **"Invalid client"**

```
Error: invalid_client
```

**Solution**:

- Double-check your `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`
- Make sure you're using the correct credentials from Google Console

#### 3. **CORS Issues**

```
Error: Access to fetch at 'http://localhost:3001/auth/me' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solution**:

- Ensure backend is running on port 3001
- Check CORS_ORIGIN includes your frontend URL

#### 4. **Session Not Found**

```
Error: No session found
```

**Solution**:

- Make sure you're using `credentials: 'include'` in fetch requests
- Check if cookies are being set (inspect browser dev tools → Application → Cookies)

#### 5. **Environment Variables Not Loading**

```
Error: GOOGLE_CLIENT_ID is undefined
```

**Solution**:

- Ensure `.env` file is in `astralnexus_be/` directory
- Restart the backend server after creating/modifying `.env`
- Check that `dotenv/config` is imported in `src/index.ts`

### Debug Commands

```bash
# Check if server is running
curl http://localhost:3001/health

# Check environment variables (should not expose secrets)
curl http://localhost:3001/

# Test OAuth redirect (should return 302)
curl -I http://localhost:3001/auth/google

# Check Swagger docs
open http://localhost:3001/swagger
```

## Production Considerations

When deploying to production:

1. **Update redirect URIs** in Google Console to your production domain
2. **Set secure environment variables** in your hosting provider
3. **Use HTTPS** for all OAuth redirects
4. **Replace in-memory session storage** with Redis or database
5. **Set proper CORS origins** to your production domain
