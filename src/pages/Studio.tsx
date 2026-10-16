import * as React from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, Check, CheckCircle2, ChevronLeft, ChevronRight, Copy, Download, Eye, FileCode2, FlaskConical, GripVertical, ImageIcon, ListChecks,
  Maximize2, Pencil, Plus, RefreshCw, Save, ScrollText, ShieldCheck, Sparkles, Trash2, Wand2, X, Presentation, Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Textarea, Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Tip } from '@/components/ui/tooltip';
import { StatusBadge, Dot } from '@/components/shared/status';
import { SlideCanvas, defaultBrand, slideThemes, type Brand } from '@/components/shared/slide';
import { ConfirmDialog } from '@/components/shared/common';
import type { Slide } from '@/lib/mock-data';
import type { CourseContent } from '@/lib/api';
import { useCourse, useStore } from '@/lib/store';
import { api, runtimeLabel, useApi } from '@/lib/api';
import { mockContent } from '@/lib/content';
import { CodeExamples, Exercises, Quiz, CheatSheet, Diagrams } from './StudioTabs';
import { cn, sleep, timeAgo } from '@/lib/utils';

export default function Studio() {
  const { id } = useParams();
  return <StudioInner key={id} />;
}

function StudioInner() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const course = useCourse(id);
  const navigate = useNavigate();
  const { contents, patchContent } = useStore();
  const { online } = useApi();
  const content = React.useMemo(() => contents[course.id] ?? mockContent(course.title, course.level, course.durationMin, course.runtime), [contents, course]);
  const [slides, setSlides] = React.useState<Slide[]>(() => content.slides);
  const [active, setActive] = React.useState(0);
  const [dirty, setDirty] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [preview, setPreview] = React.useState(false);
  const [tab, setTab] = React.useState(params.get('tab') ?? 'slides');
  const [themeId, setThemeId] = React.useState<string>('indigo');
  const activeTheme = React.useMemo(() => slideThemes.find(t => t.id === themeId) ?? defaultBrand, [themeId]);

  React.useEffect(() => {
    if (params.get('new')) {
      toast.success('Welcome to the Studio', { description: 'Your course is generated and verified. Edit any slide, then export.' });
      params.delete('new'); setParams(params, { replace: true });
    }
  }, [params, setParams]);

  const update = (i: number, patch: Partial<Slide>) => { setSlides(s => s.map((x, j) => (j === i ? { ...x, ...patch } : x))); setDirty(true); };
  const save = async () => { setSaving(true); await sleep(700); if (content.live) patchContent(course.id, { slides }); setSaving(false); setDirty(false); toast.success('Changes saved', { description: `${course.title} · v${course.version + (dirty ? 1 : 0)} draft` }); };

  const verified = course.snippets.total ? `${course.snippets.passed}/${course.snippets.total}` : '14/14';
  const allPass = course.snippets.passed === course.snippets.total || !course.snippets.total;

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/courses')} aria-label="Back to courses"><ArrowLeft /></Button>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-xl font-bold tracking-tight">{course.title}</h1>
              {course.status !== 'verified' && <StatusBadge status={course.status} />}
              <Badge variant={allPass ? 'success' : 'warning'} className="font-semibold"><ShieldCheck /> {allPass ? 'Verified ✓' : 'Partially verified'} {verified} snippets</Badge>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">v{course.version} · {course.runtime} · {slides.length} slides · edited {timeAgo(course.updatedAt)}{dirty && <span className="ml-2 font-medium text-amber-600">● Unsaved changes</span>}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Template / Theme selector */}
          <div className="flex items-center gap-2 rounded-xl border bg-card px-3 py-1.5 shadow-sm text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-muted-foreground hidden sm:inline">Theme:</span>
            <select
              value={themeId}
              onChange={e => {
                setThemeId(e.target.value);
                const themeName = slideThemes.find(t => t.id === e.target.value)?.name ?? e.target.value;
                toast.success(`Theme applied: ${themeName}`);
              }}
              className="bg-transparent font-bold text-foreground outline-none cursor-pointer"
            >
              {slideThemes.map(t => (
                <option key={t.id} value={t.id} className="bg-popover text-popover-foreground">
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <Button variant="outline" onClick={() => setPreview(true)}><Eye /> Preview Slides</Button>
          <Button variant="outline" onClick={save} loading={saving}>{!saving && <Save />} Save</Button>
          <Button variant="outline" onClick={() => navigate(`/verification?course=${course.id}`)}><ShieldCheck /> Verify</Button>
          <Button variant="gradient" onClick={() => navigate(`/exports?course=${course.id}`)}><Download /> Export</Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <div className="overflow-x-auto scrollbar-thin">
          <TabsList className="h-auto w-max">
            <TabsTrigger value="slides"><Presentation /> Slides & Speaker Notes</TabsTrigger>
            <TabsTrigger value="code"><FileCode2 /> Runnable Code Examples</TabsTrigger>
            <TabsTrigger value="exercises"><FlaskConical /> Exercises & Automated Tests</TabsTrigger>
            <TabsTrigger value="quiz"><ListChecks /> Quiz & Answer Explanations</TabsTrigger>
            <TabsTrigger value="cheat"><ScrollText /> One-Page Cheat Sheet</TabsTrigger>
            <TabsTrigger value="diagrams"><ImageIcon /> Generated Diagrams</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="slides"><SlidesEditor slides={slides} setSlides={s => { setSlides(s); setDirty(true); }} active={active} setActive={setActive} update={update} onPreview={() => setPreview(true)} content={content} online={!!online} course={course} brand={activeTheme} /></TabsContent>
        <TabsContent value="code"><CodeExamples content={content} online={!!online} /></TabsContent>
        <TabsContent value="exercises"><Exercises content={content} online={!!online} /></TabsContent>
        <TabsContent value="quiz"><Quiz content={content} /></TabsContent>
        <TabsContent value="cheat"><CheatSheet title={course.title} runtime={course.runtime} content={content} /></TabsContent>
        <TabsContent value="diagrams"><Diagrams content={content} slides={slides} /></TabsContent>
      </Tabs>

      <PreviewModal open={preview} onOpenChange={setPreview} slides={slides} start={active} brand={activeTheme} />
    </div>
  );
}

/* ---------------- Slides editor ---------------- */

function SlidesEditor({ slides, setSlides, active, setActive, update, onPreview, content, online, course, brand }: {
  slides: Slide[]; setSlides: (s: Slide[]) => void; active: number; setActive: (i: number) => void; update: (i: number, p: Partial<Slide>) => void; onPreview: () => void;
  content: CourseContent; online: boolean; course: { title: string; language: string; level: string }; brand: Brand;
}) {
  const [dragFrom, setDragFrom] = React.useState<number | null>(null);
  const [dragOver, setDragOver] = React.useState<number | null>(null);
  const [instruction, setInstruction] = React.useState('');
  const [regen, setRegen] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const slide = slides[active] ?? slides[0];

  const move = (from: number, to: number) => {
    if (from === to) return;
    const s = [...slides]; const [m] = s.splice(from, 1); s.splice(to, 0, m);
    setSlides(s); setActive(to);
    toast(`Moved slide to position ${to + 1}`);
  };

  const regenerate = async () => {
    setRegen(true);
    if (content.live && online) {
      try {
        const r = await api.regenerateSlide({ slide, instruction, course: { title: course.title, language: content.language, level: course.level } });
        update(active, { ...r.slide });
        toast.success(`Slide ${active + 1} regenerated by ${r.provider}`, { description: r.verification ? `Code re-run: ${r.verification.status}${r.verification.attempts > 1 ? ` after ${r.verification.attempts} attempts` : ''}` : 'Only this slide was changed.' });
        setInstruction('');
      } catch (e) { toast.error('Could not regenerate the slide', { description: e instanceof Error ? e.message : undefined }); }
      setRegen(false);
      return;
    }
    update(active, { status: slide.code ? 'pending' : slide.status });
    await sleep(1600);
    const ins = instruction.trim().toLowerCase();
    const bullets = ins.includes('short') || ins.includes('concise') ? slide.bullets.slice(0, 2).map(b => b.split(' ').slice(0, 5).join(' '))
      : ins.includes('example') ? [...slide.bullets.slice(0, 2), 'Real-world example: a bank transfer between two accounts']
      : slide.bullets.map(b => b.replace(/^./, c => c.toUpperCase()));
    update(active, { bullets, status: slide.code ? 'passed' : slide.status, notes: slide.notes + (instruction ? `\n\n(Regenerated: “${instruction}”)` : '') });
    setRegen(false); setInstruction('');
    toast.success(`Slide ${active + 1} regenerated`, { description: slide.code ? 'Sample mode: code not re-run' : 'Only this slide was changed.' });
  };

  const duplicate = () => { const s = [...slides]; s.splice(active + 1, 0, { ...slide, id: slide.id + '-copy-' + Date.now() }); setSlides(s); setActive(active + 1); toast.success('Slide duplicated'); };
  const addSlide = () => { const s = [...slides]; s.splice(active + 1, 0, { id: 'new-' + Date.now(), title: 'New Architecture Slide', layout: 'grid', bullets: ['Key Principle: Description here', 'Best Practice: Production recommendation'], notes: 'Speaker explanation for this new slide...', status: 'none' }); setSlides(s); setActive(active + 1); };

  return (
    <div className="grid gap-4 lg:grid-cols-[200px_minmax(0,1fr)] xl:grid-cols-[200px_minmax(0,1fr)_320px]">
      {/* Thumbnails */}
      <Card className="order-2 p-2 lg:order-1">
        <div className="flex items-center justify-between px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <span>Slides · {slides.length}</span>
          <Tip label="Add slide"><button onClick={addSlide} className="rounded p-1 hover:bg-muted" aria-label="Add slide"><Plus className="h-3.5 w-3.5" /></button></Tip>
        </div>
        <ol className="flex gap-2 overflow-x-auto p-1 scrollbar-thin lg:max-h-[calc(100vh-240px)] lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden">
          {slides.map((s, i) => (
            <li key={s.id} draggable
              onDragStart={e => { setDragFrom(i); e.dataTransfer.effectAllowed = 'move'; }}
              onDragOver={e => { e.preventDefault(); setDragOver(i); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={e => { e.preventDefault(); if (dragFrom !== null) move(dragFrom, i); setDragFrom(null); setDragOver(null); }}
              onDragEnd={() => { setDragFrom(null); setDragOver(null); }}
              className={cn('group relative w-40 shrink-0 cursor-pointer rounded-lg p-1.5 transition lg:w-auto', i === active ? 'bg-primary/10 ring-2 ring-primary' : 'hover:bg-muted', dragOver === i && dragFrom !== i && 'ring-2 ring-dashed ring-violet-400', dragFrom === i && 'opacity-40')}
              onClick={() => setActive(i)}>
              <div className="mb-1 flex items-center gap-1.5 px-0.5 text-[11px] text-muted-foreground">
                <GripVertical className="h-3 w-3 cursor-grab opacity-0 transition group-hover:opacity-100" />
                <span className="font-semibold">{i + 1}</span>
                <span className="truncate">{s.title}</span>
                <span className="ml-auto"><Dot status={s.status} /></span>
              </div>
              <div className="pointer-events-none overflow-hidden rounded-md border shadow-sm"><SlideCanvas slide={s} index={i} total={slides.length} brand={brand} /></div>
            </li>
          ))}
        </ol>
      </Card>

      {/* Canvas */}
      <div className="order-1 min-w-0 space-y-3 lg:order-2">
        <Card className="p-3 sm:p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon-sm" disabled={active === 0} onClick={() => setActive(active - 1)} aria-label="Previous slide"><ChevronLeft /></Button>
              <span className="text-sm font-medium tabular-nums">Slide {active + 1} / {slides.length}</span>
              <Button variant="ghost" size="icon-sm" disabled={active === slides.length - 1} onClick={() => setActive(active + 1)} aria-label="Next slide"><ChevronRight /></Button>
            </div>
            <div className="flex items-center gap-2">
              {/* Interactive Layout Selector */}
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <span className="text-muted-foreground text-[11px]">Layout:</span>
                <select
                  value={slide.layout}
                  onChange={e => {
                    update(active, { layout: e.target.value as any });
                    toast.success(`Layout set to ${e.target.value}`);
                  }}
                  className="h-7 rounded-md border bg-background px-2 text-xs font-bold text-foreground outline-none cursor-pointer focus:ring-1 focus:ring-primary"
                >
                  <option value="title">Hero Title</option>
                  <option value="grid">Grid (4 Cards)</option>
                  <option value="timeline">Timeline Process</option>
                  <option value="code">Code & Concepts</option>
                  <option value="two-col">Two-Column</option>
                  <option value="callout">Golden Rule Callout</option>
                  <option value="diagram">Architecture Diagram</option>
                  <option value="summary">Summary Checklist</option>
                  <option value="bullets">Bullets List</option>
                </select>
              </div>

              <Tip label="Duplicate"><Button variant="ghost" size="icon-sm" onClick={duplicate} aria-label="Duplicate slide"><Copy /></Button></Tip>
              <Tip label="Delete"><Button variant="ghost" size="icon-sm" onClick={() => setConfirmDelete(true)} disabled={slides.length < 2} aria-label="Delete slide"><Trash2 /></Button></Tip>
              <Tip label="Fullscreen"><Button variant="ghost" size="icon-sm" onClick={onPreview} aria-label="Fullscreen preview"><Maximize2 /></Button></Tip>
            </div>
          </div>
          <div className={cn('relative rounded-xl bg-[repeating-conic-gradient(hsl(var(--muted))_0_25%,transparent_0_50%)] bg-[length:16px_16px] p-2 sm:p-5', regen && 'pointer-events-none')}>
            <SlideCanvas key={slide.id + slide.bullets.join() + (brand.themeId || '')} slide={slide} index={active} total={slides.length} brand={brand} editable onChange={p => update(active, p)} className="shadow-xl ring-1 ring-black/5" />
            {regen && <div className="absolute inset-0 grid place-items-center rounded-xl bg-background/70 backdrop-blur-[2px]"><div className="flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm font-medium shadow-lg"><Sparkles className="h-4 w-4 animate-pulse text-primary" /> Regenerating slide {active + 1}…</div></div>}
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground"><Pencil className="h-3 w-3" /> Click the title or any bullet on the slide to edit it inline.</p>
        </Card>
      </div>

      {/* Properties */}
      <div className="order-3 space-y-4 lg:col-span-2 xl:col-span-1">
        <Card className="p-4">
          <Label htmlFor="notes" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Speaker notes</Label>
          <Textarea id="notes" rows={7} className="mt-2 text-[13px] leading-relaxed" value={slide.notes} onChange={e => update(active, { notes: e.target.value })} placeholder="What to say on this slide…" />
          <div className="mt-1.5 text-right text-[11px] text-muted-foreground">≈ {Math.max(1, Math.round(slide.notes.split(/\s+/).length / 130))} min to deliver</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Verification status</div>
          {slide.code ? (
            <div className={cn('mt-3 rounded-lg border p-3', slide.status === 'passed' ? 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-500/20 dark:bg-emerald-500/5' : 'border-blue-200 bg-blue-50/70 dark:border-blue-500/20 dark:bg-blue-500/5')}>
              <div className="flex items-center gap-2 text-sm font-semibold">
                {slide.status === 'passed' ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
                {slide.status === 'passed' ? 'Code passed' : 'Verifying…'}
              </div>
              <dl className="mt-2 grid grid-cols-2 gap-y-1 text-xs text-muted-foreground">
                <dt>Runtime</dt><dd className="text-right font-mono text-foreground">{content.live ? runtimeLabel(content) : 'Java 21.0.2'}</dd>
                <dt>Attempts</dt><dd className="text-right text-foreground">{(() => { const ex = content.examples.find(e => e.id === slide.exampleId); return ex ? (ex.attempts.length > 1 ? `${ex.attempts.length} (auto-fixed)` : '1') : slide.id === 's7' ? '2 (auto-fixed)' : '1'; })()}</dd>
                <dt>Exec time</dt><dd className="text-right text-foreground">{content.examples.find(e => e.id === slide.exampleId)?.ms ?? (slide.id === 's7' ? 456 : 412)} ms</dd>
              </dl>
              <Button variant="link" size="sm" className="mt-1 h-auto px-0 text-xs" asChild><Link to="/verification">Open in Verification Center →</Link></Button>
            </div>
          ) : (
            <p className="mt-3 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">No code on this slide. Text content is checked for layout fit only.<span className="mt-1 flex items-center gap-1 font-medium text-emerald-600"><Check className="h-3 w-3" /> Fits at classroom size</span></p>
          )}
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"><Wand2 className="h-3.5 w-3.5" /> Regenerate this slide</div>
          <Input className="mt-3" placeholder="e.g. Make it more concise, add an example…" value={instruction} onChange={e => setInstruction(e.target.value)} onKeyDown={e => e.key === 'Enter' && regenerate()} />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {['Make it concise', 'Add a real-world example', 'Simplify for beginners'].map(s => (
              <button key={s} onClick={() => setInstruction(s)} className="rounded-full border px-2.5 py-1 text-[11px] text-muted-foreground transition hover:border-primary/40 hover:text-primary">{s}</button>
            ))}
          </div>
          <Button variant="gradient" className="mt-3 w-full" onClick={regenerate} loading={regen}>{!regen && <RefreshCw />} Regenerate this slide</Button>
          <p className="mt-2 text-[11px] text-muted-foreground">Only slide {active + 1} changes. Any code is re-verified automatically.</p>
        </Card>
      </div>

      <ConfirmDialog open={confirmDelete} onOpenChange={setConfirmDelete} destructive title={`Delete slide ${active + 1}?`} description={`“${slide.title}” and its speaker notes will be removed. You can restore it from version history.`} confirmLabel="Delete slide"
        onConfirm={() => { setSlides(slides.filter((_, i) => i !== active)); setActive(Math.max(0, active - 1)); toast.success('Slide deleted'); }} />
    </div>
  );
}

/* ---------------- Preview modal ---------------- */

function PreviewModal({ open, onOpenChange, slides, start, brand }: { open: boolean; onOpenChange: (o: boolean) => void; slides: Slide[]; start: number; brand: Brand }) {
  const [i, setI] = React.useState(start);
  const [notes, setNotes] = React.useState(false);
  React.useEffect(() => { if (open) setI(start); }, [open, start]);
  React.useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') setI(x => Math.min(slides.length - 1, x + 1));
      if (e.key === 'ArrowLeft') setI(x => Math.max(0, x - 1));
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open, slides.length]);
  const s = slides[i];
  if (!s) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent hideClose className="flex h-[100dvh] max-h-none w-screen max-w-none flex-col gap-0 rounded-none border-0 bg-slate-950 p-0 text-white">
        <DialogTitle className="sr-only">Slide preview</DialogTitle>
        <div className="flex items-center justify-between px-4 py-3 text-sm">
          <span className="text-slate-400">Presenter preview · use ← → keys</span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" className="text-slate-300 hover:bg-white/10 hover:text-white" onClick={() => setNotes(n => !n)}><ScrollText /> {notes ? 'Hide' : 'Show'} notes</Button>
            <Button size="icon-sm" variant="ghost" className="text-slate-300 hover:bg-white/10 hover:text-white" onClick={() => onOpenChange(false)} aria-label="Close preview"><X /></Button>
          </div>
        </div>
        <div className="flex min-h-0 flex-1 items-center justify-center gap-2 px-2 sm:gap-6 sm:px-6">
          <Button size="icon" variant="ghost" className="shrink-0 text-white hover:bg-white/10 hover:text-white" disabled={i === 0} onClick={() => setI(i - 1)} aria-label="Previous"><ChevronLeft /></Button>
          <div className="w-full max-w-[min(1200px,calc((100dvh-180px)*16/9))]"><SlideCanvas key={s.id} slide={s} index={i} total={slides.length} brand={brand} className="animate-fade-up shadow-2xl" /></div>
          <Button size="icon" variant="ghost" className="shrink-0 text-white hover:bg-white/10 hover:text-white" disabled={i === slides.length - 1} onClick={() => setI(i + 1)} aria-label="Next"><ChevronRight /></Button>
        </div>
        {notes && <div className="mx-auto mb-2 max-w-4xl rounded-lg bg-white/5 px-4 py-3 text-sm text-slate-300">{s.notes}</div>}
        <div className="flex items-center justify-center gap-1.5 pb-4 pt-2">{slides.map((_, k) => <button key={k} onClick={() => setI(k)} aria-label={`Go to slide ${k + 1}`} className={cn('h-1.5 rounded-full transition-all', k === i ? 'w-6 bg-white' : 'w-1.5 bg-white/30 hover:bg-white/60')} />)}</div>
      </DialogContent>
    </Dialog>
  );
}

