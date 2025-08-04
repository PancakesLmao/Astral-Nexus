# 4. Logout Process - Session Termination & Cleanup

**File**: `04-logout-process.md`  
**Process**: User logout and session cleanup  
**Focus**: Session deletion, cookie management, and security cleanup

## 🎯 Overview

The logout process handles secure session termination, including database cleanup and cookie removal. The implementation ensures complete session invalidation and prevents session reuse.

## 🔧 Logout Implementation

### Logout Endpoint

```typescript
// Logout endpoint (src/routes/auth.ts)
.delete("/logout", async ({ cookie, set }: { cookie: any; set: any }) => {
  const sessionCookie = cookie[appConfig.cookies.session.name]; // "astral_session"

  if (sessionCookie && sessionCookie.value) {
    try {
      // Delete session from database
      await deleteSession(sessionCookie.value);
      console.log("Session deleted:", sessionCookie.value);
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  }

  // Clear session cookie regardless of database operation result
  set.cookie = {
    [appConfig.cookies.session.name]: {
      value: "",                    // Empty value
      ...appConfig.cookies.session, // Inherit security settings
      maxAge: 0,                   // Immediate expiration
    },
  };

  return { success: true, message: "Logged out successfully" };
})
```

### Database Session Deletion

```typescript
// Session deletion function (src/middleware/auth.ts)
export const deleteSession = async (sessionId: string): Promise<void> => {
  try {
    // Remove session record from PostgreSQL
    const result = await query("DELETE FROM sessions WHERE id = $1", [
      sessionId,
    ]);

    console.log("Session deleted from database:", sessionId);

    // Optionally check if session was found and deleted
    if (result.rowCount === 0) {
      console.warn("Session not found in database:", sessionId);
    }
  } catch (error) {
    console.error("Database error deleting session:", error);
    throw error;
  }
};
```

## 🔄 Logout Flow Process

### Phase 1: Logout Initiation

```
User Action → Frontend Request → Backend Processing
```

#### Step 1: User Initiates Logout

- **Location**: Frontend interface (header, menu, etc.)
- **Action**: User clicks "Logout" button
- **Trigger**: Frontend sends DELETE request to logout endpoint

#### Step 2: Frontend Logout Request

```typescript
// Frontend logout request
const logout = async () => {
  try {
    const response = await fetch("http://api.localtest.me:3001/auth/logout", {
      method: "DELETE",
      credentials: "include", // Include session cookie
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      // Clear frontend state
      authStore.clearUser();
      router.push("/login");
    }
  } catch (error) {
    console.error("Logout error:", error);
  }
};
```

### Phase 2: Session Extraction & Validation

```
Cookie Extraction → Session Identification → Cleanup
```

#### Step 3: Extract Session Cookie

```typescript
// Extract session cookie from request
const sessionCookie = cookie[appConfig.cookies.session.name];
// Gets "astral_session" cookie value if present
```

#### Step 4: Validate Session Exists

```typescript
if (sessionCookie && sessionCookie.value) {
  // Valid session cookie found - proceed with cleanup
} else {
  // No session cookie - still clear any remaining cookies
}
```

### Phase 3: Database Cleanup

```
Database Deletion → Session Removal → Discord Token Cleanup
```

#### Step 5: Delete Session from Database

```sql
-- SQL operation for session deletion
DELETE FROM sessions
WHERE id = $1;  -- Session ID from cookie

-- This removes:
-- - Session record
-- - Associated Discord access token
-- - Associated Discord refresh token
-- - Session expiration data
```

#### Step 6: Handle Database Errors

```typescript
try {
  await deleteSession(sessionCookie.value);
} catch (error) {
  // Log error but continue with cookie cleanup
  console.error("Error deleting session:", error);
  // Don't fail logout due to database issues
}
```

### Phase 4: Cookie Cleanup

```
Cookie Invalidation → Security Headers → Response
```

#### Step 7: Clear Session Cookie

```typescript
set.cookie = {
  [appConfig.cookies.session.name]: {
    // "astral_session"
    value: "", // Empty cookie value
    httpOnly: true, // Maintain security settings
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as "lax",
    maxAge: 0, // Immediate expiration
    path: "/", // Same path as original cookie
    domain: ".localtest.me", // Same domain as original cookie
  },
};
```

### Phase 5: Frontend State Cleanup

```
Response Processing → State Clear → Navigation
```

#### Step 8: Process Logout Response

```typescript
// Frontend response handling
if (response.ok) {
  const result = await response.json();
  // { success: true, message: "Logged out successfully" }
}
```

#### Step 9: Clear Frontend Authentication State

```typescript
// Clear Pinia authentication store
authStore.clearUser();

// Clear any cached user data
localStorage.removeItem("userPreferences"); // If any

// Reset authentication-dependent UI state
```

#### Step 10: Navigate to Login

```typescript
// Redirect to login page
router.push("/login");

// Or redirect to home page
window.location.href = "http://localtest.me:3000";
```

## 🛡️ Security Considerations

### Complete Session Invalidation

- **Database Deletion**: Session completely removed from database
- **Cookie Expiration**: Browser cookie immediately invalidated
- **Token Cleanup**: Discord OAuth tokens removed
- **No Partial State**: Either complete success or complete failure

### Protection Against Session Reuse

- **Database Removal**: Session ID no longer valid in database
- **Cookie Clearing**: Browser removes session cookie
- **Server Validation**: Any remaining requests with old session fail
- **Cross-Subdomain**: Cookie cleared across all subdomains

### Error Handling Security

```typescript
// Secure error handling - always clear cookies
try {
  await deleteSession(sessionId);
} catch (error) {
  // Log error but don't expose details to client
  console.error("Session deletion failed:", error);

  // Still clear cookie even if database fails
  // Prevents client-side session persistence
}

// Always return success to client
return { success: true, message: "Logged out successfully" };
```

## 🚨 Error Scenarios

### Database Connection Failures

- **Scenario**: PostgreSQL connection unavailable
- **Handling**: Log error, clear cookie anyway
- **Result**: User appears logged out, session may persist in DB
- **Resolution**: Database cleanup on next connection

### Missing Session Cookie

- **Scenario**: User already logged out or cookie expired
- **Handling**: Skip database deletion, still clear any cookies
- **Result**: Graceful handling, no error to user

### Network Failures

- **Scenario**: Frontend cannot reach logout endpoint
- **Handling**: Frontend should clear local state anyway
- **Result**: Local logout, session persists on server

## 🔧 Debug & Maintenance

### Debug Logout Endpoint

```typescript
// Debug endpoint to clear session cookie (src/routes/auth.ts)
.post("/clear-session", async ({ set }: { set: any }) => {
  set.cookie = {
    [appConfig.cookies.session.name]: {
      value: "",
      ...appConfig.cookies.session,
      maxAge: 0,
    },
  };

  console.log("Session cookie cleared via /auth/clear-session");
  return { success: true, message: "Session cookie cleared" };
})
```

### Session Cleanup Maintenance

```sql
-- Periodic cleanup of expired sessions (manual/cron)
DELETE FROM sessions
WHERE expires_at < CURRENT_TIMESTAMP;

-- Cleanup sessions for deleted users
DELETE FROM sessions s
WHERE NOT EXISTS (
  SELECT 1 FROM users u WHERE u.id = s.user_id
);
```

## 📊 Logout Success Indicators

### Client-Side Verification

1. **Cookie Removed**: Browser dev tools show no astral_session cookie
2. **Authentication State**: Frontend auth store shows unauthenticated
3. **API Calls**: Subsequent /auth/me calls return 401 Unauthorized
4. **UI State**: Interface shows login/register options

### Server-Side Verification

1. **Database Query**: Session ID not found in sessions table
2. **Auth Middleware**: Session validation fails for old session ID
3. **Access Logs**: No authenticated requests with old session ID

## 📈 Performance Considerations

### Database Operations

- **Single DELETE**: One database query per logout
- **No Cascading**: Session deletion doesn't affect user record
- **Index Usage**: Primary key lookup for efficient deletion

### Cookie Operations

- **Browser Handling**: Browser automatically removes expired cookies
- **Network Efficiency**: Minimal cookie data in logout response
- **Cross-Domain**: Single cookie operation affects all subdomains

## 🔗 Related Logout Scenarios

### Automatic Session Expiration

```typescript
// Sessions expire automatically based on expires_at
// No explicit logout needed - validation handles expiration
WHERE s.expires_at > CURRENT_TIMESTAMP
```

### Force Logout (Admin Action)

```sql
-- Admin can force logout by deleting user sessions
DELETE FROM sessions WHERE user_id = 'user-uuid';
```

### Account Deletion

```sql
-- User account deletion cascades to sessions
-- Foreign key constraint: ON DELETE CASCADE
DELETE FROM users WHERE id = 'user-uuid';
-- Automatically deletes all sessions for user
```

## 📁 Related Files

- **Logout Endpoint**: `src/routes/auth.ts` (DELETE /logout)
- **Session Deletion**: `src/middleware/auth.ts` (deleteSession function)
- **Frontend Logout**: Pinia auth store logout actions
- **Cookie Configuration**: `src/config/app.ts`
- **Database Schema**: `init.sql` (sessions table)

## 🔗 Integration Points

### Frontend Integration

- **Authentication Store**: Pinia store logout method
- **Route Guards**: Navigation guards for protected routes
- **UI Components**: Logout buttons and menu items

### Backend Integration

- **Auth Middleware**: Session validation for protected endpoints
- **API Security**: All authenticated endpoints check session validity
- **Audit Logging**: Track logout events for security monitoring

## 🔗 Next Steps

1. **[Error Handling](./05-error-handling.md)** - Comprehensive error scenarios
2. **[Database Schema](./06-database-schema.md)** - Complete data structure
3. **[Security Analysis](./08-security-analysis.md)** - Security review

---

**Related Diagrams**: [Logout Sequence](./diagrams/logout-sequence.puml)  
**Security Focus**: Complete session invalidation and cleanup
