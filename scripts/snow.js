// Snow effect (depth, blur, wind noise, twinkle)
const snow = document.getElementById('snow');
const ctx = snow.getContext('2d');
let W, H, flakes = [], snowActive = true, time = 0;
const toggle = document.getElementById('snow-toggle');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (toggle) toggle.addEventListener('change', () => { snowActive = toggle.checked; });

function resize(){
  W = snow.width = window.innerWidth; H = snow.height = window.innerHeight;
  const target = Math.min(220, Math.max(100, Math.floor((W*H)/6000)));
  flakes = Array.from({length: target}, () => makeFlake(true));
}

function makeFlake(seedY){
  const depth = Math.random();
  return {
    x: Math.random()*W,
    y: seedY ? Math.random()*H : -10,
    r: 0.7 + 2.0*(1-depth),
    d: 0.4 + 1.3*(1-depth),
    blur: 0.2 + 2.2*depth,
    alpha: 0.45 + 0.45*(1-depth),
    tw: Math.random()*0.01 + 0.005,
    a: Math.random()*Math.PI*2,
    z: depth
  };
}

function draw(){
  if (!snowActive || reduceMotion){ ctx.clearRect(0,0,W,H); return; }
  time += 0.003;
  ctx.clearRect(0,0,W,H);
  for (const f of flakes){
    f.x += Math.sin(f.a += 0.008*(1.3 - f.z)) * 0.3*(1.2 - f.z);
    f.y += f.d;
    if (f.y > H + 12) Object.assign(f, makeFlake(false));
    ctx.save();
    ctx.globalAlpha = f.alpha;
    ctx.filter = `blur(${f.blur}px)`;
    ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI*2);
    ctx.fillStyle = '#fff'; ctx.fill();
    ctx.restore();
  }
}
function loop(){ draw(); requestAnimationFrame(loop); }
resize(); loop(); window.addEventListener('resize', resize);
