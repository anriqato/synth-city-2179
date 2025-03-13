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
  
  // Create buildings
  createBuildings(buildingCount);
  
  // Add event listeners
  window.addEventListener('resize', onWindowResize);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('click', onMouseClick);
  
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

// Create the buildings of the city
function createBuildings(count) {
  // Clear existing buildings
  while (town.children.length > 0) {
    town.remove(town.children[0]);
  }
  buildings = [];
  
  // Create new buildings
  for (let i = 0; i < count; i++) {
    // Building geometry
    const height = 0.1 + Math.abs(mathRandom(8));
    const width = 0.9 + mathRandom(0.5);
    
    // Randomize building type
    const buildingType = Math.floor(Math.random() * 4);
    let geometry;
    
    switch(buildingType) {
      case 0: // Standard cube building
        geometry = new THREE.BoxGeometry(1, 1, 1);
        break;
      case 1: // Building with segments
        geometry = new THREE.BoxGeometry(1, 1, 1, 2, 2, 2);
        break;
      case 2: // Cylindrical building
        geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 8);
        break;
      case 3: // Complex building
        geometry = new THREE.BoxGeometry(1, 1, 1);
        break;
    }
    
    // Create materials with emissive for neon effect
    const color = setTintColor();
    const material = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.05,
      metalness: 0.7,
      roughness: 0.3,
      side: THREE.DoubleSide
    });
    
    // Create wireframe overlay
    const wireMaterial = new THREE.MeshBasicMaterial({
      color: 0x00FFFF,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide
    });
    
    // Create building and wireframe mesh
    const building = new THREE.Mesh(geometry, material);
    const wireframe = new THREE.Mesh(geometry, wireMaterial);
    
    // Add wireframe to building
    building.add(wireframe);
    
    // Set building properties
    building.castShadow = true;
    building.receiveShadow = true;
    building.scale.y = height;
    building.scale.x = building.scale.z = width;
    
    // Position the building
    building.position.x = Math.round(mathRandom(20));
    building.position.z = Math.round(mathRandom(20));
    building.userData.isBuilding = true;
    building.userData.hasLabel = false;
    
    // Add to buildings array and scene
    buildings.push(building);
    town.add(building);
    
    // Add a floor under each building
    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(width, 0.05, width),
      new THREE.MeshStandardMaterial({
        color: 0x111111,
        metalness: 0.9,
        roughness: 0.1
      })
    );
    floor.position.set(building.position.x, -0.025, building.position.z);
    floor.receiveShadow = true;
    town.add(floor);
  }
}

// Handle mouse click
function onMouseClick(event) {
  // Update the picking ray with the camera and mouse position
  raycaster.setFromCamera(mouse, camera);
  
  // Calculate objects intersecting the picking ray
  const intersects = raycaster.intersectObjects(buildings, false);
  
  if (intersects.length > 0) {
    // Get the first intersected building
    const building = intersects[0].object;
    
    // Select the building
    selectBuilding(building);
  } else {
    // Deselect building if clicking elsewhere
    deselectBuilding();
  }
}

// Select a building
function selectBuilding(building) {
  // Deselect previous building
  deselectBuilding();
  
  // Select new building
  selectedBuilding = building;
  
  // Highlight selected building
  const originalMaterial = building.material;
  building.userData.originalMaterial = originalMaterial;
  
  // Create highlight material
  const highlightMaterial = originalMaterial.clone();
  highlightMaterial.emissive.set(0x00FFFF);
  highlightMaterial.emissiveIntensity = 0.5;
  building.material = highlightMaterial;
}

// Deselect building
function deselectBuilding() {
  if (selectedBuilding) {
    // Restore original material
    if (selectedBuilding.userData.originalMaterial) {
      selectedBuilding.material = selectedBuilding.userData.originalMaterial;
      selectedBuilding.userData.originalMaterial = null;
    }
    
    selectedBuilding = null;
  }
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
