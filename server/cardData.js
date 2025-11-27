const cards = [
    // Character Cards
    { id: 1, name: 'Warrior', type: 'character', cost: 2, atk: 3, hp: 6, description: 'A basic warrior unit.', image: 'https://cdn-icons-png.flaticon.com/512/2822/2822374.png' },
    { id: 2, name: 'Archer', type: 'character', cost: 3, atk: 4, hp: 5, description: 'High attack, low defense.', image: 'https://cdn-icons-png.flaticon.com/512/6081/6081840.png' },
    { id: 3, name: 'Knight', type: 'character', cost: 4, atk: 3, hp: 8, description: 'Defensive unit with high HP.', image: 'https://cdn-icons-png.flaticon.com/512/6081/6081980.png' },
    { id: 4, name: 'Mage', type: 'character', cost: 5, atk: 6, hp: 6, description: 'Powerful spell caster.', image: 'https://cdn-icons-png.flaticon.com/512/6082/6082095.png' },
    { id: 5, name: 'Dragon', type: 'character', cost: 7, atk: 8, hp: 11, description: 'Legendary creature.', image: 'https://cdn-icons-png.flaticon.com/512/6082/6082019.png' },

    // Custom Card (RedOtto)
    { id: 101, name: 'RedOtto', type: 'character', cost: 8, atk: 10, hp: 15, description: "It's a familiar spirit.", image: 'https://i.postimg.cc/JnkBsXPh/redottospirit-tumyeong.png' },

    // Item Cards
    { id: 201, name: 'Healing Potion', type: 'item', cost: 2, effect: 'heal', value: 5, description: 'Restore 5 HP to your hero.', image: 'https://cdn-icons-png.flaticon.com/512/5790/5790413.png' },
    { id: 202, name: 'Power Buff', type: 'item', cost: 3, effect: 'buff', value: 2, description: 'All friendly characters gain +2 ATK.', image: 'https://cdn-icons-png.flaticon.com/512/7509/7509898.png' },
    { id: 203, name: 'Fireball', type: 'item', cost: 4, effect: 'damage', value: 5, description: 'Deal 5 damage to the opponent.', image: 'https://cdn-icons-png.flaticon.com/512/1744/1744990.png' },
    { id: 204, name: 'Power Down', type: 'item', cost: 1, effect: 'debuff', value: 1, description: "Reduces the attack power of the designated opponent's character card by 1.", image: 'https://cdn-icons-png.flaticon.com/512/6070/6070670.png' },
    { id: 205, name: 'MP Potion', type: 'item', cost: 0, effect: 'mp_restore', value: 2, description: 'Restore 2 MP to you.', image: 'https://cdn-icons-png.flaticon.com/512/12328/12328692.png' },
    { id: 206, name: 'Extra Draw', type: 'item', cost: 4, effect: 'draw', value: 2, description: 'Draw 2 more cards immediately', image: 'https://cdn-icons-png.flaticon.com/512/18616/18616159.png' },
];

function getCardById(id) {
    return cards.find(card => card.id === id);
}

function getInitialDeck() {
    // 초기 덱 구성 (각 카드 2-3장씩)
    return [
        ...Array(3).fill(cards[0]), // Warrior x3
        ...Array(3).fill(cards[1]), // Archer x3
        ...Array(2).fill(cards[2]), // Knight x2
        ...Array(2).fill(cards[3]), // Mage x2
        ...Array(1).fill(cards[4]), // Dragon x1
        ...Array(1).fill(cards[5]), // RedOtto x1
        ...Array(2).fill(cards[6]), // Healing Potion x2
        ...Array(2).fill(cards[7]), // Power Buff x2
        ...Array(1).fill(cards[8]), // Fireball x1
        ...Array(2).fill(cards[9]), // Power Down x2
        ...Array(2).fill(cards[10]), // MP Potion x2
        ...Array(1).fill(cards[11]), // Extra Draw x1 (Rare)
    ].map((card, index) => ({ ...card, deckId: `${card.id}_${index}` }));
}

module.exports = { getCardById, getInitialDeck };
