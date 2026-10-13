/* Chat with Iffy (AI trained on his replies): floating chat that talks to /api/chat (Netlify Function + Gemini). */
(function () {
  var P = window.PROFILE || {};
  var PROJECTS = window.PROJECTS || [];
  var CATS = window.CATEGORIES || [];
  var WA = (P.whatsapp || '').replace(/[^\d]/g, '');
  var ENDPOINT = '/api/chat';
  var KEY = 'iffy-chat-v1';
  var demo = !!window.IFFY_PREVIEW;

  var css = `
  .ic-launch { position: fixed; right: max(18px, env(safe-area-inset-right)); bottom: calc(18px + env(safe-area-inset-bottom, 0px)); z-index: 70; display: inline-flex; align-items: center; gap: 10px; padding: 12px 18px 12px 14px; border-radius: 12px; border: 1px solid color-mix(in srgb, var(--accent) 60%, transparent); background: var(--accent); color: var(--accent-ink); font: 700 .92rem/1 var(--f-body); cursor: pointer; box-shadow: 0 14px 40px -12px color-mix(in srgb, var(--accent) 70%, transparent); transition: transform .2s, box-shadow .2s; }
  .ic-launch:hover { transform: translateY(-2px); }
  .ic-launch svg { width: 20px; height: 20px; }
  .ic-launch .ic-dot { width: 8px; height: 8px; border-radius: 50%; background: #1f9d55; box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-ink) 15%, transparent); }
  .ic-launch[aria-expanded="true"] { opacity: 0; pointer-events: none; transform: scale(.9); }
  .ic-panel { position: fixed; right: max(18px, env(safe-area-inset-right)); bottom: calc(18px + env(safe-area-inset-bottom, 0px)); z-index: 71; width: min(400px, calc(100vw - 36px)); height: min(620px, calc(100dvh - 120px)); display: grid; grid-template-rows: auto 1fr auto auto; background: var(--card); color: var(--ink); border: 1px solid var(--line); border-radius: 14px; box-shadow: 0 30px 80px -20px rgba(0,0,0,.55); overflow: hidden; transform-origin: bottom right; }
  .ic-panel[hidden] { display: none !important; }
  @media (prefers-reduced-motion: no-preference) { .ic-panel.ic-in { animation: icPop .28s cubic-bezier(.2,.8,.2,1); } @keyframes icPop { from { opacity: 0; transform: translateY(12px) scale(.97); } } }
  .ic-head { display: flex; align-items: center; gap: 12px; padding: 14px 14px 14px 16px; border-bottom: 1px solid var(--line); background: var(--card-hi); }
  .ic-ava { width: 38px; height: 38px; border-radius: 10px; display: grid; place-items: center; background: var(--accent); color: var(--accent-ink); flex: none; }
  .ic-ava svg { width: 20px; height: 20px; }
  .ic-photo { overflow: hidden; background: linear-gradient(160deg, #1E4B4D, #0B1D1E); align-items: end; }
  .ic-photo img { width: 100%; height: auto; margin-top: 4px; }
  .ic-head b { display: block; font: 700 1rem/1.2 var(--f-display); }
  .ic-head small { display: flex; align-items: center; gap: 6px; color: var(--muted); font-size: .78rem; }
  .ic-head small i { width: 7px; height: 7px; border-radius: 50%; background: #2fbf71; }
  .ic-head .ic-x { margin-left: auto; width: 34px; height: 34px; border-radius: 8px; border: 1px solid var(--line); background: transparent; color: var(--ink); cursor: pointer; display: grid; place-items: center; }
  .ic-head .ic-x svg { width: 16px; height: 16px; }
  .ic-log { overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 10px; overscroll-behavior: contain; }
  .ic-msg { max-width: 86%; padding: 10px 13px; border-radius: 12px; font-size: .92rem; line-height: 1.5; white-space: pre-wrap; overflow-wrap: anywhere; }
  .ic-msg.bot { align-self: flex-start; background: var(--bg-2); border: 1px solid var(--line); border-bottom-left-radius: 4px; }
  .ic-msg.me { align-self: flex-end; background: var(--accent); color: var(--accent-ink); border-bottom-right-radius: 4px; }
  .ic-msg a { color: inherit; text-decoration: underline; }
  .ic-proj { display: inline-flex; align-items: center; gap: 6px; margin: 2px 2px; padding: 4px 9px; border-radius: 6px; border: 1px solid color-mix(in srgb, var(--accent) 50%, var(--line)); background: color-mix(in srgb, var(--accent) 12%, transparent); color: var(--ink); font: 600 .8rem/1.3 var(--f-body); cursor: pointer; white-space: normal; text-align: left; }
  .ic-proj:hover { background: color-mix(in srgb, var(--accent) 22%, transparent); }
  .ic-typing { align-self: flex-start; display: inline-flex; gap: 4px; padding: 12px 14px; border-radius: 12px; background: var(--bg-2); border: 1px solid var(--line); }
  .ic-typing span { width: 6px; height: 6px; border-radius: 50%; background: var(--muted); animation: icB 1s infinite; }
  .ic-typing span:nth-child(2) { animation-delay: .15s; } .ic-typing span:nth-child(3) { animation-delay: .3s; }
  @keyframes icB { 0%, 60%, 100% { opacity: .3; transform: translateY(0); } 30% { opacity: 1; transform: translateY(-3px); } }
  .ic-lead { align-self: stretch; border: 1px solid color-mix(in srgb, var(--accent) 50%, var(--line)); border-radius: 12px; padding: 12px; display: grid; gap: 8px; background: color-mix(in srgb, var(--accent) 8%, var(--card)); font-size: .88rem; }
  .ic-lead b { font-family: var(--f-display); }
  .ic-wa { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 12px; border-radius: 8px; background: #25D366; color: #06210f; font-weight: 700; text-decoration: none; }
  .ic-chips { display: flex; gap: 6px; padding: 0 16px 10px; overflow-x: auto; scrollbar-width: none; }
  .ic-chips::-webkit-scrollbar { display: none; }
  .ic-chips button { flex: none; padding: 7px 11px; border-radius: 6px; border: 1px solid var(--line); background: transparent; color: var(--muted); font: 500 .8rem/1 var(--f-body); cursor: pointer; }
  .ic-chips button:hover { color: var(--ink); border-color: var(--accent); }
  .ic-form { display: flex; gap: 8px; padding: 12px; border-top: 1px solid var(--line); background: var(--card-hi); }
  .ic-form textarea { flex: 1; min-width: 0; resize: none; height: 44px; max-height: 120px; padding: 11px 12px; border-radius: 10px; border: 1px solid var(--line); background: var(--bg-2); color: var(--ink); font: 400 .92rem/1.4 var(--f-body); }
  .ic-form textarea:focus { outline: none; border-color: var(--accent); }
  .ic-form button { width: 44px; height: 44px; flex: none; border-radius: 10px; border: 0; background: var(--accent); color: var(--accent-ink); cursor: pointer; display: grid; place-items: center; }
  .ic-form button:disabled { opacity: .5; cursor: default; }
  .ic-form button svg { width: 18px; height: 18px; }
  .ic-note { padding: 0 16px 10px; font-size: .7rem; color: var(--muted); }
  @media (max-width: 560px) {
    .ic-panel { inset: env(safe-area-inset-top, 0px) 0 0 0; width: 100%; height: auto; border-radius: 0; border: 0; }
    .ic-launch { padding: 12px 14px; }
    .ic-launch .ic-label { display: none; }
  }`;
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var SPARK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3z"/><path d="M19 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2z"/></svg>';
  var launch = document.createElement('button');
  launch.className = 'ic-launch'; launch.type = 'button';
  launch.setAttribute('aria-expanded', 'false'); launch.setAttribute('aria-controls', 'icPanel');
  launch.innerHTML = SPARK + '<span class="ic-label">Ask my AI</span><span class="ic-dot" aria-hidden="true"></span>';

  var panel = document.createElement('section');
  panel.className = 'ic-panel'; panel.id = 'icPanel'; panel.hidden = true;
  panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'Chat with Iffy');
  panel.innerHTML =
    '<header class="ic-head"><span class="ic-ava ic-photo"><img src="assets/profile.png" alt=""></span><div><b>Chat with Iffy</b><small><i></i>' + (demo ? 'Preview mode · sample replies' : 'Usually replies instantly') + '</small></div>' +
    '<button class="ic-x" type="button" aria-label="Close chat"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button></header>' +
    '<div class="ic-log" id="icLog" aria-live="polite"></div>' +
    '<div><div class="ic-chips" id="icChips"></div><p class="ic-note">Replies by my AI assistant. I personally review every project.</p></div>' +
    '<form class="ic-form" id="icForm"><label for="icInput" style="position:absolute;left:-9999px">Message</label><textarea id="icInput" rows="1" placeholder="Ask about my work or your project…" maxlength="1200"></textarea>' +
    '<button type="submit" aria-label="Send"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button></form>';
  document.body.appendChild(launch); document.body.appendChild(panel);

  var log = panel.querySelector('#icLog'), form = panel.querySelector('#icForm'), input = panel.querySelector('#icInput');
  var sendBtn = form.querySelector('button'), chipsEl = panel.querySelector('#icChips');
  var history = [];
  try { history = JSON.parse(sessionStorage.getItem(KEY) || '[]'); } catch (e) { history = []; }
  function save() { try { sessionStorage.setItem(KEY, JSON.stringify(history.slice(-30))); } catch (e) {} }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function inline(raw) {
    var h = esc(raw);
    h = h.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
    h = h.replace(/([\w.+-]+@[\w-]+\.[\w.]+)/g, function (m, e) { return /href=/.test(m) ? m : '<a href="mailto:' + e + '">' + e + '</a>'; });
    return h.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  }
  function format(t) {
    var titles = PROJECTS.map(function (p) { return p.title; });
    return String(t).split(/(\[\[[^\]]+\]\])/g).map(function (part) {
      var m = part.match(/^\[\[([^\]]+)\]\]$/);
      if (!m) return inline(part);
      var real = titles.find(function (x) { return x.toLowerCase() === m[1].trim().toLowerCase(); });
      return real ? '<button type="button" class="ic-proj" data-open="' + esc(real) + '">▸ ' + esc(real) + '</button>' : inline(m[1]);
    }).join('');
  }
  function add(role, text, keep) {
    var d = document.createElement('div');
    d.className = 'ic-msg ' + (role === 'user' ? 'me' : 'bot');
    d.innerHTML = role === 'user' ? esc(text) : format(text);
    log.appendChild(d); log.scrollTop = log.scrollHeight;
    if (keep !== false) { history.push({ role: role, text: text }); save(); }
  }
  function waLink(text) { return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(text); }
  function leadCard(lead) {
    var msg = 'Hi Iffy, I\'m ' + lead.name + ' (' + lead.email + '). ' + lead.project + (lead.budget ? ' Budget: ' + lead.budget + '.' : '') + (lead.timeline ? ' Timeline: ' + lead.timeline + '.' : '');
    var d = document.createElement('div'); d.className = 'ic-lead';
    d.innerHTML = '<b>Details sent to Iffy ✓</b><span>' + esc(lead.project) + '</span>' +
      (WA ? '<a class="ic-wa" href="' + waLink(msg) + '" target="_blank" rel="noopener">Continue on WhatsApp</a>' : '');
    log.appendChild(d); log.scrollTop = log.scrollHeight;
  }
  function escCard(text) {
    if (!WA) return;
    var d = document.createElement('div'); d.className = 'ic-lead';
    d.innerHTML = '<a class="ic-wa" href="' + waLink('Hi Iffy, I would like to discuss this: ' + text) + '" target="_blank" rel="noopener">Message me on WhatsApp</a>';
    log.appendChild(d); log.scrollTop = log.scrollHeight;
  }
  function submitLead(lead) {
    if (demo) return;
    var data = new URLSearchParams({ 'form-name': 'ai-lead', name: lead.name, email: lead.email, service: lead.service || '', budget: lead.budget || '', timeline: lead.timeline || '', project: lead.project, escalate: lead.escalate || '', transcript: history.map(function (m) { return (m.role === 'user' ? 'Visitor: ' : 'AI: ') + m.text; }).join('\n').slice(-6000) });
    fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: data.toString() }).catch(function () {});
  }
  var typingEl = null;
  function typing(on) {
    if (on && !typingEl) { typingEl = document.createElement('div'); typingEl.className = 'ic-typing'; typingEl.innerHTML = '<span></span><span></span><span></span>'; log.appendChild(typingEl); log.scrollTop = log.scrollHeight; }
    if (!on && typingEl) { typingEl.remove(); typingEl = null; }
  }

  // Offline / preview responder: answers from the same data, no AI.
  function localReply(q) {
    q = q.toLowerCase();
    function list(cat) { return PROJECTS.filter(function (p) { return p.category === cat; }).map(function (p) { return '[[' + p.title + ']]'; }).join(' '); }
    if (/hire|quote|price|cost|budget|start|project for me|work with/.test(q)) return 'Sure. Starting prices: WhatsApp API setup from $150, AI agents and chatbots from $150, n8n or Make workflows from $100, voice agents from $250, CRM integrations from $200. I quote a flat price once I see the details. Message me on WhatsApp at ' + (P.whatsapp || '') + ' and tell me what you need.';
    if (/agent|chatbot|whatsapp|receptionist|assistant/.test(q)) return 'I build AI agents that answer customers, book meetings and take action in your tools. Have a look: ' + list('agents');
    if (/automat|n8n|zapier|make|workflow|crm|lead/.test(q)) return 'Yes, automation is a big part of what I do: n8n, Zapier and APIs wired together. Some examples: ' + list('automation');
    if (/video|ugc|ad|animation|reel/.test(q)) return 'I make AI video: UGC-style ads, product spots and animated shorts. ' + list('video');
    if (/3d|character|game|blender|enclosure/.test(q)) return 'On the 3D side I do game-ready characters and product design. ' + list('3d');
    if (/shopify|website|store|wordpress|web/.test(q)) return 'I also build Shopify and WordPress sites when your product needs a storefront: ' + list('web');
    return 'I can tell you about my AI agents, automations, AI video, 3D work or websites, or help you start a project. What are you working on?';
  }

  var busy = false;
  function send(text) {
    text = (text || '').trim(); if (!text || busy) return;
    add('user', text); input.value = ''; autosize(); chipsEl.hidden = true;
    busy = true; sendBtn.disabled = true; typing(true);
    var finish = function (reply, lead, esc) {
      typing(false); add('assistant', reply);
      if (lead) { submitLead(lead); leadCard(lead); }
      else if (esc) { submitLead({ name: '(not given yet)', email: '', project: text, escalate: esc }); escCard(text); }
      busy = false; sendBtn.disabled = false; input.focus();
    };
    if (demo) { setTimeout(function () { finish(localReply(text)); }, 650); return; }
    fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: history }) })
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, status: r.status, d: d }; }); })
      .then(function (res) {
        if (res.ok && res.d.reply) return finish(res.d.reply, res.d.lead, res.d.escalate);
        if (res.d && res.d.reply) return finish(res.d.reply);
        finish(localReply(text));
      })
      .catch(function () { finish(localReply(text)); });
  }

  var CHIPS = ['What do you build?', 'Show me your AI agents', 'Can you automate my business?', 'I want to hire you'];
  chipsEl.innerHTML = CHIPS.map(function (c) { return '<button type="button">' + esc(c) + '</button>'; }).join('');
  chipsEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) send(b.textContent); });

  function autosize() { input.style.height = '44px'; input.style.height = Math.min(input.scrollHeight, 120) + 'px'; }
  input.addEventListener('input', autosize);
  input.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input.value); } });
  form.addEventListener('submit', function (e) { e.preventDefault(); send(input.value); });

  function openChat() {
    panel.hidden = false; panel.classList.add('ic-in'); launch.setAttribute('aria-expanded', 'true');
    if (!log.childElementCount) {
      if (history.length) { history.forEach(function (m) { add(m.role, m.text, false); }); chipsEl.hidden = true; }
      else add('assistant', (window.VOICE && window.VOICE.greeting) || 'Hey! I\'m Iffy. Ask me anything about my work, or tell me what you want built.', true);
    }
    setTimeout(function () { input.focus(); }, 50);
  }
  function closeChat() { panel.hidden = true; panel.classList.remove('ic-in'); launch.setAttribute('aria-expanded', 'false'); launch.focus(); }
  launch.addEventListener('click', openChat);
  panel.querySelector('.ic-x').addEventListener('click', closeChat);
  panel.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.stopPropagation(); closeChat(); } });
  // Opening a project from chat: on phones, get the chat out of the way.
  log.addEventListener('click', function (e) { if (e.target.closest('[data-open]') && matchMedia('(max-width: 560px)').matches) closeChat(); });
  window.iffyChat = { open: openChat, send: function (t) { openChat(); send(t); } };
})();
