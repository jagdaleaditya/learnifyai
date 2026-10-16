// Add your own material to the knowledge base: node scripts/ingest.mjs <file-or-folder> [language]
// Supports .md .txt .java .py .js .ts .json .jsonl (jsonl lines may be {title,prompt,completion}).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'server');
process.chdir(root);
const kb = await import('../server/knowledge.js');
const [target, language = ''] = process.argv.slice(2);
if (!target) { console.error('Usage: node scripts/ingest.mjs <file-or-folder> [language]'); process.exit(1); }
const files = fs.statSync(path.resolve(process.env.INIT_CWD ?? '.', target)).isDirectory()
  ? fs.readdirSync(path.resolve(process.env.INIT_CWD ?? '.', target), { recursive: true }).map(f => path.join(path.resolve(process.env.INIT_CWD ?? '.', target), f))
  : [path.resolve(process.env.INIT_CWD ?? '.', target)];
let n = 0;
for (const f of files) {
  if (!/\.(md|txt|java|py|js|mjs|ts|json|jsonl)$/i.test(f) || fs.statSync(f).isDirectory()) continue;
  const text = fs.readFileSync(f, 'utf8'), title = path.basename(f);
  if (f.endsWith('.jsonl')) { const rows = text.split('\n').filter(Boolean).map(l => { try { const r = JSON.parse(l); return { kind: 'corpus', language, topic: title, title: r.title ?? title, prompt: r.prompt ?? `Reproduce: ${title}`, completion: r.completion ?? r.text ?? JSON.stringify(r), verified: !!r.verified, source: 'ingest' }; } catch { return null; } }).filter(Boolean); n += kb.add(rows, 'corpus'); continue; }
  const chunks = text.split(/\n{2,}/).reduce((a, p) => { const l = a[a.length - 1]; if (l && l.length + p.length < 1400) a[a.length - 1] = l + '\n\n' + p; else a.push(p); return a; }, []);
  n += kb.add(chunks.map((c, i) => ({ kind: 'corpus', language, topic: title, title: `${title} (${i + 1}/${chunks.length})`, prompt: `Explain or reproduce the following material from "${title}".`, completion: c, verified: false, source: 'ingest' })), 'corpus');
}
console.log(`Ingested ${n} chunks.`, kb.stats());
