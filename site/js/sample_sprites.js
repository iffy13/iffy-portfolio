/* Sample 7: pixel sprites. A library of original pixel art drawn as text grids (assets/sprites.json): pick a sprite or a whole
   category, watch it animate on the stage, swap its palette, add an outline, change the background. The data is only
   downloaded the first time the tab is opened. Registered with js/samples.js. */
(function () {
  'use strict';
  if (!window.IFFY_SAMPLES) return;
  var WA = 'https://wa.me/2348075889359?text=';
  var BGS = [['night', 'Night'], ['sky', 'Sky'], ['sunset', 'Sunset'], ['grid', 'Grid'], ['plain', 'Plain']];
  var HUES = [['Original', 0], ['Swap 1', 60], ['Swap 2', 150], ['Swap 3', 240]];
  var SPEEDS = [['Slow', .5], ['Normal', 1], ['Fast', 2]];

  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt) e.textContent = txt; return e; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function hexRgb(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
  function shift(hex, deg) {   // rotate the hue of one colour
    if (!deg) return hex;
    var c = hexRgb(hex), r = c[0] / 255, g = c[1] / 255, b = c[2] / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn, h = 0, s = 0;
    if (d) {
      s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn);
      h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60;
    }
    h = (h + deg) % 360;
    function f(n) { var k = (n + h / 30) % 12, a = s * Math.min(l, 1 - l); var v = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)); return Math.round(v * 255); }
    return '#' + [f(0), f(8), f(4)].map(function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
  }

  IFFY_SAMPLES.add({ id: 'sprites', tab: 'Pixel sprites', mount: function (ctx) {
    var THREE = ctx.THREE, scene = new THREE.Scene(), cam = new THREE.OrthographicCamera(-300, 300, 200, -200, -10, 10), stage = document.getElementById('smp-stage');
    var data = null, cats = [], all = [], cat = 'all', cur = null, view = 'single', bg = 'night', hue = 0, speed = 1, outline = true, flip = false, playing = !ctx.still, zoom = 0, tt = 0, lastFrame = -1, dirty = true, browse = 0, W = 600, H = 400, loading = false, failed = false, active = false;
    var cvs = document.createElement('canvas'), g2 = cvs.getContext('2d'), tex = null, plane = null, bgPlane = null, bgTex = null, bgKey = '';
    var sheetCache = { key: '', cols: 0, cell: 0 };
    function mkTex(c) { var t = new THREE.CanvasTexture(c); t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; t.encoding = THREE.sRGBEncoding; return t; }
    function mkPlane(t) { return new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false })); }

    // ---- drawing a sprite frame into a canvas context at (ox, oy), one canvas pixel per sprite pixel
    function drawFrame(c2, s, fi, ox, oy, hu, ol) {
      var rows = s.frames[fi % s.frames.length], pal = {}, k, x, y, img, d, w = s.w, h = s.h, op;
      for (k in s.palette) pal[k] = hexRgb(shift(s.palette[k], hu));
      img = c2.getImageData(ox - 1, oy - 1, w + 2, h + 2); d = img.data;
      for (y = 0; y < h + 2; y++) for (x = 0; x < w + 2; x++) { var o = (y * (w + 2) + x) * 4; d[o] = d[o + 1] = d[o + 2] = d[o + 3] = 0; }
      for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
        var ch = rows[y].charAt(x), p = ch !== '.' && pal[ch]; if (!p) continue;
        var q = ((y + 1) * (w + 2) + x + 1) * 4; d[q] = p[0]; d[q + 1] = p[1]; d[q + 2] = p[2]; d[q + 3] = 255;
      }
      if (ol) {
        op = new Uint8Array((w + 2) * (h + 2)); for (y = 0; y < h + 2; y++) for (x = 0; x < w + 2; x++) op[y * (w + 2) + x] = d[(y * (w + 2) + x) * 4 + 3] ? 1 : 0;
        for (y = 0; y < h + 2; y++) for (x = 0; x < w + 2; x++) {
          if (op[y * (w + 2) + x]) continue;
          if ((x > 0 && op[y * (w + 2) + x - 1]) || (x < w + 1 && op[y * (w + 2) + x + 1]) || (y > 0 && op[(y - 1) * (w + 2) + x]) || (y < h + 1 && op[(y + 1) * (w + 2) + x])) { var z = (y * (w + 2) + x) * 4; d[z] = 12; d[z + 1] = 10; d[z + 2] = 20; d[z + 3] = 255; }
        }
      }
      c2.putImageData(img, ox - 1, oy - 1);
    }

    // ---- backdrop: a small canvas drawn in big pixels
    function drawBg() {
      var key = bg + W + 'x' + H; if (key === bgKey) return; bgKey = key;
      var px = 4, w = Math.ceil(W / px), h = Math.ceil(H / px), c = document.createElement('canvas'), x = c.getContext('2d'), i, j, gr;
      c.width = w; c.height = h;
      if (bg === 'night') { gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0d0820'); gr.addColorStop(1, '#2a1238'); x.fillStyle = gr; x.fillRect(0, 0, w, h); for (i = 0; i < 40; i++) { x.fillStyle = i % 5 ? '#7c6aa8' : '#fff1c9'; x.fillRect((i * 53 + 17) % w, (i * 97 + 11) % Math.floor(h * .8), 1, 1); } }
      else if (bg === 'sky') { gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#3f8fe0'); gr.addColorStop(1, '#bfe6ff'); x.fillStyle = gr; x.fillRect(0, 0, w, h); x.fillStyle = '#ffffff'; for (i = 0; i < 4; i++) { var cx = (i * 61 + 14) % w, cy = 8 + (i * 17) % Math.floor(h * .5); x.fillRect(cx, cy, 14, 3); x.fillRect(cx + 3, cy - 2, 8, 2); x.fillRect(cx - 2, cy + 1, 3, 2); } }
      else if (bg === 'sunset') { gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#3b1d5a'); gr.addColorStop(.55, '#d4546a'); gr.addColorStop(1, '#ffb25a'); x.fillStyle = gr; x.fillRect(0, 0, w, h); x.fillStyle = '#ffe9a8'; x.fillRect(Math.floor(w * .72), Math.floor(h * .58), 9, 9); x.fillStyle = '#2a1238'; for (i = 0; i < w; i++) x.fillRect(i, h - 5 - Math.floor(3 * Math.abs(Math.sin(i * .21)) + 2 * Math.abs(Math.sin(i * .07))), 1, 8); }
      else if (bg === 'grid') { x.fillStyle = '#17121f'; x.fillRect(0, 0, w, h); x.fillStyle = '#2b2236'; for (i = 0; i < w; i += 6) x.fillRect(i, 0, 1, h); for (j = 0; j < h; j += 6) x.fillRect(0, j, w, 1); }
      else { x.fillStyle = '#241a2e'; x.fillRect(0, 0, w, h); }
      if (bgTex) bgTex.dispose();
      bgTex = mkTex(c); if (!bgPlane) { bgPlane = mkPlane(bgTex); bgPlane.material.transparent = false; bgPlane.position.z = -5; scene.add(bgPlane); } else { bgPlane.material.map = bgTex; bgPlane.material.needsUpdate = true; }
      bgPlane.scale.set(w * px, h * px, 1);
    }

    // ---- what is on the stage
    function place() {
      var s, S, cw, ch, cols, cell, n, list, i;
      if (!data) return;
      if (view === 'sheet') {
        list = cat === 'all' ? all : (cats.filter(function (c) { return c.id === cat; })[0] || { sprites: [] }).sprites; n = list.length; if (!n) return;
        cell = 0; list.forEach(function (sp) { cell = Math.max(cell, sp.w, sp.h); }); cell += 4;
        cols = Math.max(1, Math.round(Math.sqrt(n * (W / H)))); cols = Math.min(cols, n);
        cw = cols * cell; ch = Math.ceil(n / cols) * cell;
        if (cvs.width !== cw || cvs.height !== ch) { cvs.width = cw; cvs.height = ch; }
        g2.clearRect(0, 0, cw, ch);
        list.forEach(function (sp, k) { var fi = Math.floor(tt * sp.fps * speed) % sp.frames.length; drawFrame(g2, sp, fi, (k % cols) * cell + 2 + Math.floor((cell - 4 - sp.w) / 2), Math.floor(k / cols) * cell + 2 + Math.floor((cell - 4 - sp.h) / 2), hue, outline); });
        S = Math.max(1, Math.floor(Math.min((W - 40) / cw, (H - 40) / ch) * Math.pow(1.3, zoom)));
        mount(cw, ch, S, false);
      } else if (cur) {
        s = cur; cw = s.w + 2; ch = s.h + 2;
        if (cvs.width !== cw || cvs.height !== ch) { cvs.width = cw; cvs.height = ch; }
        g2.clearRect(0, 0, cw, ch);
        lastFrame = Math.floor(tt * s.fps * speed) % s.frames.length;
        drawFrame(g2, s, lastFrame, 1, 1, hue, outline);
        S = Math.max(1, Math.floor(Math.min((W - 60) / cw, (H - 90) / ch) * Math.pow(1.3, zoom)));
        mount(cw, ch, S, flip);
      }
      dirty = false;
    }
    function mount(cw, ch, S, fl) {
      if (!tex || tex.image !== cvs || tex.userData.w !== cw || tex.userData.h !== ch) {
        if (tex) tex.dispose();
        tex = mkTex(cvs); tex.userData = { w: cw, h: ch };
        if (!plane) { plane = mkPlane(tex); scene.add(plane); } else { plane.material.map = tex; plane.material.needsUpdate = true; }
      }
      tex.needsUpdate = true;
      plane.scale.set(cw * S * (fl ? -1 : 1), ch * S, 1);
      plane.position.set((cw * S) % 2 ? .5 : 0, ((ch * S) % 2 ? .5 : 0) + 6, 0);
    }

    // ---- side panel
    var ui = el('div', 'smp-ui'), catBtns = {}, bgBtns = {}, hueBtns = {}, spdBtns = {}, viewBtns = {}, thumbs = {};
    ui.appendChild(el('h3', '', 'Pixel sprites'));
    var tag = el('p', 'tag', 'Original pixel art drawn as text grids, with animation. Pick a sprite, browse a whole category, swap the palette.'); ui.appendChild(tag);
    var chips = el('p', 'chips'); ui.appendChild(chips);
    ui.appendChild(el('p', 'smp-l', 'Category'));
    var gc = el('div', 'smp-g'); ui.appendChild(gc);
    var grid = el('div', 'spr-grid'); ui.appendChild(grid);
    var now = el('p', 'smp-now'); now.setAttribute('aria-live', 'polite'); ui.appendChild(now);
    function group(label, items, store, fn) {
      ui.appendChild(el('p', 'smp-l', label)); var g = el('div', 'smp-g'); ui.appendChild(g);
      items.forEach(function (it) { var b = el('button', 'smp-b', it[1] || it[0]); b.type = 'button'; b.addEventListener('click', function () { fn(it); refresh(); }); g.appendChild(b); store[it[0]] = b; });
    }
    group('View', [['single', 'One sprite'], ['sheet', 'Whole category']], viewBtns, function (it) { view = it[0]; dirty = true; });
    group('Background', BGS, bgBtns, function (it) { bg = it[0]; drawBg(); dirty = true; });
    group('Palette', HUES.map(function (h) { return [String(h[1]), h[0]]; }), hueBtns, function (it) { hue = +it[0]; dirty = true; });
    group('Speed', SPEEDS.map(function (s) { return [String(s[1]), s[0]]; }), spdBtns, function (it) { speed = +it[0]; });
    var tg = el('div', 'smp-g'); tg.style.marginTop = '12px'; ui.appendChild(tg);
    var olB = el('button', 'smp-b', 'Outline'), flB = el('button', 'smp-b', 'Flip'), rnB = el('button', 'smp-b', 'Surprise me');
    [olB, flB, rnB].forEach(function (b) { b.type = 'button'; tg.appendChild(b); });
    olB.addEventListener('click', function () { outline = !outline; dirty = true; refresh(); });
    flB.addEventListener('click', function () { flip = !flip; dirty = true; refresh(); });
    rnB.addEventListener('click', function () { var l = list(); if (l.length) pick(l[Math.floor(Math.random() * l.length)]); });
    var row = el('div', 'row smp-row'), pb = el('button', 'mbtn', ''), cta = el('a', 'btn', 'Order pixel art like this');
    pb.type = 'button'; pb.addEventListener('click', function () { playing = !playing; refresh(); });
    cta.href = WA + encodeURIComponent('Hi Iffy, I saw your pixel sprites and I would like pixel art made for my project.'); cta.target = '_blank'; cta.rel = 'noopener';
    row.appendChild(pb); row.appendChild(cta); ui.appendChild(row);

    function list() { return cat === 'all' ? all : (cats.filter(function (c) { return c.id === cat; })[0] || { sprites: [] }).sprites; }
    function pick(s) { cur = s; dirty = true; tt = 0; refresh(); }
    function buildThumbs() {
      grid.innerHTML = ''; thumbs = {};
      list().forEach(function (s) {
        var b = el('button', 'spr-t'), c = document.createElement('canvas'), k = Math.max(1, Math.round(48 / (Math.max(s.w, s.h) + 2)));
        b.type = 'button'; b.title = s.name; b.setAttribute('aria-label', s.name); c.width = s.w + 2; c.height = s.h + 2; c.style.width = (s.w + 2) * k + 'px'; c.style.height = (s.h + 2) * k + 'px';
        drawFrame(c.getContext('2d'), s, 0, 1, 1, 0, true);
        b.appendChild(c); b.addEventListener('click', function () { view = 'single'; pick(s); }); grid.appendChild(b); thumbs[s.id] = b;
      });
    }
    function refresh() {
      Object.keys(catBtns).forEach(function (k) { catBtns[k].setAttribute('aria-pressed', k === cat ? 'true' : 'false'); });
      Object.keys(viewBtns).forEach(function (k) { viewBtns[k].setAttribute('aria-pressed', k === view ? 'true' : 'false'); });
      Object.keys(bgBtns).forEach(function (k) { bgBtns[k].setAttribute('aria-pressed', k === bg ? 'true' : 'false'); });
      Object.keys(hueBtns).forEach(function (k) { hueBtns[k].setAttribute('aria-pressed', +k === hue ? 'true' : 'false'); });
      Object.keys(spdBtns).forEach(function (k) { spdBtns[k].setAttribute('aria-pressed', +k === speed ? 'true' : 'false'); });
      olB.setAttribute('aria-pressed', outline ? 'true' : 'false'); flB.setAttribute('aria-pressed', flip ? 'true' : 'false');
      Object.keys(thumbs).forEach(function (k) { thumbs[k].setAttribute('aria-pressed', cur && cur.id === k ? 'true' : 'false'); });
      pb.textContent = playing ? 'Pause' : 'Play'; pb.disabled = !data;
      if (loading) now.textContent = 'Loading the sprites...';
      else if (failed) now.textContent = 'Could not load the sprites here. Check the connection and open this tab again.';
      else if (cur) { var cols = {}; cur.frames.forEach(function (f) { f.forEach(function (r) { for (var i = 0; i < r.length; i++) if (r.charAt(i) !== '.') cols[r.charAt(i)] = 1; }); }); now.textContent = cur.name + ': ' + cur.w + ' x ' + cur.h + ' pixels, ' + cur.frames.length + (cur.frames.length === 1 ? ' frame' : ' frames') + ', ' + Object.keys(cols).length + ' colours.'; }
    }
    function setCat(id) { cat = id; var l = list(); buildThumbs(); if (l.length && (!cur || l.indexOf(cur) < 0)) cur = l[0]; dirty = true; refresh(); }

    function init(d) {
      data = d; cats = d.cats; all = []; cats.forEach(function (c) { c.sprites.forEach(function (s) { s.cat = c.id; all.push(s); }); });
      chips.innerHTML = ''; [all.length + ' sprites', cats.length + ' categories', 'animated', 'palette swaps'].forEach(function (t) { chips.appendChild(el('span', '', t)); });
      [['all', 'All']].concat(cats.map(function (c) { return [c.id, c.title]; })).forEach(function (c) { var b = el('button', 'smp-b', c[1]); b.type = 'button'; b.addEventListener('click', function () { setCat(c[0]); }); gc.appendChild(b); catBtns[c[0]] = b; });
      cur = all[Math.floor(all.length / 3)] || all[0]; setCat('all');
    }
    function load() {
      if (data || loading) return; loading = true; failed = false; refresh();
      fetch('assets/sprites.json').then(function (r) { if (!r.ok) throw new Error('x'); return r.json(); }).then(function (d) { loading = false; init(d); }).catch(function () { loading = false; failed = true; refresh(); });
    }

    var acc = 0;
    function update(t, dt) {
      if (playing) tt += dt;
      if (!data) return;
      if (dirty) place();
      else if (cur && view === 'single') { var f = Math.floor(tt * cur.fps * speed) % cur.frames.length; if (f !== lastFrame) place(); }
      else if (view === 'sheet' && playing) place();
    }
    function resize(w, h) { W = w; H = h; cam.left = -w / 2; cam.right = w / 2; cam.top = h / 2; cam.bottom = -h / 2; cam.updateProjectionMatrix(); drawBg(); dirty = true; }
    function show() { active = true; load(); refresh(); }
    function hide() { active = false; }
    drawBg(); refresh();
    return {
      ui: ui, scene: scene, camera: cam, update: update, resize: resize, show: show, hide: hide,
      drag: function (dx) { browse += dx; if (Math.abs(browse) > 70 && view === 'single') { var l = list(), i = l.indexOf(cur); if (i >= 0 && l.length) { pick(l[(i + (browse > 0 ? 1 : l.length - 1)) % l.length]); } browse = 0; } },
      pinch: function (f) { zoom = clamp(zoom + Math.log(f) * 3, -3, 4); dirty = true; },
      reset: function () { zoom = 0; dirty = true; },
      restore: function () { dirty = true; if (tex) tex.needsUpdate = true; if (bgTex) bgTex.needsUpdate = true; },
      hint: matchMedia('(pointer:coarse)').matches ? 'Swipe sideways for the next sprite, pinch to zoom' : 'Drag sideways for the next sprite. Ctrl and scroll to zoom. Double click to reset.',
      dbg: function () { return { loaded: !!data, sprites: all.length, cats: cats.length, cat: cat, cur: cur && cur.id, view: view, bg: bg, hue: hue, playing: playing, thumbs: Object.keys(thumbs).length, calls: ctx.renderer.info.render.calls }; }
    };
  } });
})();
