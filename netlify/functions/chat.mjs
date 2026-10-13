// Netlify Function: the portfolio's AI assistant.
// Needs the GEMINI_API_KEY environment variable (Netlify → Site configuration → Environment variables).
// Optional: GEMINI_MODEL (defaults to a free-tier Flash-Lite model).
//
// The assistant's knowledge comes from site/projects.js, so editing that file
// updates both the website and what the assistant knows.

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
const MAX_TURNS = 12;          // conversation turns sent to the model
const MAX_CHARS = 1200;        // per user message
const RATE = { windowMs: 60_000, max: 12 }; // per IP, best effort
const hits = new Map();

// ---------- knowledge ----------
let KNOWLEDGE = null;
function loadKnowledge() {
  if (KNOWLEDGE) return KNOWLEDGE;
  const here = dirname(fileURLToPath(import.meta.url));
  const candidates = [
    resolve(process.cwd(), "site/projects.js"),
    resolve(here, "../../site/projects.js"),
    resolve(here, "site/projects.js"),
  ];
  let src = null;
  for (const p of candidates) { try { src = readFileSync(p, "utf8"); break; } catch {} }
  const ctx = { window: {} };
  if (src) vm.runInNewContext(src, ctx, { timeout: 500 });
  const w = ctx.window;
  KNOWLEDGE = {
    profile: w.PROFILE || {},
    services: (w.SERVICES || []).map(s => ({ title: s[1], description: s[2] })),
    categories: (w.CATEGORIES || []).map(c => ({ id: c.id, title: c.title })),
    projects: (w.PROJECTS || []).map(p => ({
      title: p.title, category: p.category, client: p.client, summary: p.tagline,
      brief: p.challenge, what_was_done: p.work, outcome: p.result, stack: p.stack,
      live_link: p.url || undefined, has_videos: !!(p.videos && p.videos.length),
    })),
  };
  return KNOWLEDGE;
}

// ---------- private persona + examples (not published with the site) ----------
let PERSONA = null, EXAMPLES = null;
function readPrivate(name) {
  const here = dirname(fileURLToPath(import.meta.url));
  for (const p of [resolve(here, name), resolve(process.cwd(), "netlify/functions", name), resolve(here, "netlify/functions", name)]) {
    try { return readFileSync(p, "utf8"); } catch {}
  }
  return null;
}
function persona() { return PERSONA ??= (readPrivate("persona.md") || "You are Iffy, a freelance automation developer. Reply in first person, short and friendly."); }
function examples() {
  if (EXAMPLES) return EXAMPLES;
  try { EXAMPLES = JSON.parse(readPrivate("examples.json") || "[]"); } catch { EXAMPLES = []; }
  return EXAMPLES;
}
// Pick the real replies most similar to what the visitor just said (simple word overlap).
function retrieveExamples(query, k = 6) {
  const ex = examples().filter(e => e && e.reply);
  if (!ex.length) return "(none yet)";
  const words = s => new Set(String(s).toLowerCase().match(/[a-z0-9$]{3,}/g) || []);
  const q = words(query);
  return ex.map(e => { const w = words((e.client || "") + " " + (e.tags || "")); let n = 0; q.forEach(x => { if (w.has(x)) n++; }); return [n, e]; })
    .sort((a, b) => b[0] - a[0]).slice(0, k)
    .map(([, e]) => (e.client ? `Client: ${e.client}\n` : "") + `Reply: ${e.reply}`).join("\n\n");
}

function systemPrompt(lastUser) {
  const k = loadKnowledge();
  const p = k.profile;
  const base = persona().replace("{{retrieved_examples}}", retrieveExamples(lastUser));
  return `${base}

WEBSITE CHAT (extra rules for this chat window on the portfolio site)
1. When you mention one of the projects below, write its exact title in double square brackets, like [[WhatsApp AI Assistant]]. The site turns it into a button that opens the case study. Only use titles from PROJECTS, and only mention projects that are relevant.
2. When a visitor wants to start, get a quote, or hire you, get their name, their email, and a short description of the project (budget and timeline are a bonus). Ask for missing bits naturally, one or two at a time. Once you have name, email and project, call the save_lead tool, then tell them you will get back to them, or they can message you on WhatsApp for a faster reply.
3. Contact details you may share: email ${p.email || ""}, WhatsApp ${p.whatsapp || ""}.
4. Keep it chat length. No markdown headings, no tables, no bullet symbols other than "1." style numbers.

PROJECTS (the only past work you may talk about)
${JSON.stringify(k.projects)}`;
}

// Enforce the "no dashes" rule even if the model slips.
function scrubDashes(t) {
  return String(t)
    .replace(/^[ \t]*[-•*][ \t]+/gm, "")                               // dash bullets
    .replace(/(\$?\d[\d,.]*k?)\s*(?:—|–|--|-)\s*(\$?\d)/g, "$1 to $2")   // $150-$300 -> $150 to $300
    .replace(/\s*(?:—|–|--)\s*/g, ", ")                               // em/en dashes -> comma
    .replace(/[ \t]+-[ \t]+/g, ", ")                                  // spaced hyphen used as punctuation
    .replace(/,\s*,/g, ",").replace(/,\s*([.!?])/g, "$1");
}

const TOOLS = [{
  functionDeclarations: [{
    name: "save_lead",
    description: "Save a potential client's details so I (Iffy) can follow up. Call only once you have name, email and a project description.",
    parameters: {
      type: "OBJECT",
      properties: {
        name: { type: "STRING", description: "Visitor's name" },
        email: { type: "STRING", description: "Visitor's email address" },
        project: { type: "STRING", description: "One or two sentence summary of what they want built" },
        service: { type: "STRING", description: "Closest matching service title, if clear" },
        budget: { type: "STRING", description: "Budget if mentioned" },
        timeline: { type: "STRING", description: "Timeline or deadline if mentioned" },
      },
      required: ["name", "email", "project"],
    },
  }],
}];

// ---------- helpers ----------
const json = (status, body) => new Response(JSON.stringify(body), {
  status, headers: { "content-type": "application/json", "cache-control": "no-store" },
});

function rateLimited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter(t => now - t < RATE.windowMs);
  list.push(now); hits.set(ip, list);
  return list.length > RATE.max;
}

function cleanHistory(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.slice(-MAX_TURNS)
    .filter(m => m && (m.role === "user" || m.role === "assistant") && typeof m.text === "string" && m.text.trim())
    .map(m => ({ role: m.role === "assistant" ? "model" : "user", text: m.text.slice(0, MAX_CHARS) }))
    // Gemini wants turns to start with the user and alternate, so drop leading model turns and merge repeats.
    .reduce((out, m) => {
      if (!out.length && m.role === "model") return out;
      const last = out[out.length - 1];
      if (last && last.role === m.role) last.parts[0].text += "\n" + m.text;
      else out.push({ role: m.role, parts: [{ text: m.text }] });
      return out;
    }, []);
}

const validEmail = e => typeof e === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.trim());

// ---------- handler ----------
export default async (req, context) => {
  if (req.method !== "POST") return json(405, { error: "Use POST" });
  const key = process.env.GEMINI_API_KEY;
  if (!key) return json(503, { error: "not_configured" });

  const ip = context?.ip || req.headers.get("x-nf-client-connection-ip") || "anon";
  if (rateLimited(ip)) return json(429, { error: "rate_limited", reply: "You are sending messages very fast. Give it a minute, or message me on WhatsApp." });

  let body;
  try { body = await req.json(); } catch { return json(400, { error: "bad_json" }); }
  const contents = cleanHistory(body.messages);
  if (!contents.length || contents[contents.length - 1].role !== "user") return json(400, { error: "no_message" });

  const payload = {
    systemInstruction: { parts: [{ text: systemPrompt(contents[contents.length - 1].parts[0].text) }] },
    contents,
    tools: TOOLS,
    generationConfig: { temperature: 0.5, maxOutputTokens: 500 },
  };

  let data;
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:generateContent`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify(payload),
    });
    data = await r.json();
    if (!r.ok) {
      console.error("Gemini error", r.status, JSON.stringify(data).slice(0, 500));
      return json(502, { error: "upstream", reply: "Something went wrong on my side. Message me on WhatsApp and I will reply there." });
    }
  } catch (e) {
    console.error("Fetch failed", e);
    return json(502, { error: "upstream", reply: "Something went wrong on my side. Message me on WhatsApp and I will reply there." });
  }

  const parts = data?.candidates?.[0]?.content?.parts || [];
  let reply = parts.filter(p => typeof p.text === "string").map(p => p.text).join("").trim();
  let lead = null;

  const call = parts.find(p => p.functionCall && p.functionCall.name === "save_lead")?.functionCall;
  if (call) {
    const a = call.args || {};
    if (a.name && validEmail(a.email) && a.project) {
      lead = {
        name: String(a.name).slice(0, 120), email: String(a.email).trim().slice(0, 160),
        project: String(a.project).slice(0, 1000), service: a.service ? String(a.service).slice(0, 120) : "",
        budget: a.budget ? String(a.budget).slice(0, 120) : "", timeline: a.timeline ? String(a.timeline).slice(0, 120) : "",
      };
      if (!reply) reply = `Thanks ${lead.name.split(" ")[0]}, got your details. I will review it and get back to you soon. For a faster reply, tap the WhatsApp button below.`;
    } else if (!reply) {
      reply = "Can you check your email address again? It does not look right.";
    }
  }
  let escalate = null;
  const esc = reply.match(/^\s*ESCALATE:\s*(.+)$/im);
  if (esc) {
    escalate = esc[1].trim().slice(0, 300);
    reply = "I want to look at this one personally. Send me your name and email here, or message me on WhatsApp, and I will get back to you.";
  }
  if (!reply) reply = "Sorry, I didn't catch that. Could you say it another way?";
  return json(200, { reply: scrubDashes(reply), lead, escalate });
};

export const config = { path: "/api/chat" };
