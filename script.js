// Neo Synth City: 2179 - Enhanced Edition
// Global variables
let scene, camera, renderer;
let city, smoke, town, buildings = [];
let raycaster, mouse, selectedBuilding = null;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let prevTime = performance.now();
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();
let labels = [];
let currentMode = 'free'; // 'free' or 'fly'
let clock = new THREE.Clock();
let buildingCount = 100;
let isMobile = window.innerWidth <= 768;

// Random function
function mathRandom(num = 8) {
  var numValue = - Math.random() * num + Math.random() * num;
  return numValue;
}

// Building color function
var setTintNum = true;
function setTintColor() {
  if (setTintNum) {
    setTintNum = false;
    var setColor = 0x000000;
  } else {
    setTintNum = true;
    var setColor = 0x000000;
  };
  return setColor;
}

// Basic setup
function init() {
  // Create scene
  scene = new THREE.Scene();
  const setcolor = 0x263238;
  scene.background = new THREE.Color(setcolor);
  scene.fog = new THREE.FogExp2(setcolor, 0.05);
  
  // Create renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);
  
  // Create camera
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 8, 20);
  
  // Create object containers
  city = new THREE.Object3D();
  smoke = new THREE.Object3D();
  town = new THREE.Object3D();
  
  // Setup raycaster for building selection
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();
  
  // Setup lighting
  setupLighting();
  
  // Add event listeners
  window.addEventListener('resize', onWindowResize);
  window.addEventListener('mousemove', onMouseMove);
  
  // Add city to scene
  scene.add(city);
  city.add(smoke);
  city.add(town);
}

// Setup lighting for the scene
function setupLighting() {
  // Ambient light
  const ambientLight = new THREE.AmbientLight(0xb2ebf2, 1);
  scene.add(ambientLight);
  
  // Main front light
  const lightFront = new THREE.SpotLight(0xb2ebf2, 2.5, 50, Math.PI / 4, 0.5, 1);
  lightFront.position.set(5, 15, 5);
  lightFront.castShadow = true;
  lightFront.shadow.mapSize.width = 2048;
  lightFront.shadow.mapSize.height = 2048;
  city.add(lightFront);
  
  // Back light
  const lightBack = new THREE.PointLight(0x7B68EE, 1, 50);
  lightBack.position.set(-10, 15, -5);
  city.add(lightBack);
  
  // Ground light
  const groundLight = new THREE.PointLight(0x00FFFF, 0.8, 30);
  groundLight.position.set(0, 0.2, 0);
  city.add(groundLight);
}

// Handle window resize
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  
  // Update mobile detection
  isMobile = window.innerWidth <= 768;
}

// Handle mouse move
function onMouseMove(event) {
  // Calculate mouse position in normalized device coordinates
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

// Basic animation loop
function animate() {
  requestAnimationFrame(animate);
  
  // Render the scene
  renderer.render(scene, camera);
}

// Start the application
init();
animate();
