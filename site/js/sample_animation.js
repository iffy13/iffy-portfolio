/* Sample 1: game animation. The six Naija Life characters on one shared skeleton, ten clips.
   Pick a character (or all six) and a clip, drag the stage to turn the view. Registered with js/samples.js. */
(function () {
  'use strict';
  if (!window.IFFY_SAMPLES || !window.IFFY_CAST) return;
  var D = 10, WA = 'https://wa.me/2348075889359?text=';
  var LABEL = { idle: 'Idle', walk: 'Walk', run: 'Run', wave: 'Wave', talk: 'Talk', dance: 'Dance', celebrate: 'Celebrate', wahala: 'Wahala', phone: 'Phone call', greet: 'Greet' };
  var WHO = ['Conductor', 'Designer', 'Trader', 'Textile trader', 'Oil technician', 'Corps member'];
  var SPEED = { walk: 1.3, run: 3.4 };   // metres per second the floor slides past, so walking and running read as travel

  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt) e.textContent = txt; return e; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  IFFY_SAMPLES.add({ id: 'animation', tab: 'Game animation', mount: function (ctx) {
    var THREE = ctx.THREE, scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(30, 1.6, .1, 120), pivot = new THREE.Group();
    cam.position.set(0, .4, D); cam.lookAt(0, 0, 0); scene.add(pivot);
    var cast = IFFY_CAST.create(THREE, { pmrem: ctx.pmrem, scale: 1 });
    pivot.add(cast.group); cast.setMode('manual');

    // floor: a grid that slides while the characters walk or run, plus a soft glow under them
    var U = { uOff: { value: 0 }, uCell: { value: 2 }, uR: { value: 9 }, uCol: { value: new THREE.Color(0xffb13b) } };
    var floor = new THREE.Mesh(new THREE.PlaneGeometry(44, 44).rotateX(-Math.PI / 2), new THREE.ShaderMaterial({
      uniforms: U, transparent: true, depthWrite: false, extensions: { derivatives: true },
      vertexShader: 'varying vec2 vP;void main(){vP=position.xz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader: 'uniform float uOff,uCell,uR;uniform vec3 uCol;varying vec2 vP;void main(){vec2 p=(vP+vec2(0.,uOff))/uCell;vec2 g=abs(fract(p-.5)-.5)/max(fwidth(p),vec2(.0001));float l=1.-min(min(g.x,g.y),1.);float f=1.-smoothstep(uR*.3,uR,length(vP));gl_FragColor=vec4(uCol,l*.55*f);}'
    }));
    pivot.add(floor);
    var gc = document.createElement('canvas'); gc.width = gc.height = 128;
    var gx = gc.getContext('2d'), gg = gx.createRadialGradient(64, 64, 4, 64, 64, 62);
    gg.addColorStop(0, 'rgba(255,150,50,.6)'); gg.addColorStop(.5, 'rgba(255,110,30,.18)'); gg.addColorStop(1, 'rgba(255,100,20,0)');
    gx.fillStyle = gg; gx.fillRect(0, 0, 128, 128);
    var glow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(gc), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    pivot.add(glow);

    // state
    var who = 'all', clip = ctx.still ? 'idle' : 'dance', playing = !ctx.still, tt = 0, yaw = 0, yawT = 0, zoom = 1, curS = 1, targetS = 1, touched = 0, mx = 0, my = 0, tx = 0, ty = 0, sized = false;
    addEventListener('pointermove', function (e) { tx = e.clientX / innerWidth - .5; ty = e.clientY / innerHeight - .5; }, { passive: true });

    function fit() {
      var vh = 2 * D * Math.tan(cam.fov * Math.PI / 360), vw = vh * cam.aspect;
      targetS = (who === 'all' ? Math.min(.94 * vw / 4.1, .86 * vh / 2.3) : Math.min(.78 * vh / 2.05, .92 * vw / 1.2)) * zoom;
    }

    // side panel
    var ui = el('div', 'smp-ui'), inf = cast.info(), whoBtns = [], clipBtns = {};
    ui.appendChild(el('h3', '', 'Game animation'));
    ui.appendChild(el('p', 'tag', 'Six rigged game characters on one shared skeleton, with ten clips. Pick a character and a clip, then drag the stage to turn the view.'));
    var chips = el('p', 'chips');
    [inf.bones + ' bones', 'one skinned mesh each', 'about ' + (Math.round(inf.trianglesEach / 100) / 10) + 'k triangles each', inf.clips + ' clips'].forEach(function (s) { chips.appendChild(el('span', '', s)); });
    ui.appendChild(chips);

    ui.appendChild(el('p', 'smp-l', 'Character'));
    var gw = el('div', 'smp-g'); ui.appendChild(gw);
    WHO.concat(['All six']).forEach(function (n, i) {
      var b = el('button', 'smp-b', n), key = i === 6 ? 'all' : i; b.type = 'button';
      b.addEventListener('click', function () { setWho(key); });
      gw.appendChild(b); whoBtns.push([key, b]);
    });
    ui.appendChild(el('p', 'smp-l', 'Clip'));
    var gcp = el('div', 'smp-g'); ui.appendChild(gcp);
    cast.clips.forEach(function (c) {
      var b = el('button', 'smp-b', LABEL[c] || c); b.type = 'button';
      b.addEventListener('click', function () { setClip(c); });
      gcp.appendChild(b); clipBtns[c] = b;
    });
    var now = el('p', 'smp-now'); now.setAttribute('aria-live', 'polite'); ui.appendChild(now);
    var row = el('div', 'row smp-row'), pb = el('button', 'mbtn', ''); pb.type = 'button';
    pb.addEventListener('click', function () { playing = !playing; refresh(); });
    var cta = el('a', 'btn', 'Order something like this'); cta.href = WA + encodeURIComponent('Hi Iffy, I saw your game animation sample and I would like something like it.'); cta.target = '_blank'; cta.rel = 'noopener';
    row.appendChild(pb); row.appendChild(cta); ui.appendChild(row);

    function refresh() {
      whoBtns.forEach(function (p) { p[1].setAttribute('aria-pressed', p[0] === who ? 'true' : 'false'); });
      Object.keys(clipBtns).forEach(function (c) { clipBtns[c].setAttribute('aria-pressed', c === clip ? 'true' : 'false'); });
      pb.textContent = playing ? 'Pause' : 'Play';
      now.textContent = (playing ? 'Playing: ' : 'Paused: ') + (LABEL[clip] || clip) + ', ' + (who === 'all' ? 'all six' : WHO[who].toLowerCase());
    }
    function setWho(w) { who = w; cast.solo(w === 'all' ? null : w); yawT = w === 'all' ? 0 : -.5; touched = 0; fit(); refresh(); }
    function setClip(c) { clip = c; playing = true; cast.play(c, 'all'); refresh(); }
    cast.play(clip, 'all'); refresh();

    function update(t, dt) {
      if (playing) tt += dt;
      curS += (targetS - curS) * Math.min(1, dt * 7);
      cast.setFit(curS);
      var feet = -(who === 'all' ? 1.12 : 1) * curS;
      cast.group.position.y = floor.position.y = feet; glow.position.y = feet + .01;
      glow.scale.setScalar(curS * 4.4); U.uCell.value = curS; U.uR.value = 3.4 * curS + 2;
      if (playing) U.uOff.value += (SPEED[clip] || 0) * curS * dt;
      if (who !== 'all' && playing && !SPEED[clip] && performance.now() - touched > 3500) yawT += dt * .35;
      yaw += (yawT - yaw) * Math.min(1, dt * 10); pivot.rotation.y = yaw;
      mx += (tx - mx) * .06; my += (ty - my) * .06;
      cast.update(tt, { x: mx, y: my }, dt);
    }
    function resize(w, h) {
      cam.aspect = w / h; cam.updateProjectionMatrix();
      if (!sized) { sized = true; if (w / h < 1) setWho(1); else { yawT = 0; } curS = targetS = 1; }
      fit();
    }

    return {
      ui: ui, scene: scene, camera: cam, update: update, resize: resize,
      drag: function (dx) { yawT += dx * .012; touched = performance.now(); },
      pinch: function (f) { zoom = clamp(zoom * f, .55, 1.9); fit(); },
      reset: function () { zoom = 1; yawT = who === 'all' ? 0 : -.5; touched = 0; fit(); },
      restore: function (pm) { cast.restore(pm); },
      hint: matchMedia('(pointer:coarse)').matches ? 'Drag to turn, pinch to zoom' : 'Drag to turn. Ctrl and scroll to zoom. Double click to reset.'
    };
  } });
})();
