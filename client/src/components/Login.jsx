import React, { useState } from 'react';

export const Login = ({ onLogin, onRegister }) => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [nickname, setNickname] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (!username || !password) {
            setError('Please fill in all fields');
            return;
        }

        if (isRegistering) {
            if (!nickname) {
                setError('Nickname is required for registration');
                return;
            }
            onRegister(username, password, nickname);
        } else {
            onLogin(username, password);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-700 w-96">
                <h2 className="text-3xl font-bold text-white mb-6 text-center">
                    {isRegistering ? 'Create Account' : 'Login'}
                </h2>

                {error && (
                    <div className="bg-red-500 text-white p-2 rounded mb-4 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 outline-none"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 outline-none"
                    />

                    {isRegistering && (
                        <input
                            type="text"
                            placeholder="Nickname"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            className="p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 outline-none"
                        />
                    )}

                    <button
                        type="submit"
                        className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded transition-colors"
                    >
                        {isRegistering ? 'Sign Up' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-4 text-center">
                    <button
                        onClick={() => setIsRegistering(!isRegistering)}
                        className="text-gray-400 hover:text-white text-sm underline"
                    >
                        {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
                    </button>
                </div>
            </div>
        </div>
    );
};
