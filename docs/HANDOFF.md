# Handoff: Iffy Studio portfolio

## What this is
A static, no build step, multi page (hash router) 3D scroll journey portfolio. All web files are in site/, the folder Netlify publishes. Open site/index.html through any static server (python3 -m http.server 8000 --directory site). Hosted on Netlify from the GitHub repo iffy13/iffy-portfolio, domain iffystudio.site.

## Structure
Paths below are inside site/ unless a folder is named explicitly. data/, docs/, history/, reference/, source/, tests/ and tools/ sit next to site/ and are never published.
- index.html: all markup (pages, case studies, reviews, planner form). Links everything below.
- css/styles.css: all styles. Light mode is `body.lm`. Loader class is `.lt` (do not reuse).
- js/media.js: manifest `window.MEDIA` mapping keys to files in assets/.
- js/hero_3d_scene.js: three.js scene (liquid orb, portrait plane, satellites, journey stations, tunnel, portal). State on `window.J` (orb) and `window.K` (camera z/fov/po/vis).
- js/router_and_pages.js: hash router for #home #services #projects #process #contact #agents #automation #video #3d #web. Curtain wipe, `RV(el)` reveal hook, `RESETH`, `AFTER`, `PTARGET` for case study deep links. Every switch scrolls to top.
- js/theme_toggle.js: `IFFY.theme(light)` toggles `body.lm`.
- js/scroll_journey.js: GSAP ScrollTrigger pinned timeline `jt()` (scrub .4), project 3D ring, hero rotating keyword, progress bar, review marquee.
- js/loader_name_particles.js: black loader, particles form "Iffy Studio" (canvas 2D).
- js/media_fill_and_video.js: fills images and videos from MEDIA, unmute buttons (13 of 15 videos have audio).
- js/planner_form.js: builds the wa.me WhatsApp message from the planner form, and holds the Projects 3D ring (it only starts on the first visit to #projects).
- vendor/: three r128, gsap 3.15.1 + ScrollTrigger 3.15.1, lenis 1.3.27 (local copies). Lottie was removed in Phase 1.
- assets/: img (webp), video (mp4), fonts (self-hosted woff2 for Unbounded and Manrope), og.jpg. The originals are in source/ next to site/ and are not published.
- data/: site.json, reviews.json (5 real Fiverr reviews), case_studies.json (16), parked-sections.html (copy blocks not yet on the site: service catalog of 33 services, FAQ, process).
- history/iffy-portfolio.single-file.html: the previous all in one 10 MB build, kept as a fallback.
- tests/smoke_test.py: serves site/ and checks errors, missing files, overflow and top on route change at desktop and phone, dark and light. Last run: all 12 checks passed.
- tools/media_commands.md: ffmpeg recipes.

## Known state and TODO
1. Proof and Launch sections should match the journey with cinematic scroll effects (they feel plainer than the rest).
2. Check light mode journey colours and scroll effects on every page.
3. Case studies and reviews are written straight into index.html. Better: render them from data/*.json.
4. Add pricing, delivery times and confirmed numbers once Boss confirms.
5. More reviews and samples coming from Boss. SaaS, games and 2D art have no samples yet.
6. Consider renaming "Shopify & Websites" to "Websites and Online Stores".
7. Spline is possible on real hosting (it was not possible inside the artifact preview). Consider a Spline hero or station.
8. "Ask my AI" chat needs a server (old site chat.js was removed). Needs a small API if wanted.
9. Mobile journey must feel continuous; keep re testing at 390 px.
10. Reported glitch (scroll to bottom then back, hero overlapped by process) was fixed by camera reset in draw(), scrub .4, RESETH on return home, ignoreMobileResize, menu scroll lock. Keep watching it.
11. Optional: add parked-sections.html content (33 services, FAQ) as proper pages.

## Deploy (Netlify, from GitHub)
iffystudio.site is built by Netlify from the GitHub repo iffy13/iffy-portfolio. netlify.toml publishes the site/ folder with no build step. netlify/functions holds the old AI chat function (kept, not used by the new site). GitHub Pages is not used.
Normal flow. Never force push, it would erase the old site and the chat function:
1. Work on a branch: git switch -c my-change, commit, then git push -u origin my-change.
2. Open a pull request into main. Netlify adds a Deploy Preview link to it. Check the preview on a phone and on desktop.
3. Merge the pull request. Netlify deploys main to iffystudio.site. To undo, revert the merge on GitHub.
Previews: Netlify only builds a Deploy Preview for a pull request aimed at main (address https://deploy-preview-N--iffyportfolio.netlify.app/, N is the pull request number). A pull request aimed at any other branch gets no preview. If one pull request is stacked on another, aim it at main anyway, and merge the first one with "Create a merge commit" (not squash) so the second one stays clean.
The first branch, new-site, replaced the old site. The old files stay in git history (for example site/chat.js and site/fx.js, if the chat is wanted back, TODO 8).
Large videos (8 mp4, about 8 MB total) are fine on Netlify.

## Known limits
Original build scripts and the old site clone were not preserved in this environment. site/index.html is now the source of truth; edit it directly.

## Fix log (first review pass)
- Reduced motion: the pinned journey is skipped, so the five stations now show as a normal stacked list (CSS at the end of styles.css). RESETH no longer hides them.
- Loader: FORM is wrapped in try/catch, re-reads the window size when it runs, and show() has a 10 s hard fallback. Without JS the loader is hidden.
- Colours: new variables --field (form fields) and --on-ember (text on orange buttons). Light mode --glow is now #8b4e0a for 4.5:1 contrast. Dark mode buttons use dark text on orange.
- Router: clicking a link to the page you are already on (logo, Home, a menu entry) closes the menu and scrolls to the top.
- Housekeeping: the nested iffy_studio/iffy_studio copy was removed. Web files moved into site/, originals into source/. .gitignore keeps history/, source/ and reference/ out of git.
## Phase 1 (speed foundation)
- GSAP 3.15.1 and Lenis 1.3.27: drop-in builds from toolkit/ (re-create it with node tools/fetch_toolkit.mjs).
- Fonts are self-hosted (assets/fonts, @font-face at the top of styles.css), so there are no Google requests.
- Lottie is gone (298 KB). The loader ring and the scroll cue are plain CSS and inline SVG.
- The Projects ring starts on the first visit to #projects, so its second WebGL context and its 16 card images no longer load up front.
- Decorative art images on hidden pages are lazy-loaded.
- Both WebGL canvases pause on context loss and resume on restore.
- Favicon (svg, ico, apple-touch-icon) and theme-color added. The icon is a simple placeholder (ring and core).
- Still open from the review: noise overlay on phones, accessibility of the review marquee and videos, service names that differ between pages, planner dropdown grouping, robots.txt and sitemap, OG image.

## Journey station 04: live 3D cast
- site/js/cast_3d.js builds six characters in code (no model files) from the render assets/img/naija-lineup.webp: Lagos danfo conductor, Yaba tech designer, Ibadan market trader, Kano textile trader, Port Harcourt oil technician, Abuja NYSC corps member. One shared 19-bone rig, one skinned mesh per character (1 or 2 draw calls), about 35k triangles in total.
- A roll call plays in a loop (wave, dance, wave, greet, cheer, salute). Heads follow the pointer. Colours, layout and clips are plain data at the top of the file (SPECS, CLIPS), lighting is makeEnv().
- hero_3d_scene.js creates the cast shortly after load (idle time), adds it to station 4's group next to the knot and grid, fits it to the screen width (fitCast), hides it when a phone camera is about to fly through it, and rebuilds its lighting after a lost WebGL context.
- Phone journey: the camera now pauses at each station like on desktop, station 05 stays on screen until the pin releases, and the 3D stage fades out as the Proof section arrives (a scroll-linked fade in scroll_journey.js), so no frame is blank. Scroll length is 9.1 screens (was 10), Proof starts with 6vh of top padding on phones, and the station 04 text gradient starts lower in styles.css so the cast is not dimmed.
- No 3D model files existed in Downloads. If real GLB files of the cast turn up, load them with a GLTF loader in place of the code-built bodies.
- Not measured: frame rate on a budget phone.
## 3D page: live cast
- site/js/cast_page.js adds a small WebGL canvas (class cast3d, inside #p-3d .stage) the first time the 3D page opens, and draws it only while that page is open and on screen. It reuses cast_3d.js, so the same six characters and the same roll call stand in front of the image cube, which is unchanged.
- The canvas has its own WebGL context (at most three on the whole site: hero, projects ring, this one). Without WebGL the page keeps just the cube. With reduced motion it draws one still frame.
- Styles are at the end of css/styles.css (.stage.live, .cast3d). Do not call the canvas class .cc: that is the generic card style.
## Samples page (#samples)
- site/js/samples.js is the page shell: one shared WebGL stage, tabs (shown once there is more than one sample), drag and pinch, pausing when the page is not open or not on screen, lost-context handling. A sample registers with IFFY_SAMPLES.add({ id, tab, mount(ctx) }).
- site/js/sample_animation.js is sample 1, game animation: the six cast characters with ten clips (idle, walk, run, wave, talk, dance, celebrate, wahala, phone call, greet), one character or all six, and a floor that slides during walk and run. The clips live in cast_3d.js (CLIPS); the viewer drives them with cast.setMode('manual'), cast.play() and cast.solo().
- site/js/sample_roblox.js is sample 2, a Roblox-style animation pack: an original blocky six-part avatar (head, torso, two arms, two legs) with twelve animations (idle, walk, run, jump, climb, sword slash, punch, block, dance, wave, cheer, point), four outfits, a studded baseplate that slides during walk and run, and props (a sword, a ladder) that appear with the animation that needs them. It uses no Roblox logo, face or texture.
- site/js/sample_minecraft.js is sample 3, a Minecraft-style voxel world: a procedurally generated 48 x 48 island (value noise: a low sandy beach in front, a flat plateau that carries the logo, hills with snow caps behind, trees on the sides) built as one mesh with only the exposed block faces. Ten pixel block textures are painted on a 128 x 64 canvas atlas (tile numbers are listed at the top of the file; every 16 px tile sits in a 20 px cell with a 2 px gutter that repeats its own edge pixels, because without it antialiased block edges pick up the neighbouring tile and draw a dark hairline). It has a Day, Sunset, Night and Auto cycle (gradient sky dome, a square sun and moon, stars and pixel clouds that follow the camera, lanterns that glow at night), an original block fox that wanders on the plateau, and the IFFY logo built block by block from one InstancedMesh (button: Build the logo; New world re-rolls the seed). Colours in that file are written as what you see on screen and converted with lin(), because the renderer outputs sRGB. It uses no Minecraft logo, texture or creature.
- site/js/sample_assets.js is sample 4, a low-poly 3D asset kit: nine original props (treasure chest, sword in stone, potion, lantern, mushroom, crystal cluster, pine tree, cottage, barrel) built from three.js primitives in code, each split into named parts (DEFS, one make() per prop; a Part collects primitives with .a(slot, geometry, x, y, z, rx, ry, rz, sx, sy, sz)). Primitives of the same material slot inside one part are merged into one mesh, so the whole kit is about 95 draw calls with every prop on screen (176 in the Wireframe view, which draws an overlay mesh per part; measured with renderer.info). Views: Shaded, Clay and Wireframe (a hidden-line overlay of the real triangles). Four palettes re-colour 16 material slots (SLOTS and PALETTES at the top), Break apart flies each prop's parts out along per-part vectors, and a turntable deck turns the props: the whole kit sits on a ring, a single prop moves to the centre. The triangle and vertex counts in the side panel are measured from the merged meshes. Lighting is a small baked studio environment (same recipe as cast_3d.js) plus a key and a rim light, so restore(pm) rebuilds the environment after a lost WebGL context. On screens wider than 820 px the stage is sticky (css), because this side panel is taller than the stage.
- site/js/sample_game.js is sample 5, the mini game "Naija Dash": an endless three lane street runner with the six cast characters as skins. Keys: arrows or A and D (lane), Up, W or Space (jump), Down or S (slide), P or Esc (pause); swipe and tap on the stage; four on screen buttons show on touch screens and in windows narrower than 821 px. Obstacles come in rows across the three lanes: crates and barrels (jump), market stalls (slide under) and danfo buses (go around). A row never fills all three lanes with buses and rows are at least 17 m apart, so there is always a way through. Levels Easy (5 lives), Normal (3) and Hard (1) change lives, speed and how fast the patterns get harder (MODES at the top of the file). A hit costs a life, gives 1.7 s of blinking invulnerability and, for a bus, nudges the runner into a free lane; at 0 lives the run ends ("Wahala!"). Score is metres plus 10 per coin; the best score per level is kept in localStorage (every access is in try/catch). Sound is a few Web Audio beeps, off until the Sound button is pressed. The game pauses by itself when the window loses focus, when the sample tab is left, and at once when the stage leaves the screen (another page, another browser tab, scrolled away) or the graphics context is lost, so keys on other pages are never taken.
  How it is built: the runner stays at z 0 and the world scrolls past it (D is the distance run). Road and paving scroll by texture offset, 14 street stretches (28 meshes sharing 16 baked variants, the left side is a mirror) are recycled, obstacles come from small pools, coins are one InstancedMesh and sparks one Points object. Everything static is baked into merged meshes whose vertex colours already hold a simple light (MeshBasicMaterial plus fog), so the scene has no lights; only the runner is lit, by the cast environment. Two clips, jump and slide, were added to CLIPS in cast_3d.js (they are not in CLIP_NAMES, so the animation viewer does not list them). The instance has a dbg() method that returns a state snapshot for tests. Measured with renderer.info: about 40 draw calls and 27k to 32k triangles per frame.
- site/js/sample_models.js is sample 6, a viewer for finished character models (GLB files in assets/models, 11.6 MB in all). Five models: Rigged runner (55k triangles, 4 animations: Idle, Run, Sit, Walk; 2.5 MB), Ahsoka Tano (44k triangles, textured, static, with a fan art notice because the character belongs to Lucasfilm and Disney; 3.8 MB), Knighty (a sculpt thinned from about 1.5 million triangles to about 103k, one mesh, one grey material; 1.9 MB), Harpy (44k triangles with colour and normal maps; 2.8 MB) and Anime character (8.7k triangles; 0.5 MB). Each model is only downloaded when it is picked, and the loader (vendor/GLTFLoader.js, the three r128 example loader, MIT, copied from the three@0.128.0 package) is only fetched the first time. Views: Shaded, Clay and Wireframe; drag to turn, pinch or Ctrl and scroll to zoom. A skinned model is fitted by measuring its skinned vertices in the first pose (measure()), not the bind-pose box, which was wrong for the runner. The Sit clip plays once and stays seated. The side panel says where each model also lives (CGTrader or Free3D). The instance has a dbg() method for tests.
  How the GLBs were made (a one-off with throwaway tools in a scratch folder, not in the repo): the sources were the files in the owner's Downloads (Ahsoka+Rig.rar, fbx+with+animations.zip, 67-harpy.rar, 91-anime_character.rar, Knighty.fbx). A converter page in headless Edge loaded each file with the three r128 FBXLoader or GLTFLoader, swapped the Phong materials for MeshStandardMaterial, shared vertices (FBX stores three per triangle), attached texture files by material name where the FBX named none (Harpy: <material>.png and <material>_nor.png; the anime character: textures.png) and exported GLB with GLTFExporter (textures capped at 1024 px and written as JPEG unless they carry transparency). Ahsoka: the 1,047-bone skeleton had no animations and cost 2.7 MB, so the meshes were baked into world space without it. Knighty (flat shaded, no UVs): vertices joined by position, thinned per mesh with meshoptimizer's simplifier (MIT, the plain JavaScript build), smooth normals recomputed, one grey material, merged into one mesh. Runner: the T-pose character plus the clips of four other Mixamo-style FBX files, with the hips' sideways and forward motion removed so the character stays in place. The originals are not in the repo; the nine files are in the owner's Downloads.
  Not in the viewer yet: Girl.blend (50-girl-blend.rar) and WhiteWeddingDressGirl.blend need Blender, or an FBX or GLB export from it, and the Escanor archive holds textures only (no mesh). Blender is not installed on this PC.
- More samples (pixel sprites) are planned as one file each that calls IFFY_SAMPLES.add.
- Samples 1 to 5 are original work made for this site and labelled as samples. They must not use Roblox or Minecraft logos or textures. Sample 6 shows models the owner says he uploaded himself to CGTrader and Free3D; keep the "Also on ..." credit line and the fan art notice on Ahsoka.
- The page is in the menu, in the top nav on screens wider than 1100 px, and linked from the last section of the home page.
