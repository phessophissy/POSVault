# Security Policy

## Supported Branches

Security fixes are applied to `main`.

## Reporting a Vulnerability

Do not open public issues containing secrets or exploit details.

Report security issues privately to repository maintainers with:
- impact summary
- reproduction steps
- affected files or components
- suggested mitigation (if available)

## Secret Handling Requirements

- Never commit real private keys, wallet exports, seed phrases, or `.env` files.
- Use `.env.example` only as a template with placeholders.
- Keep operational wallet files local and ignored.
- Rotate credentials immediately if accidental exposure is suspected.

## Pre-PR Security Checks

Run before opening a pull request:

```bash
npm run security:check-tracked
```

CI also runs path-based secret checks and gitleaks scanning on push and PR events.
