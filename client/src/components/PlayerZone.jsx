import React, { useState } from 'react';
import { Slot } from './Slot';
import { Card } from './Card';

export const PlayerZone = ({
    player,
    isMyTurn,
    onPlayCard,
    onAttack,
    onEndTurn,
    onCardHover,
    myId,
    opponentId,
    opponent,
    attackMode,
    setAttackMode,
    selectedAttacker,
    setSelectedAttacker,
    itemTargetMode,
    setItemTargetMode,
    setSelectedItem
}) => {
    const [selectedCard, setSelectedCard] = useState(null);

    // 상대 필드에 카드가 있는지 확인 (도발 규칙)
    const hasGuards = opponent?.field?.some(card => card !== null);

    if (!player) return null;

    const handleCardClick = (card) => {
        if (!isMyTurn) return;
        setSelectedCard(card);
        setAttackMode(false);
        setItemTargetMode(false);
    };

    const handleSlotClick = (slotIndex) => {
        if (!isMyTurn) return;

        if (selectedCard && selectedCard.type === 'character') {
            // 캐릭터 소환
            onPlayCard(selectedCard.instanceId, slotIndex);
            setSelectedCard(null);
        } else if (attackMode && selectedAttacker !== null) {
            // 캐릭터 공격 (상대 캐릭터 선택)
            onAttack(selectedAttacker, opponentId, slotIndex);
            setAttackMode(false);
            setSelectedAttacker(null);
        }
    };

    const handleAttackerSelect = (slotIndex) => {
        if (!isMyTurn) return;
        const card = player.field[slotIndex];
        if (card && !player.attackedThisTurn.includes(slotIndex)) {
            setAttackMode(true);
            setSelectedAttacker(slotIndex);
            setSelectedCard(null);
            setItemTargetMode(false);
        }
    };

    const handleDirectAttack = () => {
        if (attackMode && selectedAttacker !== null) {
            onAttack(selectedAttacker, opponentId, null);
            setAttackMode(false);
            setSelectedAttacker(null);
        }
    };

    const handleUseItem = (card) => {
        if (!isMyTurn) return;

        if (card.effect === 'debuff') {
            // 타겟팅이 필요한 아이템
            setItemTargetMode(true);
            setSelectedItem(card);
            setSelectedCard(null);
            setAttackMode(false);
        } else {
            // 즉시 사용 아이템
            onPlayCard(card.instanceId, null);
            setSelectedCard(null);
        }
    };

    return (
        <div className="relative bg-gradient-to-t from-blue-900 to-blue-800 p-6 rounded-lg border-2 border-blue-600">
            {/* HP/MP Bar */}
            <div className="mb-4 flex items-center justify-between">
                <div className="flex-1 mr-4">
                    <div className="flex justify-between text-sm text-white mb-1">
                        <span>❤️ HP: {player.hp}/{player.maxHp || 40}</span>
                        <span>💎 MP: {player.mp}/{player.maxMp || 20}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-4">
                        <div
                            className="bg-green-500 h-4 rounded-full transition-all"
                            style={{ width: `${(player.hp / (player.maxHp || 40)) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* My Field */}
            <div className="mb-4 flex justify-center gap-3">
                {player.field && player.field.map((card, idx) => (
                    <Slot
                        key={idx}
                        card={card}
                        index={idx}
                        onClick={() => {
                            if (selectedCard) {
                                handleSlotClick(idx);
                            } else if (attackMode && selectedAttacker !== null) {
                                const attacker = player.field[selectedAttacker];
                                // If attacker is OttoS (heal_ally) and clicking friendly unit (including self)
                                if (attacker?.ability === 'heal_ally' && card) {
                                    onAttack(selectedAttacker, myId, idx);
                                    setAttackMode(false);
                                    setSelectedAttacker(null);
                                } else {
                                    handleAttackerSelect(idx);
                                }
                            } else {
                                handleAttackerSelect(idx);
                            }
                        }}
                        onCardHover={onCardHover}
                        canAttack={isMyTurn && card && !player.attackedThisTurn.includes(idx) && card.summonedTurn !== player.turn}
                    />
                ))}
            </div>

            {/* My Hand */}
            <div className="mb-4 flex justify-center gap-2 flex-wrap">
                {player.hand && player.hand.map((card) => (
                    <div
                        key={card.instanceId}
                        className={`${selectedCard?.instanceId === card.instanceId ? 'ring-4 ring-yellow-400' : ''} ${itemTargetMode && card.effect === 'debuff' ? 'ring-4 ring-purple-500' : ''}`}
                        onClick={() => card.type === 'character' ? handleCardClick(card) : handleUseItem(card)}
                    >
                        <Card card={card} onHover={onCardHover} isDraggable={isMyTurn} />
                    </div>
                ))}
                {attackMode && (
                    <button
                        onClick={handleDirectAttack}
                        disabled={hasGuards}
                        className={`px-6 py-3 font-bold rounded-lg transition-all ${hasGuards
                            ? 'bg-gray-500 cursor-not-allowed opacity-50'
                            : 'bg-red-600 hover:bg-red-700 text-white'
                            }`}
                        title={hasGuards ? "Cannot attack directly while opponent has characters" : "Attack opponent directly"}
                    >
                        {hasGuards ? "🛡️ Blocked" : "🎯 Direct Attack"}
                    </button>
                )}

                {(attackMode || itemTargetMode) && (
                    <button
                        onClick={() => {
                            setAttackMode(false);
                            setSelectedAttacker(null);
                            setItemTargetMode(false);
                            setSelectedItem(null);
                        }}
                        className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition-all"
                    >
                        Cancel
                    </button>
                )}
            </div>

            {/* Status Messages */}
            {!isMyTurn && (
                <div className="mt-3 text-center text-yellow-300 font-semibold">
                    Waiting for opponent...
                </div>
            )}

            {selectedCard && (
                <div className="mt-3 text-center text-green-300 font-semibold">
                    Select a slot to summon {selectedCard.name}
                </div>
            )}

            {attackMode && (
                <div className="mt-3 text-center text-red-300 font-semibold animate-pulse">
                    Select target or click Direct Attack!
                </div>
            )}

            {itemTargetMode && (
                <div className="mt-3 text-center text-purple-300 font-semibold animate-pulse">
                    Select an opponent's character to apply effect!
                </div>
            )}

            {/* Nickname Display */}
            <div className="absolute bottom-2 right-4 text-white font-bold text-lg opacity-80 bg-black bg-opacity-30 px-3 py-1 rounded">
                {player.name || 'Player'} (You)
            </div>
        </div>
    );
};
