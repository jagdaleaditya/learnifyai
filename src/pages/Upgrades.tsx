import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, CheckCircle2, CircleArrowUp, Download, Loader2, Radar, RotateCcw, ShieldCheck, X, FileDiff } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/controls';
import { EmptyState, PageHeader } from '@/components/shared/common';
import { CodeBlock } from '@/components/shared/code';
import { upgradeFindings, upgradePaths } from '@/lib/mock-data';
import { useStore } from '@/lib/store';
import { cn, sleep } from '@/lib/utils';

type Decision = 'accepted' | 'rejected' | undefined;
const SEV = { high: 'danger', medium: 'warning', low: 'info' } as const;

export default function Upgrades() {
  const navigate = useNavigate();
  const { courses, updateCourse } = useStore();
  const [path, setPath] = React.useState(upgradePaths[0].id);
  const [phase, setPhase] = React.useState<'idle' | 'scanning' | 'review' | 'verifying' | 'done'>('idle');
  const [scanPct, setScanPct] = React.useState(0);
  const [decisions, setDecisions] = React.useState<Record<string, Decision>>({});
  const [verifyPct, setVerifyPct] = React.useState(0);
  const [verified, setVerified] = React.useState<string[]>([]);
  const p = upgradePaths.find(x => x.id === path)!;
  const course = courses.find(c => c.id === p.courseId)!;
  const findings = upgradeFindings[path];
  const accepted = findings.filter(f => decisions[f.id] === 'accepted');
  const pending = findings.filter(f => !decisions[f.id]).length;

  const scan = async () => {
    setPhase('scanning'); setScanPct(0); setDecisions({}); setVerified([]);
    for (let i = 1; i <= 20; i++) { await sleep(70); setScanPct(i * 5); }
    setPhase('review');
    toast(`${findings.length} changes found`, { description: `${p.from} → ${p.to} in ${course.title}` });
  };

  const reverify = async () => {
    if (!accepted.length) { toast.error('Accept at least one change first'); return; }
    setPhase('verifying'); setVerifyPct(0); setVerified([]);
    for (let i = 0; i < accepted.length; i++) {
      await sleep(700);
      setVerified(v => [...v, accepted[i].id]);
      setVerifyPct(Math.round(((i + 1) / accepted.length) * 100));
    }
    setPhase('done');
    updateCourse(course.id, { runtime: p.to === 'React 18' ? 'React 18.3.1' : 'Java 21.0.2', version: course.version + 1 });
    toast.success('All changed examples re-verified', { description: `${course.title} is now on ${p.to} (v${course.version + 1})` });
  };

  return (
    <div>
      <PageHeader eyebrow="Intelligence" title="Version Upgrades" description="Move an existing course to a newer framework or language version. Every changed example is re-run before you accept it." />

      <Card className="mb-6 p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="grid gap-3 sm:grid-cols-2">
            {upgradePaths.map(u => {
              const c = courses.find(x => x.id === u.courseId)!;
              return (
                <button key={u.id} onClick={() => { setPath(u.id); setPhase('idle'); setDecisions({}); }} disabled={phase === 'scanning' || phase === 'verifying'}
                  className={cn('rounded-xl border p-4 text-left transition', path === u.id ? 'border-primary bg-primary/5 ring-2 ring-primary/15' : 'hover:border-primary/40')}>
                  <div className="text-sm font-semibold">{c.title}</div>
                  <div className="mt-2 flex items-center gap-2 text-sm"><Badge variant="slate" className="font-mono">{u.from}</Badge><ArrowRight className="h-4 w-4 text-muted-foreground" /><Badge className="font-mono">{u.to}</Badge></div>
                  <div className="mt-2 text-xs text-muted-foreground">{c.slides} slides · {c.snippets.total} snippets · v{c.version}</div>
                </button>
              );
            })}
          </div>
          <Button variant="gradient" size="lg" onClick={scan} loading={phase === 'scanning'}>{phase !== 'scanning' && <Radar />} {phase === 'idle' ? 'Scan course' : 'Re-scan'}</Button>
        </div>
        {phase === 'scanning' && <div className="mt-4"><div className="mb-1.5 flex justify-between text-xs text-muted-foreground"><span>Scanning slides, examples and tests for {p.from} APIs…</span><span>{scanPct}%</span></div><Progress value={scanPct} /></div>}
      </Card>

      {phase === 'idle' ? (
        <EmptyState icon={CircleArrowUp} title="Scan a course to see what changes" description={`We’ll find deprecated APIs and behaviour changes between ${p.from} and ${p.to}, propose fixes and re-verify them.`} action={<Button variant="gradient" onClick={scan}><Radar /> Scan {course.title}</Button>} />
      ) : phase === 'scanning' ? (
        <div className="space-y-3">{[0, 1, 2].map(i => <div key={i} className="skeleton h-40 rounded-xl" />)}</div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
          <div className="min-w-0 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-semibold">{findings.length} findings <span className="font-normal text-muted-foreground">· {pending} awaiting review</span></h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setDecisions(Object.fromEntries(findings.map(f => [f.id, 'accepted'])))} disabled={phase !== 'review'}><Check /> Accept all</Button>
                <Button variant="ghost" size="sm" onClick={() => setDecisions({})} disabled={phase !== 'review'}><RotateCcw /> Reset</Button>
              </div>
            </div>
            {findings.map(f => {
              const d = decisions[f.id];
              return (
                <Card key={f.id} className={cn('overflow-hidden transition', d === 'accepted' && 'border-emerald-300 dark:border-emerald-500/40', d === 'rejected' && 'opacity-60')}>
                  <div className="flex flex-wrap items-start justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2"><Badge variant={SEV[f.severity]} className="capitalize">{f.severity}</Badge><span className="font-semibold">{f.title}</span></div>
                      <div className="mt-1 text-xs text-muted-foreground"><span className="font-mono">{f.location}</span> · {f.detail}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {verified.includes(f.id) && <Badge variant="success"><ShieldCheck /> Re-verified</Badge>}
                      {phase === 'verifying' && d === 'accepted' && !verified.includes(f.id) && <Badge variant="info"><Loader2 className="animate-spin" /> Verifying</Badge>}
                      <Button size="sm" variant={d === 'rejected' ? 'secondary' : 'outline'} disabled={phase !== 'review'} onClick={() => setDecisions(x => ({ ...x, [f.id]: d === 'rejected' ? undefined : 'rejected' }))}><X /> {d === 'rejected' ? 'Rejected' : 'Reject'}</Button>
                      <Button size="sm" variant={d === 'accepted' ? 'default' : 'outline'} className={cn(d === 'accepted' && 'bg-emerald-600 hover:bg-emerald-600/90')} disabled={phase !== 'review'} onClick={() => setDecisions(x => ({ ...x, [f.id]: d === 'accepted' ? undefined : 'accepted' }))}><Check /> {d === 'accepted' ? 'Accepted' : 'Accept'}</Button>
                    </div>
                  </div>
                  <div className="grid border-t md:grid-cols-2">
                    <div className="min-w-0"><div className="border-b bg-red-50/60 px-4 py-1.5 text-xs font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-300">− {p.from}</div><CodeBlock code={f.before} lang={path === 'react' ? 'jsx' : 'java'} copy={false} compact className="rounded-none border-0" highlight={f.before.split('\n').map((_, i) => i + 1).filter(i => !f.after.split('\n').includes(f.before.split('\n')[i - 1]))} /></div>
                    <div className="min-w-0 md:border-l"><div className="border-b bg-emerald-50/60 px-4 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">+ {p.to}</div><CodeBlock code={f.after} lang={path === 'react' ? 'jsx' : 'java'} copy={false} compact highlightTone="green" className="rounded-none border-0" highlight={f.after.split('\n').map((_, i) => i + 1).filter(i => !f.before.split('\n').includes(f.after.split('\n')[i - 1]))} /></div>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="space-y-4">
            <Card className="xl:sticky xl:top-0">
              <CardHeader><CardTitle>Re-verify changes</CardTitle><CardDescription>Runs every accepted change on {p.to} in the sandbox.</CardDescription></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Accepted</span><span className="font-semibold">{accepted.length}/{findings.length}</span></div>
                {(phase === 'verifying' || phase === 'done') && <Progress value={verifyPct} />}
                <Button variant="gradient" className="w-full" onClick={reverify} loading={phase === 'verifying'} disabled={phase === 'done'}>{phase !== 'verifying' && <ShieldCheck />} Re-verify all changed examples</Button>
              </CardContent>
            </Card>

            {phase === 'done' && (
              <Card className="animate-fade-up border-emerald-200 dark:border-emerald-500/30">
                <CardHeader className="pb-3"><div className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-emerald-600" /><CardTitle>Migration Summary</CardTitle></div><CardDescription>{course.title} · {p.from} → {p.to}</CardDescription></CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <dl className="grid grid-cols-2 gap-y-2">
                    <dt className="text-muted-foreground">Changes applied</dt><dd className="text-right font-semibold">{accepted.length}</dd>
                    <dt className="text-muted-foreground">Rejected</dt><dd className="text-right font-semibold">{findings.filter(f => decisions[f.id] === 'rejected').length}</dd>
                    <dt className="text-muted-foreground">Examples re-verified</dt><dd className="text-right font-semibold text-emerald-600">{verified.length}/{accepted.length} ✓</dd>
                    <dt className="text-muted-foreground">New version</dt><dd className="text-right font-mono font-semibold">v{course.version}</dd>
                  </dl>
                  <div className="flex flex-col gap-2 pt-1">
                    <Button variant="outline" onClick={() => toast.success('Migration summary downloaded', { description: `migration-${course.id}.pdf` })}><Download /> Download summary</Button>
                    <Button variant="gradient" onClick={() => navigate(`/studio/${course.id}`)}><FileDiff /> Open updated course</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
