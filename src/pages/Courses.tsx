import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Archive, ArchiveRestore, BookOpen, Copy, LayoutGrid, List, MoreHorizontal, Pencil, Plus, Search, ShieldCheck, Trash2, Clock, SearchX } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/misc';
import { ConfirmDialog, EmptyState, PageHeader } from '@/components/shared/common';
import { StatusBadge } from '@/components/shared/status';
import { useStore } from '@/lib/store';
import type { Course, CourseStatus } from '@/lib/mock-data';
import { cn, timeAgo } from '@/lib/utils';
import { CourseThumb } from './Dashboard';

const PAGE = 6;

export default function Courses() {
  const navigate = useNavigate();
  const { courses, duplicateCourse, removeCourse, archived, toggleArchive } = useStore();
  const [view, setView] = React.useState<'grid' | 'table'>(() => { try { return (localStorage.getItem('learnify-courses-view') as 'grid' | 'table') || 'grid'; } catch { return 'grid'; } });
  const [q, setQ] = React.useState('');
  const [status, setStatus] = React.useState<'all' | CourseStatus | 'archived'>('all');
  const [lang, setLang] = React.useState('all');
  const [sort, setSort] = React.useState('updated');
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [toDelete, setToDelete] = React.useState<Course | null>(null);

  React.useEffect(() => { const t = setTimeout(() => setLoading(false), 450); return () => clearTimeout(t); }, []);
  React.useEffect(() => { try { localStorage.setItem('learnify-courses-view', view); } catch { /* ignore */ } }, [view]);
  React.useEffect(() => setPage(1), [q, status, lang, sort]);

  const languages = [...new Set(courses.map(c => c.language))];
  let rows = courses.filter(c => (status === 'archived' ? archived.has(c.id) : !archived.has(c.id) && (status === 'all' || c.status === status)));
  rows = rows.filter(c => (lang === 'all' || c.language === lang) && (c.title + c.description + c.tags.join(' ')).toLowerCase().includes(q.toLowerCase()));
  rows = [...rows].sort((a, b) => sort === 'title' ? a.title.localeCompare(b.title) : sort === 'created' ? b.createdAt.localeCompare(a.createdAt) : sort === 'coverage' ? b.coverage - a.coverage : b.updatedAt.localeCompare(a.updatedAt));
  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const shown = rows.slice((page - 1) * PAGE, page * PAGE);

  const counts: Record<string, number> = { all: courses.filter(c => !archived.has(c.id)).length, archived: archived.size };
  courses.forEach(c => { if (!archived.has(c.id)) counts[c.status] = (counts[c.status] ?? 0) + 1; });

  const Actions = ({ c }: { c: Course }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" aria-label={`Actions for ${c.title}`} onClick={e => e.preventDefault()}><MoreHorizontal /></Button></DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={e => e.stopPropagation()}>
        <DropdownMenuItem onSelect={() => navigate(`/studio/${c.id}`)}><Pencil /> Edit in Studio</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => { const d = duplicateCourse(c.id); if (d) toast.success('Course duplicated', { description: d.title }); }}><Copy /> Duplicate</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => navigate('/verification')}><ShieldCheck /> Verify code</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => { toggleArchive(c.id); toast(archived.has(c.id) ? 'Course restored' : 'Course archived', { description: c.title, action: { label: 'Undo', onClick: () => toggleArchive(c.id) } }); }}>
          {archived.has(c.id) ? <><ArchiveRestore /> Unarchive</> : <><Archive /> Archive</>}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive onSelect={() => setToDelete(c)}><Trash2 /> Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div>
      <PageHeader eyebrow="Workspace" title="My Courses" description={`${counts.all} courses · ${counts.verified ?? 0} verified`}
        actions={<Button variant="gradient" onClick={() => navigate('/courses/new')}><Plus /> New Course</Button>} />

      <div className="mb-4 flex gap-1 overflow-x-auto border-b scrollbar-thin">
        {(['all', 'verified', 'review', 'verifying', 'generating', 'failed', 'draft', 'archived'] as const).map(s => (
          <button key={s} onClick={() => setStatus(s)} className={cn('-mb-px shrink-0 border-b-2 px-3 py-2 text-sm font-medium capitalize transition', status === s ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground')}>
            {s === 'review' ? 'In review' : s} <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[11px]">{counts[s] ?? 0}</span>
          </button>
        ))}
      </div>

      <div className="mb-5 flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Search by title, description or tag…" value={q} onChange={e => setQ(e.target.value)} /></div>
        <div className="flex gap-2">
          <Select value={lang} onValueChange={setLang}><SelectTrigger className="w-full md:w-40" aria-label="Language"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All languages</SelectItem>{languages.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent></Select>
          <Select value={sort} onValueChange={setSort}><SelectTrigger className="w-full md:w-44" aria-label="Sort"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="updated">Last modified</SelectItem><SelectItem value="created">Newest first</SelectItem><SelectItem value="title">Title A–Z</SelectItem><SelectItem value="coverage">Coverage</SelectItem></SelectContent></Select>
          <div className="flex shrink-0 rounded-lg border bg-card p-0.5">
            <Button variant="ghost" size="icon-sm" className={cn(view === 'grid' && 'bg-muted')} onClick={() => setView('grid')} aria-label="Grid view" aria-pressed={view === 'grid'}><LayoutGrid /></Button>
            <Button variant="ghost" size="icon-sm" className={cn(view === 'table' && 'bg-muted')} onClick={() => setView('table')} aria-label="Table view" aria-pressed={view === 'table'}><List /></Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-72 rounded-xl" />)}</div>
      ) : rows.length === 0 ? (
        q || lang !== 'all' ? (
          <EmptyState icon={SearchX} title="No courses match" description="Try a different search term or clear the filters." action={<Button variant="outline" onClick={() => { setQ(''); setLang('all'); setStatus('all'); }}>Clear filters</Button>} />
        ) : (
          <EmptyState icon={BookOpen} title={status === 'archived' ? 'Nothing archived' : 'No courses yet'} description={status === 'archived' ? 'Archived courses appear here. They keep their reports and exports.' : 'Create your first course: we generate slides, code and tests, then verify everything.'}
            action={status === 'archived' ? <Button variant="outline" onClick={() => setStatus('all')}>Back to all courses</Button> : <Button variant="gradient" onClick={() => navigate('/courses/new')}><Plus /> Create course</Button>} />
        )
      ) : view === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map(c => (
            <Card key={c.id} className="card-hover group flex flex-col overflow-hidden p-3">
              <Link to={`/studio/${c.id}`} className="block overflow-hidden rounded-lg"><CourseThumb course={c} className="h-36 transition-transform duration-500 group-hover:scale-[1.03]" /></Link>
              <div className="flex flex-1 flex-col px-2 pb-1 pt-4">
                <div className="flex items-start justify-between gap-2">
                  <Link to={`/studio/${c.id}`} className="min-w-0 font-semibold hover:text-primary"><span className="line-clamp-1">{c.title}</span></Link>
                  <Actions c={c} />
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
                <div className="mt-3 flex flex-wrap items-center gap-1.5"><StatusBadge status={c.status} /><Badge variant="secondary" className="font-mono">v{c.version}</Badge>{c.tags.slice(0, 2).map(t => <Badge key={t} variant="outline">{t}</Badge>)}</div>
                <div className="mt-auto flex items-center justify-between border-t pt-3 text-xs text-muted-foreground" style={{ marginTop: 16 }}>
                  <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" />{c.snippets.total ? `${c.snippets.passed}/${c.snippets.total}` : '—'} snippets</span>
                  <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{timeAgo(c.updatedAt)}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <Table>
            <THead><TR className="hover:bg-transparent"><TH>Course</TH><TH>Status</TH><TH className="hidden md:table-cell">Runtime</TH><TH className="hidden lg:table-cell">Snippets</TH><TH>Version</TH><TH className="hidden sm:table-cell">Last modified</TH><TH /></TR></THead>
            <TBody>
              {shown.map(c => (
                <TR key={c.id} className="cursor-pointer" onClick={() => navigate(`/studio/${c.id}`)}>
                  <TD><div className="flex items-center gap-3"><span className="h-9 w-9 shrink-0 rounded-lg" style={{ background: `linear-gradient(135deg, ${c.accent[0]}, ${c.accent[1]})` }} /><div className="min-w-0"><div className="truncate font-medium">{c.title}</div><div className="text-xs text-muted-foreground">{c.level} · {c.durationMin} min</div></div></div></TD>
                  <TD><StatusBadge status={c.status} /></TD>
                  <TD className="hidden font-mono text-xs md:table-cell">{c.runtime}</TD>
                  <TD className="hidden lg:table-cell">{c.snippets.total ? `${c.snippets.passed}/${c.snippets.total}` : '—'}</TD>
                  <TD><Badge variant="secondary" className="font-mono">v{c.version}</Badge></TD>
                  <TD className="hidden whitespace-nowrap text-muted-foreground sm:table-cell">{timeAgo(c.updatedAt)}</TD>
                  <TD onClick={e => e.stopPropagation()}><Actions c={c} /></TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </Card>
      )}

      {!loading && rows.length > PAGE && (
        <div className="mt-6 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Showing {(page - 1) * PAGE + 1}–{Math.min(page * PAGE, rows.length)} of {rows.length}</span>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
            {Array.from({ length: pages }, (_, i) => <Button key={i} variant={page === i + 1 ? 'default' : 'ghost'} size="icon-sm" onClick={() => setPage(i + 1)} aria-label={`Page ${i + 1}`}>{i + 1}</Button>)}
            <Button variant="outline" size="sm" disabled={page === pages} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!toDelete} onOpenChange={o => !o && setToDelete(null)} destructive confirmLabel="Delete course"
        title={`Delete “${toDelete?.title}”?`} description="The course, its slides, verification reports and export history will be permanently deleted. This cannot be undone."
        onConfirm={() => { if (toDelete) { removeCourse(toDelete.id); toast.success('Course deleted', { description: toDelete.title }); } }} />
    </div>
  );
}
