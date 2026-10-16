// Verified-knowledge store. Every course that passes verification is saved here and retrieved as grounding for later
// generations (retrieval-augmented learning), and exported as a fine-tuning dataset. Files are JSONL, one record per line.
import fs from 'node:fs';
import path from 'node:path';
import { DATA_DIR } from './env.js';

fs.mkdirSync(DATA_DIR, { recursive: true });
const FILES = { seed: path.join(DATA_DIR, 'seed.jsonl'), verified: path.join(DATA_DIR, 'verified.jsonl'), corpus: path.join(DATA_DIR, 'corpus.jsonl') };

const readJSONL = f => (fs.existsSync(f) ? fs.readFileSync(f, 'utf8').split('\n').filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean) : []);
let cache = null;
const all = () => (cache ??= [...readJSONL(FILES.seed), ...readJSONL(FILES.corpus), ...readJSONL(FILES.verified)]);

const tok = s => String(s).toLowerCase().match(/[a-z][a-z0-9_]{2,}/g) ?? [];

/** record: { kind, language, topic, level?, title, prompt, completion, verified, source } */
export function add(records, file = 'verified') {
  if (!records.length) return 0;
  fs.appendFileSync(FILES[file], records.map(r => JSON.stringify({ ...r, at: new Date().toISOString() })).join('\n') + '\n');
  cache = null;
  return records.length;
}

export function stats() {
  const rows = all();
  const by = {}; rows.forEach(r => { by[r.kind] = (by[r.kind] ?? 0) + 1; });
  return { total: rows.length, seed: readJSONL(FILES.seed).length, corpus: readJSONL(FILES.corpus).length, verified: readJSONL(FILES.verified).length, byKind: by };
}

/** TF-IDF-style retrieval over title + prompt + completion. Prefers the same language and verified records. */
export function retrieve(query, { language, kinds, k = 4 } = {}) {
  const rows = all().filter(r => (!kinds || kinds.includes(r.kind)) && (!language || !r.language || r.language.toLowerCase() === String(language).toLowerCase()));
  if (!rows.length) return [];
  const q = new Set(tok(query));
  const df = new Map();
  const docs = rows.map(r => { const t = tok(`${r.title} ${r.topic} ${r.prompt} ${r.completion}`); new Set(t).forEach(w => df.set(w, (df.get(w) ?? 0) + 1)); return t; });
  const N = rows.length;
  return rows.map((r, i) => {
    const tf = new Map(); docs[i].forEach(w => tf.set(w, (tf.get(w) ?? 0) + 1));
    let score = 0; q.forEach(w => { if (tf.has(w)) score += (1 + Math.log(tf.get(w))) * Math.log(1 + N / (df.get(w) ?? 1)); });
    return { r, score: score / Math.sqrt(docs[i].length + 20) * (r.verified ? 1.25 : 1) };
  }).filter(x => x.score > 0).sort((a, b) => b.score - a.score).slice(0, k).map(x => x.r);
}

export const formatContext = rows => rows.map((r, i) => `[#${i + 1} ${r.kind}${r.verified ? ' · verified' : ''}] ${r.title}\n${String(r.completion).slice(0, 900)}`).join('\n\n');

/** Chat-format fine-tuning set (OpenAI / Unsloth / Axolotl compatible) from verified + seed + corpus records. */
export function dataset({ format = 'chat', onlyVerified = false } = {}) {
  const rows = all().filter(r => (!onlyVerified || r.verified) && r.prompt && r.completion);
  if (format === 'raw') return rows.map(r => JSON.stringify(r)).join('\n');
  const system = 'You are LearnifyAI, a trainer assistant. Produce accurate, runnable, classroom-ready course material.';
  return rows.map(r => JSON.stringify({ messages: [{ role: 'system', content: system }, { role: 'user', content: r.prompt }, { role: 'assistant', content: r.completion }] })).join('\n');
}
