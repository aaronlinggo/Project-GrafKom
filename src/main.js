var cam = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
cam.position.z = 0;
cam.position.y = 5;

var renderer = new THREE.WebGL1Renderer({
    antialias: true // Should be true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; // Should be true
renderer.shadowMap.type = THREE.BasicShadowMap;
document.body.appendChild(renderer.domElement);

var scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0a);

// var controls = new THREE.OrbitControls(cam, renderer.domElement);

var plane = new THREE.PlaneGeometry(50, 50, 25, 25);
var planeMaterial = new THREE.MeshLambertMaterial({color: 0xffffff});
var planeMesh = new THREE.Mesh(plane, planeMaterial);
planeMesh.receiveShadow = true;
planeMesh.position.set(0, 0, 0);
planeMesh.rotation.x -= Math.PI / 2;
scene.add(planeMesh);

var spotlight1 = new THREE.SpotLight(0xffffff, 0.5, 10, Math.PI/6);
spotlight1.position.set(3, 4, 0);
// spotlight1.target.position.set(-0.2 ,-1 , -2.85);
spotlight1.castShadow = true;
scene.add(spotlight1);
scene.add(new THREE.SpotLightHelper(spotlight1));

var grid = new THREE.GridHelper(50, 50, 0x00ffaa, 0x00ffaa);
grid.position.set(0, 0, 0);
scene.add(grid);

// let pLight = new THREE.PointLight(0xffffff, 1);
// pLight.position.set(1, 1, 2);
// scene.add(pLight);
// scene.add(new THREE.PointLightHelper(pLight, 0.1, 0xff0000));


// adding resizing event listener
window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    cam.aspect = window.innerWidth / window.innerHeight;
    cam.updateProjectionMatrix();
});

let fpsControls = new THREE.PointerLockControls(cam, renderer.domElement);

let keyboard = [];

document.body.onkeydown = (evt) => {
    keyboard[evt.key] = true;
};

document.body.onkeyup = (evt) => {
    keyboard[evt.key] = false;
};

let speed = 0.1;
function process_keyboard() {
    if(keyboard["a"]) {
        fpsControls.moveRight(-speed);
    } else if(keyboard["d"]) {
        fpsControls.moveRight(speed);
    } else if(keyboard["w"]) {
        fpsControls.moveForward(speed);
    } else if(keyboard["s"]) {
        fpsControls.moveForward(-speed);
    }
}
document.body.onclick = (evt) => {
    fpsControls.lock();
};

document.body.click();

var boxGeo = new THREE.BoxGeometry(1,1,1);
var boxMaterial = new THREE.MeshBasicMaterial({color:0x00ff00});
let box = new THREE.Mesh(boxGeo, boxMaterial);
box.receiveShadow = true;
box.castShadow = true;
box.position.set(2, 1, 0);
scene.add(box);

function animate() {
    box.rotation.x += 0.01;
    box.rotation.z += 0.01;
    process_keyboard();
    requestAnimationFrame(animate);
    renderer.render(scene, cam);
}

animate();