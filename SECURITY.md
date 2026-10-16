# LearnifyAI security & HTTPS guide

## What is protected

| Area | Protection |
|---|---|
| Transport | HTTP → HTTPS redirect (Nginx), TLS 1.2/1.3 only, HSTS (2 years), API refuses non-HTTPS with `FORCE_HTTPS=1`, mixed-content API URLs auto-upgraded, `upgrade-insecure-requests` |
| Browser | Content-Security-Policy (no inline scripts, no plugins, no framing), X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy, COOP |
| API secrets | Generated code runs with an allow-listed environment: **API keys and ADMIN_TOKEN are never visible to it** |
| Personal data | `/api/auth/users`, `/api/auth/logs`, `/api/dataset`, `/api/ingest` require `Authorization: Bearer <ADMIN_TOKEN>` for remote callers; login endpoint only returns the caller's own profile (no IPs) |
| CSRF / cross-site | Cross-origin requests blocked unless listed in `ALLOWED_ORIGINS`; POST must be `application/json` |
| Abuse | Per-IP rate limits (Nginx + API), heavy routes 10/min, global job concurrency cap, login 10/min |
| Code runner | 10 s timeout, kills the whole process group, output flood cut-off, memory caps (Java 256 MB, Node 256 MB), concurrency cap, `ENABLE_CODE_RUN=0` switch |
| Input | Length/type validation on every route, export format allow-list, safe download filenames, email validation, https-only avatar URLs, browser cannot inject `system` prompts |
| Errors | No stack traces; internal messages hidden when `NODE_ENV=production` |
| Storage | Atomic user-DB writes, owner-only file permissions, prototype-pollution-safe parsing, crypto-random IDs |
| Repo hygiene | `.env` files and personal data (`users.json`, `logins.jsonl`, `verified.jsonl`) are git-ignored; `.env.example` templates provided |

## Production checklist

1. **Rotate every key** that has ever been shared or zipped (Groq, Gemini, Ollama). Put the new ones only in `server/.env` on the server.
2. `cp server/.env.example server/.env`, fill keys, set `ADMIN_TOKEN`:
   `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
3. `cp .env.example .env`, set `VITE_GOOGLE_API_KEY`, leave `VITE_API_BASE` empty.
4. `npm ci && npm run build && sudo cp -r dist/* /var/www/learnify/`
5. Edit the domain in `deploy/nginx.conf`, get a certificate with certbot, install the config (instructions at the top of the file).
6. `pm2 start server/index.js --name learnify-api` (reads `server/.env`).
7. Firebase Console → Authentication → Authorized domains: add your domain, remove ones you do not use.
   Google Cloud Console → Credentials → restrict the browser API key to `https://yourdomain/*`.
8. Test: `https://www.ssllabs.com/ssltest/` (aim for A/A+) and `https://securityheaders.com` (aim for A).

## Calling admin routes

```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" https://yourdomain.com/api/auth/users
```
From the server itself (`curl http://127.0.0.1:8787/...`) no token is needed.

## Known limits (be aware)

- **Sign-in is a demo.** Email login accepts any password and the session lives in the browser. Do not treat a "logged-in" user as verified for anything sensitive. Real accounts need server-side auth (e.g. verify Firebase ID tokens with the Firebase Admin SDK).
- **The code runner is not a full sandbox.** Generated code runs as a normal process on the server, with network access. Run the API as an unprivileged user (never root), ideally in its own container or VM, and keep backups of `server/data/`.
- If you host the API on a different domain than the site, add it to `ALLOWED_ORIGINS` and to `connect-src` in the CSP (`deploy/nginx.conf`, `vercel.json`, `public/_headers`).
