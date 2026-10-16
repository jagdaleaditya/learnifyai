import { CheckCircle2, CircleDashed, Loader2, XCircle, RotateCw, Clock, AlertTriangle, FileEdit, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { CourseStatus, SnippetStatus } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

const COURSE: Record<CourseStatus, { label: string; variant: 'success' | 'info' | 'warning' | 'danger' | 'slate'; icon: React.ElementType; pulse?: boolean }> = {
  verified: { label: 'Verified', variant: 'success', icon: CheckCircle2 },
  generating: { label: 'Generating', variant: 'info', icon: Sparkles, pulse: true },
  verifying: { label: 'Verifying', variant: 'info', icon: Loader2, pulse: true },
  review: { label: 'In review', variant: 'warning', icon: AlertTriangle },
  failed: { label: 'Failed', variant: 'danger', icon: XCircle },
  draft: { label: 'Draft', variant: 'slate', icon: FileEdit },
};

export function StatusBadge({ status, className }: { status: CourseStatus; className?: string }) {
  const s = COURSE[status];
  const Icon = s.icon;
  return (
    <Badge variant={s.variant} className={cn(s.pulse && 'relative', className)}>
      {s.pulse && <span className="relative mr-0.5 flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" /></span>}
      {!s.pulse && <Icon />}
      {s.label}
    </Badge>
  );
}

export function SnippetIcon({ status, className }: { status: SnippetStatus; className?: string }) {
  const map = {
    queued: <Clock className={cn('h-4 w-4 text-slate-400', className)} />,
    running: <Loader2 className={cn('h-4 w-4 animate-spin text-blue-500', className)} />,
    passed: <CheckCircle2 className={cn('h-4 w-4 text-emerald-500', className)} />,
    failed: <XCircle className={cn('h-4 w-4 text-red-500', className)} />,
    retrying: <RotateCw className={cn('h-4 w-4 animate-spin text-amber-500', className)} />,
  } as const;
  return map[status] ?? <CircleDashed className={className} />;
}

export function Dot({ status }: { status: 'passed' | 'failed' | 'pending' | 'none' }) {
  const c = { passed: 'bg-emerald-500', failed: 'bg-red-500', pending: 'bg-blue-500 animate-pulse', none: 'bg-slate-300 dark:bg-slate-600' }[status];
  return <span className={cn('inline-block h-2 w-2 rounded-full', c)} />;
}
