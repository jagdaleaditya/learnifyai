import './env.js';
import express from 'express';
import { providers, chat } from './llm.js';
import { run, runnerFor, toolchains } from './runner.js';
import { generateCourse, regenerateSlide, fixCode, assistant } from './pipeline.js';
import * as kb from './knowledge.js';
import { build } from './exports.js';
import * as db from './database.js';
import {
  BadRequest, EMAIL_RE, codeRunEnabled, concurrencyLimit, errorHandler, httpsUrl, isProd, originGuard, rateLimit,
  remoteGate, requireAdmin, requireHttps, requireJson, safeFilename, securityHeaders, str,
} from './security.js';

const app = express();
app.disable('x-powered-by');
// Behind Nginx / a load balancer set TRUST_PROXY=1 (one hop) so req.ip and req.secure reflect the real client.
const trust = process.env.TRUST_PROXY;
if (trust) app.set('trust proxy', /^\d+$/.test(trust) ? Number(trust) : trust);

app.use(securityHeaders);
app.use(requireHttps);
app.use(originGuard);
app.use(remoteGate);
app.use('/api', rateLimit({ name: 'all', windowMs: 60_000, max: +process.env.RATE_LIMIT_PER_MIN || 120 }));
app.use(requireJson);
app.use(express.json({ limit: '4mb', strict: true }));

const heavy = [rateLimit({ name: 'heavy', windowMs: 60_000, max: +process.env.HEAVY_LIMIT_PER_MIN || 10 }), concurrencyLimit(+process.env.MAX_CONCURRENT_JOBS || 3)];
const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res)).catch(next);

const FORMATS = ['pptx', 'pdf', 'notes', 'quiz', 'cheat', 'report', 'code', 'exercises', 'package'];
const lang = v => { const s = str(v, { max: 40, name: 'language' }); return s; };
const code = v => str(v, { max: 100_000, name: 'code' });

app.get('/api/health', wrap(async (req, res) => {
  const out = { ok: true, providers: providers(), runners: toolchains(), knowledge: kb.stats() };
  if (req.query.probe) {
    try { const r = await chat({ messages: [{ role: 'user', content: 'Reply with the single word: ok' }], maxTokens: 8, timeoutMs: 20000 }); out.probe = { ok: true, provider: r.provider }; }
    catch (e) { out.probe = { ok: false, error: isProd ? 'Provider check failed.' : e.message.slice(0, 300) }; }
  }
  res.json(out);
}));

// ---------- Auth records ----------
app.post('/api/auth/record-login', rateLimit({ name: 'login', windowMs: 60_000, max: 10 }), wrap(async (req, res) => {
  const b = req.body ?? {};
  const email = str(b.email, { max: 254, name: 'email', required: true }).trim().toLowerCase();
  if (!EMAIL_RE.test(email)) throw new BadRequest('A valid email is required.');
  const result = db.recordLogin({
    email,
    name: str(b.name, { max: 120, name: 'name' }).trim(),
    avatar: b.avatar ? httpsUrl(b.avatar) : null,
    provider: ['google', 'email'].includes(b.provider) ? b.provider : 'email',
    role: str(b.role, { max: 60, name: 'role' }) || 'Trainer',
    institute: str(b.institute, { max: 120, name: 'institute' }),
    ip: req.ip ?? '',
    userAgent: String(req.headers['user-agent'] ?? '').slice(0, 300),
  });
  // Only echo back the caller's own public profile, never other users or the stored IP.
  const { lastIp, lastUserAgent, ...user } = result.user;
  res.json({ ok: true, user });
}));

// User list and login audit logs contain personal data: admin only.
app.get('/api/auth/users', requireAdmin, wrap(async (req, res) => {
  res.json({ users: db.getUsers(), stats: db.getAuthStats() });
}));
app.get('/api/auth/logs', requireAdmin, wrap(async (req, res) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 100, 1), 1000);
  res.json({ logs: db.getLoginLogs(limit) });
}));

// ---------- AI + code execution ----------
app.post('/api/run', codeRunEnabled, ...heavy, wrap(async (req, res) => {
  const { language, code: src } = req.body ?? {};
  const r = runnerFor(lang(language));
  if (!r) return res.json({ ok: false, unsupported: true, stderr: `No local runner for ${String(language).slice(0, 40)}`, stdout: '', exitCode: -1, ms: 0 });
  res.json(await run(r, code(src)));
}));

app.post('/api/fix', ...heavy, wrap(async (req, res) => {
  const b = req.body ?? {};
  res.json(await fixCode({ language: lang(b.language), code: code(b.code), expected: str(b.expected, { max: 20_000, name: 'expected' }), stdout: str(b.stdout, { max: 40_000, name: 'stdout' }), stderr: str(b.stderr, { max: 40_000, name: 'stderr' }) }));
}));

app.post('/api/slide/regenerate', ...heavy, wrap(async (req, res) => {
  const { slide, instruction, course } = req.body ?? {};
  if (!slide || typeof slide !== 'object' || !course || typeof course !== 'object') throw new BadRequest('slide and course are required.');
  res.json(await regenerateSlide({
    slide,
    instruction: str(instruction, { max: 2000, name: 'instruction' }),
    course: { title: str(course.title, { max: 200, name: 'course title' }), language: lang(course.language), level: str(course.level, { max: 40, name: 'level' }) },
  }));
}));

app.post('/api/chat', ...heavy, wrap(async (req, res) => {
  const { messages, context } = req.body ?? {};
  if (!Array.isArray(messages) || !messages.length) throw new BadRequest('messages are required.');
  // Clients may only send user/assistant turns: a "system" message from the browser could override the server's instructions.
  const clean = messages.slice(-20).filter(m => m && (m.role === 'user' || m.role === 'assistant')).map(m => ({ role: m.role, content: str(m.content, { max: 8000, name: 'message' }) }));
  if (!clean.some(m => m.role === 'user')) throw new BadRequest('A user message is required.');
  res.json(await assistant({ messages: clean, context: { page: str(context?.page, { max: 100, name: 'page' }), course: str(context?.course, { max: 200, name: 'course' }) } }));
}));

// Server-sent events so the UI can show real progress while the model writes and the sandbox runs.
app.post('/api/generate', ...heavy, (req, res, next) => {
  let p;
  try {
    const b = req.body ?? {};
    p = {
      topic: str(b.topic, { max: 200, name: 'topic', required: true }),
      level: str(b.level, { max: 40, name: 'level' }) || 'Beginner',
      language: lang(b.language) || 'Java',
      version: str(b.version, { max: 40, name: 'version' }),
      durationMin: Math.min(Math.max(Number(b.durationMin) || 60, 15), 480),
      objectives: (Array.isArray(b.objectives) ? b.objectives : []).slice(0, 20).map(o => str(o, { max: 300, name: 'objective' })),
      audience: str(b.audience, { max: 300, name: 'audience' }),
    };
  } catch (e) { return next(e); }

  res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-transform', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' });
  let closed = false;
  req.on('close', () => { closed = true; });
  const send = (event, data) => { if (!closed) res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`); };
  const ping = setInterval(() => { if (!closed) res.write(': keep-alive\n\n'); }, 15000);
  generateCourse(p, e => send('progress', e))
    .then(content => send('done', content))
    .catch(e => { console.error(e.message); send('error', { error: isProd ? 'Generation failed. Please try again.' : e.message }); })
    .finally(() => { clearInterval(ping); res.end(); });
});

app.post('/api/export/:format', rateLimit({ name: 'export', windowMs: 60_000, max: 20 }), concurrencyLimit(4), wrap(async (req, res) => {
  if (!FORMATS.includes(req.params.format)) throw new BadRequest('Unknown export format.');
  const { course, content, brand } = req.body ?? {};
  if (!content?.slides || !Array.isArray(content.slides)) throw new BadRequest('No generated content for this course.');
  if (!course || typeof course.title !== 'string') throw new BadRequest('Course title is required.');
  const f = await build(req.params.format, course, content, brand);
  res.set({ 'Content-Type': f.type, 'Content-Disposition': `attachment; filename="${safeFilename(f.name)}"`, 'Access-Control-Expose-Headers': 'Content-Disposition' }).send(f.data);
}));

// ---------- Knowledge base ----------
// The dataset export and ingestion change or reveal the shared knowledge base: admin only.
app.get('/api/dataset', requireAdmin, (req, res) => {
  const format = ['chat', 'raw', 'alpaca'].includes(req.query.format) ? req.query.format : 'chat';
  res.set({ 'Content-Type': 'application/x-ndjson', 'Content-Disposition': `attachment; filename="learnify-${format}.jsonl"` }).send(kb.dataset({ format, onlyVerified: req.query.verified === '1' }));
});
app.get('/api/knowledge/stats', (req, res) => res.json(kb.stats()));
app.post('/api/ingest', requireAdmin, rateLimit({ name: 'ingest', windowMs: 60_000, max: 10 }), wrap(async (req, res) => {
  const b = req.body ?? {};
  const title = str(b.title, { max: 200, name: 'title' }) || 'Pasted material';
  const language = lang(b.language);
  const text = str(b.text, { max: 500_000, name: 'text' });
  if (text.trim().length < 40) throw new BadRequest('Paste at least a few sentences or a code sample.');
  const chunks = text.split(/\n{2,}/).reduce((a, p) => { const l = a[a.length - 1]; if (l && l.length + p.length < 1400) a[a.length - 1] = l + '\n\n' + p; else a.push(p); return a; }, []);
  const n = kb.add(chunks.map((c, i) => ({ kind: 'corpus', language, topic: title, title: `${title} (${i + 1}/${chunks.length})`, prompt: `Explain or reproduce the following material from "${title}".`, completion: c, verified: false, source: 'ingest' })), 'corpus');
  res.json({ added: n, stats: kb.stats() });
}));

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found.' }));
app.use(errorHandler);

const port = +process.env.PORT || 8787;
// Bind to localhost by default; Nginx on the same machine forwards to it. Use HOST=0.0.0.0 only inside a container.
const host = process.env.HOST || '127.0.0.1';
const server = app.listen(port, host, () => {
  console.log(`LearnifyAI API on http://${host}:${port}${isProd ? ' (production)' : ''}`);
  console.log(`  providers: ${providers().join(', ') || 'NONE (add keys to server/.env)'}`);
  console.log(`  runners:   ${Object.entries(toolchains()).map(([k, v]) => `${k}:${v ? 'yes' : 'no'}`).join(' ')}`);
  console.log(`  knowledge: ${JSON.stringify(kb.stats())}`);
  if (process.env.ALLOW_REMOTE === '1' && !process.env.TRUST_PROXY) console.warn('  warning: ALLOW_REMOTE=1 without TRUST_PROXY. Put the API behind Nginx with HTTPS.');
  if (process.env.ALLOW_REMOTE === '1' && (process.env.ADMIN_TOKEN ?? '').length < 24) console.warn('  note: ADMIN_TOKEN not set (24+ chars). Admin routes are only reachable from this machine.');
});
server.headersTimeout = 65_000;
server.requestTimeout = 0; // generation streams for several minutes
const stop = () => server.close(() => process.exit(0));
process.on('SIGTERM', stop); process.on('SIGINT', stop);
