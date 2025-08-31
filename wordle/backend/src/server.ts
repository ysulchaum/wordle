import type { Express } from 'express';
require("dotenv").config();
const connectToDB = require("./database/db");
const express = require('express');
const gameRoutes = require('./routes/game-routes');
const authRoutes = require('./routes/auth-routes');
const multiPlayerRoutes = require('./routes/multi-player-routes');
const socketIo = require('socket.io');
const http = require('http');
const cors = require('cors');

connectToDB();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Create HTTP server and attach Express app
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());

app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/game", gameRoutes);


//io.use(authIoMiddleware); // Apply authentication middleware for Socket.IO

// Multiplayer routes
io.on("connection", (socket: any) => {
  multiPlayerRoutes(socket, io);
  console.log(`New client connected: ${socket.id}`);
});

server.listen(PORT, () => {
  console.log(`Server is now listening to PORT ${PORT}`);
});

 


