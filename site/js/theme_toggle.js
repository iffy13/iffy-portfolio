(function(){var b=document.getElementById('tg'),d=document.documentElement;
function light(){return d.dataset.theme?d.dataset.theme==='light':matchMedia('(prefers-color-scheme:light)').matches}
function apply(){var l=light();b.textContent=l?'Dark':'Light';b.setAttribute('aria-label','Switch to '+(l?'dark':'light')+' mode');document.body.classList.toggle('lm',l);if(window.IFFY)IFFY.theme(l);window.JM&&JM()}
b.addEventListener('click',function(){var n=light()?'dark':'light';d.dataset.theme=n;try{localStorage.setItem('th',n)}catch(e){}apply()});
apply()})();
