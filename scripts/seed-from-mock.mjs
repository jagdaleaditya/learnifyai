// Builds server/data/seed.jsonl from the verified sample course in src/lib/mock-data.ts.
import { build } from 'esbuild';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const out = path.join(os.tmpdir(), `mock-${Date.now()}.mjs`);
await build({ entryPoints: ['src/lib/mock-data.ts'], bundle: true, format: 'esm', outfile: out, logLevel: 'silent' });
const m = await import(pathToFileURL(out).href);
const base = { language: 'Java', topic: 'Java OOP Fundamentals', level: 'Beginner', verified: true, source: 'seed' };
const rows = [
  ...m.codeExamples.map(e => ({ ...base, kind: 'example', title: e.title, prompt: `Write a short runnable Java example for "Java OOP Fundamentals": ${e.title}. ${e.description}`, completion: `${e.code}\n\n// Output:\n// ${e.output.split('\n').join('\n// ')}` })),
  ...m.exercises.map(x => ({ ...base, kind: 'exercise', title: x.title, prompt: `Write a Java exercise with automated tests: ${x.title}. Include a reference solution and a naive solution the tests catch.`, completion: `${x.statement}\n\n// STARTER\n${x.starter}\n\n// TESTS\n${x.tests.map(t => t.name).join('\n')}\n\n// Reference: ${x.reference}. Naive: ${x.naive}` })),
  ...m.quiz.map(q => ({ ...base, kind: 'quiz', verified: false, title: q.q, prompt: 'Write a multiple-choice question with an explanation about Java object-oriented programming.', completion: JSON.stringify(q) })),
  ...m.javaSlides.filter(s => s.notes).map(s => ({ ...base, kind: 'slide', verified: s.status === 'passed', title: s.title, prompt: `Write the slide "${s.title}" with speaker notes for a Beginner Java session on OOP.`, completion: JSON.stringify({ title: s.title, bullets: s.bullets, notes: s.notes, code: s.code }) })),
  ...m.cheatSheet.map(c => ({ ...base, kind: 'cheatsheet', verified: false, title: c.title, prompt: `Write a cheat sheet section on "${c.title}" for Java.`, completion: c.items.map(([a, b]) => `${a}  // ${b}`).join('\n') })),
  ...m.commonErrors.map(e => ({ ...base, kind: 'troubleshooting', language: '', verified: false, title: e.error, prompt: `A snippet verification failed with "${e.error}". Explain the cause and the fix.`, completion: `Cause: ${e.cause}\nFix: ${e.fix}` })),
];
fs.mkdirSync('server/data', { recursive: true });
fs.writeFileSync('server/data/seed.jsonl', rows.map(r => JSON.stringify(r)).join('\n') + '\n');
fs.rmSync(out, { force: true });
console.log(`Wrote ${rows.length} seed records to server/data/seed.jsonl`);
