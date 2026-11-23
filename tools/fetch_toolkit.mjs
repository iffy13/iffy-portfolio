// Downloads the animation and 3D toolkit into toolkit/ (kept out of git).
// Safe by design: `npm pack` only downloads a tarball and runs no scripts. Files are extracted into a temp folder
// and only static files are copied out. Re-run any time to refresh to the latest versions.
// Usage: node tools/fetch_toolkit.mjs [outDir]
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(process.argv[2] || path.join(here, '..', 'toolkit'));
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'iffy-toolkit-'));
const NPM_CLI = path.join(path.dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js');
const npm = (args) => execFileSync(process.execPath, [NPM_CLI, ...args], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });

const FONT = (pkg, use) => ({ pkg, use: use + ' Self-hosted woff2, latin subsets.', copy: ['files/*-latin-*.woff2', 'LICENSE*'] });
const PACKAGES = [
  { pkg: 'gsap', use: 'Animation engine plus every plugin in one package: ScrollTrigger, ScrollSmoother, SplitText, Flip, MotionPath, DrawSVG, MorphSVG, ScrambleText, Observer, CustomEase, Draggable, Inertia.', copy: ['dist/*.min.js', 'LICENSE*'] },
  { pkg: 'lenis', use: 'Smooth scrolling that works with ScrollTrigger.', copy: ['dist/*.js', 'dist/*.mjs', 'dist/*.css', 'LICENSE*'] },
  { pkg: 'three', use: '3D engine as ES modules (needs an import map). Includes GLTF/Draco/KTX2 loaders, post processing (bloom), controls, and lil-gui and stats for tuning.', copy: [
    'build/three.module.js', 'build/three.core.js', 'build/three.module.min.js', 'build/three.core.min.js',
    'examples/jsm/controls/**', 'examples/jsm/loaders/**', 'examples/jsm/postprocessing/**', 'examples/jsm/shaders/**', 'examples/jsm/utils/**',
    'examples/jsm/math/**', 'examples/jsm/geometries/**', 'examples/jsm/objects/**', 'examples/jsm/environments/**', 'examples/jsm/capabilities/**',
    'examples/jsm/renderers/CSS2DRenderer.js', 'examples/jsm/renderers/CSS3DRenderer.js',
    'examples/jsm/libs/draco/**', 'examples/jsm/libs/basis/**', 'examples/jsm/libs/meshopt_decoder.module.js',
    'examples/jsm/libs/lil-gui.module.min.js', 'examples/jsm/libs/stats.module.js', 'LICENSE*'] },
  { pkg: 'ogl', use: 'Tiny WebGL library (about 30 KB) for shader backgrounds and image effects. Lighter than three for 2D effects.', copy: ['src/**', 'dist/*.mjs', 'dist/*.js', 'LICENSE*'] },
  { pkg: 'lottie-web', use: 'Lottie playback. The light build is SVG only.', copy: ['build/player/lottie_light.min.js', 'build/player/lottie.min.js', 'LICENSE*'] },
  { pkg: 'howler', use: 'Audio for UI sounds.', copy: ['dist/howler.min.js', 'dist/howler.core.min.js', 'LICENSE*'] },
  FONT('@fontsource-variable/unbounded', 'Current display font.'),
  FONT('@fontsource-variable/manrope', 'Current body font.'),
  FONT('@fontsource-variable/space-grotesk', 'Candidate: techy grotesk.'),
  FONT('@fontsource-variable/syne', 'Candidate: bold, expressive display.'),
  FONT('@fontsource-variable/bricolage-grotesque', 'Candidate: characterful grotesk.'),
  FONT('@fontsource/instrument-serif', 'Candidate: editorial serif for contrast.')
];

function expand(root, pattern) {
  const out = [];
  const segs = pattern.split('/');
  const last = segs[segs.length - 1];
  const base = path.join(root, ...segs.slice(0, -1));
  if (last === '**') {
    const walk = (d) => { if (!fs.existsSync(d)) return; for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else out.push(p); } };
    walk(base);
  } else if (last.includes('*')) {
    const re = new RegExp('^' + last.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$');
    if (fs.existsSync(base)) for (const e of fs.readdirSync(base, { withFileTypes: true })) if (e.isFile() && re.test(e.name)) out.push(path.join(base, e.name));
  } else {
    const p = path.join(root, ...segs);
    if (fs.existsSync(p) && fs.statSync(p).isFile()) out.push(p);
  }
  return out;
}

const kb = (n) => (n / 1024).toFixed(0) + ' KB';
const manifest = { generated: new Date().toISOString(), note: 'Re-create with: node tools/fetch_toolkit.mjs', packages: [] };
fs.mkdirSync(OUT, { recursive: true });
// Optional: refresh only some packages, e.g.  TOOLKIT_ONLY=three,gsap node tools/fetch_toolkit.mjs
const only = (process.env.TOOLKIT_ONLY || '').split(',').filter(Boolean);
const targets = only.length ? PACKAGES.filter((p) => only.includes(p.pkg)) : PACKAGES;

for (const spec of targets) {
  const safe = spec.pkg.replace(/[^a-z0-9]/gi, '_');
  const dl = path.join(TMP, safe);
  fs.mkdirSync(dl, { recursive: true });
  try {
    const version = npm(['view', spec.pkg, 'version']).trim();
    const packed = JSON.parse(npm(['pack', spec.pkg + '@' + version, '--pack-destination', dl, '--json']))[0];
    execFileSync('tar', ['-xzf', path.join(dl, packed.filename), '-C', dl]);
    const root = path.join(dl, 'package');
    const pj = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
    const dest = path.join(OUT, spec.pkg.replace(/^@/, '').replace('/', '__'));
    if (!dest.startsWith(OUT + path.sep)) throw new Error('refusing to write outside the toolkit folder');
    fs.rmSync(dest, { recursive: true, force: true });
    const files = [];
    const missing = [];
    for (const pat of spec.copy) {
      const hits = expand(root, pat).filter((f) => !/\.(map|d\.ts)$/.test(f));
      if (!hits.length) missing.push(pat);
      for (const f of hits) {
        const rel = path.relative(root, f);
        const to = path.join(dest, rel);
        fs.mkdirSync(path.dirname(to), { recursive: true });
        fs.copyFileSync(f, to);
        files.push({ path: rel.split(path.sep).join('/'), bytes: fs.statSync(to).size });
      }
    }
    const bytes = files.reduce((a, f) => a + f.bytes, 0);
    const entry = { name: spec.pkg, version, license: pj.license || 'see package', integrity: packed.integrity, tarballBytes: packed.size, folder: path.relative(OUT, dest).split(path.sep).join('/'), files: files.length, bytes, use: spec.use, missingPatterns: missing, fileList: files };
    manifest.packages.push(entry);
    console.log((spec.pkg + '@' + version).padEnd(52) + pj.license + ' | ' + files.length + ' files | ' + kb(bytes) + (missing.length ? ' | NO MATCH: ' + missing.join(', ') : ''));
  } catch (e) {
    manifest.packages.push({ name: spec.pkg, error: String(e.message).split('\n')[0] });
    console.log(spec.pkg.padEnd(52) + 'FAILED: ' + String(e.message).split('\n')[0]);
  }
}

const manifestPath = path.join(OUT, 'manifest.json');
if (only.length && fs.existsSync(manifestPath)) {
  const old = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  manifest.packages = old.packages.filter((p) => !only.includes(p.name)).concat(manifest.packages);
}
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
const ok = manifest.packages.filter((p) => !p.error);
const readme = [
  '# Toolkit (kept out of git)',
  '',
  'Static copies of animation and 3D libraries, downloaded by `node tools/fetch_toolkit.mjs` with `npm pack` (no install scripts run).',
  'Copy only what the site really uses into `site/vendor/`. Heavy libraries should be loaded lazily so phones stay fast.',
  '',
  '| Package | Version | License | Files | Size | Use |',
  '|---|---|---|---|---|---|',
  ...ok.map((p) => '| ' + p.name + ' | ' + p.version + ' | ' + p.license + ' | ' + p.files + ' | ' + kb(p.bytes) + ' | ' + p.use + ' |'),
  '',
  '## Quick wiring (static site, no build)',
  '',
  'GSAP and Lenis (classic scripts):',
  '',
  '    <script src="vendor/gsap.min.js"></script>',
  '    <script src="vendor/ScrollTrigger.min.js"></script>',
  '    <script src="vendor/SplitText.min.js"></script>',
  '    <script src="vendor/lenis.min.js"></script>',
  '',
  'three.js (ES modules, needs an import map before any module script):',
  '',
  '    <script type="importmap">{"imports":{"three":"./vendor/three/build/three.module.min.js","three/addons/":"./vendor/three/examples/jsm/"}}</script>',
  '    <script type="module">import * as THREE from "three"; import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";</script>',
  '',
  'Not downloaded on purpose: Spline (hosted scenes, heavy runtime), physics engines (add only when a feature needs one), React Three Fiber (needs a build step).',
  ''
].join('\n');
fs.writeFileSync(path.join(OUT, 'README.md'), readme);
fs.rmSync(TMP, { recursive: true, force: true });
const total = ok.reduce((a, p) => a + p.bytes, 0);
console.log('\nDone: ' + ok.length + ' of ' + (only.length ? PACKAGES.length : targets.length) + ' packages, ' + (total / 1048576).toFixed(1) + ' MB in ' + OUT);
