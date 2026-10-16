import * as React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api, useApi } from '@/lib/api';
import { AlertTriangle, Check, CheckCircle2, Download, FileArchive, FileText, FileType2, History, Loader2, Package, Presentation, ScrollText, ListChecks, FlaskConical, NotebookPen, RotateCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/controls';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/misc';
import { PageHeader } from '@/components/shared/common';
import { exportFormats, exportHistory, layoutChecks } from '@/lib/mock-data';
import { mockContent } from '@/lib/content';
import { useStore } from '@/lib/store';
import { cn, sleep, timeAgo } from '@/lib/utils';

const ICON: Record<string, typeof FileText> = { pptx: Presentation, pdf: FileType2, notes: NotebookPen, code: FileArchive, exercises: FlaskConical, quiz: ListChecks, cheat: ScrollText };
const TONE: Record<string, string> = { PPTX: 'from-orange-500 to-red-500', PDF: 'from-rose-500 to-red-600', ZIP: 'from-slate-600 to-slate-800' };

export default function Exports() {
  const navigate = useNavigate();
  const { courses, contents } = useStore();
  const { online } = useApi();
  const [params] = useSearchParams();
  const exportable = courses.filter(c => c.status === 'verified' || c.status === 'review');
  const [courseId, setCourseId] = React.useState(params.get('course') ?? exportable.find(c => contents[c.id]?.live)?.id ?? exportable[0]?.id ?? 'java-oop');
  const course = courses.find(c => c.id === courseId) ?? courses[0];
  const content = React.useMemo(() => contents[course.id] ?? mockContent(course.title, course.level, course.durationMin, course.runtime, course.language), [contents, course]);
  const [busy, setBusy] = React.useState<string | null>(null);
  const [done, setDone] = React.useState<string[]>([]);
  const [pkgOpen, setPkgOpen] = React.useState(false);
  const [pkgPct, setPkgPct] = React.useState(0);
  const [pkgStep, setPkgStep] = React.useState(0);
  const [pkgReady, setPkgReady] = React.useState<null | (() => Promise<void>)>(null);
  const [history, setHistory] = React.useState(exportHistory);

  const download = async (id: string, label: string, _ext?: string, _size?: string) => {
    setBusy(id);
    try {
      if (online) {
        const name = await api.download(id, { course, content });
        toast.success(`${label} downloaded`, { description: name });
        setDone(d => [...new Set([...d, id])]);
      } else {
        toast.error(`Cannot export ${label}`, { description: 'Backend server is offline. Please start the local server.' });
      }
    } catch (e) {
      toast.error(`Could not export ${label}`, { description: e instanceof Error ? e.message : undefined });
    }
    setBusy(null);
  };

  const PKG_STEPS = ['Rendering slides', 'Embedding fonts', 'Bundling code & tests', 'Validating layout', 'Compressing package'];
  const exportAll = async () => {
    setPkgOpen(true);
    setPkgPct(15);
    setPkgStep(0);
    setPkgReady(null);

    // Smoothly progress through preparation steps
    for (let i = 0; i < PKG_STEPS.length - 1; i++) {
      setPkgStep(i);
      setPkgPct((i + 1) * 20);
      await sleep(150);
    }
    setPkgStep(PKG_STEPS.length - 1);
    setPkgPct(90);

    const downloadPackage = async () => {
      await api.download('package', { course, content });
    };

    setPkgReady(() => downloadPackage);

    try {
      if (online) {
        await downloadPackage();
        setPkgStep(PKG_STEPS.length);
        setPkgPct(100);
        toast.success('Package downloaded', { description: 'All 8 files bundled into one ZIP' });
        setHistory(h => [{ id: 'ex' + Date.now(), course: course.title, version: `v${course.version}`, format: 'Full package', size: 'ZIP bundle', date: new Date().toISOString() }, ...h]);
      } else {
        setPkgStep(PKG_STEPS.length);
        setPkgPct(100);
        toast.error('Export failed', { description: 'API server is offline' });
      }
    } catch (e) {
      setPkgStep(PKG_STEPS.length);
      setPkgPct(100);
      toast.error('Export failed', { description: e instanceof Error ? e.message : undefined });
    }
  };

  return (
    <div>
      <PageHeader eyebrow="Resources" title="Exports & Downloads" description="Download verified course material in every format, individually or as one package."
        actions={
          <Select value={courseId} onValueChange={setCourseId}>
            <SelectTrigger className="w-[260px]" aria-label="Course"><SelectValue /></SelectTrigger>
            <SelectContent>{exportable.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}</SelectContent>
          </Select>
        } />

      {/* Package hero */}
      <Card className="mb-6 overflow-hidden">
        <div className="flex flex-col gap-5 bg-gradient-to-r from-indigo-600/[.06] via-violet-600/[.06] to-transparent p-5 sm:flex-row sm:items-center sm:p-6">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand-gradient text-white shadow-lg shadow-indigo-500/25"><Package className="h-6 w-6" /></div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-semibold">{course.title}</h2><Badge variant="success"><CheckCircle2 /> {course.snippets.passed}/{course.snippets.total} verified</Badge><Badge variant="secondary">v{course.version}</Badge></div>
            <p className="mt-0.5 text-sm text-muted-foreground">Everything below in one ZIP: slides, notes, code, exercises, quiz, cheat sheet and report{contents[course.id]?.live ? ' · real files' : ' · sample data'}</p>
          </div>
          <Button variant="gradient" size="lg" onClick={exportAll}><Package /> Export Full Course Package</Button>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
          {exportFormats.map(f => {
            const Icon = ICON[f.id] ?? FileText;
            return (
              <Card key={f.id} className="card-hover flex flex-col p-5">
                <div className="flex items-start justify-between">
                  <div className={cn('grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br text-white shadow-md', TONE[f.ext] ?? 'from-indigo-500 to-violet-500')}><Icon className="h-5 w-5" /></div>
                  <Badge variant="outline" className="font-mono">{f.ext}</Badge>
                </div>
                <div className="mt-4 font-semibold">{f.label}</div>
                <div className="mt-0.5 text-sm text-muted-foreground">{f.desc}</div>
                <div className="mt-auto flex items-center justify-between pt-5">
                  <span className="text-xs text-muted-foreground">{f.size}</span>
                  <Button size="sm" variant={done.includes(f.id) ? 'outline' : 'default'} onClick={() => download(f.id, f.label, f.ext, f.size)} loading={busy === f.id}>
                    {busy !== f.id && (done.includes(f.id) ? <Check /> : <Download />)} {done.includes(f.id) ? 'Downloaded' : 'Download'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        <Card className="h-fit">
          <CardHeader><CardTitle>Layout validation</CardTitle><CardDescription>Checked on the rendered PPTX and PDF</CardDescription></CardHeader>
          <CardContent className="space-y-2">
            {layoutChecks.map(c => (
              <div key={c.label} className={cn('flex gap-3 rounded-lg border p-3', !c.ok && 'border-amber-200 bg-amber-50/60 dark:border-amber-500/20 dark:bg-amber-500/5')}>
                {c.ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />}
                <div><div className="text-sm font-medium">{c.label} {c.ok ? '✓' : '⚠'}</div><div className="text-xs text-muted-foreground">{c.detail}</div></div>
              </div>
            ))}
            <Button variant="outline" className="mt-2 w-full" onClick={() => navigate(`/studio/${course.id}`)}>Review slides in Studio</Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader className="flex-row items-center gap-2 space-y-0"><History className="h-4 w-4 text-muted-foreground" /><CardTitle>Export history</CardTitle></CardHeader>
        <Table>
          <THead><TR className="hover:bg-transparent"><TH>Course</TH><TH>Version</TH><TH>Format</TH><TH className="hidden sm:table-cell">Size</TH><TH>Exported</TH><TH className="text-right">Action</TH></TR></THead>
          <TBody>
            {history.map(h => (
              <TR key={h.id}>
                <TD className="font-medium">{h.course}</TD>
                <TD><Badge variant="secondary" className="font-mono">{h.version}</Badge></TD>
                <TD>{h.format}</TD>
                <TD className="hidden text-muted-foreground sm:table-cell">{h.size}</TD>
                <TD className="whitespace-nowrap text-muted-foreground">{timeAgo(h.date)}</TD>
                <TD className="text-right">
                  <Button variant="ghost" size="sm" onClick={async () => {
                    try {
                      await api.download('package', { course, content });
                      toast.success(`Re-downloaded ${h.course} ${h.version}`);
                    } catch (e) {
                      toast.error('Download failed', { description: e instanceof Error ? e.message : undefined });
                    }
                  }}>
                    <RotateCw /> Re-download
                  </Button>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Card>

      <Dialog open={pkgOpen} onOpenChange={o => { if (pkgPct >= 100 || !o) setPkgOpen(o); }}>
        <DialogContent hideClose={pkgPct < 100} onPointerDownOutside={e => pkgPct < 100 && e.preventDefault()}>
          <div className="flex items-center gap-3">
            <div className={cn('grid h-11 w-11 place-items-center rounded-xl text-white', pkgPct >= 100 ? 'bg-emerald-500' : 'bg-brand-gradient')}>{pkgPct >= 100 ? <Check className="h-5 w-5" /> : <Package className="h-5 w-5 animate-pulse" />}</div>
            <div><DialogTitle>{pkgPct >= 100 ? 'Package ready' : 'Exporting full course package'}</DialogTitle><DialogDescription>{course.title} · v{course.version}</DialogDescription></div>
          </div>
          <Progress value={pkgPct} className="h-2.5" />
          <ul className="space-y-1.5 text-sm">
            {PKG_STEPS.map((s, i) => (
              <li key={s} className={cn('flex items-center gap-2', i > pkgStep && 'text-muted-foreground')}>
                {i < pkgStep ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : i === pkgStep ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <span className="h-4 w-4 rounded-full border-2 border-dashed border-muted-foreground/30" />}{s}
              </li>
            ))}
          </ul>
          {pkgPct >= 100 && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setPkgOpen(false)}>Close</Button>
              <Button variant="gradient" onClick={async () => {
                try {
                  if (pkgReady) {
                    await pkgReady();
                  } else {
                    await api.download('package', { course, content });
                  }
                  toast.success('Package downloaded', { description: 'All 8 files in one ZIP' });
                  setPkgOpen(false);
                } catch (e) {
                  toast.error('Export failed', { description: e instanceof Error ? e.message : undefined });
                }
              }}>
                <Download /> Download ZIP
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
