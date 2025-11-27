import React from 'react';
import { useGameSocket } from './hooks/useGameSocket';
import { GameBoard } from './components/GameBoard';
import { Login } from './components/Login';
import { Lobby } from './components/Lobby';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
    const {
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
    } = useGameSocket();

    return (
        <ErrorBoundary>
            <AppContent
                gameState={gameState}
                isConnected={isConnected}
                isWaiting={isWaiting}
                error={error}
                winner={winner}
                user={user}
                rooms={rooms}
                onlineUsers={onlineUsers}
                login={login}
                register={register}
                createRoom={createRoom}
                joinRoom={joinRoom}
                quickMatch={quickMatch}
                playCard={playCard}
                attack={attack}
                endTurn={endTurn}
                nextPhase={nextPhase}
            />
        </ErrorBoundary>
    );
}

const AppContent = ({
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
}) => {
    // 1. Not connected or Login View
    if (!user) {
        return (
            <div className="relative">
                <Login onLogin={login} onRegister={register} />
                {error && (
                    <div className="fixed top-4 right-4 bg-red-600 text-white px-6 py-4 rounded-lg shadow-lg animate-bounce">
                        ❌ {error}
                    </div>
                )}
                {!isConnected && (
                    <div className="fixed bottom-4 right-4 text-gray-500 text-sm">
                        Connecting to server...
                    </div>
                )}
            </div>
        );
    }

    // 2. Game View (Active Game)
    if (gameState) {
        // Victory/Defeat Screen
        if (winner) {
            const isWinner = winner === gameState?.myId || winner === 'you';
            return (
                <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 flex items-center justify-center">
                    <div className="bg-gray-800 p-12 rounded-2xl border-4 border-yellow-500 text-center">
                        <h1 className={`text-6xl font-bold mb-6 ${isWinner ? 'text-yellow-400' : 'text-red-400'}`}>
                            {isWinner ? '🏆 Victory!' : '💀 Defeat'}
                        </h1>
                        <p className="text-white text-2xl mb-8">
                            {isWinner ? 'Congratulations! You won the game!' : 'Better luck next time!'}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xl"
                        >
                            Back to Lobby
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="relative">
                <GameBoard
                    gameState={gameState}
                    onPlayCard={playCard}
                    onAttack={attack}
                    onEndTurn={endTurn}
                    onNextPhase={nextPhase}
                />
                {error && (
                    <div className="fixed top-4 right-4 bg-red-600 text-white px-6 py-4 rounded-lg shadow-lg animate-bounce">
                        ❌ {error}
                    </div>
                )}
            </div>
        );
    }

    // 3. Lobby View (Logged in, no game)
    return (
        <div className="relative">
            <Lobby
                user={user}
                rooms={rooms}
                onlineUsers={onlineUsers}
                onCreateRoom={createRoom}
                onJoinRoom={joinRoom}
                onQuickMatch={quickMatch}
            />

            {isWaiting && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
                    <div className="text-center">
                        <div className="text-6xl mb-4 animate-spin">⚔️</div>
                        <h2 className="text-2xl font-bold text-white mb-2">Finding Opponent...</h2>
                        <p className="text-gray-400">Please wait while we match you with a worthy foe.</p>
                    </div>
                </div>
            )}

            {error && (
                <div className="fixed top-4 right-4 bg-red-600 text-white px-6 py-4 rounded-lg shadow-lg animate-bounce">
                    ❌ {error}
                </div>
            )}
        </div>
    );
};

export default App;
