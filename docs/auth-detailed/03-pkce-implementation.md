# 3. PKCE Implementation - Proof Key for Code Exchange

**File**: `03-pkce-implementation.md`  
**Process**: PKCE security implementation for OAuth 2.0  
**Security Standard**: RFC 7636 - Proof Key for Code Exchange

## 🎯 Overview

PKCE (Proof Key for Code Exchange) is a security extension to OAuth 2.0 that protects against authorization code interception attacks. The implementation uses manual cryptographic generation with Web Crypto API for maximum security.

## 🔐 Why PKCE is Required

### Security Threats PKCE Prevents

1. **Authorization Code Interception**: Malicious apps intercepting OAuth codes
2. **Code Injection Attacks**: Attackers injecting authorization codes
3. **Cross-Site Request Forgery**: CSRF attacks on OAuth flow
4. **Man-in-the-Middle Attacks**: Network-level code interception

### OAuth 2.1 Requirement

PKCE is **mandatory** in OAuth 2.1 specification for all clients, including confidential clients with backend servers.

## 🔧 Manual PKCE Implementation

### Code Verifier Generation

```typescript
// Secure random code verifier generation (src/routes/auth.ts)
const generateCodeVerifier = (): string => {
  // Generate 32 bytes of cryptographically secure random data
  const codeVerifierArray = new Uint8Array(32);
  crypto.getRandomValues(codeVerifierArray);

  // Convert to base64url encoding (43-128 characters as per RFC 7636)
  const codeVerifier = btoa(String.fromCharCode(...codeVerifierArray))
    .replace(/\+/g, "-") // Replace + with -
    .replace(/\//g, "_") // Replace / with _
    .replace(/=/g, ""); // Remove padding =

  return codeVerifier;
};
```

### Code Challenge Generation

```typescript
// SHA256 hash of code verifier (src/routes/auth.ts)
const generateCodeChallenge = async (codeVerifier: string): Promise<string> => {
  // Use Web Crypto API for SHA256 hashing
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = new Uint8Array(hashBuffer);

  // Convert hash to base64url
  const codeChallenge = btoa(String.fromCharCode(...hashArray))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  return codeChallenge;
};
```

### Current Implementation (Inline)

```typescript
// Manual PKCE generation in OAuth initiation (lines 31-47)
// Generate a proper PKCE code verifier (43-128 characters, base64url)
const codeVerifierArray = new Uint8Array(32);
crypto.getRandomValues(codeVerifierArray);
const codeVerifier = btoa(String.fromCharCode(...codeVerifierArray))
  .replace(/\+/g, "-")
  .replace(/\//g, "_")
  .replace(/=/g, "");

// Create code challenge for PKCE using Web Crypto API
const encoder = new TextEncoder();
const data = encoder.encode(codeVerifier);
const hashBuffer = await crypto.subtle.digest("SHA-256", data);
const hashArray = new Uint8Array(hashBuffer);
const codeChallenge = btoa(String.fromCharCode(...hashArray))
  .replace(/\+/g, "-")
  .replace(/\//g, "_")
  .replace(/=/g, "");
```

## 🔄 PKCE Flow Process

### Phase 1: PKCE Parameter Generation (OAuth Initiation)

```
Client Request → Code Verifier → Code Challenge → Store Verifier
```

#### Step 1: Generate Code Verifier

- **Purpose**: Random string that proves client identity
- **Length**: 43-128 characters (RFC 7636 requirement)
- **Encoding**: Base64url (URL-safe base64)
- **Entropy**: 32 bytes of cryptographically secure random data

#### Step 2: Generate Code Challenge

- **Method**: SHA256 hash of code verifier
- **Purpose**: Sent to authorization server for verification
- **Security**: One-way hash prevents code verifier discovery

#### Step 3: Store Code Verifier Securely

```typescript
// Store in HTTP-only cookie (temporary storage)
set.cookie = {
  discord_code_verifier: {
    value: codeVerifier,
    httpOnly: true, // XSS protection
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as "lax", // CSRF protection
    maxAge: 10 * 60 * 1000, // 10 minutes (OAuth flow timeout)
    path: "/",
    domain: ".localtest.me",
  },
};
```

### Phase 2: OAuth Authorization (With Code Challenge)

```
Authorization URL → Discord OAuth → Authorization Code
```

#### Discord OAuth URL Construction

```typescript
const params = new URLSearchParams({
  response_type: "code",
  client_id: process.env.DISCORD_CLIENT_ID!,
  redirect_uri: process.env.DISCORD_REDIRECT_URI!,
  scope: "identify email",
  state: `${state}|lang=${language}`,
  code_challenge_method: "S256", // SHA256 method
  code_challenge: codeChallenge, // Generated challenge
});
```

### Phase 3: Token Exchange (With Code Verifier)

```
Authorization Code + Code Verifier → Access Tokens
```

#### PKCE Verification Process

```typescript
// Token exchange with PKCE verification (lines 174-186)
const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID!,
    client_secret: process.env.DISCORD_CLIENT_SECRET!,
    code: code, // Authorization code from callback
    grant_type: "authorization_code",
    redirect_uri: process.env.DISCORD_REDIRECT_URI!,
    code_verifier: codeVerifier, // Proves client identity
  }),
});
```

#### Discord's PKCE Validation

```
Discord Server Process:
1. Receives code_verifier from client
2. Generates SHA256 hash of code_verifier
3. Compares with stored code_challenge
4. If match: Issues tokens
5. If mismatch: Rejects request
```

## 🛡️ Security Analysis

### Attack Prevention

#### Authorization Code Interception Attack

```
Scenario: Malicious app intercepts authorization code
Defense: Without code_verifier, attacker cannot exchange code for tokens
Result: Attack fails - tokens not issued
```

#### Code Injection Attack

```
Scenario: Attacker injects malicious authorization code
Defense: Attacker doesn't have matching code_verifier
Result: Token exchange fails - invalid PKCE verification
```

#### Network Interception

```
Scenario: Network attacker captures OAuth callback
Defense: Authorization code useless without code_verifier
Result: Tokens cannot be obtained
```

### Security Properties

- **Cryptographically Secure**: Web Crypto API randomness
- **One-Time Use**: Code verifier used once then discarded
- **Time-Limited**: 10-minute expiration for OAuth flow
- **Domain-Restricted**: HTTP-only cookies prevent client-side access

## 🔍 PKCE Parameters Specifications

### Code Verifier Requirements (RFC 7636)

- **Length**: 43-128 characters
- **Character Set**: [A-Z] / [a-z] / [0-9] / "-" / "." / "\_" / "~"
- **Encoding**: Base64url (no padding)
- **Entropy**: Minimum 256 bits of entropy

### Code Challenge Requirements

- **Method**: S256 (SHA256)
- **Input**: Code verifier string
- **Output**: Base64url-encoded SHA256 hash
- **Alternative**: "plain" method (not recommended)

### Current Implementation Compliance

```typescript
// ✅ Compliant implementation
const codeVerifierArray = new Uint8Array(32); // 32 bytes = 256 bits entropy
crypto.getRandomValues(codeVerifierArray); // Cryptographically secure
const codeVerifier = btoa(String.fromCharCode(...codeVerifierArray))
  .replace(/\+/g, "-")
  .replace(/\//g, "_")
  .replace(/=/g, ""); // Base64url encoding

// ✅ SHA256 challenge generation
const hashBuffer = await crypto.subtle.digest("SHA-256", data); // SHA256 hash
const codeChallenge = base64url(hashBuffer); // Base64url encoding
```

## 🚨 Error Scenarios

### PKCE Validation Failures

1. **Missing Code Verifier**: Cookie deleted or expired
2. **Invalid Code Challenge**: Tampering or generation error
3. **Code Verifier Mismatch**: Crypto validation fails
4. **Timeout**: OAuth flow exceeds 10-minute window

### Error Handling

```typescript
// Missing PKCE cookies (lines 129-132)
if (!storedState || !codeVerifier) {
  throw new Error("Missing OAuth state or code verifier cookies");
}

// Discord token exchange failure (lines 188-193)
if (!tokenResponse.ok) {
  const errorText = await tokenResponse.text();
  console.error("Discord token exchange failed:", errorText);
  throw new Error(`Discord token exchange failed: ${tokenResponse.status}`);
}
```

## 📊 PKCE vs Alternative Methods

### PKCE vs Client Secret Only

| Aspect                | PKCE           | Client Secret Only      |
| --------------------- | -------------- | ----------------------- |
| **Public Clients**    | ✅ Supported   | ❌ Not secure           |
| **Mobile Apps**       | ✅ Secure      | ❌ Vulnerable           |
| **SPA Applications**  | ✅ Recommended | ❌ Cannot store secrets |
| **Code Interception** | ✅ Protected   | ❌ Vulnerable           |
| **Network Attacks**   | ✅ Mitigated   | ⚠️ Partial protection   |

### PKCE vs State Parameter Only

| Security Feature          | PKCE         | State Only    |
| ------------------------- | ------------ | ------------- |
| **CSRF Protection**       | ✅ Yes       | ✅ Yes        |
| **Code Interception**     | ✅ Protected | ❌ Vulnerable |
| **Replay Attacks**        | ✅ Prevented | ⚠️ Limited    |
| **Client Authentication** | ✅ Strong    | ❌ Weak       |

## 🔧 Implementation Best Practices

### Secure Storage

- **HTTP-Only Cookies**: Prevent XSS access to code verifier
- **Short Expiration**: 10-minute timeout for OAuth flow
- **Secure Transmission**: HTTPS in production environment
- **Domain Restriction**: Limit cookie scope

### Cryptographic Quality

- **Web Crypto API**: Use platform cryptographic primitives
- **Sufficient Entropy**: 32 bytes minimum for code verifier
- **Standard Algorithms**: SHA256 for code challenge
- **Proper Encoding**: Base64url for URL safety

### Error Handling

- **Fail Securely**: Reject on any PKCE validation failure
- **Clear Sensitive Data**: Remove code verifier after use
- **Audit Logging**: Log PKCE failures for security monitoring
- **User Experience**: Graceful error messages

## 📁 Related Files

- **PKCE Generation**: `src/routes/auth.ts` (lines 31-47)
- **Token Exchange**: `src/routes/auth.ts` (lines 174-186)
- **Cookie Storage**: `src/routes/auth.ts` (lines 49-72)
- **Validation**: `src/routes/auth.ts` (lines 129-132)

## 🔗 Standards and References

- **RFC 7636**: [PKCE for OAuth Public Clients](https://tools.ietf.org/html/rfc7636)
- **OAuth 2.1**: [Latest OAuth Security Best Practices](https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/)
- **Web Crypto API**: [Cryptographic Operations](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)

## 🔗 Next Steps

1. **[Session Management](./02-session-management.md)** - How sessions are created
2. **[Error Handling](./05-error-handling.md)** - PKCE failure scenarios
3. **[Security Analysis](./08-security-analysis.md)** - Complete security review

---

**Related Diagrams**: [PKCE Flow](./diagrams/pkce-flow.puml)  
**Security Standard**: RFC 7636 compliant implementation
