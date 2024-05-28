
import * as THREE from 'three';

import Stats from 'three/examples/jsm/libs/stats.module.js';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

import modelUrl from "./assets/old_work_bench.glb?url";

import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';

import "./e.css"



const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const mousePosition = {
  x: 0,
  y: 0
};
let targets = []

const card = document.querySelector("#card")
const cardTitle = document.querySelector("#card-title")

let currentTitle = ""
const isTools = (title) => {
  return title.toLowerCase().indexOf("tools") >= 0
}

const updateCard = () => {
  if (!currentTitle || !isTools(currentTitle)) {
    hideCard()
    return
  }

  cardTitle.innerText = currentTitle.replace(/_Tool.*$/, "").replaceAll("_", " ")
  card.style.left = `${mousePosition.x}px`
  card.style.top = `${mousePosition.y}px`
  card.style.opacity = "1"
}
const hideCard = () => {
  card.style.opacity = "0"
}

let INTERSECTED;
function onPointerMove(event) {

  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
  mousePosition.x = event.clientX;
  mousePosition.y = event.clientY;
  updateCard()
}

window.addEventListener('pointermove', onPointerMove);

let mixer;

const clock = new THREE.Clock();
const container = document.getElementById('container');

const stats = new Stats();
container.appendChild(stats.dom);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);


const pmremGenerator = new THREE.PMREMGenerator(renderer);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xbfe3dd);
scene.environment = pmremGenerator.fromScene(new RoomEnvironment(renderer), 0.04).texture;


const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 100);
camera.position.set(5, 2, 8);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0.5, 0);
controls.update();
controls.enablePan = false;
controls.enableDamping = true;

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');

const loader = new GLTFLoader();
// loader.setDRACOLoader(dracoLoader);
loader.load(modelUrl, function (gltf) {

  console.log("gltf", gltf);
  const model = gltf.scene;
  model.position.x = 3
  model.position.y = 0.5
  model.position.z = 5
  // 向左旋转45度
  model.rotation.y = -Math.PI / 4;
  scene.add(model);

  // const materials = [];
  model.traverse((child) => {
    if (child.isMesh) {
      targets.push(child)

    }
  });

  targets = targets.filter(target => isTools(target.name))
  console.log("targets", targets);

  animate();

}, undefined, function (e) {

  console.error(e);

});


window.onresize = function () {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

};

// 描边
const renderScene = new RenderPass(scene, camera);
const outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);

const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(outlinePass);

outlinePass.selectedObjects = [];
// 描边

function animate() {


  // const delta = clock.getDelta();

  // mixer.update(delta);

  controls.update();

  stats.update();

  raycaster.setFromCamera(pointer, camera);

  const intersects = raycaster.intersectObjects(targets, false);

  if (intersects.length > 0) {
    if (INTERSECTED != intersects[0].object) {

      if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);

      INTERSECTED = intersects[0].object;
      currentTitle = INTERSECTED.name
      INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
      // INTERSECTED.material.emissive.setHex(0xff0000);

    }

  } else {
    currentTitle = null
    if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);

    INTERSECTED = null;

  }

  if (INTERSECTED) {
    outlinePass.selectedObjects = [INTERSECTED];
    composer.render();
  } else {
    outlinePass.selectedObjects = [];
  }

  renderer.render(scene, camera);
  if (INTERSECTED) {
    composer.render();
  }

  requestAnimationFrame(animate);
}
