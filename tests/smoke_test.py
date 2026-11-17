"""Smoke test. Serves the site/ folder locally and checks pages, overflow, errors and links.
Run from the project root:  python3 tests/smoke_test.py
Requires: pip install playwright && playwright install chromium
"""
import http.server,socketserver,threading,os,sys,functools
from playwright.sync_api import sync_playwright
ROOT=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),'site')
class Q(http.server.SimpleHTTPRequestHandler):
    def __init__(self,*a,**k):super().__init__(*a,directory=ROOT,**k)
    def log_message(self,*a):pass
srv=socketserver.TCPServer(('127.0.0.1',0),Q);port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
URL='http://127.0.0.1:%d/index.html'%port
ROUTES=['home','services','projects','process','contact','agents','automation','video','3d','web']
bad=0
def check(c,msg):
    global bad
    if not c: bad+=1
    print(('PASS ' if c else 'FAIL ')+msg)
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader','--no-sandbox'])
    for name,vw,vh,touch in [('desktop',1440,900,False),('phone',390,800,True)]:
        for scheme in ['dark','light']:
            c=b.new_context(viewport={'width':vw,'height':vh},color_scheme=scheme,has_touch=touch,is_mobile=touch);pg=c.new_page();errs=[];missing=[]
            pg.on('pageerror',lambda e:errs.append(str(e)[:160]))
            pg.on('response',lambda r:missing.append(r.url) if r.status>=400 and '127.0.0.1' in r.url else None)
            pg.route('**/*',lambda r:r.continue_() if '127.0.0.1' in r.request.url else r.abort())
            pg.goto(URL);pg.wait_for_timeout(9500)
            tag='%s %s'%(name,scheme)
            check(not errs,tag+' no script errors '+str(errs[:2]))
            check(not missing,tag+' no missing files '+str(missing[:2]))
            ov=[]
            for r in ROUTES:
                pg.evaluate("location.hash='%s'"%r);pg.wait_for_timeout(1300)
                if pg.evaluate("document.documentElement.scrollWidth>innerWidth+1"):ov.append(r)
                if pg.evaluate("scrollY")!=0:ov.append(r+'(not at top)')
            check(not ov,tag+' no horizontal overflow and pages start at top '+str(ov))
            c.close()
    b.close()
print('\nFAILED' if bad else '\nALL PASSED');sys.exit(1 if bad else 0)
