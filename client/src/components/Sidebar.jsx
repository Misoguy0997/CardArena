import React, { useEffect, useRef } from 'react';

export const Sidebar = ({ gameLog, hoveredCard }) => {
    const logEndRef = useRef(null);

    // 로그가 업데이트될 때마다 스크롤을 맨 아래로 이동
    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [gameLog]);

    return (
        <div className="w-80 bg-gray-800 border-l-2 border-gray-700 flex flex-col h-screen sticky top-0">
            {/* Card Detail */}
            <div className="p-4 border-b-2 border-gray-700 bg-gray-900 flex-shrink-0">
                <h3 className="text-lg font-bold text-yellow-400 mb-3">📋 Card Detail</h3>
                {hoveredCard ? (
                    <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                        {hoveredCard.image && (
                            <div className="mb-3 rounded-lg overflow-hidden h-32 w-full bg-gray-900 border border-gray-600">
                                <img
                                    src={hoveredCard.image}
                                    alt={hoveredCard.name}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        )}
                        <h4 className="text-xl font-bold text-white mb-2">{hoveredCard.name}</h4>
                        <p className="text-sm text-gray-300 mb-3">{hoveredCard.description}</p>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Type:</span>
                                <span className="text-white font-semibold capitalize">{hoveredCard.type}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Cost:</span>
                                <span className="text-yellow-400 font-bold">{hoveredCard.cost} MP</span>
                            </div>

                            {hoveredCard.type === 'character' && (
                                <>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Attack:</span>
                                        <span className="text-red-400 font-bold">⚔️ {hoveredCard.atk}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Health:</span>
                                        <span className="text-green-400 font-bold">❤️ {hoveredCard.currentHp || hoveredCard.hp}</span>
                                    </div>
                                </>
                            )}

                            {hoveredCard.effect && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Effect:</span>
                                    <span className="text-purple-400 font-bold">{hoveredCard.effect}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="text-gray-500 text-center py-8">
                        Hover over a card to see details
                    </div>
                )}
            </div>

            {/* Game Log */}
            <div className="flex-1 p-4 overflow-y-auto min-h-0">
                <h3 className="text-lg font-bold text-yellow-400 mb-3">📜 Game Log</h3>
                <div className="space-y-2">
                    {gameLog && gameLog.map((log, idx) => (
                        <div
                            key={idx}
                            className="bg-gray-900 p-2 rounded text-sm text-gray-300 border-l-2 border-blue-500"
                        >
                            <span className="text-gray-500 text-xs">[{log.timestamp}]</span>
                            <p className="mt-1">{log.message}</p>
                        </div>
                    ))}
                    <div ref={logEndRef} />
                </div>
            </div>
        </div>
    );
};
