const canvas = document.getElementById('fundo-codigo');
const ctx = canvas.getContext('2d');
let W, H, dpr, colunas = [];

const TAM_FONTE = 15;     
const ESPACO_COL = 22;     

function novaColuna(x, aleatorioY) {
  const paleta = Math.random();
  return {
    x: x,
    y: aleatorioY ? Math.random() * H : -Math.random() * H * 0.5,
    vel: 0.6 + Math.random() * 1.6,
    comprimento: 10 + Math.floor(Math.random() * 18),
    chars: [],

    cor: paleta < 0.20 ? [240, 99, 15] : paleta < 0.45 ? [74, 158, 255] : [180, 195, 215]
  };
}

function redimensionar() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  colunas = [];
  const n = Math.floor(W / ESPACO_COL);
  for (let i = 0; i < n; i++) {
    colunas.push(novaColuna(i * ESPACO_COL + ESPACO_COL / 2, true));
    const c = colunas[i];
    for (let j = 0; j < c.comprimento; j++) c.chars.push(Math.random() < 0.5 ? '0' : '1');
  }
}
redimensionar();
window.addEventListener('resize', redimensionar);

const reduzMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function desenhar() {
  ctx.clearRect(0, 0, W, H);
  ctx.font = '600 ' + TAM_FONTE + 'px "IBM Plex Mono", monospace';
  ctx.textAlign = 'center';

  for (let i = 0; i < colunas.length; i++) {
    const c = colunas[i];
    c.y += c.vel;

   
    if (Math.random() < 0.06) {
      c.chars[Math.floor(Math.random() * c.chars.length)] = Math.random() < 0.5 ? '0' : '1';
    }

    const [r, g, b] = c.cor;

    for (let j = 0; j < c.comprimento; j++) {
      const yChar = c.y - j * TAM_FONTE;
      if (yChar < -TAM_FONTE || yChar > H + TAM_FONTE) continue;

      if (j === 0) {
     
        ctx.shadowColor = 'rgba(' + r + ',' + g + ',' + b + ',0.8)';
        ctx.shadowBlur = 8;
        ctx.fillStyle = 'rgba(' + Math.min(r + 60, 255) + ',' + Math.min(g + 60, 255) + ',' + Math.min(b + 60, 255) + ',0.9)';
      } else {
        ctx.shadowBlur = 0;
    
        const alpha = Math.max(0, 0.55 * (1 - j / c.comprimento));
        ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
      }

      ctx.fillText(c.chars[j % c.chars.length], c.x, yChar);
    }
    ctx.shadowBlur = 0;

    if (c.y - c.comprimento * TAM_FONTE > H) {
      colunas[i] = novaColuna(c.x, false);
      const nova = colunas[i];
      for (let j = 0; j < nova.comprimento; j++) nova.chars.push(Math.random() < 0.5 ? '0' : '1');
    }
  }

  if (!reduzMovimento) requestAnimationFrame(desenhar);
}

if (!reduzMovimento) requestAnimationFrame(desenhar);

const hudVersao = document.getElementById('hud-versao');
const hudStatus = document.getElementById('hud-status');
const barra = document.getElementById('barra-build');
const inicio = Date.now();

function atualizarVersao() {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  const p = total > 0 ? Math.min(window.scrollY / total, 1) : 0;

  barra.style.width = (p * 100) + '%';

  if (p >= 0.99) {
    hudVersao.textContent = 'v1.0-beta';
    hudStatus.innerHTML = '<span class="ok">✓ versão completa</span>';
  } else {
    const minor = Math.floor(p * 9) + 1;
    const patch = Math.floor((p * 9 % 1) * 10);
    hudVersao.textContent = 'v0.' + minor + '.' + patch;
    hudStatus.innerHTML = 'construindo… ' + Math.round(p * 100) + '%';
  }
}

window.addEventListener('scroll', atualizarVersao, { passive: true });
atualizarVersao();

const tempoEl = document.getElementById('tempo-leitura');
setInterval(() => {
  tempoEl.textContent = Math.round((Date.now() - inicio) / 1000);
}, 1000);

const observador = new IntersectionObserver((entradas) => {
  entradas.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visivel'); });
}, { threshold: 0.12 });
document.querySelectorAll('.revelar').forEach((el) => observador.observe(el));