import WebSocket, { WebSocketServer } from 'ws';
import App from '../game/app.js';

const wsServer = new WebSocketServer({ port: 3000 });

function broadcastRooms(app) {
    wsServer.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            const rooms = app.getUsableRooms();
            client.send(JSON.stringify({ type: "update_room", data: JSON.stringify(rooms), id: 0 }));
        }
    });
}

function createNullBoard() {
    let targetBoard = [[], [], [], [], [], [], [], [], [], []];
    for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
            targetBoard[i][j] = null;
        }
    }
    return targetBoard;
}

function createUserBoard(ships) {
    const board = createNullBoard();
    ships.forEach((ship) => {
        if (ship.direction) { //vertical ship
            for (let i = ship.position.y, j = ship.position.x; i <= ship.position.y + ship.length - 1; i++) {
                board[i][j] = { chars: "S", position: ship.position, length: ship.length, direction: ship.direction };
                console.log("len ", ship.length, " vertical pos i ", i, " pos j ", j, " ship ", ship.position)
            }
        } else { //horizontal ship
            for (let i = ship.position.y, j = ship.position.x; j <= ship.position.x + ship.length - 1; j++) {
                board[i][j] = { chars: "S", position: ship.position, length: ship.length, direction: ship.direction };
                console.log("len ", ship.length, " horizontal pos i ", i, " pos j ", j, " ship ", ship.position)
            }
        }
    });
    return board;
}

function checkKill(userId, board, coord) {
    let killed = true;
    let element = board[userId][coord[1]][[coord[0]]];

    if (element.direction) { //vertical
        for (let i = element.position.y, j = element.position.x; i <= element.position.y + element.length - 1; i++) {
            if (board[userId][i][j].chars.match(/^H/)) {
                killed &= true;
            } else {
                killed &= false;
                return false;
            }
        }
    } else { //horizontal
        for (let i = element.position.y, j = element.position.x; j <= element.position.x + element.length - 1; j++) {
            if (board[userId][i][j].chars.match(/^H/)) {
                killed &= true;
            } else {
                killed &= false;
                return false;
            }
        }
    }
    return killed;
}

function checkAllKilled(userId, board) {
    let killed = true;
    for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
            if (board[userId][i][j]) {
                if (board[userId][i][j].chars.match(/^H/)) {
                    killed &= true;
                } else {
                    killed &= false;
                    return false;
                }
            }
        }
    }
    return killed;
}

function getRandomCoord(max) {
    return Math.floor(Math.random() * max);
}

wsServer.on('connection', function connection(ws) {
    ws.on('error', console.error);

    ws.on('message', function message(data) {
        const app = new App();
        console.log('received: %s', data);
        let info = JSON.parse(data);
        let user;
        console.log("TYPE", info.type);
        console.log("data", info.data, typeof info.data)
        if (info.data) {
            user = JSON.parse(info.data);
            //console.log(user);
        }
        //console.log(user);
        if (info.type === "reg") {
            console.log("reg");
            let id = app.createUser({ name: user.name, password: user.password });
            ws.send(JSON.stringify({ type: "reg", data: JSON.stringify({ name: user.name, index: id, error: false, errorText: null }), id: 0 }));
            ws.id = id;
            broadcastRooms(app);
            //client.send(JSON.stringify({ type: "update_room", data: JSON.stringify([{ roomId: 1, roomUsers: [{ name: "test1", index: 0 }] }]), id: 0 }));

        }
        else if (info.type == "create_room") {
            console.log("create a room");
            //ws.send(JSON.stringify({type:"update_room",data:JSON.stringify([{roomId:1,roomUsers:[{name:"test1",index:0}]}]),id:0}));
            app.createRoom(ws.id);
            wsServer.clients.forEach(function each(client) {
                if (client.readyState === WebSocket.OPEN) {
                    //{ roomId: 1, roomUsers: [{ name: "test1", index: 0 }] }
                    const rooms = app.getRooms();
                    client.send(JSON.stringify({ type: "update_room", data: JSON.stringify(rooms), id: 0 }));
                }
                //console.log(client.id)
            });
        }
        else if (info.type == "add_user_to_room") {
            console.log("adding to room");
            const roomId = JSON.parse(info.data)
            app.addUserToRoom(roomId.indexRoom, ws.id);
            const users = app.getRoomUsers(roomId.indexRoom);
            wsServer.clients.forEach(function each(client) {
                if (client.readyState === WebSocket.OPEN) {
                    if (client.id === users[0].index || client.id === users[1].index)
                        client.send(JSON.stringify({ type: "create_game", data: JSON.stringify({ idGame: 1, idPlayer: client.id }), id: 0 }));
                }
            });
        }

        else if (info.type == "add_ships") {
            console.log("adding ships");
            const shipsInfo = JSON.parse(info.data)
            console.log(shipsInfo);
            ws.shipsReady = true;
            ws.ships = shipsInfo.ships;
            // false is horizontal, start in popa/stern
            // true is vertical, start in proa/bow
            ws.tempBoard = createUserBoard(ws.ships);
            app.addBoard(shipsInfo.gameId, ws.id, ws.tempBoard);

            const users = app.getRoomUsers(shipsInfo.gameId);
            let user0Ready = false;
            let user1Ready = false;
            wsServer.clients.forEach(function each(client) {
                if (client.readyState === WebSocket.OPEN) {
                    if (client.id === users[0].index) {
                        user0Ready = client.shipsReady;
                    } else if (client.id === users[1].index) {
                        user1Ready = client.shipsReady;
                    }
                }
            });
            if (user0Ready && user1Ready) {
                wsServer.clients.forEach(function each(client) {
                    if (client.readyState === WebSocket.OPEN) {
                        if (client.id === users[0].index || client.id === users[1].index) {
                            client.send(JSON.stringify({ type: "start_game", data: JSON.stringify({ ships: client.ships, currentPlayerIndex: client.id }), id: 0 }));
                            client.send(JSON.stringify({ type: "turn", data: JSON.stringify({ currentPlayer: users[0].index }), id: 0 }));
                            console.log(`user ${client.id}-board: ready ${client.tempBoard}`);
                            console.log(client.tempBoard);
                            console.log(`user ${client.id}-board: from db`);
                            console.log(app.getBoard(shipsInfo.gameId)[client.id]);
                        }
                    }
                });
            }

        }
        else if (info.type === "attack" || info.type === "randomAttack") {
            console.log("attakc");
            const data = JSON.parse(info.data);
            const gameId = data.gameId;
            const currPlayer = data.indexPlayer;
            let coord;
            if (info.type === "randomAttack"){
                coord = [getRandomCoord(10), getRandomCoord(10)];    
            } else {
                coord = [data.x, data.y];
            }
            
            const users = app.getRoomUsers(gameId);
            const nextPlayerIndex = currPlayer === users[0].index ? users[1].index : users[0].index;

            console.log("hitting on ", coord, "by player ", currPlayer);

            let tempBoard = app.getBoard(gameId);
            console.log("must attack board from player ", nextPlayerIndex)
            //console.log(tempBoard[nextPlayerIndex]);
            let element = tempBoard[nextPlayerIndex][coord[1]][[coord[0]]];
            let result;
            let winner;
            if (element) { //not null
                if (element.chars.match(/^S/)) {
                    result = "shot";
                    let item = element.chars.split("");
                    item.unshift("H");
                    tempBoard[nextPlayerIndex][coord[1]][[coord[0]]].chars = item.join("");
                    app.updateBoard(gameId, tempBoard);
                    let killed = checkKill(nextPlayerIndex, tempBoard, coord);
                    if (killed) {
                        result = "killed";
                        console.log(result);
                    }
                    console.log(result)
                }
            } else {// null i.e. empty block no ship
                result = "miss";
                /*let item = element.chars.split("");
                item.unshift("H");
                tempBoard[nextPlayerIndex][coord[1]][[coord[0]]].chars = item.join("");
                app.updateBoard(gameId, tempBoard);*/
            }

            wsServer.clients.forEach(function each(client) {
                if (client.readyState === WebSocket.OPEN) {
                    if (client.id === users[0].index || client.id === users[1].index) {
                        switch (result) {
                            case "miss":
                                client.send(JSON.stringify({ type: "attack", data: JSON.stringify({ position: { x: coord[0], y: coord[1] }, currentPlayer: currPlayer, status: result }), id: 0 }));
                                client.send(JSON.stringify({ type: "turn", data: JSON.stringify({ currentPlayer: nextPlayerIndex }), id: 0 }));
                                break;
                            case "shot":
                                client.send(JSON.stringify({ type: "attack", data: JSON.stringify({ position: { x: coord[0], y: coord[1] }, currentPlayer: currPlayer, status: result }), id: 0 }));
                                client.send(JSON.stringify({ type: "turn", data: JSON.stringify({ currentPlayer: currPlayer }), id: 0 }));
                                break;
                            case "killed":
                                client.send(JSON.stringify({ type: "attack", data: JSON.stringify({ position: { x: coord[0], y: coord[1] }, currentPlayer: currPlayer, status: result }), id: 0 }));
                                client.send(JSON.stringify({ type: "turn", data: JSON.stringify({ currentPlayer: currPlayer }), id: 0 }));
                                let MAX_R = 10;
                                let MIN_R = 0;
                                let originI = element.position.y - 1;
                                let originJ = element.position.x - 1;
                                let finalI = element.position.y;
                                let finalJ = element.position.x;
                                if (element.direction) { //vertical
                                    console.log("vertical")
                                    finalI += element.length + 1;
                                    finalJ += 2;
                                } else { //horizontal
                                    console.log("horizontal")
                                    finalI += 2;
                                    finalJ += element.length + 1;
                                }
                                //normalize range
                                originI = originI > MAX_R ? MAX_R : originI < MIN_R ? MIN_R : originI;
                                originJ = originJ > MAX_R ? MAX_R : originJ < MIN_R ? MIN_R : originJ;
                                finalI = finalI > MAX_R ? MAX_R : finalI < MIN_R ? MIN_R : finalI;
                                finalJ = finalJ > MAX_R ? MAX_R : finalJ < MIN_R ? MIN_R : finalJ;
                                console.log("origin i ", originI, " origin j ", originJ, " final i ", finalI, " final j ", finalJ);
                                for (let i = originI; i <= finalI - 1; i++) {
                                    for (let j = originJ; j <= finalJ - 1; j++) {
                                        if (tempBoard[nextPlayerIndex][i][j]) {
                                            client.send(JSON.stringify({ type: "attack", data: JSON.stringify({ position: { x: j, y: i }, currentPlayer: currPlayer, status: result }), id: 0 }));
                                            client.send(JSON.stringify({ type: "turn", data: JSON.stringify({ currentPlayer: currPlayer }), id: 0 }));
                                        } else {
                                            client.send(JSON.stringify({ type: "attack", data: JSON.stringify({ position: { x: j, y: i }, currentPlayer: currPlayer, status: "miss" }), id: 0 }));
                                            client.send(JSON.stringify({ type: "turn", data: JSON.stringify({ currentPlayer: currPlayer }), id: 0 }));
                                        }
                                    }
                                }
                                if (checkAllKilled(nextPlayerIndex,tempBoard)){
                                    client.send(JSON.stringify({ type: "finish", data: JSON.stringify({ winPlayer: currPlayer }), id: 0 }));
                                }
                                break;
                            default:
                                break;
                        }
                    }
                }
            });
        }
    });
    //ws.send('something');
});


export { wsServer };