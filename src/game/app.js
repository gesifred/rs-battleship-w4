import UsersDb from "./users_db.js";
import RoomsDb from "./rooms_db.js";

class App {
    createUser(userData) {
        const userId = UsersDb.getSize() + 1;
        UsersDb.addUser(userId, userData); // userData = { name: user.name, password: user.password }
        return userId;
    }
    createRoom(userId) {
        const roomId = RoomsDb.getSize() + 1;
        const user = UsersDb.getUser(userId);
        console.log(user);
        RoomsDb.addRoom(roomId, { roomId: roomId, roomUsers: [{ name: user.name, index: userId }] });
        console.log(RoomsDb.rooms);
        //console.log(RoomsDb.rooms.get(1));
    }
    getRooms() {
        let temp = RoomsDb.getAllRooms();
        return temp;
    }
    getUsableRooms() {
        let allRooms = RoomsDb.getAllRooms();

        return allRooms.filter((room) => {
            return room.roomUsers.length == 2 ? false : true;
        });
    }
    removeRoomFromDb(roomId){
        RoomsDb.deleteRoom(roomId);
    }
    addUserToRoom(roomId, userId) {
        const user2 = UsersDb.getUser(userId);
        let room = RoomsDb.getRoom(roomId);
        console.log(room);
        const userId1 = room.roomUsers[0].index;
        const user1 = UsersDb.getUser(userId1);
        console.log(user1);
        const players = [];
        players.push({ name: user1.name, index: userId1 })//user already in room
        players.push({ name: user2.name, index: userId });//adding that request join

        RoomsDb.addUserToRoom(roomId, { roomId: roomId, roomUsers: players });
    }
    addBoard(roomId, userId, board) {
        let boards = this.getBoard(roomId)
        if (!boards) {
            let tmpObj = {};
            tmpObj[userId] = board;
            RoomsDb.addBoard(roomId, tmpObj);
        } else {
            boards[userId] = board;
            RoomsDb.addBoard(roomId, boards);
        }
    }

    getBoard(roomId) {
        return RoomsDb.getBoard(roomId);
    }
    updateBoard(roomId, board) { //TODO
        //let boards =this.getBoard(roomId)
        //let userBoard = boards[userId];
        RoomsDb.addBoard(roomId, board);
    }

    getRoomUsers(roomId) {
        return RoomsDb.getRoom(roomId).roomUsers;
    }

    addWinner(userId) {
        const user = UsersDb.getUser(userId);
        let wins;
        const winner = RoomsDb.getWinner(user.name);
        if (!winner) {
            RoomsDb.addWinner(user.name, { name: user.name, wins: 1 })
        } else {
            wins = winner.wins+1;
            RoomsDb.addWinner(user.name, {name: user.name, wins:wins});
        }
    }

    getAllWinners() {
        return RoomsDb.getAllWinners();
    }
}

export default App;