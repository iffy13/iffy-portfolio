/* Sample 4: low-poly 3D asset kit. Nine game props built from code (chest, sword in stone, potion, lantern, mushroom,
   crystals, pine tree, cottage, barrel) shown on a turntable. Pick a prop or the whole kit, switch between shaded, clay and
   wireframe views, break a prop into its parts and re-colour the whole kit with a palette. The triangle and vertex counts
   are measured from the real meshes. Everything is original work made for this site. Registered with js/samples.js. */
(function () {
  'use strict';
  if (!window.IFFY_SAMPLES) return;
  var PI = Math.PI, TAU = PI * 2, WA = 'https://wa.me/2348075889359?text=';

  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt) e.textContent = txt; return e; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function wrap(a) { return ((a + PI) % TAU + TAU) % TAU - PI; }

  // material slots: [roughness, metalness, emissive strength, glass]. A prop only says which slot a part uses, the palette decides the colour.
  var SLOTS = {
    wood: [.85, 0], wood2: [.9, 0], metal: [.58, .8], dark: [.55, .6], gold: [.4, .9], stone: [.95, 0], leaf: [.85, 0], cloth: [.9, 0],
    accent: [.6, 0], accent2: [.55, 0], cream: [.85, 0], white: [.7, 0], glow: [.4, 0, 1.3], glow2: [.4, 0, 1.2], crystal: [.15, .2, .4], glass: [.1, 0, 0, 1]
  };
  var PALETTES = [
    ['Forest', { wood: '#8a5a34', wood2: '#5a3a23', metal: '#8e99a5', dark: '#3a3f47', gold: '#f0b030', stone: '#8a8f98', leaf: '#3f9a4a', cloth: '#3a78b8', accent: '#d8483c', accent2: '#e8873a', cream: '#efe3c8', white: '#f4f1e8', glow: '#ffcf55', glow2: '#7be05a', crystal: '#5fd0ff', glass: '#cfe8ff' }],
    ['Desert', { wood: '#b8803f', wood2: '#7a4f26', metal: '#a89a85', dark: '#4a3b30', gold: '#f5c04a', stone: '#c9a87c', leaf: '#9aa84a', cloth: '#c0502e', accent: '#d9602a', accent2: '#f0a040', cream: '#f3e2bd', white: '#fbf3de', glow: '#ffb347', glow2: '#ff7a50', crystal: '#ff9a6a', glass: '#ffe9cf' }],
    ['Frost', { wood: '#6c7f99', wood2: '#3f4e66', metal: '#a9b7c6', dark: '#2b3544', gold: '#bfe1ff', stone: '#9fb4c8', leaf: '#2f7f6f', cloth: '#4a8fd0', accent: '#4aa3ff', accent2: '#8fd0ff', cream: '#e8f1fa', white: '#ffffff', glow: '#aee6ff', glow2: '#6ad0ff', crystal: '#8fe8ff', glass: '#e4f4ff' }],
    ['Candy', { wood: '#c06a9a', wood2: '#7a3a6a', metal: '#b9a8d0', dark: '#4a3060', gold: '#ffd05a', stone: '#b9a0d8', leaf: '#5ed0a0', cloth: '#6a8cff', accent: '#ff5aa0', accent2: '#ffa060', cream: '#fff0f6', white: '#ffffff', glow: '#ffe36a', glow2: '#7aff9a', crystal: '#ff7ad8', glass: '#ffe4f6' }]
  ];

  IFFY_SAMPLES.add({ id: 'assets', tab: '3D asset kit', mount: function (ctx) {
    var THREE = ctx.THREE, scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(34, 1.4, .1, 200), pmrem = ctx.pmrem, halfT = Math.tan(cam.fov * PI / 360), aspect = 1.4;
    function col(hex) { return new THREE.Color(hex).convertSRGBToLinear(); }

    // ---- lighting: a small studio baked into an environment map (as the cast does), plus a key and a warm rim light
    function makeEnv() {
      var es = new THREE.Scene(); es.background = new THREE.Color(0x1e1a18);
      [[0xfff2e0, 2.1, [0, 6.5, 5], [7, 1.2, 7]], [0xe9edff, .8, [-7, 1.5, 3], [1.2, 4, 4]], [0xff8a2a, 2, [6.5, 2, -3.5], [1.5, 4, 4]], [0xffe8d0, 1.5, [-6, 2.5, -4], [1.5, 4, 4]], [0xb9a98f, .45, [0, -4, 2], [6, .6, 6]]].forEach(function (l) {
        var m = new THREE.Mesh(new THREE.BoxGeometry(l[3][0], l[3][1], l[3][2]), new THREE.MeshBasicMaterial({ color: new THREE.Color(l[0]).multiplyScalar(l[1]) }));
        m.position.set(l[2][0], l[2][1], l[2][2]); es.add(m);
      });
      return pmrem.fromScene(es, .04).texture;
    }
    var env = makeEnv(); scene.environment = env;
    var key = new THREE.DirectionalLight(0xfff0e0, .85); key.position.set(4, 9, 6); scene.add(key);
    var rim = new THREE.DirectionalLight(0xff9a50, .7); rim.position.set(-6, 4, -5); scene.add(rim);
    scene.add(new THREE.HemisphereLight(0xdfe8ff, 0x2a1a10, .3));

    // ---- materials: one per slot (the palette sets the colours), plus the clay and wireframe looks
    var slotMat = {}, allMeshes = [];
    Object.keys(SLOTS).forEach(function (k) {
      var d = SLOTS[k], m = new THREE.MeshStandardMaterial({ roughness: d[0], metalness: d[1], flatShading: true, envMapIntensity: d[1] > .5 ? .5 : .7 });
      m.userData.glow = d[2] || 0; m.emissiveIntensity = d[2] || 1;
      if (d[3]) { m.transparent = true; m.opacity = .38; m.depthWrite = false; }
      slotMat[k] = m;
    });
    var clayMat = new THREE.MeshStandardMaterial({ color: col('#b5a999'), roughness: .92, metalness: 0, flatShading: true, envMapIntensity: .6 });
    var clayGlass = new THREE.MeshStandardMaterial({ color: col('#b5a999'), roughness: .9, metalness: 0, flatShading: true, envMapIntensity: .6, transparent: true, opacity: .4, depthWrite: false });
    var darkMat = new THREE.MeshStandardMaterial({ color: col('#1d130c'), roughness: .85, metalness: .2, flatShading: true, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
    var ghostMat = new THREE.MeshBasicMaterial({ color: col('#1d130c'), transparent: true, opacity: .16, depthWrite: false });
    var wireMat = new THREE.MeshBasicMaterial({ color: col('#ffb13b'), wireframe: true, transparent: true, opacity: .9 });
    function applyPalette(i) {
      var P = PALETTES[i][1];
      Object.keys(slotMat).forEach(function (k) { var c = col(P[k]); slotMat[k].color.copy(c); if (SLOTS[k][2]) slotMat[k].emissive.copy(c); });
    }

    // ---- small geometry and transform helpers
    function box(w, h, d) { return new THREE.BoxGeometry(w, h, d); }
    function cyl(rt, rb, h, s, open, ts, tl) { return new THREE.CylinderGeometry(rt, rb, h, s || 8, 1, !!open, ts || 0, tl || TAU); }
    function cone(r, h, s) { return new THREE.ConeGeometry(r, h, s || 8, 1); }
    function ico(r, d) { return new THREE.IcosahedronGeometry(r, d || 0); }
    function oct(r) { return new THREE.OctahedronGeometry(r, 0); }
    function sph(r, ws, hs, ps, pl, ts, tl) { return new THREE.SphereGeometry(r, ws, hs, ps, pl, ts, tl); }
    function lathe(pts, s) { return new THREE.LatheGeometry(pts.map(function (p) { return new THREE.Vector2(p[0], p[1]); }), s || 8); }
    function tor(R, r, rs, ts) { return new THREE.TorusGeometry(R, r, rs || 4, ts || 8); }
    function prism(w, h, len) {   // triangle prism, ridge along x, apex up, base on y = 0
      var sh = new THREE.Shape(); sh.moveTo(-w / 2, 0); sh.lineTo(w / 2, 0); sh.lineTo(0, h); sh.closePath();
      var g = new THREE.ExtrudeGeometry(sh, { depth: len, bevelEnabled: false }); g.translate(0, 0, -len / 2); g.rotateY(PI / 2); return g;
    }
    var _e = new THREE.Euler(), _q = new THREE.Quaternion(), _p = new THREE.Vector3(), _s = new THREE.Vector3();
    function mat4(x, y, z, rx, ry, rz, sx, sy, sz) {
      _e.set(rx || 0, ry || 0, rz || 0); _q.setFromEuler(_e); _p.set(x || 0, y || 0, z || 0);
      var s0 = sx === undefined ? 1 : sx; _s.set(s0, sy === undefined ? s0 : sy, sz === undefined ? s0 : sz);
      return new THREE.Matrix4().compose(_p, _q, _s);
    }
    // a part is a group of primitives that move together (and fly apart in the exploded view)
    function Part(name, ex, home, rot, solo) { this.name = name; this.ex = ex || [0, .6, 0]; this.home = home || [0, 0, 0]; this.rot = rot || [0, 0, 0]; this.solo = !!solo; this.prims = []; }
    Part.prototype.a = function (slot, geo, x, y, z, rx, ry, rz, sx, sy, sz) { this.prims.push({ s: slot, g: geo, m: mat4(x, y, z, rx, ry, rz, sx, sy, sz) }); return this; };

    // ---- the nine props. Base on y = 0, centred, front towards +z.
    var DEFS = [];

    DEFS.push({ id: 'chest', name: 'Treasure chest', btn: 'Chest', make: function () {
      var body = new Part('Body', [0, -.25, 0]), lid = new Part('Lid', [0, .9, -.3], [0, .74, -.5], [-.5, 0, 0]), loot = new Part('Treasure', [0, .6, 0], [0, .74, 0]), sx, sz;
      body.a('wood', box(1.6, .74, 1), 0, .37, 0).a('wood2', box(1.7, .1, 1.1), 0, .05, 0);
      for (sx = -1; sx <= 1; sx += 2) { for (sz = -1; sz <= 1; sz += 2) body.a('metal', box(.12, .76, .12), sx * .74, .38, sz * .44); body.a('metal', box(.1, .78, 1.04), sx * .4, .38, 0); }
      body.a('gold', box(.3, .32, .07), 0, .6, .52).a('dark', box(.07, .13, .02), 0, .58, .56);
      lid.a('wood', cyl(.5, .5, 1.6, 8, 0, 0, PI), 0, 0, .5, 0, 0, PI / 2).a('wood2', box(1.6, .04, 1), 0, 0, .5).a('gold', box(.2, .26, .05), 0, .04, 1.02);
      for (sx = -1; sx <= 1; sx += 2) lid.a('metal', cyl(.53, .53, .14, 8, 0, 0, PI), sx * .4, 0, .5, 0, 0, PI / 2);
      loot.a('gold', ico(.5, 1), 0, .1, 0, 0, 0, 0, 1.4, .45, .85)
        .a('gold', cyl(.14, .14, .03, 8), .45, .3, .2, .5, 0, .4).a('gold', cyl(.14, .14, .03, 8), -.4, .28, .15, -.4, 0, -.5).a('gold', cyl(.14, .14, .03, 8), .1, .34, .3, .3, 0, .1)
        .a('gold', cyl(.14, .14, .03, 8), -.15, .33, -.1, 0, 0, .3).a('gold', cyl(.14, .14, .03, 8), .62, .22, -.2, .2, 0, .8)
        .a('glow2', oct(.11), .25, .38, .05).a('accent', oct(.09), -.32, .33, .26).a('crystal', oct(.1), -.05, .42, -.15);
      return [body, lid, loot];
    } });

    DEFS.push({ id: 'sword', name: 'Sword in stone', btn: 'Sword', make: function () {
      var stone = new Part('Stone', [0, -.2, 0]), blade = new Part('Blade', [0, .6, 0]), guard = new Part('Guard', [0, 1.1, 0]), hilt = new Part('Hilt', [0, 1.6, 0]);
      stone.a('stone', ico(.85, 1), 0, .2, 0, 0, .3, 0, 1.25, .75, 1.1).a('stone', ico(.32, 0), .95, .12, .35, 0, .5, 0, 1, .8, 1).a('stone', ico(.26, 0), -.85, .1, -.4, 0, 1, 0, 1, .8, 1)
        .a('stone', ico(.2, 0), -.5, .08, .75).a('leaf', ico(.5, 0), .1, .78, .15, 0, 0, 0, 1.1, .3, 1)
        .a('leaf', cone(.05, .3, 4), .9, .15, -.1).a('leaf', cone(.05, .24, 4), .8, .12, -.22).a('leaf', cone(.05, .3, 4), -.9, .15, .2).a('leaf', cone(.05, .26, 4), .25, .13, -.95).a('leaf', cone(.05, .28, 4), -.3, .14, .95);
      blade.a('metal', box(.2, 1.25, .05), 0, 1.225, 0).a('dark', box(.045, .9, .062), 0, 1.3, 0);
      guard.a('gold', box(.95, .11, .15), 0, 1.93, 0).a('gold', oct(.1), -.52, 1.93, 0, 0, 0, 0, 1, 1.3, 1).a('gold', oct(.1), .52, 1.93, 0, 0, 0, 0, 1, 1.3, 1).a('glow2', oct(.11), 0, 1.93, .1);
      hilt.a('wood2', cyl(.06, .06, .52, 6), 0, 2.25, 0).a('cloth', cyl(.075, .075, .05, 6), 0, 2.08, 0).a('cloth', cyl(.075, .075, .05, 6), 0, 2.25, 0).a('cloth', cyl(.075, .075, .05, 6), 0, 2.42, 0).a('gold', ico(.12, 0), 0, 2.58, 0);
      return [stone, blade, guard, hilt];
    } });

    DEFS.push({ id: 'potion', name: 'Potion', btn: 'Potion', make: function () {
      var bottle = new Part('Bottle', [0, 0, 0]), liquid = new Part('Liquid', [0, .3, 0]), cork = new Part('Cork', [0, .7, 0]), bub = new Part('Bubbles', [0, .5, 0], null, null, true);
      bottle.a('glass', lathe([[0, 0], [.42, 0], [.6, .1], [.68, .35], [.6, .62], [.38, .85], [.22, 1], [.22, 1.28], [.3, 1.34], [.3, 1.42]], 8));
      liquid.a('glow2', lathe([[0, .04], [.38, .04], [.56, .12], [.63, .35], [.56, .6], [0, .62]], 8));
      cork.a('wood', cyl(.22, .18, .3, 7), 0, 1.53, 0).a('accent2', tor(.25, .03, 4, 8), 0, 1.25, 0, PI / 2, 0, 0);
      bub.a('white', ico(.09, 0), .15, .25, .1).a('white', ico(.07, 0), -.2, .4, -.15).a('white', ico(.06, 0), .05, .5, -.25).a('white', ico(.08, 0), -.1, .18, .25);
      return [bottle, liquid, cork, bub];
    } });

    DEFS.push({ id: 'lantern', name: 'Lantern', btn: 'Lantern', make: function () {
      var cage = new Part('Cage', [0, -.15, 0]), roof = new Part('Roof', [0, .8, 0]), handle = new Part('Handle', [0, 1.4, 0]), glass = new Part('Glass', [0, .3, 0]), candle = new Part('Candle', [0, .55, 0]), k, a;
      cage.a('dark', cyl(.5, .56, .16, 6), 0, .08, 0).a('dark', cyl(.42, .42, .06, 6), 0, .19, 0).a('dark', cyl(.5, .46, .1, 6), 0, 1.24, 0);
      for (k = 0; k < 6; k++) { a = k * PI / 3; cage.a('dark', box(.07, 1, .07), Math.sin(a) * .42, .72, Math.cos(a) * .42); }
      roof.a('dark', cone(.62, .4, 6), 0, 1.49, 0).a('gold', oct(.08), 0, 1.74, 0, 0, 0, 0, 1, 1.4, 1);
      handle.a('gold', tor(.22, .03, 4, 10), 0, 1.95, 0);
      glass.a('glass', cyl(.43, .43, 1, 6, true), 0, .72, 0);
      candle.a('cream', cyl(.11, .11, .4, 7), 0, .43, 0).a('glow', ico(.15, 0), 0, .78, 0, 0, 0, 0, .9, 1.5, .9);
      return [cage, roof, handle, glass, candle];
    } });

    DEFS.push({ id: 'mushroom', name: 'Mushroom', btn: 'Mushroom', make: function () {
      var stem = new Part('Stem', [0, -.05, 0]), cap = new Part('Cap', [0, .9, 0]), baby = new Part('Baby', [.6, .2, .5], [.85, 0, .5]), grass = new Part('Grass', [0, .15, 0]), k, a;
      function shroom(p, s, ox, oz, spots) {
        p.a('cream', lathe([[0, 0], [.3, 0], [.28, .12], [.22, .4], [.2, .7], [.26, .86], [0, .86]], 7), ox, 0, oz, 0, 0, 0, s);
        return p;
      }
      function capOf(p, s, ox, oz, spots) {
        p.a('accent', sph(.95, 9, 5, 0, TAU, 0, PI / 2), ox, .8 * s, oz, 0, 0, 0, s, s * .75, s).a('cloth', cyl(.94, .2, .1, 9), ox, .78 * s, oz, 0, 0, 0, s);
        spots.forEach(function (q) { p.a('white', ico(q[3], 0), ox + q[0] * s, q[1] * s, oz + q[2] * s, 0, 0, 0, s, s * .6, s); });
      }
      shroom(stem, 1, 0, 0);
      capOf(cap, 1, 0, 0, [[0, 1.5, 0, .2], [0, 1.33, .64, .15], [.6, 1.3, -.25, .16], [-.55, 1.32, -.3, .14], [-.5, 1.15, .65, .13], [.6, 1.14, .55, .12]]);
      shroom(baby, .45, 0, 0); capOf(baby, .45, 0, 0, [[0, 1.5, 0, .22], [.4, 1.3, .3, .16], [-.4, 1.3, -.2, .15]]);
      for (k = 0; k < 7; k++) { a = k * 2.3; grass.a('leaf', cone(.07, .42, 4), Math.sin(a) * (.55 + (k % 3) * .15), .2, Math.cos(a) * (.55 + (k % 3) * .15), Math.sin(a) * .25, 0, Math.cos(a) * .25); }
      return [stem, cap, baby, grass];
    } });

    DEFS.push({ id: 'crystals', name: 'Crystal cluster', btn: 'Crystals', make: function () {
      var rock = new Part('Rock', [0, -.25, 0]), parts = [rock];
      rock.a('stone', ico(.9, 1), 0, .05, 0, 0, 0, 0, 1.35, .38, 1.25).a('stone', ico(.3, 0), .95, .1, .4).a('stone', ico(.24, 0), -.9, .08, -.35, 0, .8, 0).a('leaf', ico(.35, 0), .4, .2, .8, 0, 0, 0, 1, .4, 1);
      [['Main', 'crystal', [0, .1, 0], [0, 0, .06], .34, 1.35, .55, [0, 1.1, 0]], ['Left', 'glow2', [.55, .1, .2], [.2, 0, -.35], .24, .8, .4, [.8, .5, .2]], ['Right', 'crystal', [-.5, .1, .15], [-.1, 0, .4], .26, .95, .45, [-.8, .5, .2]],
        ['Back', 'crystal', [.1, .1, -.5], [-.4, 0, -.05], .2, .6, .34, [.1, .5, -.9]], ['Front', 'glow2', [.3, .1, .6], [.5, 0, .15], .15, .4, .26, [.3, .4, .9]]].forEach(function (c) {
        parts.push(new Part(c[0], c[7], c[2], c[3]).a(c[1], cyl(c[4] * .95, c[4], c[5], 6), 0, c[5] / 2, 0).a(c[1], cone(c[4] * .95, c[6], 6), 0, c[5] + c[6] / 2, 0));
      });
      return parts;
    } });

    DEFS.push({ id: 'pine', name: 'Pine tree', btn: 'Pine', make: function () {
      var ground = new Part('Ground', [0, -.3, 0]), trunk = new Part('Trunk', [0, -.05, 0]), t1 = new Part('Tier 1', [0, .5, 0]), t2 = new Part('Tier 2', [0, .95, 0]), t3 = new Part('Tier 3', [0, 1.4, 0]);
      ground.a('leaf', cyl(1.05, 1.15, .14, 9), 0, .07, 0).a('stone', ico(.25, 0), .7, .2, .5).a('stone', ico(.18, 0), -.7, .14, .6).a('leaf', cone(.06, .3, 4), .5, .28, -.7).a('leaf', cone(.06, .26, 4), -.6, .27, -.5);
      trunk.a('wood2', cyl(.14, .2, .8, 6), 0, .55, 0);
      t1.a('leaf', cone(1, 1, 7), 0, 1.15, 0, 0, .2, 0).a('white', cone(.5, .52, 7), 0, 1.46, 0, 0, .2, 0);
      t2.a('leaf', cone(.78, .9, 7), 0, 1.7, 0, 0, .6, 0).a('white', cone(.42, .5, 7), 0, 1.95, 0, 0, .6, 0);
      t3.a('leaf', cone(.55, .85, 7), 0, 2.2, 0, 0, .3, 0).a('white', cone(.34, .45, 7), 0, 2.4, 0, 0, .3, 0);
      return [ground, trunk, t1, t2, t3];
    } });

    DEFS.push({ id: 'cottage', name: 'Cottage', btn: 'Cottage', make: function () {
      var base = new Part('Base', [0, -.2, 0]), walls = new Part('Walls', [0, 0, 0]), roof = new Part('Roof', [0, .9, 0]), chim = new Part('Chimney', [.5, 1.3, 0]), door = new Part('Door', [0, 0, .8]), win = new Part('Windows', [0, 0, .9]), smoke = new Part('Smoke', [.3, .5, 0], null, null, true), sx, sz, al = Math.atan(.85 / .95);
      base.a('stone', box(2, .22, 1.6), 0, .11, 0).a('stone', box(.6, .1, .3), 0, .05, .95);
      walls.a('cream', box(1.8, 1, 1.4), 0, .72, 0).a('wood2', box(1.84, .08, 1.44), 0, .45, 0).a('cream', prism(1.4, .627, 1.84), 0, 1.22, 0);
      for (sx = -1; sx <= 1; sx += 2) for (sz = -1; sz <= 1; sz += 2) walls.a('wood2', box(.1, 1.02, .1), sx * .9, .72, sz * .7);
      roof.a('accent', box(2.3, .09, 1.38), 0, 1.42, .475, al, 0, 0).a('accent', box(2.3, .09, 1.38), 0, 1.42, -.475, -al, 0, 0).a('wood2', box(2.34, .1, .14), 0, 1.86, 0);
      chim.a('stone', box(.3, .7, .3), .55, 1.72, -.25).a('dark', box(.38, .07, .38), .55, 2.1, -.25);
      door.a('wood', box(.52, .8, .04), 0, .62, .71).a('wood2', box(.42, .72, .06), 0, .58, .72).a('gold', ico(.035, 0), .13, .58, .76);
      for (sx = -1; sx <= 1; sx += 2) win.a('wood2', box(.4, .4, .05), sx * .6, .82, .71).a('glow', box(.3, .3, .05), sx * .6, .82, .73).a('wood2', box(.32, .03, .06), sx * .6, .82, .74).a('wood2', box(.03, .32, .06), sx * .6, .82, .74);
      smoke.a('white', ico(.12, 0), .55, 2.3, -.25).a('white', ico(.1, 0), .6, 2.6, -.2).a('white', ico(.08, 0), .66, 2.9, -.15);
      return [base, walls, roof, chim, door, win, smoke];
    } });

    DEFS.push({ id: 'barrel', name: 'Barrel', btn: 'Barrel', make: function () {
      var staves = new Part('Staves', [0, 0, 0]), hoops = new Part('Hoops', [0, 0, 0]), lid = new Part('Lid', [0, .9, 0]);
      staves.a('wood', lathe([[0, 0], [.5, 0], [.62, .35], [.66, .7], [.62, 1.05], [.5, 1.4]], 8));
      hoops.a('metal', cyl(.57, .57, .1, 8), 0, .14, 0).a('metal', cyl(.69, .69, .1, 8), 0, .7, 0).a('metal', cyl(.57, .57, .1, 8), 0, 1.26, 0);
      lid.a('wood2', cyl(.5, .5, .06, 8), 0, 1.4, 0).a('dark', cyl(.07, .07, .05, 6), .18, 1.44, 0);
      return [staves, hoops, lid];
    } });

    // ---- turn a prop definition into meshes: primitives of one slot in one part are merged into a single mesh
    function mergePrims(prims) {
      var pos = [], nor = [];
      prims.forEach(function (p) {
        var g = p.g.index ? p.g.toNonIndexed() : p.g.clone(), a, n, i;
        g.applyMatrix4(p.m); a = g.attributes.position.array; n = g.attributes.normal.array;
        for (i = 0; i < a.length; i++) { pos.push(a[i]); nor.push(n[i]); }
        g.dispose();
      });
      var geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
      return geo;
    }
    function countVerts(geo) {
      var a = geo.attributes.position.array, seen = {}, n = 0, i, k;
      for (i = 0; i < a.length; i += 3) { k = Math.round(a[i] * 1000) + '|' + Math.round(a[i + 1] * 1000) + '|' + Math.round(a[i + 2] * 1000); if (!seen[k]) { seen[k] = 1; n++; } }
      return n;
    }
    function addMesh(parent, geo, slot, A) {
      var m = new THREE.Mesh(geo, slotMat[slot]), w = new THREE.Mesh(geo, wireMat);
      w.visible = false; m.add(w); m.userData.slot = slot; m.userData.wire = w; parent.add(m); allMeshes.push(m); A.slots[slot] = 1;
      return m;
    }
    var view = 'Shaded';
    function skin(m) {
      var s = m.userData.slot, glass = SLOTS[s][3];
      m.material = view === 'Shaded' ? slotMat[s] : view === 'Clay' ? (glass ? clayGlass : clayMat) : (glass ? ghostMat : darkMat);
      m.userData.wire.visible = view === 'Wireframe';
    }
    function buildAsset(def) {
      var A = { id: def.id, name: def.name, btn: def.btn, group: new THREE.Group(), parts: [], by: {}, tris: 0, verts: 0, slots: {} };
      def.make().forEach(function (pd) {
        var g = new THREE.Group(), part = { name: pd.name, group: g, home: pd.home.slice(), ex: pd.ex.slice(), solo: [] }, bySlot = {};
        g.position.fromArray(pd.home); g.rotation.set(pd.rot[0], pd.rot[1], pd.rot[2]);
        if (pd.solo) {
          pd.prims.forEach(function (p) {
            var geo = p.g.clone(), m = addMesh(g, geo, p.s, A);
            p.m.decompose(m.position, m.quaternion, m.scale); m.userData.base = m.position.clone(); m.userData.baseScale = m.scale.x; part.solo.push(m);
            A.tris += (geo.index ? geo.index.count : geo.attributes.position.count) / 3; A.verts += countVerts(geo);
          });
        } else {
          pd.prims.forEach(function (p) { (bySlot[p.s] = bySlot[p.s] || []).push(p); });
          Object.keys(bySlot).forEach(function (s) { var geo = mergePrims(bySlot[s]); addMesh(g, geo, s, A); A.tris += geo.attributes.position.count / 3; A.verts += countVerts(geo); });
        }
        A.group.add(g); A.parts.push(part); A.by[pd.name] = part;
      });
      var box3 = new THREE.Box3().setFromObject(A.group), size = box3.getSize(new THREE.Vector3());
      A.H = size.y; A.W = Math.max(size.x, size.z); A.fp = Math.hypot(size.x, size.z) / 2;
      // the same box with every part flown out, so the camera can leave room for Break apart
      A.parts.forEach(function (p) { p.group.position.set(p.home[0] + p.ex[0], p.home[1] + p.ex[1], p.home[2] + p.ex[2]); });
      box3 = new THREE.Box3().setFromObject(A.group); size = box3.getSize(new THREE.Vector3());
      A.HX = size.y; A.WX = Math.max(size.x, size.z); A.cyX = box3.getCenter(new THREE.Vector3()).y;
      A.parts.forEach(function (p) { p.group.position.set(p.home[0], p.home[1], p.home[2]); });
      return A;
    }

    var ASSETS = DEFS.map(buildAsset), NA = ASSETS.length, RING = 4, kitTris = 0, kitVerts = 0;
    ASSETS.forEach(function (A, i) {
      var a = i / NA * TAU, norm = Math.max(A.H, A.W * 1.05);
      A.ang = a; A.ring = [Math.sin(a) * RING, Math.cos(a) * RING]; A.ks = 2.2 / norm; A.fs = 3.3 / norm; A.rad = .5 * Math.hypot(A.W * A.fs, A.H * A.fs); A.cy = A.H * A.fs * .5; A.radX = .5 * Math.hypot(A.WX * A.fs, A.HX * A.fs); A.cyX = A.cyX * A.fs;
      kitTris += A.tris; kitVerts += A.verts;
    });

    // ---- the turntable: a still base, and a turning deck that carries the props
    function blobTex() {
      var c = document.createElement('canvas'); c.width = c.height = 64; var g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 2, 32, 32, 31);
      gr.addColorStop(0, 'rgba(0,0,0,.6)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
      var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t;
    }
    function deckTex() {
      var c = document.createElement('canvas'); c.width = c.height = 512; var g = c.getContext('2d'), gr = g.createRadialGradient(256, 256, 10, 256, 256, 256), i;
      gr.addColorStop(0, '#2b1b11'); gr.addColorStop(1, '#170c07'); g.fillStyle = gr; g.fillRect(0, 0, 512, 512);
      g.translate(256, 256);
      [.3, .55, .8].forEach(function (r) { g.strokeStyle = 'rgba(255,177,59,.16)'; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, r * 250, 0, TAU); g.stroke(); });
      for (i = 0; i < 72; i++) {
        g.save(); g.rotate(i / 72 * TAU); g.strokeStyle = i % 6 === 0 ? 'rgba(255,177,59,.85)' : 'rgba(255,177,59,.35)'; g.lineWidth = i % 6 === 0 ? 4 : 2;
        g.beginPath(); g.moveTo(0, i % 6 === 0 ? -208 : -222); g.lineTo(0, -240); g.stroke(); g.restore();
      }
      g.fillStyle = 'rgba(255,177,59,.9)'; g.beginPath(); g.moveTo(0, -196); g.lineTo(-10, -178); g.lineTo(10, -178); g.closePath(); g.fill();
      var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; return t;
    }
    var baseG = new THREE.Group(), turn = new THREE.Group(), deck = new THREE.Group();
    var baseM = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.16, .5, 72), new THREE.MeshStandardMaterial({ color: col('#241710'), roughness: .5, metalness: .8 })); baseM.position.y = -.55; baseG.add(baseM);
    var deckM = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, .3, 72), [new THREE.MeshStandardMaterial({ color: col('#2c1c12'), roughness: .5, metalness: .7 }), new THREE.MeshStandardMaterial({ map: deckTex(), roughness: .6, metalness: .3 }), new THREE.MeshStandardMaterial({ color: col('#140b06') })]); deckM.position.y = -.15; deck.add(deckM);
    var rimM = new THREE.Mesh(new THREE.RingGeometry(.975, 1, 96).rotateX(-PI / 2), new THREE.MeshBasicMaterial({ color: col('#ffb13b'), transparent: true, opacity: .75 })); rimM.position.y = .004; deck.add(rimM);
    turn.add(deck); scene.add(baseG); scene.add(turn);
    var blob = blobTex(), blobMat = new THREE.MeshBasicMaterial({ map: blob, transparent: true, depthWrite: false, opacity: .8 });
    ASSETS.forEach(function (A, i) {
      var slot = new THREE.Group(); slot.add(A.group); slot.position.set(A.ring[0], 0, A.ring[1]); slot.rotation.y = A.ang; slot.scale.setScalar(A.ks);
      var sh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-PI / 2), blobMat); sh.scale.setScalar(Math.max(A.W, A.H * .7) * 1.5); sh.position.y = .015; slot.add(sh);
      A.slot = slot; turn.add(slot);
    });

    // ---- state
    var focus = -1, split = false, palIdx = 0, playing = !ctx.still, angle = 0, angleGoal = null, pitchUser = 0, pitchNow = .6, zoom = 1, touched = 0, exCur = 0;
    var deckR = 5.7, dist = 14, ty = .8, tz = 1, snap = true;
    applyPalette(0); allMeshes.forEach(skin);

    // ---- side panel
    var ui = el('div', 'smp-ui'), btnGroups = {};
    ui.appendChild(el('h3', '', 'Low-poly 3D asset kit'));
    ui.appendChild(el('p', 'tag', 'Nine game-ready props built from code: spin them, switch to clay or wireframe, break a prop into its parts and re-colour the whole kit. The counts below are measured from the real meshes. Original designs made for this site: samples, not client work.'));
    var chips = el('p', 'chips'); ['low-poly', 'flat shaded', 'game-ready'].forEach(function (s) { chips.appendChild(el('span', '', s)); }); ui.appendChild(chips);
    function group(label, names, fn) {
      ui.appendChild(el('p', 'smp-l', label)); var g = el('div', 'smp-g'), bs = [];
      names.forEach(function (n, i) { var b = el('button', 'smp-b', n); b.type = 'button'; b.addEventListener('click', function () { fn(i); }); g.appendChild(b); bs.push(b); });
      ui.appendChild(g);
      return { set: function (idx) { bs.forEach(function (b, j) { b.setAttribute('aria-pressed', j === idx ? 'true' : 'false'); }); } };
    }
    btnGroups.prop = group('Prop', ['Whole kit'].concat(ASSETS.map(function (A) { return A.btn; })), function (i) { setFocus(i - 1); });
    btnGroups.view = group('View', ['Shaded', 'Clay', 'Wireframe'], function (i) { view = ['Shaded', 'Clay', 'Wireframe'][i]; allMeshes.forEach(skin); refresh(); });
    btnGroups.pal = group('Palette', PALETTES.map(function (p) { return p[0]; }), function (i) { palIdx = i; applyPalette(i); refresh(); });
    ui.appendChild(el('p', 'smp-l', 'Parts'));
    var gp = el('div', 'smp-g'), bSplit = el('button', 'smp-b', 'Break apart'); bSplit.type = 'button'; gp.appendChild(bSplit); ui.appendChild(gp);
    bSplit.addEventListener('click', function () { split = !split; refresh(); });
    var now = el('p', 'smp-now'); now.setAttribute('aria-live', 'polite'); ui.appendChild(now);
    var row = el('div', 'row smp-row'), pb = el('button', 'mbtn', ''); pb.type = 'button'; pb.addEventListener('click', function () { playing = !playing; refresh(); });
    var cta = el('a', 'btn', 'Order a 3D kit like this'); cta.href = WA + encodeURIComponent('Hi Iffy, I saw your 3D asset kit sample and I would like a set of game props like it.'); cta.target = '_blank'; cta.rel = 'noopener';
    row.appendChild(pb); row.appendChild(cta); ui.appendChild(row);
    function num(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
    function refresh() {
      btnGroups.prop.set(focus + 1); btnGroups.view.set(['Shaded', 'Clay', 'Wireframe'].indexOf(view)); btnGroups.pal.set(palIdx);
      bSplit.setAttribute('aria-pressed', split ? 'true' : 'false'); pb.textContent = playing ? 'Pause' : 'Play';
      var A = focus < 0 ? null : ASSETS[focus], nSlots = 0, k, tail = ' ' + view + ', ' + PALETTES[palIdx][0].toLowerCase() + ' palette' + (split ? ', broken apart' : '') + '.';
      if (A) { for (k in A.slots) nSlots++; now.textContent = A.name + ': ' + num(Math.round(A.tris)) + ' triangles, ' + num(A.verts) + ' vertices, ' + A.parts.length + ' parts, ' + nSlots + ' materials.' + tail; }
      else now.textContent = 'Whole kit: ' + NA + ' props, ' + num(Math.round(kitTris)) + ' triangles, ' + num(kitVerts) + ' vertices.' + tail;
    }
    function setFocus(i) { focus = i; angleGoal = i < 0 ? null : wrap(-ASSETS[i].ang); if (ctx.still && angleGoal !== null) { angle = angleGoal; angleGoal = null; } refresh(); }
    refresh();

    // ---- every frame
    function fitDist(r) { return r * 1.12 / Math.sin(Math.atan(halfT * Math.min(1, aspect))); }
    function update(t, dt) {
      var k = (ctx.still || snap) ? 1 : 1 - Math.exp(-dt * 5.5), i, j, A, s, tp, ts, sc, P, ex, tzT, idle = performance.now() - touched > 1800;
      snap = false;
      if (angleGoal !== null) { var d = wrap(angleGoal - angle); angle += d * k; if (Math.abs(d) < .01) angleGoal = null; }
      else if (playing && idle) angle += dt * (focus < 0 ? .22 : .55);
      turn.rotation.y = angle;
      exCur += ((split ? 1 : 0) - exCur) * k; if (Math.abs(exCur - (split ? 1 : 0)) < .002) exCur = split ? 1 : 0;
      for (i = 0; i < NA; i++) {
        A = ASSETS[i]; s = A.slot;
        if (focus < 0) { tp = A.ring; ts = A.ks; } else if (i === focus) { tp = [0, 0]; ts = A.fs; } else { tp = A.ring; ts = 0; }
        s.position.x += (tp[0] - s.position.x) * k; s.position.z += (tp[1] - s.position.z) * k;
        sc = s.scale.x + (ts - s.scale.x) * k; if (Math.abs(sc - ts) < .0005) sc = ts; s.scale.setScalar(Math.max(sc, .0001)); s.visible = sc > .02;
        if (s.visible) for (j = 0; j < A.parts.length; j++) { P = A.parts[j]; ex = P.ex; P.group.position.set(P.home[0] + ex[0] * exCur, P.home[1] + ex[1] * exCur, P.home[2] + ex[2] * exCur); }
      }
      // little bits of life: the lights pulse, bubbles rise, smoke drifts
      if (playing) {
        slotMat.glow.emissiveIntensity = 1.2 + .25 * Math.sin(t * 9) * Math.sin(t * 3.1) + .1 * Math.sin(t * 17);
        slotMat.glow2.emissiveIntensity = 1.15 + .2 * Math.sin(t * 2.2);
        slotMat.crystal.emissiveIntensity = .4 + .25 * Math.sin(t * 1.6);
        animSolo(t);
      }
      deckR += (deckT() - deckR) * k; deck.scale.set(deckR, 1, deckR); baseG.scale.set(deckR, 1, deckR);
      var dT, tyT;
      if (focus < 0) { dT = Math.max((RING + 1.3) / (halfT * aspect), 4.6 / halfT) * (1 + .2 * exCur); tyT = .8; tzT = 1; } else { A = ASSETS[focus]; dT = fitDist(A.rad + (A.radX - A.rad) * exCur); tyT = A.cy + (A.cyX - A.cy) * exCur; tzT = 0; }
      dist += (dT - dist) * k; ty += (tyT - ty) * k; tz += (tzT - tz) * k; pitchNow += ((focus < 0 ? .58 : .3) - pitchNow) * k;
      var pitch = clamp(pitchNow + pitchUser, .03, 1.25), dd = dist / zoom, cp = Math.cos(pitch);
      cam.position.set(0, ty + Math.sin(pitch) * dd, tz + cp * dd); cam.lookAt(0, ty, tz);
    }
    function deckT() { return focus < 0 ? 5.7 : 2.6; }
    function animSolo(t) {
      var p = ASSETS[2].by.Bubbles, c = ASSETS[7].by.Smoke, i, m, u;
      for (i = 0; i < p.solo.length; i++) { m = p.solo[i]; u = ((t * .35 + i * .27) % 1); m.position.y = m.userData.base.y + u * .35; m.scale.setScalar(m.userData.baseScale * (1 - Math.abs(u - .5) * .7)); }
      for (i = 0; i < c.solo.length; i++) { m = c.solo[i]; u = ((t * .22 + i * .33) % 1); m.position.y = m.userData.base.y + u * .5; m.position.x = m.userData.base.x + u * .25; m.scale.setScalar(m.userData.baseScale * (.5 + u) * (1 - Math.max(0, u - .7) * 3)); }
    }
    function resize(w, h) { aspect = w / h; cam.aspect = aspect; cam.updateProjectionMatrix(); }

    return {
      ui: ui, scene: scene, camera: cam, update: update, resize: resize,
      drag: function (dx, dy) { angleGoal = null; angle += dx * .012; pitchUser = clamp(pitchUser + dy * .004, -.4, .8); touched = performance.now(); },
      pinch: function (f) { zoom = clamp(zoom * f, .6, 2); },
      reset: function () { zoom = 1; pitchUser = 0; touched = 0; },
      restore: function (pm) { if (pm) pmrem = pm; env = makeEnv(); scene.environment = env; },
      hint: matchMedia('(pointer:coarse)').matches ? 'Drag to spin, pinch to zoom' : 'Drag to spin. Ctrl and scroll to zoom. Double click to reset.'
    };
  } });
})();
