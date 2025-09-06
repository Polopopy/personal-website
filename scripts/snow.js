const snow = document.getElementById('snow');
const ctx = snow.getContext('2d');

let W, H, flakes = [], snowActive = true, time = 0, running = true;

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const toggle = document.getElementById('snow-toggle');
if (toggle) toggle.addEventListener('change', () => { snowActive = toggle.checked; });

document.addEventListener('visibilitychange', () => { running = !document.hidden; });

const DPR = Math.min(window.devicePixelRatio || 1, 1.5);

const sprites = [];
(function makeSprites(){
  const sizes = [1.2, 2.0, 3.0];
  for (const r of sizes) {
    const s = document.createElement('canvas');
    const sctx = s.getContext('2d');
    const pad = 4;
    s.width = s.height = Math.ceil((r*2 + pad) * DPR);
    sctx.scale(DPR, DPR);
    sctx.filter = 'blur(1px)';
    sctx.fillStyle = '#fff';
    sctx.beginPath();
    sctx.arc(s.width/(2*DPR), s.height/(2*DPR), r, 0, Math.PI*2);
    sctx.fill();
    sprites.push(s);
  }
})();

function noiseSeed(x, y){ const s = Math.sin(x*127.1 + y*311.7) * 43758.5453; return s - Math.floor(s); }
function smoothNoise(x,y){
  const xi=Math.floor(x), yi=Math.floor(y);
  const xf=x-xi, yf=y-yi;
  const v1=noiseSeed(xi,yi), v2=noiseSeed(xi+1,yi), v3=noiseSeed(xi,yi+1), v4=noiseSeed(xi+1,yi+1);
  const i1=v1+(v2-v1)*xf, i2=v3+(v4-v3)*xf; return i1+(i2-i1)*yf;
}

function resize(){
  snow.width  = Math.floor(window.innerWidth  * DPR);
  snow.height = Math.floor(window.innerHeight * DPR);
  W = snow.width  / DPR;
  H = snow.height / DPR;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

  const area = W * H;
  const target = Math.min(140, Math.max(70, Math.floor(area / 7000)));
  flakes = Array.from({length: target}, () => makeFlake(true));
}

function makeFlake(seedY){
  const depth = Math.random(); // 0 near .. 1 far
  const sizeIndex = depth < 0.33 ? 2 : depth < 0.66 ? 1 : 0; // nearer => bigger sprite
  return {
    x: Math.random()*W,
    y: seedY ? Math.random()*H : -10,
    r: [3.0, 2.0, 1.2][sizeIndex],
    d: 0.35 + 1.1*(1-depth),        // fall speed
    z: depth,
    a: Math.random()*Math.PI*2,
    tw: Math.random()*0.01 + 0.005, // twinkle
    sprite: sprites[sizeIndex],
    alpha: 0.55 + 0.35*(1-depth)
  };
}

const FRAME_MS = 1000/60;
let last = 0;

function draw(now){
  if (!running) { requestAnimationFrame(draw); return; }
  if (now - last < FRAME_MS) { requestAnimationFrame(draw); return; }
  last = now;

  if (!snowActive || reduceMotion){
    ctx.clearRect(0,0,W,H);
    requestAnimationFrame(draw);
    return;
  }

  time += 0.003;
  ctx.clearRect(0,0,W,H);

  for (const f of flakes){
    const wind = (smoothNoise(f.x*0.002 + time, f.y*0.002) - 0.5) * (1.2 - f.z);
    f.x += wind + Math.sin(f.a += 0.008*(1.3 - f.z)) * 0.3*(1.2 - f.z);
    f.y += f.d;

    if (f.y > H + 12) Object.assign(f, makeFlake(false));
    if (f.x > W + 12) f.x = -12; else if (f.x < -12) f.x = W + 12;

    // slight twinkle
    const tw = f.alpha * (0.85 + 0.15*Math.sin(time/f.tw + f.a));
    ctx.globalAlpha = tw;
    // draw pre-blurred sprite
    const s = f.sprite;
    const w = s.width / DPR, h = s.height / DPR;
    ctx.drawImage(s, f.x - w/2, f.y - h/2, w, h);
  }
  ctx.globalAlpha = 1;

  requestAnimationFrame(draw);
}

resize();
requestAnimationFrame(draw);
window.addEventListener('resize', resize);
