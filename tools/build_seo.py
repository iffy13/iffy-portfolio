#!/usr/bin/env python3
"""Generates all SEO, AEO and GEO files from index.html.

Run from the project root after ANY edit to index.html:
    python3 tools/build_seo.py

It (re)writes:
  - the SEO block in index.html's head (between <!--seo:start--> and <!--seo:end-->)
  - one real URL per route: /services/, /projects/, /process/, /contact/,
    /agents/, /automation/, /video/, /3d/, /web/   (each is index.html with its own head)
  - sitemap.xml, robots.txt, llms.txt, llms-full.txt, 404.html
Edit the ROUTES table below to change titles and descriptions.
"""
import re, json, os, html, datetime, sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROOT = os.path.join(REPO, 'site')   # Netlify publish directory (see netlify.toml)
SITE = 'https://iffystudio.site'
TODAY = datetime.date.today().isoformat()
BG = '#140803'
FIVERR = 'https://www.fiverr.com/samuel_gansallo'
GITHUB = 'https://github.com/iffy13'
EMAIL = 'samuel@iffystudio.site'
PHONE = '+2348075889359'

ROUTES = [
    ('home', '', 'Iffy Studio | AI Agents, Automation and 3D Developer',
     'Iffy Studio is a one person studio building AI agents, n8n automations, SaaS products, 3D visuals and AI video for clients worldwide.', 'Home'),
    ('samples', 'samples', 'Live Samples: Games, 3D and Pixel Art | Iffy Studio',
     'Playable samples built in code: a mini game, game animation, 3D models and asset kit, Minecraft and Roblox style builds, Steam capsules and pixel sprites.', 'Live Samples'),
    ('services', 'services', 'AI, Automation, 3D and Web Services | Iffy Studio',
     'Nine services from one studio: AI agents, workflow automation, AI video, 3D, 2D art, SaaS, games and Shopify or web builds. Remote, worldwide.', 'Services'),
    ('projects', 'projects', 'Projects and Case Studies | Iffy Studio',
     'Sixteen real projects: WhatsApp AI assistants, n8n automations, AI product ads, 3D game characters, stores and more, with the challenge and the result.', 'Projects'),
    ('process', 'process', 'How We Work and FAQ | Iffy Studio',
     'How a project runs with Iffy Studio: discover, plan, build, launch. Plus answers about AI agents, automation, WhatsApp API, pricing and support.', 'Process and FAQ'),
    ('contact', 'contact', 'Contact and Project Planner | Iffy Studio',
     'Plan your project in one minute and send the brief on WhatsApp, or email Iffy Studio. Remote work for clients worldwide.', 'Contact'),
    ('agents', 'agents', 'AI Agent and Chatbot Development | Iffy Studio',
     'Custom AI agents and chatbots that answer customers, qualify leads and complete tasks inside your tools. WhatsApp, LinkedIn and more.', 'AI Agents'),
    ('automation', 'automation', 'n8n Workflow Automation | Iffy Studio',
     'n8n workflows that move data between your tools: ad research bots, CRM sync, client onboarding, lead scrapers and AI content pipelines.', 'Automation'),
    ('video', 'video', 'AI Video and UGC Ads | Iffy Studio',
     'AI product ads, UGC style clips and animated story shorts, edited and ready to post on TikTok, Reels and YouTube.', 'AI Video'),
    ('3d', '3d', '3D Modeling and Product Design | Iffy Studio',
     '3D characters, product renders and enclosure design built in Blender, for games, ads and physical products.', '3D Visuals'),
    ('web', 'web', 'Shopify and Website Development | Iffy Studio',
     'Fast, clean Shopify stores and websites built around one clear action. See Copper State Tackle and BagUps.', 'Websites and Stores'),
]

def url(path):
    return SITE + '/' + (path + '/' if path else '')

def read(p):
    return open(os.path.join(ROOT, p), encoding='utf-8').read()

def write(p, s, mode='w'):
    full = os.path.join(ROOT, p)
    os.makedirs(os.path.dirname(full) or ROOT, exist_ok=True)
    open(full, mode, encoding='utf-8').write(s)

def T(s):
    return html.unescape(re.sub(r'<[^>]+>', '', s)).strip()

def esc(s):
    return html.escape(s, quote=True)

def ld(obj):
    return '<script type="application/ld+json">' + json.dumps(obj, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/') + '</script>'

# ---------- content parsed from the page so schema never drifts from visible text ----------
src = read('index.html')
src = re.sub(r'<!--seo:start-->.*?<!--seo:end-->', '<!--seo:marker-->', src, flags=re.S)

services = []
for m in re.finditer(r'<section class="sv">.*?<h2>(.*?)</h2><p class="lead2">(.*?)</p>', src, re.S):
    services.append((T(m.group(1)), T(m.group(2))))

faqs = [(T(a), T(b)) for a, b in re.findall(r'<details><summary>(.*?)</summary><p>(.*?)</p></details>', src, re.S)]
cases = json.load(open(os.path.join(REPO, 'data/case_studies.json'), encoding='utf-8'))

ORG_ID, PERSON_ID, SITE_ID = SITE + '/#org', SITE + '/#person', SITE + '/#website'
KNOWS = ['AI agents', 'Chatbots', 'n8n workflow automation', 'WhatsApp Business API', 'SaaS development', 'Shopify development',
         'Blender 3D modeling', '3D animation', 'AI video production', 'UGC style product ads', 'Web development']

org = {
    '@type': ['ProfessionalService', 'Organization'], '@id': ORG_ID, 'name': 'Iffy Studio', 'url': SITE + '/',
    'logo': {'@type': 'ImageObject', 'url': SITE + '/assets/logo.png', 'width': 512, 'height': 512},
    'image': SITE + '/assets/og.jpg',
    'description': 'Iffy Studio is a one person studio building AI agents, n8n automations, SaaS products, 3D visuals and AI video for clients worldwide.',
    'email': EMAIL, 'telephone': PHONE, 'founder': {'@id': PERSON_ID},
    'address': {'@type': 'PostalAddress', 'addressCountry': 'NG'},
    'areaServed': 'Worldwide', 'knowsAbout': KNOWS, 'sameAs': [FIVERR, GITHUB],
    'contactPoint': {'@type': 'ContactPoint', 'contactType': 'sales', 'email': EMAIL, 'telephone': PHONE,
                     'url': 'https://wa.me/' + PHONE.lstrip('+'), 'availableLanguage': 'English'},
    'hasOfferCatalog': {'@type': 'OfferCatalog', 'name': 'Iffy Studio services', 'itemListElement': [
        {'@type': 'Offer', 'itemOffered': {'@type': 'Service', 'name': n, 'description': d, 'provider': {'@id': ORG_ID}, 'areaServed': 'Worldwide'}}
        for n, d in services]},
}
person = {
    '@type': 'Person', '@id': PERSON_ID, 'name': 'Samuel Gansallo', 'alternateName': 'Iffy',
    'jobTitle': 'AI agent and automation developer, 3D artist', 'url': SITE + '/', 'image': SITE + '/assets/img/portrait.jpg',
    'worksFor': {'@id': ORG_ID}, 'knowsAbout': KNOWS, 'sameAs': [FIVERR, GITHUB],
}
website = {'@type': 'WebSite', '@id': SITE_ID, 'url': SITE + '/', 'name': 'Iffy Studio', 'inLanguage': 'en',
           'publisher': {'@id': ORG_ID}}


def page_graph(rid, path, title, desc, crumb):
    g = [org, person, website]
    pid = url(path)
    wp = {'@type': 'WebPage', '@id': pid + '#webpage', 'url': pid, 'name': title, 'description': desc, 'inLanguage': 'en',
          'isPartOf': {'@id': SITE_ID}, 'about': {'@id': ORG_ID}, 'primaryImageOfPage': SITE + '/assets/og.jpg',
          'dateModified': TODAY}
    if rid == 'home':
        wp['@type'] = ['WebPage', 'ProfilePage'] if False else 'WebPage'
        wp['mainEntity'] = {'@id': ORG_ID}
    else:
        wp['breadcrumb'] = {'@type': 'BreadcrumbList', 'itemListElement': [
            {'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': SITE + '/'},
            {'@type': 'ListItem', 'position': 2, 'name': crumb, 'item': pid}]}
    g.append(wp)
    if rid == 'projects':
        g.append({'@type': 'ItemList', 'name': 'Iffy Studio projects and case studies', 'numberOfItems': len(cases),
                  'itemListElement': [{'@type': 'ListItem', 'position': i + 1, 'name': c['title'], 'description': c['tagline']}
                                      for i, c in enumerate(cases)]})
    if rid == 'services':
        g.append({'@type': 'ItemList', 'name': 'Iffy Studio services', 'numberOfItems': len(services),
                  'itemListElement': [{'@type': 'ListItem', 'position': i + 1, 'name': n, 'description': d}
                                      for i, (n, d) in enumerate(services)]})
    if rid == 'process':
        g.append({'@type': 'FAQPage', '@id': pid + '#faq', 'mainEntity': [
            {'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': a}} for q, a in faqs]})
    return {'@context': 'https://schema.org', '@graph': g}


titles = {r[0]: r[2] for r in ROUTES}
descs = {r[0]: r[3] for r in ROUTES}
paths = {r[0]: r[1] for r in ROUTES}


def seo_block(r):
    rid, path, title, desc, crumb = r
    u = url(path)
    s = ['<!--seo:start-->',
         '<title>%s</title>' % esc(title),
         '<meta name="description" content="%s">' % esc(desc),
         '<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">',
         '<link rel="canonical" href="%s">' % u,
         '<meta name="author" content="Samuel Gansallo">',
         '<meta property="og:type" content="website">',
         '<meta property="og:site_name" content="Iffy Studio">',
         '<meta property="og:locale" content="en_US">',
         '<meta property="og:url" content="%s">' % u,
         '<meta property="og:title" content="%s">' % esc(title),
         '<meta property="og:description" content="%s">' % esc(desc),
         '<meta property="og:image" content="%s/assets/og.jpg">' % SITE,
         '<meta property="og:image:width" content="1200">',
         '<meta property="og:image:height" content="630">',
         '<meta property="og:image:alt" content="Iffy Studio, AI agents, automation and 3D">',
         '<meta name="twitter:card" content="summary_large_image">',
         '<meta name="twitter:title" content="%s">' % esc(title),
         '<meta name="twitter:description" content="%s">' % esc(desc),
         '<meta name="twitter:image" content="%s/assets/og.jpg">' % SITE,
         '<link rel="sitemap" type="application/xml" href="/sitemap.xml">',
         '<script>window.TITLES=%s;window.DESCS=%s;%s</script>' % (
             json.dumps(titles, ensure_ascii=False), json.dumps(descs, ensure_ascii=False),
             ("window.START='%s';" % rid) if rid != 'home' else ''),
         ld(page_graph(rid, path, title, desc, crumb)),
         '<!--seo:end-->']
    return '\n'.join(s)


def prepare(base):
    """Strip legacy head tags once, make fonts non blocking, leave the seo marker."""
    h = base
    if '<!--seo:marker-->' not in h:
        h = re.sub(r'<title>.*?</title>\s*', '', h, flags=re.S)
        h = re.sub(r'<meta name="description"[^>]*>\s*', '', h)
        h = re.sub(r'<link rel="canonical"[^>]*>\s*', '', h)
        h = re.sub(r'<meta property="og:[^>]*>\s*', '', h)
        h = re.sub(r'<meta name="twitter:[^>]*>\s*', '', h)
        h = re.sub(r'(<meta name="viewport"[^>]*>)', r'\1\n<!--seo:marker-->', h, count=1)
    fonts = re.search(r'<link href="(https://fonts.googleapis.com/css2[^"]*)" rel="stylesheet">', h)
    if fonts:
        u = fonts.group(1)
        h = h.replace(fonts.group(0), '<link rel="preload" as="style" href="%s" onload="this.onload=null;this.rel=\'stylesheet\'"><noscript><link rel="stylesheet" href="%s"></noscript>' % (u, u))
    return h


base = prepare(src)

# ---------- write index.html (home) and route pages ----------
for r in ROUTES:
    rid, path = r[0], r[1]
    page = base.replace('<!--seo:marker-->', seo_block(r))
    if rid != 'home':
        page = page.replace('<head>', '<head>\n<base href="/">', 1)
        page = page.replace('<main id="top" class="pg cur">', '<main id="top" class="pg">')
        a = '<main class="pg" id="p-%s">' % rid
        assert a in page, rid
        page = page.replace(a, '<main class="pg cur" id="p-%s">' % rid)
        write(path + '/index.html', page)
    else:
        write('index.html', page)

# ---------- sitemap, robots ----------
urls = ''.join('<url><loc>%s</loc><lastmod>%s</lastmod><changefreq>%s</changefreq><priority>%s</priority></url>\n' % (
    url(r[1]), TODAY, 'weekly' if r[0] in ('home', 'projects') else 'monthly', '1.0' if r[0] == 'home' else '0.8') for r in ROUTES)
write('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls + '</urlset>\n')

bots = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-User', 'Claude-SearchBot', 'PerplexityBot', 'Perplexity-User',
        'Google-Extended', 'Applebot-Extended', 'Bingbot', 'Googlebot', 'DuckAssistBot', 'CCBot', 'Meta-ExternalAgent', 'Amazonbot']
rb = 'User-agent: *\nAllow: /\nDisallow: /.netlify/\n\n'
for b in bots:
    rb += 'User-agent: %s\nAllow: /\nDisallow: /.netlify/\n\n' % b
rb += 'Sitemap: %s/sitemap.xml\n' % SITE
write('robots.txt', rb)

# ---------- llms.txt and llms-full.txt (GEO) ----------
L = ['# Iffy Studio', '',
     '> Iffy Studio is a one person studio run by Samuel Gansallo. It builds AI agents, n8n automations, SaaS products, 3D visuals and AI video for clients worldwide. Work is remote. Every project starts with a clear scope, timeline and price.', '',
     '## Pages', '']
for r in ROUTES:
    L.append('- [%s](%s): %s' % (r[4], url(r[1]), r[3]))
L += ['', '## Services', '']
for n, d in services:
    L.append('- %s: %s' % (n, d))
L += ['', '## Contact and profiles', '',
      '- Email: %s' % EMAIL, '- WhatsApp: https://wa.me/%s' % PHONE.lstrip('+'), '- Fiverr reviews: %s' % FIVERR, '- GitHub: %s' % GITHUB, '',
      '## More detail', '', '- [Full text of services, projects and FAQ](%s/llms-full.txt)' % SITE, '']
write('llms.txt', '\n'.join(L))

F = ['# Iffy Studio: full reference', '',
     'Iffy Studio is a one person studio run by Samuel Gansallo. It builds AI agents, n8n automations, SaaS products, 3D visuals and AI video for clients worldwide.',
     'Website: %s/  Email: %s  Fiverr: %s' % (SITE, EMAIL, FIVERR), '', '## Services', '']
for n, d in services:
    F += ['### ' + n, d, '']
F += ['## Projects and case studies', '']
for c in cases:
    F += ['### ' + c['title'], 'Category: ' + c['category'], c['tagline'], 'Challenge: ' + c['challenge']]
    if c.get('work'):
        F.append('What was built:')
        F += ['- ' + w for w in c['work']]
    F.append('')
F += ['## Frequently asked questions', '']
for q, a in faqs:
    F += ['### ' + q, a, '']
write('llms-full.txt', '\n'.join(F))

# ---------- 404, CNAME, nojekyll ----------
write('404.html', '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page not found | Iffy Studio</title><meta name="robots" content="noindex"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:%s;color:#fff3e8;font:500 18px/1.5 system-ui,sans-serif;text-align:center;padding:24px}a{color:#ff8a1f}</style></head><body><main><h1>That page does not exist.</h1><p><a href="/">Go to the Iffy Studio home page</a> or <a href="/services/">see the services</a>.</p></main></body></html>' % BG)

# ---------- icons ----------
fav = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="%s"/><circle cx="32" cy="32" r="22" fill="#ff8a1f"/><rect x="28" y="18" width="8" height="28" rx="4" fill="#140803"/></svg>' % BG
try:
    from PIL import Image, ImageDraw
    def icon(size):
        im = Image.new('RGB', (size, size), BG)
        d = ImageDraw.Draw(im)
        c, r = size / 2, size * 0.34
        d.ellipse([c - r, c - r, c + r, c + r], fill='#ff8a1f')
        w = size * 0.125
        d.rounded_rectangle([c - w / 2, size * 0.28, c + w / 2, size * 0.72], radius=w / 2, fill=BG)
        return im
    for name, sz in [('assets/logo.png', 512)]:
        full = os.path.join(ROOT, name)
        os.makedirs(os.path.dirname(full), exist_ok=True)
        icon(sz).save(full)
except ImportError:
    print('Pillow missing: PNG icons skipped (pip install pillow)')
print('OK: %d pages, %d services, %d faqs, %d case studies' % (len(ROUTES), len(services), len(faqs), len(cases)))
