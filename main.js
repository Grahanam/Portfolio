import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


//Models 
import sasukemodel from './models/sasuke.glb?url'
import sharinganeye from './models/editsharingan.glb?url'
import vfx from './models/vfx.glb?url'
import fire from './models/fire.glb?url'

//Water and Sky Objects :ThreeJs example
import  {Water} from './objects/Water'
import { Sky } from './objects/Sky';
//Water Image
import waternormals from './static/normals/waternormals.jpeg?url'


//Scene and Camera 
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 2000 );

//Clock for Model Animation
let clock = new THREE.Clock()
let clock2=new THREE.Clock() 

let renderer,
    controls,
    vfxmodel,
    firemodel,
    mixer,
    idle,
    mixer2,
    eyespin,
    sharingan

//Page 1 Div    
let page1=document.querySelector('.page1')
//Page 2 Div
let page2=document.querySelector('.page2')
//Loader Div
let loaderanimation=document.querySelector('#loader')
//Message Div
let message=document.querySelector('.message')

let setmodelloading=false

const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
//Water Object
const water = new Water(
    waterGeometry,
    {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: new THREE.TextureLoader().load(waternormals, function (texture) {
            texture.wrapS = texture.wrapT =THREE.MirroredRepeatWrapping;
        }),
        sunDirection: new THREE.Vector3(),
        sunColor: 0xff0000,   //0xffffff
        waterColor: 0x80080, //0x001e0f
        distortionScale: 3.7,
        fog: scene.fog !== undefined
    }
);


//Scene Setup
function init(){

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.toneMapping = THREE.ReinhardToneMapping;
    document.body.appendChild( renderer.domElement );

    //Orbit Controls
    controls = new OrbitControls(camera, renderer.domElement);   
    
    //Add Water object
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
        elevation: 20,  //30
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
    const geometry = new THREE.CylinderGeometry( 1.8, 1.8, 20, 25 ); 
    const material = new THREE.MeshStandardMaterial({
        color: 0x000000,
        roughness: 0.1, 
        metalness: 1, 
    });
    const cylinder = new THREE.Mesh( geometry, material ); 
    scene.add( cylinder );

    

    //Add Light to scene
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


    //Camera initial position
    // camera.position.z = 30;
    // camera.position.y=30
    // camera.rotation.x=30

    // camera.position.z = 30;
    // camera.position.y=25
    // camera.rotation.x=0
    // camera.rotation.x=-Math.PI/2
    // camera.rotation.y=Math.PI/2
    // camera.rotateX(3)

    //Orbit controls Setting:
    controls.target.set(0,9.9,0)
    controls.distance=30
    controls.minDistance=30
    controls.maxDistance=30
    controls.minPolarAngle=Math.PI/2
    controls.maxPolarAngle=Math.PI/2
    controls.minAzimuthAngle=-0.9
    controls.maxAzimuthAngle=0.9
    controls.enablePan=false

    controls.update()
    


    let model
    const loader=new GLTFLoader()

    //Add Sasuke to scene
    loader.load(sasukemodel,function(glft){
    // console.log(glft) 
    model=glft.scene
    model.scale.set(12, 12, 12);    //8
    model.position.y+=9.8
    // model.rotation.x+=3
    let animation=glft.animations
    redlight.lookAt(model)
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
    // console.log(idleAnim)
    idle = mixer.clipAction(idleAnim);
    idle.play();

    setmodelloading=true
    message.style.display='flex'


    //Orbit control event listener to handle object rotation,page hide/show
    controls.addEventListener('change',()=>{
        const maxverticalAngle=Math.PI/3
        let azimuthangle=controls.getAzimuthalAngle()
        // console.log(azimuthangle)
        //Sharigan Eye y rotation
        sharingan.rotation.y=azimuthangle/2

        //Fire and Energy Ring rotation z 
        firemodel.children[0].rotation.z=azimuthangle
        vfxmodel.children[0].rotation.z=azimuthangle
        vfxmodel.rotation.y=azimuthangle/2
        firemodel.rotation.y=azimuthangle/2

        //Show Page1
        if(azimuthangle===0.9){
            page1.style.display='flex'
            divopen1=true
        }else{
            page1.style.display='none'
        }
        //Show Page2
        if(azimuthangle===-0.9){
            page2.style.display='flex'
            divopen2=true
        }else{
            page2.style.display='none'
        }
        //Sharingan Eye x rotation
        if(azimuthangle<0){
             sharingan.rotation.x=-azimuthangle/2
        }else{
            sharingan.rotation.x=azimuthangle/2
        }
        
    })
});




    //Add Shiringan Eye
    loader.load(sharinganeye,function(glft){
        console.log(glft)
        sharingan=glft.scene
        let animation=glft.animations[0]
        // console.log(animation)
        sharingan.scale.set(300,300,300)
        sharingan.position.x+=0
        sharingan.position.z-=30
        sharingan.position.y+=30
        scene.add(sharingan)
        
        mixer2 = new THREE.AnimationMixer(sharingan)
        let spinAnim = THREE.AnimationClip.findByName(glft.animations, 'Take 001');
        // console.log(spinAnim)
        eyespin = mixer2.clipAction(spinAnim);
        eyespin.play();
    })

    loader.load(vfx,function(gltf){
        console.log(gltf)
          vfxmodel=gltf.scene
          vfxmodel.scale.set(5,5,5)
          vfxmodel.position.y=4
          scene.add(vfxmodel)
    })

    loader.load(fire,function(gltf){
        console.log(gltf)
          firemodel=gltf.scene
          firemodel.scale.set(0.1,0.1,0.1)
          firemodel.position.y=9.9
          scene.add(firemodel)
    })

}



//Sharigan Eye following cursor
function onMouseMove(event){
    //  console.log(event.clientX)
    
    //  const mousePosition = {
    //     x: (event.clientX / window.innerWidth) * 2 - 1,
    //     y: -(event.clientY / window.innerHeight) * 2 + 1,
    // }; 
    // sharingan.rotation.x = -mousePosition.y+0.1;
    // sharingan.rotation.y = mousePosition.x;
}


window.addEventListener('resize',onWindowResize,false)

//Handle Window resize
function onWindowResize(){
    renderer.setSize( window.innerWidth, window.innerHeight );
    camera.aspect = window.innerWidth / window.innerHeight
    water.material.uniforms['time'].value+=1/60.0
    camera.updateProjectionMatrix()
}

//Click event listener to handle page show/hide,music,loaderanimation hide,message display
let divopen1=false
page1.addEventListener('click',()=>{
    if(divopen1){
        page1.style.display='none'
        divopen1=false 
    }
})
let divopen2=false
page2.addEventListener('click',()=>{
    if(divopen2){
        page2.style.display='none'
        divopen2=false 
    }
})

//On click event listener handle audio play, loader animation hide
window.addEventListener('click',()=>{
    if(setmodelloading){
        loaderanimation.remove()
        message.style.display='none'
        setmodelloading=false
        let audio=document.querySelector('#tune')
        audio.play()
    }
})



//Render animation
function animate() {
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
    if (mixer2) {
        mixer2.update(clock2.getDelta());
    }
    
    if (mixer) {
        mixer.update(clock.getDelta());
    }
    
    water.material.uniforms['time'].value+=1/60.0
  
}

// async function transition1(duration){
//     controls.enableRotate=false
//     controls.enableZoom=false
//     gsap.to(camera.position, { duration: duration, ease: "power1.inOut",
//             x: 0,
//             y: 18,
//             z: 18})
            
//             // gsap.to(camera.position, { duration: duration, ease: "power1.inOut",
//             // x: 11,
//             // y: 1,
//             // z: 7.6})
//             // await sleep(15)
//             controls.enableRotate = true
//             controls.enableZoom = true
// }

init()
animate();






