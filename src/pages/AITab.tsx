import * as React from 'react';
import { CheckCircle2, Database, Download, FileUp, Plug, RefreshCw, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api, BASE, useApi } from '@/lib/api';

export function AITab() {
  const { health, online, refresh } = useApi();
  const [testing, setTesting] = React.useState(false);
  const [form, setForm] = React.useState({ title: '', language: 'Java', text: '' });
  const [adding, setAdding] = React.useState(false);

  const test = async () => {
    setTesting(true);
    const h = await refresh(true);
    setTesting(false);
    if (!h) toast.error('The AI server is not running', { description: 'Start it with npm run dev:all' });
    else if (h.probe?.ok) toast.success(`Connected via ${h.probe.provider}`);
    else toast.error('The model did not answer', { description: h.probe?.error });
  };
  const ingest = async () => {
    setAdding(true);
    try { const r = await api.ingest(form); toast.success(`Added ${r.added} chunks to the knowledge base`); setForm(f => ({ ...f, text: '' })); await refresh(); }
    catch (e) { toast.error('Could not add material', { description: e instanceof Error ? e.message : undefined }); }
    setAdding(false);
  };
  const k = health?.knowledge;

  return (
    <div className="grid max-w-3xl gap-4">
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0"><div><CardTitle>Model connection</CardTitle><CardDescription>Keys are read from <code className="font-mono">server/.env</code> by the local server. The browser never sees them.</CardDescription></div>
          <Button variant="outline" size="sm" onClick={test} loading={testing}>{!testing && <Plug />} Test connection</Button></CardHeader>
        <CardContent className="space-y-3 text-sm">
          {online === false ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">Server not reachable. The app is running in sample mode. Run <code className="font-mono">npm run dev:all</code> to start the API and the web app together.</div>
          ) : (
            <>
              {(['groq', 'ollama'] as const).map(p => { const on = health?.providers.includes(p); return <div key={p} className="flex items-center justify-between rounded-lg border p-3"><span className="font-medium capitalize">{p === 'groq' ? 'Groq (primary)' : 'Ollama Cloud (fallback)'}</span>{on ? <Badge variant="success"><CheckCircle2 /> Key configured</Badge> : <Badge variant="slate"><XCircle /> No key</Badge>}</div>; })}
              <div className="flex flex-wrap gap-2">{health && Object.entries(health.runners).map(([r, ok]) => <Badge key={r} variant={ok ? 'success' : 'slate'} className="font-mono">{r}: {ok ? 'installed' : 'missing'}</Badge>)}</div>
              <p className="text-xs text-muted-foreground">Generated code is executed with the toolchains above. Install Java 21, Python 3 and Node 20 to verify those languages.</p>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><div className="flex items-center gap-2"><Database className="h-4 w-4 text-primary" /><CardTitle>Knowledge base</CardTitle></div><CardDescription>Every verified generation is saved here and used as grounding for the next one. This is how the system improves with use.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[['Total records', k?.total], ['Seed (sample course)', k?.seed], ['Verified by runs', k?.verified], ['Your material', k?.corpus]].map(([l, v]) => <div key={l as string} className="rounded-xl border p-3"><div className="text-xl font-bold">{v ?? '—'}</div><div className="text-xs text-muted-foreground">{l}</div></div>)}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild><a href={`${BASE}/api/dataset?format=chat`}><Download /> Fine-tuning set (chat JSONL)</a></Button>
            <Button variant="outline" size="sm" asChild><a href={`${BASE}/api/dataset?format=chat&verified=1`}><Download /> Verified only</a></Button>
            <Button variant="outline" size="sm" asChild><a href={`${BASE}/api/dataset?format=raw`}><Download /> Raw records</a></Button>
            <Button variant="ghost" size="sm" onClick={() => refresh()}><RefreshCw /> Refresh</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><div className="flex items-center gap-2"><FileUp className="h-4 w-4 text-primary" /><CardTitle>Teach it your material</CardTitle></div><CardDescription>Paste notes, syllabi or code from your own courses. It is chunked and used as reference on every generation and in the assistant. For whole folders use <code className="font-mono">npm run ingest -- ./folder</code>.</CardDescription></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-[1fr_160px]"><div><Label htmlFor="kt">Title</Label><Input id="kt" className="mt-1.5" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Week 3 lecture notes" /></div><div><Label htmlFor="kl">Language</Label><Input id="kl" className="mt-1.5" value={form.language} onChange={e => setForm(f => ({ ...f, language: e.target.value }))} /></div></div>
          <Textarea rows={6} value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} placeholder="Paste material here…" aria-label="Material" />
          <Button variant="gradient" onClick={ingest} loading={adding} disabled={!online || form.text.trim().length < 40 || !form.title.trim()}>Add to knowledge base</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>About “training”</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Groq and Ollama Cloud serve models; they do not train new weights from this app. What runs here is retrieval learning: verified content is stored, ranked and injected into prompts, so quality improves with every course you verify.</p>
          <p>To train weights, export the fine-tuning set above and use Unsloth, Axolotl or a provider’s fine-tuning API on a GPU. <code className="font-mono">npm run modelfile</code> also builds an Ollama Modelfile with your best verified examples baked in.</p>
        </CardContent>
      </Card>
    </div>
  );
}
