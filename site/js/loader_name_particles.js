(function(){
var ld=document.getElementById('ld'),cv=document.getElementById('lcv');if(!cv)return;
var g=cv.getContext('2d'),dpr=Math.min(devicePixelRatio,2),W=0,H=0,P=[],T=[],live=true,formed=false;
function size(){W=cv.width=innerWidth*dpr;H=cv.height=innerHeight*dpr}
function mk(n){for(var i=0;i<n;i++)P.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.5*dpr,vy:(Math.random()-.5)*.5*dpr,s:(Math.random()*1.4+.8)*dpr,c:Math.random()<.5?'#ff7a1a':'#ffb13b'})}
size();mk(700);
function targets(){var c=document.createElement('canvas');c.width=W;c.height=H;var x=c.getContext('2d'),two=W<H*.9,fs=two?W/5.4:Math.min(W/10.6,H*.2);
x.font='700 '+fs+'px Unbounded,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillStyle='#fff';
if(two){x.fillText('IFFY',W/2,H/2-fs*.6);x.fillText('STUDIO',W/2,H/2+fs*.6)}else x.fillText('IFFY STUDIO',W/2,H/2);
var d=x.getImageData(0,0,W,H).data,st=Math.max(3,Math.round(fs/18)),pts=[];
for(var y=0;y<H;y+=st)for(var xx=0;xx<W;xx+=st)if(d[(y*W+xx)*4+3]>128)pts.push([xx,y]);pts.st=st;return pts}
function frame(){if(!live)return;requestAnimationFrame(frame);g.clearRect(0,0,W,H);
for(var i=0;i<P.length;i++){var p=P[i];if(!formed){p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>W)p.vx*=-1;if(p.y<0||p.y>H)p.vy*=-1}g.globalAlpha=formed?1:.45;g.fillStyle=p.c;g.fillRect(p.x,p.y,p.s,p.s)}}
frame();
window.FORM=function(cb){
if(!window.gsap){live=false;cb();return}
function run(){try{size();if(!W||!H)throw 0;T=targets();if(!T.length)throw 0;var st=T.st;if(P.length<T.length)mk(T.length-P.length);P.length=T.length;
ld.classList.add('forming');formed=true;
gsap.to(P,{x:function(i){return T[i][0]},y:function(i){return T[i][1]},s:st*.8,duration:1.3,ease:'expo.inOut',stagger:{amount:.6,from:'random'},onComplete:function(){ld.classList.add('formed');setTimeout(function(){cb();setTimeout(function(){live=false},1200)},900)}})}catch(e){live=false;cb()}}
(document.fonts&&document.fonts.load?document.fonts.load('700 100px Unbounded'):Promise.resolve()).then(run,run)};
})();
