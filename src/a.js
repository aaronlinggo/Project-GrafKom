var cam = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
cam.position.z = 10;
cam.position.y = 3;

var renderer = new THREE.WebGL1Renderer({
    antialias: true // Should be true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; // Should be true
renderer.shadowMap.type = THREE.BasicShadowMap;
document.body.appendChild(renderer.domElement);

var scene = new THREE.Scene();
scene.background = new THREE.Color(0xaaffaa);

// var controls = new THREE.OrbitControls(cam, renderer.domElement);

var plane = new THREE.PlaneGeometry(50, 100, 25, 25);
var planeMaterial = new THREE.MeshLambertMaterial({color: 0xffffff});
var planeMesh = new THREE.Mesh(plane, planeMaterial);
planeMesh.receiveShadow = true;
planeMesh.position.set(0, 0, 0);
planeMesh.rotation.x -= Math.PI / 2;
scene.add(planeMesh);

var spotlight1 = new THREE.SpotLight(0xffffff, 0.5, 20, Math.PI/3);
spotlight1.position.set(3, 15, 0);
// spotlight1.target.position.set(-0.2 ,-1 , -2.85);
spotlight1.castShadow = true;
scene.add(spotlight1);
scene.add(new THREE.SpotLightHelper(spotlight1));

var grid = new THREE.GridHelper(50, 100, 0x00ffaa, 0x00ffaa);
grid.position.set(0, 0, 0);
scene.add(grid);

var ambient = new THREE.AmbientLight(0x404040);
// ambient.castShadow = true;
scene.add(ambient);

let pLight = new THREE.PointLight(0xffffff, 1);
pLight.position.set(1, 15, 2);
// pLight.castShadow = true;
scene.add(pLight);
scene.add(new THREE.PointLightHelper(pLight, 0.1, 0xff0000));

let pLigh1 = new THREE.PointLight(0xffffff, 1);
pLigh1.position.set(-5, 5, -13);
// pLight.castShadow = true;
scene.add(pLigh1);
scene.add(new THREE.PointLightHelper(pLigh1, 0.1, 0xff0000));

var directionalLight1 = new THREE.DirectionalLight(0xFFFFFF);
directionalLight1.position.set(3, 15, 0);
directionalLight1.target.position.set(0, 0, 0);
directionalLight1.target.updateMatrixWorld();
directionalLight1.castShadow = true;
scene.add(directionalLight1);
scene.add(new THREE.DirectionalLightHelper(directionalLight1));

// adding resizing event listener
window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    cam.aspect = window.innerWidth / window.innerHeight;
    cam.updateProjectionMatrix();
});

let fpsControls = new THREE.PointerLockControls(cam, renderer.domElement);

fpsControls.pointerSpeed = 0.5;

let keyboard = [];

document.body.onkeydown = (evt) => {
    keyboard[evt.key] = true;
};

document.body.onkeyup = (evt) => {
    keyboard[evt.key] = false;
};

document.body.onclick = (evt) => {
    fpsControls.lock();
};

document.body.click();

let speed = 0.5;
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

// var boxGeo = new THREE.BoxGeometry(1,1,1);
// var boxMaterial = new THREE.MeshBasicMaterial({color:0x00ff00});
// let box = new THREE.Mesh(boxGeo, boxMaterial);
// box.receiveShadow = true;
// box.castShadow = true;
// box.position.set(2, 1, 0);
// scene.add(box);

// load gltf model

let loader1 = new THREE.GLTFLoader().load("model/model_1/dae_final_assignment_milestone_house/scene.gltf", (result) => {
    result.scene.traverse( function( node ) {

        if ( node.isMesh ) { 
            node.castShadow = true; 
            node.receiveShadow = true; 
        }

    } );
    result.scene.position.set(0, 0.3, 0);
    scene.add( result.scene );
});

let loader2 = new THREE.GLTFLoader().load("model/model_2/calligraphy_school/scene.gltf", (result) => {
    result.scene.traverse( function( node ) {

        if ( node.isMesh ) { 
            node.castShadow = true; 
            node.receiveShadow = true; 
        }

    } );
    result.scene.scale.set(4, 4, 4);
    result.scene.position.set(15, 0, 0);
    result.scene.rotation.y = -Math.PI / 2;
    scene.add( result.scene );
});

let loader3 = new THREE.GLTFLoader().load("model/model_3/japanese_restaurant/scene.gltf", (result) => {
    result.scene.traverse( function( node ) {

        if ( node.isMesh ) { 
            node.castShadow = true; 
            node.receiveShadow = true; 
        }

    } );
    result.scene.scale.set(0.5, 0.5, 0.5);
    result.scene.position.set(15, 0, -7);
    result.scene.rotation.y = -Math.PI / 2;
    scene.add( result.scene );
});

let loader4 = new THREE.GLTFLoader().load("model/model_4/building_3_ramen_restaurant/scene.gltf", (result) => {
    result.scene.traverse( function( node ) {

        if ( node.isMesh ) { 
            node.castShadow = true; 
            node.receiveShadow = true; 
        }

    } );
    result.scene.scale.set(0.025, 0.025, 0.025);
    result.scene.position.set(5, -0.1, -20);
    // result.scene.rotation.y = -Math.PI / 2;
    scene.add( result.scene );
});

let loader5 = new THREE.GLTFLoader().load("model/model_5/japan_house_restaurant_by_night/scene.gltf", (result) => {
    result.scene.traverse( function( node ) {

        if ( node.isMesh ) { 
            node.castShadow = true; 
            node.receiveShadow = true; 
        }

    } );
    result.scene.scale.set(0.013, 0.013, 0.013);
    result.scene.position.set(13, -0.1, -17);
    // result.scene.rotation.y = -Math.PI / 2;
    scene.add( result.scene );
});

let loader6 = new THREE.GLTFLoader().load("model/model_6/quick_texture_building/scene.gltf", (result) => {
    result.scene.traverse( function( node ) {

        if ( node.isMesh ) { 
            node.castShadow = true; 
            node.receiveShadow = true; 
        }

    } );
    result.scene.position.set(-15, -0.1, -17);
    // result.scene.rotation.y = -Math.PI / 2;
    scene.add( result.scene );
});

let loader7 = new THREE.GLTFLoader().load("model/model_7/ramen_shop/scene.gltf", (result) => {
    result.scene.traverse( function( node ) {

        if ( node.isMesh ) { 
            node.castShadow = true; 
            node.receiveShadow = true; 
        }

    } );
    result.scene.position.set(-5, 0, -17);
    // result.scene.rotation.y = -Math.PI / 2;
    scene.add( result.scene );
});

let loader8 = new THREE.GLTFLoader().load("model/model_8/ramen-yatai/scene.gltf", (result) => {
    result.scene.traverse( function( node ) {

        if ( node.isMesh ) { 
            node.castShadow = true; 
            node.receiveShadow = true; 
        }

    } );
    result.scene.scale.set(0.5, 0.5, 0.5);
    result.scene.position.set(-5, 0, 15);
    result.scene.rotation.y = Math.PI / 2;
    scene.add( result.scene );
});

let loader9 = new THREE.GLTFLoader().load("model/model_9/simple_textures/scene.gltf", (result) => {
    result.scene.traverse( function( node ) {

        if ( node.isMesh ) { 
            node.castShadow = true; 
            node.receiveShadow = true; 
        }

    } );
    result.scene.position.set(-20, -0.4, -10);
    // result.scene.rotation.y = Math.PI / 2;
    scene.add( result.scene );
});

let loader10 = new THREE.GLTFLoader().load("model/model_10/japanese_residential_home_02/scene.gltf", (result) => {
    result.scene.traverse( function( node ) {

        if ( node.isMesh ) { 
            node.castShadow = true; 
            node.receiveShadow = true; 
        }

    } );
    result.scene.scale.set(0.01, 0.01, 0.01);
    result.scene.position.set(-22, -0.4, -4.5);
    // result.scene.rotation.y = Math.PI / 2;
    scene.add( result.scene );
});

let loader11 = new THREE.GLTFLoader().load("model/model_11/japan_book_store_low_poly/scene.gltf", (result) => {
    result.scene.traverse( function( node ) {

        if ( node.isMesh ) { 
            node.castShadow = true; 
            node.receiveShadow = true; 
        }

    } );
    result.scene.scale.set(4, 4, 4);
    result.scene.position.set(-20, -0.4, 5);
    result.scene.rotation.y = Math.PI / 2;
    scene.add( result.scene );
});

let loader12 = new THREE.GLTFLoader().load("model/model_12/ichiraku_ramen/scene.gltf", (result) => {
    result.scene.traverse( function( node ) {

        if ( node.isMesh ) { 
            node.castShadow = true; 
            node.receiveShadow = true; 
        }

    } );
    result.scene.scale.set(1.5, 1.5, 1.5);
    result.scene.position.set(-20, -0.4, 15);
    result.scene.rotation.y = Math.PI / 2;
    scene.add( result.scene );
});

let loader13 = new THREE.GLTFLoader().load("model/model_13/cornet_hut/scene.gltf", (result) => {
    result.scene.traverse( function( node ) {

        if ( node.isMesh ) { 
            node.castShadow = true; 
            node.receiveShadow = true; 
        }

    } );
    result.scene.scale.set(1.5, 1.5, 1.5);
    result.scene.position.set(15, 3, 15);
    result.scene.rotation.y = Math.PI / 2;
    scene.add( result.scene );
});

let loader14 = new THREE.GLTFLoader().load("model/model_14/building_1_flower_shop/scene.gltf", (result) => {
    result.scene.traverse( function( node ) {

        if ( node.isMesh ) { 
            node.castShadow = true; 
            node.receiveShadow = true; 
        }

    } );
    result.scene.scale.set(0.065, 0.065, 0.065);
    result.scene.position.set(15, -0.1, 5);
    result.scene.rotation.y = -Math.PI/2;
    scene.add( result.scene );
});

let loader15 = new THREE.GLTFLoader().load("model/model_15/lesson_8/scene.gltf", (result) => {
    result.scene.traverse( function( node ) {

        if ( node.isMesh ) { 
            node.castShadow = true; 
            node.receiveShadow = true; 
        }

    } );
    result.scene.scale.set(0.008, 0.008, 0.008);
    result.scene.position.set(5, 1.5, 5);
    result.scene.rotation.y = -Math.PI/2;
    scene.add( result.scene );
});

let loader16 = new THREE.GLTFLoader().load("model/model_17/sushi__ramen_booth/scene.gltf", (result) => {
    result.scene.traverse( function( node ) {

        if ( node.isMesh ) { 
            node.castShadow = true; 
            node.receiveShadow = true; 
        }

    } );
    result.scene.scale.set(0.5, 0.5, 0.5);
    result.scene.position.set(-15, -0.7, 25);
    result.scene.rotation.y = -Math.PI/2;
    scene.add( result.scene );
});

function animate() {
    // box.rotation.x += 0.01;
    // box.rotation.z += 0.01;
    process_keyboard();
    requestAnimationFrame(animate);
    renderer.render(scene, cam);
}

animate();