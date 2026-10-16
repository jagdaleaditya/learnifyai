import { Link, useNavigate } from 'react-router-dom';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  ArrowRight, ArrowUpRight, BookOpen, Check, CircleArrowUp, Clock, Download, Loader2, MessageSquare, Plus, RefreshCw, ShieldCheck, Sparkles, Upload, Wrench, X, Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/controls';
import { Badge } from '@/components/ui/badge';
import { StatCard, SectionTitle, PageSkeleton, useFakeLoad } from '@/components/shared/common';
import { StatusBadge } from '@/components/shared/status';
import { activity, dashboardStats, generationSteps, jobs, passRate30d, type Course } from '@/lib/mock-data';
import { useStore } from '@/lib/store';
import { cn, timeAgo } from '@/lib/utils';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

export function CourseThumb({ course, className }: { course: Course; className?: string }) {
  return (
    <div className={cn('relative overflow-hidden rounded-lg', className)} style={{ background: `linear-gradient(135deg, ${course.accent[0]}, ${course.accent[1]})` }}>
      <div className="absolute -right-6 -top-8 h-28 w-28 rounded-full bg-white/10" />
      <div className="absolute -bottom-10 left-10 h-24 w-24 rounded-full bg-white/5" />
      <div className="absolute inset-x-4 top-4 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80"><span>{course.language}</span><span>{course.runtime}</span></div>
      <div className="absolute inset-x-4 bottom-4 text-lg font-bold leading-tight text-white drop-shadow-sm">{course.title}</div>
    </div>
  );
}

const ACT_ICON = { check: Check, wrench: Wrench, upload: Upload, arrow: CircleArrowUp, comment: MessageSquare, x: X } as const;
const ACT_TONE: Record<string, string> = {
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  danger: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  default: 'bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300',
};

export default function Dashboard() {
  const loading = useFakeLoad(500);
  const navigate = useNavigate();
  const { courses } = useStore();
  if (loading) return <PageSkeleton />;

  const recent = ['java-oop', 'react-hooks', 'docker-essentials'].map(id => courses.find(c => c.id === id)).filter(Boolean) as Course[];
  const extra = courses.filter(c => c.createdAt > new Date(Date.now() - 36e5).toISOString() && !recent.includes(c));
  const shown = [...extra, ...recent].slice(0, 3);
  const statIcons = { courses: BookOpen, pass: ShieldCheck, jobs: Loader2, exports: Download } as const;
  const statTones = { courses: 'indigo', pass: 'emerald', jobs: 'blue', exports: 'violet' } as const;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-[28px]">{greeting()}, Trainer</h1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-[15px]">Your course creation workspace</p>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-600 p-6 text-white shadow-xl shadow-indigo-500/20 sm:p-8">
        <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-24 right-40 h-56 w-56 rounded-full bg-violet-400/30 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:18px_18px]" />
        <div className="relative grid items-center gap-6 lg:grid-cols-[1fr_auto]">
          <div className="max-w-2xl">
            <Badge className="border-white/20 bg-white/15 text-white backdrop-blur"><Sparkles /> AI course generator · code verified</Badge>
            <h2 className="mt-4 text-2xl font-bold leading-tight tracking-tight sm:text-[32px]">Create something extraordinary for your next class.</h2>
            <p className="mt-2 text-sm text-indigo-100 sm:text-base">Describe a topic. Get slides, speaker notes, runnable examples, tested exercises, a quiz and a cheat sheet, every snippet executed before it reaches students.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button size="lg" className="bg-white text-indigo-700 shadow-lg hover:bg-indigo-50" onClick={() => navigate('/courses/new')}><Plus /> Create New Course</Button>
              <Button size="lg" variant="ghost" className="text-white hover:bg-white/15 hover:text-white" onClick={() => navigate('/studio/java-oop')}>Open last course <ArrowRight /></Button>
            </div>
          </div>
          <div className="hidden w-[290px] rotate-2 rounded-xl border border-white/20 bg-white/10 p-3 shadow-2xl backdrop-blur-md transition hover:rotate-0 lg:block">
            <div className="rounded-lg bg-white p-4 text-slate-900">
              <div className="h-1.5 w-8 rounded-full bg-indigo-600" />
              <div className="mt-2 text-sm font-extrabold">Withdrawing safely</div>
              <div className="mt-2 rounded-md bg-[#0B1120] p-2 font-mono text-[9px] leading-relaxed text-slate-300"><span className="text-violet-300">if</span> (amount &gt; balance) {'{'}<br />&nbsp;&nbsp;<span className="text-violet-300">return</span> <span className="text-emerald-300">"Insufficient funds"</span>;<br />{'}'}</div>
            </div>
            <div className="mt-2.5 flex items-center justify-between px-1 text-[11px]"><span className="inline-flex items-center gap-1 font-medium"><ShieldCheck className="h-3.5 w-3.5 text-emerald-300" /> Verified on Java 21</span><span className="text-indigo-100">14/14</span></div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map(s => (
          <button key={s.key} className="text-left" onClick={() => navigate({ courses: '/courses', pass: '/reports', jobs: '/verification', exports: '/exports' }[s.key]!)}>
            <StatCard icon={statIcons[s.key as keyof typeof statIcons]} label={s.label} value={s.key === 'courses' ? String(courses.length) : s.value} trend={s.trend} up={s.up} tone={statTones[s.key as keyof typeof statTones]} className="h-full" />
          </button>
        ))}
      </section>

      {/* Quick actions */}
      <section>
        <SectionTitle>Quick actions</SectionTitle>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: Sparkles, title: 'Create Course', text: 'Topic → verified deck with exercises and quiz', to: '/courses/new', tone: 'from-indigo-500 to-violet-500' },
            { icon: ShieldCheck, title: 'Verify Code', text: 'Run every snippet in an isolated sandbox', to: '/verification', tone: 'from-emerald-500 to-teal-500' },
            { icon: RefreshCw, title: 'Update Course', text: 'Upgrade a deck to a newer framework version', to: '/upgrades', tone: 'from-blue-500 to-indigo-500' },
          ].map(a => (
            <Link key={a.title} to={a.to} className="group">
              <Card className="card-hover flex h-full items-center gap-4 p-5">
                <div className={cn('grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white shadow-md', a.tone)}><a.icon className="h-5 w-5" /></div>
                <div className="min-w-0 flex-1"><div className="font-semibold">{a.title}</div><div className="text-sm text-muted-foreground">{a.text}</div></div>
                <ArrowUpRight className="h-5 w-5 shrink-0 text-muted-foreground transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent courses */}
      <section>
        <SectionTitle action={<Button variant="ghost" size="sm" asChild><Link to="/courses">View all <ArrowRight /></Link></Button>}>Recent courses</SectionTitle>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {shown.map(c => (
            <Link key={c.id} to={`/studio/${c.id}`} className="group">
              <Card className="card-hover h-full overflow-hidden p-3">
                <CourseThumb course={c} className="h-36 transition-transform duration-500 group-hover:scale-[1.02]" />
                <div className="px-2 pb-2 pt-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0"><div className="truncate font-semibold">{c.title}</div><div className="mt-0.5 text-xs text-muted-foreground">{c.level} · {c.durationMin} min · {c.slides} slides</div></div>
                    <StatusBadge status={c.status} />
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" />{c.statusNote ?? `${c.snippets.passed}/${c.snippets.total} snippets verified`}</span>
                    <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{timeAgo(c.updatedAt)}</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        {/* Jobs */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div><CardTitle>In-progress jobs</CardTitle><CardDescription>Generation and verification pipelines</CardDescription></div>
            <Badge variant="info"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" /> {jobs.length} running</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {jobs.map(j => (
              <div key={j.id} className="rounded-xl border p-4 transition hover:border-primary/30">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Link to={j.step >= 3 ? '/verification' : `/studio/${j.courseId}`} className="font-semibold hover:text-primary">{j.title}</Link>
                  <span className="text-xs text-muted-foreground">{j.progress}% · {j.eta}</span>
                </div>
                <Progress value={j.progress} className="mt-3 h-2" />
                <ol className="mt-3 flex items-center gap-1 overflow-x-auto">
                  {generationSteps.map((s, i) => (
                    <li key={s} className="flex shrink-0 items-center gap-1">
                      <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium',
                        i < j.step ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' : i === j.step ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300' : 'bg-muted text-muted-foreground')}>
                        {i < j.step ? <Check className="h-3 w-3" /> : i === j.step ? <Loader2 className="h-3 w-3 animate-spin" /> : null}{s}
                      </span>
                      {i < generationSteps.length - 1 && <span className="h-px w-3 bg-border" />}
                    </li>
                  ))}
                </ol>
                <p className="mt-2.5 font-mono text-[11.5px] text-muted-foreground">{j.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Activity */}
        <Card>
          <CardHeader><CardTitle>Recent activity</CardTitle><CardDescription>Across your courses and team</CardDescription></CardHeader>
          <CardContent>
            <ol className="relative space-y-5 before:absolute before:bottom-2 before:left-[15px] before:top-2 before:w-px before:bg-border">
              {activity.map(a => {
                const Icon = ACT_ICON[a.icon as keyof typeof ACT_ICON] ?? Zap;
                return (
                  <li key={a.id} className="relative flex gap-3">
                    <span className={cn('relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full ring-4 ring-card', ACT_TONE[a.tone])}><Icon className="h-3.5 w-3.5" /></span>
                    <div className="min-w-0 pt-1"><p className="text-sm leading-snug">{a.text}</p><p className="mt-0.5 text-xs text-muted-foreground">{timeAgo(a.at)}</p></div>
                  </li>
                );
              })}
            </ol>
          </CardContent>
        </Card>
      </section>

      {/* Chart */}
      <Card>
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 space-y-0">
          <div><CardTitle>Verification pass rate</CardTitle><CardDescription>First-attempt pass rate over the last 30 days</CardDescription></div>
          <div className="flex items-center gap-6 text-sm">
            <div><div className="text-xs text-muted-foreground">Current</div><div className="text-lg font-bold">{passRate30d[29].rate}%</div></div>
            <div><div className="text-xs text-muted-foreground">Runs (30d)</div><div className="text-lg font-bold">{passRate30d.reduce((a, b) => a + b.runs, 0).toLocaleString()}</div></div>
            <Button variant="outline" size="sm" asChild><Link to="/reports">Reports <ArrowRight /></Link></Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={passRate30d} margin={{ left: -18, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="pr" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366F1" stopOpacity={0.35} /><stop offset="100%" stopColor="#6366F1" stopOpacity={0} /></linearGradient>
                  <linearGradient id="prs" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#4F46E5" /><stop offset="100%" stopColor="#7C3AED" /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} interval={4} />
                <YAxis domain={[80, 100]} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} unit="%" />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', fontSize: 12 }} formatter={(v: number) => [`${v}%`, 'Pass rate']} />
                <Area type="monotone" dataKey="rate" stroke="url(#prs)" strokeWidth={2.5} fill="url(#pr)" dot={false} activeDot={{ r: 5, fill: '#4F46E5', stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <p className="pb-2 text-center text-xs text-muted-foreground">Illustrative mockup. Numbers and course records are sample data.</p>
    </div>
  );
}
