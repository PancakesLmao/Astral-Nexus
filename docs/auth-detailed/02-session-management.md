# 2. Session Management - Creation, Validation & Storage

**File**: `02-session-management.md`  
**Process**: Session lifecycle management and validation  
**Focus**: Database storage, cookie handling, and authentication checks

## 🎯 Overview

Session management handles the complete lifecycle of user sessions from creation through validation to expiration. The system uses PostgreSQL for persistent storage and HTTP-only cookies for secure client-side session identification.

## 🔧 Session Creation Process

### Database Session Storage

```typescript
// Session creation function (src/middleware/auth.ts)
export const createSession = async (
  userId: string,
  accessToken: string,
  refreshToken?: string,
  expiresIn = 3600
) => {
  // Generate cryptographically secure session ID
  const sessionId =
    Math.random().toString(36).substring(2) + Date.now().toString(36);

  const expiresAt = new Date(Date.now() + expiresIn * 1000);

  // Insert session into PostgreSQL
  await query(
    `INSERT INTO sessions (id, user_id, access_token, refresh_token, expires_at) 
     VALUES ($1, $2, $3, $4, $5)`,
    [sessionId, userId, accessToken, refreshToken || null, expiresAt]
  );

  return sessionId;
};
```

### Session Data Structure

```sql
-- PostgreSQL sessions table schema
CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(255) PRIMARY KEY,                    -- Session identifier
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    access_token TEXT,                              -- Discord OAuth access token
    refresh_token TEXT,                             -- Discord OAuth refresh token
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,  -- Session expiration
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Cookie Configuration

```typescript
// Session cookie settings (src/config/app.ts)
cookies: {
  session: {
    name: "astral_session",                  // Cookie name
    httpOnly: true,                         // XSS protection
    secure: process.env.NODE_ENV === "production", // HTTPS only in prod
    sameSite: "lax" as "lax",              // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000,      // 7 days
    path: "/",                             // Available site-wide
    domain: ".localtest.me",               // Cross-subdomain sharing
  },
}
```

## 🔍 Session Validation Process

### Authentication Middleware Priority

The system implements a cookie-first authentication strategy with multiple fallback methods:

```typescript
// Session extraction with priority (src/middleware/auth.ts)
export const extractSessionId = (headers: any, cookie: any): string | null => {
  let sessionId: string | null = null;

  // 1. PRIMARY: Check HTTP-only cookie (preferred method)
  const cookieName = "astral_session";
  if (cookie && cookie[cookieName]?.value) {
    sessionId = cookie[cookieName].value;
    console.log("Session extracted from cookie:", sessionId);
  }

  // 2. FALLBACK: Check Authorization header
  const authHeader = headers.authorization;
  if (!sessionId && authHeader && authHeader.startsWith("Bearer ")) {
    sessionId = authHeader.substring(7);
    console.log("Session extracted from Authorization header");
  }

  // 3. FINAL FALLBACK: Check X-Session-ID header
  const sessionHeader = headers["x-session-id"];
  if (!sessionId && sessionHeader) {
    sessionId = sessionHeader;
    console.log("Session extracted from X-Session-ID header");
  }

  return sessionId;
};
```

### Database Session Validation

```typescript
// Comprehensive session validation query
const sessionQuery = `
  SELECT 
    s.*,                               -- Session data
    u.id as user_id, 
    u.email, 
    u.name, 
    u.picture,
    p.provider_name                    -- OAuth provider info
  FROM sessions s
  JOIN users u ON s.user_id = u.id
  JOIN providers p ON u.provider_id = p.id
  WHERE s.id = $1                      -- Match session ID
  AND s.expires_at > CURRENT_TIMESTAMP -- Ensure not expired
`;

const session = await queryOne(sessionQuery, [sessionId]);
```

### Session Response Format

```typescript
// Successful session validation response
if (session) {
  return {
    user: {
      id: session.user_id,
      email: session.email,
      name: session.name,
      picture: session.picture,
      provider: session.provider_name,
    },
  };
}
```

## 🛡️ Security Features

### HTTP-Only Cookie Security

- **XSS Protection**: Cookies not accessible via JavaScript
- **Domain Security**: Restricted to `.localtest.me` domain
- **HTTPS Enforcement**: Secure flag in production environment
- **CSRF Protection**: SameSite=lax configuration

### Session Expiration Management

```typescript
// Automatic expiration handling
const expiresAt = new Date(Date.now() + expiresIn * 1000);

// Database-level expiration check
WHERE s.expires_at > CURRENT_TIMESTAMP
```

### Token Storage Security

- **Access Tokens**: Discord OAuth tokens stored in database
- **Refresh Tokens**: Available for token renewal
- **Plaintext Storage**: Current implementation (consider encryption)

## 📊 Authentication Check Endpoint

### `/auth/me` Implementation

```typescript
// Current user endpoint (src/routes/auth.ts)
.get("/auth/me", async ({ cookie, headers }) => {
  // Extract session using priority system
  const sessionId = extractSessionId(headers, cookie);

  if (!sessionId) {
    return {
      error: "No session found",
      debug: {
        cookieReceived: !!headers.cookie,
        authHeaderReceived: !!headers.authorization,
        sessionHeaderReceived: !!headers["x-session-id"],
      },
    };
  }

  // Validate session in database
  const session = await queryOne(sessionQuery, [sessionId]);

  if (!session) {
    return { error: "Session not found in database", sessionId };
  }

  // Return user data
  return { user: mapSessionToUser(session) };
})
```

### Frontend Authentication Check

```typescript
// Frontend session validation (automatic)
fetch("http://api.localtest.me:3001/auth/me", {
  method: "GET",
  credentials: "include", // Automatic cookie inclusion
  headers: {
    "Content-Type": "application/json",
    // No Authorization header needed - cookie-based
  },
});
```

## 🔄 Session Lifecycle States

### Session States

1. **Created**: New session after successful OAuth
2. **Active**: Valid session within expiration time
3. **Expired**: Session past expiration timestamp
4. **Deleted**: Manually terminated session (logout)

### State Transitions

```
OAuth Success → Created → Active → (Expired | Deleted)
                   ↑         ↓
              [Validation] [Access]
```

## 📈 Performance Considerations

### Database Efficiency

- **Single Query**: One JOIN query for complete user data
- **Index Strategy**: Primary key lookup on session ID
- **Connection Pooling**: PostgreSQL connection management

### Memory Management

- **No In-Memory Storage**: All sessions in database
- **Stateless Backend**: No server-side session storage
- **Cookie Size**: Minimal cookie payload (session ID only)

## 🚨 Error Scenarios

### Common Session Issues

1. **Missing Cookie**: No session cookie present
2. **Invalid Session ID**: Session not found in database
3. **Expired Session**: Session past expiration time
4. **Database Connection**: PostgreSQL connection issues

### Error Response Examples

```typescript
// No session found
{
  error: "No session found",
  debug: {
    cookieReceived: false,
    authHeaderReceived: false,
    sessionHeaderReceived: false,
  }
}

// Session expired
{
  error: "Session not found in database",
  sessionId: "abc123xyz789"
}

// Database error
{
  error: "Database error",
  details: "Connection timeout"
}
```

## 🔧 Session Management Operations

### Session Cleanup (Manual)

```sql
-- Remove expired sessions
DELETE FROM sessions
WHERE expires_at < CURRENT_TIMESTAMP;

-- Remove sessions for specific user
DELETE FROM sessions
WHERE user_id = 'user-uuid';
```

### Session Refresh (Future Enhancement)

```typescript
// Potential refresh token implementation
const refreshSession = async (sessionId: string) => {
  const session = await queryOne("SELECT * FROM sessions WHERE id = $1", [
    sessionId,
  ]);

  if (session && session.refresh_token) {
    // Use Discord refresh token to get new access token
    // Update session with new tokens and expiration
  }
};
```

## 🔗 Integration Points

### Frontend Integration

- **Automatic Cookies**: Browser handles cookie storage and transmission
- **No Manual Headers**: No need for Authorization header management
- **Cross-Subdomain**: Works across blog.localtest.me and admin.localtest.me

### Backend Integration

- **Middleware**: Authentication middleware for protected routes
- **Route Protection**: Automatic session validation for secured endpoints
- **User Context**: Session data provides complete user context

## 📁 Related Files

- **Session Creation**: `src/middleware/auth.ts` (createSession function)
- **Session Validation**: `src/routes/auth.ts` (/auth/me endpoint)
- **Database Schema**: `init.sql` (sessions table)
- **Cookie Configuration**: `src/config/app.ts`
- **Frontend Integration**: Pinia stores for authentication state

## 🔗 Next Steps

1. **[PKCE Implementation](./03-pkce-implementation.md)** - Security details
2. **[Logout Process](./04-logout-process.md)** - Session termination
3. **[Database Schema](./06-database-schema.md)** - Complete data structure

---

**Related Diagrams**: [Session Validation](./diagrams/session-validation.puml)  
**Security Focus**: HTTP-only cookies + database sessions
