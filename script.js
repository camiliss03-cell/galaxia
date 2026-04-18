// ---------- ESCENA ----------
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
75,
window.innerWidth / window.innerHeight,
0.1,
2000
);

camera.position.set(0, 15, 80);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ---------- GALAXIA ----------
const params = {
  count: 26000,
  size: 0.035,
  radius: 18,
  branches: 4,
  spin: 1.4,
};

const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(params.count * 3);
const colors = new Float32Array(params.count * 3);

const insideColor = new THREE.Color("#ffd6a8");
const outsideColor = new THREE.Color("#5a00ff");

for (let i = 0; i < params.count; i++) {

  const i3 = i * 3;
  const r = Math.pow(Math.random(), 1.5) * params.radius;

  const branchAngle =
    (i % params.branches) / params.branches * Math.PI * 2;

  const spinAngle = r * params.spin;
  const angle = branchAngle + spinAngle;

  positions[i3] = Math.cos(angle) * r;
  positions[i3 + 1] = (Math.random() - 0.5) * 1.2;
  positions[i3 + 2] = Math.sin(angle) * r;

  const mixed = insideColor.clone();
  mixed.lerp(outsideColor, r / params.radius);

  colors[i3] = mixed.r;
  colors[i3 + 1] = mixed.g;
  colors[i3 + 2] = mixed.b;
}

geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

const material = new THREE.PointsMaterial({
  size: params.size,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  vertexColors: true
});

const galaxy = new THREE.Points(geometry, material);
galaxy.rotation.x = 0.35;
scene.add(galaxy);

// ---------- FOTOS ----------
const loader = new THREE.TextureLoader();

const textures = [
  loader.load("images/foto1.jpg"),
  loader.load("images/foto2.jpg")
];

const photoGroup = new THREE.Group();
scene.add(photoGroup);

for (let i = 0; i < 120; i++) {

  const tex = textures[Math.floor(Math.random() * textures.length)];

  const mat = new THREE.SpriteMaterial({
    map: tex,
    transparent: true
  });

  const sp = new THREE.Sprite(mat);

  const r = 6 + Math.random() * 12;
  const angle = Math.random() * Math.PI * 2;

  sp.position.set(
    Math.cos(angle) * r,
    (Math.random() - 0.5) * 2,
    Math.sin(angle) * r
  );

  const scale = Math.random() * 0.6 + 0.7;
  sp.scale.set(scale, scale, 1);

  photoGroup.add(sp);
}

// ---------- LUZ ----------
const coreLight = new THREE.PointLight(0xffffff, 0, 50);
scene.add(coreLight);

// ---------- ONDA ----------
const ringGeo = new THREE.RingGeometry(1, 1.5, 64);
const ringMat = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0,
  side: THREE.DoubleSide
});

const shockwave = new THREE.Mesh(ringGeo, ringMat);
shockwave.rotation.x = Math.PI / 2;
scene.add(shockwave);

// ---------- FADE ----------
const fadeGeo = new THREE.PlaneGeometry(200, 200);
const fadeMat = new THREE.MeshBasicMaterial({
  color: 0x000000,
  transparent: true,
  opacity: 0
});

const fade = new THREE.Mesh(fadeGeo, fadeMat);
fade.position.z = -1;
scene.add(fade);

// ---------- TEXTO FINAL ----------
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 1024;
canvas.height = 512;

ctx.fillStyle = "#ffffff";
ctx.shadowColor = "#ff66ff";
ctx.shadowBlur = 40;
ctx.font = "bold 80px Arial";
ctx.textAlign = "center";

// 🔥 CAMBIO AQUÍ
ctx.fillText("Feliz cumpleaños <3", 512, 260);

const finalMat = new THREE.SpriteMaterial({
  map: new THREE.CanvasTexture(canvas),
  transparent: true,
  opacity: 0
});

const finalText = new THREE.Sprite(finalMat);
finalText.scale.set(60, 30, 1);
scene.add(finalText);

// ---------- ANIMACIÓN ----------
let phase = 0;
let t = 0;

function animate() {
  requestAnimationFrame(animate);

  t += 0.01;

  if (phase === 0) {
    camera.position.lerp(new THREE.Vector3(0, 6, 20), 0.02);
    camera.lookAt(0, 0, 0);

    if (camera.position.z < 22) {
      phase = 1;
      t = 0;
    }
  }

  else if (phase === 1) {
    const r = 20;

    camera.position.x = Math.cos(t * 0.5) * r;
    camera.position.z = Math.sin(t * 0.5) * r;
    camera.position.y = 6;

    camera.lookAt(0, 0, 0);

    if (t > 10) {
      phase = 2;
      t = 0;
    }
  }

  else if (phase === 2) {
    camera.position.lerp(new THREE.Vector3(0, 2, 6), 0.03);
    camera.lookAt(0, 0, 0);

    coreLight.intensity = t * 8;

    if (t > 2) {
      phase = 3;
      t = 0;
    }
  }

  else if (phase === 3) {
    camera.position.z += 0.8;

    if (camera.position.z > 60) {
      phase = 4;
      t = 0;
    }
  }

  else if (phase === 4) {
    shockwave.scale.setScalar(1 + t * 15);
    ringMat.opacity = Math.max(0, 1 - t * 0.5);

    galaxy.scale.setScalar(1 + t * 0.8);

    // 🔥 HACER QUE LAS FOTOS DESAPAREZCAN
    photoGroup.children.forEach(p => {
      p.material.opacity = Math.max(0, 1 - t);
    });

    if (t > 2) {
      phase = 5;
      t = 0;
    }
  }

  else if (phase === 5) {
    fadeMat.opacity = Math.min(1, t * 0.6);

    if (t > 1) {
      finalMat.opacity = Math.min(1, finalMat.opacity + 0.02);
    }
  }

  renderer.render(scene, camera);
}

animate();

// ---------- RESPONSIVE ----------
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});