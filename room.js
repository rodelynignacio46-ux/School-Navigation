const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x1a1a1a, 1);
document.getElementById('viewer').appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(50, 100, 1);
scene.add(directionalLight);

const loader = new THREE.GLTFLoader();
let gltfScene;
loader.load(
    'model.glb',
    function (gltf) {
        gltfScene = gltf.scene;
        scene.add(gltf.scene);
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const center = box.getCenter(new THREE.Vector3());
        gltf.scene.position.sub(center);
        camera.position.set(0, 920, box.getSize(new THREE.Vector3()).length() * 1.5);

        gltfScene.traverse((child) => {
            if (child.isMesh) {
                child.originalColor = child.material.color.clone();
                child.material = child.material.clone();
            }
        });

        highlightConnectionPoints();
    },
    function (error) {
        console.error('An error happened', error);
    }
);

function createTextSprite(text) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 512; 
    canvas.height = 256;
    
    context.beginPath();
    context.arc(30, 64, 20, 0, 2 * Math.PI);
    context.fillStyle = 'rgba(255, 255, 255, 0.8)'
    context.fill();
    
    context.font = 'Bold 50px Arial';
    context.fillStyle = 'rgba(255, 255, 255, 1)'; 
    context.fillText(text, 60, 80);
    
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(24, 10, 1);
    return sprite;
}

function highlightConnectionPoints() {
    const sphereGeometry = new THREE.SphereGeometry(0.8, 10, 10); 
    const sphereMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xff0000,
        transparent: true, 
        opacity: 0
    });

    Object.entries(connectionPoints).forEach(([roomId, pos]) => {
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.position.set(pos.x, pos.y + 5, pos.z || 0);
        sphere.name = `highlight_${roomId}`;
        scene.add(sphere);

        const excludeLabels = ['B2.up', 'B2.down', 'B4.up', 'B4.down'];
        if (!roomId.startsWith('Hallway') && !excludeLabels.includes(roomId)) {
            const label = createTextSprite(roomId);
            label.position.set(pos.x + 5, pos.y + 10, pos.z || 0);
            label.name = `label_${roomId}`;
            scene.add(label);
        }
    });
}

function highlightConnectionPoints() {
    const sphereGeometry = new THREE.SphereGeometry(0.8, 10, 10); 
    const sphereMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xff0000,
        transparent: true, 
        opacity: 0
    });

    Object.entries(connectionPoints).forEach(([roomId, pos]) => {
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.position.set(pos.x, pos.y, pos.z || 0);
        sphere.name = `highlight_${roomId}`;
        scene.add(sphere);

        const excludeLabels = ['B2.up', 'B2.down', 'B4.up', 'B4.down'];
        if (!roomId.startsWith('Hallway') && !excludeLabels.includes(roomId)) {
            const label = createTextSprite(roomId);
            label.position.set(pos.x + 10, pos.y + 10, pos.z || 0);
            label.name = `label_${roomId}`;
            scene.add(label);
        }
    });
}

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 1;
controls.maxDistance = 500;
controls.maxPolarAngle = Math.PI / 2;

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

const graph = {
    'Entrance': ['Hallway'],
    'Exit': ['Hallway8b'],
    'Family clinic': ['Hallway'],
    'Admission': ['Hallway'],
    'Hallway': ['Hallway1', 'Family clinic', 'Admission','Entrance'],
    'Hallway1': ['Hallway','Computer lab', 'Hallway2'],
    'Hallway2': ['Hallway1', 'Hallway2a', 'Hallway3'],
    'Hallway2a': ['Hallway2','Maintenance', 'Cr1', 'Cr2'],
    'Hallway3': ['Hallway2', 'School lounge', 'Drugtest', 'Hallway4'],
    'Hallway4': ['Hallway3', 'Hallway4a', 'Hallway5'],
    'Hallway4a': ['Hallway4', 'B4.up', 'B4.down'],
    'Hallway5': ['Hallway4', 'Hallway5a', 'Hallway6'],
    'Hallway5a': ['Hallway5', 'Criminology lab2'],
    'Hallway6': ['Hallway5', 'Hallway7'],
    'Hallway7': ['Hallway6', 'Hallway7a', 'Hallway8'],
    'Hallway7a': ['Hallway7', 'B2.down', 'Criminology lab1'],
    'Hallway8': ['Hallway7', 'Hallway8a', 'Hallway9'],
    'Hallway8a': ['Hallway8','Student affair','Hallway8b'],
    'Hallway8b': ['Hallway8a', 'Exit', 'Career'],
    'Hallway9': ['Hallway8', 'Hallway9a', 'Hallway10'],
    'Hallway9a': ['Hallway9','B2.up', 'Engineering lab'],
    'Hallway10': ['Hallway9',  'Hallway11'],
    'Hallway11': ['Hallway10', 'Hallway11a'],
    'Hallway11a': ['Hallway11', 'Healthcare', 'Hallway11b'],
    'Hallway11b': ['Hallway11a', 'Library'],
    'Computer lab': ['Hallway1'],
    'Maintenance': ['Hallway2'],
    'Cr1': ['Hallway2'],
    'Cr2': ['Hallway2'],
    'School lounge': ['Hallway3'],
    'Drugtest': ['Hallway3'],
    'B2.up': ['Hallway10'],
    'B2.down': ['Hallway6'],
    'B4.up': ['Hallway4a'],
    'B4.down': ['Hallway4a'],
    'Criminology lab1': ['Hallway7'],
    'Criminology lab2': ['Hallway5a'],
    'Engineering lab': ['Hallway7'],
    'Healthcare': ['Hallway11'],
    'Library': ['Hallway11b'],
    'Student affair': ['Hallway8'],
    'Career': ['Hallway8b'],
};

const nodes = Object.keys(graph);

const connectionPoints = {
    'Entrance': { x: -70, y: 0, z: 100 },
    'Exit': { x: 70, y: 0, z: 100 },
    'Hallway': { x: -70, y: 0, z: 90 },
    'Hallway1': { x: -70, y: 0, z: 71 },
    'Hallway2': { x: -70, y: 0, z: 51 },
    'Hallway2a': { x: -80, y: 0, z: 51 },
    'Hallway3': { x: -70, y: 0, z: 30 },
    'Hallway4': { x: -70, y: 0, z: 7 },
    'Hallway4a': { x: -70, y: 0, z: -5 },
    'Hallway5': { x: 0, y: 0, z: 7 },
    'Hallway5a': { x: 0, y: 0, z: -40 },
    'Hallway6': { x: 35, y: 0, z: 7 },
    'Hallway7': { x: 60, y: 0, z: 7 },
    'Hallway7a': { x: 60, y: 0, z: -5 },
    'Hallway8': { x: 70, y: 0, z: 7 },
    'Hallway8a': { x: 70, y: 0, z: 75 },
    'Hallway8b': { x: 70, y: 0, z: 90 },
    'Hallway9': { x: 80, y: 0, z: 7 },
    'Hallway9a': { x: 80, y: 0, z: -5 },
    'Hallway10': { x: 105, y: 0, z: 7 },
    'Hallway11': { x:  135, y: 0, z: 7 },
    'Hallway11a': { x: 135, y: 0, z: -42 },
    'Hallway11b': { x: 135, y: 0, z: -62 },
    'Family clinic': { x: -79, y: 0, z: 90 },
    'Admission': { x: -61, y: 0, z: 90 },
    'Computer lab': { x: -61, y: 0, z: 71 },
    'Maintenance': { x: -99, y: 0, z: 51 },
    'Cr1': { x: -85, y: 0, z: 54 },
    'Cr2': { x: -95, y: 0, z: 54 },
    'School lounge': { x: -61, y: 0, z: 30 },
    'Drugtest': { x: -79, y: 0, z: 30 },
    'B2.up': { x: 105, y: 0, z: -5 },
    'B2.down': { x: 35, y: 0, z: -5 },
    'B4.up': { x: -35, y: 0, z: -5 },
    'B4.down': { x: -105, y: 0, z: -5 },
    'Criminology lab1': { x: 60, y: 0, z: -14 },
    'Criminology lab2': { x: 9, y: 0, z: -40 },
    'Engineering lab': { x: 80, y: 0, z: -14 },
    'Healthcare': { x: 131, y: 0, z: -42 },
    'Library': { x: 131, y: 0, z: -62 },
    'Student affair': { x: 61, y: 0, z: 75 },
    'Career': { x: 61, y: 0, z: 90 },
};

function findShortestPath(start, end) {
    if (start === end) return [start];
    if (!nodes.includes(start) || !nodes.includes(end)) return null;
    const queue = [[start, [start]]];
    const visited = new Set([start]);
    while (queue.length > 0) {
        const [current, path] = queue.shift();
        for (const neighbor of graph[current] || []) {
            if (neighbor === end) {
                return [...path, neighbor];
            }
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push([neighbor, [...path, neighbor]]);
            }
        }
    }
    return null;
}

function getConnectionPoint(roomId) {
    return connectionPoints[roomId] || null;
}

function getRoomCenter(roomId) {
    return connectionPoints[roomId] || null;
}

function clearPathLines() {
    const existingPath = scene.getObjectByName('pathLinesGroup');
    if (existingPath) {
        scene.remove(existingPath);
        console.log('Path lines cleared');
    }
}

function resetHighlights() {
    if (!gltfScene) {
        console.warn('GLB not loaded yet, cannot reset highlights');
        return;
    }
    gltfScene.traverse((child) => {
        if (child.isMesh && nodes.includes(child.name)) {
            child.material.color.copy(child.originalColor);
        }
    });
    console.log('Highlights reset');
}

function drawPathLines(path) {
    clearPathLines(); 
    if (!path || path.length < 2) return;

    const pathGroup = new THREE.Group();
    pathGroup.name = 'pathLinesGroup';
    scene.add(pathGroup);

    const points = [];
    const yOffset = 1;  
    for (const roomId of path) {
        const point = getConnectionPoint(roomId);
        if (point) {
            points.push(new THREE.Vector3(point.x, point.y + yOffset, point.z || 0)); 
        }
    }
    if (points.length < 2) return;

    function createPinMesh(color) {
        const pinGroup = new THREE.Group();
        
        const headGeometry = new THREE.SphereGeometry(2, 16, 16);
        const headMaterial = new THREE.MeshBasicMaterial({ color });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 3.75;
        pinGroup.add(head);
        

        const pointGeometry = new THREE.ConeGeometry(2, 8, 16);
        const pointMaterial = new THREE.MeshBasicMaterial({ color });
        const point = new THREE.Mesh(pointGeometry, pointMaterial);
        point.position.y = -0.5;
        point.rotateX(Math.PI);
        pinGroup.add(point);
        
        return pinGroup;
    }

    // const startPin = createPinMesh(0xff0000);
    // startPin.position.copy(points[0]);
    // startPin.position.y += 4;
    // pathGroup.add(startPin);

    const endPin = createPinMesh(0xff0000);
    endPin.position.copy(points[points.length - 1]);
    endPin.position.y += 4;
    pathGroup.add(endPin);

    const dashLength = 2;
    const gapLength = 2;
    const radius = .5;
    const dashMaterial = new THREE.MeshBasicMaterial({
        color: 0x0ea5a4,
        opacity: 1,
        transparent: true
    });

    for (let i = 0; i < points.length - 1; i++) {
        const start = points[i];
        const end = points[i + 1];
        const direction = new THREE.Vector3().subVectors(end, start);
        const totalLength = direction.length();
        direction.normalize();

        let currentDistance = 0;
        while (currentDistance < totalLength) {
            const dashStart = start.clone().add(direction.clone().multiplyScalar(currentDistance));
            const remaining = totalLength - currentDistance;
            const actualDashLength = Math.min(dashLength, remaining);

            if (actualDashLength > 0) {
                const dashEnd = dashStart.clone().add(direction.clone().multiplyScalar(actualDashLength));
                const dashGeometry = new THREE.CylinderGeometry(radius, radius, actualDashLength, 8);
                const dashMesh = new THREE.Mesh(dashGeometry, dashMaterial);

                const midpoint = dashStart.clone().add(dashEnd).multiplyScalar(0.5);
                dashMesh.position.copy(midpoint);
                dashMesh.lookAt(dashEnd);
                dashMesh.rotateX(Math.PI / 2);

                pathGroup.add(dashMesh);
            }

            currentDistance += dashLength + gapLength;
        }
    }
}

function highlightPath(path) {
    resetHighlights(); 
    clearPathLines();
    if (path && path.length > 0) {
        console.log('Highlighting path:', path);
        path.forEach((room, index) => {
            const roomObject = gltfScene.getObjectByName(room);
            if (roomObject && roomObject.isMesh) {
                console.log(`Highlighting ${room} at index ${index}`);
                if (index === 0) roomObject.material.color.set();
                else if (index === path.length - 1) roomObject.material.color.set();
                else roomObject.material.color.set();
            } else {
                console.warn(`Room '${room}' not found in GLB scene. Ensure GLB objects are named correctly.`);
            }
        });
        drawPathLines(path);
        document.getElementById('pathInfo').textContent = `Shortest path: ${path.join(' → ')}`;
    } else {
        document.getElementById('pathInfo').textContent = 'No path found.';
    }
}

let selectedStart = null;
let selectedEnd = null;

document.addEventListener('DOMContentLoaded', () => {
    const datalist = document.createElement('datalist');
    datalist.id = 'roomList';
    const nonHallwayNodes = nodes.filter(node => !node.startsWith('Hallway'));
    nonHallwayNodes.forEach(room => {
        const option = document.createElement('option');
        option.value = room;
        datalist.appendChild(option);
    });
    document.body.appendChild(datalist);

    const fromInput = document.getElementById('fromInput');
    const toInput = document.getElementById('toInput');
    fromInput.setAttribute('list', 'roomList');
    toInput.setAttribute('list', 'roomList');

    document.getElementById('reset').addEventListener('click', () => {
        console.log('Reset button clicked');
        selectedStart = null;
        selectedEnd = null;
        document.querySelector('.info').textContent = 'Enter From and To rooms, then search.';
        resetHighlights();
        clearPathLines();
        fromInput.value = '';
        toInput.value = '';
        document.getElementById('pathInfo').textContent = '';
        console.log('Reset complete');
    });

    document.getElementById('searchBtn').addEventListener('click', () => {
        const from = fromInput.value.trim();
        const to = toInput.value.trim();
        if (!from || !to) {
            alert('Please enter both From and To rooms.');
            return;
        }
        const path = findShortestPath(from, to);
        console.log('Found path:', path);
        highlightPath(path);
        selectedStart = from;
        selectedEnd = to;
    });

    toInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') document.getElementById('searchBtn').click();
    });

});
