import { initScene, initCamera, initRenderer, isDef, initGui } from "./utils";

import {
  Clock,
  Color,
  Mesh,
  SphereGeometry,
  MeshBasicMaterial,
  WebGLRenderTarget,
  OrthographicCamera,
  ShaderMaterial,
  TextureLoader,
  PlaneGeometry,
  Scene,
  LinearFilter,
  PerspectiveCamera
} from "three";
import Tween from "@tweenjs/tween.js";

import simons_town_harbour from "./simons_town_harbour.jpg"
import sunset from "./sunset.jpg"
import kandao3 from "./kandao3.jpg"
import veranda from "./veranda.jpg"
import train from "./train.jpg"

import transition1 from "./textures/transition/transition1.png"
import transition2 from "./textures/transition/transition2.png"
import transition3 from "./textures/transition/transition3.png"
import transition4 from "./textures/transition/transition4.png"
import transition5 from "./textures/transition/transition5.png"
import transition6 from "./textures/transition/transition6.png"
import { SingleScene } from "./single-scene";
import { Michelle } from "./michelle";
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
const transitions = [transition1, transition2, transition3, transition4, transition5, transition6];

let renderer, offsetWidth, offsetHeight, camera, gui, textures;

function TransitionScene(sceneStart) {
  // 过渡的参数
  const transitionParams = {
    // 过渡进程，从0-1
    transition: 0,
    texture: undefined,
    useTexture: false,
    transitionSpeed: 0.05,
    // 是否开始动画
    animate: false,
  };

  // 过渡开始前的场景
  this.sceneFrom = sceneStart;
  // 过渡结束后的场景
  this.sceneTo = undefined;

  // 过渡的场景
  this.scene = new Scene();
  // this.scene.background = new Color(0x000000);

  this.camera = new OrthographicCamera(offsetWidth / -2, offsetWidth / 2, offsetHeight / 2, offsetHeight / -2, -10, 10);

  this.material = new ShaderMaterial({
    uniforms: {
      tDiffuse1: {
        value: null,
      },
      tDiffuse2: {
        value: null,
      },
      mixRatio: {
        value: 0.0,
      },
      threshold: {
        value: 0.1,
      },
      useTexture: {
        value: true,
      },
      tMixTexture: {
        value: transitionParams.texture,
      },
    },
    vertexShader: `
    varying vec2 vUv;
			void main() {
				vUv = vec2( uv.x, uv.y );
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}
    `,
    fragmentShader: `
      uniform float mixRatio;
			uniform sampler2D tDiffuse1;
			uniform sampler2D tDiffuse2;
			uniform sampler2D tMixTexture;
			uniform bool useTexture;
			uniform float threshold;
			varying vec2 vUv;
			void main() {
				vec4 texel1 = texture2D( tDiffuse1, vUv );
				vec4 texel2 = texture2D( tDiffuse2, vUv );
				if (useTexture==true) {
					vec4 transitionTexel = texture2D( tMixTexture, vUv );
					float r = mixRatio * (1.0 + threshold * 2.0) - threshold;
					float mixf=clamp((transitionTexel.r - r)*(1.0/threshold), 0.0, 1.0);
					gl_FragColor = mix( texel1, texel2, mixf );
				} else {
					gl_FragColor = mix( texel2, texel1, mixRatio );
				}
			}
    `,
  });
  const geometry = new PlaneGeometry(offsetWidth, offsetHeight);
  this.quad = new Mesh(geometry, this.material);
  this.scene.add(this.quad);

  /**
   * 切换场景
   * @param {Scene} sceneTo 待切换的场景
   * @param {Object} params 切换参数
   * @returns {Boolean} 是否切换成功，返回false，当前正在切换中
   */
  this.update = (sceneTo, params) => {
    // 动画正在执行中
    if (transitionParams.animate) return false;

    const { texture, useTexture = false, transitionSpeed = 0.05 } = params;

    this.sceneTo = sceneTo;

    transitionParams.transition = 0;
    transitionParams.texture = texture;
    transitionParams.transitionSpeed = transitionSpeed;
    transitionParams.useTexture = useTexture;
    transitionParams.animate = true;

    this.material.uniforms.tDiffuse1.value = this.sceneTo.fbo.texture;
    this.material.uniforms.tDiffuse2.value = this.sceneFrom.fbo.texture;
    this.material.uniforms.threshold.value = 0.1;
    this.material.uniforms.mixRatio.value = 0.0;
    this.material.uniforms.tMixTexture.value = texture;
    this.material.uniforms.useTexture.value = useTexture;
    return true;
  };
  this.render = () => {
    if (!transitionParams.animate) {
      this.sceneFrom.render();
      return
    }
    if (transitionParams.transition >= 1) {
      this.sceneTo.render();
      transitionParams.animate = false;
      setTimeout(() => {
        this.sceneFrom = this.sceneTo;
        transitionParams.transition = 0;
      }, 10);
      return
    }
    this.sceneFrom.render(0, true);
    this.sceneTo.render(0, true);
    renderer.setRenderTarget(null);
    renderer.clear();
    renderer.render(this.scene, this.camera);
    if (transitionParams.transition <= 1) {
      // 动画还在执行过程中
      transitionParams.transition = transitionParams.transition + transitionParams.transitionSpeed;
      this.material.uniforms.mixRatio.value = transitionParams.transition;
    }
  };
}

export default class Index {
  constructor() {
    const el = document.getElementById("webgl-output");

    offsetWidth = el.offsetWidth;
    offsetHeight = el.offsetHeight;

    renderer = initRenderer({
      physicallyCorrectLights: false,
    });

    camera = new PerspectiveCamera(75, offsetWidth / offsetHeight, 0.1, 1000);
    this.camera = camera
    this.camera.position.set(0, 0, 2);

    this.scene1 = new Michelle({ renderer, camera, width: offsetWidth, height: offsetHeight, url: GOC.modelTexture2 });
    // this.scene1 = new SingleScene({ renderer, camera, width: offsetWidth, height: offsetHeight, url: simons_town_harbour });
    this.scene2 = new SingleScene({ renderer, camera, width: offsetWidth, height: offsetHeight, url: sunset });
    // this.scene3 = new SingleScene({ renderer, camera, width: offsetWidth, height: offsetHeight, url: kandao3 });
    // this.scene4 = new SingleScene({ renderer, camera, width: offsetWidth, height: offsetHeight, url: veranda });
    // this.scene5 = new SingleScene({ renderer, camera, width: offsetWidth, height: offsetHeight, url: train });

    this.textures = [];
    const loader = new TextureLoader();
    for (let i = 0; i < transitions.length; i++) {
      this.textures.push(loader.load(transitions[i]));
    }

    this.transitionParams = {
      useTexture: true, //为 false 默认采用渐变式
      transition: 0,
      transitionSpeed: 0.05,
      texture: this.textures[0],
      animate: false,
    };

    this.transition = new TransitionScene(this.scene1);

    this._resizeFn = this.resizeFn.bind(this);
    window.addEventListener("resize", this._resizeFn);

    this.render();
  }

  // 点击切换场景
  changeScene(index) {
    let toScene = undefined;
    if (index === 0) {
      toScene = this.scene1;
    } else if (index === 1) {
      toScene = this.scene2;
    } else if (index === 2) {
      toScene = this.scene3;
    } else if (index === 3) {
      toScene = this.scene4;
    } else if (index === 4) {
      toScene = this.scene5;
    }

    if (isDef(toScene)) {
      this.transitionParams.texture = this.textures[parseInt(Math.random() * 6)];
      this.transition.update(toScene, this.transitionParams);
    }
  }
  resizeFn() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }

  render() {
    Tween.update();
    this.transition.render();
    requestAnimationFrame(this.render.bind(this));
  }

  beforeDestroy() {
    window.removeEventListener("resize", this._resizeFn);
  }
}
