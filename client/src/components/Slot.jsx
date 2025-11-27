import React from 'react';
import { Card } from './Card';

export const Slot = ({ card, index, onClick, onCardHover, canAttack = false }) => {
    return (
        <div
            className={`w-28 h-36 border-2 border-dashed rounded-lg flex items-center justify-center transition-all ${card ? 'border-gray-400 bg-gray-800' : 'border-gray-600 bg-gray-900 hover:bg-gray-800'
                } ${canAttack ? 'ring-2 ring-yellow-400 animate-pulse' : ''}`}
            onClick={() => onClick && onClick(index)}
        >
            {card ? (
                <div className="relative">
                    <Card card={card} onHover={onCardHover} />
                    {canAttack && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold animate-bounce">
                            ⚡
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-gray-600 text-sm">Empty</div>
            )}
        </div>
    );
};
