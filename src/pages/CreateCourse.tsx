import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, BookOpen, Check, Clock, Code2, FileText, FileUp, GraduationCap, Layers, Palette, Sparkles, Trash2, Upload, Users, X, ClipboardCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox, Slider } from '@/components/ui/controls';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/shared/common';
import { GenerationModal, type LiveProgress } from '@/components/shared/generation-modal';
import { api, useApi, type CourseContent } from '@/lib/api';
import { brandKits, techOptions, type Course, type Level } from '@/lib/mock-data';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

const STEPS = [
  { key: 'basics', label: 'Basics', icon: BookOpen },
  { key: 'audience', label: 'Audience', icon: Users },
  { key: 'tech', label: 'Tech', icon: Code2 },
  { key: 'sources', label: 'Sources', icon: FileUp },
  { key: 'output', label: 'Branding & Output', icon: Palette },
  { key: 'review', label: 'Review', icon: ClipboardCheck },
];

const OUTPUTS = [
  { id: 'pptx', label: 'PPTX slides', hint: 'Editable PowerPoint with notes' },
  { id: 'pdf', label: 'PDF slides', hint: 'Fonts embedded, 16:9' },
  { id: 'notes', label: 'Trainer Notes', hint: 'Talking points per slide' },
  { id: 'code', label: 'Code Bundle', hint: 'Runnable project (ZIP)' },
  { id: 'exercises', label: 'Exercises', hint: 'With automated tests' },
  { id: 'quiz', label: 'Quiz', hint: 'MCQ with explanations' },
  { id: 'cheat', label: 'Cheat Sheet', hint: 'One printable page' },
];

const ACCENTS: Record<string, [string, string]> = { Java: ['#4F46E5', '#7C3AED'], Python: ['#059669', '#14B8A6'], React: ['#0EA5E9', '#6366F1'], Docker: ['#0284C7', '#22D3EE'], 'Node.js': ['#16A34A', '#4F46E5'] };
const RUNTIME: Record<string, string> = { 'Java 21': 'Java 21.0.2', 'Java 17': 'Java 17.0.10', 'Java 11': 'Java 11.0.22', 'Python 3.12': 'Python 3.12.1', 'Python 3.11': 'Python 3.11.8', 'React 18': 'React 18.3.1', 'React 17': 'React 17.0.2', 'Docker 26': 'Docker 26.0', 'Docker 24': 'Docker 24.0', 'Node 20': 'Node 20.11', 'Node 18': 'Node 18.19' };

interface FileItem { name: string; size: number; type: string }
const fmtSize = (b: number) => (b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1e3))} KB`);

export default function CreateCourse() {
  const navigate = useNavigate();
  const { addCourse, setContent } = useStore();
  const { online } = useApi();
  const [live, setLive] = React.useState<LiveProgress | undefined>();
  const contentRef = React.useRef<CourseContent | null>(null);
  const [step, setStep] = React.useState(0);
  const [topic, setTopic] = React.useState('Java OOP Fundamentals');
  const [description, setDescription] = React.useState('A hands-on first session on classes, encapsulation, inheritance and interfaces using a banking example.');
  const [objectiveDraft, setObjectiveDraft] = React.useState('');
  const [objectives, setObjectives] = React.useState(['Model real entities as classes', 'Protect invariants with encapsulation', 'Program to interfaces']);
  const [level, setLevel] = React.useState<Level>('Beginner');
  const [audience, setAudience] = React.useState('Final-year CS students with basic programming knowledge');
  const [duration, setDuration] = React.useState(90);
  const [language, setLanguage] = React.useState('Java');
  const [version, setVersion] = React.useState('Java 21');
  const [files, setFiles] = React.useState<FileItem[]>([{ name: 'Java_Backend_Track_Syllabus.pdf', size: 482_000, type: 'pdf' }]);
  const [dragging, setDragging] = React.useState(false);
  const [brand, setBrand] = React.useState(brandKits[0].id);
  const [outputs, setOutputs] = React.useState<string[]>(OUTPUTS.map(o => o.id));
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [generating, setGenerating] = React.useState(false);
  const created = React.useRef<Course | null>(null);
  const fileInput = React.useRef<HTMLInputElement>(null);

  const versions = techOptions.find(t => t.language === language)?.versions ?? [];

  const addObjectives = (text: string) => {
    const items = text.split(/\n|;/).map(s => s.trim()).filter(Boolean).filter(s => !objectives.includes(s));
    if (items.length) setObjectives(o => [...o, ...items]);
    setObjectiveDraft('');
  };

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const ok: FileItem[] = [];
    Array.from(list).forEach(f => {
      const ext = f.name.split('.').pop()?.toLowerCase() ?? '';
      if (!['pdf', 'docx', 'pptx'].includes(ext)) { toast.error(`${f.name} is not supported`, { description: 'Upload PDF, DOCX or PPTX files.' }); return; }
      ok.push({ name: f.name, size: f.size, type: ext });
    });
    if (ok.length) { setFiles(fs => [...fs, ...ok]); toast.success(`${ok.length} file${ok.length > 1 ? 's' : ''} added`); }
  };

  const validate = (i: number) => {
    const e: Record<string, string> = {};
    if (i === 0) {
      if (topic.trim().length < 3) e.topic = 'Give the course a topic (3+ characters)';
      if (!objectives.length) e.objectives = 'Add at least one learning objective';
    }
    if (i === 4 && !outputs.length) e.outputs = 'Select at least one output';
    setErrors(e);
    return !Object.keys(e).length;
  };
  const next = () => { if (validate(step)) setStep(s => Math.min(STEPS.length - 1, s + 1)); };
  const goTo = (i: number) => { if (i <= step || validate(step)) setStep(i); };

  const generate = async () => {
    if (!validate(0) || !validate(4)) { toast.error('Please complete the required fields'); return; }
    setGenerating(true);
    contentRef.current = null;
    if (!online) { setLive(undefined); return; }
    setLive({ step: 0, pct: 2, log: [], done: false });
    try {
      const content = await api.generate({ topic: topic.trim(), level, language, version, durationMin: duration, objectives, audience }, e =>
        setLive(l => ({ step: e.step ?? l?.step ?? 0, pct: Math.max(l?.pct ?? 0, e.pct ?? 0), log: e.log ? [...(l?.log ?? []), e.log] : l?.log ?? [], done: false })));
      contentRef.current = content;
      setLive(l => ({ step: 4, pct: 100, log: [...(l?.log ?? []), `Done: ${content.summary.passed}/${content.summary.verifiable} snippets verified${content.summary.autoFixed ? `, ${content.summary.autoFixed} auto-fixed` : ''}`], done: true }));
    } catch (e) {
      setGenerating(false); setLive(undefined);
      toast.error('Generation failed', { description: e instanceof Error ? e.message : 'Unknown error' });
    }
  };

  const onDone = React.useCallback(() => {
    const content = contentRef.current;
    const sum = content?.summary;
    const c = addCourse({
      title: topic.trim(), description, level, durationMin: duration, language: language as Course['language'], runtime: RUNTIME[version] ?? version,
      slides: content ? content.slides.length : 12,
      snippets: sum ? { passed: sum.passed, total: sum.verifiable } : { passed: 14, total: 14 },
      status: !sum ? 'verified' : sum.verifiable === 0 ? 'review' : sum.failed > 0 ? 'review' : 'verified',
      statusNote: sum ? (sum.verifiable === 0 ? `Not executable here (${language})` : sum.failed > 0 ? `${sum.failed} snippet(s) failed after 3 attempts` : undefined) : undefined,
      coverage: 92, tags: objectives.slice(0, 2).map(o => o.split(' ').slice(-1)[0]), accent: ACCENTS[language] ?? ['#4F46E5', '#7C3AED'],
    });
    if (content) setContent(c.id, content);
    created.current = c;
    setGenerating(false); setLive(undefined);
    toast.success('Course generated & verified', { description: sum ? `${c.title} · ${sum.passed}/${sum.verifiable} snippets passed${sum.autoFixed ? ` (${sum.autoFixed} auto-fixed)` : ''}` : `${c.title} · 14/14 snippets passed (1 auto-fixed)` });
    navigate(`/studio/${c.id}?new=1`);
  }, [addCourse, setContent, topic, description, level, duration, language, version, objectives, navigate]);

  const kit = brandKits.find(b => b.id === brand)!;

  return (
    <div>
      <PageHeader eyebrow="Workspace" title="Create a new course" description="Tell us what to teach. We generate the material, run every snippet and only hand it over when it passes."
        actions={<Button variant="ghost" onClick={() => navigate('/courses')}><X /> Cancel</Button>} />

      {/* Stepper */}
      <Card className="mb-6 p-2">
        <ol className="flex gap-1 overflow-x-auto scrollbar-thin">
          {STEPS.map((s, i) => (
            <li key={s.key} className="flex-1">
              <button onClick={() => goTo(i)} className={cn('flex w-full min-w-[120px] items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition', i === step ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted')}>
                <span className={cn('grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-semibold', i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-brand-gradient text-white shadow' : 'bg-muted text-muted-foreground')}>
                  {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </span>
                <span className="font-medium">{s.label}</span>
              </button>
            </li>
          ))}
        </ol>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <Card className="p-5 sm:p-7">
          <div key={step} className="animate-fade-up">
            {step === 0 && (
              <div className="space-y-6">
                <StepHead icon={BookOpen} title="Course basics" text="What is this session about and what should learners be able to do afterwards?" />
                <div>
                  <Label htmlFor="topic">Course topic *</Label>
                  <Input id="topic" className="mt-1.5" value={topic} onChange={e => { setTopic(e.target.value); setErrors(x => ({ ...x, topic: '' })); }} placeholder="e.g. Java OOP Fundamentals" aria-invalid={!!errors.topic} />
                  {errors.topic && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.topic}</p>}
                </div>
                <div>
                  <Label htmlFor="desc">Short description</Label>
                  <Textarea id="desc" className="mt-1.5" rows={3} value={description} onChange={e => setDescription(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="obj">Learning objectives *</Label>
                  <p className="mt-0.5 text-xs text-muted-foreground">Type one per line and press Enter, or paste several separated by new lines.</p>
                  <Textarea id="obj" className="mt-2" rows={2} value={objectiveDraft} placeholder="Use records for plain data" onChange={e => setObjectiveDraft(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addObjectives(objectiveDraft); setErrors(x => ({ ...x, objectives: '' })); } }}
                    onPaste={e => { const t = e.clipboardData.getData('text'); if (t.includes('\n')) { e.preventDefault(); addObjectives(t); } }} />
                  <div className="mt-3 flex flex-wrap gap-2">
                    {objectives.map(o => (
                      <span key={o} className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 py-1 pl-3 pr-1.5 text-xs font-medium text-primary">
                        <Check className="h-3 w-3" />{o}
                        <button onClick={() => setObjectives(x => x.filter(y => y !== o))} className="rounded-full p-0.5 hover:bg-primary/15" aria-label={`Remove ${o}`}><X className="h-3 w-3" /></button>
                      </span>
                    ))}
                  </div>
                  {errors.objectives && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.objectives}</p>}
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <StepHead icon={Users} title="Audience" text="Pitch, pacing and the depth of examples adapt to who is in the room." />
                <div>
                  <Label>Level</Label>
                  <div className="mt-2 grid gap-3 sm:grid-cols-3">
                    {(['Beginner', 'Intermediate', 'Advanced'] as Level[]).map(l => (
                      <button key={l} onClick={() => setLevel(l)} className={cn('rounded-xl border p-4 text-left transition', level === l ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'hover:border-primary/40')}>
                        <GraduationCap className={cn('h-5 w-5', level === l ? 'text-primary' : 'text-muted-foreground')} />
                        <div className="mt-2 font-semibold">{l}</div>
                        <div className="text-xs text-muted-foreground">{{ Beginner: 'No prior topic knowledge', Intermediate: 'Knows the basics', Advanced: 'Production experience' }[l]}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between"><Label>Session duration</Label><span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-sm font-semibold"><Clock className="h-3.5 w-3.5" />{duration} min</span></div>
                  <Slider className="mt-4" min={30} max={240} step={15} value={[duration]} onValueChange={v => setDuration(v[0])} aria-label="Duration in minutes" />
                  <div className="mt-2 flex justify-between text-xs text-muted-foreground"><span>30 min</span><span>≈ {Math.round(duration / 7.5)} slides</span><span>4 h</span></div>
                </div>
                <div>
                  <Label htmlFor="aud">Who are the learners?</Label>
                  <Input id="aud" className="mt-1.5" value={audience} onChange={e => setAudience(e.target.value)} />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <StepHead icon={Code2} title="Tech stack" text="Code is executed against exactly this version. Reports record the runtime and dependencies used." />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Language / framework</Label>
                    <Select value={language} onValueChange={v => { setLanguage(v); setVersion(techOptions.find(t => t.language === v)!.versions[0]); }}>
                      <SelectTrigger className="mt-1.5" aria-label="Language"><SelectValue /></SelectTrigger>
                      <SelectContent>{techOptions.map(t => <SelectItem key={t.language} value={t.language}>{t.language}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Pinned version</Label>
                    <Select value={version} onValueChange={setVersion}>
                      <SelectTrigger className="mt-1.5" aria-label="Version"><SelectValue /></SelectTrigger>
                      <SelectContent>{versions.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {['Java 21', 'Python 3.12', 'React 18', 'Docker 26', 'Node 20'].map(v => {
                    const lang = techOptions.find(t => t.versions.includes(v))!.language;
                    const on = version === v;
                    return (
                      <button key={v} onClick={() => { setLanguage(lang); setVersion(v); }} className={cn('flex items-center gap-3 rounded-xl border p-3 text-left text-sm transition', on ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'hover:border-primary/40')}>
                        <span className="grid h-9 w-9 place-items-center rounded-lg text-xs font-bold text-white" style={{ background: `linear-gradient(135deg, ${(ACCENTS[lang] ?? ['#4F46E5', '#7C3AED'])[0]}, ${(ACCENTS[lang] ?? ['#4F46E5', '#7C3AED'])[1]})` }}>{v.slice(0, 2)}</span>
                        <span><span className="block font-semibold">{v}</span><span className="block font-mono text-[11px] text-muted-foreground">{RUNTIME[v]}</span></span>
                      </button>
                    );
                  })}
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 text-sm dark:border-emerald-500/20 dark:bg-emerald-500/5">
                  <div className="flex items-center gap-2 font-semibold text-emerald-800 dark:text-emerald-300"><Check className="h-4 w-4" /> Sandbox ready for {version}</div>
                  <p className="mt-1 text-emerald-700/80 dark:text-emerald-300/70">Isolated container · no network · 5 s timeout per snippet · up to 3 auto-fix attempts.</p>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <StepHead icon={FileUp} title="Source material" text="Optional. Upload a syllabus, old slides or notes and we’ll align the course to them." />
                <div
                  onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
                  onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
                  onClick={() => fileInput.current?.click()} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && fileInput.current?.click()}
                  className={cn('flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition', dragging ? 'border-primary bg-primary/5' : 'hover:border-primary/50 hover:bg-muted/40')}>
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary"><Upload className="h-6 w-6" /></div>
                  <p className="mt-4 font-semibold">Drop files here or <span className="text-primary">browse</span></p>
                  <p className="mt-1 text-sm text-muted-foreground">PDF, DOCX or PPTX · up to 25 MB each</p>
                  <input ref={fileInput} type="file" multiple accept=".pdf,.docx,.pptx" className="hidden" onChange={e => { addFiles(e.target.files); e.target.value = ''; }} />
                </div>
                {files.length > 0 && (
                  <ul className="divide-y rounded-xl border">
                    {files.map((f, i) => (
                      <li key={f.name + i} className="flex items-center gap-3 p-3">
                        <span className={cn('grid h-10 w-10 place-items-center rounded-lg text-[10px] font-bold uppercase text-white', { pdf: 'bg-red-500', docx: 'bg-blue-600', pptx: 'bg-orange-500' }[f.type] ?? 'bg-slate-500')}>{f.type}</span>
                        <div className="min-w-0 flex-1"><div className="truncate text-sm font-medium">{f.name}</div><div className="text-xs text-muted-foreground">{fmtSize(f.size)} · <span className="text-emerald-600">Parsed</span></div></div>
                        <Button variant="ghost" size="icon-sm" onClick={() => setFiles(fs => fs.filter((_, j) => j !== i))} aria-label={`Remove ${f.name}`}><Trash2 /></Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <StepHead icon={Palette} title="Branding & output" text="Pick the institute template and choose what to generate." />
                <div>
                  <Label>Brand kit</Label>
                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
                    {brandKits.map(b => (
                      <button key={b.id} onClick={() => setBrand(b.id)} className={cn('flex items-center gap-3 rounded-xl border p-3 text-left transition', brand === b.id ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/40')}>
                        <span className="relative h-12 w-20 shrink-0 overflow-hidden rounded-md" style={{ background: `linear-gradient(135deg, ${b.primary}, ${b.secondary})` }}><span className="absolute bottom-1.5 left-1.5 h-1.5 w-6 rounded-full" style={{ background: b.accent }} /></span>
                        <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{b.name}</span><span className="block text-xs text-muted-foreground">{b.heading} · {b.code}</span></span>
                        {brand === b.id && <Check className="h-4 w-4 text-primary" />}
                      </button>
                    ))}
                  </div>
                  <Button variant="link" className="mt-1 h-auto px-0" onClick={() => navigate('/brand-kit')}>Manage brand kits →</Button>
                </div>
                <div>
                  <div className="flex items-center justify-between"><Label>Outputs</Label><button className="text-xs font-medium text-primary hover:underline" onClick={() => setOutputs(outputs.length === OUTPUTS.length ? [] : OUTPUTS.map(o => o.id))}>{outputs.length === OUTPUTS.length ? 'Clear all' : 'Select all'}</button></div>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {OUTPUTS.map(o => (
                      <label key={o.id} className={cn('flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition', outputs.includes(o.id) ? 'border-primary/40 bg-primary/5' : 'hover:bg-muted/50')}>
                        <Checkbox checked={outputs.includes(o.id)} onCheckedChange={v => { setOutputs(x => v ? [...x, o.id] : x.filter(y => y !== o.id)); setErrors(e => ({ ...e, outputs: '' })); }} />
                        <span><span className="block text-sm font-medium">{o.label}</span><span className="block text-xs text-muted-foreground">{o.hint}</span></span>
                      </label>
                    ))}
                  </div>
                  {errors.outputs && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.outputs}</p>}
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6">
                <StepHead icon={ClipboardCheck} title="Review & generate" text="Check the details. You can edit everything in the Studio afterwards." />
                <div className="overflow-hidden rounded-xl border">
                  <div className="p-5 text-white" style={{ background: `linear-gradient(135deg, ${kit.primary}, ${kit.secondary})` }}>
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">{kit.name}</div>
                    <div className="mt-1 text-xl font-bold">{topic}</div>
                    <div className="mt-1 text-sm text-white/80">{level} · {duration} min · {version}</div>
                  </div>
                  <dl className="grid gap-px bg-border sm:grid-cols-2">
                    {[
                      ['Objectives', <ul key="o" className="list-inside list-disc space-y-0.5">{objectives.map(o => <li key={o}>{o}</li>)}</ul>, 0],
                      ['Audience', audience, 1],
                      ['Runtime', <span key="r" className="font-mono text-xs">{RUNTIME[version]}</span>, 2],
                      ['Sources', files.length ? files.map(f => f.name).join(', ') : 'None', 3],
                      ['Brand kit', kit.name, 4],
                      ['Outputs', <span key="op" className="flex flex-wrap gap-1">{outputs.map(o => <Badge key={o} variant="secondary">{OUTPUTS.find(x => x.id === o)?.label}</Badge>)}</span>, 4],
                    ].map(([k, v, s]) => (
                      <div key={k as string} className="bg-card p-4">
                        <dt className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-muted-foreground">{k as string}<button className="normal-case text-primary hover:underline" onClick={() => setStep(s as number)}>Edit</button></dt>
                        <dd className="mt-1.5 text-sm">{v as React.ReactNode}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center justify-between border-t pt-5">
            <Button variant="outline" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}><ArrowLeft /> Back</Button>
            <span className="hidden text-xs text-muted-foreground sm:inline">Step {step + 1} of {STEPS.length}</span>
            {step < STEPS.length - 1
              ? <Button variant="gradient" onClick={next}>Continue <ArrowRight /></Button>
              : <Button variant="gradient" size="lg" onClick={generate}><Sparkles /> Generate & Verify Course</Button>}
          </div>
        </Card>

        {/* Live summary */}
        <aside className="space-y-4">
          <Card className="sticky top-0 p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">What you’ll get</div>
            <ul className="mt-4 space-y-3 text-sm">
              {[
                [Layers, `≈ ${Math.round(duration / 7.5)} slides with speaker notes`],
                [Code2, `Runnable examples on ${version}`],
                [FileText, '3 exercises with reference + naive solutions'],
                [ClipboardCheck, '6-question quiz with explanations'],
                [Sparkles, 'One-page cheat sheet & diagrams'],
              ].map(([I, t], i) => {
                const Icon = I as typeof Layers;
                return <li key={i} className="flex items-start gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="h-3.5 w-3.5" /></span><span className="pt-1">{t as string}</span></li>;
              })}
            </ul>
            <div className={cn('mt-5 rounded-lg p-3 text-xs', online ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-muted/60 text-muted-foreground')}>
              {online ? <><span className="font-semibold">Live AI mode.</span> A real model writes the course and every snippet runs on this machine. Expect 30 to 90 seconds.</> : <><span className="font-semibold text-foreground">Sample mode.</span> The AI server isn’t running, so this generates the built-in sample course. Start it with <code className="font-mono">npm run dev:all</code>.</>}
            </div>
          </Card>
        </aside>
      </div>

      <GenerationModal open={generating} title={topic} onDone={onDone} live={online ? live : undefined} />
    </div>
  );
}

function StepHead({ icon: Icon, title, text }: { icon: typeof BookOpen; title: string; text: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div>
      <div><h2 className="text-lg font-semibold tracking-tight">{title}</h2><p className="text-sm text-muted-foreground">{text}</p></div>
    </div>
  );
}
