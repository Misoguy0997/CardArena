import React from 'react';

export const Card = ({ card, onClick, onHover, isDraggable = false, isHidden = false }) => {
    if (isHidden) {
        return (
            <div className="w-24 h-32 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg border-2 border-purple-400 shadow-lg flex items-center justify-center">
                <div className="text-white text-4xl">🎴</div>
            </div>
        );
    }

    if (!card) return null;
    const isCharacter = card.type === 'character';

    return (
        <div
            className={`w-24 h-32 rounded-lg border-2 shadow-lg cursor-pointer transition-all transform hover:scale-105 hover:shadow-xl relative overflow-hidden ${isCharacter ? 'bg-gray-800 border-orange-500' : 'bg-gray-800 border-blue-500'
                }`}
            onClick={onClick}
            onMouseEnter={() => onHover && onHover(card)}
            onMouseLeave={() => onHover && onHover(null)}
            draggable={isDraggable}
        >
            {/* Background Image */}
            {card.image ? (
                <img src={card.image} alt={card.name} className="absolute inset-0 w-full h-full object-cover opacity-50" />
            ) : (
                <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-30">
                    {isCharacter ? '⚔️' : '✨'}
                </div>
            )}

            <div className="relative h-full flex flex-col p-1 text-white z-10">
                {/* Cost Badge */}
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full border border-white flex items-center justify-center font-bold text-black text-xs shadow-md">
                    {card.cost}
                </div>

                {/* Card Name */}
                <div className="text-[10px] font-bold text-center mb-1 bg-black bg-opacity-60 rounded px-1 truncate border border-gray-600">
                    {card.name}
                </div>

                {/* Spacer */}
                <div className="flex-1"></div>

                {/* Description (Small) */}
                <div className="text-[8px] leading-tight text-center bg-black bg-opacity-70 rounded p-1 mb-1 border border-gray-700 h-8 overflow-hidden">
                    {card.description}
                </div>

                {/* Stats */}
                {isCharacter && (
                    <div className="flex justify-between text-[10px] font-bold gap-1">
                        <span className="bg-red-700 px-1 rounded border border-red-500 flex-1 text-center shadow">⚔️{card.atk}</span>
                        <span className="bg-green-700 px-1 rounded border border-green-500 flex-1 text-center shadow">❤️{card.currentHp || card.hp}</span>
                    </div>
                )}
            </div>
        </div>
    );
};
