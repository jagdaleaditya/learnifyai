import * as React from 'react';
import { Check, FileCode2, ListTree, Package, Presentation, ShieldCheck, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/controls';
import { cn } from '@/lib/utils';

const STEPS = [
  { key: 'Outline', icon: ListTree, detail: 'Structuring 12 slides from your objectives' },
  { key: 'Slides', icon: Presentation, detail: 'Writing slides and speaker notes in your brand' },
  { key: 'Code', icon: FileCode2, detail: 'Generating examples, exercises and tests' },
  { key: 'Verifying', icon: ShieldCheck, detail: 'Running 14 snippets in an isolated sandbox' },
  { key: 'Export', icon: Package, detail: 'Building PPTX, PDF and code bundle' },
];

/** Animated generation pipeline. Calls onDone when every step has completed. */
export interface LiveProgress { step: number; pct: number; log: string[]; done: boolean; error?: string }

export function GenerationModal({ open, title, onDone, stepMs = 1100, live }: { open: boolean; title: string; onDone: () => void; stepMs?: number; live?: LiveProgress }) {
  const [step, setStep] = React.useState(0);
  const [pct, setPct] = React.useState(0);
  const [log, setLog] = React.useState<string[]>([]);
  React.useEffect(() => {
    if (live) { if (live.done) { const t = setTimeout(onDone, 700); return () => clearTimeout(t); } return; }
    if (!open) { setStep(0); setPct(0); setLog([]); return; }
    const lines = ['Outline ready: 12 slides, 3 exercises, 6 quiz questions', 'Slides written · speaker notes attached', 'Code generated · 14 snippets, 15 tests', 'Snippet 7 failed (exception) → auto-fix attempt 2 passed', 'All 14 snippets verified on Java 21.0.2', 'Exports built'];
    let s = 0;
    const tick = setInterval(() => setPct(p => Math.min(100, p + 100 / ((STEPS.length * stepMs) / 120))), 120);
    const t = setInterval(() => {
      s++;
      setLog(l => [...l, lines[s - 1]]);
      if (s === 4) setLog(l => [...l, lines[4]]);
      if (s >= STEPS.length) { clearInterval(t); clearInterval(tick); setPct(100); setStep(STEPS.length); setTimeout(onDone, 700); return; }
      setStep(s);
    }, stepMs);
    return () => { clearInterval(t); clearInterval(tick); };
  }, [open, stepMs, onDone, live]);
  const shownStep = live ? (live.done ? STEPS.length : live.step) : step, shownPct = live ? (live.done ? 100 : live.pct) : pct, shownLog = live ? live.log : log;

  return (
    <Dialog open={open}>
      <DialogContent hideClose className="max-w-xl" onEscapeKeyDown={e => e.preventDefault()} onPointerDownOutside={e => e.preventDefault()}>
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-gradient text-white shadow-lg shadow-indigo-500/30"><Sparkles className="h-5 w-5 animate-pulse" /></div>
          <div className="min-w-0"><DialogTitle className="truncate">Generating “{title}”</DialogTitle><DialogDescription>Generate → verify every snippet → export</DialogDescription></div>
        </div>
        <Progress value={shownPct} className="h-2.5" />
        <ol className="space-y-2">
          {STEPS.map((s, i) => {
            const done = i < shownStep, active = i === shownStep;
            return (
              <li key={s.key} className={cn('flex items-center gap-3 rounded-xl border p-3 transition-all', active && 'border-primary/40 bg-primary/5 shadow-sm', done && 'opacity-80')}>
                <div className={cn('grid h-8 w-8 shrink-0 place-items-center rounded-lg', done ? 'bg-emerald-500 text-white' : active ? 'bg-primary text-white' : 'bg-muted text-muted-foreground')}>
                  {done ? <Check className="h-4 w-4" /> : <s.icon className={cn('h-4 w-4', active && 'animate-pulse')} />}
                </div>
                <div className="min-w-0 flex-1"><div className="text-sm font-medium">{s.key}</div><div className="truncate text-xs text-muted-foreground">{s.detail}</div></div>
                <span className={cn('text-xs font-medium', done ? 'text-emerald-600' : active ? 'text-primary' : 'text-muted-foreground')}>{done ? 'Done' : active ? 'Running…' : 'Queued'}</span>
              </li>
            );
          })}
        </ol>
        <div className="max-h-40 overflow-auto rounded-lg bg-[#05070D] p-3 font-mono text-[11px] leading-relaxed text-slate-300">
          {shownLog.length ? shownLog.map((l, i) => <div key={i} className={/✗|failed/.test(l) ? 'text-amber-300' : /↻/.test(l) ? 'text-sky-300' : 'text-emerald-400'}>› {l}</div>) : <div className="text-slate-500">› Starting pipeline…</div>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
