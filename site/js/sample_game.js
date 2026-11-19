/* Sample 5: mini game. "Naija Dash" is a three lane street runner built from scratch for this site, with the six Naija Life
   characters as skins. Change lane, jump crates and barrels, slide under market stalls, dodge danfo buses, grab coins.
   Keyboard, swipe, tap and on screen buttons. No game engine and no model files: the street, the props and the sky are built in
   code. Everything that does not move by itself is baked into a few merged meshes whose vertex colours already hold a simple
   light, so the scene needs no lights. The runner comes from cast_3d.js. Registered with js/samples.js. */
(function () {
  'use strict';
  if (!window.IFFY_SAMPLES || !window.IFFY_CAST) return;
  var PI = Math.PI, WA = 'https://wa.me/2348075889359?text=';
  var WHO = ['Conductor', 'Designer', 'Trader', 'Textile trader', 'Oil technician', 'Corps member'];
  // lives, start and top speed (metres per second), spacing between obstacle rows, how fast the patterns get harder
  var MODES = [
    ['Easy', { lives: 5, v0: 9, vmax: 17, gap: 1.25, ramp: 1 }],
    ['Normal', { lives: 3, v0: 11, vmax: 22, gap: 1, ramp: 1.25 }],
    ['Hard', { lives: 1, v0: 13, vmax: 27, gap: .9, ramp: 1.6 }]
  ];
  var LW = 2, PERIOD = 4.8, PAVE = 2, JUMP_H = 1.75, JUMP_T = .74, SLIDE_T = .6;   // lane width, texture periods, jump height and air time, slide time
  var G = 8 * JUMP_H / (JUMP_T * JUMP_T), V0 = 4 * JUMP_H / JUMP_T;
  var AHEAD = 120, BEHIND = 14, RECYCLE = 26, CH = 12, NSLOT = Math.ceil((AHEAD + RECYCLE) / CH) + 1, MAXC = 110;
  var LOW = 1, HIGH = 2, BUS = 3;   // obstacle kinds: jump it, slide under it, go around it
  var KEYS = { ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right', ArrowUp: 'jump', w: 'jump', ' ': 'jump', ArrowDown: 'slide', s: 'slide', p: 'pause', Escape: 'pause' };

  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt) e.textContent = txt; return e; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function load(k, d) { try { var v = localStorage.getItem('iffy-dash-' + k); return v === null ? d : v; } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem('iffy-dash-' + k, String(v)); } catch (e) {} }

  IFFY_SAMPLES.add({ id: 'game', tab: 'Mini game', mount: function (ctx) {
    var THREE = ctx.THREE, scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(58, 1.4, .1, 230);
    var stage = document.getElementById('smp-stage'), hintEl = document.getElementById('smp-hint');
    var still = ctx.still, coarse = matchMedia('(pointer:coarse)').matches, lc = {}, HOR = 0xf2a05e;
    var hintText = coarse ? 'Swipe to move, tap to jump, or use the buttons' : 'Arrow keys or A D to change lane. Space to jump. Down to slide. P to pause.';
    function lin(h) { return lc[h] || (lc[h] = new THREE.Color(h).convertSRGBToLinear()); }
    function canvasTex(w, h, draw) {
      var c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
      var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t;
    }
    var aniso = Math.min(8, ctx.renderer.capabilities.getMaxAnisotropy ? ctx.renderer.capabilities.getMaxAnisotropy() : 1);
    scene.fog = new THREE.Fog(HOR, 44, 126);

    // ---- sky: a gradient dome with a low sun, and two skylines that follow the camera
    var sky = new THREE.Mesh(new THREE.SphereGeometry(125, 20, 12), new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, fog: false,
      uniforms: { top: { value: new THREE.Color(0x2a1d5e) }, mid: { value: new THREE.Color(0xc4506c) }, hor: { value: new THREE.Color(HOR) }, sun: { value: new THREE.Vector3(-.2, .09, -1).normalize() } },
      vertexShader: 'varying vec3 vD;void main(){vD=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader: 'uniform vec3 top,mid,hor,sun;varying vec3 vD;void main(){vec3 d=normalize(vD);float h=clamp(d.y,0.,1.);vec3 c=mix(hor,mid,smoothstep(0.,.22,h));c=mix(c,top,smoothstep(.15,.75,h));float s=max(dot(d,sun),0.);c+=vec3(1.,.72,.38)*pow(s,28.)*.5+vec3(1.,.93,.7)*pow(s,900.)*2.;gl_FragColor=vec4(c,1.);}'
    }));
    sky.renderOrder = -5; sky.frustumCulled = false; scene.add(sky);
    function skyline(seed, col, win, dens, lo, hi, dist, hgt) {
      var t = canvasTex(1024, 256, function (x, w, h) {
        var s = seed, px = 0, bw, bh, wy, wx;
        function r() { s = (s * 16807) % 2147483647; return s / 2147483647; }
        while (px < w) {
          bw = 20 + r() * 50; bh = h * (lo + r() * (hi - lo));
          x.fillStyle = col; x.fillRect(px, h - bh, bw - 1, bh);
          if (r() < .3) x.fillRect(px + bw * .4, h - bh - 10 - r() * 14, 3, 24);
          if (r() < .3) x.fillRect(px + 4, h - bh - 7, bw - 9, 8);
          x.fillStyle = win;
          for (wy = h - bh + 7; wy < h - 4; wy += 8) for (wx = px + 4; wx < px + bw - 7; wx += 7) if (r() < dens) x.fillRect(wx, wy, 3, 4);
          px += bw + (r() < .2 ? 6 + r() * 12 : 0);
        }
      });
      t.wrapS = THREE.RepeatWrapping; t.repeat.set(3, 1);
      var m = new THREE.Mesh(new THREE.PlaneGeometry(dist * 2.8, hgt), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, fog: false }));
      m.userData = { dist: dist, hgt: hgt }; m.renderOrder = -4; m.frustumCulled = false; scene.add(m); return m;
    }
    var skyFar = skyline(11, '#b8677a', '#ffe0b0', .06, .35, .8, 118, 26), skyNear = skyline(5, '#4a2c52', '#ffcf7a', .16, .3, .85, 104, 22);

    // ---- the ground: road and paving scroll by moving their texture, everything else is moved with the distance run
    function drawRoad(x, w, h) {
      var ppm = w / 6.6, i;
      x.fillStyle = '#2e2d37'; x.fillRect(0, 0, w, h);
      x.fillStyle = 'rgba(0,0,0,.14)'; [-2, 0, 2].forEach(function (lx) { x.fillRect(w / 2 + lx * ppm - .55 * ppm, 0, 1.1 * ppm, h); });
      for (i = 0; i < 900; i++) { x.fillStyle = Math.random() < .5 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.09)'; x.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 2); }
      x.fillStyle = '#e9e3cf';
      [-3, 3].forEach(function (ex) { x.fillRect(w / 2 + ex * ppm - .06 * ppm, 0, .12 * ppm, h); });
      [-1, 1].forEach(function (lx) { x.fillRect(w / 2 + lx * ppm - .05 * ppm, h * .15, .1 * ppm, h * .42); });
    }
    function drawPave(x, w, h) {
      var i;
      x.fillStyle = '#86735f'; x.fillRect(0, 0, w, h);
      for (i = 0; i < 160; i++) { x.fillStyle = Math.random() < .5 ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.08)'; x.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
      x.fillStyle = 'rgba(0,0,0,.3)'; x.fillRect(0, 0, w, 3); x.fillRect(w / 2 - 1, 0, 2, h);
    }
    var roadTex = canvasTex(256, 256, drawRoad), paveTex = canvasTex(128, 128, drawPave);
    roadTex.wrapS = roadTex.wrapT = paveTex.wrapS = paveTex.wrapT = THREE.RepeatWrapping;
    roadTex.repeat.set(1, 190 / PERIOD); paveTex.repeat.set(1, 190 / PAVE); roadTex.anisotropy = paveTex.anisotropy = aniso;
    var road = new THREE.Mesh(new THREE.PlaneGeometry(6.6, 190).rotateX(-PI / 2), new THREE.MeshBasicMaterial({ map: roadTex }));
    road.position.set(0, 0, -75); scene.add(road);
    var kerbMat = new THREE.MeshBasicMaterial({ color: lin('#5a4a42') });
    [-1, 1].forEach(function (sd) {
      var pv = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 190).rotateX(-PI / 2), new THREE.MeshBasicMaterial({ map: paveTex }));
      pv.position.set(sd * 4.05, .09, -75); scene.add(pv);
      var kb = new THREE.Mesh(new THREE.PlaneGeometry(190, .09).rotateY(-sd * PI / 2), kerbMat);
      kb.position.set(sd * 3.3, .045, -75); scene.add(kb);
    });
    var ground = new THREE.Mesh(new THREE.PlaneGeometry(160, 200).rotateX(-PI / 2), new THREE.MeshBasicMaterial({ color: lin('#4b2d1e') }));
    ground.position.set(0, -.02, -70); scene.add(ground);

    // ---- baked geometry: shapes are merged with vertex colours that already hold a simple light
    var UB = new THREE.BoxGeometry(1, 1, 1).toNonIndexed(), UC = new THREE.CylinderGeometry(1, 1, 1, 10, 1).toNonIndexed(), UCF = new THREE.CylinderGeometry(1, 1, 1, 16, 1).toNonIndexed();
    var UK = new THREE.ConeGeometry(1, 1, 10, 1).toNonIndexed(), US = new THREE.SphereGeometry(1, 10, 7).toNonIndexed();
    var UP = (function () {   // a roof: triangular prism, ridge along z, base at y 0, ridge at y 1
      var a = [-.5, 0, -.5], b = [.5, 0, -.5], c = [0, 1, -.5], d = [-.5, 0, .5], e = [.5, 0, .5], f = [0, 1, .5], pos = [];
      [d, e, f, b, a, c, a, d, f, a, f, c, e, b, c, e, c, f].forEach(function (v) { pos.push(v[0], v[1], v[2]); });
      var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals(); return g;
    })();
    var LD = new THREE.Vector3(-.4, .8, .45).normalize();
    var m4 = new THREE.Matrix4(), nm = new THREE.Matrix3(), qa = new THREE.Quaternion(), ea = new THREE.Euler(), va = new THREE.Vector3(), vb = new THREE.Vector3(), vc = new THREE.Vector3(), vd = new THREE.Vector3();
    function Acc() { this.p = []; this.c = []; }
    Acc.prototype.add = function (geo, hex, glow, x, y, z, sx, sy, sz, rx, ry, rz) {
      qa.setFromEuler(ea.set(rx || 0, ry || 0, rz || 0)); m4.compose(va.set(x, y, z), qa, vb.set(sx, sy, sz)); nm.getNormalMatrix(m4);
      var P = geo.attributes.position, N = geo.attributes.normal, c = lin(hex), s, i;
      for (i = 0; i < P.count; i++) {
        vc.fromBufferAttribute(P, i).applyMatrix4(m4); vd.fromBufferAttribute(N, i).applyMatrix3(nm).normalize();
        s = glow ? 1 : clamp(.56 + .5 * (vd.x * LD.x + vd.y * LD.y + vd.z * LD.z), .42, 1.05);
        this.p.push(vc.x, vc.y, vc.z); this.c.push(c.r * s, c.g * s, c.b * s);
      }
      return this;
    };
    Acc.prototype.box = function (cx, y, cz, sx, sy, sz, hex, glow, rx, ry, rz) { return this.add(UB, hex, glow, cx, y + sy / 2, cz, sx, sy, sz, rx, ry, rz); };
    Acc.prototype.cyl = function (cx, y, cz, r, h, hex, glow, rx, ry, rz) { return this.add(UC, hex, glow, cx, y + h / 2, cz, r, h, r, rx, ry, rz); };
    Acc.prototype.sph = function (cx, cy, cz, sx, sy, sz, hex) { return this.add(US, hex, false, cx, cy, cz, sx, sy, sz); };
    Acc.prototype.roof = function (cx, y, cz, sx, sy, sz, hex) { return this.add(UP, hex, false, cx, y, cz, sx, sy, sz); };
    Acc.prototype.geo = function () {
      var g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(this.c, 3));
      g.computeBoundingSphere(); return g;
    };
    var matBaked = new THREE.MeshBasicMaterial({ vertexColors: true });

    // ---- the street sides: sixteen 12 m stretches built once and reused (drawn for the right side, the left side is a mirror)
    var WALLS = ['#e9a63c', '#d9553d', '#3fa090', '#4d7fc4', '#c96aa6', '#8cb34b', '#efd9a6', '#d98c4c', '#7b5cb8', '#e8c547'];
    var ROOFS = ['#6b4a3a', '#4b505e', '#8a4030', '#33463a', '#5a3c52'], ACC = ['#ffd23a', '#ff5a36', '#2fd0c2', '#fff0d8', '#ff8fc0', '#7fd1ff'], WON = '#ffd88c', WOFF = '#34405f';
    function bld(A, x, z, w, d, h, wall, roof, lit) {   // a block: x is the wall facing the road, z the middle, windows on the road face and the face towards the camera
      var rows = Math.max(1, Math.floor(h / 3)), n = Math.max(1, Math.floor(d / 2.4)), st = d / n, r, i, on;
      A.box(x + w / 2, 0, z, w, h, d, wall); A.box(x + w / 2, h, z, w + .4, .3, d + .4, roof);
      for (r = 0; r < rows; r++) for (i = 0; i < n; i++) { on = Math.random() < lit; A.box(x - .04, r * 3 + 1, z - d / 2 + st * (i + .5), .1, 1.3, 1.1, on ? WON : WOFF, on); }
      n = Math.max(1, Math.floor(w / 2.4)); st = w / n;
      for (r = 0; r < rows; r++) for (i = 0; i < n; i++) { on = Math.random() < lit; A.box(x + st * (i + .5), r * 3 + 1, z + d / 2 + .04, 1.1, 1.3, .1, on ? WON : WOFF, on); }
    }
    function shop(A, x, z, d, wall, acc) {
      var i;
      A.box(x + 2.6, 0, z, 5.2, 3.6, d, wall); A.box(x + 2.6, 3.6, z, 5.6, .25, d + .3, pick(ROOFS));
      A.box(x - .04, 0, z, .12, 2.3, 1.1, '#2b2233'); A.box(x - .04, .7, z - d * .3, .12, 1.4, d * .28, '#7fb9dd'); A.box(x - .04, .7, z + d * .3, .12, 1.4, d * .28, '#7fb9dd');
      A.box(x - .1, 2.7, z, .14, .75, d - .5, acc);
      for (i = 0; i < 6; i++) A.box(x - .5, 2.35, z - d / 2 + .4 + i * (d - .8) / 5, .9, .06, (d - .8) / 5.4, i % 2 ? '#fff0d8' : acc, false, 0, 0, .2);
    }
    function house(A, x, z, w, d, wall) {
      A.box(x + w / 2, 0, z, w, 3.2, d, wall); A.roof(x + w / 2, 3.2, z, w + .8, 1.6, d + .8, pick(ROOFS));
      A.box(x - .04, 0, z, .12, 2.1, 1, '#4a2f22'); A.box(x - .04, 1, z - d * .3, .12, 1.1, 1, WOFF); A.box(x - .04, 1, z + d * .3, .12, 1.1, 1, WOFF);
      A.box(x + w * .7, 3.2, z - d * .2, .5, 1.9, .5, '#8c6a55');
    }
    function palm(A, x, z) {
      var h = rnd(4.2, 5.6), i, yaw, dr, len;
      A.cyl(x, 0, z, .17, h, '#8a6a47', false, .05, 0, .06);
      for (i = 0; i < 7; i++) {
        yaw = i / 7 * PI * 2 + rnd(-.2, .2); dr = rnd(.25, .65); len = rnd(1.9, 2.4);
        A.add(UB, i % 2 ? '#2f8a3c' : '#3fa04a', false, x + .1 + Math.cos(yaw) * len / 2 * Math.cos(dr), h - len / 2 * Math.sin(dr), z + Math.sin(yaw) * len / 2 * Math.cos(dr), len, .05, .5, 0, -yaw, -dr);
      }
      A.sph(x + .1, h - .1, z, .22, .2, .22, '#6b4a2f');
    }
    function umbrella(A, x, z, hex) { A.cyl(x, 0, z, .04, 2.3, '#cfcfcf'); A.add(UK, hex, false, x, 2.58, z, 1.35, .55, 1.35); A.box(x, 0, z, .9, .75, .9, '#8a6a47'); }
    function billboard(A, x, z) {
      var c = pick(ACC);
      A.cyl(x + .1, 0, z - 1.8, .13, 6.2, '#4b4b55'); A.cyl(x + .1, 0, z + 1.8, .13, 6.2, '#4b4b55');
      A.box(x, 5, z, .3, 3.2, 5.6, '#2a2733'); A.box(x - .17, 5.15, z, .08, 2.9, 5.3, c);
      A.box(x - .23, 5.6, z - 1, .06, 1.5, 1.5, '#fff6e6'); A.box(x - .23, 5.5, z + 1.3, .06, .35, 2.2, '#fff6e6'); A.box(x - .23, 5, z + 1.3, .06, .25, 1.6, '#2a2733');
    }
    function tree(A, x, z, s) {
      A.cyl(x, 0, z, .2 * s, 2 * s, '#6b4a2f');
      A.sph(x, 2.6 * s, z, 1.3 * s, 1.1 * s, 1.3 * s, '#2f7d3a'); A.sph(x + .5 * s, 3.3 * s, z + .2 * s, .9 * s, .8 * s, .9 * s, '#3b9145'); A.sph(x - .4 * s, 3.1 * s, z - .4 * s, .8 * s, .7 * s, .8 * s, '#2a6f35');
    }
    function fence(A, x, z0, z1) {
      var n = Math.floor((z1 - z0) / 1.1), st = (z1 - z0) / n, i;
      A.box(x, .55, (z0 + z1) / 2, .08, .08, z1 - z0, '#c9b79a');
      for (i = 0; i <= n; i++) A.box(x, 0, z0 + i * st, .12, 1.1, .12, '#b9a587');
    }
    function pile(A, x, z) { A.box(x, 0, z, .9, .6, .9, '#b9803f'); A.box(x + .05, .6, z - .05, .7, .5, .7, '#cf9550'); }
    function lamp(A, x, z) { A.cyl(x, 0, z, .07, 5.2, '#2b2b34'); A.box(x - .6, 5.1, z, 1.3, .08, .1, '#2b2b34'); A.box(x - 1.2, 4.92, z, .55, .12, .28, '#fff0c0', true); }
    var SIDES = [
      function (A) { bld(A, rnd(5.4, 6.4), 0, rnd(7, 9), rnd(8.5, 10.5), pick([12, 15, 18]), pick(WALLS), pick(ROOFS), .42); },
      function (A) { shop(A, 5.2, -3.1, 5.4, pick(WALLS), pick(ACC)); shop(A, 5.2, 2.7, 5.6, pick(WALLS), pick(ACC)); bld(A, 11, 0, 8, 11, pick([9, 12]), pick(WALLS), pick(ROOFS), .4); },
      function (A) { palm(A, 4.7, -4.2); palm(A, 5, 2.4); house(A, 8, -.5, 5.4, 6, pick(WALLS)); fence(A, 5.6, -5.8, 5.8); },
      function (A) { billboard(A, 6.2, -1.2); shop(A, 5.4, 4.2, 4.4, pick(WALLS), pick(ACC)); bld(A, 10.5, 0, 8, 10, pick([9, 12]), pick(WALLS), pick(ROOFS), .4); },
      function (A) { umbrella(A, 5.2, -3.6, pick(ACC)); umbrella(A, 5.2, -.4, pick(ACC)); umbrella(A, 5.3, 2.8, pick(ACC)); pile(A, 6.2, 4.6); pile(A, 6.4, -5.2); shop(A, 8.4, 0, 8, pick(WALLS), pick(ACC)); },
      function (A) { tree(A, 5.2, -4, 1); tree(A, 5.6, 1.6, 1.25); tree(A, 7.5, 5, 1); house(A, 9, -1.2, 5.6, 6.4, pick(WALLS)); },
      function (A) { house(A, 5.4, -3.2, 4.8, 5, pick(WALLS)); house(A, 5.4, 3.2, 4.8, 5, pick(WALLS)); tree(A, 11.5, 0, 1.2); },
      function (A) { bld(A, 5.6, 0, 8, 11, 7, pick(WALLS), pick(ROOFS), .5); A.box(5.4, 5.6, 0, .3, 1.1, 9, pick(ACC)); palm(A, 4.9, 5.2); }
    ];
    var sideGeo = [];
    (function () { var i, k; for (k = 0; k < 2; k++) for (i = 0; i < SIDES.length; i++) { var A = new Acc(); lamp(A, 3.9, -3); SIDES[i](A); sideGeo.push(A.geo()); } })();
    var slots = [];
    (function () {
      var i, R, L;
      for (i = 0; i < NSLOT; i++) {
        R = new THREE.Mesh(sideGeo[0], matBaked); L = new THREE.Mesh(sideGeo[0], matBaked); L.scale.x = -1;
        scene.add(R); scene.add(L); slots.push({ d: 0, L: L, R: R });
      }
    })();

    // ---- obstacles (all shapes face the camera with their back): crates and barrels to jump, a stall to slide under, a danfo bus to go around
    function crateGeo() {
      var A = new Acc(), i;
      A.box(0, .02, 0, 2.1, .01, 1.5, '#1c1b21'); A.box(0, 0, 0, 1.6, .62, 1, '#b9803f'); A.box(-.3, .62, .02, 1, .4, .85, '#cf9550');
      for (i = 0; i < 3; i++) A.box(0, .08 + i * .2, .5, 1.62, .06, .03, '#8d5a28');
      for (i = 0; i < 2; i++) A.box(-.3, .68 + i * .18, .43, 1.02, .05, .03, '#9d6830');
      A.box(-.78, 0, .5, .08, .62, .04, '#8d5a28'); A.box(.78, 0, .5, .08, .62, .04, '#8d5a28'); return A.geo();
    }
    function barrelGeo() {
      var A = new Acc(), cols = ['#d94f38', '#2f6fb8', '#e9b02c'], i, x;
      A.box(0, .02, 0, 2.1, .01, 1.3, '#1c1b21');
      for (i = 0; i < 3; i++) { x = -.65 + i * .65; A.cyl(x, 0, 0, .3, 1, cols[i]); A.cyl(x, .22, 0, .315, .06, '#2a2a30'); A.cyl(x, .7, 0, .315, .06, '#2a2a30'); A.cyl(x, .98, 0, .26, .04, '#d8d8d8'); }
      return A.geo();
    }
    function stallGeo() {
      var A = new Acc(), i, c;
      A.box(0, .02, 0, 2.1, .01, 1.4, '#1c1b21');
      A.box(-.93, 0, -.45, .1, 2, .1, '#6a4a2b'); A.box(.93, 0, -.45, .1, 2, .1, '#6a4a2b'); A.box(-.93, 0, .5, .1, 1.2, .1, '#6a4a2b'); A.box(.93, 0, .5, .1, 1.2, .1, '#6a4a2b');
      for (i = 0; i < 6; i++) { c = i % 2 ? '#fff0d8' : '#ff7a1a'; A.box(-.75 + i * .3, 1.62, 0, .3, .06, 1.2, c, false, .42, 0, 0); A.box(-.75 + i * .3, 1.16, .56, .3, .26, .05, c); }
      return A.geo();
    }
    function busGeo(body, stripe, trim) {
      var A = new Acc(), glass = '#26465c', i, j;
      A.box(0, .02, 0, 2.6, .01, 6, '#1c1b21');
      A.box(0, .5, 0, 2, 1.45, 5.4, body); A.box(0, 1.95, -.15, 1.9, 1, 5, body); A.box(0, 1, 0, 2.03, .26, 5.43, stripe);
      A.box(0, 2.14, -.15, 1.94, .62, 4.5, glass); A.box(0, 2.14, 2.36, 1.6, .62, .05, glass);
      for (i = -1; i <= 1; i += 2) { A.box(i * .8, .98, 2.72, .32, .22, .05, '#ff3b2f', true); A.box(i * .8, 1.3, 2.72, .32, .1, .05, '#ffb02e', true); }
      A.box(0, .62, 2.73, .55, .2, .04, '#f4f0e6'); A.box(0, .3, 2.76, 2.06, .24, .14, '#26262b'); A.box(0, 2.95, -.2, 1.6, .28, 2.6, trim);
      for (i = -1; i <= 1; i += 2) for (j = -1; j <= 1; j += 2) A.add(UCF, '#17171b', false, i * 1, .44, j * 1.7, .44, .3, .44, 0, 0, PI / 2);
      return A.geo();
    }
    var OB = {};
    OB[LOW] = { geos: [crateGeo(), barrelGeo()], hw: .82, hd: .62, lo: 0, top: 1.02 };
    OB[HIGH] = { geos: [stallGeo()], hw: .88, hd: .62, lo: 1.16, top: 2 };
    OB[BUS] = { geos: [busGeo('#f6c224', '#1b1b1f', '#8a6a47'), busGeo('#f3f1ea', '#1f8a52', '#6b4a3a')], hw: .95, hd: 2.7, lo: 0, top: 3 };
    var obs = [], idle = {}, coinsA = [];
    idle[LOW] = []; idle[HIGH] = []; idle[BUS] = [];

    // ---- coins, soft shadow, dust and sparks
    var coinGeo = (function () {
      var A = new Acc();
      A.add(UCF, '#c9811b', false, 0, 0, 0, .4, .09, .4, PI / 2, 0, 0); A.add(UCF, '#ffd23a', true, 0, 0, 0, .34, .1, .34, PI / 2, 0, 0); A.add(UCF, '#ffeb8f', true, 0, 0, 0, .2, .12, .2, PI / 2, 0, 0);
      return A.geo();
    })();
    var coinMesh = new THREE.InstancedMesh(coinGeo, matBaked, MAXC); coinMesh.frustumCulled = false; coinMesh.count = 0; scene.add(coinMesh);
    var blob = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.6).rotateX(-PI / 2), new THREE.MeshBasicMaterial({
      map: canvasTex(64, 64, function (x) { var g = x.createRadialGradient(32, 32, 2, 32, 32, 31); g.addColorStop(0, 'rgba(0,0,0,.7)'); g.addColorStop(.55, 'rgba(0,0,0,.32)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); }),
      transparent: true, depthWrite: false
    }));
    blob.position.y = .04; scene.add(blob);
    var NP = 90, pp = new Float32Array(NP * 3), pc = new Float32Array(NP * 3), pv = new Float32Array(NP * 3), pb = new Float32Array(NP * 3), pl = new Float32Array(NP), pmx = new Float32Array(NP), pn = 0;
    var pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pp, 3)); pg.setAttribute('color', new THREE.BufferAttribute(pc, 3));
    var points = new THREE.Points(pg, new THREE.PointsMaterial({
      size: .32, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
      map: canvasTex(32, 32, function (x) { var g = x.createRadialGradient(16, 16, 1, 16, 16, 15); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 32, 32); })
    }));
    points.frustumCulled = false; scene.add(points);

    // ---- the runner: one of the six cast characters, facing away from the camera
    var cast = IFFY_CAST.create(THREE, { pmrem: ctx.pmrem, scale: 1 });
    cast.setMode('manual'); cast.setFit(.95); cast.group.rotation.y = PI; scene.add(cast.group);
    cast.group.traverse(function (o) { if (o.isMesh && !o.isSkinnedMesh) o.visible = false; });   // the cast's own shadow follows the jump, so use ours

    // ---- state
    var mode = MODES[1][1], modeIdx = clamp(+load('mode', 1) || 1, 0, 2), skin = clamp(+load('skin', 0) || 0, 0, 5), state = 'ready', active = false, aspect = 1.4, dCam = 7, camH = 3.2;
    var D = 0, time = 0, vNow = 0, px = 0, py = 0, vy = 0, lane = 0, airborne = false, slideT = 0, slideOnLand = false, buf = 0, invul = 0, hurtT = 0, shake = 0, ramp = 0, rec = 1;
    var lives = 3, coins = 0, sc = 0, ranD = 0, best = 0, lastRowD = 0, nextD = 40, deadT = 0, tt = 0, ta = 0, curClip = '', newBest = false;
    var snd = load('snd', '0') === '1', ac = null, away = false, pausedBy = '';

    // ---- sound: a few synthesized beeps, off until the player turns them on (the site keeps media muted by default)
    function tone(f0, f1, dur, type, vol, delay) {
      if (!snd) return;
      try {
        var AC = window.AudioContext || window.webkitAudioContext, t, o, g;
        if (!AC) return;
        if (!ac) ac = new AC();
        if (ac.state === 'suspended') ac.resume();
        t = ac.currentTime + (delay || 0); o = ac.createOscillator(); g = ac.createGain();
        o.type = type || 'square'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dur);
        g.gain.setValueAtTime(vol || .04, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
        o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + dur + .03);
      } catch (e) {}
    }

    // ---- obstacles and coins
    function addObstacle(kind, ln, d) {
      var spec = OB[kind], m = idle[kind].pop(), o;
      if (!m) { m = new THREE.Mesh(spec.geos[0], matBaked); scene.add(m); }
      m.geometry = pick(spec.geos); m.visible = true; m.scale.set(1, 1, 1); m.rotation.set(0, 0, 0);
      o = { kind: kind, lane: ln, x: ln * LW, d: d, hw: spec.hw, hd: spec.hd, lo: spec.lo, top: spec.top, mesh: m, hit: false, smash: 0 };
      m.position.set(o.x, 0, D - d); obs.push(o); return o;
    }
    function dropObstacle(i) { var o = obs[i]; o.mesh.visible = false; o.mesh.position.y = 0; idle[o.kind].push(o.mesh); obs.splice(i, 1); }
    function addCoin(d, x, y) { if (coinsA.length < MAXC) coinsA.push({ d: d, x: x, y: y }); }
    function pattern(p) {   // what stands in the three lanes of one row; there is always a lane that is not a bus
      var L = [0, 0, 0], a = Math.floor(Math.random() * 3), b = (a + 1 + Math.floor(Math.random() * 2)) % 3, bag = ['crate', 'crate', 'stall', 'stall', 'bus', 'coins'];
      if (p > .05) bag.push('crate3', 'crate2');
      if (p > .1) bag.push('stall3', 'bus', 'crate2');
      if (p > .2) bag.push('bus2', 'mixA', 'mixB');
      if (p > .45) bag.push('bus2', 'mixA', 'mixB', 'crate3');
      switch (pick(bag)) {
        case 'crate': L[a] = LOW; break;
        case 'stall': L[a] = HIGH; break;
        case 'bus': L[a] = BUS; break;
        case 'crate2': L[a] = L[b] = LOW; break;
        case 'crate3': L = [LOW, LOW, LOW]; break;
        case 'stall3': L = [HIGH, HIGH, HIGH]; break;
        case 'bus2': L[a] = L[b] = BUS; break;
        case 'mixA': L[a] = BUS; L[b] = LOW; break;
        case 'mixB': L[a] = BUS; L[b] = HIGH; break;
      }
      return L;
    }
    function spawnRow() {
      var d = nextD, p = clamp(D / 1200 * mode.ramp, 0, 1), v = mode.v0 + (mode.vmax - mode.v0) * clamp(D / 900, 0, 1), kinds = pattern(p), free = [], gap = d - lastRowD, i, k, n, ln;
      for (i = 0; i < 3; i++) { if (kinds[i]) addObstacle(kinds[i], i - 1, d); else free.push(i - 1); }
      if (gap > 24 && free.length) { ln = pick(free); n = Math.min(8, Math.floor((gap - 16) / 2)); for (k = 0; k < n; k++) addCoin(lastRowD + 9 + k * 2, ln * LW, .9); }
      if (free.length === 3) for (k = 0; k < 9; k++) addCoin(d - 9 + k * 2, Math.round(Math.sin(k * .8)) * LW, .9);
      kinds.forEach(function (kd, j) {
        if (kd === LOW && Math.random() < .75) [[-3, .85], [-1.5, 1.5], [0, 1.95], [1.5, 1.5], [3, .85]].forEach(function (c) { addCoin(d + c[0], (j - 1) * LW, c[1]); });
        else if (kd === HIGH && Math.random() < .6) [-1.2, 0, 1.2].forEach(function (o) { addCoin(d + o, (j - 1) * LW, .55); });
      });
      lastRowD = d; nextD = d + clamp(v * (2 - .75 * p) * mode.gap, 17, 48);
    }
    function rowsAhead() { var g = 0; while (nextD - D < AHEAD && g++ < 12) spawnRow(); }

    // ---- sparks and dust
    function burst(x, y, z, n, hex, spd, up) {
      if (still) return;
      var c = lin(hex), k, i;
      for (k = 0; k < n; k++) {
        i = pn++ % NP; pp[i * 3] = x; pp[i * 3 + 1] = y; pp[i * 3 + 2] = z;
        pv[i * 3] = rnd(-1, 1) * spd; pv[i * 3 + 1] = rnd(.3, 1) * spd * up; pv[i * 3 + 2] = rnd(-1, 1) * spd;
        pb[i * 3] = c.r; pb[i * 3 + 1] = c.g; pb[i * 3 + 2] = c.b; pl[i] = pmx[i] = rnd(.35, .6);
      }
    }
    function stepParticles(dt) {
      var i, f, dz = vNow * dt;
      for (i = 0; i < NP; i++) {
        if (pl[i] <= 0) { pc[i * 3] = pc[i * 3 + 1] = pc[i * 3 + 2] = 0; continue; }
        pl[i] -= dt; f = Math.max(0, pl[i] / pmx[i]); pv[i * 3 + 1] -= 7 * dt;
        pp[i * 3] += pv[i * 3] * dt; pp[i * 3 + 1] = Math.max(.02, pp[i * 3 + 1] + pv[i * 3 + 1] * dt); pp[i * 3 + 2] += pv[i * 3 + 2] * dt + dz;
        pc[i * 3] = pb[i * 3] * f; pc[i * 3 + 1] = pb[i * 3 + 1] * f; pc[i * 3 + 2] = pb[i * 3 + 2] * f;
      }
      pg.attributes.position.needsUpdate = true; pg.attributes.color.needsUpdate = true;
    }

    // ---- panel, overlay and buttons
    var ui = el('div', 'smp-ui'), skinBtns = [], modeBtns = [];
    ui.appendChild(el('h3', '', 'Naija Dash'));
    ui.appendChild(el('p', 'tag', 'A small endless runner, built from scratch for this site. Dodge crates, buses and market stalls, grab coins, and pick which of the six Naija Life characters runs.'));
    var chips = el('p', 'chips');
    ['3 lanes, endless', 'keyboard, swipe and tap', 'six playable characters', 'best score kept on this device'].forEach(function (s) { chips.appendChild(el('span', '', s)); });
    ui.appendChild(chips);
    ui.appendChild(el('p', 'smp-l', 'Runner'));
    var gs = el('div', 'smp-g'); ui.appendChild(gs);
    WHO.forEach(function (n, i) { var b = el('button', 'smp-b', n); b.type = 'button'; b.addEventListener('click', function () { setSkin(i); }); gs.appendChild(b); skinBtns.push(b); });
    ui.appendChild(el('p', 'smp-l', 'Level'));
    var gm = el('div', 'smp-g'); ui.appendChild(gm);
    MODES.forEach(function (m, i) { var b = el('button', 'smp-b', m[0]); b.type = 'button'; b.addEventListener('click', function () { setMode(i); }); gm.appendChild(b); modeBtns.push(b); });
    ui.appendChild(el('p', 'smp-l', 'Controls'));
    var keys = el('ul', 'gm-keys');
    keys.innerHTML = '<li><span><kbd>←</kbd><kbd>→</kbd> or <kbd>A</kbd><kbd>D</kbd></span>Change lane</li><li><span><kbd>↑</kbd> or <kbd>Space</kbd></span>Jump</li><li><span><kbd>↓</kbd> or <kbd>S</kbd></span>Slide</li><li><span><kbd>P</kbd></span>Pause</li><li><span>On a phone</span>Swipe, or tap to jump</li>';
    ui.appendChild(keys);
    var now = el('p', 'smp-now'); now.setAttribute('aria-live', 'polite'); ui.appendChild(now);
    var row = el('div', 'row smp-row'), mainBtn = el('button', 'mbtn', 'Start'), sndBtn = el('button', 'smp-b', ''), cta = el('a', 'btn', 'Order a game like this');
    mainBtn.type = 'button'; sndBtn.type = 'button';
    cta.href = WA + encodeURIComponent('Hi Iffy, I played your Naija Dash mini game and I would like a game like it.'); cta.target = '_blank'; cta.rel = 'noopener';
    row.appendChild(mainBtn); row.appendChild(cta); ui.appendChild(row);
    var sr = el('div', 'smp-g'); sr.style.marginTop = '14px'; sr.appendChild(sndBtn); ui.appendChild(sr);

    var hud = el('div', 'gm-hud'), top = el('div', 'gm-top'), sScore = el('span', '', 'Score '), vScore = el('b', '', '0'), sCoin = el('span', '', 'Coins '), vCoins = el('b', '', '0'), vLives = el('span', 'gm-h', '');
    hud.hidden = true; top.setAttribute('aria-hidden', 'true');
    sScore.appendChild(vScore); sCoin.appendChild(vCoins); top.appendChild(sScore); top.appendChild(sCoin); top.appendChild(vLives); hud.appendChild(top);
    var card = el('div', 'gm-card'), cTitle = el('div', 'gm-t'), cText = el('p', 'gm-p'), cBest = el('p', 'gm-b'), cBtns = el('div', 'gm-bt'), cMain = el('button', 'mbtn', 'Start'), cSide = el('button', 'smp-b', 'Restart');
    cMain.type = 'button'; cSide.type = 'button'; cBtns.appendChild(cMain); cBtns.appendChild(cSide);
    card.appendChild(cTitle); card.appendChild(cText); card.appendChild(cBest); card.appendChild(cBtns); hud.appendChild(card);
    var pad = el('div', 'gm-pad'), padL = el('div', 'gm-pg'), padR = el('div', 'gm-pg');
    function pbtn(sym, label, c) {
      var b = el('button', 'gm-pb', sym); b.type = 'button'; b.setAttribute('aria-label', label);
      b.addEventListener('pointerdown', function (e) { e.preventDefault(); cmd(c); });
      b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cmd(c); } });
      return b;
    }
    padL.appendChild(pbtn('◀', 'Move left', 'left')); padL.appendChild(pbtn('▶', 'Move right', 'right'));
    padR.appendChild(pbtn('▲', 'Jump', 'jump')); padR.appendChild(pbtn('▼', 'Slide', 'slide'));
    pad.appendChild(padL); pad.appendChild(padR); hud.appendChild(pad);
    var flashEl = el('div', 'gm-flash'); hud.appendChild(flashEl);
    // taps on the overlay buttons must not reach the stage: the page shell captures the pointer there, which would swallow the click
    [card, pad].forEach(function (n) { n.addEventListener('pointerdown', function (e) { e.stopPropagation(); }); n.addEventListener('pointerup', function (e) { e.stopPropagation(); }); });
    stage.appendChild(hud);

    function say(s) { now.textContent = s; }
    function hudAll() { vScore.textContent = sc; vCoins.textContent = coins; hudLives(); }
    function hudLives() { var mx = mode.lives, s = '', i; for (i = 0; i < mx; i++) s += i < lives ? '♥' : '♡'; vLives.textContent = s; }
    function flash() { if (still) return; flashEl.classList.add('on'); setTimeout(function () { flashEl.classList.remove('on'); }, 90); }
    function focusStage() { try { stage.focus({ preventScroll: true }); } catch (e) {} }
    function bringToView() { try { var r = stage.getBoundingClientRect(); if (r.top < 0 || r.bottom > innerHeight) stage.scrollIntoView({ block: 'center' }); } catch (e) {} }

    function refresh() {
      var playing = state === 'play' || state === 'dying', free = state === 'ready' || state === 'over';
      skinBtns.forEach(function (b, i) { b.setAttribute('aria-pressed', i === skin ? 'true' : 'false'); });
      modeBtns.forEach(function (b, i) { b.setAttribute('aria-pressed', i === modeIdx ? 'true' : 'false'); b.disabled = !free; });
      mainBtn.textContent = state === 'play' ? 'Pause' : state === 'paused' ? 'Resume' : state === 'over' ? 'Play again' : 'Start'; mainBtn.disabled = state === 'dying';
      sndBtn.textContent = snd ? 'Sound on' : 'Sound off'; sndBtn.setAttribute('aria-pressed', snd ? 'true' : 'false');
      card.hidden = playing; cSide.hidden = state !== 'paused';
      if (state === 'ready') {
        cTitle.textContent = 'Naija Dash'; cText.textContent = coarse ? 'Swipe to change lane, up to jump, down to slide. Tap to jump. Grab the coins.' : 'Arrow keys or A and D to change lane, Space to jump, Down to slide. Grab the coins.';
        cBest.textContent = best ? 'Best ' + best : ''; cMain.textContent = 'Start';
      } else if (state === 'paused') {
        cTitle.textContent = 'Paused'; cText.textContent = 'Take a breath.'; cBest.textContent = ''; cMain.textContent = 'Resume';
      } else if (state === 'over') {
        cTitle.textContent = 'Wahala!'; cText.textContent = 'You ran ' + ranD + ' m and picked up ' + coins + (coins === 1 ? ' coin.' : ' coins.');
        cBest.textContent = (newBest ? 'New best score! ' : 'Score ' + sc + '. Best ') + (newBest ? sc : best); cMain.textContent = 'Play again';
      }
      stage.classList.toggle('on', playing);
    }
    function loadBest() { best = +load('best' + modeIdx, 0) || 0; }

    // ---- character and clips
    function settle() { var i; for (i = 0; i < 30; i++) cast.update(ta, null, .05); }
    function clip(name) { if (curClip === name) return; curClip = name; cast.play(name, skin); }
    function desired() {
      if (state === 'dying' || state === 'over' || hurtT > 0) return 'wahala';
      if (state === 'ready') return still ? 'idle' : 'wave';
      if (airborne) return 'jump';
      return slideT > 0 ? 'slide' : 'run';
    }
    function setSkin(i) {
      skin = i; save('skin', i); cast.solo(i); curClip = ''; settle(); clip(desired()); refresh();
      say(WHO[i] + ' is the runner.');
    }
    function setMode(i) {
      if (state !== 'ready' && state !== 'over') return;
      modeIdx = i; mode = MODES[i][1]; save('mode', i); loadBest(); resetWorld(); state = 'ready'; refresh(); say(MODES[i][0] + ' level. Press Start.');
    }

    // ---- game flow
    function resetWorld() {
      var i;
      while (obs.length) dropObstacle(obs.length - 1);
      coinsA.length = 0;
      D = 0; time = 0; vNow = 0; px = 0; py = 0; vy = 0; lane = 0; airborne = false; slideT = 0; slideOnLand = false; buf = 0; invul = 0; hurtT = 0; shake = 0; ramp = 0; rec = 1; newBest = false;
      lives = mode.lives; coins = 0; sc = 0; ranD = 0; lastRowD = 0; nextD = 40;
      for (i = 0; i < slots.length; i++) { slots[i].d = -RECYCLE + 2 + i * CH; slots[i].L.geometry = pick(sideGeo); slots[i].R.geometry = pick(sideGeo); }
      rowsAhead(); hudAll();
    }
    function startRun(fromPanel) {
      if (state !== 'ready' && state !== 'over') return;
      if (state === 'over') resetWorld();
      state = 'play'; ramp = 0; rec = 1; refresh(); focusStage(); if (fromPanel) bringToView();
      tone(440, 880, .14, 'triangle', .06); say('Running. Change lane, jump and slide.');
    }
    function pauseGame(why) { if (state !== 'play') return; state = 'paused'; pausedBy = why || 'player'; refresh(); say('Paused.'); }
    function resumeGame() { if (state !== 'paused') return; state = 'play'; ramp = .2; refresh(); focusStage(); say('Running.'); }
    function restartRun() { state = 'ready'; resetWorld(); startRun(); }
    function die() {
      ranD = Math.floor(D); sc = ranD + coins * 10; vScore.textContent = sc;   // the world keeps rolling for a moment, so fix the result now
      state = 'dying'; deadT = 0; shake = 1; refresh(); tone(330, 70, .7, 'triangle', .07, .1);
    }
    function finish() {
      state = 'over'; newBest = sc > best;
      if (newBest) { best = sc; save('best' + modeIdx, best); }
      refresh(); say('Game over. Score ' + sc + '. ' + (newBest ? 'New best score.' : 'Best ' + best + '.'));
    }
    function doJump() {
      if (airborne) { buf = .14; return; }
      airborne = true; vy = V0; slideT = 0; slideOnLand = false; tone(300, 640, .14, 'triangle', .07); burst(px, .1, 0, 4, '#d9c7a8', 1.2, .8);
    }
    function doSlide() {
      if (airborne) { vy = Math.min(vy, -17); slideOnLand = true; return; }
      if (slideT <= 0) tone(520, 190, .2, 'sawtooth', .03);
      slideT = SLIDE_T;
    }
    function landed() {
      burst(px, .1, 0, 5, '#d9c7a8', 1.4, .8);
      if (slideOnLand) { slideOnLand = false; slideT = SLIDE_T; } else if (buf > 0) { buf = 0; doJump(); }
    }
    function cmd(c) {
      if (state !== 'play') return;
      if (c === 'left' || c === 'right') { var n = clamp(lane + (c === 'left' ? -1 : 1), -1, 1); if (n !== lane) { lane = n; tone(240, 330, .07, 'square', .02); } }
      else if (c === 'jump') doJump();
      else if (c === 'slide') doSlide();
      else if (c === 'pause') pauseGame();
    }
    function shove(o) {   // after a bus: step into a free lane, nearest first
      var best2 = lane, bd = 9, l, k, free, d;
      for (l = -1; l <= 1; l++) {
        free = true;
        for (k = 0; k < obs.length; k++) if (obs[k].lane === l && !obs[k].hit && obs[k].kind === BUS && Math.abs(D - obs[k].d) < obs[k].hd + 2.4) free = false;
        d = Math.abs(l - lane); if (free && d < bd && l !== o.lane) { bd = d; best2 = l; }
      }
      lane = best2;
    }
    function hurt(o) {
      lives--; invul = 1.7; hurtT = .55; rec = 0; shake = 1; hudLives(); flash(); burst(px, 1, 0, 14, '#ff6a3a', 3.4, 1.2); tone(190, 55, .3, 'sawtooth', .08);
      if (o.kind === BUS) shove(o); else o.smash = .001;
      if (lives <= 0) die(); else say('Hit. ' + lives + (lives === 1 ? ' life left.' : ' lives left.'));
    }
    function collide() {
      var i, o, dz, top = py + (slideT > 0 ? .85 : 1.7), bot = py, hit;
      for (i = 0; i < obs.length; i++) {
        o = obs[i]; if (o.hit) continue;
        dz = D - o.d; if (dz > o.hd + .25 || dz < -(o.hd + .25)) continue;
        if (Math.abs(px - o.x) > o.hw + .28) continue;
        hit = o.kind === LOW ? bot < o.top - .12 : o.kind === HIGH ? top > o.lo && bot < o.top : true;
        if (hit) { o.hit = true; if (invul <= 0) { hurt(o); if (state !== 'play') return; } }
      }
    }
    function gather() {
      var i, c, z, cy = py + (slideT > 0 ? .45 : .9);
      for (i = coinsA.length - 1; i >= 0; i--) {
        c = coinsA[i]; z = D - c.d;
        if (z > -.85 && z < .85 && Math.abs(c.x - px) < .8 && Math.abs(c.y - cy) < .95) {
          coinsA.splice(i, 1); coins++; vCoins.textContent = coins; burst(c.x, c.y, z, 5, '#ffd23a', 2.2, 1); tone(880, 1320, .09, 'square', .03);
        }
      }
    }

    function stepGame(dt) {
      var base;
      if (state === 'play') {
        time += dt; ramp = Math.min(1, ramp + dt / 1.2); rec = Math.min(1, rec + dt / 1.5);
        base = mode.v0 + (mode.vmax - mode.v0) * (1 - Math.exp(-time / 55));
        vNow = base * (.25 + .75 * ramp * ramp * (3 - 2 * ramp)) * (.6 + .4 * rec);
        px += (lane * LW - px) * (1 - Math.exp(-dt * 15));
        if (airborne) { vy -= G * dt; py += vy * dt; if (py <= 0) { py = 0; vy = 0; airborne = false; landed(); } }
        if (slideT > 0) slideT = Math.max(0, slideT - dt);
        buf = Math.max(0, buf - dt); invul = Math.max(0, invul - dt); hurtT = Math.max(0, hurtT - dt);
        D += vNow * dt; collide();
        if (state === 'play') { gather(); sc = Math.floor(D) + coins * 10; vScore.textContent = sc; }
      } else if (state === 'dying') {
        vNow *= Math.exp(-dt * 3.4); D += vNow * dt; deadT += dt; hurtT = 1;
        if (airborne) { vy -= G * dt; py += vy * dt; if (py <= 0) { py = 0; vy = 0; airborne = false; } }
        if (deadT > 1.25) finish();
      } else vNow = 0;
      rowsAhead();
    }

    // ---- placing everything for the current distance
    var sizeKey = '';
    function fitCam() {
      dCam = clamp(3.6 / (Math.tan(cam.fov * PI / 360) * aspect), 6.8, 15); camH = 3.15 + .1 * (dCam - 6.8);   // 3.6 m each side of the middle must stay in view: the road and its edge
    }
    function place(dt) {
      var i, s, o, z, c, n = 0, k, sx = 0, sy = 0, bank;
      roadTex.offset.y = (D / PERIOD) % 1; paveTex.offset.y = (D / PAVE) % 1;
      for (i = 0; i < slots.length; i++) {
        s = slots[i];
        if (D - s.d > RECYCLE) { s.d += NSLOT * CH; s.L.geometry = pick(sideGeo); s.R.geometry = pick(sideGeo); }
        s.L.position.z = s.R.position.z = D - s.d;
      }
      for (i = obs.length - 1; i >= 0; i--) {
        o = obs[i]; z = D - o.d;
        if (z > BEHIND) { dropObstacle(i); continue; }
        if (o.smash > 0 && o.smash < 1 && state !== 'paused') {
          o.smash = Math.min(1, o.smash + dt / .32); k = o.smash;
          o.mesh.position.y = k * 1.4; o.mesh.rotation.z = k * (o.lane >= 0 ? -1.3 : 1.3); o.mesh.scale.setScalar(1 - k * .7); if (k >= 1) o.mesh.visible = false;
        }
        o.mesh.position.z = z;
      }
      for (i = 0; i < coinsA.length; i++) {
        c = coinsA[i]; z = D - c.d;
        if (z > 2.4) { coinsA.splice(i, 1); i--; continue; }   // gone as soon as it is past the runner, so none float in front of the camera
        m4.makeRotationY(tt * 3.2 + c.d * .7); m4.setPosition(c.x, c.y + Math.sin(tt * 3 + c.d) * .06, z); coinMesh.setMatrixAt(n++, m4);
      }
      coinMesh.count = n; coinMesh.instanceMatrix.needsUpdate = true;
      // runner
      bank = clamp((lane * LW - px) * .2, -.35, .35);
      cast.group.position.set(px, py, 0); cast.group.rotation.set(0, PI - bank * 1.2, bank);
      cast.group.visible = !(invul > 0 && !still && Math.floor(tt * 14) % 2);
      blob.position.x = px; blob.material.opacity = 1 - clamp(py / 2.4, 0, .65); blob.scale.setScalar(1 - clamp(py / 5, 0, .3));
      // camera
      if (shake > 0) { shake = Math.max(0, shake - dt * 2.4); if (!still) { sx = (Math.random() - .5) * shake * .5; sy = (Math.random() - .5) * shake * .35; } }
      cam.position.set(px * .5 + sx + (state === 'ready' && !still ? Math.sin(tt * .5) * .5 : 0), camH + py * .3 + sy, dCam);
      cam.lookAt(px * .3, 1, -10);
      sky.position.copy(cam.position);
      skyFar.position.set(cam.position.x * .85, 12, cam.position.z - skyFar.userData.dist); skyNear.position.set(cam.position.x * .7, 9.5, cam.position.z - skyNear.userData.dist);
      stepParticles(dt);
    }

    function update(t, dt) {
      if (away) { away = false; pauseGame('away'); }   // the stage was hidden, scrolled off screen or lost its graphics context since the last frame
      if (state !== 'paused') { tt += dt; ta += dt * (state === 'play' ? .85 + .45 * clamp(vNow / mode.vmax, 0, 1) : 1); }
      stepGame(dt); clip(desired()); place(dt);
      cast.update(ta, null, state === 'paused' ? 0 : dt);
    }
    function resize(w, h) { aspect = w / h; cam.aspect = aspect; cam.updateProjectionMatrix(); fitCam(); }

    // ---- input: keys, swipes, taps, buttons
    function onKey(e) {
      if (!active || e.ctrlKey || e.metaKey || e.altKey) return;
      var tg = e.target, tag = tg && tg.tagName, k = e.key && e.key.length === 1 ? e.key.toLowerCase() : e.key, c = KEYS[k];
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (tg && tg.isContentEditable)) return;
      if (state === 'play') {
        if (!c) return;
        e.preventDefault(); if (e.repeat) return;
        cmd(c);
      } else if (state === 'paused') {
        if (c === 'pause' || (k === 'Enter' && tag !== 'BUTTON')) { e.preventDefault(); resumeGame(); }
      } else if ((state === 'ready' || state === 'over') && (k === 'Enter' || k === ' ') && document.activeElement === stage) {
        e.preventDefault(); startRun();
      }
    }
    addEventListener('keydown', onKey);
    addEventListener('keyup', function (e) { if (active && state === 'play' && e.key === ' ' && e.target && e.target.tagName === 'BUTTON') e.preventDefault(); });
    addEventListener('blur', function () { if (state === 'play') pauseGame('blur'); });
    // leaving the screen (another page, another tab of the browser, scrolled away) pauses a run at once, so keys on other pages are never taken
    if (window.IntersectionObserver) new IntersectionObserver(function (e) { if (!e[e.length - 1].isIntersecting) { away = true; pauseGame('away'); } }).observe(stage);
    document.addEventListener('visibilitychange', function () { if (document.hidden) { away = true; pauseGame('away'); } });
    var sw = null;
    stage.addEventListener('pointerdown', function (e) {
      if (!active || (e.pointerType === 'mouse' && e.button !== 0)) return;
      sw = { id: e.pointerId, x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, t: e.timeStamp, moved: false };   // event times, not "now": a slow frame must not turn a tap into a long press
    });
    stage.addEventListener('pointermove', function (e) {
      if (!sw || sw.id !== e.pointerId || sw.moved || state !== 'play') return;
      var dx = e.clientX - sw.x, dy = e.clientY - sw.y, th = Math.max(26, Math.min(stage.clientWidth, stage.clientHeight) * .07);
      if (Math.abs(dx) < th && Math.abs(dy) < th) return;
      sw.moved = true;   // one move per swipe: lift the finger for the next one
      if (Math.abs(dx) > Math.abs(dy)) cmd(dx < 0 ? 'left' : 'right'); else cmd(dy < 0 ? 'jump' : 'slide');
    });
    function swEnd(e) {
      var s = sw; if (!s || s.id !== e.pointerId) return; sw = null;
      if (!active || e.type === 'pointercancel' || s.moved) return;
      if (Math.hypot(e.clientX - s.x0, e.clientY - s.y0) > 14 || e.timeStamp - s.t > 450) return;
      if (state === 'play') cmd('jump'); else if (state === 'ready' || state === 'over') startRun(); else if (state === 'paused') resumeGame();
    }
    stage.addEventListener('pointerup', swEnd); stage.addEventListener('pointercancel', swEnd);
    mainBtn.addEventListener('click', function () {
      if (state === 'play') pauseGame(); else if (state === 'paused') resumeGame(); else startRun(true);
    });
    cMain.addEventListener('click', function () { if (state === 'paused') resumeGame(); else startRun(); });
    cSide.addEventListener('click', restartRun);
    sndBtn.addEventListener('click', function () { snd = !snd; save('snd', snd ? 1 : 0); refresh(); tone(660, 990, .1, 'triangle', .05); });

    function show() { active = true; hud.hidden = false; stage.classList.add('gm'); stage.setAttribute('tabindex', '-1'); hintEl.textContent = hintText; refresh(); }
    function hide() { active = false; if (state === 'play') pauseGame('hide'); hud.hidden = true; stage.classList.remove('gm', 'on'); stage.removeAttribute('tabindex'); }
    function dbg() {
      return {
        state: state, pausedBy: pausedBy, lives: lives, coins: coins, score: sc, D: D, v: vNow, lane: lane, px: px, py: py, airborne: airborne, sliding: slideT > 0, invul: invul, skin: skin, mode: modeIdx, best: best, time: time,
        obs: obs.map(function (o) { return { k: o.kind, lane: o.lane, z: D - o.d, hit: o.hit }; }), coinsAhead: coinsA.length, calls: ctx.renderer.info.render.calls, triangles: ctx.renderer.info.render.triangles
      };
    }

    mode = MODES[modeIdx][1]; loadBest(); fitCam(); cast.solo(skin); resetWorld(); settle(); clip(desired()); refresh(); say('Ready. Press Start.');
    return { ui: ui, scene: scene, camera: cam, update: update, resize: resize, restore: function (pm) { cast.restore(pm); away = true; }, show: show, hide: hide, hint: hintText, dbg: dbg };
  } });
})();
