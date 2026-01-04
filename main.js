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
    
    const doorGeometry = new THREE.BoxGeometry(doorW, doorH, 0.2);
    const doorMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8B4513, 
        roughness: 0.4 
    });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    
    // Position: Right Wall, Deep in the back
    door.position.set(roomWidth/2 - 0.2, -2, -5); 
    door.rotation.y = Math.PI / 2;
    
    door.userData = { type: 'door', locked: true };
    scene.add(door);
    objects.push(door);
    
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
    const backWallZ = -9.8; 
    
    // Define all possible slots (Asymmetry logic)
    let possibleSlots = [];

    // 1. LEFT WALL Slots
    for(let z = -6; z <= 6; z += 4) {
        possibleSlots.push({ x: -wallOffset, y: 0, z: z, type: 'wall', rotY: Math.PI/2 });
    }

    // 2. RIGHT WALL Slots (Avoid door at z=-5)
    for(let z = 0; z <= 6; z += 4) {
         possibleSlots.push({ x: wallOffset, y: 0, z: z, type: 'wall', rotY: -Math.PI/2 });
    }

    // 3. BACK WALL Slots
    for(let x = -4; x <= 4; x += 4) {
        possibleSlots.push({ x: x, y: 0, z: backWallZ + 0.5, type: 'wall', rotY: 0 });
    }

    // Shuffle and pick 4 Wall Locations
    possibleSlots.sort(() => Math.random() - 0.5);
    const selectedPositions = possibleSlots.slice(0, 4);
    
    // Add 1 Floor Location (Randomized Center)
    selectedPositions.push({ 
        x: (Math.random() * 6) - 3, 
        y: -3.5, 
        z: (Math.random() * 6) - 3, 
        type: 'floor', 
        rotY: 0 
    });

    selectedPositions.forEach((pos, index) => {
        let mesh;
        
        // Randomize rotation speed and direction
        const rotationSpeed = (Math.random() * 0.04) + 0.01; 
        const rotationDir = Math.random() < 0.5 ? 1 : -1;    
        
        if (pos.type === 'wall') {
            const group = new THREE.Group();
            
            // Base (Fixed to wall)
            const baseGeo = new THREE.BoxGeometry(0.2, 1, 1);
            const baseMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
            const base = new THREE.Mesh(baseGeo, baseMat);
            group.add(base);

            // Spinner (The part that rotates)
            const spinGeo = new THREE.BoxGeometry(0.5, 1.8, 0.2); 
            const spinMat = new THREE.MeshStandardMaterial({ 
                color: Math.random() * 0xffffff,
                emissive: 0x222222,
                roughness: 0.3
            });
            const spinner = new THREE.Mesh(spinGeo, spinMat);
            
            // Offset spinner so it floats in front of the base
            spinner.position.x = 0.4; 
            group.add(spinner);
            
            mesh = group;
            // Store reference to the spinning part
            mesh.userData.rotatePart = spinner; 
            
        } else {
            // Floor Object
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
            
            mesh.userData.rotatePart = mesh; // Whole object rotates
        }

        mesh.position.set(pos.x, pos.y, pos.z);
        mesh.rotation.y = pos.rotY;
        
        // Setup UserData
        mesh.userData.type = 'interactive';
        mesh.userData.questionIndex = index;
        mesh.userData.rotSpeed = rotationSpeed * rotationDir;
        mesh.userData.posType = pos.type;

        // Ensure raycasting hits children
        mesh.traverse((child) => {
            child.userData = { type: 'interactive', parent: mesh };
        });

        scene.add(mesh);
        objects.push(mesh);
    });
}

function animate() {
    requestAnimationFrame(animate);
    
    objects.forEach(obj => {
        // Only animate if we have a designated rotating part
        if (obj.userData.type === 'interactive' && obj.userData.rotatePart) {
            const speed = obj.userData.rotSpeed || 0.02;
            
            if (obj.userData.posType === 'floor') {
                // Floor objects spin on Y (Vertical axis) and Z (Tumble)
                obj.userData.rotatePart.rotation.y += speed;
                obj.userData.rotatePart.rotation.z += speed * 0.5;
            } else {
                // Wall objects spin on local X axis (Facing out like a fan)
                obj.userData.rotatePart.rotation.x += speed * 3; 
            }
        }
    });
    
    controls.update();
    renderer.render(scene, camera);
}

// ... (Rest of functions: startGame, updateTimerDisplay, etc. remain unchanged)
// To ensure they are present, here are the simplified versions:

function startGame() {
    questionManager.reset();
    ['start-screen', 'end-screen'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.classList.add('hidden');
    });
    document.getElementById('question-modal').style.display = 'none';
    
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
    if(timerEl) {
        const m = Math.floor(timeRemaining / 60);
        const s = timeRemaining % 60;
        timerEl.textContent = `Time: ${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
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
    const intersects = raycaster.intersectObjects(objects, true);
    
    if (intersects.length > 0) {
        let target = intersects[0].object;
        while(target.parent && target.userData.type !== 'interactive' && target.userData.type !== 'door') {
            target = target.parent;
        }
        if (!target.userData.type && target.parent && target.parent.userData.type) target = target.parent;

        if (target.userData.type === 'interactive') {
            showQuestion(target);
        } else if (target.userData.type === 'door') {
            if (target.userData.locked) alert('Door Locked! Solve all questions in this sector.');
            else nextLevel();
        }
    }
}

function showQuestion(object) {
    if (!questionManager.hasMoreQuestions()) { unlockDoor(); return; }
    const question = questionManager.getCurrentQuestion();
    document.getElementById('question-text').textContent = question.question;
    const container = document.getElementById('options-container');
    container.innerHTML = '';
    question.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'option';
        btn.textContent = opt;
        btn.dataset.index = i;
        btn.addEventListener('click', selectOption);
        container.appendChild(btn);
    });
    document.getElementById('feedback').textContent = '';
    document.getElementById('question-modal').style.display = 'block';
    document.getElementById('hint-button').disabled = questionManager.hints <= 0;
}

function selectOption(event) {
    document.querySelectorAll('.option').forEach(btn => btn.style.background = '#3498db');
    event.target.style.background = '#2ecc71';
    event.target.dataset.selected = 'true';
}

function submitAnswer() {
    const sel = document.querySelector('.option[data-selected="true"]');
    if (!sel) return;
    const isCorrect = questionManager.checkAnswer(parseInt(sel.dataset.index));
    const fb = document.getElementById('feedback');
    if (isCorrect) {
        fb.textContent = 'Correct!'; fb.style.color = '#27ae60';
        setTimeout(() => {
            document.getElementById('question-modal').style.display = 'none';
            updateHUD();
            if (!questionManager.hasMoreQuestions()) unlockDoor();
        }, 1000);
    } else {
        fb.textContent = 'Incorrect! Try again.'; fb.style.color = '#e74c3c';
    }
}

function showHint() {
    if (questionManager.hints > 0) {
        document.getElementById('feedback').textContent = `Hint: ${questionManager.getHint()}`;
        updateHUD();
        document.getElementById('hint-button').disabled = questionManager.hints <= 0;
    }
}

function unlockDoor() {
    scene.children.forEach(c => {
        if (c.userData && c.userData.type === 'door') {
            c.userData.locked = false;
            c.material.color.setHex(0x00FF00); c.material.emissive.setHex(0x004400);
        }
    });
    alert(`Level ${currentLevel} Complete! The blast door opens...`);
}

function nextLevel() {
    if (currentLevel < MAX_LEVELS) loadLevel(currentLevel + 1);
    else endGame(true);
}

function endGame(escaped) {
    gameActive = false;
    clearInterval(gameTimer);
    document.getElementById('end-message').textContent = escaped ? 'MISSION ACCOMPLISHED!' : 'Containment Breach! Time Up.';
    document.getElementById('end-message').style.color = escaped ? '#27ae60' : '#e74c3c';
    document.getElementById('final-score').textContent = `Final Score: ${questionManager.score}`;
    document.getElementById('end-screen').classList.remove('hidden');
}

function restartGame() { startGame(); }

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function setupEventListeners() {
    const ids = ['start-button', 'restart-button', 'submit-answer', 'hint-button'];
    const funcs = [startGame, restartGame, submitAnswer, showHint];
    ids.forEach((id, i) => { const el = document.getElementById(id); if(el) el.addEventListener('click', funcs[i]); });
    renderer.domElement.addEventListener('click', onObjectClick, false);
}

window.onload = init;
