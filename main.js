// main.js
let scene, camera, renderer, controls;
let objects = [];
let questionManager;
let audioManager; 
let gameActive = false;
let timeRemaining = 3600; 
let gameTimer;
let currentLevel = 1;
const MAX_LEVELS = 5;

// Visual Themes
const ROOM_THEMES = {
    1: { wall: 0x27ae60, floor: 0x2ecc71, ceiling: 0xE8F5E9, light: 0xFFFFFF }, 
    2: { wall: 0x2980b9, floor: 0x3498db, ceiling: 0xE3F2FD, light: 0xFFEB3B }, 
    3: { wall: 0xd35400, floor: 0xe67e22, ceiling: 0xFFF3E0, light: 0xFF9800 }, 
    4: { wall: 0x8e44ad, floor: 0x9b59b6, ceiling: 0xF3E5F5, light: 0x00E5FF }, 
    5: { wall: 0x16a085, floor: 0x1abc9c, ceiling: 0xE0F2F1, light: 0xD500F9 } 
};

// --- AUDIO MANAGER CLASS ---
class AudioManager {
    constructor() {
        this.bgmTracks = [
            'assets/bgm1.mp3',
            'assets/bgm2.mp3',
            'assets/bgm3.mp3' 
        ];

        this.bgm = new Audio();
        this.bgm.loop = true;
        this.bgm.volume = 0.4; 

        this.applause = new Audio('assets/applause.mp3');
        this.fail = new Audio('assets/fail.mp3');
        this.success = new Audio('assets/success.mp3');

        this.applause.volume = 0.8;
        this.fail.volume = 0.8;
        this.success.volume = 1.0;
    }

    playRandomBGM() {
        if(this.bgmTracks.length > 0) {
            const randomIndex = Math.floor(Math.random() * this.bgmTracks.length);
            this.bgm.src = this.bgmTracks[randomIndex];
            this.bgm.play().catch(e => console.log("Audio autoplay blocked"));
        }
    }

    resumeBGM() {
        if (this.bgm.src && this.bgm.paused) {
            this.bgm.play().catch(e => console.log("Audio resume blocked"));
        }
    }

    stopBGM() {
        this.bgm.pause();
    }

    playApplause() {
        this.applause.currentTime = 0; 
        this.applause.play();
    }

    playFail() {
        this.fail.currentTime = 0;
        this.fail.play();
    }

    playSuccess() {
        this.success.currentTime = 0;
        this.success.play();
    }
}

function init() {
    scene = new THREE.Scene();
    
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    // --- UPDATED CAMERA POSITION ---
    // Lowered Y to -2 (closer to ground) and Z to 14 (closer to room)
    camera.position.set(0, -2, 14); 
    
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
    
    // --- UPDATED CONTROLS ---
    // Target is now at eye-level (y=-2) instead of center (y=0)
    controls.target.set(0, -2, 0); 
    // Allow camera to go slightly lower (just above horizontal)
    controls.maxPolarAngle = Math.PI / 2 + 0.2; 
    
    if (typeof QuestionManager !== 'undefined') {
        questionManager = new QuestionManager();
    } else {
        console.error("QuestionManager not loaded. Check questions.js");
    }

    audioManager = new AudioManager();

    setupEventListeners();
    
    animate();
    window.addEventListener('resize', onWindowResize);
    
    const startScreen = document.getElementById('start-screen');
    if(startScreen) startScreen.classList.remove('hidden');
}

async function loadLevel(level) {
    currentLevel = level;
    
    // Clear previous level objects
    while(scene.children.length > 0){ 
        scene.remove(scene.children[0]); 
    }
    objects = []; 

    scene.background = new THREE.Color(0x111111);

    const theme = ROOM_THEMES[level];
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(theme.light, 1.2, 50);
    pointLight.position.set(0, 10, 0);
    pointLight.castShadow = true;
    scene.add(pointLight);

    createRoom(theme);
    createInteractiveObjects(level);
    
    // --- CRITICAL FIX START ---
    if (questionManager) {
        // We use the NEW method name 'loadLevelData' and 'await' it
        // This ensures questions are loaded BEFORE we continue.
        await questionManager.loadLevelData(level);
        
        updateHUD();
        const levelDisplay = document.getElementById('level-display');
        if(levelDisplay) levelDisplay.textContent = `Level: ${level} - ${questionManager.getTheme()}`;
    }
    // --- CRITICAL FIX END ---
}

// --- TEXTURE GENERATOR ---
function createScienceTexture(baseColorHex, type, isLightBackground = false) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    const baseColor = new THREE.Color(baseColorHex);
    
    ctx.fillStyle = '#' + baseColor.getHexString();
    ctx.fillRect(0, 0, 1024, 1024);
    
    for(let i=0; i<4000; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 1024;
        const size = Math.random() * 3 + 1;
        const opacity = Math.random() * 0.03; 
        ctx.fillStyle = Math.random() > 0.5 ? `rgba(255,255,255,${opacity})` : `rgba(0,0,0,${opacity})`;
        ctx.fillRect(x, y, size, size);
    }

    const equations = [
        "ε = -N(dΦ/dt)", "Φ = ∫B·dA", "F = q(v × B)",
        "V = -L(dI/dt)", "∮B·dl = μ₀I", "ε = Blv",
        "W = ½LI²", "τ = L/R", "Z = √(R² + (ωL)²)",
        "∇×E = -∂B/∂t", "∇·B = 0", "E = mc²", "F = ma",
        "λ = h/p", "i² = -1", "e^(iπ) + 1 = 0"
    ];

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const inkColorMain = isLightBackground ? 'rgba(40, 60, 80, 0.6)' : 'rgba(255, 255, 255, 0.6)';
    const inkColorFaint = isLightBackground ? 'rgba(40, 60, 80, 0.1)' : 'rgba(255, 255, 255, 0.1)';

    if (type === 'wall') {
        ctx.fillStyle = inkColorFaint; 
        for(let i=0; i<10; i++) {
            const x = Math.random() * 1024;
            const y = Math.random() * 1024;
            ctx.font = `italic ${Math.random()*40 + 20}px Times New Roman`;
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate((Math.random() - 0.5) * 0.5); 
            ctx.fillText(equations[Math.floor(Math.random() * equations.length)], 0, 0);
            ctx.restore();
        }
        
        ctx.fillStyle = inkColorMain; 
        ctx.strokeStyle = inkColorMain;
        ctx.lineWidth = 3;
        
        for(let i=0; i<6; i++) {
            const x = Math.random() * 800 + 112; 
            const y = Math.random() * 800 + 112;
            ctx.font = `bold ${Math.random()*30 + 30}px Courier New`;
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate((Math.random() - 0.5) * 0.2); 
            ctx.fillText(equations[Math.floor(Math.random() * equations.length)], 0, 0);
            ctx.restore();
        }
        
        for(let i=0; i<4; i++) {
            const cx = Math.random() * 900 + 50;
            const cy = Math.random() * 900 + 50;
            ctx.beginPath();
            if (Math.random() > 0.5) {
                let startX = cx - 50;
                ctx.moveTo(startX, cy);
                for(let j=0; j<8; j++) {
                    startX += 12;
                    ctx.bezierCurveTo(startX, cy-25, startX+6, cy+25, startX+12, cy);
                }
            } else {
                ctx.arc(cx, cy, 40, 0, Math.PI*2);
                ctx.moveTo(cx-50, cy); ctx.lineTo(cx+50, cy);
                ctx.moveTo(cx, cy-50); ctx.lineTo(cx, cy+50);
            }
            ctx.stroke();
        }
    } else {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for(let i=0; i<=1024; i+=128) { 
            ctx.moveTo(i, 0); ctx.lineTo(i, 1024);
            ctx.moveTo(0, i); ctx.lineTo(1024, i);
        }
        ctx.stroke();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.font = '40px Arial';
        for(let x=64; x<1024; x+=256) {
            for(let y=64; y<1024; y+=256) {
                if(Math.random() > 0.4) {
                    if(Math.random() > 0.5) {
                        ctx.fillText("×", x, y);
                        ctx.beginPath(); ctx.arc(x, y, 25, 0, Math.PI*2); ctx.stroke();
                    } else {
                        ctx.fillText("•", x, y);
                    }
                }
            }
        }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    return texture;
}

function createRoom(theme) {
    const roomWidth = 14;
    const roomDepth = 20; 
    const roomHeight = 10;
    
    const floorTexture = createScienceTexture(theme.floor, 'floor');
    const backWallTex = createScienceTexture(theme.wall, 'wall', false);
    const leftWallTex = createScienceTexture(theme.wall, 'wall', false);
    const rightWallTex = createScienceTexture(theme.wall, 'wall', false);
    const ceilingTex = createScienceTexture(theme.ceiling, 'wall', true);

    const createWall = (w, h, d, map, x, y, z, rotY = 0) => {
        const geo = new THREE.BoxGeometry(w, h, d);
        const mat = new THREE.MeshStandardMaterial({ map: map, roughness: 0.5, metalness: 0.1 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y, z);
        mesh.rotation.y = rotY;
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        scene.add(mesh);
        return mesh;
    };

    const floorGeo = new THREE.PlaneGeometry(roomWidth, roomDepth);
    const floorMat = new THREE.MeshStandardMaterial({ map: floorTexture, roughness: 0.4, metalness: 0.1 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -roomHeight/2 + 0.1;
    floor.receiveShadow = true;
    scene.add(floor);

    const ceilingGeo = new THREE.PlaneGeometry(roomWidth, roomDepth);
    const ceilingMat = new THREE.MeshStandardMaterial({ map: ceilingTex, roughness: 0.9, metalness: 0.0 });
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = roomHeight/2;
    scene.add(ceiling);

    createWall(roomWidth, roomHeight, 0.5, backWallTex, 0, 0, -roomDepth/2); 
    createWall(roomDepth, roomHeight, 0.5, leftWallTex, -roomWidth/2, 0, 0, Math.PI/2); 
    createWall(roomDepth, roomHeight, 0.5, rightWallTex, roomWidth/2, 0, 0, Math.PI/2); 
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
    objectConfigs.push({ type: 'wall', wallSide: 'back', x: (Math.random() * 8) - 4, y: 0, z: -9.8, rotY: 0, animType: 'pulse' });
    objectConfigs.push({ type: 'wall', wallSide: 'left', x: -6.8, y: 0, z: (Math.random() * 12) - 6, rotY: Math.PI / 2, animType: 'flash' });

    const groundPoints = [];
    let attempts = 0;
    while(groundPoints.length < 3 && attempts < 100) {
        attempts++;
        const candidate = { x: (Math.random() * 10) - 5, z: (Math.random() * 14) - 7 };
        let tooClose = false;
        for(let p of groundPoints) {
            const dx = p.x - candidate.x;
            const dz = p.z - candidate.z;
            if (Math.sqrt(dx*dx + dz*dz) < 3.0) tooClose = true;
        }
        if(!tooClose) groundPoints.push(candidate);
    }
    groundPoints.forEach(p => {
        objectConfigs.push({ type: 'floor', x: p.x, y: -3.5, z: p.z, rotY: Math.random() * Math.PI, animType: 'rotate' });
    });

    objectConfigs.forEach((config, index) => {
        let mesh;
        if (config.type === 'wall') {
            const group = new THREE.Group();
            const base = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 0.3), new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.5 }));
            group.add(base);
            let artMesh;
            if (config.animType === 'pulse') {
                const geo = new THREE.IcosahedronGeometry(0.8, 0);
                const mat = new THREE.MeshStandardMaterial({ color: 0x00FFFF, emissive: 0x0088AA, emissiveIntensity: 0.8, wireframe: true });
                artMesh = new THREE.Mesh(geo, mat);
                const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.4), new THREE.MeshStandardMaterial({ color: 0xFFFFFF, emissive: 0xFFFFFF }));
                artMesh.add(core);
            } else {
                const geo = new THREE.TorusKnotGeometry(0.5, 0.15, 64, 8);
                const mat = new THREE.MeshStandardMaterial({ color: 0xFF00FF, emissive: 0x550055, emissiveIntensity: 0.5, roughness: 0.2, metalness: 0.8 });
                artMesh = new THREE.Mesh(geo, mat);
            }
            artMesh.position.z = 0.6; 
            group.add(artMesh);
            mesh = group;
            mesh.userData.animPart = artMesh;
        } else {
            if (level % 2 !== 0) { 
                 const geo = new THREE.IcosahedronGeometry(1.2, 0);
                 const mat = new THREE.MeshStandardMaterial({ color: 0xff0000, wireframe: true, emissive: 0x550000 });
                 mesh = new THREE.Mesh(geo, mat);
            } else { 
                 const geo = new THREE.TorusKnotGeometry(0.8, 0.25, 100, 16);
                 const mat = new THREE.MeshStandardMaterial({ color: 0x00ff00, metalness: 0.8, roughness: 0.1 });
                 mesh = new THREE.Mesh(geo, mat);
            }
            const ped = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 2, 1, 32), new THREE.MeshStandardMaterial({ color: 0x111111 }));
            ped.position.set(config.x, config.y - 1.2, config.z);
            scene.add(ped);
            mesh.userData.animPart = mesh;
        }
        mesh.position.set(config.x, config.y, config.z);
        mesh.rotation.y = config.rotY;
        mesh.userData.type = 'interactive';
        mesh.userData.questionIndex = index;
        mesh.userData.animType = config.animType;
        mesh.userData.posType = config.type; 
        mesh.traverse((child) => { if (child !== mesh) child.userData = { type: 'interactive', parent: mesh }; });
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
                part.rotation.y += 0.02;
                part.rotation.z += 0.01;
            } else if (type === 'pulse') {
                const scale = 1 + Math.sin(time * 2) * 0.1; 
                part.scale.set(scale, scale, scale);
                part.material.emissiveIntensity = 0.5 + Math.sin(time * 3) * 0.4;
                part.rotation.z = Math.sin(time) * 0.2;
                part.rotation.y += 0.01;
            } else if (type === 'flash') {
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

function startGame() {
    if(questionManager) questionManager.reset();
    ['start-screen', 'end-screen'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.classList.add('hidden');
    });
    document.getElementById('question-modal').style.display = 'none';
    if(audioManager) audioManager.playRandomBGM(); 
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

    // --- MOBILE SUPPORT ADDITION ---
    // Prevent default behavior to stop double-firing on some devices
    if(event.type === 'touchstart') event.preventDefault();
    
    const mouse = new THREE.Vector2();
    // Check if it is a Touch event (Mobile) or Mouse event (Desktop)
    if (event.changedTouches && event.changedTouches.length > 0) {
        // Mobile: Use the first finger's position
        mouse.x = (event.changedTouches[0].clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.changedTouches[0].clientY / window.innerHeight) * 2 + 1;
    } else {
        // Desktop: Use mouse position
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }
    //mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    //mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
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
            if(audioManager) audioManager.stopBGM();
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
    
    // 1. Set text (allows HTML/MathJax)
    const qTextEl = document.getElementById('question-text');
    qTextEl.innerHTML = question.question; 
    
    // 2. Render Math
    if(window.MathJax) {
        MathJax.typesetPromise([qTextEl]).catch(err => console.log(err));
    }

    // ... rest of the function (creating buttons) ...
    const container = document.getElementById('options-container');
    container.innerHTML = '';
    question.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'option';
        
        // Render Math in buttons too!
        btn.innerHTML = opt; 
        
        btn.dataset.index = i;
        btn.addEventListener('click', selectOption);
        container.appendChild(btn);
    });
    
    // Render Math in options
    if(window.MathJax) {
        MathJax.typesetPromise([container]).catch(err => console.log(err));
    }

    document.getElementById('feedback').textContent = '';
    document.getElementById('question-modal').style.display = 'block';
    document.getElementById('hint-button').disabled = questionManager.hints <= 0;
}

function selectOption(event) {
    document.querySelectorAll('.option').forEach(btn => {
        btn.style.background = '#3498db';
        delete btn.dataset.selected;
    });
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
        if(audioManager) audioManager.playApplause();
        setTimeout(() => {
            document.getElementById('question-modal').style.display = 'none';
            updateHUD();
            if (!questionManager.hasMoreQuestions()) {
                unlockDoor();
                if(audioManager) {
                    audioManager.stopBGM(); 
                    audioManager.playSuccess();
                }
            } else {
                if(audioManager) audioManager.resumeBGM();
            }
        }, 1000);
    } else {
        if(feedbackEl) {
            feedbackEl.textContent = 'Incorrect! -20 Points. Try again.';
            feedbackEl.style.color = '#e74c3c';
        }
        if(audioManager) audioManager.playFail();
        updateHUD();
    }
}

function showHint() {
    if (questionManager.hints > 0) {
        document.getElementById('feedback').textContent = `Hint (-50 pts): ${questionManager.getHint()}`;
        document.getElementById('feedback').style.color = '#f39c12';
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
    if(audioManager) audioManager.stopBGM();
}

function restartGame() { startGame(); }

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function setupEventListeners() {
    // UI Buttons
    const ids = ['start-button', 'restart-button', 'submit-answer', 'hint-button'];
    const funcs = [startGame, restartGame, submitAnswer, showHint];
    ids.forEach((id, i) => { 
        const el = document.getElementById(id); 
        if(el) el.addEventListener('click', funcs[i]); 
    });

    // 3D Interactions
    // Desktop Click
    renderer.domElement.addEventListener('click', onObjectClick, false);
    // Mobile Tap (passive: false allows us to use preventDefault if needed)
    renderer.domElement.addEventListener('touchstart', onObjectClick, { passive: false });
}

window.onload = init;
