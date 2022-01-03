module.exports = class Register {
    constructor() {
        this.usersByName = {};
        this.userSessionIds = {};
    }


    register(user) {
        this.usersByName[user.name] = user;
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

    getById(id) {
        return this.userSessionIds[id];
    }
}