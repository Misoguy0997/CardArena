import { useEffect, useState, useCallback } from 'react';
import io from 'socket.io-client';

const SOCKET_URL = 'https://cardarena-9tk3.onrender.com';

export const useGameSocket = () => {
    const [socket, setSocket] = useState(null);
    const [gameState, setGameState] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isWaiting, setIsWaiting] = useState(false);
    const [error, setError] = useState(null);
    const [winner, setWinner] = useState(null);

    // Auth & Lobby State
    const [user, setUser] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);

    useEffect(() => {
        const newSocket = io(SOCKET_URL);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to server');
            setIsConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('Disconnected from server');
            setIsConnected(false);
            setUser(null); // Logout on disconnect
        });

        // Auth Events
        newSocket.on('loginSuccess', (userData) => {
            setUser(userData);
            setError(null);
        });

        newSocket.on('loginError', (msg) => {
            setError(msg?.message || msg);
            setTimeout(() => setError(null), 3000);
        });

        newSocket.on('registerResponse', (res) => {
            if (res.success) {
                alert('Registration successful! Please login.');
            } else {
                setError(res.error?.message || res.error);
                setTimeout(() => setError(null), 3000);
            }
        });

        // Lobby Events
        newSocket.on('roomListUpdate', (roomList) => {
            setRooms(roomList);
        });

        newSocket.on('onlineUsersUpdate', (users) => {
            setOnlineUsers(users);
        });

        newSocket.on('roomCreated', (room) => {
            console.log('Room created:', room);
        });

        newSocket.on('roomJoined', (room) => {
            console.log('Joined room:', room);
        });

        newSocket.on('joinRoomError', (msg) => {
            setError(msg?.message || msg);
            setTimeout(() => setError(null), 3000);
        });

        // Game Events
        newSocket.on('waiting', (data) => {
            setIsWaiting(true);
        });

        newSocket.on('gameStart', (initialState) => {
            setIsWaiting(false);
            console.log('Game started:', initialState);
        });

        newSocket.on('gameStateUpdate', (newState) => {
            setGameState(newState);
            if (newState.gameLog) {
                // Log update logic handled in component
            }
            // Check for winner
            const opponentId = Object.keys(newState.players).find(id => id !== newState.myId);
            const opponent = newState.players[opponentId];
            const me = newState.players[newState.myId];

            if (opponent && opponent.hp <= 0) setWinner(newState.myId);
            if (me && me.hp <= 0) setWinner(opponentId);
        });

        newSocket.on('error', (msg) => {
            setError(msg?.message || msg);
            setTimeout(() => setError(null), 3000);
        });

        return () => newSocket.close();
    }, []);

    // Actions
    const login = (username, password) => {
        socket?.emit('login', { username, password });
    };

    const register = (username, password, nickname) => {
        socket?.emit('register', { username, password, nickname });
    };

    const createRoom = (name, password) => {
        socket?.emit('createRoom', { name, password });
    };

    const joinRoom = (roomId, password) => {
        socket?.emit('joinRoom', { roomId, password });
    };

    const quickMatch = () => {
        socket?.emit('quickMatch');
    };

    const playCard = (cardInstanceId, slotIndex) => {
        socket?.emit('playCard', { cardInstanceId, slotIndex });
    };

    const attack = (attackerSlot, targetPlayerId, targetSlot) => {
        socket?.emit('attack', { attackerSlot, targetPlayerId, targetSlot });
    };

    const endTurn = () => {
        socket?.emit('endTurn');
    };

    const nextPhase = () => {
        socket?.emit('nextPhase');
    };

    return {
        socket,
        gameState,
        isConnected,
        isWaiting,
        error,
        winner,
        user,
        rooms,
        onlineUsers,
        login,
        register,
        createRoom,
        joinRoom,
        quickMatch,
        playCard,
        attack,
        endTurn,
        nextPhase
    };
};
