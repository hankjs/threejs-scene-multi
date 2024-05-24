import {
  Scene,
  WebGLRenderer,
  PCFSoftShadowMap,
  Color,
  ACESFilmicToneMapping,
  Vector3,
  PerspectiveCamera,
  AxesHelper,
  AmbientLight,
  Clock,
  HemisphereLight,
  Raycaster,
  OrthographicCamera,
} from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls";

import Stats from "stats.js";

import * as dat from "dat.gui";


export function isDef(t) {
  return "[object Undefined]" !== Object.prototype.toString.call(t)
}

export function initScene() {
  const scene = new Scene();
  return scene;
}
export function initStats(type) {
  const panelType = typeof type !== "undefined" && type && !isNaN(type) ? parseInt(type) : 0;
  const stats = new Stats();

  stats.showPanel(panelType); // 0: fps, 1: ms, 2: mb, 3+: custom
  document.body.appendChild(stats.dom);

  return stats;
}
export function initRenderer(additionalProperties, domId = "webgl-output", isSetSize = true) {
  let props = typeof additionalProperties !== "undefined" && additionalProperties ? additionalProperties : {};

  props = Object.assign(
    {
      //开启抗锯齿
      antialias: true,
      physicallyCorrectLights: true,
    },
    props,
  );

  const renderer = new WebGLRenderer(props);
  // 表示启用阴影贴图，并将阴影贴图类型设置为THREE.PCFSoftShadowMap
  renderer.shadowMap.enabled = true;
  // renderer.shadowMapSoft = true;
  // renderer.shadowMap.type = PCFSoftShadowMap;

  // renderer.setClearColor(new Color(0x000000));
  if (isSetSize) {
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // 将启用正确的物理灯光。
  renderer.physicallyCorrectLights = props.physicallyCorrectLights;

  // // 表示使用2倍设备像素点采样，这有利于消除锯齿获得更加高质量的效果。
  renderer.setPixelRatio(window.devicePixelRatio * 2);

  // //设置这个属性主要是为了在普通计算机显示器或者移动设备屏幕等低动态范围介质上，模拟、逼近高动态范围（HDR）效果。
  // renderer.toneMapping = THREE.ACESFilmicToneMapping;
  // // toneMappingExposure表示曝光级别，值越大曝光程度越高，场景中的光线越充足，模型就越亮。
  // renderer.toneMappingExposure = 1.0;

  document.getElementById(domId).appendChild(renderer.domElement);

  return renderer;
}
export function initCamera(initialPosition, fov = 45, near = 1, far = 1000) {
  const position = initialPosition !== undefined ? initialPosition : new Vector3(-30, 40, 30);
  console.log(initialPosition, "initialPosition");

  const camera = new PerspectiveCamera(fov, window.innerWidth / window.innerHeight, near, far);
  camera.position.copy(position);
  camera.lookAt(new Vector3(0, 0, 0));

  return camera;
}

// 正交相机
export function initOrthographicCamera(
  initialPosition,
  left = -10,
  right = 10,
  top = 10,
  bottom = -10,
  far = 0,
  near = 100,
) {
  const position = initialPosition !== undefined ? initialPosition : new Vector3(-30, 40, 30);

  const camera = new OrthographicCamera(left, right, top, bottom, far, near);
  camera.position.copy(position);
  camera.lookAt(0, 0, 0);
  return camera;
}

export function initAxes(scene, length = 20) {
  const axes = new AxesHelper(length);
  scene.add(axes);
  return axes;
}

export function initTrackballControls(camera, renderer) {
  const trackballControls = new TrackballControls(camera, renderer.domElement);
  trackballControls.rotateSpeed = 1.0;
  trackballControls.zoomSpeed = 1.2;
  trackballControls.panSpeed = 0.8;
  trackballControls.noZoom = false;
  trackballControls.noPan = false;
  trackballControls.staticMoving = true;
  trackballControls.dynamicDampingFactor = 0.3;
  trackballControls.keys = [65, 83, 68];

  return trackballControls;
}

export function initOrbitControls(camera, renderer, autoRotate = false) {
  const orbitControls = new OrbitControls(camera, renderer.domElement);
  orbitControls.autoRotate = autoRotate;
  return orbitControls;
}

export function initAmbientLight(scene, color = 0x343434, intense = 1) {
  const ambientLight = new AmbientLight(color, intense);
  ambientLight.name = "ambientLight";
  scene.add(ambientLight);
  return ambientLight;
}

export function initHemisphereLight(scene, color1 = 0xffffff, color2 = 0xffffff, intense = 1) {
  const hemisphereLight = new HemisphereLight(color1, color2, intense);
  hemisphereLight.name = "hemisphereLight";
  scene.add(hemisphereLight);
  return hemisphereLight;
}

export function initClock() {
  const clock = new Clock();
  return clock;
}
export function initGui() {
  const gui = new dat.GUI();
  return gui;
}

export function initRaycaster() {
  const raycaster = new Raycaster();
  return raycaster;
}
