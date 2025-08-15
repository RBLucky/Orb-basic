// --- SETUP ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const canvas = document.querySelector("#bg-canvas");
const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true,
  antialias: true,
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(5);

// --- GUI & SETTINGS ---
const gui = new lil.GUI({ title: "Scene Customizer" });
let model, sphereMaterial, metalMaterial;

const settings = {
  backgroundColor: "#111111",
  sphere: { color: "#ffffff", roughness: 0.8, metalness: 0.1 },
  metal: { color: "#FFD700", roughness: 0.2, metalness: 1.0 },
};

// --- LIGHTING ---
const keyLight = new THREE.PointLight(0xffffff, 2);
keyLight.position.set(0, 5, -9);
const fillLight = new THREE.PointLight(0xffffff, 2);
fillLight.position.set(0, 3, 10);
const backLight = new THREE.PointLight(0xffffff, 0.5);
backLight.position.set(8, -5, -9);
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(keyLight, fillLight, backLight, ambientLight);

// --- MODEL LOADING ---
const loader = new THREE.GLTFLoader();
loader.load("models/sphere_ring.glb", (gltf) => {
  model = gltf.scene;

  sphereMaterial = new THREE.MeshStandardMaterial(settings.sphere);
  metalMaterial = new THREE.MeshStandardMaterial(settings.metal);

  model.traverse((child) => {
    if (child.isMesh) {
      child.material =
        child.name === "Sphere" || child.name === "Sphere_1"
          ? sphereMaterial
          : metalMaterial;
    }
  });

  // Set initial off-screen state
  model.position.y = -10;
  model.rotation.x = 0.5;
  model.rotation.z = -0.5;
  scene.add(model);

  // Animate model into view
  gsap.to(model.position, {
    y: 0,
    duration: 2.5,
    ease: "power3.out",
    delay: 0.2,
  });
  gsap.to(model.rotation, {
    x: 0,
    z: 0,
    duration: 3,
    ease: "power3.out",
    delay: 0.2,
  });

  setupGUI();
});

// --- INTERACTION (CLICK & DRAG) --- // --- FIX STARTS HERE ---
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
const toRadians = (angle) => angle * (Math.PI / 180);
const rotationSpeed = 0.3; // Slightly reduced speed for better control

const onMouseDown = (e) => {
  isDragging = true;
  // Use clientX/clientY for consistent coordinates across the window
  previousMousePosition = { x: e.clientX, y: e.clientY };
};

const onMouseUp = () => {
  isDragging = false;
};

const onMouseMove = (e) => {
  if (!isDragging || !model) return;

  const deltaMove = {
    x: e.clientX - previousMousePosition.x,
    y: e.clientY - previousMousePosition.y,
  };

  model.rotation.y += toRadians(deltaMove.x * rotationSpeed);
  model.rotation.x += toRadians(deltaMove.y * rotationSpeed);

  // Update previous position for the next movement calculation
  previousMousePosition = { x: e.clientX, y: e.clientY };
};

// Attach listeners
canvas.addEventListener("mousedown", onMouseDown);
window.addEventListener("mouseup", onMouseUp);
window.addEventListener("mousemove", onMouseMove);
// --- FIX ENDS HERE ---

// --- GUI SETUP FUNCTION ---
function setupGUI() {
  // (This function is correct and unchanged)
  const sceneFolder = gui.addFolder("Scene & Background").close();
  sceneFolder.addColor(settings, "backgroundColor").onChange((value) => {
    document.body.style.backgroundColor = value;
  });

  const materialsFolder = gui.addFolder("Materials");
  const sphereFolder = materialsFolder.addFolder("Sphere");
  sphereFolder
    .addColor(settings.sphere, "color")
    .onChange((v) => sphereMaterial.color.set(v));
  sphereFolder
    .add(settings.sphere, "roughness", 0, 1)
    .onChange((v) => (sphereMaterial.roughness = v));
  sphereFolder
    .add(settings.sphere, "metalness", 0, 1)
    .onChange((v) => (sphereMaterial.metalness = v));

  const metalFolder = materialsFolder.addFolder("Metal Parts");
  metalFolder
    .addColor(settings.metal, "color")
    .onChange((v) => metalMaterial.color.set(v));
  metalFolder
    .add(settings.metal, "roughness", 0, 1)
    .onChange((v) => (metalMaterial.roughness = v));
  metalFolder
    .add(settings.metal, "metalness", 0, 1)
    .onChange((v) => (metalMaterial.metalness = v));

  const lightFolder = gui.addFolder("Lighting");
  const addLightControls = (folderName, light) => {
    const subFolder = lightFolder.addFolder(folderName);
    subFolder.add(light, "intensity", 0, 10).name("Intensity");
    subFolder.addColor(light, "color").name("Color");
    subFolder.add(light.position, "x", -20, 20).name("Position X");
    subFolder.add(light.position, "y", -20, 20).name("Position Y");
    subFolder.add(light.position, "z", -20, 20).name("Position Z");
  };
  addLightControls("Key Light", keyLight);
  addLightControls("Fill Light", fillLight);
  addLightControls("Back Light", backLight);
  lightFolder.add(ambientLight, "intensity", 0, 2).name("Ambient Light");

  const cameraFolder = gui.addFolder("Camera").close();
  cameraFolder.add(camera.position, "z", 1, 20).name("Zoom");
  cameraFolder
    .add(camera, "fov", 20, 120)
    .name("Field of View")
    .onChange(() => camera.updateProjectionMatrix());
}

// --- RENDER LOOP ---
function animate() {
  requestAnimationFrame(animate);
  // Subtle continuous rotation when not dragging
  if (model && !isDragging) {
    model.rotation.y += 0.0005;
  }
  renderer.render(scene, camera);
}
animate();

// --- RESIZE HANDLER ---
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
});
