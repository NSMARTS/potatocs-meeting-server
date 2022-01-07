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

        roomname = data.roomName;
        username = data.userName;
        socket.username = username;
        console.log(roomname)


    });




    ////////// 채팅 //////////////// 
    socket.on('sendChat', (chatData) => {
        // 같은 room (meetingId로 판단)에 있는 사람에게 전송
        socket.join(chatData.meetingId);
        socketWebRTC.to(chatData.meetingId).emit("receiveChatData", chatData);
    })


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



