import * as React from 'react';
import { Highlight, themes } from 'prism-react-renderer';
import type { Slide } from '@/lib/mock-data';
import { diagrams } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

export interface Brand {
  primary: string;
  secondary: string;
  accent: string;
  dark?: boolean;
  themeId?: string;
  heading?: string;
  body?: string;
  logoText?: string;
  logoUrl?: string;
  footer?: string;
  showNumbers?: boolean;
}

export const slideThemes: (Brand & { id: string; name: string })[] = [
  { id: 'indigo', name: 'Neo Indigo (Modern)', primary: '#4F46E5', secondary: '#7C3AED', accent: '#10B981', dark: false, logoText: 'LearnifyAI' },
  { id: 'dark', name: 'Cyber Slate (Dark)', primary: '#06B6D4', secondary: '#3B82F6', accent: '#10B981', dark: true, logoText: 'LearnifyAI' },
  { id: 'ocean', name: 'Executive Ocean', primary: '#0284C7', secondary: '#0369A1', accent: '#F59E0B', dark: false, logoText: 'LearnifyAI' },
  { id: 'ember', name: 'Sunset Ember', primary: '#E11D48', secondary: '#F97316', accent: '#8B5CF6', dark: false, logoText: 'LearnifyAI' },
  { id: 'emerald', name: 'Emerald Minimalist', primary: '#059669', secondary: '#047857', accent: '#6366F1', dark: false, logoText: 'LearnifyAI' },
];

export const defaultBrand: Brand = slideThemes[0];

/** Diagram renderer shared by slides and the diagram gallery (coordinates are percentages). */
type DiagramData = { nodes: { id: string; label: string; x: number; y: number }[]; edges: [string, string][] | string[][] };
export function DiagramView({ id, data, brand = defaultBrand, className }: { id?: string; data?: DiagramData; brand?: Brand; className?: string }) {
  const d = data ?? diagrams.find(x => x.id === id) ?? diagrams[0];
  id = id ?? 'live';
  const byId = Object.fromEntries(d.nodes.map(n => [n.id, n]));
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={cn('h-full w-full overflow-visible', className)}>
      <defs>
        <marker id={`ah-${id}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10z" fill={brand.dark ? '#94A3B8' : '#64748B'} />
        </marker>
      </defs>
      {(d.edges as string[][]).map(([a, b], i) => {
        const p = byId[a], q = byId[b];
        if (!p || !q) return null;
        const dx = q.x - p.x, dy = q.y - p.y, len = Math.hypot(dx, dy) || 1;
        const pad = 9;
        return (
          <line
            key={i}
            x1={p.x + (dx / len) * pad}
            y1={p.y + (dy / len) * pad * 0.9}
            x2={q.x - (dx / len) * pad}
            y2={q.y - (dy / len) * pad * 0.9}
            stroke={brand.dark ? '#475569' : '#94A3B8'}
            strokeWidth={0.8}
            vectorEffect="non-scaling-stroke"
            markerEnd={`url(#ah-${id})`}
          />
        );
      })}
      {d.nodes.map((n, i) => (
        <foreignObject key={n.id} x={n.x - 14} y={n.y - 9} width={28} height={18} style={{ overflow: 'visible' }}>
          <div
            className="flex h-full w-full items-center justify-center rounded-[0.7em] border text-center font-bold leading-tight shadow-md transition"
            style={{
              fontSize: 'max(9px, 1.15cqw)',
              borderColor: brand.primary,
              background: i === 0 ? brand.primary : brand.dark ? '#1E293B' : `${brand.primary}12`,
              color: i === 0 || brand.dark ? '#FFFFFF' : '#0F172A',
              padding: '0 5%'
            }}
          >
            {n.label}
          </div>
        </foreignObject>
      ))}
    </svg>
  );
}

function MiniCode({ code, lang = 'java' }: { code: string; lang?: string }) {
  return (
    <Highlight code={code} language={lang === 'java' ? 'tsx' : lang} theme={themes.nightOwl}>
      {({ tokens, getLineProps, getTokenProps }) => (
        <pre className="m-0 overflow-hidden whitespace-pre font-mono" style={{ fontSize: '1.45cqw', lineHeight: 1.55 }}>
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line })}>
              <span className="inline-block select-none opacity-30 mr-[1.5cqw]" style={{ width: '2cqw', textAlign: 'right' }}>
                {i + 1}
              </span>
              {line.map((t, k) => <span key={k} {...getTokenProps({ token: t })} />)}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );
}

/**
 * 16:9 Presentation slide in modern customizable templates.
 * Sizes use container query units (cqw) so the slide scales dynamically from thumbnails to fullscreen presentation.
 */
export function SlideCanvas({
  slide,
  index,
  total,
  brand = defaultBrand,
  editable,
  onChange,
  className
}: {
  slide: Slide;
  index: number;
  total: number;
  brand?: Brand;
  editable?: boolean;
  onChange?: (patch: Partial<Slide>) => void;
  className?: string;
}) {
  const isDark = brand.dark ?? false;

  const edit = (field: 'title' | 'subtitle' | 'takeaway') =>
    editable
      ? {
          contentEditable: true,
          suppressContentEditableWarning: true,
          onBlur: (e: React.FocusEvent<HTMLElement>) => onChange?.({ [field]: e.currentTarget.textContent ?? '' }),
          className: 'outline-none rounded focus:ring-2 focus:ring-primary/60 hover:bg-primary/5 transition'
        }
      : {};

  const editBullet = (i: number) =>
    editable
      ? {
          contentEditable: true,
          suppressContentEditableWarning: true,
          onBlur: (e: React.FocusEvent<HTMLElement>) => {
            const b = [...slide.bullets];
            b[i] = e.currentTarget.textContent ?? '';
            onChange?.({ bullets: b });
          },
          className: 'outline-none rounded focus:ring-2 focus:ring-primary/60 hover:bg-primary/5 transition'
        }
      : {};

  const footer = () => (
    <div
      className="absolute inset-x-[5%] bottom-[3.5%] flex items-center justify-between border-t pt-[1.2cqw]"
      style={{
        fontSize: '1.05cqw',
        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
        color: isDark ? '#94A3B8' : '#64748B'
      }}
    >
      <span className="flex items-center gap-[0.8cqw] font-bold" style={{ color: isDark ? '#FFFFFF' : '#0F172A' }}>
        <i className="inline-block rounded-full shadow-sm" style={{ width: '1.2cqw', height: '1.2cqw', background: `linear-gradient(135deg, ${brand.primary}, ${brand.secondary})` }} />
        {brand.logoText ?? 'LearnifyAI'}
      </span>
      <span className="hidden sm:inline font-medium opacity-80">{brand.footer ?? 'Verified Course Material'}</span>
      {brand.showNumbers !== false && (
        <span className="font-mono font-bold px-[1.2cqw] py-[0.3cqw] rounded-full" style={{ background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)' }}>
          {index + 1} / {total}
        </span>
      )}
    </div>
  );

  // Takeaway banner renderer
  const renderTakeaway = () =>
    slide.takeaway ? (
      <div
        className="mt-auto flex items-center gap-[1.2cqw] rounded-[1cqw] px-[2cqw] py-[1cqw] border shadow-sm"
        style={{
          background: isDark ? 'rgba(6, 182, 212, 0.08)' : `${brand.primary}0D`,
          borderColor: isDark ? 'rgba(6, 182, 212, 0.25)' : `${brand.primary}2A`,
          fontSize: '1.35cqw'
        }}
      >
        <span
          className="grid shrink-0 place-items-center rounded-full text-white"
          style={{ width: '2.4cqw', height: '2.4cqw', background: brand.primary, fontSize: '1.1cqw' }}
        >
          💡
        </span>
        <span {...edit('takeaway')} className="font-medium" style={{ color: isDark ? '#E2E8F0' : '#1E293B' }}>
          {slide.takeaway}
        </span>
      </div>
    ) : null;

  // Title Slide Layout
  if (slide.layout === 'title') {
    return (
      <div
        className={cn('relative aspect-video w-full overflow-hidden rounded-xl text-white [container-type:inline-size] shadow-lg', className)}
        style={{ background: `linear-gradient(135deg, ${brand.primary}F2, ${brand.secondary}EE)` }}
      >
        {/* Decorative background geometry */}
        <div className="absolute -right-[15%] -top-[35%] aspect-square w-[60%] rounded-full bg-white/10 blur-[2px]" />
        <div className="absolute -bottom-[40%] left-[25%] aspect-square w-[45%] rounded-full bg-white/5 blur-[2px]" />

        <div className="absolute left-[7%] top-[10%] flex items-center gap-[1.2cqw] font-bold uppercase tracking-[0.25em]" style={{ fontSize: '1.2cqw' }}>
          <span className="grid place-items-center rounded-lg bg-white/20 px-[1cqw] py-[0.4cqw] text-white backdrop-blur">
            {brand.logoText ?? 'LearnifyAI'}
          </span>
          {slide.badge && (
            <span className="rounded-full bg-white/15 px-[1.2cqw] py-[0.3cqw] font-semibold text-white/90 normal-case tracking-normal">
              {slide.badge}
            </span>
          )}
        </div>

        <div className="absolute left-[7%] right-[12%] top-[28%]">
          <h1 {...edit('title')} style={{ fontSize: '4.8cqw', lineHeight: 1.1, fontWeight: 900, letterSpacing: '-0.025em' }}>
            {slide.title}
          </h1>
          {slide.subtitle && (
            <p {...edit('subtitle')} className="mt-[1.8cqw] font-medium text-white/85" style={{ fontSize: '2.2cqw', lineHeight: 1.3 }}>
              {slide.subtitle}
            </p>
          )}
          <p className="mt-[2cqw] text-white/70 font-mono" style={{ fontSize: '1.4cqw' }}>
            {slide.bullets[0]}
          </p>
        </div>

        <div className="absolute bottom-[8%] left-[7%] flex items-center gap-[1.2cqw] rounded-full bg-black/20 backdrop-blur px-[1.6cqw] py-[0.6cqw] font-semibold" style={{ fontSize: '1.2cqw' }}>
          <span className="rounded-full animate-pulse" style={{ width: '0.9cqw', height: '0.9cqw', background: brand.accent }} />
          Verified Code & Enterprise Architecture Courseware
        </div>
      </div>
    );
  }

  // Body Layout Variations
  let body: React.ReactNode;

  // 1. Grid Cards Layout
  if (slide.layout === 'grid') {
    body = (
      <div className="flex flex-col h-full justify-between">
        <div className="grid grid-cols-2 gap-[1.8cqw] flex-1 min-h-0">
          {slide.bullets.map((b, i) => {
            const [headline, ...rest] = b.includes(':') ? b.split(':') : [b, ''];
            return (
              <div
                key={i}
                className="flex flex-col justify-center rounded-[1.2cqw] p-[2cqw] border transition-shadow shadow-sm"
                style={{
                  background: isDark ? '#131C31' : '#F8FAFC',
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : `${brand.primary}1A`
                }}
              >
                <div className="flex items-center gap-[0.8cqw] font-bold" style={{ fontSize: '1.7cqw', color: brand.primary }}>
                  <span className="grid place-items-center rounded-md text-white font-bold" style={{ width: '2cqw', height: '2cqw', background: brand.primary, fontSize: '1cqw' }}>
                    0{i + 1}
                  </span>
                  <span>{headline.trim()}</span>
                </div>
                {rest.length > 0 && (
                  <p {...editBullet(i)} className="mt-[0.8cqw] leading-relaxed" style={{ fontSize: '1.45cqw', color: isDark ? '#CBD5E1' : '#475569' }}>
                    {rest.join(':').trim()}
                  </p>
                )}
              </div>
            );
          })}
        </div>
        {renderTakeaway()}
      </div>
    );
  }
  // 2. Timeline / Process Flow Layout
  else if (slide.layout === 'timeline') {
    body = (
      <div className="flex flex-col h-full justify-between">
        <div className="grid grid-cols-4 gap-[1.4cqw] my-auto">
          {slide.bullets.map((b, i) => {
            const [stepTitle, ...stepDesc] = b.includes(':') ? b.split(':') : [`Step ${i + 1}`, b];
            return (
              <div key={i} className="relative flex flex-col rounded-[1.2cqw] p-[1.8cqw] border shadow-sm" style={{ background: isDark ? '#131C31' : '#F8FAFC', borderColor: isDark ? 'rgba(255,255,255,0.08)' : `${brand.primary}1A` }}>
                <div className="flex items-center justify-between mb-[1cqw]">
                  <span className="grid place-items-center rounded-full text-white font-black" style={{ width: '2.6cqw', height: '2.6cqw', background: brand.primary, fontSize: '1.3cqw' }}>
                    {i + 1}
                  </span>
                  {i < slide.bullets.length - 1 && <span style={{ color: brand.primary, fontSize: '1.6cqw' }}>➔</span>}
                </div>
                <div className="font-bold leading-tight" style={{ fontSize: '1.5cqw', color: isDark ? '#FFFFFF' : '#0F172A' }}>
                  {stepTitle.replace(/^\d+\.\s*/, '').trim()}
                </div>
                <p {...editBullet(i)} className="mt-[0.8cqw] leading-relaxed" style={{ fontSize: '1.25cqw', color: isDark ? '#CBD5E1' : '#64748B' }}>
                  {stepDesc.join(':').trim()}
                </p>
              </div>
            );
          })}
        </div>
        {renderTakeaway()}
      </div>
    );
  }
  // 3. Callout / Golden Rule Layout
  else if (slide.layout === 'callout') {
    const mainQuote = slide.bullets[0] ?? '';
    const supporting = slide.bullets.slice(1);
    body = (
      <div className="flex flex-col h-full justify-between gap-[1.8cqw]">
        <div
          className="rounded-[1.4cqw] p-[2.8cqw] border-l-[0.8cqw] shadow-md"
          style={{
            background: isDark ? '#131C31' : `${brand.primary}08`,
            borderColor: brand.primary
          }}
        >
          <div className="font-serif italic font-semibold leading-snug" style={{ fontSize: '2.3cqw', color: isDark ? '#F1F5F9' : '#0F172A' }}>
            {mainQuote}
          </div>
        </div>

        {supporting.length > 0 && (
          <div className="grid grid-cols-2 gap-[1.6cqw]">
            {supporting.map((item, k) => (
              <div key={k} className="flex items-start gap-[1cqw] rounded-[1cqw] p-[1.4cqw] border" style={{ background: isDark ? '#0F172A' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
                <span className="mt-[0.2cqw] font-bold" style={{ color: brand.primary, fontSize: '1.5cqw' }}>✓</span>
                <span {...editBullet(k + 1)} className="font-medium" style={{ fontSize: '1.4cqw', color: isDark ? '#E2E8F0' : '#334155' }}>
                  {item}
                </span>
              </div>
            ))}
          </div>
        )}
        {renderTakeaway()}
      </div>
    );
  }
  // 4. Code & Concepts Layout
  else if (slide.layout === 'code') {
    body = (
      <div className="grid h-full grid-cols-[38%_1fr] gap-[2.4cqw]">
        <div className="flex flex-col justify-between">
          <ul className="space-y-[1.4cqw]">
            {slide.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-[1cqw] leading-snug">
                <span className="mt-[0.6cqw] shrink-0 rounded-[0.2cqw]" style={{ width: '0.8cqw', height: '0.8cqw', background: brand.primary }} />
                <span {...editBullet(i)} className="font-medium" style={{ fontSize: '1.6cqw', color: isDark ? '#E2E8F0' : '#334155' }}>
                  {b}
                </span>
              </li>
            ))}
          </ul>
          {renderTakeaway()}
        </div>

        <div className="flex flex-col self-start overflow-hidden rounded-[1.2cqw] bg-[#0A0F1D] border border-slate-800 shadow-xl relative w-full">
          <div className="flex items-center justify-between border-b border-slate-800/80 px-[1.6cqw] py-[1cqw]">
            <span className="flex gap-[0.6cqw]">
              {['#EF4444', '#F59E0B', '#10B981'].map(c => (
                <i key={c} className="rounded-full inline-block" style={{ width: '0.85cqw', height: '0.85cqw', background: c }} />
              ))}
            </span>
            <span className="rounded bg-slate-800/80 px-[1cqw] py-[0.2cqw] font-mono text-[1cqw] text-slate-400 uppercase tracking-widest">
              {slide.lang ?? 'Java 21'}
            </span>
          </div>
          <div className="p-[2cqw] overflow-x-auto">
            <MiniCode code={slide.code ?? ''} lang={slide.lang} />
          </div>
        </div>
      </div>
    );
  }
  // 5. Two-Column Comparison
  else if (slide.layout === 'two-col') {
    const mid = Math.ceil(slide.bullets.length / 2);
    body = (
      <div className="flex flex-col h-full justify-between">
        <div className="grid h-[85%] grid-cols-2 gap-[2.2cqw]">
          {[slide.bullets.slice(0, mid), slide.bullets.slice(mid)].map((col, k) => (
            <div
              key={k}
              className="flex flex-col rounded-[1.4cqw] p-[2.2cqw] border shadow-sm"
              style={{
                background: k ? (isDark ? '#1E1B4B' : `${brand.primary}0A`) : isDark ? '#131C31' : '#F8FAFC',
                borderColor: k ? brand.primary : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'
              }}
            >
              <h4 className="mb-[1.4cqw] font-bold pb-[0.8cqw] border-b" style={{ fontSize: '1.9cqw', color: k ? brand.primary : isDark ? '#FFFFFF' : '#0F172A', borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}>
                {col[0]}
              </h4>
              <ul className="space-y-[1.2cqw] flex-1">
                {col.slice(1).map((b, idx) => (
                  <li key={idx} className="flex items-start gap-[0.8cqw]">
                    <span className="mt-[0.5cqw] font-bold" style={{ color: brand.primary, fontSize: '1.3cqw' }}>•</span>
                    <span {...editBullet(k ? mid + idx : idx + 1)} style={{ fontSize: '1.45cqw', color: isDark ? '#CBD5E1' : '#334155' }}>
                      {b}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {renderTakeaway()}
      </div>
    );
  }
  // 6. Diagram View
  else if (slide.layout === 'diagram') {
    body = (
      <div className="grid h-full grid-cols-[34%_1fr] gap-[3cqw]">
        <div className="flex flex-col justify-between">
          <ul className="space-y-[1.4cqw]">
            {slide.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-[1cqw]">
                <span className="mt-[0.6cqw] shrink-0 rounded-[0.2cqw]" style={{ width: '0.8cqw', height: '0.8cqw', background: brand.primary }} />
                <span {...editBullet(i)} style={{ fontSize: '1.6cqw', color: isDark ? '#E2E8F0' : '#334155' }}>{b}</span>
              </li>
            ))}
          </ul>
          {renderTakeaway()}
        </div>
        <div className="relative h-[90%] rounded-xl p-[2cqw] border shadow-inner" style={{ background: isDark ? '#0A0F1D' : '#F8FAFC', borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}>
          <DiagramView id={slide.diagramId ?? 'd1'} data={slide.diagram} brand={brand} />
        </div>
      </div>
    );
  }
  // 7. Summary Checklist
  else if (slide.layout === 'summary') {
    body = (
      <div className="flex flex-col h-full justify-between">
        <ul className="grid grid-cols-2 gap-[1.6cqw] my-auto">
          {slide.bullets.map((b, i) => (
            <li
              key={i}
              className="flex items-start gap-[1.4cqw] rounded-[1.2cqw] p-[1.8cqw] border shadow-sm"
              style={{
                background: isDark ? '#131C31' : '#FFFFFF',
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'
              }}
            >
              <span className="grid shrink-0 place-items-center rounded-full font-bold text-white shadow" style={{ width: '2.8cqw', height: '2.8cqw', background: brand.primary, fontSize: '1.4cqw' }}>
                ✓
              </span>
              <span {...editBullet(i)} className="font-semibold leading-relaxed" style={{ fontSize: '1.6cqw', color: isDark ? '#F1F5F9' : '#1E293B' }}>
                {b}
              </span>
            </li>
          ))}
        </ul>
        {renderTakeaway()}
      </div>
    );
  }
  // Default Bullets Layout
  else {
    body = (
      <div className="flex flex-col h-full justify-between">
        <ul className="space-y-[1.8cqw] my-auto">
          {slide.bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-[1.4cqw] leading-relaxed">
              <span className="mt-[0.6cqw] shrink-0 rounded-full" style={{ width: '1.1cqw', height: '1.1cqw', background: brand.primary }} />
              <span {...editBullet(i)} className="font-medium" style={{ fontSize: '2cqw', color: isDark ? '#E2E8F0' : '#1E293B' }}>
                {b}
              </span>
            </li>
          ))}
        </ul>
        {renderTakeaway()}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative aspect-video w-full overflow-hidden rounded-xl border [container-type:inline-size] shadow-md transition-colors',
        isDark ? 'bg-[#0B1120] text-slate-100 border-slate-800' : 'bg-white text-slate-900 border-slate-200/80',
        className
      )}
    >
      {/* Top accent bar */}
      <div className="absolute inset-x-0 top-0 h-[0.7cqw]" style={{ background: `linear-gradient(90deg, ${brand.primary}, ${brand.secondary})` }} />

      {/* Main Slide Content Area */}
      <div className="absolute inset-x-[5%] top-[7%] bottom-[12%] flex flex-col">
        {/* Header with Title and Metadata Badge */}
        <div className="flex items-start justify-between gap-[2cqw]">
          <div className="min-w-0 flex-1">
            <h2 {...edit('title')} style={{ fontSize: '3.3cqw', fontWeight: 900, letterSpacing: '-0.025em', lineHeight: 1.15, color: isDark ? '#FFFFFF' : '#0F172A' }}>
              {slide.title}
            </h2>
            {slide.subtitle && (
              <p {...edit('subtitle')} className="mt-[0.6cqw] font-medium" style={{ fontSize: '1.5cqw', color: isDark ? '#94A3B8' : '#64748B' }}>
                {slide.subtitle}
              </p>
            )}
          </div>
          {slide.badge && (
            <span
              className="shrink-0 font-bold px-[1.4cqw] py-[0.4cqw] rounded-full border text-[1.1cqw]"
              style={{
                borderColor: brand.primary,
                background: isDark ? 'rgba(255,255,255,0.06)' : `${brand.primary}12`,
                color: brand.primary
              }}
            >
              {slide.badge}
            </span>
          )}
        </div>

        {/* Dynamic Body Component */}
        <div className="mt-[2.4cqw] min-h-0 flex-1">{body}</div>
      </div>

      {footer()}
    </div>
  );
}
