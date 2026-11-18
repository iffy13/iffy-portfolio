(function(){
var calm=matchMedia('(prefers-reduced-motion:reduce)').matches,sp=document.getElementById('sp'),cr=document.getElementById('cr');
var segs=[].slice.call(sp.querySelectorAll('b')),CL=['Spark','Journey','Proof','Launch'],cur0=-1,lab=document.getElementById('cl');
function setLab(i){if(i===cur0||!lab)return;cur0=i;var tx=i<0?'':'0'+(i+1)+' '+CL[i];if(!window.gsap){lab.textContent=tx;return}gsap.timeline().to(lab,{yPercent:-120,opacity:0,duration:.22}).add(function(){lab.textContent=tx}).set(lab,{yPercent:120}).to(lab,{yPercent:0,opacity:i<0?0:1,duration:.3})}
function ab(el){var r=el.getBoundingClientRect();return [r.top+scrollY,r.bottom+scrollY]}
function upd(){var top=document.getElementById('top'),home=top.classList.contains('cur'),d=document.documentElement.scrollHeight-innerHeight,p=d>0?scrollY/d:0;
if(!home){segs.forEach(function(b,i){b.style.transform='scaleX('+Math.min(1,Math.max(0,p*4-i))+')'});setLab(-1);return}
var j=document.getElementById('jny'),jp=j.parentElement.classList.contains('pin-spacer')?j.parentElement:j,jj=ab(jp),pp=ab(document.getElementById('proof')),rr2=ab(document.getElementById('reel')),ll=ab(document.getElementById('launch')),B=[[0,jj[0]],[jj[0],jj[1]],[pp[0],rr2[1]],[ll[0],ll[1]]],a=0;
B.forEach(function(r,i){var f=(scrollY+innerHeight*.4-r[0])/Math.max(1,r[1]-r[0]);segs[i].style.transform='scaleX('+Math.min(1,Math.max(0,f))+')';if(scrollY+innerHeight*.45>=r[0])a=i});setLab(a)}
addEventListener('scroll',upd,{passive:true});addEventListener('hashchange',function(){setTimeout(upd,900)});setTimeout(upd,300);
try{history.scrollRestoration='manual'}catch(e){}
document.querySelectorAll('.pg:not(#top)').forEach(function(m){var a=document.createElement('a');a.className='back';a.href='#home';a.textContent='Back to home';m.insertBefore(a,m.firstChild)});
if(!window.gsap||!window.Lenis||!window.ScrollTrigger){cr.style.display='none';return}
gsap.registerPlugin(ScrollTrigger);ScrollTrigger.config({ignoreMobileResize:true});
if(!calm){var L=new Lenis({lerp:.09});window.LN=L;L.on('scroll',ScrollTrigger.update);gsap.ticker.add(function(t){L.raf(t*1000)});gsap.ticker.lagSmoothing(0)}
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){ScrollTrigger.refresh()});
var COL=[[1,.48,.1],[1,.7,.2],[1,.6,.35],[1,.3,.05],[1,.42,.3]];
window.J={x:1,y:0,s:1.45,r:1,g:.48,b:.1};
window.RESETH=function(id){if(id!=='home')return;if(window.K){K.z=9;K.fov=50;K.po=1;K.vis=1}J.x=1;J.y=0;J.s=1.45;if(!calm)document.querySelectorAll('.stn').forEach(function(e){e.style.visibility='hidden';e.style.opacity=0});var f=document.getElementById('fl');if(f)f.style.opacity=0;setTimeout(function(){ScrollTrigger.refresh()},200)};
window.AFTER=function(){var t=window.PTARGET;if(!t)return;window.PTARGET=null;setTimeout(function(){var e=document.getElementById(t);if(!e)return;if(window.LN)LN.scrollTo(e,{offset:-90});else e.scrollIntoView()},1000)};
var cur=0,JI=0,ctx;
function lt(){return document.body.classList.contains('lm')}
function act(i){cur=i;var fc=document.getElementById('fc');if(fc)fc.textContent='0'+(i+1);document.querySelectorAll('#forge .fs li').forEach(function(x,k){x.classList.toggle('on',k===i)});document.querySelectorAll('#forge .fp img').forEach(function(x,k){x.classList.toggle('on',k===i)});gsap.to(J,{r:COL[i][0],g:COL[i][1],b:COL[i][2],duration:.7,overwrite:'auto'})}
function once(){
document.querySelectorAll('#forge .fs li').forEach(function(x,i){x.addEventListener('mouseenter',function(){act(i)})});
document.querySelectorAll('[data-t]').forEach(function(a){a.addEventListener('click',function(){window.PTARGET=a.dataset.t})});
document.querySelector('#top .hero').addEventListener('click',function(e){if(e.target.closest('a,button'))return;gsap.fromTo(IFFY.U.uA,{value:.95},{value:.3,duration:1.6,ease:'elastic.out(1,.35)'})});
var cl=gsap.utils.toArray('#chs li');
function chap(){if(!document.getElementById('top').classList.contains('cur'))return;var a=0;[document.querySelector('#top .hero'),document.getElementById('jny'),document.getElementById('proof'),document.getElementById('launch')].forEach(function(s,i){if(s.getBoundingClientRect().top<=innerHeight*.55)a=i});cl.forEach(function(x,k){x.classList.toggle('on',k===a)})}
addEventListener('scroll',chap,{passive:true});chap();act(0)}
function bn(){gsap.to('.bigname',{xPercent:-10,ease:'none',scrollTrigger:{trigger:'#top .hero',start:'top top',end:'bottom top',scrub:true}})}
function jt(){var wide=innerWidth>820,sn=gsap.utils.toArray('#jny .stn'),Z=function(i){return -32-i*18},K=window.K={z:9,fov:50,po:1,vis:1};
var tl=gsap.timeline({defaults:{ease:'none'},scrollTrigger:{trigger:'#jny',start:'top top',end:function(){return '+='+innerHeight*(wide?13:9.1)},pin:true,scrub:.4,invalidateOnRefresh:true}});window.JPS=function(){return tl.scrollTrigger.start};
tl.to(J,{x:0,y:0,s:7,duration:1.2,ease:'power2.in'},0).to(K,{po:0,duration:.8},.3).to('#fl',{opacity:1,duration:.5},.8).to(K,{z:Z(0),duration:.8,ease:'power1.inOut'},1).to(J,{s:.01,duration:.01},1.8).to('#fl',{opacity:0,duration:.5},1.8);
if(!wide){

sn.forEach(function(el,i){var s=2.2+i*1.5;tl.fromTo(el,{autoAlpha:0,y:50},{autoAlpha:1,y:0,duration:.3,ease:'power2.out'},s);
if(i<4)tl.to(el,{autoAlpha:0,y:-50,duration:.3,ease:'power2.in'},s+.8).to(K,{z:Z(i+1),duration:.55,ease:'power1.inOut'},s+.8).to(K,{fov:78,duration:.28,ease:'power2.out'},s+.8).to(K,{fov:50,duration:.28,ease:'power2.in'},s+1.08)});
tl.to({},{duration:.45},8.5);gsap.to(K,{vis:0,ease:'none',scrollTrigger:{trigger:'#proof',start:'top 98%',end:'top 55%',scrub:true}});return}
sn.forEach(function(el,i){var s=2.3+i*1.8;tl.fromTo(el,{autoAlpha:0,y:50},{autoAlpha:1,y:0,duration:.3,ease:'power2.out'},s).to(el,{autoAlpha:0,y:-50,duration:.3,ease:'power2.in'},s+1);
if(i<4){tl.to(K,{z:Z(i+1),duration:.6,ease:'power1.inOut'},s+1).to(K,{fov:80,duration:.3,ease:'power2.out'},s+1).to(K,{fov:50,duration:.3,ease:'power2.in'},s+1.3)}else tl.to(K,{z:Z(4)-34,duration:.6,ease:'power1.in'},s+1)});
tl.to(K,{vis:0,duration:.4},10.7);tl.to({},{duration:.2},9.8)}
function darkJ(){bn();jt();
gsap.from('#proof .prow',{y:50,opacity:0,stagger:.15,ease:'none',scrollTrigger:{trigger:'#proof',start:'top 75%',end:'top 25%',scrub:true}});
if(innerWidth>820)gsap.utils.toArray('#reel .ph').forEach(function(p,i){gsap.fromTo(p,{y:i%2?-40:40},{y:i%2?40:-40,ease:'none',scrollTrigger:{trigger:'#reel',start:'top bottom',end:'bottom top',scrub:true}})});
gsap.utils.toArray('#reel .wd').forEach(function(w){gsap.from(w,{scale:.9,opacity:0,ease:'none',scrollTrigger:{trigger:w,start:'top 95%',end:'top 60%',scrub:true}})});
gsap.from('#launch .cta2 > *',{y:40,opacity:0,stagger:.12,ease:'none',scrollTrigger:{trigger:'#launch',start:'top 60%',end:'top 20%',scrub:true}})}
function lightJ(){bn();jt();
gsap.utils.toArray('#proof .prow').forEach(function(r){gsap.from(r,{clipPath:'inset(0 100% 0 0)',ease:'none',scrollTrigger:{trigger:r,start:'top 88%',end:'top 58%',scrub:true}})});
gsap.utils.toArray('#reel .ph').forEach(function(p,i){gsap.fromTo(p,{rotationY:i%2?-38:38,y:60,opacity:0,transformPerspective:900},{rotationY:0,y:0,opacity:1,ease:'none',scrollTrigger:{trigger:p,start:'top 95%',end:'top 55%',scrub:true}})});
gsap.utils.toArray('#reel .wd').forEach(function(w){gsap.from(w,{clipPath:'inset(0 0 100% 0)',ease:'none',scrollTrigger:{trigger:w,start:'top 95%',end:'top 55%',scrub:true}})});
gsap.from('#launch .cta2>*',{x:-70,opacity:0,stagger:.1,ease:'none',scrollTrigger:{trigger:'#launch',start:'top 65%',end:'top 25%',scrub:true}})}
window.JM=function(){if(!JI||calm)return;ctx&&ctx.revert();ctx=gsap.context(lt()?lightJ:darkJ)};
function rot(){if(rot.d||calm)return;rot.d=1;var rw=document.querySelector('.rw');if(!rw)return;var WS=['AI agents','automation','3D worlds','AI video','SaaS apps','games','online stores','receptionists'],ix=0;
gsap.set(rw,{yPercent:115});gsap.to(rw,{yPercent:0,duration:.9,ease:'power3.out',delay:.9});
setInterval(function(){if(document.hidden||scrollY>innerHeight)return;ix=(ix+1)%WS.length;gsap.timeline().to(rw,{yPercent:-115,duration:.45,ease:'power2.in'}).add(function(){rw.textContent=WS[ix]}).set(rw,{yPercent:115}).to(rw,{yPercent:0,duration:.6,ease:'power3.out'})},2800)}
window.RV=function(el){if(el.dataset.rv)return;el.dataset.rv=1;
if(el.id==='top'){if(!JI){JI=1;once()}JM();rot()}if(calm)return;
el.querySelectorAll('section:not(.ch)').forEach(function(x){gsap.set(x,{opacity:0,y:48});ScrollTrigger.create({trigger:x,start:'top 92%',once:true,onEnter:function(){gsap.to(x,{opacity:1,y:0,duration:.9,ease:'power3.out',clearProps:'transform,opacity'})}})});
el.querySelectorAll('h2').forEach(function(h){gsap.from(h,{scrollTrigger:{trigger:h,start:'top 92%',once:true},opacity:0,y:28,filter:'blur(10px)',duration:1,ease:'power3.out',clearProps:'filter,transform,opacity'})})};
if(matchMedia('(pointer:fine)').matches&&!calm){var x=0,y=0,tx=0,ty=0,s=1,ts=1;
addEventListener('pointermove',function(e){tx=e.clientX;ty=e.clientY;cr.style.opacity=.9});
document.addEventListener('pointerover',function(e){ts=e.target.closest&&e.target.closest('a,button,#rg,summary')?2.2:1});
gsap.ticker.add(function(){var dx=tx-x,dy=ty-y;x+=dx*.18;y+=dy*.18;s+=(ts-s)*.15;var v=Math.min(Math.hypot(dx,dy)/40,.6);cr.style.transform='translate('+(x-18)+'px,'+(y-18)+'px) rotate('+Math.atan2(dy,dx)*57.3+'deg) scale('+s*(1+v)+','+s*(1-v*.5)+')'});
document.querySelectorAll('.btn').forEach(function(b){b.addEventListener('pointermove',function(e){var r=b.getBoundingClientRect();gsap.to(b,{x:(e.clientX-r.left-r.width/2)*.25,y:(e.clientY-r.top-r.height/2)*.35,duration:.3})});b.addEventListener('pointerleave',function(){gsap.to(b,{x:0,y:0,duration:.7,ease:'elastic.out(1,.4)'})})})}
else cr.style.display='none';
var hm=document.getElementById('top');function kick(){if(document.body.classList.contains('ready')&&hm.classList.contains('cur'))RV(hm)}
new MutationObserver(kick).observe(document.body,{attributes:true});kick();setTimeout(kick,3000);setTimeout(kick,6000);
})();
