// first, import the Three.js modules we need:
import * as THREE from "https://unpkg.com/three@0.126.0/build/three.module.js";
import { VRButton } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/webxr/VRButton.js';
import Stats from "https://unpkg.com/three@0.126.0/examples/jsm/libs/stats.module";

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.xr.enabled = true;
document.body.appendChild( renderer.domElement );
document.body.appendChild(VRButton.createButton(renderer));

// arguments: vertical field of view (degrees), aspect ratio, near clip, far clip:
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.05, 100 );
// Z axis point out of the screen toward you; units are meters
camera.position.y = 1.5;
camera.position.z = 2;

// ensure the renderer fills the page, and the camera aspect ratio matches:
function resize() {
		renderer.setSize(window.innerWidth, window.innerHeight);
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
}
// do this now and whenever the window is resized()
resize();
window.addEventListener("resize", resize, false);

// build a scene graph:
const scene = new THREE.Scene();

// A mesh requires a geometry and a material:
const geometry = new THREE.BoxGeometry()
const material = new THREE.MeshStandardMaterial()
const cube = new THREE.Mesh( geometry, material );
cube.position.y = 1.5;
scene.add( cube );

// add basic lighting
const light = new THREE.HemisphereLight(0xfff0f0, 0x606066);
//light.position.set(1, 1, 1);
scene.add(light);

// add a stats view to monitor performance:
const stats = new Stats();
document.body.appendChild(stats.dom);

let t = performance.now()
// the function called at frame-rate to animate & render the scene:
function animate() {
  // monitor our FPS:
  stats.begin();
  
  // compute current timing:
  const t1 = performance.now();
  const dt = t1-t;
  t = t1;

  // update the scene:
  cube.rotation.x = t * 0.001;
  cube.rotation.y = Math.cos(t * 0.002);

  // draw the scene:
  renderer.render( scene, camera );

  // // Re-Render the scene, but this time to the canvas (don't do this on Mobile!)
  // if (renderer.xr.isPresenting) {
  //       renderer.xr.enabled = false;
  //       let oldFramebuffer = renderer._framebuffer;
  //       renderer.state.bindXRFramebuffer( null );
  //       renderer.render(scene, camera);
  //       renderer.xr.enabled = true;
  //       renderer.state.bindXRFramebuffer(oldFramebuffer);
  //   }
  
  // monitor our FPS:
  stats.end();
};
// start!
renderer.setAnimationLoop(animate);

//////////////////////

// connect to websocket at same location as the web-page host:
const addr = location.origin.replace(/^http/, 'ws')
console.log("connecting to", addr)

// this is how to create a client socket in the browser:
let socket = new WebSocket(addr);

// let's know when it works:
socket.onopen = function() { 
    // or document.write("websocket connected to "+addr); 
    console.log("websocket connected to "+addr); 

	socket.send("hello")
}
socket.onerror = function(err) { 
    console.error(err); 
}
socket.onclose = function(e) { 
    console.log("websocket disconnected from "+addr); 

	location.reload()
}

socket.onmessage = function(msg) {
	console.log(msg.data)
}
