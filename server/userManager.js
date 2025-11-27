const User = require('./models/User');
const bcrypt = require('bcryptjs');

class UserManager {
    constructor() {
        this.activeSockets = {}; // { socketId: username }
    }

    // No loadUsers/saveUsers needed for MongoDB

    async register(username, password, nickname) {
        try {
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
            console.error('Login error:', error);
            return { success: false, error: 'Server error during login' };
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
