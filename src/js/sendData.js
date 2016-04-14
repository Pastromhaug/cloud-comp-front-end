// Cube Variables
var cubeList = [];
var cubeGeometry = new THREE.BoxGeometry( 0.25,0.25,0.25 );
var cubeMaterial = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
var scene = new THREE.Scene();
var id = null;

// Getting data from homepage
// var roomFilename;
// var group;
//-------- If we use GET request, use this code-----------
// function getGET(){
//   var nameStart = window.location.href.indexOf("?") + 6;
//   var nameEnd = window.location.href.indexOf("&");
//   roomFilename = window.location.href.slice(nameStart, nameEnd) + ".ply";
//   console.log("File: " + roomFilename);
//   group = window.location.href.slice(nameEnd+7);
//   console.log("ID: " + group);
// }
// getGET();

//Socket info
var ip = "ws://10.148.0.23"  //Change this to server IP
var loadBalancePort = "7000"  //Change this to Load Balancer Server port
var roomPort = null;
var socket = null;
var initSocket = new WebSocket(ip+":"+ loadBalancePort+"/");
var mapName = "csugLab";
var socketOpenFlag = false;

initSocket.onopen = function() {
  console.log("Connected to Load Balancer");
  initSocket.send("asdafd");
}

initSocket.onmessage = function(event) {
  console.log("Got Port: "+event.data);
  roomIP = event.data//.slice(11);
  var ipAndPort = ip + ":" + roomIP + "/";
  if(roomIP != null){
    initSocket.close();
    createSocket(ipAndPort);

  }
  else{
    initSocket.send("changeRoom:"+mapName);
  }
}

initSocket.onclose = function(){
  console.log("Closed connection with Load Balancer");
}

function createSocket(addr){
  socket = new WebSocket(addr);
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
        //console.log(data);
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
}

function parseInput(data){
  data = data.slice(2,data.length-2);
  data = data.split('\",\"');
  //datum = data[0].slice(1,data[0].length-1).split('\":\"');
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
  //var j = i;
  //for (i; i < cubeList.length; i++ ){
  //  scene.remove(cubeList[i]);
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

  var toSend = "{ " + id + " : " + poseData + " } ";
  socket.send(toSend);
}
