var socket = new WebSocket('ws://10.148.4.124:7569');
var socketOpenFlag = false;
var id = null;
var cubeList = [];
var cubeGeometry = new THREE.BoxGeometry( 0.25,0.25,0.25 );
var cubeMaterial = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
var scene = new THREE.Scene();

socket.onopen = function() {
    console.log("Socket's open!")
    socketOpenFlag = true;
}
socket.onmessage = function (event) {
    //console.log(event.data);
    data = event.data;
    if (id == null){
      id = data;
      console.log('id set to ' + id);
    }
    else {
      data = data.replace(/\s+/g, '');
    //  console.log(data);
      data = parseInput(data);
      //console.log(data);
      updateCubes(data);
    }
}
socket.onclose = function(){
    socketOpenFlag = false;
    id = null;
    console.log("Socket's closed :(");
}

function parseInput(data){
  data = data.slice(2,data.length-2);

  data = data.split('\",\"');
  datum = data[0].slice(1,data[0].length-1).split('\":\"');
  var j;
  for (i=0; i<data.length;i++){
    data[i] = data[i].split(/[":"|,]+/);
    if (data[i][0] == id){
      j = i;
    }
  }
  data.splice(j,1);
  return data
}

function updateCubes (cubes){
  for(var i = 0; i<cubes.length; i++){
    var lst = null;
    if(!cubeList[i]){
      var mesh = new THREE.Mesh( cubeGeometry,cubeMaterial );
      mesh.dynamic = true;
      cubeList.push(mesh);
      scene.add(mesh);
    }
    else{
      var mesh = cubeList[i];
    }

    mesh.position.x = parseFloat(cubes[i][1]);
    mesh.position.y = parseFloat(cubes[i][2]);
    mesh.position.z = parseFloat(cubes[i][3]);
    mesh.rotation.x = parseFloat(cubes[i][4]);
    mesh.rotation.y = parseFloat(cubes[i][5]);
    mesh.rotation.z = parseFloat(cubes[i][6]);
  }
  var j = i;
  //for (i; i < cubeList.length; i++ ){
    //scene.remove(cubeList[i]);
  //}
  //cubeList = cubeList.slice(0,j+1);
}
function convertQuat(q1){
  var sqw = q1.w*q1.w;
  var sqx = q1.x*q1.x;
  var sqy = q1.y*q1.y;
  var sqz = q1.z*q1.z;
  var unit = sqx + sqy + sqz + sqw; // if normalised is one, otherwise is correction factor
  var test = q1.x*q1.y + q1.z*q1.w;
  var heading, attitude, bank;
  if (test > 0.499*unit) { // singularity at north pole
      heading = 2 * Math.atan2(q1.x,q1.w);
      attitude = Math.PI/2;
      bank = 0;
      return {'x': heading, 'y': attitude, 'z': bank};
  }
  if (test < -0.499*unit) { // singularity at south pole
      heading = -2 * Math.atan2(q1.x,q1.w);
      attitude = -Math.PI/2;
      bank = 0;
      return {'x': heading, 'y': attitude, 'z': bank};
  }
  heading = Math.atan2(2*q1.y*q1.w-2*q1.x*q1.z , sqx - sqy - sqz + sqw);
  attitude = Math.asin(2*test/unit);
  bank = Math.atan2(2*q1.x*q1.w-2*q1.y*q1.z , -sqx + sqy - sqz + sqw)
  return {'x': heading, 'y': attitude, 'z': bank};
}
function sendData(position,quaternion){
  if (!socketOpenFlag || id == null){
    return;
  }
  var orient = convertQuat(quaternion);
  var poseData =
    position.x + ',' +
    position.y + ',' +
    position.z + ',' +
    orient.x   + ',' +
    orient.y   + ',' +
    orient.z;
//  var toSend = {
//    id: id,
//    pose: poseData
//  };

  var toSend = "{ " + id + " : " + poseData + " } ";
//  console.log(toSend);
  //console.log(toSend);
  socket.send(toSend);
  //socket.send("alskdjf;laskdjfl;askdjfl;askdjfa;lskdjfa;lskdjfa;slkdjfa;lskdjfa;lskdfjas;ldkfjas;ldkfjasd;flkajsdf;lk");
}
