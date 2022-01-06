const kurento = require("kurento-client");
const kurentoClient = null;
const Register = require('./register.js');
const Session = require('./session.js');
const minimst = require("minimist");
const url = require('url');
let userRegister = new Register;

const argv = minimst(process.argv.slice(2), {
    default: {
        as_uri: 'http://15.165.65.162:3000',
        ws_uri: 'ws://15.165.65.162:8888/kurento'
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

        socket.join(roomname);
        socket.username = username;

        joinRoom(socket, roomname, err => {
            if (err) {
                console.error('join Room error ' + err);
            }
        });

    });

    socket.on('sendChat', (data) => {


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





const Rooms = [];
const RoomNumClient = [];


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

