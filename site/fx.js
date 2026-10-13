/* Premium touches: hero node-network, scroll reveal, progress bar, cursor ring, magnetic buttons.
   Everything respects prefers-reduced-motion and only runs cursor effects on mouse/trackpad devices. */
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = matchMedia('(pointer: fine)').matches;
  var root = document.documentElement;
  var css = `
  .fx-progress { position: fixed; left: 0; top: 0; height: 2px; width: 100%; transform-origin: 0 50%; transform: scaleX(0); background: var(--accent); z-index: 80; pointer-events: none; }
  .hero { position: relative; isolation: isolate; }
  .fx-net { position: absolute; inset: 0; width: 100%; height: 100%; z-index: -1; pointer-events: none; opacity: .9; }
  .fx-ring { position: fixed; left: 0; top: 0; width: 34px; height: 34px; margin: -17px 0 0 -17px; border-radius: 50%; border: 1.5px solid var(--accent); pointer-events: none; z-index: 90; opacity: 0; transition: width .2s, height .2s, margin .2s, background .2s, opacity .2s; mix-blend-mode: normal; }
  .fx-ring.on { opacity: .75; }
  .fx-ring.big { width: 58px; height: 58px; margin: -29px 0 0 -29px; background: color-mix(in srgb, var(--accent) 14%, transparent); }
  .fx-ring.text { width: 4px; height: 26px; margin: -13px 0 0 -2px; border-radius: 2px; }
  .rv-wait { opacity: 0; transform: translateY(26px); }
  .rv-on { opacity: 1; transform: none; transition: opacity .8s cubic-bezier(.2,.7,.2,1), transform .8s cubic-bezier(.2,.7,.2,1); }
  `;
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* 1. Scroll progress */
  var bar = document.createElement('div'); bar.className = 'fx-progress'; document.body.appendChild(bar);
  function prog() { var h = root.scrollHeight - innerHeight; bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, scrollY / h) : 0) + ')'; }
  addEventListener('scroll', prog, { passive: true }); prog();

  /* 2. Scroll reveal: only things below the first screen start hidden, so the page is complete at rest */
  if (!reduce && 'IntersectionObserver' in window) {
    var sel = '.sec-head, .featured > *, .svc, .num, .cat, .step, .reel button, .tcard, .contact';
    var els = Array.prototype.slice.call(document.querySelectorAll(sel));
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sibs = Array.prototype.slice.call(el.parentNode.children);
        el.style.transitionDelay = Math.min(sibs.indexOf(el), 6) * 70 + 'ms';
        el.classList.add('rv-on'); el.classList.remove('rv-wait'); io.unobserve(el);
        setTimeout(function () { el.style.transitionDelay = ''; }, 1400);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    var watch = function () {
      els = els.concat(Array.prototype.slice.call(document.querySelectorAll('.cat, .reel button')).filter(function (x) { return els.indexOf(x) < 0; }));
      els.forEach(function (el) {
        if (el.dataset.rv) return; el.dataset.rv = 1;
        if (el.getBoundingClientRect().top > innerHeight) { el.classList.add('rv-wait'); io.observe(el); }
      });
    };
    watch();
    // category cards are re-rendered when tabs change; keep them visible
    document.addEventListener('click', function (e) { if (e.target.closest('.tab')) setTimeout(function () { document.querySelectorAll('.cat').forEach(function (c) { c.classList.remove('rv-wait'); c.dataset.rv = 1; }); }, 0); });
  }

  /* 3. Hero: rotating 3D node network (nods to agents & automations) */
  var hero = document.querySelector('.hero');
  if (hero) {
    var cv = document.createElement('canvas'); cv.className = 'fx-net'; cv.setAttribute('aria-hidden', 'true');
    hero.insertBefore(cv, hero.firstChild);
    var ctx = cv.getContext('2d'), W = 0, H = 0, dpr = Math.min(devicePixelRatio || 1, 2);
    var N = innerWidth < 700 ? 46 : 78, pts = [];
    for (var i = 0; i < N; i++) { // Fibonacci sphere
      var y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = i * 2.399963;
      pts.push([Math.cos(th) * r, y, Math.sin(th) * r, Math.random() < 0.14]);
    }
    var mx = 0, my = 0, tx = 0, ty = 0, rot = 0, visible = true, accent = '#F2B544', lineCol = '120,190,180';
    function readColors() {
      var cs = getComputedStyle(root);
      accent = (cs.getPropertyValue('--accent') || '#F2B544').trim();
      lineCol = root.getAttribute('data-theme') === 'light' ? '40,110,105' : '120,190,180';
    }
    readColors(); new MutationObserver(readColors).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    function size() { var b = hero.getBoundingClientRect(); W = b.width; H = b.height; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    size(); addEventListener('resize', size);
    hero.addEventListener('pointermove', function (e) { var b = hero.getBoundingClientRect(); mx = (e.clientX - b.left) / b.width - 0.5; my = (e.clientY - b.top) / b.height - 0.5; });
    function draw() {
      tx += (mx - tx) * 0.05; ty += (my - ty) * 0.05;
      if (!reduce) rot += 0.0016;
      var ay = rot + tx * 0.9, ax = 0.35 + ty * 0.6, cy = Math.cos(ay), sy = Math.sin(ay), cx = Math.cos(ax), sx = Math.sin(ax);
      var R = Math.min(W, H) * (W < 700 ? 0.5 : 0.62), ox = W < 860 ? W * 0.5 : W * 0.7, oy = H * 0.48;
      var P = pts.map(function (p) {
        var x = p[0] * cy - p[2] * sy, z = p[0] * sy + p[2] * cy, y = p[1] * cx - z * sx; z = p[1] * sx + z * cx;
        var s = 2.4 / (2.4 + z); return [ox + x * R * s, oy + y * R * s, z, p[3], s];
      });
      ctx.clearRect(0, 0, W, H);
      var maxD = R * 0.62;
      for (var a = 0; a < P.length; a++) for (var b = a + 1; b < P.length; b++) {
        var dx = P[a][0] - P[b][0], dy = P[a][1] - P[b][1], d = Math.sqrt(dx * dx + dy * dy);
        if (d < maxD) {
          var depth = (2 - (P[a][2] + P[b][2]) / 2) / 3;
          ctx.strokeStyle = 'rgba(' + lineCol + ',' + ((1 - d / maxD) * 0.32 * depth).toFixed(3) + ')';
          ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(P[a][0], P[a][1]); ctx.lineTo(P[b][0], P[b][1]); ctx.stroke();
        }
      }
      P.forEach(function (p) {
        var depth = (1.6 - p[2]) / 2.6;
        ctx.globalAlpha = Math.max(0.12, depth);
        ctx.fillStyle = p[3] ? accent : 'rgb(' + lineCol + ')';
        ctx.beginPath(); ctx.arc(p[0], p[1], (p[3] ? 3.2 : 1.8) * p[4], 0, 6.283); ctx.fill();
      });
      ctx.globalAlpha = 1;
      if (!reduce && visible) requestAnimationFrame(draw);
    }
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { var was = visible; visible = es[0].isIntersecting; if (visible && !was && !reduce) requestAnimationFrame(draw); }).observe(hero);
    draw();
  }

  /* 4. Cursor ring + magnetic buttons (mouse/trackpad only) */
  if (finePointer && !reduce) {
    var ring = document.createElement('div'); ring.className = 'fx-ring'; document.body.appendChild(ring);
    var rx = -100, ry = -100, cx2 = -100, cy2 = -100;
    addEventListener('pointermove', function (e) {
      cx2 = e.clientX; cy2 = e.clientY; ring.classList.add('on');
      var t = e.target;
      ring.classList.toggle('text', !!t.closest('input, textarea'));
      ring.classList.toggle('big', !t.closest('input, textarea') && !!t.closest('a, button, [data-open], select, label'));
    }, { passive: true });
    document.addEventListener('pointerleave', function () { ring.classList.remove('on'); });
    (function loop() { rx += (cx2 - rx) * 0.22; ry += (cy2 - ry) * 0.22; ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)'; requestAnimationFrame(loop); })();

    document.addEventListener('pointermove', function (e) {
      var b = e.target.closest && e.target.closest('.btn-rose, .ic-launch');
      document.querySelectorAll('.fx-mag').forEach(function (m) { if (m !== b) { m.style.transform = ''; m.classList.remove('fx-mag'); } });
      if (!b) return;
      var r = b.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      b.classList.add('fx-mag'); b.style.transform = 'translate(' + dx * 0.18 + 'px,' + dy * 0.25 + 'px)';
    }, { passive: true });
  }
})();
