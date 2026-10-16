// Client for the local LearnifyAI API (server/). API keys live only on the server; the browser never sees them.
import * as React from 'react';
import type { Slide } from './mock-data';

/** API origin. Empty = same origin (recommended: Nginx serves the site and proxies /api). */
function apiBase() {
  let b = ((import.meta.env.VITE_API_BASE ?? '') as string).trim().replace(/\/$/, '');
  // Never call the API over plain HTTP from an HTTPS page (mixed content); upgrade it.
  if (b.startsWith('http://') && typeof location !== 'undefined' && location.protocol === 'https:') b = 'https://' + b.slice(7);
  return b;
}
export const BASE = apiBase();

export interface Attempt { n: number; ok: boolean; stdout: string; stderr: string; exitCode: number; ms: number; problem?: string; part?: string }
export interface LiveSnippet { id: string; name: string; location: string; kind: 'example' | 'exercise'; code: string; expected: string; actual: string; status: 'passed' | 'failed' | 'skipped'; attempts: Attempt[]; ms: number }
export interface LiveExample { id: string; title: string; description: string; code: string; expected: string; output: string; ms: number; status: 'passed' | 'failed' | 'skipped'; attempts: Attempt[] }
export interface TestResult { name: string; pass: boolean; error?: string; ms?: number }
export interface LiveExercise { id: string; title: string; difficulty: string; statement: string; starter: string; solution: string; naive: string; status: 'passed' | 'failed' | 'skipped'; tests: TestResult[]; reference: string; naiveResult: string; attempts: Attempt[]; ms?: number }
export interface CourseContent {
  live: boolean; provider?: string; runnerLang: string | null; language: string; version: string; generatedAt?: string; subtitle?: string; learned?: number;
  slides: Slide[]; examples: LiveExample[]; exercises: LiveExercise[];
  quiz: { q: string; code?: string; options: string[]; answer: number; explanation: string; category?: string; difficulty?: string }[];
  cheat: { title: string; items: string[][] }[];
  snippets: LiveSnippet[];
  summary: { total: number; verifiable: number; passed: number; failed: number; autoFixed: number; skipped: number };
}
export interface RunResult { ok: boolean; exitCode: number; stdout: string; stderr: string; ms: number; timedOut?: boolean; unsupported?: boolean }
export interface Health { ok: boolean; providers: string[]; runners: { java: boolean; python: boolean; node: boolean }; knowledge: { total: number; seed: number; corpus: number; verified: number; byKind: Record<string, number> }; probe?: { ok: boolean; provider?: string; error?: string } }
export interface Progress { step?: number; pct?: number; log?: string }
export interface GenerateParams { topic: string; level: string; language: string; version: string; durationMin: number; objectives: string[]; audience: string }

async function req<T>(path: string, body?: unknown, timeoutMs = 130000): Promise<T> {
  const res = await fetch(BASE + path, { method: body ? 'POST' : 'GET', headers: body ? { 'Content-Type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(timeoutMs) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `Request failed (${res.status})`);
  return data as T;
}

export const parseTests = (stdout: string): TestResult[] =>
  stdout.split('\n').map(l => l.match(/^(PASS|FAIL):\s*(.*)$/)).filter((m): m is RegExpMatchArray => !!m).map(m => { const [name, ...rest] = m[2].split(/\s+-\s+/); return { name: name.trim(), pass: m[1] === 'PASS', error: rest.join(' - ') || undefined }; });

export const api = {
  health: (probe = false) => req<Health>(`/api/health${probe ? '?probe=1' : ''}`, undefined, probe ? 30000 : 4000),
  run: (language: string, code: string) => req<RunResult>('/api/run', { language, code }, 20000),
  fix: (p: { language: string; code: string; expected?: string; stdout?: string; stderr?: string }) => req<{ code: string; explanation?: string }>('/api/fix', p, 90000),
  regenerateSlide: (p: { slide: Slide; instruction: string; course: { title: string; language: string; level: string } }) => req<{ slide: Slide; verification: { status: string; attempts: number; ms?: number } | null; provider: string }>('/api/slide/regenerate', p, 120000),
  chat: (messages: { role: string; content: string }[], context: { page: string; course?: string }) => req<{ reply: string; provider: string; sources: string[] }>('/api/chat', { messages, context }, 90000),
  ingest: (p: { title: string; language: string; text: string }) => req<{ added: number }>('/api/ingest', p, 20000),

  /** Streams progress events, resolves with the verified course content. */
  async generate(p: GenerateParams, onProgress: (e: Progress) => void): Promise<CourseContent> {
    const res = await fetch(BASE + '/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p) });
    if (!res.ok || !res.body) throw new Error(`Generation failed (${res.status})`);
    const reader = res.body.getReader(), dec = new TextDecoder();
    let buf = '', result: CourseContent | null = null, error = '';
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let i: number;
      while ((i = buf.indexOf('\n\n')) >= 0) {
        const block = buf.slice(0, i); buf = buf.slice(i + 2);
        const ev = block.match(/^event: (\w+)/m)?.[1], data = block.match(/^data: (.*)$/m)?.[1];
        if (!ev || !data) continue;
        const parsed = JSON.parse(data);
        if (ev === 'progress') onProgress(parsed); else if (ev === 'done') result = parsed; else if (ev === 'error') error = parsed.error;
      }
    }
    if (error) throw new Error(error);
    if (!result) throw new Error('The connection closed before generation finished.');
    return result;
  },

  /** Downloads a generated file (pptx, pdf, notes, quiz, cheat, report, code, exercises, package). */
  async download(format: string, payload: { course: unknown; content: CourseContent; brand?: unknown }) {
    const res = await fetch(`${BASE}/api/export/${format}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!res.ok) throw new Error(((await res.json().catch(() => ({}))) as { error?: string }).error ?? `Export failed (${res.status})`);
    const name = res.headers.get('Content-Disposition')?.match(/filename="([^"]+)"/)?.[1] ?? `export.${format}`;
    const url = URL.createObjectURL(await res.blob());
    const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    return name;
  },
};

/** null = still checking, false = server not reachable (the app falls back to sample data). */
export function useApi() {
  const [health, setHealth] = React.useState<Health | null>(null);
  const [online, setOnline] = React.useState<boolean | null>(null);
  const refresh = React.useCallback(async (probe = false) => {
    try { const h = await api.health(probe); setHealth(h); setOnline(h.providers.length > 0); return h; }
    catch { setHealth(null); setOnline(false); return null; }
  }, []);
  React.useEffect(() => { void refresh(); }, [refresh]);
  return { online, health, refresh };
}

/** "Java" + "Java 21" -> "Java 21" */
export const runtimeLabel = (c: { language: string; version: string }) => (c.version.toLowerCase().startsWith(c.language.toLowerCase()) ? c.version : `${c.language} ${c.version}`.trim());
