import * as THREE from 'three';

// ===== THREE.JS BACKGROUND SCENE =====
const canvas = document.getElementById('bg-canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 30;

const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Fog for depth
scene.fog = new THREE.FogExp2(0x0a0a14, 0.015);

// ===== LIGHTING =====
const ambient = new THREE.AmbientLight(0x404060, 0.5);
scene.add(ambient);

const dirLight = new THREE.DirectionalLight(0x6c63ff, 1);
dirLight.position.set(5, 10, 7);
scene.add(dirLight);

const pointLight1 = new THREE.PointLight(0x00d4ff, 2, 50);
pointLight1.position.set(-15, 5, 10);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0xff3d8b, 1.5, 50);
pointLight2.position.set(15, -5, 5);
scene.add(pointLight2);

// ===== FLOATING GEOMETRIC SHAPES =====
const shapes = [];
const geometries = [
  new THREE.IcosahedronGeometry(1.5, 0),
  new THREE.OctahedronGeometry(1.3, 0),
  new THREE.TorusGeometry(1.2, 0.4, 16, 32),
  new THREE.BoxGeometry(1.8, 1.8, 1.8),
  new THREE.ConeGeometry(1.2, 2, 6),
  new THREE.DodecahedronGeometry(1.3, 0),
  new THREE.TorusKnotGeometry(0.9, 0.3, 64, 8),
  new THREE.TetrahedronGeometry(1.6, 0),
];

const materials = [
  new THREE.MeshStandardMaterial({ color: 0x6c63ff, metalness: 0.4, roughness: 0.3, wireframe: false, transparent: true, opacity: 0.85 }),
  new THREE.MeshStandardMaterial({ color: 0x00d4ff, metalness: 0.5, roughness: 0.2, transparent: true, opacity: 0.75 }),
  new THREE.MeshStandardMaterial({ color: 0xff3d8b, metalness: 0.3, roughness: 0.4, transparent: true, opacity: 0.7 }),
  new THREE.MeshStandardMaterial({ color: 0x6c63ff, metalness: 0.6, roughness: 0.1, wireframe: true, transparent: true, opacity: 0.5 }),
  new THREE.MeshStandardMaterial({ color: 0x00d4ff, metalness: 0.2, roughness: 0.5, wireframe: true, transparent: true, opacity: 0.4 }),
];

for (let i = 0; i < 28; i++) {
  const geo = geometries[i % geometries.length];
  const mat = materials[i % materials.length];
  const mesh = new THREE.Mesh(geo, mat);

  mesh.position.x = (Math.random() - 0.5) * 60;
  mesh.position.y = (Math.random() - 0.5) * 40;
  mesh.position.z = (Math.random() - 0.5) * 30 - 5;

  mesh.userData = {
    rotSpeedX: (Math.random() - 0.5) * 0.01,
    rotSpeedY: (Math.random() - 0.5) * 0.01,
    rotSpeedZ: (Math.random() - 0.5) * 0.005,
    floatSpeed: Math.random() * 0.5 + 0.3,
    floatOffset: Math.random() * Math.PI * 2,
    baseY: mesh.position.y,
    baseX: mesh.position.x,
    parallaxFactor: Math.random() * 0.5 + 0.2,
  };

  scene.add(mesh);
  shapes.push(mesh);
}

// ===== PARTICLE FIELD =====
const particleCount = 800;
const particleGeo = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
  positions[i * 3] = (Math.random() - 0.5) * 80;
  positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 40;

  const c = Math.random();
  if (c < 0.4) { colors[i * 3] = 0.42; colors[i * 3 + 1] = 0.39; colors[i * 3 + 2] = 1; }
  else if (c < 0.7) { colors[i * 3] = 0; colors[i * 3 + 1] = 0.83; colors[i * 3 + 2] = 1; }
  else { colors[i * 3] = 1; colors[i * 3 + 1] = 0.24; colors[i * 3 + 2] = 0.55; }
}

particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const particleMat = new THREE.PointsMaterial({
  size: 0.15,
  vertexColors: true,
  transparent: true,
  opacity: 0.6,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});

const particles = new THREE.Points(particleGeo, particleMat);
scene.add(particles);

// ===== MOUSE TRACKING =====
let mouseX = 0, mouseY = 0;
let targetX = 0, targetY = 0;

window.addEventListener('mousemove', (e) => {
  mouseX = (e.clientX / window.innerWidth) * 2 - 1;
  mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
});

// ===== SCROLL TRACKING =====
let scrollY = 0;
window.addEventListener('scroll', () => {
  scrollY = window.scrollY;
});

// ===== ANIMATION LOOP =====
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  targetX += (mouseX - targetX) * 0.05;
  targetY += (mouseY - targetY) * 0.05;

  shapes.forEach((mesh) => {
    mesh.rotation.x += mesh.userData.rotSpeedX;
    mesh.rotation.y += mesh.userData.rotSpeedY;
    mesh.rotation.z += mesh.userData.rotSpeedZ;

    mesh.position.y = mesh.userData.baseY + Math.sin(t * mesh.userData.floatSpeed + mesh.userData.floatOffset) * 1.5;
    mesh.position.x = mesh.userData.baseX + Math.cos(t * mesh.userData.floatSpeed * 0.7 + mesh.userData.floatOffset) * 0.8;
  });

  particles.rotation.y = t * 0.02;
  particles.rotation.x = t * 0.01;

  // Camera follows mouse + scroll
  camera.position.x = targetX * 5;
  camera.position.y = targetY * 3 - scrollY * 0.01;
  camera.lookAt(0, 0, 0);

  // Move lights
  pointLight1.position.x = Math.sin(t * 0.5) * 20;
  pointLight1.position.y = Math.cos(t * 0.3) * 10;
  pointLight2.position.x = Math.cos(t * 0.4) * 20;
  pointLight2.position.y = Math.sin(t * 0.6) * 10;

  renderer.render(scene, camera);
}
animate();

// ===== RESIZE =====
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ===== NAV SCROLL =====
const nav = document.getElementById('nav');
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');

  let current = '';
  sections.forEach(sec => {
    const top = sec.offsetTop - 100;
    if (window.scrollY >= top) current = sec.id;
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) link.classList.add('active');
  });
});

// ===== MOBILE NAV =====
const navToggle = document.getElementById('navToggle');
const navLinksEl = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  navLinksEl.classList.toggle('open');
});

navLinksEl.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinksEl.classList.remove('open'));
});

// ===== 3D CARD TILT =====
document.querySelectorAll('.card-3d').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotX = ((y - cy) / cy) * -12;
    const rotY = ((x - cx) / cx) * 12;

    card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(10px)`;
    card.style.setProperty('--mx', `${(x / rect.width) * 100}%`);
    card.style.setProperty('--my', `${(y / rect.height) * 100}%`);
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// ===== SERVICE & PROJECT & TEAM CARD PARALLAX =====
document.querySelectorAll('.service-card, .project-card, .team-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotX = ((y - cy) / cy) * -8;
    const rotY = ((x - cx) / cx) * 8;
    card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(15px)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// ===== SCROLL REVEAL =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ===== COUNTER ANIMATION =====
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = +el.dataset.target;
      let current = 0;
      const increment = Math.ceil(target / 60);

      function countUp() {
        current += increment;
        if (current < target) {
          el.textContent = current;
          requestAnimationFrame(countUp);
        } else {
          el.textContent = target + '+';
        }
      }
      countUp();
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number').forEach(el => counterObserver.observe(el));

// ===== CONTACT FORM =====
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  formSuccess.classList.add('show');
  contactForm.reset();
  setTimeout(() => formSuccess.classList.remove('show'), 5000);
});

// ===== NEWSLETTER FORM =====
const newsletterForm = document.getElementById('newsletterForm');
newsletterForm.addEventListener('submit', (e) => {
  e.preventDefault();
  newsletterForm.reset();
  const btn = newsletterForm.querySelector('button');
  const original = btn.textContent;
  btn.textContent = '\u2713';
  setTimeout(() => { btn.textContent = original; }, 2000);
});
