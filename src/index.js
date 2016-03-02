
// scene, camera, rendering setup
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
var renderer = new THREE.WebGLRenderer();
// Create VRControls in addition to FirstPersonVRControls.
//var vrControls = new THREE.VRControls(camera);
var fpVrControls = new THREE.FirstPersonVRControls(camera, scene);
//var effect = new THREE.VREffect(renderer);
//effect.setSize(window.innerWidth, window.innerHeight);

renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// lighting
var light = new THREE.AmbientLight( 0xffffff );
scene.add( light );

//variables
var plz_wrk;

var loader = new THREE.PLYLoader();
loader.load( '../src/models/plz_wrk.ply', function ( geometry ) {
    var material = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0x111111, shininess: 400, vertexColors: THREE.VertexColors} );
    var mesh = new THREE.Mesh( geometry, material );
    plz_wrk = mesh;

    scene.add( mesh );
    plz_wrk.rotation.x += -Math.PI / 2;
    plz_wrk.rotation.z += Math.PI / 2 + .5;
 } );

// Optionally enable vertical movement.
fpVrControls.verticalMovement = true;
function animate (timestamp) {
    // Update FirstPersonControls after VRControls.
    // FirstPersonControls requires a timestamp.
    //vrControls.update();
    fpVrControls.update(timestamp);
}

camera.position.z = 5;

function render() {
    requestAnimationFrame( animate );
	requestAnimationFrame( render );
    plz_wrk.rotation.z += 0.001;
    renderer.render( scene, camera );
}
render();
