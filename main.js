import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import {FBXLoader} from 'three/addons/loaders/FBXLoader.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// import {MirroredRepeatWrapping} from 'three'
import {
    OrbitControls
  } from "https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/OrbitControls";

import vertexShader from './objects/shaders/VertexShader.glsl'
import fragmentShader from './objects/shaders/FragmentShader.glsl'
const BLOOM_SCENE = 1;
const bloomLayer = new THREE.Layers();
bloomLayer.set( BLOOM_SCENE );
const params = {
    threshold: 0,
    strength: 3,
    radius: 0,  //0.5
    exposure: 2   //1
};
const darkMaterial = new THREE.MeshBasicMaterial( { color: 'black' } );
const materials = {}

import  {Water} from './objects/Water'
import { Sky } from './objects/Sky';
let bloomComposer,finalComposer
let setmodelloading=false
let loaderanimation=document.querySelector('#loader')
let message=document.querySelector('.message')
let mixer,idle,mixer2,eyespin,sharingan
let clock = new THREE.Clock()
let clock2=new THREE.Clock() 
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 2000 );
let renderer

const waterGeometry = new THREE.PlaneGeometry(10000, 10000);

//Water Object
const water = new Water(
    waterGeometry,
    {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: new THREE.TextureLoader().load('static/normals/waternormals.jpeg', function (texture) {
            texture.wrapS = texture.wrapT =THREE.MirroredRepeatWrapping;
        }),
        sunDirection: new THREE.Vector3(),
        sunColor: 0xff0000,   //0xffffff
        waterColor: 0x80080, //0x001e0f
        distortionScale: 3.7,
        fog: scene.fog !== undefined
    }
);



// renderer.setSize( window.innerWidth, window.innerHeight );
// document.body.appendChild( renderer.domElement );


function init(){
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.toneMapping = THREE.ReinhardToneMapping;
    document.body.appendChild( renderer.domElement );

    // let controls = new OrbitControls(camera, renderer.domElement);


    water.rotation.x = -Math.PI / 2;
    water.rotation.z = 0;
    scene.add(water)

    //Add Sky object
    const sky = new Sky();
    sky.scale.setScalar(10000); // Specify the dimensions of the skybox
    scene.add(sky); // Add the sky to our scene

    const skyUniforms = sky.material.uniforms;
    skyUniforms['turbidity'].value = 1;   //0.001 5   10
    skyUniforms['rayleigh'].value = 0.01;   //0.01 6   2
    skyUniforms['mieCoefficient'].value = 0.003; //0.003 0.005
    skyUniforms['mieDirectionalG'].value = 0.988;   //0.988  0.8
    
    const parameters = {
        elevation: 30,
        azimuth: 190   //175  115
    };

    const pmremGenerator = new THREE.PMREMGenerator(renderer);

    const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
    const theta = THREE.MathUtils.degToRad(parameters.azimuth);
    const sun=new THREE.Vector3()
    sun.setFromSphericalCoords(1, phi, theta);

    sky.material.uniforms['sunPosition'].value.copy(sun);
    water.material.uniforms['sunDirection'].value.copy(sun).normalize();
    scene.environment = pmremGenerator.fromScene(sky).texture;
    water.material.uniforms['speed'].value = 10.0;
    water.material.uniforms['time'].value=10.0
    
    //Add Cylinder Pole to scene
    const geometry = new THREE.CylinderGeometry( 2, 2, 20, 32 ); 
    const material = new THREE.MeshBasicMaterial( {color: 0x00000} ); 
    const cylinder = new THREE.Mesh( geometry, material ); 
    scene.add( cylinder );
    
    // Add light to scene
    // const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
    // light.position.set(0, 300, 0);
    // scene.add(light);

    const light = new THREE.HemisphereLight(0xff0000, 0x444444, 1); // Red light
light.position.set(0, 300, 0);
scene.add(light);

    //Add shadow light to scene
    const shadowLight = new THREE.SpotLight();
    // shadowLight.lookAt(rocketModel.position);
    shadowLight.position.z = 50;
    shadowLight.position.y = 100;
    shadowLight.position.x = 100;
    shadowLight.castShadow = true;
    scene.add(shadowLight);

    const redlight = new THREE.AmbientLight( 0xFF0000 ); // soft white light
    redlight.position.y=18
    redlight.position.z=18
    redlight.position.x+=0
    scene.add( redlight );


    camera.position.z = 18;
    camera.position.y=18
    camera.rotation.x+=0
    let model
    const loader=new GLTFLoader()

    //Add Sasuke to scene
    loader.load('/models/sasuke.glb',function(glft){
    // console.log(glft) 
    model=glft.scene
    // model.children[0].material=sasuke_mtl
    // model.children[0].castShadow=true
    // model.children[0].receiveShadow=true
    // console.log()
    // console.log(model.children[0])
    // model.children[0].material.metalness = 0;
    //     model.children[1].material.metalness = 0;
    // model.traverse(o=>{
    //     if(o.isMesh){
    //         o.castShadow=true
    //         o.receiveShadow=true
            
    //         // o.material=sasuke_mtl
    //     }
    // })
    model.scale.set(12, 12, 12);    //8
    model.position.y+=9.9
    // model.rotation.x+=3
    let animation=glft.animations
    model.layers.toggle( BLOOM_SCENE );
    
    // redlight.lookAt(model)
    scene.add(model)
    const purpleColor = 0x800080
    const spotLight = new THREE.SpotLight(purpleColor);
    spotLight.position.set(10, 20, 30); // Set the position of the spotlight
    spotLight.target.position.set(model.position.x, model.position.y, model.position.z); // Set the target of the spotlight to the character

spotLight.distance = 200; // Set the distance of the light
spotLight.angle = Math.PI / 4; // Set the angle of the spotlight cone

scene.add(spotLight); // Add the spotlight to the scene
scene.add(spotLight.target); 
    mixer = new THREE.AnimationMixer(model)
    let idleAnim = THREE.AnimationClip.findByName(animation, 'idle');
    console.log(idleAnim)
    idle = mixer.clipAction(idleAnim);
    idle.play();

    setmodelloading=true
    message.style.display='flex'
    // loaderanimation.remove()
});



const geometry1 = new THREE.IcosahedronGeometry( 1, 15 );

const color = new THREE.Color();
    color.setHSL( Math.random(), 0.7, Math.random() * 0.2 + 0.05 );

    const material1 = new THREE.MeshBasicMaterial( { color:0xff0000 } );
    const sphere = new THREE.Mesh( geometry1, material1 );
    sphere.layers.toggle( BLOOM_SCENE );
    // render();
    sphere.position.y+=20
    sphere.position.x+=10
    sphere.position.z-=30
    sphere.scale.set(5,5,5)
    // scene.add( sphere );

    //Add Shiringan Eye
    loader.load('/models/editsharingan.glb',function(glft){
        console.log(glft)
        sharingan=glft.scene
        let animation=glft.animations[0]
        // console.log(animation)
        sharingan.scale.set(300,300,300)
        sharingan.position.x+=0
        sharingan.position.z-=30
        sharingan.position.y+=30
        sharingan.layers.toggle( BLOOM_SCENE );
        scene.add(sharingan)
        
        mixer2 = new THREE.AnimationMixer(sharingan)
        let spinAnim = THREE.AnimationClip.findByName(glft.animations, 'Take 001');
        // const clip = glft.animations.find((clip) => clip.name === 'Take 001');
        // console.log(clip)
        console.log(spinAnim)
        eyespin = mixer2.clipAction(spinAnim);
        eyespin.play();
    })

}



function onMouseMove(event){
    //  console.log(event.clientX)
    
     const mousePosition = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1,
    }; 
    sharingan.rotation.x = -mousePosition.y+0.1;
    sharingan.rotation.y = mousePosition.x;
}
window.addEventListener('mousemove',onMouseMove)

window.addEventListener('resize',onWindowResize,false)

function onWindowResize(){
    renderer.setSize( window.innerWidth, window.innerHeight );
    camera.aspect = window.innerWidth / window.innerHeight
    water.material.uniforms['time'].value+=1/60.0
    camera.updateProjectionMatrix()
}

let divopen=true
window.addEventListener('click',()=>{
    if(setmodelloading){
        loaderanimation.remove()
        message.style.display='none'
        let audio=document.querySelector('#tune')
        audio.play()
    }
    let page1=document.querySelector('.page1')
    

    if(divopen){
         page1.style.display='none'
         divopen=false
    }else{
         page1.style.display='flex'
         divopen=true
    }
})
// let button=document.getElementById('showinfo')
// button.addEventListener('click',()=>{
//     let page1=document.querySelector('.page1')
//     // console.log(page1)
//     if(divopen){
//         page1.style.display='none'
//         divopen=false
//     }else{
//         page1.style.display='flex'
//         divopen=true
//     }
    
// })



// var hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
// hemiLight.position.set( 0, 300, 0 );
// scene.add( hemiLight );

// var dirLight = new THREE.DirectionalLight( 0xffffff );
// dirLight.position.set( 75, 300, -75 );
// scene.add( dirLight );

// const objloader=new OBJLoader()
// objloader.load('models/floating_island.obj',function(object){
//     console.log(object)
//     scene.add(object)
// },
// function(xhr){
//     console.log((xhr.loaded/xhr.total*100)+'% loaded')
// }
// ,
// function(error){
//     console.log('An error occured')
// }
// )


// let sasuke_txt = new THREE.TextureLoader().load('models/texture/baju.png');

// sasuke_txt.flipY = false; // we flip the texture so that its the right way up

// const sasuke_mtl = new THREE.MeshPhongMaterial({
//   map: sasuke_txt,
//   color: 0xffffff,
//   skinning: true
// });



// loader.load('models/lightning.glb',function(glft){
//     console.log(glft)
//     const light=glft.scene
//     scene.add(light)

// })


// loader.load('models/glowingrock/scene.gltf',function(glft){
//     console.log(glft)
//     const rock=glft.scene
//     rock.scale.set(7,7,7)
//     rock.position.x+=10
//     scene.add(rock)

// })


// const geometry = new THREE.BoxGeometry( 1, 1, 1 );
// const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
// const cube = new THREE.Mesh( geometry, material );


// scene.add( cube );


// camera.rotation.y+=90*Math.PI/180


function animate() {
	requestAnimationFrame( animate );

	// cube.rotation.x += 0.01;
	// cube.rotation.y += 0.01;

	renderer.render( scene, camera );
    // scene.traverse( darkenNonBloomed );
    // bloomComposer.render();
    // scene.traverse( restoreMaterial );
    // finalComposer.render();
    // bloomComposer.render();
    if (mixer2) {
        mixer2.update(clock2.getDelta());
    }
    
    if (mixer) {
        mixer.update(clock.getDelta());
    }
    
    // light.rotation.x+=0.01
    water.material.uniforms['time'].value+=1/60.0
  
}
init()
animate();


function disposeMaterial( obj ) {

    if ( obj.material ) {

        obj.material.dispose();

    }

}

function darkenNonBloomed( obj ) {

    if ( obj.isMesh && bloomLayer.test( obj.layers ) === false ) {

        materials[ obj.uuid ] = obj.material;
        obj.material = darkMaterial;

    }

}

function restoreMaterial( obj ) {

    if ( materials[ obj.uuid ] ) {

        obj.material = materials[ obj.uuid ];
        delete materials[ obj.uuid ];

    }

}
