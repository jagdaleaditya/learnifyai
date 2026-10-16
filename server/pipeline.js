// Course generation: LLM writes the material, the runner executes every snippet, failures are fed back (max 3 attempts).
import { chat, chatJSON } from './llm.js';
import { run, runnerFor, normalize, parseTests } from './runner.js';
import * as kb from './knowledge.js';

const SYSTEM = 'You are a senior curriculum author for programming trainers. You write accurate, runnable, classroom-ready material. Reply with ONLY a single valid JSON object, no prose, no markdown fences.';
const MAX_ATTEMPTS = 3;

const ENV_RULES = {
  java: 'Java 21. Single file, `public class Main` with `public static void main(String[] args)`. Nested static classes, records and interfaces are fine. No packages, no external libraries.',
  python: 'Python 3.12, standard library only, single file.',
  node: 'Node.js 20, ES modules, single file, built-ins only (use node:assert, not external test libraries).',
  ts: 'TypeScript run with Node type-stripping: erasable syntax only (no enums, no namespaces), single file, built-ins only.',
};
const ASSERT_RULES = {
  java: 'Self-checking program: static helper `check(String name, boolean ok, String msg)` prints `PASS: name` or `FAIL: name - msg`; `main` calls the code under test and finally `System.exit(failures > 0 ? 1 : 0)`.',
  python: 'Self-checking program: helper `check(name, ok, msg="")` prints `PASS: name` or `FAIL: name - msg`; at the end `sys.exit(1 if failures else 0)`.',
  node: 'Self-checking program: helper `check(name, ok, msg="")` prints `PASS: name` or `FAIL: name - msg`; at the end `process.exit(failures ? 1 : 0)`.',
  ts: 'Self-checking program: helper `check(name: string, ok: boolean, msg = "")` prints `PASS: name` or `FAIL: name - msg`; at the end `process.exit(failures ? 1 : 0)`.',
};

const slideCount = min => Math.max(8, Math.min(14, Math.round(min / 8) + 2));
const lines = s => String(s).split('\n').length;

function layoutDiagram(d) {
  if (!d?.nodes?.length) return undefined;
  const n = Math.min(d.nodes.length, 6);
  const nodes = d.nodes.slice(0, n).map((x, i) => {
    const label = typeof x === 'string' ? x : x.label;
    const rows = n > 3 ? 2 : 1, perRow = Math.ceil(n / rows), r = Math.floor(i / perRow), c = i % perRow, inRow = r === rows - 1 ? n - perRow * (rows - 1) : perRow;
    return { id: `n${i}`, label: String(label).slice(0, 28), x: Math.round(((c + 1) / (inRow + 1)) * 88 + 6), y: rows === 1 ? 50 : r === 0 ? 28 : 74 };
  });
  const edges = (d.edges ?? []).filter(e => Array.isArray(e) && e[0] < n && e[1] < n && e[0] !== e[1]).map(([a, b]) => [`n${a}`, `n${b}`]);
  return { nodes, edges };
}

/** Run a program, then (if it fails the check) ask the model to repair it, up to MAX_ATTEMPTS. check(result) returns an error string or null. */
async function verifyLoop({ runner, code, check, describe, emit, label, extra }) {
  const attempts = [];
  let current = code, expectedOverride;
  for (let n = 1; n <= MAX_ATTEMPTS; n++) {
    const res = await run(runner, current);
    const problem = check(res, expectedOverride);
    attempts.push({ n, ok: !problem, stdout: res.stdout.slice(0, 1500), stderr: res.stderr.slice(0, 1500), exitCode: res.exitCode, ms: res.ms, problem: problem ?? undefined });
    if (!problem) return { code: current, result: res, attempts, status: 'passed', expectedOverride };
    emit?.(`✗ ${label} failed on attempt ${n}: ${problem.split('\n')[0].slice(0, 120)}`);
    if (n === MAX_ATTEMPTS) return { code: current, result: res, attempts, status: 'failed', expectedOverride };
    emit?.(`↻ Auto-fix attempt ${n + 1} of ${MAX_ATTEMPTS} for ${label}`);
    try {
      const { data } = await chatJSON({
        temperature: 0.2,
        messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: `This ${ENV_RULES[runner]} program failed verification.\n\nProblem: ${problem}\n${extra ?? ''}\n\nProgram:\n${current}\n\nstdout:\n${res.stdout.slice(0, 1500)}\n\nstderr:\n${res.stderr.slice(0, 1500)}\n\nFix the PROGRAM so it satisfies the requirement. Keep it short and classroom-friendly. Return JSON: {"code": "<full corrected program>"${describe ? `, "expected_output": "<only if the earlier expected output was wrong and the code is right>"` : ''}}` }],
      });
      if (!data.code) break;
      current = data.code;
      if (data.expected_output) expectedOverride = data.expected_output;
    } catch (e) { emit?.(`Fix request failed: ${e.message.slice(0, 120)}`); break; }
  }
  return { code: current, result: null, attempts, status: 'failed' };
}

async function pool(items, limit, fn) {
  const out = new Array(items.length); let i = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => { while (i < items.length) { const k = i++; out[k] = await fn(items[k], k); } }));
  return out;
}

export async function generateCourse(p, emit = () => {}) {
  const { topic, level = 'Beginner', language = 'Java', version = '', durationMin = 60, objectives = [], audience = '' } = p;
  const runner = runnerFor(language);
  const N = slideCount(durationMin), M = durationMin >= 90 ? 4 : 3, K = durationMin >= 90 ? 3 : 2;
  const lang = runner ?? 'java';
  const rules = runner ? ENV_RULES[runner] : `${language} (no local runner: write idiomatic snippets, they will be marked unverified)`;
  let provider = '';

  emit({ step: 0, pct: 5, log: `Retrieving verified reference material for “${topic}”` });
  const ctx = kb.retrieve(`${topic} ${language} ${objectives.join(' ')}`, { language, k: 4 });
  const grounding = ctx.length ? `\n\nVerified reference material from earlier courses (match its style and rigor, do not copy it):\n${kb.formatContext(ctx)}` : '';
  const brief = `Course: "${topic}". Language/runtime: ${language} ${version}. Level: ${level}. Session: ${durationMin} minutes. Audience: ${audience || 'learners new to this topic'}. Learning objectives: ${objectives.join('; ') || 'derive sensible ones'}.`;

  emit({ step: 0, pct: 10, log: `Outline: ${N} slides, ${M} runnable examples, ${K} exercises, 6 quiz questions` });
  const [A, B, C] = await Promise.all([
    chatJSON({ maxTokens: 7000, messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: `${brief}${grounding}

Write the slide deck, quiz and cheat sheet. JSON shape:
{"subtitle": str,
 "slides": [{"title": str, "layout": "title"|"bullets"|"code"|"diagram"|"two-col"|"summary", "bullets": [str], "notes": str, "example_ref": int|null, "diagram": {"nodes": [str], "edges": [[int,int]]}|null}],
 "quiz": [{"q": str, "options": [str,str,str,str], "answer": 0-3, "explanation": str}],
 "cheat_sheet": [{"title": str, "items": [[snippet, description]]}]}
Rules: exactly ${N} slides; first is layout "title" (bullets[0] = one-line subtitle); last is "summary". Max 5 bullets of at most 12 words. Speaker notes 60-110 words with a question to ask the room. Use layout "code" for slides that show an example and set example_ref to an index 0..${M - 1} (each example used at most once, use at least ${M - 1}). Use "diagram" layout (with 3-6 nodes) for a structure or flow. "two-col": bullets = [leftHeading, ...leftItems, rightHeading, ...rightItems] with equal counts. Exactly 6 quiz questions, 6 cheat-sheet sections of 3 items. Everything must be technically correct for ${language} ${version}.` }] }),
    chatJSON({ maxTokens: 6000, messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: `${brief}${grounding}

Write ${M} short runnable code examples that teach the topic in order. Environment: ${rules}
JSON shape: {"examples": [{"title": str, "description": str, "code": str, "expected_output": str}]}
Rules: each program is complete, deterministic, prints its results to stdout, reads no input, uses no network, no randomness, no clock. At most 18 lines each. expected_output is EXACTLY what stdout prints.` }] }),
    chatJSON({ maxTokens: 9000, messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: `${brief}${grounding}

Write ${K} practice exercises with automated tests. Environment: ${rules}
${runner ? ASSERT_RULES[runner] : 'Print PASS:/FAIL: lines per test.'}
JSON shape: {"exercises": [{"title": str, "difficulty": "Easy"|"Medium"|"Hard", "statement": str, "starter_code": str, "solution_code": str, "naive_code": str}]}
Rules: each *_code field is a COMPLETE program that contains the implementation AND the same 4-6 tests. solution_code passes every test. naive_code is the plausible-but-wrong version a beginner would write (it must still compile/run and fail at least one test). starter_code has the same tests but the function body is a TODO stub so the tests fail. Test names are short and readable.` }] }),
  ]);
  provider = A.provider;
  emit({ step: 1, pct: 30, log: `Slides, notes, quiz and cheat sheet written by ${provider}` });

  const rawEx = (B.data.examples ?? []).slice(0, M);
  const rawXs = (C.data.exercises ?? []).slice(0, K);
  if (!A.data.slides?.length || !rawEx.length) throw new Error('The model returned an incomplete course. Try again.');
  emit({ step: 2, pct: 45, log: `Code generated · ${rawEx.length} examples, ${rawXs.length} exercises` });

  // ---- Verification ----
  emit({ step: 3, pct: 50, log: runner ? `Running every snippet on the ${language} toolchain (no network, ${MAX_ATTEMPTS} attempts)` : `No local runner for ${language}: snippets are marked unverified` });
  const snippets = [];
  const examples = await pool(rawEx, 3, async (ex, i) => {
    const base = { id: `e${i + 1}`, title: ex.title, description: ex.description, expected: normalize(ex.expected_output) };
    if (!runner) return { ...base, code: ex.code, output: '', ms: 0, status: 'skipped', attempts: [] };
    const label = `Example ${i + 1}`;
    const v = await verifyLoop({
      runner, code: ex.code, emit: l => emit({ log: l }), label, describe: true,
      extra: `Expected stdout (what the slide promises):\n${ex.expected_output}`,
      check: (res, over) => {
        if (!res.ok) return res.timedOut ? 'Timed out' : `Exited with code ${res.exitCode}: ${res.stderr.split('\n')[0]}`;
        const want = normalize(over ?? ex.expected_output);
        return normalize(res.stdout) === want ? null : `Output mismatch.\nExpected:\n${want}\nActual:\n${normalize(res.stdout)}`;
      },
    });
    if (v.status === 'passed') emit({ log: `✓ ${label} passed${v.attempts.length > 1 ? ` on attempt ${v.attempts.length}` : ''} · ${v.result.ms} ms` });
    return { ...base, expected: normalize(v.expectedOverride ?? ex.expected_output), code: v.code, output: v.result ? normalize(v.result.stdout) : '', ms: v.result?.ms ?? 0, status: v.status, attempts: v.attempts };
  });
  emit({ step: 3, pct: 70 });

  const exercises = await pool(rawXs, 2, async (x, i) => {
    const base = { id: `x${i + 1}`, title: x.title, difficulty: x.difficulty ?? 'Medium', statement: x.statement, starter: x.starter_code, solution: x.solution_code, naive: x.naive_code };
    if (!runner) return { ...base, status: 'skipped', attempts: [], tests: [], reference: 'not run', naiveResult: 'not run' };
    const label = `Exercise ${i + 1}`;
    const allPass = res => { const t = parseTests(res.stdout); if (!res.ok) return `Exit code ${res.exitCode}. ${res.stderr.split('\n')[0]}`; if (t.length < 3) return 'Fewer than 3 PASS lines were printed'; const f = t.filter(y => !y.pass); return f.length ? `Failing tests: ${f.map(y => `${y.name} (${y.error ?? ''})`).join('; ')}` : null; };
    const sol = await verifyLoop({ runner, code: x.solution_code, emit: l => emit({ log: l }), label: `${label} solution`, check: allPass, extra: 'The reference solution must make EVERY test print PASS and exit 0.' });
    const naive = await verifyLoop({
      runner, code: x.naive_code, emit: l => emit({ log: l }), label: `${label} naive`,
      check: res => { const t = parseTests(res.stdout); if (!t.length) return `The naive program did not run its tests (${res.stderr.split('\n')[0] || 'no PASS/FAIL output'})`; return t.some(y => !y.pass) ? null : 'The naive solution passes every test, so the tests are too weak. Make the naive version subtly wrong or add a test it fails.'; },
      extra: 'The naive version must run all tests and FAIL at least one (print FAIL: lines).',
    });
    const ok = sol.status === 'passed' && naive.status === 'passed';
    const st = parseTests(sol.result?.stdout ?? ''), nt = parseTests(naive.result?.stdout ?? '');
    if (ok) emit({ log: `✓ ${label}: reference ${st.filter(t => t.pass).length}/${st.length} pass, naive ${nt.filter(t => t.pass).length}/${nt.length} pass (tests catch it)` });
    return { ...base, solution: sol.code, naive: naive.code, status: ok ? 'passed' : 'failed', attempts: [...sol.attempts.map(a => ({ ...a, part: 'solution' })), ...naive.attempts.map(a => ({ ...a, part: 'naive' }))],
      tests: st.map(t => ({ ...t, ms: 1 })), reference: `Passes ${st.filter(t => t.pass).length}/${st.length}`, naiveResult: `Fails ${nt.filter(t => !t.pass).length}/${nt.length}`, ms: sol.result?.ms ?? 0 };
  });
  emit({ step: 3, pct: 90 });

  // ---- Assemble ----
  const slides = (A.data.slides ?? []).slice(0, 16).map((s, i) => {
    const ex = s.layout === 'code' && Number.isInteger(s.example_ref) ? examples[s.example_ref] : undefined;
    const layout = ['title', 'bullets', 'code', 'diagram', 'two-col', 'summary'].includes(s.layout) ? s.layout : 'bullets';
    const useCode = ex && lines(ex.code) <= 18;
    const diagram = layout === 'diagram' ? layoutDiagram(s.diagram) : undefined;
    const final = layout === 'code' && !useCode ? 'bullets' : layout === 'diagram' && !diagram ? 'bullets' : layout;
    return { id: `s${i + 1}`, title: String(s.title ?? `Slide ${i + 1}`), layout: final, bullets: (s.bullets ?? []).map(String).slice(0, 8), notes: String(s.notes ?? ''), code: final === 'code' ? ex.code : undefined, lang: lang === 'node' ? 'javascript' : lang, diagram: final === 'diagram' ? diagram : undefined,
      status: final === 'code' ? (ex.status === 'passed' ? 'passed' : ex.status === 'failed' ? 'failed' : 'none') : 'none', exampleId: final === 'code' ? ex.id : undefined };
  });
  if (slides[0]) slides[0].layout = 'title';

  examples.forEach(e => snippets.push({ id: e.id, name: e.title, location: `Example ${e.id.slice(1)}`, kind: 'example', code: e.code, expected: e.expected, actual: e.output, status: e.status, attempts: e.attempts, ms: e.ms }));
  exercises.forEach(x => snippets.push({ id: x.id, name: `Exercise ${x.id.slice(1)} · ${x.title}`, location: `Exercise ${x.id.slice(1)}`, kind: 'exercise', code: x.solution, expected: 'Reference passes every test; naive solution fails at least one', actual: `${x.reference} · naive ${x.naiveResult}`, status: x.status, attempts: x.attempts, ms: x.ms ?? 0 }));

  const content = {
    live: true, provider, runnerLang: runner, language, version, generatedAt: new Date().toISOString(),
    subtitle: A.data.subtitle ?? '', slides, examples, exercises,
    quiz: (A.data.quiz ?? []).slice(0, 8).filter(q => Array.isArray(q.options) && Number.isInteger(q.answer)),
    cheat: (A.data.cheat_sheet ?? []).slice(0, 8),
    snippets,
  };
  const verifiable = snippets.filter(s => s.status !== 'skipped');
  const passed = verifiable.filter(s => s.status === 'passed').length;
  content.summary = { total: snippets.length, verifiable: verifiable.length, passed, failed: verifiable.length - passed, autoFixed: verifiable.filter(s => s.status === 'passed' && s.attempts.length > 1).length, skipped: snippets.length - verifiable.length };

  // ---- Learn from it: only verified material is kept ----
  const common = { language, topic, level, verified: true, source: 'generated' };
  const learned = [
    ...examples.filter(e => e.status === 'passed').map(e => ({ ...common, kind: 'example', title: e.title, prompt: `Write a short runnable ${language} example for "${topic}" (${level}): ${e.title}. ${e.description}`, completion: `${e.code}\n\n// Output:\n// ${e.output.split('\n').join('\n// ')}` })),
    ...exercises.filter(x => x.status === 'passed').map(x => ({ ...common, kind: 'exercise', title: x.title, prompt: `Write a ${language} exercise with automated tests for "${topic}": ${x.title}. Include the reference solution and a plausible naive solution that the tests catch.`, completion: `${x.statement}\n\n// REFERENCE (passes all tests)\n${x.solution}\n\n// NAIVE (fails a test)\n${x.naive}` })),
    ...content.quiz.map(q => ({ ...common, kind: 'quiz', title: q.q, verified: false, prompt: `Write a multiple-choice question with an explanation about ${topic} (${language}, ${level}).`, completion: JSON.stringify(q) })),
    ...slides.filter(s => s.notes && s.layout !== 'title').map(s => ({ ...common, kind: 'slide', title: s.title, verified: s.status === 'passed', prompt: `Write the slide "${s.title}" with speaker notes for a ${level} ${language} session on ${topic}.`, completion: JSON.stringify({ title: s.title, bullets: s.bullets, notes: s.notes }) })),
  ];
  content.learned = kb.add(learned);
  emit({ step: 4, pct: 97, log: `Saved ${content.learned} verified items to the knowledge base for future generations` });
  return content;
}

export async function regenerateSlide({ slide, instruction, course }) {
  const runner = runnerFor(course.language);
  const { data, provider } = await chatJSON({
    temperature: 0.5,
    messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: `Course "${course.title}" (${course.language}, ${course.level}). Rewrite ONLY this slide.\nTrainer's instruction: ${instruction || 'Improve clarity and keep it concise.'}\n\nCurrent slide:\n${JSON.stringify({ title: slide.title, bullets: slide.bullets, notes: slide.notes, code: slide.code })}\n\nReturn JSON: {"title": str, "bullets": [str] (max 5, max 12 words), "notes": str${slide.code ? ', "code": str (complete runnable program only if the instruction needs code to change, otherwise return the same code)' : ''}}` }],
  });
  const out = { ...slide, title: String(data.title ?? slide.title), bullets: (data.bullets ?? slide.bullets).map(String).slice(0, 8), notes: String(data.notes ?? slide.notes) };
  let verification = null;
  if (slide.code) {
    out.code = data.code ?? slide.code;
    if (runner && out.code !== slide.code) {
      const v = await verifyLoop({ runner, code: out.code, label: 'slide code', check: res => (res.ok ? null : `Exited with code ${res.exitCode}: ${res.stderr.split('\n')[0]}`) });
      out.code = v.code; out.status = v.status === 'passed' ? 'passed' : 'failed';
      verification = { status: v.status, attempts: v.attempts.length, ms: v.result?.ms };
    }
  }
  return { slide: out, verification, provider };
}

export async function fixCode({ language, code, expected, stdout, stderr }) {
  const runner = runnerFor(language) ?? 'java';
  const { data } = await chatJSON({ temperature: 0.2, messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: `This ${ENV_RULES[runner]} program failed verification.\n${expected ? `Expected output:\n${expected}\n` : ''}\nProgram:\n${code}\n\nstdout:\n${stdout ?? ''}\n\nstderr:\n${stderr ?? ''}\n\nReturn JSON: {"code": "<full corrected program>", "explanation": "<one sentence on what was wrong>"}` }] });
  return { code: data.code, explanation: data.explanation };
}

export async function assistant({ messages, context }) {
  const last = [...messages].reverse().find(m => m.role === 'user')?.content ?? '';
  const rows = kb.retrieve(last, { k: 4 });
  const sys = `You are LearnifyAI's assistant for trainers. Be concise and concrete; use short code blocks when helpful. The trainer is currently on: ${context?.page ?? 'the dashboard'}${context?.course ? ` (course: ${context.course})` : ''}.${rows.length ? `\n\nVerified reference material:\n${kb.formatContext(rows)}` : ''}`;
  const { text, provider } = await chat({ temperature: 0.4, maxTokens: 1500, messages: [{ role: 'system', content: sys }, ...messages.slice(-10)] });
  return { reply: text, provider, sources: rows.slice(0, 3).map(r => r.title) };
}
