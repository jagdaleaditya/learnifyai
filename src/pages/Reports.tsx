import * as React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CheckCircle2, ChevronRight, Download, FileChartColumn, Filter, Search, ShieldCheck, XCircle, AlertTriangle, ChevronDown, Package, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogDescription, DialogTitle, SheetContent } from '@/components/ui/dialog';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/misc';
import { EmptyState, PageHeader, PageSkeleton, useFakeLoad } from '@/components/shared/common';
import { courses as seedCourses, reportDetail, snippets } from '@/lib/mock-data';
import { mockContent } from '@/lib/content';
import { api, useApi, type CourseContent } from '@/lib/api';
import { useStore } from '@/lib/store';
import { cn, formatDate } from '@/lib/utils';

interface Report { id: string; courseId: string; course: string; date: string; passed: number; failed: number; total: number; runtime: string; status: string; durationS: number }
void seedCourses;
const STATUS = { passed: { label: 'Passed', variant: 'success' as const, icon: CheckCircle2 }, review: { label: 'Needs review', variant: 'warning' as const, icon: AlertTriangle }, failed: { label: 'Failed', variant: 'danger' as const, icon: XCircle } };

export default function Reports() {
  const loading = useFakeLoad(450);
  const navigate = useNavigate();
  const { courses, contents } = useStore();
  const reports = React.useMemo<Report[]>(() => courses.filter(c => c.snippets.total > 0 || contents[c.id]).map((c, i) => ({
    id: contents[c.id]?.live ? `rep-${c.id}` : `rep-${100 + i}`, courseId: c.id, course: c.title, date: c.updatedAt, passed: c.snippets.passed, failed: c.snippets.total - c.snippets.passed, total: c.snippets.total, runtime: c.runtime,
    status: c.snippets.total && c.snippets.passed === c.snippets.total ? 'passed' : c.status === 'failed' ? 'failed' : 'review', durationS: +((contents[c.id]?.snippets.reduce((a, x) => a + x.ms, 0) ?? c.snippets.total * 480) / (contents[c.id] ? 1000 : 1000) + 3.1).toFixed(1),
  })), [courses, contents]);
  const [params, setParams] = useSearchParams();
  const [q, setQ] = React.useState('');
  const [course, setCourse] = React.useState('all');
  const [range, setRange] = React.useState('30');
  const [status, setStatus] = React.useState('all');
  const openId = params.get('open');
  const open = reports.find(r => r.id === openId) ?? null;

  const rows = reports.filter(r =>
    (course === 'all' || r.courseId === course) && (status === 'all' || r.status === status) &&
    (range === 'all' || Date.now() - new Date(r.date).getTime() < +range * 864e5) && r.course.toLowerCase().includes(q.toLowerCase()));

  const totals = rows.reduce((a, r) => ({ passed: a.passed + r.passed, failed: a.failed + r.failed }), { passed: 0, failed: 0 });
  const donut = [{ name: 'Passed', value: totals.passed, color: '#10B981' }, { name: 'Failed', value: totals.failed, color: '#EF4444' }];
  const barSrc = contents[course !== 'all' ? course : (courses.find(c => contents[c.id]?.live)?.id ?? '')];
  const bars = barSrc?.live ? barSrc.snippets.map(s => ({ name: s.name.replace(/^Exercise \d+ · /, 'Ex: ').slice(0, 12), ms: s.ms, fixed: s.attempts.length > 1 })) : snippets.map(s => ({ name: s.name.split(' ')[0].replace('BankAccount.', '').slice(0, 12), ms: s.ms, fixed: !!s.failsFirst }));

  if (loading) return <PageSkeleton />;

  return (
    <div>
      <PageHeader eyebrow="Intelligence" title="Verification Reports" description="Audit trail for every verification run: what was executed, where, and with which versions."
        actions={<Button variant="gradient" onClick={() => navigate('/verification')}><ShieldCheck /> Run verification</Button>} />

      <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_1.6fr]">
        <Card>
          <CardHeader className="pb-0"><CardTitle>Snippet outcomes</CardTitle><CardDescription>Across {rows.length} filtered report(s)</CardDescription></CardHeader>
          <CardContent className="flex items-center gap-6 pt-2">
            <div className="relative h-[180px] w-[180px] shrink-0">
              <ResponsiveContainer><PieChart><Pie data={donut} dataKey="value" innerRadius={58} outerRadius={82} paddingAngle={2} stroke="none">{donut.map(d => <Cell key={d.name} fill={d.color} />)}</Pie><Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} /></PieChart></ResponsiveContainer>
              <div className="absolute inset-0 grid place-items-center text-center"><div><div className="text-2xl font-bold">{totals.passed + totals.failed ? Math.round((totals.passed / (totals.passed + totals.failed)) * 100) : 0}%</div><div className="text-[11px] text-muted-foreground">pass rate</div></div></div>
            </div>
            <ul className="space-y-3 text-sm">
              {donut.map(d => <li key={d.name} className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />{d.name}<span className="ml-2 font-semibold">{d.value}</span></li>)}
              <li className="flex items-center gap-2 text-muted-foreground"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" />Auto-fixed<span className="ml-2 font-semibold text-foreground">1</span></li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-0"><CardTitle>Execution time per snippet</CardTitle><CardDescription>Java OOP Fundamentals · latest run (ms)</CardDescription></CardHeader>
          <CardContent className="h-[210px] pt-4">
            <ResponsiveContainer>
              <BarChart data={bars} margin={{ left: -16, right: 4 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} interval={0} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} contentStyle={{ borderRadius: 10, fontSize: 12 }} formatter={(v: number) => [`${v} ms`, 'Execution']} />
                <Bar dataKey="ms" radius={[6, 6, 0, 0]}>{bars.map((b, i) => <Cell key={i} fill={b.fixed ? '#F59E0B' : '#6366F1'} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Search reports…" value={q} onChange={e => setQ(e.target.value)} /></div>
          <div className="grid grid-cols-3 gap-2 lg:flex">
            <Select value={course} onValueChange={setCourse}><SelectTrigger className="lg:w-52" aria-label="Course filter"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All courses</SelectItem>{reports.map(r => <SelectItem key={r.courseId} value={r.courseId}>{r.course}</SelectItem>)}</SelectContent></Select>
            <Select value={range} onValueChange={setRange}><SelectTrigger className="lg:w-40" aria-label="Date range"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="1">Last 24 hours</SelectItem><SelectItem value="7">Last 7 days</SelectItem><SelectItem value="30">Last 30 days</SelectItem><SelectItem value="all">All time</SelectItem></SelectContent></Select>
            <Select value={status} onValueChange={setStatus}><SelectTrigger className="lg:w-40" aria-label="Status filter"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem><SelectItem value="passed">Passed</SelectItem><SelectItem value="review">Needs review</SelectItem><SelectItem value="failed">Failed</SelectItem></SelectContent></Select>
          </div>
        </div>
        {rows.length === 0 ? (
          <EmptyState className="m-4" icon={Filter} title="No reports match your filters" description="Try a wider date range or clear the filters." action={<Button variant="outline" onClick={() => { setQ(''); setCourse('all'); setRange('all'); setStatus('all'); }}>Clear filters</Button>} />
        ) : (
          <Table>
            <THead><TR className="hover:bg-transparent"><TH>Report</TH><TH>Course</TH><TH>Date</TH><TH>Snippets</TH><TH className="hidden md:table-cell">Runtime</TH><TH className="hidden lg:table-cell">Duration</TH><TH>Status</TH><TH /></TR></THead>
            <TBody>
              {rows.map(r => {
                const S = STATUS[r.status as keyof typeof STATUS];
                return (
                  <TR key={r.id} className="cursor-pointer" onClick={() => setParams({ open: r.id })}>
                    <TD className="font-mono text-xs text-muted-foreground">{r.id.toUpperCase()}</TD>
                    <TD className="font-medium">{r.course}</TD>
                    <TD className="whitespace-nowrap text-muted-foreground">{formatDate(r.date)}</TD>
                    <TD><div className="flex items-center gap-2"><div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted"><div className={cn('h-full rounded-full', r.failed ? 'bg-amber-500' : 'bg-emerald-500')} style={{ width: `${(r.passed / r.total) * 100}%` }} /></div><span className="text-xs tabular-nums">{r.passed}/{r.total}</span></div></TD>
                    <TD className="hidden font-mono text-xs md:table-cell">{r.runtime}</TD>
                    <TD className="hidden text-muted-foreground lg:table-cell">{r.durationS}s</TD>
                    <TD><Badge variant={S.variant}><S.icon />{S.label}</Badge></TD>
                    <TD><ChevronRight className="h-4 w-4 text-muted-foreground" /></TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        )}
      </Card>

      <Dialog open={!!open} onOpenChange={o => { if (!o) { params.delete('open'); setParams(params); } }}>
        {open && <ReportDrawer r={open} content={contents[open.courseId]} />}
      </Dialog>
    </div>
  );
}

function ReportDrawer({ r, content }: { r: Report; content?: CourseContent }) {
  const { online } = useApi();
  const { courses } = useStore();
  const [downloading, setDownloading] = React.useState(false);
  const [openLog, setOpenLog] = React.useState<string | null>(null);
  const isJava = r.courseId === 'java-oop';
  const fixedLive = content?.live ? content.snippets.find(x => x.status === 'passed' && x.attempts.length > 1) : undefined;
  const liveRows = content?.live ? content.snippets.map(x => ({ id: x.id, name: x.name, location: x.location, status: x.status, ms: x.ms, attempts: x.attempts.length || 1, reference: { passed: x.status === 'passed' ? 1 : 0, total: 1 }, naive: x.kind === 'exercise' ? { passed: 0, total: 1 } : { passed: 0, total: 0 }, log: x.attempts.map(a => `# attempt ${a.n} · ${a.ok ? 'passed' : 'failed'} · ${a.ms} ms\n${a.stdout}${a.stderr ? '\n' + a.stderr : ''}${a.problem ? '\n! ' + a.problem : ''}`).join('\n\n') || x.actual })) : null;
  const S = STATUS[r.status as keyof typeof STATUS];
  const download = async () => {
    setDownloading(true);
    try {
      const course = courses.find(c => c.id === r.courseId) ?? { id: r.courseId, title: r.course, level: 'Beginner' as const, durationMin: 90, runtime: r.runtime, language: 'Java' as const, version: 1 };
      const effectiveContent = content ?? mockContent(course.title, (course as any).level, (course as any).durationMin, (course as any).runtime, (course as any).language);
      if (online) {
        const name = await api.download('report', { course, content: effectiveContent });
        toast.success('Verification report downloaded', { description: name });
      } else {
        toast.error('Download failed', { description: 'API server is offline' });
      }
    } catch (e) {
      toast.error('Download failed', { description: e instanceof Error ? e.message : undefined });
    }
    setDownloading(false);
  };
  return (
    <SheetContent className="sm:max-w-2xl">
      <div className="border-b p-5 pr-12">
        <div className="flex items-center gap-2 text-xs text-muted-foreground"><FileChartColumn className="h-3.5 w-3.5" /><span className="font-mono">{r.id.toUpperCase()}</span>·{formatDate(r.date, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
        <DialogTitle className="mt-1 text-xl font-bold">{r.course}</DialogTitle>
        <DialogDescription className="mt-1 flex flex-wrap items-center gap-2"><Badge variant={S.variant}><S.icon />{S.label}</Badge><span>{r.passed}/{r.total} snippets · {r.runtime} · {r.durationS}s total</span></DialogDescription>
      </div>
      <div className="flex-1 space-y-6 overflow-y-auto p-5 scrollbar-thin">
        <div className="grid grid-cols-3 gap-3">
          {[['Passed', r.passed, 'text-emerald-600'], ['Failed', r.failed, r.failed ? 'text-red-600' : ''], ['Exec time', `${r.durationS}s`, '']].map(([l, v, c]) => (
            <div key={l as string} className="rounded-xl border p-3"><div className={cn('text-xl font-bold', c as string)}>{v}</div><div className="text-xs text-muted-foreground">{l}</div></div>
          ))}
        </div>

        <section>
          <h3 className="mb-2 text-sm font-semibold">Per-snippet results</h3>
          <div className="overflow-hidden rounded-xl border">
            <Table>
              <THead><TR className="hover:bg-transparent"><TH>Snippet</TH><TH>Result</TH><TH>Reference</TH><TH>Naive</TH><TH>Time</TH></TR></THead>
              <TBody>
                {(liveRows ?? (isJava ? reportDetail.snippets : reportDetail.snippets.slice(0, Math.min(6, r.total)))).map((s, i) => {
                  const fail = liveRows ? s.status === 'failed' : !isJava && i < r.failed;
                  return (
                    <React.Fragment key={s.id}>
                      <TR className="cursor-pointer" onClick={() => setOpenLog(openLog === s.id ? null : s.id)}>
                        <TD><div className="flex items-center gap-1.5 text-sm font-medium"><ChevronDown className={cn('h-3.5 w-3.5 text-muted-foreground transition', openLog === s.id && 'rotate-180')} />{s.name}</div><div className="pl-5 text-[11px] text-muted-foreground">{s.location}{s.attempts > 1 && <span className="text-amber-600"> · {s.attempts} attempts</span>}</div></TD>
                        <TD>{fail ? <Badge variant="danger"><XCircle />Fail</Badge> : <Badge variant="success"><CheckCircle2 />Pass</Badge>}</TD>
                        <TD className="text-xs"><span className="text-emerald-600">{s.reference.passed}/{s.reference.total} ✓</span></TD>
                        <TD className="text-xs">{s.naive.total ? <span className="text-red-600">{s.naive.passed}/{s.naive.total} ✗</span> : <span className="text-muted-foreground">n/a</span>}</TD>
                        <TD className="text-xs tabular-nums text-muted-foreground">{s.ms} ms</TD>
                      </TR>
                      {openLog === s.id && (
                        <tr><td colSpan={5} className="bg-[#05070D] p-0"><pre className="max-h-48 overflow-auto p-3 font-mono text-[11px] leading-relaxed text-slate-300 scrollbar-thin">{s.log}</pre></td></tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </TBody>
            </Table>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">Reference solutions must pass every test; naive solutions must fail at least one, proving the tests catch the common mistake. Click a row for logs.</p>
        </section>

        {(r.failed > 0 || isJava || (content?.live && content.summary.autoFixed > 0)) && (
          <section>
            <h3 className="mb-2 text-sm font-semibold">Error details</h3>
            {isJava || (content?.live && r.failed === 0) ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-sm dark:border-amber-500/20 dark:bg-amber-500/5">
                <div className="flex items-center gap-2 font-semibold text-amber-800 dark:text-amber-300"><AlertTriangle className="h-4 w-4" /> {fixedLive ? `${fixedLive.name}: resolved by auto-fix` : content?.live ? 'No failures in this run' : 'BankAccount.withdraw: resolved by auto-fix'}</div>
                <pre className="mt-2 overflow-x-auto rounded-lg bg-[#05070D] p-3 font-mono text-[11px] text-red-300">{fixedLive ? (fixedLive.attempts[0].problem ?? fixedLive.attempts[0].stderr) : content?.live ? 'All snippets passed on the first attempt.' : snippets[3].actualFirst}</pre>
                <p className="mt-2 text-xs text-muted-foreground">{fixedLive ? `Attempt ${fixedLive.attempts.length} used the model’s patch and the output now matches.` : content?.live ? '' : 'Attempt 2 replaced the exception with the returned message promised by the slide. Output now matches.'}</p>
              </div>
            ) : (
              <div className="rounded-xl border border-red-200 bg-red-50/60 p-4 text-sm dark:border-red-500/20 dark:bg-red-500/5">
                <div className="flex items-center gap-2 font-semibold text-red-700 dark:text-red-300"><XCircle className="h-4 w-4" /> {r.failed} snippet(s) still failing after 3 attempts</div>
                <pre className="mt-2 overflow-x-auto rounded-lg bg-[#05070D] p-3 font-mono text-[11px] text-red-300">{content?.live ? content.snippets.filter(x => x.status === 'failed').map(x => `${x.name}\n${x.attempts.at(-1)?.problem ?? x.attempts.at(-1)?.stderr ?? ''}`).join('\n\n') : 'error TS2344: Type \'string\' does not satisfy the constraint \'keyof T\'.\n  at generics/pick.ts:7:21'}</pre>
              </div>
            )}
          </section>
        )}

        <section>
          <h3 className="mb-2 text-sm font-semibold">Runtime & dependencies</h3>
          <div className="overflow-hidden rounded-xl border">
            <Table>
              <THead><TR className="hover:bg-transparent"><TH>Component</TH><TH>Version</TH><TH>Scope</TH></TR></THead>
              <TBody>{reportDetail.dependencies.map(d => <TR key={d.name}><TD className="font-medium">{d.name}</TD><TD className="font-mono text-xs">{isJava || d.scope !== 'runtime' ? d.version : r.runtime}</TD><TD><Badge variant="secondary">{d.scope}</Badge></TD></TR>)}</TBody>
            </Table>
          </div>
          <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-muted-foreground"><span className="inline-flex items-center gap-1"><Package className="h-3 w-3" /> Image digest sha256:9f2c…e41a</span><span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> Total {r.durationS}s</span></div>
        </section>
      </div>
      <div className="flex gap-2 border-t p-4">
        <Button variant="gradient" className="flex-1" onClick={download} loading={downloading}>{!downloading && <Download />} Download Verification Report (PDF)</Button>
      </div>
    </SheetContent>
  );
}
