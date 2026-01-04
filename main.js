// main.js
let scene, camera, renderer, controls;
let objects = [];
let questionManager;
let gameActive = false;
let timeRemaining = 3600; 
let gameTimer;
let currentLevel = 1;
const MAX_LEVELS = 5;

// Visual Themes
const ROOM_THEMES = {
    1: { wall: 0xE0E0E0, floor: 0x8D6E63, light: 0xFFFFFF }, 
    2: { wall: 0x78909C, floor: 0x37474F, light: 0xCDDC39 },
    3: { wall: 0x424242, floor: 0x212121, light: 0xFF9800 },
    4: { wall: 0x263238, floor: 0x000000, light: 0x00BCD4 },
    5: { wall: 0x1A237E, floor: 0x000000, light: 0xD500F9 } 
};

function init() {
    scene = new THREE.Scene();
    
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 8, 20); 
    
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
    
    if (typeof QuestionManager !== 'undefined') {
        questionManager = new QuestionManager();
    } else {
        console.error("QuestionManager not loaded. Check questions.js");
    }

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
    pointLight.position.set(0, 10, 0);
    pointLight.castShadow = true;
    scene.add(pointLight);

    createRoom(theme);
    createInteractiveObjects(level);
    
    if (questionManager) {
        questionManager.loadLevel(level);
        updateHUD();
        const levelDisplay = document.getElementById('level-display');
        if(levelDisplay) levelDisplay.textContent = `Level: ${level} - ${questionManager.getTheme()}`;
    }
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

    // Walls
    createWall(roomWidth, roomHeight, 0.5, theme.wall, 0, 0, -roomDepth/2); 
    createWall(roomDepth, roomHeight, 0.5, theme.wall, -roomWidth/2, 0, 0, Math.PI/2); 
    createWall(roomDepth, roomHeight, 0.5, theme.wall, roomWidth/2, 0, 0, Math.PI/2); 

    createSideDoor(roomWidth, roomDepth);
}

function createSideDoor(roomWidth, roomDepth) {
    const doorW = 4;
    const doorH = 6;
    const doorZ = -5;
    
    const doorGeometry = new THREE.BoxGeometry(doorW, doorH, 0.2);
    const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.4 });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    
    door.position.set(roomWidth/2 - 0.2, -2, doorZ); 
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
    const objectConfigs = [];
    
    // 1. Back Wall Object (Pulsating)
    // Wall is at Z = -10. 
    objectConfigs.push({
        type: 'wall',
        wallSide: 'back',
        x: (Math.random() * 8) - 4,
        y: 0,
        z: -9.8, // Close to wall
        rotY: 0,
        animType: 'pulse'
    });

    // 2. Left Wall Object (Flashing)
    // Wall is at X = -7.
    objectConfigs.push({
        type: 'wall',
        wallSide: 'left',
        x: -6.8, // Close to wall
        y: 0,
        z: (Math.random() * 12) - 6,
        rotY: Math.PI / 2, // Rotated 90 degrees
        animType: 'flash'
    });

    // 3. Three Ground Objects (Rotating)
    const groundPoints = [];
    let attempts = 0;
    while(groundPoints.length < 3 && attempts < 100) {
        attempts++;
        const candidate = {
            x: (Math.random() * 10) - 5, 
            z: (Math.random() * 14) - 7 
        };
        let tooClose = false;
        for(let p of groundPoints) {
            const dx = p.x - candidate.x;
            const dz = p.z - candidate.z;
            if (Math.sqrt(dx*dx + dz*dz) < 3.0) tooClose = true;
        }
        if(!tooClose) groundPoints.push(candidate);
    }

    groundPoints.forEach(p => {
        objectConfigs.push({
            type: 'floor',
            x: p.x,
            y: -3.5,
            z: p.z,
            rotY: Math.random() * Math.PI,
            animType: 'rotate'
        });
    });

    // Build Meshes
    objectConfigs.forEach((config, index) => {
        let mesh;
        
        if (config.type === 'wall') {
            const group = new THREE.Group();
            
            // Mounting Base - CHANGED GEOMETRY
            // Now Wide (1.5) and Tall (1.5) but Thin (0.3)
            // This ensures it sits flat parallel to the wall surface
            const base = new THREE.Mesh(
                new THREE.BoxGeometry(1.5, 1.5, 0.3), 
                new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.5 })
            );
            group.add(base);

            // Create Interesting Sci-Fi Geometry
            let artMesh;
            if (config.animType === 'pulse') {
                // "Quantum Resonator"
                const geo = new THREE.IcosahedronGeometry(0.8, 0);
                const mat = new THREE.MeshStandardMaterial({ 
                    color: 0x00FFFF, 
                    emissive: 0x0088AA,
                    emissiveIntensity: 0.8,
                    wireframe: true
                });
                artMesh = new THREE.Mesh(geo, mat);
                
                const core = new THREE.Mesh(
                    new THREE.OctahedronGeometry(0.4),
                    new THREE.MeshStandardMaterial({ color: 0xFFFFFF, emissive: 0xFFFFFF })
                );
                artMesh.add(core);
                
            } else {
                // "Flux Node"
                const geo = new THREE.TorusKnotGeometry(0.5, 0.15, 64, 8);
                const mat = new THREE.MeshStandardMaterial({ 
                    color: 0xFF00FF, 
                    emissive: 0x550055,
                    emissiveIntensity: 0.5,
                    roughness: 0.2,
                    metalness: 0.8
                });
                artMesh = new THREE.Mesh(geo, mat);
            }
            
            // Move art mesh OUT from the base along the Z axis (thickness)
            // Since the base is 0.3 thick, 0.6 places it nicely in front
            artMesh.position.z = 0.6; 
            
            group.add(artMesh);
            mesh = group;
            
            // Store reference to the part we want to animate
            mesh.userData.animPart = artMesh;
            
        } else {
            // Floor Object
            if (level % 2 !== 0) { 
                 const geo = new THREE.IcosahedronGeometry(1.2, 0);
                 const mat = new THREE.MeshStandardMaterial({ 
                     color: 0xff0000, 
                     wireframe: true, 
                     emissive: 0x550000 
                 });
                 mesh = new THREE.Mesh(geo, mat);
            } else { 
                 const geo = new THREE.TorusKnotGeometry(0.8, 0.25, 100, 16);
                 const mat = new THREE.MeshStandardMaterial({ 
                     color: 0x00ff00, 
                     metalness: 0.8, 
                     roughness: 0.1 
                 });
                 mesh = new THREE.Mesh(geo, mat);
            }
            
            // Pedestal
            const ped = new THREE.Mesh(
                new THREE.CylinderGeometry(1.5, 2, 1, 32),
                new THREE.MeshStandardMaterial({ color: 0x111111 })
            );
            ped.position.set(config.x, config.y - 1.2, config.z);
            scene.add(ped);
            
            mesh = mesh; // Reassign for clarity
            mesh.userData.animPart = mesh; // Animate the whole object
        }

        mesh.position.set(config.x, config.y, config.z);
        mesh.rotation.y = config.rotY;
        
        // Metadata
        mesh.userData.type = 'interactive';
        mesh.userData.questionIndex = index;
        mesh.userData.animType = config.animType;
        mesh.userData.posType = config.type; 

        // Apply userData to children for raycasting
        mesh.traverse((child) => {
            if (child !== mesh) { 
                child.userData = { type: 'interactive', parent: mesh };
            }
        });

        scene.add(mesh);
        objects.push(mesh);
    });
}

function animate() {
    requestAnimationFrame(animate);
    
    const time = Date.now() * 0.001; 

    objects.forEach(obj => {
        if (obj.userData.type === 'interactive' && obj.userData.animPart) {
            const part = obj.userData.animPart;
            const type = obj.userData.animType;

            if (type === 'rotate') {
                // Ground objects spinning
                part.rotation.y += 0.02;
                part.rotation.z += 0.01;
            } 
            else if (type === 'pulse') {
                // Back Wall: Breathing
                const scale = 1 + Math.sin(time * 2) * 0.1; 
                part.scale.set(scale, scale, scale);
                part.material.emissiveIntensity = 0.5 + Math.sin(time * 3) * 0.4;
                part.rotation.z = Math.sin(time) * 0.2;
                part.rotation.y += 0.01;
            } 
            else if (type === 'flash') {
                // Left Wall: Strobe
                const flash = Math.sin(time * 15) > 0.5 ? 2.0 : 0.2;
                part.material.emissiveIntensity = flash;
                part.rotation.x += 0.02;
                part.rotation.z += 0.01;
            }
        }
    });
    
    controls.update();
    renderer.render(scene, camera);
}

// -- Helpers --
function startGame() {
    if(questionManager) questionManager.reset();
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
    if(!questionManager) return;
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
    // 1. Find the selected button
    const selectedButton = document.querySelector('.option[data-selected="true"]');
    
    // 2. If no button selected, do nothing
    if (!selectedButton) return;
    
    // 3. Check the answer
    const selectedIndex = parseInt(selectedButton.dataset.index);
    const isCorrect = questionManager.checkAnswer(selectedIndex);
    
    const feedbackEl = document.getElementById('feedback');
    
    if (isCorrect) {
        // CASE A: CORRECT
        if(feedbackEl) {
            feedbackEl.textContent = 'Correct!';
            feedbackEl.style.color = '#27ae60';
        }
        
        // Play a success sound here if you had audio
        
        // Wait 1 second, then close modal and check for game progress
        setTimeout(() => {
            document.getElementById('question-modal').style.display = 'none';
            
            // --- NEW: Visual feedback for solved object ---
            // We need to know WHICH object triggered this. 
            // Since we don't pass the object to submitAnswer, we can just rely on the HUD.
            // But if you want the object to turn green, we'd need to track the 'currentInteractingObject'.
            
            updateHUD();
            
            if (!questionManager.hasMoreQuestions()) {
                unlockDoor();
            }
        }, 1000);
        
    } else {
        // CASE B: INCORRECT
        if(feedbackEl) {
            feedbackEl.textContent = 'Incorrect! Try again.';
            feedbackEl.style.color = '#e74c3c';
        }
        
        // IMPORTANT: We do NOT close the modal.
        // We do NOT increment the question index (handled in questions.js).
        // The player can simply select a different option and click Submit again.
        
        // Optional: Reset the selected button visual state after a moment?
        // For now, leaving it selected lets them see what they picked.
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
