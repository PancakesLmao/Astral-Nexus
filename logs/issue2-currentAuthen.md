# Issue 2: Current Authentication Architecture Analysis

## Overview

This document analyzes the current authentication implementation, specifically addressing the design decision between PKCE OAuth implementation vs JWT token-based authentication, and documenting the architecture choices made for the AstralNexus blog platform.

## Current Architecture Summary

### Authentication Method

- **Primary:** Manual Discord OAuth 2.0 with PKCE (Proof Key for Code Exchange)
- **Session Management:** Server-side sessions stored in PostgreSQL
- **Token Storage:** Access and refresh tokens stored in plaintext in database sessions table
- **Client Authentication:** HTTP-only cookies with secure domain settings

## Architecture Decision: PKCE

### Why PKCE Was Chosen

#### 1. **Modern OAuth Security Standard**

```typescript
// PKCE implementation provides protection against:
// - Authorization code interception attacks
// - Malicious app impersonation
// - Cross-site request forgery in OAuth flow

const codeVerifier = generateCodeVerifier();
const codeChallenge = await generateCodeChallenge(codeVerifier);
```

**Security Benefits:**

- Prevents authorization code interception
- Works with public clients (SPAs, mobile apps)
- Required by OAuth 2.1 specification
- Protection against malicious redirect URI attacks

#### 2. **Subdomain Architecture Compatibility**

```
Domain Structure:
├── blog.localtest.me:3000 (Frontend)
├── api.localtest.me:3001 (Backend API)
└── admin.localtest.me:3000 (Admin Panel)

Cookie Domain: .localtest.me
├── Shared across all subdomains
├── HTTP-only for security
└── Secure flag for HTTPS
```

### JWT vs Session-Based Trade-offs

#### Current Session-Based Approach

**Advantages:**

- Server-side revocation capability
- No token expiration management on client
- Simpler client-side implementation
- Better security for sensitive data

**Implementation:**

```typescript
// Session extraction priority: Cookie > Header
const sessionToken = request.headers.cookie?.includes("session_token")
  ? getCookieValue(request.headers.cookie, "session_token")
  : request.headers.authorization?.replace("Bearer ", "");
```

#### JWT Alternative Analysis

**Would Provide:**

- Stateless authentication
- Distributed system scalability
- Reduced database queries
- Client-side token management

**Why Not Chosen:**

- Revocation complexity (blacklisting required)
- Token refresh management complexity
- Larger payload sizes
- Security risks with client-side storage

## Security Implementation Details

### 1. PKCE Flow Implementation

```typescript
// Secure random generation using Web Crypto API
const generateCodeVerifier = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64URLEscape(btoa(String.fromCharCode(...array)));
};

const generateCodeChallenge = async (verifier: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return base64URLEscape(btoa(String.fromCharCode(...new Uint8Array(digest))));
};
```

### 2. Input Validation & Sanitization

```typescript
// Email validation before user creation
if (!validationUtils.isEmail(email)) {
  throw new Error(`Invalid email format: ${email}`);
}

// Input sanitization for all user data
const sanitizedEmail = validationUtils.sanitizeInput(email).toLowerCase();
const sanitizedName = validationUtils.sanitizeInput(name);
```

### 3. Session Management

```typescript
// Database session storage with plaintext tokens
CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  session_token VARCHAR(255) UNIQUE NOT NULL,
  access_token TEXT NOT NULL,        -- Discord access token
  refresh_token TEXT,                -- Discord refresh token
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Security Considerations

### Current Security Strengths

1. **PKCE Protection:** Guards against authorization code attacks
2. **HTTP-Only Cookies:** Prevents XSS token theft
3. **Input Validation:** Email format validation and sanitization
4. **Server-Side Sessions:** Immediate revocation capability
5. **Domain Security:** Proper subdomain cookie configuration

### Potential Security Improvements

1. **Token Encryption:** Consider encrypting stored access/refresh tokens
2. **Session Rotation:** Implement session token rotation on sensitive operations
3. **Rate Limiting:** Add OAuth endpoint rate limiting
4. **CSRF Protection:** Additional CSRF tokens for state-changing operations

## Performance Considerations

### Current Approach Benefits

- **Database Efficiency:** Single session lookup per request
- **Memory Usage:** No in-memory token storage required
- **Scalability:** PostgreSQL handles session persistence reliably

### Alternative JWT Approach Comparison

```typescript
// Session-based (current): 1 DB query per request
const session = await queryOne(
  "SELECT * FROM sessions WHERE session_token = $1",
  [token]
);

// JWT approach: 0 DB queries, but requires:
// - Token validation logic
// - Refresh token management
// - Blacklist for revoked tokens
```
## Future Considerations

For larger scale deployments, consider:

- JWT implementation for stateless scalability
- Redis session storage for performance
- Microservices authentication patterns
- Advanced token management strategies

## Reosources

### Related Files

- `src/routes/auth.ts` - OAuth implementation with PKCE
- `src/utils/auth.ts` - Validation utilities
- `src/utils/user.ts` - User management with validation
- `src/middleware/auth.ts` - Session extraction middleware
- `docs/issue1-login.md` - OAuth troubleshooting documentation

### Security Standards

- [OAuth 2.1 Security Best Practices](https://datatracker.ietf.org/doc/draft-ietf-oauth-security-topics/)
- [PKCE for OAuth Public Clients](https://tools.ietf.org/html/rfc7636)
- [OAuth 2.0 Threat Model](https://tools.ietf.org/html/rfc6819)
