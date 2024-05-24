import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EVETNS, emitter } from './events';

const modelUrl = window.GOC.modelUrl;
const modelTexture1 = window.GOC.modelTexture1;
const modelTexture2 = window.GOC.modelTexture2;
const modelTexture3 = window.GOC.modelTexture3;
const modelTexture4 = window.GOC.modelTexture4;
const backgroundTexture = window.GOC.backgroundTexture;

export class Michelle {
  constructor(selector) {
    this.container = document.querySelector(selector);
    this.setupProperties();
    this.setupScene();
    this.setupModel();
    this.setUpParticles();
    this.setupCamera();
    this.setupLights();

    this.group.position.x = 0.14;
    this.group.position.y = -1.48;
    this.group.position.z = 1.7;
    this.group.rotation.x = -0.05;
    this.group.rotation.y = -0.21;
    this.group.rotation.z = 0;

    this.setupRenderer();
    this.onResize = this._onResize.bind(this);
    this.reloadMaterial = this.reloadMaterial.bind(this);
    window.addEventListener('resize', this.onResize);
  }

  setupProperties() {
    // linear color space
    this.API = {
      lightProbeIntensity: 8,
      ambientLightIntensity: 8,
      ambientLightColor: 0x808080,
      directionalLightIntensity: 5,
      // 粒子效果
      objectDistance: 4,
      materialColorParticles: 0x000000,
      backgroundColor: 0xf5f5f5,
      envMapIntensity: 0.5,
      skinIndex: 0,
    };

    this.sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }

  setupScene() {
    const scene = new THREE.Scene();
    this.scene = scene;

    // Texture
    const loadingManager = new THREE.LoadingManager();
    this.loadingManager = loadingManager;
    const textureLoader = new THREE.TextureLoader(this.loadingManager);
    this.textureLoader = textureLoader;
    const sceneTexture = textureLoader.load(backgroundTexture);
    // this.scene.background = sceneTexture;
    // this.scene.background = new THREE.Color(this.API.backgroundColor);

    // fog (affects partciles)
    const fogColor = 0xb8b9f5;
    const fogNear = 2;
    const fogFar = 10;
    this.fog = new THREE.Fog(fogColor, fogNear, fogFar);
    this.scene.fog = this.fog;
  }

  setupModel() {
    this.clock = new THREE.Clock();
    this.loader = new GLTFLoader(this.loadingManager);
    this.group = new THREE.Group();
    this.modelMaterial = new THREE.MeshPhongMaterial();
    this.modelMesh = null;
    this.loadModel();
  }

  setUpParticles() {
    let particles = [];
    this.particles = particles;
    const particles_count = 300;
    const positions = new Float32Array(particles_count * 3);

    for (let i = 0; i < particles_count; i++) {
      positions[i * 3 + 0] = Math.random() - 0.5;
      positions[i * 3 + 1] = this.API.objectDistance * 0.5 - Math.random() * this.API.objectDistance * 5;
      positions[i * 3 + 2] = Math.random() - 0.5;

      // Shape 2: Reflective spheres
      const geometry = new THREE.SphereGeometry(0.1, 32, 32);
      const material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
      const p = new THREE.Mesh(geometry, material);
      p.position.x = Math.random() * 10 - 5;
      p.position.y = Math.random() * 10 - 5;
      p.position.z = Math.random() * 10 - 5;
      p.scale.x = p.scale.y = p.scale.z = Math.random() * 3 + 1;
      this.particles.push(p);
      this.group.add(p);
    }
  }

  animateParticles() {
    const speed = 0.0001;
    const timer = speed * Date.now();
    for (let i = 0, il = this.particles.length; i < il; i++) {
      const sphere = this.particles[i];
      sphere.position.x = 5 * Math.cos(timer + i);
      sphere.position.y = 5 * Math.sin(timer + i * 1.1);
      //sphere.material.opacity = Math.random()
      sphere.scale.set(1 + Math.sin(Date.now() * 0.005) * 0.1, 1 + Math.sin(Date.now() * 0.005) * 0.1, 1);
    }
  }

  setupCamera() {
    this.camera = new THREE.PerspectiveCamera(75, this.sizes.width / this.sizes.height, 0.1, 1000);
    this.camera.position.set(0, 0, 2); // fix angle of our initial pov (remove to show difference)
    this.scene.add(this.camera);
  }

  setupLights() {
    this.ambientLight = new THREE.AmbientLight(this.API.ambientLightColor, this.API.ambientLightIntensity);
    this.scene.add(this.ambientLight);

    this.directionalLight = new THREE.DirectionalLight(0xffffff, this.API.directionalLightIntensity);
    this.directionalLight.position.set(10, 10, 10);
    this.directionalLight.castShadow = true;
    this.scene.add(this.directionalLight);
  }

  loadModel() {
    // load model, onLoad, onProgress, onError
    this.loader.load(modelUrl, (gltf) => {
      this.model = gltf.scene;

      this.group.add(this.model);

      this.model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          const material = child.material;

          if (material instanceof THREE.MeshStandardMaterial) {
            this.modelMesh = child;
            const prevMaterial = child.material;

            child.material = this.modelMaterial;

            THREE.MeshBasicMaterial.prototype.copy.call(child.material, prevMaterial);
            console.log('correct form', child.material);

            // material.roughness = 1;
            // material.metalness = 0.1;
          }
        }
      });

      // const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(128, { format: THREE.RGBFormat, generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter });
      // this.cubeCamera = new THREE.CubeCamera(1, 10, cubeRenderTarget);
      // this.group.add(this.cubeCamera);

      // 创建地板
      const floorGeometry = new THREE.PlaneGeometry(10, 10);

      const floorMaterial = new THREE.ShadowMaterial();
      floorMaterial.opacity = 0.2; // 调整阴影的透明度

      this.floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
      this.floorMesh.rotation.x = -Math.PI / 2; // 旋转地板使其平放
      this.floorMesh.receiveShadow = true; // 地板接收阴影
      this.calcFloorWidth();

      this.group.add(this.floorMesh);

      this.scene.add(this.group);

      this.animations = gltf.animations;

      // walking animation
      this.mixer = new THREE.AnimationMixer(this.model);
      this.walkAction = this.mixer.clipAction(this.animations[0]);
      this.walkAction.play();

      this.animate();
      emitter.emit(EVETNS.MODEL_LOADED);
    });

    // Set up progress tracking
    this.loadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
      const progressStats = Math.floor((itemsLoaded / itemsTotal) * 100);
      emitter.emit(EVETNS.MODEL_PROGRESS, progressStats);
    };

    this.loadingManager.onLoad = function () {};

    this.loadingManager.onError = function (url) {
      console.error('Error loading file');
    };
  }

  reloadMaterial(index) {
    const skinURLs = [modelTexture1, modelTexture2, modelTexture3, modelTexture4];
    const textureLoader = new THREE.TextureLoader();
    
    const update = (newTexture) => {
      const oldTexture = this.modelMaterial.map;
      if (oldTexture) {
        // Copy specific properties
        newTexture.name = oldTexture.name;
        newTexture.flipY = oldTexture.flipY;
        newTexture.wrapS = oldTexture.wrapS;
        newTexture.wrapT = oldTexture.wrapT;
        newTexture.colorSpace = oldTexture.colorSpace;
        newTexture.anisotropy = oldTexture.anisotropy;
        newTexture.userData = oldTexture.userData;
        newTexture.source.data = oldTexture.source.data;
        newTexture.matrix.copy(oldTexture.matrix);
        newTexture.repeat.copy(oldTexture.repeat);
        newTexture.offset.copy(oldTexture.offset);
      }
  
      newTexture.needsUpdate = true
      // assign new texture
      this.modelMaterial.map = newTexture;
      this.modelMaterial.needsUpdate = true;
      }
    const newTexture = textureLoader.load(
      skinURLs[index],

      (newTexture) => {

      },
      undefined,
      (err) => {
        console.log('unable to load');
      }
    );
    update(newTexture)
  }

  setupRenderer() {
    // renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer = renderer;
    renderer.setSize(this.sizes.width, this.sizes.height); // 适应屏幕
    renderer.setPixelRatio(window.devicePixelRatio, 2); // 适应具有不同像素密度的设备
    renderer.render(this.scene, this.camera);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(renderer.domElement);
  }

  animate() {
    this.animateParticles();

    this.cubeCamera && this.cubeCamera.update(this.renderer, this.scene);
    this.renderer.render(this.scene, this.camera);
    let mixerUpdateDelta = this.clock.getDelta();
    this.walkWeight = this.walkAction.getEffectiveWeight();
    this.mixer.update(mixerUpdateDelta);

    requestAnimationFrame(this.animate.bind(this));
  }

  calcFloorWidth() {
    // 根据相机可视区域调整地板大小
    const aspect = this.sizes.width / this.sizes.height;
    const distance = this.camera.position.z;
    const frustumHeight = 2 * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)) * distance;
    const frustumWidth = frustumHeight * aspect;

    const maxSize = Math.max(frustumWidth, frustumHeight) * 4; // 稍微放大一点以确保覆盖整个视野
    this.floorMesh.scale.set(maxSize, maxSize, 1);
  }
  _onResize() {
    this.sizes.width = window.innerWidth;
    this.sizes.height = window.innerHeight;

    this.camera.aspect = this.sizes.width / this.sizes.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.width, window.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // this.calcFloorWidth()
  }
}
