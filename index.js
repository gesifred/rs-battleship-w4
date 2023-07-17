import { httpServer } from "./src/http_server/index.js";
import { wsServer } from "./src/websocket_server/index.js";

const HTTP_PORT = 8181;

httpServer.on('upgrade', function upgrade(request, socket, head) {
    const { pathname } = parse(request.url);
  
    if (pathname === '/') {
        wsServer.handleUpgrade(request, socket, head, function done(ws) {
            wsServer.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });

//import { randomUUID }  from "node:crypto";
//console.log("uuid ", randomUUID());
console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);
