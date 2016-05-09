if ( WEBVR.isLatestAvailable() === false ) {

    document.body.appendChild( WEBVR.getMessage() );

}

var container;
var camera, scene, renderer;
var effect, controls;


container = document.createElement( 'div' );
document.body.appendChild( container );

scene = new THREE.Scene();

camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 10 );
scene.add( camera );

var light = new THREE.AmbientLight( 0xffffff );
scene.add( light );
camera.position.z = 20;

var plz_wrk;
var loader = new THREE.PLYLoader();

try{loader.load( "../src/models/" + roomFilename, function ( geometry ) {
    var material = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0x111111, shininess: 400, vertexColors: THREE.VertexColors} );
    var mesh = new THREE.Mesh( geometry, material );
    plz_wrk = mesh;

    scene.add( mesh );
    plz_wrk.rotation.x += -Math.PI / 2;
    plz_wrk.rotation.z += Math.PI / 2 + .5;
  } );
}
catch(err){
  alert("Invalid Room Name");
}

renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setClearColor( 0x101010 );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.sortObjects = false;
container.appendChild( renderer.domElement );

controls = new THREE.VRControls( camera );
effect = new THREE.VREffect( renderer );

if ( WEBVR.isAvailable() === true ) {

    document.body.appendChild( WEBVR.getButton( effect ) );
}

animate();

function animate() {
    requestAnimationFrame( animate );
    render();

}

function render() {
    controls.update();
    effect.render( scene, camera );
}
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
