/* Home page behaviour (the #top page). Core wiring only: samples rail, opening a sample from a card, in-page scroll links.
   Motion lives in the home_*.js files, which use window.HOME.when(fn) to start once the loader is gone and the home page is open. */
(function () {
  'use strict';
  var top = document.getElementById('top');
  if (!top) return;
  var calm = matchMedia('(prefers-reduced-motion:reduce)').matches;
  var queue = [], started = false;

  var HOME = window.HOME = {
    calm: calm,
    top: top,
    /* run fn once (after the loader is gone and the home page is the open page) */
    when: function (fn) { if (started) { try { fn(HOME); } catch (e) { if (window.console) console.error(e); } } else queue.push(fn); },
    isOpen: function () { return document.documentElement.dataset.page === 'home' && top.classList.contains('cur'); },
    q: function (sel, root) { return (root || top).querySelector(sel); },
    qa: function (sel, root) { return [].slice.call((root || top).querySelectorAll(sel)); }
  };
  function start() {
    if (started || !document.body.classList.contains('ready')) return;
    started = true;
    queue.splice(0).forEach(function (fn) { try { fn(HOME); } catch (e) { if (window.console) console.error(e); } });
  }
  new MutationObserver(start).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  start();
  setTimeout(start, 6500);

  /* a sample card opens that sample on the Samples page */
  top.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-sample]');
    if (a && window.IFFY_SAMPLES && IFFY_SAMPLES.open) IFFY_SAMPLES.open(a.getAttribute('data-sample'));
  });
  /* links that scroll inside the home page (the router owns the page hashes) */
  top.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-scroll]');
    if (!a) return;
    var t = document.getElementById(a.getAttribute('data-scroll'));
    if (!t) return;
    e.preventDefault();
    if (window.LN && !calm) LN.scrollTo(t, { offset: -80 }); else t.scrollIntoView({ behavior: calm ? 'auto' : 'smooth' });
  });

  /* samples rail: arrow buttons and mouse drag (a drag never counts as a click on a card) */
  var rail = document.getElementById('hm-rail');
  if (rail) {
    HOME.qa('[data-dir]').forEach(function (b) {
      b.addEventListener('click', function () {
        var c = rail.querySelector('.e-sc');
        rail.scrollBy({ left: b.getAttribute('data-dir') * ((c ? c.offsetWidth : 300) + 24) * 2, behavior: calm ? 'auto' : 'smooth' });
      });
    });
    var down = false, moved = false, sx = 0, sl = 0;
    rail.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse' || e.button !== 0) return; down = true; moved = false; sx = e.clientX; sl = rail.scrollLeft; });
    addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - sx; if (!moved && Math.abs(dx) > 6) { moved = true; rail.classList.add('e-drag'); } if (moved) rail.scrollLeft = sl - dx; });
    addEventListener('pointerup', function () { if (!down) return; down = false; rail.classList.remove('e-drag'); });
    rail.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
  }
})();
