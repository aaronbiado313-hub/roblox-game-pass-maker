# Security Policy

## Reporting Security Issues

**Please do NOT open public issues for security vulnerabilities.**

To report a security vulnerability, email: `aaronbiado313@gmail.com` with:
- Description of vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will acknowledge receipt within 48 hours and work on a fix promptly.

## Security Best Practices

### For Users
1. Always use HTTPS when accessing the application
2. Never share your Roblox authentication token
3. Clear browser cache after logging out
4. Keep your browser updated
5. Use strong, unique passwords for Roblox account

### For Developers
1. Never commit API keys or secrets
2. Use environment variables for sensitive data
3. Validate all user inputs
4. Keep dependencies updated
5. Use Content Security Policy headers
6. Implement rate limiting
7. Follow OWASP guidelines
8. Regular security audits

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.0.x   | ✅ Yes             |
| 1.0.x   | ⚠️ Limited support |
| < 1.0   | ❌ No              |

## Known Vulnerabilities

None currently known. If you discover one, please report it using the process above.

## Security Headers

The application should be deployed with these headers:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

## OAuth Security

When implementing real Roblox OAuth:
- Use PKCE (Proof Key for Code Exchange)
- Validate state parameter
- Store tokens securely
- Use short-lived access tokens
- Implement refresh token rotation

## Data Protection

- No personal data is stored on external servers (demo mode)
- Local storage is used for session persistence only
- Icons uploaded are stored client-side only (demo)
- No tracking or analytics in current version

## Changelog

### v2.0.0
- Added service worker for offline support
- Implemented PWA capabilities
- Added input validation
- Improved error handling

### v1.0.0
- Initial release
