var scene = new THREE.Scene();
var renderer = new THREE.WebGL1Renderer({
    antialias: false // Should be true
});
var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
var mesh = null;

// basic stuff
function initThree() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setClearColor(0x161216);
    camera.position.y = 4;
    camera.position.z = 50;
    document.body.appendChild(renderer.domElement);
}

function softenShadowMap() {
    renderer.shadowMap.enabled = false; // Should be true
    renderer.shadowMapSoft = false; // should be true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
}

function resize() {
    renderer.height = window.innerHeight;
    renderer.width = window.innerWidth;
    renderer.setSize(renderer.width, renderer.height);
    camera.aspect = renderer.width / renderer.height;
    camera.updateProjectionMatrix();
}

var mesh = null;
var dummy = new THREE.Object3D();
var sectionWidth = 200;

function addInstancedMesh() {
    // An InstancedMesh of 4 cubes
    mesh = new THREE.InstancedMesh(new THREE.BoxBufferGeometry(50, 50, 50), new THREE.MeshNormalMaterial(), 4);
    scene.add(mesh);
    setInstancedMeshPositions(mesh);
}

function setInstancedMeshPositions(mesh) {
    for (var i = 0; i < mesh.count; i++) {
        // we add 200 units of distance (the width of the section) between each.
        var xStaticPosition = -sectionWidth * (i - 1)
        dummy.position.set(xStaticPosition, 0, 0);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
}

function load_test() {
    let stemMesh, blossomMesh;
    let stemGeometry, blossomGeometry;
    let stemMaterial, blossomMaterial;
    const api = {
        count: 2000,
        distribution: 'random',
        // resample: resample,
        surfaceColor: 0xFFF784,
        backgroundColor: 0xE39469,
    };
    const count = api.count;
    const loader = new THREE.GLTFLoader();

    loader.load('./models/modular_concrete_fence/scene3.gltf', function (gltf) {
        const _stemMesh = gltf.scene.getObjectByName('Cube');
        const _blossomMesh = gltf.scene.getObjectByName('Cube001');

        stemGeometry = _stemMesh.geometry.clone();
        blossomGeometry = _blossomMesh.geometry.clone();

        const defaultTransform = new THREE.Matrix4()
            .makeRotationX(Math.PI)
            .multiply(new THREE.Matrix4().makeScale(7, 7, 7));

        stemGeometry.applyMatrix4(defaultTransform);
        blossomGeometry.applyMatrix4(defaultTransform);

        stemMaterial = _stemMesh.material;
        blossomMaterial = _blossomMesh.material;

        stemMesh = new THREE.InstancedMesh(stemGeometry, stemMaterial, count);
        blossomMesh = new THREE.InstancedMesh(blossomGeometry, blossomMaterial, count);

        // Assign random colors to the blossoms.
        // const color = new THREE.Color();
        // const blossomPalette = [0xF20587, 0xF2D479, 0xF2C879, 0xF2B077, 0xF24405];

        // for (let i = 0; i < count; i++) {

            // color.setHex(blossomPalette[Math.floor(Math.random() * blossomPalette.length)]);
            // blossomMesh.setColorAt(i, color);

        // }

        // Instance matrices will be updated every frame.
        stemMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        blossomMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

        // resample();

        // init();
        animate();
    });

}

function render() {
    renderer.render(scene, camera);
}

// LOOP
// function setInstancedMeshPositions(mesh, section) {
//     for (var i = 0; i < mesh.count; i++) {
//         var xStaticPosition = -sectionWidth * (i - 1);
//         var xSectionPosition = sectionWidth * section;
//         var x = xStaticPosition + xSectionPosition;
//         dummy.position.set(x, 0, 0);
//         dummy.updateMatrix();
//         mesh.setMatrixAt(i, dummy.matrix);
//     }
//     mesh.instanceMatrix.needsUpdate = true;
// }

// function loopFunction() {
//     var distance = Math.round(camera.position.x / sectionWidth)
//     if (distance !== this.loopSectionPosition) {
//         loopSectionPosition = distance
//         setInstancedMeshPositions(mesh, loopSectionPosition)
//     }
// }

// function render() {
//     // move the camera
//     camera.position.x += 5.
//     loopFunction()
//     renderer.render(scene, camera)
// }

function animate() {
    // render the 3D scene
    requestAnimationFrame(animate);
    render();
}

// Call the three scene initialisation, attach the resize event and start the animation requestAnimationFrame.
function init() {
    initThree();
    softenShadowMap();
    resize();
    scene.background = new THREE.Color(0xc6af84);
    window.addEventListener("resize", resize, {
        passive: true
    });
    // addInstancedMesh();
    load_test();
    animate();
}

init();