import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, CircleArrowUp, Download, ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/shared/common';
import { NetworkBg } from '@/components/shared/network-bg';

const HIGHLIGHTS = [
  { icon: ShieldCheck, title: 'Verified code', text: 'Every snippet runs in a pinned sandbox before students see it.' },
  { icon: CircleArrowUp, title: 'Auto version upgrades', text: 'Move decks from Java 11 to 21 or React 17 to 18 safely.' },
  { icon: Download, title: 'One-click exports', text: 'PPTX, PDF, trainer notes, code bundle and quiz in your brand.' },
];

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden border-r bg-[#F3F5FF] p-12 lg:flex lg:flex-col">
        <NetworkBg />
        <div className="relative"><Link to="/"><Logo /></Link></div>
        <div className="auth-seq relative my-auto max-w-lg py-12">
          <span className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-xs font-medium text-muted-foreground"><span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white">NEW</span> Built for trainers & institutes</span>
          <h1 className="mt-6 text-[44px] font-extrabold leading-[1.02] tracking-[-0.045em]">Generate, verify and publish your next <span className="hl">lesson.</span></h1>
          <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">From a topic to a branded deck with runnable examples, tested exercises and a quiz. Nothing reaches your class until the code has passed.</p>
          <ul className="mt-9 space-y-5">
            {HIGHLIGHTS.map(h => (
              <li key={h.title} className="flex gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border bg-white text-primary shadow-sm"><h.icon className="h-5 w-5" /></span>
                <span><span className="block font-semibold">{h.title}</span><span className="block text-sm text-muted-foreground">{h.text}</span></span>
              </li>
            ))}
          </ul>
          <div className="mt-10 rounded-2xl bg-[#0F1117] p-4 text-slate-300 shadow-xl">
            <div className="flex items-center justify-between text-xs text-slate-500"><span className="font-mono">verify · java-oop-fundamentals</span><span className="flex items-center gap-1.5 text-emerald-400"><span className="ping-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />live</span></div>
            <div className="term-seq mt-3 space-y-1.5 font-mono text-[12.5px]">
              <div className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> 13 snippets passed on Java 21.0.2</div>
              <div className="flex items-center gap-2 text-amber-300"><CircleArrowUp className="h-3.5 w-3.5" /> withdraw() auto-fixed on attempt 2</div>
              <div className="flex items-center gap-2 text-emerald-300"><ShieldCheck className="h-3.5 w-3.5" /> Verified ✓ 14/14 snippets</div>
            </div>
          </div>
        </div>
        <p className="relative text-xs text-muted-foreground">© 2026 LearnifyAI · Illustrative demo with sample data</p>
      </aside>
      <main className="flex min-h-screen flex-col px-5 py-8 sm:px-10">
        <div className="lg:hidden"><Link to="/"><Logo /></Link></div>
        <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center py-10 animate-fade-up">{children}</div>
      </main>
    </div>
  );
}

export function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.2-2.1 3.5-5.1 3.5-8.8z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9h-4v3.1A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.4 14.4a7.2 7.2 0 0 1 0-4.7V6.6h-4a12 12 0 0 0 0 10.9l4-3.1z" />
      <path fill="#EA4335" d="M12 4.8c1.7 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.4 6.6l4 3.1C6.3 6.9 8.9 4.8 12 4.8z" />
    </svg>
  );
}
