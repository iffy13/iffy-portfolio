/* Smooth scrolling, the page progress bar, the custom cursor ring and the reveal hooks used by the inner pages.
   The home page (#top) has its own motion in home.js, so the old pinned 3D journey that used to live here is gone. */
(function(){
var calm=matchMedia('(prefers-reduced-motion:reduce)').matches,sp=document.getElementById('sp'),cr=document.getElementById('cr');
var segs=[].slice.call(sp.querySelectorAll('b'));
function upd(){var top=document.getElementById('top');if(top&&top.classList.contains('cur'))return;
var d=document.documentElement.scrollHeight-innerHeight,p=d>0?scrollY/d:0;
segs.forEach(function(b,i){b.style.transform='scaleX('+Math.min(1,Math.max(0,p*4-i))+')'})}
addEventListener('scroll',upd,{passive:true});addEventListener('hashchange',function(){setTimeout(upd,900)});setTimeout(upd,300);
try{history.scrollRestoration='manual'}catch(e){}
document.querySelectorAll('.pg:not(#top)').forEach(function(m){var a=document.createElement('a');a.className='back';a.href='#home';a.textContent='Back to home';m.insertBefore(a,m.firstChild)});
if(!window.gsap||!window.Lenis||!window.ScrollTrigger){cr.style.display='none';return}
gsap.registerPlugin(ScrollTrigger);ScrollTrigger.config({ignoreMobileResize:true});
if(!calm){var L=new Lenis({lerp:.09});window.LN=L;L.on('scroll',ScrollTrigger.update);gsap.ticker.add(function(t){L.raf(t*1000)});gsap.ticker.lagSmoothing(0)}
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){ScrollTrigger.refresh()});
/* values the background scene reads; the journey that animated them is gone, so they stay at rest */
window.J={x:1,y:0,s:1.45,r:1,g:.48,b:.1};
window.RESETH=function(id){if(id!=='home')return;setTimeout(function(){ScrollTrigger.refresh()},200)};
/* after a page swap, scroll to a target element (set by links with data-t) */
window.AFTER=function(){var t=window.PTARGET;if(!t)return;window.PTARGET=null;setTimeout(function(){var e=document.getElementById(t);if(!e)return;if(window.LN)LN.scrollTo(e,{offset:-90});else e.scrollIntoView()},1000)};
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('[data-t]');if(a)window.PTARGET=a.dataset.t});
/* reveal hook the router calls when a page opens; the home page runs its own motion */
window.RV=function(el){if(el.id==='top'||el.dataset.rv)return;el.dataset.rv=1;if(calm)return;
el.querySelectorAll('section:not(.ch)').forEach(function(x){gsap.set(x,{opacity:0,y:48});ScrollTrigger.create({trigger:x,start:'top 92%',once:true,onEnter:function(){gsap.to(x,{opacity:1,y:0,duration:.9,ease:'power3.out',clearProps:'transform,opacity'})}})});
el.querySelectorAll('h2').forEach(function(h){gsap.from(h,{scrollTrigger:{trigger:h,start:'top 92%',once:true},opacity:0,y:28,filter:'blur(10px)',duration:1,ease:'power3.out',clearProps:'filter,transform,opacity'})})};
/* custom cursor ring and magnetic buttons (inner pages only; the home page hides the ring and does its own) */
if(matchMedia('(pointer:fine)').matches&&!calm){var x=0,y=0,tx=0,ty=0,s=1,ts=1;
addEventListener('pointermove',function(e){tx=e.clientX;ty=e.clientY;cr.style.opacity=.9});
document.addEventListener('pointerover',function(e){ts=e.target.closest&&e.target.closest('a,button,#rg,summary')?2.2:1});
gsap.ticker.add(function(){var dx=tx-x,dy=ty-y;x+=dx*.18;y+=dy*.18;s+=(ts-s)*.15;var v=Math.min(Math.hypot(dx,dy)/40,.6);cr.style.transform='translate('+(x-18)+'px,'+(y-18)+'px) rotate('+Math.atan2(dy,dx)*57.3+'deg) scale('+s*(1+v)+','+s*(1-v*.5)+')'});
document.querySelectorAll('.pg:not(#top) .btn,header .btn').forEach(function(b){b.addEventListener('pointermove',function(e){var r=b.getBoundingClientRect();gsap.to(b,{x:(e.clientX-r.left-r.width/2)*.25,y:(e.clientY-r.top-r.height/2)*.35,duration:.3})});b.addEventListener('pointerleave',function(){gsap.to(b,{x:0,y:0,duration:.7,ease:'elastic.out(1,.4)'})})})}
else cr.style.display='none';
/* the router waits for the loader before it calls RV, so nudge it once the page is ready */
var hm=document.getElementById('top');function kick(){if(document.body.classList.contains('ready')&&hm.classList.contains('cur'))RV(hm)}
new MutationObserver(kick).observe(document.body,{attributes:true});kick();setTimeout(kick,3000);setTimeout(kick,6000);
})();
