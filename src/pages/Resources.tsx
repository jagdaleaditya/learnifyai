import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2, Download, FileText, FlaskConical, FolderOpen, LayoutGrid, LayoutTemplate, List, Network, Presentation, Search, ShieldCheck, Upload, CornerDownRight, SearchX } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, SheetContent } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState, PageHeader } from '@/components/shared/common';
import { CodeBlock } from '@/components/shared/code';
import { resourceCategories, resources as seed } from '@/lib/mock-data';
import { useStore } from '@/lib/store';
import { cn, formatDate, sleep, timeAgo } from '@/lib/utils';

type Res = typeof seed[number];
const CAT_ICON: Record<string, typeof Code2> = { 'Code Snippets': Code2, Exercises: FlaskConical, PDFs: FileText, Presentations: Presentation, Diagrams: Network, Templates: LayoutTemplate };
const CAT_TONE: Record<string, string> = { 'Code Snippets': 'from-indigo-500 to-violet-500', Exercises: 'from-emerald-500 to-teal-500', PDFs: 'from-rose-500 to-red-500', Presentations: 'from-orange-500 to-amber-500', Diagrams: 'from-sky-500 to-blue-600', Templates: 'from-fuchsia-500 to-purple-600' };
const isCode = (r: Res) => r.category === 'Code Snippets';

export default function Resources() {
  const navigate = useNavigate();
  const { courses } = useStore();
  const [items, setItems] = React.useState(seed);
  const [cat, setCat] = React.useState<string>('all');
  const [tag, setTag] = React.useState<string | null>(null);
  const [q, setQ] = React.useState('');
  const [view, setView] = React.useState<'grid' | 'list'>('grid');
  const [preview, setPreview] = React.useState<Res | null>(null);
  const [insertTo, setInsertTo] = React.useState('java-oop');
  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [up, setUp] = React.useState({ title: '', category: 'Code Snippets' });
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [file, setFile] = React.useState<File | null>(null);

  const tags = [...new Set(items.flatMap(r => r.tags))].sort();
  const shown = items.filter(r => (cat === 'all' || r.category === cat) && (!tag || r.tags.includes(tag)) && (r.title + r.tags.join(' ')).toLowerCase().includes(q.toLowerCase()));

  const insert = async (r: Res) => {
    const c = courses.find(x => x.id === insertTo);
    setPreview(null);
    toast.success(`Inserted into ${c?.title}`, { description: `${r.title} added as a new slide${isCode(r) ? ' · code verified' : ''}`, action: { label: 'Open Studio', onClick: () => navigate(`/studio/${insertTo}`) } });
  };

  const doUpload = async () => {
    setUploading(true); await sleep(1100); setUploading(false);
    const r: Res = { id: 'r' + Date.now(), title: up.title || file?.name || 'Untitled resource', category: up.category as Res['category'], tags: ['Uploaded'], size: file ? `${Math.max(1, Math.round(file.size / 1000))} KB` : '1 KB', updatedAt: new Date().toISOString(), verified: false, preview: 'Uploaded just now · verification queued' };
    setItems(x => [r, ...x]); setUploadOpen(false); setUp({ title: '', category: 'Code Snippets' }); setFile(null);
    toast.success('Resource uploaded', { description: r.title });
  };

  return (
    <div>
      <PageHeader eyebrow="Resources" title="Resource Library" description="Reusable, verified building blocks for your courses."
        actions={<Button variant="gradient" onClick={() => setUploadOpen(true)}><Upload /> Upload resource</Button>} />

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="space-y-6">
          <nav className="space-y-0.5">
            {['all', ...resourceCategories].map(c => {
              const Icon = c === 'all' ? FolderOpen : CAT_ICON[c];
              const n = c === 'all' ? items.length : items.filter(r => r.category === c).length;
              return (
                <button key={c} onClick={() => setCat(c)} className={cn('flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition', cat === c ? 'bg-primary/10 font-semibold text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}>
                  <Icon className="h-4 w-4" /><span className="flex-1 text-left">{c === 'all' ? 'All resources' : c}</span><span className="text-xs">{n}</span>
                </button>
              );
            })}
          </nav>
          <div>
            <div className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tags</div>
            <div className="flex flex-wrap gap-1.5">{tags.map(t => <button key={t} onClick={() => setTag(tag === t ? null : t)} className={cn('rounded-full border px-2.5 py-0.5 text-xs transition', tag === t ? 'border-primary bg-primary text-white' : 'hover:border-primary/40')}>{t}</button>)}</div>
          </div>
        </aside>

        <div className="min-w-0">
          <div className="mb-4 flex gap-2">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Search resources…" value={q} onChange={e => setQ(e.target.value)} /></div>
            <div className="flex shrink-0 rounded-lg border bg-card p-0.5">
              <Button variant="ghost" size="icon-sm" className={cn(view === 'grid' && 'bg-muted')} onClick={() => setView('grid')} aria-label="Grid view"><LayoutGrid /></Button>
              <Button variant="ghost" size="icon-sm" className={cn(view === 'list' && 'bg-muted')} onClick={() => setView('list')} aria-label="List view"><List /></Button>
            </div>
          </div>
          {tag && <div className="mb-3 text-sm text-muted-foreground">Tagged <Badge className="ml-1">{tag}</Badge> <button className="ml-2 text-primary hover:underline" onClick={() => setTag(null)}>clear</button></div>}

          {shown.length === 0 ? (
            <EmptyState icon={SearchX} title="No resources found" description="Try another category or search term, or upload your own." action={<Button variant="outline" onClick={() => { setQ(''); setCat('all'); setTag(null); }}>Clear filters</Button>} />
          ) : view === 'grid' ? (
            <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              {shown.map(r => {
                const Icon = CAT_ICON[r.category];
                return (
                  <Card key={r.id} className="card-hover flex cursor-pointer flex-col p-4" onClick={() => setPreview(r)}>
                    <div className="flex items-start justify-between">
                      <div className={cn('grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br text-white', CAT_TONE[r.category])}><Icon className="h-[18px] w-[18px]" /></div>
                      {r.verified ? <Badge variant="success"><ShieldCheck /> Verified</Badge> : <Badge variant="slate">Unverified</Badge>}
                    </div>
                    <div className="mt-3 font-semibold">{r.title}</div>
                    <p className="mt-1 line-clamp-2 font-mono text-[11.5px] text-muted-foreground">{r.preview}</p>
                    <div className="mt-auto flex items-center justify-between pt-4 text-xs text-muted-foreground"><div className="flex gap-1">{r.tags.map(t => <Badge key={t} variant="outline">{t}</Badge>)}</div><span>{r.size}</span></div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="divide-y">
              {shown.map(r => {
                const Icon = CAT_ICON[r.category];
                return (
                  <button key={r.id} onClick={() => setPreview(r)} className="flex w-full items-center gap-3 p-3 text-left transition hover:bg-muted/50">
                    <div className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br text-white', CAT_TONE[r.category])}><Icon className="h-4 w-4" /></div>
                    <div className="min-w-0 flex-1"><div className="truncate text-sm font-medium">{r.title}</div><div className="text-xs text-muted-foreground">{r.category} · {r.size} · {timeAgo(r.updatedAt)}</div></div>
                    <div className="hidden gap-1 sm:flex">{r.tags.map(t => <Badge key={t} variant="outline">{t}</Badge>)}</div>
                    {r.verified && <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" />}
                  </button>
                );
              })}
            </Card>
          )}
        </div>
      </div>

      <Dialog open={!!preview} onOpenChange={o => !o && setPreview(null)}>
        {preview && (
          <SheetContent>
            <div className="border-b p-5 pr-12">
              <Badge variant="secondary">{preview.category}</Badge>
              <DialogTitle className="mt-2 text-xl font-bold">{preview.title}</DialogTitle>
              <DialogDescription className="mt-1">{preview.size} · updated {formatDate(preview.updatedAt)} · {preview.verified ? 'verified' : 'not yet verified'}</DialogDescription>
            </div>
            <div className="flex-1 space-y-5 overflow-y-auto p-5">
              {isCode(preview) ? <CodeBlock code={preview.preview} lang={preview.tags.includes('Python') ? 'python' : preview.tags.includes('Docker') ? 'docker' : preview.tags.includes('React') ? 'jsx' : 'java'} /> : (
                <div className={cn('grid aspect-video place-items-center rounded-xl bg-gradient-to-br p-6 text-center text-white', CAT_TONE[preview.category])}><div><div className="text-lg font-bold">{preview.title}</div><div className="mt-1 text-sm text-white/80">{preview.preview}</div></div></div>
              )}
              <div className="flex flex-wrap gap-1.5">{preview.tags.map(t => <Badge key={t} variant="outline">{t}</Badge>)}</div>
              <div className="rounded-xl border p-4">
                <Label className="text-xs">Insert into course</Label>
                <Select value={insertTo} onValueChange={setInsertTo}><SelectTrigger className="mt-1.5" aria-label="Target course"><SelectValue /></SelectTrigger><SelectContent>{courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}</SelectContent></Select>
              </div>
            </div>
            <div className="flex gap-2 border-t p-4">
              <Button variant="outline" onClick={() => toast.success(`${preview.title} downloaded`)}><Download /> Download</Button>
              <Button variant="gradient" className="flex-1" onClick={() => insert(preview)}><CornerDownRight /> Insert into course</Button>
            </div>
          </SheetContent>
        )}
      </Dialog>

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Upload resource</DialogTitle><DialogDescription>Code and exercises are verified automatically after upload.</DialogDescription></DialogHeader>
          <button onClick={() => fileRef.current?.click()} className="flex flex-col items-center rounded-xl border-2 border-dashed p-6 text-sm transition hover:border-primary/50 hover:bg-muted/40">
            <Upload className="h-6 w-6 text-primary" /><span className="mt-2 font-medium">{file ? file.name : 'Choose a file'}</span><span className="text-xs text-muted-foreground">Code, PDF, PPTX, PNG or SVG</span>
          </button>
          <input ref={fileRef} type="file" className="hidden" onChange={e => { const f = e.target.files?.[0] ?? null; setFile(f); if (f && !up.title) setUp(u => ({ ...u, title: f.name.replace(/\.[^.]+$/, '') })); }} />
          <div className="grid gap-3 sm:grid-cols-2">
            <div><Label htmlFor="ut">Title</Label><Input id="ut" className="mt-1.5" value={up.title} onChange={e => setUp(u => ({ ...u, title: e.target.value }))} /></div>
            <div><Label>Category</Label><Select value={up.category} onValueChange={v => setUp(u => ({ ...u, category: v }))}><SelectTrigger className="mt-1.5" aria-label="Category"><SelectValue /></SelectTrigger><SelectContent>{resourceCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setUploadOpen(false)}>Cancel</Button><Button variant="gradient" onClick={doUpload} loading={uploading} disabled={!file && !up.title}>Upload</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
