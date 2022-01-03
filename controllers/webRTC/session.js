module.exports = class Session {

    constructor(socket, userName, roomName) {
        this.id = socket.id;
        this.socket = socket;
        this.name = userName;
        this.roomName = roomName;
        // this.bandwidth = bandwidth;
        this.bandwidth = 500;
        this.outgoingMedia = null;
        this.incomingMedia = {};
        this.iceCandidateQueue = {};
    }

    addIceCandidate(data, candidate) {
        // self
        if (data.sender === this.name) {
            // have outgoing media.
            if (this.outgoingMedia) {
                // console.log(' add candidate to self : ' + data.sender);
                this.outgoingMedia.addIceCandidate(candidate);
            } else {
                // save candidate to ice queue.
                console.log(' still does not have outgoing endpoint for ' + data.sender);
                this.iceCandidateQueue[data.sender].push({
                    data: data,
                    candidate: candidate
                });
            }
        } else {
            // others
            let webRtc = this.incomingMedia[data.sender];
            if (webRtc) {
                //console.log(this.name + ' add candidate to from ' + data.sender);
                webRtc.addIceCandidate(candidate);
            } else {
                //         console.log(this.name +' still does not have endpoint for '+data.sender);
                if (!this.iceCandidateQueue[data.sender]) {
                    this.iceCandidateQueue[data.sender] = [];
                }
                this.iceCandidateQueue[data.sender].push({
                    data: data,
                    candidate: candidate
                });
            }
        }
    }

    sendMessage(data) {
        if (this.socket) {
            this.socket.emit(data.id, data);
        } else {
            console.error('socket is null');
        }
    }


    setOutgoingMedia(outgoingMedia) {
        this.outgoingMedia = outgoingMedia;
    }

    setRoomName(roomName) {
        this.roomName = roomName;
    }
    setUserName(userName) {
        this.name = userName;
    }
    setBandWidth(bandwidth) {
        this.bandwidth = bandwidth;
    }

}