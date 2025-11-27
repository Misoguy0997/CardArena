const GameState = require('./gameState');

// 활성화된 게임 세션들
const games = new Map();

function initGame(roomId, player1Id, player1Name, player2Id, player2Name, firstPlayer) {
    const gameState = new GameState(roomId, player1Id, player1Name, player2Id, player2Name, firstPlayer);
    games.set(roomId, gameState);

    // 첫 번째 턴 시작
    gameState.startTurn();

    return gameState;
}

function getGameState(roomId) {
    return games.get(roomId);
}

function getRoomByPlayerId(playerId) {
    for (const [roomId, game] of games.entries()) {
        if (game.players[playerId]) {
            return roomId;
        }
    }
    return null;
}

function registerSocketEvents(socket, io) {

    // 카드 플레이
    socket.on('playCard', ({ cardInstanceId, slotIndex }) => {
        const roomId = getRoomByPlayerId(socket.id);
        if (!roomId) return;

        const game = games.get(roomId);

        // 현재 플레이어 확인
        if (game.currentPlayer !== socket.id) {
            socket.emit('error', { message: 'Not your turn' });
            return;
        }

        const result = game.playCard(socket.id, cardInstanceId, slotIndex);

        if (result.success) {
            // 모든 플레이어에게 업데이트 전송
            Object.keys(game.players).forEach(playerId => {
                io.to(playerId).emit('gameStateUpdate', game.getPublicState(playerId));
            });
        } else {
            socket.emit('error', { message: result.error });
        }
    });

    // 공격
    socket.on('attack', ({ attackerSlot, targetPlayerId, targetSlot }) => {
        const roomId = getRoomByPlayerId(socket.id);
        if (!roomId) return;

        const game = games.get(roomId);

        if (game.currentPlayer !== socket.id) {
            socket.emit('error', { message: 'Not your turn' });
            return;
        }

        const result = game.attack(socket.id, attackerSlot, targetPlayerId, targetSlot);

        if (result.success) {
            // 승리 확인
            if (result.winner) {
                io.to(roomId).emit('gameOver', { winner: result.winner });
            }

            // 상태 업데이트
            Object.keys(game.players).forEach(playerId => {
                io.to(playerId).emit('gameStateUpdate', game.getPublicState(playerId));
            });
        } else {
            socket.emit('error', { message: result.error });
        }
    });

    // 턴 종료
    socket.on('endTurn', () => {
        const roomId = getRoomByPlayerId(socket.id);
        if (!roomId) return;

        const game = games.get(roomId);

        if (game.currentPlayer !== socket.id) {
            socket.emit('error', { message: 'Not your turn' });
            return;
        }

        game.endTurn();

        // 상태 업데이트
        Object.keys(game.players).forEach(playerId => {
            io.to(playerId).emit('gameStateUpdate', game.getPublicState(playerId));
        });
    });

    // 페이즈 진행
    socket.on('nextPhase', () => {
        const roomId = getRoomByPlayerId(socket.id);
        if (!roomId) return;

        const game = games.get(roomId);
        const result = game.nextPhase(socket.id);

        if (result.success) {
            // 상태 업데이트
            Object.keys(game.players).forEach(playerId => {
                io.to(playerId).emit('gameStateUpdate', game.getPublicState(playerId));
            });
        } else {
            socket.emit('error', { message: result.error });
        }
    });

    // 항복
    socket.on('surrender', () => {
        const roomId = getRoomByPlayerId(socket.id);
        if (!roomId) return;

        const game = games.get(roomId);
        const result = game.surrender(socket.id);

        if (result.success) {
            // 승리 처리
            io.to(roomId).emit('gameOver', { winner: result.winner });

            // 상태 업데이트
            Object.keys(game.players).forEach(playerId => {
                io.to(playerId).emit('gameStateUpdate', game.getPublicState(playerId));
            });
        } else {
            socket.emit('error', { message: result.error });
        }
    });
}

function handleDisconnect(playerId, io) {
    const roomId = getRoomByPlayerId(playerId);
    if (roomId) {
        const game = games.get(roomId);
        const opponentId = Object.keys(game.players).find(id => id !== playerId);

        if (opponentId) {
            io.to(opponentId).emit('opponentDisconnected');
        }

        games.delete(roomId);
    }
}

module.exports = {
    initGame,
    getGameState,
    registerSocketEvents,
    handleDisconnect
};
