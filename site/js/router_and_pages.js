(function(){
var PG=[
{id:'services',n:'Services',c:[1,.55,.15]},{id:'projects',n:'Projects',c:[1,.5,.1]},{id:'samples',n:'Samples',h:'Live samples.',p:'Small pieces built in code for this site.',c:[1,.5,.1]},{id:'process',n:'Process',c:[1,.7,.2]},{id:'contact',n:'Contact',c:[1,.45,.2]},
{id:'agents',n:'AI Agents',h:'AI agents that do the work.',p:'Assistants that qualify leads, answer customers and complete tasks inside your tools.',c:[1,.48,.1]},
{id:'automation',n:'Automation',h:'Workflows that run themselves.',p:'n8n pipelines that move data between your tools so nobody retypes anything.',c:[1,.7,.2]},
{id:'3d',n:'3D Visuals',h:'3D that sells the product.',p:'Renders, scenes and product spots built in Blender.',c:[1,.3,.05]},
{id:'video',n:'AI Video',h:'AI video that stops the scroll.',p:'Product ads, UGC style clips and animated shorts, edited and ready to post.',c:[1,.6,.35]},
{id:'web',n:'Websites and Stores',h:'Sites and stores that convert.',p:'Fast, clean websites and shops built around one clear action.',c:[1,.42,.3]}];
var still=matchMedia('(prefers-reduced-motion:reduce)').matches,E='cubic-bezier(.7,0,.2,1)',WA='https://wa.me/2348075889359?text=';
var box=document.getElementById('pages'),home=document.getElementById('top'),menu=document.getElementById('menu'),mb=document.getElementById('mb'),cv=document.getElementById('cur'),now='home';
function words(t){return t.split(' ').map(function(w,i){return '<span class="w" aria-hidden="true"><i style="--i:'+i+'">'+w+'</i></span>'}).join(' ')}
var L='<li><a href="#home">Home</a></li>';
PG.forEach(function(d){if(document.getElementById('p-'+d.id)){L+='<li><a href="#'+d.id+'">'+d.n+'</a></li>';return}var m=document.createElement('main');m.className='pg';m.id='p-'+d.id;
m.innerHTML='<div class="hero"><div class="ht"><h1 aria-label="'+d.h+'">'+words(d.h)+'</h1><p class="lead">'+d.p+'</p><div class="row"><a class="btn" href="'+WA+encodeURIComponent('Hi Iffy, I would like to discuss '+d.n+'.')+'" target="_blank" rel="noopener">Discuss this project</a><a class="btn ghost" href="#home">Back home</a></div></div></div>';
box.appendChild(m);L+='<li><a href="#'+d.id+'">'+d.n+'</a></li>'});
menu.firstElementChild.innerHTML=L;
function setMenu(o){if(window.LN){o?LN.stop():LN.start()}document.documentElement.style.overflow=o?'hidden':'';menu.classList.toggle('open',o);mb.textContent=o?'Close':'Menu';mb.setAttribute('aria-expanded',o)}
mb.addEventListener('click',function(){setMenu(!menu.classList.contains('open'))});
document.getElementById('ex').addEventListener('click',function(){setMenu(true)});
addEventListener('keydown',function(e){if(e.key==='Escape')setMenu(false)});
function raf2(f){requestAnimationFrame(function(){requestAnimationFrame(f)})}
function on(el){if(document.body.classList.contains('ready'))raf2(function(){el.classList.add('on');window.RV&&RV(el)});else new MutationObserver(function(m,o){if(document.body.classList.contains('ready')){o.disconnect();el.classList.add('on');window.RV&&RV(el)}}).observe(document.body,{attributes:true})}
function swap(id){var d=PG.filter(function(x){return x.id===id})[0],el=d?document.getElementById('p-'+id):home;if(!d)id='home';now=id;
document.querySelectorAll('.pg').forEach(function(x){x.classList.remove('cur','on')});el.classList.add('cur');function top2(){scrollTo(0,0);if(window.LN)LN.scrollTo(0,{immediate:true,force:true})}top2();setTimeout(top2,50);setTimeout(function(){top2();window.ScrollTrigger&&ScrollTrigger.refresh();top2()},120);setTimeout(top2,450);
if(window.IFFY){IFFY.home=!d;IFFY.off=['agents','automation','video','3d','web','projects','samples'].indexOf(id)>-1;var c=d?d.c:[1,.5,.1];IFFY.U.uC.value.setRGB(c[0],c[1],c[2])}
document.title=(d?d.n+' | ':'')+'Iffy Studio | AI Agents, Automation and 3D';on(el);window.AFTER&&AFTER(id);window.RESETH&&RESETH(id)}
function go(){var id=location.hash.slice(1)||'home';if(id===now)return;setMenu(false);
if(still){swap(id);return}
var a=cv.animate([{transform:'translateY(100%)'},{transform:'translateY(0)'}],{duration:550,easing:E,fill:'forwards'});
a.onfinish=function(){swap(id);var b=cv.animate([{transform:'translateY(0)'},{transform:'translateY(-100%)'}],{duration:550,easing:E,fill:'forwards'});b.onfinish=function(){a.cancel();b.cancel()}}}
addEventListener('hashchange',go);
function up(){if(window.LN&&!still)LN.scrollTo(0);else scrollTo(0,0)}
addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href^="#"]');if(!a||e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;if(a.getAttribute('href').slice(1)!==now)return;e.preventDefault();setMenu(false);up()});
var first=location.hash.slice(1)||'home';if(first!=='home')swap(first);else on(home);
})();
