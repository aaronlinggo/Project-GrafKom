var scene = new THREE.Scene(); scene.background = new THREE.Color('rgb(112, 219, 255)');
var cam = new THREE.PerspectiveCamera(45,innerWidth/innerHeight,1,100); // PARAM(FOV,ASPECT_RATIO,nearclip,farclip)
var renderer = new THREE.WebGL1Renderer({antialias:true});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.BasicShadowMap;


// ADD RENDERER TO HTML
renderer.setSize(innerWidth,innerHeight);
document.body.appendChild(renderer.domElement);

// CONTROL
//var control = new THREE.OrbitControls(cam,renderer.domElement);
var clock = new THREE.Clock();
var control = new THREE.FirstPersonControls(cam, renderer.domElement);
control.lookSpeed = 0.15;
control.enabled = true;
control.activeLook = true;
control.lookVertical= true;
control.constrainVertical = true;
control.verticalMin = Math.PI / 1.7;
control.verticalMax = Math.PI / 2.3;

// PLANE (TANAH)
var planeGeo = new THREE.PlaneGeometry(1000,1000,500,500);
var planeMat = new THREE.MeshLambertMaterial({color:"rgb(21, 36, 5)"});
var plane = new THREE.Mesh(planeGeo,planeMat);
plane.position.set(0,-1,0);
plane.rotation.x = -Math.PI/2;
plane.receiveShadow = true;

// BOX
var boxGeo = new THREE.BoxGeometry(1,1,1);
var boxMat = new THREE.MeshPhongMaterial({color:0xff00ff,wireframe:false});
var box = new THREE.Mesh(boxGeo,boxMat);
box.castShadow = true;

let spotLight = new THREE.SpotLight(0xffffff,2,0,Math.PI/6);
spotLight.position.set(3,3,0);
spotLight.target.position.set(0,0,0);
spotLight.target.updateMatrixWorld();
spotLight.castShadow = true;
scene.add(spotLight);
scene.add(new THREE.SpotLightHelper(spotLight));

// ADD OBJECT TO SCENE
cam.position.z = 15;
scene.add(plane);
scene.add(box);

// BROWSER RESIZE FUNCTION
window.addEventListener("resize",function(){
    renderer.setSize(this.window.innerWidth,this.window.innerHeight);
    cam.aspect = this.window.innerWidth/this.window.innerHeight;
    cam.updateProjectionMatrix();
})

// KEYBOARD RELATED
let keyboard = [];
document.body.onkeydown = function(event){
    keyboard[event.key] = true;
}
document.body.onkeyup = function(event){
    keyboard[event.key] = false;
}

function move(){
    if(keyboard['w']){
        cam.position.z -= 0.05;
    }else if(keyboard['s']){
        cam.position.z += 0.05;
    }
    
    if(keyboard['a']){
        cam.position.x -= 0.03;
    }else if(keyboard['d']){
        cam.position.x += 0.03;
    }

}

// PAINT FUNCTION
function paint(){
    control.update(clock.getDelta());
    box.rotation.y += 0.01;
    box.rotation.x += 0.01;
    requestAnimationFrame(paint);
    renderer.render(scene,cam);    
}
paint();