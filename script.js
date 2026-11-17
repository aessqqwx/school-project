// ------------------------------------------------------------
// Klinch AI – Итоговый проект 9‑класс: «Мозг без мифов»
// Все библиотеки подключены через CDN, запуск: просто откройте index.html
// ------------------------------------------------------------

/* ==================== 1. Инициализация THREE.js + Lenis ==================== */
let scene, camera, renderer, controls;
let brainMesh = null;
let highlightMode = false;

function initThree() {
  const canvas = document.getElementById('brainCanvas');
  if (!canvas) return;

  scene = new THREE.Scene();
  scene.background = new THREE.Color('#0a0b0e');

  camera = new THREE.PerspectiveCamera(55, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.set(0, 1.5, 2.5);

  renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // ----- процедурная сфера мозга (без внешних файлов) -----
  const radius = 0.9;
  const geo = new THREE.SphereGeometry(radius, 64, 64);
  const mat = new THREE.MeshStandardMaterial({ color: '#1e88e5', transparent: true, opacity: 0.6 });
  const sphere = new THREE.Mesh(geo, mat);
  sphere.rotation.z = Math.PI / 4;
  scene.add(sphere);

  // маркеры отделов (взаимозаменяемые маленькие сферы)
  const lobes = [
    { name: 'Лобная доля', pos: [0.0, 0.8, 0.0] },
    { name: 'Теменная доля', pos: [-0.7, 0.3, 0.5] },
    { name: 'Затылочная доля', pos: [0.6, -0.2, 0.3] },
    { name: 'Основание мозга', pos: [0.0, -0.7, 0.0] }
  ];
  lobes.forEach(l => {
    const markerGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const markerMat = new THREE.MeshBasicMaterial({ color: '#ffb300' });
    const marker = new THREE.Mesh(markerGeo, markerMat);
    marker.position.set(...l.pos);
    marker.lobeName = l.name;
    scene.add(marker);
    // создать текстовую метку через CSS (рендеринг в Three.js через Sprite)
    const spriteMap = new THREE.TextureLoader().load('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNGMUUwMCIgZmlsbD0icmdiKDAsMCwwKSIvPjxyZWN0IHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSJ3aGl0ZSIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsLCB3aXRoLCB0ZXh0IiBmb250LXNpemU9IjMwIiBmaWxsPSJ3aGl0ZSIvc3R5bGU9InN0cm9rZTogIzAwIiBzdHJva2Utd2lkdGg9IjIiLz48L3N2Zz4=');
    const sprite = new THREE.Sprite({ map: spriteMap, transparent: true });
    sprite.scale.set(0.2, 0.2, 0.2);
    sprite.position.copy(marker.position);
    scene.add(sprite);
  });

  // импульсные анимации (GSAP)
  function addPulse(lobeNode) {
    gsap.to(lobeNode.scale, {
      x: 1.4, y: 1.4, z: 1.4,
      duration: 1.2,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut'
    });
  }
  lobes.forEach(l => {
    const marker = scene.getObjectByName('lobe_' + l.name.replace(/\s+/g, '_'));
    if (marker) addPulse(marker);
  });

  // свет
  const amb = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(amb);
  const dir = new THREE.DirectionalLight(0xffffff, 0.6);
  dir.position.set(2, 3, 4);
  scene.add(dir);

  // resize
  window.addEventListener('resize', () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    camera.aspect = w / h; camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });

  lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
  lenis.on('scroll', (e) => {
    updateProgressBar();
  });
  animate();
}
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  lenis.update();
  renderer.render(scene, camera);
}

/* ==================== 2. Счётчики HERO ==================== */
document.addEventListener('DOMContentLoaded', () => {
  const counters = document.querySelectorAll('.counter');
  counters.forEach(c => {
    const target = +c.getAttribute('data-target');
    const updateCount = () => {
      const +c.innerText < target && requestAnimationFrame(() => {
        c.innerText = Math.ceil(+c.innerText + target / 100);
        updateCount();
      });
    };
    updateCount();
  });
});

/* ==================== 3. Progress bar on scroll ==================== */
function updateProgressBar() {
  const htmlHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const pct = Math.min(100, (scrollTop / htmlHeight) * 100);
  const bar = document.querySelector('.progress-bar');
  if (bar) bar.style.width = pct + '%';
}

/* ==================== 4. Modal passport ==================== */
const passportBtn = document.getElementById('passportBtn');
const modal = document.getElementById('passportModal');
if (passportBtn && modal) {
  passportBtn.addEventListener('click', () => {
    modal.hidden = false;
    passportBtn.setAttribute('aria-expanded', 'true');
  });
  modal.addEventListener('click', e => {
    const close = e.target.closest('[data-close="modal"]');
    if (close || e.target === modal) {
      modal.hidden = true;
      passportBtn.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ==================== 5. Myth cards reveal ==================== */
document.querySelectorAll('.myth-card .reveal-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.myth-card');
    const truth = card.querySelector('.truth');
    if (truth) {
      truth.classList.toggle('hidden');
      btn.textContent = truth.classList.contains('hidden') ? 'Показать правду' : 'Скрыть правду';
    }
  });
});

/* ==================== 6. Data table chart ==================== */
function initChart() {
  const ctx = document.getElementById('chartCanvas').getContext('2d');
  if (!ctx) return;
  const data = {
    labels: ['Иванов', 'Петрова'],
    datasets: [{
      label: 'Баллы внимания',
      data: [78, 85],
      backgroundColor: 'rgba(79, 195, 247, 0.4)',
      borderColor: '#4fc3f7',
      borderWidth: 1,
    }]
  };
  new Chart(ctx, { type: 'bar', data, options: { responsive: true, plugins: { legend: { display: false }, title: { display: false } }, scales: { y: { beginAtZero: true, max: 100 } } } });
}
document.addEventListener('DOMContentLoaded', initChart);

/* ==================== 7. Струпа experiment ==================== */
const stroopBtn = document.getElementById('startStroop');
const stroopContainer = document.getElementById('stroopContainer');
const stroopResult = document.getElementById('stroopResult');
const words = ['КРАСНАЯ', 'ЗЕЛЕНАЯ', 'СИНИЯ', 'ЖЕЛТАЯ'];
const colors = ['red', 'green', 'blue', 'yellow'];

function getRandomStroop() {
  const wordIdx = Math.floor(Math.random() * words.length);
  const colorIdx = Math.floor(Math.random() * colors.length);
  return { word: words[wordIdx], color: colors[colorIdx], correct: wordIdx === colorIdx };
}
function renderStroop(stroop) {
  stroopContainer.innerHTML = '';
  const box = document.createElement('div');
  box.style.fontSize = '3rem';
  box.style.minHeight = '100px';
  box.style.display = 'flex';
  box.style.alignItems = 'center';
  box.style.justifyContent = 'center';
  box.style.width = '200px';
  box.style.height = '200px';
  box.style.border = '2px solid #fff';
  box.style.borderRadius = '8px';
  box.style.color = stroop.color;
  box.textContent = stroop.word;
  stroopContainer.appendChild(box);
  // клик: ответ верно/неверно
  box.onclick = () => {
    const correct = stroop.correct;
    const resultText = correct ? 'Верно!' : 'Неправильно, цвет был ' + stroop.color;
    stroopResult.textContent = resultText;
    stroopResult.classList.remove('hidden');
    setTimeout(() => { stroopResult.classList.add('hidden'); }, 2000);
    nextStroop();
  };
}
let stroopCounter = 0;
function nextStroop() {
  stroopCounter++;
  if (stroopCounter >= 5) {
    stroopContainer.classList.add('hidden');
    stroopResult.textContent = 'Эксперимент завершен! Реакция зафиксирована.';
    stroopResult.classList.remove('hidden');
    return;
  }
  const stroop = getRandomStroop();
  renderStroop(stroop);
}
if (stroopBtn && stroopContainer) {
  stroopBtn.addEventListener('click', () => {
    stroopContainer.classList.remove('hidden');
    stroopResult.classList.add('hidden');
    stroopCounter = 0;
    nextStroop();
  });
}

/* ==================== 8. Contrast mode toggle ==================== */
const contrastToggle = document.getElementById('contrastToggle');
if (contrastToggle) {
  contrastToggle.addEventListener('click', () => {
    const html = document.documentElement;
    const isHigh = html.getAttribute('data-theme') === 'high-contrast';
    html.setAttribute('data-theme', isHigh ? null : 'high-contrast');
    contrastToggle.setAttribute('aria-pressed', !(isHigh));
  });
}

/* ==================== 9. GSAP scrollTrigger for sections ==================== */
gsap.registerPlugin(ScrollTrigger);
document.querySelectorAll('.section').forEach(section => {
  gsap.from(section, {
    scrollTrigger: {
      trigger: section,
      start: 'top 80%',
      end: 'bottom 20%',
      toggleActions: 'play reverse play reverse',
    },
    y: 40,
    opacity: 0,
    duration: 0.8,
    ease: 'power2.out'
  });
});

/* ==================== 10. Lenis smooth scroll init ==================== */
if (typeof Lenis !== 'undefined') {
  // Инициализация Lenis только один раз (если уже не создан в initThree)
  if (typeof window.smoothScroll === 'undefined') {
    window.smoothScroll = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1 - Math.pow(2, -10 * t)) });
    window.smoothScroll.on('scroll', (e) => {});
    function raf(time) {
      window.smoothScroll.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }
}

/* ==================== 11. Fallback images & local save notes ==================== */
document.addEventListener('DOMContentLoaded', () => {
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    img.addEventListener('error', () => {
      img.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNGMUUwMCIgZmlsbD0icmdiKDAsMCwwKSIgLz48dGV4dCB4PSI1MCIgeT0iNTAiIGZpbGw9IiNmZmYiIHN0eWxlPSJmaWxsOiNmZmYiIHN0cm9rZS13aWR0aD0iMiIgLz48L3N2Zz4=';
    });
  });
});

// ------------------------------------------------------------
// Конец скрипта. Все элементы готовы к двойному клику по index.html
// ------------------------------------------------------------