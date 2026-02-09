import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

import { OrbitControls } from 'three/examples/jsm/Addons.js';

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({
    smooth: true,
    lerp: 0.06,
    smoothTouch: false,
    touchMultiplier: 0.3
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
    main.style.height = '15000px';
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



// Init fontsize
function fitTextToWidth(el) {
    let size = 16;
    let padding = window.innerWidth > 1024 ? 60 : 20;
    el.style.fontSize = size + 'px';

    while (el.offsetWidth < window.innerWidth - padding) {
        size++;
        el.style.fontSize = size + 'px';
        console.log('window:' + window.innerWidth + ', text:' + el.offsetWidth);
    }
}

const name = document.getElementById('name');
fitTextToWidth(name);



// 3D models
const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
loader.setDRACOLoader(dracoLoader);

const fruits = [
    { name: "bananas", color: "#fac919", path: "/banana.glb" },
    { name: "strawberries", color: "#FF6347", path: "/strawberry.glb" },
    { name: "pears", color: "#afc744", path: "/pear.glb" },
    { name: "oranges", color: "#FFA500", path: "/orange.glb" },
    { name: "apples", color: "#f5795d", path: "/apple.glb" },
];
  

const group = new THREE.Group();

scene.add(group);

const promises = fruits.map((fruit, index) => {
    return new Promise((resolve) => {
        loader.load(fruit.path, (gltf) => {
            const obj = gltf.scene;
            
            if (window.innerWidth >= 1024) {
                obj.scale.set(28, 28, 28);
            } else {
                obj.scale.set(20, 20, 20);
            }

            resolve({ obj, fruit, index });
        });
    });
});


Promise.all(promises).then((results) => {

    const order = [1, 2, 3, 4];
    const angleStep = (Math.PI * 2) / fruits.length;
    const radius = 70;

    const first = results.find(r => r.index === 0);
    first.obj.position.set(0, 0, radius);
    group.add(first.obj);

    order.forEach((fruitIndex, i) => {
        const res = results.find(r => r.index === fruitIndex);
        const { obj } = res;
        const angle = -(i + 1) * angleStep;
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius;
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

    document.getElementById('container').style.backgroundColor = fruits[0].color;
    
    for (let i = 0; i < group.children.length; i++) {
        let step = (Math.PI * 2) / group.children.length * (i + 1);
        
        if (i != group.children.length - 1) {
            tl.to(group.rotation, { y: step, duration: 1, ease: "power2.inOut" });
            tl.to('#container', { backgroundColor: fruits[i + 1].color, duration: 1, ease: "power2.inOut" }, "<");
            tl.to('#namespan', { y: '150%', duration: 0.5, ease: "power2.inOut" }, "<");
            tl.set('#namespan', { 
                textContent: fruits[i + 1].name,
                onComplete: () => {
                    fitTextToWidth(name);
                },
                onReverseComplete: () => {
                    fitTextToWidth(name);
                }
            }, "-=0.5");
            tl.set('#scrolltext', { textContent: `Scroll for more fruits (${i + 2}/5)`}, "-=0.5");
            tl.to('#namespan', { y: '0%', duration: 0.5, ease: "power2.inOut" }, "-=0.5");
            tl.to({}, { duration: 0.5 }); 
        }
    }
});




function animate() {
    requestAnimationFrame(animate);
    group.children.forEach((obj) => {
        obj.rotation.y -= 0.02
        obj.rotation.x -= 0.01
    });
    // controls.update();
    renderer.render(scene, camera);
}

animate();