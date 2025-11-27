import React, { useState } from 'react';

export const Lobby = ({ user, rooms, onlineUsers, onCreateRoom, onJoinRoom, onQuickMatch }) => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newRoomName, setNewRoomName] = useState('');
    const [newRoomPassword, setNewRoomPassword] = useState('');

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        if (newRoomName.trim()) {
            onCreateRoom(newRoomName, newRoomPassword);
            setShowCreateModal(false);
            setNewRoomName('');
            setNewRoomPassword('');
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-white">Game Lobby</h1>
                        <p className="text-gray-400">Welcome, <span className="text-blue-400 font-bold">{user.nickname}</span></p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={onQuickMatch}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg transform hover:scale-105 transition-all"
                        >
                            ⚡ Quick Match
                        </button>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg transform hover:scale-105 transition-all"
                        >
                            ➕ Create Room
                        </button>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Left Column: Room List (Takes up 3/4 space) */}
                    <div className="lg:col-span-3">
                        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-xl">
                            <div className="p-4 bg-gray-700 border-b border-gray-600 flex font-bold text-gray-300">
                                <div className="flex-1">Room Name</div>
                                <div className="w-32 text-center">Status</div>
                                <div className="w-32 text-center">Players</div>
                                <div className="w-32 text-center">Action</div>
                            </div>

                            {rooms.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    No rooms available. Create one or use Quick Match!
                                </div>
                            ) : (
                                rooms.map(room => (
                                    <div key={room.id} className="p-4 border-b border-gray-700 flex items-center hover:bg-gray-750 transition-colors">
                                        <div className="flex-1 text-white font-medium flex items-center gap-2">
                                            {room.name}
                                            {room.hasPassword && <span className="text-xs bg-yellow-600 px-2 py-0.5 rounded">🔒</span>}
                                        </div>
                                        <div className="w-32 text-center">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${room.status === 'waiting' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                                                }`}>
                                                {room.status.toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="w-32 text-center text-gray-300">
                                            {room.players}/2
                                        </div>
                                        <div className="w-32 text-center">
                                            <button
                                                onClick={() => {
                                                    if (room.hasPassword) {
                                                        const pwd = prompt('Enter room password:');
                                                        if (pwd !== null) onJoinRoom(room.id, pwd);
                                                    } else {
                                                        onJoinRoom(room.id, '');
                                                    }
                                                }}
                                                disabled={room.status !== 'waiting'}
                                                className={`px-4 py-2 rounded text-sm font-bold ${room.status === 'waiting'
                                                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                                    }`}
                                            >
                                                Join
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right Column: Online Players (Takes up 1/4 space) */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-xl h-full">
                            <div className="p-4 bg-gray-700 border-b border-gray-600 font-bold text-gray-300 flex justify-between items-center">
                                <span>Online Players</span>
                                <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">{onlineUsers?.length || 0}</span>
                            </div>
                            <div className="p-4 max-h-[500px] overflow-y-auto">
                                {onlineUsers && onlineUsers.length > 0 ? (
                                    <ul className="space-y-2">
                                        {onlineUsers.map((u, idx) => (
                                            <li key={idx} className="flex items-center gap-2 text-gray-300 bg-gray-750 p-2 rounded">
                                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                <span className="font-medium truncate">{u.nickname}</span>
                                                {u.username === user.username && <span className="text-xs text-gray-500">(You)</span>}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="text-gray-500 text-sm text-center">No players online</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Room Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-6 rounded-lg w-96 border border-gray-600 shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-4">Create New Room</h3>
                        <form onSubmit={handleCreateSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-400 text-sm mb-2">Room Name</label>
                                <input
                                    type="text"
                                    value={newRoomName}
                                    onChange={(e) => setNewRoomName(e.target.value)}
                                    className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 outline-none"
                                    placeholder="Enter room name"
                                    autoFocus
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-gray-400 text-sm mb-2">Password (Optional)</label>
                                <input
                                    type="password"
                                    value={newRoomPassword}
                                    onChange={(e) => setNewRoomPassword(e.target.value)}
                                    className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 outline-none"
                                    placeholder="Leave empty for public"
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 text-gray-300 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
