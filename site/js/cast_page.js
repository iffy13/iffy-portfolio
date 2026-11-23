/* Live 3D cast for the hero of the 3D service page (#3d).
   A small WebGL canvas of its own: created on the first visit to the page, drawn only while the page
   is open and on screen. The image cube stays exactly as it was; the cast stands in front of it.
   Needs three.js and js/cast_3d.js. If WebGL is not available the page simply keeps the cube. */
(function () {
  'use strict';
  var page = document.getElementById('p-3d'), stage = page && page.querySelector('.stage');
  if (!stage || !window.THREE || !window.IFFY_CAST) return;
  var D = 10, still = matchMedia('(prefers-reduced-motion:reduce)').matches;
  var cv, r, sc, cam, cast, pm, booted = 0, failed = 0, lost = false, running = false, onScreen = true;
  var raf = 0, mx = 0, my = 0, tx = 0, ty = 0, t0 = 0;

  function draw() { if (r && !lost) r.render(sc, cam); }

  function size() {
    var w = cv.clientWidth, h = cv.clientHeight;
    if (!w || !h) return;
    r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix();
    var vh = 2 * D * Math.tan(cam.fov * Math.PI / 360), s = Math.min(.94 * vh * cam.aspect / 4.1, .9 * vh / 2.3);
    cast.setFit(s); cast.group.position.y = -1.12 * s;   // the whole cast fits, feet near the bottom edge
    draw();
  }

  function boot() {
    if (booted || failed) return;
    booted = 1;
    try {
      cv = document.createElement('canvas'); cv.className = 'cast3d'; cv.setAttribute('aria-hidden', 'true');
      stage.appendChild(cv); stage.classList.add('live');
      r = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true });
      r.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5)); r.outputEncoding = THREE.sRGBEncoding; r.setClearColor(0x000000, 0);
      cam = new THREE.PerspectiveCamera(30, 1.8, .1, 80); cam.position.set(0, .25, D); cam.lookAt(0, 0, 0);
      sc = new THREE.Scene(); pm = new THREE.PMREMGenerator(r);
      cast = IFFY_CAST.create(THREE, { pmrem: pm, scale: 1 }); sc.add(cast.group);
      cv.addEventListener('webglcontextlost', function (e) { e.preventDefault(); lost = true; });
      cv.addEventListener('webglcontextrestored', function () { cast.restore(pm); lost = false; draw(); });
      if (window.ResizeObserver) new ResizeObserver(size).observe(cv); else addEventListener('resize', size);
      addEventListener('pointermove', function (e) { tx = e.clientX / innerWidth - .5; ty = e.clientY / innerHeight - .5; }, { passive: true });
      t0 = performance.now();
      size();
      if (still) { cast.update(.6, null); draw(); }
    } catch (e) {
      failed = 1; if (cv && cv.parentNode) cv.parentNode.removeChild(cv); stage.classList.remove('live');
    }
  }

  function frame(now) {
    raf = 0;
    if (!running) return;
    mx += (tx - mx) * .06; my += (ty - my) * .06;
    cast.update((now - t0) / 1000, { x: mx, y: my });
    draw();
    raf = requestAnimationFrame(frame);
  }

  // Run only while the page is the open one, the loader is gone, the stage is on screen and the tab is visible.
  function sync() {
    var on = page.classList.contains('cur') && document.body.classList.contains('ready') && onScreen && !document.hidden;
    if (!on) { running = false; if (raf) { cancelAnimationFrame(raf); raf = 0; } return; }
    if (!booted) boot();
    if (failed || still || running) return;
    running = true; raf = requestAnimationFrame(frame);
  }
  new MutationObserver(sync).observe(page, { attributes: true, attributeFilter: ['class'] });
  new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('visibilitychange', sync);
  if (window.IntersectionObserver) new IntersectionObserver(function (e) { onScreen = e[e.length - 1].isIntersecting; sync(); }).observe(stage);
  sync();
})();
