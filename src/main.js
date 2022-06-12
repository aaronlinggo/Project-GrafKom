var cam = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 100);
var renderer = new THREE.WebGL1Renderer({
    antialias: true
});
var scene = new THREE.Scene();

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.BasicShadowMap;
document.body.appendChild(renderer.domElement);

cam.position.z = 5;

// var boxGeo = new THREE.BoxGeometry(1,1,1);
// var boxMaterial = new THREE.MeshBasicMaterial({color:0x00ff00});
// let box = new THREE.Mesh(boxGeo, boxMaterial);
// box.receiveShadow = true;
// box.castShadow = true;
// box.position.set(0, 0, -1);
// scene.add(box);

// const geo_saya = new THREE.BufferGeometry();
// let vertices = new Float32Array([
//     -1.0, -1.0, 0.0,
//     1.0, 1.0, 0.0,
//     -1.0, 1.0, 0.0,
// ]);
// geo_saya.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
// const mat_saya = new THREE.MeshBasicMaterial({color:0xff0000});
// let mesh_saya = new THREE.Mesh(geo_saya, mat_saya);
// scene.add(mesh_saya);

var plane = new THREE.PlaneGeometry(1000, 1000, 500, 500);
var planeMaterial = new THREE.MeshLambertMaterial({
    color: 0xaaffaa
});
var planeMesh = new THREE.Mesh(plane, planeMaterial);
planeMesh.receiveShadow = true;
planeMesh.position.set(0, -1, 0);
planeMesh.rotation.x = -Math.PI / 2;
scene.add(planeMesh);

let clock = new THREE.Clock();
let movement = new THREE.PointerLockControls(cam, renderer.domElement);
let controls = new THREE.FirstPersonControls(cam, renderer.domElement);
controls.lookSpeed = 0.15;
// let controls = new THREE.TrwackballControls(cam, renderer.domElement);

var ambient = new THREE.AmbientLight(0x404040);
scene.add(ambient);

var pointLight = new THREE.PointLight(0xff0000, 0.5, 50);
pointLight.position.set(-2, 2, 2);
scene.add(pointLight);
scene.add(new THREE.PointLightHelper(pointLight, 0.2, 0x00ff00));

// var directionalLight = new THREE.DirectionalLight(0x00ff00, 0.5);
// directionalLight.position.set(2, 2, 0);
// directionalLight.target.position.set(3 , 2, 0);
// directionalLight.target.updateMatrixWorld();
// scene.add(directionalLight);
// scene.add(new THREE.DirectionalLightHelper(directionalLight));

var spotlight = new THREE.SpotLight(0x0000ff, 0.5, 5, Math.PI / 10);
spotlight.position.set(2, 2, 0);
spotlight.castShadow = true;
scene.add(spotlight);
scene.add(new THREE.SpotLightHelper(spotlight));

let building;
let loader = new THREE.GLTFLoader().load("model/forteresse_royale_de_najac_12/scene.gltf", (result) => {
    building = result.scene.children[0];
    scene.add(building);
    building.position.set(0, 0.8, 0);
});

// adding resizing event listener
window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    cam.aspect = window.innerWidth / window.innerHeight;
    cam.updateProjectionMatrix();
})

let keyboard = [];

document.body.onkeydown = (evt) => {
    // if(evt.key == "a"){
    //     cam.position.x += 0.03;
    // }
    // else if(evt.key == "d"){
    //     cam.position.x -= 0.03;
    // }
    // else if(evt.key == "w"){
    //     cam.position.y -= 0.03;
    // }
    // else if(evt.key == "s"){
    //     cam.position.y += 0.03;
    // }
    keyboard[evt.key] = true;
}

document.body.onkeyup = (evt) => {
    keyboard[evt.key] = false;
}

function process_keyboard() {
    if(keyboard["a"]) {
        movement.moveRight(-0.005);
    } else if(keyboard["d"]) {
        movement.moveRight(0.005);
    } else if(keyboard["w"]) {
        movement.moveForward(0.005);
    } else if(keyboard["s"]) {
        movement.moveForward(-0.005);
    }
}

function draw() {
    controls.update(clock.getDelta());
    process_keyboard();
    requestAnimationFrame(draw);
    renderer.render(scene, cam);
}

draw();
