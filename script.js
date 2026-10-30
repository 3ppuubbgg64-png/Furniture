/* ---------- 3D furniture built from CSS cuboids ---------- */
// shade each face so the boxes look lit
const SHADE = { front: 1, back: .62, right: .8, left: .72, top: 1.18, bottom: .5 };

function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16);
  const c = s => Math.max(0, Math.min(255, Math.round(((n >> s) & 255) * k)));
  return `rgb(${c(16)},${c(8)},${c(0)})`;
}

// x,y,z = centre of the box (y points down, floor is y = 0)
function box({ w, h, d, x = 0, y = 0, z = 0, c = '#b9774a' }) {
  const el = document.createElement('div');
  el.className = 'box';
  el.style.cssText = `width:${w}px;height:${h}px;left:${-w / 2}px;top:${-h / 2}px;transform:translate3d(${x}px,${y}px,${z}px)`;
  const faces = {
    front:  [w, h, 0, 0, `translateZ(${d / 2}px)`],
    back:   [w, h, 0, 0, `rotateY(180deg) translateZ(${d / 2}px)`],
    right:  [d, h, (w - d) / 2, 0, `rotateY(90deg) translateZ(${w / 2}px)`],
    left:   [d, h, (w - d) / 2, 0, `rotateY(-90deg) translateZ(${w / 2}px)`],
    top:    [w, d, 0, (h - d) / 2, `rotateX(90deg) translateZ(${h / 2}px)`],
    bottom: [w, d, 0, (h - d) / 2, `rotateX(-90deg) translateZ(${h / 2}px)`]
  };
  for (const f in faces) {
    const [fw, fh, fl, ft, t] = faces[f];
    const i = document.createElement('i');
    i.style.cssText = `width:${fw}px;height:${fh}px;left:${fl}px;top:${ft}px;background:${shade(c, SHADE[f])};transform:${t}`;
    el.appendChild(i);
  }
  return el;
}

const WOOD = '#b9774a', DARK = '#6e4122', LIGHT = '#d9a574';

const MODELS = {
  table: c => [
    { w: 210, h: 14, d: 120, y: -84, c: c || WOOD },
    ...[[-92, -48], [92, -48], [-92, 48], [92, 48]].map(([x, z]) => ({ w: 14, h: 84, d: 14, x, y: -42, z, c: DARK }))
  ],
  chair: c => [
    { w: 70, h: 10, d: 70, y: -48, c: c || WOOD },
    { w: 70, h: 80, d: 8, y: -92, z: -31, c: c || WOOD },
    ...[[-30, -30], [30, -30], [-30, 30], [30, 30]].map(([x, z]) => ({ w: 8, h: 48, d: 8, x, y: -24, z, c: DARK }))
  ],
  sofa: c => [
    { w: 190, h: 34, d: 84, y: -17 - 8, c: c || '#5b7c8d' },
    { w: 190, h: 56, d: 22, y: -62, z: -31, c: c || '#5b7c8d' },
    { w: 24, h: 56, d: 84, x: -83, y: -48, c: c || '#4a6978' },
    { w: 24, h: 56, d: 84, x: 83, y: -48, c: c || '#4a6978' },
    { w: 68, h: 14, d: 60, x: -35, y: -48, z: 8, c: '#7396a8' },
    { w: 68, h: 14, d: 60, x: 35, y: -48, z: 8, c: '#7396a8' },
    ...[[-80, 34], [80, 34], [-80, -34], [80, -34]].map(([x, z]) => ({ w: 10, h: 8, d: 10, x, y: -4, z, c: DARK }))
  ],
  lamp: () => [
    { w: 44, h: 6, d: 44, y: -3, c: DARK },
    { w: 6, h: 120, d: 6, y: -66, c: '#c9b79c' },
    { w: 56, h: 40, d: 56, y: -140, c: '#f3d9a4' }
  ],
  shelf: c => [
    { w: 8, h: 150, d: 36, x: -50, y: -75, c: c || WOOD },
    { w: 8, h: 150, d: 36, x: 50, y: -75, c: c || WOOD },
    ...[-6, -50, -94, -146].map(y => ({ w: 108, h: 6, d: 36, y, c: LIGHT })),
    { w: 22, h: 30, d: 20, x: -20, y: -66, c: '#c0504d' },
    { w: 26, h: 22, d: 20, x: 22, y: -112, c: '#4f81a8' }
  ],
  bed: c => [
    { w: 150, h: 24, d: 200, y: -22, c: DARK },
    { w: 142, h: 22, d: 190, y: -45, c: '#f1ece4' },
    { w: 150, h: 80, d: 10, y: -52, z: -100, c: c || WOOD },
    { w: 56, h: 12, d: 34, x: -36, y: -61, z: -70, c: '#fff' },
    { w: 56, h: 12, d: 34, x: 36, y: -61, z: -70, c: '#fff' },
    { w: 142, h: 6, d: 100, y: -57, z: 40, c: '#c97b63' }
  ],
  armchair: c => [
    { w: 86, h: 26, d: 80, y: -28, c: c || '#c97b63' },
    { w: 86, h: 60, d: 18, y: -60, z: -31, c: c || '#c97b63' },
    { w: 18, h: 40, d: 80, x: -34, y: -50, c: '#b2654e' },
    { w: 18, h: 40, d: 80, x: 34, y: -50, c: '#b2654e' },
    ...[[-32, 32], [32, 32], [-32, -32], [32, -32]].map(([x, z]) => ({ w: 8, h: 15, d: 8, x, y: -8, z, c: DARK }))
  ]
};

function buildScene(host, model, color, scale = 1) {
  host.innerHTML = '';
  const tilt = document.createElement('div');
  tilt.className = 'tilt';
  tilt.style.transform = 'rotateX(-22deg)';
  const spin = document.createElement('div');
  spin.className = 'spin';
  spin.style.top = `${60 * scale}px`;                       // centre the model vertically
  spin.style.scale = scale;
  MODELS[model](color).forEach(p => spin.appendChild(box(p)));
  tilt.appendChild(spin);
  host.appendChild(tilt);

  // mouse tilt: model follows the cursor
  const area = host.closest('.hero') || host;
  area.addEventListener('mousemove', e => {
    const r = host.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
    const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
    tilt.style.transform = `rotateX(${-22 - dy * 25}deg) rotateZ(${dx * -8}deg)`;
  });
  area.addEventListener('mouseleave', () => (tilt.style.transform = 'rotateX(-22deg)'));
  host.addEventListener('mouseenter', () => host.classList.add('paused'));
  host.addEventListener('mouseleave', () => host.classList.remove('paused'));
}

buildScene(document.getElementById('heroStage'), 'sofa', null, 2);
buildScene(document.getElementById('aboutStage'), 'bed', null, 1.5);

/* ---------- products ---------- */
const PRODUCTS = [
  { name: 'Oslo Sofa', model: 'sofa', price: 899, badge: 'Best seller' },
  { name: 'Nordic Chair', model: 'chair', price: 159 },
  { name: 'Oak Dining Table', model: 'table', price: 549, badge: 'New' },
  { name: 'Halo Floor Lamp', model: 'lamp', price: 119 },
  { name: 'Cube Bookshelf', model: 'shelf', price: 329 },
  { name: 'Dreamer Bed', model: 'bed', price: 749 },
  { name: 'Cozy Armchair', model: 'armchair', price: 399, badge: 'Sale' }
];
const SCALES = { sofa: .9, chair: 1.3, table: .9, lamp: 1, shelf: 1.1, bed: .75, armchair: 1.3 };

const grid = document.getElementById('grid');
PRODUCTS.forEach((p, i) => {
  const card = document.createElement('div');
  card.className = 'card reveal';
  card.style.transitionDelay = `${(i % 3) * 0.12}s`;
  card.innerHTML = `${p.badge ? `<span class="badge">${p.badge}</span>` : ''}
    <div class="stage"></div><h3>${p.name}</h3><div class="price">$${p.price}</div>
    <button>Add to cart</button>`;
  grid.appendChild(card);
  buildScene(card.querySelector('.stage'), p.model, null, SCALES[p.model]);
  card.querySelector('button').onclick = () => addToCart(p.name);
});

/* ---------- cart & toast ---------- */
let count = 0;
const toast = document.getElementById('toast');
function addToCart(name) {
  document.getElementById('cartCount').textContent = ++count;
  const b = document.getElementById('cartBtn');
  b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump');
  showToast(`${name} added to cart`);
}
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(showToast.t);
  showToast.t = setTimeout(() => toast.classList.remove('show'), 2000);
}
document.getElementById('form').addEventListener('submit', e => {
  e.preventDefault(); e.target.reset(); showToast('Message sent. Thank you!');
});

/* ---------- page effects ---------- */
window.addEventListener('load', () => setTimeout(() => document.getElementById('loader').classList.add('hide'), 700));
window.addEventListener('scroll', () => document.getElementById('nav').classList.toggle('scrolled', scrollY > 40));

const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add('in');
  const n = e.target.querySelectorAll('[data-count]');
  n.forEach(el => {
    const end = +el.dataset.count, t0 = performance.now();
    (function step(t) {
      const k = Math.min((t - t0) / 1800, 1);
      el.textContent = Math.floor(end * (1 - Math.pow(1 - k, 3))).toLocaleString() + (k === 1 ? '+' : '');
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  });
  io.unobserve(e.target);
}), { threshold: .15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));
