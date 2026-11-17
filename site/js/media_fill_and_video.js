(function(){var M=window.MEDIA,calm=matchMedia('(prefers-reduced-motion:reduce)').matches;
document.querySelectorAll('[data-im]').forEach(function(e){var u=M.im[e.dataset.im];if(!u)return;if(e.tagName==='VIDEO')e.poster=u;else e.src=u});
var io=new IntersectionObserver(function(es){es.forEach(function(x){var v=x.target;if(calm)return;if(x.isIntersecting){if(!v.getAttribute('src'))v.src=M.vd[v.dataset.vd];v.play().catch(function(){})}else{v.pause();if(!v.muted){v.muted=true}}})},{threshold:.35});
var IM='<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',IU='<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 8a5 5 0 010 8M18.5 5.5a9 9 0 010 13" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';
document.querySelectorAll('video[data-vd]').forEach(function(v){io.observe(v);if((M.aud||[]).indexOf(v.dataset.vd)<0)return;
var w=document.createElement('div');w.className='vw';v.parentNode.insertBefore(w,v);w.appendChild(v);
var b=document.createElement('button');b.type='button';b.className='snd';b.setAttribute('aria-label','Unmute video');b.innerHTML=IM;w.appendChild(b);
v.addEventListener('volumechange',function(){b.innerHTML=v.muted?IM:IU;b.setAttribute('aria-label',v.muted?'Unmute video':'Mute video')});
b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();document.querySelectorAll('video[data-vd]').forEach(function(o){if(o!==v&&!o.muted)o.muted=true});if(!v.getAttribute('src'))v.src=M.vd[v.dataset.vd];v.muted=!v.muted;if(v.paused)v.play().catch(function(){})})});
if(window.lottie){var o={renderer:'svg',loop:true,autoplay:!calm};
lottie.loadAnimation(Object.assign({container:document.getElementById('lt'),animationData:M.lo},o));
var c=document.getElementById('cue');if(c)lottie.loadAnimation(Object.assign({container:c,animationData:M.cue},o))}
})();
