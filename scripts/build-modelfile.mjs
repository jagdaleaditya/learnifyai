// Builds an Ollama Modelfile that bakes the best verified examples in as few-shot messages:
//   node scripts/build-modelfile.mjs [base-model]  then  ollama create learnify -f server/data/Modelfile
// This tunes behaviour through prompting. It does not change model weights. For weight training use
// server/data/learnify-chat.jsonl with Unsloth / Axolotl / OpenAI fine-tuning (see README, "Training").
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'server');
process.chdir(dir);
const kb = await import('../server/knowledge.js');
const base = process.argv[2] ?? 'llama3.1:8b';
const rows = kb.dataset({ onlyVerified: true }).split('\n').filter(Boolean).map(l => JSON.parse(l).messages).slice(0, 24);
const q = s => `"""${s.replace(/"""/g, '\\"\\"\\"')}"""`;
let out = `FROM ${base}\nPARAMETER temperature 0.3\nPARAMETER num_ctx 8192\nSYSTEM ${q(rows[0]?.[0]?.content ?? 'You are LearnifyAI.')}\n`;
for (const [, u, a] of rows) out += `MESSAGE user ${q(u.content)}\nMESSAGE assistant ${q(a.content.slice(0, 1800))}\n`;
fs.writeFileSync('data/Modelfile', out);
fs.writeFileSync('data/learnify-chat.jsonl', kb.dataset({ onlyVerified: false }));
console.log(`Wrote server/data/Modelfile (${rows.length} few-shot pairs) and server/data/learnify-chat.jsonl`);
