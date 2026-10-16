import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, CircleDashed, CircleDot, FileUp, Lightbulb, Plus, Target, Upload, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/misc';
import { Tip } from '@/components/ui/tooltip';
import { PageHeader, Ring } from '@/components/shared/common';
import { coverageTopics, gapSuggestions, objectiveMatrix, objectives, syllabi } from '@/lib/mock-data';
import { cn, sleep } from '@/lib/utils';

type Status = 'covered' | 'partial' | 'missing';
const CHIP: Record<Status, { label: string; cls: string; icon: typeof CheckCircle2 }> = {
  covered: { label: 'Covered', cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300', icon: CheckCircle2 },
  partial: { label: 'Partial', cls: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300', icon: CircleDot },
  missing: { label: 'Missing', cls: 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300', icon: CircleDashed },
};

export default function Coverage() {
  const navigate = useNavigate();
  const [syllabus, setSyllabus] = React.useState(syllabi[0].id);
  const [uploaded, setUploaded] = React.useState<string | null>(null);
  const [analyzing, setAnalyzing] = React.useState(false);
  const [topics, setTopics] = React.useState(() => coverageTopics.map(t => ({ id: t.id as string, topic: t.topic as string, module: t.module as string, where: t.where as string, status: t.status as Status })));
  const [added, setAdded] = React.useState<string[]>([]);
  const [filter, setFilter] = React.useState<'all' | Status>('all');
  const fileRef = React.useRef<HTMLInputElement>(null);

  const score = Math.round((topics.reduce((a, t) => a + (t.status === 'covered' ? 1 : t.status === 'partial' ? 0.5 : 0), 0) / topics.length) * 100);
  const counts = { covered: topics.filter(t => t.status === 'covered').length, partial: topics.filter(t => t.status === 'partial').length, missing: topics.filter(t => t.status === 'missing').length };

  const analyze = async (label: string) => {
    setAnalyzing(true); await sleep(1200); setAnalyzing(false);
    toast.success('Syllabus mapped', { description: `${label} · ${topics.length} topics matched against 12 slides` });
  };

  const addToCourse = async (g: typeof gapSuggestions[number]) => {
    setAdded(a => [...a, g.id]);
    await sleep(900);
    setTopics(ts => ts.map(t => (t.topic === g.topic ? { ...t, status: 'covered', where: 'New slide (generated, verified)' } : t)));
    toast.success(`Added to Java OOP Fundamentals`, { description: `${g.type}: ${g.topic} · code verified`, action: { label: 'Open Studio', onClick: () => navigate('/studio/java-oop') } });
  };

  const shown = topics.filter(t => filter === 'all' || t.status === filter);

  return (
    <div>
      <PageHeader eyebrow="Intelligence" title="Syllabus Coverage" description="Map your official syllabus to the generated course and fill the gaps in one click." />

      <Card className="mb-6 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="flex-1">
            <div className="mb-1.5 text-xs font-medium text-muted-foreground">Syllabus</div>
            <Select value={syllabus} onValueChange={v => { setSyllabus(v); setUploaded(null); analyze(syllabi.find(s => s.id === v)!.name); }}>
              <SelectTrigger aria-label="Syllabus"><SelectValue /></SelectTrigger>
              <SelectContent>{syllabi.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="text-center text-xs text-muted-foreground lg:pb-2.5">or</div>
          <Button variant="outline" onClick={() => fileRef.current?.click()}><Upload /> Upload syllabus (PDF/DOCX)</Button>
          <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) { setUploaded(f.name); analyze(f.name); } e.target.value = ''; }} />
          <div className="lg:w-64"><div className="mb-1.5 text-xs font-medium text-muted-foreground">Mapped to</div><div className="flex h-10 items-center rounded-lg border bg-muted/40 px-3 text-sm font-medium">Java OOP Fundamentals · v3</div></div>
        </div>
        {uploaded && <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-1.5 text-xs text-primary"><FileUp className="h-3.5 w-3.5" /> {uploaded}</div>}
      </Card>

      <div className={cn('grid gap-6 transition-opacity lg:grid-cols-[300px_1fr]', analyzing && 'pointer-events-none opacity-50')}>
        <Card className="flex flex-col items-center p-6 text-center">
          <Ring value={score} size={170} stroke={14} label={<div><div className="text-4xl font-bold">{score}%</div><div className="text-xs text-muted-foreground">coverage</div></div>} />
          <div className="mt-6 grid w-full grid-cols-3 gap-2">
            {(Object.keys(CHIP) as Status[]).map(s => (
              <button key={s} onClick={() => setFilter(filter === s ? 'all' : s)} className={cn('rounded-xl border p-2.5 transition', filter === s && 'ring-2 ring-primary/30')}>
                <div className="text-xl font-bold">{counts[s]}</div><div className="text-[11px] text-muted-foreground">{CHIP[s].label}</div>
              </button>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Partial topics count as half. Click a count to filter the table.</p>
        </Card>

        <Card className="min-w-0">
          <CardHeader className="flex-row items-center justify-between space-y-0"><div><CardTitle>Topic coverage</CardTitle><CardDescription>{shown.length} of {topics.length} topics</CardDescription></div>{filter !== 'all' && <Button variant="ghost" size="sm" onClick={() => setFilter('all')}>Show all</Button>}</CardHeader>
          <Table>
            <THead><TR className="hover:bg-transparent"><TH>Topic</TH><TH className="hidden sm:table-cell">Module</TH><TH>Status</TH><TH className="hidden md:table-cell">Where</TH></TR></THead>
            <TBody>
              {shown.map(t => {
                const C = CHIP[t.status];
                return (
                  <TR key={t.id}>
                    <TD className="font-medium">{t.topic}</TD>
                    <TD className="hidden text-muted-foreground sm:table-cell">{t.module}</TD>
                    <TD><span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium', C.cls)}><C.icon className="h-3 w-3" />{C.label}</span></TD>
                    <TD className="hidden text-xs text-muted-foreground md:table-cell">{t.where}</TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <Card className="min-w-0">
          <CardHeader><CardTitle>Objectives × slides</CardTitle><CardDescription>How strongly each learning objective is addressed on each slide</CardDescription></CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-1 text-xs">
              <thead><tr><th className="min-w-[180px] text-left font-medium text-muted-foreground">Objective</th>{Array.from({ length: 12 }, (_, i) => <th key={i} className="w-8 font-medium text-muted-foreground">{i + 1}</th>)}</tr></thead>
              <tbody>
                {objectives.map((o, r) => (
                  <tr key={o}>
                    <td className="pr-2 font-medium">{o}</td>
                    {objectiveMatrix[r].map((v, c) => (
                      <td key={c}>
                        <Tip label={`Slide ${c + 1}: ${['not addressed', 'touched on', 'taught'][v]}`}>
                          <button onClick={() => navigate('/studio/java-oop')} aria-label={`Objective ${r + 1}, slide ${c + 1}`} className={cn('h-8 w-full min-w-[28px] rounded-md transition hover:ring-2 hover:ring-primary/40', v === 2 ? 'bg-indigo-600' : v === 1 ? 'bg-indigo-300 dark:bg-indigo-500/50' : 'bg-muted')} />
                        </Tip>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground"><span className="inline-flex items-center gap-1.5"><i className="h-3 w-3 rounded bg-indigo-600" /> Taught</span><span className="inline-flex items-center gap-1.5"><i className="h-3 w-3 rounded bg-indigo-300" /> Touched on</span><span className="inline-flex items-center gap-1.5"><i className="h-3 w-3 rounded bg-muted ring-1 ring-border" /> Not addressed</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><div className="flex items-center gap-2"><Lightbulb className="h-4 w-4 text-amber-500" /><CardTitle>Gap suggestions</CardTitle></div><CardDescription>Generated content is verified before it’s added</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            {gapSuggestions.map(g => {
              const isAdded = added.includes(g.id);
              const covered = topics.find(t => t.topic === g.topic)?.status === 'covered';
              return (
                <div key={g.id} className={cn('rounded-xl border p-4 transition', covered && 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-500/20 dark:bg-emerald-500/5')}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0"><div className="flex flex-wrap items-center gap-2 text-sm font-semibold"><Target className="h-3.5 w-3.5 text-primary" />{g.topic}<Badge variant="secondary">{g.type}</Badge></div><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{g.suggestion}</p></div>
                    <Button size="sm" variant={covered ? 'outline' : 'gradient'} className="shrink-0" onClick={() => addToCourse(g)} disabled={isAdded} loading={isAdded && !covered}>
                      {covered ? <><Check /> Added</> : !isAdded && <><Plus /> Add to course</>}
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
