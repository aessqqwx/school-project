// ------------------------------------------------------------
// Klinch AI – Итоговый проект 9‑класс: «Мозг без мифов»
// Все библиотеки подключены через CDN, запуск: просто откройте index.html
// ------------------------------------------------------------

/* ==================== Глобальные переменные ==================== */
let scene, camera, renderer, controls, lenis;
let brainMesh = null;
let markers = [];

/* ==================== 1. Инициализация THREE.js ==================== */
function initThree() {
  const canvas = document.getElementById('brainCanvas');
  if (!canvas) {
    console.warn('brainCanvas не найден, 3D не инициализирован');
    return;
  }

  // Проверка доступности Three.js
  if (typeof THREE === 'undefined') {
    console.warn('Three.js не загружен, показываем fallback');
    canvas.innerHTML = '<div class="brain-fallback"><div class="fallback-icon">🧠</div><p>3D‑модель недоступна. Требуется WebGL.</p></div>';
    return;
  }

  scene = new THREE.Scene();
  scene.background = new THREE.Color('#0a0b0e');

  camera = new THREE.PerspectiveCamera(55, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.set(0, 1.5, 2.5);

  renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  // ----- процедурная модель мозга -----
  const radius = 0.9;
  const geo = new THREE.SphereGeometry(radius, 64, 64);
  const mat = new THREE.MeshStandardMaterial({ 
    color: '#1e88e5', 
    transparent: true, 
    opacity: 0.7,
    roughness: 0.4,
    metalness: 0.1
  });
  brainMesh = new THREE.Mesh(geo, mat);
  brainMesh.rotation.z = Math.PI / 6;
  scene.add(brainMesh);

  // маркеры отделов
  const lobes = [
    { name: 'Лобная доля', pos: [0.0, 0.7, 0.3], color: '#ff6b6b' },
    { name: 'Теменная доля', pos: [-0.5, 0.4, -0.5], color: '#4ecdc4' },
    { name: 'Затылочная доля', pos: [0.0, 0.0, -0.8], color: '#ffe66d' },
    { name: 'Височная доля', pos: [0.6, 0.2, 0.3], color: '#95e1d3' },
    { name: 'Мозжечок', pos: [0.0, -0.6, -0.4], color: '#f38181' },
    { name: 'Ствол мозга', pos: [0.0, -0.8, 0.2], color: '#aa96da' }
  ];

  lobes.forEach(l => {
    const markerGeo = new THREE.SphereGeometry(0.06, 16, 16);
    const markerMat = new THREE.MeshBasicMaterial({ color: l.color });
    const marker = new THREE.Mesh(markerGeo, markerMat);
    marker.position.set(...l.pos);
    marker.userData = { name: l.name };
    scene.add(marker);
    markers.push(marker);

    // Анимация пульсации
    gsap.to(marker.scale, {
      x: 1.5, y: 1.5, z: 1.5,
      duration: 1.5 + Math.random(),
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: Math.random() * 0.5
    });
  });

  // свет
  const amb = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(amb);
  const dir = new THREE.DirectionalLight(0xffffff, 0.8);
  dir.position.set(3, 4, 5);
  scene.add(dir);
  const dir2 = new THREE.DirectionalLight(0x4fc3f7, 0.3);
  dir2.position.set(-2, 1, -3);
  scene.add(dir2);

  // resize
  window.addEventListener('resize', () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });

  animate();
}

function animate() {
  requestAnimationFrame(animate);
  if (controls) controls.update();
  if (lenis) lenis.raf(performance.now());
  if (renderer && scene && camera) {
    // медленное вращение мозга
    if (brainMesh) {
      brainMesh.rotation.y += 0.002;
    }
    renderer.render(scene, camera);
  }
}

/* ==================== 2. Инициализация Lenis ==================== */
function initLenis() {
  if (typeof Lenis === 'undefined') {
    console.warn('Lenis не загружен, используем стандартный скролл');
    return;
  }
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true
  });
  lenis.on('scroll', () => {
    updateProgressBar();
  });
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
}

/* ==================== 3. Счётчики HERO ==================== */
function initCounters() {
  const counters = document.querySelectorAll('.counter');
  counters.forEach(c => {
    const target = parseInt(c.getAttribute('data-target'), 10);
    let current = 0;
    const increment = target / 50;
    const updateCount = () => {
      current += increment;
      if (current < target) {
        c.innerText = Math.ceil(current);
        requestAnimationFrame(updateCount);
      } else {
        c.innerText = target;
      }
    };
    updateCount();
  });
}

/* ==================== 4. Progress bar ==================== */
function updateProgressBar() {
  const htmlHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const pct = htmlHeight > 0 ? Math.min(100, (scrollTop / htmlHeight) * 100) : 0;
  const fill = document.getElementById('progressFill');
  if (fill) {
    fill.style.width = pct + '%';
  }
  const bar = document.getElementById('progressBar');
  if (bar) {
    bar.setAttribute('aria-valuenow', String(Math.round(pct)));
  }
}

/* ==================== 5. Modal passport ==================== */
function initModal() {
  const passportBtn = document.getElementById('passportBtn');
  const modal = document.getElementById('passportModal');
  if (!passportBtn || !modal) return;

  passportBtn.addEventListener('click', () => {
    modal.hidden = false;
    passportBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  });

  modal.addEventListener('click', e => {
    const close = e.target.closest('[data-close="modal"]');
    if (close || e.target === modal) {
      modal.hidden = true;
      passportBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !modal.hidden) {
      modal.hidden = true;
      passportBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
}

/* ==================== 6. Myth cards reveal ==================== */
function initMythCards() {
  document.querySelectorAll('.myth-card .reveal-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.myth-card');
      const truth = card.querySelector('.truth');
      if (truth) {
        truth.classList.toggle('hidden');
        btn.textContent = truth.classList.contains('hidden') ? 'Показать правду' : 'Скрыть правду';
        btn.classList.toggle('active');
      }
    });
  });
}

/* ==================== 7. Chart.js ==================== */
function initChart() {
  const canvas = document.getElementById('chartCanvas');
  if (!canvas) return;
  if (typeof Chart === 'undefined') {
    console.warn('Chart.js не загружен');
    canvas.style.display = 'none';
    return;
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const data = {
    labels: ['Иванов И.', 'Петрова А.', 'Сидоров В.', 'Кузнецова Е.', 'Смирнов Д.'],
    datasets: [{
      label: 'Баллы внимания',
      data: [78, 85, 72, 91, 68],
      backgroundColor: [
        'rgba(79, 195, 247, 0.7)',
        'rgba(79, 195, 247, 0.5)',
        'rgba(79, 195, 247, 0.6)',
        'rgba(79, 195, 247, 0.8)',
        'rgba(79, 195, 247, 0.4)'
      ],
      borderColor: '#4fc3f7',
      borderWidth: 1,
      borderRadius: 4
    }]
  };

  new Chart(ctx, {
    type: 'bar',
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          grid: { color: 'rgba(255,255,255,0.1)' },
          ticks: { color: '#8b92a0' }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#8b92a0' }
        }
      }
    }
  });
}

/* ==================== 8. Stroop experiment ==================== */
let stroopCounter = 0;
let stroopStartTime = 0;
let stroopResults = [];

function initStroop() {
  const stroopBtn = document.getElementById('startStroop');
  const stroopContainer = document.getElementById('stroopContainer');
  const stroopResult = document.getElementById('stroopResult');
  
  if (!stroopBtn || !stroopContainer) return;

  const words = ['КРАСНЫЙ', 'ЗЕЛЁНЫЙ', 'СИНИЙ', 'ЖЁЛТЫЙ'];
  const colors = [
    { name: 'red', hex: '#e74c3c' },
    { name: 'green', hex: '#27ae60' },
    { name: 'blue', hex: '#3498db' },
    { name: 'yellow', hex: '#f1c40f' }
  ];

  function getRandomStroop() {
    const wordIdx = Math.floor(Math.random() * words.length);
    const colorIdx = Math.floor(Math.random() * colors.length);
    return { 
      word: words[wordIdx], 
      color: colors[colorIdx],
      isMatch: wordIdx === colorIdx 
    };
  }

  function renderStroop(stroop) {
    stroopContainer.innerHTML = '';
    const box = document.createElement('div');
    box.className = 'stroop-word';
    box.style.color = stroop.color.hex;
    box.textContent = stroop.word;
    stroopContainer.appendChild(box);

    // кнопки ответа
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'stroop-buttons';
    
    const yesBtn = document.createElement('button');
    yesBtn.className = 'btn btn-yes';
    yesBtn.textContent = 'Цвет совпадает';
    
    const noBtn = document.createElement('button');
    noBtn.className = 'btn btn-no';
    noBtn.textContent = 'Цвет не совпадает';

    buttonsContainer.appendChild(yesBtn);
    buttonsContainer.appendChild(noBtn);
    stroopContainer.appendChild(buttonsContainer);

    const reactionTime = Date.now() - stroopStartTime;

    yesBtn.addEventListener('click', () => {
      const correct = stroop.isMatch;
      handleStroopAnswer(correct, reactionTime);
    });
    noBtn.addEventListener('click', () => {
      const correct = !stroop.isMatch;
      handleStroopAnswer(correct, reactionTime);
    });
  }

  function handleStroopAnswer(correct, reactionTime) {
    stroopResults.push({ correct, reactionTime });
    
    if (correct) {
      showFeedback('Верно!', 'success');
    } else {
      showFeedback('Ошибка!', 'error');
    }

    stroopCounter++;
    if (stroopCounter >= 5) {
      finishStroop();
    } else {
      setTimeout(() => {
        stroopStartTime = Date.now();
        renderStroop(getRandomStroop());
      }, 500);
    }
  }

  function showFeedback(text, type) {
    const feedback = document.createElement('div');
    feedback.className = `stroop-feedback ${type}`;
    feedback.textContent = text;
    stroopContainer.appendChild(feedback);
    setTimeout(() => feedback.remove(), 500);
  }

  function finishStroop() {
    const avgTime = Math.round(stroopResults.reduce((s, r) => s + r.reactionTime, 0) / stroopResults.length);
    const correctCount = stroopResults.filter(r => r.correct).length;
    
    stroopContainer.classList.add('hidden');
    stroopResult.classList.remove('hidden');
    stroopResult.innerHTML = `
      <strong>Эксперимент завершён!</strong><br>
      Правильных ответов: ${correctCount} из 5<br>
      Среднее время реакции: ${avgTime} мс
    `;
    
    // Сохраняем результат для теста
    window.stroopCompleted = true;
    window.stroopScore = correctCount;
    window.stroopAvgTime = avgTime;
  }

  stroopBtn.addEventListener('click', () => {
    stroopBtn.classList.add('hidden');
    stroopContainer.classList.remove('hidden');
    stroopResult.classList.add('hidden');
    stroopCounter = 0;
    stroopResults = [];
    stroopStartTime = Date.now();
    renderStroop(getRandomStroop());
  });
}

/* ==================== 9. Итоговый тест ==================== */
function initTest() {
  const testSection = document.getElementById('test');
  if (!testSection) return;

  const questions = [
    {
      q: 'Сколько нейронов содержит мозг взрослого человека?',
      options: ['86 миллиардов', '10 миллиардов', '1 триллион', '500 миллионов'],
      correct: 0
    },
    {
      q: 'Какая доля мозга отвечает за зрение?',
      options: ['Лобная', 'Теменная', 'Затылочная', 'Височная'],
      correct: 2
    },
    {
      q: 'Правда ли, что мы используем только 10% мозга?',
      options: ['Да', 'Нет', 'Частично', 'Неизвестно'],
      correct: 1
    },
    {
      q: 'Что такое нейропластичность?',
      options: ['Твёрдость мозга', 'Способность меняться', 'Цвет нейронов', 'Скорость сигналов'],
      correct: 1
    },
    {
      q: 'Какой процент энергии тела потребляет мозг?',
      options: ['5%', '20%', '50%', '80%'],
      correct: 1
    }
  ];

  let currentQuestion = 0;
  let score = 0;
  let testCompleted = false;

  function renderQuestion() {
    if (currentQuestion >= questions.length) {
      showTestResults();
      return;
    }

    const q = questions[currentQuestion];
    const testContent = testSection.querySelector('.test-content');
    
    testContent.innerHTML = `
      <div class="question-progress">Вопрос ${currentQuestion + 1} из ${questions.length}</div>
      <h3 class="question-text">${q.q}</h3>
      <div class="options-grid">
        ${q.options.map((opt, i) => `
          <button class="option-btn" data-index="${i}">${opt}</button>
        `).join('')}
      </div>
    `;

    testContent.querySelectorAll('.option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const selected = parseInt(btn.dataset.index, 10);
        if (selected === q.correct) score++;
        currentQuestion++;
        renderQuestion();
      });
    });
  }

  function showTestResults() {
    const testContent = testSection.querySelector('.test-content');
    const percentage = (score / questions.length) * 100;
    
    testContent.innerHTML = `
      <div class="test-results">
        <h3>Результаты теста</h3>
        <div class="score-display">${score} из ${questions.length}</div>
        <div class="score-percent">${percentage}%</div>
        <p class="score-message">${
          percentage >= 80 ? 'Отлично! Вы хорошо разбираетесь в теме.' :
          percentage >= 60 ? 'Хороший результат!' :
          'Стоит повторить материал.'
        }</p>
        <button class="btn retry-btn" onclick="location.reload()">Пройти заново</button>
      </div>
    `;
    testCompleted = true;
  }

  // Создаём контейнер для теста
  const testContent = document.createElement('div');
  testContent.className = 'test-content';
  testSection.appendChild(testContent);

  // Кнопка начала теста
  const startTestBtn = document.createElement('button');
  startTestBtn.className = 'btn start-test-btn';
  startTestBtn.textContent = 'Начать тест';
  startTestBtn.addEventListener('click', () => {
    startTestBtn.classList.add('hidden');
    renderQuestion();
  });
  testSection.appendChild(startTestBtn);
}

/* ==================== 10. Contrast mode ==================== */
function initContrastMode() {
  const contrastToggle = document.getElementById('contrastToggle');
  if (!contrastToggle) return;

  contrastToggle.addEventListener('click', () => {
    const html = document.documentElement;
    const isHigh = html.getAttribute('data-theme') === 'high-contrast';
    html.setAttribute('data-theme', isHigh ? 'dark' : 'high-contrast');
    contrastToggle.setAttribute('aria-pressed', !isHigh);
    contrastToggle.textContent = isHigh ? 'Контрастный режим' : 'Обычный режим';
  });
}

/* ==================== 11. Scroll animations (без ScrollTrigger) ==================== */
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -10% 0px'
  });

  document.querySelectorAll('.section, .hero, .bento-item, .myth-card').forEach(el => {
    el.classList.add('reveal');
    observer.observe(el);
  });
}

/* ==================== 12. Navigation smooth scroll ==================== */
function initNavigation() {
  document.querySelectorAll('.primary-nav a').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const target = document.querySelector(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/* ==================== 13. Fallback для изображений ==================== */
function initImageFallback() {
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', () => {
      img.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM4YjkyYTAiIHN0cm9rZS13aWR0aD0iMS41Ij48cmVjdCB4PSIzIiB5PSIzIiB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHJ4PSIyIi8+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMCIgcj0iMyIvPjxwYXRoIGQ9Ik0zIDE2bDUtNWw0IDRsNS01Ii8+PC9zdmc+';
      img.alt = 'Изображение недоступно';
    });
  });
}

/* ==================== 14. Mobile menu ==================== */
function initMobileMenu() {
  const nav = document.querySelector('.primary-nav');
  if (!nav) return;

  const menuToggle = document.createElement('button');
  menuToggle.className = 'mobile-menu-toggle';
  menuToggle.setAttribute('aria-label', 'Открыть меню');
  menuToggle.innerHTML = `
    <svg viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none">
      <path d="M4 6h16M4 12h16M4 18h16"/>
    </svg>
  `;
  
  menuToggle.addEventListener('click', () => {
    nav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', nav.classList.contains('open'));
  });

  // Добавляем кнопку в шапку
  const header = document.querySelector('.site-header');
  if (header) {
    header.insertBefore(menuToggle, nav);
  }
}

/* ==================== Инициализация при загрузке ==================== */
document.addEventListener('DOMContentLoaded', () => {
  // Порядок важен: сначала Lenis, потом Three.js
  initLenis();
  initThree();
  initCounters();
  initModal();
  initMythCards();
  initChart();
  initStroop();
  initTest();
  initContrastMode();
  initScrollAnimations();
  initNavigation();
  initImageFallback();
  initMobileMenu();
  
  // Начальное обновление прогресс-бара
  updateProgressBar();
});

// ------------------------------------------------------------
// Конец скрипта. Все элементы готовы к двойному клику по index.html
// ------------------------------------------------------------
