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
    1: { wall: 0x2c3e50, floor: 0x34495e, light: 0xFFFFFF }, // Chalkboard Style
    2: { wall: 0x2E4053, floor: 0x1B2631, light: 0xCDDC39 }, // Deep Lab
    3: { wall: 0x424242, floor: 0x212121, light: 0xFF9800 }, // Concrete/Industrial
    4: { wall: 0x1A237E, floor: 0x0D123F, light: 0x00BCD4 }, // Blueprint Blue
    5: { wall: 0x311B92, floor: 0x111111, light: 0xD500F9 }  // Deep Space
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

// --- ORGANIC TEXTURE GENERATOR ---
function createScienceTexture(baseColorHex, type) {
    const canvas = document.createElement('canvas');
    // Larger canvas for better detail
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    const baseColor = new THREE.Color(baseColorHex);
    
    // 1. Organic Background (Noise & Grunge)
    ctx.fillStyle = '#' + baseColor.getHexString();
    ctx.fillRect(0, 0, 1024, 1024);
    
    // Add noise layers for "texture"
    for(let i=0; i<4000; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 1024;
        const size = Math.random() * 3 + 1;
        const opacity = Math.random() * 0.05;
        // Randomize slightly lighter or darker than base
        ctx.fillStyle = Math.random() > 0.5 ? 
            `rgba(255,255,255,${opacity})` : 
            `rgba(0,0,0,${opacity})`;
        ctx.fillRect(x, y, size, size);
    }

    // 2. Smudges (Cloud-like Erasure marks)
    for(let i=0; i<20; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 1024;
        const rad = Math.random() * 100 + 50;
        const grd = ctx.createRadialGradient(x, y, 0, x, y, rad);
        grd.addColorStop(0, `rgba(255,255,255,0.03)`);
        grd.addColorStop(1, `rgba(255,255,255,0)`);
        ctx.fillStyle = grd;
        ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI*2); ctx.fill();
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

    // 3. Draw Elements (Walls vs Floors)
    if (type === 'wall') {
        
        // A. The "Ghost" Layer (Looks like erased chalk)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        for(let i=0; i<15; i++) {
            const x = Math.random() * 1024;
            const y = Math.random() * 1024;
            ctx.font = `italic ${Math.random()*40 + 20}px Times New Roman`;
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate((Math.random() - 0.5) * 1.0); 
            ctx.fillText(equations[Math.floor(Math.random() * equations.length)], 0, 0);
            ctx.restore();
        }

        // B. The "Fresh" Layer
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'; // Brighter
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;

        // Draw Equations
        for(let i=0; i<8; i++) {
            const x = Math.random() * 800 + 112; // Keep somewhat central
            const y = Math.random() * 800 + 112;
            ctx.font = `bold ${Math.random()*30 + 20}px Courier New`;
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate((Math.random() - 0.5) * 0.2); // Slight organic tilt
            ctx.fillText(equations[Math.floor(Math.random() * equations.length)], 0, 0);
            ctx.restore();
        }

        // Draw Diagrams (Organic Scribbles)
        for(let i=0; i<5; i++) {
            const cx = Math.random() * 1024;
            const cy = Math.random() * 1024;
            
            ctx.beginPath();
            if (Math.random() > 0.5) {
                // Solenoid / Coil Drawing
                let startX = cx - 50;
                ctx.moveTo(startX, cy);
                for(let j=0; j<10; j++) {
                    startX += 10;
                    ctx.bezierCurveTo(startX, cy-20, startX+5, cy+20, startX+10, cy);
                }
            } else {
                // Vector Field Arrows
                ctx.moveTo(cx, cy);
                ctx.lineTo(cx + 40, cy - 40);
                ctx.moveTo(cx + 40, cy - 40);
                ctx.lineTo(cx + 30, cy - 40);
                ctx.moveTo(cx + 40, cy - 40);
                ctx.lineTo(cx + 40, cy - 30);
                // Circle around it
                ctx.moveTo(cx+50, cy);
                ctx.arc(cx, cy, 30, 0, Math.PI*2);
            }
            ctx.stroke();
        }

    } else {
        // FLOOR - Technical but worn
        
        // Faint Grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for(let i=0; i<=1024; i+=64) {
            // Add jitter to lines so they aren't perfect
            ctx.moveTo(i + Math.random()*2, 0); ctx.lineTo(i - Math.random()*2, 1024);
            ctx.moveTo(0, i + Math.random()*2); ctx.lineTo(1024, i - Math.random()*2);
        }
        ctx.stroke();

        // Magnetic Field Markers
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.font = '30px Arial';
        for(let x=64; x<1024; x+=192) {
            for(let y=64; y<1024; y+=192) {
                // Skip some to make it look organic/worn
                if(Math.random() > 0.3) {
                    if(Math.random() > 0.5) {
                        ctx.fillText("×", x + Math.random()*10, y + Math.random()*10);
                        ctx.beginPath(); ctx.arc(x, y, 20, 0, Math.PI*2); ctx.stroke();
                    } else {
                        ctx.fillText("•", x, y);
                    }
                }
            }
        }
    }

    const texture = new THREE.CanvasTexture(canvas);
    // No repeating - we stretch one unique "painting" across the whole wall/floor
    // to avoid tiling artifacts.
    texture.minFilter = THREE.LinearFilter;
    
    return texture;
}

function createRoom(theme) {
    const roomWidth = 14;
    const roomDepth = 20; 
    const roomHeight = 10;
    
    // GENERATE UNIQUE TEXTURES FOR EVERY SURFACE
    // This ensures no two walls look the same
    const floorTexture = createScienceTexture(theme.floor, 'floor');
    
    const backWallTex = createScienceTexture(theme.wall, 'wall');
    const leftWallTex = createScienceTexture(theme.wall, 'wall');
    const rightWallTex = createScienceTexture(theme.wall, 'wall');

    const createWall = (w, h, d, map, x, y, z, rotY = 0) => {
        const geo = new THREE.BoxGeometry(w, h, d);
        const mat = new THREE.MeshStandardMaterial({ 
            map: map, 
            roughness: 0.8, // Rougher walls
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
        map: floorTexture, 
        roughness: 0.6,
        metalness: 0.3
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -roomHeight/2 + 0.1;
    floor.receiveShadow = true;
    scene.add(floor);

    // Ceiling
    const ceilingGeo = new THREE.PlaneGeometry(roomWidth, roomDepth);
    const ceilingMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = roomHeight/2;
    scene.add(ceiling);

    // Walls - Pass unique textures
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
    
    // 1. Back Wall Object
    objectConfigs.push({
        type: 'wall',
        wallSide: 'back',
        x: (Math.random() * 8) - 4,
        y: 0,
        z: -9.8, 
        rotY: 0,
        animType: 'pulse'
    });

    // 2. Left Wall Object
    objectConfigs.push({
        type: 'wall',
        wallSide: 'left',
        x: -6.8, 
        y: 0,
        z: (Math.random() * 12) - 6,
        rotY: Math.PI / 2, 
        animType: 'flash'
    });

    // 3. Three Ground Objects
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

    objectConfigs.forEach((config, index) => {
        let mesh;
        
        if (config.type === 'wall') {
            const group = new THREE.Group();
            
            // Base geometry (Flat against wall)
            const base = new THREE.Mesh(
                new THREE.BoxGeometry(1.5, 1.5, 0.3), 
                new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.5 })
            );
            group.add(base);

            // Sci-Fi Geometry
            let artMesh;
            if (config.animType === 'pulse') {
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
            
            artMesh.position.z = 0.6; 
            group.add(artMesh);
            mesh = group;
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
            
            const ped = new THREE.Mesh(
                new THREE.CylinderGeometry(1.5, 2, 1, 32),
                new THREE.MeshStandardMaterial({ color: 0x111111 })
            );
            ped.position.set(config.x, config.y - 1.2, config.z);
            scene.add(ped);
            
            mesh = mesh; 
            mesh.userData.animPart = mesh;
        }

        mesh.position.set(config.x, config.y, config.z);
        mesh.rotation.y = config.rotY;
        
        mesh.userData.type = 'interactive';
        mesh.userData.questionIndex = index;
        mesh.userData.animType = config.animType;
        mesh.userData.posType = config.type; 

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
                part.rotation.y += 0.02;
                part.rotation.z += 0.01;
            } 
            else if (type === 'pulse') {
                const scale = 1 + Math.sin(time * 2) * 0.1; 
                part.scale.set(scale, scale, scale);
                part.material.emissiveIntensity = 0.5 + Math.sin(time * 3) * 0.4;
                part.rotation.z = Math.sin(time) * 0.2;
                part.rotation.y += 0.01;
            } 
            else if (type === 'flash') {
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
        setTimeout(() => {
            document.getElementById('question-modal').style.display = 'none';
            updateHUD();
            if (!questionManager.hasMoreQuestions()) {
                unlockDoor();
            }
        }, 1000);
    } else {
        if(feedbackEl) {
            feedbackEl.textContent = 'Incorrect! -20 Points. Try again.';
            feedbackEl.style.color = '#e74c3c';
        }
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
