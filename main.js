import * as THREE from 'three';
import { TDSLoader } from 'three/examples/jsm/loaders/TDSLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Define a global variable for the text file name
var txtFileName = 'animation/animation.txt';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 
    window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Function to create an object
function create(modelFileName) {
    return new Promise((resolve, reject) => {
        const loader = new TDSLoader();
        loader.load(modelFileName, function (loadedObject) {
            scene.add(loadedObject);
            loadedObject.position.set(0, 0, 0); // Set initial position
            resolve(loadedObject);
        }, undefined, function (error) {
            reject(error);
        });
    });
}

// Function to remove an object
function remove(object) {
    if (object && scene) {
        scene.remove(object);
    }
}

// Function to move an object to a goal position smoothly
function moveTo(object, goalPosition, duration = 1) {
    const startPosition = object.position.clone();
    const endPosition = new THREE.Vector3(goalPosition.x, goalPosition.y, goalPosition.z);
    const mixer = new THREE.AnimationMixer(object);
    const track = new THREE.VectorKeyframeTrack('.position', [0, duration], [
        startPosition.x, startPosition.y, startPosition.z,
        endPosition.x, endPosition.y, endPosition.z
    ]);
    const clip = new THREE.AnimationClip('move', duration, [track]);
    const action = mixer.clipAction(clip);
    action.setLoop(THREE.LoopOnce);
    action.clampWhenFinished = true;
    action.play();
    mixers.push(mixer);
}

// Function to rotate an object smoothly
function rotate(object, rotationAngles, duration = 1) {
    const startRotation = new THREE.Quaternion().setFromEuler(object.rotation.clone());
    const endRotation = new THREE.Quaternion().setFromEuler(new THREE.Euler(rotationAngles.x, 
        rotationAngles.y, rotationAngles.z));
    const mixer = new THREE.AnimationMixer(object);
    const track = new THREE.QuaternionKeyframeTrack('.quaternion', [0, duration], [
        startRotation.x, startRotation.y, startRotation.z, startRotation.w,
        endRotation.x, endRotation.y, endRotation.z, endRotation.w
    ]);
    const clip = new THREE.AnimationClip('rotate', duration, [track]);
    const action = mixer.clipAction(clip);
    action.setLoop(THREE.LoopOnce);
    action.clampWhenFinished = true;
    action.play();
    mixers.push(mixer);
}

// Function to scale an object smoothly
function scale(object, scaleFactors, duration = 1) {
    const startScale = object.scale.clone();
    const endScale = new THREE.Vector3(scaleFactors.x, scaleFactors.y, scaleFactors.z);
    const mixer = new THREE.AnimationMixer(object);
    const track = new THREE.VectorKeyframeTrack('.scale', [0, duration], [
        startScale.x, startScale.y, startScale.z,
        endScale.x, endScale.y, endScale.z
    ]);
    const clip = new THREE.AnimationClip('scale', duration, [track]);
    const action = mixer.clipAction(clip);
    action.setLoop(THREE.LoopOnce);
    action.clampWhenFinished = true;
    action.play();
    mixers.push(mixer);
}

// Add lights
const ambientLight = new THREE.AmbientLight(0x404040); // soft white light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1).normalize();
scene.add(directionalLight);

// Add ground
const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// Camera controls
const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(30, 100, 400);
controls.update();

// Render loop
const clock = new THREE.Clock();
const mixers = [];
let isPaused = false;
let pausedTime = 0; // Track the time when paused
let startTime = Date.now(); // Initialize startTime

function animate() {
    requestAnimationFrame(animate);
    if (!isPaused) {
        const delta = clock.getDelta();
        mixers.forEach(mixer => mixer.update(delta));
        controls.update();
        renderer.render(scene, camera);
    }
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

let objects = {}; // Dictionary to store multiple objects
let speedFactor = 1; // Speed factor for animation
let commands = []; // Array to store commands
let lineNumbers = []; // Array to store line numbers for each command

function fetchAndProcessFile(fileName) {
    fetch(fileName)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(data => {
            const lines = data.split('\n');
            totalLines = lines.length; // Set total number of lines
            let currentTime = 0;
            commands.length = 0; // Clear existing commands
            lineNumbers.length = 0; // Clear existing line numbers
            currentCommandIndex = 0; // Reset current command index

            lines.forEach((line, index) => {
                line = line.trim();
                let match;

                if (match = line.match(/time\s+([\d.]+)/)) {
                    currentTime = parseFloat(match[1]); // Update currentTime
                } else if (match = line.match(/(\w+)=create\(([^)]+)\)/)) {
                    const [_, varName, modelFileName] = match;
                    commands.push({ time: currentTime, action: () => {
                        create(modelFileName.trim()).then(createdObject => {
                            objects[varName] = createdObject;
                            updateProgress(); // Update progress display
                        }).catch(error => {
                            console.error('Error creating object:', error);
                        });
                    }});
                    lineNumbers.push(index + 1);
                } else if (match = line.match(/(\w+)\.moveTo\(([^)]+)\)/)) {
                    const [_, varName, coords] = match;
                    const [x, y, z] = coords.split(',').map(Number);
                    commands.push({ time: currentTime, action: () => {
                        if (objects[varName]) {
                            moveTo(objects[varName], { x, y, z });
                            updateProgress(); // Update progress display
                        }
                    }});
                    lineNumbers.push(index + 1);
                } else if (match = line.match(/(\w+)\.rotate\(([^)]+)\)/)) {
                    const [_, varName, angles] = match;
                    const [x, y, z] = angles.split(',').map(Number);
                    commands.push({ time: currentTime, action: () => {
                        if (objects[varName]) {
                            rotate(objects[varName], { x, y, z });
                            updateProgress(); // Update progress display
                        }
                    }});
                    lineNumbers.push(index + 1);
                } else if (match = line.match(/(\w+)\.scale\(([^)]+)\)/)) {
                    const [_, varName, factors] = match;
                    const [x, y, z] = factors.split(',').map(Number);
                    commands.push({ time: currentTime, action: () => {
                        if (objects[varName]) {
                            scale(objects[varName], { x, y, z });
                            updateProgress(); // Update progress display
                        }
                    }});
                    lineNumbers.push(index + 1);
                } else if (match = line.match(/(\w+)\.remove\(\)/)) {
                    const [_, varName] = match;
                    commands.push({ time: currentTime, action: () => {
                        if (objects[varName]) {
                            remove(objects[varName]);   // remove object from scene
                            delete objects[varName];    // remove object from dictionary objects in line 125
                            updateProgress(); // Update progress display
                        }
                    }});
                    lineNumbers.push(index + 1);
                }
            });

            // Execute commands based on their scheduled times
            startTime = Date.now(); // Reset startTime when processing a new file
            updateProgress(); // Initialize progress display
            executeCommands();
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// Define a minimum speed factor
const MIN_SPEED_FACTOR = 0.3;
const SPEED_INCREMENT = 0.1; // Define the increment value

// Function to update the speed bar
function updateSpeedBar() {
    const speedBar = document.getElementById('speedBar');
    speedBar.textContent = `Speed: ${speedFactor.toFixed(1)}x`;
}

// Function to adjust startTime when speedFactor changes
// necessary for synchronization of animations
// prevent delays or jumps in animations
function adjustStartTime() {
    const currentTime = Date.now();
    const elapsedTime = (currentTime - startTime - pausedTime) / speedFactor;
    startTime = currentTime - elapsedTime * speedFactor;
}

// Event listeners for speed control
window.addEventListener('keydown', (event) => {
    if (event.key === '+') {
        speedFactor += SPEED_INCREMENT; // Increase speed by a fixed value
        adjustStartTime(); // Adjust startTime
        updateMixersSpeed();
        updateSpeedBar(); // Update speed bar
    } else if (event.key === '-') {
        speedFactor -= SPEED_INCREMENT; // Decrease speed by a fixed value
        if (speedFactor < MIN_SPEED_FACTOR) {
            speedFactor = MIN_SPEED_FACTOR; // Enforce minimum speed factor
        }
        adjustStartTime(); // Adjust startTime
        updateMixersSpeed();
        updateSpeedBar(); // Update speed bar
    } else if (event.key === 'p') { // Press 'p' to pause/resume
        isPaused = !isPaused;
        if (isPaused) {
            pausedTime = Date.now(); // Record the time when paused
        } else {
            startTime += Date.now() - pausedTime; // Adjust startTime by the paused duration
            pausedTime = 0; // Reset pausedTime
        }
    }
});

// Call updateSpeedBar initially to set the initial speed
updateSpeedBar();

function updateMixersSpeed() {
    mixers.forEach(mixer => {
        mixer.timeScale = speedFactor;
    });
}

// Event listener for file selection
window.addEventListener('fileSelected', (event) => {
    txtFileName = event.detail;
    resetScene();
    fetchAndProcessFile(txtFileName);
});

function resetScene() {
    // Remove all objects from the scene
    while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
    }
    // Clear objects dictionary
    objects = {};
    // Reset mixers
    mixers.length = 0;
    // Reset clock
    clock.start();
    // Re-add lights and ground
    scene.add(ambientLight);
    scene.add(directionalLight);
    scene.add(ground);
}

// Add this line at the beginning of the file
let isStepping = false;
let currentCommandIndex = 0;
let totalLines = 0; // Track the total number of lines

// Add this function to execute the next command
function executeNextCommand() {
    if (currentCommandIndex < commands.length) {
        commands[currentCommandIndex].action();
        currentCommandIndex++;
        updateProgress(); // Update progress display
    }
}

// Add this event listener for the step line button
document.getElementById('stepLine').addEventListener('click', () => {
    isStepping = true;
    executeNextCommand();
});

// Add this event listener for the step timestamp button
document.getElementById('stepTimestampButton').addEventListener('click', () => {
    isStepping = true;
    stepToNextTimestamp();
});

// Add this event listener for the resume button
document.getElementById('resume').addEventListener('click', () => {
    isStepping = false;
    executeCommands();
});

// Function to step to the next timestamp
function stepToNextTimestamp() {
    if (commands.length === 0) return;

    let nextTimestamp = commands[currentCommandIndex].time;
    while (currentCommandIndex < commands.length && commands[currentCommandIndex].time === nextTimestamp) {
        commands[currentCommandIndex].action();
        currentCommandIndex++;
        updateProgress(); // Update progress display
    }

    // Continue stepping if there are more commands
    if (currentCommandIndex < commands.length) {
        requestAnimationFrame(executeCommands);
    } else {
        isStepping = false;
    }
}

// Modify the executeCommands function to support stepping
function executeCommands() {
    if (!isPaused && !isStepping) {
        let elapsedTime = (Date.now() - startTime - pausedTime) / 1000 * speedFactor; // Apply speed factor
        while (currentCommandIndex < commands.length && elapsedTime >= commands[currentCommandIndex].time) {
            commands[currentCommandIndex].action();
            currentCommandIndex++; // Update current command index
            updateProgress(); // Update progress display
        }
    }
    if (currentCommandIndex < commands.length) {
        requestAnimationFrame(executeCommands);
    }
}

// Function to update the progress display
function updateProgress() {
    const progressElement = document.getElementById('progress');
    const currentLine = lineNumbers[currentCommandIndex] || 0;
    progressElement.textContent = `Line ${currentLine} of ${totalLines} lines`;
}