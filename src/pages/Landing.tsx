import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, CheckCircle2, CircleArrowUp, Download, FileCheck2, MessageCircle, Moon, PlayCircle, Presentation, ShieldCheck, Sun, WandSparkles, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/misc';
import { Logo } from '@/components/shared/common';
import { NetworkBg } from '@/components/shared/network-bg';
import { CountUp, Reveal, useScrolled } from '@/components/shared/motion';
import { faqs } from '@/lib/mock-data';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

const TICKER = ['Trainer admissions open · Limited seats', 'Every snippet runs before students see it', 'Auto-fix up to 3 attempts', 'Next cohort demo: this Sunday', 'Free for your first course', 'Pinned to Java 21, Python 3.12, React 18'];
const NAV = [['Product', '#product'], ['How it works', '#how'], ['Verification', '#verify'], ['FAQ', '#faq']] as const;

function Code({ children }: { children: React.ReactNode }) { return <div className="whitespace-pre font-mono text-[13.5px] leading-[1.7] text-slate-200">{children}</div>; }
const k = (t: string) => <span className="text-sky-400">{t}</span>;
const s = (t: string) => <span className="text-emerald-400">{t}</span>;
const n = (t: string) => <span className="text-orange-400">{t}</span>;
const c = (t: string) => <span className="text-slate-500">{t}</span>;

export default function Landing() {
  const { user, theme, toggleTheme } = useStore();
  const navigate = useNavigate();
  const items = [...TICKER, ...TICKER];
  const scrolled = useScrolled();
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Ticker */}
      <div className="overflow-hidden bg-[#0F1117] py-3 text-sm font-medium text-slate-100" aria-label="Announcements">
        <div className="flex w-max animate-marquee gap-16 whitespace-nowrap pr-16 hover:[animation-play-state:paused]">
          {items.map((t, i) => <span key={i} className={cn(i % TICKER.length === 0 && 'font-bold')}>{t}</span>)}
        </div>
      </div>

      {/* Header */}
      <header className={cn('sticky top-0 z-40 border-b bg-background/85 backdrop-blur-xl transition-shadow duration-300', scrolled && 'header-scrolled')}>
        <div className="mx-auto flex h-[84px] max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/" aria-label="LearnifyAI home" className="shrink-0"><span className="sm:hidden"><Logo compact /></span><span className="hidden sm:block"><Logo /></span></Link>
          <nav className="hidden items-center gap-9 text-[15px] text-muted-foreground lg:flex" aria-label="Primary">
            {NAV.map(([l, h]) => <a key={l} href={h} className="relative transition hover:text-foreground after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:rounded-full after:bg-primary after:transition-transform after:duration-300 hover:after:scale-x-100">{l}</a>)}
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme" className="hidden sm:inline-flex">{theme === 'dark' ? <Sun /> : <Moon />}</Button>
            {user ? (
              <Button className="h-11 rounded-full px-5 text-[15px] font-semibold sm:px-6" onClick={() => navigate('/dashboard')}>Open dashboard</Button>
            ) : (
              <>
                <Button variant="outline" className="h-11 rounded-full px-5 text-[15px] font-semibold sm:px-6" onClick={() => navigate('/login')}>Login</Button>
                <Button className="h-11 rounded-full px-5 text-[15px] font-semibold shine shadow-lg shadow-primary/30 sm:px-6" onClick={() => navigate('/register')}>Apply now</Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#F3F5FF] via-background to-background dark:from-[#10142B]">
        <NetworkBg />
        <div className="relative mx-auto grid max-w-[1200px] items-center gap-12 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:pb-28 lg:pt-20">
          <div className="hero-seq min-w-0">
            <a href="#how" className="inline-flex items-center gap-3 rounded-full border bg-card/80 py-1.5 pl-1.5 pr-4 text-sm text-muted-foreground shadow-sm backdrop-blur">
              <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold tracking-wide text-white">NEW</span>
              <span className="ping-dot h-1.5 w-1.5 rounded-full bg-primary" /> Verified in the sandbox · see the demo
            </a>
            <h1 className="hero-title mt-9">
              <span className="block">Teach Code</span>
              <span className="hl block w-fit">That Runs.</span>
              <span className="block">Trust the <span className="strike">slides</span> sandbox.</span>
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Generate slides, speaker notes, runnable examples, tested exercises and a quiz from a topic. Every snippet is executed on the exact runtime you pin, and failures are fixed before your class ever sees them.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button size="lg" className="shine h-14 rounded-full px-8 text-base font-semibold shadow-xl shadow-primary/30 hover:-translate-y-0.5" onClick={() => navigate('/register')}>Create your first course <ArrowRight /></Button>
              <Button size="lg" variant="outline" className="h-14 rounded-full px-8 text-base font-semibold" onClick={() => navigate('/login')}><PlayCircle /> Try the live demo</Button>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {['No credit card', 'Java · Python · React · Docker · Node', 'PPTX, PDF & code bundle'].map(t => <li key={t} className="flex items-center gap-1.5"><Check className="h-4 w-4 text-primary" />{t}</li>)}
            </ul>
          </div>

          {/* Code window */}
          <div className="hero-window min-w-0">
            <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#101218] shadow-2xl shadow-slate-900/30">
              <div className="flex items-center justify-between border-b border-white/5 px-6 py-5">
                <span className="flex gap-2"><i className="h-3.5 w-3.5 rounded-full bg-[#FF5F57]" /><i className="h-3.5 w-3.5 rounded-full bg-[#FEBC2E]" /><i className="h-3.5 w-3.5 rounded-full bg-[#28C840]" /></span>
                <span className="font-mono text-sm text-slate-500">~/my-course/generate.js</span>
              </div>
              <div className="px-6 py-6">
                <Code>
                  {c('// your next lesson, in one call')}{'\n'}
                  {k('const')} course = {k('await')} {k('generate')}({'{'}{'\n'}
                  {'  '}topic: {s("'Java OOP Fundamentals'")},{'\n'}
                  {'  '}level: {s("'Beginner'")},{'\n'}
                  {'  '}runtime: {s("'Java 21.0.2'")},{'\n'}
                  {'  '}snippets: {n('14')},{'\n'}
                  {'  '}autoFix: {n('3')}, {c('// attempts')}{'\n'}
                  {'}'});{'\n\n'}
                  {k('await')} course.{k('verify')}();{'\n'}
                  {c('// ✓ 14/14 passed · 1 auto-fixed')}<span className="caret" aria-hidden />
                </Code>
              </div>
              <div className="glow mx-6 mb-6 rounded-2xl border border-dashed border-white/15 p-5">
                <div className="flex items-center gap-2 text-xs text-slate-400"><FileCheck2 className="h-3.5 w-3.5" /> Verification report · Java OOP Fundamentals</div>
                <div className="mt-3 flex flex-wrap items-baseline gap-x-3 text-2xl font-bold text-[#6D86FF]">Verified ✓ <span className="text-[#6D86FF]">14/14</span> <span className="font-mono text-base font-medium text-slate-300">· Java 21.0.2</span></div>
                <p className="mt-2 text-sm text-slate-400">Every example ran in an isolated container with no network.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Proof strip */}
      <section className="border-y bg-card">
        <Reveal as="dl" stagger={110} className="mx-auto grid max-w-[1200px] grid-cols-2 gap-y-8 px-4 py-10 sm:px-6 md:grid-cols-4">
          {[['96%', 'first-attempt pass rate'], ['3', 'auto-fix attempts per snippet'], ['5 s', 'sandbox timeout, no network'], ['7', 'export formats']].map(([v, l]) => (
            <div key={l} className="text-center md:text-left"><dt className="text-4xl font-extrabold tracking-tighter text-primary"><CountUp value={v} /></dt><dd className="mt-1 text-sm text-muted-foreground">{l}</dd></div>
          ))}
        </Reveal>
      </section>

      {/* Product */}
      <section id="product" className="mx-auto max-w-[1200px] scroll-mt-24 px-4 py-24 sm:px-6">
        <Reveal className="max-w-2xl"><p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">Product</p><h2 className="mt-3 text-4xl font-extrabold tracking-[-0.04em] sm:text-5xl">One studio. Slides, code and proof.</h2></Reveal>
        <Reveal stagger={120} className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            { icon: ShieldCheck, t: 'Verified code', d: 'Snippets in slides, notes and exercises run in a pinned sandbox. Exercise tests must pass on the reference solution and fail on a naive one.' },
            { icon: CircleArrowUp, t: 'Auto version upgrades', d: 'Move a deck from React 17 to 18 or Java 11 to 21. Review each change as a diff, then re-verify every changed example.' },
            { icon: Download, t: 'One-click exports', d: 'PPTX with speaker notes, PDF, trainer notes, code bundle, exercises, quiz and a cheat sheet, in your brand kit.' },
          ].map(f => (
            <div key={f.t} className="card-hover group rounded-3xl border bg-card p-7 shadow-soft hover:border-primary/30">
              <div className="feature-icon grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white"><f.icon className="h-6 w-6" /></div>
              <h3 className="mt-6 text-xl font-bold tracking-tight">{f.t}</h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </Reveal>
      </section>

      {/* How it works: a real sequence */}
      <section id="how" className="scroll-mt-24 bg-[#F3F5FF] py-24 dark:bg-[#10142B]">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <Reveal className="max-w-2xl"><p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">How it works</p><h2 className="mt-3 text-4xl font-extrabold tracking-[-0.04em] sm:text-5xl">From topic to a package you can teach from.</h2></Reveal>
          <Reveal as="ol" stagger={140} className="mt-12 grid gap-5 md:grid-cols-4">
            {[
              { icon: WandSparkles, t: 'Generate', d: 'Enter a topic, level, duration and pinned version. Upload a syllabus if you have one.' },
              { icon: ShieldCheck, t: 'Verify', d: 'Each snippet is compiled and run. Output is compared with what the slide promises.' },
              { icon: Wrench, t: 'Auto-fix', d: 'A failure log goes back to the generator. It patches the code and re-runs, up to three times.' },
              { icon: Presentation, t: 'Export', d: 'Download the deck and handouts. The report records every version used.' },
            ].map((x, i) => (
              <li key={x.t} className="card-hover group relative rounded-3xl border bg-card p-6 shadow-soft">
                {i < 3 && <span aria-hidden className="step-line hidden md:block" />}
                <span className="absolute right-5 top-5 font-mono text-xs text-muted-foreground">step {i + 1}</span>
                <div className="feature-icon grid h-11 w-11 place-items-center rounded-xl bg-primary text-white shadow-md shadow-primary/30"><x.icon className="h-5 w-5" /></div>
                <h3 className="mt-5 text-lg font-bold">{x.t}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{x.d}</p>
              </li>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Verification demo */}
      <section id="verify" className="mx-auto grid max-w-[1200px] scroll-mt-24 items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-2">
        <Reveal from="left" className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">Verification</p>
          <h2 className="mt-3 text-4xl font-extrabold tracking-[-0.04em] sm:text-5xl">Failures get fixed before your class sees them.</h2>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">In this run, <span className="font-mono text-foreground">BankAccount.withdraw</span> threw an exception where the slide promised a returned message. The generator patched it on the second attempt and the tests went green.</p>
          <Button className="mt-8 h-12 rounded-full px-7 font-semibold" onClick={() => navigate('/login')}>Run it yourself <ArrowRight /></Button>
        </Reveal>
        <Reveal stagger={380} delay={250} className="reveal-left min-w-0 overflow-hidden rounded-3xl bg-[#101218] p-6 font-mono text-[13px] leading-relaxed text-slate-300 shadow-2xl">
          <div className="text-sky-300">$ javac --release 21 BankAccount.java WithdrawCheck.java</div>
          <div className="text-red-400">✗ IllegalStateException: Insufficient funds (attempt 1 of 3)</div>
          <div className="text-amber-300">↻ patch: replace throw with return "Insufficient funds"</div>
          <div className="text-sky-300">$ java WithdrawCheck   # attempt 2</div>
          <div>OK</div><div>Insufficient funds</div><div>balance=50.0</div>
          <div className="mt-2 flex items-center gap-2 text-emerald-400"><CheckCircle2 className="h-4 w-4" /> passed on attempt 2 · 456 ms · 6/6 tests</div>
        </Reveal>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-[860px] scroll-mt-24 px-4 pb-24 sm:px-6">
        <Reveal as="h2" className="text-4xl font-extrabold tracking-[-0.04em] sm:text-5xl">Questions trainers ask</Reveal>
        <Reveal delay={120}>
        <Accordion type="single" collapsible defaultValue="f0" className="mt-8 rounded-3xl border bg-card px-6 shadow-soft">
          {faqs.map((f, i) => <AccordionItem key={f.q} value={`f${i}`}><AccordionTrigger className="text-base">{f.q}</AccordionTrigger><AccordionContent className="leading-relaxed">{f.a}</AccordionContent></AccordionItem>)}
        </Accordion>
        </Reveal>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-[1200px] px-4 pb-20 sm:px-6">
        <Reveal from="scale" className="relative overflow-hidden rounded-[32px] bg-primary px-6 py-16 text-center text-white sm:px-12">
          <div className="drift absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10" />
          <div className="drift-slow absolute -bottom-28 -left-16 h-64 w-64 rounded-full bg-white/[0.06]" />
          <h2 className="relative mx-auto max-w-2xl text-4xl font-extrabold tracking-[-0.04em] sm:text-5xl">Your next lesson, verified by Sunday.</h2>
          <p className="relative mx-auto mt-4 max-w-xl text-white/80">Create an account and generate your first course. Free for your first course.</p>
          <Button size="lg" className="shine relative mt-8 h-14 rounded-full bg-white px-8 text-base font-semibold text-primary hover:-translate-y-0.5 hover:bg-white/90" onClick={() => navigate('/register')}>Apply now <ArrowRight /></Button>
        </Reveal>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Logo />
          <span>© 2026 LearnifyAI · Illustrative demo with sample data</span>
          <div className="flex gap-5"><Link to="/login" className="hover:text-foreground">Login</Link><Link to="/register" className="hover:text-foreground">Register</Link><Link to="/help" className="hover:text-foreground">Help</Link></div>
        </div>
      </footer>

      {/* Floating chat, as in the template */}
      <a href="#faq" aria-label="Questions" className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-xl transition hover:scale-110 animate-in fade-in-0 zoom-in-50 duration-500 [animation-delay:1.2s] [animation-fill-mode:backwards]"><span aria-hidden className="ping-dot absolute inset-0 rounded-full bg-[#25D366] opacity-40" /><MessageCircle className="relative h-7 w-7" /></a>
    </div>
  );
}
