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
    
    // Camera setup
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 6, 18); 
    
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
    controls.target.set(0, 0, 0); 
    
    questionManager = new QuestionManager();
    setupEventListeners();
    
    animate();
    window.addEventListener('resize', onWindowResize);
    
    const startScreen = document.getElementById('start-screen');
    if(startScreen) startScreen.classList.remove('hidden');
}

function loadLevel(level) {
    currentLevel = level;
    
    while(scene.children.length > 0){ 
        scene.remove(scene.children[0]); 
    }
    objects = []; 

    scene.background = new THREE.Color(0x111111);

    const theme = ROOM_THEMES[level];
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(theme.light, 1, 40);
    pointLight.position.set(0, 8, 0);
    pointLight.castShadow = true;
    scene.add(pointLight);

    createRoom(theme);
    createInteractiveObjects(level);
    
    questionManager.loadLevel(level);
    
    updateHUD();
    const levelDisplay = document.getElementById('level-display');
    if(levelDisplay) levelDisplay.textContent = `Level: ${level} - ${questionManager.getTheme()}`;
}

function createRoom(theme) {
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
    floor.position.y = -roomHeight/2 + 0.1;
    floor.receiveShadow = true;
    scene.add(floor);

    // Ceiling
    const ceiling = floor.clone();
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = roomHeight/2;
    scene.add(ceiling);

    // Back Wall
    createWall(roomWidth, roomHeight, 0.5, theme.wall, 0, 0, -roomDepth/2); 
    // Left Wall
    createWall(roomDepth, roomHeight, 0.5, theme.wall, -roomWidth/2, 0, 0, Math.PI/2);
    // Right Wall
    createWall(roomDepth, roomHeight, 0.5, theme.wall, roomWidth/2, 0, 0, Math.PI/2);

    createSideDoor(roomWidth, roomDepth);
}

function createSideDoor(roomWidth, roomDepth) {
    const doorW = 4;
    const doorH = 6;
    
    // Door setup
    const doorGeometry = new THREE.BoxGeometry(doorW, doorH, 0.2);
    const doorMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8B4513, 
        roughness: 0.4 
    });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    
    // Position: Right Wall, Deep in the back (z = -5)
    door.position.set(roomWidth/2 - 0.2, -2, -5); 
    door.rotation.y = Math.PI / 2;
    
    door.userData = { type: 'door', locked: true };
    scene.add(door);
    objects.push(door);
    
    // Frame
    const frameGeo = new THREE.BoxGeometry(doorW + 0.5, doorH + 0.5, 0.3);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.copy(door.position);
    frame.position.x += 0.1;
    frame.rotation.y = Math.PI / 2;
    scene.add(frame);
}

function createInteractiveObjects(level) {
    const wallOffset = 6.8; 
    
    const positions = [
        // Left Wall Panels (Safe to keep as is)
        { x: -wallOffset, y: 0, z: 4, type: 'wall', rotY: Math.PI/2 },
        { x: -wallOffset, y: 0, z: -4, type: 'wall', rotY: Math.PI/2 },
        
        // Right Wall Panels (MOVED FORWARD to avoid Door at z=-5)
        { x: wallOffset, y: 0, z: 5, type: 'wall', rotY: -Math.PI/2 }, // Closer to camera
        { x: wallOffset, y: 0, z: 0, type: 'wall', rotY: -Math.PI/2 }, // Middle
        
        // Center Floor Device (The "Boss" object)
        { x: 0, y: -3.5, z: -2, type: 'floor', rotY: 0 } // Moved slightly forward for visibility
    ];

    positions.forEach((pos, index) => {
        let mesh;
        let isRotatable = false; // Default to static
        
        if (pos.type === 'wall') {
            // High-Tech Wall Panel
            const group = new THREE.Group();
            
            // Panel Base
            const panelGeo = new THREE.BoxGeometry(0.5, 2, 1.5);
            const panelMat = new THREE.MeshStandardMaterial({ 
                color: 0x333333,
                roughness: 0.2
            });
            const panel = new THREE.Mesh(panelGeo, panelMat);
            group.add(panel);
            
            // Glowing Screen
            const screenGeo = new THREE.PlaneGeometry(1.2, 1.6);
            const screenMat = new THREE.MeshStandardMaterial({ 
                color: 0x00FFFF, 
                emissive: 0x00AAAA,
                emissiveIntensity: 0.5
            });
            const screen = new THREE.Mesh(screenGeo, screenMat);
            screen.position.x = 0.26; 
            screen.rotation.y = Math.PI/2;
            group.add(screen);
            
            mesh = group;
            
        } else {
            // Center Floor Object - This one SHOULD spin
            isRotatable = true;
            
            if (level % 2 !== 0) { 
                 const geo = new THREE.IcosahedronGeometry(1.5, 0);
                 const mat = new THREE.MeshStandardMaterial({ 
                     color: 0xff0000, 
                     wireframe: true, 
                     emissive: 0x550000 
                 });
                 mesh = new THREE.Mesh(geo, mat);
            } else { 
                 const geo = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
                 const mat = new THREE.MeshStandardMaterial({ 
                     color: 0x00ff00, 
                     metalness: 0.8, 
                     roughness: 0.1 
                 });
                 mesh = new THREE.Mesh(geo, mat);
            }
            
            const pedGeo = new THREE.CylinderGeometry(2, 2.5, 1, 32);
            const pedMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
            const ped = new THREE.Mesh(pedGeo, pedMat);
            ped.position.set(pos.x, pos.y - 1.5, pos.z);
            scene.add(ped);
        }

        mesh.position.set(pos.x, pos.y, pos.z);
        mesh.rotation.y = pos.rotY;
        
        // Add specific flag to control animation
        mesh.userData = { 
            type: 'interactive', 
            questionIndex: index,
            rotatable: isRotatable 
        };
        
        mesh.traverse((child) => {
            child.userData = { type: 'interactive', parent: mesh };
        });

        scene.add(mesh);
        objects.push(mesh);
    });
}

function startGame() {
    questionManager.reset();
    
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
    
    const intersects = raycaster.intersectObjects(objects, true); // true = recursive check for groups
    
    if (intersects.length > 0) {
        let target = intersects[0].object;
        
        // Traverse up to find the main interactive parent
        while(target.parent && target.userData.type !== 'interactive' && target.userData.type !== 'door') {
            target = target.parent;
        }
        
        // Check parent's user data if child doesn't have it
        if (!target.userData.type && target.parent && target.parent.userData.type) {
            target = target.parent;
        }

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
    // If the specific object is already solved, maybe show a message?
    // For now, we assume standard loop.
    
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
    
    // Only rotate objects that are marked as rotatable
    objects.forEach(obj => {
        if (obj.userData.type === 'interactive' && obj.userData.rotatable) {
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
