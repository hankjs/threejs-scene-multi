import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const GOC = {
  modelUrl: "//globaloneclick.com/cdn/shop/files/official-michelle.gltf?v=14663304747227346975",
  modelTexture1: "//globaloneclick.com/cdn/shop/files/official-image_1.png?v=14553416888877139211",
  modelTexture2: "//globaloneclick.com/cdn/shop/files/official-image_2-1.png?v=2923039752349975030",
  modelTexture3: "//globaloneclick.com/cdn/shop/files/official-image_3-1.png?v=5535707054403497386",
  modelTexture4: "//globaloneclick.com/cdn/shop/files/official-image_4-1.png?v=9983274496466187504",
  backgroundTexture: "//globaloneclick.com/cdn/shop/files/official-bg-10.jpg?v=2251506260468347005",
  sound: ["//globaloneclick.com/cdn/shop/files/official-music.mp3?v=12126609940191178847"],
  cardTexturePaths: [
    "//globaloneclick.com/cdn/shop/files/official-card-1.png?v=333112351454806824",
    "//globaloneclick.com/cdn/shop/files/official-card-2.png?v=1372340193505934166",
    "//globaloneclick.com/cdn/shop/files/official-card-3.png?v=13235302440002245745",
    "//globaloneclick.com/cdn/shop/files/official-card-4.png?v=15231418572175159357",
    "//globaloneclick.com/cdn/shop/files/official-card-5.png?v=450998510676234213",
    "//globaloneclick.com/cdn/shop/files/official-card-6.png?v=6221245745421861079",
  ],
  cardBackgroundColors: [
    "#ffae12", "#0d5aff", "#f72a09", "#0c55f9", "#0b711a", "#eaeaec"
  ]
}

const modelUrl = GOC.modelUrl;
const modelTexture1 = GOC.modelTexture1;
const modelTexture2 = GOC.modelTexture2;
const modelTexture3 = GOC.modelTexture3;
const modelTexture4 = GOC.modelTexture4;

export class Michelle {
  constructor({ width, height, renderer, camera, url }) {
    this.renderer = renderer
    this.camera = camera
    this.url=url
    // linear color space
    this.API = {
      width: width,
      height: height,
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

    this.clock = new THREE.Clock();

    this.setupScene();
    this.setupModel();
    this.setUpParticles();
    this.setupLights();

    this.group.position.x = 0.14;
    this.group.position.y = -1.48;
    this.group.position.z = 1.7;
    this.group.rotation.x = -0.05;
    this.group.rotation.y = -0.21;
    this.group.rotation.z = 0;

    // this.reloadMaterial = this.reloadMaterial.bind(this);

    const renderTargetParameters = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      // format: RGBFormat,
      stencilBuffer: false,
    };
    this.fbo = new THREE.WebGLRenderTarget(width, height, renderTargetParameters);
  }

  animate() {
    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime()
    this.animateParticles(elapsedTime);
    if (!this.model) {
      return
    }

    this.walkWeight = this.walkAction.getEffectiveWeight();
    this.mixer.update(delta);
  }

  render(delta = 0, rtt = false) {
    if (rtt) {
      this.renderer.setRenderTarget(this.fbo);
      this.renderer.clear();
      this.renderer.render(this.scene, this.camera);
    } else {
      this.renderer.setRenderTarget(null);
      this.animate()
      this.renderer.render(this.scene, this.camera);
    }
  }

  setupScene() {
    const scene = new THREE.Scene();
    this.scene = scene;

    // Texture
    const loadingManager = new THREE.LoadingManager();
    this.loadingManager = loadingManager;
    const textureLoader = new THREE.TextureLoader(this.loadingManager);
    this.textureLoader = textureLoader;

    // fog (affects partciles)
    const fogColor = 0xb8b9f5;
    const fogNear = 2;
    const fogFar = 10;
    this.fog = new THREE.Fog(fogColor, fogNear, fogFar);
    this.scene.fog = this.fog;
  }

  setupModel() {
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

  animateParticles(elapsedTime) {
    const speed = 0.1;
    const scaleSpeed = 0.1;
    const radius = 5; // 粒子半径
    const timer = speed * elapsedTime;

    for (let i = 0, il = this.particles.length; i < il; i++) {
      const sphere = this.particles[i];

      sphere.position.x = radius * Math.cos(timer + i);
      sphere.position.y = radius * Math.sin(timer + i * 1.1);
      //sphere.material.opacity = Math.random()
      const scale = 1 + Math.sin(elapsedTime * scaleSpeed) * 0.1;
      sphere.scale.set(scale, scale, 1);

    }
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
          }
        }
      });

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

      this.reloadMaterial()
    });

    // Set up progress tracking
    this.loadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
      const progressStats = Math.floor((itemsLoaded / itemsTotal) * 100);
    };

    this.loadingManager.onLoad = function () { };

    this.loadingManager.onError = function (url) {
      console.error('Error loading file');
    };
  }

  reloadMaterial() {
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
      this.url,
      (newTexture) => {
      },
      undefined,
      (err) => {
        console.log('unable to load');
      }
    );
    update(newTexture)
  }

  calcFloorWidth() {
    // 根据相机可视区域调整地板大小
    const aspect = this.API.width / this.API.height;
    const distance = this.camera.position.z;
    const frustumHeight = 2 * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)) * distance;
    const frustumWidth = frustumHeight * aspect;

    const maxSize = Math.max(frustumWidth, frustumHeight) * 4; // 稍微放大一点以确保覆盖整个视野
    this.floorMesh.scale.set(maxSize, maxSize, 1);
  }
}
