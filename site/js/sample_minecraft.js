/* Sample 3: Minecraft-style voxel world. A procedurally generated blocky island (beach in front, a flat plateau that
   carries the logo, snowy hills behind, trees on the sides), a day and night cycle with a square sun, moon, stars and
   clouds, a block fox that wanders around, and a block-by-block logo build.
   Everything is original: the block textures are painted in code and the fox is our own design, so this is not a
   Minecraft asset and uses no Minecraft logo, texture or creature. Registered with js/samples.js. */
(function () {
  'use strict';
  if (!window.IFFY_SAMPLES) return;
  var PI = Math.PI, WA = 'https://wa.me/2348075889359?text=';
  var N = 48, SEA = 4, PLATEAU = 7, HALF = 14.5;   // world size in blocks, sea level, height and half width of the flat area that holds the logo

  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt) e.textContent = txt; return e; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function sstep(a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
  function lin(v) { return Math.pow(v, 2.2); }   // display value to linear (the renderer outputs sRGB)

  // ---- seeded value noise
  function hash(ix, iz, s) {
    var h = (Math.imul(ix, 374761393) + Math.imul(iz, 668265263) + Math.imul(s, 1442695041)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
    return (h >>> 0) / 4294967295;
  }
  function vnoise(x, z, s) {
    var ix = Math.floor(x), iz = Math.floor(z), fx = x - ix, fz = z - iz, ux = fx * fx * (3 - 2 * fx), uz = fz * fz * (3 - 2 * fz);
    return lerp(lerp(hash(ix, iz, s), hash(ix + 1, iz, s), ux), lerp(hash(ix, iz + 1, s), hash(ix + 1, iz + 1, s), ux), uz);
  }
  function fbm(x, z, s) { return vnoise(x, z, s) * .55 + vnoise(x * 2.1, z * 2.1, s + 7) * .3 + vnoise(x * 4.3, z * 4.3, s + 13) * .15; }

  // ---- block types and which atlas tile each face uses (tiles: 0 grass top, 1 dirt, 2 grass side, 3 stone, 4 sand, 5 snow top, 6 snow side, 7 log end, 8 bark, 9 leaves)
  var GRASS = 1, DIRT = 2, STONE = 3, SAND = 4, SNOW = 5, WOOD = 6, LEAVES = 7;
  var TILE_TOP = [0, 0, 1, 3, 4, 5, 7, 9], TILE_SIDE = [0, 2, 1, 3, 4, 6, 8, 9];   // indexed by block type
  // The atlas is 128 x 64 (a power of two, so it can use mipmaps). Every 16 px tile sits in a 20 px cell with a 2 px gutter
  // that repeats the tile's own edge pixels, so antialiased edges never pick up a neighbouring tile's colours.
  var TS = 16, GUT = 2, CELL = 20, ACOLS = 5, AW = 128, AH = 64, UVT = [];
  (function () {
    var i, cx0, cy0;
    for (i = 0; i < 10; i++) { cx0 = (i % ACOLS) * CELL + GUT; cy0 = Math.floor(i / ACOLS) * CELL + GUT; UVT.push([(cx0 + .04) / AW, (cx0 + TS - .04) / AW, 1 - (cy0 + TS - .04) / AH, 1 - (cy0 + .04) / AH]); }   // u0, u1, v0 (bottom), v1 (top)
  })();
  // face brightness, written as what you see on screen and converted to linear for the shader
  var SH_TOP = 1, SH_PZ = lin(.86), SH_PX = lin(.72), SH_NX = lin(.62), SH_NZ = lin(.56);

  function makeAtlas(THREE) {
    var c = document.createElement('canvas'); c.width = AW; c.height = AH;
    var g = c.getContext('2d'), seed = 4242;
    function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    function paint(i, fn) {
      var px = [], d = g.createImageData(CELL, CELL), x, y, p, k;
      for (y = 0; y < TS; y++) { px.push([]); for (x = 0; x < TS; x++) px[y].push(fn(x, y)); }
      for (y = 0; y < CELL; y++) for (x = 0; x < CELL; x++) { p = px[clamp(y - GUT, 0, TS - 1)][clamp(x - GUT, 0, TS - 1)]; k = (y * CELL + x) * 4; d.data[k] = p[0]; d.data[k + 1] = p[1]; d.data[k + 2] = p[2]; d.data[k + 3] = 255; }
      g.putImageData(d, (i % ACOLS) * CELL, Math.floor(i / ACOLS) * CELL);
    }
    function speck(base, dark, light, pd, pl) { return function () { var v = rnd(); return v < pd ? dark : v > 1 - pl ? light : base; }; }
    var grass = speck([95, 170, 69], [74, 142, 54], [122, 194, 88], .2, .12);
    var dirt = speck([122, 82, 50], [91, 59, 34], [145, 104, 68], .2, .12);
    var stone = speck([125, 128, 135], [101, 104, 111], [148, 151, 158], .22, .12);
    var snow = speck([243, 247, 251], [222, 233, 245], [255, 255, 255], .2, .2);
    paint(0, grass);
    paint(1, dirt);
    var edge = [], e; for (e = 0; e < TS; e++) edge.push(3 + Math.floor(rnd() * 3));
    paint(2, function (x, y) { return y < edge[x] ? grass() : dirt(); });
    paint(3, function (x, y) { return (x * 7 + y * 3) % 23 === 0 ? [92, 95, 102] : stone(); });
    paint(4, speck([220, 200, 138], [198, 178, 116], [236, 219, 162], .2, .12));
    paint(5, snow);
    var sedge = []; for (e = 0; e < TS; e++) sedge.push(5 + Math.floor(rnd() * 3));
    paint(6, function (x, y) { return y < sedge[x] ? snow() : stone(); });
    paint(7, function (x, y) { var d = Math.max(Math.abs(x - 7.5), Math.abs(y - 7.5)); if (d > 6.5) return [97, 70, 40]; return Math.floor(d) % 2 ? [140, 104, 58] : [166, 126, 74]; });
    var streak = []; for (e = 0; e < TS; e++) streak.push(rnd() * .25);
    paint(8, function (x) { var s = 1 - streak[x] - rnd() * .08; return [Math.floor(112 * s), Math.floor(78 * s), Math.floor(46 * s)]; });
    paint(9, function () { var v = rnd(); return v < .08 ? [28, 78, 30] : v < .33 ? [44, 108, 44] : v > .85 ? [90, 166, 76] : [63, 138, 58]; });
    var t = new THREE.CanvasTexture(c);
    t.encoding = THREE.sRGBEncoding; t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestMipmapLinearFilter; t.generateMipmaps = true;
    return t;
  }

  // small pixel sprites for the sky (sun, moon, cloud) painted in code
  function pixelTex(THREE, w, h, draw) {
    var c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'));
    var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; return t;
  }
  function glowTex(THREE, rgb) {
    var c = document.createElement('canvas'); c.width = c.height = 64; var g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 2, 32, 32, 31);
    gr.addColorStop(0, 'rgba(' + rgb + ',.9)'); gr.addColorStop(1, 'rgba(' + rgb + ',0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t;
  }

  // ---- logo: IFFY in a 5 x 7 pixel font
  var FONT = {
    I: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '#####'],
    F: ['#####', '#....', '#....', '####.', '#....', '#....', '#....'],
    Y: ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..']
  };
  var LOGO = []; (function () {
    var word = 'IFFY', ox = 0, li, r, c, row;
    for (li = 0; li < word.length; li++) {
      for (r = 0; r < 7; r++) { row = FONT[word[li]][r]; for (c = 0; c < 5; c++) if (row[c] === '#') LOGO.push([ox + c, 6 - r]); }
      ox += 6;
    }
  })();
  var LOGO_W = 23;

  IFFY_SAMPLES.add({ id: 'minecraft', tab: 'Minecraft style', mount: function (ctx) {
    var THREE = ctx.THREE, scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(38, 1.2, .1, 400), halfT = Math.tan(cam.fov * PI / 360);
    var atlas = makeAtlas(THREE);
    var cx = N / 2, cz = N / 2, wallZ = cz - 4;
    function col(r, g, b) { return new THREE.Color(r, g, b); }

    // ---- lights (these only matter for the fox: the blocks carry their own baked face shading)
    var hemi = new THREE.HemisphereLight(0xbfe3ff, 0x3b2a1d, .8); scene.add(hemi);
    var sunLight = new THREE.DirectionalLight(0xfff2d8, .9); scene.add(sunLight); scene.add(sunLight.target);

    // ---- world data and mesh
    var W = null, terrain = null, tris = 0, seed = 7;
    var terrainMat = new THREE.MeshBasicMaterial({ map: atlas, vertexColors: true });
    var waterMat = new THREE.MeshBasicMaterial({ color: 0x2f7fd0, transparent: true, opacity: .74, depthWrite: false });
    var water = new THREE.Mesh(new THREE.PlaneGeometry(520, 520).rotateX(-PI / 2), waterMat); water.position.set(cx, SEA + .85, cz); scene.add(water);

    function generate(sd) {
      var H = new Int16Array(N * N), top = new Uint8Array(N * N), x, z, i, d, m, h0, back, amp, dx, dz, dd;
      for (x = 0; x < N; x++) for (z = 0; z < N; z++) {
        d = Math.hypot(x + .5 - cx, z + .5 - cz) / (N / 2); m = 1 - sstep(.45, 1.02, d); h0 = fbm(x / 13, z / 13, sd);
        back = sstep(-.45, .6, (cz - z) / (N / 2)); amp = lerp(.45, 1.25, back);         // low and sandy in front, hills behind
        H[x * N + z] = Math.max(1, Math.round(2 + m * (3.5 + h0 * 11) * amp));
      }
      // a flat area for the logo (with 2 blocks of flat ground behind it), blended into the land around it
      for (x = 0; x < N; x++) for (z = 0; z < N; z++) {
        dx = Math.max(0, Math.abs(x + .5 - cx) - HALF); dz = Math.max(0, cz - 8 - z, z + .5 - (cz + 6.5)); dd = Math.hypot(dx, dz);
        if (dd < 3) H[x * N + z] = Math.round(lerp(PLATEAU, H[x * N + z], sstep(0, 3, dd)));
      }
      for (i = 0; i < N * N; i++) { h0 = H[i]; top[i] = h0 <= SEA + 1 ? SAND : h0 >= 11 ? SNOW : GRASS; }
      // trees on grass, never in front of or right behind the logo
      var tr = new Map(), blocked = new Uint8Array(N * N), tx, tz, th, ty, ax, az, ay;
      function put(a, b, c, t) { tr.set(a + '|' + b + '|' + c, t); }
      for (tx = 2; tx < N - 2; tx++) for (tz = 2; tz < N - 2; tz++) {
        i = tx * N + tz; if (top[i] !== GRASS || H[i] < SEA + 2 || H[i] >= 10) continue;
        if (Math.abs(tx + .5 - cx) < HALF + .5 && tz + .5 > cz - 13) continue;
        if (hash(tx, tz, sd + 99) > .075) continue;
        th = 4 + Math.floor(hash(tx, tz, sd + 5) * 2); ty = H[i] + th;
        for (ay = H[i] + 1; ay <= ty; ay++) put(tx, ay, tz, WOOD);
        for (ax = -2; ax <= 2; ax++) for (az = -2; az <= 2; az++) for (ay = ty - 1; ay <= ty + 1; ay++) {
          if (Math.abs(ax) === 2 && Math.abs(az) === 2) continue;
          if (ay === ty + 1 && (Math.abs(ax) > 1 || Math.abs(az) > 1)) continue;
          if (ax === 0 && az === 0 && ay <= ty) continue;
          if (!tr.has((tx + ax) + '|' + ay + '|' + (tz + az))) put(tx + ax, ay, tz + az, LEAVES);
        }
        put(tx, ty + 2, tz, LEAVES); blocked[i] = 1;
      }
      return { H: H, top: top, trees: tr, blocked: blocked };
    }

    function build(sd) {
      W = generate(sd);
      var H = W.H, top = W.top, tr = W.trees, pos = [], uv = [], cl = [], idx = [], vc = 0, x, z, y, d, nx, nz, nh, i, h, t0, sub;
      function solid(a, b, c) { if (a < 0 || c < 0 || a >= N || c >= N) return false; if (b <= H[a * N + c]) return true; return tr.has(a + '|' + b + '|' + c); }
      function quad(p, tile, shade, a, c) {
        var t = UVT[tile], u0 = t[0], u1 = t[1], v0 = t[2], v1 = t[3], k, s = shade * (1 + (hash(a, c, sd + 3) - .5) * .1);
        for (k = 0; k < 4; k++) { pos.push(p[k * 3], p[k * 3 + 1], p[k * 3 + 2]); cl.push(s, s, s); }
        uv.push(u0, v0, u0, v1, u1, v1, u1, v0);
        idx.push(vc, vc + 1, vc + 2, vc, vc + 2, vc + 3); vc += 4;
      }
      function topFace(a, b, c, tile) { quad([a, b + 1, c, a, b + 1, c + 1, a + 1, b + 1, c + 1, a + 1, b + 1, c], tile, SH_TOP, a, c); }
      function sideFace(a, b, c, dir, tile) {
        if (dir === 0) quad([a + 1, b, c, a + 1, b + 1, c, a + 1, b + 1, c + 1, a + 1, b, c + 1], tile, SH_PX, a, c);        // +x
        else if (dir === 1) quad([a, b, c + 1, a, b + 1, c + 1, a, b + 1, c, a, b, c], tile, SH_NX, a, c);                   // -x
        else if (dir === 2) quad([a + 1, b, c + 1, a + 1, b + 1, c + 1, a, b + 1, c + 1, a, b, c + 1], tile, SH_PZ, a, c);   // +z
        else quad([a, b, c, a, b + 1, c, a + 1, b + 1, c, a + 1, b, c], tile, SH_NZ, a, c);                                  // -z
      }
      var DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      for (x = 0; x < N; x++) for (z = 0; z < N; z++) {
        i = x * N + z; h = H[i]; t0 = top[i]; sub = t0 === GRASS ? DIRT : t0 === SAND ? SAND : STONE;
        if (!solid(x, h + 1, z)) topFace(x, h, z, TILE_TOP[t0]);
        for (d = 0; d < 4; d++) {
          nx = x + DIRS[d][0]; nz = z + DIRS[d][1]; nh = (nx < 0 || nz < 0 || nx >= N || nz >= N) ? -1 : H[nx * N + nz];
          for (y = Math.max(nh + 1, 0); y <= h; y++) sideFace(x, y, z, d, TILE_SIDE[y === h ? t0 : y >= h - 2 ? sub : STONE]);
        }
      }
      tr.forEach(function (t, key) {
        var p = key.split('|'), a = +p[0], b = +p[1], c = +p[2];
        if (!solid(a, b + 1, c)) topFace(a, b, c, TILE_TOP[t]);
        for (d = 0; d < 4; d++) if (!solid(a + DIRS[d][0], b, c + DIRS[d][1])) sideFace(a, b, c, d, TILE_SIDE[t]);
      });
      var geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setAttribute('color', new THREE.Float32BufferAttribute(cl, 3)); geo.setIndex(idx);
      if (terrain) { scene.remove(terrain); terrain.geometry.dispose(); }
      terrain = new THREE.Mesh(geo, terrainMat); terrain.frustumCulled = false; scene.add(terrain);
      tris = idx.length / 3;
    }
    build(seed);

    // ---- sky. The dome and the sun, moon, stars and clouds follow the camera, so you always see a sky.
    var skyMat = new THREE.ShaderMaterial({
      uniforms: { top: { value: new THREE.Color() }, hor: { value: new THREE.Color() } },
      vertexShader: 'varying float vY; void main(){ vY = normalize(position).y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: 'uniform vec3 top; uniform vec3 hor; varying float vY; void main(){ gl_FragColor = vec4(mix(hor, top, smoothstep(-0.02, 0.62, vY)), 1.0); }',
      side: THREE.BackSide, depthWrite: false, depthTest: false, fog: false
    });
    var dome = new THREE.Mesh(new THREE.SphereGeometry(300, 20, 12), skyMat); dome.renderOrder = -10; dome.frustumCulled = false; scene.add(dome);
    var fog = new THREE.Fog(0x88aacc, 60, 160); scene.fog = fog;

    var SKY_D = 200, skyG = new THREE.Group(), skyS = new THREE.Group(); skyG.add(skyS); scene.add(skyG);
    function skyMesh(map, order) { var m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: map, transparent: true, depthWrite: false, fog: false })); m.renderOrder = order; skyS.add(m); return m; }
    var sunTex = pixelTex(THREE, 16, 16, function (g) { g.fillStyle = '#ffd04f'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#ffe58a'; g.fillRect(2, 2, 12, 12); g.fillStyle = '#fff6cf'; g.fillRect(4, 4, 8, 8); });
    var moonTex = pixelTex(THREE, 16, 16, function (g) { g.fillStyle = '#cdd6f0'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#e8edfb'; g.fillRect(2, 2, 12, 12); g.fillStyle = '#b3bfe0'; g.fillRect(4, 3, 4, 3); g.fillRect(9, 8, 3, 3); g.fillRect(3, 10, 3, 2); });
    var cloudTex = pixelTex(THREE, 24, 8, function (g) { g.fillStyle = '#ffffff'; g.fillRect(4, 0, 6, 2); g.fillRect(13, 1, 6, 2); g.fillRect(2, 2, 20, 3); g.fillRect(0, 4, 24, 2); g.fillStyle = '#c9d8ee'; g.fillRect(0, 6, 24, 1); g.fillRect(2, 5, 8, 1); g.fillRect(14, 5, 8, 1); });
    var sun = skyMesh(sunTex, 6), moon = skyMesh(moonTex, 6);
    var sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(THREE, '255,226,140'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); sunGlow.renderOrder = 5; skyS.add(sunGlow);
    var moonGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(THREE, '170,190,255'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); moonGlow.renderOrder = 5; skyS.add(moonGlow);
    var clouds = [], k;
    for (k = 0; k < 7; k++) {
      var cm = skyMesh(cloudTex, 7); cm.material = cm.material.clone(); cm.material.opacity = .9; clouds.push({ m: cm, x: -3.2 + k * .92 + hash(k, 1, 5) * .4, y: .8 + hash(k, 2, 5) * .15, w: .28 + hash(k, 3, 5) * .22, sp: .008 + hash(k, 4, 5) * .008 });
    }
    var starPos = new Float32Array(150 * 3), starGeo = new THREE.BufferGeometry(); starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    var starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 2.2, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false });
    var stars = new THREE.Points(starGeo, starMat); stars.frustumCulled = false; stars.renderOrder = 4; skyS.add(stars);
    var aspect = 1.2, halfH = SKY_D * halfT, halfW = halfH * aspect;
    function layStars() { var i; for (i = 0; i < 150; i++) { starPos[i * 3] = (hash(i, 1, 21) * 2 - 1) * 3.3 * halfW; starPos[i * 3 + 1] = (.8 + hash(i, 2, 21) * .22) * halfH; starPos[i * 3 + 2] = -SKY_D; } starGeo.attributes.position.needsUpdate = true; }
    layStars();

    // ---- lanterns beside the logo that glow at night, and a glow behind the logo
    var haloTex = glowTex(THREE, '255,214,120');
    var halos = [], lampM = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffd37a).convertSRGBToLinear(), fog: false }), postM = new THREE.MeshBasicMaterial({ color: new THREE.Color(0x6b4a2b).convertSRGBToLinear() });
    [[-13, 3.5], [13, 3.5], [-6.5, 5.5], [6.5, 5.5]].forEach(function (p) {
      var g = new THREE.Group(); g.position.set(cx + p[0] + .5, PLATEAU + 1, cz + p[1] + .5); scene.add(g);
      var post = new THREE.Mesh(new THREE.BoxGeometry(.3, 1.6, .3), postM); post.position.y = .8; g.add(post);
      var lamp = new THREE.Mesh(new THREE.BoxGeometry(.6, .6, .6), lampM); lamp.position.y = 1.9; g.add(lamp);
      var halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); halo.position.y = 1.9; halo.scale.setScalar(5); g.add(halo); halos.push(halo);
    });
    var logoGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, opacity: 0 }));
    logoGlow.position.set(cx, PLATEAU + 4.6, wallZ - .6); logoGlow.scale.set(40, 16, 1); scene.add(logoGlow);

    // ---- the logo, built block by block
    function cubeGeo() {
      var g = new THREE.BoxGeometry(1, 1, 1), shade = [SH_PX, SH_NX, SH_TOP, lin(.5), SH_PZ, SH_NZ], cs = [], f, v;   // box face order: +x, -x, +y, -y, +z, -z
      for (f = 0; f < 6; f++) for (v = 0; v < 4; v++) cs.push(shade[f], shade[f], shade[f]);
      g.setAttribute('color', new THREE.Float32BufferAttribute(cs, 3)); return g;
    }
    var nb = LOGO.length * 2, logoMat = new THREE.MeshBasicMaterial({ vertexColors: true });
    var logo = new THREE.InstancedMesh(cubeGeo(), logoMat, nb); logo.frustumCulled = false; scene.add(logo);
    var dummy = new THREE.Object3D(), bl = [], gold = new THREE.Color(), ember = new THREE.Color(), cc = new THREE.Color(), b, th;
    gold.setRGB(lin(1), lin(.78), lin(.3)); ember.setRGB(lin(1), lin(.46), lin(.12));
    for (b = 0; b < LOGO.length; b++) for (th = 0; th < 2; th++) {
      cc.copy(ember).lerp(gold, LOGO[b][1] / 6 * .85 + (hash(b, th, 3) - .5) * .14); logo.setColorAt(bl.length, cc);
      bl.push({ x: cx - LOGO_W / 2 + LOGO[b][0] + .5, y: PLATEAU + 1 + LOGO[b][1] + .5, z: wallZ + th + .5, delay: LOGO[b][0] * .05 + LOGO[b][1] * .075 + th * .05, sx: (hash(b, th, 11) - .5) * 5, sz: (hash(b, th, 12) - .5) * 5, spin: (hash(b, th, 13) - .5) * 6 });
    }
    logo.instanceColor.needsUpdate = true;
    var logoT = -1;   // seconds since the build started; -1 = not started, 99 = finished at once
    function layLogo() {
      var i, u, p, f, bn, drop;
      for (i = 0; i < nb; i++) {
        p = bl[i]; u = clamp((logoT - p.delay) / .85, 0, 1);
        if (u <= 0) { dummy.position.set(p.x, -50, p.z); dummy.scale.setScalar(.0001); dummy.rotation.set(0, 0, 0); }
        else {
          f = clamp(u / .72, 0, 1); bn = clamp((u - .72) / .28, 0, 1); drop = 1 - f * f;                                   // falls with gravity, then a small bounce
          dummy.position.set(p.x + p.sx * drop, p.y + drop * 16 + Math.sin(bn * PI) * .3 * (1 - bn), p.z + p.sz * drop);
          dummy.scale.setScalar(1); dummy.rotation.set(p.spin * drop, p.spin * drop * .6, 0);
        }
        dummy.updateMatrix(); logo.setMatrixAt(i, dummy.matrix);
      }
      logo.instanceMatrix.needsUpdate = true;
    }
    function startLogo(instant) { logoT = (instant || ctx.still) ? 99 : 0; layLogo(); }   // with reduced motion the logo simply appears

    // ---- the block fox: our own design, drawn from boxes
    var FS = 1.8, fox = new THREE.Group(); fox.scale.setScalar(FS); scene.add(fox);
    function fm(hex) { return new THREE.MeshLambertMaterial({ color: new THREE.Color(hex).convertSRGBToLinear() }); }
    var mO = fm('#e8731f'), mW = fm('#f4efe6'), mD = fm('#3a2a22'), mN = fm('#1b1b22');
    function part(w, h, d, m, x, y, z, parent) { var p = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); p.position.set(x, y, z); (parent || fox).add(p); return p; }
    var foxBody = new THREE.Group(); fox.add(foxBody);
    part(.46, .4, .9, mO, 0, .55, 0, foxBody); part(.3, .16, .34, mW, 0, .4, .22, foxBody);
    var head = new THREE.Group(); head.position.set(0, .66, .52); foxBody.add(head);
    part(.4, .36, .38, mO, 0, 0, .1, head); part(.2, .16, .24, mW, 0, -.06, .36, head); part(.08, .07, .05, mN, 0, -.02, .49, head);
    part(.1, .16, .08, mO, -.14, .24, .05, head); part(.1, .16, .08, mO, .14, .24, .05, head); part(.05, .06, .03, mN, -.1, .06, .3, head); part(.05, .06, .03, mN, .1, .06, .3, head);
    var tail = new THREE.Group(); tail.position.set(0, .6, -.45); foxBody.add(tail); part(.22, .22, .6, mO, 0, .05, -.28, tail); part(.23, .23, .2, mW, 0, .05, -.62, tail);
    var legs = [[-.14, .28], [.14, .28], [-.14, -.28], [.14, -.28]].map(function (p) { var g = new THREE.Group(); g.position.set(p[0], .36, p[1]); foxBody.add(g); part(.15, .34, .15, mD, 0, -.17, 0, g); return g; });
    var shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-PI / 2), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .3, depthWrite: false })); shadow.scale.set(.8 * FS, 1, 1.25 * FS); scene.add(shadow);
    var F = { x: cx + .5, z: cz + 5, y: 0, yaw: 0, tx: 0, tz: 0, state: 'idle', timer: 1.2, ph: 0 };
    function gY(a, b) { var ix = Math.floor(a), iz = Math.floor(b); return (ix < 0 || iz < 0 || ix >= N || iz >= N) ? null : W.H[ix * N + iz] + 1; }
    function ok(a, b, fromY) {   // the fox stays on the plateau and the slope in front of it
      var g = gY(a, b); if (g === null || Math.abs(a - cx) > HALF - 1 || b < cz - .5 || b > cz + 9.5) return false;
      var ix = Math.floor(a), iz = Math.floor(b); return W.H[ix * N + iz] >= SEA + 1 && !W.blocked[ix * N + iz] && Math.abs(g - fromY) <= 1.6;
    }
    function pickTarget() {
      var n, a, r, tx, tz, s, px, pz, good, g0;
      for (n = 0; n < 14; n++) {
        a = Math.random() * PI * 2; r = 3 + Math.random() * 6; tx = F.x + Math.cos(a) * r; tz = F.z + Math.sin(a) * r; good = true; g0 = gY(F.x, F.z);
        for (s = 1; s <= 8; s++) { px = lerp(F.x, tx, s / 8); pz = lerp(F.z, tz, s / 8); if (!ok(px, pz, g0)) { good = false; break; } g0 = gY(px, pz); }
        if (good) { F.tx = tx; F.tz = tz; F.state = 'walk'; return; }
      }
      F.state = 'idle'; F.timer = 1;
    }
    function respawnFox() { F.x = cx + (Math.random() - .5) * 10; F.z = cz + 3.5 + Math.random() * 3; F.y = gY(F.x, F.z) || 8; F.state = 'idle'; F.timer = .8; }
    respawnFox();

    // ---- state and side panel
    var PITCH0 = .22, tod = 10, todTarget = 12, auto = !ctx.still, playing = !ctx.still, mode = ctx.still ? 'Day' : 'Auto';
    var yaw = 0, yawT = 0, pitch = PITCH0, zoom = 1, touched = 0, swayS = 0, built = false, tAcc = 0, tClock = 0;
    if (ctx.still) { tod = 12; logoT = 99; layLogo(); built = true; }

    var ui = el('div', 'smp-ui'), modeBtns = {};
    ui.appendChild(el('h3', '', 'Minecraft-style voxel world'));
    ui.appendChild(el('p', 'tag', 'A procedurally generated blocky island with trees, water and snow caps, a day and night cycle, a block fox that wanders around, and a block-by-block logo build. Blocks, textures and the fox are original: not a Minecraft asset.'));
    var chips = el('p', 'chips'), triChip = el('span', '', ''); ['procedural terrain', 'day and night', 'wandering mob'].forEach(function (s) { chips.appendChild(el('span', '', s)); }); chips.appendChild(triChip); ui.appendChild(chips);
    ui.appendChild(el('p', 'smp-l', 'Time of day'));
    var gt = el('div', 'smp-g'); ui.appendChild(gt);
    [['Day', 12], ['Sunset', 18], ['Night', 24], ['Auto', null]].forEach(function (m) {
      var bt = el('button', 'smp-b', m[0]); bt.type = 'button';
      bt.addEventListener('click', function () { mode = m[0]; if (m[1] === null) auto = true; else { auto = false; todTarget = m[1]; if (!playing) tod = m[1] % 24; } refresh(); });   // paused: jump straight there
      gt.appendChild(bt); modeBtns[m[0]] = bt;
    });
    ui.appendChild(el('p', 'smp-l', 'World'));
    var gw = el('div', 'smp-g'); ui.appendChild(gw);
    var bNew = el('button', 'smp-b', 'New world'), bLogo = el('button', 'smp-b', 'Build the logo'); bNew.type = bLogo.type = 'button';
    bNew.addEventListener('click', function () { seed = (Math.random() * 1e6) | 0; build(seed); respawnFox(); startLogo(false); refresh(); });
    bLogo.addEventListener('click', function () { startLogo(false); });
    gw.appendChild(bNew); gw.appendChild(bLogo);
    var now = el('p', 'smp-now'), nowTxt = el('span'), clockEl = el('span', 'smp-clock'); now.setAttribute('aria-live', 'polite'); clockEl.setAttribute('aria-hidden', 'true'); now.appendChild(nowTxt); now.appendChild(clockEl); ui.appendChild(now);
    var row = el('div', 'row smp-row'), pb = el('button', 'mbtn', ''); pb.type = 'button'; pb.addEventListener('click', function () { playing = !playing; refresh(); });
    var cta = el('a', 'btn', 'Order something like this'); cta.href = WA + encodeURIComponent('Hi Iffy, I saw your Minecraft-style sample and I would like something like it.'); cta.target = '_blank'; cta.rel = 'noopener';
    row.appendChild(pb); row.appendChild(cta); ui.appendChild(row);
    function clock() { var h = ((tod % 24) + 24) % 24, hh = Math.floor(h), mm = Math.floor((h - hh) * 60); return (hh < 10 ? '0' : '') + hh + ':' + (mm < 10 ? '0' : '') + mm; }
    function refresh() {
      Object.keys(modeBtns).forEach(function (m) { modeBtns[m].setAttribute('aria-pressed', m === mode ? 'true' : 'false'); });
      pb.textContent = playing ? 'Pause' : 'Play';
      triChip.textContent = 'about ' + Math.round((tris + nb * 12 + 330) / 100) / 10 + 'k triangles';
      nowTxt.textContent = (playing ? 'Running' : 'Paused') + ', ' + mode.toLowerCase(); clockEl.textContent = ' - ' + clock();
    }
    refresh();

    // ---- colours for the time of day. Each is [night, day, sunset], written as what you see on screen.
    var PAL = {
      top: [col(.02, .03, .09), col(.3, .58, .95), col(.2, .22, .52)],
      hor: [col(.06, .09, .21), col(.66, .85, .98), col(1, .56, .33)],
      tint: [col(.3, .36, .62), col(1, 1, 1), col(1, .79, .66)],
      water: [col(.05, .1, .28), col(.2, .46, .86), col(.5, .36, .6)],
      cloud: [col(.2, .24, .38), col(1, 1, 1), col(1, .78, .68)],
      sunc: [col(1, 1, 1), col(1, 1, 1), col(1, .62, .36)]
    };
    var cTop = col(0, 0, 0), cHor = col(0, 0, 0), cTint = col(0, 0, 0), cWater = col(0, 0, 0), cCloud = col(0, 0, 0), cSun = col(0, 0, 0), WHITE = col(1, 1, 1);
    function blend(out, p, day, warm) { return out.copy(p[0]).lerp(p[1], day).lerp(p[2], warm); }
    function setLin(c, s) { c.setRGB(lin(s.r), lin(s.g), lin(s.b)); return c; }
    var dayK = 1, warmK = 0;
    function applyTime() {
      var a = (tod - 6) / 12 * PI, sh = Math.sin(a), op, gl;
      dayK = clamp(sh * 1.8 + .15, 0, 1); warmK = clamp(1 - Math.abs(sh) * 3.2, 0, 1) * (sh > -.25 ? .9 : 0);
      blend(cTop, PAL.top, dayK, warmK); blend(cHor, PAL.hor, dayK, warmK);
      skyMat.uniforms.top.value.copy(cTop); skyMat.uniforms.hor.value.copy(cHor); fog.color.copy(cHor);
      setLin(terrainMat.color, blend(cTint, PAL.tint, dayK, warmK));
      logoMat.color.setRGB(lin(lerp(.8, 1, dayK)), lin(lerp(.8, 1, dayK)), lin(lerp(.85, 1, dayK)));
      setLin(waterMat.color, blend(cWater, PAL.water, dayK, warmK));
      setLin(cCloud, blend(cCloud, PAL.cloud, dayK, warmK)); op = .12 + .85 * dayK;
      clouds.forEach(function (c) { c.m.material.color.copy(cCloud); c.m.material.opacity = op; });
      setLin(sun.material.color, blend(cSun, PAL.sunc, dayK, warmK)); sunGlow.material.color.copy(sun.material.color);
      starMat.opacity = clamp(1 - dayK * 1.5, 0, 1);
      hemi.color.copy(cHor).lerp(WHITE, .5); hemi.intensity = .45 + .45 * dayK; sunLight.intensity = .12 + .9 * dayK * (1 - warmK * .3); sunLight.color.setRGB(1, lerp(.95, .65, warmK), lerp(.85, .45, warmK));
      sunLight.position.set(Math.cos(a) * 30 + cx, Math.max(8, Math.sin(a) * 30), cz + 10); sunLight.target.position.set(cx, 8, cz);
      gl = 1 - dayK; halos.forEach(function (h) { h.material.opacity = .15 + .85 * gl; }); logoGlow.material.opacity = gl * .5;
    }
    applyTime();

    var camTarget = new THREE.Vector3(cx, 9.2, cz - 2);
    function update(t, dt) {
      var i, a, c;
      if (logoT >= 0 && logoT < 4) { logoT += dt; layLogo(); }   // the logo build runs even while paused, because you asked for it
      if (playing) {
        if (auto) tod += dt * 24 / 90; else { var diff = ((todTarget - tod + 36) % 24) - 12; tod += diff * Math.min(1, dt * 2.2); }
        tod = (tod % 24 + 24) % 24; tAcc += dt;
        if (!built && tAcc > .8) { built = true; startLogo(false); }
        // fox
        if (F.state === 'idle') { F.timer -= dt; if (F.timer <= 0) pickTarget(); }
        else {
          var dx = F.tx - F.x, dz = F.tz - F.z, dist = Math.hypot(dx, dz);
          if (dist < .15) { F.state = 'idle'; F.timer = 1 + Math.random() * 2.5; }
          else {
            var step = Math.min(dist, 1.6 * dt), nx = F.x + dx / dist * step, nz = F.z + dz / dist * step;
            if (ok(nx, nz, F.y)) { F.x = nx; F.z = nz; F.yaw += (((Math.atan2(dx, dz) - F.yaw + 3 * PI) % (2 * PI)) - PI) * Math.min(1, dt * 8); F.ph += dt * 9; }
            else { F.state = 'idle'; F.timer = .3; }
          }
        }
      }
      var gy = gY(F.x, F.z); if (gy !== null) F.y += (gy - F.y) * Math.min(1, dt * 9);
      var moving = playing && F.state === 'walk', sw = moving ? Math.sin(F.ph) : 0;
      fox.position.set(F.x, F.y, F.z); fox.rotation.y = F.yaw; shadow.position.set(F.x, F.y + .03, F.z); shadow.rotation.y = F.yaw;
      for (i = 0; i < 4; i++) legs[i].rotation.x = (i === 0 || i === 3 ? sw : -sw) * .7;
      foxBody.position.y = moving ? Math.abs(Math.cos(F.ph)) * .05 : 0; tail.rotation.y = moving ? Math.sin(F.ph * .6) * .35 : Math.sin(t * 1.4) * .12;
      head.rotation.x = moving ? 0 : Math.sin(t * .8) * .06; head.rotation.y = moving ? 0 : Math.sin(t * .6) * .35;
      applyTime();
      // camera: orbit around the logo plateau
      var sway = (playing && performance.now() - touched > 3500) ? Math.sin(t * .22) * .2 : 0; swayS += (sway - swayS) * Math.min(1, dt * 2);
      yaw += (yawT + swayS - yaw) * Math.min(1, dt * 8);
      var dist0 = clamp(28 / (2 * halfT * aspect), 28, 92) / zoom, cp = Math.cos(pitch);
      cam.position.set(camTarget.x + Math.sin(yaw) * cp * dist0, camTarget.y + Math.sin(pitch) * dist0, camTarget.z + Math.cos(yaw) * cp * dist0); cam.lookAt(camTarget);
      fog.near = dist0 + 28; fog.far = dist0 + 95;
      // sky follows the camera and is fixed to the world sideways, so turning the view slides the sun across it
      dome.position.copy(cam.position); skyG.position.copy(cam.position); skyG.quaternion.copy(cam.quaternion);
      halfH = SKY_D * halfT; halfW = halfH * aspect;
      skyS.position.x = clamp(Math.tan(clamp(yaw, -1.5, 1.5) * .5) / (halfT * aspect), -5, 5) * halfW;
      a = (tod - 6) / 12 * PI; var sSize = .1 * 2 * halfH, mSize = .08 * 2 * halfH;
      sun.position.set(-Math.cos(a) * .78 * halfW, (.62 + Math.sin(a) * .22) * halfH, -SKY_D); sun.scale.setScalar(sSize); sun.visible = sunGlow.visible = Math.sin(a) > -.1;
      sunGlow.position.copy(sun.position); sunGlow.scale.setScalar(sSize * 3.2);
      moon.position.set(Math.cos(a) * .78 * halfW, (.62 - Math.sin(a) * .22) * halfH, -SKY_D); moon.scale.setScalar(mSize); moon.visible = moonGlow.visible = Math.sin(a) < .1;
      moonGlow.position.copy(moon.position); moonGlow.scale.setScalar(mSize * 3); moonGlow.material.opacity = .5;
      for (i = 0; i < clouds.length; i++) {
        c = clouds[i]; if (playing) { c.x += c.sp * dt; if (c.x > 3.4) c.x -= 6.8; }
        c.m.position.set(c.x * halfW, c.y * halfH, -SKY_D + 3); c.m.scale.set(c.w * halfW, c.w * halfW / 3, 1);
      }
      tClock += dt; if (tClock > .4) { tClock = 0; clockEl.textContent = ' - ' + clock(); }
    }
    function resize(w, h) { aspect = w / h; cam.aspect = aspect; cam.updateProjectionMatrix(); halfW = halfH * aspect; layStars(); }

    return {
      ui: ui, scene: scene, camera: cam, update: update, resize: resize,
      drag: function (dx, dy) { yawT -= dx * .008; pitch = clamp(pitch + dy * .004, .1, 1.15); touched = performance.now(); },
      pinch: function (f) { zoom = clamp(zoom * f, .6, 1.8); },
      reset: function () { zoom = 1; yawT = 0; pitch = PITCH0; touched = 0; },
      restore: function () {},
      hint: matchMedia('(pointer:coarse)').matches ? 'Drag to look around, pinch to zoom' : 'Drag to look around. Ctrl and scroll to zoom. Double click to reset.'
    };
  } });
})();
