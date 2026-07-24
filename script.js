const landscape = [
  '主画面延展-01.jpg','微信稿-01_10.jpg','微信稿-01_11.jpg','微信稿-02_7.jpg','微信稿-02_8.jpg','2-04.jpg','微信稿-01_2.jpg','微信稿-02_2.jpg','微信稿-03_2.jpg','视频-03.jpg','1017主画面-01.jpg','主画面-01.jpg','微信稿-01_12.jpg','主画面-02.jpg','微信稿-01_8.jpg','2-01.jpg','微信稿第二套-03.jpg','1-01_1.jpg','1-02_1.jpg','1-03_1.jpg','1-04_1.jpg'
];
const portrait = [
  '1-05.jpg','1-06.jpg','2-02.jpg','2-03.jpg','2微信稿_郑克波 副本 10.jpg','42543543.jpg','城市区域-01_1.jpg','城市区域-01_2.jpg','城市区域-02_1.jpg','城市区域-02_2.jpg','城市区域-03_1.jpg','老带新_画板 1 副本 2.jpg','老带新_画板 1 副本.jpg','老带新_画板 1.jpg','刷屏-01.jpg','刷屏-02.jpg','刷屏-03.jpg','刷屏-05.jpg','微信稿_画板 副本 4.jpg','微信稿_画板 副本 5.jpg','微信稿_画板.jpg','微信稿_郑克波 副本 4.jpg','微信稿-02 (4).jpg','微信稿-02.jpg','微信稿-02_1.jpg','微信稿-03.jpg','微信稿-03_1.jpg','微信稿-04.jpg','微信稿1.jpg','微信稿1_画板 副本 13.jpg','微信稿1-02.jpg','微信稿1-03.jpg','微信稿1-04.jpg','新区域-03.jpg','知乎-正稿-01.jpg','知乎-正稿-02.jpg','知乎-正稿-03.jpg','1小红书实景图-01.jpg','2小红书实景图-06.jpg','3小红书实景图-04.jpg','5小红书实景图-01.jpg','小红书实景图-03.jpg','1小红书-01 (2).jpg','1小红书-01.jpg','1小红书-02.jpg','1小红书-03.jpg','1小红书-04.jpg','1小红书-05.jpg','1小红书-06.jpg','1小红书-07.jpg','1小红书-08.jpg','1小红书-09.jpg','1小红书-10.jpg','3小红书_1 副本 21.jpg','小红书-01.jpg','小红书-02.jpg'
];
function makeTrack(id, images) {
  const track = document.getElementById(id);
  if (!track) return;
  const items = [...images, ...images];
  track.innerHTML = items.map((name, index) => `<figure class="art-card"><img src="images/${encodeURIComponent(name)}" alt="作品 ${index % images.length + 1}" loading="lazy" decoding="async"></figure>`).join('');
}
makeTrack('landscapeTrack', landscape);
makeTrack('portraitTrack', portrait);
const motionObserver = new IntersectionObserver((entries) => {
  entries.forEach(({ target, isIntersecting }) => {
    const video = target.querySelector('video');
    if (!video) return;
    if (isIntersecting) video.play().catch(() => {});
    else video.pause();
  });
}, { root: document.querySelector('.film-rail'), threshold: 0.55 });
document.querySelectorAll('.film-card').forEach((card) => motionObserver.observe(card));
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add('is-visible'); });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
const cursorGrid = document.querySelector('.cursor-grid');
const cursorContext = cursorGrid?.getContext('2d');
if (cursorGrid && cursorContext) {
  const cellSize = 70;
  const radius = 140;
  const holdTime = 400;
  const fadeDuration = 800;
  const color = [6, 2, 202];
  let cols = 0, rows = 0, offX = 0, offY = 0, width = 0, height = 0, frame = 0, lastFrame = 0, active = false;
  let alphas = new Float32Array();
  let touched = new Float64Array();
  const pulses = [];
  function rebuildGrid() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    width = innerWidth; height = innerHeight;
    cursorGrid.width = Math.round(width * dpr); cursorGrid.height = Math.round(height * dpr);
    cursorContext.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.ceil(width / cellSize) + 1; rows = Math.ceil(height / cellSize) + 1;
    offX = (width - cols * cellSize) / 2; offY = (height - rows * cellSize) / 2;
    alphas = new Float32Array(cols * rows); touched = new Float64Array(cols * rows);
  }
  function center(index) { return [offX + (index % cols) * cellSize + cellSize / 2, offY + Math.floor(index / cols) * cellSize + cellSize / 2]; }
  function energize(x, y, boost = 1) {
    const now = performance.now();
    const minCol = Math.max(0, Math.floor((x - radius - offX) / cellSize));
    const maxCol = Math.min(cols - 1, Math.floor((x + radius - offX) / cellSize));
    const minRow = Math.max(0, Math.floor((y - radius - offY) / cellSize));
    const maxRow = Math.min(rows - 1, Math.floor((y + radius - offY) / cellSize));
    for (let row = minRow; row <= maxRow; row++) for (let col = minCol; col <= maxCol; col++) {
      const index = row * cols + col; const [cx, cy] = center(index); const distance = Math.hypot(cx - x, cy - y);
      if (distance > radius) continue;
      const t = 1 - distance / radius; const level = (t * t * (3 - 2 * t)) * boost;
      if (level >= alphas[index]) alphas[index] = level;
      touched[index] = now;
    }
  }
  function wake() { if (!active) { active = true; lastFrame = performance.now(); frame = requestAnimationFrame(draw); } }
  function draw(now) {
    const dt = Math.min(now - lastFrame, 50); lastFrame = now; cursorContext.clearRect(0, 0, width, height);
    const pulseSpeed = 600;
    for (let pulseIndex = pulses.length - 1; pulseIndex >= 0; pulseIndex--) {
      const pulse = pulses[pulseIndex]; const ring = (now - pulse.time) / 1000 * pulseSpeed;
      if (ring > Math.hypot(width, height)) { pulses.splice(pulseIndex, 1); continue; }
      for (let index = 0; index < alphas.length; index++) { const [cx, cy] = center(index); if (Math.abs(Math.hypot(cx - pulse.x, cy - pulse.y) - ring) < cellSize * 0.45) { alphas[index] = 1; touched[index] = now; } }
    }
    let visible = pulses.length > 0;
    for (let index = 0; index < alphas.length; index++) {
      let alpha = alphas[index]; if (!alpha) continue;
      if (now - touched[index] > holdTime) { alpha = Math.max(0, alpha - dt / fadeDuration); alphas[index] = alpha; }
      if (!alpha) continue; visible = true;
      const [cx, cy] = center(index); const half = cellSize / 2; const gradient = cursorContext.createRadialGradient(cx, cy, 2, cx, cy, cellSize);
      gradient.addColorStop(0, `rgba(${color.join(',')},${alpha})`); gradient.addColorStop(1, `rgba(${color.join(',')},0)`);
      cursorContext.strokeStyle = gradient; cursorContext.lineWidth = 1.2; cursorContext.strokeRect(cx - half + 0.5, cy - half + 0.5, cellSize - 1, cellSize - 1);
    }
    if (visible) frame = requestAnimationFrame(draw); else active = false;
  }
  rebuildGrid();
  addEventListener('resize', rebuildGrid, { passive: true });
  addEventListener('pointermove', (event) => { energize(event.clientX, event.clientY); wake(); }, { passive: true });
  addEventListener('pointerdown', (event) => { pulses.push({ x: event.clientX, y: event.clientY, time: performance.now() }); wake(); }, { passive: true });
}
const galaxy = document.querySelector('.galaxy-canvas');
const galaxySection = document.querySelector('.skills');
const galaxyContext = galaxy?.getContext('2d');
if (galaxy && galaxySection && galaxyContext) {
  let stars = [], galaxyFrame = 0, galaxyVisible = false, galaxyStart = performance.now();
  const pointer = { x: 0.5, y: 0.5 };
  function makeGalaxy() {
    const rect = galaxySection.getBoundingClientRect(); const dpr = Math.min(devicePixelRatio || 1, 2);
    galaxy.width = Math.max(1, Math.round(rect.width * dpr)); galaxy.height = Math.max(1, Math.round(rect.height * dpr));
    galaxyContext.setTransform(dpr, 0, 0, dpr, 0, 0);
    const amount = Math.min(260, Math.max(120, Math.round(rect.width * rect.height / 7500)));
    stars = Array.from({ length: amount }, () => {
      const arm = Math.floor(Math.random() * 4); const distance = Math.pow(Math.random(), 0.64) * 0.72 + 0.03;
      return { arm, distance, spread: (Math.random() - 0.5) * 0.35, size: Math.random() * 1.7 + 0.35, glow: Math.random() * 0.7 + 0.2, twinkle: Math.random() * Math.PI * 2 };
    });
  }
  function drawGalaxy(now) {
    if (!galaxyVisible) return;
    const rect = galaxySection.getBoundingClientRect(); const w = rect.width, h = rect.height;
    galaxyContext.clearRect(0, 0, w, h);
    const time = (now - galaxyStart) * 0.00008; const centerX = w * (0.64 + (pointer.x - 0.5) * 0.035); const centerY = h * (0.45 + (pointer.y - 0.5) * 0.035);
    for (const star of stars) {
      const angle = star.arm * Math.PI / 2 + star.distance * 7.2 + time * (1.5 - star.distance) + star.spread;
      const radiusX = star.distance * w * 0.6; const radiusY = star.distance * h * 0.24;
      const x = centerX + Math.cos(angle) * radiusX; const y = centerY + Math.sin(angle) * radiusY;
      const alpha = star.glow * (0.55 + Math.sin(now * 0.0015 + star.twinkle) * 0.25);
      const color = star.distance > 0.48 ? '170,183,255' : '94,112,255';
      galaxyContext.beginPath(); galaxyContext.fillStyle = `rgba(${color},${alpha * 0.45})`; galaxyContext.arc(x, y, star.size * 3.2, 0, Math.PI * 2); galaxyContext.fill();
      galaxyContext.beginPath(); galaxyContext.fillStyle = `rgba(210,218,255,${alpha})`; galaxyContext.arc(x, y, star.size, 0, Math.PI * 2); galaxyContext.fill();
    }
    galaxyFrame = requestAnimationFrame(drawGalaxy);
  }
  new ResizeObserver(makeGalaxy).observe(galaxySection);
  new IntersectionObserver(([entry]) => { galaxyVisible = entry.isIntersecting; if (galaxyVisible) { cancelAnimationFrame(galaxyFrame); galaxyFrame = requestAnimationFrame(drawGalaxy); } }, { threshold: 0.08 }).observe(galaxySection);
  galaxySection.addEventListener('pointermove', (event) => { const rect = galaxySection.getBoundingClientRect(); pointer.x = (event.clientX - rect.left) / rect.width; pointer.y = (event.clientY - rect.top) / rect.height; }, { passive: true });
  makeGalaxy();
}
