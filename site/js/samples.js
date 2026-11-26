/* Live samples page (#samples). One WebGL stage is shared by every sample.
   A sample registers itself with IFFY_SAMPLES.add({ id, tab, mount(ctx) }). mount() returns
   { ui, scene, camera, update(t, dt), resize(w, h), drag(dx, dy), pinch(f), reset(), restore(pmrem), show(), hide(), hint }.
   The stage starts on the first visit to the page and draws only while the page is open and on screen.
   Without WebGL the page just says so. Needs three.js. */
(function () {
  'use strict';
  var list = [], inst = [], cur = -1, ready = false;
  window.IFFY_SAMPLES = { add: function (d) { list.push(d); if (ready) { tabsRender(); if (cur < 0) select(0); } } };

  var page = document.getElementById('p-samples'), stage = document.getElementById('smp-stage'), side = document.getElementById('smp-side');
  var tabs = document.getElementById('smp-tabs'), hintEl = document.getElementById('smp-hint');
  if (!page || !stage || !side || !tabs || !window.THREE) return;

  var cv, r, pm, ctx, booted = 0, failed = 0, lost = false, running = false, onScreen = true, raf = 0, t0 = 0, lastNow = 0;
  var still = matchMedia('(prefers-reduced-motion:reduce)').matches;

  function tabsRender() {
    tabs.innerHTML = ''; tabs.hidden = list.length < 2;
    list.forEach(function (d, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'smp-b'; b.textContent = d.tab; b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', i === cur ? 'true' : 'false');
      b.setAttribute('aria-pressed', i === cur ? 'true' : 'false');
      b.addEventListener('click', function () { select(i); });
      tabs.appendChild(b);
    });
  }

  function size() {
    if (!r) return;
    var w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    r.setSize(w, h, false);
    var a = inst[cur]; if (a && a.resize) a.resize(w, h);
  }

  function select(i) {
    if (!list[i] || i === cur) return;
    if (!inst[i]) {
      try { inst[i] = list[i].mount(ctx); }
      catch (e) { inst[i] = null; side.textContent = 'This sample could not start here.'; return; }
    }
    if (inst[cur] && inst[cur].hide) inst[cur].hide();
    cur = i;
    var a = inst[i];
    side.innerHTML = ''; side.appendChild(a.ui);
    hintEl.textContent = a.hint || '';
    tabsRender();
    if (a.show) a.show();
    size();
  }

  function boot() {
    if (booted || failed) return;
    booted = 1;
    try {
      cv = document.createElement('canvas'); cv.className = 'smp-cv'; cv.setAttribute('aria-hidden', 'true');
      stage.insertBefore(cv, stage.firstChild);
      r = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true });
      r.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75)); r.outputEncoding = THREE.sRGBEncoding; r.setClearColor(0x000000, 0);
      pm = new THREE.PMREMGenerator(r);
      ctx = { THREE: THREE, renderer: r, pmrem: pm, still: still };
      cv.addEventListener('webglcontextlost', function (e) { e.preventDefault(); lost = true; });
      cv.addEventListener('webglcontextrestored', function () { inst.forEach(function (a) { if (a && a.restore) a.restore(pm); }); lost = false; });
      if (window.ResizeObserver) new ResizeObserver(size).observe(stage); else addEventListener('resize', size);
      ready = true; t0 = performance.now();
      tabsRender(); if (list.length) select(0);
      size();
    } catch (e) {
      failed = 1; stage.classList.add('off'); stage.insertAdjacentHTML('beforeend', '<p class="smp-off">Live samples need WebGL, and this browser does not offer it.</p>');
      if (cv && cv.parentNode) cv.parentNode.removeChild(cv);
    }
  }

  function frame(now) {
    raf = 0;
    if (!running) return;
    var dt = Math.min(.05, (now - (lastNow || now)) / 1000); lastNow = now;
    var a = inst[cur];
    if (a && !lost) { a.update((now - t0) / 1000, dt); r.render(a.scene, a.camera); }
    raf = requestAnimationFrame(frame);
  }

  // Run only while the page is open, the loader is gone, the stage is on screen and the tab is visible.
  function sync() {
    var on = page.classList.contains('cur') && document.body.classList.contains('ready') && onScreen && !document.hidden;
    if (!on) { running = false; lastNow = 0; if (raf) { cancelAnimationFrame(raf); raf = 0; } return; }
    if (!booted) boot();
    if (failed || running) return;
    running = true; raf = requestAnimationFrame(frame);
  }

  // Drag to turn, pinch or Ctrl and scroll to zoom, double click to reset. Vertical swipes still scroll the page.
  var ptrs = {}, pinchD = 0;
  stage.addEventListener('pointerdown', function (e) {
    try { stage.setPointerCapture(e.pointerId); } catch (x) {}
    ptrs[e.pointerId] = [e.clientX, e.clientY]; pinchD = 0; stage.classList.add('drag');
  });
  stage.addEventListener('pointermove', function (e) {
    var p = ptrs[e.pointerId]; if (!p) return;
    var ids = Object.keys(ptrs), a = inst[cur];
    if (ids.length === 2) {
      var o = ptrs[ids[0] === String(e.pointerId) ? ids[1] : ids[0]], d = Math.hypot(e.clientX - o[0], e.clientY - o[1]);
      if (pinchD && a && a.pinch) a.pinch(d / pinchD);
      pinchD = d;
    } else if (a && a.drag) a.drag(e.clientX - p[0], e.clientY - p[1]);
    p[0] = e.clientX; p[1] = e.clientY;
  });
  function release(e) { delete ptrs[e.pointerId]; pinchD = 0; if (!Object.keys(ptrs).length) stage.classList.remove('drag'); }
  stage.addEventListener('pointerup', release); stage.addEventListener('pointercancel', release);
  stage.addEventListener('wheel', function (e) { if (!e.ctrlKey) return; e.preventDefault(); var a = inst[cur]; if (a && a.pinch) a.pinch(Math.exp(-e.deltaY * .01)); }, { passive: false });
  stage.addEventListener('dblclick', function () { var a = inst[cur]; if (a && a.reset) a.reset(); });

  new MutationObserver(sync).observe(page, { attributes: true, attributeFilter: ['class'] });
  new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('visibilitychange', sync);
  if (window.IntersectionObserver) new IntersectionObserver(function (e) { onScreen = e[e.length - 1].isIntersecting; sync(); }).observe(stage);
  sync();
})();
