"use strict";

// Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("canvas"),
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let particleSystem;

function createParticles(shape = "sphere", count = 1000) {
  if (particleSystem) {
    scene.remove(particleSystem);
  }

  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);

  const radius = 5;

  for (let i = 0; i < count; i++) {
    if (shape === "sphere") {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = 2 * Math.PI * Math.random();
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    } else if (shape === "cube") {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    } else if (shape === "torus") {
      const tubeRadius = 1.5;
      const u = Math.random() * Math.PI * 2;
      const v = Math.random() * Math.PI * 2;
      positions[i * 3] = (radius + tubeRadius * Math.cos(v)) * Math.cos(u);
      positions[i * 3 + 1] = (radius + tubeRadius * Math.cos(v)) * Math.sin(u);
      positions[i * 3 + 2] = tubeRadius * Math.sin(v);
    }
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.1,
  });

  particleSystem = new THREE.Points(geometry, material);
  scene.add(particleSystem);
}

createParticles();

camera.position.z = 15;

// --- Interactivity ---
let isMouseDown = false;
let previousMousePosition = { x: 0, y: 0 };
let rotationSpeed = 0.002;
let pulseEnabled = false;

renderer.domElement.addEventListener("mousedown", (e) => {
  isMouseDown = true;
});
renderer.domElement.addEventListener("mouseup", (e) => {
  isMouseDown = false;
});
renderer.domElement.addEventListener("mousemove", (e) => {
  if (!isMouseDown) return;
  const deltaX = e.clientX - previousMousePosition.x;
  const deltaY = e.clientY - previousMousePosition.y;
  particleSystem.rotation.y += deltaX * 0.005;
  particleSystem.rotation.x += deltaY * 0.005;
  previousMousePosition = { x: e.clientX, y: e.clientY };
});
renderer.domElement.addEventListener("wheel", (e) => {
  camera.position.z += e.deltaY * 0.01;
});

// --- Customizer ---
document
  .getElementById("shape")
  .addEventListener("change", (e) =>
    createParticles(
      e.target.value,
      particleSystem.geometry.attributes.position.count
    )
  );
document
  .getElementById("bgColor")
  .addEventListener("input", (e) => renderer.setClearColor(e.target.value));
document
  .getElementById("particleColor")
  .addEventListener("input", (e) =>
    particleSystem.material.color.set(e.target.value)
  );
document
  .getElementById("particleSize")
  .addEventListener(
    "input",
    (e) => (particleSystem.material.size = parseFloat(e.target.value))
  );
document
  .getElementById("particleCount")
  .addEventListener("input", (e) =>
    createParticles(
      document.getElementById("shape").value,
      parseInt(e.target.value)
    )
  );
document
  .getElementById("rotationSpeed")
  .addEventListener(
    "input",
    (e) => (rotationSpeed = parseFloat(e.target.value))
  );
document
  .getElementById("fog")
  .addEventListener(
    "change",
    (e) =>
      (scene.fog = e.target.checked ? new THREE.Fog(0x000000, 10, 25) : null)
  );
document
  .getElementById("pulse")
  .addEventListener("change", (e) => (pulseEnabled = e.target.checked));

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  if (!isMouseDown) {
    particleSystem.rotation.y += rotationSpeed;
  }
  if (pulseEnabled) {
    const time = clock.getElapsedTime();
    particleSystem.material.size = Math.abs(Math.sin(time)) * 0.2 + 0.05;
  }

  renderer.render(scene, camera);
}
animate();
