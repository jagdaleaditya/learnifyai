import * as React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LiveVerification } from './LiveVerification';
import { Box, CheckCircle2, Clock, FileChartColumn, Gauge, Play, PlayCircle, RotateCw, ShieldCheck, Timer, WifiOff, Wrench, XCircle, ListChecks } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Checkbox, Progress } from '@/components/ui/controls';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/shared/common';
import { SnippetIcon } from '@/components/shared/status';
import { CodeEditor, Terminal } from '@/components/shared/code';
import { exercises, retryTimeline, snippets, type SnippetStatus } from '@/lib/mock-data';
import { useStore } from '@/lib/store';
import { cn, sleep } from '@/lib/utils';

type Line = { text: string; tone?: 'ok' | 'err' | 'dim' | 'cmd' | 'warn' };
const RUNTIMES = [{ id: 'java-21', label: 'Java 21.0.2' }, { id: 'python-3.12', label: 'Python 3.12.1' }, { id: 'node-20', label: 'Node 20.11' }];

export function Diff({ expected, actual }: { expected: string; actual: string }) {
  const e = expected.split('\n'), a = actual.split('\n');
  const n = Math.max(e.length, a.length);
  const rows = Array.from({ length: n }, (_, i) => ({ e: e[i], a: a[i], same: e[i] === a[i] }));
  return (
    <div className="grid overflow-hidden rounded-xl border font-mono text-[12px] sm:grid-cols-2">
      {(['Expected', 'Actual'] as const).map((h, col) => (
        <div key={h} className={cn(col === 1 && 'border-t sm:border-l sm:border-t-0')}>
          <div className="flex items-center justify-between border-b bg-muted/50 px-3 py-1.5 font-sans text-xs font-semibold text-muted-foreground">{h}{col === 1 && <span className={cn('font-medium', rows.every(r => r.same) ? 'text-emerald-600' : 'text-red-600')}>{rows.every(r => r.same) ? 'match' : `${rows.filter(r => !r.same).length} line(s) differ`}</span>}</div>
          <div className="min-h-[96px] py-1">
            {rows.map((r, i) => {
              const v = col === 0 ? r.e : r.a;
              return (
                <div key={i} className={cn('flex gap-3 px-3 py-0.5', !r.same && v !== undefined && (col === 0 ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-200' : 'bg-red-50 text-red-900 dark:bg-red-500/10 dark:text-red-200'))}>
                  <span className="w-4 shrink-0 select-none text-right text-muted-foreground/60">{v !== undefined ? i + 1 : ''}</span>
                  <span className="whitespace-pre-wrap break-all">{!r.same && v !== undefined ? (col === 0 ? '+ ' : '- ') : '  '}{v ?? ''}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function MockVerification({ course, setCourse }: { course: string; setCourse: (c: string) => void }) {
  const navigate = useNavigate();
  const { courses } = useStore();
  const [runtime, setRuntime] = React.useState('java-21');
  const [status, setStatus] = React.useState<Record<string, SnippetStatus>>(() => Object.fromEntries(snippets.map(s => [s.id, 'queued'])));
  const [attempt, setAttempt] = React.useState<Record<string, number>>({});
  const [fixed, setFixed] = React.useState<Record<string, boolean>>({});
  const [selected, setSelected] = React.useState(snippets[3].id);
  const [checked, setChecked] = React.useState<string[]>([]);
  const [lines, setLines] = React.useState<Line[]>([{ text: 'LearnifyAI sandbox · eclipse-temurin:21.0.2_13-jdk', tone: 'dim' }, { text: 'Ready. Press “Run All” to verify 8 snippets.', tone: 'dim' }]);
  const [running, setRunning] = React.useState(false);
  const [codeEdits, setCodeEdits] = React.useState<Record<string, string>>({});
  const [failedOnce, setFailedOnce] = React.useState<Record<string, boolean>>({});
  const alive = React.useRef(true);
  React.useEffect(() => () => { alive.current = false; }, []);

  const log = (...l: Line[]) => alive.current && setLines(x => [...x, ...l]);
  const set = (id: string, s: SnippetStatus) => alive.current && setStatus(x => ({ ...x, [id]: s }));

  const runIds = async (ids: string[]) => {
    if (!ids.length) { toast.error('Select at least one snippet'); return; }
    setRunning(true);
    setStatus(x => ({ ...x, ...Object.fromEntries(ids.map(id => [id, 'queued' as SnippetStatus])) }));
    setAttempt(x => ({ ...x, ...Object.fromEntries(ids.map(id => [id, 1])) }));
    setFixed(x => ({ ...x, ...Object.fromEntries(ids.map(id => [id, false])) }));
    setFailedOnce(x => ({ ...x, ...Object.fromEntries(ids.map(id => [id, false])) }));
    log({ text: '' }, { text: `▶ Verifying ${ids.length} snippet(s) on ${RUNTIMES.find(r => r.id === runtime)?.label} · network: none · timeout: 5s`, tone: 'cmd' });
    let passed = 0, autoFixed = 0;
    for (const id of ids) {
      if (!alive.current) return;
      const s = snippets.find(x => x.id === id)!;
      setSelected(id);
      set(id, 'running');
      log({ text: s.logs[0], tone: 'cmd' });
      await sleep(550 + Math.random() * 250);
      if (s.failsFirst) {
        set(id, 'failed');
        setFailedOnce(x => ({ ...x, [id]: true }));
        log(...s.logs.slice(1).map(t => ({ text: t, tone: (/Exception|exit 1|at /.test(t) ? 'err' : undefined) as Line['tone'] })), { text: `✗ ${s.name}: output mismatch (attempt 1 of 3)`, tone: 'err' });
        toast.error(`${s.name} failed`, { description: 'Starting auto-fix attempt 2 of 3…' });
        await sleep(1300);
        if (!alive.current) return;
        set(id, 'retrying');
        setAttempt(x => ({ ...x, [id]: 2 }));
        log({ text: '↻ Auto-fix: sending failure log to generator…', tone: 'warn' }, { text: '↻ Patch: replace `throw new IllegalStateException` with `return "Insufficient funds"`', tone: 'warn' });
        await sleep(1500);
        if (!alive.current) return;
        setFixed(x => ({ ...x, [id]: true }));
        set(id, 'running');
        log({ text: s.logs[0] + '   # attempt 2', tone: 'cmd' });
        await sleep(700);
        log(...s.actual.split('\n').map(t => ({ text: t })), { text: `✓ ${s.name} passed on attempt 2 · ${s.ms} ms · 6/6 tests`, tone: 'ok' });
        set(id, 'passed');
        autoFixed++;
        toast.success('Auto-fix succeeded', { description: `${s.name} passed on attempt 2 of 3` });
      } else {
        log({ text: `✓ ${s.name} · ${s.ms} ms · ${s.tests.passed}/${s.tests.total} tests`, tone: 'ok' });
        set(id, 'passed');
      }
      passed++;
    }
    log({ text: `■ Done: ${passed}/${ids.length} passed${autoFixed ? ` · ${autoFixed} auto-fixed` : ''}`, tone: 'ok' });
    setRunning(false);
    if (ids.length === snippets.length) toast.success('All snippets verified', { description: 'Verification report updated.', action: { label: 'View report', onClick: () => navigate('/reports?open=rep-100') } });
  };

  const snip = snippets.find(s => s.id === selected)!;
  const st = status[snip.id];
  const showFixed = fixed[snip.id];
  const code = codeEdits[snip.id] ?? (showFixed ? snip.fixedCode ?? snip.code : snip.code);
  const actual = st === 'queued' ? '' : st === 'running' && !showFixed ? '' : snip.failsFirst && !showFixed ? snip.actualFirst ?? '' : snip.actual;

  const total = snippets.length;
  const nPassed = Object.values(status).filter(s => s === 'passed').length;
  const nFailed = Object.values(status).filter(s => s === 'failed').length;
  const done = snippets.filter(s => status[s.id] === 'passed');
  const avg = done.length ? Math.round(done.reduce((a, s) => a + s.ms, 0) / done.length) : 0;
  const progress = Math.round((Object.values(status).filter(s => s === 'passed' || s === 'failed').length / total) * 100);

  const ex1 = exercises[0];
  const tests = snip.id === 'sn4' ? ex1.tests.map(t => (t.pass ? t : { ...t, pass: !!showFixed && st === 'passed' })) : Array.from({ length: snip.tests.total }, (_, i) => ({ name: `${snip.name.split(' ')[0]} check ${i + 1}`, pass: true, ms: 2 + i }));
  const testsDone = st === 'passed' || st === 'failed' || st === 'retrying';
  const testsPassed = tests.filter(t => t.pass).length;

  return (
    <div>
      <PageHeader eyebrow="Intelligence" title="Code Verification Center" description="Every snippet runs in an isolated container with the pinned runtime. Failures are fed back and auto-fixed, up to 3 attempts."
        actions={<Button variant="outline" onClick={() => navigate('/reports')}><FileChartColumn /> View reports</Button>} />

      {/* Controls */}
      <Card className="mb-4 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="grid flex-1 gap-3 sm:grid-cols-2">
            <div>
              <div className="mb-1.5 text-xs font-medium text-muted-foreground">Course</div>
              <Select value={course} onValueChange={setCourse} disabled={running}>
                <SelectTrigger aria-label="Course"><SelectValue /></SelectTrigger>
                <SelectContent>{courses.filter(c => c.snippets.total > 0).map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <div className="mb-1.5 text-xs font-medium text-muted-foreground">Runtime</div>
              <Select value={runtime} onValueChange={setRuntime} disabled={running}>
                <SelectTrigger aria-label="Runtime"><SelectValue /></SelectTrigger>
                <SelectContent>{RUNTIMES.map(r => <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => runIds(checked)} disabled={running || !checked.length}><PlayCircle /> Run Selected{checked.length ? ` (${checked.length})` : ''}</Button>
            <Button variant="gradient" onClick={() => runIds(snippets.map(s => s.id))} loading={running}>{!running && <Play />} {running ? 'Running…' : 'Run All'}</Button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-dashed bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 font-medium text-foreground"><span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" /></span> Sandbox ready</span>
          <span className="inline-flex items-center gap-1"><Box className="h-3.5 w-3.5" /> Isolated container</span>·
          <span className="inline-flex items-center gap-1"><WifiOff className="h-3.5 w-3.5" /> No network</span>·
          <span className="inline-flex items-center gap-1"><Timer className="h-3.5 w-3.5" /> 5s timeout</span>·
          <span className="font-mono">eclipse-temurin:21.0.2_13-jdk · 512 MB · 1 vCPU</span>
        </div>
      </Card>

      {/* Summary */}
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[
          { icon: ListChecks, label: 'Total snippets', value: total, tone: 'text-foreground' },
          { icon: CheckCircle2, label: 'Passed', value: nPassed, tone: 'text-emerald-600' },
          { icon: XCircle, label: 'Failed', value: nFailed, tone: nFailed ? 'text-red-600' : 'text-foreground' },
          { icon: Gauge, label: 'Avg runtime', value: avg ? `${avg} ms` : '—', tone: 'text-foreground' },
        ].map(s => (
          <Card key={s.label} className="flex items-center gap-3 p-4"><s.icon className={cn('h-5 w-5', s.tone)} /><div><div className={cn('text-xl font-bold leading-none', s.tone)}>{s.value}</div><div className="mt-1 text-xs text-muted-foreground">{s.label}</div></div></Card>
        ))}
        <Card className="col-span-2 flex flex-col justify-center gap-2 p-4 lg:col-span-1"><div className="flex justify-between text-xs"><span className="text-muted-foreground">Progress</span><span className="font-semibold">{progress}%</span></div><Progress value={progress} /></Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
        {/* Snippet list */}
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <label className="flex items-center gap-2 text-sm font-semibold"><Checkbox checked={checked.length === total ? true : checked.length ? 'indeterminate' : false} onCheckedChange={v => setChecked(v ? snippets.map(s => s.id) : [])} aria-label="Select all" /> Snippets</label>
            <span className="text-xs text-muted-foreground">{nPassed}/{total} passed</span>
          </div>
          <ul className="max-h-[560px] divide-y overflow-auto scrollbar-thin">
            {snippets.map(s => (
              <li key={s.id} className={cn('flex cursor-pointer items-center gap-3 px-4 py-3 transition', selected === s.id ? 'bg-primary/5 shadow-[inset_3px_0_0_hsl(var(--primary))]' : 'hover:bg-muted/50')} onClick={() => setSelected(s.id)}>
                <Checkbox checked={checked.includes(s.id)} onClick={e => e.stopPropagation()} onCheckedChange={v => setChecked(c => v ? [...c, s.id] : c.filter(x => x !== s.id))} aria-label={`Select ${s.name}`} />
                <SnippetIcon status={status[s.id]} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{s.name}</div>
                  <div className="text-xs text-muted-foreground">{s.location}{failedOnce[s.id] && status[s.id] === 'passed' && <span className="ml-1.5 text-amber-600">· auto-fixed</span>}</div>
                </div>
                <span className={cn('text-[11px] font-medium capitalize', { queued: 'text-muted-foreground', running: 'text-blue-600', passed: 'text-emerald-600', failed: 'text-red-600', retrying: 'text-amber-600' }[status[s.id]])}>{status[s.id] === 'passed' ? `${s.ms} ms` : status[s.id]}</span>
              </li>
            ))}
          </ul>
        </Card>

        <div className="min-w-0 space-y-4">
          {/* Retry panel */}
          {snip.failsFirst && (st === 'failed' || st === 'retrying' || failedOnce[snip.id]) && (
            <Card className={cn('overflow-hidden border-amber-200 dark:border-amber-500/30', st === 'passed' && 'border-emerald-200 dark:border-emerald-500/30')}>
              <div className={cn('flex flex-wrap items-center justify-between gap-2 px-4 py-3', st === 'passed' ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-amber-50 dark:bg-amber-500/10')}>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  {st === 'passed' ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Wrench className="h-4 w-4 text-amber-600" />}
                  {st === 'passed' ? 'Auto-fixed on attempt 2 of 3' : `Auto-fix attempt ${attempt[snip.id] ?? 1} of 3`}
                </div>
                {st === 'retrying' && <Badge variant="warning"><RotateCw className="animate-spin" /> Retrying</Badge>}
              </div>
              <ol className="relative space-y-4 p-4 before:absolute before:bottom-6 before:left-[27px] before:top-6 before:w-px before:bg-border">
                {retryTimeline.map(t => {
                  const reached = t.attempt === 1 || (attempt[snip.id] ?? 1) >= 2;
                  const ok = t.status === 'passed' && st === 'passed';
                  return (
                    <li key={t.attempt} className={cn('relative flex gap-3 transition-opacity', !reached && 'opacity-40')}>
                      <span className={cn('relative z-10 grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white ring-4 ring-card', t.status === 'failed' ? 'bg-red-500' : ok ? 'bg-emerald-500' : 'bg-amber-500')}>{t.attempt}</span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">Attempt {t.attempt}: {t.status === 'failed' ? t.title : ok ? t.title : 'Applying fix…'}<span className="font-mono text-[11px] font-normal text-muted-foreground">{t.at}</span></div>
                        <p className="text-xs text-muted-foreground">{t.status === 'failed' || ok ? t.detail : 'Generator is rewriting the snippet using the failure log.'}</p>
                      </div>
                    </li>
                  );
                })}
                <li className="relative flex gap-3 opacity-40"><span className="relative z-10 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-muted text-[11px] font-bold text-muted-foreground ring-4 ring-card">3</span><div className="text-sm">Attempt 3 <span className="text-xs text-muted-foreground">· not needed</span></div></li>
              </ol>
            </Card>
          )}

          <Card className="min-w-0 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2 font-semibold"><SnippetIcon status={st} /> {snip.name}</div>
                <div className="text-xs text-muted-foreground">{snip.location} · {showFixed ? 'fixed version (attempt 2)' : 'generated version'}</div>
              </div>
              <Button variant="outline" size="sm" onClick={() => runIds([snip.id])} disabled={running}><RotateCw /> Re-run</Button>
            </div>
            <CodeEditor value={code} onChange={v => setCodeEdits(c => ({ ...c, [snip.id]: v }))} minRows={8} />
          </Card>

          <Tabs defaultValue="diff">
            <TabsList>
              <TabsTrigger value="diff">Expected vs Actual</TabsTrigger>
              <TabsTrigger value="tests">Tests {testsDone && `(${testsPassed}/${tests.length})`}</TabsTrigger>
              <TabsTrigger value="console">Console</TabsTrigger>
            </TabsList>
            <TabsContent value="diff">
              {actual ? <Diff expected={snip.expected} actual={actual} /> : <Card className="grid h-32 place-items-center text-sm text-muted-foreground">{st === 'running' ? <span className="inline-flex items-center gap-2"><Clock className="h-4 w-4 animate-pulse" /> Running…</span> : 'Run this snippet to compare output.'}</Card>}
            </TabsContent>
            <TabsContent value="tests">
              <Card>
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
                  <div><CardTitle className="text-sm">JUnit 5 · {snip.location}</CardTitle><CardDescription>Reference solution must pass, naive solution must fail.</CardDescription></div>
                  {testsDone && <Badge variant={testsPassed === tests.length ? 'success' : 'danger'}>{testsPassed}/{tests.length} passed</Badge>}
                </CardHeader>
                <CardContent>
                  <ul className="divide-y rounded-lg border">
                    {tests.map(t => (
                      <li key={t.name} className="flex items-center gap-2 px-3 py-2 text-sm">
                        {!testsDone ? <span className="h-4 w-4 rounded-full border-2 border-dashed border-muted-foreground/30" /> : t.pass ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                        <span className="flex-1 font-mono text-xs">{t.name}</span>
                        {testsDone && !t.pass && 'error' in t && <span className="hidden font-mono text-[11px] text-red-600 md:inline">{(t as { error?: string }).error}</span>}
                        <span className="text-[11px] text-muted-foreground">{t.ms} ms</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="console"><Terminal lines={lines} className="h-72" title="sandbox console" /></TabsContent>
          </Tabs>

          <Terminal lines={lines.slice(-8)} className="h-44" title="live output" />

          {nPassed === total && !running && (
            <Card className="flex flex-col items-start justify-between gap-3 border-emerald-200 bg-emerald-50/60 p-4 sm:flex-row sm:items-center dark:border-emerald-500/20 dark:bg-emerald-500/5">
              <div className="flex items-center gap-3"><ShieldCheck className="h-6 w-6 text-emerald-600" /><div><div className="font-semibold">All {total} snippets verified</div><div className="text-sm text-muted-foreground">1 auto-fixed · report generated</div></div></div>
              <div className="flex gap-2"><Button variant="outline" onClick={() => navigate('/reports?open=rep-100')}>View report</Button><Button variant="gradient" onClick={() => navigate('/exports')}>Continue to export</Button></div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Verification() {
  const { contents } = useStore();
  const [params] = useSearchParams();
  const { courses } = useStore();
  const [course, setCourse] = React.useState(params.get('course') ?? courses.find(c => contents[c.id]?.live)?.id ?? 'java-oop');
  return contents[course]?.live ? <LiveVerification key={course} courseId={course} setCourse={setCourse} /> : <MockVerification course={course} setCourse={setCourse} />;
}
