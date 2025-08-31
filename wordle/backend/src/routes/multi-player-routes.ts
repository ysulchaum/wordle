const jwt = require("jsonwebtoken");
const {dataEmitter, state} = require("../emitter/dataEmitter");


interface PlayerStatus {
    socketId: string;
    username: string;
    ready: boolean;
}

interface Room {
    roomId: string;
}

const rooms = new Map<Room, PlayerStatus[]>();



const multiPlayerRoutes = (socket: any, io?: any) => {

    const decodeToken = (token: string) => {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
            return decoded;
        } catch (error) {
            console.error("JWT verification error:", error);
            return null;
        }
    };
    socket.on("createRoom", (data: any) => {
        try {
            const { accessToken, roomId } = data;
            const players = rooms.get(roomId) || []; // Get existing players or create a new array
            const userData = decodeToken(accessToken);

            if (!userData) {
                console.error("Invalid token");
                return;
            }
            // Add player to the room
            players.push({
                socketId: socket.id,
                username: userData.username,
                ready: false
            });
            rooms.set(roomId, players); // Update the room with the new player

            socket.join(roomId);
            socket.emit("roomCreated", { username: userData.username, roomId });
            console.log(`Client ${userData.username}/ socket.id: ${socket.id} created room: ${roomId}`);

            // test 

            console.log(`Socket ${socket.id} joined room ${roomId}`);
            io.in(roomId).allSockets().then((sockets: any) => {
                console.log(`Sockets in room ${roomId}:`, sockets);
            });

        } catch (error) {
            console.error("Error creating room:", error);
            socket.emit("error", { message: "Failed to create room" });
        }

    });

    socket.on("joinRoom", (data: any) => {
        try {
            const { accessToken, roomId } = data;
            const players = rooms.get(roomId) || []; // Get existing players or create a new array
            const userData = decodeToken(accessToken);

            if (!userData) {
                console.error("Invalid token");
                return;
            }

            players.push({
                socketId: socket.id,
                username: userData.username,
                ready: false
            });
            rooms.set(roomId, players); // Update the room with the new player

            socket.join(roomId);
            socket.emit("joinedRoom", { username: userData.username, roomId });
            console.log(`Client ${userData.username}/ socket.id: ${socket.id} joined room: ${roomId}`);

        } catch (error) {
            console.error("Error joining room:", error);
            socket.emit("error", { message: "Failed to join room" });
        }

    });

    socket.on("ready", (data: any) => {
        try {
            const { accessToken, roomId } = data;
            const userData = decodeToken(accessToken);
            const players = rooms.get(roomId);

            if (!players) {
                console.error("Room not found:", roomId);
                return;
            }

            if (!userData) {
                console.error("Invalid token");
                return;
            }


            const player = players.find(p => p.username === userData.username);
            if (player) {
                player.ready = true;
            }
            console.log(`Player with players ${JSON.stringify(players)}||${players} is ready in room: ${roomId}. username: ${userData.username}`);


            const allReady = players.length === 2 && players.every(p => p.ready);
            if (allReady) {
                console.log(`All players are ready in room: ${roomId}`);
                io.to(roomId).emit("startGame");
            } else { 
                console.log(`Waiting for players in room: ${roomId}`);
                io.to(socket.id).emit("waitingForPlayers", { roomId });

            }

        } catch (error) {
            console.error("Error marking player as ready:", error);
        }
    });

    socket.on("leaveRoom", (data: any) => {
        const { accessToken, roomId } = data;
        socket.leave(roomId);

        const userData = decodeToken(accessToken);
        if (userData) {
            socket.emit("leftRoom", { username: userData.username, roomId });
            console.log(`Client ${userData.username} left room: ${roomId}`);
        } else {
            socket.emit("error", { message: "Invalid token" });
        }
    });

    socket.on("sendMessage", (data: any) => {
        const { accessToken, roomId, message } = data;

        const userData = decodeToken(accessToken);
        if (userData) {
            io.to(roomId).emit("receiveMessage", { message, sender: userData.username });
        } else {
            socket.emit("error", { message: "Invalid token" });
        }
    });

    // from game-controller.ts
    dataEmitter.on("wordGuessInter", (data: any) => { // bug: sended both opponent and current player
        if(state.isWordGuessListenerRegistered){return;}
        const { resultData, roomId, socketId } = data;
        const roomSockets = io.sockets.adapter.rooms.get(roomId);
        if (roomSockets) {
            for (const socketIdOpp of roomSockets) {
                if (socketIdOpp !== socketId) {
                    io.to(socketIdOpp).emit("wordGuess", resultData);
                }
            }
        }
        console.log(`data haha: ${JSON.stringify(resultData)}, roomId: ${roomId}, socket.id: ${socketId}`);
        //socket.to(roomId).emit("wordGuess", resultData);
        state.isWordGuessListenerRegistered = true;
    });

 
    // from game-controller.ts 
    dataEmitter.on("gameResult", (data: any) => {
        if(state.isWordGuessListenerRegistered){return;}
        const { secretWord, roomId, username, isCorrect } = data;
        console.log(`revealing word: ${secretWord} to room: ${roomId}`);
        io.to(roomId).emit("gameResult", { secretWord, username, isCorrect });
        state.isWordGuessListenerRegistered = true;
    });
};  
 
module.exports = multiPlayerRoutes;   
