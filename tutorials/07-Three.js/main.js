import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
    antialias: true
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.set(0, 5, 20);

const controls = new OrbitControls(camera, renderer.domElement);

const textureLoader = new THREE.TextureLoader();

const geometry1 = new THREE.BoxGeometry(5, 5, 5);
const texture1 = textureLoader.load('./textures/grass.jpg');
const material1 = new THREE.MeshStandardMaterial({ map: texture1 });
const cube = new THREE.Mesh(geometry1, material1);
scene.add(cube);
cube.position.set(-10, 0, 0);

const geometry2 = new THREE.TorusGeometry(3, 1, 16, 100);
const material2 = new THREE.MeshStandardMaterial({ 
    map: texture1,
    color: 0xffffff 
});
const torus = new THREE.Mesh(geometry2, material2);
scene.add(torus);
torus.position.set(10, 0, 0);

const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);

const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight2.position.set(-10, 10, -10);
scene.add(directionalLight2);

const loader = new GLTFLoader();
let model;

loader.load(
    './models/Spacecraft.glb',
    function (gltf) {
        model = gltf.scene;
        scene.add(model);
        
        model.position.set(0, 0, 0);
        
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 10 / maxDim;
        model.scale.set(scale, scale, scale);
        
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center.multiplyScalar(scale));
        
        console.log('Model loaded successfully!');
        console.log('Model size:', size);
    },
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function (error) {
        console.error('An error occurred loading the model:', error);
    }
);

const gridHelper = new THREE.GridHelper(50, 50);
scene.add(gridHelper);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
    requestAnimationFrame(animate);
    
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    
    torus.rotation.x += 0.01;
    torus.rotation.y += 0.01;
    
    if (model) {
        model.rotation.y += 0.005;
    }
    
    controls.update();
    renderer.render(scene, camera);
}

animate();