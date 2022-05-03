module.exports = class Register {
    constructor() {
        // this.usersByName = {};
        this.userSessionIds = {};
        // this.usersByUserId = {};
    }


    register(user) {
        
        // this.usersByName[user.name] = user;


        // this.usersByUserId[user.userId] = user;
        // console.log('register userId :' , this.usersByUserId[user.userId] )
        this.userSessionIds[user.id] = user;

        // console.log('this.usersByUserId')
        // console.log(this.usersByUserId)
        // console.log('this.userSessionIds')
        // console.log(this.userSessionIds)
    }

    unregister(socketId) {
        console.log('this.userSessionIds----------------------------------------')
        console.log(this.userSessionIds)
        console.log('----------------------------------------')
            delete this.userSessionIds[socketId];
            console.log('----------------------------------------')
            console.log(this.userSessionIds)
            console.log('this.userSessionIdsDelete----------------------------------------')
    }



    // getByUserId(userId) {
    //     return this.usersByUserId[userId];
    // }

    getById(id) {
        return this.userSessionIds[id];
    }
 

    getByRoomAndId(id, roomName) {

        let userSession = Object.values(this.userSessionIds).filter(item => {
            return (item.roomName === roomName && item.userId === id) 
         });
         
         return userSession[0]
    }

}