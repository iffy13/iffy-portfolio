/* Sample 2: Roblox-style animation pack. A blocky six-part avatar (head, torso, two arms, two legs: the idea behind
   the R6 rig) with twelve animations: movement, combat and emotes. Built from scratch for this site, so it is not a
   Roblox asset and uses no Roblox logo, face or texture. Registered with js/samples.js. */
(function () {
  'use strict';
  if (!window.IFFY_SAMPLES) return;
  var PI = Math.PI, WA = 'https://wa.me/2348075889359?text=';
  var CLIPS = [['idle', 'Idle'], ['walk', 'Walk'], ['run', 'Run'], ['jump', 'Jump'], ['climb', 'Climb'], ['slash', 'Sword slash'], ['punch', 'Punch'], ['block', 'Block'], ['dance', 'Dance'], ['wave', 'Wave'], ['cheer', 'Cheer'], ['point', 'Point']];
  var OUTFITS = [
    ['Orange', { shirt: '#ff7a1a', pants: '#26324a', skin: '#d9a273', cap: '#1b1b22' }],
    ['Navy', { shirt: '#2f4b9b', pants: '#1d1f26', skin: '#8c5b3d', cap: '#ff7a1a' }],
    ['Mint', { shirt: '#2fa88a', pants: '#3a2f55', skin: '#f0c9a0', cap: '#f2c230' }],
    ['Violet', { shirt: '#7a45c8', pants: '#2b2b33', skin: '#5d3a27', cap: '#e8731f' }]
  ];
  var SPEED = { walk: 3.2, run: 7.5 };   // studs per second the floor slides past
  var KEYS = ['y', 'ty', 'lean', 'hx', 'hy', 'aLx', 'aLz', 'aRx', 'aRz', 'lLx', 'lLz', 'lRx', 'lRz', 'face', 'tz'];

  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt) e.textContent = txt; return e; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function P(o) {
    var r = { y: 0, ty: 0, lean: 0, hx: 0, hy: 0, aLx: 0, aLz: .1, aRx: 0, aRz: -.1, lLx: 0, lLz: .03, lRx: 0, lRz: -.03, face: 0, tz: 0, sword: false, ladder: false }, k;
    for (k in o) r[k] = o[k];
    return r;
  }

  // Each animation returns the target pose for time t (seconds). Arms and legs swing about x (forward is negative) and out about z.
  var ANIM = {
    idle: function (t) { var b = Math.sin(t * 1.6); return P({ aLx: b * .05, aRx: -b * .05, hx: b * .03, hy: Math.sin(t * .7) * .14, lean: b * .012 }); },
    walk: function (t) { var p = t * 6.2, s = Math.sin(p); return P({ y: Math.abs(Math.cos(p)) * .12, aLx: s * .75, aRx: -s * .75, lLx: -s * .8, lRx: s * .8, ty: s * .12 }); },
    run: function (t) { var p = t * 10.5, s = Math.sin(p); return P({ y: Math.abs(s) * .3, aLx: s * 1.25, aRx: -s * 1.25, lLx: -s * 1.2, lRx: s * 1.2, ty: s * .2, lean: .28, hx: -.18 }); },
    jump: function (t) {
      var u = (t % 1.5) / 1.5, y = 0, up = 0, crouch = 0;
      if (u < .2) { crouch = Math.sin(u / .2 * PI); y = -crouch * .5; }
      else if (u < .75) { y = Math.sin((u - .2) / .55 * PI) * 1.7; up = 1; }
      else { crouch = Math.sin((u - .75) / .25 * PI) * .6; y = -crouch * .4; }
      return P({ y: y, aLx: -.2 + crouch * .9, aLz: .1 + up * 2.4, aRx: -.2 + crouch * .9, aRz: -.1 - up * 2.4, lLx: -crouch * .6, lRx: -crouch * .6, lLz: .1 + up * .25, lRz: -.1 - up * .25, lean: crouch * .15 });
    },
    climb: function (t) { var p = t * 4.2, s = Math.sin(p); return P({ y: Math.abs(Math.cos(p)) * .06, aLx: -2.6 + s * .55, aRx: -2.6 - s * .55, aLz: .18, aRz: -.18, lLx: -Math.cos(p) * .6 - .15, lRx: Math.cos(p) * .6 - .15, ty: s * .08, face: PI, ladder: true }); },
    slash: function (t) {
      var u = (t % 1.2) / 1.2, a;
      if (u < .35) a = -2.7 * (u / .35);                       // wind up: the arm swings overhead
      else if (u < .55) a = -2.7 + 2.5 * ((u - .35) / .2);     // slash down
      else if (u < .85) a = -.2;                                // follow through
      else a = -.2 + .2 * ((u - .85) / .15);                    // back to guard
      return P({ aRx: a, aRz: -.12, aLx: .3, aLz: .5, lLx: -.5, lRx: .4, ty: u < .35 ? .2 : -.3, lean: .12, y: -.1, sword: true, hx: .08 });
    },
    punch: function (t) {
      var u = (t % 1.2) / 1.2, right = u < .5, v = (right ? u : u - .5) / .5, e = Math.sin(clamp(v, 0, 1) * PI);
      return P({ aRx: right ? -.5 - e * 1.1 : -1.25, aRz: right ? -.12 : -.35, aLx: right ? -1.25 : -.5 - e * 1.1, aLz: right ? .35 : .12, ty: right ? -e * .35 : e * .35, lLx: -.35, lRx: .3, lean: .1, y: -.12, hx: .05 });
    },
    block: function (t) { var b = Math.sin(t * 2.2); return P({ aLx: -1.4, aLz: -.5, aRx: -1.4, aRz: .5, lLz: .18, lRz: -.18, y: -.28 + b * .03, lean: .12, hx: .1 }); },
    dance: function (t) { var p = t * 7, s = Math.sin(p); return P({ y: Math.abs(s) * .3, aLx: -1.2 - s * 1.4, aRx: -1.2 + s * 1.4, aLz: .35, aRz: -.35, lLx: -Math.max(0, s) * .45, lRx: -Math.max(0, -s) * .45, lLz: .12, lRz: -.12, ty: s * .3, tz: s * .08, hy: s * .25 }); },
    wave: function (t) { return P({ aRx: -.2, aRz: -(2.4 + Math.sin(t * 9) * .35), aLx: 0, hy: .15, ty: -.1, lean: .02 }); },
    cheer: function (t) { var b = Math.abs(Math.sin(t * 6)); return P({ y: b * .35, aLx: -.1, aLz: 2.6, aRx: -.1, aRz: -2.6, lLz: .12, lRz: -.12, hx: -.12 }); },
    point: function (t) { var b = Math.sin(t * 3); return P({ aRx: -1.57 + b * .05, aRz: -.08, aLx: .05, aLz: .4, hy: -.18, ty: -.12, lean: .05 }); }
  };

  IFFY_SAMPLES.add({ id: 'roblox', tab: 'Roblox style', mount: function (ctx) {
    var THREE = ctx.THREE, scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(30, 1.6, .1, 220), world = new THREE.Group();
    scene.add(world);
    function col(hex) { return new THREE.Color(hex).convertSRGBToLinear(); }
    scene.add(new THREE.HemisphereLight(0xfff0e0, 0x2a1408, .95));
    var key = new THREE.DirectionalLight(0xfff1dd, 1.05); key.position.set(6, 11, 9); scene.add(key);
    var rim = new THREE.DirectionalLight(0xff8a2a, .9); rim.position.set(-8, 5, -7); scene.add(rim);

    function mat(hex, r) { return new THREE.MeshStandardMaterial({ color: col(hex), roughness: r === undefined ? .6 : r, metalness: 0 }); }
    var mShirt = mat('#ff7a1a'), mPants = mat('#26324a'), mSkin = mat('#d9a273', .7), mCap = mat('#1b1b22'), mShoe = mat('#17171d', .5);
    function tex(draw) { var c = document.createElement('canvas'); c.width = c.height = 128; draw(c.getContext('2d')); var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t; }
    var faceTex = tex(function (x) {   // an original face: two eyes and a smile, drawn on a clear background
      x.fillStyle = '#1b1b22'; x.beginPath(); x.ellipse(44, 50, 9, 13, 0, 0, PI * 2); x.ellipse(84, 50, 9, 13, 0, 0, PI * 2); x.fill();
      x.lineWidth = 7; x.lineCap = 'round'; x.strokeStyle = '#1b1b22'; x.beginPath(); x.arc(64, 68, 26, .25 * PI, .75 * PI); x.stroke();
    });
    var markTex = tex(function (x) {   // a small "I" mark for the chest
      x.fillStyle = 'rgba(255,255,255,.92)'; x.fillRect(40, 20, 48, 20); x.fillRect(54, 40, 20, 48); x.fillRect(40, 88, 48, 20);
    });

    function box(w, h, d, m) { return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); }
    // rig: avatar (turns), hips (bobs), upper (leans and twists: torso, head, arms); the legs hang from the hips
    var avatar = new THREE.Group(), hips = new THREE.Group(), upper = new THREE.Group(), neck = new THREE.Group();
    world.add(avatar); avatar.add(hips); hips.position.y = 2; hips.add(upper);
    var torso = box(2, 2, 1, mShirt); torso.position.y = 1; upper.add(torso);
    var mark = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.1), new THREE.MeshStandardMaterial({ map: markTex, transparent: true, roughness: .6 })); mark.position.set(0, 1.15, .51); upper.add(mark);
    neck.position.y = 2; upper.add(neck);
    var head = box(1.2, 1.2, 1.2, mSkin); head.position.y = .6; neck.add(head);
    var faceDecal = new THREE.Mesh(new THREE.PlaneGeometry(1.05, 1.05), new THREE.MeshBasicMaterial({ map: faceTex, transparent: true })); faceDecal.position.set(0, .6, .61); neck.add(faceDecal);
    var cap = box(1.34, .34, 1.34, mCap); cap.position.y = 1.3; neck.add(cap);
    var visor = box(1.16, .12, .7, mCap); visor.position.set(0, 1.16, .88); neck.add(visor);
    function arm(side) {
      var g = new THREE.Group(); g.position.set(side * 1.5, 2, 0); upper.add(g);
      var sleeve = box(1, 1.3, 1, mShirt); sleeve.position.y = -.65; g.add(sleeve);
      var hand = box(1, .7, 1, mSkin); hand.position.y = -1.65; g.add(hand);
      return g;
    }
    function leg(side) {
      var g = new THREE.Group(); g.position.set(side * .5, 0, 0); hips.add(g);
      var l = box(1, 1.4, 1, mPants); l.position.y = -.7; g.add(l);
      var s = box(1, .6, 1.1, mShoe); s.position.set(0, -1.7, .05); g.add(s);
      return g;
    }
    var armL = arm(1), armR = arm(-1), legL = leg(1), legR = leg(-1);
    // a sword in the right hand: the blade points forward along the arm's own z axis
    var sword = new THREE.Group(); sword.position.set(0, -1.95, .2); armR.add(sword); sword.visible = false;
    var blade = box(.2, .56, 3.3, mat('#d8dce6', .25)); blade.position.z = 2.3; sword.add(blade);
    var guard = box(.3, 1.2, .22, mat('#ffb13b', .4)); guard.position.z = .6; sword.add(guard);
    var grip = box(.28, .28, .9, mat('#4a2a14')); grip.position.z = .1; sword.add(grip);

    // a ladder behind the avatar for the climb animation; the rungs slide down so the avatar seems to rise
    var ladder = new THREE.Group(); ladder.position.set(0, 0, -1.7); world.add(ladder); ladder.visible = false;
    var railM = mat('#8a5a2b', .7);
    [-1.25, 1.25].forEach(function (x) { var r = box(.22, 13, .22, railM); r.position.set(x, 6.5, 0); ladder.add(r); });
    var rungs = new THREE.Group(); ladder.add(rungs);
    for (var ri = 0; ri < 13; ri++) { var rg = box(2.5, .16, .16, railM); rg.position.set(0, ri + .5, 0); rungs.add(rg); }

    // floor: a round baseplate with studs that slide while walking or running
    var R = 9, N = 23;
    var disc = new THREE.Mesh(new THREE.CylinderGeometry(R + .5, R + .5, .5, 64), new THREE.MeshStandardMaterial({ color: col('#1a0f09'), roughness: .9 })); disc.position.y = -.26; world.add(disc);
    var rimRing = new THREE.Mesh(new THREE.RingGeometry(R + .45, R + .75, 64).rotateX(-PI / 2), new THREE.MeshBasicMaterial({ color: 0xff7a1a, transparent: true, opacity: .75 })); world.add(rimRing);
    var studs = new THREE.InstancedMesh(new THREE.CylinderGeometry(.24, .24, .16, 8), new THREE.MeshStandardMaterial({ color: col('#4a2d1a'), roughness: .6 }), N * N), dummy = new THREE.Object3D();
    studs.frustumCulled = false; world.add(studs);
    function layStuds(off) {
      var i, j, n = 0, x, z, s;
      for (i = 0; i < N; i++) for (j = 0; j < N; j++) {
        x = i - (N - 1) / 2; z = (((j - off) % N) + N) % N - (N - 1) / 2; s = clamp((R - Math.hypot(x, z)) / 3.5, 0, 1);
        dummy.position.set(x, .08, z); dummy.scale.setScalar(Math.max(s, .0001)); dummy.updateMatrix(); studs.setMatrixAt(n++, dummy.matrix);
      }
      studs.instanceMatrix.needsUpdate = true;
    }
    layStuds(0);
    var gc = document.createElement('canvas'); gc.width = gc.height = 128;
    var gx = gc.getContext('2d'), gg = gx.createRadialGradient(64, 64, 4, 64, 64, 62);
    gg.addColorStop(0, 'rgba(255,150,50,.55)'); gg.addColorStop(.5, 'rgba(255,110,30,.16)'); gg.addColorStop(1, 'rgba(255,100,20,0)'); gx.fillStyle = gg; gx.fillRect(0, 0, 128, 128);
    var glow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-PI / 2), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(gc), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    glow.scale.setScalar(16); glow.position.y = .25; world.add(glow);

    // state
    var clip = ctx.still ? 'idle' : 'dance', playing = !ctx.still, tt = 0, yaw = -.45, yawT = -.45, zoom = 1, touched = 0, cur = P({}), scroll = 0, outfit = 0, aspect = 1.6, swayS = 0, distS = 1;

    function applyOutfit(i) {
      var o = OUTFITS[i][1]; outfit = i;
      mShirt.color.copy(col(o.shirt)); mPants.color.copy(col(o.pants)); mSkin.color.copy(col(o.skin)); mCap.color.copy(col(o.cap));
    }

    // side panel
    var ui = el('div', 'smp-ui'), clipBtns = {}, outBtns = [];
    ui.appendChild(el('h3', '', 'Roblox-style animation pack'));
    ui.appendChild(el('p', 'tag', 'A blocky six-part avatar, the idea behind the R6 rig used in many Roblox games, with twelve animations for movement, combat and emotes. Drawn and animated from scratch: not a Roblox asset.'));
    var chips = el('p', 'chips'); ['6-part rig', '12 animations', 'original avatar', 'built in code'].forEach(function (s) { chips.appendChild(el('span', '', s)); }); ui.appendChild(chips);
    ui.appendChild(el('p', 'smp-l', 'Animation'));
    var gcp = el('div', 'smp-g'); ui.appendChild(gcp);
    CLIPS.forEach(function (c) { var b = el('button', 'smp-b', c[1]); b.type = 'button'; b.addEventListener('click', function () { setClip(c[0]); }); gcp.appendChild(b); clipBtns[c[0]] = b; });
    ui.appendChild(el('p', 'smp-l', 'Outfit'));
    var gout = el('div', 'smp-g'); ui.appendChild(gout);
    OUTFITS.forEach(function (o, i) { var b = el('button', 'smp-b', o[0]); b.type = 'button'; b.addEventListener('click', function () { applyOutfit(i); refresh(); }); gout.appendChild(b); outBtns.push(b); });
    var now = el('p', 'smp-now'); now.setAttribute('aria-live', 'polite'); ui.appendChild(now);
    var row = el('div', 'row smp-row'), pb = el('button', 'mbtn', ''); pb.type = 'button'; pb.addEventListener('click', function () { playing = !playing; refresh(); });
    var cta = el('a', 'btn', 'Order something like this'); cta.href = WA + encodeURIComponent('Hi Iffy, I saw your Roblox-style animation sample and I would like animations for my game.'); cta.target = '_blank'; cta.rel = 'noopener';
    row.appendChild(pb); row.appendChild(cta); ui.appendChild(row);
    function label(c) { return CLIPS.filter(function (x) { return x[0] === c; })[0][1]; }
    function refresh() {
      Object.keys(clipBtns).forEach(function (c) { clipBtns[c].setAttribute('aria-pressed', c === clip ? 'true' : 'false'); });
      outBtns.forEach(function (b, i) { b.setAttribute('aria-pressed', i === outfit ? 'true' : 'false'); });
      pb.textContent = playing ? 'Pause' : 'Play';
      now.textContent = (playing ? 'Playing: ' : 'Paused: ') + label(clip) + ', ' + OUTFITS[outfit][0].toLowerCase() + ' outfit';
    }
    function setClip(c) { clip = c; playing = true; tt = 0; if (c === 'climb') yawT = -.5; refresh(); }
    applyOutfit(0); refresh();

    function update(t, dt) {
      if (playing) tt += dt;
      var p = ANIM[clip](tt), k = 1 - Math.exp(-dt * 12), i;
      for (i = 0; i < KEYS.length; i++) cur[KEYS[i]] += (p[KEYS[i]] - cur[KEYS[i]]) * k;
      hips.position.y = 2 + cur.y; hips.rotation.set(0, cur.ty * .5, cur.tz);
      upper.rotation.set(cur.lean, cur.ty, 0); neck.rotation.set(cur.hx, cur.hy, 0);
      armL.rotation.set(cur.aLx, 0, cur.aLz); armR.rotation.set(cur.aRx, 0, cur.aRz); legL.rotation.set(cur.lLx, 0, cur.lLz); legR.rotation.set(cur.lRx, 0, cur.lRz);
      avatar.rotation.y = cur.face; sword.visible = !!p.sword; ladder.visible = !!p.ladder;
      var sp = playing ? (SPEED[clip] || 0) : 0;
      if (sp) { scroll += sp * dt; layStuds(scroll % N); }
      if (p.ladder && playing) rungs.position.y = -((tt * 2.2) % 1);
      var sway = (playing && !SPEED[clip] && clip !== 'climb' && performance.now() - touched > 3500) ? Math.sin(t * .4) * .5 : 0;   // a slow showcase sway when nobody is touching it
      swayS += (sway - swayS) * Math.min(1, dt * 2);
      yaw += (yawT + swayS - yaw) * Math.min(1, dt * 10); world.rotation.y = yaw;
      distS += ((clip === 'slash' ? 1.3 : (clip === 'jump' || clip === 'cheer' || clip === 'climb') ? 1.15 : 1) - distS) * Math.min(1, dt * 3);   // tall poses get a little more room
      var D = Math.max(17, 9.5 / (2 * Math.tan(cam.fov * PI / 360) * aspect)) * distS / zoom;
      cam.position.set(0, 4.8, D); cam.lookAt(0, 3.3, 0);
    }
    function resize(w, h) { aspect = w / h; cam.aspect = aspect; cam.updateProjectionMatrix(); }

    return {
      ui: ui, scene: scene, camera: cam, update: update, resize: resize,
      drag: function (dx) { yawT += dx * .012; touched = performance.now(); },
      pinch: function (f) { zoom = clamp(zoom * f, .55, 1.9); },
      reset: function () { zoom = 1; yawT = -.45; touched = 0; },
      restore: function () {},
      hint: matchMedia('(pointer:coarse)').matches ? 'Drag to turn, pinch to zoom' : 'Drag to turn. Ctrl and scroll to zoom. Double click to reset.'
    };
  } });
})();
