
module.exports = function (wsServer, socket, app) {

    const dbModels = global.DB_MODELS;

    const socketWebRTC = wsServer.of('/socketWebRTC');
    
    socket.on('join:room', (meetingId) => {
        console.log('join Room:', meetingId);
        socket.join(meetingId);
    });
    

    /**
     *  새로운 document 생성 시 진입
     *  - room 안의 모든 User에게 전송 (보낸 사람 포함)
     *  - code 통일성을 위해서!
     */    
    socket.on('check:documents', (meetingRoomId) => {
        console.log(meetingRoomId)
        socketWebRTC.to(meetingRoomId).emit('check:documents');
    })
  

    socket.on('draw:teacher', async (data) => {
        console.log('client --------> server draw event')
        console.log(data)
        const drawData = {
            pageNum: data.pageNum,
            drawingEvent: data.drawingEvent
        }
        const res = await dbModels.Doc.findOneAndUpdate({ '_id': data.docId }, { $push: { 'drawingEventSet': drawData } })

        // app.locals.classInfo.shareDrawData = drawingEvent.drawVarArray;
        console.log(res);
        console.log(res.meetingId);
        console.log(socket.rooms);
        socket.broadcast.to(res.meetingId).emit('draw:teacher', data);
    });

    socket.on('change:pdfNum', (data) => {
        console.log(data)
        socket.broadcast.to('testRoom').emit('change:pdfNum', data);
    })



    /*-------------------------------------------
        doc 전환 하는 경우 sync
     ---------------------------------------------*/
    socket.on('sync:doc', (data) => {
        console.log('page to sync: ', data.docId);
        socket.broadcast.to(data.meetingId).emit('sync:docChange', data.docId);       
    });
    
    /*-------------------------------------------
        page 전환 하는 경우 sync
     ---------------------------------------------*/
    // socket.on('sync:page', (data) => {
    //     console.log('page to sync: ', data.pageNum);
    //     socket.broadcast.to(data.meetingId).emit('sync:page', data.pageNum);       
    // });

    /*-------------------------------------------
        doc. List 전환 하는 경우 sync
     ---------------------------------------------*/
     socket.on('sync:FileList', (data) => {
        console.log('back to FileList sync: ');
        socket.broadcast.to(data.meetingId).emit('sync:backToFileList');       
    });

    socket.on('disconnect', () => {
        console.log('a user disconnected!');
    });
}