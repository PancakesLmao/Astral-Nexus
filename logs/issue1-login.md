# Issue #1: Discord OAuth Login Authentication Failure

## Problem Summary

Users were experiencing authentication failures during Discord OAuth login, with successful OAuth completion but immediate logout after reaching the frontend. The issue involved multiple layers of session management problems between the subdomain architecture and OAuth implementation.

## Timeline

### Initial State

- Basic OAuth 2.0 setup using `elysia-oauth2` plugin
- Database-backed sessions in PostgreSQL
- Subdomain architecture: `api.localtest.me:3001` (backend) + `blog.localtest.me:3000` (frontend)

### Problem Discovery

User reported: _"it logged in but suddenly got redirected back to localtest.me/login again"_

## Root Cause Analysis

### 1. **Cookie Domain Incompatibility**

**Issue**: OAuth state and PKCE cookies were not being shared between initial request and callback due to domain switching.

```
Initial Request: api.localtest.me:3001/auth/discord
Callback: localhost:3001/auth/discord/callback (after temporary localhost testing)
Cookie Domain: .localtest.me
```

**Impact**: `state` and `codeVerifier` cookies missing in callback, causing OAuth2 plugin state mismatch errors.

### 2. **Session ID Conflicts**

**Issue**: Frontend was sending conflicting session identifiers:

- **Valid Cookie Session**: `astral_session=4th7kyn43ntmdr84j12` (from successful Discord login)
- **Invalid Authorization Header**: `Bearer arjlz0y0xdjmdr2uowx` (from localStorage/old session)

**Backend Priority Logic**:

```typescript
// WRONG: Authorization header checked first
if (authHeader && authHeader.startsWith("Bearer ")) {
  sessionId = authHeader.substring(7); // Got invalid session
}
// Cookie checked last as fallback
if (!sessionId && cookie && cookie[cookieName]?.value) {
  sessionId = cookie[cookieName].value; // Valid session ignored
}
```

### 3. **elysia-oauth2 Plugin Limitations**

**Issue**: The OAuth2 plugin's cookie management was incompatible with subdomain architecture.

**Error Logs**:

```
State mismatch: expected undefined, got <session_id>
Code verifier not found in cookie and OAuth2 plugin failed
```

### 4. **Frontend Session Management Conflicts**

**Issue**: Frontend was mixing localStorage and cookie-based session handling.

```typescript
// PROBLEMATIC: Mixed session sources
const sessionId =
  localStorage.getItem("astral_session") || getCookie("astral_session");
headers["Authorization"] = `Bearer ${sessionId}`;
headers["X-Session-ID"] = sessionId;
```

## Solution

### Phase 1: Manual OAuth Implementation

**Replaced elysia-oauth2 plugin** with manual Discord OAuth to ensure subdomain compatibility.

#### A. Manual PKCE Implementation

```typescript
// Generate proper PKCE code verifier (43-128 characters, base64url)
const codeVerifierArray = new Uint8Array(32);
crypto.getRandomValues(codeVerifierArray);
const codeVerifier = btoa(String.fromCharCode(...codeVerifierArray))
  .replace(/\+/g, "-")
  .replace(/\//g, "_")
  .replace(/=/g, "");

// Create code challenge using Web Crypto API
const encoder = new TextEncoder();
const data = encoder.encode(codeVerifier);
const hashBuffer = await crypto.subtle.digest("SHA-256", data);
const hashArray = new Uint8Array(hashBuffer);
const codeChallenge = btoa(String.fromCharCode(...hashArray))
  .replace(/\+/g, "-")
  .replace(/\//g, "_")
  .replace(/=/g, "");
```

#### B. Consistent Cookie Domain Configuration

```typescript
set.cookie = {
  discord_state: {
    value: state,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as "lax",
    maxAge: 10 * 60 * 1000, // 10 minutes
    path: "/",
    domain: ".localtest.me", // Consistent with session cookies
  },
  discord_code_verifier: {
    value: codeVerifier,
    domain: ".localtest.me", // Same domain as other cookies
  },
};
```

### Phase 2: Backend Session Priority Fix

**Prioritized cookie-based sessions** over Authorization headers.

```typescript
// FIXED: Cookie checked first
const cookieName = "astral_session";
if (cookie && cookie[cookieName]?.value) {
  sessionId = cookie[cookieName].value; // Valid session gets priority
}

// Authorization header as fallback only
const authHeader = headers.authorization;
if (!sessionId && authHeader && authHeader.startsWith("Bearer ")) {
  sessionId = authHeader.substring(7);
}
```

### Phase 3: Frontend Cleanup

**Removed localStorage session management** and Authorization header sending.

#### Before (Problematic):

```typescript
const sessionId =
  localStorage.getItem("astral_session") || getCookie("astral_session");
const headers: Record<string, string> = {};
if (sessionId) {
  headers["Authorization"] = `Bearer ${sessionId}`;
  headers["X-Session-ID"] = sessionId;
}
```

#### After (Clean):

```typescript
//  Rely solely on HTTP-only cookies
const response = await fetch(`${apiBaseUrl}/auth/me`, {
  credentials: "include", // Automatically includes cookies
  headers: {
    "Content-Type": "application/json",
  },
});
```

### Phase 4: Environment Consistency

**Ensured all OAuth URLs use same domain**:

```bash
# Consistent domain usage
DISCORD_REDIRECT_URI=http://api.localtest.me:3001/auth/discord/callback
FRONTEND_SUCCESS_REDIRECT=http://blog.localtest.me:3000
```

## Security Improvements

1. **HTTP-Only Cookies**: Session tokens no longer accessible via JavaScript
2. **Proper PKCE Implementation**: Secure code challenge/verifier flow
3. **Domain Isolation**: Cookies properly scoped to `.localtest.me` domain
4. **Session Cleanup**: Temporary OAuth cookies properly cleared after use

## Files Modified

### Backend Changes:

- `src/routes/auth.ts`: Complete manual Discord OAuth implementation
- `src/config/app.ts`: Cookie domain configuration
- `.env.local`: Environment variables for consistent URLs

### Frontend Changes:

- `src/shared/utils/index.ts`: Removed localStorage session handling
- `src/shared/components/TopBar.vue`: Clean logout implementation
- `src/shared/components/BottomBar.vue`: Clean logout implementation

## Lessons Learned

1. **Cookie Domain Consistency**: All authentication-related cookies must use the same domain scope
2. **OAuth Plugin Limitations**: Third-party OAuth plugins may not support complex subdomain architectures
3. **Session Priority Logic**: Backend session extraction should prioritize the most secure method (HTTP-only cookies)
4. **Manual PKCE Implementation**: Custom OAuth flows provide better control over security parameters

## Future Considerations

1. **Google OAuth**: May need similar manual implementation if domain issues arise
2. **Production Deployment**: Cookie domain settings will need adjustment for production domains
3. **Session Refresh**: Implement proper token refresh logic for long-lived sessions
4. **Rate Limiting**: Add OAuth endpoint rate limiting to prevent abuse

## Status: ✅ RESOLVED

The Discord OAuth login flow now works correctly with:

- Proper PKCE implementation
- Consistent cookie domain handling
- Cookie-first session management
- Clean frontend session handling
- Subdomain architecture compatibility

## Resources
https://viblo.asia/p/pkce-trong-oauth-20-bXP4WymKL7G

