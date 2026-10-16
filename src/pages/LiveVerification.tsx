import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CheckCircle2, FileChartColumn, Gauge, ListChecks, Play, PlayCircle, RotateCw, ShieldCheck, Timer, WifiOff, Wrench, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Checkbox, Progress } from '@/components/ui/controls';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState, PageHeader } from '@/components/shared/common';
import { SnippetIcon } from '@/components/shared/status';
import { CodeEditor, Terminal } from '@/components/shared/code';
import { api, parseTests, runtimeLabel, useApi, type Attempt, type LiveSnippet } from '@/lib/api';
import type { SnippetStatus } from '@/lib/mock-data';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Diff } from './Verification';

type Line = { text: string; tone?: 'ok' | 'err' | 'dim' | 'cmd' | 'warn' };
const norm = (s: string) => s.replace(/\r/g, '').split('\n').map(l => l.trimEnd()).join('\n').trim();
const MAX = 3;

/** Verification Center for generated courses: real runs on this machine, real auto-fix attempts through the model. */
export function LiveVerification({ courseId, setCourse }: { courseId: string; setCourse: (c: string) => void }) {
  const navigate = useNavigate();
  const { courses, contents, patchContent, updateCourse } = useStore();
  const { online } = useApi();
  const content = contents[courseId];
  const lang = content.language;

  const [status, setStatus] = React.useState<Record<string, SnippetStatus>>(() => Object.fromEntries(content.snippets.map(s => [s.id, 'queued' as SnippetStatus])));
  const [codes, setCodes] = React.useState<Record<string, string>>(() => Object.fromEntries(content.snippets.map(s => [s.id, s.code])));
  const [firstActual, setFirstActual] = React.useState<Record<string, string>>({});
  const [actuals, setActuals] = React.useState<Record<string, string>>(() => Object.fromEntries(content.snippets.map(s => [s.id, s.actual])));
  const [attempts, setAttempts] = React.useState<Record<string, Attempt[]>>({});
  const [selected, setSelected] = React.useState(content.snippets[0]?.id);
  const [checked, setChecked] = React.useState<string[]>([]);
  const [lines, setLines] = React.useState<Line[]>([{ text: `LearnifyAI sandbox · ${runtimeLabel(content)} · runs on this machine`, tone: 'dim' }, { text: `Ready. Press “Run All” to verify ${content.snippets.length} snippets.`, tone: 'dim' }]);
  const [running, setRunning] = React.useState(false);
  const [msById, setMsById] = React.useState<Record<string, number>>({});
  const alive = React.useRef(true);
  React.useEffect(() => () => { alive.current = false; }, []);
  const log = (...l: Line[]) => alive.current && setLines(x => [...x, ...l]);

  if (!content.runnerLang) return <EmptyState icon={ShieldCheck} title={`No runner for ${lang}`} description="Verification runs Java, Python, Node.js and TypeScript code on this machine. This course’s snippets are shown but not executed." action={<Button variant="outline" onClick={() => navigate(`/studio/${courseId}`)}>Open in Studio</Button>} />;

  /** One verification attempt for a snippet. Returns null when it passes, otherwise a problem description. */
  async function attempt(s: LiveSnippet, code: string): Promise<{ problem: string | null; stdout: string; stderr: string; ms: number; exitCode: number }> {
    const r = await api.run(lang, code);
    if (s.kind === 'example') {
      const bad = !r.ok ? (r.timedOut ? 'Timed out' : `Exited with code ${r.exitCode}: ${r.stderr.split('\n')[0]}`) : norm(r.stdout) !== norm(s.expected) ? `Output mismatch.\nExpected:\n${s.expected}\nActual:\n${r.stdout}` : null;
      return { problem: bad, stdout: r.stdout, stderr: r.stderr, ms: r.ms, exitCode: r.exitCode };
    }
    const t = parseTests(r.stdout), failing = t.filter(x => !x.pass);
    let problem: string | null = !r.ok ? `Exit code ${r.exitCode}. ${r.stderr.split('\n')[0]}` : t.length < 3 ? 'Fewer than 3 PASS lines printed' : failing.length ? `Failing tests: ${failing.map(x => x.name).join(', ')}` : null;
    if (!problem) { // the naive solution must be caught by the same tests
      const ex = content.exercises.find(x => x.id === s.id);
      if (ex?.naive) { const n = await api.run(lang, ex.naive); const nt = parseTests(n.stdout); if (!nt.length || nt.every(x => x.pass)) problem = 'Naive solution is not caught by the tests'; }
    }
    return { problem, stdout: r.stdout, stderr: r.stderr, ms: r.ms, exitCode: r.exitCode };
  }

  const runIds = async (ids: string[]) => {
    if (!online) { toast.error('The AI server is not running', { description: 'Start it with npm run dev:all.' }); return; }
    if (!ids.length) { toast.error('Select at least one snippet'); return; }
    setRunning(true);
    setStatus(x => ({ ...x, ...Object.fromEntries(ids.map(id => [id, 'queued' as SnippetStatus])) }));
    setAttempts(x => ({ ...x, ...Object.fromEntries(ids.map(id => [id, [] as Attempt[]])) }));
    log({ text: '' }, { text: `▶ Verifying ${ids.length} snippet(s) on ${runtimeLabel(content)} · timeout 10s`, tone: 'cmd' });
    const finalState: Record<string, { status: 'passed' | 'failed'; code: string; actual: string; ms: number; attempts: Attempt[] }> = {};
    let autoFixed = 0;
    for (const id of ids) {
      if (!alive.current) return;
      const s = content.snippets.find(x => x.id === id)!;
      setSelected(id); setStatus(x => ({ ...x, [id]: 'running' }));
      let code = codes[id], tries: Attempt[] = [], ok = false, last = { stdout: '', stderr: '', ms: 0 };
      for (let n = 1; n <= MAX; n++) {
        log({ text: `$ run ${s.name}${n > 1 ? `   # attempt ${n}` : ''}`, tone: 'cmd' });
        let res;
        try { res = await attempt(s, code); } catch (e) { log({ text: `Server error: ${e instanceof Error ? e.message : e}`, tone: 'err' }); break; }
        last = res;
        tries = [...tries, { n, ok: !res.problem, stdout: res.stdout, stderr: res.stderr, exitCode: res.exitCode, ms: res.ms, problem: res.problem ?? undefined }];
        setAttempts(x => ({ ...x, [id]: tries }));
        setActuals(x => ({ ...x, [id]: s.kind === 'example' ? res.stdout : `${parseTests(res.stdout).filter(t => t.pass).length}/${parseTests(res.stdout).length} tests pass · naive solution fails` }));
        if (n === 1 && res.problem) setFirstActual(x => ({ ...x, [id]: res.stdout || res.stderr }));
        if (!res.problem) { ok = true; break; }
        setStatus(x => ({ ...x, [id]: 'failed' }));
        log(...res.stdout.split('\n').filter(Boolean).slice(0, 6).map(t => ({ text: t })), ...res.stderr.split('\n').filter(Boolean).slice(0, 5).map(t => ({ text: t, tone: 'err' as const })), { text: `✗ ${s.name}: ${res.problem.split('\n')[0]} (attempt ${n} of ${MAX})`, tone: 'err' });
        if (n === MAX) break;
        toast.error(`${s.name} failed`, { description: `Starting auto-fix attempt ${n + 1} of ${MAX}…` });
        setStatus(x => ({ ...x, [id]: 'retrying' }));
        log({ text: '↻ Auto-fix: sending the failure log to the model…', tone: 'warn' });
        try {
          const target = s.kind === 'exercise' ? content.exercises.find(x => x.id === id)?.solution ?? code : code;
          const fix = await api.fix({ language: lang, code: target, expected: s.kind === 'example' ? s.expected : undefined, stdout: res.stdout, stderr: res.stderr + '\n' + res.problem });
          code = fix.code; setCodes(x => ({ ...x, [id]: code }));
          log({ text: `↻ Patch: ${fix.explanation ?? 'code rewritten'}`, tone: 'warn' });
        } catch (e) { log({ text: `Auto-fix request failed: ${e instanceof Error ? e.message : e}`, tone: 'err' }); break; }
      }
      if (ok) {
        setStatus(x => ({ ...x, [id]: 'passed' })); setMsById(x => ({ ...x, [id]: last.ms }));
        if (tries.length > 1) { autoFixed++; toast.success('Auto-fix succeeded', { description: `${s.name} passed on attempt ${tries.length} of ${MAX}` }); }
        log({ text: `✓ ${s.name} passed${tries.length > 1 ? ` on attempt ${tries.length}` : ''} · ${last.ms} ms`, tone: 'ok' });
      } else setStatus(x => ({ ...x, [id]: 'failed' }));
      finalState[id] = { status: ok ? 'passed' : 'failed', code, actual: last.stdout, ms: last.ms, attempts: tries };
    }
    // Persist the outcome so Studio, Reports and Exports see the corrected code and fresh results.
    const snippets = content.snippets.map(s => { const f = finalState[s.id]; return f ? { ...s, status: f.status, code: s.kind === 'example' ? f.code : s.code, actual: f.actual || s.actual, ms: f.ms, attempts: f.attempts } : s; });
    const verifiable = snippets.filter(s => s.status !== 'skipped'), passed = verifiable.filter(s => s.status === 'passed').length;
    const examples = content.examples.map(e => { const f = finalState[e.id]; return f ? { ...e, code: f.code, output: f.actual, ms: f.ms, status: f.status, attempts: f.attempts } : e; });
    const slides = content.slides.map(sl => { const e = examples.find(x => x.id === sl.exampleId); return e && finalState[e.id] ? { ...sl, code: e.code, status: e.status === 'passed' ? 'passed' as const : 'failed' as const } : sl; });
    const exercises = content.exercises.map(x => { const f = finalState[x.id]; return f ? { ...x, solution: f.code, status: f.status } : x; });
    patchContent(courseId, { snippets, examples, slides, exercises, summary: { ...content.summary, passed, failed: verifiable.length - passed, autoFixed: Math.max(content.summary.autoFixed, autoFixed) } });
    updateCourse(courseId, { snippets: { passed, total: verifiable.length }, status: passed === verifiable.length ? 'verified' : 'review', statusNote: passed === verifiable.length ? undefined : `${verifiable.length - passed} snippet(s) failed` });
    log({ text: `■ Done: ${Object.values(finalState).filter(f => f.status === 'passed').length}/${ids.length} passed${autoFixed ? ` · ${autoFixed} auto-fixed` : ''}`, tone: 'ok' });
    setRunning(false);
    if (passed === verifiable.length) toast.success('All snippets verified', { description: 'Verification report updated.', action: { label: 'View report', onClick: () => navigate(`/reports?open=rep-${courseId}`) } });
  };

  const snips = content.snippets;
  const snip = snips.find(s => s.id === selected) ?? snips[0];
  const st = status[snip.id];
  const tries = attempts[snip.id] ?? [];
  const nPassed = Object.values(status).filter(s => s === 'passed').length;
  const nFailed = Object.values(status).filter(s => s === 'failed').length;
  const doneMs = Object.entries(msById).filter(([id]) => status[id] === 'passed').map(([, v]) => v);
  const avg = doneMs.length ? Math.round(doneMs.reduce((a, b) => a + b, 0) / doneMs.length) : 0;
  const progress = Math.round((Object.values(status).filter(s => s === 'passed' || s === 'failed').length / snips.length) * 100);
  const showRetry = tries.length > 1 || (tries.length === 1 && !tries[0].ok);
  const actual = st === 'queued' ? '' : actuals[snip.id];

  return (
    <div>
      <PageHeader eyebrow="Intelligence" title="Code Verification Center" description={`Live: every snippet runs on this machine with ${runtimeLabel(content)}. Failures go back to the model for an auto-fix, up to ${MAX} attempts.`}
        actions={<Button variant="outline" onClick={() => navigate(`/reports?open=rep-${courseId}`)}><FileChartColumn /> View report</Button>} />

      <Card className="mb-4 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="grid flex-1 gap-3 sm:grid-cols-2">
            <div>
              <div className="mb-1.5 text-xs font-medium text-muted-foreground">Course</div>
              <Select value={courseId} onValueChange={setCourse} disabled={running}>
                <SelectTrigger aria-label="Course"><SelectValue /></SelectTrigger>
                <SelectContent>{courses.filter(c => c.snippets.total > 0 || contents[c.id]).map(c => <SelectItem key={c.id} value={c.id}>{c.title}{contents[c.id]?.live ? ' · live' : ''}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><div className="mb-1.5 text-xs font-medium text-muted-foreground">Runtime</div><div className="flex h-10 items-center rounded-lg border bg-muted/40 px-3 text-sm font-mono">{runtimeLabel(content)} · {content.runnerLang}</div></div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => runIds(checked)} disabled={running || !checked.length}><PlayCircle /> Run Selected{checked.length ? ` (${checked.length})` : ''}</Button>
            <Button variant="gradient" onClick={() => runIds(snips.map(s => s.id))} loading={running}>{!running && <Play />} {running ? 'Running…' : 'Run All'}</Button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-dashed bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 font-medium text-foreground"><span className={cn('h-2 w-2 rounded-full', online ? 'bg-emerald-500' : 'bg-red-500')} /> {online ? 'Runner ready' : 'AI server offline'}</span>
          <span className="inline-flex items-center gap-1"><Box className="h-3.5 w-3.5" /> Temp directory per run</span>·
          <span className="inline-flex items-center gap-1"><WifiOff className="h-3.5 w-3.5" /> API keys never passed to code</span>·
          <span className="inline-flex items-center gap-1"><Timer className="h-3.5 w-3.5" /> 10s timeout</span>
        </div>
      </Card>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[{ icon: ListChecks, label: 'Total snippets', value: snips.length, tone: 'text-foreground' }, { icon: CheckCircle2, label: 'Passed', value: nPassed, tone: 'text-emerald-600' }, { icon: XCircle, label: 'Failed', value: nFailed, tone: nFailed ? 'text-red-600' : 'text-foreground' }, { icon: Gauge, label: 'Avg runtime', value: avg ? `${avg} ms` : '—', tone: 'text-foreground' }].map(x => (
          <Card key={x.label} className="flex items-center gap-3 p-4"><x.icon className={cn('h-5 w-5', x.tone)} /><div><div className={cn('text-xl font-bold leading-none', x.tone)}>{x.value}</div><div className="mt-1 text-xs text-muted-foreground">{x.label}</div></div></Card>
        ))}
        <Card className="col-span-2 flex flex-col justify-center gap-2 p-4 lg:col-span-1"><div className="flex justify-between text-xs"><span className="text-muted-foreground">Progress</span><span className="font-semibold">{progress}%</span></div><Progress value={progress} /></Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <label className="flex items-center gap-2 text-sm font-semibold"><Checkbox checked={checked.length === snips.length ? true : checked.length ? 'indeterminate' : false} onCheckedChange={v => setChecked(v ? snips.map(s => s.id) : [])} aria-label="Select all" /> Snippets</label>
            <span className="text-xs text-muted-foreground">{nPassed}/{snips.length} passed</span>
          </div>
          <ul className="max-h-[560px] divide-y overflow-auto scrollbar-thin">
            {snips.map(s => (
              <li key={s.id} className={cn('flex cursor-pointer items-center gap-3 px-4 py-3 transition', snip.id === s.id ? 'bg-primary/5 shadow-[inset_3px_0_0_hsl(var(--primary))]' : 'hover:bg-muted/50')} onClick={() => setSelected(s.id)}>
                <Checkbox checked={checked.includes(s.id)} onClick={e => e.stopPropagation()} onCheckedChange={v => setChecked(c => v ? [...c, s.id] : c.filter(x => x !== s.id))} aria-label={`Select ${s.name}`} />
                <SnippetIcon status={status[s.id]} />
                <div className="min-w-0 flex-1"><div className="truncate text-sm font-medium">{s.name}</div><div className="text-xs text-muted-foreground">{s.location}{(attempts[s.id]?.length ?? 0) > 1 && status[s.id] === 'passed' && <span className="ml-1.5 text-amber-600">· auto-fixed</span>}</div></div>
                <span className={cn('text-[11px] font-medium capitalize', { queued: 'text-muted-foreground', running: 'text-blue-600', passed: 'text-emerald-600', failed: 'text-red-600', retrying: 'text-amber-600' }[status[s.id]])}>{status[s.id] === 'passed' && msById[s.id] ? `${msById[s.id]} ms` : status[s.id]}</span>
              </li>
            ))}
          </ul>
        </Card>

        <div className="min-w-0 space-y-4">
          {showRetry && (
            <Card className={cn('overflow-hidden', st === 'passed' ? 'border-emerald-200 dark:border-emerald-500/30' : 'border-amber-200 dark:border-amber-500/30')}>
              <div className={cn('flex flex-wrap items-center justify-between gap-2 px-4 py-3', st === 'passed' ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-amber-50 dark:bg-amber-500/10')}>
                <div className="flex items-center gap-2 text-sm font-semibold">{st === 'passed' ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Wrench className="h-4 w-4 text-amber-600" />}{st === 'passed' ? `Auto-fixed on attempt ${tries.length} of ${MAX}` : `Auto-fix attempt ${Math.min(MAX, tries.length + (st === 'retrying' ? 1 : 0))} of ${MAX}`}</div>
                {st === 'retrying' && <Badge variant="warning"><RotateCw className="animate-spin" /> Retrying</Badge>}
              </div>
              <ol className="relative space-y-4 p-4 before:absolute before:bottom-6 before:left-[27px] before:top-6 before:w-px before:bg-border">
                {tries.map(t => (
                  <li key={t.n} className="relative flex gap-3">
                    <span className={cn('relative z-10 grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white ring-4 ring-card', t.ok ? 'bg-emerald-500' : 'bg-red-500')}>{t.n}</span>
                    <div className="min-w-0"><div className="text-sm font-semibold">Attempt {t.n}: {t.ok ? 'Passed' : 'Failed'}<span className="ml-2 font-mono text-[11px] font-normal text-muted-foreground">{t.ms} ms</span></div><p className="whitespace-pre-wrap break-words text-xs text-muted-foreground">{t.ok ? (t.n > 1 ? 'The model’s patch fixed it. Output now matches.' : 'Output matches.') : t.problem?.split('\n').slice(0, 3).join(' ')}</p></div>
                  </li>
                ))}
              </ol>
            </Card>
          )}

          <Card className="min-w-0 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0"><div className="flex items-center gap-2 font-semibold"><SnippetIcon status={st} /> {snip.name}</div><div className="text-xs text-muted-foreground">{snip.location} · {tries.length > 1 ? `fixed version (attempt ${tries.length})` : 'generated version'}</div></div>
              <Button variant="outline" size="sm" onClick={() => runIds([snip.id])} disabled={running}><RotateCw /> Re-run</Button>
            </div>
            <CodeEditor value={codes[snip.id] ?? ''} onChange={v => setCodes(c => ({ ...c, [snip.id]: v }))} minRows={8} lang={content.runnerLang === 'python' ? 'python' : content.runnerLang === 'node' ? 'javascript' : 'java'} />
          </Card>

          {snip.kind === 'example' ? (
            tries.length > 1 && firstActual[snip.id] ? <div className="space-y-2"><div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Attempt 1: expected vs actual</div><Diff expected={snip.expected} actual={firstActual[snip.id]} /></div>
              : actual ? <Diff expected={snip.expected} actual={actual} /> : <Card className="grid h-24 place-items-center text-sm text-muted-foreground">Run this snippet to compare output.</Card>
          ) : (
            <Card className="p-4 text-sm"><div className="font-semibold">Reference vs naive</div><p className="mt-1 text-muted-foreground">{actual || 'Run this exercise to check that the reference solution passes every test and the naive solution is caught.'}</p></Card>
          )}
          <Terminal lines={lines} className="h-64" title="sandbox console" />

          {nPassed === snips.length && !running && (
            <Card className="flex flex-col items-start justify-between gap-3 border-emerald-200 bg-emerald-50/60 p-4 sm:flex-row sm:items-center dark:border-emerald-500/20 dark:bg-emerald-500/5">
              <div className="flex items-center gap-3"><ShieldCheck className="h-6 w-6 text-emerald-600" /><div><div className="font-semibold">All {snips.length} snippets verified</div><div className="text-sm text-muted-foreground">Report updated with this run</div></div></div>
              <div className="flex gap-2"><Button variant="outline" onClick={() => navigate(`/reports?open=rep-${courseId}`)}>View report</Button><Button variant="gradient" onClick={() => navigate(`/exports?course=${courseId}`)}>Continue to export</Button></div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
