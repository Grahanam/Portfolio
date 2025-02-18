import * as THREE from "three";
import { Tween, Easing, Group } from "@tweenjs/tween.js";

import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { OutlinePass } from "three/addons/postprocessing/OutlinePass.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { LightningStrike } from "./geometries/LightningStrike.js";

//Models

import kuramamodel from "./models/kurama.glb?url";
import sasukemodel from "./models/sasuke_walk.glb?url";
import narutomodel from "./models/naruto.glb?url";
// import sharinganeye from "./models/editsharingan.glb?url";
// import vfx from "./models/vfx.glb?url";
// import fire from "./models/fire.glb?url";
import bridge from "./models/bridge2.glb?url";
import sasuno from "./models/sasuno.glb?url";

//Water and Sky Objects :ThreeJs example
import { Water } from "./objects/Water";
import { Sky } from "./objects/Sky";
//Water Image
import waternormals from "./static/normals/waternormals.jpeg?url";
import { outline } from "three/examples/jsm/tsl/display/OutlineNode.js";
import { flattenJSON } from "three/src/animation/AnimationUtils.js";

//Scene and Camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  2000
);

//Clock for Model Animation
let clock = new THREE.Clock();
let clock2 = new THREE.Clock();
let clock3 = new THREE.Clock();
let clock4 = new THREE.Clock();
let clock5 = new THREE.Clock();

const tweenGroup = new Group();

let renderer,
  composer,
  dirt,
  controls,
  model,
  model2,
  naruto,
  kurama,
  vfxmodel,
  bridgemodel1,
  bridgemodel2,
  firemodel,
  mixer,
  walk,
  idle,
  rage,
  narutowalk,
  sasunomixer,
  narutomixer,
  kuramamixer,
  eyespin,
  sharingan,
  cube1,
  cube2,
  cube3,
  cube4,
  lightn,
  lightn1,
  lightn2,
  fliper,
  skyUniforms,
  outlinePass;

fliper = true;

//Page 1 Div
let page1 = document.querySelector(".page1");
//Page 2 Div
let page2 = document.querySelector(".page2");
//Loader Div
let loaderanimation = document.querySelector("#loader");
//Message Div
let message = document.querySelector(".message");
//SwipeIcon
let swipeicon = document.querySelector(".swipeicon");

let setmodelloading = false;

const rayParams1 = {
  sourceOffset: new THREE.Vector3(),
  destOffset: new THREE.Vector3(),
  radius0: 0.05,
  radius1: 0.05,
  minRadius: 2.5,
  maxIterations: 7,
  isEternal: true,

  timeScale: 0.7,

  propagationTimeFactor: 0.05,
  vanishingTimeFactor: 0.95,
  subrayPeriod: 2.5,
  subrayDutyCycle: 0.3,
  maxSubrayRecursion: 3,
  ramification: 7,
  recursionProbability: 0.6,

  roughness: 0.85,
  straightness: 0.68,
};

const rayParams2 = {
  sourceOffset: new THREE.Vector3(),
  destOffset: new THREE.Vector3(),
  radius0: 0.05,
  radius1: 0.05,
  minRadius: 2.5,
  maxIterations: 7,
  isEternal: true,

  timeScale: 0.7,

  propagationTimeFactor: 0.05,
  vanishingTimeFactor: 0.95,
  subrayPeriod: 2.5,
  subrayDutyCycle: 0.3,
  maxSubrayRecursion: 3,
  ramification: 7,
  recursionProbability: 0.6,

  roughness: 0.85,
  straightness: 0.68,
};

const rayParams3 = {
  sourceOffset: new THREE.Vector3(),
  destOffset: new THREE.Vector3(),
  radius0: 0.05,
  radius1: 0.05,
  minRadius: 2.5,
  maxIterations: 7,
  isEternal: true,

  timeScale: 0.7,

  propagationTimeFactor: 0.05,
  vanishingTimeFactor: 0.95,
  subrayPeriod: 2.5,
  subrayDutyCycle: 0.3,
  maxSubrayRecursion: 3,
  ramification: 7,
  recursionProbability: 0.6,

  roughness: 0.85,
  straightness: 0.68,
};

const rayParams4 = {
  sourceOffset: new THREE.Vector3(),
  destOffset: new THREE.Vector3(),
  radius0: 0.05,
  radius1: 0.05,
  minRadius: 2.5,
  maxIterations: 7,
  isEternal: true,

  timeScale: 0.7,

  propagationTimeFactor: 0.05,
  vanishingTimeFactor: 0.95,
  subrayPeriod: 2.5,
  subrayDutyCycle: 0.3,
  maxSubrayRecursion: 3,
  ramification: 7,
  recursionProbability: 0.6,

  roughness: 0.85,
  straightness: 0.68,
};

let lightningStrike, lightningStrike2, lightningStrike3, lightningStrike4;
let lightningStrikeMesh,
  lightningStrikeMesh2,
  lightningStrikeMesh3,
  lightningStrikeMesh4;

const outlineMeshArray = [];

const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
//Water Object
const water = new Water(waterGeometry, {
  textureWidth: 512,
  textureHeight: 512,
  waterNormals: new THREE.TextureLoader().load(
    waternormals,
    function (texture) {
      texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping;
    }
  ),
  sunDirection: new THREE.Vector3(),
  // sunColor: 0xff0000, //0xffffff
  waterColor: 0x001e0f, //0x80080 //0x001e0f
  sunColor: 0xfff000, //0xffffff
  // distortionScale: 3.7,
  distortionScale: 0.7,
  fog: scene.fog !== undefined,
});

//Scene Setup
function init() {
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ReinhardToneMapping;
  document.body.appendChild(renderer.domElement);

  //Orbit Controls
  controls = new OrbitControls(camera, renderer.domElement);

  //Add Water object
  water.rotation.x = -Math.PI / 2;
  water.rotation.z = 0;
  scene.add(water);

  //Add Sky object
  const sky = new Sky();
  sky.scale.setScalar(10000); // Specify the dimensions of the skybox
  scene.add(sky); // Add the sky to our scene

  skyUniforms = sky.material.uniforms;
  // skyUniforms["turbidity"].value = 1; //0.001 5   10
  // skyUniforms["rayleigh"].value = 0.01; //0.01 6   2
  // skyUniforms["mieCoefficient"].value = 0.003; //0.003 0.005
  // skyUniforms["mieDirectionalG"].value = 0.988; //0.988  0.8

  skyUniforms["turbidity"].value = 5; //1 0.001 5   10
  skyUniforms["rayleigh"].value = 0.002; //0.01 6   2
  skyUniforms["mieCoefficient"].value = 0.001; //0.01 0.0001 0.003 0.005
  skyUniforms["mieDirectionalG"].value = 0.8; //0.4 //0.1 0.988  0.8

  const parameters = {
    elevation: 30, //30
    azimuth: 280, //190  175  115
  };

  const pmremGenerator = new THREE.PMREMGenerator(renderer);

  const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
  const theta = THREE.MathUtils.degToRad(parameters.azimuth);
  const sun = new THREE.Vector3();
  sun.setFromSphericalCoords(1, phi, theta);

  sky.material.uniforms["sunPosition"].value.copy(sun);
  water.material.uniforms["sunDirection"].value.copy(sun).normalize();
  scene.environment = pmremGenerator.fromScene(sky).texture;
  water.material.uniforms["speed"].value = 20.0;
  water.material.uniforms["time"].value = 10.0;

  const pointGeometry = new THREE.BufferGeometry();
  const pointMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.1, // Adjust the size of the point
  });

  // Define the position of the point
  const pointPosition = new Float32Array([0, 0, 0]); // x, y, z
  pointGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(pointPosition, 3)
  );

  // Create the point mesh
  cube1 = new THREE.Points(pointGeometry, pointMaterial);
  cube2 = new THREE.Points(pointGeometry, pointMaterial);
  cube3 = new THREE.Points(pointGeometry, pointMaterial);
  cube4 = new THREE.Points(pointGeometry, pointMaterial);

  cube1.castShadow =
    cube2.castShadow =
    cube3.castShadow =
    cube4.castShadow =
      true;

  scene.add(cube1, cube2, cube3, cube4);

  cube1.visible = false;
  cube2.visible = false;
  cube3.visible = false;
  cube4.visible = false;

  lightn = new THREE.PointLight(0x9c0cf4);
  // lightn = new THREE.PointLight(0x9900ff);
  lightn.castShadow = true;
  scene.add(lightn);

  let color1 = new THREE.Color(0x9c0cf4); // Initial color
  let color2 = new THREE.Color(0xff0000); // Target color
  let t = 0; // Interpolation factor

  lightn.shadow.mapSize.width = 512;
  lightn.shadow.mapSize.height = 512;
  lightn.shadow.camera.near = 0.5;
  lightn.shadow.camera.far = 500;

  lightn.position.y = 25;

  lightn1 = new THREE.PointLight(0x9c0cf4);
  lightn1.castShadow = true;
  scene.add(lightn1);

  lightn1.shadow.mapSize.width = 512;
  lightn1.shadow.mapSize.height = 512;
  lightn1.shadow.camera.near = 0.5;
  lightn1.shadow.camera.far = 500;

  lightn1.position.y = 70;
  lightn1.position.x = -180;
  lightn1.position.z = -4;

  lightn1.intensity = 25000;

  // Add Light to scene
  // const light = new THREE.PointLight(0xff0000, 0x444444, 1); // Red light
  // light.position.set(18, 10, 0);
  // light.castShadow = true;
  // scene.add(light);

  //Add shadow light to scene
  const shadowLight = new THREE.SpotLight();
  // shadowLight.lookAt(rocketModel.position);
  shadowLight.position.z = 0;
  shadowLight.position.y = 10;
  shadowLight.position.x = 0;
  shadowLight.castShadow = true;
  scene.add(shadowLight);

  const redlight = new THREE.AmbientLight(0xffffff); // soft white ligh
  redlight.position.y = 18;
  redlight.position.z = 10;
  redlight.position.x += 0;
  scene.add(redlight);

  //Orbit controls Setting:
  controls.target.set(4, 20, -3);
  controls.distance = 30;
  controls.minDistance = 30;
  controls.maxDistance = 30;
  controls.minPolarAngle = Math.PI / 2;
  controls.maxPolarAngle = Math.PI / 2;
  // controls.minAzimuthAngle = -2.9;
  // controls.maxAzimuthAngle = 2.9;
  controls.enablePan = false;
  controls.enabled = false;

  controls.update();

  const loader = new GLTFLoader();
  //load kurama
  loader.load(kuramamodel, function (glft) {
    kurama = glft.scene;
    kurama.scale.set(14, 14, 14); //8
    kurama.position.set(0, 0, 0);
    kurama.position.z = -24;
    kurama.translateX(-200);

    kurama.position.y = -24;
    // kurama.rotation.y += 1.5;
    kurama.rotation.z -= 1.5;
    kurama.rotation.x += 1.55;
    kurama.rotation.y += 1.55;
    let animation = glft.animations;

    scene.add(kurama);
    kurama.visible = false;

    kuramamixer = new THREE.AnimationMixer(kurama);
    let rageAnim = THREE.AnimationClip.findByName(
      animation,
      "NB_GP_BRmonsterAnim_Shoot1"
    );

    rage = kuramamixer.clipAction(rageAnim);
    rage.play();
  });

  //Add naruto to scene
  loader.load(narutomodel, function (glft) {
    naruto = glft.scene;

    naruto.scale.set(1.1, 1.1, 1.1); //8
    naruto.position.set(0, 0, 0);
    naruto.position.z = -3;

    naruto.position.y += 12;
    naruto.rotation.y += 1.5;
    let animation = glft.animations;
    // redlight.lookAt(naruto);
    scene.add(naruto);
    naruto.visible = false;
    const orangeColor = 0xf4560c;
    const spotLight = new THREE.SpotLight(orangeColor);
    spotLight.position.set(-180, -4, -10); // Set the position of the spotlight

    spotLight.target.position.set(
      naruto.position.x,
      naruto.position.y,
      naruto.position.z
    ); // Set the target of the spotlight to the character

    spotLight.distance = 20; // Set the distance of the light
    spotLight.angle = Math.PI / 4; // Set the angle of the spotlight cone
    scene.add(spotLight); // Add the spotlight to the scene
    scene.add(spotLight.target);
    spotLight.intensity = 3000;

    narutomixer = new THREE.AnimationMixer(naruto);
    // let idleAnim = THREE.AnimationClip.findByName(animation, "idle");
    // idle = mixer.clipAction(idleAnim);
    // idle.play();
    let walkAnim = THREE.AnimationClip.findByName(animation, "walk.001");

    narutowalk = narutomixer.clipAction(walkAnim);
    narutowalk.play();
  });

  //Add Sasuno to scene
  loader.load(sasuno, function (glft) {
    model2 = glft.scene;
    model2.scale.set(1.5, 1.5, 1.5); //8
    model2.position.set(0, 0, 0);
    model2.position.z = -15;
    model2.translateX(-200);

    model2.position.y = -4;
    model2.rotation.y += 1.5;
    let animation = glft.animations;

    // redlight.lookAt(model2);
    scene.add(model2);
    const purpleColor = 0xffffff;
    const spotLight = new THREE.SpotLight(purpleColor);
    spotLight.position.set(-180, -4, -10); // Set the position of the spotlight

    spotLight.target.position.set(
      model2.position.x,
      model2.position.y,
      model2.position.z
    ); // Set the target of the spotlight to the character

    spotLight.distance = 20; // Set the distance of the light
    spotLight.angle = Math.PI / 4; // Set the angle of the spotlight cone
    // scene.add(spotLight); // Add the spotlight to the scene
    // scene.add(spotLight.target);
    spotLight.intensity = 3000;

    sasunomixer = new THREE.AnimationMixer(model2);
    // let idleAnim = THREE.AnimationClip.findByName(animation, "idle");
    // idle = mixer.clipAction(idleAnim);
    // idle.play();
    let idleAnim = THREE.AnimationClip.findByName(animation, "idle");

    idle = sasunomixer.clipAction(idleAnim);
    idle.play();
  });

  //Add Sasuke to scene
  loader.load(sasukemodel, function (glft) {
    model = glft.scene;
    model.scale.set(5, 5, 5); //8
    model.position.set(0, 0, 0);
    model.position.z = -3;

    model.position.y += 12;
    model.rotation.y += 1.5;
    let animation = glft.animations;
    // redlight.lookAt(model);
    scene.add(model);
    const purpleColor = 0xffffff;
    const spotLight = new THREE.SpotLight(purpleColor);
    spotLight.position.set(4, 1, 10); // Set the position of the spotlight

    spotLight.target.position.set(
      model.position.x,
      model.position.y,
      model.position.z
    ); // Set the target of the spotlight to the character

    spotLight.distance = 200; // Set the distance of the light
    spotLight.angle = Math.PI / 4; // Set the angle of the spotlight cone
    mixer = new THREE.AnimationMixer(model);
    let walkAnim = THREE.AnimationClip.findByName(
      animation,
      "Armature|mixamo.com|Layer0"
    );

    walk = mixer.clipAction(walkAnim);
    walk.play();

    setmodelloading = true;
    message.style.display = "flex";

    //Orbit control event listener to handle object rotation,page hide/show
    controls.addEventListener("change", () => {
      const maxverticalAngle = Math.PI / 3;
      let azimuthangle = controls.getAzimuthalAngle();
      // console.log(azimuthangle)
      //Sharigan Eye y rotation
      // sharingan.rotation.y = azimuthangle / 2;

      //Fire and Energy Ring rotation z
      // firemodel.children[0].rotation.z = azimuthangle;
      // vfxmodel.children[0].rotation.z = azimuthangle;
      // vfxmodel.rotation.y = azimuthangle / 2;
      // firemodel.rotation.y = azimuthangle / 2;

      //Show Page1
      if (azimuthangle === 2.9) {
        // page1.style.display = "flex";
        // divopen1 = true;
      } else {
        // page1.style.display = "none";
      }
      //Show Page2
      // original end -0.9
      if (azimuthangle === -2.9) {
        // page2.style.display = "flex";
        // divopen2 = true;
      } else {
        // page2.style.display = "none";
      }
      //Sharingan Eye x rotation
      // if (azimuthangle < 0) {
      //   sharingan.rotation.x = -azimuthangle / 2;
      // } else {
      //   sharingan.rotation.x = azimuthangle / 2;
      // }
    });
  });

  loader.load(bridge, function (gltf) {
    bridgemodel1 = gltf.scene;
    // bridgemodel1.scale.set(0.5, 0.5, 0.5);
    bridgemodel1.position.set(0, 0, 0);
    bridgemodel1.rotation.y = 1.5;
    bridgemodel1.position.z = -45;
    bridgemodel1.position.y = 4;
    bridgemodel2 = bridgemodel1.clone();
    bridgemodel1.translateZ(-1600);

    bridgemodel2.position.set(0, 0, 0);
    bridgemodel2.rotation.y = 1.5;
    bridgemodel2.position.z = -47;
    bridgemodel2.position.y = 4.2;
    bridgemodel2.translateZ(142.2);
    // bridgemodel3 = bridgemodel1.clone();
    scene.add(bridgemodel1);
    scene.add(bridgemodel2);
  });

  function createOutline(scene, objectsArray) {
    outlinePass = new OutlinePass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      scene,
      camera,
      objectsArray
    );
    outlinePass.edgeStrength = 2;
    outlinePass.edgeGlow = 2.5;
    outlinePass.edgeThickness = 1;
    // outlinePass.visibleEdgeColor.set(0x00aaff);
    outlinePass.visibleEdgeColor.set(0x9c0cf4);
    composer.addPass(outlinePass);
    return outlinePass;
  }

  function recreateRay() {
    lightningStrike = new LightningStrike(rayParams1);
    lightningStrikeMesh = new THREE.Mesh(
      lightningStrike,
      new THREE.MeshBasicMaterial({ color: 0x9c0cf4 })
    );

    lightningStrike2 = new LightningStrike(rayParams2);
    lightningStrikeMesh2 = new THREE.Mesh(
      lightningStrike2,
      new THREE.MeshBasicMaterial({ color: 0x9c0cf4 })
    );

    lightningStrike3 = new LightningStrike(rayParams3);
    lightningStrikeMesh3 = new THREE.Mesh(
      lightningStrike3,
      new THREE.MeshBasicMaterial({ color: 0x9c0cf4 })
    );
    lightningStrike4 = new LightningStrike(rayParams4);
    lightningStrikeMesh4 = new THREE.Mesh(
      lightningStrike4,
      new THREE.MeshBasicMaterial({ color: 0x9c0cf4 })
    );

    outlineMeshArray.push(lightningStrikeMesh);
    outlineMeshArray.push(lightningStrikeMesh2);
    outlineMeshArray.push(lightningStrikeMesh3);
    outlineMeshArray.push(lightningStrikeMesh4);
    scene.add(
      lightningStrikeMesh,
      lightningStrikeMesh2,
      lightningStrikeMesh3,
      lightningStrikeMesh4
    );
  }

  composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  recreateRay();
  createOutline(scene, outlineMeshArray, new THREE.Color(0x0000ff));
}

window.addEventListener("resize", onWindowResize, false);

//Handle Window resize
function onWindowResize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  water.material.uniforms["time"].value += 1 / 60.0;
  camera.updateProjectionMatrix();
}

//Click event listener to handle page show/hide,music,loaderanimation hide,message display
// let divopen1 = false;
// page1.addEventListener("click", () => {
//   if (divopen1) {
//     page1.style.display = "none";
//     divopen1 = false;
//   }
// });
// let divopen2 = false;
// page2.addEventListener("click", () => {
//   if (divopen2) {
//     page2.style.display = "none";
//     divopen2 = false;
//   }
// });

//On click event listener handle audio play, loader animation hide
let toggleEnabler = false;
window.addEventListener("click", () => {
  if (toggleEnabler) {
    characterSwitch();
  }
  if (setmodelloading) {
    loaderanimation.remove();
    const targetPosition = new THREE.Vector3(33, 20, -1); // Target camera position
    const targetLookAt = new THREE.Vector3(4, 20, -3); // Target look-at point (same as controls.target)
    animateCameraToTarget(targetPosition, targetLookAt);
    message.style.display = "none";
    // swipeicon.style.display = "flex";
    // setTimeout(() => {
    //   swipeicon.style.display = "none";
    // }, 2000);
    setmodelloading = false;
    // let audio = document.querySelector("#tune");
    // audio.play();
    toggleEnabler = true;
  }
  //enable character switches
});
let t = 0;

function render() {
  t += 0.01;

  renderer.autoClear = false;
  renderer.clear();
  renderer.setPixelRatio(window.devicePixelRatio);

  let offset = 0;

  [cube1, cube2, cube3, cube4].map((obj) => {
    obj.rotation.x = t + offset;
    obj.rotation.y = t + offset;
    offset++;
  });
  // cube1.position.set(-10, Math.abs(Math.sin(t + 0.1) * 5), 7);
  cube1.position.set(-10, 22.5 + 7.5 * Math.sin(t + 30), 7);
  cube2.position.set(0, 22.5 + 7.5 * Math.sin(t + 25), -12.5);
  cube3.position.set(20, 22.5 + 7.5 * Math.sin(t + 20), -10);
  cube4.position.set(5, 22.5 + 7.5 * Math.sin(t + 35), 10);

  if (
    lightningStrike &&
    lightningStrike2 &&
    lightningStrike3 &&
    lightningStrike4
  ) {
    lightningStrike.rayParameters.sourceOffset.set(0, 15, -4);
    lightningStrike.rayParameters.destOffset.copy(cube2.position);

    lightningStrike2.rayParameters.sourceOffset.set(0, 17, -4);
    lightningStrike2.rayParameters.destOffset.copy(cube3.position);

    lightningStrike3.rayParameters.sourceOffset.set(0, 18, -1.5);
    lightningStrike3.rayParameters.destOffset.copy(cube1.position);

    lightningStrike4.rayParameters.sourceOffset.set(0, 17, -2);
    lightningStrike4.rayParameters.destOffset.copy(cube4.position);

    lightningStrike.update(t);
    lightningStrike2.update(t);
    lightningStrike3.update(t);
    lightningStrike4.update(t);
  }

  lightn.intensity = Math.random() * 2000;
  // lightn1.intensity = Math.random() * 20000;
  composer.render();
}

function animateCameraToTarget(targetPosition, targetLookAt, duration = 1.5) {
  let startTime = performance.now();
  let startPos = camera.position.clone();
  let startLookAt = controls.target.clone();

  function updateCamera() {
    let elapsed = (performance.now() - startTime) / 1000; // Convert to seconds
    let t = Math.min(elapsed / duration, 1); // Normalize time [0,1]

    // Interpolate position
    camera.position.lerpVectors(startPos, targetPosition, t);

    // Interpolate lookAt but respect OrbitControls constraints
    let newLookAt = new THREE.Vector3().lerpVectors(
      startLookAt,
      targetLookAt,
      t
    );

    // Ensure OrbitControls respects the fixed distance
    let direction = new THREE.Vector3()
      .subVectors(camera.position, newLookAt)
      .normalize();
    camera.position.copy(newLookAt.clone().addScaledVector(direction, 30)); // Maintain distance

    // Update controls
    controls.target.copy(newLookAt);
    camera.lookAt(newLookAt);
    controls.update();

    if (t < 1) {
      requestAnimationFrame(updateCamera);
    } else {
      controls.enabled = false;
    }
  }

  controls.enabled = false;
  requestAnimationFrame(updateCamera);
}

// Click event to trigger the camera animation

// document.getElementById("animate").addEventListener("click", () => {
//   const targetPosition = new THREE.Vector3(33, 20, -1); // Target camera position
//   const targetLookAt = new THREE.Vector3(4, 20, -3); // Target look-at point (same as controls.target)
//   animateCameraToTarget(targetPosition, targetLookAt);
// });

// Click listener
// document.getElementById("animate").addEventListener("click", () => {
//   const targetPosition = new THREE.Vector3(20, -1, 24);
//   const targetLookAt = new THREE.Vector3(0, 0, 0);
//   animateCameraToTarget(targetPosition, targetLookAt, 15000);
// });
let toggle = false;

function characterSwitch() {
  if (toggle) {
    if (model && naruto && model2 && kurama) {
      model.visible = true;
      naruto.visible = false;
      model2.visible = true;
      kurama.visible = false;
      skyUniforms["turbidity"].value = 5; //1 0.001 5   10
      skyUniforms["rayleigh"].value = 0.002; //0.01 6   2
      skyUniforms["mieCoefficient"].value = 0.001; //0.01 0.0001 0.003 0.005
      skyUniforms["mieDirectionalG"].value = 0.8; //0.4 //0.1 0.988  0.8
    }
    const purpleColor = 0x9c0cf4;
    lightn.color.set(purpleColor);
    // Update the color of all lightning strike meshes
    outlineMeshArray.forEach((mesh) => {
      mesh.material.color.set(purpleColor);
    });

    if (outlinePass) {
      outlinePass.visibleEdgeColor.set(purpleColor);
    }
    toggle = false;
  } else {
    if (model && naruto && model2 && kurama) {
      model.visible = false;
      naruto.visible = true;
      model2.visible = false;
      kurama.visible = true;
      skyUniforms["turbidity"].value = 2; //0.001 5   10
      skyUniforms["rayleigh"].value = 0.1; //6   2
      skyUniforms["mieCoefficient"].value = 0.00001; //0.01 0.0001 0.003 0.005
      skyUniforms["mieDirectionalG"].value = 0.988; //0.1 0.988  0.8
    }

    const newColor = 0xffa500;

    lightn.color.set(newColor);

    // Update the color of all lightning strike meshes
    outlineMeshArray.forEach((mesh) => {
      mesh.material.color.set(newColor);
    });

    if (outlinePass) {
      outlinePass.visibleEdgeColor.set(newColor);
    }
    toggle = true;
  }
}

//Render animation
function animate() {
  render();
  requestAnimationFrame(animate);
  // renderer.render(scene, camera);
  // animateGround(deltaTime);
  tweenGroup.update(); // Update all tweens in the group
  controls.update();
  if (toggle) {
    if (narutomixer) {
      narutomixer.update(clock4.getDelta());
    }

    if (kuramamixer) {
      kuramamixer.update(clock5.getDelta());
    }
  } else {
    if (sasunomixer) {
      sasunomixer.update(clock3.getDelta());
    }

    if (mixer) {
      mixer.update(clock.getDelta());
    }
  }

  if (bridgemodel1 && bridgemodel2) {
    // bridgemodel1.position.x -= 5;
    bridgemodel1.translateZ(-0.1);
    bridgemodel2.translateZ(-0.1);
  }

  if (fliper) {
    if (bridgemodel2?.position.x <= -1600) {
      bridgemodel1.position.x = 0;
      bridgemodel1.position.z = -45;
      bridgemodel1.position.y = 4;
      bridgemodel1.translateZ(135);
      fliper = false;
    }
  } else {
    if (bridgemodel1?.position.x <= -1600) {
      bridgemodel2.position.x = 0;
      bridgemodel2.position.z = -45;
      bridgemodel2.position.y = 4;
      bridgemodel2.translateZ(135);
      fliper = true;
    }
  }

  water.material.uniforms["time"].value += 1 / 60.0;
}

init();
animate();
