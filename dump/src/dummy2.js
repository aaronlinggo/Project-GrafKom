var cam = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
cam.position.z = 50;
cam.position.y = 4;

var renderer = new THREE.WebGL1Renderer({
    antialias: false // Should be true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; // Should be true
renderer.shadowMapSoft = true; // should be true
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

var scene = new THREE.Scene();
var textureLoader = new THREE.TextureLoader();
const tilesBaseColor = textureLoader.load("./textures/Dirt_006_SD/Dirt_006_Base Color.jpg", (texture) => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.offset.set(0, 0);
    texture.repeat.set(20, 20);
});
const tilesAmbientMap = textureLoader.load("./textures/Dirt_006_SD/Dirt_006_Ambient Occlusion.jpg", (texture) => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.offset.set(0, 0);
    texture.repeat.set(20, 20);
});
const tilesHeightMap = textureLoader.load("./textures/Dirt_006_SD/Dirt_006_Height.png", (texture) => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.offset.set(0, 0);
    texture.repeat.set(20, 20);
});
const tilesNormalMap = textureLoader.load("./textures/Dirt_006_SD/Dirt_006_Normal.jpg", (texture) => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.offset.set(0, 0);
    texture.repeat.set(20, 20);
});
const tilesRoughnessMap = textureLoader.load("./textures/Dirt_006_SD/Dirt_006_Roughness.jpg", (texture) => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.offset.set(0, 0);
    texture.repeat.set(20, 20);
});

var plane = new THREE.PlaneGeometry(50, 100, 25, 25);
var planeMaterial = new THREE.MeshStandardMaterial({
    color: 0x957b56,
    map: tilesBaseColor,
    normalMap: tilesNormalMap,
    displacementMap: tilesHeightMap,
    displacementScale: 0.2,
    roughnessMap: tilesRoughnessMap,
    roughness: 1,
    aoMap: tilesAmbientMap,
});

var planeMesh = new THREE.Mesh(plane, planeMaterial);
planeMesh.receiveShadow = true;
planeMesh.position.set(0, 0, 0);
planeMesh.rotation.x -= Math.PI / 2;
scene.add(planeMesh);

var grid = new THREE.GridHelper(50, 100, 0x00ffaa, 0x00ffaa);
grid.position.set(0, 0, 0);
// scene.add(grid);

var ambient = new THREE.AmbientLight(0x404040);
// ambient.castShadow = true;
scene.add(ambient);

let pLigh1 = new THREE.PointLight(0xffffff, 1, 40);
pLigh1.position.set(-5, 5, -13);
pLigh1.castShadow = true;
pLigh1.shadow.radius = 8;
scene.add(pLigh1);
scene.add(new THREE.PointLightHelper(pLigh1, 0.1, 0xff00ff));

let pLigh2 = new THREE.PointLight(0xff0000, 1, 40);
pLigh2.position.set(0, 5, -7);
pLigh2.castShadow = true;
pLigh2.shadow.radius = 8;
scene.add(pLigh2);
scene.add(new THREE.PointLightHelper(pLigh2, 0.1, 0xff00ff));
// f18430
var directionalLight1 = new THREE.DirectionalLight(0x000000);
directionalLight1.position.set(0, 40, 0);
directionalLight1.target.position.set(0, 0, 0);
directionalLight1.target.updateMatrixWorld();
directionalLight1.castShadow = true;
scene.add(directionalLight1);
scene.add(new THREE.DirectionalLightHelper(directionalLight1));

var directionalLight2 = new THREE.DirectionalLight(0xf18430);
directionalLight2.position.set(0, 40, 50);
directionalLight2.target.position.set(0, 0, 0);
directionalLight2.target.updateMatrixWorld();
directionalLight2.castShadow = true;
scene.add(directionalLight2);
scene.add(new THREE.DirectionalLightHelper(directionalLight2));

fogColor = new THREE.Color(0xc6af84);
scene.background = fogColor;
scene.fog = new THREE.FogExp2(fogColor, 0.02);

// adding resizing event listener
window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    cam.aspect = window.innerWidth / window.innerHeight;
    cam.updateProjectionMatrix();
});

// First Person Controls
let fpsControls = new THREE.PointerLockControls(cam, renderer.domElement);
fpsControls.pointerSpeed = 0.5;

// event listener
let keyboard = [];

document.body.onkeydown = (evt) => {
    keyboard[evt.key] = true;
};

document.body.onkeyup = (evt) => {
    keyboard[evt.key] = false;
};

window.addEventListener("click", () => {
    fpsControls.lock();
});

let speed = 0.3;

function process_keyboard() {
    if (keyboard["a"]) {
        fpsControls.moveRight(-speed);
    }
    if (keyboard["d"]) {
        fpsControls.moveRight(speed);
    }
    if (keyboard["w"]) {
        fpsControls.moveForward(speed);
    }
    if (keyboard["s"]) {
        fpsControls.moveForward(-speed);
    }
}

let tourouA_mesh, tourouA_geometry, tourouA_material;
let tourouB_mesh, tourouB_geometry, tourouB_material;
let tourouC_mesh, tourouC_geometry, tourouC_material;

var dummy = new THREE.Object3D();
var gltfGeometry = new THREE.BufferGeometry();
let loader3 = new THREE.GLTFLoader().load("./models/old_japanese_lantern/scene.gltf", (gltf) => {
        var obj1 = gltf.scene;
        let material = new THREE.MeshLambertMaterial();

        // const box = new THREE.Box3().setFromObject(obj1);
        // const c = box.getCenter(new THREE.Vector3());
        // const size = box.getSize(new THREE.Vector3());

        // gltf.scene.traverse(function (child) {
        //     if (child.isMesh) {
        //         // Change object material
        //         // child.material.envMap = envMap;

        //         // Setting the buffer geometry
        //         gltfGeometry = child.geometry.clone();
        //         material = child.material.clone();
        //     }
        // });
        // gltfGeometry.computeVertexNormals();
        // gltfGeometry.scale(4, 4, 4);

        // mesh = new THREE.InstancedMesh(gltfGeometry, material, 1);
        // mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        // scene.add(mesh);
        // animate();

        console.log(dumpObject(obj1).join("\n"));

        const _tourouA_mesh = obj1.getObjectByName("Tourou_a_low");
        const _tourouB_mesh = obj1.getObjectByName("Tourou_b_low");
        const _tourouC_mesh = obj1.getObjectByName("Tourou_c_low");

        console.log(_tourouA_mesh);
        console.log(_tourouB_mesh);
        console.log(_tourouC_mesh);

        tourouA_geometry = _tourouA_mesh.children[0].geometry.clone();
        tourouB_geometry = _tourouB_mesh.children[0].geometry.clone();
        tourouC_geometry = _tourouC_mesh.children[0].geometry.clone();

        const defaultTransform = new THREE.Matrix4().multiply(new THREE.Matrix4().makeScale(1.5, 1.5, 1.5));

        tourouA_geometry.applyMatrix4(defaultTransform);
        tourouB_geometry.applyMatrix4(defaultTransform);
        tourouC_geometry.applyMatrix4(defaultTransform);

        tourouA_material = _tourouA_mesh.children[0].material;
        tourouB_material = _tourouB_mesh.children[0].material;
        tourouC_material = _tourouC_mesh.children[0].material;

        tourouA_mesh = new THREE.InstancedMesh(tourouA_geometry, tourouA_material, 4);
        tourouB_mesh = new THREE.InstancedMesh(tourouB_geometry, tourouB_material, 4);
        tourouC_mesh = new THREE.InstancedMesh(tourouC_geometry, tourouC_material, 4);

        tourouA_mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        tourouB_mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        tourouC_mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

        scene.add(tourouA_mesh);
        scene.add(tourouB_mesh);
        scene.add(tourouC_mesh);

        tourouA_mesh.castShadow = true;
        tourouA_mesh.receiveShadow = true;
        tourouB_mesh.castShadow = true;
        tourouB_mesh.receiveShadow = true;
        tourouC_mesh.castShadow = true;
        tourouC_mesh.receiveShadow = true;

        console.log(tourouA_mesh);
        console.log(tourouB_mesh);
        console.log(tourouC_mesh);

        animate_2();
    },

    // model loading
    (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + "% loaded!");
    },

    // called when loading has errors
    (error) => {
        console.log("Error has occured!");
    }
);

function animate_2() {
    process_keyboard();
    requestAnimationFrame(animate_2);

    if (tourouA_mesh && tourouB_mesh && tourouC_mesh) {
        let i = 0;
        const amount = 4;
        const offset = (amount - 1) / 2;

        let testArray = [];
        testArray.push([-7.5, 0]);
        testArray.push([-7.5, 21.5]);
        testArray.push([7.5, 21.5]);
        testArray.push([7.5, 0]);

        let testArray1 = [];
        testArray1.push(-7.5);
        testArray1.push(-7.5);
        testArray1.push(7.5);
        testArray1.push(7.5);
        let testArray2 = [];
        testArray2.push(-1.5);
        testArray2.push(21.5);
        testArray2.push(21.5);
        testArray2.push(-1.5);

        // console.log(testArray[1][1]);

        for (let x = 0; x < amount; x++) {
            for (let y = 0; y < amount; y++) {
                for (let z = 0; z < amount; z++) {
                    dummy.castShadow = true;
                    dummy.receiveShadow = true;
                    // let slot1 = testArray[i][0];
                    // let slot2 = testArray[i][1];
                    dummy.position.set(testArray1[i], 1.5, testArray2[i]);
                    // dummy.rotation.y = (Math.sin(x / 4 + time) + Math.sin(y / 4 + time) + Math.sin(z / 4 + time));
                    // dummy.rotation.z = dummy.rotation.y * 2;
                    // dummy.scale.set(2, 2, 2);
                    dummy.updateMatrix();
                    tourouA_mesh.setMatrixAt(i, dummy.matrix);
                    tourouB_mesh.setMatrixAt(i, dummy.matrix);
                    tourouC_mesh.setMatrixAt(i, dummy.matrix);

                    i++;
                }
            }
        }

        tourouA_mesh.matrixAutoUpdate = false;
        tourouB_mesh.matrixAutoUpdate = false;
        tourouC_mesh.matrixAutoUpdate = false;

        // console.log(tourouA_mesh);

        tourouA_mesh.instanceMatrix.needsUpdate = true;
        tourouB_mesh.instanceMatrix.needsUpdate = true;
        tourouC_mesh.instanceMatrix.needsUpdate = true;
    }

    renderer.render(scene, cam);
}



// ------------------------------------------------------------------
// // load gltf model
let loader1 = new THREE.GLTFLoader().load("./models/shitennoji/scene.gltf", (result) => {
    result.scene.traverse((node) => {
        if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
        }
    });
    result.scene.position.set(0, -0.4, -18);
    result.scene.scale.set(0.0085, 0.0085, 0.0085);
    console.log(dumpObject(result.scene).join("\n"));
    scene.add(result.scene);
});

let loader2 = new THREE.GLTFLoader().load("./models/japanese_lowpoly_temple/scene.gltf", (result) => {
    result.scene.traverse((node) => {
        if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
        }
    });
    result.scene.position.set(0, 0, 10);
    result.scene.rotation.y = -Math.PI / 2 * -1;
    // result.scene.rotation.x = -Math.PI;
    result.scene.scale.set(0.5, 0.5, 0.5);
    console.log(dumpObject(result.scene).join("\n"));
    // scene.add(result.scene);
});

// var gltfGeometry = new THREE.BufferGeometry();
// var gltfMaterial = new THREE.MeshLambertMaterial({
//     color: 0xffffff
// });

// let loader4 = new THREE.GLTFLoader();
// const wall1 = new THREE.Object3D();
// const wall2 = new THREE.Object3D();
// const wall3 = new THREE.Object3D();
// loader4.load("./models/modular_concrete_fence/scene3.gltf", processWall);

// function processWall(gltf) {
//     const box = new THREE.Box3().setFromObject(gltf.scene);
//     const c = box.getCenter(new THREE.Vector3());
//     const size = box.getSize(new THREE.Vector3());
//     gltf.scene.traverse((node) => {
//         if (node.isMesh) {
//             gltfGeometry = node.geometry;
//             const counterrr = 3;
//             const instancedMesh = new THREE.InstancedMesh(gltfGeometry, node.material, counterrr);
//             const dummyObject = new THREE.Object3D();
//             const matrix = new THREE.Matrix4();

//             for (let i = 0; i < counterrr; i++) {
//                 for (let j = 0; j < counterrr; j++) {
//                     dummyObject.scale.set(0.02, 0.02, 0.02);
//                     dummyObject.position.set(4.3 * i, 0, 24.7);
//                     // dummyObject.rotation.y = -Math.PI / 2;
//                     // dummyObject.position.x = (xDistance * i);
//                     // dummyObject.position.z = (zDistance * j);
//                     // dummyObject.scale.set(10, 10, 10);
//                     // matrix.setPosition(4.3, 0, 24.7)
//                     // matrix.scale(0.02, 0.02, 0.02)
//                     instancedMesh.setMatrixAt(0, dummyObject.matrix);
//                 }
//             }

//             // scene.add(instancedMesh);
//             // gltfGeometry = node;
//             // node.castShadow = true;
//             // node.receiveShadow = true;
//         }
//     });
//     gltf.scene.position.set(-c.x, size.y / 2 - c.y, -c.z); // center the gltf scene
//     // console.log(dumpObject(gltf.scene).join("\n"));
//     wall1.add(gltf.scene);
//     // wall2.add(gltf.scene.clone());
//     // wall3.add(gltf.scene.clone());
// }

// let length1 = 4.3;
// let length2 = 8.4615;
// let length3 = length2 + (length2 - length1);


// var mesh = null;
// var dummy = new THREE.Object3D();
// var sectionWidth = 200;

// function addInstancedMesh() {
//     // An InstancedMesh of 4 cubes
//     console.log(gltfGeometry)
//     mesh = new THREE.InstancedMesh(gltfGeometry, gltfMaterial, 3);
//     scene.add(mesh);
//     setInstancedMeshPositions(mesh);
// }

// function setInstancedMeshPositions(mesh) {
//     var changer = 0;
//     var starterr = 4.3;
//     for (var i = 0; i < mesh.count; i++) {
//         // we add 200 units of distance (the width of the section) between each.
//         var xStaticPosition = starterr + changer;
//         wall1.position.set(xStaticPosition, 0, 24.7);
//         wall1.updateMatrix();
//         mesh.setMatrixAt(i, wall1.matrix);
//         changer += 5;
//     }
//     mesh.instanceMatrix.needsUpdate = true;
// }


// // wall1.scale.set(0.02, 0.02, 0.02); // because gltf.scene is very big
// // wall1.position.set(4.3, 0, 24.7);
// // wall1.rotation.y = -Math.PI / 2;
// // scene.add(wall1);

// wall2.scale.set(0.02, 0.02, 0.02); // because gltf.scene is very big
// wall2.position.set(8.4615, 0, 24.7);
// wall2.rotation.y = -Math.PI / 2; // radiant
// // scene.add(wall2);

// wall3.scale.set(0.02, 0.02, 0.02); // because gltf.scene is very big
// wall3.position.set(length3, 0, 24.7);
// wall3.rotation.y = -Math.PI / 2; // radiant
// // scene.add(wall3);

// // addInstancedMesh();
// ------------------------------------------------------------------

function dumpObject(obj, lines = [], isLast = true, prefix = "") {
    const localPrefix = isLast ? "└─" : "├─";
    lines.push(`${prefix}${prefix ? localPrefix : ""}${obj.name || "*no-name*"} [${obj.type}]`);
    const newPrefix = prefix + (isLast ? "  " : "│ ");
    const lastNdx = obj.children.length - 1;
    obj.children.forEach((child, ndx) => {
        const isLast = ndx === lastNdx;
        dumpObject(child, lines, isLast, newPrefix);
    });
    return lines;
}

// function animate() {
//     // box.rotation.x += 0.01;
//     // box.rotation.z += 0.01;
//     process_keyboard();
//     requestAnimationFrame(animate);
//     renderer.render(scene, cam);
// }

// animate();
