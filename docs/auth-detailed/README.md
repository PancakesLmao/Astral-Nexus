# Authentication System Documentation

This directory contains detailed documentation of the AstralNexus authentication system, broken down into individual processes and flows.

## 📚 Documentation Structure

### Core Processes

- **[1. Login Flow](./01-login-flow.md)** - Complete Discord OAuth login process
- **[2. Session Management](./02-session-management.md)** - Session creation, validation, and storage
- **[3. PKCE Implementation](./03-pkce-implementation.md)** - Proof Key for Code Exchange security
- **[4. Logout Process](./04-logout-process.md)** - Session termination and cleanup
- **[5. Error Handling](./05-error-handling.md)** - Invalid cases and error scenarios

### Sequence Diagrams

- **[Login Sequence](./diagrams/login-sequence.puml)** - Visual login flow
- **[Session Validation](./diagrams/session-validation.puml)** - Authentication check process
- **[PKCE Flow](./diagrams/pkce-flow.puml)** - PKCE security implementation
- **[Logout Sequence](./diagrams/logout-sequence.puml)** - Logout and cleanup process
- **[Error Scenarios](./diagrams/error-scenarios.puml)** - Error handling flows

### Technical Details

- **[Database Schema](./06-database-schema.md)** - Session and user storage structure
- **[Cookie Management](./07-cookie-management.md)** - HTTP-only cookie implementation
- **[Security Analysis](./08-security-analysis.md)** - Security considerations and best practices

### Environment

- **Frontend**: blog.localtest.me:3000 (Vue.js + Pinia)
- **Backend**: api.localtest.me:3001 (Elysia.js + PostgreSQL)
- **OAuth Provider**: Discord OAuth 2.0
- **Security**: PKCE + HTTP-only cookies + input validation

