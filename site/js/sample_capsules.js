/* Sample 8: Steam style capsules. Sixteen made-up pixel art games shown as the four store capsule formats (header 460 x 215,
   main 616 x 353, small 231 x 87, vertical 374 x 448). Every capsule is composed live from the pixel sprite library
   (assets/sprites.json): a drawn scene, the hero and friends, a pixel title and a tagline. The games are invented;
   no logo or trademark is used. Registered with js/samples.js. */
(function () {
  'use strict';
  if (!window.IFFY_SAMPLES) return;
  var WA = 'https://wa.me/2348075889359?text=';
  var FORMATS = { header: ['Header', 460, 215], main: ['Main', 616, 353], small: ['Small', 231, 87], vertical: ['Vertical', 374, 448] };
  var GAMES = [
    { id: 'danfo-dash', t: ['DANFO', 'DASH'], tag: 'Race the Lagos traffic', scene: 'city', hero: 'danfo-conductor', side: ['danfo', 'gold-coin', 'okada'], fill: ['#ffe14a', '#ffb000'], edge: '#3b1d00', sky: ['#ff9a5a', '#ffd9a0'] },
    { id: 'slime-kingdom', t: ['SLIME', 'KINGDOM'], tag: 'Defend the royal meadow', scene: 'forest', hero: 'knight', side: ['blue-slime', 'red-slime', 'castle'], fill: ['#9bff7a', '#3fbf3a'], edge: '#0e3a14', sky: ['#5ab8ff', '#d6f3ff'] },
    { id: 'star-cobbler', t: ['STAR', 'COBBLER'], tag: 'Mend the galaxy, one boot at a time', scene: 'space', hero: 'astronaut', side: ['robot', 'ufo', 'ringed-planet'], fill: ['#8ff0ff', '#3a8cff'], edge: '#0a1244', sky: ['#0b0626', '#2a1458'] },
    { id: 'jollof-wars', t: ['JOLLOF', 'WARS'], tag: 'The ultimate kitchen showdown', scene: 'market', hero: 'mama-put', side: ['jollof-rice', 'suya', 'fried-plantain'], fill: ['#ff7a3a', '#e02a1a'], edge: '#3a0a00', sky: ['#ffb36a', '#ffe7b8'] },
    { id: 'crypt-of-echoes', t: ['CRYPT OF', 'ECHOES'], tag: 'Wake nothing', scene: 'dungeon', hero: 'rogue', side: ['skeleton', 'ghost', 'treasure-chest'], fill: ['#d8c4ff', '#8a5cff'], edge: '#140a2e', sky: ['#120c1e', '#2a1c3a'] },
    { id: 'lava-lizard', t: ['LAVA', 'LIZARD'], tag: 'Hot feet. Cool head.', scene: 'lava', hero: 'explorer', side: ['imp', 'golem', 'fire-spirit'], fill: ['#ffd23a', '#ff5a1a'], edge: '#3a0800', sky: ['#2a0a10', '#7a1a10'] },
    { id: 'frost-fang', t: ['FROST', 'FANG'], tag: 'A long winter hunt', scene: 'snow', hero: 'ranger', side: ['snowy-pine', 'penguin', 'fox'], fill: ['#ffffff', '#9fd6ff'], edge: '#0e2a52', sky: ['#9fc8ee', '#eef8ff'] },
    { id: 'harmattan-rider', t: ['HARMATTAN', 'RIDER'], tag: 'Dust. Speed. Glory.', scene: 'desert', hero: 'okada-rider', side: ['cactus', 'scorpion', 'palm-tree'], fill: ['#ffd27a', '#e8801a'], edge: '#3a1c00', sky: ['#f6a15a', '#ffe0a8'] },
    { id: 'tide-keepers', t: ['TIDE', 'KEEPERS'], tag: 'Guard the deep', scene: 'ocean', hero: 'pirate', side: ['whale', 'goldfish', 'sailboat'], fill: ['#7affd8', '#1a9fdc'], edge: '#04264a', sky: ['#4aa8e8', '#bfeaff'] },
    { id: 'neon-okada', t: ['NEON', 'OKADA'], tag: 'Midnight delivery', scene: 'night', hero: 'yaba-designer', side: ['okada', 'drone', 'retro-tv'], fill: ['#ff7af0', '#7a5aff'], edge: '#12063a', sky: ['#120a34', '#4a1a5a'] },
    { id: 'pocket-farm', t: ['POCKET', 'FARM SAGA'], tag: 'Grow your dream farm', scene: 'forest', hero: 'farmer', side: ['hen', 'cow', 'red-barn'], fill: ['#fff07a', '#8fd23a'], edge: '#2a3a08', sky: ['#7ac8ff', '#f4ffd0'] },
    { id: 'sky-pirates', t: ['SKY', 'PIRATES'], tag: 'Plunder the clouds', scene: 'sky', hero: 'viking', side: ['balloon', 'prop-plane', 'parrot'], fill: ['#ffe27a', '#ff9a2a'], edge: '#3a1a00', sky: ['#3a7ae0', '#a8dcff'] },
    { id: 'football-fury', t: ['FOOTBALL', 'FURY'], tag: 'Five-a-side. No rules.', scene: 'field', hero: 'footballer', side: ['soccer-ball', 'gold-medal', 'trophy-cup'], fill: ['#7aff9a', '#1ab04a'], edge: '#04301a', sky: ['#4aa0ff', '#cfeaff'] },
    { id: 'wizards-pets', t: ["WIZARD'S", 'PET SHOP'], tag: 'Every pet has a spell', scene: 'dungeon', hero: 'apprentice', side: ['baby-dragon', 'grey-cat', 'crystal-ball'], fill: ['#caa0ff', '#7a4aff'], edge: '#1a0a3a', sky: ['#1c1230', '#3a2058'] },
    { id: 'market-mayhem', t: ['MARKET', 'MAYHEM'], tag: 'Haggle your way to riches', scene: 'market', hero: 'market-trader', side: ['market-stall', 'kano-trader', 'gold-coin'], fill: ['#ffb0f0', '#ff3a8a'], edge: '#3a0a22', sky: ['#ffc26a', '#fff0c0'] },
    { id: 'robot-rebels', t: ['ROBOT', 'REBELS'], tag: 'Join the circuit', scene: 'space', hero: 'robot', side: ['laser-drone', 'cyborg-arm', 'star-fighter'], fill: ['#7affc0', '#1ab0ff'], edge: '#04223a', sky: ['#0a1030', '#1a3a5a'] }
  ];

  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt) e.textContent = txt; return e; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function hexRgb(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
  function mix(a, b, t) { var x = hexRgb(a), y = hexRgb(b); return 'rgb(' + Math.round(x[0] + (y[0] - x[0]) * t) + ',' + Math.round(x[1] + (y[1] - x[1]) * t) + ',' + Math.round(x[2] + (y[2] - x[2]) * t) + ')'; }
  function rng(seed) { var s = seed >>> 0; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

  IFFY_SAMPLES.add({ id: 'capsules', tab: 'Steam capsules', mount: function (ctx) {
    var THREE = ctx.THREE, scene = new THREE.Scene(), cam = new THREE.OrthographicCamera(-300, 300, 200, -200, -10, 10);
    var ctxW = 300, spr = {}, ready = false, loading = false, failed = false, game = GAMES[0], fmt = 'header', playing = !ctx.still, tt = 0, W = 600, H = 400, dirty = true, lastKey = '', active = false;
    var cvs = document.createElement('canvas'), c2 = cvs.getContext('2d'), tex = null, plane = null, frames = {}, texts = {}, tcv = document.createElement('canvas'), tcx = tcv.getContext('2d');

    // ---- sprites from the library, drawn once per frame into small canvases
    function frameCv(s, f, ol) {
      var key = s.id + ':' + f + ':' + (ol ? 1 : 0); if (frames[key]) return frames[key];
      var c = document.createElement('canvas'), x = c.getContext('2d'), w = s.w + 2, h = s.h + 2, img, d, y, i, p, op, rows = s.frames[f % s.frames.length], pal = {}, k;
      c.width = w; c.height = h; for (k in s.palette) pal[k] = hexRgb(s.palette[k]);
      img = x.createImageData(w, h); d = img.data;
      for (y = 0; y < s.h; y++) for (i = 0; i < s.w; i++) { var ch = rows[y].charAt(i); p = ch !== '.' && pal[ch]; if (!p) continue; var q = ((y + 1) * w + i + 1) * 4; d[q] = p[0]; d[q + 1] = p[1]; d[q + 2] = p[2]; d[q + 3] = 255; }
      if (ol) {
        op = new Uint8Array(w * h); for (i = 0; i < w * h; i++) op[i] = d[i * 4 + 3] ? 1 : 0;
        for (y = 0; y < h; y++) for (i = 0; i < w; i++) { if (op[y * w + i]) continue; if ((i > 0 && op[y * w + i - 1]) || (i < w - 1 && op[y * w + i + 1]) || (y > 0 && op[(y - 1) * w + i]) || (y < h - 1 && op[(y + 1) * w + i])) { var z = (y * w + i) * 4; d[z] = 12; d[z + 1] = 8; d[z + 2] = 20; d[z + 3] = 255; } }
      }
      x.putImageData(img, 0, 0); frames[key] = c; return c;
    }
    // draws a sprite with its feet on (cx, baseY) at an integer scale; returns the width drawn
    function put(id, cx, baseY, sc, flip) {
      var s = spr[id]; if (!s) return 0;
      var f = Math.floor(tt * s.fps) % s.frames.length, c = frameCv(s, f, true), w = c.width * sc, h = c.height * sc;
      c2.save(); c2.translate(Math.round(cx), Math.round(baseY - h + sc)); if (flip) c2.scale(-1, 1); c2.drawImage(c, Math.round(-w / 2), 0, w, h); c2.restore(); return w;
    }

    // ---- pixel text: browser text thresholded to hard pixels, outlined and shaded
    function mask(txt, px) {
      var key = txt + '|' + px; if (texts[key]) return texts[key];
      tcx.font = '900 ' + px + 'px Impact, "Arial Black", "Arial Narrow Bold", sans-serif';
      var mt = tcx.measureText(txt), asc = Math.ceil(mt.actualBoundingBoxAscent || px * .8), dsc = Math.ceil(mt.actualBoundingBoxDescent || 0), w = Math.ceil(mt.width) + 6, h = asc + dsc + 4; tcv.width = w; tcv.height = h;
      tcx.font = '900 ' + px + 'px Impact, "Arial Black", "Arial Narrow Bold", sans-serif'; tcx.textBaseline = 'alphabetic'; tcx.fillStyle = '#000'; tcx.fillText(txt, 3, asc + 2);
      var img = tcx.getImageData(0, 0, w, h), d = img.data, i; for (i = 3; i < d.length; i += 4) d[i] = d[i] > 110 ? 255 : 0;
      var out = document.createElement('canvas'); out.width = w; out.height = h; out.getContext('2d').putImageData(img, 0, 0); texts[key] = out; return out;
    }
    function tint(m, color, key) {
      var k = key + color; if (texts[k]) return texts[k];
      var c = document.createElement('canvas'); c.width = m.width; c.height = m.height; var x = c.getContext('2d'); x.drawImage(m, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = color; x.fillRect(0, 0, c.width, c.height); texts[k] = c; return c;
    }
    function title(txt, x, y, px, g, align) {
      var m = mask(txt, px), w = m.width, h = m.height, ox = align === 'center' ? x - w / 2 : x, i, j, k = txt + px;
      ox = Math.round(ox); y = Math.round(y);
      var edge = tint(m, g.edge, k + 'e'), dark = tint(m, '#0a0614', k + 'd'), f1 = tint(m, g.fill[0], k + 'f'), f2 = tint(m, g.fill[1], k + 'g');
      for (i = -1; i <= 1; i++) for (j = -1; j <= 3; j++) c2.drawImage(j > 1 ? dark : edge, ox + i, y + j);
      c2.drawImage(f2, ox, y); c2.drawImage(f1, 0, 0, w, Math.round(h * .5), ox, y, w, Math.round(h * .5));
      return h;
    }
    function fitPx(txt, maxW, maxPx) { var px = maxPx; while (px > 6 && mask(txt, px).width > maxW) px -= 1; return px; }
    function small(txt, x, y, color, align) { var px = ctxW > 300 ? 12 : 10, m = mask(txt, px), e = tint(m, '#140a24', txt + px + 'q'), f = tint(m, color, txt + px + 'r'), w = m.width, ox = Math.round(align === 'center' ? x - w / 2 : x), i, j; for (i = -1; i <= 1; i++) for (j = -1; j <= 1; j++) c2.drawImage(e, ox + i, Math.round(y) + j); c2.drawImage(f, ox, Math.round(y)); return w; }

    // ---- scenes, drawn at the capsule's own (half) resolution
    function scenery(g, w, h, t) {
      var r = rng(g.id.length * 977 + w), i, x, y, gr = c2.createLinearGradient(0, 0, 0, h), gy = Math.round(h * .8), s = g.scene, sc = Math.floor(t * 6);
      gr.addColorStop(0, g.sky[0]); gr.addColorStop(1, g.sky[1]); c2.fillStyle = gr; c2.fillRect(0, 0, w, h);
      function band(color, base, amp, freq, ph) { c2.fillStyle = color; for (x = 0; x < w; x++) { var yy = Math.round(base - amp * Math.abs(Math.sin(x * freq + ph)) - amp * .5 * Math.sin(x * freq * 2.7 + ph * 2)); c2.fillRect(x, yy, 1, h - yy); } }
      function cloud(cx, cy, k) { c2.fillStyle = 'rgba(255,255,255,.9)'; c2.fillRect(cx, cy, 14 * k, 3 * k); c2.fillRect(cx + 3 * k, cy - 2 * k, 8 * k, 2 * k); c2.fillRect(cx - 2 * k, cy + k, 3 * k, 2 * k); }
      if (s === 'space' || s === 'night' || s === 'dungeon' || s === 'lava') {
        for (i = 0; i < w * h / 160; i++) { x = Math.floor(r() * w); y = Math.floor(r() * gy * .85); c2.fillStyle = ((i + sc) % 7 === 0) ? '#ffffff' : (s === 'lava' ? '#ff9a5a' : '#8b78c8'); c2.fillRect(x, y, 1, 1); }
      }
      if (s === 'space') { c2.fillStyle = '#ffd9a0'; c2.fillRect(Math.round(w * .12), Math.round(h * .14), 7, 7); c2.fillStyle = '#7a5ac8'; c2.fillRect(Math.round(w * .86), Math.round(h * .2), 14, 14); c2.fillStyle = '#9a7ae8'; c2.fillRect(Math.round(w * .86), Math.round(h * .2), 10, 5); band('#1a0e3a', h * .93, 4, .06, 1); return; }
      if (s === 'forest' || s === 'sky' || s === 'field' || s === 'ocean' || s === 'snow' || s === 'desert' || s === 'city' || s === 'market') { c2.fillStyle = s === 'snow' ? '#fff' : '#fff6c0'; c2.fillRect(Math.round(w * .78), Math.round(h * .14), 9, 9); cloud(Math.round((t * 3 + 10) % (w + 20)) - 10, Math.round(h * .16), 1); cloud(Math.round((t * 2 + w * .5) % (w + 20)) - 10, Math.round(h * .3), 1); }
      if (s === 'forest') { band('#3a8a4a', h * .72, 7, .05, 2); band('#2a6a3a', h * .8, 5, .08, 4); }
      else if (s === 'field') { band('#4aa84a', h * .78, 2, .02, 1); for (i = 0; i < w; i += 14) { c2.fillStyle = 'rgba(0,0,0,.08)'; c2.fillRect(i, gy, 7, h - gy); } c2.fillStyle = '#fff'; c2.fillRect(0, gy, w, 1); }
      else if (s === 'sky') { cloud(Math.round(w * .2), Math.round(h * .72), 4); cloud(Math.round(w * .6), Math.round(h * .85), 5); return; }
      else if (s === 'ocean') { for (y = gy - 8; y < h; y += 4) { c2.fillStyle = mix('#2a9ad8', '#0a3a7a', (y - gy + 8) / (h - gy + 8)); c2.fillRect(0, y, w, 4); for (x = ((y + sc) % 12); x < w; x += 12) { c2.fillStyle = 'rgba(255,255,255,.45)'; c2.fillRect(x, y, 4, 1); } } }
      else if (s === 'snow') { band('#c8e0f4', h * .62, 18, .035, 1); band('#ffffff', h * .78, 8, .06, 3); for (i = 0; i < w * h / 500; i++) { c2.fillStyle = '#fff'; c2.fillRect((Math.floor(r() * w) + sc) % w, (Math.floor(r() * h) + sc * 2) % h, 1, 1); } }
      else if (s === 'desert') { band('#e0a050', h * .74, 6, .04, 2); band('#c88a3a', h * .84, 5, .07, 5); }
      else if (s === 'city' || s === 'market' || s === 'night') {
        var night = s === 'night';
        for (x = 0; x < w; ) { var bw = 10 + Math.floor(r() * 14), bh = Math.floor(h * (.25 + r() * .35)); c2.fillStyle = night ? '#1a0e38' : (s === 'market' ? '#b5683a' : '#6a4a7a'); c2.fillRect(x, gy - bh, bw, bh); for (y = gy - bh + 3; y < gy - 4; y += 5) for (i = x + 2; i < x + bw - 2; i += 4) { c2.fillStyle = r() < .4 ? (night ? '#ffe27a' : '#ffefb0') : (night ? '#3a2468' : '#5a3a6a'); c2.fillRect(i, y, 2, 2); } x += bw + 1; }
        c2.fillStyle = night ? '#2a1a48' : '#4a4a58'; c2.fillRect(0, gy, w, h - gy); c2.fillStyle = '#ffd24a'; for (x = -((sc * 2) % 16); x < w; x += 16) c2.fillRect(x, Math.round(gy + (h - gy) * .5), 8, 1); return;
      }
      else if (s === 'dungeon') { c2.fillStyle = '#2a1e38'; for (y = 0; y < gy; y += 8) for (x = (y / 8 % 2) * 8 - 8; x < w; x += 16) { c2.fillRect(x, y, 15, 7); } c2.fillStyle = 'rgba(0,0,0,.35)'; c2.fillRect(0, 0, w, gy); for (i = 0; i < 3; i++) { var tx = Math.round(w * (.18 + i * .32)); c2.fillStyle = '#6a4a2a'; c2.fillRect(tx, Math.round(h * .3), 2, 8); c2.fillStyle = (sc + i) % 2 ? '#ffb02a' : '#ff7a1a'; c2.fillRect(tx - 1, Math.round(h * .3) - 4, 4, 4); c2.fillStyle = 'rgba(255,160,40,.12)'; c2.fillRect(tx - 12, Math.round(h * .3) - 12, 26, 26); } }
      else if (s === 'lava') { band('#3a1018', h * .7, 12, .04, 1); for (y = gy; y < h; y += 3) { c2.fillStyle = mix('#ff8a1a', '#c01a10', (y - gy) / (h - gy)); c2.fillRect(0, y, w, 3); for (x = (y + sc * 2) % 10; x < w; x += 10) { c2.fillStyle = '#ffe27a'; c2.fillRect(x, y, 3, 1); } } return; }
      c2.fillStyle = s === 'dungeon' ? '#3a2a48' : (s === 'forest' ? '#3a9a3a' : (s === 'desert' ? '#d49a48' : (s === 'snow' ? '#f4faff' : '#4aa84a'))); if (s !== 'field' && s !== 'ocean') c2.fillRect(0, gy, w, h - gy);
    }

    // ---- composition per capsule format
    function capsule(g, f, w, h, t) {
      ctxW = w; var hs = spr[g.hero], sc, base = Math.round(h * .9), i;
      if (!hs) return;
      scenery(g, w, h, t);
      if (f === 'small') {
        sc = Math.max(1, Math.floor(h * .8 / hs.h)); put(g.hero, w - sc * hs.w * .6, h - 2, sc, true);
        var tx = fitPx(g.t.join(' '), w * .62, Math.floor(h * .36)); title(g.t.join(' '), 5, Math.round(h * .16), tx, g, 'left'); small(g.tag, 6, Math.round(h * .7), '#ffffff', 'left');
        return;
      }
      if (f === 'vertical') {
        var tp = fitPx(g.t[1].length > g.t[0].length ? g.t[1] : g.t[0], w * .86, Math.floor(h * .13));
        title(g.t[0], w / 2, Math.round(h * .05), tp, g, 'center'); title(g.t[1], w / 2, Math.round(h * .05 + tp * 1.15), tp, g, 'center');
        sc = Math.max(1, Math.floor(Math.min(h * .4 / hs.h, w * .7 / hs.w))); put(g.hero, w / 2, Math.round(h * .8), sc, false);
        var s2 = Math.max(1, Math.floor(h * .16 / 24)); put(g.side[0], Math.round(w * .2), Math.round(h * .9), s2, false); put(g.side[1], Math.round(w * .8), Math.round(h * .9), s2, true);
        small(g.tag, w / 2, Math.round(h * .93), '#ffffff', 'center'); return;
      }
      sc = Math.max(1, Math.floor(h * .62 / hs.h));
      var s2b = Math.max(1, Math.floor(h * .3 / 24));
      put(g.side[2], Math.round(w * .94), base - 2, Math.max(1, Math.floor(h * .24 / 24)), false);
      put(g.side[0], Math.round(w * .5), base, s2b, false); put(g.side[1], Math.round(w * .88), base, s2b, true);
      put(g.hero, Math.round(w * .7), base + 2, sc, false);
      var mw = w * .46, p1 = fitPx(g.t[1].length > g.t[0].length ? g.t[1] : g.t[0], mw, Math.floor(h * .24));
      title(g.t[0], Math.round(w * .05), Math.round(h * .12), p1, g, 'left'); title(g.t[1], Math.round(w * .05), Math.round(h * .12 + p1 * 1.12), p1, g, 'left');
      small(g.tag, Math.round(w * .055), Math.round(h * .12 + p1 * 2.45), '#ffffff', 'left');
    }

    function render() {
      var sz, fw, fh, all = fmt === 'all', cw, ch, k;
      if (all) { cw = 308 + 187 + 12; ch = 296; } else { sz = FORMATS[fmt]; cw = Math.round(sz[1] / 2); ch = Math.round(sz[2] / 2); }
      if (cvs.width !== cw || cvs.height !== ch) { cvs.width = cw; cvs.height = ch; }
      c2.imageSmoothingEnabled = false; c2.clearRect(0, 0, cw, ch);
      if (all) {
        var items = [['main', 0, 0], ['vertical', 308 + 12, 0], ['header', 0, 176 + 12], ['small', 308 + 12, 224 + 12]];
        items.forEach(function (it) { var s = FORMATS[it[0]], w = Math.round(s[1] / 2), h = Math.round(s[2] / 2); c2.save(); c2.beginPath(); c2.rect(it[1], it[2], w, h); c2.clip(); c2.translate(it[1], it[2]); capsule(game, it[0], w, h, tt); c2.restore(); });
      } else capsule(game, fmt, cw, ch, tt);
      var S = Math.max(1, Math.floor(Math.min((W - 40) / cw, (H - 40) / ch)));
      if (!tex) { tex = new THREE.CanvasTexture(cvs); tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.NearestFilter; tex.generateMipmaps = false; tex.encoding = THREE.sRGBEncoding; plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: tex, transparent: true })); scene.add(plane); }
      tex.needsUpdate = true; plane.scale.set(cw * S, ch * S, 1); plane.position.set((cw * S) % 2 ? .5 : 0, ((ch * S) % 2 ? .5 : 0) + 6, 0);
      dirty = false;
    }

    // ---- panel
    var ui = el('div', 'smp-ui'), gb = {}, fb = {};
    ui.appendChild(el('h3', '', 'Steam capsules'));
    ui.appendChild(el('p', 'tag', 'Store capsule art for sixteen made-up pixel games, in the four store formats. Each one is composed live from the sprite library.'));
    var chips = el('p', 'chips'); ['16 games', '4 formats', 'built from sprites', 'animated'].forEach(function (s) { chips.appendChild(el('span', '', s)); }); ui.appendChild(chips);
    ui.appendChild(el('p', 'smp-l', 'Game')); var gg = el('div', 'smp-g'); ui.appendChild(gg);
    GAMES.forEach(function (g) { var b = el('button', 'smp-b', g.t.join(' ').replace("'", 'â€™')); b.type = 'button'; b.addEventListener('click', function () { game = g; dirty = true; refresh(); }); gg.appendChild(b); gb[g.id] = b; });
    ui.appendChild(el('p', 'smp-l', 'Format')); var gf = el('div', 'smp-g'); ui.appendChild(gf);
    [['header', 'Header 460 x 215'], ['main', 'Main 616 x 353'], ['small', 'Small 231 x 87'], ['vertical', 'Vertical 374 x 448'], ['all', 'All four']].forEach(function (f) { var b = el('button', 'smp-b', f[1]); b.type = 'button'; b.addEventListener('click', function () { fmt = f[0]; dirty = true; refresh(); }); gf.appendChild(b); fb[f[0]] = b; });
    var now = el('p', 'smp-now'); now.setAttribute('aria-live', 'polite'); ui.appendChild(now);
    var row = el('div', 'row smp-row'), pb = el('button', 'mbtn', ''), rn = el('button', 'smp-b', 'Surprise me'), cta = el('a', 'btn', 'Order a capsule like this');
    pb.type = 'button'; rn.type = 'button'; pb.addEventListener('click', function () { playing = !playing; refresh(); }); rn.addEventListener('click', function () { game = GAMES[Math.floor(Math.random() * GAMES.length)]; dirty = true; refresh(); });
    cta.href = WA + encodeURIComponent('Hi Iffy, I saw your Steam capsule samples and I would like capsule art for my game.'); cta.target = '_blank'; cta.rel = 'noopener';
    row.appendChild(pb); row.appendChild(rn); row.appendChild(cta); ui.appendChild(row);
    ui.appendChild(el('p', 'tag', 'The games are invented, and no logo or brand is used. Store capsule sizes are the sizes stores ask for; the art is drawn at half size and scaled up so the pixels stay crisp.')).style.fontSize = '.85rem';
    function refresh() {
      Object.keys(gb).forEach(function (k) { gb[k].setAttribute('aria-pressed', k === game.id ? 'true' : 'false'); });
      Object.keys(fb).forEach(function (k) { fb[k].setAttribute('aria-pressed', k === fmt ? 'true' : 'false'); });
      pb.textContent = playing ? 'Pause' : 'Play'; pb.disabled = !ready;
      now.textContent = loading ? 'Loading the sprites...' : failed ? 'Could not load the sprites here. Open this tab again.' : game.t.join(' ') + ': ' + game.tag + '. ' + (fmt === 'all' ? 'All four capsule formats.' : FORMATS[fmt][0] + ' capsule, ' + FORMATS[fmt][1] + ' x ' + FORMATS[fmt][2] + ' pixels.');
    }
    function load() {
      if (ready || loading) return; loading = true; failed = false; refresh();
      fetch('assets/sprites.json').then(function (r) { if (!r.ok) throw new Error('x'); return r.json(); }).then(function (d) { d.cats.forEach(function (c) { c.sprites.forEach(function (s) { spr[s.id] = s; }); }); loading = false; ready = true; dirty = true; refresh(); }).catch(function () { loading = false; failed = true; refresh(); });
    }
    function update(t, dt) { if (playing) tt += dt; if (!ready) return; var k = Math.floor(tt * 6); if (dirty || (playing && k !== lastKey)) { lastKey = k; render(); } }
    function resize(w, h) { W = w; H = h; cam.left = -w / 2; cam.right = w / 2; cam.top = h / 2; cam.bottom = -h / 2; cam.updateProjectionMatrix(); dirty = true; }
    refresh();
    return {
      ui: ui, scene: scene, camera: cam, update: update, resize: resize, show: function () { active = true; load(); refresh(); }, hide: function () { active = false; },
      restore: function () { dirty = true; if (tex) tex.needsUpdate = true; },
      hint: 'Pick a game and a format. Drag sideways for the next game.',
      drag: function (dx) { this._a = (this._a || 0) + dx; if (Math.abs(this._a) > 80) { var i = GAMES.indexOf(game); game = GAMES[(i + (this._a > 0 ? 1 : GAMES.length - 1)) % GAMES.length]; this._a = 0; dirty = true; refresh(); } },
      dbg: function () { return { ready: ready, game: game.id, fmt: fmt, playing: playing, calls: ctx.renderer.info.render.calls, missing: GAMES.filter(function (g) { return !spr[g.hero] || g.side.some(function (s) { return !spr[s]; }); }).map(function (g) { return g.id; }) }; }
    };
  } });
})();


