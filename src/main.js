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

const script = document.createElement("script");
script.onload = () => {
    const stats = new Stats();
    stats.dom.id = "fpsGraph";
    stats.dom.setAttribute("class", "hideFPS");
    document.body.appendChild(stats.dom);
    requestAnimationFrame(function loop() {
        stats.update();
        requestAnimationFrame(loop);
    });
};
script.src = "./src/stats.min.js";
document.head.appendChild(script);

const rendererStats = new THREEx.RendererStats();
rendererStats.domElement.id = "rendererStats";
rendererStats.domElement.style.display = "none";
document.body.appendChild(rendererStats.domElement);

// Overlay Setup
let cameraControls = false;
let disableClick = false;
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let hideOverlay = [true, true, false];

const overlay = document.createElement("div");
overlay.id = "pointerLockOverlay";
overlay.innerHTML = "Click to enable controls!";
overlay.addEventListener("click", () => {
    if (disableClick) return;
    if (!fpsControls.isLocked) fpsControls.lock();
}, false);
document.body.appendChild(overlay);

const controlsCommand = [];
controlsCommand.push("First Person Camera Controls:");
controlsCommand.push("Press W to moving forward");
controlsCommand.push("Press S to moving backward");
controlsCommand.push("Press A to moving left");
controlsCommand.push("Press D to moving right");
controlsCommand.push("Orbit Camera Controls:");
controlsCommand.push("Hold Left Mouse Button to rotate camera");
controlsCommand.push("Hold Right Mouse Button to drag camera");
controlsCommand.push("Scroll Mouse Wheel Up to zoom camera in");
controlsCommand.push("Scroll Mouse Wheel Down to zoom camera out");

const detail = document.createElement("div");
detail.id = "controlsDetail";
detail.innerHTML = "<u>" + controlsCommand[0] + "</u>\r\n" + controlsCommand[1] + "\r\n" + controlsCommand[2] + "\r\n" + controlsCommand[3] + "\r\n" + controlsCommand[4];
document.body.appendChild(detail);

const dot = document.createElement("div");
dot.id = "redLaserSight";
document.body.appendChild(dot);

const keyToggle = document.createElement("div");
keyToggle.id = "keyToggle";
keyToggle.innerHTML = "Press 1 : Show/Hide FPS - Press 2 : Show/Hide Debugger - Press 3 : Show/Hide Detail -  Press T : Show/Hide All";
document.body.appendChild(keyToggle);

// World Setup
const borderRadius = 60;
const cameraSpeed = 200;
const fogDensity = 0.011;
const gradientPoint = 54;
const lanternColor = 0xf04e03;
const lightIntensity = 1;
const lightRadius = 100;

let fogRedColor = 216;
let fogGreenColor = 183;
let fogBlueColor = 140;
let fogColor = new THREE.Color("rgb(" + fogRedColor + ", " + fogGreenColor + ", " + fogBlueColor + ")");

const redColorSample = Math.floor(fogRedColor / gradientPoint);
const greenColorSample = Math.floor(fogGreenColor / gradientPoint);
const blueColorSample = Math.floor(fogBlueColor / gradientPoint);
const clock = new THREE.Clock();
const direction = new THREE.Vector3();
const mousePointer = new THREE.Vector2(1, 1);
const raycaster = new THREE.Raycaster();

let delta, mixerA, mixerB, time;
let ctrDay = 0;
let ctrTimeDay = 0;
let prevTime = performance.now();
let velocity = new THREE.Vector3();
let lampsVisible = [true, true, true, true];
let startWebGL = false;

const renderer = new THREE.WebGL1Renderer({
    powerPreference: "high-performance", // "high-performance", "low-power", "default"
    antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMapSoft = true;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = fogColor;
scene.fog = new THREE.FogExp2(fogColor, fogDensity);

const ambient = new THREE.AmbientLight(0x404040, 1.5);
scene.add(ambient);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.set(0, 4.15, 55);
camera.lookAt(0, 4.15, 0);

const orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
orbitControls.enabled = false;
/**
 * This isn't required if enableDamping and autoRotate is set to false. If orbitControls is updated and
 * you want to use lookAt function from PerspectiveCamera, you have to place it in the animate function
 * after orbitControls.update().
 */
orbitControls.target.set(0, 4.15, 0);
orbitControls.update();

const fpsControls = new THREE.PointerLockControls(camera, renderer.domElement);
fpsControls.pointerSpeed = 0.5;
fpsControls.addEventListener("lock", () => {
    overlay.style.display = "none";
    dot.style.display = "block";
    startWebGL = true;
    velocity = new THREE.Vector3();
}, false);
fpsControls.addEventListener("unlock", () => {
    if (!cameraControls) {
        overlay.removeAttribute("style");
        dot.removeAttribute("style");
        startWebGL = false;
        disableClick = true;
        velocity = new THREE.Vector3();
        setTimeout(() => disableClick = false, 1250);
    }
}, false);

const manager = new THREE.LoadingManager();
manager.onStart = (url, itemsLoaded, itemsTotal) => {
    console.log("Started loading file: " + url + ".\nLoaded " + itemsLoaded + " of " + itemsTotal + " files.");
    document.getElementById("loadingText").innerHTML = "Loaded " + itemsLoaded + " of " + itemsTotal + " files.";
};
manager.onLoad = () => {
    console.log("Loading complete!");
    window.setTimeout(() => {
        animateScene(); // Animate first then remove overlay
        document.getElementById("loading").style.opacity = 0;
        window.setTimeout(() => {
            document.getElementById("loading").style.display = "none";
        }, 1000)
    }, 500);
};
manager.onProgress = (url, itemsLoaded, itemsTotal) => {
    console.log("Loading file: " + url + ".\nLoaded " + itemsLoaded + " of " + itemsTotal + " files.");
    document.getElementById("loadingText").innerHTML = "Loaded " + itemsLoaded + " of " + itemsTotal + " files.";
};
manager.onError = (url) => {
    console.log("There was an error loading " + url + "!");
};

const textureLoader = new THREE.TextureLoader(manager);
var repeatCount = 20;

function repeatTexture(texture) {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(repeatCount, repeatCount);
}

const groundBaseColorMap = textureLoader.load("./textures/Dirt_006/low_textures/Dirt_006_baseColor.jpg", repeatTexture);
const groundAoMap = textureLoader.load("./textures/Dirt_006/low_textures/Dirt_006_ambientOcclusion.jpg", repeatTexture);
const groundHeightMap = textureLoader.load("./textures/Dirt_006/low_textures/Dirt_006_height.png", repeatTexture);
const groundNormalMap = textureLoader.load("./textures/Dirt_006/low_textures/Dirt_006_normal.jpg", repeatTexture);
const groundRoughnessMap = textureLoader.load("./textures/Dirt_006/low_textures/Dirt_006_roughness.jpg", repeatTexture);
const groundMesh = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(100, 100, 25, 25),
    new THREE.MeshStandardMaterial({
        color: 0x61523c,
        map: groundBaseColorMap,
        aoMap: groundAoMap,
        displacementMap: groundHeightMap,
        displacementScale: 0.25,
        normalMap: groundNormalMap,
        roughnessMap: groundRoughnessMap,
        roughness: 1.5,
    })
);
groundMesh.receiveShadow = true;
groundMesh.rotation.x -= Math.PI / 2;
scene.add(groundMesh);

// Load Models
const objectLoader = new THREE.GLTFLoader(manager);
const dummyObjectA = new THREE.Object3D();
const dummyObjectB = new THREE.Object3D();
const dummyObjectC = new THREE.Object3D();
const dummyObjectD = new THREE.Object3D();

const clippedHeightWallA = 1.05;
const clippedHeightWallB = 0.25;
const wallAmountA = 52;
const wallAmountB = 50;
let wallPositionA = [];
let wallPositionB = [];
let wallMeshA, wallMeshB;

const clippedHeightLantern = 1.8;
const clippedHeightPointLight = 2.525;
const lanternAmount = 4;
let lanternPosition = [];
let lanternMesh;

const clippedHeightFloor = 0.15;
const pavedAmount = 64;
let floorPosition = [];
let pavedMesh;

const clippedHeightBambooA = 0.2;
const clippedHeightBambooB = 2;
const clippedHeightBambooC = 1;
const bambooAmount = 138;
let bambooPosition = [];
let bambooMesh;

let nioPosition = [-5.5, -0.75, 43];
let gateMesh, nioMeshA, nioMeshB;

const panelGeometry = new THREE.BoxBufferGeometry(0.5, 3, 3);
const panelMaterial = new THREE.MeshBasicMaterial({
    map: textureLoader.load("textures/black-g444986ca3_low.jpg"),
});
const panelMesh = new THREE.Mesh(panelGeometry, panelMaterial);
panelMesh.position.set(-23.1975, 4.04, 40);
panelMesh.rotation.y = Math.PI / 2;
panelMesh.castShadow = true;
panelMesh.receiveShadow = true;
scene.add(panelMesh);

const fontLoader = new THREE.FontLoader(manager);
fontLoader.load("./Oswald_Bold.json", (font) => {
    const textGeometry1 = new THREE.TextGeometry("Top Left", {
        font: font,
        height: 0.1,
        size: 0.1,
    });
    const textGeometry2 = new THREE.TextGeometry("Top Right", {
        font: font,
        height: 0.1,
        size: 0.1,
    });
    const textGeometry3 = new THREE.TextGeometry("Bottom Left", {
        font: font,
        height: 0.1,
        size: 0.1,
    });
    const textGeometry4 = new THREE.TextGeometry("Bottom Right", {
        font: font,
        height: 0.1,
        size: 0.1,
    });
    const textGeometry5 = new THREE.TextGeometry("Change Camera Control", {
        font: font,
        height: 0.1,
        size: 0.1,
    });
    const textGeometry6 = new THREE.TextGeometry("Control Panel", {
        font: font,
        height: 0.1,
        size: 0.2,
    });

    const textMesh1 = new THREE.Mesh(textGeometry1, new THREE.MeshBasicMaterial({
        color: 0xffffff
    }));
    textMesh1.position.set(-24, 4.395, 40.2);
    scene.add(textMesh1);

    const textMesh2 = textMesh1.clone();
    textMesh2.geometry = textGeometry2;
    textMesh2.position.set(-22.925, 4.395, 40.2);
    scene.add(textMesh2);

    const textMesh3 = textMesh1.clone();
    textMesh3.geometry = textGeometry3;
    textMesh3.position.set(-24, 3.895, 40.2);
    scene.add(textMesh3);

    const textMesh4 = textMesh1.clone();
    textMesh4.geometry = textGeometry4;
    textMesh4.position.set(-23.15, 3.895, 40.2);
    scene.add(textMesh4);

    const textMesh5 = textMesh1.clone();
    textMesh5.geometry = textGeometry5;
    textMesh5.position.set(-23.728, 2.94, 40.2);
    scene.add(textMesh5);

    const textMesh6 = textMesh1.clone();
    textMesh6.geometry = textGeometry6;
    textMesh6.position.set(-23.99, 5, 40.2);
    scene.add(textMesh6);
});

const buttonGeometry = new THREE.BoxBufferGeometry(0.1, 0.2, 0.2);
const buttonMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff, // Must be set to white so it doesn't affect setColorAt method
});
const buttonAmount = 5;
const buttonMesh = new THREE.InstancedMesh(buttonGeometry, buttonMaterial, buttonAmount);
const buttonColor = new THREE.Color();
let buttonPosition = [];
buttonMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
scene.add(buttonMesh);

const lampsGeometry = new THREE.SphereBufferGeometry(0.1, 10, 10);
const lampsMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff, // Must be set to white so it doesn't affect setColorAt method
});
const lampsAmount = 4;
const lampsMesh = new THREE.InstancedMesh(lampsGeometry, lampsMaterial, lampsAmount);
const lampsColor = new THREE.Color();
const scaleLamps = new THREE.Object3D();
lampsMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
scene.add(lampsMesh);

function instancingObject(gltf, name, amount = 1, scale = [1, 1, 1]) {
    const object3D = gltf.scene.getObjectByName(name);
    const objectMaterial = object3D.children[0].material;
    const objectGeometry = object3D.children[0].geometry.clone();
    objectGeometry.applyMatrix4(new THREE.Matrix4().multiply(new THREE.Matrix4().makeScale(scale[0], scale[1], scale[2])));

    const objectMesh = new THREE.InstancedMesh(objectGeometry, objectMaterial, amount);
    objectMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    objectMesh.castShadow = true;
    objectMesh.receiveShadow = true;

    return objectMesh;
}

objectLoader.load("./models/shitennoji/scene_low.gltf", (gltf) => {
    // console.log(dumpObject(gltf.scene).join("\n"));
    gltf.scene.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            child.material.metalness = 0.15;
        }
    });
    gltf.scene.position.set(0, -0.45, -23.9);
    gltf.scene.scale.set(0.0085, 0.0085, 0.0085);
    // console.log(gltf.scene);
    scene.add(gltf.scene);
});
objectLoader.load("./models/japanese_lowpoly_temple/scene_low.gltf", (gltf) => {
    // console.log(dumpObject(gltf.scene).join("\n"));
    gltf.scene.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            child.material.metalness = 0.15;
        }
    });
    gltf.scene.position.set(0, 0, 11.6);
    gltf.scene.rotation.y = -Math.PI / 2 * -1;
    gltf.scene.scale.set(0.5, 0.5, 0.5);
    // console.log(gltf.scene);
    scene.add(gltf.scene);
});
objectLoader.load("./models/modular_concrete_fence/scene_low.gltf", (gltf) => {
    wallMeshA = instancingObject(gltf, "Cube", wallAmountA, scale = [0.03, 0.03, 0.03]);
    wallMeshA.material.metalness = 0.0;
    wallMeshA.material.roughness = 0.975;
    scene.add(wallMeshA);

    wallMeshB = instancingObject(gltf, "Cube001", wallAmountB, scale = [0.04, 0.04, 0.04]);
    wallMeshB.material.metalness = 0.0;
    wallMeshB.material.roughness = 0.975;
    scene.add(wallMeshB);

    // console.log(dumpObject(gltf.scene).join("\n"));
    // console.log(wallMeshA);
    // console.log(wallMeshB);
});
objectLoader.load("./models/old_japanese_lantern/scene_low.gltf", (gltf) => {
    lanternMesh = instancingObject(gltf, "Tourou_low", lanternAmount, scale = [1.75, 1.75, 1.75]);
    lanternMesh.material.metalness = 0.0;
    lanternMesh.material.roughness = 0.85;
    scene.add(lanternMesh);

    // console.log(dumpObject(gltf.scene).join("\n"));
    // console.log(lanternMesh);
});
objectLoader.load("./models/road/scene_low.gltf", (gltf) => {
    pavedMesh = instancingObject(gltf, "road_objcleanermaterialmergergles", pavedAmount, scale = [0.325, 0.325, 0.325]);
    pavedMesh.material.metalness = 0.0;
    pavedMesh.material.roughness = 0.85;
    scene.add(pavedMesh);

    // console.log(dumpObject(gltf.scene).join("\n"));
    // console.log(pavedMesh);
});
objectLoader.load("./models/bamboo_model/scene_low.gltf", (gltf) => {
    bambooMesh = instancingObject(gltf, "Circle001", bambooAmount, scale = [0.3, 0.3, 0.3]);
    bambooMesh.material.metalness = 0.0;
    bambooMesh.material.roughness = 0.75;
    scene.add(bambooMesh);

    // console.log(dumpObject(gltf.scene).join("\n"));
    // console.log(bambooMesh);
});
objectLoader.load("./models/japanese_gate/scene_low.gltf", (gltf) => {
    gateMesh = instancingObject(gltf, "Roof_rtop_main_low", 1, scale = [6.5, 6.5, 6.5]);
    gateMesh.material.metalness = 0.0;
    gateMesh.material.roughness = 0.8;
    scene.add(gateMesh);

    // console.log(dumpObject(gltf.scene).join("\n"));
    // console.log(gateMesh);
});
objectLoader.load("./models/1972.158.2_guardian_figure_nio/scene_low.gltf", (gltf) => {
    nioMeshA = instancingObject(gltf, "Guardian_2objcleanermaterialmergergles", 1, scale = [3.5, 3.5, 3.5]);
    nioMeshA.material.metalness = 0.0;
    nioMeshA.material.roughness = 0.8;
    scene.add(nioMeshA);

    // console.log(dumpObject(gltf.scene).join("\n"));
    // console.log(nioMeshA);
});
objectLoader.load("./models/1972.158.1_guardian_figure_nio/scene_low.gltf", (gltf) => {
    nioMeshB = instancingObject(gltf, "Guardian_1objcleanermaterialmergergles", 1, scale = [3.5, 3.5, 3.5]);
    nioMeshB.material.metalness = 0.0;
    nioMeshB.material.roughness = 0.8;
    scene.add(nioMeshB);

    // console.log(dumpObject(gltf.scene).join("\n"));
    // console.log(nioMeshB);
});
objectLoader.load("./models/sakura_tree/scene_low.gltf", (gltf) => {
    gltf.scene.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    gltf.scene.position.set(-32.4625, 0, -5.2);
    scene.add(gltf.scene);

    // console.log(dumpObject(gltf.scene).join("\n"));
    // console.log(gltf.scene);

    mixerA = new THREE.AnimationMixer(gltf.scene);
    gltf.animations[0].optimize();
    gltf.animations.forEach((clip) => {
        mixerA.clipAction(clip).play();
    });
});
objectLoader.load("./models/sakura_tree/scene_low.gltf", (gltf) => {
    gltf.scene.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    gltf.scene.position.set(32.4625, 0, -5.2);
    scene.add(gltf.scene);

    // console.log(dumpObject(gltf.scene).join("\n"));
    // console.log(gltf.scene);

    mixerB = new THREE.AnimationMixer(gltf.scene);
    gltf.animations[0].optimize();
    gltf.animations.forEach((clip) => {
        mixerB.clipAction(clip).play();
    });
});

function drawStoneWall() {
    if (wallMeshA && wallMeshB) {
        let idx = 0;
        for (let i = 0; i < wallAmountA; i++) {
            dummyObjectA.position.set(wallPositionA[idx][0], wallPositionA[idx][1], wallPositionA[idx][2]);
            dummyObjectA.rotation.x = Math.PI / 2 * -1;
            dummyObjectA.rotation.z = Math.PI / 2 * -1;
            dummyObjectA.updateMatrix();
            wallMeshA.setMatrixAt(idx, dummyObjectA.matrix);
            idx++;
        }
        wallMeshA.matrixAutoUpdate = false;
        wallMeshA.instanceMatrix.needsUpdate = false;

        idx = 0;
        for (let i = 0; i < wallAmountB; i++) {
            dummyObjectA.position.set(wallPositionB[idx][0], wallPositionB[idx][1], wallPositionB[idx][2]);
            dummyObjectA.rotation.x = Math.PI / 2 * -1;

            if (idx == 0) {
                dummyObjectA.rotation.z = Math.PI / 2;
            } else if (idx == 12 || idx == 48) {
                dummyObjectA.rotation.z = Math.PI / 2 * -1;
            } else if (idx == 24) {
                dummyObjectA.rotation.z = Math.PI;
            }

            dummyObjectA.updateMatrix();
            wallMeshB.setMatrixAt(idx, dummyObjectA.matrix);
            idx++;
        }
        wallMeshB.matrixAutoUpdate = false;
        wallMeshB.instanceMatrix.needsUpdate = false;
    }
}

function drawStoneLantern() {
    if (lanternMesh) {
        let idx = 0;
        for (let i = 0; i < lanternAmount; i++) {
            dummyObjectA.position.set(lanternPosition[idx][0], lanternPosition[idx][1], lanternPosition[idx][2]);
            dummyObjectA.rotation.x = Math.PI;
            dummyObjectA.rotation.z = Math.PI;
            dummyObjectA.updateMatrix();
            lanternMesh.setMatrixAt(idx, dummyObjectA.matrix);
            idx++;
        }
        lanternMesh.matrixAutoUpdate = false;
        lanternMesh.instanceMatrix.needsUpdate = false;
    }
}

function drawPavedFloor() {
    if (pavedMesh) {
        let idx = 0;
        for (let i = 0; i < pavedAmount; i++) {
            dummyObjectC.position.set(floorPosition[idx][0], floorPosition[idx][1], floorPosition[idx][2]);
            dummyObjectC.rotation.x = -Math.PI / 2;

            if (idx == 39) {
                dummyObjectC.rotation.z = -Math.PI / 2;
            } else if (idx == 47) {
                dummyObjectC.rotation.z = Math.PI / 2;
            } else if (idx == 63) {
                dummyObjectC.scale.y = 0.6745;
            }

            dummyObjectC.updateMatrix();
            pavedMesh.setMatrixAt(idx, dummyObjectC.matrix);
            idx++;
        }
        pavedMesh.matrixAutoUpdate = false;
        pavedMesh.instanceMatrix.needsUpdate = false;
    }
}

function drawBambooStraw() {
    if (bambooMesh) {
        let idx = 0;
        for (let i = 0; i < bambooPosition.length; i++) {
            dummyObjectA.position.set(bambooPosition[idx][0], bambooPosition[idx][1], bambooPosition[idx][2]);
            dummyObjectA.rotation.x = Math.PI / 2 * -1;
            dummyObjectA.rotation.z = Math.PI;

            if (idx >= 112 && idx <= 123) {
                dummyObjectA.rotation.x = 0;
                dummyObjectA.rotation.z = 0;

                if (idx >= 112 && idx <= 115) {
                    dummyObjectA.scale.z = 38.485;
                } else if (idx >= 116 && idx <= 119) {
                    dummyObjectA.scale.z = 15.45;
                } else {
                    dummyObjectA.scale.z = 15.79;
                }
            } else if (idx == 124) {
                dummyObjectA.rotation.y = Math.PI / 2;
                dummyObjectA.scale.z = 24.4;
            } else if (idx == 126) {
                dummyObjectA.scale.z = 11.1;
            } else if (idx == 130) {
                dummyObjectA.scale.z = 19.6;
            }

            dummyObjectA.updateMatrix();
            bambooMesh.setMatrixAt(idx, dummyObjectA.matrix);
            idx++;
        }
        bambooMesh.matrixAutoUpdate = false;
        bambooMesh.instanceMatrix.needsUpdate = false;
    }
}

function drawToriiGate() {
    if (gateMesh) {
        dummyObjectD.position.set(0, 4.5, 39);
        dummyObjectD.rotation.x = -Math.PI / 2 * 2;
        dummyObjectD.rotation.y = Math.PI * 2;
        dummyObjectD.rotation.z = Math.PI;
        dummyObjectD.updateMatrix();
        gateMesh.setMatrixAt(0, dummyObjectD.matrix);
        gateMesh.matrixAutoUpdate = false;
        gateMesh.instanceMatrix.needsUpdate = false;
    }
}

function drawGuardianNio() {
    if (nioMeshA && nioMeshB) {
        dummyObjectD.position.set(nioPosition[0], nioPosition[1], nioPosition[2]);
        dummyObjectD.rotation.x = 0;
        dummyObjectD.rotation.y = Math.PI * 2;
        dummyObjectD.rotation.z = Math.PI;
        dummyObjectD.updateMatrix();
        nioMeshA.setMatrixAt(0, dummyObjectD.matrix);
        nioMeshA.matrixAutoUpdate = false;
        nioMeshA.instanceMatrix.needsUpdate = false;

        dummyObjectD.position.set(nioPosition[0] * -1, nioPosition[1] - 0.1, nioPosition[2]);
        dummyObjectD.rotation.y = Math.PI;
        dummyObjectD.updateMatrix();
        nioMeshB.setMatrixAt(0, dummyObjectD.matrix);
        nioMeshB.matrixAutoUpdate = false;
        nioMeshB.instanceMatrix.needsUpdate = false;
    }
}

function drawButton() {
    if (buttonMesh) {
        let idx = 0;
        for (let i = 0; i < buttonAmount; i++) {
            dummyObjectB.position.set(buttonPosition[idx][0], buttonPosition[idx][1], buttonPosition[idx][2]);
            dummyObjectB.rotation.y = Math.PI / 2;
            dummyObjectB.updateMatrix();
            buttonMesh.setMatrixAt(idx, dummyObjectB.matrix);
            buttonMesh.setColorAt(idx, buttonColor.setHex(0x00ff00));
            idx++;
        }
        buttonMesh.matrixAutoUpdate = false;
        buttonMesh.instanceMatrix.needsUpdate = false;
    }
}

function drawLamps() {
    if (lampsMesh) {
        let idx = 0;
        for (let i = 0; i < lampsAmount; i++) {
            scaleLamps.position.set(lanternPosition[idx][0], clippedHeightPointLight, lanternPosition[idx][2]);
            scaleLamps.updateMatrix();
            lampsMesh.setMatrixAt(idx, scaleLamps.matrix);
            lampsMesh.setColorAt(idx, lampsColor.setHex(0xf04e03));
            idx++;
        }
        lampsMesh.matrixAutoUpdate = false;
        lampsMesh.instanceMatrix.needsUpdate = false;
    }
}

function setObjectPosition() {
    function setWallPosition() {
        // Temple 1
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

        // Temple 2
        wallPositionA.push([-16.45, clippedHeightWallA, -9.9]);
        wallPositionA.push([-11.75, clippedHeightWallA, -9.9]);
        wallPositionA.push([-7.05, clippedHeightWallA, -9.9]);
        wallPositionA.push([-2.35, clippedHeightWallA, -9.9]);
        wallPositionA.push([2.35, clippedHeightWallA, -9.9]);
        wallPositionA.push([7.05, clippedHeightWallA, -9.9]);
        wallPositionA.push([11.75, clippedHeightWallA, -9.9]);
        wallPositionA.push([16.45, clippedHeightWallA, -9.9]);
        wallPositionA.push([16.45, clippedHeightWallA, -14.6]);
        wallPositionA.push([16.45, clippedHeightWallA, -19.3]);
        wallPositionA.push([16.45, clippedHeightWallA, -24]);
        wallPositionA.push([16.45, clippedHeightWallA, -28.7]);
        wallPositionA.push([16.45, clippedHeightWallA, -33.4]);
        wallPositionA.push([-16.45, clippedHeightWallA, -38.1]);
        wallPositionA.push([-11.75, clippedHeightWallA, -38.1]);
        wallPositionA.push([-7.05, clippedHeightWallA, -38.1]);
        wallPositionA.push([-2.35, clippedHeightWallA, -38.1]);
        wallPositionA.push([2.35, clippedHeightWallA, -38.1]);
        wallPositionA.push([7.05, clippedHeightWallA, -38.1]);
        wallPositionA.push([11.75, clippedHeightWallA, -38.1]);
        wallPositionA.push([16.45, clippedHeightWallA, -38.1]);
        wallPositionA.push([-16.45, clippedHeightWallA, -14.6]);
        wallPositionA.push([-16.45, clippedHeightWallA, -19.3]);
        wallPositionA.push([-16.45, clippedHeightWallA, -24]);
        wallPositionA.push([-16.45, clippedHeightWallA, -28.7]);
        wallPositionA.push([-16.45, clippedHeightWallA, -33.4]);

        // Temple Left Side
        wallPositionB.push([-14.05, clippedHeightWallB, 27.7]);
        wallPositionB.push([-9.35, clippedHeightWallB, 27.7]);
        wallPositionB.push([-4.65, clippedHeightWallB, 27.7]);
        wallPositionB.push([-14.05, clippedHeightWallB, -0.5]);
        wallPositionB.push([-9.35, clippedHeightWallB, -0.5]);
        wallPositionB.push([-4.65, clippedHeightWallB, -0.5]);
        wallPositionB.push([-14.05, clippedHeightWallB, -9.9]);
        wallPositionB.push([-9.35, clippedHeightWallB, -9.9]);
        wallPositionB.push([-4.65, clippedHeightWallB, -9.9]);
        wallPositionB.push([-14.05, clippedHeightWallB, -38.1]);
        wallPositionB.push([-9.35, clippedHeightWallB, -38.1]);
        wallPositionB.push([-4.65, clippedHeightWallB, -38.1]);

        // Temple Right Side
        wallPositionB.push([14.05, clippedHeightWallB, 27.7]);
        wallPositionB.push([9.35, clippedHeightWallB, 27.7]);
        wallPositionB.push([4.65, clippedHeightWallB, 27.7]);
        wallPositionB.push([14.05, clippedHeightWallB, -0.5]);
        wallPositionB.push([9.35, clippedHeightWallB, -0.5]);
        wallPositionB.push([4.65, clippedHeightWallB, -0.5]);
        wallPositionB.push([14.05, clippedHeightWallB, -9.9]);
        wallPositionB.push([9.35, clippedHeightWallB, -9.9]);
        wallPositionB.push([4.65, clippedHeightWallB, -9.9]);
        wallPositionB.push([14.05, clippedHeightWallB, -38.1]);
        wallPositionB.push([9.35, clippedHeightWallB, -38.1]);
        wallPositionB.push([4.65, clippedHeightWallB, -38.1]);

        // Temple 1
        wallPositionB.push([16.45, clippedHeightWallB, 25.3]);
        wallPositionB.push([16.45, clippedHeightWallB, 20.6]);
        wallPositionB.push([16.45, clippedHeightWallB, 15.9]);
        wallPositionB.push([16.45, clippedHeightWallB, 11.2]);
        wallPositionB.push([16.45, clippedHeightWallB, 6.5]);
        wallPositionB.push([16.45, clippedHeightWallB, 1.8]);
        wallPositionB.push([-16.45, clippedHeightWallB, 25.3]);
        wallPositionB.push([-16.45, clippedHeightWallB, 20.6]);
        wallPositionB.push([-16.45, clippedHeightWallB, 15.9]);
        wallPositionB.push([-16.45, clippedHeightWallB, 11.2]);
        wallPositionB.push([-16.45, clippedHeightWallB, 6.5]);
        wallPositionB.push([-16.45, clippedHeightWallB, 1.8]);

        // Temple 2
        wallPositionB.push([16.45, clippedHeightWallB, -12.3]);
        wallPositionB.push([16.45, clippedHeightWallB, -17]);
        wallPositionB.push([16.45, clippedHeightWallB, -21.7]);
        wallPositionB.push([16.45, clippedHeightWallB, -26.4]);
        wallPositionB.push([16.45, clippedHeightWallB, -31.1]);
        wallPositionB.push([16.45, clippedHeightWallB, -35.8]);
        wallPositionB.push([-16.45, clippedHeightWallB, -12.3]);
        wallPositionB.push([-16.45, clippedHeightWallB, -17]);
        wallPositionB.push([-16.45, clippedHeightWallB, -21.7]);
        wallPositionB.push([-16.45, clippedHeightWallB, -26.4]);
        wallPositionB.push([-16.45, clippedHeightWallB, -31.1]);
        wallPositionB.push([-16.45, clippedHeightWallB, -35.8]);

        // Additional Fences
        wallPositionB.push([-0.05, clippedHeightWallB, -0.5]);
        wallPositionB.push([-0.05, clippedHeightWallB, -38.1]);
    }

    function setLanternPosition() {
        lanternPosition.push([-32.4625, clippedHeightLantern, -43.5925]);
        lanternPosition.push([32.4625, clippedHeightLantern, -43.5925]);
        lanternPosition.push([-32.4625, clippedHeightLantern, 32.4625]);
        lanternPosition.push([32.4625, clippedHeightLantern, 32.4625]);
    }

    function setFloorPosition() {
        // Vertical Temple 1
        floorPosition.push([0, clippedHeightFloor, 42.3875]);
        floorPosition.push([0, clippedHeightFloor, 37.425]);
        floorPosition.push([0, clippedHeightFloor, 32.4625]);
        floorPosition.push([0, clippedHeightFloor, 27.5]);

        // Vertical Right
        floorPosition.push([23.1985, clippedHeightFloor, 31.6445]);
        floorPosition.push([23.1985, clippedHeightFloor, 26.682]);
        floorPosition.push([23.1985, clippedHeightFloor, 21.7195]);
        floorPosition.push([23.1985, clippedHeightFloor, 16.757]);
        floorPosition.push([23.1985, clippedHeightFloor, 11.7945]);
        floorPosition.push([23.1985, clippedHeightFloor, 6.832]);
        floorPosition.push([23.1985, clippedHeightFloor, 1.8695]);
        floorPosition.push([23.1985, clippedHeightFloor, -3.093]);
        floorPosition.push([23.1985, clippedHeightFloor, -8.0555]);
        floorPosition.push([23.1985, clippedHeightFloor, -13.018]);
        floorPosition.push([23.1985, clippedHeightFloor, -17.9805]);
        floorPosition.push([23.1985, clippedHeightFloor, -22.943]);
        floorPosition.push([23.1985, clippedHeightFloor, -27.9055]);
        floorPosition.push([23.1985, clippedHeightFloor, -32.868]);
        floorPosition.push([23.1985, clippedHeightFloor, -37.8305]);
        floorPosition.push([23.1985, clippedHeightFloor, -42.793]);

        // Vertical Temple 2
        floorPosition.push([0, clippedHeightFloor, -6.0175]);
        floorPosition.push([0, clippedHeightFloor, -10.98]);
        floorPosition.push([0, clippedHeightFloor, -15.9425]);

        // Vertical Left
        floorPosition.push([-23.1975, clippedHeightFloor, 31.6445]);
        floorPosition.push([-23.1975, clippedHeightFloor, 26.682]);
        floorPosition.push([-23.1975, clippedHeightFloor, 21.7195]);
        floorPosition.push([-23.1975, clippedHeightFloor, 16.757]);
        floorPosition.push([-23.1975, clippedHeightFloor, 11.7945]);
        floorPosition.push([-23.1975, clippedHeightFloor, 6.832]);
        floorPosition.push([-23.1975, clippedHeightFloor, 1.8695]);
        floorPosition.push([-23.1975, clippedHeightFloor, -3.093]);
        floorPosition.push([-23.1975, clippedHeightFloor, -8.0555]);
        floorPosition.push([-23.1975, clippedHeightFloor, -13.018]);
        floorPosition.push([-23.1975, clippedHeightFloor, -17.9805]);
        floorPosition.push([-23.1975, clippedHeightFloor, -22.943]);
        floorPosition.push([-23.1975, clippedHeightFloor, -27.9055]);
        floorPosition.push([-23.1975, clippedHeightFloor, -32.868]);
        floorPosition.push([-23.1975, clippedHeightFloor, -37.8305]);
        floorPosition.push([-23.1975, clippedHeightFloor, -42.793]);

        // Horizontal Right
        floorPosition.push([4.165, clippedHeightFloor, 32.445]);
        floorPosition.push([9.1275, clippedHeightFloor, 32.445]);
        floorPosition.push([14.09, clippedHeightFloor, 32.445]);
        floorPosition.push([19.0525, clippedHeightFloor, 32.445]);
        floorPosition.push([4.165, clippedHeightFloor, -5.2175]);
        floorPosition.push([9.1275, clippedHeightFloor, -5.2175]);
        floorPosition.push([14.09, clippedHeightFloor, -5.2175]);
        floorPosition.push([19.0525, clippedHeightFloor, -5.2175]);

        // Horizontal Left
        floorPosition.push([-4.1475, clippedHeightFloor, 32.4625]);
        floorPosition.push([-9.11, clippedHeightFloor, 32.4625]);
        floorPosition.push([-14.0725, clippedHeightFloor, 32.4625]);
        floorPosition.push([-19.035, clippedHeightFloor, 32.4625]);
        floorPosition.push([-4.1475, clippedHeightFloor, -5.2]);
        floorPosition.push([-9.11, clippedHeightFloor, -5.2]);
        floorPosition.push([-14.0725, clippedHeightFloor, -5.2]);
        floorPosition.push([-19.035, clippedHeightFloor, -5.2]);

        // Horizontal Rear
        floorPosition.push([4.165, clippedHeightFloor, -43.593]);
        floorPosition.push([9.1275, clippedHeightFloor, -43.593]);
        floorPosition.push([14.09, clippedHeightFloor, -43.593]);
        floorPosition.push([19.0525, clippedHeightFloor, -43.593]);
        floorPosition.push([-4.1475, clippedHeightFloor, -43.593]);
        floorPosition.push([-9.11, clippedHeightFloor, -43.593]);
        floorPosition.push([-14.0725, clippedHeightFloor, -43.593]);
        floorPosition.push([-19.035, clippedHeightFloor, -43.593]);

        // Scaled Floor
        floorPosition.push([0.0089, clippedHeightFloor, -43.593]);
    }

    function setBambooPosition() {
        // Bamboo Temple 1
        bambooPosition.push([-20.635, clippedHeightBambooA, 29.9]);
        bambooPosition.push([-16.45, clippedHeightBambooA, 29.9]);
        bambooPosition.push([-11.75, clippedHeightBambooA, 29.9]);
        bambooPosition.push([-7.05, clippedHeightBambooA, 29.9]);
        bambooPosition.push([-2.35, clippedHeightBambooA, 29.9]);
        bambooPosition.push([2.35, clippedHeightBambooA, 29.9]);
        bambooPosition.push([7.05, clippedHeightBambooA, 29.9]);
        bambooPosition.push([11.75, clippedHeightBambooA, 29.9]);
        bambooPosition.push([16.45, clippedHeightBambooA, 29.9]);
        bambooPosition.push([20.635, clippedHeightBambooA, 29.9]);
        bambooPosition.push([20.635, clippedHeightBambooA, 24.4725]);
        bambooPosition.push([20.635, clippedHeightBambooA, 19.045]);
        bambooPosition.push([20.635, clippedHeightBambooA, 13.6175]);
        bambooPosition.push([20.635, clippedHeightBambooA, 8.19]);
        bambooPosition.push([20.635, clippedHeightBambooA, 2.7625]);
        bambooPosition.push([-20.635, clippedHeightBambooA, -2.665]);
        bambooPosition.push([-16.45, clippedHeightBambooA, -2.665]);
        bambooPosition.push([-11.75, clippedHeightBambooA, -2.665]);
        bambooPosition.push([-7.05, clippedHeightBambooA, -2.665]);
        bambooPosition.push([-2.35, clippedHeightBambooA, -2.665]);
        bambooPosition.push([2.35, clippedHeightBambooA, -2.665]);
        bambooPosition.push([7.05, clippedHeightBambooA, -2.665]);
        bambooPosition.push([11.75, clippedHeightBambooA, -2.665]);
        bambooPosition.push([16.45, clippedHeightBambooA, -2.665]);
        bambooPosition.push([20.635, clippedHeightBambooA, -2.665]);
        bambooPosition.push([-20.635, clippedHeightBambooA, 24.4725]);
        bambooPosition.push([-20.635, clippedHeightBambooA, 19.045]);
        bambooPosition.push([-20.635, clippedHeightBambooA, 13.6175]);
        bambooPosition.push([-20.635, clippedHeightBambooA, 8.19]);
        bambooPosition.push([-20.635, clippedHeightBambooA, 2.7625]);

        // Bamboo Temple 2
        bambooPosition.push([-20.635, clippedHeightBambooA, -7.76]);
        bambooPosition.push([-16.45, clippedHeightBambooA, -7.76]);
        bambooPosition.push([-11.75, clippedHeightBambooA, -7.76]);
        bambooPosition.push([-7.05, clippedHeightBambooA, -7.76]);
        bambooPosition.push([-2.35, clippedHeightBambooA, -7.76]);
        bambooPosition.push([2.35, clippedHeightBambooA, -7.76]);
        bambooPosition.push([7.05, clippedHeightBambooA, -7.76]);
        bambooPosition.push([11.75, clippedHeightBambooA, -7.76]);
        bambooPosition.push([16.45, clippedHeightBambooA, -7.76]);
        bambooPosition.push([20.635, clippedHeightBambooA, -7.76]);
        bambooPosition.push([20.635, clippedHeightBambooA, -13.3083]);
        bambooPosition.push([20.635, clippedHeightBambooA, -18.8566]);
        bambooPosition.push([20.635, clippedHeightBambooA, -24.4049]);
        bambooPosition.push([20.635, clippedHeightBambooA, -29.9532]);
        bambooPosition.push([20.635, clippedHeightBambooA, -35.5015]);
        bambooPosition.push([-20.635, clippedHeightBambooA, -41.05]);
        bambooPosition.push([-16.45, clippedHeightBambooA, -41.05]);
        bambooPosition.push([-11.75, clippedHeightBambooA, -41.05]);
        bambooPosition.push([-7.05, clippedHeightBambooA, -41.05]);
        bambooPosition.push([-2.35, clippedHeightBambooA, -41.05]);
        bambooPosition.push([2.35, clippedHeightBambooA, -41.05]);
        bambooPosition.push([7.05, clippedHeightBambooA, -41.05]);
        bambooPosition.push([11.75, clippedHeightBambooA, -41.05]);
        bambooPosition.push([16.45, clippedHeightBambooA, -41.05]);
        bambooPosition.push([20.635, clippedHeightBambooA, -41.05]);
        bambooPosition.push([-20.635, clippedHeightBambooA, -13.3083]);
        bambooPosition.push([-20.635, clippedHeightBambooA, -18.8566]);
        bambooPosition.push([-20.635, clippedHeightBambooA, -24.4049]);
        bambooPosition.push([-20.635, clippedHeightBambooA, -29.9532]);
        bambooPosition.push([-20.635, clippedHeightBambooA, -35.5015]);

        // Bamboo Outline
        bambooPosition.push([-25.73, clippedHeightBambooA, 35]);
        bambooPosition.push([-20.635, clippedHeightBambooA, 35]);
        bambooPosition.push([-16.45, clippedHeightBambooA, 35]);
        bambooPosition.push([-11.75, clippedHeightBambooA, 35]);
        bambooPosition.push([-7.05, clippedHeightBambooA, 35]);
        bambooPosition.push([-2.35, clippedHeightBambooA, 35]);
        bambooPosition.push([2.35, clippedHeightBambooA, 35]);
        bambooPosition.push([7.05, clippedHeightBambooA, 35]);
        bambooPosition.push([11.75, clippedHeightBambooA, 35]);
        bambooPosition.push([16.45, clippedHeightBambooA, 35]);
        bambooPosition.push([20.635, clippedHeightBambooA, 35]);
        bambooPosition.push([25.73, clippedHeightBambooA, 35]);
        bambooPosition.push([25.73, clippedHeightBambooA, 29.9]);
        bambooPosition.push([25.73, clippedHeightBambooA, 24.4725]);
        bambooPosition.push([25.73, clippedHeightBambooA, 19.045]);
        bambooPosition.push([25.73, clippedHeightBambooA, 13.6175]);
        bambooPosition.push([25.73, clippedHeightBambooA, 8.19]);
        bambooPosition.push([25.73, clippedHeightBambooA, 2.7625]);
        bambooPosition.push([25.73, clippedHeightBambooA, -2.665]);
        bambooPosition.push([25.73, clippedHeightBambooA, -7.76]);
        bambooPosition.push([25.73, clippedHeightBambooA, -13.3083]);
        bambooPosition.push([25.73, clippedHeightBambooA, -18.8566]);
        bambooPosition.push([25.73, clippedHeightBambooA, -24.4049]);
        bambooPosition.push([25.73, clippedHeightBambooA, -29.9532]);
        bambooPosition.push([25.73, clippedHeightBambooA, -35.5015]);
        bambooPosition.push([25.73, clippedHeightBambooA, -41.05]);
        bambooPosition.push([-25.73, clippedHeightBambooA, -46.15]);
        bambooPosition.push([-20.635, clippedHeightBambooA, -46.15]);
        bambooPosition.push([-16.45, clippedHeightBambooA, -46.15]);
        bambooPosition.push([-11.75, clippedHeightBambooA, -46.15]);
        bambooPosition.push([-7.05, clippedHeightBambooA, -46.15]);
        bambooPosition.push([-2.35, clippedHeightBambooA, -46.15]);
        bambooPosition.push([2.35, clippedHeightBambooA, -46.15]);
        bambooPosition.push([7.05, clippedHeightBambooA, -46.15]);
        bambooPosition.push([11.75, clippedHeightBambooA, -46.15]);
        bambooPosition.push([16.45, clippedHeightBambooA, -46.15]);
        bambooPosition.push([20.635, clippedHeightBambooA, -46.15]);
        bambooPosition.push([25.73, clippedHeightBambooA, -46.15]);
        bambooPosition.push([-25.73, clippedHeightBambooA, 29.9]);
        bambooPosition.push([-25.73, clippedHeightBambooA, 24.4725]);
        bambooPosition.push([-25.73, clippedHeightBambooA, 19.045]);
        bambooPosition.push([-25.73, clippedHeightBambooA, 13.6175]);
        bambooPosition.push([-25.73, clippedHeightBambooA, 8.19]);
        bambooPosition.push([-25.73, clippedHeightBambooA, 2.7625]);
        bambooPosition.push([-25.73, clippedHeightBambooA, -2.665]);
        bambooPosition.push([-25.73, clippedHeightBambooA, -7.76]);
        bambooPosition.push([-25.73, clippedHeightBambooA, -13.3083]);
        bambooPosition.push([-25.73, clippedHeightBambooA, -18.8566]);
        bambooPosition.push([-25.73, clippedHeightBambooA, -24.4049]);
        bambooPosition.push([-25.73, clippedHeightBambooA, -29.9532]);
        bambooPosition.push([-25.73, clippedHeightBambooA, -35.5015]);
        bambooPosition.push([-25.73, clippedHeightBambooA, -41.05]);

        // Static Vertical
        bambooPosition.push([25.73, clippedHeightBambooB, -44.243]);
        bambooPosition.push([25.73, clippedHeightBambooC, -44.243]);
        bambooPosition.push([-25.73, clippedHeightBambooB, -44.243]);
        bambooPosition.push([-25.73, clippedHeightBambooC, -44.243]);
        bambooPosition.push([20.635, clippedHeightBambooB, -1.905]);
        bambooPosition.push([20.635, clippedHeightBambooC, -1.905]);
        bambooPosition.push([-20.635, clippedHeightBambooB, -1.905]);
        bambooPosition.push([-20.635, clippedHeightBambooC, -1.905]);
        bambooPosition.push([20.635, clippedHeightBambooB, -40.27]);
        bambooPosition.push([20.635, clippedHeightBambooC, -40.27]);
        bambooPosition.push([-20.635, clippedHeightBambooB, -40.27]);
        bambooPosition.push([-20.635, clippedHeightBambooC, -40.27]);

        // Static Horizontal
        bambooPosition.push([-24.52, clippedHeightBambooB, -46.15]);
        bambooPosition.push([-24.52, clippedHeightBambooC, -46.15]);
        bambooPosition.push([-25.195, clippedHeightBambooB, 35]);
        bambooPosition.push([-25.195, clippedHeightBambooC, 35]);
        bambooPosition.push([2.885, clippedHeightBambooB, 35]);
        bambooPosition.push([2.885, clippedHeightBambooC, 35]);
        bambooPosition.push([-19.695, clippedHeightBambooB, -2.665]);
        bambooPosition.push([-19.695, clippedHeightBambooC, -2.665]);
        bambooPosition.push([-19.695, clippedHeightBambooB, -41.05]);
        bambooPosition.push([-19.695, clippedHeightBambooC, -41.05]);
        bambooPosition.push([-19.695, clippedHeightBambooB, 29.9]);
        bambooPosition.push([-19.695, clippedHeightBambooC, 29.9]);
        bambooPosition.push([-19.695, clippedHeightBambooB, -7.76]);
        bambooPosition.push([-19.695, clippedHeightBambooC, -7.76]);
    }

    function setButtonPosition() {
        buttonPosition.push([-24.1975, 4.45, 40.3]);
        buttonPosition.push([-22.1975, 4.45, 40.3]);
        buttonPosition.push([-24.1975, 3.95, 40.3]);
        buttonPosition.push([-22.1975, 3.95, 40.3]);
        buttonPosition.push([-22.1975, 3, 40.3]);
    }

    setWallPosition();
    setLanternPosition();
    setFloorPosition();
    setBambooPosition();
    setButtonPosition();
}

setObjectPosition();

const pointLight1 = new THREE.PointLight(lanternColor, lightIntensity);
pointLight1.position.set(lanternPosition[0][0], clippedHeightPointLight, lanternPosition[0][2]);
pointLight1.castShadow = true;
pointLight1.shadow.autoUpdate = false;
pointLight1.shadow.needsUpdate = true;
pointLight1.shadow.bias = -0.01;
// pointLight1.shadow.camera.far = 100;
// pointLight1.shadow.camera.near = 50;
pointLight1.shadow.radius = lightRadius;
pointLight1.name = "Lamp 1";
pointLight1.visible = true;

const pointLight2 = new THREE.PointLight(lanternColor, lightIntensity);
pointLight2.position.set(lanternPosition[1][0], clippedHeightPointLight, lanternPosition[1][2]);
pointLight2.castShadow = true;
pointLight2.shadow.autoUpdate = false;
pointLight2.shadow.needsUpdate = true;
pointLight2.shadow.bias = -0.01;
// pointLight2.shadow.camera.far = 100;
// pointLight2.shadow.camera.near = 50;
pointLight2.shadow.radius = lightRadius;
pointLight2.name = "Lamp 2";
pointLight2.visible = true;

const pointLight3 = new THREE.PointLight(lanternColor, lightIntensity);
pointLight3.position.set(lanternPosition[2][0], clippedHeightPointLight, lanternPosition[2][2]);
pointLight3.castShadow = true;
pointLight3.shadow.autoUpdate = false;
pointLight3.shadow.needsUpdate = true;
pointLight3.shadow.bias = -0.01;
// pointLight3.shadow.camera.far = 100;
// pointLight3.shadow.camera.near = 50;
pointLight3.shadow.radius = lightRadius;
pointLight3.name = "Lamp 3";
pointLight3.visible = true;

const pointLight4 = new THREE.PointLight(lanternColor, lightIntensity);
pointLight4.position.set(lanternPosition[3][0], clippedHeightPointLight, lanternPosition[3][2]);
pointLight4.castShadow = true;
pointLight4.shadow.autoUpdate = false;
pointLight4.shadow.needsUpdate = true;
pointLight4.shadow.bias = -0.01;
// pointLight4.shadow.camera.far = 100;
// pointLight4.shadow.camera.near = 50;
pointLight4.shadow.radius = lightRadius;
pointLight4.name = "Lamp 4";
pointLight4.visible = true;

const pointLightGroup = new THREE.Group();
pointLightGroup.add(pointLight1);
pointLightGroup.add(pointLight2);
pointLightGroup.add(pointLight3);
pointLightGroup.add(pointLight4);
scene.add(pointLightGroup);

const spotlight = new THREE.SpotLight(0x994a0e, 8, 125, Math.PI / 4);
spotlight.target.position.set(0, 0, 0);
spotlight.position.set(0, 80, 0);
spotlight.castShadow = true;
spotlight.shadow.bias = -0.003;
spotlight.shadow.camera.far = 50;
spotlight.shadow.camera.fov = 30;
spotlight.shadow.camera.near = 25;
spotlight.shadow.mapSize.width = 2048;
spotlight.shadow.mapSize.height = 2048;
spotlight.add(new THREE.Mesh(
    new THREE.SphereGeometry(4, 32, 32),
    new THREE.MeshBasicMaterial({
        color: 0xd15e06,
    })
));
scene.add(spotlight);

/**
 * Because InstancedBufferAttribute stands differently for each instance, draw calls for this Mesh
   should be called only once (the first time renderer runs) so it doesn't replace any other instance
   with new attribute (happened when updating matrix).
 */
drawButton();
drawLamps();

window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
window.addEventListener("click", (e) => {
    e.preventDefault();

    if (startWebGL) {
        if (cameraControls == false) {
            mousePointer.x = ((window.innerWidth / 2) / window.innerWidth) * 2 - 1;
            mousePointer.y = -((window.innerHeight / 2) / window.innerHeight) * 2 + 1;
        } else {
            mousePointer.x = (e.clientX / window.innerWidth) * 2 - 1;
            mousePointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
        }

        raycaster.setFromCamera(mousePointer, camera);
        const intersects = raycaster.intersectObject(buttonMesh);

        if (intersects.length > 0) {
            const buttonID = intersects[0].instanceId;

            if (buttonID >= 0 && buttonID <= 3) {
                if (lampsVisible[buttonID] == true) {
                    pointLightGroup.children[buttonID].intensity = 0;
                    buttonMesh.setColorAt(buttonID, buttonColor.setHex(0xff0000));
                    scaleLamps.position.set(lanternPosition[buttonID][0], lanternPosition[buttonID][1], lanternPosition[buttonID][2]);
                } else {
                    pointLightGroup.children[buttonID].intensity = lightIntensity;
                    buttonMesh.setColorAt(buttonID, buttonColor.setHex(0x00ff00));
                    scaleLamps.position.set(lanternPosition[buttonID][0], clippedHeightPointLight, lanternPosition[buttonID][2]);
                }

                lampsVisible[buttonID] = !lampsVisible[buttonID];
                scaleLamps.updateMatrix();
                lampsMesh.setMatrixAt(buttonID, scaleLamps.matrix);
            } else {
                if (cameraControls == true) {
                    fpsControls.lock();
                    dot.style.display = "block";
                    detail.innerHTML = "<u>" + controlsCommand[0] + "</u>\r\n" + controlsCommand[1] + "\r\n" + controlsCommand[2] + "\r\n" + controlsCommand[3] + "\r\n" + controlsCommand[4];
                    buttonMesh.setColorAt(buttonID, buttonColor.setHex(0x00ff00));
                } else {
                    orbitControls.target.set(0, 4.15, -5.25);
                    console.log(orbitControls);
                    fpsControls.unlock();
                    dot.removeAttribute("style");
                    detail.innerHTML = "<u>" + controlsCommand[5] + "</u>\r\n" + controlsCommand[6] + "\r\n" + controlsCommand[7] + "\r\n" + controlsCommand[8] + "\r\n" + controlsCommand[9];
                    buttonMesh.setColorAt(buttonID, buttonColor.setHex(0xff0000));
                }

                cameraControls = !cameraControls;
                orbitControls.enabled = !orbitControls.enabled;
            }

            buttonMesh.instanceColor.needsUpdate = true;
            lampsMesh.instanceMatrix.needsUpdate = true;
        }
    }
});
document.body.addEventListener("keydown", (e) => {
    switch (e.keyCode) {
        case 38: // UP
        case 87: // W
            moveForward = true;
            break;
        case 37: // LEFT
        case 65: // A
            moveLeft = true;
            break;
        case 40: // DOWN
        case 83: // S
            moveBackward = true;
            break;
        case 39: // RIGHT
        case 68: // D
            moveRight = true;
            break;
    }
}, false);
document.body.addEventListener("keyup", (e) => {
    switch (e.keyCode) {
        case 38: // UP
        case 87: // W
            moveForward = false;
            break;
        case 37: // LEFT
        case 65: // A
            moveLeft = false;
            break;
        case 40: // DOWN
        case 83: // S
            moveBackward = false;
            break;
        case 39: // RIGHT
        case 68: // D
            moveRight = false;
            break;
    }
}, false);
document.body.addEventListener("keypress", (e) => {
    if (e.key == "T" || e.key == "t") {
        if (hideOverlay[0] == false && hideOverlay[1] == false && hideOverlay[2] == false) {
            document.getElementById("fpsGraph").setAttribute("class", "hideFPS");
            document.getElementById("rendererStats").style.display = "none";
            document.getElementById("controlsDetail").style.display = "none";

            hideOverlay[0] = true;
            hideOverlay[1] = true;
            hideOverlay[2] = true;
        } else {
            document.getElementById("fpsGraph").removeAttribute("class");
            document.getElementById("rendererStats").removeAttribute("style");
            document.getElementById("controlsDetail").removeAttribute("style");

            hideOverlay[0] = false;
            hideOverlay[1] = false;
            hideOverlay[2] = false;
        }
    } else if (e.key == "1") {
        if (hideOverlay[0] == true) {
            document.getElementById("fpsGraph").removeAttribute("class");
        } else {
            document.getElementById("fpsGraph").setAttribute("class", "hideFPS");
        }

        hideOverlay[0] = !hideOverlay[0];
    } else if (e.key == "2") {
        if (hideOverlay[1] == true) {
            document.getElementById("rendererStats").removeAttribute("style");
        } else {
            document.getElementById("rendererStats").style.display = "none";
        }

        hideOverlay[1] = !hideOverlay[1];
    } else if (e.key == "3") {
        if (hideOverlay[2] == true) {
            document.getElementById("controlsDetail").removeAttribute("style");
        } else {
            document.getElementById("controlsDetail").style.display = "none";
        }

        hideOverlay[2] = !hideOverlay[2];
    }
}, false);

function animateScene() {
    if (startWebGL) {
        if (fpsControls.isLocked === true) {
            time = performance.now();
            delta = (time - prevTime) / 1000;

            velocity.x -= velocity.x * 10.0 * delta;
            velocity.z -= velocity.z * 10.0 * delta;

            direction.x = Number(moveLeft) - Number(moveRight);
            direction.z = Number(moveForward) - Number(moveBackward);
            direction.normalize(); // This ensures consistent movements in all directions

            if (moveLeft || moveRight) velocity.x -= direction.x * cameraSpeed * delta;
            if (moveForward || moveBackward) velocity.z -= direction.z * cameraSpeed * delta;

            fpsControls.getObject().translateX(velocity.x * delta);
            fpsControls.getObject().translateZ(velocity.z * delta);

            prevTime = time;
        }
    }

    ctrTimeDay++;

    if (ctrTimeDay % 12 == 0) {
        if (ctrDay == 0) {
            if (fogRedColor - redColorSample >= 0) {
                fogRedColor -= redColorSample;
            }
            if (fogGreenColor - greenColorSample >= 0) {
                fogGreenColor -= greenColorSample;
            }
            if (fogBlueColor - blueColorSample >= 0) {
                fogBlueColor -= blueColorSample;
            }
        } else {
            if (fogRedColor + redColorSample <= 216) {
                fogRedColor += redColorSample;
            }
            if (fogGreenColor + greenColorSample <= 183) {
                fogGreenColor += greenColorSample;
            }
            if (fogBlueColor + blueColorSample <= 140) {
                fogBlueColor += blueColorSample;
            }
        }

        if (fogRedColor == 0 && fogGreenColor == 0 && fogBlueColor == 0) {
            ctrDay = 1;

            for (let i = 0; i < lampsVisible.length; i++) {
                if (lampsVisible[i] == true) {
                    pointLightGroup.children[i].intensity = 0;
                    scaleLamps.position.set(lanternPosition[i][0], lanternPosition[i][1], lanternPosition[i][2]);
                    scaleLamps.updateMatrix();
                    lampsMesh.setMatrixAt(i, scaleLamps.matrix);
                }
            }

            lampsMesh.instanceMatrix.needsUpdate = true;
        } else if (fogRedColor == 216 && fogGreenColor == 183 && fogBlueColor == 140) {
            ctrDay = 0;

            for (let i = 0; i < lampsVisible.length; i++) {
                if (lampsVisible[i] == true) {
                    pointLightGroup.children[i].intensity = lightIntensity;
                    scaleLamps.position.set(lanternPosition[i][0], clippedHeightPointLight, lanternPosition[i][2]);
                    scaleLamps.updateMatrix();
                    lampsMesh.setMatrixAt(i, scaleLamps.matrix);
                }
            }

            lampsMesh.instanceMatrix.needsUpdate = true;
        }

        fogColor = new THREE.Color("rgb(" + fogRedColor + ", " + fogGreenColor + ", " + fogBlueColor + ")");
        scene.background = fogColor;
        scene.fog = new THREE.FogExp2(fogColor, fogDensity);
        ctrTimeDay = 0;
    }

    // if (ctrDay == 300) {
    //     fogColor = 0xd8b88d;
    //     scene.background = fogColor;
    //     scene.fog = new THREE.FogExp2(fogColor, fogDensity);
    // } else if (ctrDay == 600) {
    //     ctrDay = 0;
    //     fogColor = 0x000000;
    //     scene.background = fogColor;
    //     scene.fog = null;
    // }

    date = Date.now() * 0.0005;
    delta = clock.getDelta();

    if (mixerA && mixerB) {
        mixerA.update(delta);
        mixerB.update(delta);
    }

    // Change SpotLight Position
    spotlight.position.x = Math.cos(date) * borderRadius;
    spotlight.position.z = Math.sin(date) * borderRadius;
    spotlight.rotation.x += 0.00001;
    spotlight.target.position.set(0, 0, 0);
    // orbitControls.update();

    // Montage Rotation
    // scene.rotation.y += 0.005;

    requestAnimationFrame(animateScene);
    drawStoneWall();
    drawStoneLantern();
    drawPavedFloor();
    drawBambooStraw();
    drawToriiGate();
    drawGuardianNio();

    renderer.render(scene, camera);
    rendererStats.update(renderer);
}
