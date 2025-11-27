import React from 'react';

export const CenterZone = ({ turn, currentPlayer, myId, phase, onNextPhase, onEndTurn }) => {
    const isMyTurn = currentPlayer === myId;

    const getPhaseName = (p) => {
        switch (p) {
            case 'draw': return 'Draw Phase';
            case 'main': return 'Main Phase';
            case 'battle': return 'Battle Phase';
            case 'end': return 'End Phase';
            default: return p;
        }
    };

    return (
        <div className="bg-gray-900 bg-opacity-80 p-8 rounded-lg border-2 border-yellow-500 text-center min-w-[300px]">
            <div className="mb-4">
                <h2 className="text-4xl font-bold text-yellow-400">Turn {turn}</h2>
            </div>

            <div className={`text-2xl font-semibold mb-4 ${isMyTurn ? 'text-green-400' : 'text-red-400'}`}>
                {isMyTurn ? '🟢 Your Turn' : '🔴 Opponent\'s Turn'}
            </div>

            <div className="text-xl text-blue-300 font-bold mb-6 border-b border-gray-600 pb-2">
                {getPhaseName(phase)}
            </div>

            {isMyTurn && (
                <div className="flex flex-col gap-2">
                    {phase === 'main' && (
                        <button
                            onClick={onNextPhase}
                            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded transition-all"
                        >
                            ⚔️ Enter Battle Phase
                        </button>
                    )}
                    {phase === 'battle' && (
                        <button
                            onClick={onNextPhase}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded transition-all"
                        >
                            End Battle Phase
                        </button>
                    )}
                    {phase === 'end' && (
                        <button
                            onClick={onEndTurn}
                            className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded transition-all"
                        >
                            ⏭️ End Turn
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};
