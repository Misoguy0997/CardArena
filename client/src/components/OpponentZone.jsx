import React from 'react';
import { Slot } from './Slot';
import { Card } from './Card';

export const OpponentZone = ({ player, onSlotClick, onCardHover }) => {
    if (!player) return null;

    return (
        <div className="relative bg-gradient-to-b from-red-900 to-red-800 p-6 rounded-lg border-2 border-red-600">
            {/* HP/MP Bar */}
            <div className="mb-4 flex items-center justify-between">
                <div className="flex-1 mr-4">
                    <div className="flex justify-between text-sm text-white mb-1">
                        <span>❤️ HP: {player.hp}/{player.maxHp || 40}</span>
                        <span>💎 MP: {player.mp}/{player.maxMp || 20}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-4">
                        <div
                            className="bg-red-500 h-4 rounded-full transition-all"
                            style={{ width: `${(player.hp / (player.maxHp || 40)) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Opponent Hand (Hidden) */}
            <div className="mb-4 flex justify-center gap-2">
                {player.hand && player.hand.map((_, idx) => (
                    <Card key={idx} card={{}} isHidden={true} />
                ))}
            </div>

            {/* Opponent Field */}
            <div className="flex justify-center gap-3">
                {player.field && player.field.map((card, idx) => (
                    <Slot
                        key={idx}
                        card={card}
                        index={idx}
                        onClick={onSlotClick}
                        onCardHover={onCardHover}
                    />
                ))}
            </div>

            {/* Nickname Display */}
            <div className="absolute bottom-2 right-4 text-white font-bold text-lg opacity-80 bg-black bg-opacity-30 px-3 py-1 rounded">
                {player.name || 'Opponent'}
            </div>
        </div>
    );
};
