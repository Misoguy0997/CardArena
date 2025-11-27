class RoomManager {
    constructor() {
        this.rooms = {}; // { roomId: { id, name, password, hostId, players: [], status } }
    }

    createRoom(name, password, hostId, hostName) {
        const roomId = `room_${Date.now()}`;
        this.rooms[roomId] = {
            id: roomId,
            name,
            password, // Can be null/empty
            hostId,
            players: [{ id: hostId, name: hostName }],
            status: 'waiting'
        };
        return { success: true, roomId, room: this.rooms[roomId] };
    }

    joinRoom(roomId, password, playerId, playerName) {
        const room = this.rooms[roomId];
        if (!room) {
            return { success: false, error: 'Room not found' };
        }
        if (room.status !== 'waiting') {
            return { success: false, error: 'Room is already playing' };
        }
        if (room.players.length >= 2) {
            return { success: false, error: 'Room is full' };
        }
        if (room.password && room.password !== password) {
            return { success: false, error: 'Incorrect password' };
        }

        room.players.push({ id: playerId, name: playerName });

        if (room.players.length === 2) {
            room.status = 'playing';
        }

        return { success: true, room };
    }

    leaveRoom(roomId, playerId) {
        const room = this.rooms[roomId];
        if (!room) return null;

        // If game is in progress, destroy the room entirely
        if (room.status === 'playing') {
            delete this.rooms[roomId];
            return { roomId, action: 'deleted', room };
        }

        room.players = room.players.filter(p => p.id !== playerId);

        if (room.players.length === 0) {
            delete this.rooms[roomId];
            return { roomId, action: 'deleted' };
        } else {
            // If host left, assign new host? Or just keep it.
            // For simplicity, if host leaves, maybe close room or assign to other.
            // Here we just update the list.
            return { roomId, action: 'updated', room };
        }
    }

    getRoomIdBySocketId(socketId) {
        for (const roomId in this.rooms) {
            const room = this.rooms[roomId];
            if (room.players.some(p => p.id === socketId)) {
                return roomId;
            }
        }
        return null;
    }

    deleteRoom(roomId, hostId) {
        const room = this.rooms[roomId];
        if (!room) {
            return { success: false, error: 'Room not found' };
        }
        if (room.hostId !== hostId) {
            return { success: false, error: 'Not authorized' };
        }

        delete this.rooms[roomId];
        return { success: true, roomId };
    }

    getRooms() {
        return Object.values(this.rooms).map(room => ({
            id: room.id,
            name: room.name,
            hasPassword: !!room.password,
            players: room.players.length,
            status: room.status,
            hostId: room.hostId // Expose hostId
        }));
    }

    getRoomById(roomId) {
        return this.rooms[roomId];
    }
}

module.exports = new RoomManager();
