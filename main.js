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
    1: { wall: 0xE0E0E0, floor: 0x8D6E63, light: 0xFFFFFF }, // Classroom
    2: { wall: 0x78909C, floor: 0x37474F, light: 0xCDDC39 }, // Lab
    3: { wall: 0x424242, floor: 0x212121, light: 0xFF9800 }, // Power Plant
    4: { wall: 0x263238, floor: 0x000000, light: 0x00BCD4 }, // High Voltage
    5: { wall: 0x1A237E, floor: 0x000000, light: 0xD500F9 }  // Quantum Core
};

function init() {
    scene = new THREE.Scene();
    
    // Adjusted Camera for Deeper Room view
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 6, 18); // Moved back and up to see over the "near" area
    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    document.getElementById('game-container').appendChild(renderer.domElement);
    
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 30;
    controls.maxPolarAngle = Math.PI / 2 - 0.1;
    // Target the center of the room so rotation feels natural
    controls.target.set(0, 0, 0); 
    
    questionManager = new QuestionManager();
    setupEventListeners();
    
    animate();
    window.addEventListener('resize', onWindowResize);
    
    // Show start screen if not already hidden (reloads)
    const startScreen = document.getElementById('start-screen');
    if(startScreen) startScreen.classList.remove('hidden');
}

function loadLevel(level) {
    currentLevel = level;
    
    // 1. Clear existing scene
    while(scene.children.length > 0){ 
        scene.remove(scene.children[0]); 
    }
    objects = []; 

    // 2. Set Background
    scene.background = new THREE.Color(0x111111);

    // 3. Setup Lights
    const theme = ROOM_THEMES[level];
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    // Move main light to center of the deeper room
    const pointLight = new THREE.PointLight(theme.light, 1, 40);
    pointLight.position.set(0, 8, 0);
    pointLight.castShadow = true;
    scene.add(pointLight);

    // 4. Create Environment
    createRoom(theme);
    createInteractiveObjects(level);
    
    // 5. Load Questions
    questionManager.loadLevel(level);
    
    // 6. Update UI
    updateHUD();
    const levelDisplay = document.getElementById('level-display');
    if(levelDisplay) levelDisplay.textContent = `Level: ${level} - ${questionManager.getTheme()}`;
}

function createRoom(theme) {
    // New Dimensions: Deeper and slightly wider
    const roomWidth = 14;
    const roomDepth = 20; 
    const roomHeight = 10;
    
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
    const floorGeo = new THREE.PlaneGeometry(roomWidth, roomDepth);
    const floorMat = new THREE.MeshStandardMaterial({ 
        color: theme.floor, 
        roughness: 0.8,
        metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -roomHeight/2 + 0.1; // Slightly adjust to align with walls
    floor.receiveShadow = true;
    scene.add(floor);

    // Ceiling
    const ceiling = floor.clone();
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = roomHeight/2;
    scene.add(ceiling);

    // Walls
    const wallThick = 0.5;
    
    // Back Wall (Far end)
    createWall(roomWidth, roomHeight, wallThick, theme.wall, 0, 0, -roomDepth/2); 
    
    // Left Wall
    createWall(roomDepth, roomHeight, wallThick, theme.wall, -roomWidth/2, 0, 0, Math.PI/2);
    
    // Right Wall
    createWall(roomDepth, roomHeight, wallThick, theme.wall, roomWidth/2, 0, 0, Math.PI/2);

    // NOTE: "Front" wall (near camera) is intentionally omitted to prevent blocking view

    createSideDoor(roomWidth, roomDepth);
}

function createSideDoor(roomWidth, roomDepth) {
    const doorW = 4;
    const doorH = 6;
    
    // Create Door Geometry
    const doorGeometry = new THREE.BoxGeometry(doorW, doorH, 0.2);
    const doorMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8B4513, 
        roughness: 0.4 
    });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    
    // Position: On the Right Wall (x = roomWidth/2), towards the back (z = -5)
    // Rotating it 90 degrees (PI/2) to align with the side wall
    door.position.set(roomWidth/2 - 0.2, -2, -5); 
    door.rotation.y = Math.PI / 2;
    
    door.userData = { type: 'door', locked: true };
    scene.add(door);
    objects.push(door); // Clickable
    
    // Door Frame
    const frameGeo = new THREE.BoxGeometry(doorW + 0.5, doorH + 0.5, 0.3);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.copy(door.position);
    frame.position.x += 0.1; // Slightly offset into wall
    frame.rotation.y = Math.PI / 2;
    scene.add(frame);
}

function createInteractiveObjects(level) {
    // Distributed along the Z-axis (Depth)
    const positions = [
        { x: -3, y: -4, z: 6 },   // Near (Close to camera)
        { x: 3, y: -4, z: 0 },    // Middle
        { x: -3, y: -4, z: -6 }   // Far (Near back wall)
    ];

    positions.forEach((pos, index) => {
        let mesh;
        
        if (level === 1 || level === 2) {
            // Basic Shapes
            const geo = index === 0 ? new THREE.BoxGeometry(1.5, 1.5, 1.5) : 
                       index === 1 ? new THREE.SphereGeometry(1) :
                       new THREE.CylinderGeometry(0.8, 0.8, 1.5);
            const mat = new THREE.MeshStandardMaterial({ 
                color: Math.random() * 0xffffff,
                roughness: 0.5,
                metalness: 0.5
            });
            mesh = new THREE.Mesh(geo, mat);
            
        } else {
            // Advanced Sci-Fi Shapes for higher levels
            if (index === 0) {
                // Coil / Torus
                const geo = new THREE.TorusKnotGeometry(0.6, 0.2, 64, 8);
                const mat = new THREE.MeshStandardMaterial({ color: 0xB87333, metalness: 0.9, roughness: 0.1 }); 
                mesh = new THREE.Mesh(geo, mat);
            } else if (index === 1) {
                // Floating Magnet
                const geo = new THREE.BoxGeometry(0.6, 0.6, 2);
                const mat = new THREE.MeshStandardMaterial({ color: 0xFF0000 }); 
                mesh = new THREE.Mesh(geo, mat);
                const blueGeo = new THREE.BoxGeometry(0.6, 0.6, 1);
                const blueMesh = new THREE.Mesh(blueGeo, new THREE.MeshStandardMaterial({color: 0x0000FF}));
                blueMesh.position.z = 0.5;
                mesh.add(blueMesh);
            } else {
                // Core
                const geo = new THREE.OctahedronGeometry(1, 0);
                const mat = new THREE.MeshStandardMaterial({ color: 0x00FF00, wireframe: true, emissive: 0x002200 });
                mesh = new THREE.Mesh(geo, mat);
            }
        }

        mesh.position.set(pos.x, pos.y, pos.z);
        mesh.userData = { type: 'interactive', questionIndex: index };
        mesh.castShadow = true;
        scene.add(mesh);
        objects.push(mesh);
        
        // Pedestal
        const pedGeo = new THREE.CylinderGeometry(1, 1.2, 1, 32);
        const pedMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
        const ped = new THREE.Mesh(pedGeo, pedMat);
        ped.position.set(pos.x, pos.y - 1.25, pos.z);
        ped.receiveShadow = true;
        scene.add(ped);
    });
}

function startGame() {
    questionManager.reset();
    
    // Hide screens
    ['start-screen', 'end-screen'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.classList.add('hidden');
    });
    
    const qModal = document.getElementById('question-modal');
    if(qModal) qModal.style.display = 'none';
    
    gameActive = true;
    timeRemaining = 3600;
    updateTimerDisplay();
    
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

function updateTimerDisplay() {
    const timerEl = document.getElementById('timer');
    if(!timerEl) return;
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    timerEl.textContent = `Time: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function updateHUD() {
    const scoreEl = document.getElementById('score');
    const hintsEl = document.getElementById('hints');
    if(scoreEl) scoreEl.textContent = `Score: ${questionManager.score}`;
    if(hintsEl) hintsEl.textContent = `Hints: ${questionManager.hints}`;
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
        const target = object.parent && object.parent.userData.type ? object.parent : object;

        if (target.userData.type === 'interactive') {
            showQuestion(target);
        } else if (target.userData.type === 'door') {
            if (target.userData.locked) {
                alert('Door Locked! Solve all questions in this sector.');
            } else {
                nextLevel();
            }
        }
    }
}

function showQuestion(object) {
    if (!questionManager.hasMoreQuestions()) {
        unlockDoor();
        return;
    }
    
    const question = questionManager.getCurrentQuestion();
    const txtEl = document.getElementById('question-text');
    if(txtEl) txtEl.textContent = question.question;
    
    const optionsContainer = document.getElementById('options-container');
    if(optionsContainer) {
        optionsContainer.innerHTML = '';
        question.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'option';
            button.textContent = option;
            button.dataset.index = index;
            button.addEventListener('click', selectOption);
            optionsContainer.appendChild(button);
        });
    }
    
    const feedbackEl = document.getElementById('feedback');
    if(feedbackEl) feedbackEl.textContent = '';
    
    const modal = document.getElementById('question-modal');
    if(modal) modal.style.display = 'block';
    
    const hintBtn = document.getElementById('hint-button');
    if(hintBtn) hintBtn.disabled = questionManager.hints <= 0;
}

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
    
    const feedbackEl = document.getElementById('feedback');
    if (isCorrect) {
        if(feedbackEl) {
            feedbackEl.textContent = 'Correct!';
            feedbackEl.style.color = '#27ae60';
        }
        
        setTimeout(() => {
            document.getElementById('question-modal').style.display = 'none';
            updateHUD();
            
            if (!questionManager.hasMoreQuestions()) {
                unlockDoor();
            }
        }, 1000);
    } else {
        if(feedbackEl) {
            feedbackEl.textContent = 'Incorrect! Try again.';
            feedbackEl.style.color = '#e74c3c';
        }
    }
}

function showHint() {
    if (questionManager.hints > 0) {
        const hint = questionManager.getHint();
        const feedbackEl = document.getElementById('feedback');
        if(feedbackEl) feedbackEl.textContent = `Hint: ${hint}`;
        updateHUD();
        document.getElementById('hint-button').disabled = questionManager.hints <= 0;
    }
}

function unlockDoor() {
    scene.children.forEach(child => {
        if (child.userData && child.userData.type === 'door') {
            child.userData.locked = false;
            child.material.color.setHex(0x00FF00); 
            child.material.emissive.setHex(0x004400);
        }
    });
    alert(`Level ${currentLevel} Complete! The blast door opens...`);
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
        if(endMessage) {
            endMessage.textContent = 'MISSION ACCOMPLISHED: YOU ESCAPED!';
            endMessage.style.color = '#27ae60';
        }
    } else {
        if(endMessage) {
            endMessage.textContent = 'Containment Breach! Time Up.';
            endMessage.style.color = '#e74c3c';
        }
    }
    
    if(finalScore) finalScore.textContent = `Final Score: ${questionManager.score}`;
    if(endScreen) endScreen.classList.remove('hidden');
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
    const ids = ['start-button', 'restart-button', 'submit-answer', 'hint-button'];
    const funcs = [startGame, restartGame, submitAnswer, showHint];
    
    ids.forEach((id, i) => {
        const el = document.getElementById(id);
        if(el) el.addEventListener('click', funcs[i]);
    });
    
    renderer.domElement.addEventListener('click', onObjectClick, false);
}

window.onload = init;
