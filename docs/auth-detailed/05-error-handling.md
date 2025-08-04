# 5. Error Handling - Invalid Cases & Failure Scenarios

**File**: `05-error-handling.md`  
**Process**: Comprehensive error handling across authentication system  
**Focus**: Error scenarios, failure modes, and recovery mechanisms

## 🎯 Overview

The authentication system implements comprehensive error handling for various failure scenarios including OAuth failures, database issues, network problems, and security violations. Each error type has specific handling strategies to maintain security while providing appropriate user feedback.

## 🚨 OAuth Error Scenarios

### 1. User Access Denied

**Scenario**: User clicks "Cancel" on Discord authorization page

```typescript
// Error detection (src/routes/auth.ts line 107)
if (query.error === "access_denied") {
  console.log("User denied Discord OAuth authorization");
  const errorUrl =
    process.env.FRONTEND_ERROR_REDIRECT ||
    "http://localtest.me:3000/login?error=access_denied";
  return new Response(null, {
    status: 302,
    headers: { Location: errorUrl },
  });
}
```

**Handling Strategy**:

- Immediate redirect to frontend with error parameter
- No backend processing attempted
- Clean user experience with appropriate messaging

### 2. Missing Authorization Code

**Scenario**: OAuth callback without authorization code

```typescript
// Validation (src/routes/auth.ts line 115)
const code = query.code;
if (!code) {
  throw new Error("No authorization code received from Discord");
}
```

**Error Details**:

- **Cause**: Malformed OAuth callback or Discord service issues
- **Result**: Exception thrown, caught by global error handler
- **Recovery**: User redirected to error page, must restart OAuth flow

### 3. State Parameter Mismatch (CSRF Attack)

**Scenario**: OAuth callback with invalid state parameter

```typescript
// State validation (src/routes/auth.ts lines 133-142)
const storedState = cookie.discord_state?.value;
const [actualState, langPart] = receivedState.split("|");

if (actualState !== storedState) {
  throw new Error(
    `State mismatch: expected ${storedState}, got ${actualState}`
  );
}
```

**Security Implications**:

- **Attack Type**: Cross-Site Request Forgery (CSRF)
- **Protection**: State parameter validation
- **Action**: Abort OAuth flow immediately
- **Logging**: Security incident logged for monitoring

### 4. Missing PKCE Parameters

**Scenario**: PKCE cookies deleted or expired during OAuth flow

```typescript
// PKCE validation (src/routes/auth.ts lines 129-132)
const storedState = cookie.discord_state?.value;
const codeVerifier = cookie.discord_code_verifier?.value;

if (!storedState || !codeVerifier) {
  throw new Error("Missing OAuth state or code verifier cookies");
}
```

**Possible Causes**:

- User cleared browser cookies during OAuth flow
- OAuth flow took longer than 10 minutes
- Browser security settings blocking cookies
- Network issues during cookie storage

## 🔐 Token Exchange Errors

### 1. Discord API Token Exchange Failure

**Scenario**: Discord rejects token exchange request

```typescript
// Token exchange error handling (src/routes/auth.ts lines 188-193)
if (!tokenResponse.ok) {
  const errorText = await tokenResponse.text();
  console.error("Discord token exchange failed:", errorText);
  throw new Error(`Discord token exchange failed: ${tokenResponse.status}`);
}
```

**Common Causes**:

- Invalid client credentials
- Authorization code expired
- PKCE verification failed
- Discord service unavailable
- Network connectivity issues

### 2. Discord User Profile Fetch Failure

**Scenario**: Cannot retrieve user profile from Discord

```typescript
// User profile fetch validation (src/routes/auth.ts line 205)
if (!userResponse.ok) {
  throw new Error("Failed to fetch user info from Discord");
}
```

**Error Implications**:

- Cannot create user account without profile data
- OAuth flow must be aborted
- User sees generic error message

## 💾 Database Error Scenarios

### 1. User Creation Failures

**Scenario**: Database errors during user creation/update

```typescript
// User creation error handling (src/utils/user.ts)
export const findOrCreateUser = async (...args) => {
  try {
    // Email validation
    if (!validationUtils.isEmail(email)) {
      throw new Error(`Invalid email format: ${email}`);
    }

    // Database operations...
  } catch (error) {
    console.error("Database error in findOrCreateUser:", error);
    throw error; // Re-throw for upstream handling
  }
};
```

**Error Types**:

- **Validation Errors**: Invalid email format, empty required fields
- **Database Constraints**: Duplicate email (rare with OAuth)
- **Connection Errors**: PostgreSQL unavailable
- **Permission Errors**: Database access denied

### 2. Session Creation Failures

**Scenario**: Cannot create session in database

```typescript
// Session creation error handling (src/middleware/auth.ts)
export const createSession = async (...args) => {
  try {
    await query(
      `INSERT INTO sessions (id, user_id, access_token, refresh_token, expires_at) 
       VALUES ($1, $2, $3, $4, $5)`,
      [sessionId, userId, accessToken, refreshToken || null, expiresAt]
    );
    return sessionId;
  } catch (error) {
    console.error("Failed to create session:", error);
    throw error;
  }
};
```

**Recovery Strategies**:

- Retry session creation with new session ID
- Fall back to temporary session storage
- Redirect to error page with retry option

## 🌐 Network & Connectivity Errors

### 1. Discord Service Unavailable

**Scenario**: Discord OAuth endpoints not responding

**Detection Points**:

- Token exchange endpoint timeout
- User profile API unavailable
- OAuth authorization page not loading

**Handling Strategy**:

```typescript
// Timeout and retry logic
const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: tokenParams,
  // Add timeout handling in production
});
```

### 2. Database Connection Failures

**Scenario**: PostgreSQL connection issues

**Error Manifestations**:

- Connection timeout
- Connection pool exhausted
- Database server unreachable
- SSL certificate issues

**Graceful Degradation**:

```typescript
// Database error handling with fallback
try {
  const session = await queryOne(sessionQuery, [sessionId]);
  return { user: mapSessionToUser(session) };
} catch (error) {
  console.error("Database error in /auth/me:", error);
  return {
    error: "Database error",
    details: error instanceof Error ? error.message : "Unknown error",
  };
}
```

## 🔒 Session Validation Errors

### 1. Session Not Found

**Scenario**: Session ID not in database

```typescript
// Session validation (src/routes/auth.ts)
const session = await queryOne(sessionQuery, [sessionId]);
if (!session) {
  return {
    error: "Session not found in database",
    sessionId,
  };
}
```

**Possible Causes**:

- Session expired and cleaned up
- Session manually deleted (logout)
- Database corruption
- Session ID tampering

### 2. Session Expired

**Scenario**: Session past expiration time

```sql
-- Session expiration check in query
WHERE s.id = $1 AND s.expires_at > CURRENT_TIMESTAMP
```

**Automatic Handling**:

- Query returns no results for expired sessions
- Client receives authentication error
- Frontend redirects to login

### 3. Missing Session Cookie

**Scenario**: No authentication credentials provided

```typescript
// Session extraction failure (src/middleware/auth.ts)
const sessionId = extractSessionId(headers, cookie);
if (!sessionId) {
  return {
    error: "No session found",
    debug: {
      cookieReceived: !!headers.cookie,
      authHeaderReceived: !!authHeader,
      sessionHeaderReceived: !!sessionHeader,
    },
  };
}
```

## 🛡️ Security Error Handling

### 1. Input Validation Failures

**Scenario**: Malicious or malformed input data

```typescript
// Email validation (src/utils/user.ts)
if (!validationUtils.isEmail(email)) {
  throw new Error(`Invalid email format: ${email}`);
}

// Input sanitization
const sanitizedEmail = validationUtils.sanitizeInput(email).toLowerCase();
```

**Security Measures**:

- Strict input validation
- Data sanitization
- Error logging without exposing sensitive data
- Rejection of invalid requests

### 2. CSRF Attack Detection

**Scenario**: Cross-site request forgery attempt

**Detection Method**: State parameter validation
**Response**: Immediate flow termination
**Logging**: Security incident recorded

### 3. Session Hijacking Attempts

**Scenario**: Invalid session tokens or manipulation

**Protection Mechanisms**:

- HTTP-only cookies prevent client-side access
- Secure transmission over HTTPS in production
- Session ID entropy prevents guessing
- Database validation prevents forgery

## 📊 Error Response Formats

### Authentication Errors

```typescript
// Standard authentication error response
{
  error: "No session found",
  debug: {
    cookieReceived: boolean,
    authHeaderReceived: boolean,
    sessionHeaderReceived: boolean,
  }
}
```

### OAuth Errors

```typescript
// OAuth-specific error response
{
  error: "oauth_failed",
  message: "Discord authorization failed",
  details: "Token exchange rejected"
}
```

### Database Errors

```typescript
// Database error response (sanitized)
{
  error: "Database error",
  details: "Connection timeout"
  // Never expose: SQL queries, connection strings, internal errors
}
```

## 🔄 Error Recovery Mechanisms

### 1. Automatic Retry Logic

```typescript
// Implement retry for transient failures
const retryOperation = async (operation, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      await delay(1000 * attempt); // Exponential backoff
    }
  }
};
```

### 2. Graceful Degradation

- **Database Unavailable**: Show cached content, retry in background
- **OAuth Service Down**: Display service status, retry button
- **Network Issues**: Queue operations, retry when connected

### 3. User-Friendly Error Messages

```typescript
// Error message mapping
const errorMessages = {
  access_denied: "You cancelled the login process. Please try again.",
  oauth_failed:
    "Login service is temporarily unavailable. Please try again later.",
  session_expired: "Your session has expired. Please log in again.",
  database_error:
    "We are experiencing technical difficulties. Please try again shortly.",
};
```

## 🚨 Critical Error Scenarios

### 1. Complete System Failure

**Scenario**: All authentication services unavailable

**Fallback Strategy**:

- Display maintenance page
- Provide service status updates
- Allow cached/offline functionality where possible

### 2. Security Breach Detection

**Scenario**: Evidence of attack or compromise

**Response Protocol**:

- Immediate session invalidation
- Security logging and alerting
- User notification if required
- System lockdown if necessary

### 3. Data Corruption

**Scenario**: Database integrity issues

**Recovery Steps**:

- Stop write operations
- Investigate corruption scope
- Restore from backups
- Verify data integrity before resuming

## 📁 Error Logging Strategy

### 1. Structured Logging

```typescript
// Comprehensive error logging
console.error("Authentication Error:", {
  timestamp: new Date().toISOString(),
  error: error.message,
  stack: error.stack,
  userId: user?.id,
  sessionId: sessionId,
  userAgent: headers["user-agent"],
  ip: headers["x-forwarded-for"] || "unknown",
  operation: "discord_oauth_callback",
});
```

### 2. Security Event Logging

```typescript
// Security-specific logging
console.warn("Security Event:", {
  type: "CSRF_ATTEMPT",
  expectedState: storedState,
  receivedState: actualState,
  timestamp: new Date().toISOString(),
  ip: clientIp,
});
```

## 📁 Related Files

- **OAuth Error Handling**: `src/routes/auth.ts` (multiple error scenarios)
- **Database Error Handling**: `src/utils/database.ts` and `src/utils/user.ts`
- **Session Validation**: `src/middleware/auth.ts`
- **Input Validation**: `src/utils/auth.ts`
- **Frontend Error Handling**: Pinia stores and Vue error boundaries

## 🔗 Next Steps

1. **[Database Schema](./06-database-schema.md)** - Data structure and constraints
2. **[Security Analysis](./08-security-analysis.md)** - Comprehensive security review
3. **[Cookie Management](./07-cookie-management.md)** - Cookie security details

---

**Related Diagrams**: [Error Scenarios](./diagrams/error-scenarios.puml)  
**Security Focus**: Fail securely while maintaining user experience
