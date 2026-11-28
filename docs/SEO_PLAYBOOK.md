# SEO, AEO and GEO playbook

## What is built in
- A real URL per page: /, /services/, /projects/, /samples/, /process/, /contact/, /agents/, /automation/, /video/, /3d/, /web/. Each has its own title, description, canonical, social tags and JSON-LD. Nav links are real links, upgraded by JS so the 3D transitions still work. Route pages use <base href="/"> so relative asset paths keep working.
- JSON-LD: ProfessionalService + Organization, Person (Samuel Gansallo), WebSite, WebPage with breadcrumbs, ItemList for services and projects, FAQPage on /process/ (12 answer first questions that match the visible text).
- site/sitemap.xml, robots.txt (allows search and AI crawlers, blocks /.netlify/), llms.txt and llms-full.txt (plain text for AI assistants), 404.html.
- Unique alt text on every image, async decoding.

## Rule
After any edit to site/index.html run:  python3 tools/build_seo.py   then   python3 tests/seo_test.py
The route folders (site/services/ and so on) are generated, never edit them by hand.
Never delete site/google1d5dde242af09b7c.html (Search Console ownership proof).
New page? Add it to ROUTES in tools/build_seo.py and to PG in site/js/router_and_pages.js.

## Boss to do (needs his accounts)
1. Search Console property https://iffystudio.site/ : click Verify, then Sitemaps, add sitemap.xml
2. URL Inspection: paste each URL, click Request Indexing.
3. Bing Webmaster Tools: import from Search Console (feeds Bing, Copilot, DuckDuckGo).
4. Same name, description and link on Fiverr, GitHub, TikTok, LinkedIn and every bio: "Iffy Studio, AI agents, automation and 3D" with https://iffystudio.site
5. Ask happy Fiverr clients to mention Iffy Studio and the site. Earned mentions drive AI citations most.
6. One short case study post per month: challenge, what was built, result.

## Later ideas
Give each case study its own URL. Add confirmed numbers. Shorten the loader for repeat visitors to improve Largest Contentful Paint.
