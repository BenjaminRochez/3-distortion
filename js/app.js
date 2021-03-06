import * as THREE from "three";
import fragment from "./shader/fragment.glsl";
import vertex from "./shader/vertex.glsl";
import img from '../img.jpg'
import gsap from 'gsap';
let OrbitControls = require("three-orbit-controls")(THREE);

const createInputEvents = require('simple-input-events');
const event = createInputEvents(window);

export default class Sketch {
  constructor(options) {
    this.scene = new THREE.Scene();

    this.container = options.dom;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0xeeeeee, 1); 
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.001,
      1000
    );

    // var frustumSize = 10;
    // var aspect = window.innerWidth / window.innerHeight;
    // this.camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, -1000, 1000 );
    this.camera.position.set(0, 0, 2);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.time = 0;

    this.isPlaying = true;
    this.mouse = new THREE.Vector2();
    this.prevMouse = new THREE.Vector2();
    this.targetSpeed = 0;
    this.addObjects();
    this.resize();
    this.render();
    this.mouseEvents();
    this.mouseMoveEvent();
    this.setupResize();
    
    // this.settings();
  }

  settings() {
    let that = this;
    this.settings = {
      progress: 0,
    };
    this.gui = new dat.GUI();
    this.gui.add(this.settings, "progress", 0, 1, 0.01);
  }

  mouseMoveEvent(){
    event.on('move', ({ position, event, inside, dragding}) =>{
      console.log(position);
      this.mouse.x = position[0]/this.width;
      this.mouse.y = 1. - position[1]/this.height;
      this.material.uniforms.mouse.value = this.mouse; 
    });
  }

  getSpeed(){
    this.speed = Math.sqrt(
      (this.prevMouse.x - this.mouse.x)**2 +
      (this.prevMouse.y - this.mouse.y)**2
    )
    this.targetSpeed += 0.1*(this.speed - this.targetSpeed);
    console.log(this.speed);
    this.prevMouse.x = this.mouse.x;
    this.prevMouse.y = this.mouse.y;
  }

  setupResize() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;


    //image cover
    this.imageAspect = 853/1280;
    let a1; let a2;
    if(this.height/this.width>this.imageAspect){
      a1 = (this.width/this.height) * this.imageAspect;
      a2 = 1;
    }else{
      a1 = 1;
      a2 = (this.height / this.width) / this.imageAspect;
    }
    this.material.uniforms.resolution.value.x = this.width;
    this.material.uniforms.resolution.value.y = this.height;
    this.material.uniforms.resolution.value.z = a1;
    this.material.uniforms.resolution.value.w = a2;


    // update the fov of the camera (explained here : https://youtu.be/5zuyptdjnmA?t=472)
    const dist = this.camera.position.z;
    const height = 1;
    this.camera.fov = 2*(180/Math.PI)*Math.atan(height/(2*dist));

    // Make the plane have the same aspect ratio as the window
    if(this.width / this.height>1){
      this.plane.scale.x = this.camera.aspect;
    }else{
      this.plane.scale.y = 1/this.camera.aspect;
    }

    this.camera.updateProjectionMatrix();
  }

  mouseEvents(){
    document.addEventListener('mousedown', ()=> {
      console.log('mousedown');
      this.material.uniforms.direction.value = 0;
      gsap.to(this.material.uniforms.progress, {
        value: 1,
        duration: 0.5
      })
    });

    document.addEventListener('mouseup', () => {
      this.material.uniforms.direction.value = 1;
      gsap.to(this.material.uniforms.progress, {
        value: 0,
        duration: 0.5
      })
    });

  }

  addObjects() {
    let that = this;
    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable"
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { type: "f", value: 0 },
        mouse: { type: "v2", value: new THREE.Vector2(0.0, 0.0) },
        direction: { type: "f", value: 0 },
        speed: { type: "f", value: 0 },
        progress: {type: "f", value: 0},
        tex: {type: "t", value: new THREE.TextureLoader().load(img)},
        resolution: { type: "v4", value: new THREE.Vector4() },
        uvRate1: {
          value: new THREE.Vector2(1, 1)
        }
      },
       //wireframe: true,
      // transparent: true,
      vertexShader: vertex,
      fragmentShader: fragment
    });

    this.geometry = new THREE.PlaneGeometry(1, 1, 100, 100);

    this.plane = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.plane);
  }
  
  
  stop() {
    this.isPlaying = false;
  }

  play() {
    if(!this.isPlaying){
      this.render()
      this.isPlaying = true;
    }
  }

  render() {
    if (!this.isPlaying) return;
    this.time += 0.05;
    this.getSpeed();
    this.material.uniforms.time.value = this.time;
    this.material.uniforms.speed.value = this.targetSpeed;
    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
  }
}

new Sketch({
  dom: document.getElementById("container")
});
