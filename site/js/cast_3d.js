/* Cast of six live 3D characters for the "3D Characters & Design" station of the home journey.
   They are the Naija Life cast, rebuilt from the render in assets/img/naija-lineup.webp.
   No model files: every body is built in code, rigged on one shared skeleton and drawn as one
   skinned mesh per character (one or two draw calls each). Needs three.js r128 (global THREE).
     var cast = IFFY_CAST.create(THREE, { pmrem: new THREE.PMREMGenerator(renderer) });
     scene.add(cast.group);                     // origin = floor, about 2.7 units tall
     cast.update(seconds, { x: px, y: py });    // every frame while visible, pointer in -0.5..0.5
     cast.setFit(0.9);                          // scale factor, to keep all six inside a narrow screen
     cast.restore(pmremGenerator);              // after a lost WebGL context comes back */
(function () {
  'use strict';
  var PI = Math.PI, ZERO = [0, 0, 0];

  // One skeleton for every character: [name, parent, x, y, z], rest pose in metres, facing +z, feet on y = 0.
  var RIG = [
    ['hips', null, 0, .94, 0], ['spine', 'hips', 0, .1, 0], ['chest', 'spine', 0, .2, 0], ['neck', 'chest', 0, .26, 0], ['head', 'neck', 0, .07, 0],
    ['clavL', 'chest', .07, .22, 0], ['uarmL', 'clavL', .105, 0, 0], ['farmL', 'uarmL', 0, -.29, 0], ['handL', 'farmL', 0, -.26, 0],
    ['clavR', 'chest', -.07, .22, 0], ['uarmR', 'clavR', -.105, 0, 0], ['farmR', 'uarmR', 0, -.29, 0], ['handR', 'farmR', 0, -.26, 0],
    ['thighL', 'hips', .095, -.04, 0], ['shinL', 'thighL', 0, -.43, 0], ['footL', 'shinL', 0, -.42, 0],
    ['thighR', 'hips', -.095, -.04, 0], ['shinR', 'thighR', 0, -.43, 0], ['footR', 'shinR', 0, -.42, 0]
  ];
  var IDX = {}, WP = {};
  RIG.forEach(function (d, i) { IDX[d[0]] = i; var p = d[1] ? WP[d[1]] : [0, 0, 0]; WP[d[0]] = [p[0] + d[2], p[1] + d[3], p[2] + d[4]]; });

  // Lathe profiles [radius, y] in rest-pose metres, low to high.
  var PELVIS = [[0, .8], [.085, .81], [.125, .85], [.142, .93], [.14, 1.02], [.13, 1.1]];
  var CHEST = [[.13, 1.1], [.15, 1.16], [.16, 1.24], [.172, 1.33], [.172, 1.42], [.15, 1.49], [.085, 1.53], [0, 1.545]];
  var HEAD = [[0, -.135], [.035, -.13], [.07, -.115], [.1, -.08], [.118, -.03], [.122, .03], [.115, .085], [.095, .125], [.055, .148], [0, .155]];
  var BEARD = [[0, -.141], [.038, -.136], [.074, -.121], [.104, -.094], [.114, -.072]];
  var SKIRT = [[.325, .07], [.31, .2], [.27, .4], [.22, .62], [.18, .85], [.155, 1.02], [.15, 1.12]];
  var ROBE = [[.345, .42], [.32, .55], [.28, .72], [.235, .9], [.205, 1.05], [.195, 1.2]];
  var GELE = [[.135, 1.76], [.145, 1.8], [.155, 1.86], [.175, 1.93], [.2, 2], [.205, 2.04], [.17, 2.07], [.1, 2.08], [0, 2.075]];
  var HIJAB_TOP = [[.134, 1.762], [.139, 1.8], [.13, 1.836], [.1, 1.866], [.055, 1.888], [0, 1.896]];
  var HIJAB_SIDE = [[.152, 1.6], [.139, 1.64], [.141, 1.7], [.14, 1.74], [.136, 1.77]];
  var DRAPE = [[.238, 1.36], [.215, 1.44], [.165, 1.52], [.152, 1.6]];
  var EYEW = '#f3eee6', EYEB = '#17100b', MOUTH = '#2b1511';

  function create(THREE, opts) {
    opts = opts || {};
    if (!opts.pmrem) throw new Error('IFFY_CAST needs opts.pmrem');
    var V3 = THREE.Vector3, M4 = THREE.Matrix4, EU = THREE.Euler, QU = THREE.Quaternion;
    var pmrem = opts.pmrem, group = new THREE.Group(), mats = [], lc = {};
    function lin(hex) { return lc[hex] || (lc[hex] = new THREE.Color(hex).convertSRGBToLinear()); }
    function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
    function smooth(x) { return x * x * (3 - 2 * x); }

    // ---- lighting: a small studio baked into an environment map, so only the cast is lit by it
    function makeEnv() {
      var es = new THREE.Scene(); es.background = new THREE.Color(0x1e1a18);
      [[0xfff2e0, 3.6, [0, 6.5, 5], [7, 1.2, 7]], [0xe9edff, .95, [-7, 1.5, 3], [1.2, 4, 4]], [0xff8a2a, 3.2, [6.5, 2, -3.5], [1.5, 4, 4]], [0xffe8d0, 2.4, [-6, 2.5, -4], [1.5, 4, 4]], [0xb9a98f, .55, [0, -4, 2], [6, .6, 6]]].forEach(function (l) {
        var m = new THREE.Mesh(new THREE.BoxGeometry(l[3][0], l[3][1], l[3][2]), new THREE.MeshBasicMaterial({ color: new THREE.Color(l[0]).multiplyScalar(l[1]) }));
        m.position.set(l[2][0], l[2][1], l[2][2]); es.add(m);
      });
      return pmrem.fromScene(es, .04).texture;
    }
    var env = makeEnv();

    // ---- patterns drawn once on small canvases
    function tex(draw) {
      var c = document.createElement('canvas'); c.width = c.height = 256; draw(c.getContext('2d'));
      var t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.encoding = THREE.sRGBEncoding; return t;
    }
    var kente = tex(function (x) {
      x.fillStyle = '#efbb2a'; x.fillRect(0, 0, 256, 256);
      var cols = ['#7a2f93', '#1c9a8c', '#7a2f93', '#e8731f'], i, j;
      for (i = 0; i < 8; i++) {
        x.fillStyle = i % 2 ? '#1c9a8c' : '#7a2f93'; x.fillRect(i * 32, 0, 4, 256);
        for (j = 0; j < 4; j++) { x.fillStyle = cols[(i + j * 2) % 4]; x.fillRect(i * 32 + 7, j * 64 + 8, 20, 48); }
      }
    });
    var tech = tex(function (x) {
      x.fillStyle = '#f0642c'; x.fillRect(0, 0, 256, 256);
      var seed = 7, i, cols = ['#17998f', '#f2c42f', '#1d3f78', '#17998f', '#f2c42f'];
      function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
      for (i = 0; i < 30; i++) {
        var cx = rnd() * 256, cy = rnd() * 256, s = 16 + rnd() * 28;
        x.fillStyle = cols[i % cols.length]; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + s, cy + s * (rnd() - .2)); x.lineTo(cx + s * (rnd() - .5), cy + s * 1.2); x.closePath(); x.fill();
      }
    });
    var shadowTex = (function () {
      var c = document.createElement('canvas'); c.width = c.height = 64; var x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 2, 32, 32, 31);
      g.addColorStop(0, 'rgba(0,0,0,.7)'); g.addColorStop(.55, 'rgba(0,0,0,.32)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(c);
    })();

    function mat(extra) {
      var m = new THREE.MeshStandardMaterial(Object.assign({ roughness: .74, metalness: 0, envMap: env, envMapIntensity: 1.3, skinning: true }, extra));
      mats.push(m); return m;
    }
    var matBody = mat({ vertexColors: true }), matKente = mat({ map: kente }), matTech = mat({ map: tech });

    // ---- geometry helpers (all in metres, rest pose)
    function xf(g, p, r, s) {
      return g.applyMatrix4(new M4().compose(new V3(p[0], p[1], p[2]), new QU().setFromEuler(new EU(r ? r[0] : 0, r ? r[1] : 0, r ? r[2] : 0)), new V3(s ? s[0] : 1, s ? s[1] : 1, s ? s[2] : 1)));
    }
    function sph(r, sx, sy, sz, w, h) { return new THREE.SphereGeometry(r, w || 12, h || 9).scale(sx || 1, sy || 1, sz || 1); }
    function lat(pts, seg, sx, sz, p0, pl) { return new THREE.LatheGeometry(pts.map(function (q) { return new THREE.Vector2(q[0], q[1]); }), seg || 16, p0 || 0, pl || PI * 2).scale(sx || 1, 1, sz || 1); }
    function limb(rt, rb, len) {   // tapered capsule hanging down from its top joint centre
      var pts = [], i, a;
      for (i = 0; i <= 4; i++) { a = i / 4 * PI / 2; pts.push([rt * Math.sin(a), rt * Math.cos(a)]); }
      for (i = 0; i <= 4; i++) { a = i / 4 * PI / 2; pts.push([rb * Math.cos(a), -len - rb * Math.sin(a)]); }
      return lat(pts.reverse(), 10);
    }
    function ring(R, r, seg) { return new THREE.TorusGeometry(R, r, 6, seg || 20).rotateX(PI / 2); }
    function box(w, h, d) { return new THREE.BoxGeometry(w, h, d); }
    function cyl(rt, rb, h, seg) { return new THREE.CylinderGeometry(rt, rb, h, seg || 14, 1); }
    function rAt(p, y) {
      for (var i = 1; i < p.length; i++) if (y <= p[i][1]) { var a = p[i - 1], b = p[i]; return a[0] + (b[0] - a[0]) * (y - a[1]) / Math.max(1e-6, b[1] - a[1]); }
      return p[p.length - 1][0];
    }
    function band(p, y0, y1, grow, sx, sz) { var m = (y0 + y1) / 2; return lat([[rAt(p, y0) * grow, y0], [rAt(p, m) * grow, m], [rAt(p, y1) * grow, y1]], 18, sx, sz); }

    // ---- merge many small parts into one skinned geometry (every vertex follows exactly one bone)
    function Builder() {
      var G = [grp(), grp()];
      function grp() { return { p: [], n: [], u: [], c: [], s: [], w: [], i: [], v: 0 }; }
      this.add = function (geo, bone, col, m) {
        var g = G[m || 0], P = geo.attributes.position, N = geo.attributes.normal, U = geo.attributes.uv, X = geo.index, bi = IDX[bone], c = typeof col === 'string' ? lin(col) : col, k, base = g.v;
        for (k = 0; k < P.count; k++) {
          g.p.push(P.getX(k), P.getY(k), P.getZ(k)); g.n.push(N.getX(k), N.getY(k), N.getZ(k)); g.u.push(U ? U.getX(k) : 0, U ? U.getY(k) : 0);
          g.c.push(c.r, c.g, c.b); g.s.push(bi, 0, 0, 0); g.w.push(1, 0, 0, 0);
        }
        if (X) for (k = 0; k < X.count; k++) g.i.push(X.getX(k) + base); else for (k = 0; k < P.count; k++) g.i.push(k + base);
        g.v += P.count; geo.dispose();
      };
      this.geometry = function () {
        var geo = new THREE.BufferGeometry(), P = [], N = [], U = [], C = [], S = [], W = [], I = [], base = 0, mi, k, g;
        for (mi = 0; mi < 2; mi++) {
          g = G[mi]; if (!g.v) continue;
          P = P.concat(g.p); N = N.concat(g.n); U = U.concat(g.u); C = C.concat(g.c); S = S.concat(g.s); W = W.concat(g.w);
          geo.addGroup(I.length, g.i.length, mi);
          for (k = 0; k < g.i.length; k++) I.push(g.i[k] + base);
          base += g.v;
        }
        geo.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); geo.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
        geo.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2)); geo.setAttribute('color', new THREE.Float32BufferAttribute(C, 3));
        geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(S, 4)); geo.setAttribute('skinWeight', new THREE.Float32BufferAttribute(W, 4));
        geo.setIndex(I); return geo;
      };
    }

    // ---- shared body parts
    function face(B, s) {
      var sk = s.skin, hc = 1.7;
      B.add(xf(lat(HEAD, 22, 1, .92), [0, hc, 0]), 'head', sk);
      [1, -1].forEach(function (g) {
        B.add(xf(sph(.026, .6, 1, .8, 8, 6), [g * .118, hc - .005, -.004]), 'head', sk);
        B.add(xf(sph(.0175, 1, .8, .55, 10, 8), [g * .043, hc + .02, .102]), 'head', EYEW);
        B.add(xf(sph(.0125, 1, 1, .5, 8, 6), [g * .043, hc + .02, .114]), 'head', EYEB);
        B.add(xf(box(.046, .009, .01), [g * .044, hc + .057, .106], [0, 0, -g * .12]), 'head', s.brow || '#1a110c');
      });
      B.add(xf(sph(.02, 1, 1.1, .9, 8, 6), [0, hc - .012, .117]), 'head', sk);
      B.add(xf(box(.046, .008, .008), [0, hc - .064, .105]), 'head', MOUTH);
    }
    function body(B, s) {
      var sk = s.skin;
      B.add(lat(PELVIS.slice(0, 5).concat([[CHEST[0][0] * s.shW / s.hipW, 1.1]]), 18, s.hipW, .79), 'hips', s.btm, s.btmMat);
      B.add(lat(CHEST, 18, s.shW, .79), 'chest', s.top, s.topMat);
      B.add(xf(cyl(.043, .05, .15, 12), [0, 1.535, 0]), 'neck', sk);
      face(B, s);
      ['L', 'R'].forEach(function (d) {
        var u = WP['uarm' + d], f = WP['farm' + d], h = WP['hand' + d], t = WP['thigh' + d], k = WP['shin' + d], a = WP['foot' + d];
        B.add(xf(sph(.05), u), 'uarm' + d, s.arm, s.armMat);
        B.add(xf(limb(.052, .044, .29), u), 'uarm' + d, s.arm, s.armMat);
        B.add(xf(limb(.044, .035, .26), f), 'farm' + d, s.farm, s.armMat);
        B.add(xf(sph(.04, .8, 1.15, .62), [h[0], h[1] - .045, h[2]]), 'hand' + d, s.hand || sk);
        B.add(xf(limb(.08, .062, .43), t), 'thigh' + d, s.thigh, s.legMat);
        B.add(xf(limb(.062, .043, .42), k), 'shin' + d, s.shin, s.legMat);
        B.add(xf(sph(.05, 1, .9, 2.2), [a[0], a[1] - .005, a[2] + .045]), 'foot' + d, s.shoe);
      });
    }
    function sleeves(B, col, len, m) {
      ['L', 'R'].forEach(function (d) { var u = WP['uarm' + d]; B.add(xf(sph(.054), u), 'uarm' + d, col, m); B.add(xf(limb(.055, .05, len), u), 'uarm' + d, col, m); });
    }
    function hairCap(B, col, grow) {   // hairline above the brows, covers the back of the head down to the nape
      B.add(xf(new THREE.SphereGeometry(.142 * (grow || 1), 24, 14, 0, PI * 2, 0, PI * .5), [0, 1.712, -.004], [-.38, 0, 0], [1, 1.14, .99]), 'head', col);
    }

    // ---- the six characters, in lineup order
    var SPECS = [
      { name: 'Lagos danfo conductor', ph: .3, sig: 'wave', dur: 2.6, x: -1.55, z: -.28, h: 1, yaw: .14, build: function (B) {
        var s = { skin: '#6b4129', top: '#f0c21a', btm: '#1d1d21', arm: '#6b4129', farm: '#6b4129', thigh: '#1d1d21', shin: '#6b4129', shoe: '#5a3a27', shW: 1.22, hipW: 1.1 };
        body(B, s); sleeves(B, '#f0c21a', .16);
        B.add(band(CHEST, 1.13, 1.2, 1.03, s.shW, .79), 'chest', '#18181b');
        hairCap(B, '#141010');
        B.add(xf(box(.028, .06, .014), [WP.handL[0] + .005, WP.handL[1] - .05, WP.handL[2] + .04], [.2, 0, 0]), 'handL', '#7a4bd0');
      } },
      { name: 'Yaba tech designer', ph: 1.7, sig: 'dance', dur: 2.8, x: -1, z: .28, h: .95, yaw: .08, build: function (B) {
        var s = { skin: '#8c5b3d', top: '#f0642c', topMat: 1, btm: '#2e5090', arm: '#8c5b3d', farm: '#8c5b3d', thigh: '#2e5090', shin: '#2e5090', shoe: '#e9e9e5', shW: 1.08, hipW: 1.2 };
        body(B, s); sleeves(B, '#f0642c', .12, 1);
        hairCap(B, '#17110e');
        B.add(xf(sph(.062, 1, 1, 1, 12, 9), [0, 1.84, -.1]), 'head', '#17110e');
        B.add(xf(ring(.07, .012), [0, 1.84, -.1], [PI / 2, 0, 0]), 'head', '#2a2a30');
        [1, -1].forEach(function (g) { B.add(xf(new THREE.TorusGeometry(.03, .0045, 6, 16), [g * .121, 1.668, .004], [0, PI / 2, 0]), 'head', '#e0a83a'); });
      }, pat: 'tech' },
      { name: 'Ibadan market trader', ph: 2.9, sig: 'wave', dur: 2.6, x: -.33, z: -.28, h: .93, yaw: .04, build: function (B) {
        var s = { skin: '#573624', top: '#efbb2a', topMat: 1, btm: '#efbb2a', btmMat: 1, arm: '#573624', farm: '#573624', thigh: '#573624', shin: '#573624', shoe: '#5b3a28', shW: 1.1, hipW: 1.18 };
        body(B, s); sleeves(B, '#efbb2a', .12, 1);
        B.add(lat(SKIRT, 22, 1, 1), 'hips', '#efbb2a', 1);
        B.add(lat(GELE, 22, 1, 1), 'head', '#f0bd2c');
        B.add(xf(ring(.137, .014, 24), [0, 1.775, 0]), 'head', '#c8862a');
        for (var k = 0; k < 7; k++) { var a = k / 7 * PI * 2; B.add(xf(new THREE.ConeGeometry(.032, .09, 6), [Math.cos(a) * .185, 2.085, Math.sin(a) * .185]), 'head', '#f6cf55'); }
      }, pat: 'kente' },
      { name: 'Kano textile trader', ph: .9, sig: 'greet', dur: 2.2, x: .38, z: .28, h: 1, yaw: -.04, build: function (B) {
        var W = '#ecebe6', s = { skin: '#6b4129', top: W, btm: W, arm: W, farm: W, thigh: W, shin: W, hand: '#6b4129', shoe: W, shW: 1.24, hipW: 1.1, brow: '#4a4642' };
        body(B, s);
        B.add(lat(ROBE, 22, 1, 1), 'hips', W);
        ['L', 'R'].forEach(function (d) { var u = WP['uarm' + d], f = WP['farm' + d]; B.add(xf(limb(.075, .09, .3), u), 'uarm' + d, W); B.add(xf(limb(.09, .06, .26), f), 'farm' + d, W); });
        B.add(xf(box(.17, .2, .02), [0, 1.27, .138]), 'chest', '#2d8b86');
        B.add(xf(box(.17, .04, .022), [0, 1.37, .139]), 'chest', '#e8b73a');
        B.add(xf(cyl(.108, .125, .12, 24), [0, 1.812, 0]), 'head', '#8d1f2c');
        B.add(xf(ring(.126, .013, 24), [0, 1.77, 0]), 'head', '#e9b83a');
        B.add(xf(lat(BEARD, 18, 1, .94, -PI * .62, PI * 1.24), [0, 1.7, 0]), 'head', '#bdb9b3');
        B.add(xf(box(.07, .012, .012), [0, 1.652, .12]), 'head', '#bdb9b3');
      } },
      { name: 'Port Harcourt oil technician', ph: 2.2, sig: 'cheer', dur: 2.6, x: 1.05, z: -.28, h: 1.05, yaw: -.1, build: function (B) {
        var O = '#f07b21', Wt = '#ebebe6', s = { skin: '#5d3a27', top: O, btm: O, arm: O, farm: O, thigh: O, shin: O, hand: '#5d3a27', shoe: '#2c2827', shW: 1.24, hipW: 1.1, brow: '#1a110c' };
        body(B, s);
        B.add(band(CHEST, 1.17, 1.23, 1.03, s.shW, .79), 'chest', Wt);
        ['L', 'R'].forEach(function (d) {
          var f = WP['farm' + d], k = WP['shin' + d];
          B.add(xf(ring(.047, .008), [f[0], f[1] - .13, f[2]]), 'farm' + d, Wt);
          B.add(xf(ring(.064, .009), [k[0], k[1] - .2, k[2]]), 'shin' + d, Wt);
          B.add(xf(limb(.055, .048, .11), [k[0], .17, k[2]]), 'shin' + d, '#2c2827');
        });
        B.add(xf(new THREE.SphereGeometry(.138, 24, 12, 0, PI * 2, 0, PI / 2), [0, 1.775, 0], null, [1, .92, 1.04]), 'head', '#ecece8');
        B.add(xf(cyl(.172, .172, .012, 28), [0, 1.772, .012]), 'head', '#ecece8');
        B.add(xf(box(.028, .018, .27), [0, 1.9, 0]), 'head', '#ecece8');
        B.add(xf(lat(BEARD, 18, 1, .94, -PI * .62, PI * 1.24), [0, 1.7, 0]), 'head', '#1a110c');
      } },
      { name: 'Abuja NYSC corps member', ph: 3.6, sig: 'salute', dur: 2.4, x: 1.6, z: .28, h: .94, yaw: -.14, build: function (B) {
        var K = '#d2b985', G = '#2e7d46', s = { skin: '#855439', top: K, btm: K, arm: K, farm: K, thigh: K, shin: K, hand: '#855439', shoe: '#6a4b36', shW: 1.08, hipW: 1.2 };
        body(B, s);
        B.add(xf(ring(.062, .012), [WP.uarmL[0], WP.uarmL[1] - .09, 0]), 'uarmL', G);
        B.add(lat(HIJAB_TOP, 24, 1, .98), 'head', G);
        B.add(lat(HIJAB_SIDE, 24, 1, .98, PI * .33, PI * 1.34), 'head', G);
        B.add(lat(DRAPE, 24, 1.1, .95), 'head', G);
      } }
    ];

    // ---- poses: each clip edits a copy of the idle pose. Euler angles per bone, radians.
    function idle(t, ph) {
      var b = Math.sin(t * 1.8 + ph);
      return {
        hips: [0, Math.sin(t * .4 + ph) * .05, Math.sin(t * .8 + ph) * .018], spine: [.02 + b * .01, 0, -Math.sin(t * .8 + ph) * .012],
        chest: [b * .014, Math.sin(t * .5 + ph) * .04, 0], head: [Math.sin(t * .7 + ph) * .025, Math.sin(t * .45 + ph + 1) * .1, Math.sin(t * .6 + ph) * .02],
        uarmL: [.04 + b * .012, 0, .17], uarmR: [.04 + b * .012, 0, -.17], farmL: [-.16, 0, 0], farmR: [-.16, 0, 0],
        thighL: [0, 0, .035], thighR: [0, 0, -.035], dy: 0
      };
    }
    var CLIPS = {
      wave: function (P, t) { var w = Math.sin(t * 9); P.uarmL = [0, 0, 2.2]; P.farmL = [-.25, 0, .35 + w * .5]; P.head = [P.head[0], P.head[1], .14]; P.chest = [P.chest[0], P.chest[1], -.07]; return P; },
      cheer: function (P, t) {
        var b = Math.abs(Math.sin(t * 6)); P.uarmL = [0, 0, 2.55]; P.uarmR = [0, 0, -2.55]; P.farmL = [-.08, 0, .2]; P.farmR = [-.08, 0, -.2]; P.dy = b * .08 - .03;
        P.thighL = [-b * .3, 0, .05]; P.thighR = [-b * .3, 0, -.05]; P.shinL = [b * .5, 0, 0]; P.shinR = [b * .5, 0, 0]; P.head = [-.12, P.head[1], 0]; return P;
      },
      dance: function (P, t) {
        var s = Math.sin(t * 7), c = Math.cos(t * 7);
        P.hips = [0, s * .35, c * .05]; P.chest = [0, -s * .25, 0]; P.uarmL = [-.4 + c * .5, 0, 1 + s * .3]; P.uarmR = [-.4 - c * .5, 0, -1 + s * .3];
        P.farmL = [-1, 0, 0]; P.farmR = [-1, 0, 0]; P.dy = Math.abs(s) * .05 - .02; P.thighL = [Math.min(0, -s) * .25, 0, .06]; P.thighR = [Math.min(0, s) * .25, 0, -.06]; P.head = [0, s * .2, s * .1]; return P;
      },
      greet: function (P, t) { var b = Math.sin(Math.min(1, t / .5) * PI / 2); P.chest = [.32 * b, 0, 0]; P.spine = [.12 * b, 0, 0]; P.head = [.18 * b, 0, 0]; P.uarmR = [-.35, 0, -.3]; P.farmR = [-1.9, 0, 0]; return P; },
      salute: function (P, t) { P.uarmR = [-.55, 0, -1.2]; P.farmR = [-2.3, .2, 0]; P.head = [-.06, .12, 0]; P.chest = [-.03, .05, 0]; return P; }
    };

    // ---- assemble the characters
    var chars = [], tris = 0, CYCLE, base = opts.scale || 1.45;
    SPECS.forEach(function (sp) {
      var B = new Builder(); sp.build(B);
      var geo = B.geometry(), bones = {}, list = [];
      RIG.forEach(function (d) { var b = new THREE.Bone(); b.name = d[0]; b.position.set(d[2], d[3], d[4]); if (d[1]) bones[d[1]].add(b); bones[d[0]] = b; list.push(b); });
      list[0].updateMatrixWorld(true);
      var skel = new THREE.Skeleton(list), pat = sp.pat === 'kente' ? matKente : sp.pat === 'tech' ? matTech : matBody;
      var mesh = new THREE.SkinnedMesh(geo, [matBody, pat]); mesh.frustumCulled = false; mesh.add(bones.hips); mesh.bind(skel);
      var g = new THREE.Group(); g.add(mesh);
      var sh = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 1.15).rotateX(-PI / 2), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })); sh.position.y = .012; g.add(sh);
      group.add(g); tris += geo.index.count / 3;
      chars.push({ name: sp.name, g: g, bones: bones, ph: sp.ph, sig: sp.sig, dur: sp.dur, x: sp.x, z: sp.z, h: sp.h, yaw: sp.yaw, dy: 0, pop: 0, start: 0 });
    });
    var acc = 1.2; chars.forEach(function (c) { c.start = acc; acc += c.dur - .5; }); CYCLE = acc + 1.3;
    group.scale.setScalar(base);

    var last = null;
    function update(t, look) {
      var dt = last === null ? .033 : Math.min(.06, Math.max(0, t - last)), k = 1 - Math.exp(-dt * 11), lx = look && look.x || 0, ly = look && look.y || 0;
      last = t;
      chars.forEach(function (c) {
        var s = (t - c.start) % CYCLE; if (s < 0) s += CYCLE;
        var e = s < c.dur ? smooth(Math.min(1, s / .45, (c.dur - s) / .45)) : 0, P = idle(t, c.ph), b;
        if (e > .001) {
          var Q = CLIPS[c.sig](idle(t, c.ph), s);
          for (b in Q) {
            if (b === 'dy') { P.dy = P.dy * (1 - e) + Q.dy * e; continue; }
            var a = P[b] || ZERO, z = Q[b]; P[b] = [a[0] + (z[0] - a[0]) * e, a[1] + (z[1] - a[1]) * e, a[2] + (z[2] - a[2]) * e];
          }
        }
        P.head = [P.head[0] + clamp(ly * .7, -.3, .3) * (1 - .6 * e), P.head[1] + clamp(lx * 1.3, -.55, .55) * (1 - .6 * e), P.head[2]];
        RIG.forEach(function (d) { var r = c.bones[d[0]].rotation, v = P[d[0]] || ZERO; r.x += (v[0] - r.x) * k; r.y += (v[1] - r.y) * k; r.z += (v[2] - r.z) * k; });
        c.dy += (P.dy - c.dy) * k; c.bones.hips.position.y = .94 + c.dy; c.pop += (e - c.pop) * k * .8;
        c.g.position.set(c.x, 0, c.z + .4 * c.pop); c.g.scale.setScalar(c.h * (1 + .14 * c.pop)); c.g.rotation.y = c.yaw * (1 - c.pop * .7);
      });
    }
    function setFit(f) { group.scale.setScalar(base * f); }
    function restore(p) { if (p) pmrem = p; env = makeEnv(); mats.forEach(function (m) { m.envMap = env; m.needsUpdate = true; }); }
    function info() { return { characters: chars.length, triangles: Math.round(tris), cycleSeconds: Math.round(CYCLE * 10) / 10 }; }

    update(0, null);
    return { group: group, update: update, setFit: setFit, restore: restore, info: info, names: chars.map(function (c) { return c.name; }) };
  }

  window.IFFY_CAST = { create: create };
})();
