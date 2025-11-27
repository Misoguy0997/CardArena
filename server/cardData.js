const cards = [
    // Character Cards
    { id: 1, name: 'Warrior', type: 'character', cost: 2, atk: 3, hp: 6, description: 'A basic warrior unit.', image: 'https://cdn-icons-png.flaticon.com/512/190/190669.png' },
    { id: 2, name: 'Archer', type: 'character', cost: 3, atk: 4, hp: 5, description: 'High attack, low defense.', image: 'https://cdn-icons-png.flaticon.com/512/3063/3063056.png' },
    { id: 3, name: 'Knight', type: 'character', cost: 4, atk: 3, hp: 8, description: 'Defensive unit with high HP.', image: 'https://cdn-icons-png.flaticon.com/512/1086/1086432.png' },
    { id: 4, name: 'Mage', type: 'character', cost: 5, atk: 6, hp: 6, description: 'Powerful spell caster.', image: 'https://cdn-icons-png.flaticon.com/512/2316/2316885.png' },
    { id: 5, name: 'Dragon', type: 'character', cost: 7, atk: 8, hp: 11, description: 'Legendary creature.', image: 'https://cdn-icons-png.flaticon.com/512/3063/3063823.png' },

    // Custom Card (RedOtto)
    { id: 101, name: 'RedOtto', type: 'character', cost: 8, atk: 10, hp: 15, description: "It's a familiar spirit.", image: 'https://i.postimg.cc/JnkBsXPh/redottospirit-tumyeong.png' },

    // Item Cards
    { id: 201, name: 'Healing Potion', type: 'item', cost: 2, effect: 'heal', value: 5, description: 'Restore 5 HP to your hero.', image: 'https://cdn-icons-png.flaticon.com/512/867/867927.png' },
    { id: 202, name: 'Power Buff', type: 'item', cost: 3, effect: 'buff', value: 2, description: 'All friendly characters gain +2 ATK.', image: 'https://cdn-icons-png.flaticon.com/512/3014/3014524.png' },
    { id: 203, name: 'Fireball', type: 'item', cost: 4, effect: 'damage', value: 5, description: 'Deal 5 damage to the opponent.', image: 'https://cdn-icons-png.flaticon.com/512/996/996365.png' },
    { id: 204, name: 'Power Down', type: 'item', cost: 1, effect: 'debuff', value: 1, description: "Reduces the attack power of the designated opponent's character card by 1.", image: 'https://cdn-icons-png.flaticon.com/512/3014/3014524.png' }, // Using generic buff icon for now
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
    ].map((card, index) => ({ ...card, deckId: `${card.id}_${index}` }));
}

module.exports = { getCardById, getInitialDeck };
