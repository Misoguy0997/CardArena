const { getInitialDeck, getCardById } = require('./cardData');

console.log('--- Verifying Card Data ---');
const deck = getInitialDeck();
const warrior = deck.find(c => c.name === 'Warrior');
console.log('Warrior from getInitialDeck:', warrior);

const warriorById = getCardById(1);
console.log('Warrior from getCardById:', warriorById);
