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
- Phone journey: the camera path ends right after station 05 (scroll length 8.7 screens instead of 10), and the station 04 text gradient starts lower in styles.css so the cast is not dimmed.
- No 3D model files existed in Downloads. If real GLB files of the cast turn up, load them with a GLTF loader in place of the code-built bodies.
- Not measured: frame rate on a budget phone.