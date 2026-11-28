"""SEO test. Run: python3 tests/seo_test.py  (needs playwright + chromium)
Checks every real route URL: status, title, canonical, valid JSON-LD, visible page, console errors,
sitemap coverage, robots, llms files, and that nav clicks switch pages without a reload."""
import http.server,socketserver,threading,os,sys,json,re,urllib.request
from playwright.sync_api import sync_playwright
ROOT=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),'site')
class Q(http.server.SimpleHTTPRequestHandler):
    def __init__(self,*a,**k):super().__init__(*a,directory=ROOT,**k)
    def log_message(self,*a):pass
srv=socketserver.TCPServer(('127.0.0.1',0),Q);port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
B='http://127.0.0.1:%d'%port
R=['','services','projects','samples','process','contact','agents','automation','video','3d','web']
bad=0
def check(c,m):
    global bad
    if not c:bad+=1
    print(('PASS ' if c else 'FAIL ')+m)
for f in ['robots.txt','sitemap.xml','llms.txt','llms-full.txt','404.html','favicon.svg','apple-touch-icon.png','assets/logo.png','assets/og.jpg','google1d5dde242af09b7c.html']:
    check(os.path.exists(os.path.join(ROOT,f)),'file '+f)
sm=open(os.path.join(ROOT,'sitemap.xml')).read()
check(all(('https://iffystudio.site/%s'%(r+'/' if r else '')) in sm for r in R),'sitemap lists all routes')
check('Sitemap:' in open(os.path.join(ROOT,'robots.txt')).read(),'robots has sitemap')
titles=set()
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader','--no-sandbox'])
    for r in R:
        c=b.new_context(viewport={'width':1280,'height':800});pg=c.new_page();errs=[];miss=[]
        pg.on('pageerror',lambda e:errs.append(str(e)[:120]))
        pg.on('response',lambda x:miss.append(x.url) if x.status>=400 and '127.0.0.1' in x.url else None)
        pg.route('**/*',lambda q:q.continue_() if '127.0.0.1' in q.request.url else q.abort())
        resp=pg.goto(B+'/'+(r+'/' if r else ''));pg.wait_for_timeout(5500)
        tag='/%s'%r
        check(resp.status==200,tag+' status 200')
        t=pg.title();titles.add(t)
        check(0<len(t)<=65,tag+' title length %d: %s'%(len(t),t))
        d=pg.evaluate("document.querySelector('meta[name=description]').content")
        check(70<len(d)<=165,tag+' description length %d'%len(d))
        can=pg.evaluate("document.querySelector('link[rel=canonical]').href")
        check(can=='https://iffystudio.site/'+(r+'/' if r else ''),tag+' canonical '+can)
        ldj=pg.evaluate("[...document.querySelectorAll('script[type=\"application/ld+json\"]')].map(s=>s.textContent)")
        ok=True
        try:
            g=json.loads(ldj[0])['@graph'];types=[x.get('@type') for x in g]
        except Exception as e:ok=False;types=[]
        check(ok and len(ldj)==1,tag+' JSON-LD parses '+str([t if isinstance(t,str) else t[0] for t in types]))
        if r=='process':check('FAQPage' in types,tag+' has FAQPage')
        vis=pg.evaluate("[...document.querySelectorAll('main.pg')].filter(m=>getComputedStyle(m).display!=='none').map(m=>m.id)")
        exp='top' if r=='' else 'p-'+r
        check(vis==[exp],tag+' visible page %s'%vis)
        h1=pg.evaluate("[...document.querySelectorAll('main.pg')].filter(m=>getComputedStyle(m).display!=='none').flatMap(m=>[...m.querySelectorAll('h1')]).length")
        check(h1==1,tag+' exactly one visible h1')
        check(not errs,tag+' no script errors '+str(errs[:1]))
        check(not miss,tag+' no missing files '+str(miss[:2]))
        dt=pg.title()
        check(dt==t,tag+' title stable after router')
        c.close()
    check(len(titles)==len(R),'all titles unique')
    c=b.new_context(viewport={'width':1280,'height':800});pg=c.new_page()
    pg.route('**/*',lambda q:q.continue_() if '127.0.0.1' in q.request.url else q.abort())
    pg.goto(B+'/');pg.wait_for_timeout(9000)
    pg.evaluate("window.__nr=1")
    pg.click('header nav a[href="/services/"]');pg.wait_for_timeout(2500)
    check(pg.evaluate("window.__nr")==1,'nav click does not reload page')
    check('Services' in pg.title(),'nav click updates title: '+pg.title())
    check(pg.evaluate("document.querySelector('link[rel=canonical]').href")=='https://iffystudio.site/services/','nav click updates canonical')
    check(pg.evaluate("getComputedStyle(document.getElementById('p-services')).display")!='none','services page shown after click')
    b.close()
print('\nFAILED' if bad else '\nALL PASSED');sys.exit(1 if bad else 0)
