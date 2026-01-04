// main.js
let scene, camera, renderer, controls;
let objects = [];
let questionManager;
let gameActive = false;
let timeRemaining = 3600; 
let gameTimer;
let currentLevel = 1;
const MAX_LEVELS = 5;

// Visual Themes for each room
const ROOM_THEMES = {
    1: { wall: 0xE0E0E0, floor: 0x8D6E63, light: 0xFFFFFF }, // Classroom (White/Wood)
    2: { wall: 0x78909C, floor: 0x37474F, light: 0xCDDC39 }, // Lab (Blue-Grey/Dark)
    3: { wall: 0x424242, floor: 0x212121, light: 0xFF9800 }, // Power Plant (Dark Grey/Orange)
    4: { wall: 0x263238, floor: 0x000000, light: 0x00BCD4 }, // High Voltage (Dark Blue/Cyan)
    5: { wall: 0x1A237E, floor: 0x000000, light: 0xD500F9 }  // Quantum Core (Deep Blue/Purple)
};

function init() {
    scene = new THREE.Scene();
    
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.6, 5);
    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding; // Better colors
    document.getElementById('game-container').appendChild(renderer.domElement);
    
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1;
    controls.maxDistance = 10;
    controls.maxPolarAngle = Math.PI / 2 - 0.1;
    
    questionManager = new QuestionManager();
    setupEventListeners();
    
    // Initial Render Loop
    animate();
    window.addEventListener('resize', onWindowResize);
    
    // Show start screen
    document.getElementById('start-screen').classList.remove('hidden');
}

function loadLevel(level) {
    currentLevel = level;
    
    // 1. clear existing scene objects
    while(scene.children.length > 0){ 
        scene.remove(scene.children[0]); 
    }
    objects = []; // Clear interactive objects array

    // 2. Set Background
    scene.background = new THREE.Color(0x000000); // Dark space outside room

    // 3. Setup Lights based on Theme
    const theme = ROOM_THEMES[level];
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(theme.light, 1, 20);
    pointLight.position.set(0, 4, 0);
    pointLight.castShadow = true;
    scene.add(pointLight);

    // 4. Create Environment
    createRoom(theme);
    createInteractiveObjects(level);
    
    // 5. Load Questions
    questionManager.loadLevel(level);
    
    // 6. Update UI
    updateHUD();
    document.getElementById('level-display').textContent = `Level: ${level} - ${questionManager.getTheme()}`;
}

function createRoom(theme) {
    const roomSize = 10;
    
    // Helper to create walls with Standard Material (Reacts to light better)
    const createWall = (w, h, d, color, x, y, z, rotY = 0) => {
        const geo = new THREE.BoxGeometry(w, h, d);
        const mat = new THREE.MeshStandardMaterial({ 
            color: color, 
            roughness: 0.7, 
            metalness: 0.1 
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y, z);
        mesh.rotation.y = rotY;
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        scene.add(mesh);
        return mesh;
    };

    // Floor
    const floorGeo = new THREE.PlaneGeometry(roomSize, roomSize);
    const floorMat = new THREE.MeshStandardMaterial({ 
        color: theme.floor, 
        roughness: 0.8,
        metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -roomSize/2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Ceiling
    const ceiling = floor.clone();
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = roomSize/2;
    scene.add(ceiling);

    // Walls
    const wallThick = 0.5;
    createWall(roomSize, roomSize, wallThick, theme.wall, 0, 0, -roomSize/2); // Back
    createWall(roomSize, roomSize, wallThick, theme.wall, -roomSize/2, 0, 0, Math.PI/2); // Left
    createWall(roomSize, roomSize, wallThick, theme.wall, roomSize/2, 0, 0, Math.PI/2); // Right

    createDoor(theme);
}

function createDoor(theme) {
    const doorGeometry = new THREE.BoxGeometry(3, 5, 0.2);
    const doorMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8B4513, // Standard wood brown initially
        roughness: 0.4 
    });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, -2.5, 5); // Front of room
    door.userData = { type: 'door', locked: true };
    scene.add(door);
    objects.push(door); // Make door clickable
    
    // Frame
    const frameGeo = new THREE.BoxGeometry(3.5, 6, 0.3);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.set(0, -2, 5);
    scene.add(frame);
}

function createInteractiveObjects(level) {
    // Generate 3 distinct objects per room for the 3 questions
    const positions = [
        { x: -2, y: -4, z: -2 },
        { x: 2, y: -4, z: -2 },
        { x: -2, y: -4, z: 2 }
    ];

    positions.forEach((pos, index) => {
        let mesh;
        
        if (level === 1 || level === 2) {
            // Basic Shapes (Cubes/Spheres) for Levels 1-2
            const geo = index === 0 ? new THREE.BoxGeometry(1, 1, 1) : 
                       index === 1 ? new THREE.SphereGeometry(0.6) :
                       new THREE.CylinderGeometry(0.5, 0.5, 1);
            const mat = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff });
            mesh = new THREE.Mesh(geo, mat);
            
        } else {
            // Complex Shapes (Coils/Toroids) for Levels 3-5
            if (index === 0) {
                // Represents a Coil
                const geo = new THREE.TorusGeometry(0.5, 0.2, 16, 100);
                const mat = new THREE.MeshStandardMaterial({ color: 0xB87333, metalness: 0.8, roughness: 0.2 }); // Copper
                mesh = new THREE.Mesh(geo, mat);
            } else if (index === 1) {
                // Represents a Magnet
                const geo = new THREE.BoxGeometry(0.4, 0.4, 1.5);
                const mat = new THREE.MeshStandardMaterial({ color: 0xFF0000 }); // Red part of magnet
                mesh = new THREE.Mesh(geo, mat);
                // Add blue part as child
                const blueGeo = new THREE.BoxGeometry(0.4, 0.4, 0.75);
                const blueMesh = new THREE.Mesh(blueGeo, new THREE.MeshStandardMaterial({color: 0x0000FF}));
                blueMesh.position.z = 0.375;
                mesh.add(blueMesh);
            } else {
                // Represents Flux/Generator
                const geo = new THREE.IcosahedronGeometry(0.6, 0);
                const mat = new THREE.MeshStandardMaterial({ color: 0x00FF00, wireframe: true });
                mesh = new THREE.Mesh(geo, mat);
            }
        }

        mesh.position.set(pos.x, pos.y, pos.z);
        mesh.userData = { type: 'interactive', questionIndex: index };
        mesh.castShadow = true;
        scene.add(mesh);
        objects.push(mesh);
        
        // Add a simple pedestal
        const pedGeo = new THREE.CylinderGeometry(0.8, 1, 1, 32);
        const pedMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
        const ped = new THREE.Mesh(pedGeo, pedMat);
        ped.position.set(pos.x, pos.y - 1, pos.z);
        ped.receiveShadow = true;
        scene.add(ped);
    });
}

function startGame() {
    questionManager.reset();
    
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('end-screen').classList.add('hidden');
    document.getElementById('question-modal').style.display = 'none';
    
    gameActive = true;
    timeRemaining = 3600;
    updateTimerDisplay();
    
    // Load Level 1
    loadLevel(1);
    
    clearInterval(gameTimer);
    gameTimer = setInterval(() => {
        if (gameActive && timeRemaining > 0) {
            timeRemaining--;
            updateTimerDisplay();
            if (timeRemaining <= 0) endGame(false);
        }
    }, 1000);
    
    updateHUD();
}

// ... (Keep updateTimerDisplay and updateHUD from original) ...
function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    document.getElementById('timer').textContent = 
        `Time: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function updateHUD() {
    document.getElementById('score').textContent = `Score: ${questionManager.score}`;
    document.getElementById('hints').textContent = `Hints: ${questionManager.hints}`;
}

function onObjectClick(event) {
    if (!gameActive) return;
    
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    
    const intersects = raycaster.intersectObjects(objects);
    
    if (intersects.length > 0) {
        const object = intersects[0].object;
        
        // Handle parent/child grouping (like the magnet)
        const target = object.parent && object.parent.userData.type ? object.parent : object;

        if (target.userData.type === 'interactive') {
            showQuestion(target);
        } else if (target.userData.type === 'door') {
            if (target.userData.locked) {
                alert('Door Locked! Solve all questions in this room.');
            } else {
                nextLevel();
            }
        }
    }
}

function showQuestion(object) {
    // Check if we have questions left for this specific object interaction
    // Note: In this simple version, we just pull the next available question
    if (!questionManager.hasMoreQuestions()) {
        unlockDoor();
        return;
    }
    
    const question = questionManager.getCurrentQuestion();
    document.getElementById('question-text').textContent = question.question;
    
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option';
        button.textContent = option;
        button.dataset.index = index;
        button.addEventListener('click', selectOption);
        optionsContainer.appendChild(button);
    });
    
    document.getElementById('feedback').textContent = '';
    document.getElementById('question-modal').style.display = 'block';
    document.getElementById('hint-button').disabled = questionManager.hints <= 0;
}

// ... (Keep selectOption from original) ...
function selectOption(event) {
    document.querySelectorAll('.option').forEach(btn => btn.style.background = '#3498db');
    event.target.style.background = '#2ecc71';
    event.target.dataset.selected = 'true';
}

function submitAnswer() {
    const selectedButton = document.querySelector('.option[data-selected="true"]');
    
    if (!selectedButton) return;
    
    const selectedIndex = parseInt(selectedButton.dataset.index);
    const isCorrect = questionManager.checkAnswer(selectedIndex);
    
    if (isCorrect) {
        document.getElementById('feedback').textContent = 'Correct!';
        document.getElementById('feedback').style.color = '#27ae60';
        
        setTimeout(() => {
            document.getElementById('question-modal').style.display = 'none';
            updateHUD();
            
            // Remove the object effectively (visually hide it)
            // In a full game, you might want to disable it
            
            if (!questionManager.hasMoreQuestions()) {
                unlockDoor();
            }
        }, 1000);
    } else {
        document.getElementById('feedback').textContent = 'Incorrect! Try again.';
        document.getElementById('feedback').style.color = '#e74c3c';
    }
}

// ... (Keep showHint) ...
function showHint() {
    if (questionManager.hints > 0) {
        const hint = questionManager.getHint();
        document.getElementById('feedback').textContent = `Hint: ${hint}`;
        updateHUD();
        document.getElementById('hint-button').disabled = questionManager.hints <= 0;
    }
}

function unlockDoor() {
    scene.children.forEach(child => {
        if (child.userData && child.userData.type === 'door') {
            child.userData.locked = false;
            child.material.color.setHex(0x00FF00); // Green light
            child.material.emissive.setHex(0x004400); // Glow
        }
    });
    alert(`Level ${currentLevel} Complete! The door opens...`);
}

function nextLevel() {
    if (currentLevel < MAX_LEVELS) {
        loadLevel(currentLevel + 1);
    } else {
        endGame(true);
    }
}

function endGame(escaped) {
    gameActive = false;
    clearInterval(gameTimer);
    
    const endScreen = document.getElementById('end-screen');
    const endMessage = document.getElementById('end-message');
    const finalScore = document.getElementById('final-score');
    
    if (escaped) {
        endMessage.textContent = 'YOU ESCAPED THE FACILITY!';
        endMessage.style.color = '#27ae60';
    } else {
        endMessage.textContent = 'Containment Breach! Time Up.';
        endMessage.style.color = '#e74c3c';
    }
    
    finalScore.textContent = `Final Score: ${questionManager.score}`;
    endScreen.classList.remove('hidden');
}

function restartGame() {
    startGame();
}

function animate() {
    requestAnimationFrame(animate);
    
    objects.forEach(obj => {
        if (obj.userData.type === 'interactive') {
            obj.rotation.y += 0.01;
            obj.rotation.z += 0.005;
        }
    });
    
    controls.update();
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function setupEventListeners() {
    document.getElementById('start-button').addEventListener('click', startGame);
    document.getElementById('restart-button').addEventListener('click', restartGame);
    document.getElementById('submit-answer').addEventListener('click', submitAnswer);
    document.getElementById('hint-button').addEventListener('click', showHint);
    renderer.domElement.addEventListener('click', onObjectClick, false);
}

window.onload = init;
