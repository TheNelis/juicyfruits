import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({
    smooth: true,
    lerp: 0.05
});
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);
  


const main = document.getElementById('container');
if (window.innerWidth >= 1024) {
    main.style.height = '30000px';
} else {
    main.style.height = '20000px';
}

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
    alpha: true
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.set(0, 0, 50);
camera.lookAt(0, 0, 90);

renderer.render(scene, camera);



// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 4);
const pointLight = new THREE.PointLight(0xffffff, 14000);
pointLight.position.set(-20, 50, 50);

scene.add(pointLight, ambientLight);

// Helpers & OrbitControls
    // const lightHelper = new THREE.PointLightHelper(pointLight);
    // const gridHelper = new THREE.GridHelper(300, 50);
    // scene.add(lightHelper, gridHelper);

    // const controls = new OrbitControls(camera, renderer.domElement);



// 3D models
const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
loader.setDRACOLoader(dracoLoader);

const objectsArray = [
    '/banana.glb',
    '/apple.glb',
    '/orange.glb',
    '/pear.glb',
    '/strawberry.glb',
];
const fruitColors = [
    "#fac919", // banana
    "#f5795d", // apple
    "#FFA500", // orange
    "#afc744", // pear
    "#FF6347", // strawberry
];
const group = new THREE.Group();

scene.add(group);

const radius = 70;

const promises = objectsArray.map((path, index) => {
    return new Promise((resolve) => {
        loader.load(path, (gltf) => {
            const obj = gltf.scene;
            
            if (window.innerWidth >= 1024) {
                obj.scale.set(28, 28, 28);
            } else {
                obj.scale.set(20, 20, 20);
            }

            resolve({ obj, index });
        });
    });
});

// GSAP animation
Promise.all(promises).then((results) => {

    results.sort((a, b) => a.index - b.index);

    results.forEach((res) => {
        const index = res.index;
        const obj = res.obj;

        let x, z;
        if (index === 0) {
            x = 0;
            z = radius;
        } else {
            const angleStep = (Math.PI * 2) / objectsArray.length;
            const angle = index * angleStep;

            x = Math.sin(angle) * radius;
            z = Math.cos(angle) * radius;
        }

        obj.position.set(x, 0, z);
        group.add(obj);
    });

    const tl = gsap.timeline({
        defaults: { ease: "linear" },
        scrollTrigger: {
            trigger: "#container",
            start: "top top",
            end: "bottom bottom",
            scrub: true
        }
    });

    document.getElementById('container').style.backgroundColor = fruitColors[0];
    
    for (let i = 0; i < group.children.length; i++) {
        let step = (Math.PI * -2) / group.children.length * (i + 1);
        tl.to(group.children[i].rotation, { x: Math.PI * -4, duration: 2, ease: "power1.out" });
        
        if (i != group.children.length - 1) {
            tl.to(group.rotation, { y: step, duration: 1, ease: "power2.inOut" });
            tl.to('#container', { backgroundColor: fruitColors[i + 1], duration: 1, ease: "power2.inOut" }, "<");
        }
    }
});




function animate() {
    requestAnimationFrame(animate);
    group.children.forEach((obj) => {
        obj.rotation.y += 0.01
    });
    // controls.update();
    renderer.render(scene, camera);
}

animate();