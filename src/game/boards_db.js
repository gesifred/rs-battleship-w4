class BoardsDb {
    static boardInRooms = new Map();
    static addBoard(roomId, boards) {
        BoardsDb.boardInRooms.set(roomId, boards);
    }
    static getBoard(roomId) {
        return BoardsDb.boardInRooms.get(roomId);
    }
}

export default BoardsDb;