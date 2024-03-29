const kurento = require("kurento-client");
const kurentoClient = null;
const Register = require('./register.js');
const Session = require('./session.js');
const minimst = require("minimist");
const url = require('url');
let userRegister = new Register;

const argv = minimst(process.argv.slice(2), {
  default: {
      as_uri: process.env.KURENTO_AS_URI,
      ws_uri: process.env.KURENTO_WS_URI
  }
});

var sessions = {};
var candidatesQueue = {};

var username;
var roomname;
var bandwidth;

let meeting_disconnect = null;


let asUrl = url.parse(argv.as_uri);
//let port = asUrl.port;
let wsUrl = url.parse(argv.ws_uri).href;


module.exports = function (wsServer, socket, app) {

  

  const socketWebRTC = wsServer.of('/socketWebRTC');
  // 룸에 참가.
  socket.on('userInfo', (data) => {
    console.log('[data]', data)
    roomname = data.roomName;
    username = data.userName;
    console.log('roomName : ' + roomname)
    console.log('userName : ' + username)
    bandwidth = 100;
    console.log('bandwidth : ' + bandwidth)
    // RoomList(data);
    socket.join(roomname);
    socket.username = username;

    // RoomNumClient[roomname] += 1;
    // const index = Rooms.findIndex(obj => obj.meeting_name == roomname);
    // Rooms[index].meeting_num = RoomNumClient[roomname];

    // let meeting_num = Rooms[index].meeting_num;
    // wsServer.to(roomname).emit("meeting_num", meeting_num);

    joinRoom(socket, roomname, err => {
      if (err) {
        console.error('join Room error ' + err);
      }
    });

    socketWebRTC.emit("roomList_change", Rooms);

  });

  socket.on('changeBitrate', (data) => {
    // roomname = data.roomname;
    // username = socket.username;
    // bandwidth = data.bitrate
    
    let userSession = userRegister.getById(socket.id);
    userSession.setBandWidth(data.bitrate);
    renegotiation(socket);
    console.log('[ bandwidth ]', data.bitrate)
  })
  
  socket.on("receiveVideoFrom", (data) => {
    receiveVideoFrom(socket, data.sender, data.sdpOffer, (error) => {
      if (error) {
        console.error(error);
      }
    });
  });

  socket.on("onIceCandidate", (data) => {
    addIceCandidate(socket, data, (error) => {
      if (error) {
        console.error(error);
      }
    });
  });

  socket.on("Screen_Sharing", async () => {
    console.log('Screen_Sharing')
    renegotiation(socket);
  });
  socket.on("video_device_change", async () => {
    console.log('video_device_change')
    renegotiation2(socket);
  });

  socket.on("leaveRoom", (data) => {
    socket.leave(data.roomname);
    leaveRoom(socket, data, err => {
      if (err) {
        console.error('leave Room error ' + err);
      }
    });

  });

  socket.on("disconnecting", () => {
    let userSession = userRegister.getById(socket.id);
    if (userSession != undefined) {
      if (userSession.roomName != undefined) {
        meeting_disconnect = "disconnect during a meeting";
        roomname = userSession.roomName;
        username = socket.username;
      }
    }
  });
  socket.on("disconnect", () => {
    if (meeting_disconnect != null) {
      var data = {
        username: username,
        roomname: roomname,
      }
      leaveRoom(socket, data, err => {
        if (err) {
          console.error('leave Room error ' + err);
        }
      });
      meeting_disconnect = null;
    }
  });
}



let rooms = {};

function renegotiation(socket) {
  let userSession = userRegister.getById(socket.id);

  var room = rooms[userSession.roomName];

  var usersInRoom = room.participants;

  //화면 공유하는 클라의 나가는 끝점 해제 
  userSession.outgoingMedia.release();

  //화면 공유하는 클라의 영상을 받는 다른 클라들의 들어오는 끝점 해제
  for (var i in usersInRoom) {
    var user = usersInRoom[i];
    if (user.id === userSession.id) {
      continue;
    }
    user.incomingMedia[userSession.name].release();
    delete user.incomingMedia[userSession.name];
    usersInRoom[i].sendMessage({
      id: 'updateremoteVideo',
      name: userSession.name
    });



  }


  room.pipeline.create('WebRtcEndpoint', (error, outgoingMedia) => {
    if (error) {
      if (Object.keys(room.participants).length === 0) {
        room.pipeline.release();
      }
      return callback(error);
    }
    //userSession.setBandWidth(bandwidth);
    bandwidth = userSession.bandwidth;
    outgoingMedia.setMaxVideoRecvBandwidth(bandwidth);
    outgoingMedia.setMinVideoRecvBandwidth(bandwidth);
    userSession.setOutgoingMedia(outgoingMedia);

    console.log(' [ webRtc bandwidth ]', bandwidth)

    let iceCandidateQueue = userSession.iceCandidateQueue[userSession.name];
    if (iceCandidateQueue) {
      while (iceCandidateQueue.length) {
        let message = iceCandidateQueue.shift();
        console.error('user: ' + userSession.id + ' collect candidate for outgoing media');
        userSession.outgoingMedia.addIceCandidate(message.candidate);
      }
    }

    userSession.outgoingMedia.on('OnIceCandidate', event => {
      let candidate = kurento.register.complexTypes.IceCandidate(event.candidate);
      userSession.sendMessage({
        id: 'iceCandidate',
        name: userSession.name,
        candidate: candidate
      });
    });

    let usersInRoom = room.participants;
    let existingUsers = [];
    for (let i in usersInRoom) {
      if (usersInRoom[i].name != userSession.name) {
        existingUsers.push(usersInRoom[i].name);
      }
    }
    
    socket.emit('Screen_Sharing', '');

    for (let i in usersInRoom) {
      if (usersInRoom[i].name != userSession.name) {
        usersInRoom[i].sendMessage({
          id: 'newParticipantArrived',
          name: userSession.name
        });
      }
    }

  });

}

function renegotiation2(socket) {
  let userSession = userRegister.getById(socket.id);

  var room = rooms[userSession.roomName];

  var usersInRoom = room.participants;

  //화면 공유하는 클라의 나가는 끝점 해제 
  userSession.outgoingMedia.release();

  //화면 공유하는 클라의 영상을 받는 다른 클라들의 들어오는 끝점 해제
  for (var i in usersInRoom) {
    var user = usersInRoom[i];
    if (user.id === userSession.id) {
      continue;
    }
    user.incomingMedia[userSession.name].release();
    delete user.incomingMedia[userSession.name];
    usersInRoom[i].sendMessage({
      id: 'updateremoteVideo',
      name: userSession.name
    });



  }


  room.pipeline.create('WebRtcEndpoint', (error, outgoingMedia) => {
    if (error) {
      if (Object.keys(room.participants).length === 0) {
        room.pipeline.release();
      }
      return callback(error);
    }
    //userSession.setBandWidth(bandwidth);
    bandwidth = userSession.bandwidth;
    outgoingMedia.setMaxVideoRecvBandwidth(bandwidth);
    outgoingMedia.setMinVideoRecvBandwidth(bandwidth);
    userSession.setOutgoingMedia(outgoingMedia);

    console.log(' [ webRtc bandwidth ]', bandwidth)

    let iceCandidateQueue = userSession.iceCandidateQueue[userSession.name];
    if (iceCandidateQueue) {
      while (iceCandidateQueue.length) {
        let message = iceCandidateQueue.shift();
        console.error('user: ' + userSession.id + ' collect candidate for outgoing media');
        userSession.outgoingMedia.addIceCandidate(message.candidate);
      }
    }

    userSession.outgoingMedia.on('OnIceCandidate', event => {
      let candidate = kurento.register.complexTypes.IceCandidate(event.candidate);
      userSession.sendMessage({
        id: 'iceCandidate',
        name: userSession.name,
        candidate: candidate
      });
    });

    let usersInRoom = room.participants;
    let existingUsers = [];
    for (let i in usersInRoom) {
      if (usersInRoom[i].name != userSession.name) {
        existingUsers.push(usersInRoom[i].name);
      }
    }
    
    socket.emit('video_device_change', '');

    for (let i in usersInRoom) {
      if (usersInRoom[i].name != userSession.name) {
        usersInRoom[i].sendMessage({
          id: 'newParticipantArrived',
          name: userSession.name
        });
      }
    }

  });

}

const Rooms = [];
const RoomNumClient = [];

function RoomList(data) {
    const meeting_info = {
        meeting_master : data.meeting_master,
        meeting_name : data.meeting_name,
        meeting_date : data.meeting_date,
        meeting_time : data.meeting_time,
        meeting_num :  RoomNumClient[data.meeting_name],
    }
    Rooms.push(meeting_info);
    return Rooms;
}

function leaveRoom(socket, data, callback) {
  isHangup = true;
  HangUp_user = data.username;
  roomname = data.roomname;
  // RoomNumClient[roomname] -= 1;

  // const index = Rooms.findIndex(obj => obj.meeting_name == roomname);
  // Rooms[index].meeting_num = RoomNumClient[roomname];

  // wsServer.emit("roomList_change", Rooms);

  // let meeting_num = Rooms[index].meeting_num;

  // wsServer.to(roomname).emit("meeting_num", meeting_num);


  let userSession = userRegister.getById(socket.id);

  if (!userSession) {
    return;
  }

  var room = rooms[userSession.roomName];

  if (!room) {
    return;
  }

  console.log('notify all user that ' + userSession.name + ' is leaving the room ' + roomname);

  var usersInRoom = room.participants;
  delete usersInRoom[userSession.name];
  userSession.outgoingMedia.release();

  for (var i in userSession.incomingMedia) {
    userSession.incomingMedia[i].release();
    delete userSession.incomingMedia[i];
  }

  var data = {
    id: 'participantLeft',
    name: userSession.name
  };
  for (var i in usersInRoom) {
    var user = usersInRoom[i];
    // release viewer from this
    user.incomingMedia[userSession.name]?.release();
    delete user.incomingMedia[userSession.name];
    // notify all user in the room
    user.sendMessage(data);
  }

  // Release pipeline and delete room when room is empty
  if (Object.keys(room.participants).length == 0) {
    room.pipeline.release();
    delete rooms[userSession.roomName];
  }
  delete userSession.roomName;
}

function joinRoom(socket, roomName, callback) {

  // get room 
  getRoom(roomName, (error, room) => {
    if (error) {
      console.log('error');
      callback(error);
      return;
    }
    // join user to room
    join(socket, room, (err, user) => {

      console.log('join success : ' + socket.username);
      if (err) {
        callback(err);
        return;
      }
      callback();
    });
  });
}

function getRoom(roomName, callback) {
  let room = rooms[roomName];
  if (room == null) {
    console.log('create new room : ' + roomName);
    getKurentoClient((error, kurentoClient) => {
      if (error) {
        return callback(error);
      }
      kurentoClient.create('MediaPipeline', (error, pipeline) => {
        if (error) {
          return callback(error);
        }
        room = {
          name: roomName,
          pipeline: pipeline,
          participants: {},
          kurentoClient: kurentoClient
        };

        rooms[roomName] = room;
        callback(null, room);
      });
    });

  } else {
    console.log('get existing room : ' + roomName);
    callback(null, room);
  }
}

function join(socket, room, callback) {
  let userName = socket.username;
  let userSession = new Session(socket, userName, room.name);
  userRegister.register(userSession);


  room.pipeline.create('WebRtcEndpoint', (error, outgoingMedia) => {
    if (error) {
      console.error('no participant in room');
      if (Object.keys(room.participants).length === 0) {
        room.pipeline.release();
      }
      return callback(error);
    }
    userSession.setBandWidth(bandwidth);

    outgoingMedia.setMaxVideoRecvBandwidth(bandwidth);
    outgoingMedia.setMinVideoRecvBandwidth(bandwidth);
    userSession.setOutgoingMedia(outgoingMedia);

    let iceCandidateQueue = userSession.iceCandidateQueue[userSession.name];

    if (iceCandidateQueue) {
      while (iceCandidateQueue.length) {
        let message = iceCandidateQueue.shift();
        console.error('user: ' + userSession.id + ' collect candidate for outgoing media');
        userSession.outgoingMedia.addIceCandidate(message.candidate);
      }
    }

    userSession.outgoingMedia.on('OnIceCandidate', event => {

      let candidate = kurento.register.complexTypes.IceCandidate(event.candidate);
      userSession.sendMessage({
        id: 'iceCandidate',
        name: userSession.name,
        candidate: candidate
      });
    });
    let usersInRoom = room.participants;
    for (let i in usersInRoom) {
      if (usersInRoom[i].name != userSession.name) {
        usersInRoom[i].sendMessage({
          id: 'newParticipantArrived',
          name: userSession.name
        });
      }
    }

    let existingUsers = [];
    for (let i in usersInRoom) {
      if (usersInRoom[i].name != userSession.name) {
        existingUsers.push(usersInRoom[i].name);
      }
    }
    console.log('existingUsers-----------------------------')
    console.log(existingUsers)
    userSession.sendMessage({
      id: 'existingParticipants',
      data: existingUsers,
      roomName: room.name
    });

    room.participants[userSession.name] = userSession;

    callback(null, userSession);
  });
}

function receiveVideoFrom(socket, senderName, sdpOffer, callback) {

  let userSession = userRegister.getById(socket.id);
  let sender = userRegister.getByName(senderName);

  getEndpointForUser(userSession, sender, (error, endpoint) => {
    if (error) {
      console.error(error);
      callback(error);
    }

    endpoint.processOffer(sdpOffer, (error, sdpAnswer) => {
      console.log(`process offer from ${sender.name} to ${userSession.name}`);
      if (error) {
        return callback(error);
      }
      let data = {
        id: 'receiveVideoAnswer',
        name: sender.name,
        sdpAnswer: sdpAnswer
      };
      userSession.sendMessage(data);

      endpoint.gatherCandidates(error => {
        if (error) {
          return callback(error);
        }
      });

      return callback(null, sdpAnswer);
    });
  });
}


function getKurentoClient(callback) {
  kurento(wsUrl, (error, kurentoClient) => {
    if (error) {
      let message = 'Could not find media server at address ${wsUrl}';
      return callback(message + 'Exiting with error ' + error);
    }
    callback(null, kurentoClient);
  });
}

function addIceCandidate(socket, message, callback) {
  let user = userRegister.getById(socket.id);
  if (user != null) {
    // assign type to IceCandidate
    let candidate = kurento.register.complexTypes.IceCandidate(message.candidate);
    user.addIceCandidate(message, candidate);
    callback();
  } else {
    console.error(`ice candidate with no user receive : ${message.sender}`);
    callback(new Error("addIceCandidate failed"));
  }
}
function getEndpointForUser(userSession, sender, callback) {

  if (userSession.name === sender.name) {
    return callback(null, userSession.outgoingMedia);
  }

  let incoming = userSession.incomingMedia[sender.name];
  console.log(userSession.name + "    " + sender.name);
  if (incoming == null) {
    console.log(`user : ${userSession.id} create endpoint to receive video from : ${sender.id}`);
    getRoom(userSession.roomName, (error, room) => {
      if (error) {
        console.error(error);
        callback(error);
        return;
      }
      room.pipeline.create('WebRtcEndpoint', (error, incoming) => {
        if (error) {
          if (Object.keys(room.participants).length === 0) {
            room.pipeline.release();
          }
          console.error('error: ' + error);
          callback(error);
          return;
        }

        console.log(`user: ${userSession.name} successfully create pipeline`);
        incoming.setMaxVideoRecvBandwidth(bandwidth);
        incoming.setMinVideoRecvBandwidth(bandwidth);
        userSession.incomingMedia[sender.name] = incoming;


        // add ice candidate the get sent before endpoints is establlished
        let iceCandidateQueue = userSession.iceCandidateQueue[sender.name];
        if (iceCandidateQueue) {
          while (iceCandidateQueue.length) {
            let message = iceCandidateQueue.shift();
            console.log(`user: ${userSession.name} collect candidate for ${message.data.sender}`);
            incoming.addIceCandidate(message.candidate);
          }
        }

        incoming.on('OnIceCandidate', event => {

          let candidate = kurento.register.complexTypes.IceCandidate(event.candidate);
          userSession.sendMessage({
            id: 'iceCandidate',
            name: sender.name,
            candidate: candidate
          });
        });

        sender.outgoingMedia.connect(incoming, error => {
          if (error) {
            console.log(error);
            callback(error);
            return;
          }
          callback(null, incoming);
        });
      });
    })
  } else {
    console.log(`user: ${userSession.name} get existing endpoint to receive video from: ${sender.name}`);
    sender.outgoingMedia.connect(incoming, error => {
      if (error) {
        callback(error);
      }
      callback(null, incoming);
    });
  }
}


