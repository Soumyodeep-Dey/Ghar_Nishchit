# Security Policy

## Supported Versions

The following versions of Ghar Nishchit are currently supported with security updates:

| Version | Supported |
|---|---|
| 1.0.x | Yes |
| < 1.0 | No |

---

## Reporting a Vulnerability

**Please do NOT open a public GitHub issue for security vulnerabilities.**

If you discover a security vulnerability in Ghar Nishchit, please report it **privately** by:

1. Going to the [Security tab](https://github.com/ChandraVerse/Ghar_Nishchit/security) on GitHub
2. Clicking **"Report a vulnerability"** to open a private advisory

Or contact the maintainer directly via GitHub: [@ChandraVerse](https://github.com/ChandraVerse)

---

## What to Include in Your Report

Please provide as much of the following information as possible to help us understand and resolve the issue quickly:

- **Type of vulnerability** (e.g., SQL injection, XSS, authentication bypass)
- **Affected component** (frontend / backend / API endpoint)
- **Steps to reproduce** the vulnerability
- **Proof of concept** or exploit code (if available)
- **Potential impact** — what an attacker could achieve
- Your **contact information** for follow-up

---

## Response Timeline

| Stage | Timeline |
|---|---|
| Acknowledgement of report | Within 48 hours |
| Initial assessment | Within 5 business days |
| Fix and patch release | Within 30 days (critical issues prioritised) |
| Public disclosure | After patch is released |

---

## Security Practices in This Project

- Passwords are hashed using **bcryptjs** before storage — never stored in plain text
- All protected routes use **JWT middleware** for authentication
- Sensitive configuration is managed via **environment variables** — never hardcoded
- **CORS** is configured to restrict unauthorised cross-origin requests
- The `.env` file is listed in `.gitignore` to prevent accidental exposure of secrets

---

Thank you for helping keep Ghar Nishchit and its users safe.
