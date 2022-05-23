const color_lantern = 0xf04e03;
const color_sun = 0x994a0e;
const color_fog = 0xf59042;
const speed = 200;

let offsetY = 2.5;

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;

let prevTime = performance.now();
let time;
let delta;
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();
let startWebGL = false;

let overlay = document.createElement("div");
overlay.setAttribute("id", "pointerLockOverlay");
overlay.style.position = "absolute";
overlay.style.top = "0px";
overlay.style.left = "0px";
overlay.style.width = "100vw";
overlay.style.height = "100vh";
overlay.style.zIndex = "1";
overlay.style.background = "#000";
overlay.style.opacity = "0.5";
overlay.style.color = "#fff";
overlay.style.textAlign = "center";
overlay.style.verticalAlign = "middle";
overlay.style.lineHeight = "100vh";
overlay.textContent = "Click to enable controls!";
overlay.style.display = "block";
document.body.appendChild(overlay);

let dot = document.createElement("div");
dot.setAttribute("id", "dot");
dot.style.position = "absolute";
dot.style.top = (window.innerHeight / 2) + "px";
dot.style.left = (window.innerWidth / 2) + "px";
dot.style.width = "5px";
dot.style.height = "5px";
dot.style.zIndex = "0";
dot.style.background = "#ffffff";
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
    antialias: false, // Should be true
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
scene.fog = new THREE.FogExp2(fogColor, 0.015);

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

var plane = new THREE.PlaneGeometry(50, 100, 25, 25);
var planeMaterial = new THREE.MeshStandardMaterial({
    color: 0x957b56,
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

var ambient = new THREE.AmbientLight(0x404040);
scene.add(ambient);

var addPointLight = function (scene, color, x, y, z) {
    var pointLight = new THREE.PointLight(color);
    pointLight.position.set(x, y, z);
    pointLight.add(
        new THREE.Mesh(
            new THREE.SphereGeometry(0.1, 10, 10),
            new THREE.MeshBasicMaterial({
                color: color,
            })
        )
    );
    pointLight.castShadow = true;
    pointLight.shadow.radius = 25;
    scene.add(pointLight);
    scene.add(new THREE.PointLightHelper(pointLight, 0.1, 0xff00ff));
};

var addDirectionalLight = function (scene, color, x, y, z) {
    var directionalLight = new THREE.DirectionalLight(color);
    directionalLight.position.set(x, y, z);
    directionalLight.target.position.set(0, 0, 0);
    directionalLight.target.updateMatrixWorld();
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    scene.add(new THREE.DirectionalLightHelper(directionalLight));
};

addPointLight(scene, color_lantern, -17.5, 2.5, -28.5);
addPointLight(scene, color_lantern, -17.5, 2.5, 24.5);
addPointLight(scene, color_lantern, 17.5, 2.5, 24.5);
addPointLight(scene, color_lantern, 17.5, 2.5, -28.5);
addDirectionalLight(scene, color_sun, 0, 40, 50);

// adding resizing event listener
window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    cam.aspect = window.innerWidth / window.innerHeight;
    cam.updateProjectionMatrix();
});

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
        overlay.style.display = "block";
        dot.style.display = "none";
        startWebGL = false;
        velocity = new THREE.Vector3();
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

objectLoader.load(
    "./dump/models/old_japanese_lantern/scene.gltf",
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

        const defaultTransform = new THREE.Matrix4().multiply(
            new THREE.Matrix4().makeScale(1.75, 1.75, 1.75)
        );

        tourouGeometryA.applyMatrix4(defaultTransform);
        tourouGeometryB.applyMatrix4(defaultTransform);
        tourouGeometryC.applyMatrix4(defaultTransform);

        tourouMaterialA = _tourouMeshA.children[0].material;
        tourouMaterialB = _tourouMeshB.children[0].material;
        tourouMaterialC = _tourouMeshC.children[0].material;

        tourouMeshA = new THREE.InstancedMesh(
            tourouGeometryA,
            tourouMaterialA,
            tourouAmount
        );
        tourouMeshB = new THREE.InstancedMesh(
            tourouGeometryB,
            tourouMaterialB,
            tourouAmount
        );
        tourouMeshC = new THREE.InstancedMesh(
            tourouGeometryC,
            tourouMaterialC,
            tourouAmount
        );

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
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded!");
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
loader4.load("./models/modular_concrete_fence/scene3.gltf", processWall);

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