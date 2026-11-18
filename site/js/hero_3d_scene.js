(function(){
var IMG="assets/img/portrait.jpg",cv=document.getElementById('gl'),still=matchMedia('(prefers-reduced-motion:reduce)').matches,lost=false;
var h=document.querySelector('h1');h.setAttribute('aria-label','I build AI agents, automation, 3D, AI video and more.');
h.innerHTML='<span class="w" aria-hidden="true"><i style="--i:0">I</i></span> <span class="w" aria-hidden="true"><i style="--i:1">build</i></span><br><span class="rwrap" aria-hidden="true"><span class="rw">AI agents</span></span>.';
var ld=document.getElementById('ld'),ln=document.getElementById('ln'),lb=document.getElementById('lb'),t0=performance.now(),loaded=document.readyState==='complete',fin=false,shown=false;
function show(){if(shown)return;shown=true;ld.classList.add('done');document.body.classList.add('ready');setTimeout(function(){ld.style.display='none'},1000)}
function go2(){if(go2.d)return;go2.d=1;try{window.FORM?FORM(show):show()}catch(e){show()}}addEventListener('load',function(){loaded=true;if(fin)go2()});
function tick(){var p=Math.min(1,(performance.now()-t0)/1900);ln.textContent=Math.round(p*100);lb.style.width=p*100+'%';if(p<1)requestAnimationFrame(tick);else{fin=true;if(loaded)go2()}}
if(still)show();else{tick();setTimeout(go2,5000);setTimeout(show,10000)}

try{
var r=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true});cv.addEventListener('webglcontextlost',function(e){e.preventDefault();lost=true});cv.addEventListener('webglcontextrestored',function(){var old=env;env=pm0.fromScene(es,.04).texture;sc.traverse(function(o){var m=o.material;if(m&&m.envMap===old){m.envMap=env;m.needsUpdate=true}});if(cast)cast.restore(pm0);lost=false});
r.setPixelRatio(Math.min(devicePixelRatio,1.5));r.outputEncoding=THREE.sRGBEncoding;
var sc=new THREE.Scene(),cam=new THREE.PerspectiveCamera(50,1,.1,260);cam.position.z=9;
var U={uT:{value:0},uA:{value:.3},uC:{value:new THREE.Color(1,.5,.1)},uL:{value:0}};
var VS='uniform float uT,uA;varying float vN;varying vec3 vNo;float h(vec3 p){return sin(p.x*2.1+uT)*sin(p.y*2.3+uT*1.2)*sin(p.z*2.0+uT*.8);}void main(){vec3 p=position;float d=h(p)*uA*2.;p+=normal*d;vN=d;vNo=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}';
var FS='uniform vec3 uC;uniform float uL;varying float vN;varying vec3 vNo;void main(){float f=pow(1.-abs(vNo.z),2.);vec3 c=mix(uC*.5,uC*1.1,clamp(f+vN,0.,1.));gl_FragColor=vec4(mix(c,c*(.6+.4*vNo.y+.2*vNo.x),uL),mix(.28+f*.7,1.,uL));}';
var orb=new THREE.Group();sc.add(orb);
orb.add(new THREE.Mesh(new THREE.IcosahedronGeometry(2.4,20),new THREE.ShaderMaterial({uniforms:U,vertexShader:VS,fragmentShader:FS,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false})));
var wire=new THREE.Mesh(new THREE.IcosahedronGeometry(3,2),new THREE.MeshBasicMaterial({color:0xffb13b,wireframe:true,transparent:true,opacity:.08}));wire.visible=false;orb.add(wire);
var pm0=new THREE.PMREMGenerator(r),es=new THREE.Scene();es.background=new THREE.Color(0x20100a);
[[0xfff1dd,6,[0,6,0]],[0xff7a1a,4,[6,1,2]],[0xffffff,3,[-6,2,-3]],[0xffb13b,3,[0,-3,6]]].forEach(function(l){var e=new THREE.Mesh(new THREE.BoxGeometry(l[1],l[1]*.25,l[1]),new THREE.MeshBasicMaterial({color:l[0]}));e.position.set(l[2][0],l[2][1],l[2][2]);es.add(e)});
var env=pm0.fromScene(es,.04).texture,GQ=[new THREE.TorusKnotGeometry(.2,.07,100,14),new THREE.IcosahedronGeometry(.3,2),new THREE.TorusGeometry(.26,.09,20,48)],sats=[];
for(var i=0;i<3;i++){var m=new THREE.Mesh(GQ[i],new THREE.MeshStandardMaterial({color:i==1?0xffffff:0xff7a1a,metalness:1,roughness:.16+i*.08,envMap:env}));m.userData={r:3.7+i*.6,s:.35+i*.12,p:i*2.1};orb.add(m);sats.push(m)}
var n=450,pos=new Float32Array(n*3);
for(i=0;i<n;i++){var th=Math.random()*6.283,ph=Math.acos(2*Math.random()-1),rd=3.4+Math.random()*2.6;pos[i*3]=rd*Math.sin(ph)*Math.cos(th);pos[i*3+1]=rd*Math.sin(ph)*Math.sin(th);pos[i*3+2]=rd*Math.cos(ph)}
var pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pos,3));
var pts=new THREE.Points(pg,new THREE.PointsMaterial({color:0xffb13b,size:.05,transparent:true,opacity:.9}));orb.add(pts);
var N2=1100,sp=new Float32Array(N2*3);for(var j=0;j<N2;j++){sp[j*3]=(Math.random()-.5)*30;sp[j*3+1]=(Math.random()-.5)*18;sp[j*3+2]=12-Math.random()*190}
var sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.BufferAttribute(sp,3));sc.add(new THREE.Points(sg,new THREE.PointsMaterial({color:0xffb13b,size:.035,transparent:true,opacity:.45})));
var GS=[new THREE.TorusGeometry(1,.3,12,40),new THREE.IcosahedronGeometry(1,0),new THREE.OctahedronGeometry(1.1),new THREE.TorusKnotGeometry(.8,.25,64,8)],tr=[];
for(j=0;j<0;j++){var mm=new THREE.Mesh(GS[j%4],new THREE.MeshBasicMaterial({color:j%2?0xff7a1a:0xffb13b,wireframe:true,transparent:true,opacity:.5}));mm.position.set((j%2?1:-1)*(4+Math.random()*4),(Math.random()-.5)*8,-6-j*6);sc.add(mm);tr.push(mm)}
var a=document.createElement('canvas');a.width=a.height=256;var c=a.getContext('2d');
c.fillStyle='#000';c.fillRect(0,0,256,256);var gd=c.createRadialGradient(128,128,72,128,128,127);gd.addColorStop(0,'#fff');gd.addColorStop(.66,'#fff');gd.addColorStop(1,'#000');c.fillStyle=gd;c.fillRect(0,0,256,256);
var tex=new THREE.TextureLoader().load(IMG,draw);tex.encoding=THREE.sRGBEncoding;
var pm=new THREE.Mesh(new THREE.PlaneGeometry(5.6,5.6),new THREE.MeshBasicMaterial({map:tex,alphaMap:new THREE.CanvasTexture(a),transparent:true}));
var halo=new THREE.Mesh(new THREE.TorusGeometry(3.7,.02,8,180),new THREE.MeshBasicMaterial({color:0xffb13b,transparent:true}));
halo.position.z=-3.3;var pg2=new THREE.Group();pg2.add(pm,halo);sc.add(pg2);window.IFFY={U:U,home:true,theme:function(l){var b=orb.children[0].material;b.blending=l?THREE.NormalBlending:THREE.AdditiveBlending;b.needsUpdate=true;U.uL.value=l?1:0;var k=l?0xb8420a:0xffb13b;wire.material.color.setHex(k);pts.material.color.setHex(k);halo.material.color.setHex(k);wire.material.opacity=l?.14:.08;draw()}};
var stg=new THREE.Group(),gtg=new THREE.Group();sc.add(stg);sc.add(gtg);
var IMt=function(k){var t=new THREE.TextureLoader().load(window.MEDIA.im[k]);t.encoding=THREE.sRGBEncoding;return t};
var mq=function(c,r){return new THREE.MeshStandardMaterial({color:c,metalness:1,roughness:r,envMap:env})},OR=0xff7a1a,GD=0xffb13b;
function SG(i){var g=new THREE.Group();g.position.z=-40-i*18;stg.add(g);return g}
var g0=SG(0),nd=[],pls=[],i,j;
g0.add(new THREE.Mesh(new THREE.SphereGeometry(.42,32,24),new THREE.MeshBasicMaterial({color:0xffe1a8})));
g0.add(new THREE.Mesh(new THREE.SphereGeometry(.75,32,24),new THREE.MeshBasicMaterial({color:OR,transparent:true,opacity:.22})));
for(i=0;i<14;i++){var aa=Math.acos(2*(i+.5)/14-1),bb=Math.PI*(1+Math.sqrt(5))*i,rr=1.5+(i%3)*.3,nn=new THREE.Mesh(new THREE.SphereGeometry(.14+(i%3)*.05,24,16),mq(i%4?OR:GD,.2));nn.position.set(rr*Math.sin(aa)*Math.cos(bb),rr*Math.sin(aa)*Math.sin(bb),rr*Math.cos(aa));g0.add(nn);nd.push(nn)}
var lp=[];nd.forEach(function(n){lp.push(new THREE.Vector3(),n.position)});for(i=0;i<14;i++)for(j=i+1;j<14;j++)if(nd[i].position.distanceTo(nd[j].position)<1.7)lp.push(nd[i].position,nd[j].position);
g0.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(lp),new THREE.LineBasicMaterial({color:GD,transparent:true,opacity:.45})));
for(i=0;i<12;i++){var pp=new THREE.Mesh(new THREE.SphereGeometry(.06,12,10),new THREE.MeshBasicMaterial({color:0xfff1d6}));pp.userData={n:nd[i%14],o:i/12};g0.add(pp);pls.push(pp)}
function rrect(w,h,r){var q=new THREE.Shape(),x=-w/2,y=-h/2;q.moveTo(x+r,y);q.lineTo(x+w-r,y);q.quadraticCurveTo(x+w,y,x+w,y+r);q.lineTo(x+w,y+h-r);q.quadraticCurveTo(x+w,y+h,x+w-r,y+h);q.lineTo(x+r,y+h);q.quadraticCurveTo(x,y+h,x,y+h-r);q.lineTo(x,y+r);q.quadraticCurveTo(x,y,x+r,y);return q}
var g1=SG(1),wfn=[],wpk=[],WP=[[-2.1,0,0,GD],[-.3,1.25,.5,OR],[-.3,-1.25,-.5,OR],[1.6,0,0,GD]];
WP.forEach(function(p){var n=new THREE.Mesh(new THREE.ExtrudeGeometry(rrect(1.05,.72,.2),{depth:.22,bevelEnabled:true,bevelSize:.05,bevelThickness:.05,bevelSegments:3}),mq(p[3],.22));n.position.set(p[0],p[1],p[2]);g1.add(n);wfn.push(n);
var dot=new THREE.Mesh(new THREE.CircleGeometry(.09,20),new THREE.MeshBasicMaterial({color:0x20100a}));dot.position.set(-.3,.12,.34);n.add(dot);var ln=new THREE.Mesh(new THREE.PlaneGeometry(.45,.07),new THREE.MeshBasicMaterial({color:0x20100a}));ln.position.set(.12,.12,.34);n.add(ln);var l2=ln.clone();l2.scale.x=.6;l2.position.set(-.04,-.1,.34);n.add(l2)});
[[0,1],[0,2],[1,3],[2,3]].forEach(function(e,k){var a=new THREE.Vector3(WP[e[0]][0]+.55,WP[e[0]][1],WP[e[0]][2]),b=new THREE.Vector3(WP[e[1]][0]-.55,WP[e[1]][1],WP[e[1]][2]),m=a.clone().lerp(b,.5);m.z+=.5;
var cv=new THREE.CatmullRomCurve3([a,m,b]);g1.add(new THREE.Mesh(new THREE.TubeGeometry(cv,40,.025,8),new THREE.MeshBasicMaterial({color:GD,transparent:true,opacity:.6})));
for(var q=0;q<2;q++){var pk=new THREE.Mesh(new THREE.SphereGeometry(.075,14,12),new THREE.MeshBasicMaterial({color:0xfff1d6}));pk.userData={c:cv,o:q*.5+k*.13};g1.add(pk);wpk.push(pk)}});
g1.scale.setScalar(1.25);
var g2=SG(2);['ugc-icecream','ugc-watch','anim-terrace','ugc-yogurt','anim-breakfast','naija-cast','ugc-bottle'].forEach(function(k,i,A){var p=new THREE.Mesh(new THREE.PlaneGeometry(1.4,2),new THREE.MeshBasicMaterial({map:IMt(k),side:THREE.DoubleSide})),a=i/A.length*6.283;p.position.set(Math.sin(a)*2.7,0,Math.cos(a)*2.7);p.rotation.y=a;g2.add(p)});
var sh=new THREE.Shape();sh.moveTo(-.35,-.5);sh.lineTo(.6,0);sh.lineTo(-.35,.5);sh.closePath();
var ply=new THREE.Mesh(new THREE.ExtrudeGeometry(sh,{depth:.25,bevelEnabled:true,bevelSize:.07,bevelThickness:.07,bevelSegments:4}),mq(OR,.15));g2.add(ply);
var g3=SG(3),tk=new THREE.Mesh(new THREE.TorusKnotGeometry(1.2,.38,220,32),mq(OR,.14)),tw=new THREE.Mesh(new THREE.TorusKnotGeometry(1.2,.38,100,16),new THREE.MeshBasicMaterial({color:GD,wireframe:true,transparent:true,opacity:.35}));tw.scale.setScalar(1.12);g3.add(tk,tw);
var gr=new THREE.GridHelper(9,18,GD,0x6b3a12);gr.position.y=-2.1;gr.material.transparent=true;gr.material.opacity=.5;g3.add(gr);
var cast=null,castX=3;function fitCast(w){if(!cast)return;var av=3.73*cam.aspect;if(w){var f=Math.max(.5,Math.min(1,(av-.3)/6.2));cast.setFit(f);castX=Math.min(3,av-.1-3.1*f);tk.position.set(0,2.35,-4.8);tk.scale.setScalar(.7)}else{cast.setFit(.85);castX=0;tk.position.set(0,.4,-6.5);tk.scale.setScalar(.85)}tw.position.copy(tk.position);tw.scale.setScalar(tk.scale.x*1.12)}function mkCast(){if(cast||!window.IFFY_CAST)return;try{cast=IFFY_CAST.create(THREE,{pmrem:pm0});cast.group.position.y=-2.1;g3.add(cast.group);fitCast(cam.aspect>1.1)}catch(e){cast=null}}
function lazyCast(){setTimeout(function(){if(window.requestIdleCallback)requestIdleCallback(mkCast,{timeout:4000});else mkCast()},2500)}if(document.readyState==='complete')lazyCast();else addEventListener('load',lazyCast);
var g4=SG(4);[['bagups',0],['copperstate',-.9],['bagups',-1.8],['copperstate',-2.7]].forEach(function(d,i){var p=new THREE.Mesh(new THREE.PlaneGeometry(3.2,2),new THREE.MeshBasicMaterial({map:IMt(d[0]),transparent:true,opacity:1-i*.2}));p.position.set(i*.25,i*.12,d[1]);g4.add(p);
var fr=new THREE.Mesh(new THREE.PlaneGeometry(3.4,2.4),new THREE.MeshBasicMaterial({color:0x1a0c06,transparent:true,opacity:1-i*.2}));fr.position.set(i*.25,i*.12+.1,d[1]-.02);g4.add(fr);
if(!i)[0xff5f57,0xffbd2e,0x28c840].forEach(function(c,k){var dt=new THREE.Mesh(new THREE.CircleGeometry(.05,16),new THREE.MeshBasicMaterial({color:c}));dt.position.set(-1.5+k*.14,1.2,.02);g4.add(dt)})});
var gts=[],RG2=new THREE.TorusGeometry(3.4,.025,8,90);
for(i=0;i<22;i++){var gm=new THREE.Mesh(RG2,new THREE.MeshBasicMaterial({color:i%2?OR:GD,transparent:true,opacity:.24}));gm.position.z=-26-i*6.5;gtg.add(gm);gts.push(gm)}
var por=new THREE.Mesh(new THREE.CircleGeometry(6,64),new THREE.MeshBasicMaterial({color:GD,transparent:true,opacity:.2,blending:THREE.AdditiveBlending,depthWrite:false}));por.position.z=-152;gtg.add(por);
function stAnim(t){g0.rotation.y=t*.25;g0.rotation.x=t*.1;pls.forEach(function(p){p.position.copy(p.userData.n.position).multiplyScalar((t*.55+p.userData.o)%1)});
wfn.forEach(function(n,i){n.scale.setScalar(1+.06*Math.sin(t*3+i))});wpk.forEach(function(p){p.position.copy(p.userData.c.getPoint((t*.35+p.userData.o)%1))});g1.rotation.y=Math.sin(t*.4)*.3;g2.rotation.y=-t*.35;ply.rotation.y=Math.sin(t)*.5;ply.scale.setScalar(1+.07*Math.sin(t*3));
if(cast&&g3.visible)cast.update(t,{x:mx,y:my});tk.rotation.set(t*.3,t*.4,0);tw.rotation.copy(tk.rotation);g4.rotation.y=Math.sin(t*.5)*.25-.3;gts.forEach(function(g,i){g.rotation.z=t*.12*(i%2?1:-1)})}

var mx=0,my=0,tx=0,ty=0,sv=0,ly=0,hw=7,bx=3,by=0,py=0,t=0;
addEventListener('pointermove',function(e){tx=e.clientX/innerWidth-.5;ty=e.clientY/innerHeight-.5});
function prog(){var d=document.documentElement.scrollHeight-innerHeight;return d>0?Math.min(1,Math.max(0,scrollY/d)):0}
function size(){r.setSize(innerWidth,innerHeight,false);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();
hw=4.2*cam.aspect;var w=cam.aspect>1.1;fitCast(w);
if(w){var s=Math.min(1,hw/5.6);pg2.scale.setScalar(s);bx=hw*.5;by=0;py=0}else{var s2=Math.min(1,hw*1.6/5.6);pg2.scale.setScalar(s2);bx=0;by=1.7;py=1.7}
draw()}
function draw(){if(lost)return;var J=window.J||{x:1,y:0,s:1};if(window.JPS&&window.K&&scrollY<window.JPS()-2){var k0=window.K;k0.z=9;k0.fov=50;k0.po=1;k0.vis=1;J.x=1;J.y=0;J.s=1.45}var ho=window.IFFY&&window.IFFY.home,K=(ho&&window.K)||{z:9,fov:50},off=window.IFFY&&window.IFFY.off,wd=cam.aspect>1.1,q=Math.min(1,scrollY/innerHeight);if(!ho)J={x:1,y:0,s:1};
orb.visible=!off&&(ho?J.s>.05:wd);orb.position.set(wd?J.x*hw*.5:J.x*hw*.2,wd?J.y*3:by+J.y*2,-2);orb.scale.setScalar(Math.max(.01,J.s*(wd||!ho?1:.55)));
if(ho&&J.r!=null)U.uC.value.setRGB(J.r,J.g,J.b);
pg2.position.set(bx,py,0);pg2.rotation.y=mx*.45;pg2.rotation.x=my*.25;
var o=ho?(window.K?K.po:Math.max(0,1-q*1.4)):0;pm.material.opacity=o;halo.material.opacity=o;pg2.visible=o>.01;
stg.visible=!!ho&&K.z<-6&&(K.vis==null||K.vis>.02);gtg.visible=stg.visible;if(stg.visible)stg.children.forEach(function(g){g.visible=Math.abs(K.z-g.position.z)<22;g.position.x=wd?3:0;g.position.y=wd?0:1.7;g.scale.setScalar(wd?1:.7)});if(stg.visible&&cast){if(wd)g3.position.x=castX;else g3.position.y=1.95;cast.group.visible=wd||K.z>g3.position.z+3.2}
cam.fov=K.fov||50;cam.updateProjectionMatrix();cam.position.set(mx*.6,-my*.4,K.z);cam.lookAt(mx*.15,-my*.1,K.z-9);r.render(sc,cam)}
addEventListener('resize',size);addEventListener('scroll',function(){if(still)draw()},{passive:true});
size();
function loop(now){t=now/1000;mx+=(tx-mx)*.05;my+=(ty-my)*.05;
sv+=(Math.min(Math.abs(scrollY-ly),80)/80-sv)*.08;ly=scrollY;
U.uT.value=t*.7;
orb.rotation.y=t*.12+mx;wire.rotation.x=t*.1;pts.rotation.y=-t*.05;
sats.forEach(function(m){var d=m.userData,k=t*d.s+d.p;m.position.set(Math.cos(k)*d.r,Math.sin(k*.7)*d.r*.5,Math.sin(k)*d.r*.6);m.rotation.x=t;m.rotation.y=t*.7});
halo.rotation.z=t*.3;stAnim(t);tr.forEach(function(m,i){m.rotation.x=t*.2+i;m.rotation.y=t*.15});halo.rotation.x=1.2+Math.sin(t*.5)*.2;
draw();requestAnimationFrame(loop)}
if(!still)requestAnimationFrame(loop);
}catch(e){cv.style.display='none'}
document.querySelectorAll('.tile').forEach(function(t){
t.addEventListener('pointermove',function(e){var b=t.getBoundingClientRect();t.style.setProperty('--ry',((e.clientX-b.left)/b.width-.5)*14+'deg');t.style.setProperty('--rx',(-((e.clientY-b.top)/b.height-.5))*14+'deg')});
t.addEventListener('pointerleave',function(){t.style.setProperty('--rx','0deg');t.style.setProperty('--ry','0deg')})});
})();
