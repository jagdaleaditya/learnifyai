import * as React from 'react';
import { Check, ImagePlus, Save, Trash2, Undo2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/controls';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PageHeader } from '@/components/shared/common';
import { SlideCanvas, defaultBrand, type Brand } from '@/components/shared/slide';
import { brandKits, javaSlides } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

const FONTS = ['Inter', 'Poppins', 'Roboto', 'Source Sans 3', 'IBM Plex Sans'];
const CODE_FONTS = ['JetBrains Mono', 'Fira Code', 'IBM Plex Mono', 'Source Code Pro'];
const LAYOUTS = [{ id: 0, label: 'Title' }, { id: 1, label: 'Bullets' }, { id: 3, label: 'Code' }, { id: 5, label: 'Diagram' }, { id: 10, label: 'Two column' }, { id: 11, label: 'Summary' }];
const HEX = /^#[0-9a-f]{6}$/i;

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [text, setText] = React.useState(value);
  React.useEffect(() => setText(value), [value]);
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <div className="mt-1.5 flex items-center gap-2 rounded-lg border bg-card p-1.5 pr-2 shadow-sm focus-within:ring-2 focus-within:ring-ring/40">
        <label className="relative h-8 w-8 shrink-0 cursor-pointer overflow-hidden rounded-md border shadow-inner" style={{ background: value }}>
          <input type="color" value={value} onChange={e => onChange(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0" aria-label={`${label} colour`} />
        </label>
        <input value={text} onChange={e => { setText(e.target.value); if (HEX.test(e.target.value)) onChange(e.target.value); }} className={cn('w-full bg-transparent font-mono text-sm uppercase outline-none', !HEX.test(text) && 'text-red-600')} aria-label={`${label} hex`} />
      </div>
    </div>
  );
}

export default function BrandKit() {
  const [templates, setTemplates] = React.useState(brandKits);
  const [activeTpl, setActiveTpl] = React.useState(brandKits[0].id);
  const [brand, setBrand] = React.useState<Brand>({ ...defaultBrand });
  const [fonts, setFonts] = React.useState({ heading: 'Inter', body: 'Inter', code: 'JetBrains Mono' });
  const [titleText, setTitleText] = React.useState('Java OOP Fundamentals');
  const [layout, setLayout] = React.useState(0);
  const [saveOpen, setSaveOpen] = React.useState(false);
  const [name, setName] = React.useState('');
  const fileRef = React.useRef<HTMLInputElement>(null);

  const set = (patch: Partial<Brand>) => { setBrand(b => ({ ...b, ...patch })); setActiveTpl(''); };
  const apply = (t: typeof brandKits[number]) => {
    setBrand(b => ({ ...b, primary: t.primary, secondary: t.secondary, accent: t.accent }));
    setFonts({ heading: t.heading, body: t.body, code: t.code });
    setActiveTpl(t.id);
    toast(`Applied “${t.name}”`);
  };
  const onLogo = (f?: File) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) { toast.error('Please upload a PNG, SVG or JPG'); return; }
    set({ logoUrl: URL.createObjectURL(f) });
    toast.success('Logo uploaded', { description: f.name });
  };

  const slide = { ...javaSlides[layout], ...(layout === 0 ? { title: titleText } : {}) };

  return (
    <div>
      <PageHeader eyebrow="Resources" title="Brand Kit" description="Your institute’s look, applied to every slide, PDF and handout."
        actions={<><Button variant="outline" onClick={() => apply(brandKits[0])}><Undo2 /> Reset</Button><Button variant="gradient" onClick={() => { setName(''); setSaveOpen(true); }}><Save /> Save as template</Button></>} />

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Logo</CardTitle></CardHeader>
            <CardContent>
              <div onClick={() => fileRef.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); onLogo(e.dataTransfer.files[0]); }} role="button" tabIndex={0}
                className="flex cursor-pointer items-center gap-4 rounded-xl border-2 border-dashed p-4 transition hover:border-primary/50 hover:bg-muted/40">
                <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-muted">{brand.logoUrl ? <img src={brand.logoUrl} alt="Logo preview" className="h-full w-full object-contain p-1" /> : <ImagePlus className="h-6 w-6 text-muted-foreground" />}</div>
                <div className="min-w-0 text-sm"><div className="font-medium">{brand.logoUrl ? 'Replace logo' : 'Upload logo'}</div><div className="text-xs text-muted-foreground">PNG or SVG, transparent background</div></div>
                <Upload className="ml-auto h-4 w-4 text-muted-foreground" />
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => onLogo(e.target.files?.[0])} />
              {brand.logoUrl && <Button variant="ghost" size="sm" className="mt-2" onClick={() => set({ logoUrl: undefined })}><Trash2 /> Remove logo</Button>}
              <div className="mt-3"><Label htmlFor="lt" className="text-xs">Logo text</Label><Input id="lt" className="mt-1.5" value={brand.logoText} onChange={e => set({ logoText: e.target.value })} /></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Colours</CardTitle></CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
              <ColorField label="Primary" value={brand.primary} onChange={v => set({ primary: v })} />
              <ColorField label="Secondary" value={brand.secondary} onChange={v => set({ secondary: v })} />
              <ColorField label="Accent" value={brand.accent} onChange={v => set({ accent: v })} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Typography</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {([['heading', 'Headings', FONTS], ['body', 'Body', FONTS], ['code', 'Code', CODE_FONTS]] as const).map(([k, l, list]) => (
                <div key={k} className="flex items-center gap-3">
                  <Label className="w-20 shrink-0 text-xs">{l}</Label>
                  <Select value={fonts[k]} onValueChange={v => { setFonts(f => ({ ...f, [k]: v })); setActiveTpl(''); }}><SelectTrigger aria-label={`${l} font`}><SelectValue /></SelectTrigger><SelectContent>{list.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent></Select>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Title & footer</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div><Label htmlFor="tt" className="text-xs">Sample title</Label><Input id="tt" className="mt-1.5" value={titleText} onChange={e => { setTitleText(e.target.value); setLayout(0); }} /></div>
              <div><Label htmlFor="ft" className="text-xs">Footer text</Label><Input id="ft" className="mt-1.5" value={brand.footer} onChange={e => set({ footer: e.target.value })} /></div>
              <label className="flex items-center justify-between text-sm">Show slide numbers <Switch checked={brand.showNumbers !== false} onCheckedChange={v => set({ showNumbers: v })} /></label>
            </CardContent>
          </Card>
        </div>

        <div className="min-w-0 space-y-4">
          <Card className="p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm font-semibold">Live preview</div>
              <div className="flex flex-wrap gap-1 rounded-lg bg-muted p-1">
                {LAYOUTS.map(l => <button key={l.id} onClick={() => setLayout(l.id)} className={cn('rounded-md px-2.5 py-1 text-xs font-medium transition', layout === l.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>{l.label}</button>)}
              </div>
            </div>
            <div className="rounded-xl bg-muted/50 p-3 sm:p-6"><SlideCanvas slide={slide} index={layout} total={12} brand={brand} className="shadow-xl ring-1 ring-black/5" /></div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground"><Badge variant="secondary">Headings: {fonts.heading}</Badge><Badge variant="secondary">Body: {fonts.body}</Badge><Badge variant="secondary">Code: {fonts.code}</Badge></div>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle>Saved templates</CardTitle><CardDescription>Click to apply. Used by Create Course and every export.</CardDescription></CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
              {templates.map(t => (
                <button key={t.id} onClick={() => apply(t)} className={cn('group rounded-xl border p-2 text-left transition', activeTpl === t.id ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/40')}>
                  <div className="relative aspect-video overflow-hidden rounded-lg" style={{ background: `linear-gradient(135deg, ${t.primary}, ${t.secondary})` }}>
                    <span className="absolute left-2 top-2 h-1 w-6 rounded-full bg-white/70" /><span className="absolute bottom-2 left-2 h-1.5 w-10 rounded-full" style={{ background: t.accent }} />
                    {activeTpl === t.id && <span className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-white text-primary"><Check className="h-3 w-3" /></span>}
                  </div>
                  <div className="mt-2 truncate px-1 text-sm font-medium">{t.name}</div>
                  <div className="flex gap-1 px-1 pb-1 pt-1">{[t.primary, t.secondary, t.accent].map(c => <span key={c} className="h-3 w-3 rounded-full border" style={{ background: c }} />)}</div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Save as template</DialogTitle><DialogDescription>Saves the current colours, fonts and footer so you can reuse them.</DialogDescription></DialogHeader>
          <div><Label htmlFor="tn">Template name</Label><Input id="tn" className="mt-1.5" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Bootcamp 2026" autoFocus /></div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveOpen(false)}>Cancel</Button>
            <Button variant="gradient" disabled={!name.trim()} onClick={() => {
              const t = { id: 'bk' + Date.now(), name: name.trim(), primary: brand.primary, secondary: brand.secondary, accent: brand.accent, ...fonts };
              setTemplates(x => [...x, t]); setActiveTpl(t.id); setSaveOpen(false); toast.success('Template saved', { description: t.name });
            }}>Save template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
