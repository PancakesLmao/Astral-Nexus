# 1. Login Flow - Discord OAuth with PKCE

**File**: `01-login-flow.md`  
**Process**: Complete user login authentication flow  
**Security**: Manual Discord OAuth 2.0 with PKCE implementation

## Overview

The login flow handles user authentication through Discord OAuth 2.0 with manual PKCE (Proof Key for Code Exchange) implementation. This process ensures secure authorization while maintaining full control over the authentication workflow.

## Step-by-Step Process

### Phase 1: Login Initiation

```
User Action → Frontend Request → Backend OAuth Setup
```

#### Step 1: User Initiates Login

- **Location**: Frontend (blog.localtest.me:3000)
- **Action**: User clicks "Login with Discord" button
- **Trigger**: Frontend sends request to backend OAuth endpoint

#### Step 2: Frontend OAuth Request

```typescript
// Frontend initiates login
window.location.href = `http://api.localtest.me:3001/auth/discord?lang=${currentLanguage}`;
```

- **Method**: GET request to `/auth/discord`
- **Parameters**: `lang` (language preference)
- **Target**: Backend API (api.localtest.me:3001)

### Phase 2: PKCE Security Generation

```
Backend → Secure Random Generation → Cookie Storage
```

#### Step 3: Generate Security Parameters

```typescript
// Manual state generation (anti-CSRF)
const state =
  Math.random().toString(36).substring(2, 15) +
  Math.random().toString(36).substring(2, 15);

// PKCE code verifier generation (43-128 characters)
const codeVerifierArray = new Uint8Array(32);
crypto.getRandomValues(codeVerifierArray);
const codeVerifier = btoa(String.fromCharCode(...codeVerifierArray))
  .replace(/\+/g, "-")
  .replace(/\//g, "_")
  .replace(/=/g, "");
```

#### Step 4: Create PKCE Code Challenge

```typescript
// SHA256 hash of code verifier
const encoder = new TextEncoder();
const data = encoder.encode(codeVerifier);
const hashBuffer = await crypto.subtle.digest("SHA-256", data);
const hashArray = new Uint8Array(hashBuffer);
const codeChallenge = btoa(String.fromCharCode(...hashArray))
  .replace(/\+/g, "-")
  .replace(/\//g, "_")
  .replace(/=/g, "");
```

#### Step 5: Store Security Cookies

```typescript
set.cookie = {
  discord_state: {
    value: state,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 10 * 60 * 1000, // 10 minutes
    path: "/",
    domain: ".localtest.me",
  },
  discord_code_verifier: {
    value: codeVerifier,
    httpOnly: true,
    // ... same security settings
  },
};
```

### Phase 3: Discord OAuth Authorization

```
Backend Redirect → Discord Authorization → User Consent
```

#### Step 6: Build Discord OAuth URL

```typescript
const params = new URLSearchParams({
  response_type: "code",
  client_id: process.env.DISCORD_CLIENT_ID!,
  redirect_uri: process.env.DISCORD_REDIRECT_URI!, // api.localtest.me:3001/auth/discord/callback
  scope: "identify email",
  state: `${state}|lang=${language}`, // Include language preference
  code_challenge_method: "S256",
  code_challenge: codeChallenge,
});

const discordAuthUrl = `https://discord.com/oauth2/authorize?${params.toString()}`;
```

#### Step 7: Redirect to Discord

- **Action**: Backend sends 302 redirect to Discord OAuth
- **User Experience**: User sees Discord authorization page
- **User Choice**: User grants or denies permission

### Phase 4: OAuth Callback Processing

```
Discord Callback → Token Exchange → User Creation
```

#### Step 8: Discord Callback

```typescript
// Callback URL: /auth/discord/callback?code=xxx&state=xxx
const code = query.code;
const receivedState = query.state;
```

#### Step 9: Validate Security Parameters

```typescript
// Extract stored security values
const storedState = cookie.discord_state?.value;
const codeVerifier = cookie.discord_code_verifier?.value;

// Parse state with language
const [actualState, langPart] = receivedState.split("|");

// Validate state matches (CSRF protection)
if (actualState !== storedState) {
  throw new Error(
    `State mismatch: expected ${storedState}, got ${actualState}`
  );
}
```

#### Step 10: Exchange Authorization Code for Tokens

```typescript
const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID!,
    client_secret: process.env.DISCORD_CLIENT_SECRET!,
    code: code,
    grant_type: "authorization_code",
    redirect_uri: process.env.DISCORD_REDIRECT_URI!,
    code_verifier: codeVerifier, // PKCE verification
  }),
});

const { access_token, refresh_token, expires_in } = await tokenResponse.json();
```

### Phase 5: User Profile and Database Operations

```
Discord API → User Profile → Database Operations
```

#### Step 11: Fetch User Profile

```typescript
const userResponse = await fetch("https://discord.com/api/users/@me", {
  headers: { Authorization: `Bearer ${accessToken}` },
});

const discordUser = await userResponse.json();
// Returns: { id, email, username, global_name, avatar, discriminator }
```

#### Step 12: Create Avatar URL

```typescript
const avatarUrl = discordUser.avatar
  ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
  : `https://cdn.discordapp.com/embed/avatars/${
      discordUser.discriminator % 5
    }.png`;
```

#### Step 13: Database User Management

```typescript
// Find or create user with email validation
const user = await findOrCreateUser(
  discordUser.email, // Email (validated)
  discordUser.global_name || discordUser.username, // Display name
  avatarUrl, // Profile picture
  "discord" // OAuth provider
);
```

### Phase 6: Session Creation and Cookie Management

```
Session Creation → Database Storage → Cookie Setting
```

#### Step 14: Create Session in Database

```typescript
const sessionId = await createSession(
  user.id, // User UUID
  accessToken, // Discord access token
  refreshToken, // Discord refresh token
  expiresIn // Expiration (3600 seconds)
);
```

#### Step 15: Set Session Cookie and Clean Up

```typescript
set.cookie = {
  // Set persistent session cookie
  [appConfig.cookies.session.name]: {
    // "astral_session"
    value: sessionId,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
    domain: ".localtest.me",
  },
  // Clear temporary OAuth cookies
  discord_state: { value: "", maxAge: 0, path: "/", domain: ".localtest.me" },
  discord_code_verifier: {
    value: "",
    maxAge: 0,
    path: "/",
    domain: ".localtest.me",
  },
};
```

### Phase 7: Successful Login Redirect

```
Language Detection → Frontend Redirect → Authenticated State
```

#### Step 16: Extract Language Preference

```typescript
// Get language from state parameter or existing cookie
let language = langPart ? langPart.replace("lang=", "") : "en";

// Check for existing language preference cookie
const cookieName = appConfig.cookies.preferences.name;
if (headers.cookie) {
  const match = headers.cookie.match(new RegExp(`${cookieName}=([^;]+)`));
  if (match) {
    language = match[1];
  }
}
```

#### Step 17: Redirect to Frontend

```typescript
const redirectUrl =
  process.env.FRONTEND_SUCCESS_REDIRECT ||
  `http://blog.localtest.me:3000?lang=${language}`;

set.status = 302;
set.headers["Location"] = redirectUrl;
```

## 🔐 Security Measures

### PKCE Implementation

- **Code Verifier**: 32-byte random value, base64url encoded
- **Code Challenge**: SHA256 hash of code verifier
- **State Parameter**: Anti-CSRF protection with language preference
- **Temporary Storage**: HTTP-only cookies with 10-minute expiration

### Cookie Security

- **HTTP-Only**: Prevents XSS access to session tokens
- **Secure Flag**: HTTPS-only in production
- **SameSite**: CSRF protection
- **Domain**: Cross-subdomain sharing (.localtest.me)

### Input Validation

- **Email Validation**: Format validation before database insertion
- **Input Sanitization**: XSS prevention for user data
- **State Validation**: CSRF attack prevention

## 📊 Data Flow Summary

```
User → Frontend → Backend → Discord → Backend → Database → Frontend → User
     ↓         ↓          ↓        ↓          ↓           ↓           ↓
  [Click]  [Request]  [Redirect] [Auth]   [Tokens]   [Session]  [Redirect]
```

## 🚨 Error Scenarios

### Common Failure Points

1. **User Denies Permission**: Redirect to error page
2. **State Mismatch**: CSRF attack detected, abort process
3. **Missing PKCE Values**: Cookie deletion/tampering detected
4. **Token Exchange Fails**: Invalid code or Discord API issues
5. **Database Errors**: User creation or session storage fails

### Error Handling

```typescript
// Access denied scenario
if (query.error === "access_denied") {
  const errorUrl =
    process.env.FRONTEND_ERROR_REDIRECT ||
    "http://localtest.me:3000/login?error=access_denied";
  return new Response(null, { status: 302, headers: { Location: errorUrl } });
}
```

## 📁 Related Files

- **Implementation**: `src/routes/auth.ts` (lines 22-300)
- **User Management**: `src/utils/user.ts`
- **Session Creation**: `src/middleware/auth.ts`
- **Database Schema**: `init.sql`
- **Configuration**: `src/config/app.ts`

## 🔗 Next Steps

After successful login:

1. **[Session Validation](./02-session-management.md)** - How authentication is verified
2. **[PKCE Details](./03-pkce-implementation.md)** - Deep dive into PKCE security
3. **[Logout Process](./04-logout-process.md)** - Session termination

---

**Related Diagrams**: [Login Sequence](./diagrams/login-sequence.puml)  
**Security Standard**: OAuth 2.1 with PKCE (RFC 7636)
