import * as React from 'react';
import { ArrowDownRight, ArrowUpRight, Minus, type LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

export function Logo({ className, compact, light }: { className?: string; compact?: boolean; light?: boolean }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <img src={`${import.meta.env.BASE_URL}logo.jpg`} alt="LearnifyAI" className="h-10 w-10 shrink-0 rounded-[10px] shadow-md shadow-indigo-500/25 object-cover" />
      {!compact && (
        <div className="min-w-0 leading-tight">
          <div className={cn('text-[15px] font-bold tracking-tight', light ? 'text-white' : 'text-foreground')}>Learnify<span className="text-primary">AI</span></div>
          <div className={cn('truncate text-[11px]', light ? 'text-slate-400' : 'text-muted-foreground')}>Verified Course Material Studio</div>
        </div>
      )}
    </div>
  );
}

export function PageHeader({ title, description, actions, eyebrow, className }: { title: React.ReactNode; description?: React.ReactNode; actions?: React.ReactNode; eyebrow?: React.ReactNode; className?: string }) {
  return (
    <div className={cn('mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="min-w-0">
        {eyebrow && <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-primary">{eyebrow}</div>}
        <h1 className="text-2xl font-bold tracking-tight sm:text-[28px]">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground sm:text-[15px]">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, trend, up, tone = 'indigo', className }: { icon: LucideIcon; label: string; value: React.ReactNode; trend?: string; up?: boolean | null; tone?: 'indigo' | 'emerald' | 'blue' | 'violet' | 'amber' | 'red'; className?: string }) {
  const tones = { indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300', emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300', blue: 'bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300', violet: 'bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300', amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300', red: 'bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-300' };
  return (
    <Card className={cn('card-hover p-5', className)}>
      <div className="flex items-start justify-between">
        <div className={cn('grid h-10 w-10 place-items-center rounded-xl', tones[tone])}><Icon className="h-5 w-5" /></div>
        {trend && (
          <span className={cn('inline-flex items-center gap-0.5 text-xs font-medium', up === true ? 'text-emerald-600 dark:text-emerald-400' : up === false ? 'text-red-600' : 'text-muted-foreground')}>
            {up === true ? <ArrowUpRight className="h-3.5 w-3.5" /> : up === false ? <ArrowDownRight className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}{trend}
          </span>
        )}
      </div>
      <div className="mt-4 text-[28px] font-bold leading-none tracking-tight">{value}</div>
      <div className="mt-1.5 text-sm text-muted-foreground">{label}</div>
    </Card>
  );
}

export function EmptyState({ icon: Icon, title, description, action, className }: { icon: LucideIcon; title: string; description?: string; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-16 text-center', className)}>
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-100 text-primary dark:from-indigo-500/10 dark:to-violet-500/20"><Icon className="h-6 w-6" /></div>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel = 'Confirm', destructive, onConfirm }: { open: boolean; onOpenChange: (o: boolean) => void; title: string; description: string; confirmLabel?: string; destructive?: boolean; onConfirm: () => void }) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader><AlertDialogTitle>{title}</AlertDialogTitle><AlertDialogDescription>{description}</AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction destructive={destructive} onClick={onConfirm}>{confirmLabel}</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function SectionTitle({ children, action, className }: { children: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return <div className={cn('mb-3 flex items-center justify-between gap-3', className)}><h2 className="text-base font-semibold tracking-tight">{children}</h2>{action}</div>;
}

/** Small "page is loading" skeleton used by lazy routes and simulated fetches. */
export function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2"><div className="skeleton h-7 w-64" /><div className="skeleton h-4 w-96 max-w-full" /></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-32 rounded-xl" />)}</div>
      <div className="grid gap-4 lg:grid-cols-3"><div className="skeleton h-72 rounded-xl lg:col-span-2" /><div className="skeleton h-72 rounded-xl" /></div>
    </div>
  );
}

/** Simulates a short data fetch so pages show skeleton loaders. */
export function useFakeLoad(ms = 450) {
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => { const t = setTimeout(() => setLoading(false), ms); return () => clearTimeout(t); }, [ms]);
  return loading;
}

export function Ring({ value, size = 120, stroke = 12, label }: { value: number; size?: number; stroke?: number; label?: React.ReactNode }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs><linearGradient id="ringg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#4F46E5" /><stop offset="1" stopColor="#7C3AED" /></linearGradient></defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-muted" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="url(#ringg)" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} className="transition-[stroke-dashoffset] duration-1000" />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{label ?? <span className="text-2xl font-bold">{value}%</span>}</div>
    </div>
  );
}
