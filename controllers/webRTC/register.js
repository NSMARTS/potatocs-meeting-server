module.exports = class Register {
    constructor() {
        this.usersByName = {};
        this.userSessionIds = {};
        this.usersByUserId = {};
    }


    register(user) {
        
        this.usersByName[user.name] = user;
        this.usersByUserId[user.userId] = user;
        console.log('register userId :' , this.usersByUserId[user.userId] )
        this.userSessionIds[user.id] = user;
        // console.log('this.usersByName')
        // console.log(this.usersByName)
        // console.log('this.userSessionIds')
        // console.log(this.userSessionIds)
    }

    unregister(name) {
        let user = this.getByName(name);
        if (user) {
            delete this.usersByName[user.name];
            delete this.userSessionIds[user.id];
        }
    }
    removeByName(name) {
        let user = this.getByName(name);
        if (user) {
            delete this.usersByName[user.name];
            delete this.userSessionIds[user.id];
        }
    }

    getByName(name) {
        return this.usersByName[name];
    }

    getByUserId(userId) {
        return this.usersByUserId[userId];
    }

    getById(id) {
        return this.userSessionIds[id];
    }
}