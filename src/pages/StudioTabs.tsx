import * as React from 'react';
import { CheckCircle2, Download, Eye, ImageIcon, Lightbulb, Loader2, Pencil, Play, RefreshCw, ShieldCheck, Sparkles, Check, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/controls';
import { Tip } from '@/components/ui/tooltip';
import { CodeBlock, CodeEditor, Terminal } from '@/components/shared/code';
import { DiagramView } from '@/components/shared/slide';
import { EmptyState } from '@/components/shared/common';
import { diagrams as seedDiagrams, type Slide } from '@/lib/mock-data';
import { api, parseTests, runtimeLabel, type CourseContent, type TestResult } from '@/lib/api';
import { cn, sleep, timeAgo } from '@/lib/utils';


const same = (a: string, b: string) => a.replace(/\r/g, '').split('\n').map(l => l.trimEnd()).join('\n').trim() === b.replace(/\r/g, '').split('\n').map(l => l.trimEnd()).join('\n').trim();
const langOf = (c: CourseContent) => (c.runnerLang === 'node' ? 'javascript' : c.runnerLang === 'ts' ? 'tsx' : c.runnerLang === 'python' ? 'python' : 'java');
const fileOf = (c: CourseContent) => ({ java: 'Main.java', python: 'main.py', node: 'main.mjs', ts: 'main.ts' }[c.runnerLang ?? ''] ?? 'snippet');

/* ---------------- Code examples ---------------- */

export function CodeExamples({ content, online }: { content: CourseContent; online: boolean }) {
  const live = content.live && online;
  const [codes, setCodes] = React.useState<Record<string, string>>(() => Object.fromEntries(content.examples.map(e => [e.id, e.code])));
  const [state, setState] = React.useState<Record<string, { running: boolean; out?: string; err?: string; ms?: number; ok?: boolean; fixing?: boolean; note?: string }>>({});

  const run = async (e: CourseContent['examples'][number]) => {
    setState(s => ({ ...s, [e.id]: { running: true } }));
    if (!live) { await sleep(900 + Math.random() * 400); setState(s => ({ ...s, [e.id]: { running: false, out: e.output, ms: e.ms, ok: true } })); return; }
    try {
      const r = await api.run(content.language, codes[e.id]);
      setState(s => ({ ...s, [e.id]: { running: false, out: r.stdout, err: r.stderr, ms: r.ms, ok: r.ok && same(r.stdout, e.expected) } }));
    } catch (err) { setState(s => ({ ...s, [e.id]: { running: false, err: err instanceof Error ? err.message : 'Run failed', ok: false } })); }
  };
  const fix = async (e: CourseContent['examples'][number]) => {
    const st = state[e.id];
    setState(s => ({ ...s, [e.id]: { ...st, fixing: true } }));
    try {
      const r = await api.fix({ language: content.language, code: codes[e.id], expected: e.expected, stdout: st?.out, stderr: st?.err });
      setCodes(c => ({ ...c, [e.id]: r.code }));
      setState(s => ({ ...s, [e.id]: { running: false, note: r.explanation } }));
      toast.success('Fix applied', { description: r.explanation ?? 'Run it again to check.' });
    } catch (err) { toast.error('Auto-fix failed', { description: err instanceof Error ? err.message : undefined }); setState(s => ({ ...s, [e.id]: { ...st, fixing: false } })); }
  };

  return (
    <div className="space-y-5">
      {content.examples.map((e, i) => {
        const st = state[e.id];
        const verified = e.status === 'passed';
        return (
          <Card key={e.id} className="overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
              <div><div className="flex items-center gap-2 font-semibold">Example {i + 1}: {e.title} {verified ? <Badge variant="success"><ShieldCheck /> Verified{e.attempts.length > 1 ? ` · attempt ${e.attempts.length}` : ''}</Badge> : <Badge variant={e.status === 'failed' ? 'danger' : 'slate'}>{e.status === 'failed' ? 'Failed verification' : 'Not run here'}</Badge>}</div><div className="text-sm text-muted-foreground">{e.description}</div></div>
              <div className="flex gap-2">
                {live && st && st.ok === false && !st.running && <Button variant="outline" size="sm" onClick={() => fix(e)} loading={st.fixing}>{!st.fixing && <Sparkles />} Fix with AI</Button>}
                <Button variant="gradient" size="sm" onClick={() => run(e)} loading={st?.running} disabled={live && !content.runnerLang}>{!st?.running && <Play />} Run</Button>
              </div>
            </div>
            <div className="grid gap-0 lg:grid-cols-[1.4fr_1fr]">
              {live ? <CodeEditor value={codes[e.id]} onChange={v => setCodes(c => ({ ...c, [e.id]: v }))} lang={langOf(content)} minRows={6} className="rounded-none border-0" /> : <CodeBlock code={e.code} title="Main.java" className="rounded-none border-0" />}
              <Terminal title={st?.out !== undefined ? `output · ${st.ms ?? 0} ms · ${st.ok ? 'matches expected' : 'check output'}` : 'output'} className="min-h-[180px] rounded-none border-0 border-t lg:border-l lg:border-t-0"
                lines={st?.running ? [{ text: `$ run ${fileOf(content)}`, tone: 'cmd' }, { text: 'running…', tone: 'dim' }]
                  : st?.out !== undefined ? [{ text: `$ run ${fileOf(content)}`, tone: 'cmd' }, ...st.out.split('\n').map(t => ({ text: t })), ...(st.err ? st.err.split('\n').map(t => ({ text: t, tone: 'err' as const })) : []),
                    st.ok ? { text: `✓ matches expected output · ${st.ms} ms`, tone: 'ok' as const } : { text: `✗ expected:\n${e.expected}`, tone: 'warn' as const }]
                    : st?.err ? [{ text: st.err, tone: 'err' }]
                    : st?.note ? [{ text: `AI fix: ${st.note}`, tone: 'ok' }]
                    : [{ text: live ? `Press Run to execute on this machine (${content.language}). Expected output:\n${e.expected}` : 'Press Run to execute in the Java 21.0.2 sandbox', tone: 'dim' }]} />
            </div>
          </Card>
        );
      })}
    </div>
  );
}

/* ---------------- Exercises ---------------- */

type Run = { running: boolean; tests: TestResult[]; shown: number; stdout?: string; stderr?: string };

export function Exercises({ content, online }: { content: CourseContent; online: boolean }) {
  const live = content.live && online;
  const [open, setOpen] = React.useState(content.exercises[0]?.id);
  const [code, setCode] = React.useState<Record<string, string>>(() => Object.fromEntries(content.exercises.map(e => [e.id, e.starter])));
  const [runs, setRuns] = React.useState<Record<string, Run>>({});
  const ex = content.exercises.find(e => e.id === open) ?? content.exercises[0];
  if (!ex) return <EmptyState icon={Lightbulb} title="No exercises" description="This course has no exercises yet." />;
  const r = runs[ex.id];

  const runTests = async () => {
    if (live) {
      setRuns(s => ({ ...s, [ex.id]: { running: true, tests: [], shown: 0 } }));
      try {
        const res = await api.run(content.language, code[ex.id]);
        const tests = parseTests(res.stdout);
        for (let k = 1; k <= tests.length; k++) { await sleep(140); setRuns(s => ({ ...s, [ex.id]: { running: k < tests.length, tests, shown: k, stdout: res.stdout, stderr: res.stderr } })); }
        if (!tests.length) setRuns(s => ({ ...s, [ex.id]: { running: false, tests, shown: 0, stdout: res.stdout, stderr: res.stderr } }));
        const failed = tests.filter(t => !t.pass).length;
        if (!tests.length) toast.error('The program did not run any tests', { description: res.stderr.split('\n')[0] || 'Check the console output.' });
        else if (failed) toast.warning(`${tests.length - failed}/${tests.length} tests passed`, { description: 'Check the failing test for a hint.' });
        else toast.success(`All ${tests.length} tests passed`);
      } catch (err) { setRuns(s => ({ ...s, [ex.id]: { running: false, tests: [], shown: 0, stderr: err instanceof Error ? err.message : 'Run failed' } })); }
      return;
    }
    setRuns(s => ({ ...s, [ex.id]: { running: true, tests: ex.tests, shown: 0 } }));
    for (let k = 1; k <= ex.tests.length; k++) { await sleep(260); setRuns(s => ({ ...s, [ex.id]: { running: k < ex.tests.length, tests: ex.tests, shown: k } })); }
    const failed = ex.tests.filter(t => !t.pass).length;
    if (failed) toast.warning(`${ex.tests.length - failed}/${ex.tests.length} tests passed`, { description: 'Check the failing test for a hint.' });
    else toast.success(`All ${ex.tests.length} tests passed`);
  };

  const tests = live ? (r?.tests ?? ex.tests) : ex.tests;
  const shown = r?.shown ?? 0;
  const passed = (r?.tests ?? []).slice(0, shown).filter(t => t.pass).length;
  const finished = !!r && !r.running;

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <div className="space-y-2">
        {content.exercises.map((e, i) => (
          <button key={e.id} onClick={() => setOpen(e.id)} className={cn('w-full rounded-xl border p-4 text-left transition', ex.id === e.id ? 'border-primary bg-primary/5 ring-2 ring-primary/15' : 'bg-card hover:border-primary/40')}>
            <div className="flex items-center justify-between"><span className="text-xs font-semibold text-muted-foreground">Exercise {i + 1}</span><Badge variant={({ Easy: 'success', Medium: 'info', Hard: 'danger' } as Record<string, 'success' | 'info' | 'danger'>)[e.difficulty] ?? 'info'}>{e.difficulty}</Badge></div>
            <div className="mt-1 font-semibold">{e.title}</div>
            <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]"><span className="rounded bg-emerald-50 px-1.5 py-0.5 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">Reference: {e.reference}</span><span className="rounded bg-red-50 px-1.5 py-0.5 text-red-700 dark:bg-red-500/10 dark:text-red-300">Naive: {e.naiveResult.split(' (')[0]}</span></div>
          </button>
        ))}
      </div>
      <Card className="min-w-0 p-4 sm:p-5">
        <h3 className="text-lg font-semibold">{ex.title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{ex.statement}</p>
        <div className="mt-4 grid gap-4 xl:grid-cols-[1.3fr_1fr]">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <span>Your code (editable)</span>
              <span className="flex gap-3 normal-case">
                {live && <button className="text-primary hover:underline" onClick={() => setCode(c => ({ ...c, [ex.id]: ex.solution }))}>Load reference solution</button>}
                {live && <button className="text-primary hover:underline" onClick={() => setCode(c => ({ ...c, [ex.id]: ex.naive }))}>Load naive solution</button>}
                <button className="text-primary hover:underline" onClick={() => setCode(c => ({ ...c, [ex.id]: ex.starter }))}>Reset</button>
              </span>
            </div>
            <CodeEditor value={code[ex.id] ?? ''} onChange={v => setCode(c => ({ ...c, [ex.id]: v }))} minRows={12} lang={langOf(content)} />
          </div>
          <div className="flex min-w-0 flex-col">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Automated tests</span>
              {finished && tests.length > 0 && <span className={cn('text-xs font-semibold', passed === tests.length ? 'text-emerald-600' : 'text-amber-600')}>{passed}/{tests.length} passed</span>}
            </div>
            <ul className="flex-1 space-y-1.5">
              {(live && !r ? [] : tests).map((t, k) => {
                const done = k < shown, running = r?.running && k === shown;
                return (
                  <li key={t.name + k} className={cn('rounded-lg border px-3 py-2 text-sm', done && !t.pass && 'border-red-200 bg-red-50/60 dark:border-red-500/20 dark:bg-red-500/5')}>
                    <div className="flex items-center gap-2">
                      {done ? (t.pass ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" /> : <XCircle className="h-4 w-4 shrink-0 text-red-500" />) : running ? <Loader2 className="h-4 w-4 shrink-0 animate-spin text-blue-500" /> : <span className="h-4 w-4 shrink-0 rounded-full border-2 border-dashed border-muted-foreground/30" />}
                      <span className="min-w-0 flex-1 truncate font-mono text-xs">{t.name}</span>
                      {done && t.ms && <span className="text-[11px] text-muted-foreground">{t.ms} ms</span>}
                    </div>
                    {done && !t.pass && t.error && <div className="mt-1.5 pl-6 font-mono text-[11px] text-red-600 dark:text-red-400">{t.error}</div>}
                  </li>
                );
              })}
              {live && !r && <li className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">Run the tests to see results. The program prints PASS or FAIL for each test.</li>}
              {live && r && !r.running && !r.tests.length && <li className="rounded-lg border border-red-200 bg-red-50/60 p-3 font-mono text-[11px] text-red-700 dark:border-red-500/20 dark:bg-red-500/5 dark:text-red-300">{r.stderr || r.stdout || 'No output'}</li>}
            </ul>
            <Button variant="gradient" className="mt-3" onClick={runTests} loading={r?.running}>{!r?.running && <Play />} Run tests</Button>
            {!live && finished && passed < tests.length && <p className="mt-2 flex items-start gap-1.5 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-300"><Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Hint: should withdrawing exactly the balance be allowed? Compare with <code className="font-mono">&gt;</code> vs <code className="font-mono">&gt;=</code>.</p>}
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ---------------- Quiz ---------------- */

export function Quiz({ content }: { content: CourseContent }) {
  const [questions, setQuestions] = React.useState(content.quiz);
  const [answers, setAnswers] = React.useState<Record<number, number>>({});
  const [reveal, setReveal] = React.useState(false);
  const [categoryFilter, setCategoryFilter] = React.useState<string>('All');
  const [diffFilter, setDiffFilter] = React.useState<string>('All');

  const categories = React.useMemo(() => {
    const set = new Set<string>();
    questions.forEach(q => { if (q.category) set.add(q.category); });
    return ['All', ...Array.from(set)];
  }, [questions]);

  const filtered = questions.filter(q => {
    if (categoryFilter !== 'All' && q.category !== categoryFilter) return false;
    if (diffFilter !== 'All' && q.difficulty !== diffFilter) return false;
    return true;
  });

  const score = Object.entries(answers).filter(([q, a]) => questions[+q]?.answer === a).length;

  const addScenarioQuestion = () => {
    const newQ = {
      q: 'Scenario: How do you prevent a memory leak in a high-throughput Java 21 event-driven service?',
      code: 'public class EventConsumer {\n    // ThreadLocal retaining large buffer\n    private static final ThreadLocal<byte[]> BUFFER = ThreadLocal.withInitial(() -> new byte[1024 * 1024]);\n    public void handle(Event e) { /* ... */ }\n}',
      options: [
        'Avoid ThreadLocal on Virtual Threads or ensure ThreadLocal.remove() is called immediately after use',
        'Increase JVM max heap (-Xmx64G) and disable Garbage Collection',
        'Convert all buffers into static constants',
        'Restart the container every 10 minutes'
      ],
      answer: 0,
      explanation: 'Virtual threads should not hold heavy ThreadLocal state without explicit cleanup because millions of virtual threads would exhaust heap memory rapidly.',
      category: 'Concurrency',
      difficulty: 'Advanced' as const
    };
    setQuestions(prev => [newQ, ...prev]);
    toast.success('Generated new scenario question', { description: 'Added to the quiz pool' });
  };

  return (
    <div className="space-y-4">
      <Card className="flex flex-wrap items-center justify-between gap-4 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-sm">
            <span className="font-bold text-foreground">{Object.keys(answers).length}/{questions.length}</span>{' '}
            <span className="text-muted-foreground">Answered</span>
            {reveal && <span className="ml-3 font-bold text-emerald-600 dark:text-emerald-400">Score: {score}/{questions.length} ({Math.round((score / (questions.length || 1)) * 100)}%)</span>}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="h-8 rounded-lg border bg-background px-2.5 text-xs font-medium text-foreground outline-none focus:ring-2 focus:ring-primary/20"
            >
              {categories.map(c => <option key={c} value={c}>Category: {c}</option>)}
            </select>

            <select
              value={diffFilter}
              onChange={e => setDiffFilter(e.target.value)}
              className="h-8 rounded-lg border bg-background px-2.5 text-xs font-medium text-foreground outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="All">All Difficulties</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={addScenarioQuestion}>
            <Sparkles className="mr-1.5 h-3.5 w-3.5 text-primary" /> + Add Scenario Question
          </Button>
          <Button variant="outline" size="sm" onClick={() => { setAnswers({}); setReveal(false); }}>Reset</Button>
          <Button variant="gradient" size="sm" onClick={() => setReveal(true)}>
            <Eye className="mr-1.5 h-3.5 w-3.5" /> Show Answers & Explanations
          </Button>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {filtered.map((q, idx) => {
          const originalIdx = questions.indexOf(q);
          const i = originalIdx >= 0 ? originalIdx : idx;
          const chosen = answers[i];

          return (
            <Card key={i} className="flex flex-col justify-between p-5 transition-shadow hover:shadow-md">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground">Q{i + 1}</span>
                    {q.category && <Badge variant="secondary" className="text-[10px]">{q.category}</Badge>}
                  </div>
                  {q.difficulty && (
                    <Badge variant={q.difficulty === 'Advanced' ? 'danger' : q.difficulty === 'Intermediate' ? 'info' : 'success'} className="text-[10px]">
                      {q.difficulty}
                    </Badge>
                  )}
                </div>

                <div className="mt-2 font-semibold leading-snug">{q.q}</div>

                {q.code && (
                  <div className="mt-2.5 overflow-hidden rounded-lg bg-[#0F172A] p-3 font-mono text-xs text-[#E2E8F0]">
                    <pre className="whitespace-pre-wrap">{q.code}</pre>
                  </div>
                )}

                <div className="mt-3.5 grid gap-2">
                  {q.options.map((o, k) => {
                    const isSelected = chosen === k;
                    const isCorrect = q.answer === k;
                    const showFeedback = reveal || chosen !== undefined;

                    return (
                      <button
                        key={k}
                        onClick={() => setAnswers(a => ({ ...a, [i]: k }))}
                        className={cn(
                          'flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition',
                          showFeedback && isCorrect && (isSelected || reveal)
                            ? 'border-emerald-500/60 bg-emerald-50 text-emerald-950 dark:bg-emerald-950/30 dark:text-emerald-200'
                            : showFeedback && isSelected && !isCorrect
                            ? 'border-red-400 bg-red-50 text-red-950 dark:bg-red-950/30 dark:text-red-200'
                            : isSelected
                            ? 'border-primary bg-primary/5 text-foreground ring-1 ring-primary'
                            : 'bg-card text-foreground hover:border-primary/40'
                        )}
                      >
                        <span
                          className={cn(
                            'grid h-6 w-6 shrink-0 place-items-center rounded-md border text-xs font-bold',
                            isSelected ? 'border-primary bg-primary text-white' : 'border-muted-foreground/30 text-muted-foreground'
                          )}
                        >
                          {String.fromCharCode(65 + k)}
                        </span>
                        <span className="min-w-0 flex-1 leading-snug">{o}</span>
                        {showFeedback && isCorrect && (isSelected || reveal) && (
                          <Check className="ml-auto h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {(reveal || chosen !== undefined) && (
                <div className="mt-3.5 rounded-lg border border-primary/20 bg-primary/[0.04] p-3 text-xs leading-relaxed text-muted-foreground animate-fade-up">
                  <span className="font-semibold text-primary">💡 Explanation: </span>
                  {q.explanation}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Cheat sheet ---------------- */

export function CheatSheet({ title, runtime, content }: { title: string; runtime: string; content: CourseContent }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-end gap-2">
        <Button variant="gradient" size="sm" onClick={() => toast.success('Use Export for the PDF', { description: 'Exports & Downloads → Cheat sheet' })}><Download /> Download PDF</Button>
      </div>
      <Card className="mx-auto max-w-4xl overflow-hidden">
        <div className="bg-brand-gradient px-6 py-5 text-white sm:px-8">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">TechSummit · Cheat sheet</div>
          <div className="mt-1 text-2xl font-bold">{title}</div>
          <div className="text-sm text-white/80">All snippets verified on {content.live ? runtimeLabel(content) : runtime}</div>
        </div>
        <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
          {content.cheat.map(sec => (
            <div key={sec.title} className="bg-card p-5">
              <h4 className="mb-3 text-sm font-bold text-primary">{sec.title}</h4>
              <ul className="space-y-2.5">
                {sec.items.map(([c, d]) => <li key={c}><code className="block rounded bg-muted px-2 py-1 font-mono text-[12px]">{c}</code><span className="mt-0.5 block text-xs text-muted-foreground">{d}</span></li>)}
              </ul>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ---------------- Diagrams ---------------- */

export function Diagrams({ content, slides }: { content: CourseContent; slides: Slide[] }) {
  const seed = content.live
    ? slides.filter(s => s.diagram).map((s, i) => ({ id: s.id, title: s.title, kind: 'Diagram', updatedAt: content.generatedAt ?? new Date().toISOString(), data: s.diagram, n: i }))
    : seedDiagrams.map(d => ({ id: d.id, title: d.title, kind: d.kind, updatedAt: d.updatedAt, data: undefined, n: 0 }));
  const [items, setItems] = React.useState(seed);
  const [busy, setBusy] = React.useState<string | null>(null);
  const [editing, setEditing] = React.useState<null | { id: string; title: string }>(null);
  if (!items.length) return <EmptyState icon={ImageIcon} title="No diagrams yet" description="Diagrams are generated from slides that describe structure or flow." />;
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map(d => (
          <Card key={d.id} className="card-hover overflow-hidden">
            <div className="relative aspect-[16/9] bg-white p-6 text-slate-800 [container-type:inline-size]">
              <DiagramView id={d.id} data={d.data} />
              {busy === d.id && <div className="absolute inset-0 grid place-items-center bg-white/80"><Progress value={66} className="w-1/2" /></div>}
            </div>
            <div className="flex items-center justify-between gap-2 border-t p-4">
              <div className="min-w-0"><div className="truncate font-semibold">{d.title}</div><div className="text-xs text-muted-foreground">{d.kind} · {timeAgo(d.updatedAt)}</div></div>
              <div className="flex gap-1">
                <Tip label="Rename"><Button variant="ghost" size="icon-sm" onClick={() => setEditing({ id: d.id, title: d.title })} aria-label="Edit diagram"><Pencil /></Button></Tip>
                {!content.live && <Tip label="Regenerate"><Button variant="ghost" size="icon-sm" disabled={!!busy} aria-label="Regenerate diagram" onClick={async () => { setBusy(d.id); await sleep(1300); setBusy(null); setItems(x => x.map(y => y.id === d.id ? { ...y, updatedAt: new Date().toISOString() } : y)); toast.success(`“${d.title}” regenerated`); }}><RefreshCw /></Button></Tip>}
              </div>
            </div>
          </Card>
        ))}
      </div>
      <Dialog open={!!editing} onOpenChange={o => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit diagram</DialogTitle><DialogDescription>Rename it or describe a change.</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <div><Label htmlFor="dt">Title</Label><Input id="dt" className="mt-1.5" value={editing?.title ?? ''} onChange={e => setEditing(x => x && { ...x, title: e.target.value })} /></div>
            <div><Label htmlFor="di">Change request</Label><Textarea id="di" className="mt-1.5" placeholder="e.g. add a FixedDepositAccount subclass" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button variant="gradient" onClick={() => { setItems(x => x.map(y => y.id === editing!.id ? { ...y, title: editing!.title, updatedAt: new Date().toISOString() } : y)); setEditing(null); toast.success('Diagram updated'); }}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

