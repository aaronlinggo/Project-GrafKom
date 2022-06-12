
var scene = new THREE.Scene();

var cam = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 100);

var renderer = new THREE.WebGL1Renderer();

var box = new THREE.BoxGeometry(1,1,1);
var boxMat = new THREE.MeshBasicMaterial({color:0x00ff00});
var boxMesh = new THREE.Mesh(box, boxMat);

scene.add(boxMesh);
cam.position.z = 5;

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

window.addEventListener('resize', function(){
    renderer.setSize(window.innerWidth, window.innerHeight);
    cam.aspect = window.innerWidth / window.innerHeight;
    cam.updateProjectionMatrix();
})

function draw(){
    requestAnimationFrame(draw);
    boxMesh.rotation.y += 0.01;
    renderer.render(scene, cam);
}

draw();