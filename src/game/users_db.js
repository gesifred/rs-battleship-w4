//import User from './models/User';

class UsersDb {
    static users = new Map();

    /*constructor() {
        Db.users = new Map<string, User>();
    }*/

    static getUser(id) {
        return UsersDb.users.get(id);
    }

    static addUser(index, userData) {
        /*
        userdata -> name, password
        */
        UsersDb.users.set(index, userData);
    }

    static deleteUser() {
        return UsersDb.users.delete(id);
    }

    static updateUser() {
        //todo
        const record = UsersDb.users.get(user.id);
        if (record) {
            /*let el: string;
            for (el of Object.keys(user)) {
                record[el as keyof] = user[el as keyof User];
            }*/
            Object.assign(record, user);
            UsersDb.users.set(user.id, record);
        }
    }

    static getAllUsers() {
        const allUsers = [];
        for (const entry of UsersDb.users.entries()) {
            allUsers.push(entry[1]);
        }
        return allUsers;
    }

    static getSize() {
        return UsersDb.users.size;
    }

    static findUserByName(name){
        let user;
        for (const entry of UsersDb.users.entries()) {
            //console.log("adding", entry[0], entry[1]);
            if(entry[1].name === name){
                user = entry[1];
            }
        }
        return user;
    }
    static findUserId(name){
        let userId;
        for (const entry of UsersDb.users.entries()) {
            //console.log("adding", entry[0], entry[1]);
            if(entry[1].name === name){
                userId = entry[0];
            }
        }
        return userId;
    }
}

export default UsersDb;