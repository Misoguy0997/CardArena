const { getCardById, getInitialDeck } = require('./cardData');

class GameState {
    constructor(roomId, player1Id, player1Name, player2Id, player2Name, firstPlayer) {
        this.roomId = roomId;
        this.turn = 1;
        this.currentPlayer = firstPlayer;
        this.firstPlayer = firstPlayer;
        this.phase = 'draw'; // draw, main, battle, end
        this.gameLog = [];

        this.players = {
            [player1Id]: this.createPlayerState(player1Id, player1Name),
            [player2Id]: this.createPlayerState(player2Id, player2Name)
        };

        // 초기 카드 드로우
        this.drawCards(player1Id, 3);
        this.drawCards(player2Id, 3);

        const firstPlayerName = this.players[firstPlayer].name;
        this.addLog(`Game started! First player: ${firstPlayerName}`);
    }

    createPlayerState(playerId, name) {
        return {
            id: playerId,
            name: name || 'Unknown',
            hp: 40,
            maxHp: 40,
            mp: 0,
            maxMp: 20,
            deck: this.shuffleDeck(getInitialDeck()),
            hand: [],
            field: [null, null, null, null, null], // 5 slots
            graveyard: [],
            attackedThisTurn: [] // 이번 턴에 공격한 카드 ID 목록
        };
    }

    shuffleDeck(deck) {
        // Debug logging for card stats
        if (deck.length > 0) {
            console.log('Deck creation debug - First card:', deck[0].name, 'HP:', deck[0].hp);
        }

        const shuffled = [...deck];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    drawCards(playerId, count = 1) {
        const player = this.players[playerId];
        for (let i = 0; i < count; i++) {
            if (player.deck.length > 0) {
                const card = player.deck.pop();
                player.hand.push({ ...card, instanceId: Date.now() + Math.random() });
                this.addLog(`${playerId} drew a card`);
            }
        }
    }

    startTurn() {
        const player = this.players[this.currentPlayer];

        // MP 회복 (+4, 최대 20, 누적)
        player.mp = Math.min(player.mp + 4, 20);

        // 카드 드로우
        this.drawCards(this.currentPlayer, 1);

        // 공격 가능 상태 초기화
        player.attackedThisTurn = [];

        this.phase = 'main'; // 드로우 후 메인 페이즈 시작
        this.addLog(`Turn ${this.turn}: ${this.currentPlayer}'s turn starts (Main Phase)`);
    }

    nextPhase(playerId) {
        if (this.currentPlayer !== playerId) return { success: false, error: 'Not your turn' };

        if (this.phase === 'main') {
            this.phase = 'battle';
            this.addLog(`${playerId} entered Battle Phase`);
        } else if (this.phase === 'battle') {
            this.phase = 'end';
            this.addLog(`${playerId} entered End Phase`);
        } else {
            return { success: false, error: 'Cannot change phase' };
        }

        return { success: true };
    }

    endTurn() {
        if (this.phase !== 'end') {
            // 강제로 턴 종료 시 (예외 처리)
            this.addLog(`${this.currentPlayer} ended turn early`);
        }

        const nextPlayer = Object.keys(this.players).find(id => id !== this.currentPlayer);
        this.currentPlayer = nextPlayer;
        this.turn++;
        this.startTurn();
    }

    playCard(playerId, cardInstanceId, slotIndex) {
        // 메인 페이즈에만 카드 사용 가능
        if (this.phase !== 'main') {
            return { success: false, error: 'Can only play cards in Main Phase' };
        }

        const player = this.players[playerId];
        const cardIndex = player.hand.findIndex(c => c.instanceId === cardInstanceId);

        if (cardIndex === -1) {
            return { success: false, error: 'Card not in hand' };
        }

        const card = player.hand[cardIndex];

        // MP 확인
        if (player.mp < card.cost) {
            return { success: false, error: 'Not enough MP' };
        }

        if (card.type === 'character') {
            // 필드 슬롯 확인
            if (slotIndex < 0 || slotIndex >= 5 || player.field[slotIndex] !== null) {
                return { success: false, error: 'Invalid slot' };
            }

            // 캐릭터 소환
            player.field[slotIndex] = {
                ...card,
                currentHp: card.hp,
                summonedTurn: this.turn,
                canAttack: false // 소환 후유증
            };
            player.hand.splice(cardIndex, 1);
            player.mp -= card.cost;

            this.addLog(`${playerId} summoned ${card.name} to slot ${slotIndex + 1}`);
            return { success: true };

        } else if (card.type === 'item') {
            // 아이템 사용
            const result = this.applyItemEffect(playerId, card, slotIndex);
            if (!result.success) {
                return result;
            }

            player.hand.splice(cardIndex, 1);
            player.graveyard.push(card);
            player.mp -= card.cost;

            this.addLog(`${playerId} used item ${card.name}`);
            return { success: true };
        }

        return { success: false, error: 'Unknown card type' };
    }

    applyItemEffect(playerId, card, targetSlot = null) {
        const player = this.players[playerId];
        const opponent = this.players[Object.keys(this.players).find(id => id !== playerId)];

        switch (card.effect) {
            case 'heal':
                player.hp = Math.min(player.hp + card.value, player.maxHp || 40);
                this.addLog(`${playerId} healed ${card.value} HP`);
                return { success: true };
            case 'buff':
                // 필드의 모든 캐릭터 강화
                player.field.forEach(slot => {
                    if (slot) slot.atk += card.value;
                });
                this.addLog(`${playerId} buffed all characters by ${card.value} ATK`);
                return { success: true };
            case 'damage':
                opponent.hp -= card.value;
                this.addLog(`${playerId} dealt ${card.value} damage to opponent`);
                return { success: true };
            case 'debuff':
                // 상대 캐릭터 공격력 감소
                if (targetSlot === null || targetSlot < 0 || targetSlot >= 5) {
                    return { success: false, error: 'Invalid target slot' };
                }
                const targetCard = opponent.field[targetSlot];
                if (!targetCard) {
                    return { success: false, error: 'No card in target slot' };
                }
                targetCard.atk = Math.max(0, targetCard.atk - card.value);
                this.addLog(`${playerId} reduced ${targetCard.name}'s ATK by ${card.value}`);
                return { success: true };
                targetCard.atk = Math.max(0, targetCard.atk - card.value);
                this.addLog(`${playerId} reduced ${targetCard.name}'s ATK by ${card.value}`);
                return { success: true };
            case 'mp_restore':
                player.mp = Math.min(player.mp + card.value, player.maxMp || 20);
                this.addLog(`${playerId} restored ${card.value} MP`);
                return { success: true };
            case 'draw':
                this.drawCards(playerId, card.value);
                // Log is already handled in drawCards, but we can add a specific item log
                this.addLog(`${playerId} used Extra Draw to draw ${card.value} cards`);
                return { success: true };
            case 'destroy':
                // 상대 필드 전체 파괴
                let destroyedCount = 0;
                opponent.field.forEach((card, index) => {
                    if (card) {
                        opponent.graveyard.push(card);
                        opponent.field[index] = null;
                        destroyedCount++;
                    }
                });
                this.addLog(`${playerId} used Obliterate to destroy ALL (${destroyedCount}) opponent characters!`);
                return { success: true };
            default:
                return { success: false, error: 'Unknown effect' };
        }
    }

    attack(attackerId, attackerSlot, targetPlayerId, targetSlot = null) {
        // 배틀 페이즈에만 공격 가능
        if (this.phase !== 'battle') {
            return { success: false, error: 'Can only attack in Battle Phase' };
        }

        const attacker = this.players[attackerId];
        const target = this.players[targetPlayerId];

        // 공격 가능 여부 확인
        const attackingCard = attacker.field[attackerSlot];
        if (!attackingCard) {
            return { success: false, error: 'No card in attacker slot' };
        }

        // 선공 첫 턴 공격 제한
        if (this.turn === 1 && attackerId === this.firstPlayer) {
            return { success: false, error: 'First player cannot attack on turn 1' };
        }

        // 소환 후유증 확인 (첫 턴 선공 플레이어만 제한)
        if (this.turn === 1 && attackerId === this.firstPlayer && attackingCard.summonedTurn === this.turn) {
            return { success: false, error: 'First player cannot attack on turn 1' };
        }

        // 이미 공격했는지 확인
        if (attacker.attackedThisTurn.includes(attackerSlot)) {
            return { success: false, error: 'Already attacked this turn' };
        }

        // Check for Friendly Fire (Heal Ability)
        if (attackerId === targetPlayerId) {
            if (attackingCard.ability !== 'heal_ally') {
                return { success: false, error: 'Cannot attack friendly units' };
            }

            if (targetSlot === null) {
                // Heal Player
                attacker.hp = Math.min(attacker.hp + 3, attacker.maxHp || 40);
                this.addLog(`${attackerId}'s ${attackingCard.name} healed Player for 3 HP`);

                attacker.attackedThisTurn.push(attackerSlot);
                return { success: true };
            }

            const targetCard = attacker.field[targetSlot];
            if (!targetCard) {
                return { success: false, error: 'No target card' };
            }

            // Heal Logic
            targetCard.currentHp = Math.min(targetCard.currentHp + 3, targetCard.hp);
            this.addLog(`${attackerId}'s ${attackingCard.name} healed ${targetCard.name} for 3 HP`);

            // Count as attack
            attacker.attackedThisTurn.push(attackerSlot);
            return { success: true };
        }

        if (targetSlot !== null) {
            // 캐릭터 공격
            const targetCard = target.field[targetSlot];
            if (!targetCard) {
                return { success: false, error: 'No target card' };
            }

            // 전투 처리
            targetCard.currentHp -= attackingCard.atk;
            // attackingCard.currentHp -= targetCard.atk; // 반격 제거 (일방적 공격)

            this.addLog(`${attackerId}'s ${attackingCard.name} attacked ${targetCard.name}`);

            // 파괴 확인
            if (targetCard.currentHp <= 0) {
                target.graveyard.push(targetCard);
                target.field[targetSlot] = null;
                this.addLog(`${targetCard.name} was destroyed`);
            }

        } else {
            // 플레이어 직접 공격
            // 상대 필드에 카드가 있는지 확인 (도발 규칙)
            const hasGuards = target.field.some(card => card !== null);
            if (hasGuards) {
                return { success: false, error: 'Cannot attack directly while opponent has characters' };
            }

            target.hp -= attackingCard.atk;
            this.addLog(`${attackerId} dealt ${attackingCard.atk} damage to ${targetPlayerId}`);
        }

        // 공격 완료 표시
        attacker.attackedThisTurn.push(attackerSlot);

        // 승리 조건 확인
        if (target.hp <= 0) {
            this.addLog(`🏆 ${attackerId} wins!`);
            return { success: true, winner: attackerId };
        }

        return { success: true };
    }

    surrender(playerId) {
        if (this.currentPlayer !== playerId) {
            // Optional: Allow surrender even if not turn? User said "when it's their turn".
            // But usually surrender is allowed anytime.
            // User request: "자신의 턴일 때 언제든 항복할 수 있는 버튼" (Button that allows surrender anytime *when it's their turn*)
            // So I will enforce turn check.
            return { success: false, error: 'Can only surrender during your turn' };
        }

        const player = this.players[playerId];
        player.hp = 0; // Set HP to 0 to trigger loss

        const opponentId = Object.keys(this.players).find(id => id !== playerId);
        this.addLog(`🏳️ ${playerId} surrendered!`);

        return { success: true, winner: opponentId };
    }

    getPlayerName(playerId) {
        return this.players[playerId]?.name || playerId;
    }

    addLog(message) {
        // Replace player IDs with names in the message if possible
        let formattedMessage = message;
        Object.values(this.players).forEach(player => {
            formattedMessage = formattedMessage.replace(new RegExp(player.id, 'g'), player.name);
        });

        this.gameLog.push({
            timestamp: new Date().toLocaleTimeString(),
            message: formattedMessage
        });
    }

    getPublicState(forPlayerId) {
        const opponentId = Object.keys(this.players).find(id => id !== forPlayerId);
        const opponent = this.players[opponentId];

        if (!this.players[forPlayerId]) {
            console.error(`[GameState] Error: Player ${forPlayerId} not found in room ${this.roomId}`);
            return null;
        }

        return {
            roomId: this.roomId,
            turn: this.turn,
            currentPlayer: this.currentPlayer,
            phase: this.phase,
            gameLog: this.gameLog,
            myId: forPlayerId,
            players: {
                [forPlayerId]: this.players[forPlayerId],
                opponent: opponent ? {
                    ...opponent,
                    hand: opponent.hand.map(() => ({ hidden: true })), // 상대 핸드는 숨김
                    deck: [] // 덱도 숨김
                } : null
            }
        };
    }
}

module.exports = GameState;
