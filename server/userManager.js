const User = require('./models/User');
const bcrypt = require('bcryptjs');

class UserManager {
    constructor() {
        this.activeSockets = {}; // { socketId: { username, nickname } }
        this.sessions = {}; // { token: username }
    }

    // No loadUsers/saveUsers needed for MongoDB

    async register(username, password, nickname) {
        try {
            if (!username || typeof username !== 'string' || username.trim() === '') {
                return { success: false, error: 'Invalid username' };
            }

            const existingUser = await User.findOne({ username });

            if (existingUser) {
                return { success: false, error: 'Username already exists' };
            }

            const hashedPassword = bcrypt.hashSync(password, 10);
            await User.create({
                username,
                password: hashedPassword,
                nickname
            });

            return { success: true };
        } catch (error) {
            console.error('Register error:', error);
            return { success: false, error: 'Server error during registration' };
        }
    }

    async login(username, password, socketId) {
        try {
            const user = await User.findOne({ username });
            if (!user) {
                return { success: false, error: 'User not found' };
            }

            const isMatch = bcrypt.compareSync(password, user.password);
            if (!isMatch) {
                return { success: false, error: 'Incorrect password' };
            }

            // Generate simple session token
            const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
            this.sessions[token] = username;

            // Update active sockets
            const nickname = user.nickname || user.username;
            this.activeSockets[socketId] = { username: user.username, nickname };

            return {
                success: true,
                token,
                user: {
                    username: user.username,
                    nickname: nickname,
                    wins: user.wins,
                    losses: user.losses
                }
            };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Server error during login' };
        }
    }

    async verifySession(token, socketId) {
        const username = this.sessions[token];
        if (!username) {
            return { success: false, error: 'Invalid session' };
        }

        try {
            const user = await User.findOne({ username });
            if (!user) {
                return { success: false, error: 'User not found' };
            }

            // Update active sockets
            const nickname = user.nickname || user.username;
            this.activeSockets[socketId] = { username: user.username, nickname };

            return {
                success: true,
                user: {
                    username: user.username,
                    nickname: nickname,
                    wins: user.wins,
                    losses: user.losses
                }
            };
        } catch (error) {
            console.error('Session verify error:', error);
            return { success: false, error: 'Server error' };
        }
    }

    logout(token) {
        if (this.sessions[token]) {
            delete this.sessions[token];
        }
    }

    disconnect(socketId) {
        const user = this.activeSockets[socketId];
        if (user) {
            delete this.activeSockets[socketId];
            return user.username;
        }
        return null;
    }

    async getUser(username) {
        try {
            return await User.findOne({ username });
        } catch (error) {
            console.error('GetUser error:', error);
            return null;
        }
    }

    getUserBySocketId(socketId) {
        return this.activeSockets[socketId];
    }

    getOnlineUsers() {
        // Return unique users (in case of multiple tabs, though current logic might overwrite)
        const users = Object.values(this.activeSockets);
        // Deduplicate by username
        const uniqueUsers = [];
        const seen = new Set();
        for (const u of users) {
            if (!seen.has(u.username)) {
                seen.add(u.username);
                uniqueUsers.push(u);
            }
        }
        return uniqueUsers;
    }
}

module.exports = new UserManager();
