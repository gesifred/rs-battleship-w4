//import User from './models/User';

class RoomsDb {
    static rooms = new Map();
    static winners = new Map();
    //static boardInRooms = new Map();

    /*constructor() {
        RoomsDb.rooms = new Map<string, User>();
    }*/

    static getRoom(id) {
        return RoomsDb.rooms.get(id);
    }

    static addRoom(id, roomsData) {
        RoomsDb.rooms.set(id, roomsData);
    }

    static addUserToRoom(roomId, roomsData) {
        RoomsDb.rooms.set(roomId, roomsData);
    }

    static deleteRoom(roomId) {
        return RoomsDb.rooms.delete(roomId);
    }

    static updateUser() {
        //todo
        const record = RoomsDb.rooms.get(user.id);
        if (record) {
            /*let el: string;
            for (el of Object.keys(user)) {
                record[el as keyof] = user[el as keyof User];
            }*/
            Object.assign(record, user);
            RoomsDb.rooms.set(user.id, record);
        }
    }

    static getAllRooms() {
        const allRooms = [];
        for (const entry of RoomsDb.rooms.entries()) {
            //console.log("adding", entry[0], entry[1]);
            allRooms.push(entry[1]);
        }
        return allRooms;
    }

    static getSize() {
        return RoomsDb.rooms.size;
    }

    /*static addBoard(roomId, boards) {
        RoomsDb.boardInRooms.set(roomId, boards);
    }
    static getBoard(roomId) {
        return RoomsDb.boardInRooms.get(roomId);
    }*/

    static addWinner(name, wins) {
        RoomsDb.winners.set(name, wins);
    }

    static getWinner(name) {
        return RoomsDb.winners.get(name);
    }
    static getAllWinners() {
        const allWinners = [];
        for (const entry of RoomsDb.winners.entries()) {
            //console.log("adding", entry[0], entry[1]);
            allWinners.push(entry[1]);
        }
        return allWinners;
    }
}

export default RoomsDb;