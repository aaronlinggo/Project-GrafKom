// Debugging Utility
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

var script = document.createElement("script");
script.onload = () => {
    var stats = new Stats();
    document.body.appendChild(stats.dom);
    requestAnimationFrame(function loop() {
        stats.update();
        requestAnimationFrame(loop)
    });
};
script.src = "./src/stats.min.js";
document.head.appendChild(script);

var rendererStats = new THREEx.RendererStats();
rendererStats.domElement.style.position = "absolute";
rendererStats.domElement.style.bottom = "0px";
rendererStats.domElement.style.left = "0px";
document.body.appendChild(rendererStats.domElement);

// World Setup
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;
let cameraControls = false;

const mousePosX = (window.innerWidth / 2);
const mousePosY = (window.innerHeight / 2);



let fogRedColor = 216;
let fogGreenColor = 184;
let fogBlueColor = 140;
let fogColor = new THREE.Color("rgb(" + fogRedColor + ", " + fogGreenColor + ", " + fogBlueColor + ")");
let fogDensity = 0.011;
let gradientPoint = 54;

const redColorSample = Math.floor(fogRedColor / gradientPoint);
const greenColorSample = Math.floor(fogGreenColor / gradientPoint);
const blueColorSample = Math.floor(fogBlueColor / gradientPoint);

var renderer = new THREE.WebGL1Renderer({
    powerPreference: "high-performance", // "high-performance", "low-power", "default"
    antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMapSoft = true;
document.body.appendChild(renderer.domElement);

var scene = new THREE.Scene();
scene.background = fogColor;
scene.fog = new THREE.FogExp2(fogColor, fogDensity);

var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.set(0, 4, 40);
camera.lookAt(0, 4, 4); // What's this?

var orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
orbitControls.update();
orbitControls.enabled = false;

var fpsControls = new THREE.PointerLockControls(camera, renderer.domElement);
fpsControls.pointerSpeed = 0.5;



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
detail.textContent = "Press \"W\" for forward\r\nPress \"S\" for backward\r\nPress \"A\" for left\r\nPress \"D\" for right";
detail.style.display = "block";
document.body.appendChild(detail);

let dot = document.createElement("div");
dot.setAttribute("id", "dot");
dot.style.background = "green";
dot.style.borderRadius = "50%";
dot.style.position = "absolute";
dot.style.top = mousePosY + "px";
dot.style.left = "calc(" + mousePosX + "px - 2.5px)";
dot.style.width = "5px";
dot.style.height = "5px";
dot.style.display = "none";
document.body.appendChild(dot);


fpsControls.addEventListener("lock", () => {
    overlay.style.display = "none";
    dot.style.display = "block";
    startWebGL = true;
}, false);
fpsControls.addEventListener("unlock", () => {
    if (!cameraControls) {
        overlay.style.display = "block";
        dot.style.display = "none";
        startWebGL = false;
        velocity = new THREE.Vector3();
    }
}, false);







var ambient = new THREE.AmbientLight(0x404040, 1.5);
scene.add(ambient);

var textureLoader = new THREE.TextureLoader();
const repeatCount = 20;

function repeatTexture(texture) {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(repeatCount, repeatCount);
}

const groundBaseColorMap = textureLoader.load("./../textures/Dirt_006/low_textures/Dirt_006_baseColor.jpg", repeatTexture);
const groundAoMap = textureLoader.load("./../textures/Dirt_006/low_textures/Dirt_006_ambientOcclusion.jpg", repeatTexture);
const groundHeightMap = textureLoader.load("./../textures/Dirt_006/low_textures/Dirt_006_height.png", repeatTexture);
const groundNormalMap = textureLoader.load("./../textures/Dirt_006/low_textures/Dirt_006_normal.jpg", repeatTexture);
const groundRoughnessMap = textureLoader.load("./../textures/Dirt_006/low_textures/Dirt_006_roughness.jpg", repeatTexture);

let planeGeometry = new THREE.PlaneBufferGeometry(100, 100, 25, 25);
let planeMaterial = new THREE.MeshStandardMaterial({
    color: 0x61523c,
    map: groundBaseColorMap,
    aoMap: groundAoMap,
    displacementMap: groundHeightMap,
    displacementScale: 0.25,
    normalMap: groundNormalMap,
    roughnessMap: groundRoughnessMap,
    roughness: 1.5,
});

let planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
planeMesh.receiveShadow = true;
planeMesh.rotation.x -= Math.PI / 2;
scene.add(planeMesh);



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







// ????????
window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});




const color_lantern = 0xf04e03;
const speed = 200;
const pointer = new THREE.Vector2();
const raycaster = new THREE.Raycaster();



let offsetY = 2.5;

let prevTime = performance.now();
let time;
let delta;
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();
let startWebGL = false;

let ctrDay = 0;
let ctrTimeDay = 0;

let lamps = [true, true, true, true];

for (let i = 0; i < lamps.length; i++) {
    lamps[i] = false;
}

// lamps.forEach((lamp) => {
//     console.log("Lamp is " + lamp);
// })



// var pointLight1 = new THREE.PointLight(color_lantern);
// pointLight1.position.set(-17.5, 2.5, -28.5);
// pointLight1.add(
//     new THREE.Mesh(
//         new THREE.SphereGeometry(0.1, 10, 10),
//         new THREE.MeshBasicMaterial({
//             color: color_lantern,
//         })
//     )
// );
// pointLight1.castShadow = true;
// pointLight1.shadow.radius = 100;
// // scene.add(pointLight1);
// // scene.add(new THREE.PointLightHelper(pointLight1, 0.1, 0xff00ff));

// var pointLight2 = new THREE.PointLight(color_lantern);
// pointLight2.position.set(-17.5, 2.5, 24.5);
// pointLight2.add(
//     new THREE.Mesh(
//         new THREE.SphereGeometry(0.1, 10, 10),
//         new THREE.MeshBasicMaterial({
//             color: color_lantern,
//         })
//     )
// );
// pointLight2.castShadow = true;
// pointLight2.shadow.radius = 100;
// // scene.add(pointLight2);
// // scene.add(new THREE.PointLightHelper(pointLight2, 0.1, 0xff00ff));

// var pointLight3 = new THREE.PointLight(color_lantern);
// pointLight3.position.set(17.5, 2.5, 24.5);
// pointLight3.add(
//     new THREE.Mesh(
//         new THREE.SphereGeometry(0.1, 10, 10),
//         new THREE.MeshBasicMaterial({
//             color: color_lantern,
//         })
//     )
// );
// pointLight3.castShadow = true;
// pointLight3.shadow.radius = 100;
// // scene.add(pointLight3);
// // scene.add(new THREE.PointLightHelper(pointLight3, 0.1, 0xff00ff));

// var pointLight4 = new THREE.PointLight(color_lantern);
// pointLight4.position.set(17.5, 2.5, -28.5);
// pointLight4.add(
//     new THREE.Mesh(
//         new THREE.SphereGeometry(0.1, 10, 10),
//         new THREE.MeshBasicMaterial({
//             color: color_lantern,
//         })
//     )
// );
// pointLight4.castShadow = true;
// pointLight4.shadow.radius = 100;
// // scene.add(pointLight4);
// // scene.add(new THREE.PointLightHelper(pointLight4, 0.1, 0xff00ff));

// pointLight1.visible = false;
// pointLight2.visible = false;
// pointLight3.visible = false;
// pointLight4.visible = false;

var spotlight = new THREE.SpotLight(0x994a0e, 8, 125, Math.PI / 4);
spotlight.position.set(0, 80, 0);
spotlight.target.position.set(0, 0, 0);
spotlight.castShadow = true;
// EXPERIMENTAL
spotlight.shadow.camera.near = 50;
spotlight.shadow.camera.far = 100;
spotlight.shadow.bias = -0.01;
// EXPERIMENTAL
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
console.log(spotlight)

// // adding resizing event listener
// window.addEventListener("resize", () => {
//     renderer.setSize(window.innerWidth, window.innerHeight);
//     camera.aspect = window.innerWidth / window.innerHeight;
//     camera.updateProjectionMatrix();
// });


const overlayOnClik = () => {
    if (!fpsControls.isLocked) {
        fpsControls.lock();
        overlay.style.display = "none";
        dot.style.display = "block";
    }
};

overlay.addEventListener("click", overlayOnClik, false);


let objectLoader = new THREE.GLTFLoader();
var dummyObject = new THREE.Object3D();
var dummyObject2 = new THREE.Object3D();

const tourouAmount = 4;

let tourouMeshA, tourouGeometryA, tourouMaterialA;
let tourouMeshB, tourouGeometryB, tourouMaterialB;
let tourouMeshC, tourouGeometryC, tourouMaterialC;

objectLoader.load("./models/old_japanese_lantern/scene.gltf",
    (gltf) => {
        const objectScene = gltf.scene;

        console.log(dumpObject(objectScene).join("\n"));

        const _tourouMeshA = objectScene.getObjectByName("Tourou_a_low");
        const _tourouMeshB = objectScene.getObjectByName("Tourou_b_low");
        const _tourouMeshC = objectScene.getObjectByName("Tourou_c_low");

        // console.log(_tourouMeshA);
        // console.log(_tourouMeshB);
        // console.log(_tourouMeshC);

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

        // scene.add(tourouMeshA);
        // scene.add(tourouMeshB);
        // scene.add(tourouMeshC);

        tourouMeshA.castShadow = true;
        tourouMeshA.receiveShadow = true;
        tourouMeshB.castShadow = true;
        tourouMeshB.receiveShadow = true;
        tourouMeshC.castShadow = true;
        tourouMeshC.receiveShadow = true;

        // console.log(tourouMeshA);
        // console.log(tourouMeshB);
        // console.log(tourouMeshC);

        animate();
    },

    // (xhr) => {
    //     console.log((xhr.loaded / xhr.total * 100) + "% loaded!");
    // },

    (error) => {
        console.log("Error has occured when loading model!");
    }
);

function drawStoneLantern() {
    if (tourouMeshA && tourouMeshB && tourouMeshC) {
        let i = 0;
        const amount = 4;
        const offset = (amount - 1) / 2;

        // let testArray = [];
        // testArray.push([-7.5, 0]);
        // testArray.push([-7.5, 21.5]);
        // testArray.push([7.5, 21.5]);
        // testArray.push([7.5, 0]);

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

    // ctrTimeDay++;

    // if (ctrTimeDay % 12 == 0) {
    //     if (ctrDay == 0) {
    //         fogRedColor -= redColorSample;
    //         fogGreenColor -= greenColorSample;
    //         fogBlueColor -= blueColorSample;
    //     } else {
    //         fogRedColor += redColorSample;
    //         fogGreenColor += greenColorSample;
    //         fogBlueColor += blueColorSample;
    //     }

    //     if (fogRedColor == 0) {
    //         ctrDay = 1;
    //     } else if (fogRedColor == 216) {
    //         ctrDay = 0;
    //     }

    //     // color_fog = new THREE.Color();
    //     // console.log(color_fog)
    //     fogColor = new THREE.Color("rgb(" + fogRedColor + ", " + fogGreenColor + ", " + fogBlueColor + ")");
    //     scene.background = fogColor;
    //     scene.fog = new THREE.FogExp2(fogColor, 0.011);
    //     ctrTimeDay = 0;
    // }


    // if (ctrDay == 300) {
    //     // color_fog = 0xd8b88d;
    //     fogColor = 0xd8b88d;
    //     scene.background = fogColor;
    //     scene.fog = new THREE.FogExp2(fogColor, 0.011);
    // } else if (ctrDay == 600) {
    //     ctrDay = 0;
    //     // color_fog = 0x000000;
    //     fogColor = 0x000000;
    //     scene.background = fogColor;
    //     scene.fog = null;
    // }

    date = Date.now() * 0.0005;

    borderRadius = 60;

    //spotlight position
    // spotlight.position.x = Math.cos(date) * borderRadius;
    // spotlight.position.z = Math.sin(date) * borderRadius;
    // spotlight.rotation.x += 0.00001;
    // spotlight.target.position.set(0, 0, 0);
    // orbitControls.update();

    // scene.rotation.y += 0.005;

    requestAnimationFrame(animate);
    // drawStoneLantern();
    drawStoneWall();

    renderer.render(scene, camera);
    rendererStats.update(renderer);
}

// ------------------------------------------------------------------
// // load gltf model
var frontTempleMergedGeo = [];
objectLoader.load("./../models/japanese_lowpoly_temple/scene_low.gltf", (gltf) => {
    gltf.scene.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    gltf.scene.position.set(0, 0, 11.8);
    gltf.scene.rotation.y = (-Math.PI / 2) * -1;
    gltf.scene.scale.set(0.5, 0.5, 0.5);
    console.log(dumpObject(gltf.scene).join("\n"));

    // var frontTempleGeo = gltf.scene.getObjectByName("Object_2");
    // console.log(frontTempleGeo.children[0].geometry);
    // console.log(frontTempleGeo.children[1].geometry);
    // console.log(frontTempleGeo.children[2].geometry);
    // console.log(frontTempleGeo.children[3].geometry);
    // console.log(frontTempleGeo.children[4].geometry);
    // console.log(frontTempleGeo.children[5].geometry);
    // console.log(frontTempleGeo.children[6].geometry);
    // console.log(frontTempleGeo.children[7].geometry);
    // console.log(frontTempleGeo.children[8].geometry);
    // frontTempleMergedGeo.push(frontTempleGeo.children[0].geometry);
    // frontTempleMergedGeo.push(frontTempleGeo.children[1].geometry);
    // frontTempleMergedGeo.push(frontTempleGeo.children[2].geometry);
    // frontTempleMergedGeo.push(frontTempleGeo.children[3].geometry);
    // frontTempleMergedGeo.push(frontTempleGeo.children[4].geometry);
    // frontTempleMergedGeo.push(frontTempleGeo.children[5].geometry);
    // frontTempleMergedGeo.push(frontTempleGeo.children[6].geometry);
    // frontTempleMergedGeo.push(frontTempleGeo.children[7].geometry);
    // frontTempleMergedGeo.push(frontTempleGeo.children[8].geometry);
    // var templeGeo = new THREE.BufferGeometryUtils.mergeBufferGeometries(frontTempleMergedGeo);
    // console.log(gltf.scene)

    scene.add(gltf.scene);
});

objectLoader.load("./../models/shitennoji/scene_low.gltf", (gltf) => {
    gltf.scene.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    gltf.scene.position.set(0, -0.4, -22.8);
    gltf.scene.scale.set(0.0085, 0.0085, 0.0085);
    console.log(dumpObject(gltf.scene).join("\n"));
    scene.add(gltf.scene);
});

// objectLoader.load(
//     "./models/1972.158.1_guardian_figure_nio/scene.gltf",
//     (gltf) => {
//         gltf.scene.traverse((child) => {
//             if (child.isMesh) {
//                 child.castShadow = true;
//                 child.receiveShadow = true;
//             }
//         });
//         gltf.scene.position.set(12.5, 5, -27);
//         gltf.scene.scale.set(3.5, 3.5, 3.5);
//         console.log(dumpObject(gltf.scene).join("\n"));
//         scene.add(gltf.scene);
//     }
// );

// const geometry = new THREE.BoxGeometry(0.5, 3, 3);
// let loadermaterial = new THREE.TextureLoader();
// const material = new THREE.MeshBasicMaterial({
//     map: loadermaterial.load("../textures/black-g444986ca3_1920.jpg")
// });
// material.castShadow = true;
// material.receiveShadow = true;
// const cube = new THREE.Mesh(geometry, material);
// cube.position.set(-23, 3, 30);
// cube.rotation.y = Math.PI / 2;
// cube.castShadow = true;
// cube.receiveShadow = true;
// // console.log(cube)
// // scene.add(cube);

// const btn1 = new THREE.BoxGeometry(0.1, 0.2, 0.2);
// const btnMaterial1 = new THREE.MeshBasicMaterial({
//     color: 0xffffff
// });
// const btn1cube = new THREE.Mesh(btn1, btnMaterial1);
// btn1cube.position.set(-24, 3.5, 30.3);
// btn1cube.rotation.y = Math.PI / 2;
// btn1cube.name = "btn1";
// // scene.add(btn1cube);

// const btn2 = new THREE.BoxGeometry(0.1, 0.2, 0.2);
// const btnMaterial2 = new THREE.MeshBasicMaterial({
//     color: 0xffffff
// });
// const btn2cube = new THREE.Mesh(btn2, btnMaterial2);
// btn2cube.position.set(-22, 3.5, 30.3);
// btn2cube.rotation.y = Math.PI / 2;
// btn2cube.name = "btn2";
// // scene.add(btn2cube);

// const btn3 = new THREE.BoxGeometry(0.1, 0.2, 0.2);
// const btnMaterial3 = new THREE.MeshBasicMaterial({
//     color: 0xffffff
// });
// const btn3cube = new THREE.Mesh(btn3, btnMaterial3);
// btn3cube.position.set(-24, 3, 30.3);
// btn3cube.rotation.y = Math.PI / 2;
// btn3cube.name = "btn3";
// // scene.add(btn3cube);

// const btn4 = new THREE.BoxGeometry(0.1, 0.2, 0.2);
// const btnMaterial4 = new THREE.MeshBasicMaterial({
//     color: 0xffffff
// });
// const btn4cube = new THREE.Mesh(btn4, btnMaterial4);
// btn4cube.position.set(-22, 3, 30.3);
// btn4cube.rotation.y = Math.PI / 2;
// btn4cube.name = "btn4";
// // scene.add(btn4cube);

// const btn5 = new THREE.BoxGeometry(0.1, 0.2, 0.2);
// const btnMaterial5 = new THREE.MeshBasicMaterial({
//     color: 0x00ff00
// });
// const btn5cube = new THREE.Mesh(btn5, btnMaterial5);
// btn5cube.position.set(-22, 2, 30.3);
// btn5cube.rotation.y = Math.PI / 2;
// btn5cube.name = "btn5";
// // scene.add(btn5cube);

// // var textGeo =
// const onMouseClick = (event) => {
//     if (cameraControls == false) {
//         pointer.x = ((window.innerWidth / 2) / window.innerWidth) * 2 - 1;
//         pointer.y = -((window.innerHeight / 2) / window.innerHeight) * 2 + 1;
//     } else {
//         pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
//         pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
//     }
//     raycaster.setFromCamera(pointer, camera);
//     const intersects = raycaster.intersectObjects(scene.children);
//     if (intersects.length > 0) {
//         if (intersects[0].object.name === "btn1") {
//             if (lamps[0] == true) {
//                 lamps[0] = false;
//                 pointLight1.visible = false;
//                 intersects[0].object.material.color.set(0xff0000);
//             } else {
//                 lamps[0] = true;
//                 pointLight1.visible = true;
//                 intersects[0].object.material.color.set(0xffffff);
//             }
//         } else if (intersects[0].object.name === "btn2") {
//             if (lamps[3] == true) {
//                 lamps[3] = false;
//                 pointLight4.visible = false;
//                 intersects[0].object.material.color.set(0xff0000);
//             } else {
//                 lamps[3] = true;
//                 pointLight4.visible = true;
//                 intersects[0].object.material.color.set(0xffffff);
//             }
//         } else if (intersects[0].object.name === "btn3") {
//             if (lamps[1] == true) {
//                 lamps[1] = false;
//                 pointLight2.visible = false;
//                 intersects[0].object.material.color.set(0xff0000);
//             } else {
//                 lamps[1] = true;
//                 pointLight2.visible = true;
//                 intersects[0].object.material.color.set(0xffffff);
//             }
//         } else if (intersects[0].object.name === "btn4") {
//             if (lamps[2] == true) {
//                 lamps[2] = false;
//                 pointLight3.visible = false;
//                 intersects[0].object.material.color.set(0xff0000);
//             } else {
//                 lamps[2] = true;
//                 pointLight3.visible = true;
//                 intersects[0].object.material.color.set(0xffffff);
//             }
//         } else if (intersects[0].object.name === "btn5") {
//             if (cameraControls == false) {
//                 cameraControls = true;
//                 intersects[0].object.material.color.set(0xffffff);
//                 fpsControls.unlock();
//                 document.getElementById("dot").style.display = "none";
//                 orbitControls.enabled = true;
//             } else {
//                 cameraControls = false;
//                 intersects[0].object.material.color.set(0x00ff00);
//                 orbitControls.enabled = false;
//                 fpsControls.lock();
//                 document.getElementById("dot").style.display = "true";
//             }
//         }
//     }
// }

// window.addEventListener("click", onMouseClick);


const wallAmountA = 52;
const wallAmountB = 25;

let wallMeshA, wallGeometryA, wallMaterialA;
let wallMeshB, wallGeometryB, wallMaterialB;

objectLoader.load("./../models/modular_concrete_fence/scene_low.gltf",
    (gltf) => {
        const objectScene = gltf.scene;

        // console.log(dumpObject(objectScene).join("\n"));

        const _wallMeshA = objectScene.getObjectByName("Cube");
        const _wallMeshB = objectScene.getObjectByName("Cube001");

        wallGeometryA = _wallMeshA.children[0].geometry.clone();
        wallGeometryB = _wallMeshB.children[0].geometry.clone();

        // console.log(wallGeometryA); // Type: Buffer Geometry
        // console.log(wallGeometryB);

        const defaultTransformA = new THREE.Matrix4().multiply(new THREE.Matrix4().makeScale(0.03, 0.03, 0.03));
        const defaultTransformB = new THREE.Matrix4().multiply(new THREE.Matrix4().makeScale(0.04, 0.04, 0.04));

        wallGeometryA.applyMatrix4(defaultTransformA);
        wallGeometryB.applyMatrix4(defaultTransformB);

        wallMaterialA = _wallMeshA.children[0].material;
        wallMaterialB = _wallMeshB.children[0].material;

        wallMeshA = new THREE.InstancedMesh(wallGeometryA, wallMaterialA, wallAmountA);
        wallMeshB = new THREE.InstancedMesh(wallGeometryB, wallMaterialB, wallAmountB);

        console.log("==============================");
        // console.log(wallMaterialA);
        console.log("Material Dimension: " + wallMaterialA.map.source.data.width + "x" + wallMaterialA.map.source.data.height);
        console.log("==============================");

        wallMeshA.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        wallMeshB.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

        wallMeshA.castShadow = true;
        wallMeshA.receiveShadow = true;
        wallMeshB.castShadow = true;
        // wallMeshB.receiveShadow = true;

        scene.add(wallMeshA);
        scene.add(wallMeshB);

        // console.log(wallMeshA);
        // console.log(wallMeshB);

        animate();
    },

    // (xhr) => {
    //     console.log((xhr.loaded / xhr.total * 100) + "% loaded!");
    // },

    (error) => {
        console.log("Error has occured when loading model!");
    }
);

var boolTest = true;
var boolTest2 = true;

function drawStoneWall() {
    if (wallMeshA && wallMeshB) {
        const clippedHeightWallA = 1.05;
        const clippedHeightWallB = 0.2;

        let wallPositionA = [];
        let wallPositionB = [];

        // Front Temple
        wallPositionA.push([-16.45, clippedHeightWallA, 27.7]);
        wallPositionA.push([-11.75, clippedHeightWallA, 27.7]);
        wallPositionA.push([-7.05, clippedHeightWallA, 27.7]);
        wallPositionA.push([-2.35, clippedHeightWallA, 27.7]);
        wallPositionA.push([2.35, clippedHeightWallA, 27.7]);
        wallPositionA.push([7.05, clippedHeightWallA, 27.7]);
        wallPositionA.push([11.75, clippedHeightWallA, 27.7]);
        wallPositionA.push([16.45, clippedHeightWallA, 27.7]);
        wallPositionA.push([16.45, clippedHeightWallA, 23]);
        wallPositionA.push([16.45, clippedHeightWallA, 18.3]);
        wallPositionA.push([16.45, clippedHeightWallA, 13.6]);
        wallPositionA.push([16.45, clippedHeightWallA, 8.9]);
        wallPositionA.push([16.45, clippedHeightWallA, 4.2]);
        wallPositionA.push([-16.45, clippedHeightWallA, -0.5]);
        wallPositionA.push([-11.75, clippedHeightWallA, -0.5]);
        wallPositionA.push([-7.05, clippedHeightWallA, -0.5]);
        wallPositionA.push([-2.35, clippedHeightWallA, -0.5]);
        wallPositionA.push([2.35, clippedHeightWallA, -0.5]);
        wallPositionA.push([7.05, clippedHeightWallA, -0.5]);
        wallPositionA.push([11.75, clippedHeightWallA, -0.5]);
        wallPositionA.push([16.45, clippedHeightWallA, -0.5]);
        wallPositionA.push([-16.45, clippedHeightWallA, 23]);
        wallPositionA.push([-16.45, clippedHeightWallA, 18.3]);
        wallPositionA.push([-16.45, clippedHeightWallA, 13.6]);
        wallPositionA.push([-16.45, clippedHeightWallA, 8.9]);
        wallPositionA.push([-16.45, clippedHeightWallA, 4.2]);

        // Rear Temple
        wallPositionA.push([-16.45, clippedHeightWallA, -8.9]);
        wallPositionA.push([-11.75, clippedHeightWallA, -8.9]);
        wallPositionA.push([-7.05, clippedHeightWallA, -8.9]);
        wallPositionA.push([-2.35, clippedHeightWallA, -8.9]);
        wallPositionA.push([2.35, clippedHeightWallA, -8.9]);
        wallPositionA.push([7.05, clippedHeightWallA, -8.9]);
        wallPositionA.push([11.75, clippedHeightWallA, -8.9]);
        wallPositionA.push([16.45, clippedHeightWallA, -8.9]);
        wallPositionA.push([16.45, clippedHeightWallA, -13.6]);
        wallPositionA.push([16.45, clippedHeightWallA, -18.3]);
        wallPositionA.push([16.45, clippedHeightWallA, -23]);
        wallPositionA.push([16.45, clippedHeightWallA, -27.7]);
        wallPositionA.push([16.45, clippedHeightWallA, -32.4]);
        wallPositionA.push([-16.45, clippedHeightWallA, -37.1]);
        wallPositionA.push([-11.75, clippedHeightWallA, -37.1]);
        wallPositionA.push([-7.05, clippedHeightWallA, -37.1]);
        wallPositionA.push([-2.35, clippedHeightWallA, -37.1]);
        wallPositionA.push([2.35, clippedHeightWallA, -37.1]);
        wallPositionA.push([7.05, clippedHeightWallA, -37.1]);
        wallPositionA.push([11.75, clippedHeightWallA, -37.1]);
        wallPositionA.push([16.45, clippedHeightWallA, -37.1]);
        wallPositionA.push([-16.45, clippedHeightWallA, -13.6]);
        wallPositionA.push([-16.45, clippedHeightWallA, -18.3]);
        wallPositionA.push([-16.45, clippedHeightWallA, -23]);
        wallPositionA.push([-16.45, clippedHeightWallA, -27.7]);
        wallPositionA.push([-16.45, clippedHeightWallA, -32.4]);


        // 26.7
        // wallPositionA.push([-16.45, clippedHeightWallA,  36.1]);
        // wallPositionA.push([-16.45, clippedHeightWallA, -45.5]); // 36.4???





        // Simplifikasi, ada yang belum digeser
        wallPositionB.push([-13.95, clippedHeightWallB, 26.7]);
        wallPositionB.push([-9.25, clippedHeightWallB, 26.7]);
        wallPositionB.push([-4.55, clippedHeightWallB, 26.7]);
        wallPositionB.push([4.755, clippedHeightWallB, 26.7]);
        wallPositionB.push([9.455, clippedHeightWallB, 26.7]);
        wallPositionB.push([14.155, clippedHeightWallB, 26.7]);

        wallPositionB.push([16.555, clippedHeightWallB, 24.4]);
        wallPositionB.push([16.555, clippedHeightWallB, 19.7]);
        wallPositionB.push([16.555, clippedHeightWallB, 15.0]);
        wallPositionB.push([16.555, clippedHeightWallB, 10.3]);
        wallPositionB.push([16.555, clippedHeightWallB, 5.6]);
        wallPositionB.push([16.555, clippedHeightWallB, 0.9]);
        wallPositionB.push([-13.95, clippedHeightWallB, -1.5]);
        wallPositionB.push([-9.25, clippedHeightWallB, -1.5]);
        wallPositionB.push([-4.55, clippedHeightWallB, -1.5]);
        wallPositionB.push([0.1755, clippedHeightWallB, -1.5]);
        wallPositionB.push([4.755, clippedHeightWallB, -1.5]);
        wallPositionB.push([9.455, clippedHeightWallB, -1.5]);
        wallPositionB.push([14.155, clippedHeightWallB, -1.5]);
        wallPositionB.push([-16.35, clippedHeightWallB, 24.4]);
        wallPositionB.push([-16.35, clippedHeightWallB, 19.7]);
        wallPositionB.push([-16.35, clippedHeightWallB, 15.0]);
        wallPositionB.push([-16.35, clippedHeightWallB, 10.3]);
        wallPositionB.push([-16.35, clippedHeightWallB, 5.6]);
        wallPositionB.push([-16.35, clippedHeightWallB, 0.9]);

        // Shitennoji
        wallPositionB.push([-13.95, clippedHeightWallB, 26.7]);
        wallPositionB.push([-9.25, clippedHeightWallB, 26.7]);
        wallPositionB.push([-4.55, clippedHeightWallB, 26.7]);
        wallPositionB.push([4.755, clippedHeightWallB, 26.7]);
        wallPositionB.push([9.455, clippedHeightWallB, 26.7]);
        wallPositionB.push([14.155, clippedHeightWallB, 26.7]);
        wallPositionB.push([16.555, clippedHeightWallB, 24.4]);
        wallPositionB.push([16.555, clippedHeightWallB, 19.7]);
        wallPositionB.push([16.555, clippedHeightWallB, 15.0]);
        wallPositionB.push([16.555, clippedHeightWallB, 10.3]);
        wallPositionB.push([16.555, clippedHeightWallB, 5.6]);
        wallPositionB.push([16.555, clippedHeightWallB, 0.9]);
        wallPositionB.push([-13.95, clippedHeightWallB, -1.5]);
        wallPositionB.push([-9.25, clippedHeightWallB, -1.5]);
        wallPositionB.push([-4.55, clippedHeightWallB, -1.5]);
        wallPositionB.push([0.1755, clippedHeightWallB, -1.5]);
        wallPositionB.push([4.755, clippedHeightWallB, -1.5]);
        wallPositionB.push([9.455, clippedHeightWallB, -1.5]);
        wallPositionB.push([14.155, clippedHeightWallB, -1.5]);
        wallPositionB.push([-16.35, clippedHeightWallB, 24.4]);
        wallPositionB.push([-16.35, clippedHeightWallB, 19.7]);
        wallPositionB.push([-16.35, clippedHeightWallB, 15.0]);
        wallPositionB.push([-16.35, clippedHeightWallB, 10.3]);
        wallPositionB.push([-16.35, clippedHeightWallB, 5.6]);
        wallPositionB.push([-16.35, clippedHeightWallB, 0.9]);

        // Salah hitungan index i, cek lagi
        let i = 0;
        let amountA = wallPositionA.length;
        // for (let x = 0; x < wallAmountA; x++) {
        //     for (let y = 0; y < wallAmountA; y++) {
        for (let z = 0; z < amountA; z++) {
            dummyObject2.position.set(wallPositionA[i][0], wallPositionA[i][1], wallPositionA[i][2]);
            dummyObject2.rotation.x = Math.PI / 2 * -1;
            dummyObject2.rotation.z = Math.PI / 2 * -1;
            dummyObject2.updateMatrix();
            wallMeshA.setMatrixAt(i, dummyObject2.matrix);

            i++;
        }
        //     }
        // }

        // Salah hitungan index i, cek lagi
        i = 0;
        let amountB = wallPositionB.length;
        // for (let x = 0; x < wallAmountB; x++) {
        //     for (let y = 0; y < wallAmountB; y++) {
        for (let z = 0; z < amountB; z++) {
            dummyObject2.position.set(wallPositionB[i][0], wallPositionB[i][1], wallPositionB[i][2]);
            dummyObject2.rotation.x = Math.PI / 2 * -1;

            if (i >= 0 && i <= 2 || i >= 12 && i <= 15) {
                dummyObject2.rotation.z = Math.PI / 2;
            } else if (i >= 3 && i <= 5 || i >= 16 && i <= 18) {
                dummyObject2.rotation.z = Math.PI / 2 * -1;
            }
            // else if (i == 15) {
            //     dummyObject2.rotation.z = Math.PI / 2 * -1;
            // }
            else {
                dummyObject2.rotation.z = Math.PI * 2 * -1;
            }

            // if (i == 15) {
            //     dummyObject2.scale.y = 1.9;
            //     // console.log(dummyObject2.scale);
            // } else {
            //     dummyObject2.scale.y = 1;
            // }
            // console.log(dummyObject2.scale);

            dummyObject2.updateMatrix();
            wallMeshB.setMatrixAt(i, dummyObject2.matrix);

            i++;
        }
        //     }
        // }

        if (boolTest2) {
            boolTest2 = false;
        }

        wallMeshA.matrixAutoUpdate = false;
        wallMeshB.matrixAutoUpdate = false;

        wallMeshA.instanceMatrix.needsUpdate = false;
        wallMeshB.instanceMatrix.needsUpdate = false;

        if (boolTest) {
            boolTest = false;
            console.log(wallMeshA);
            console.log(wallMeshB);
        }
    }
}