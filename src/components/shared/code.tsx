import * as React from 'react';
import { Highlight, themes, type Language } from 'prism-react-renderer';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

const LANG: Record<string, Language> = { java: 'tsx', jsx: 'jsx', tsx: 'tsx', js: 'javascript', javascript: 'javascript', python: 'python', bash: 'bash', docker: 'bash', sql: 'sql', json: 'json', text: 'markup' };
// Prism's bundle has no Java grammar; C-like highlighting via tsx reads well for Java snippets.

export function CodeBlock({ code, lang = 'java', className, lineNumbers = true, highlight = [], title, copy = true, compact, highlightTone = 'red' }: {
  code: string; lang?: string; className?: string; lineNumbers?: boolean; highlight?: number[]; title?: React.ReactNode; copy?: boolean; compact?: boolean; highlightTone?: 'red' | 'green';
}) {
  const [copied, setCopied] = React.useState(false);
  return (
    <div className={cn('group relative overflow-hidden rounded-xl border border-slate-800 bg-[#0B1120] text-[13px] shadow-inner', className)}>
      {(title || copy) && (
        <div className="flex items-center justify-between gap-2 border-b border-white/5 px-4 py-2 text-xs text-slate-400">
          <div className="flex items-center gap-2"><span className="flex gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-red-400/80" /><i className="h-2.5 w-2.5 rounded-full bg-amber-400/80" /><i className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" /></span>{title && <span className="ml-1 font-mono">{title}</span>}</div>
          {copy && (
            <button type="button" aria-label="Copy code" onClick={() => { navigator.clipboard?.writeText(code).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 1200); }}
              className="rounded-md p-1 text-slate-400 opacity-0 transition hover:bg-white/10 hover:text-white group-hover:opacity-100 focus:opacity-100">
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>
      )}
      <Highlight code={code.replace(/\n$/, '')} language={LANG[lang] ?? 'tsx'} theme={themes.nightOwl}>
        {({ tokens, getLineProps, getTokenProps }) => (
          <pre className={cn('overflow-x-auto font-mono leading-relaxed scrollbar-thin', compact ? 'p-3 text-xs' : 'p-4')}>
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })} className={cn('table-row', highlight.includes(i + 1) && (highlightTone === 'green' ? 'bg-emerald-500/15' : 'bg-red-500/15'))}>
                {lineNumbers && <span className="table-cell select-none pr-4 text-right text-slate-600">{i + 1}</span>}
                <span className="table-cell whitespace-pre">{line.map((token, k) => <span key={k} {...getTokenProps({ token })} />)}</span>
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
}

/** Editable code with live highlighting: a transparent textarea over a highlighted <pre>. */
export function CodeEditor({ value, onChange, lang = 'java', minRows = 8, className }: { value: string; onChange: (v: string) => void; lang?: string; minRows?: number; className?: string }) {
  const pre = React.useRef<HTMLPreElement>(null);
  const rows = Math.max(minRows, value.split('\n').length + 1);
  return (
    <div className={cn('relative overflow-hidden rounded-xl border border-slate-800 bg-[#0B1120] font-mono text-[13px] leading-relaxed focus-within:ring-2 focus-within:ring-primary/50', className)}>
      <Highlight code={value} language={LANG[lang] ?? 'tsx'} theme={themes.nightOwl}>
        {({ tokens, getLineProps, getTokenProps }) => (
          <pre ref={pre} aria-hidden className="pointer-events-none absolute inset-0 m-0 overflow-hidden p-4" style={{ background: 'transparent' }}>
            {tokens.map((line, i) => <div key={i} {...getLineProps({ line })}>{line.map((t, k) => <span key={k} {...getTokenProps({ token: t })} />)}{'\n'}</div>)}
          </pre>
        )}
      </Highlight>
      <textarea value={value} spellCheck={false} rows={rows} aria-label="Code editor"
        onChange={e => onChange(e.target.value)}
        onScroll={e => { if (pre.current) { pre.current.scrollTop = e.currentTarget.scrollTop; pre.current.scrollLeft = e.currentTarget.scrollLeft; } }}
        onKeyDown={e => { if (e.key === 'Tab') { e.preventDefault(); const t = e.currentTarget; const s = t.selectionStart; onChange(value.slice(0, s) + '    ' + value.slice(t.selectionEnd)); requestAnimationFrame(() => { t.selectionStart = t.selectionEnd = s + 4; }); } }}
        className="relative block w-full resize-y whitespace-pre bg-transparent p-4 text-transparent caret-white outline-none selection:bg-indigo-500/40" style={{ WebkitTextFillColor: 'transparent' }} />
    </div>
  );
}

export function Terminal({ lines, className, title = 'console' }: { lines: { text: string; tone?: 'ok' | 'err' | 'dim' | 'cmd' | 'warn' }[]; className?: string; title?: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => { ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: 'smooth' }); }, [lines.length]);
  return (
    <div className={cn('flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-[#05070D] font-mono text-xs', className)}>
      <div className="flex items-center justify-between border-b border-white/5 px-3 py-2 text-[11px] uppercase tracking-wider text-slate-500"><span>{title}</span><span className="flex gap-1"><i className="h-2 w-2 rounded-full bg-slate-700" /><i className="h-2 w-2 rounded-full bg-slate-700" /></span></div>
      <div ref={ref} className="min-h-0 flex-1 space-y-0.5 overflow-auto p-3 leading-relaxed scrollbar-thin">
        {lines.map((l, i) => (
          <div key={i} className={cn('whitespace-pre-wrap break-words', { ok: 'text-emerald-400', err: 'text-red-400', dim: 'text-slate-500', cmd: 'text-sky-300', warn: 'text-amber-300' }[l.tone ?? 'dim'] ?? 'text-slate-300', !l.tone && 'text-slate-300')}>{l.text}</div>
        ))}
        <span className="inline-block h-3.5 w-1.5 animate-pulse bg-slate-400 align-middle" />
      </div>
    </div>
  );
}
