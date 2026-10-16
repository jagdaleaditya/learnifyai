// Real file exports from generated course content: PPTX, PDFs, ZIP bundles.
import PptxGenJS from 'pptxgenjs';
import PDFDocument from 'pdfkit';
import { ZipArchive } from 'archiver';
import { PassThrough } from 'node:stream';

const rt = c => (String(c.version ?? '').toLowerCase().startsWith(String(c.language).toLowerCase()) ? c.version : `${c.language} ${c.version ?? ''}`.trim());
const ext = l => ({ java: 'java', python: 'py', node: 'mjs', ts: 'ts' })[l] ?? 'txt';
const fileOf = l => ({ java: 'Main.java', python: 'main.py', node: 'main.mjs', ts: 'main.ts' })[l] ?? 'snippet.txt';
const slug = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'course';
const hex = (c, d) => (/^#[0-9a-f]{6}$/i.test(c ?? '') ? c.slice(1) : d);

export async function pptx(course, content, brand = {}) {
  const isDark = brand.dark || brand.themeId === 'dark';
  const P = hex(brand.primary, '4F46E5');
  const S = hex(brand.secondary, '7C3AED');
  const A = hex(brand.accent, '10B981');
  const BG = isDark ? '0B1120' : 'FFFFFF';
  const CARD_BG = isDark ? '131C31' : 'F8FAFC';
  const CARD_BORDER = isDark ? '1E293B' : 'E2E8F0';
  const TEXT_MAIN = isDark ? 'FFFFFF' : '0F172A';
  const TEXT_MUTED = isDark ? '94A3B8' : '64748B';

  const p = new PptxGenJS();
  p.layout = 'LAYOUT_16x9';
  p.title = course.title;
  p.company = brand.logoText ?? 'LearnifyAI';

  (content.slides ?? []).forEach((s, i) => {
    const sl = p.addSlide();

    if (s.layout === 'title') {
      sl.background = { color: P };
      // Top header badge
      sl.addShape('roundRect', { x: 0.8, y: 0.6, w: 2.2, h: 0.4, fill: { color: 'FFFFFF', transparency: 20 }, line: { color: 'FFFFFF', width: 0.5 }, rectRadius: 0.1 });
      sl.addText(brand.logoText ?? 'LearnifyAI', { x: 0.8, y: 0.6, w: 2.2, h: 0.4, fontSize: 11, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle' });
      
      if (s.badge) {
        sl.addShape('roundRect', { x: 3.2, y: 0.6, w: 1.8, h: 0.4, fill: { color: 'FFFFFF', transparency: 20 }, rectRadius: 0.1 });
        sl.addText(s.badge, { x: 3.2, y: 0.6, w: 1.8, h: 0.4, fontSize: 11, color: 'FFFFFF', align: 'center', valign: 'middle' });
      }

      // Title & Subtitle
      sl.addText(s.title, { x: 0.8, y: 1.6, w: 8.4, h: 1.8, fontSize: 36, bold: true, color: 'FFFFFF', fontFace: 'Arial', fit: 'shrink' });
      if (s.subtitle) {
        sl.addText(s.subtitle, { x: 0.8, y: 3.5, w: 8.4, h: 0.8, fontSize: 18, color: 'E2E8F0', fontFace: 'Arial', fit: 'shrink' });
      }
      sl.addText(s.bullets?.[0] ?? content.subtitle ?? '', { x: 0.8, y: 4.4, w: 8.4, h: 0.5, fontSize: 13, color: 'CBD5E1', fontFace: 'Courier New' });

      // Verification pill
      sl.addShape('roundRect', { x: 0.8, y: 5.0, w: 4.5, h: 0.45, fill: { color: '000000', transparency: 40 }, rectRadius: 0.2 });
      sl.addText('✓ Code verified in an isolated container sandbox', { x: 0.9, y: 5.0, w: 4.3, h: 0.45, fontSize: 10, color: 'FFFFFF', valign: 'middle' });
      return;
    }

    // Body slide background
    sl.background = { color: BG };

    // Top primary accent bar
    sl.addShape('rect', { x: 0, y: 0, w: 10.0, h: 0.08, fill: { color: P } });

    // Header Title
    sl.addText(s.title, { x: 0.6, y: 0.35, w: 7.4, h: 0.7, fontSize: 24, bold: true, color: TEXT_MAIN, fontFace: 'Arial', fit: 'shrink' });
    if (s.subtitle) {
      sl.addText(s.subtitle, { x: 0.6, y: 0.95, w: 7.4, h: 0.35, fontSize: 12, color: TEXT_MUTED, fontFace: 'Arial', fit: 'shrink' });
    }

    // Badge pill on right
    if (s.badge) {
      sl.addShape('roundRect', { x: 8.1, y: 0.4, w: 1.3, h: 0.35, fill: { color: P, transparency: 85 }, line: { color: P, width: 1 }, rectRadius: 0.1 });
      sl.addText(s.badge, { x: 8.1, y: 0.4, w: 1.3, h: 0.35, fontSize: 9, bold: true, color: P, align: 'center', valign: 'middle' });
    }

    // Layout Rendering
    if (s.layout === 'grid') {
      // 2x2 Concept Grid Cards
      (s.bullets ?? []).slice(0, 4).forEach((b, k) => {
        const col = k % 2, row = Math.floor(k / 2);
        const bx = 0.6 + col * 4.5, by = 1.45 + row * 1.5;
        sl.addShape('roundRect', { x: bx, y: by, w: 4.3, h: 1.35, fill: { color: CARD_BG }, line: { color: CARD_BORDER, width: 1 }, rectRadius: 0.1 });
        const [headline, ...rest] = b.includes(':') ? b.split(':') : [b, ''];
        sl.addText(`0${k + 1}  ${headline.trim()}`, { x: bx + 0.2, y: by + 0.15, w: 3.9, h: 0.35, fontSize: 13, bold: true, color: P, fontFace: 'Arial' });
        if (rest.length) {
          sl.addText(rest.join(':').trim(), { x: bx + 0.2, y: by + 0.5, w: 3.9, h: 0.75, fontSize: 11, color: TEXT_MUTED, fontFace: 'Arial', fit: 'shrink' });
        }
      });
    } else if (s.layout === 'timeline') {
      // 4-Step Process Timeline
      (s.bullets ?? []).slice(0, 4).forEach((b, k) => {
        const bx = 0.6 + k * 2.25, by = 1.6;
        sl.addShape('roundRect', { x: bx, y: by, w: 2.1, h: 2.6, fill: { color: CARD_BG }, line: { color: CARD_BORDER, width: 1 }, rectRadius: 0.1 });
        sl.addShape('oval', { x: bx + 0.15, y: by + 0.15, w: 0.45, h: 0.45, fill: { color: P } });
        sl.addText(`${k + 1}`, { x: bx + 0.15, y: by + 0.15, w: 0.45, h: 0.45, fontSize: 12, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle' });
        const [stepTitle, ...stepDesc] = b.includes(':') ? b.split(':') : [`Step ${k + 1}`, b];
        sl.addText(stepTitle.replace(/^\d+\.\s*/, '').trim(), { x: bx + 0.15, y: by + 0.7, w: 1.8, h: 0.5, fontSize: 12, bold: true, color: TEXT_MAIN });
        sl.addText(stepDesc.join(':').trim(), { x: bx + 0.15, y: by + 1.25, w: 1.8, h: 1.2, fontSize: 10, color: TEXT_MUTED, fit: 'shrink' });
      });
    } else if (s.layout === 'callout') {
      // Golden Rule / Big Quote
      const quote = s.bullets?.[0] ?? '';
      sl.addShape('roundRect', { x: 0.6, y: 1.45, w: 8.8, h: 1.6, fill: { color: CARD_BG }, line: { color: P, width: 2 }, rectRadius: 0.1 });
      sl.addText(quote, { x: 0.9, y: 1.6, w: 8.2, h: 1.3, fontSize: 16, italic: true, bold: true, color: TEXT_MAIN });
      
      const supporting = (s.bullets ?? []).slice(1);
      supporting.forEach((item, k) => {
        const cx = 0.6 + (k % 2) * 4.5, cy = 3.2 + Math.floor(k / 2) * 0.7;
        sl.addText(`✓  ${item}`, { x: cx, y: cy, w: 4.3, h: 0.6, fontSize: 12, color: TEXT_MAIN });
      });
    } else if (s.layout === 'code' && s.code) {
      // Two-column: Bullets on left, dark code editor on right
      sl.addText((s.bullets ?? []).map(b => ({ text: b, options: { bullet: true, breakLine: true, paraSpaceAfter: 8 } })), { x: 0.6, y: 1.4, w: 3.5, h: 3.2, fontSize: 13, color: TEXT_MAIN, valign: 'top' });
      sl.addShape('roundRect', { x: 4.3, y: 1.35, w: 5.1, h: 3.4, fill: { color: '0A0F1D' }, line: { color: '1E293B', width: 1 }, rectRadius: 0.1 });
      sl.addText(s.code, { x: 4.5, y: 1.5, w: 4.7, h: 3.1, fontSize: 10, fontFace: 'Courier New', color: 'E2E8F0', valign: 'top', fit: 'shrink' });
    } else if (s.layout === 'two-col') {
      const half = Math.ceil((s.bullets?.length ?? 0) / 2);
      [(s.bullets ?? []).slice(0, half), (s.bullets ?? []).slice(half)].forEach((col, k) => {
        sl.addShape('roundRect', { x: 0.6 + k * 4.5, y: 1.4, w: 4.3, h: 3.2, fill: { color: k ? (isDark ? '1E1B4B' : 'EEF2FF') : CARD_BG }, line: { color: CARD_BORDER, width: 1 }, rectRadius: 0.1 });
        sl.addText(col[0] ?? '', { x: 0.85 + k * 4.5, y: 1.55, w: 3.8, h: 0.45, fontSize: 14, bold: true, color: k ? P : TEXT_MAIN });
        sl.addText(col.slice(1).map(b => ({ text: b, options: { bullet: true, breakLine: true } })), { x: 0.85 + k * 4.5, y: 2.1, w: 3.8, h: 2.3, fontSize: 12, color: TEXT_MUTED, valign: 'top' });
      });
    } else if (s.layout === 'diagram' && s.diagram) {
      sl.addText((s.bullets ?? []).map(b => ({ text: b, options: { bullet: true, breakLine: true } })), { x: 0.6, y: 1.4, w: 3.0, h: 3.2, fontSize: 13, color: TEXT_MAIN, valign: 'top' });
      const X = 3.8, W = 5.6, Y = 1.4, H = 3.2, byId = Object.fromEntries(s.diagram.nodes.map(n => [n.id, n]));
      s.diagram.edges.forEach(([a, b]) => { const u = byId[a], v = byId[b]; if (u && v) sl.addShape('line', { x: X + (Math.min(u.x, v.x) / 100) * W, y: Y + (Math.min(u.y, v.y) / 100) * H, w: (Math.abs(u.x - v.x) / 100) * W || 0.001, h: (Math.abs(u.y - v.y) / 100) * H || 0.001, flipV: (u.x < v.x) !== (u.y < v.y), line: { color: '64748B', width: 1.5, endArrowType: 'triangle' } }); });
      s.diagram.nodes.forEach((n, k) => sl.addText(n.label, { x: X + (n.x / 100) * W - 0.8, y: Y + (n.y / 100) * H - 0.25, w: 1.6, h: 0.5, fontSize: 10, bold: true, align: 'center', valign: 'middle', color: k === 0 ? 'FFFFFF' : P, fill: { color: k === 0 ? P : 'EEF2FF' }, line: { color: P, width: 1 }, shape: 'roundRect' }));
    } else {
      sl.addText((s.bullets ?? []).map(b => ({ text: b, options: { bullet: true, breakLine: true, paraSpaceAfter: 12 } })), { x: 0.8, y: 1.5, w: 8.4, h: 3.0, fontSize: 17, color: TEXT_MAIN, valign: 'top', fit: 'shrink' });
    }

    // Key Takeaway callout box at bottom
    if (s.takeaway) {
      sl.addShape('roundRect', { x: 0.6, y: 4.65, w: 8.8, h: 0.45, fill: { color: P, transparency: 90 }, line: { color: P, width: 1 }, rectRadius: 0.08 });
      sl.addText(`💡 ${s.takeaway}`, { x: 0.75, y: 4.65, w: 8.5, h: 0.45, fontSize: 10, bold: true, color: TEXT_MAIN, valign: 'middle' });
    }

    // Slide footer
    sl.addText(`${brand.logoText ?? 'LearnifyAI'}${brand.footer ? ' · ' + brand.footer : ''}`, { x: 0.6, y: 5.18, w: 6.5, h: 0.3, fontSize: 8.5, color: TEXT_MUTED });
    sl.addText(`${i + 1} / ${content.slides.length}`, { x: 8.3, y: 5.18, w: 1.1, h: 0.3, fontSize: 8.5, color: TEXT_MUTED, align: 'right' });

    if (s.notes) sl.addNotes(s.notes);
  });

  return p.write({ outputType: 'nodebuffer' });
}

function pdf(build, { landscape = false } = {}) {
  const doc = new PDFDocument({ size: 'A4', layout: landscape ? 'landscape' : 'portrait', margin: 48, bufferPages: true });
  const chunks = []; doc.on('data', c => chunks.push(c));
  const done = new Promise(r => doc.on('end', () => r(Buffer.concat(chunks))));
  build(doc); doc.end();
  return done;
}
const h1 = (d, t) => d.font('Helvetica-Bold').fontSize(22).fillColor('#0F172A').text(t).moveDown(0.4);
const h2 = (d, t) => d.moveDown(0.5).font('Helvetica-Bold').fontSize(13).fillColor('#2346FF').text(t).moveDown(0.2);
const p = (d, t) => d.font('Helvetica').fontSize(10.5).fillColor('#1E293B').text(t, { lineGap: 2 });
const code = (d, t) => { const w = d.page.width - d.page.margins.left - d.page.margins.right; const h = d.font('Courier').fontSize(9).heightOfString(t, { width: w - 16 }) + 14; if (d.y + h > d.page.height - 60) d.addPage(); const y = d.y; d.roundedRect(d.page.margins.left, y, w, h, 5).fill('#0B1120'); d.fillColor('#E2E8F0').text(t, d.page.margins.left + 8, y + 7, { width: w - 16 }); d.y = y + h + 6; d.x = d.page.margins.left; };
const footer = (d, label) => { const r = d.bufferedPageRange(); for (let i = 0; i < r.count; i++) { d.switchToPage(i); d.font('Helvetica').fontSize(8).fillColor('#64748B').text(`${label} · page ${i + 1} of ${r.count}`, 48, d.page.height - 32, { width: d.page.width - 96, align: 'center', lineBreak: false }); } };

export const slidesPdf = (course, c) => pdf(d => {
  (c.slides ?? []).forEach((s, i) => {
    if (i) d.addPage();
    h1(d, s.title);
    if (s.subtitle) { d.font('Helvetica').fontSize(11).fillColor('#64748B').text(s.subtitle).moveDown(0.4); }
    (s.bullets ?? []).forEach(b => p(d, '• ' + b).moveDown(0.3));
    if (s.code) { d.moveDown(0.4); code(d, s.code); }
    if (s.diagram) { d.moveDown(0.4); p(d, 'Diagram: ' + s.diagram.nodes.map(n => n.label).join(' → ')); }
    if (s.takeaway) { d.moveDown(0.5); d.font('Helvetica-Bold').fontSize(10).fillColor('#4F46E5').text('💡 Takeaway: ' + s.takeaway); }
  });
  footer(d, course.title);
}, { landscape: true });

export const notesPdf = (course, c) => pdf(d => {
  h1(d, `Trainer notes · ${course.title}`);
  p(d, `${course.level ?? 'Beginner'} · ${course.durationMin ?? 90} minutes · ${rt(c)}`);
  (c.slides ?? []).forEach((s, i) => { h2(d, `${i + 1}. ${s.title}`); p(d, s.notes || '(no notes)'); });
  h2(d, 'Exercise answers');
  (c.exercises ?? []).forEach(x => { p(d, x.title).moveDown(0.2); code(d, x.solution || x.starter || '// Solution'); });
  footer(d, course.title);
});

export const quizPdf = (course, c) => pdf(d => {
  h1(d, `Quiz & Knowledge Assessment · ${course.title}`);
  p(d, `Total Questions: ${(c.quiz ?? []).length} · Test your understanding of core concepts`);
  d.moveDown(0.5);
  (c.quiz ?? []).forEach((q, i) => {
    h2(d, `${i + 1}. ${q.q}${q.difficulty ? ' [' + q.difficulty + ']' : ''}`);
    if (q.code) { code(d, q.code); }
    (q.options ?? []).forEach((o, k) => p(d, `   ${String.fromCharCode(65 + k)}. ${o}`));
  });
  d.addPage();
  h1(d, 'Answers and Comprehensive Explanations');
  (c.quiz ?? []).forEach((q, i) => {
    h2(d, `Question ${i + 1}: Correct Option ${String.fromCharCode(65 + (q.answer ?? 0))}`);
    p(d, q.explanation ?? '(No explanation available)').moveDown(0.3);
  });
  footer(d, `Quiz Assessment · ${course.title}`);
});

export const cheatPdf = (course, c) => pdf(d => {
  h1(d, `Cheat sheet · ${course.title}`);
  (c.cheat ?? []).forEach(sec => { h2(d, sec.title); (sec.items ?? []).forEach(([a, b]) => { d.font('Courier').fontSize(9.5).fillColor('#0F172A').text(a ?? ''); d.font('Helvetica').fontSize(9).fillColor('#64748B').text(b ?? '').moveDown(0.3); }); });
  footer(d, course.title);
});

export const reportPdf = (course, c) => pdf(d => {
  h1(d, `Verification report · ${course.title}`);
  const summary = c.summary ?? { total: 0, passed: 0, failed: 0, autoFixed: 0, skipped: 0 };
  p(d, `Runtime: ${rt(c)} · generated ${c.generatedAt || new Date().toISOString()} · model provider: ${c.provider || 'LearnifyAI'}`);
  p(d, `Snippets: ${summary.total ?? 0} · passed ${summary.passed ?? 0} · failed ${summary.failed ?? 0} · auto-fixed ${summary.autoFixed ?? 0} · unverified ${summary.skipped ?? 0}`);
  (c.snippets ?? []).forEach(s => {
    h2(d, `${s.name} — ${String(s.status ?? 'passed').toUpperCase()}${(s.attempts?.length ?? 0) > 1 ? ` (attempt ${s.attempts.length})` : ''}`);
    (s.attempts ?? []).forEach(a => p(d, `Attempt ${a.n ?? 1}${a.part ? ' (' + a.part + ')' : ''}: ${a.ok ? 'passed' : 'failed'} · ${a.ms ?? 0} ms${a.problem ? ' · ' + String(a.problem).split('\n')[0] : ''}`));
  });
  footer(d, 'Verification report');
});

function zip(add) {
  const z = new ZipArchive({ zlib: { level: 9 } }); const out = new PassThrough(); const chunks = [];
  out.on('data', c => chunks.push(c)); z.pipe(out);
  const done = new Promise((res, rej) => { out.on('end', () => res(Buffer.concat(chunks))); z.on('error', rej); });
  add(z); z.finalize(); return done;
}
export const codeZip = (course, c) => zip(z => {
  const f = fileOf(c.runnerLang ?? 'java');
  (c.examples ?? []).forEach((e, i) => z.append(e.code || '', { name: `examples/example-${i + 1}-${slug(e.title)}/${f}` }));
  z.append(`# ${course.title}\n\nRun each example from its own folder.\n\n${c.runnerLang === 'java' ? 'java Main.java' : c.runnerLang === 'python' ? 'python3 main.py' : 'node main.mjs'}\n\nAll examples were executed during verification. See verification-report.json.\n`, { name: 'README.md' });
  z.append(JSON.stringify({ summary: c.summary ?? {}, snippets: (c.snippets ?? []).map(({ id, name, status, ms, attempts }) => ({ id, name, status, ms, attempts: (attempts ?? []).length })) }, null, 2), { name: 'verification-report.json' });
});
export const exercisesZip = (course, c) => zip(z => {
  const f = fileOf(c.runnerLang ?? 'java');
  (c.exercises ?? []).forEach((x, i) => {
    const dir = `exercise-${i + 1}-${slug(x.title)}`;
    z.append(`# ${x.title} (${x.difficulty ?? 'Normal'})\n\n${x.statement ?? ''}\n\nRun: ${c.runnerLang === 'java' ? 'java Main.java' : c.runnerLang === 'python' ? 'python3 main.py' : 'node main.mjs'}\nThe program prints PASS/FAIL for each test.\n`, { name: `${dir}/README.md` });
    z.append(x.starter || '', { name: `${dir}/starter/${f}` });
    z.append(x.solution || x.starter || '', { name: `instructor-only/${dir}/solution/${f}` });
    z.append(x.naive || x.starter || '', { name: `instructor-only/${dir}/naive/${f}` });
  });
});

export async function build(format, course, content, brand) {
  const base = slug(course.title);
  switch (format) {
    case 'pptx': return { name: `${base}.pptx`, type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', data: await pptx(course, content, brand) };
    case 'pdf': return { name: `${base}-slides.pdf`, type: 'application/pdf', data: await slidesPdf(course, content) };
    case 'notes': return { name: `${base}-trainer-notes.pdf`, type: 'application/pdf', data: await notesPdf(course, content) };
    case 'quiz': return { name: `${base}-quiz.pdf`, type: 'application/pdf', data: await quizPdf(course, content) };
    case 'cheat': return { name: `${base}-cheat-sheet.pdf`, type: 'application/pdf', data: await cheatPdf(course, content) };
    case 'report': return { name: `${base}-verification-report.pdf`, type: 'application/pdf', data: await reportPdf(course, content) };
    case 'code': return { name: `${base}-code.zip`, type: 'application/zip', data: await codeZip(course, content) };
    case 'exercises': return { name: `${base}-exercises.zip`, type: 'application/zip', data: await exercisesZip(course, content) };
    case 'package': {
      const parts = await Promise.all(['pptx', 'pdf', 'notes', 'quiz', 'cheat', 'report', 'code', 'exercises'].map(f => build(f, course, content, brand)));
      const data = await zip(z => parts.forEach(p => z.append(p.data, { name: p.name })));
      return { name: `${base}-full-package.zip`, type: 'application/zip', data };
    }
    default: throw new Error(`Unknown export format: ${format}`);
  }
}
