const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3001;

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;

console.log('----------------------------------------');
console.log('Starting Server...');
console.log('Checking Environment Variables...');

if (!MONGO_URI) {
    console.error('CRITICAL ERROR: MONGO_URI is missing!');
    console.error('Please check Render Environment Variables.');
    console.error('Available Keys:', Object.keys(process.env));
    console.log('----------------------------------------');
    process.exit(1); // Stop server if no DB
}

console.log('MONGO_URI found. Attempting connection...');
// Mask the password for logging safety
const maskedURI = MONGO_URI.replace(/:([^:@]+)@/, ':****@');
console.log(`Connection URI: ${maskedURI}`);

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err);
        console.error('Error Name:', err.name);
        console.error('Error Message:', err.message);
    });

const userManager = require('./userManager');
const roomManager = require('./roomManager');
const gameHandler = require('./gameHandler');

// 대기 중인 플레이어 (빠른 매칭용)
let waitingPlayer = null;

io.on('connection', (socket) => {
    console.log(`New connection: ${socket.id}`);

    // --- Authentication ---
    socket.on('register', async (data) => {
        const { username, password, nickname } = data;
        const result = await userManager.register(username, password, nickname);
        socket.emit('registerResponse', { success: result.success, error: result.error });
    });

    socket.on('login', async (data) => {
        const { username, password } = data;
        const result = await userManager.login(username, password, socket.id);
        if (result.success) {
            socket.emit('loginSuccess', result.user);
            // Send room list after login
            socket.emit('roomListUpdate', roomManager.getRooms());
        } else {
            socket.emit('loginError', { message: result.error });
        }
    });

    // --- Lobby & Rooms ---
    socket.on('createRoom', ({ name, password }) => {
        const user = userManager.getUserBySocketId(socket.id);
        if (!user) return;

        const result = roomManager.createRoom(name, password, socket.id, user.nickname);
        if (result.success) {
            socket.join(result.roomId);
            socket.emit('roomCreated', result.room);
            io.emit('roomListUpdate', roomManager.getRooms()); // Broadcast update
        }
    });

    socket.on('joinRoom', ({ roomId, password }) => {
        const user = userManager.getUserBySocketId(socket.id);
        if (!user) return;

        const result = roomManager.joinRoom(roomId, password, socket.id, user.nickname);
        if (result.success) {
            socket.join(roomId);
            socket.emit('roomJoined', result.room);
            io.emit('roomListUpdate', roomManager.getRooms());

            // If room is full, start game
            if (result.room.status === 'playing') {
                const p1 = result.room.players[0];
                const p2 = result.room.players[1];

                // Random first player
                const firstPlayer = Math.random() > 0.5 ? p1.id : p2.id;
                console.log(`Game Start - Room: ${roomId}`);
                console.log(`P1: ${p1.name} (${p1.id})`);
                console.log(`P2: ${p2.name} (${p2.id})`);
                console.log(`First Player: ${firstPlayer === p1.id ? p1.name : p2.name}`);

                gameHandler.initGame(roomId, p1.id, p1.name, p2.id, p2.name, firstPlayer);

                io.to(roomId).emit('gameStart', {
                    roomId,
                    players: {
                        [p1.id]: { socketId: p1.id, name: p1.name },
                        [p2.id]: { socketId: p2.id, name: p2.name }
                    },
                    firstPlayer
                });

                // Send initial state
                const game = gameHandler.getGameState(roomId);
                Object.keys(game.players).forEach(pid => {
                    io.to(pid).emit('gameStateUpdate', game.getPublicState(pid));
                });
            }
        } else {
            socket.emit('joinRoomError', result.error);
        }
    });

    socket.on('getRooms', () => {
        socket.emit('roomListUpdate', roomManager.getRooms());
    });

    // --- Quick Match (Legacy/Simple support) ---
    socket.on('quickMatch', () => {
        const user = userManager.getUserBySocketId(socket.id);
        if (!user) {
            socket.emit('error', 'Must be logged in');
            return;
        }

        if (waitingPlayer && waitingPlayer !== socket.id) {
            // Match found
            const roomId = `room_${waitingPlayer}_${socket.id}`;
            const p1Id = waitingPlayer;
            const p2Id = socket.id;

            const p1User = userManager.getUserBySocketId(p1Id);
            const p2User = user; // Current socket

            io.sockets.sockets.get(p1Id).join(roomId);
            socket.join(roomId);

            const firstPlayer = Math.random() > 0.5 ? p1Id : p2Id;
            console.log(`Quick Match Game Start - Room: ${roomId}`);
            console.log(`P1: ${p1User.nickname} (${p1Id})`);
            console.log(`P2: ${p2User.nickname} (${p2Id})`);
            console.log(`First Player: ${firstPlayer === p1Id ? p1User.nickname : p2User.nickname}`);

            gameHandler.initGame(roomId, p1Id, p1User.nickname, p2Id, p2User.nickname, firstPlayer);

            io.to(roomId).emit('gameStart', {
                roomId,
                players: {
                    [p1Id]: { socketId: p1Id, name: p1User.nickname },
                    [p2Id]: { socketId: p2Id, name: p2User.nickname }
                },
                firstPlayer
            });

            const game = gameHandler.getGameState(roomId);
            Object.keys(game.players).forEach(pid => {
                io.to(pid).emit('gameStateUpdate', game.getPublicState(pid));
            });

            waitingPlayer = null;
        } else {
            waitingPlayer = socket.id;
            socket.emit('waiting', { message: 'Waiting for opponent...' });
        }
    });

    // 게임 핸들러에 이벤트 등록
    gameHandler.registerSocketEvents(socket, io);

    // 연결 해제
    socket.on('disconnect', () => {
        console.log(`Player disconnected: ${socket.id}`);

        // Remove from auth
        userManager.disconnect(socket.id);

        // Remove from waiting list
        if (waitingPlayer === socket.id) {
            waitingPlayer = null;
        }

        // Handle Room Disconnect
        const roomId = roomManager.getRoomIdBySocketId(socket.id);
        if (roomId) {
            const result = roomManager.leaveRoom(roomId, socket.id);
            if (result) {
                // If room was deleted or updated, notify lobby
                io.emit('roomListUpdate', roomManager.getRooms());
            }
        }

        // Handle game disconnect (Notify opponent)
        gameHandler.handleDisconnect(socket.id, io);
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log('Server restarted with latest updates!');
});
