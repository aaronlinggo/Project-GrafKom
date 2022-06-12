const color_lantern = 0xf04e03;
const color_sun = 0x994a0e;
// const color_sun = 0xc46c29;
const speed = 200;
const pointer = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

let color_red_fog = 216;
let color_green_fog = 184;
let color_blue_fog = 140;

let color_fog = new THREE.Color('rgb(' + color_red_fog + ', ' + color_green_fog + ', ' + color_blue_fog + ')');

const red_color = Math.floor(216/54);
const green_color =  Math.floor(184/54);
const blue_color =  Math.floor(140/54);

let offsetY = 2.5;
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;
let camControls = false;
let posXMouse = (window.innerWidth/2);
let posYMouse = (window.innerHeight/2);

let prevTime = performance.now();
let time;
let delta;
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();
let startWebGL = false;

let ctrDay = 0;
let ctrTimeDay = 0;

let lamps = [true, true, true, true];

let overlay = document.createElement("div");
overlay.setAttribute("id", "pointerLockOverlay");
overlay.style.position = "absolute";
overlay.style.top = "0px";
overlay.style.left = "0px";
overlay.style.width = "100vw";
overlay.style.height = "100vh";
overlay.style.zIndex = "1";
overlay.style.background = "#000";
overlay.style.opacity = "0.9";
overlay.style.color = "#fff";
overlay.style.textAlign = "center";
overlay.style.verticalAlign = "middle";
overlay.style.lineHeight = "100vh";
overlay.textContent = "Click to enable controls!";
overlay.style.display = "block";
document.body.appendChild(overlay);

let detail = document.createElement("div");
detail.setAttribute("id", "detail");
detail.style.position = "absolute";
detail.style.top = "0px";
detail.style.left = (window.innerWidth - 250) + "px";
detail.style.width = "20vw";
detail.style.height = "10vh";
detail.style.zIndex = "1";
detail.style.background = "#000";
detail.style.opacity = "0.8";
detail.style.color = "#fff";
detail.style.textAlign = "center";
detail.style.verticalAlign = "middle";
detail.style.display = "table-cell";
detail.style.whiteSpace = "pre";
detail.textContent = "Press 'W' for forward\r\nPress 'S' for backward\r\nPress 'A' for left\r\nPress 'D' for right";
detail.style.display = "block";
document.body.appendChild(detail);

let dot = document.createElement("div");
dot.setAttribute("id", "dot");
dot.style.position = "absolute";
dot.style.top = (window.innerHeight / 2) + "px";
dot.style.left = (window.innerWidth / 2) + "px";
dot.style.width = "5px";
dot.style.height = "5px";
dot.style.zIndex = "0";
dot.style.background = "green";
dot.style.display = "none";
document.body.appendChild(dot);

var cam = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    1000
);
cam.position.x = -25;
cam.position.z = 40;
cam.position.y = 4;
cam.lookAt(0, 5, 5);

var renderer = new THREE.WebGL1Renderer({
    powerPreference: "high-performance", // "high-performance", "low-power" or "default". 
    antialias: true, // Should be true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; // Should be true
renderer.shadowMapSoft = true; // should be true
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

var scene = new THREE.Scene();

// add fog
fogColor = new THREE.Color(color_fog);
scene.background = fogColor;
console.log(scene.background)
scene.fog = new THREE.FogExp2(fogColor, 0.011);

var textureLoader = new THREE.TextureLoader();
const tilesBaseColor = textureLoader.load(
    "./dump/textures/Dirt_006_SD/Dirt_006_Base Color.jpg",
    (texture) => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.offset.set(0, 0);
        texture.repeat.set(20, 20);
    }
);
const tilesAmbientMap = textureLoader.load(
    "./dump/textures/Dirt_006_SD/Dirt_006_Ambient Occlusion.jpg",
    (texture) => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.offset.set(0, 0);
        texture.repeat.set(20, 20);
    }
);
const tilesHeightMap = textureLoader.load(
    "./dump/textures/Dirt_006_SD/Dirt_006_Height.png",
    (texture) => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.offset.set(0, 0);
        texture.repeat.set(20, 20);
    }
);
const tilesNormalMap = textureLoader.load(
    "./dump/textures/Dirt_006_SD/Dirt_006_Normal.jpg",
    (texture) => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.offset.set(0, 0);
        texture.repeat.set(20, 20);
    }
);
const tilesRoughnessMap = textureLoader.load(
    "./dump/textures/Dirt_006_SD/Dirt_006_Roughness.jpg",
    (texture) => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.offset.set(0, 0);
        texture.repeat.set(20, 20);
    }
);

var plane = new THREE.PlaneGeometry(100, 100, 25, 25);
var planeMaterial = new THREE.MeshStandardMaterial({
    color: 0x61523c,
    map: tilesBaseColor,
    normalMap: tilesNormalMap,
    displacementMap: tilesHeightMap,
    displacementScale: 0.2,
    roughnessMap: tilesRoughnessMap,
    roughness: 1.5,
    aoMap: tilesAmbientMap,
});
var planeMesh = new THREE.Mesh(plane, planeMaterial);
planeMesh.receiveShadow = true;
planeMesh.position.set(0, 0, 0);
planeMesh.rotation.x -= Math.PI / 2;
scene.add(planeMesh);

var ambient = new THREE.AmbientLight(0x404040, 1.5);
scene.add(ambient);

var pointLight1 = new THREE.PointLight(color_lantern);
pointLight1.position.set(-17.5, 2.5, -28.5);
pointLight1.add(
    new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 10, 10),
        new THREE.MeshBasicMaterial({
            color: color_lantern,
        })
    )
);
pointLight1.castShadow = true;
pointLight1.shadow.radius = 100;
scene.add(pointLight1);
// scene.add(new THREE.PointLightHelper(pointLight1, 0.1, 0xff00ff));

var pointLight2 = new THREE.PointLight(color_lantern);
pointLight2.position.set(-17.5, 2.5, 24.5);
pointLight2.add(
    new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 10, 10),
        new THREE.MeshBasicMaterial({
            color: color_lantern,
        })
    )
);
pointLight2.castShadow = true;
pointLight2.shadow.radius = 100;
scene.add(pointLight2);
// scene.add(new THREE.PointLightHelper(pointLight2, 0.1, 0xff00ff));

var pointLight3 = new THREE.PointLight(color_lantern);
pointLight3.position.set(17.5, 2.5, 24.5);
pointLight3.add(
    new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 10, 10),
        new THREE.MeshBasicMaterial({
            color: color_lantern,
        })
    )
);
pointLight3.castShadow = true;
pointLight3.shadow.radius = 100;
scene.add(pointLight3);
// scene.add(new THREE.PointLightHelper(pointLight3, 0.1, 0xff00ff));

var pointLight4 = new THREE.PointLight(color_lantern);
pointLight4.position.set(17.5, 2.5, -28.5);
pointLight4.add(
    new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 10, 10),
        new THREE.MeshBasicMaterial({
            color: color_lantern,
        })
    )
);
pointLight4.castShadow = true;
pointLight4.shadow.radius = 100;
scene.add(pointLight4);
// scene.add(new THREE.PointLightHelper(pointLight4, 0.1, 0xff00ff));

var spotlight = new THREE.SpotLight(color_sun, 8, 125, Math.PI/4);
spotlight.position.set(0, 80, 0);
spotlight.target.position.set(0, 0, 0);
spotlight.castShadow = true;
spotlight.add(
    new THREE.Mesh(
        new THREE.SphereGeometry(4, 32, 32),
        new THREE.MeshBasicMaterial({
            color: 0xd15e06,
        })
    )
);
scene.add(spotlight);
scene.add(new THREE.SpotLightHelper(spotlight));

// adding resizing event listener
window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    cam.aspect = window.innerWidth / window.innerHeight;
    cam.updateProjectionMatrix();
});

// Orbit Controls
const orbitControls = new THREE.OrbitControls( cam, renderer.domElement );
orbitControls.update();
orbitControls.enabled = false;

// First Person Controls
let fpsControls = new THREE.PointerLockControls(cam, renderer.domElement);
fpsControls.pointerSpeed = 0.5;

const overlayOnClik = () => {
    if (!fpsControls.isLocked) {
        fpsControls.lock();
        overlay.style.display = "none";
        dot.style.display = "block";
    }
};

overlay.addEventListener("click", overlayOnClik, false);

fpsControls.addEventListener(
    "lock",
    () => {
        overlay.style.display = "none";
        dot.style.display = "block";
        startWebGL = true;
    },
    false
);

fpsControls.addEventListener(
    "unlock",
    () => {
        if (!camControls){
            overlay.style.display = "block";
            dot.style.display = "none";
            startWebGL = false;
            velocity = new THREE.Vector3();

        }
    },
    false
);

const onKeyDown = function (event) {
    switch (event.keyCode) {
        case 38: // up
        case 87: // w
            moveForward = true;
            break;

        case 37: // left
        case 65: // a
            moveLeft = true;
            break;

        case 40: // down
        case 83: // s
            moveBackward = true;
            break;

        case 39: // right
        case 68: // d
            moveRight = true;
            break;
    }
};

const onKeyUp = function (event) {
    switch (event.keyCode) {
        case 38: // up
        case 87: // w
            moveForward = false;
            break;

        case 37: // left
        case 65: // a
            moveLeft = false;
            break;

        case 40: // down
        case 83: // s
            moveBackward = false;
            break;

        case 39: // right
        case 68: // d
            moveRight = false;
            break;

        case 27: // esc
            // if (fpsControls.isLocked) {
            //     fpsControls.unlock();
            //     overlay.style.display = "block";
            //     dot.style.display = "none";
            // }
            break;

    }
};

document.body.addEventListener("keydown", onKeyDown, false);
document.body.addEventListener("keyup", onKeyUp, false);

let objectLoader = new THREE.GLTFLoader();
var dummyObject = new THREE.Object3D();

const tourouAmount = 4;

let tourouMeshA, tourouGeometryA, tourouMaterialA;
let tourouMeshB, tourouGeometryB, tourouMaterialB;
let tourouMeshC, tourouGeometryC, tourouMaterialC;

objectLoader.load("./dump/models/old_japanese_lantern/scene.gltf",
    (gltf) => {
        const objectScene = gltf.scene;

        console.log(dumpObject(objectScene).join("\n"));

        const _tourouMeshA = objectScene.getObjectByName("Tourou_a_low");
        const _tourouMeshB = objectScene.getObjectByName("Tourou_b_low");
        const _tourouMeshC = objectScene.getObjectByName("Tourou_c_low");

        console.log(_tourouMeshA);
        console.log(_tourouMeshB);
        console.log(_tourouMeshC);

        tourouGeometryA = _tourouMeshA.children[0].geometry.clone();
        tourouGeometryB = _tourouMeshB.children[0].geometry.clone();
        tourouGeometryC = _tourouMeshC.children[0].geometry.clone();

        const defaultTransform = new THREE.Matrix4().multiply(new THREE.Matrix4().makeScale(1.75, 1.75, 1.75));

        tourouGeometryA.applyMatrix4(defaultTransform);
        tourouGeometryB.applyMatrix4(defaultTransform);
        tourouGeometryC.applyMatrix4(defaultTransform);

        tourouMaterialA = _tourouMeshA.children[0].material;
        tourouMaterialB = _tourouMeshB.children[0].material;
        tourouMaterialC = _tourouMeshC.children[0].material;

        tourouMeshA = new THREE.InstancedMesh(tourouGeometryA, tourouMaterialA, tourouAmount);
        tourouMeshB = new THREE.InstancedMesh(tourouGeometryB, tourouMaterialB, tourouAmount);
        tourouMeshC = new THREE.InstancedMesh(tourouGeometryC, tourouMaterialC, tourouAmount);

        tourouMeshA.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        tourouMeshB.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        tourouMeshC.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

        scene.add(tourouMeshA);
        scene.add(tourouMeshB);
        scene.add(tourouMeshC);

        tourouMeshA.castShadow = true;
        tourouMeshA.receiveShadow = true;
        tourouMeshB.castShadow = true;
        tourouMeshB.receiveShadow = true;
        tourouMeshC.castShadow = true;
        tourouMeshC.receiveShadow = true;

        console.log(tourouMeshA);
        console.log(tourouMeshB);
        console.log(tourouMeshC);

        animate();
    },

    (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + "% loaded!");
    },

    (error) => {
        console.log("Error has occured when loading model!");
    }
);

function drawStoneLantern() {
    if (tourouMeshA && tourouMeshB && tourouMeshC) {
        let i = 0;
        const amount = 4;
        const offset = (amount - 1) / 2;

        let testArray = [];
        testArray.push([-7.5, 0]);
        testArray.push([-7.5, 21.5]);
        testArray.push([7.5, 21.5]);
        testArray.push([7.5, 0]);

        let testArray1 = [];
        testArray1.push(-17.5);
        testArray1.push(-17.5);
        testArray1.push(17.5);
        testArray1.push(17.5);

        let testArray2 = [];
        testArray2.push(-28.5);
        testArray2.push(24.5);
        testArray2.push(24.5);
        testArray2.push(-28.5);

        // console.log(testArray[1][1]);

        for (let x = 0; x < amount; x++) {
            for (let y = 0; y < amount; y++) {
                for (let z = 0; z < amount; z++) {
                    // let slot1 = testArray[i][0];
                    // let slot2 = testArray[i][1];
                    dummyObject.position.set(testArray1[i], 1.75, testArray2[i]);
                    dummyObject.updateMatrix();
                    tourouMeshA.setMatrixAt(i, dummyObject.matrix);
                    tourouMeshB.setMatrixAt(i, dummyObject.matrix);
                    tourouMeshC.setMatrixAt(i, dummyObject.matrix);

                    i++;
                }
            }
        }

        tourouMeshA.matrixAutoUpdate = false;
        tourouMeshB.matrixAutoUpdate = false;
        tourouMeshC.matrixAutoUpdate = false;

        tourouMeshA.instanceMatrix.needsUpdate = true;
        tourouMeshB.instanceMatrix.needsUpdate = true;
        tourouMeshC.instanceMatrix.needsUpdate = true;
    }
}
document.body.onclick = (evt) => {
    fpsControls.lock();
};

function animate() {
    if (startWebGL) {
        if (fpsControls.isLocked === true) {
            time = performance.now();
            delta = (time - prevTime) / 1000;

            velocity.x -= velocity.x * 10.0 * delta;
            velocity.z -= velocity.z * 10.0 * delta;

            direction.z = Number(moveForward) - Number(moveBackward);
            direction.x = Number(moveLeft) - Number(moveRight);
            direction.normalize(); // this ensures consistent movements in all directions

            if (moveForward || moveBackward) velocity.z -= direction.z * speed * delta;
            if (moveLeft || moveRight) velocity.x -= direction.x * speed * delta;

            fpsControls.getObject().translateX(velocity.x * delta);
            fpsControls.getObject().translateZ(velocity.z * delta);

            prevTime = time;
        }
    }

    ctrTimeDay++;

    if (ctrTimeDay%12 == 0){
        if (ctrDay == 0){
            color_red_fog -= red_color;
            color_green_fog -= green_color;
            color_blue_fog -= blue_color;
        }
        else{
            color_red_fog += red_color;
            color_green_fog += green_color;
            color_blue_fog += blue_color;
        }
    
        if (color_red_fog == 0){
            ctrDay = 1;
        }
        else if (color_red_fog == 216){
            ctrDay = 0;
        }
    
        color_fog = new THREE.Color('rgb('+ color_red_fog + ', ' + color_green_fog + ', '+ color_blue_fog +')');
        // console.log(color_fog)
        fogColor = new THREE.Color(color_fog);
        scene.background = fogColor;
        scene.fog = new THREE.FogExp2(fogColor, 0.011);
        ctrTimeDay = 0;
    }


    // if (ctrDay == 300){
    //     color_fog = 0xd8b88d;
    //     fogColor = new THREE.Color(color_fog);
    //     scene.background = fogColor;
    //     scene.fog = new THREE.FogExp2(fogColor, 0.011);
    // }
    // else if (ctrDay == 600){
    //     ctrDay = 0;
    //     color_fog = 0x000000;
    //     fogColor = new THREE.Color(color_fog);
    //     scene.background = fogColor;
    //     scene.fog = null;
    // }

    date = Date.now() * 0.0005;

    borderRadius = 60;

    //spotlight position
    spotlight.position.x = Math.cos(date) * borderRadius;
    spotlight.position.z = Math.sin(date) * borderRadius;
    spotlight.rotation.x += 0.00001;
    // spotlight.target.position.set(0, 0, 0);
    // orbitControls.update();

    // scene.rotation.y += 0.005;

    requestAnimationFrame(animate);
    drawStoneLantern();

    renderer.render(scene, cam);
}

// ------------------------------------------------------------------
// // load gltf model
objectLoader.load("./dump/models/shitennoji/scene.gltf", (gltf) => {
    gltf.scene.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    gltf.scene.position.set(0, -0.4, -18);
    gltf.scene.scale.set(0.0085, 0.0085, 0.0085);
    console.log(dumpObject(gltf.scene).join("\n"));
    scene.add(gltf.scene);
});

objectLoader.load(
    "./dump/models/japanese_lowpoly_temple/scene.gltf",
    (gltf) => {
        gltf.scene.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        gltf.scene.position.set(0, 0, 10);
        gltf.scene.rotation.y = (-Math.PI / 2) * -1;
        gltf.scene.scale.set(0.5, 0.5, 0.5);
        console.log(dumpObject(gltf.scene).join("\n"));
        scene.add(gltf.scene);
    }
);

let loader4 = new THREE.GLTFLoader();
const wall1 = new THREE.Object3D();
const wall2 = new THREE.Object3D();
const wall3 = new THREE.Object3D();
loader4.load("./dump/models/modular_concrete_fence/scene.gltf", processWall);

function processWall(gltf) {
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const c = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    gltf.scene.traverse((node) => {
        if (node.isMesh) {
            gltfGeometry = node.geometry;
            const counterrr = 3;
            const instancedMesh = new THREE.InstancedMesh(
                gltfGeometry,
                node.material,
                counterrr
            );
            const dummyObject = new THREE.Object3D();
            const matrix = new THREE.Matrix4();

            for (let i = 0; i < counterrr; i++) {
                for (let j = 0; j < counterrr; j++) {
                    dummyObject.scale.set(0.02, 0.02, 0.02);
                    dummyObject.position.set(4.3 * i, 0, 24.7);
                    // dummyObject.rotation.y = -Math.PI / 2;
                    // dummyObject.position.x = (xDistance * i);
                    // dummyObject.position.z = (zDistance * j);
                    // dummyObject.scale.set(10, 10, 10);
                    // matrix.setPosition(4.3, 0, 24.7)
                    // matrix.scale(0.02, 0.02, 0.02)
                    instancedMesh.setMatrixAt(0, dummyObject.matrix);
                }
            }

            // scene.add(instancedMesh);
            // gltfGeometry = node;
            // node.castShadow = true;
            // node.receiveShadow = true;
        }
    });
    gltf.scene.position.set(-c.x, size.y / 2 - c.y, -c.z); // center the gltf scene
    // console.log(dumpObject(gltf.scene).join("\n"));
    wall1.add(gltf.scene);
    wall2.add(gltf.scene.clone());
    wall3.add(gltf.scene.clone());
}

let length1 = 4.3;
let length2 = 8.4615;
let length3 = length2 + (length2 - length1);

wall1.scale.set(0.02, 0.02, 0.02); // because gltf.scene is very big
wall1.position.set(4.3, 0, 24.7);
wall1.rotation.y = -Math.PI / 2;
scene.add(wall1);

wall2.scale.set(0.02, 0.02, 0.02); // because gltf.scene is very big
wall2.position.set(8.4615, 0, 24.7);
wall2.rotation.y = -Math.PI / 2; // radiant
scene.add(wall2);

wall3.scale.set(0.02, 0.02, 0.02); // because gltf.scene is very big
wall3.position.set(length3, 0, 24.7);
wall3.rotation.y = -Math.PI / 2; // radiant
scene.add(wall3);

function dumpObject(obj, lines = [], isLast = true, prefix = "") {
    const localPrefix = isLast ? "└─" : "├─";
    lines.push(
        `${prefix}${prefix ? localPrefix : ""}${obj.name || "*no-name*"} [${
      obj.type
    }]`
    );
    const newPrefix = prefix + (isLast ? "  " : "│ ");
    const lastNdx = obj.children.length - 1;
    obj.children.forEach((child, ndx) => {
        const isLast = ndx === lastNdx;
        dumpObject(child, lines, isLast, newPrefix);
    });
    return lines;
}

const geometry = new THREE.BoxGeometry( 0.5, 3, 3 );
let loadermaterial = new THREE.TextureLoader();
const material = new THREE.MeshBasicMaterial( { map: loadermaterial.load("../textures/black-g444986ca3_1920.jpg") } );
material.castShadow = true;
material.receiveShadow = true;
const cube = new THREE.Mesh( geometry, material );
cube.position.set(-23, 3, 30);
cube.rotation.y = Math.PI / 2;
cube.castShadow = true;
cube.receiveShadow = true;
console.log(cube)
scene.add( cube );

const btn1 = new THREE.BoxGeometry( 0.1, 0.2, 0.2 );
const btnMaterial1 = new THREE.MeshBasicMaterial( { color: 0xffffff } );
const btn1cube = new THREE.Mesh( btn1, btnMaterial1 );
btn1cube.position.set(-24, 3.5, 30.3);
btn1cube.rotation.y = Math.PI / 2;
btn1cube.name = "btn1";
scene.add( btn1cube );

const btn2 = new THREE.BoxGeometry( 0.1, 0.2, 0.2 );
const btnMaterial2 = new THREE.MeshBasicMaterial( { color: 0xffffff } );
const btn2cube = new THREE.Mesh( btn2, btnMaterial2 );
btn2cube.position.set(-22, 3.5, 30.3);
btn2cube.rotation.y = Math.PI / 2;
btn2cube.name = "btn2";
scene.add( btn2cube );

const btn3 = new THREE.BoxGeometry( 0.1, 0.2, 0.2 );
const btnMaterial3 = new THREE.MeshBasicMaterial( { color: 0xffffff } );
const btn3cube = new THREE.Mesh( btn3, btnMaterial3 );
btn3cube.position.set(-24, 3, 30.3);
btn3cube.rotation.y = Math.PI / 2;
btn3cube.name = "btn3";
scene.add( btn3cube );

const btn4 = new THREE.BoxGeometry( 0.1, 0.2, 0.2 );
const btnMaterial4 = new THREE.MeshBasicMaterial( { color: 0xffffff } );
const btn4cube = new THREE.Mesh( btn4, btnMaterial4 );
btn4cube.position.set(-22, 3, 30.3);
btn4cube.rotation.y = Math.PI / 2;
btn4cube.name = "btn4";
scene.add( btn4cube );

const btn5 = new THREE.BoxGeometry( 0.1, 0.2, 0.2 );
const btnMaterial5 = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const btn5cube = new THREE.Mesh( btn5, btnMaterial5 );
btn5cube.position.set(-22, 2, 30.3);
btn5cube.rotation.y = Math.PI / 2;
btn5cube.name = "btn5";
scene.add( btn5cube );

// var textGeo =
const onMouseClick = (event) => {
    if (camControls == false){
        pointer.x = ((window.innerWidth/2) / window.innerWidth) * 2 - 1;
        pointer.y = -((window.innerHeight/2) / window.innerHeight) * 2 + 1;
    }
    else{
        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }
    raycaster.setFromCamera(pointer, cam);
    const intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0) {
        if (intersects[0].object.name === "btn1") {
            if (lamps[0] == true){
                lamps[0] = false;
                pointLight1.visible = false;
                intersects[0].object.material.color.set(0xff0000);
            }
            else{
                lamps[0] = true;
                pointLight1.visible = true;
                intersects[0].object.material.color.set(0xffffff);
            }
        } else if (intersects[0].object.name === "btn2") {
            if (lamps[3] == true){
                lamps[3] = false;
                pointLight4.visible = false;
                intersects[0].object.material.color.set(0xff0000);
            }
            else{
                lamps[3] = true;
                pointLight4.visible = true;
                intersects[0].object.material.color.set(0xffffff);
            }
        }else if (intersects[0].object.name === "btn3") {
            if (lamps[1] == true){
                lamps[1] = false;
                pointLight2.visible = false;
                intersects[0].object.material.color.set(0xff0000);
            }
            else{
                lamps[1] = true;
                pointLight2.visible = true;
                intersects[0].object.material.color.set(0xffffff);
            }
        }else if (intersects[0].object.name === "btn4") {
            if (lamps[2] == true){
                lamps[2] = false;
                pointLight3.visible = false;
                intersects[0].object.material.color.set(0xff0000);
            }
            else{
                lamps[2] = true;
                pointLight3.visible = true;
                intersects[0].object.material.color.set(0xffffff);
            }
        }else if (intersects[0].object.name === "btn5") {
            if (camControls == false){
                camControls = true;
                intersects[0].object.material.color.set(0xffffff);
                fpsControls.unlock();
                document.getElementById("dot").style.display = "none";
                orbitControls.enabled = true;
            }
            else{
                camControls = false;
                intersects[0].object.material.color.set(0x00ff00);
                orbitControls.enabled = false;
                fpsControls.lock();
                document.getElementById("dot").style.display = "true";
            }
        }
    }
}

window.addEventListener('click', onMouseClick);