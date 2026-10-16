import * as React from 'react';
import { cn } from '@/lib/utils';

const reduced = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Returns true once the element has scrolled into view (fires once). */
export function useInView<T extends Element>(opts: IntersectionObserverInit = { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }) {
  const ref = React.useRef<T>(null);
  const [inView, setInView] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined' || reduced()) { setInView(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); io.disconnect(); } }, opts);
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return [ref, inView] as const;
}

type RevealProps = React.HTMLAttributes<HTMLElement> & {
  as?: keyof JSX.IntrinsicElements;
  delay?: number;
  /** 'up' (default), 'left', 'right', 'scale', 'fade' */
  from?: 'up' | 'left' | 'right' | 'scale' | 'fade';
  /** Stagger direct children instead of animating the wrapper. */
  stagger?: number;
};

/** Fades/slides content in when it scrolls into view. */
export function Reveal({ as = 'div', delay = 0, from = 'up', stagger, className, style, children, ...rest }: RevealProps) {
  const [ref, inView] = useInView<HTMLElement>();
  const Comp = as as React.ElementType;
  return (
    <Comp
      ref={ref}
      data-in={inView ? '' : undefined}
      className={cn(stagger ? 'reveal-stagger' : 'reveal', `reveal-${from}`, className)}
      style={{ ...style, '--reveal-delay': `${delay}ms`, '--reveal-step': `${stagger ?? 0}ms` } as React.CSSProperties}
      {...rest}
    >
      {children}
    </Comp>
  );
}

/** Counts up to the numeric part of a value like "96%" or "5 s" when visible. */
export function CountUp({ value, duration = 1400, className }: { value: string; duration?: number; className?: string }) {
  const [ref, inView] = useInView<HTMLSpanElement>({ threshold: 0.4 });
  const m = value.match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/);
  const target = m ? parseFloat(m[2]) : 0;
  const [n, setN] = React.useState(0);
  React.useEffect(() => {
    if (!inView || !m) return;
    if (reduced()) { setN(target); return; }
    let raf = 0; const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setN(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);
  if (!m) return <span className={className}>{value}</span>;
  const decimals = m[2].includes('.') ? m[2].split('.')[1].length : 0;
  return <span ref={ref} className={cn('tabular-nums', className)}>{m[1]}{n.toFixed(decimals)}{m[3]}</span>;
}

/** Adds a shadow class to the header once the page has scrolled. */
export function useScrolled(threshold = 8) {
  const [s, setS] = React.useState(false);
  React.useEffect(() => {
    const on = () => setS(window.scrollY > threshold);
    on(); window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, [threshold]);
  return s;
}
