import { initScene } from "./utils";

import {
  Mesh,
  SphereGeometry,
  MeshBasicMaterial,
  WebGLRenderTarget,
  TextureLoader,
  LinearFilter,
} from "three";

export class SingleScene {
  constructor(options) {
    const { url, width, height, renderer, camera } = options;
    this.renderer = renderer
    this.camera = camera
    this.scene = initScene();

    const renderTargetParameters = {
      minFilter: LinearFilter,
      magFilter: LinearFilter,
      // format: RGBFormat,
      stencilBuffer: false,
    };

    const sphereGeometry = new SphereGeometry(500, 50, 50);
    sphereGeometry.scale(-1, 1, 1);
    const sphereMaterial = new MeshBasicMaterial({
      map: new TextureLoader().load(url),
    });

    const sphere = new Mesh(sphereGeometry, sphereMaterial);

    this.scene.add(sphere);

    this.fbo = new WebGLRenderTarget(width, height, renderTargetParameters);
  }

  render(delta = 0, rtt = false) {
    if (rtt) {
      this.renderer.setRenderTarget(this.fbo);
      this.renderer.clear();
      this.renderer.render(this.scene, this.camera);
    } else {
      this.renderer.setRenderTarget(null);
      this.renderer.render(this.scene, this.camera);
    }
  }
}