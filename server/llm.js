// Provider chain: Groq (OpenAI-compatible) first, Ollama Cloud as fallback. Override with LLM_PROVIDER=ollama,groq.
import './env.js';

const sleep = ms => new Promise(r => setTimeout(r, ms));

export function providers() {
  const order = (process.env.LLM_PROVIDER || 'groq,gemini,ollama').split(',').map(s => s.trim());
  return order.filter(p =>
    (p === 'groq' && process.env.GROQ_API_KEY) ||
    (p === 'gemini' && process.env.GEMINI_API_KEY) ||
    (p === 'ollama' && process.env.OLLAMA_API_KEY)
  );
}

async function post(url, headers, body, timeoutMs) {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body), signal: AbortSignal.timeout(timeoutMs) });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const err = new Error(`${res.status} ${text.slice(0, 300)}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

const callers = {
  async groq({ messages, json, temperature, maxTokens }, timeoutMs) {
    const base = process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1';
    const body = { model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile', messages, temperature, max_tokens: maxTokens };
    if (json) body.response_format = { type: 'json_object' };
    const d = await post(`${base}/chat/completions`, { Authorization: `Bearer ${process.env.GROQ_API_KEY}` }, body, timeoutMs);
    return d.choices?.[0]?.message?.content ?? '';
  },
  async gemini({ messages, json, temperature, maxTokens }, timeoutMs) {
    const key = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    const contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));
    const body = {
      contents,
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
        ...(json ? { responseMimeType: 'application/json' } : {})
      }
    };
    const d = await post(url, {}, body, timeoutMs);
    return d.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  },
  async ollama({ messages, json, temperature, maxTokens }, timeoutMs) {
    const host = (process.env.OLLAMA_HOST || 'https://ollama.com').replace(/\/$/, '');
    const body = { model: process.env.OLLAMA_MODEL || 'gpt-oss:120b', messages, stream: false, options: { temperature, num_predict: maxTokens } };
    if (json) body.format = 'json';
    const d = await post(`${host}/api/chat`, { Authorization: `Bearer ${process.env.OLLAMA_API_KEY}` }, body, timeoutMs);
    return d.message?.content ?? '';
  },
};

/** Returns { text, provider }. Retries once on 429/5xx, then falls through to the next provider. */
export async function chat({ messages, json = false, temperature = 0.4, maxTokens = 6000, timeoutMs = 120000 }) {
  const list = providers();
  if (!list.length) throw new Error('No LLM provider configured. Add GROQ_API_KEY or OLLAMA_API_KEY to server/.env');
  const errors = [];
  for (const p of list) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const text = await callers[p]({ messages, json, temperature, maxTokens }, timeoutMs);
        if (text) return { text, provider: p };
        errors.push(`${p}: empty response`);
        break;
      } catch (e) {
        errors.push(`${p}: ${e.message}`);
        if (e.status === 429 || e.status >= 500) { await sleep(1500 * (attempt + 1)); continue; }
        break;
      }
    }
  }
  throw new Error('All LLM providers failed. ' + errors.join(' | '));
}

export function parseJSON(text) {
  let t = String(text).trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  try { return JSON.parse(t); } catch { /* try to isolate the outermost object */ }
  const a = t.indexOf('{'), b = t.lastIndexOf('}');
  if (a >= 0 && b > a) return JSON.parse(t.slice(a, b + 1));
  throw new Error('Model did not return valid JSON');
}

export async function chatJSON(opts) {
  const { text, provider } = await chat({ ...opts, json: true });
  try { return { data: parseJSON(text), provider }; }
  catch {
    const retry = await chat({ ...opts, json: true, messages: [...opts.messages, { role: 'assistant', content: text.slice(0, 2000) }, { role: 'user', content: 'That was not valid JSON. Reply again with ONLY the corrected JSON object.' }] });
    return { data: parseJSON(retry.text), provider: retry.provider };
  }
}
