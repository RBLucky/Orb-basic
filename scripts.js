"use strict"

// Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Geometry and Material for Particles
const particleCount = 1000; // Number of particles
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3); // x, y, z for each particle

// Generate random points on a sphere
const radius = 5;
for (let i = 0; i < particleCount; i++) {
  const phi = Math.acos(2 * Math.random() - 1); // Polar angle
  const theta = 2 * Math.PI * Math.random(); // Azimuthal angle

  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.sin(phi) * Math.sin(theta);
  const z = radius * Math.cos(phi);

  positions[i * 3] = x;
  positions[i * 3 + 1] = y;
  positions[i * 3 + 2] = z;
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

// Material for particles
const material = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.1,
});

// Create particle system
const particleSystem = new THREE.Points(geometry, material);
scene.add(particleSystem);

// Camera position
camera.position.z = 10;

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Rotate the particle sphere
  particleSystem.rotation.y += 0.002;

  renderer.render(scene, camera);
}
animate();