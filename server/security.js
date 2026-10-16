// Security middleware for the LearnifyAI API: headers, HTTPS enforcement, origin checks,
// rate limiting, admin-only routes and input validation. No external dependencies.
import crypto from 'node:crypto';

const env = (k, d = '') => (process.env[k] ?? d).trim();
export const isProd = env('NODE_ENV') === 'production';

/** Allowed browser origins, e.g. "https://learnify.example.com,https://www.learnify.example.com". */
const allowedOrigins = () => env('ALLOWED_ORIGINS').split(',').map(s => s.trim().replace(/\/$/, '')).filter(Boolean);

const isLoopback = ip => /^(::1|127\.|::ffff:127\.)/.test(ip ?? '');

/** Hardening headers on every API response. The static site gets its headers from Nginx / the host config. */
export function securityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()');
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
  if (req.secure) res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  if (!res.getHeader('Cache-Control')) res.setHeader('Cache-Control', 'no-store');
  next();
}

/** With FORCE_HTTPS=1, plain-HTTP requests that reached the API (via a proxy) are refused. */
export function requireHttps(req, res, next) {
  if (env('FORCE_HTTPS') !== '1' || req.secure || isLoopback(req.ip) && !req.headers['x-forwarded-proto']) return next();
  if (req.method === 'GET' || req.method === 'HEAD') return res.redirect(308, `https://${req.headers.host}${req.originalUrl}`);
  return res.status(403).json({ error: 'HTTPS is required.' });
}

/**
 * Cross-origin protection. Same-origin requests always pass; cross-origin browser requests pass only
 * when their Origin is listed in ALLOWED_ORIGINS (CORS headers are sent for those). Blocks CSRF-style
 * POSTs from other websites.
 */
export function originGuard(req, res, next) {
  const origin = req.headers.origin;
  if (!origin) return next(); // non-browser client or same-origin GET
  const host = req.headers['x-forwarded-host'] ?? req.headers.host;
  let sameOrigin = false;
  try { sameOrigin = new URL(origin).host === host; } catch { /* malformed */ }
  const listed = allowedOrigins().includes(origin.replace(/\/$/, ''));
  if (listed) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    res.setHeader('Access-Control-Max-Age', '600');
    if (req.method === 'OPTIONS') return res.status(204).end();
  }
  if (!sameOrigin && !listed) return res.status(403).json({ error: 'Origin not allowed.' });
  next();
}

/** Only JSON bodies are accepted on POST (blocks form-based CSRF and odd content types). */
export function requireJson(req, res, next) {
  if (req.method !== 'POST') return next();
  if (!req.is('application/json')) return res.status(415).json({ error: 'Content-Type must be application/json.' });
  next();
}

/** Simple fixed-window in-memory rate limiter, keyed by client IP. */
export function rateLimit({ windowMs = 60_000, max = 120, name = 'default' } = {}) {
  const hits = new Map();
  setInterval(() => { const now = Date.now(); for (const [k, v] of hits) if (v.reset < now) hits.delete(k); }, windowMs).unref();
  return (req, res, next) => {
    const key = `${name}:${req.ip}`;
    const now = Date.now();
    let h = hits.get(key);
    if (!h || h.reset < now) { h = { count: 0, reset: now + windowMs }; hits.set(key, h); }
    h.count++;
    res.setHeader('RateLimit-Limit', String(max));
    res.setHeader('RateLimit-Remaining', String(Math.max(0, max - h.count)));
    if (h.count > max) {
      res.setHeader('Retry-After', String(Math.ceil((h.reset - now) / 1000)));
      return res.status(429).json({ error: 'Too many requests. Please wait a moment and try again.' });
    }
    next();
  };
}

/** Caps how many expensive jobs (LLM + code execution) run at once across all users. */
export function concurrencyLimit(max = 3) {
  let active = 0;
  return (req, res, next) => {
    if (active >= max) return res.status(503).json({ error: 'The server is busy. Try again in a minute.' });
    active++;
    let released = false;
    const release = () => { if (!released) { released = true; active--; } };
    res.on('finish', release); res.on('close', release);
    next();
  };
}

/**
 * The original "local only" gate, now proxy-aware: req.ip is the real client IP when TRUST_PROXY is set,
 * so requests forwarded by Nginx are no longer mistaken for local ones.
 */
export function remoteGate(req, res, next) {
  if (env('ALLOW_REMOTE') === '1' || isLoopback(req.ip)) return next();
  res.status(403).json({ error: 'Local access only (set ALLOW_REMOTE=1 to change).' });
}

/** Admin-only routes: local requests pass; remote ones need "Authorization: Bearer <ADMIN_TOKEN>". */
export function requireAdmin(req, res, next) {
  if (isLoopback(req.ip) && !req.headers['x-forwarded-for']) return next();
  const token = env('ADMIN_TOKEN');
  const given = (req.headers.authorization ?? '').replace(/^Bearer\s+/i, '');
  if (token.length >= 24 && given.length === token.length && crypto.timingSafeEqual(Buffer.from(given), Buffer.from(token))) return next();
  res.status(401).json({ error: 'Admin access required.' });
}

/** Remote code execution via /api/run can be switched off entirely with ENABLE_CODE_RUN=0. */
export function codeRunEnabled(req, res, next) {
  if (env('ENABLE_CODE_RUN', '1') === '0') return res.status(403).json({ error: 'Code execution is disabled on this server.' });
  next();
}

// ---------- validation helpers ----------
export class BadRequest extends Error { constructor(m) { super(m); this.status = 400; } }
export const str = (v, { max = 2000, name = 'value', required = false } = {}) => {
  if (v === undefined || v === null || v === '') { if (required) throw new BadRequest(`${name} is required.`); return ''; }
  if (typeof v !== 'string') throw new BadRequest(`${name} must be text.`);
  if (v.length > max) throw new BadRequest(`${name} is too long (max ${max} characters).`);
  return v;
};
export const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]{1,64}@[A-Za-z0-9.-]{1,190}\.[A-Za-z]{2,24}$/;
export const httpsUrl = v => { try { const u = new URL(String(v)); return u.protocol === 'https:' && String(v).length <= 1000 ? u.toString() : null; } catch { return null; } };
/** Safe value for a Content-Disposition filename (no quotes, slashes or control characters). */
export const safeFilename = n => String(n ?? 'export').replace(/[^\w.\- ]+/g, '_').replace(/\s+/g, '-').slice(0, 120) || 'export';

/** Final error handler: never leaks stack traces; hides internal messages in production. */
export function errorHandler(err, req, res, _next) {
  const status = err.status ?? err.statusCode ?? 500;
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Request is too large.' });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Malformed JSON.' });
  if (status >= 500) console.error(`[${req.method} ${req.path}]`, err.message);
  res.status(status).json({ error: status < 500 || !isProd ? err.message : 'Something went wrong on the server.' });
}
