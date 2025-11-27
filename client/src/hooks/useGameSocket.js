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

            // Auto-login if token exists
            const savedToken = localStorage.getItem('gameToken');
            if (savedToken) {
                newSocket.emit('verifySession', savedToken);
            }
        });

        newSocket.on('disconnect', () => {
            console.log('Disconnected from server');
            setIsConnected(false);
            // Don't clear user here to allow reconnect
        });

        // Auth Events
        newSocket.on('loginSuccess', ({ user, token }) => {
            setUser(user);
            setError(null);
            localStorage.setItem('gameToken', token);
        });

        newSocket.on('sessionVerified', (userData) => {
            setUser(userData);
            setError(null);
        });

        newSocket.on('sessionError', () => {
            localStorage.removeItem('gameToken');
            setUser(null);
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
            setError(msg);
            setTimeout(() => setError(null), 3000);
        });

        newSocket.on('waiting', (data) => {
            setIsWaiting(true);
        });

        // Game Events
        newSocket.on('gameStart', (data) => {
            setIsWaiting(false);
            // Initialize game state... handled by gameStateUpdate
        });

        newSocket.on('gameStateUpdate', (newGameState) => {
            setGameState(newGameState);
        });

        newSocket.on('gameOver', ({ winner }) => {
            setWinner(winner);
        });

        newSocket.on('opponentDisconnected', () => {
            setError('Opponent disconnected!');
            // Don't clear state immediately so user can see
        });

        newSocket.on('error', (msg) => {
            const message = msg?.message || msg;
            setError(message);
            setTimeout(() => setError(null), 3000);
        });

        return () => newSocket.close();
    }, []);

    const login = (username, password) => {
        if (socket) socket.emit('login', { username, password });
    };

    const register = (username, password, nickname) => {
        if (socket) socket.emit('register', { username, password, nickname });
    };

    const createRoom = (name, password) => {
        if (socket) socket.emit('createRoom', { name, password });
    };

    const deleteRoom = (roomId) => {
        if (socket) socket.emit('deleteRoom', roomId);
    };

    const joinRoom = (roomId, password) => {
        if (socket) socket.emit('joinRoom', { roomId, password });
    };

    const quickMatch = () => {
        if (socket) socket.emit('quickMatch');
    };

    const playCard = (cardInstanceId, slotIndex) => {
        if (socket) socket.emit('playCard', { cardInstanceId, slotIndex });
    };

    const attack = (attackerSlot, targetPlayerId, targetSlot) => {
        if (socket) socket.emit('attack', { attackerSlot, targetPlayerId, targetSlot });
    };

    const endTurn = () => {
        if (socket) socket.emit('endTurn');
    };

    const nextPhase = () => {
        if (socket) socket.emit('nextPhase');
    };

    const returnToLobby = () => {
        setGameState(null);
        setWinner(null);
        setIsWaiting(false);
    };

    const logout = () => {
        const token = localStorage.getItem('gameToken');
        if (socket && token) {
            socket.emit('logout', token);
        }
        localStorage.removeItem('gameToken');
        setUser(null);
        setGameState(null);
        setWinner(null);
    };

    const surrender = () => {
        if (socket) socket.emit('surrender');
    };

    return {
        socket,
        myId: socket?.id,
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
        deleteRoom,
        quickMatch,
        playCard,
        attack,
        endTurn,
        nextPhase,
        returnToLobby,
        logout,
        surrender
    };
};
