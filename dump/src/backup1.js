// var cam = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000);
var cam = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
cam.position.z = 50;
cam.position.y = 4;

var renderer = new THREE.WebGL1Renderer({
    antialias: false // Should be true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = false; // Should be true
renderer.shadowMapSoft = false; // should be true
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

var scene = new THREE.Scene();
// scene.background = new THREE.Color(0xa2967e);

// var controls = new THREE.OrbitControls(cam, renderer.domElement);

// Make use of the `TextureLoader` object to handle asynchronus loading and
// assignment of the texture to your material    
// var material = new THREE.MeshBasicMaterial();
// var loader = new THREE.TextureLoader();
// loader.load("./src/texture1.jpg", function (texture) {
//     // The texture has loaded, so assign it to your material object. In the 
//     // next render cycle, this material update will be shown on the plane 
//     // geometry
//     material.map = texture;
//     material.needsUpdate = true;
// });
// var geometry = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight, 32);
// var mesh = new THREE.Mesh(geometry, material);
// scene.add(mesh);

// var loader = new THREE.TextureLoader();
// var texture = loader.load( 'myTexture.jpg', function ( texture ) {
//     texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
//     texture.offset.set( 0, 0 );
//     texture.repeat.set( 2, 2 );
// } );
// var material = new THREE.MeshPhongMaterial( {
//    color: 0xffffff,
//    specular:0x111111,
//    shininess: 10,
//    map: texture,
// } );

var textureLoader = new THREE.TextureLoader();
const tilesBaseColor = textureLoader.load("./textures/Dirt_006_SD/Dirt_006_Base Color.jpg", (texture) => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    // texture.offset.set(0, 0);
    texture.repeat.set(20, 20);
});
const tilesAmbientMap = textureLoader.load("./textures/Dirt_006_SD/Dirt_006_Ambient Occlusion.jpg", (texture) => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    // texture.offset.set(0, 0);
    texture.repeat.set(20, 20);
});
const tilesHeightMap = textureLoader.load("./textures/Dirt_006_SD/Dirt_006_Height.png", (texture) => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    // texture.offset.set(0, 0);
    texture.repeat.set(20, 20);
});
const tilesNormalMap = textureLoader.load("./textures/Dirt_006_SD/Dirt_006_Normal.jpg", (texture) => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    // texture.offset.set(0, 0);
    texture.repeat.set(20, 20);
});
const tilesRoughnessMap = textureLoader.load("./textures/Dirt_006_SD/Dirt_006_Roughness.jpg", (texture) => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    // texture.offset.set(0, 0);
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
    roughness: 0.9,
    aoMap: tilesAmbientMap,
});

// loader.load("./src/texture2.jpg", function (texture) {
//     // The texture has loaded, so assign it to your material object. In the 
//     // next render cycle, this material update will be shown on the plane 
//     // geometry
//     planeMaterial.map = texture;
//     planeMaterial.needsUpdate = true;
//     texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
//     texture.offset.set(0, 0);
//     texture.repeat.set(10, 10);
// });
var planeMesh = new THREE.Mesh(plane, planeMaterial);
planeMesh.receiveShadow = true;
planeMesh.position.set(0, 0, 0);
planeMesh.rotation.x -= Math.PI / 2;
// scene.add(planeMesh);

// var spotlight1 = new THREE.SpotLight(0xffffff, 0.5, 40, Math.PI / 3);
// spotlight1.position.set(3, 30, 0);
// // spotlight1.target.position.set(-0.2 ,-1 , -2.85);
// spotlight1.castShadow = true;
// scene.add(spotlight1);
// scene.add(new THREE.SpotLightHelper(spotlight1));

var grid = new THREE.GridHelper(50, 100, 0x00ffaa, 0x00ffaa);
grid.position.set(0, 0, 0);
// scene.add(grid);

var ambient = new THREE.AmbientLight(0x404040);
// ambient.castShadow = true;
scene.add(ambient);

// let pLight = new THREE.PointLight(0xffffff, 1, 40);
// pLight.position.set(1, 15, 2);
// pLight.castShadow = true;
// pLight.shadow.radius = 8;
// scene.add(pLight);
// scene.add(new THREE.PointLightHelper(pLight, 0.1, 0xff0000));

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

let speed = 0.5;

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

// var boxGeo = new THREE.BoxGeometry(1,1,1);
// var boxMaterial = new THREE.MeshBasicMaterial({color:0x00ff00});
// let box = new THREE.Mesh(boxGeo, boxMaterial);
// box.receiveShadow = true;
// box.castShadow = true;
// box.position.set(2, 1, 0);
// scene.add(box);

// load gltf model
let loader1 = new THREE.GLTFLoader().load("./models/shitennoji/scene.gltf", (result) => {
    result.scene.traverse((node) => {
        if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
        }
    });
    result.scene.position.set(0, -0.4, -18);
    result.scene.scale.set(0.0085, 0.0085, 0.0085);
    // scene.add(result.scene);
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
    result.scene.scale.set(0.5, 0.5, 0.5);
    // scene.add(result.scene);
});

let loader3 = new THREE.GLTFLoader();
const modelBee = new THREE.Object3D();
const modelBee1 = new THREE.Object3D();
const modelBee2 = new THREE.Object3D();
// loader3.load("./models/japanese_wall/scene.gltf", processBee);

var wall = [];
function processBee(gltf) {
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const c = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    gltf.scene.position.set(-c.x, size.y / 2 - c.y, -c.z); // center the gltf scene
    modelBee.add(gltf.scene);

    // for (let i = 0; i < 15; i++) {
    //     var model = new THREE.Object3D();
    //     wall.push(model.add(gltf.scene.clone()));
    // }
    modelBee1.add(gltf.scene.clone());
    modelBee2.add(gltf.scene.clone());
}

// modelBee.scale.set(0.0225, 0.0225, 0.0225); // because gltf.scene is very big
// modelBee.position.set(24.4, 0, 20);
// modelBee.rotation.y = Math.PI / 2;
// scene.add(modelBee);

// var tambah = 20;
// for (let i = 0; i < 15; i++) {
//     wall[i].scale.set(0.0225, 0.0225, 0.0225); // because gltf.scene is very big
//     tambah += 4.765;
//     wall[i].position.set(24.4, 0, tambah);
//     wall[i].rotation.y = Math.PI / 2;
//     scene.add(wall[i]);
// }

modelBee.scale.set(0.0225, 0.0225, 0.0225); // because gltf.scene is very big
modelBee.position.set(24.4, 0, 20);
modelBee.rotation.y = Math.PI / 2;
// scene.add(modelBee);

modelBee1.scale.set(0.0225, 0.0225, 0.0225); // because gltf.scene is very big
modelBee1.position.set(24.4, 0, 24.765);
modelBee1.rotation.y = Math.PI / 2 * 3; // radiant
// scene.add(modelBee1);

modelBee2.scale.set(0.0225, 0.0225, 0.0225); // because gltf.scene is very big
modelBee2.position.set(24.4, 0, 29.53);
modelBee2.rotation.y = Math.PI / 2; // radiant
// scene.add(modelBee2);

// let loader4 = new THREE.GLTFLoader().load("./models/modular_concrete_fence/scene3.gltf", (result) => {
//     result.scene.traverse((node) => {
//         if (node.isMesh) {
//             node.castShadow = true;
//             node.receiveShadow = true;
//         }
//     });
//     result.scene.position.set(4.3, 0, 24.7);
//     result.scene.rotation.y = -Math.PI / 2;
//     result.scene.scale.set(0.025, 0.025, 0.025);
//     scene.add(result.scene);
// });


var gltfGeometry = new THREE.BufferGeometry();
var gltfMaterial = new THREE.MeshLambertMaterial({
    color: 0xffffff
});

let loader4 = new THREE.GLTFLoader();
const wall1 = new THREE.Object3D();
const wall2 = new THREE.Object3D();
const wall3 = new THREE.Object3D();
loader4.load("./models/modular_concrete_fence/scene3.gltf", processWall);



// let loader22 = new THREE.GLTFLoader().load("./models/japanese_lowpoly_temple/scene.gltf", (result) => {
//     result.scene.traverse((node) => {
//         if (node.isMesh) {
//             node.castShadow = true;
//             node.receiveShadow = true;
//         }
//     });
//     result.scene.position.set(0, 0, 10);
//     result.scene.rotation.y = -Math.PI / 2 * -1;
//     result.scene.scale.set(0.5, 0.5, 0.5);
//     // scene.add(result.scene);
// });

function processWall(gltf) {
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const c = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    gltf.scene.traverse((node) => {
        if (node.isMesh) {
            gltfGeometry = node;
            // node.castShadow = true;
            // node.receiveShadow = true;
        }
    });
    gltf.scene.position.set(-c.x, size.y / 2 - c.y, -c.z); // center the gltf scene
    console.log(dumpObject(gltf.scene).join('\n'));
    wall1.add(gltf.scene);
    wall2.add(gltf.scene.clone());
    wall3.add(gltf.scene.clone());
}

let length1 = 4.3;
let length2 = 8.4615;
let length3 = length2 + (length2 - length1);


var mesh = null;
var dummy = new THREE.Object3D();
var sectionWidth = 200;

function addInstancedMesh() {
    // An InstancedMesh of 4 cubes
    mesh = new THREE.InstancedMesh(gltfGeometry, gltfMaterial, 3);
    scene.add(mesh);
    setInstancedMeshPositions(mesh);
}

function setInstancedMeshPositions(mesh) {
    var changer = 0;
    for (var i = 0; i < mesh.count; i++) {
        // we add 200 units of distance (the width of the section) between each.
        var xStaticPosition = -sectionWidth * (i - 1)
        wall1.position.set(xStaticPosition + changer, 0, 0);
        wall1.updateMatrix();
        mesh.setMatrixAt(i, wall1.matrix);
        changer += 5;
    }
    mesh.instanceMatrix.needsUpdate = true;
}


wall1.scale.set(0.02, 0.02, 0.02); // because gltf.scene is very big
wall1.position.set(4.3, 0, 24.7);
wall1.rotation.y = -Math.PI / 2;
scene.add(wall1);

wall2.scale.set(0.02, 0.02, 0.02); // because gltf.scene is very big
wall2.position.set(8.4615, 0, 24.7);
wall2.rotation.y = -Math.PI / 2; // radiant
// scene.add(wall2);

wall3.scale.set(0.02, 0.02, 0.02); // because gltf.scene is very big
wall3.position.set(length3, 0, 24.7);
wall3.rotation.y = -Math.PI / 2; // radiant
// scene.add(wall3);

// addInstancedMesh();

function dumpObject(obj, lines = [], isLast = true, prefix = '') {
    const localPrefix = isLast ? '└─' : '├─';
    lines.push(`${prefix}${prefix ? localPrefix : ''}${obj.name || '*no-name*'} [${obj.type}]`);
    const newPrefix = prefix + (isLast ? '  ' : '│ ');
    const lastNdx = obj.children.length - 1;
    obj.children.forEach((child, ndx) => {
        const isLast = ndx === lastNdx;
        dumpObject(child, lines, isLast, newPrefix);
    });
    return lines;
}


// modelBee.scale.set(0.002, 0.002, 0.002); // because gltf.scene is very big
// modelBee.position.set(2.4, 0.2, 0.5);
// modelBee.rotation.y = Math.PI;
// scene.add(modelBee);

// modelBee1.scale.set(0.0025, 0.0025, 0.0025); // because gltf.scene is very big
// modelBee1.position.set(-2.4, 0.9, 1.8);
// modelBee1.rotation.x = 0.8; // radiant
// modelBee1.rotation.y = 1.2; // radiant
// scene.add(modelBee1);

// let loader3 = new THREE.GLTFLoader().load("./models/japanese_wall/scene.gltf", (result) => {
//     result.scene.traverse((node) => {
//         if (node.isMesh) {
//             node.castShadow = true;
//             node.receiveShadow = true;
//         }
//     });
//     result.scene.position.set(24.4, 0, 20);
//     result.scene.rotation.y = -Math.PI / 2;
//     result.scene.scale.set(0.025, 0.025, 0.025);
//     // scene.add(result.scene);

//     var source = result.scene;
//     var copy = THREE.SkeletonUtils.clone(source);
//     scene.add(source);
//     scene.add(copy);
// });

// let loader3 = new THREE.GLTFLoader();
// loader3.load("./models/japanese_wall/scene.gltf", function (gltf) {
//     let copy = gltf.clone();

//     // gltf.scene.position.z = 7;
//     // copy.scene.position.z = 1;
//     // copy.scene.position.x = 2;

//     gltf.scene.rotation.y = -Math.PI / 2;
//     copy.scene.rotation.y = -Math.PI / 2;

//     gltf.scene.scale.set(0.025, 0.025, 0.025);
//     copy.scene.scale.set(0.025, 0.025, 0.025);

//     gltf.scene.position.set(24.4, 0, 20);
//     copy.scene.position.set(24.4, 0, 40);

//     scene.add(gltf.scene);
//     scene.add(copy.scene);
// });

// var loader = new THREE.JSONLoader();
// loader.load("models/treehouse_logo.js", function (geometry) {
//     var material, mesh, i, j, instance;
//     material = new THREE.MeshLambertMaterial({
//         color: 0x55B663
//     });
//     mesh = new THREE.Mesh(geometry, material);
//     for (i = 0; i < 15; i += 3) {
//         for (j = 0; j < 15; j += 3) {
//             instance = mesh.clone();
//             instance.position.set(i, 0, j);
//             group.add(instance);
//         }
//     }
// });

// var loader = new THREE.GLTFLoader();
// for (let i = 0; i < resourceData.length; i++) {
//     let oResource = resourceData[i];
//     let sModelName = "resources/" + oResource.model3D + ".gltf";
//     loader.load(sModeName, function (gltf) {
//         // the same code as in your original post
//     }, undefined, function (error) {
//         console.error(error);
//     })
// }

function animate() {
    // box.rotation.x += 0.01;
    // box.rotation.z += 0.01;
    process_keyboard();
    requestAnimationFrame(animate);
    renderer.render(scene, cam);
}

animate();