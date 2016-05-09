
// scene, camera, rendering setup
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
var renderer = new THREE.WebGLRenderer();
// Create VRControls in addition to FirstPersonVRControls.
var vrControls = new THREE.VRControls(camera);
var fpVrControls = new THREE.FirstPersonVRControls(camera, scene);
var effect = new THREE.VREffect(renderer);
effect.setSize(window.innerWidth, window.innerHeight);

renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var light = new THREE.AmbientLight( 0xffffff );
scene.add( light );
camera.position.z = 20;
var plz_wrk;

var loader = new THREE.PLYLoader();

// ------------ Point cloud rendering---------------------
//loader.addEventListener('load', function (event) {
//    var geometry = event.content;
//
//    var material = new THREE.PointsMaterial({ vertexColors: true, size: 0.004 });
//    var mesh = new THREE.Points(geometry, material);
//    scene.add(mesh);
//    plz_wrk = mesh;
//    plz_wrk.rotation.x += -Math.PI / 2;
//    plz_wrk.rotation.z += Math.PI + .3;
//    plz_wrk.rotation.y += Math.PI;
//});
//loader.load("../src/models/gateslab3.ply");
//-------------------------------------------------------

//--------------PLY mesh rendering----------------------

//loader.load( "../src/models/gateslab3.ply", function ( geometry ) {
loader.load( "../src/models/" + roomFilename, function ( geometry ) {
      var material = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0x111111, shininess: 400, vertexColors: THREE.VertexColors} );
      var mesh = new THREE.Mesh( geometry, material );
      plz_wrk = mesh;

      scene.add( mesh );
      plz_wrk.rotation.x += -Math.PI / 2;
      plz_wrk.rotation.z += Math.PI / 2 + .5;
  } );

//-------------------------------------------------------

//------------------Data Sending-------------------------
//var quat = new THREE.Quaternion(0,1,0,0);
function sendNow(){
  sendData({x:camera.position.x, y:camera.position.y, z:camera.position.z}, camera.quaternion);
}
var run = setInterval(sendNow, 16);

//-------------------------------------------------------

// Optionally enable vertical movement.
fpVrControls.verticalMovement = true;
function animate (timestamp) {
    vrControls.update();
    fpVrControls.update(timestamp);
}

function render() {
    requestAnimationFrame( animate );
    requestAnimationFrame( render );
    renderer.render(scene, camera);
}
requestAnimationFrame( render );
