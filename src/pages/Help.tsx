import * as React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Bug, Clock, LifeBuoy, Mail, MessageCircle, Search, Send, Wrench, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/misc';
import { commonErrors, faqs, setupGuides } from '@/lib/mock-data';
import { sleep } from '@/lib/utils';

export default function Help() {
  const [q, setQ] = React.useState('');
  const [form, setForm] = React.useState({ subject: '', topic: 'verification', message: '' });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [sending, setSending] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const match = (s: string) => s.toLowerCase().includes(q.toLowerCase());
  const fq = faqs.filter(f => match(f.q + f.a));
  const fe = commonErrors.filter(e => match(e.error + e.cause + e.fix));
  const fg = setupGuides.filter(g => match(g.title + g.desc));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (form.subject.trim().length < 4) er.subject = 'Add a short subject';
    if (form.message.trim().length < 15) er.message = 'Describe the issue in a little more detail (15+ characters)';
    setErrors(er);
    if (Object.keys(er).length) return;
    setSending(true); await sleep(1000); setSending(false); setSent(true);
    toast.success('Support request sent', { description: 'Ticket #LRN-4821 · we usually reply within 4 hours' });
  };

  return (
    <div>
      <section className="relative mb-8 overflow-hidden rounded-2xl bg-[#0F172A] px-6 py-10 text-center text-white sm:py-14">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,.45),transparent_60%)]" />
        <div className="relative mx-auto max-w-2xl">
          <LifeBuoy className="mx-auto h-10 w-10 text-indigo-300" />
          <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">How can we help?</h1>
          <p className="mt-1 text-slate-300">Guides, answers and fixes for common verification errors.</p>
          <div className="relative mt-6"><Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" /><Input className="h-12 rounded-xl border-white/10 bg-white pl-12 text-base text-slate-900 shadow-xl" placeholder="Search help articles, e.g. “timeout”" value={q} onChange={e => setQ(e.target.value)} aria-label="Search help" /></div>
        </div>
      </section>

      {fg.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-base font-semibold">Setup guides</h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {fg.map(g => (
              <Link key={g.title} to={g.href} className="group">
                <Card className="card-hover flex h-full flex-col p-5">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><BookOpen className="h-5 w-5" /></div>
                  <div className="mt-3 font-semibold">{g.title}</div>
                  <div className="mt-1 flex-1 text-sm text-muted-foreground">{g.desc}</div>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground"><span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{g.time}</span><ArrowRight className="h-4 w-4 transition group-hover:translate-x-1 group-hover:text-primary" /></div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <div className="min-w-0 space-y-6">
          <Card>
            <CardHeader><CardTitle>Frequently asked questions</CardTitle></CardHeader>
            <CardContent>
              {fq.length ? (
                <Accordion type="single" collapsible defaultValue="f0">
                  {fq.map((f, i) => <AccordionItem key={f.q} value={`f${i}`}><AccordionTrigger>{f.q}</AccordionTrigger><AccordionContent className="leading-relaxed">{f.a}</AccordionContent></AccordionItem>)}
                </Accordion>
              ) : <p className="py-6 text-center text-sm text-muted-foreground">No questions match “{q}”.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><div className="flex items-center gap-2"><Bug className="h-4 w-4 text-red-500" /><CardTitle>Common verification errors</CardTitle></div><CardDescription>What they mean and how to fix them</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              {fe.length ? fe.map(e => (
                <div key={e.error} className="rounded-xl border p-4">
                  <code className="rounded bg-red-50 px-2 py-0.5 font-mono text-xs font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-300">{e.error}</code>
                  <p className="mt-2 text-sm text-muted-foreground"><span className="font-medium text-foreground">Cause: </span>{e.cause}</p>
                  <p className="mt-1 flex gap-1.5 text-sm"><Wrench className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" /><span><span className="font-medium">Fix: </span>{e.fix}</span></p>
                </div>
              )) : <p className="py-6 text-center text-sm text-muted-foreground">No errors match “{q}”.</p>}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Contact support</CardTitle><CardDescription>Average first reply: under 4 hours</CardDescription></CardHeader>
            <CardContent>
              {sent ? (
                <div className="py-6 text-center">
                  <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
                  <div className="mt-3 font-semibold">Request received</div>
                  <p className="mt-1 text-sm text-muted-foreground">Ticket <span className="font-mono">#LRN-4821</span>. We’ll reply to your email.</p>
                  <Button variant="outline" className="mt-5" onClick={() => { setSent(false); setForm({ subject: '', topic: 'verification', message: '' }); }}>Send another</Button>
                </div>
              ) : (
                <form onSubmit={submit} noValidate className="space-y-4">
                  <div><Label htmlFor="hs">Subject</Label><Input id="hs" className="mt-1.5" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} aria-invalid={!!errors.subject} />{errors.subject && <p className="mt-1 text-xs font-medium text-red-600">{errors.subject}</p>}</div>
                  <div><Label>Topic</Label><Select value={form.topic} onValueChange={v => setForm(f => ({ ...f, topic: v }))}><SelectTrigger className="mt-1.5" aria-label="Topic"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="verification">Code verification</SelectItem><SelectItem value="generation">Course generation</SelectItem><SelectItem value="exports">Exports</SelectItem><SelectItem value="billing">Account & billing</SelectItem></SelectContent></Select></div>
                  <div><Label htmlFor="hm">Message</Label><Textarea id="hm" rows={5} className="mt-1.5" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="What happened? Include the course and snippet name if relevant." aria-invalid={!!errors.message} />{errors.message && <p className="mt-1 text-xs font-medium text-red-600">{errors.message}</p>}</div>
                  <Button type="submit" variant="gradient" className="w-full" loading={sending}>{!sending && <Send />} Send request</Button>
                </form>
              )}
            </CardContent>
          </Card>
          <Card className="grid grid-cols-2 divide-x">
            <a href="mailto:support@learnify.ai" className="flex flex-col items-center gap-1 p-4 text-sm transition hover:bg-muted/50"><Mail className="h-5 w-5 text-primary" />Email us</a>
            <button onClick={() => toast('Live chat', { description: 'A support agent will join shortly.' })} className="flex flex-col items-center gap-1 p-4 text-sm transition hover:bg-muted/50"><MessageCircle className="h-5 w-5 text-primary" />Live chat</button>
          </Card>
        </div>
      </div>
    </div>
  );
}
