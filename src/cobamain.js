var cam = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 100);
var renderer = new THREE.WebGL1Renderer({
    antialias: true // Should be true
});
var scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0a);
// scene.background = new THREE.CubeTextureLoader().setPath('textures/').load([
//     'sunny-day.jpg',
// ]);

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; // Should be true
renderer.shadowMap.type = THREE.BasicShadowMap;
document.body.appendChild(renderer.domElement);

cam.position.z = -0.5;
cam.position.y = 0.5;
// cam.lookAt(0, 0, 0);

// let materialArray = [];
// let texture_ft = new THREE.TextureLoader().load("textures/sunny-day.jpg");
// let texture_bk = new THREE.TextureLoader().load("textures/sunny-day.jpg");
// let texture_up = new THREE.TextureLoader().load("textures/sunny-day.jpg");
// let texture_dn = new THREE.TextureLoader().load("textures/sunny-day.jpg");
// let texture_rt = new THREE.TextureLoader().load("textures/sunny-day.jpg");
// let texture_lf = new THREE.TextureLoader().load("textures/sunny-day.jpg");

// materialArray.push(new THREE.MeshBasicMaterial( { map: texture_ft }));
// materialArray.push(new THREE.MeshBasicMaterial( { map: texture_bk }));
// materialArray.push(new THREE.MeshBasicMaterial( { map: texture_up }));
// materialArray.push(new THREE.MeshBasicMaterial( { map: texture_dn }));
// materialArray.push(new THREE.MeshBasicMaterial( { map: texture_rt }));
// materialArray.push(new THREE.MeshBasicMaterial( { map: texture_lf }));

// for (let i = 0; i < 6; i++)
//     materialArray[i].side = THREE.BackSide;
// let skyboxGeo = new THREE.BoxGeometry( 100, 100, 100);
// let skybox = new THREE.Mesh( skyboxGeo, materialArray );
// scene.add( skybox ); 

var boxGeo = new THREE.BoxGeometry(1,1,1);
var boxMaterial = new THREE.MeshBasicMaterial({color:0x00ff00});
let box = new THREE.Mesh(boxGeo, boxMaterial);
// box.receiveShadow = true;
box.castShadow = true;
box.position.set(0, 0, -1);
scene.add(box);

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

var plane = new THREE.PlaneGeometry(100, 100, 50, 50);
var planeMaterial = new THREE.MeshLambertMaterial({
    color: 0xaaffaa
});
var planeMesh = new THREE.Mesh(plane, planeMaterial);
planeMesh.receiveShadow = true;
planeMesh.position.set(0, -1, 0);
planeMesh.rotation.x = -Math.PI / 2;
scene.add(planeMesh);
// const texture = new THREE.TextureLoader().load("textures/wallpaperflare.com_wallpaper.jpg");
// // texture.scale.set(0,001, 0,001, 0,001);
// console.log(texture);

// // immediately use the texture for material creation
// var plane = new THREE.PlaneGeometry(1200, 1000, 100, 100);
// const material1 = new THREE.MeshLambertMaterial( { map: texture } );
// var planeMesh1 = new THREE.Mesh(plane, material1);
// planeMesh1.receiveShadow = true;
// planeMesh1.position.set(0, -2, 0);
// planeMesh1.rotation.x = -Math.PI / 2;
// scene.add(planeMesh1);
// scene.add(material1);

let movement = new THREE.PointerLockControls(cam, renderer.domElement);
let clock = new THREE.Clock();
// let controls = new THREE.FirstPersonControls(cam, renderer.domElement);
// controls.lookSpeed = 0.15;
// let controls = new THREE.TrwackballControls(cam, renderer.domElement);
// console.log(movement);

var ambient = new THREE.AmbientLight(0x404040);
scene.add(ambient);

var pointLight = new THREE.PointLight(0xff0000, 0.5, 50);
pointLight.position.set(-2, 2, 2);
scene.add(pointLight);
scene.add(new THREE.PointLightHelper(pointLight, 0.2, 0x00ff00));

// var directionalLight1 = new THREE.DirectionalLight(0xFFFFFF);
// directionalLight1.position.set(-3.5, 4.5, -4.5);
// directionalLight1.target.position.set(-0.2 ,-1 , -2.85);
// directionalLight1.target.updateMatrixWorld();
// directionalLight1.castShadow = true;
// scene.add(directionalLight1);
// scene.add(new THREE.DirectionalLightHelper(directionalLight1));

// var spotlight1 = new THREE.SpotLight(0x0000FF, 0.5, 10, Math.PI/10);
// spotlight1.position.set(-3.5, 4.5, -4.5);
// // spotlight1.target.position.set(-0.2 ,-1 , -2.85);
// spotlight1.castShadow = true;
// scene.add(spotlight1);
// scene.add(new THREE.SpotLightHelper(spotlight1));

// var directionalLight1 = new THREE.DirectionalLight(0xfcf68f, 0.5);
// directionalLight1.position.set(20, 30, 50);
// directionalLight1.target.position.set(-0.2 ,-1 , -2.85);
// directionalLight1.target.updateMatrixWorld();
// directionalLight1.castShadow = true;
// scene.add(directionalLight1);
// scene.add(new THREE.DirectionalLightHelper(directionalLight1));

var spotlight1 = new THREE.SpotLight(0xfcf68f, 0.5, 10, Math.PI/6);
spotlight1.position.set(3, 2, 0);
// spotlight1.target.position.set(-0.2 ,-1 , -2.85);
spotlight1.castShadow = true;
scene.add(spotlight1);
scene.add(new THREE.SpotLightHelper(spotlight1));

// var directionalLight2 = new THREE.DirectionalLight(0xFFFFFF);
// directionalLight2.position.set(-1.3, 4.5, -6);
// directionalLight2.target.position.set(-0.2 ,-1 , -2.85);
// directionalLight2.target.updateMatrixWorld();
// scene.add(directionalLight2);
// scene.add(new THREE.DirectionalLightHelper(directionalLight2));

// var spotlight2 = new THREE.SpotLight(0xFFFFFF);
// spotlight2.position.set(-1.3, 4.5, -6);
// // spotlight2.target.position.set(-0.2 ,-1 , -2.85);
// spotlight2.castShadow = true;
// scene.add(spotlight2);
// scene.add(new THREE.SpotLightHelper(spotlight2));

// var directionalLight3 = new THREE.DirectionalLight(0xFFFFFF);
// directionalLight3.position.set(1.3, 4.5, -6);
// directionalLight3.target.position.set(-0.2 ,-1 , -2.85);
// directionalLight3.target.updateMatrixWorld();
// scene.add(directionalLight3);
// scene.add(new THREE.DirectionalLightHelper(directionalLight3));

// var spotlight3 = new THREE.SpotLight(0xFFFFFF);
// spotlight3.position.set(1.3, 4.5, -6);
// // spotlight3.target.position.set(-0.2 ,-1 , -2.85);
// spotlight3.castShadow = true;
// scene.add(spotlight3);
// scene.add(new THREE.SpotLightHelper(spotlight3));

// var directionalLight4 = new THREE.DirectionalLight(0xFFFFFF);
// directionalLight4.position.set(3.2, 4.5, -4);
// directionalLight4.target.position.set(-0.2 ,-1 , -2.85);
// directionalLight4.target.updateMatrixWorld();
// scene.add(directionalLight4);
// scene.add(new THREE.DirectionalLightHelper(directionalLight4));

// var spotlight4 = new THREE.SpotLight(0xFFFFFF);
// spotlight4.position.set(3.2, 4.5, -4);
// // spotlight4.target.position.set(-0.2 ,-1 , -2.85);
// spotlight4.castShadow = true;
// scene.add(spotlight4);
// scene.add(new THREE.SpotLightHelper(spotlight4));

// var directionalLight5 = new THREE.DirectionalLight(0xFFFFFF);
// directionalLight5.position.set(3, 4.5, -1.2);
// directionalLight5.target.position.set(-0.2 ,-1 , -2.85);
// directionalLight5.target.updateMatrixWorld();
// scene.add(directionalLight5);
// scene.add(new THREE.DirectionalLightHelper(directionalLight5));

// var spotlight5 = new THREE.SpotLight(0xFFFFFF);
// spotlight5.position.set(3, 4.5, -1.2);
// // spotlight5.target.position.set(-0.2 ,-1 , -2.85);
// spotlight5.castShadow = true;
// scene.add(spotlight5);
// scene.add(new THREE.SpotLightHelper(spotlight5));

// var directionalLight6 = new THREE.DirectionalLight(0xFFFFFF);
// directionalLight6.position.set(0.8, 4.5, 0.4);
// directionalLight6.target.position.set(-0.2 ,-1 , -2.85);
// directionalLight6.target.updateMatrixWorld();
// scene.add(directionalLight6);
// scene.add(new THREE.DirectionalLightHelper(directionalLight6));

// var spotlight6 = new THREE.SpotLight(0xFFFFFF, 0.5);
// spotlight6.position.set(0.8, 4.5, 0.4);
// // spotlight6.target.position.set(-0.2 ,-1 , -2.85);
// spotlight6.castShadow = true;
// scene.add(spotlight6);
// scene.add(new THREE.SpotLightHelper(spotlight6));

// const skyColor = 0xB1E1FF; // light blue
// const groundColor = 0xB97A20; // brownish orange
// const intensity = 1;
// const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
// scene.add(light);

let boxMovement = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
boxMovement.setFromObject(movement.getObject());
// console.log(boxCam);
let boxBuilding = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
// console.log(boxCam);

// let loader = new THREE.GLTFLoader().load("model/forteresse_royale_de_najac_12/scene.gltf", (result) => {
//     result.scene.traverse( function( node ) {

//         if ( node.isMesh ) { 
//             node.receiveShadow = true; 
//             node.castShadow = true; 
//         }

//     } );
//     boxBuilding.setFromObject(result.scene);
//     result.scene.position.set(0, 0.6, 0);
//     scene.add(result.scene);
// });

// var plane = new THREE.PlaneGeometry(100, 100, 50, 50);
// const material = new THREE.MeshLambertMaterial( { map: loader } );
// var planeMesh = new THREE.Mesh(plane, material);
// planeMesh.receiveShadow = true;
// planeMesh.position.set(0, 2, 0);
// planeMesh.rotation.x = -Math.PI / 2;
// scene.add(planeMesh);

var patung1;
loader = new THREE.GLTFLoader().load("model/mercury_about_to_kill_argos_by_b._thorvaldsen/scene.gltf", (result) => {
    result.scene.traverse( function( node ) {

        if ( node.isMesh ) { 
            node.castShadow = true; 
            node.receiveShadow = true; 
        }

    } );
    result.scene.scale.set(0.01, 0.01, 0.01);
    result.scene.position.set(0, -0.4, 10);
    scene.add( result.scene );
});


console.log(patung1);

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
let speed = 0.1;
function process_keyboard() {
    if(keyboard["a"]) {
        movement.moveRight(-speed);
    } else if(keyboard["d"]) {
        movement.moveRight(speed);
    } else if(keyboard["w"]) {
        movement.moveForward(speed);
    } else if(keyboard["s"]) {
        movement.moveForward(-speed);
    }
}

function checkcollisions() {
    if(boxMovement.intersect(boxBuilding)) {
        console.log("tes");
    } else {
        console.log("a");
    }
}

document.body.addEventListener("click", () => {
    movement.lock();
}, false);

document.body.click();
function animate() {
    // controls.update(clock.getDelta());
    // patung1.position.x += 0.1;
    box.rotation.x += 0.01;
    box.rotation.z += 0.01;
    process_keyboard();
    checkcollisions();
    requestAnimationFrame(animate);
    renderer.render(scene, cam);
}

animate();
