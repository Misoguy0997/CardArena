import React, { useState } from 'react';
import { OpponentZone } from './OpponentZone';
import { PlayerZone } from './PlayerZone';
import { CenterZone } from './CenterZone';
import { Sidebar } from './Sidebar';

export const GameBoard = ({ gameState, onPlayCard, onAttack, onEndTurn, onNextPhase, onSurrender }) => {
    const [hoveredCard, setHoveredCard] = useState(null);

    const [attackMode, setAttackMode] = useState(false);
    const [selectedAttacker, setSelectedAttacker] = useState(null);

    const [itemTargetMode, setItemTargetMode] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const [showSurrenderModal, setShowSurrenderModal] = useState(false);

    if (!gameState || !gameState.players) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white text-2xl">Loading game...</div>
            </div>
        );
    }

    const myId = gameState.myId;
    const myPlayer = gameState.players[myId];
    const opponent = gameState.players.opponent;
    const isMyTurn = gameState.currentPlayer === myId;
    const phase = gameState.phase;

    // 상대방의 실제 ID 찾기
    const opponentId = gameState.players.opponent?.id;

    const handleOpponentSlotClick = (slotIndex) => {
        if (attackMode && selectedAttacker !== null) {
            onAttack(selectedAttacker, opponentId, slotIndex);
            setAttackMode(false);
            setSelectedAttacker(null);
        } else if (itemTargetMode && selectedItem) {
            onPlayCard(selectedItem.instanceId, slotIndex);
            setItemTargetMode(false);
            setSelectedItem(null);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex">
            {/* Main Game Area */}
            <div className="flex-1 flex flex-col p-4 gap-4">

                {/* Top: Opponent Zone */}
                <div className="flex-1">
                    <OpponentZone
                        player={opponent}
                        onSlotClick={handleOpponentSlotClick}
                        onCardHover={setHoveredCard}
                    />
                </div>

                {/* Center: Battle Zone */}
                <div className="flex-shrink-0">
                    <CenterZone
                        turn={gameState.turn}
                        currentPlayer={gameState.currentPlayer}
                        myId={myId}
                        phase={phase}
                        onNextPhase={onNextPhase}
                        onEndTurn={onEndTurn}
                    />
                </div>

                {/* Bottom: Player Zone */}
                <div className="flex-1">
                    <PlayerZone
                        player={myPlayer}
                        isMyTurn={isMyTurn}
                        onPlayCard={onPlayCard}
                        onAttack={onAttack}
                        onEndTurn={onEndTurn}
                        onCardHover={setHoveredCard}
                        myId={myId}
                        opponentId={opponentId}
                        opponent={opponent}
                        attackMode={attackMode}
                        setAttackMode={setAttackMode}
                        selectedAttacker={selectedAttacker}
                        setSelectedAttacker={setSelectedAttacker}
                        itemTargetMode={itemTargetMode}
                        setItemTargetMode={setItemTargetMode}
                        setSelectedItem={setSelectedItem}
                    />
                </div>
            </div>

            {/* Right: Sidebar */}
            <Sidebar gameLog={gameState.gameLog} hoveredCard={hoveredCard} />

            {/* Surrender Button */}
            {isMyTurn && (
                <button
                    onClick={() => setShowSurrenderModal(true)}
                    className="absolute top-4 right-80 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold shadow-lg z-50 border-2 border-red-400"
                    title="Surrender Game"
                >
                    🏳️ Surrender
                </button>
            )}

            {/* Surrender Confirmation Modal */}
            {showSurrenderModal && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100]">
                    <div className="bg-gray-800 p-8 rounded-2xl border-4 border-red-500 text-center shadow-2xl max-w-md w-full animate-bounce-in">
                        <h2 className="text-3xl font-bold text-white mb-4">🏳️ Surrender?</h2>
                        <p className="text-gray-300 mb-8 text-lg">
                            Are you sure you want to surrender?<br />
                            You will lose the game immediately.
                        </p>
                        <div className="flex justify-center gap-6">
                            <button
                                onClick={() => {
                                    onSurrender();
                                    setShowSurrenderModal(false);
                                }}
                                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-bold text-lg shadow-lg transform hover:scale-105 transition-all"
                            >
                                Yes, Surrender
                            </button>
                            <button
                                onClick={() => setShowSurrenderModal(false)}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-bold text-lg shadow-lg transform hover:scale-105 transition-all"
                            >
                                No, Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
