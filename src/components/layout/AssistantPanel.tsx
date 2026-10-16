import * as React from 'react';
import { useLocation } from 'react-router-dom';
import { Bot, Send, Sparkles, User } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogDescription, DialogTitle, SheetContent } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/input';
import { api, useApi } from '@/lib/api';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

type Msg = { role: 'user' | 'assistant'; content: string; sources?: string[] };
const PAGES: Record<string, string> = { dashboard: 'Dashboard', courses: 'My Courses', studio: 'Course Studio', verification: 'Code Verification', reports: 'Verification Reports', upgrades: 'Version Upgrades', coverage: 'Syllabus Coverage', resources: 'Resource Library', exports: 'Exports', settings: 'Settings', team: 'Team', help: 'Help' };
const SUGGEST = ['Explain why a snippet might fail verification', 'Suggest a quiz question on this topic', 'How do I make an exercise’s tests stronger?'];

export function AssistantPanel({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { online } = useApi();
  const { pathname } = useLocation();
  const { courses } = useStore();
  const [msgs, setMsgs] = React.useState<Msg[]>([]);
  const [text, setText] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const end = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, busy]);

  const seg = pathname.split('/')[1] ?? 'dashboard';
  const courseId = pathname.startsWith('/studio/') ? pathname.split('/')[2] : undefined;
  const courseTitle = courses.find(c => c.id === courseId)?.title;

  const send = async (t = text) => {
    const q = t.trim();
    if (!q || busy) return;
    const next: Msg[] = [...msgs, { role: 'user', content: q }];
    setMsgs(next); setText(''); setBusy(true);
    try {
      const r = await api.chat(next.map(m => ({ role: m.role, content: m.content })), { page: PAGES[seg] ?? seg, course: courseTitle });
      setMsgs(m => [...m, { role: 'assistant', content: r.reply, sources: r.sources }]);
    } catch (e) { toast.error('The assistant could not answer', { description: e instanceof Error ? e.message : undefined }); setMsgs(m => m.slice(0, -1)); setText(q); }
    setBusy(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <div className="border-b p-5 pr-12">
          <div className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-white"><Sparkles className="h-4 w-4" /></span><DialogTitle>AI assistant</DialogTitle></div>
          <DialogDescription className="mt-1">Answers use your verified course material. {courseTitle ? `Context: ${courseTitle}.` : `You’re on ${PAGES[seg] ?? 'the app'}.`}</DialogDescription>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {online === false && <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">The AI server isn’t running. Start it with <code className="font-mono">npm run dev:all</code> and add your keys to <code className="font-mono">server/.env</code>.</div>}
          {!msgs.length && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Try one of these:</p>
              {SUGGEST.map(s => <button key={s} onClick={() => send(s)} disabled={!online} className="block w-full rounded-xl border p-3 text-left text-sm transition hover:border-primary/40 disabled:opacity-50">{s}</button>)}
            </div>
          )}
          {msgs.map((m, i) => (
            <div key={i} className={cn('flex gap-3', m.role === 'user' && 'flex-row-reverse')}>
              <span className={cn('grid h-7 w-7 shrink-0 place-items-center rounded-full', m.role === 'user' ? 'bg-muted' : 'bg-primary/10 text-primary')}>{m.role === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}</span>
              <div className={cn('max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed', m.role === 'user' ? 'bg-primary text-white' : 'bg-muted')}>
                {m.content}
                {m.sources && m.sources.length > 0 && <div className="mt-2 border-t border-border/60 pt-2 text-[11px] text-muted-foreground">Grounded in: {m.sources.join(' · ')}</div>}
              </div>
            </div>
          ))}
          {busy && <div className="flex gap-3"><span className="grid h-7 w-7 place-items-center rounded-full bg-primary/10 text-primary"><Bot className="h-3.5 w-3.5" /></span><div className="rounded-2xl bg-muted px-4 py-3"><span className="inline-flex gap-1">{[0, 1, 2].map(i => <i key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: `${i * 120}ms` }} />)}</span></div></div>}
          <div ref={end} />
        </div>
        <form className="flex gap-2 border-t p-4" onSubmit={e => { e.preventDefault(); void send(); }}>
          <Textarea rows={1} className="min-h-[40px] resize-none" placeholder="Ask anything about your course…" value={text} disabled={!online} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(); } }} aria-label="Message" />
          <Button type="submit" variant="gradient" size="icon" className="h-10 w-10 shrink-0" disabled={!online || busy || !text.trim()} aria-label="Send"><Send /></Button>
        </form>
      </SheetContent>
    </Dialog>
  );
}
