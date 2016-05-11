// Cube Variables
var cubeList = [];
var numUsers = 0;
var scene = new THREE.Scene();
var id = null;
var objLoader = new THREE.OBJLoader();
var mtlLoader = new THREE.MTLLoader();

// Getting data from homepage
var roomFilename;
var group;

function getFromUrl(){
  var url = window.location.href;
  var infoStart = url.indexOf("?");
  var join = url.slice(infoStart+4, infoStart+5);
  console.log("Join: " + join);
  var nameStart = infoStart + 6;
  var roomInfo = url.slice(nameStart);
  var nameEnd = roomInfo.indexOf("-");
  roomFilename = roomInfo.slice(0, nameEnd) + ".ply";
  console.log("File: " + roomFilename);
  if (join == "j"){
    group = roomInfo.slice(nameEnd+1) + join;
  }
  else{
    group = roomInfo.slice(nameEnd+1);
  }
  console.log("ID: " + group);
}
getFromUrl();

//Socket info
var ip = "ws://10.148.7.124"  //Change this to server IP
var loadBalancePort = "7000"  //Change this to Load Balancer Server port
var roomPort = null;
var socket = null;
var initSocket = new WebSocket(ip+":"+ loadBalancePort+"/");
var mapName = "csugLab";
var socketOpenFlag = false;

initSocket.onopen = function() {
  console.log("Connected to Load Balancer");
  initSocket.send(group);
}

initSocket.onmessage = function(event) {
    if(event.data == "BAD ID"){
      window.alert("Error: Invalid Room ID. Explore the room on your own or go back and check your input.");
      return;
    }
    if(event.data == "ROOM FULL"){
      window.alert("Room full. You are in a room by yourself.")
      return;
    }
    console.log("Got Port: "+event.data);
    roomIP = event.data//.slice(11);
    var ipAndPort = ip + ":" + roomIP + "/";
    if(roomIP != null){
      initSocket.close();
      setTimeout(function(){ createSocket(ipAndPort);}, 500);
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

function loadHugh(){
  mtlLoader.load('./models/legoman/Lego.mtl', function(materials){
    materials.preload();
    objLoader.setMaterials(materials);
    objLoader.load('./models/legoman/Lego.obj', function(geometry){
      geometry.scale.set(.06,.06,.06);
      cubeList.push(geometry);
      scene.add(geometry);

    });
  });


  // var mtlLoader = new THREE.MTLLoader();
  //   mtlLoader.setBaseUrl( './models/legoman/' );
  //   mtlLoader.setPath( './models/legoman/' );
  //   mtlLoader.load( 'Lego.mtl', function( materials ) {
  //
  //       materials.preload();
  //
  //       var objLoader = new THREE.OBJLoader();
  //       objLoader.setMaterials( materials );
  //       objLoader.setPath( './models/legoman/' );
  //       objLoader.load( 'Lego.obj', function ( object ) {
  //
  //
  //           scene.add( object );
  //
  //       });
  //
  //   });
}
//
function checkLists(cubes){
  while(cubes.length != numUsers){
      if(cubes.length > numUsers){
        numUsers++;
        loadHugh();
      }
      if(cubes.length < numUsers){
        numUsers--;
        object = cubeList.pop();
        scene.remove(object);

      }
  }
  return;
}

//Update cube positions
function updateCubes (cubes){
  checkLists(cubes);
  var mesh;
  for(var i = 0; i<cubes.length; i++){
      mesh = cubeList[i];
      mesh.position.x = parseFloat(cubes[i][1]);
      mesh.position.y = parseFloat(cubes[i][2])-1;
      mesh.position.z = parseFloat(cubes[i][3]);
      mesh.rotation.y = parseFloat(cubes[i][4]);
      mesh.rotation.z = parseFloat(cubes[i][5]);
      mesh.rotation.x = parseFloat(cubes[i][6]);
    }
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
