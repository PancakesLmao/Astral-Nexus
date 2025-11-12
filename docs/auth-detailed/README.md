# Authentication System Documentation

**Last Updated**: November 12, 2025  
**Current System**: Supabase Auth with Discord OAuth

---

## Documentation Structure

### Core Processes

- **[1. Login Flow](./01-login-flow.md)** - Discord OAuth via Supabase
- **[2. Session Management](./02-session-management.md)** - Cookie-based cross-subdomain sessions
- **[3. PKCE Implementation](./03-pkce-implementation.md)** - PKCE security (built into Supabase)
- **[4. Logout Process](./04-logout-process.md)** - Session cleanup
- **[5. Error Handling](./05-error-handling.md)** - OAuth and session errors

### Sequence Diagrams

- **[Login Sequence](./diagrams/login-sequence.puml)** - Supabase OAuth flow
- **[Session Validation](./diagrams/session-validation.puml)** - JWT validation process
- **[PKCE Flow](./diagrams/pkce-flow.puml)** - PKCE implementation
- **[Logout Sequence](./diagrams/logout-sequence.puml)** - Logout process
- **[Error Scenarios](./diagrams/error-scenarios.puml)** - Error handling flows

---

## Current Architecture

### Authentication Flow

```
User → Supabase Client → Supabase Auth → Discord → Supabase → Frontend
```
### Technology Stack

- **Frontend**: localtest.me:3000 (Vue.js + Pinia)

  - Supabase Client: `@supabase/supabase-js`
  - Session Storage: Chunked cookies
  - Auth State: Pinia stores

- **Backend**: localhost:3001 (Elysia.js)

  - Role: JWT verification only
  - No OAuth handling
  - Supabase Admin SDK for admin operations

- **Auth Provider**: Supabase Auth

  - Discord OAuth 2.0
  - PKCE Flow (built-in)
  - JWT token issuance

- **Security**:
  - PKCE (Proof Key for Code Exchange)
  - Cookie domain sharing (`.localtest.me`)
  - Automatic cookie chunking (>4KB sessions)
  - Role-based access control

---

## Documentation Notes

The detailed documentation in this folder describes authentication concepts that are **still applicable** to the Supabase implementation:

1. **Login Flow** - Now handled by Supabase, but concepts remain the same
2. **Session Management** - Updated to use cookies instead of localStorage
3. **PKCE Implementation** - Now automatic via Supabase (no manual code)
4. **Logout Process** - Similar flow, simpler implementation
5. **Error Handling** - Same error types, different sources

### Reading These Docs

When reviewing the detailed documentation files:

- **OAuth Flow**: Managed by Supabase (no custom backend endpoints)
- **Session Storage**: Cookies with chunking (not HTTP-only backend cookies)
- **PKCE**: Built into Supabase SDK (no manual implementation needed)
- **Token Verification**: Backend still verifies JWTs from `Authorization` header

---

## Quick References

- **Setup Guide**: [/SUPABASE_DISCORD_SETUP.md](/SUPABASE_DISCORD_SETUP.md)
- **Security Guide**: [/SECURITY.md](/SECURITY.md)
- **Migration Details**: [/logs/issue3-newAuthen.md](/logs/issue3-newAuthen.md)
- **Supabase Docs**: https://supabase.com/docs/guides/auth

---
