const io = require('../client/node_modules/socket.io-client');
// const axios = require('axios');

const socket1 = io('http://localhost:3002');
const socket2 = io('http://localhost:3002');

let player1Id, player2Id;

socket1.on('connect', () => {
    console.log('Player 1 connected');
    socket1.emit('register', { username: 'p1_' + Date.now(), password: '123', nickname: 'P1' });
});

socket1.on('registerResponse', (res) => {
    if (res.success) {
        socket1.emit('login', { username: 'p1', password: '123' }); // Wait, username is dynamic
        // Actually, just use the socket ID for matchmaking if possible, or register/login properly
        // For simplicity, let's assume register logs us in or we just use the socket connection for matchmaking
        // The server uses socket ID for matchmaking queue
        socket1.emit('findMatch');
    }
});

socket2.on('connect', () => {
    console.log('Player 2 connected');
    socket2.emit('findMatch');
});

socket1.on('matchFound', (data) => {
    console.log('Match found!', data);
    player1Id = socket1.id;
    // Wait for turn start
});

socket1.on('gameStateUpdate', (state) => {
    if (state.currentPlayer === socket1.id && state.phase === 'main') {
        console.log('My turn (Main Phase)');
        // Check hand for OttoS
        const hand = state.players[socket1.id].hand;
        const ottoS = hand.find(c => c.name === 'OttoS');
        if (ottoS) {
            console.log('Found OttoS in hand:', ottoS);
            console.log('Playing OttoS to slot 0');
            socket1.emit('playCard', { cardInstanceId: ottoS.instanceId, slotIndex: 0 });
        } else {
            console.log('OttoS not in hand? Deck order might be wrong.');
        }
    } else if (state.currentPlayer === socket1.id && state.phase === 'battle') {
        console.log('My turn (Battle Phase)');
        // Attack self (slot 0 -> slot 0)
        console.log('Attacking self (Heal)...');
        socket1.emit('attack', { attackerSlot: 0, targetPlayerId: socket1.id, targetSlot: 0 });
    }
});

socket1.on('error', (err) => {
    console.error('Socket 1 Error:', err);
});

// Need to advance phases
setInterval(() => {
    if (player1Id) {
        // Simple logic to advance phase if needed
    }
}, 1000);
