/* Sample 6: 3D character models. A small viewer for finished character models (glTF files in assets/models):
   pick a model, drag to turn it, zoom, switch between Shaded, Clay and Wireframe, play the animations a model carries.
   The glTF loader is only fetched, and a model only downloaded, when it is picked. Registered with js/samples.js. */
(function () {
  'use strict';
  if (!window.IFFY_SAMPLES) return;
  var WA = 'https://wa.me/2348075889359?text=', H = 2.3;
  var MODELS = [
    { id: 'runner', name: 'Rigged runner', file: 'assets/models/runner.glb', mb: 2.5, src: 'CGTrader', blurb: 'A rigged character with four animations. Pick one below.' },
    { id: 'ahsoka', name: 'Ahsoka Tano', file: 'assets/models/ahsoka.glb', mb: 3.8, src: 'CGTrader', blurb: 'A fully textured, game-ready character.', note: 'Fan art. Ahsoka Tano is a character owned by Lucasfilm and Disney.' },
    { id: 'knight', name: 'Knighty', file: 'assets/models/knight.glb', mb: 1.9, src: 'CGTrader', blurb: 'A high-poly sculpt. For the web it is thinned from about 1.5 million triangles to about 100,000.' },
    { id: 'harpy', name: 'Harpy', file: 'assets/models/harpy.glb', mb: 2.8, src: 'Free3D', blurb: 'A game-ready character with colour and normal maps.' },
    { id: 'anime', name: 'Anime character', file: 'assets/models/anime.glb', mb: .5, src: 'Free3D', blurb: 'A light anime-style character.' }
  ];

  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt) e.textContent = txt; return e; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function fmt(n) { return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  var loaderReady = null;
  function loadLoader() {   // the glTF loader is a separate file, fetched the first time a model is picked
    if (window.THREE && THREE.GLTFLoader) return Promise.resolve();
    if (!loaderReady) loaderReady = new Promise(function (res, rej) {
      var s = document.createElement('script'); s.src = 'vendor/GLTFLoader.js'; s.onload = res; s.onerror = function () { loaderReady = null; rej(new Error('loader')); };
      document.head.appendChild(s);
    });
    return loaderReady;
  }

  IFFY_SAMPLES.add({ id: 'models', tab: '3D models', mount: function (ctx) {
    var THREE = ctx.THREE, scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(30, 1.4, .1, 120), spin = new THREE.Group(), stage = document.getElementById('smp-stage');
    scene.add(spin);
    function lin(h) { return new THREE.Color(h).convertSRGBToLinear(); }

    // lighting: a small studio baked into an environment map, plus a key light for definition
    function makeEnv() {
      var es = new THREE.Scene(); es.background = new THREE.Color(0x1e1a18);
      [[0xfff2e0, 3.4, [0, 6.5, 5], [7, 1.2, 7]], [0xe9edff, .9, [-7, 1.5, 3], [1.2, 4, 4]], [0xff8a2a, 3, [6.5, 2, -3.5], [1.5, 4, 4]], [0xffe8d0, 2.2, [-6, 2.5, -4], [1.5, 4, 4]], [0xb9a98f, .55, [0, -4, 2], [6, .6, 6]]].forEach(function (l) {
        var m = new THREE.Mesh(new THREE.BoxGeometry(l[3][0], l[3][1], l[3][2]), new THREE.MeshBasicMaterial({ color: new THREE.Color(l[0]).multiplyScalar(l[1]) }));
        m.position.set(l[2][0], l[2][1], l[2][2]); es.add(m);
      });
      return ctx.pmrem.fromScene(es, .04).texture;
    }
    var env = makeEnv(); scene.environment = env;
    var key = new THREE.DirectionalLight(0xfff0dc, .7); key.position.set(3, 6, 5); scene.add(key);
    scene.add(new THREE.HemisphereLight(0xffe8d0, 0x2a1408, .28));

    // a low deck under the model, a thin ember ring and a soft shadow
    var deck = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, .05, 72), new THREE.MeshStandardMaterial({ color: lin('#1b1009'), roughness: .55, metalness: .35 }));
    deck.position.y = -.026; scene.add(deck);
    var ring = new THREE.Mesh(new THREE.TorusGeometry(1.4, .014, 8, 96).rotateX(Math.PI / 2), new THREE.MeshBasicMaterial({ color: lin('#ff8a2a') }));
    ring.position.y = .002; scene.add(ring);
    var sc = document.createElement('canvas'); sc.width = sc.height = 64;
    var sx = sc.getContext('2d'), sg = sx.createRadialGradient(32, 32, 2, 32, 32, 31);
    sg.addColorStop(0, 'rgba(0,0,0,.65)'); sg.addColorStop(.6, 'rgba(0,0,0,.28)'); sg.addColorStop(1, 'rgba(0,0,0,0)'); sx.fillStyle = sg; sx.fillRect(0, 0, 64, 64);
    var blob = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false }));
    blob.position.y = .006; scene.add(blob);

    // state
    var cur = null, items = {}, view = 'shaded', playing = !ctx.still, yaw = .5, yawT = .5, pitch = .12, pitchT = .12, zoom = 1, zoomT = 1, touched = 0, mixer = null, actions = {}, clipName = '', busy = false, active = false, token = 0;
    var clayMat = new THREE.MeshStandardMaterial({ color: lin('#b5a999'), roughness: .85, metalness: 0 });
    var clayMatSkin = new THREE.MeshStandardMaterial({ color: lin('#b5a999'), roughness: .85, metalness: 0, skinning: true });
    var wireMat = new THREE.MeshBasicMaterial({ color: lin('#ffb13b'), wireframe: true, transparent: true, opacity: .6, depthWrite: false });
    var wireMatSkin = new THREE.MeshBasicMaterial({ color: lin('#ffb13b'), wireframe: true, transparent: true, opacity: .6, depthWrite: false, skinning: true });
    var viewW = 1, viewH = 1;

    // side panel
    var ui = el('div', 'smp-ui'), modelBtns = {}, viewBtns = {}, clipBtns = {};
    ui.appendChild(el('h3', '', '3D models'));
    ui.appendChild(el('p', 'tag', 'Character models in glTF, ready for the web. Pick one, drag to turn it, pinch or Ctrl and scroll to zoom.'));
    ui.appendChild(el('p', 'smp-l', 'Model'));
    var gm = el('div', 'smp-g'); ui.appendChild(gm);
    MODELS.forEach(function (m) { var b = el('button', 'smp-b', m.name); b.type = 'button'; b.addEventListener('click', function () { choose(m.id); }); gm.appendChild(b); modelBtns[m.id] = b; });
    ui.appendChild(el('p', 'smp-l', 'View'));
    var gv = el('div', 'smp-g'); ui.appendChild(gv);
    [['shaded', 'Shaded'], ['clay', 'Clay'], ['wire', 'Wireframe']].forEach(function (v) { var b = el('button', 'smp-b', v[1]); b.type = 'button'; b.addEventListener('click', function () { view = v[0]; applyView(); refresh(); }); gv.appendChild(b); viewBtns[v[0]] = b; });
    var animL = el('p', 'smp-l', 'Animation'), animG = el('div', 'smp-g'); ui.appendChild(animL); ui.appendChild(animG);
    var info = el('p', 'smp-now'); info.setAttribute('aria-live', 'polite'); ui.appendChild(info);
    var note = el('p', 'tag'); note.style.fontSize = '.85rem'; ui.appendChild(note);
    var row = el('div', 'row smp-row'), pb = el('button', 'mbtn', ''), cta = el('a', 'btn', 'Order a character like this');
    pb.type = 'button'; pb.addEventListener('click', function () { playing = !playing; refresh(); });
    cta.href = WA + encodeURIComponent('Hi Iffy, I saw your 3D character models and I would like a character like them.'); cta.target = '_blank'; cta.rel = 'noopener';
    row.appendChild(pb); row.appendChild(cta); ui.appendChild(row);
    var loadEl = el('div', 'mdl-load', 'Loading...'); loadEl.hidden = true; stage.appendChild(loadEl);

    function refresh() {
      var it = cur && items[cur.id], i;
      Object.keys(modelBtns).forEach(function (id) { modelBtns[id].setAttribute('aria-pressed', cur && cur.id === id ? 'true' : 'false'); modelBtns[id].disabled = false; });
      Object.keys(viewBtns).forEach(function (v) { viewBtns[v].setAttribute('aria-pressed', v === view ? 'true' : 'false'); });
      animL.hidden = animG.hidden = !(it && it.clips.length);
      Object.keys(clipBtns).forEach(function (c) { clipBtns[c].setAttribute('aria-pressed', c === clipName ? 'true' : 'false'); });
      pb.textContent = playing ? 'Pause' : 'Play'; pb.disabled = !it;
      note.textContent = cur ? (cur.note ? cur.note + ' ' : '') + 'Also on ' + cur.src + '.' : '';
      note.hidden = !cur;
      if (it && !busy) info.textContent = cur.name + ': ' + fmt(it.tris) + ' triangles, ' + it.mats + (it.mats === 1 ? ' material' : ' materials') + (it.bones ? ', ' + it.bones + ' bones' : '') + (it.clips.length ? ', ' + it.clips.length + ' animations' : '') + '. ' + (view === 'shaded' ? 'Shaded' : view === 'clay' ? 'Clay' : 'Wireframe') + '. ' + cur.blurb;
    }

    function setView(root, v) {
      root.traverse(function (o) {
        if (!o.isMesh) return;
        if (!o.userData.orig) o.userData.orig = o.material;
        o.material = v === 'shaded' ? o.userData.orig : v === 'clay' ? (o.isSkinnedMesh ? clayMatSkin : clayMat) : (o.isSkinnedMesh ? wireMatSkin : wireMat);
      });
    }
    function applyView() { if (cur && items[cur.id]) setView(items[cur.id].wrap, view); }

    // the size a skinned character really has is the size of its skinned vertices in the pose the viewer shows first, not of its bind-pose box
    function measure(root, clips) {
      var box = new THREE.Box3(), v = new THREE.Vector3(), mx = null;
      if (clips.length) { mx = new THREE.AnimationMixer(root); mx.clipAction(clips[0]).play(); mx.update(0); }
      root.updateMatrixWorld(true);
      root.traverse(function (o) {
        if (!o.isMesh) return;
        if (o.isSkinnedMesh && o.geometry.attributes.skinIndex) {
          o.skeleton.update();
          var n = o.geometry.attributes.position.count, step = Math.max(1, Math.floor(n / 6000)), i;
          for (i = 0; i < n; i += step) { o.boneTransform(i, v); v.applyMatrix4(o.matrixWorld); box.expandByPoint(v); }
        } else box.expandByObject(o);
      });
      if (mx) { mx.stopAllAction(); mx.uncacheRoot(root); }
      return box;
    }

    function buildItem(m, gltf) {
      var root = gltf.scene, wrap = new THREE.Group(), tris = 0, mats = new Set(), bones = 0, box, size, ctr, k;
      wrap.add(root);
      root.traverse(function (o) {
        if (o.isBone) bones++;
        if (o.isMesh) {
          o.frustumCulled = false;
          var g = o.geometry; tris += g.index ? g.index.count / 3 : g.attributes.position.count / 3;
          (Array.isArray(o.material) ? o.material : [o.material]).forEach(function (mt) { mats.add(mt.uuid); if (mt.map) mt.map.anisotropy = 4; });
        }
      });
      box = measure(root, gltf.animations || []); size = box.getSize(new THREE.Vector3()); ctr = box.getCenter(new THREE.Vector3());
      k = H / Math.max(size.y, size.x * 1.15, size.z * 1.15, 1e-6);
      wrap.scale.setScalar(k); wrap.position.set(-ctr.x * k, -box.min.y * k, -ctr.z * k);
      var item = { wrap: wrap, tris: tris, mats: mats.size, bones: bones, clips: gltf.animations || [], w: size.x * k, d: size.z * k, h: size.y * k };
      return item;
    }

    function show3(id) {   // put the model on the deck
      var it = items[id];
      while (spin.children.length) { var c = spin.children[0]; spin.remove(c); }
      mixer = null; actions = {}; clipName = ''; animG.innerHTML = ''; clipBtns = {};
      spin.add(it.wrap); setView(it.wrap, view);
      if (it.clips.length) {
        mixer = new THREE.AnimationMixer(it.wrap.children[0]);
        it.clips.forEach(function (clip) {
          actions[clip.name] = mixer.clipAction(clip);
          var b = el('button', 'smp-b', clip.name); b.type = 'button'; b.addEventListener('click', function () { playClip(clip.name); playing = true; refresh(); });
          animG.appendChild(b); clipBtns[clip.name] = b;
        });
        playClip(it.clips[0].name);
      }
      yawT = yaw = .5; zoom = zoomT = 1; touched = 0; fitCam(it);
    }
    function playClip(name) {
      if (!actions[name]) return;
      var prev = actions[clipName], once = /^sit/i.test(name); clipName = name;   // sitting down plays once and stays seated; the others loop
      actions[name].setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat, Infinity); actions[name].clampWhenFinished = once;
      var a = actions[name].reset().setEffectiveWeight(1).play();
      if (prev && prev !== a) a.crossFadeFrom(prev, .25, false);
      refresh();
    }
    function fitCam(it) {
      var t = Math.tan(cam.fov * Math.PI / 360), aspect = viewW / viewH, dH = (it.h * .5 * 1.55) / t, dW = (Math.max(it.w, it.d) * .5 * 1.3) / (t * aspect);
      cam.userData.dist = Math.max(dH, dW) + Math.max(it.d, it.w) * .5; cam.userData.ty = it.h * .5;
    }

    function choose(id) {
      var m = MODELS.filter(function (x) { return x.id === id; })[0]; if (!m) return;
      cur = m; var my = ++token; refresh();
      if (items[id]) { show3(id); refresh(); return; }
      busy = true; loadEl.hidden = false; loadEl.textContent = 'Loading ' + m.name + '...'; info.textContent = 'Loading ' + m.name + ' (about ' + m.mb + ' MB)...';
      loadLoader().then(function () {
        return new Promise(function (res, rej) {
          new THREE.GLTFLoader().load(m.file, res, function (e) { if (e.lengthComputable && my === token) { var p = Math.round(e.loaded / e.total * 100); loadEl.textContent = 'Loading ' + m.name + ' ' + p + '%'; } }, function () { rej(new Error('model')); });
        });
      }).then(function (gltf) {
        busy = false; loadEl.hidden = true;
        items[id] = buildItem(m, gltf);
        if (my === token) { show3(id); } refresh();
      }).catch(function () {
        busy = false; loadEl.hidden = true;
        if (my === token) info.textContent = 'Could not load ' + m.name + ' here. Check the connection and pick it again.';
      });
    }

    function update(t, dt) {
      if (mixer && playing) mixer.update(dt);
      if (playing && performance.now() - touched > 3500) yawT += dt * .45;
      yaw += (yawT - yaw) * Math.min(1, dt * 9); pitch += (pitchT - pitch) * Math.min(1, dt * 9); zoom += (zoomT - zoom) * Math.min(1, dt * 9);
      spin.rotation.y = yaw;
      var d = (cam.userData.dist || 6) / zoom, ty = cam.userData.ty || 1.1;
      cam.position.set(0, ty + Math.sin(pitch) * d, Math.cos(pitch) * d); cam.lookAt(0, ty, 0);
    }
    function resize(w, h) { viewW = w; viewH = h; cam.aspect = w / h; cam.updateProjectionMatrix(); if (cur && items[cur.id]) fitCam(items[cur.id]); }

    function show() { active = true; loadEl.hidden = !busy; if (!cur) choose(MODELS[0].id); }
    function hide() { active = false; loadEl.hidden = true; }
    refresh(); info.textContent = 'Pick a model.';
    return {
      ui: ui, scene: scene, camera: cam, update: update, resize: resize, show: show, hide: hide,
      drag: function (dx, dy) { yawT += dx * .012; pitchT = clamp(pitchT + dy * .005, -.15, .6); touched = performance.now(); },
      pinch: function (f) { zoomT = clamp(zoomT * f, .6, 2.6); },
      reset: function () { zoomT = 1; yawT = .5; pitchT = .12; touched = 0; },
      restore: function (pm) { env = makeEnv(); scene.environment = env; Object.keys(items).forEach(function (id) { items[id].wrap.traverse(function (o) { if (o.isMesh) (Array.isArray(o.material) ? o.material : [o.material]).forEach(function (mt) { mt.needsUpdate = true; }); }); }); },
      hint: matchMedia('(pointer:coarse)').matches ? 'Drag to turn, pinch to zoom' : 'Drag to turn. Ctrl and scroll to zoom. Double click to reset.',
      dbg: function () { return { cur: cur && cur.id, busy: busy, loaded: Object.keys(items), view: view, playing: playing, clip: clipName, tris: cur && items[cur.id] ? Math.round(items[cur.id].tris) : 0, calls: ctx.renderer.info.render.calls, frameTris: ctx.renderer.info.render.triangles }; }
    };
  } });
})();
