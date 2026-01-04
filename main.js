let scene, camera, renderer, controls;
let objects = [];
let questionManager;
let gameActive = false;
let timeRemaining = 3600; // 60 minutes in seconds
let gameTimer;

// Initialize Three.js scene
function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    
    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.6, 5);
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('game-container').appendChild(renderer.domElement);
    
    // Add orbit controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1;
    controls.maxDistance = 10;
    controls.maxPolarAngle = Math.PI / 2 - 0.1;
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);
    
    // Create room
    createRoom();
    
    // Create interactive objects
    createInteractiveObjects();
    
    // Initialize question manager
    questionManager = new QuestionManager();
    
    // Setup event listeners
    setupEventListeners();
    
    // Start animation loop
    animate();
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
}

function createRoom() {
    const roomSize = 10;
    const wallThickness = 0.2;
    
    // Floor
    const floorGeometry = new THREE.PlaneGeometry(roomSize, roomSize);
    const floorMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x808080,
        side: THREE.DoubleSide
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = Math.PI / 2;
    floor.position.y = -roomSize/2;
    floor.receiveShadow = true;
    scene.add(floor);
    
    // Walls
    const wallMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    
    // Back wall
    const backWall = new THREE.Mesh(
        new THREE.BoxGeometry(roomSize, roomSize, wallThickness),
        wallMaterial
    );
    backWall.position.z = -roomSize/2;
    backWall.position.y = 0;
    backWall.castShadow = true;
    backWall.receiveShadow = true;
    scene.add(backWall);
    
    // Left wall
    const leftWall = backWall.clone();
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.x = -roomSize/2;
    leftWall.position.z = 0;
    scene.add(leftWall);
    
    // Right wall
    const rightWall = backWall.clone();
    rightWall.rotation.y = Math.PI / 2;
    rightWall.position.x = roomSize/2;
    rightWall.position.z = 0;
    scene.add(rightWall);
    
    // Ceiling
    const ceiling = floor.clone();
    ceiling.position.y = roomSize/2;
    scene.add(ceiling);
    
    // Door (front wall with opening)
    createDoor();
}

function createDoor() {
    const doorGeometry = new THREE.BoxGeometry(3, 5, 0.1);
    const doorMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.z = 5;
    door.position.y = 0;
    door.userData = { type: 'door', locked: true };
    door.castShadow = true;
    scene.add(door);
    
    // Door frame
    const frameGeometry = new THREE.BoxGeometry(4, 6, 0.2);
    const frameMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.position.z = 4.95;
    frame.position.y = 0;
    scene.add(frame);
}

function createInteractiveObjects() {
    // Physics experiment table
    const tableGeometry = new THREE.BoxGeometry(2, 0.2, 1);
    const tableMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const table = new THREE.Mesh(tableGeometry, tableMaterial);
    table.position.set(2, -4, 2);
    table.castShadow = true;
    table.receiveShadow = true;
    table.userData = { type: 'interactive', questionIndex: 0 };
    scene.add(table);
    objects.push(table);
    
    // Pendulum
    const pendulumBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.3, 0.1),
        new THREE.MeshLambertMaterial({ color: 0x333333 })
    );
    pendulumBase.position.set(-2, -4, -2);
    scene.add(pendulumBase);
    
    const pendulum = new THREE.Mesh(
        new THREE.SphereGeometry(0.3),
        new THREE.MeshLambertMaterial({ color: 0xff0000 })
    );
    pendulum.position.set(-2, -2, -2);
    pendulum.userData = { type: 'interactive', questionIndex: 1 };
    scene.add(pendulum);
    objects.push(pendulum);
    
    // Electrical circuit board
    const circuitGeometry = new THREE.BoxGeometry(1.5, 0.1, 1);
    const circuitMaterial = new THREE.MeshLambertMaterial({ color: 0x006400 });
    const circuit = new THREE.Mesh(circuitGeometry, circuitMaterial);
    circuit.position.set(-3, -4, 3);
    circuit.userData = { type: 'interactive', questionIndex: 2 };
    scene.add(circuit);
    objects.push(circuit);
    
    // Lens on wall
    const lensGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 32);
    const lensMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x87CEEB,
        transparent: true,
        opacity: 0.7
    });
    const lens = new THREE.Mesh(lensGeometry, lensMaterial);
    lens.position.set(0, 0, -4.9);
    lens.userData = { type: 'interactive', questionIndex: 0 };
    scene.add(lens);
    objects.push(lens);
}

function setupEventListeners() {
    // Start button
    document.getElementById('start-button').addEventListener('click', startGame);
    
    // Restart button
    document.getElementById('restart-button').addEventListener('click', restartGame);
    
    // Submit answer
    document.getElementById('submit-answer').addEventListener('click', submitAnswer);
    
    // Hint button
    document.getElementById('hint-button').addEventListener('click', showHint);
    
    // Click on 3D objects
    renderer.domElement.addEventListener('click', onObjectClick, false);
    
    // Topic selection
    document.getElementById('topic-select').addEventListener('change', (e) => {
        questionManager.setTopic(e.target.value);
    });
}

function startGame() {
    const topic = document.getElementById('topic-select').value;
    questionManager.setTopic(topic);
    questionManager.reset();
    
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('question-modal').style.display = 'none';
    
    gameActive = true;
    timeRemaining = 3600; // 60 minutes
    updateTimerDisplay();
    
    // Start game timer
    clearInterval(gameTimer);
    gameTimer = setInterval(() => {
        if (gameActive && timeRemaining > 0) {
            timeRemaining--;
            updateTimerDisplay();
            
            if (timeRemaining <= 0) {
                endGame(false);
            }
        }
    }, 1000);
    
    // Update HUD
    updateHUD();
}

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
        if (object.userData.type === 'interactive') {
            showQuestion();
        } else if (object.userData.type === 'door') {
            if (object.userData.locked) {
                alert('The door is locked! Solve all physics problems to unlock it.');
            } else {
                endGame(true);
            }
        }
    }
}

function showQuestion() {
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

function selectOption(event) {
    // Remove previous selections
    document.querySelectorAll('.option').forEach(btn => {
        btn.style.background = '#3498db';
    });
    
    // Highlight selected option
    event.target.style.background = '#2ecc71';
    
    // Store selected index
    event.target.dataset.selected = 'true';
}

function submitAnswer() {
    const selectedButton = document.querySelector('.option[data-selected="true"]');
    
    if (!selectedButton) {
        document.getElementById('feedback').textContent = 'Please select an answer!';
        document.getElementById('feedback').style.color = '#e74c3c';
        return;
    }
    
    const selectedIndex = parseInt(selectedButton.dataset.index);
    const isCorrect = questionManager.checkAnswer(selectedIndex);
    
    if (isCorrect) {
        document.getElementById('feedback').textContent = 'Correct! +100 points';
        document.getElementById('feedback').style.color = '#27ae60';
        
        setTimeout(() => {
            document.getElementById('question-modal').style.display = 'none';
            updateHUD();
            
            if (!questionManager.hasMoreQuestions()) {
                unlockDoor();
            }
        }, 1500);
    } else {
        document.getElementById('feedback').textContent = 'Incorrect! Try again.';
        document.getElementById('feedback').style.color = '#e74c3c';
    }
}

function showHint() {
    if (questionManager.hints > 0) {
        const hint = questionManager.getHint();
        document.getElementById('feedback').textContent = `Hint: ${hint}`;
        document.getElementById('feedback').style.color = '#f39c12';
        updateHUD();
        document.getElementById('hint-button').disabled = questionManager.hints <= 0;
    }
}

function unlockDoor() {
    // Find and unlock the door
    scene.children.forEach(child => {
        if (child.userData && child.userData.type === 'door') {
            child.userData.locked = false;
            child.material.color.setHex(0x32CD32); // Change to green
        }
    });
    
    alert('All problems solved! The door is now unlocked. Click on it to escape!');
}

function endGame(escaped) {
    gameActive = false;
    clearInterval(gameTimer);
    
    const endScreen = document.getElementById('end-screen');
    const endMessage = document.getElementById('end-message');
    const finalScore = document.getElementById('final-score');
    
    if (escaped) {
        endMessage.textContent = 'You escaped the physics lab!';
        endMessage.style.color = '#27ae60';
    } else {
        endMessage.textContent = 'Time\'s up! Try again.';
        endMessage.style.color = '#e74c3c';
    }
    
    finalScore.textContent = `Final Score: ${questionManager.score}`;
    endScreen.classList.remove('hidden');
}

function restartGame() {
    document.getElementById('end-screen').classList.add('hidden');
    startGame();
}

function animate() {
    requestAnimationFrame(animate);
    
    // Rotate interactive objects slightly
    objects.forEach(obj => {
        if (obj.userData.type === 'interactive') {
            obj.rotation.y += 0.01;
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

// Initialize when page loads
window.onload = init;
