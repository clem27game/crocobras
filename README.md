

# crocobras

Le cœur logique du jeu "Le bras d'un mec", un jeu où vous combattez des crocodiles pour protéger un bras !
Ce package Node.js fournit toutes les règles, la logique, et la gestion d'état nécessaires pour construire votre propre version du jeu. **Il ne contient PAS de graphiques, de sons ou de logique d'interface utilisateur (UI)**. C'est à vous, le développeur, de construire l'expérience visuelle et sonore !

Développé par [nekoclem](https://github.com/nekoclem).

## Fonctionnalités principales

* Gestion des niveaux et de la progression.
* Calcul du nombre de crocodiles par niveau.
* Gestion de la vie du bras et du "Game Over".
* Détection des événements clés du jeu (coup de feu, crocodile tué, bras mangé, changement de niveau).
* Options de personnalisation pour adapter le jeu à votre vision.

### Fonctionnalités v1.1.0
* **Système de power-ups personnalisés** avec `crocopow`
* **Système de boosts temporaires** avec `crocoboost`
* **Système de points de vie pour crocodiles** avec `crocolife`
* **Système d'armure/force des crocodiles** avec `crocoarmure`
* **Personnalisation de la vitesse des crocodiles** avec `crocorap`
* **Système de danse/esquive** avec `crocopop`
* **Explosions de crocodiles** avec `crocoexplose`

### 🆕 Nouveautés v1.2.0
* **Système de combos** avec `crocom` pour des effets spéciaux en chaîne
* **Modes de jeux personnalisés** avec `crocomode` pour créer des défis uniques
* **Armures spécialisées** avec `crocorpes` aux propriétés avancées
* **Système de dialogues** avec `crocodial` pour des interactions narratives
* **Missions et quêtes** avec `crocomise` avec récompenses personnalisées
* **Système économique complet** avec `crocomons` (monnaie et boutique)
* **Environnements dynamiques** avec `crocodym` pour des changements de terrain
* **Personnalisation d'assets** avec `crocopay` pour les apparences
* **IA avancée des crocodiles** avec `crocia` pour des comportements intelligents
* **Collectibles et succès** avec `crocohab` pour la progression
* **Messages créatifs** avec `crocotive` pour des dialogues immersifs
* **Personnages personnalisés** avec `croconage` pour enrichir l'univers

## Installation

```bash
npm install crocobras
```

Assurez-vous d'avoir également nekomaths installé, car crocobras en dépend :

```bash
npm install nekomaths
```

## Utilisation de base

crocobras exporte une classe CrocobrasGame. Vous devez instancier cette classe pour commencer à utiliser la logique du jeu.

```javascript
const CrocobrasGame = require('crocobras');

// Créez une nouvelle instance du jeu.
const game = new CrocobrasGame({
    initialArmHealth: 200, // Le bras est plus résistant !
    crocoDamage: 20,       // Moins de dégâts par croco
    crocoPerLevel: 2,      // Plus de crocos par niveau
    levelUpThreshold: 10   // 10 crocos pour passer de niveau
});

// Écoutez les événements du jeu
game.on('gameStarted', (data) => {
    console.log(`Partie démarrée ! Niveau: ${data.level}, Vie du bras: ${data.armHealth}`);
});

game.on('crocoKilled', (data) => {
    console.log(`Un croco tué ! Restant : ${data.remainingCount}/${data.killedCount + data.remainingCount}`);
});

// Démarrer le jeu
game.startGame();
```

## 🆕 Nouvelles fonctionnalités v1.2.0

### `crocom(comboType, comboLogic, options)` - Système de combos

Créez des systèmes de combos qui augmentent le score ou déclenchent des effets spéciaux.

```javascript
// Combo de kills consécutifs
game.crocom('killStreak', function(counter, options, context) {
    if (counter >= options.threshold) {
        const multiplier = Math.min(counter * 0.2, options.maxMultiplier);
        console.log(`Combo x${multiplier} ! ${counter} kills consécutifs !`);
        
        // Appliquer un bonus de score ou d'effet
        this.armHealth += 10; // Bonus de santé
        return { multiplier: multiplier, bonus: 'health' };
    }
    return false;
}, { 
    threshold: 3, 
    maxMultiplier: 5, 
    resetTime: 5000 
});

// Déclencher le combo à chaque kill
game.on('crocoKilled', () => {
    game.triggerCombo('killStreak');
});
```

### `crocomode(modeName, modeLogic, settings)` - Modes de jeux personnalisés

Créez vos propres modes de défis avec des règles spéciales.

```javascript
// Mode "Survie": résister le plus longtemps possible
game.crocomode('survival', function(settings, progress) {
    console.log('Mode Survie activé !');
    
    // Logique du mode: crocodiles plus rapides et plus résistants
    this.settings.crocoDamage *= 1.5;
    
    // Timer de difficulté croissante
    const difficultyTimer = setInterval(() => {
        if (this.isGameRunning) {
            this.settings.crocoPerLevel += 1;
            console.log('Difficulté augmentée !');
        } else {
            clearInterval(difficultyTimer);
        }
    }, 30000); // Chaque 30 secondes
    
}, {
    timeLimit: null,
    objectives: ['Survivre le plus longtemps possible'],
    difficulty: 'extreme'
});

// Activer le mode
game.activateGameMode('survival');
```

### `crocorpes(armorType, properties, armorLogic)` - Armures spécialisées

Créez des armures avec des propriétés spéciales et des effets uniques.

```javascript
// Armure régénératrice
game.crocorpes('regenerative', {
    defense: 25,
    resistance: { explosion: 0.5, poison: 0.8 },
    durability: 200,
    regenerationRate: 2
}, function(properties) {
    console.log('Armure régénératrice équipée !');
    
    // Régénération automatique
    const regenInterval = setInterval(() => {
        if (this.equippedArmor === 'regenerative' && this.armHealth < this.settings.initialArmHealth) {
            this.armHealth = Math.min(
                this.armHealth + properties.regenerationRate, 
                this.settings.initialArmHealth
            );
            this.emit('armorRegeneration', { health: this.armHealth });
        } else {
            clearInterval(regenInterval);
        }
    }, 1000);
});

// Équiper l'armure
game.equipArmor('regenerative');
```

### `crocodial(dialogueId, dialogueData, dialogueLogic)` - Système de dialogues

Créez des dialogues interactifs pour enrichir l'expérience narrative.

```javascript
// Dialogue d'introduction
game.crocodial('intro', {
    texts: [
        "Bienvenue dans l'arène des crocodiles !",
        "Votre bras est en danger, défendez-le !",
        "Que la bataille commence !"
    ],
    speaker: 'narrator',
    choices: [
        { text: "Commencer", action: 'start' },
        { text: "Instructions", action: 'help' }
    ]
}, function(data, context) {
    console.log(`Dialogue démarré: ${data.texts[0]}`);
    
    // Logique de dialogue interactif
    if (context.choice === 'start') {
        this.startGame();
    } else if (context.choice === 'help') {
        this.startDialogue('tutorial');
    }
});

// Démarrer le dialogue
game.startDialogue('intro');
```

### `crocomise(missionId, missionData, missionLogic)` - Missions et quêtes

Créez des missions avec des objectifs et des récompenses personnalisées.

```javascript
// Mission de survie
game.crocomise('firstSurvival', {
    title: 'Premier Combat',
    description: 'Survivez à votre premier combat contre les crocodiles',
    objectives: [
        'Tuer 10 crocodiles',
        'Garder au moins 50% de vie'
    ],
    rewards: {
        coins: 100,
        experience: 50,
        unlock: 'basic_armor'
    },
    difficulty: 'easy'
}, function(data, progress) {
    // Vérifier les objectifs
    progress.crocoKilled = this.killedCrocodilesThisLevel || 0;
    progress.healthPercentage = (this.armHealth / this.settings.initialArmHealth) * 100;
    
    const objective1 = progress.crocoKilled >= 10;
    const objective2 = progress.healthPercentage >= 50;
    
    if (objective1 && objective2) {
        this.completeMission('firstSurvival', {
            success: true,
            bonus: progress.healthPercentage > 80 ? 'perfect' : 'good'
        });
    }
});

// Démarrer la mission
game.startMission('firstSurvival');
```

### `crocomons(currencyName, shopData, purchaseLogic)` - Système économique

Créez votre propre système de monnaie et boutique avec des articles personnalisés.

```javascript
// Système de pièces d'or
game.crocomons('gold', {
    startingAmount: 50,
    currencyProperties: { symbol: '🪙', name: 'Pièces d\'or' },
    items: [
        { id: 'health_potion', name: 'Potion de santé', price: 25, effect: 'heal' },
        { id: 'armor_upgrade', name: 'Amélioration d\'armure', price: 100, effect: 'armor' },
        { id: 'rapid_fire', name: 'Tir rapide', price: 75, effect: 'powerup' }
    ],
    settings: { discountEvents: true, dailyDeals: true }
}, function(purchaseData) {
    const { itemId, quantity, currency, inventory } = purchaseData;
    const item = this.economy.shop.gold.items.find(i => i.id === itemId);
    
    if (!item) return { success: false, error: 'Article introuvable' };
    
    const totalCost = item.price * quantity;
    if (currency.amount < totalCost) {
        return { success: false, error: 'Pas assez de pièces' };
    }
    
    // Effectuer l'achat
    currency.amount -= totalCost;
    
    // Appliquer l'effet de l'article
    switch (item.effect) {
        case 'heal':
            this.armHealth = Math.min(
                this.armHealth + (50 * quantity), 
                this.settings.initialArmHealth
            );
            break;
        case 'armor':
            this.equipArmor('upgraded_armor');
            break;
        case 'powerup':
            this.activatePowerUp('rapidFire');
            break;
    }
    
    return { 
        success: true, 
        cost: totalCost, 
        effect: item.effect,
        newBalance: currency.amount 
    };
});

// Effectuer un achat
const result = game.purchase('gold', 'health_potion', 1);
if (result.success) {
    console.log('Potion achetée avec succès !');
}
```

### `crocodym(environmentId, environmentData, environmentLogic)` - Environnements dynamiques

Créez des environnements qui changent et affectent le gameplay.

```javascript
// Environnement orageux
game.crocodym('storm', {
    obstacles: [
        { type: 'lightning', frequency: 'high', damage: 30 },
        { type: 'rain', effect: 'visibility_reduced' }
    ],
    effects: ['reduced_visibility', 'random_lightning'],
    climate: 'stormy',
    visibility: 0.6
}, function(data, parameters) {
    console.log('Tempête activée ! Visibilité réduite et éclairs !');
    
    // Éclairs aléatoires qui endommagent le bras ou les crocodiles
    const lightningInterval = setInterval(() => {
        if (this.currentEnvironment === 'storm' && this.isGameRunning) {
            const lightningTarget = Math.random();
            
            if (lightningTarget < 0.3) {
                // Éclair frappe le bras
                this.armHealth -= 15;
                this.emit('environmentDamage', { 
                    type: 'lightning', 
                    target: 'arm', 
                    damage: 15 
                });
                console.log('⚡ Éclair frappe le bras !');
            } else if (lightningTarget < 0.7) {
                // Éclair frappe un crocodile (aide le joueur)
                this.crocokill();
                this.emit('environmentHelp', { 
                    type: 'lightning', 
                    target: 'crocodile' 
                });
                console.log('⚡ Éclair élimine un crocodile !');
            }
        } else {
            clearInterval(lightningInterval);
        }
    }, 3000);
});

// Activer l'environnement orageux
game.activateEnvironment('storm');
```

### `crocopay(assetType, assetData, customizationLogic)` - Personnalisation d'assets

Permettez aux joueurs de personnaliser l'apparence du jeu.

```javascript
// Skins de crocodiles
game.crocopay('crocodile', {
    id: 'golden_croco',
    name: 'Crocodile Doré',
    rarity: 'legendary',
    price: 500,
    unlocked: false,
    effects: ['golden_glow', 'increased_value']
}, function(data) {
    console.log(`Skin crocodile équipé: ${data.name}`);
    
    // Les crocodiles dorés donnent plus de points
    this.on('crocoKilled', (killData) => {
        if (this.equippedAssets.crocodile === 'golden_croco') {
            // Bonus de points ou de monnaie
            this.economy.currencies.gold.amount += 5;
            this.emit('bonusReward', { 
                type: 'golden_kill', 
                bonus: 5, 
                currency: 'gold' 
            });
        }
    });
});

// Arrière-plans personnalisés
game.crocopay('background', {
    id: 'sunset_beach',
    name: 'Plage au coucher de soleil',
    rarity: 'rare',
    price: 200,
    unlocked: true,
    ambiance: 'peaceful'
}, function(data) {
    console.log(`Arrière-plan changé: ${data.name}`);
    
    // Effet d'ambiance: régénération lente
    if (data.ambiance === 'peaceful') {
        const peaceInterval = setInterval(() => {
            if (this.equippedAssets.background === 'sunset_beach' && this.isGameRunning) {
                this.armHealth = Math.min(this.armHealth + 1, this.settings.initialArmHealth);
            } else {
                clearInterval(peaceInterval);
            }
        }, 5000);
    }
});

// Équiper les assets
game.equipAsset('crocodile', 'golden_croco');
game.equipAsset('background', 'sunset_beach');
```

### `crocia(crocoId, aiType, aiLogic, aiSettings)` - IA avancée des crocodiles

Créez des comportements d'IA intelligents et adaptatifs pour les crocodiles.

```javascript
// IA agressive qui apprend des patterns du joueur
game.crocia(1, 'adaptive_aggressive', function(aiData) {
    const { crocoId, gameState, aiState, settings, memory, context } = aiData;
    
    // Analyser les patterns du joueur
    const playerShots = memory.filter(m => m.type === 'player_shot').slice(-5);
    const avgShotInterval = playerShots.length > 1 ? 
        playerShots.reduce((sum, shot, i) => {
            if (i > 0) sum += shot.timestamp - playerShots[i-1].timestamp;
            return sum;
        }, 0) / (playerShots.length - 1) : 3000;
    
    let decision = { action: 'advance', newState: 'aggressive' };
    
    // Stratégie basée sur l'apprentissage
    if (avgShotInterval < 1000) {
        // Joueur tire rapidement -> esquiver plus
        decision = { 
            action: 'dodge', 
            newState: 'evasive',
            dodgeChance: 0.7 
        };
    } else if (gameState.armHealth < 50) {
        // Bras faible -> attaque coordonnée
        decision = { 
            action: 'coordinated_attack', 
            newState: 'hunting',
            aggression: 1.0 
        };
    } else if (settings.memory.length > 10) {
        // Beaucoup d'expérience -> comportement imprévisible
        const randomBehavior = Math.random();
        if (randomBehavior < 0.3) {
            decision = { action: 'feint', newState: 'deceptive' };
        } else if (randomBehavior < 0.6) {
            decision = { action: 'retreat', newState: 'cautious' };
        }
    }
    
    // Enregistrer la décision en mémoire
    settings.memory.push({
        timestamp: Date.now(),
        type: 'ai_decision',
        decision: decision.action,
        context: { armHealth: gameState.armHealth, level: gameState.currentLevel }
    });
    
    return decision;
}, {
    aggressiveness: 0.8,
    intelligence: 0.9,
    adaptability: 0.7,
    memory: []
});

// Mettre à jour l'IA régulièrement
setInterval(() => {
    if (game.isGameRunning) {
        game.updateCrocodileAI(1, { 
            playerAction: 'observing',
            timeElapsed: Date.now() 
        });
    }
}, 2000);
```

### `crocohab(collectibleType, collectibleData, collectibleLogic)` - Collectibles et succès

Créez des systèmes de collection et d'accomplissements.

```javascript
// Succès de précision
game.crocohab('achievement', {
    id: 'sharpshooter',
    name: 'Tireur d\'élite',
    description: 'Touchez 10 crocodiles d\'affilée sans rater',
    rarity: 'epic',
    rewards: { gold: 200, experience: 100, title: 'Sniper' },
    requirements: { consecutive_hits: 10 }
}, function(checkData) {
    const { gameState, context, progress } = checkData;
    
    if (context.eventType === 'shot_fired') {
        progress.shots = (progress.shots || 0) + 1;
    }
    
    if (context.eventType === 'crocodile_killed') {
        progress.hits = (progress.hits || 0) + 1;
        progress.consecutive_hits = (progress.consecutive_hits || 0) + 1;
    }
    
    if (context.eventType === 'shot_missed') {
        progress.consecutive_hits = 0; // Reset du compteur
    }
    
    // Vérifier si le succès est débloqué
    if (progress.consecutive_hits >= 10) {
        return { 
            unlocked: true, 
            progress: progress,
            perfectRun: progress.consecutive_hits > 15 // Bonus si > 15
        };
    }
    
    return { unlocked: false, progress: progress };
});

// Objets à collecter
game.crocohab('collectible', {
    id: 'rare_scale',
    name: 'Écaille Rare',
    description: 'Écaille dorée tombée d\'un crocodile légendaire',
    rarity: 'legendary',
    rewards: { gold: 50, crafting_material: 'golden_scale' },
    requirements: { kill_golden_crocodile: true }
}, function(checkData) {
    const { context } = checkData;
    
    // Se déclenche quand un crocodile doré est tué
    if (context.eventType === 'crocodile_killed' && context.crocodileType === 'golden') {
        const dropChance = Math.random();
        if (dropChance < 0.1) { // 10% de chance
            return { unlocked: true, dropChance: dropChance };
        }
    }
    
    return { unlocked: false };
});

// Vérifier les collectibles lors d'événements
game.on('crocoKilled', () => {
    game.checkCollectibles('achievement', { eventType: 'crocodile_killed' });
    game.checkCollectibles('collectible', { 
        eventType: 'crocodile_killed',
        crocodileType: 'golden' // Exemple
    });
});
```

### `crocotive(messageType, messageData, messageLogic)` - Messages créatifs

Ajoutez des dialogues immersifs et des commentaires dynamiques.

```javascript
// Messages des crocodiles
game.crocotive('crocodile_taunts', {
    messages: [
        "Tu ne peux pas nous arrêter tous !",
        "Ce bras a l'air délicieux...",
        "Prépare-toi à perdre !",
        "Nous sommes légion !",
        "Tu commences à fatiguer, humain !"
    ],
    frequency: 'random',
    speakers: ['Croco Alpha', 'Croco Veteran', 'Croco Sauvage'],
    conditions: { minLevel: 1, maxFrequency: 10000 }
}, function(messageData) {
    const { gameState, context, history } = messageData;
    
    // Logique pour choisir le message approprié
    let selectedMessage;
    let speaker;
    
    if (gameState.armHealth < 30) {
        selectedMessage = "Tu commences à fatiguer, humain !";
        speaker = "Croco Alpha";
    } else if (gameState.currentLevel > 5) {
        selectedMessage = "Nous sommes légion !";
        speaker = "Croco Veteran";
    } else {
        // Message aléatoire
        const randomIndex = Math.floor(Math.random() * messageData.data.messages.length);
        selectedMessage = messageData.data.messages[randomIndex];
        const speakerIndex = Math.floor(Math.random() * messageData.data.speakers.length);
        speaker = messageData.data.speakers[speakerIndex];
    }
    
    return { message: selectedMessage, speaker: speaker };
});

// Messages du bras (commentaires humoristiques)
game.crocotive('arm_comments', {
    messages: [
        "Aïe ! Ça pique !",
        "Heureusement que j'ai une bonne assurance...",
        "Je ne suis qu'un bras innocent !",
        "Pourquoi moi ?!",
        "J'aurais dû rester au lit ce matin..."
    ],
    frequency: 'on_damage',
    speakers: ['Le Bras']
}, function(messageData) {
    const { gameState, context } = messageData;
    
    if (context.eventType === 'arm_damaged') {
        const healthPercentage = (gameState.armHealth / this.settings.initialArmHealth) * 100;
        
        let message;
        if (healthPercentage < 20) {
            message = "Je ne suis qu'un bras innocent !";
        } else if (healthPercentage < 50) {
            message = "Aïe ! Ça pique !";
        } else {
            const randomIndex = Math.floor(Math.random() * messageData.data.messages.length);
            message = messageData.data.messages[randomIndex];
        }
        
        return { message: message, speaker: "Le Bras" };
    }
    
    return null;
});

// Déclencher les messages lors d'événements
game.on('armEaten', () => {
    game.triggerCreativeMessage('arm_comments', { eventType: 'arm_damaged' });
});

setInterval(() => {
    if (game.isGameRunning && Math.random() < 0.1) { // 10% de chance toutes les 3 secondes
        game.triggerCreativeMessage('crocodile_taunts');
    }
}, 3000);
```

### `croconage(characterId, characterData, characterLogic)` - Personnages personnalisés

Créez des personnages uniques pour enrichir votre univers de jeu.

```javascript
// Personnage allié: Le Garde
game.croconage('guardian', {
    name: 'Le Garde Mystérieux',
    type: 'ally',
    health: 150,
    abilities: ['heal_arm', 'distract_crocodiles', 'power_boost'],
    appearance: { color: 'blue', size: 'tall', weapon: 'staff' },
    personality: { helpful: 0.9, mysterious: 0.8, brave: 0.7 }
}, function(characterData) {
    const { gameState, spawnData, currentState, action } = characterData;
    
    if (action === 'spawn') {
        console.log(`${characterData.data.name} apparaît pour vous aider !`);
        
        // Le garde offre de l'aide selon la situation
        if (gameState.armHealth < 50) {
            this.armHealth += 25;
            this.emit('characterAction', { 
                character: 'guardian', 
                action: 'heal', 
                value: 25 
            });
            console.log("Le Garde soigne votre bras !");
        }
        
        return { newState: 'helping', interaction: 'heal_performed' };
    }
    
    if (action === 'update') {
        // Comportement continu du garde
        const helpChance = Math.random();
        
        if (helpChance < 0.1 && gameState.crocodilesRemaining > 3) {
            // Distraire les crocodiles
            this.crocodilesRemaining = Math.max(0, this.crocodilesRemaining - 1);
            this.emit('characterAction', { 
                character: 'guardian', 
                action: 'distract', 
                value: 1 
            });
            console.log("Le Garde distrait un crocodile !");
            
            return { 
                newState: 'distracting', 
                interaction: 'distraction_successful' 
            };
        } else if (helpChance < 0.05) {
            // Boost de puissance temporaire
            this.crocoboost('guardian_blessing', 2.0, 5000, () => {
                console.log("La bénédiction du Garde s'estompe...");
            });
            
            return { 
                newState: 'blessing', 
                interaction: 'power_boost_given' 
            };
        }
        
        return { newState: currentState };
    }
});

// Personnage neutre: Le Marchand
game.croconage('merchant', {
    name: 'Marchand Ambulant',
    type: 'neutral',
    health: 80,
    abilities: ['sell_items', 'buy_items', 'offer_deals'],
    appearance: { color: 'green', size: 'medium', accessory: 'bag' },
    personality: { greedy: 0.6, friendly: 0.8, cunning: 0.7 }
}, function(characterData) {
    const { gameState, action } = characterData;
    
    if (action === 'spawn') {
        console.log("Un marchand mystérieux apparaît !");
        
        // Proposer des objets selon le niveau
        const shopItems = [
            { name: 'Potion de santé', price: 20, effect: 'heal' },
            { name: 'Munitions bonus', price: 30, effect: 'ammo' },
            { name: 'Protection temporaire', price: 50, effect: 'shield' }
        ];
        
        this.emit('characterInteraction', {
            character: 'merchant',
            type: 'shop_opened',
            items: shopItems
        });
        
        return { newState: 'trading', interaction: 'shop_opened' };
    }
    
    if (action === 'update') {
        // Le marchand part après un certain temps
        const stayTime = 15000; // 15 secondes
        setTimeout(() => {
            this.emit('characterAction', { 
                character: 'merchant', 
                action: 'leave' 
            });
            console.log("Le marchand repart avec ses marchandises...");
        }, stayTime);
        
        return { newState: 'waiting' };
    }
});

// Faire apparaître des personnages selon des conditions
game.on('levelUp', (data) => {
    if (data.newLevel === 3) {
        game.spawnCharacter('guardian', { reason: 'level_milestone' });
    }
    
    if (data.newLevel % 5 === 0) { // Tous les 5 niveaux
        game.spawnCharacter('merchant', { reason: 'periodic_visit' });
    }
});

// Mettre à jour les personnages actifs
setInterval(() => {
    if (game.isGameRunning && game.activeCharacters) {
        game.activeCharacters.forEach(characterId => {
            game.updateCharacter(characterId, { timestamp: Date.now() });
        });
    }
}, 2000);
```

## Événements v1.2.0

Les nouvelles fonctionnalités émettent de nombreux nouveaux événements :

```javascript
// Événements des combos
game.on('comboTriggered', (data) => {
    console.log(`Combo ${data.type} niveau ${data.level} !`);
});

// Événements des modes de jeu
game.on('gameModeActivated', (data) => {
    console.log(`Mode ${data.name} activé !`);
});

// Événements des dialogues
game.on('dialogueStarted', (data) => {
    console.log(`Dialogue démarré: ${data.id}`);
});

// Événements des missions
game.on('missionCompleted', (data) => {
    console.log(`Mission "${data.data.title}" terminée !`);
});

// Événements économiques
game.on('purchaseCompleted', (data) => {
    console.log(`Achat: ${data.itemId} avec ${data.currencyName}`);
});

// Événements environnementaux
game.on('environmentActivated', (data) => {
    console.log(`Environnement ${data.id} activé`);
});

// Événements des personnages
game.on('characterSpawned', (data) => {
    console.log(`${data.data.name} est apparu !`);
});

// Et bien d'autres...
```

## Exemple complet avec toutes les nouvelles fonctionnalités

```javascript
const CrocobrasGame = require('crocobras');

const game = new CrocobrasGame();

// Configuration d'un jeu complet avec toutes les nouvelles fonctionnalités
function setupCompleteGame() {
    // 1. Système de combos
    game.crocom('killStreak', function(counter, options) {
        if (counter >= options.threshold) {
            this.economy.currencies.gold.amount += counter * 5;
            return { multiplier: counter * 0.5, goldBonus: counter * 5 };
        }
        return false;
    }, { threshold: 3, resetTime: 5000 });
    
    // 2. Mode survie
    game.crocomode('survival', function(settings) {
        this.settings.crocoPerLevel *= 1.5;
        console.log('Mode Survie activé ! Difficulté augmentée !');
    }, { difficulty: 'extreme' });
    
    // 3. Armure régénératrice
    game.crocorpes('regen', {
        defense: 30,
        regenerationRate: 3
    }, function(properties) {
        setInterval(() => {
            if (this.equippedArmor === 'regen') {
                this.armHealth = Math.min(
                    this.armHealth + properties.regenerationRate,
                    this.settings.initialArmHealth
                );
            }
        }, 1000);
    });
    
    // 4. Système économique
    game.crocomons('gold', {
        startingAmount: 100,
        items: [
            { id: 'health', name: 'Potion', price: 25 },
            { id: 'armor', name: 'Armure', price: 100 }
        ]
    }, function(data) {
        const item = this.economy.shop.gold.items.find(i => i.id === data.itemId);
        if (data.currency.amount >= item.price) {
            data.currency.amount -= item.price;
            if (item.id === 'health') this.armHealth += 50;
            if (item.id === 'armor') this.equipArmor('regen');
            return { success: true };
        }
        return { success: false };
    });
    
    // 5. Personnage allié
    game.croconage('helper', {
        name: 'Assistant Magique',
        abilities: ['heal', 'boost']
    }, function(data) {
        if (data.action === 'spawn') {
            this.armHealth += 20;
            console.log('Assistant magique vous aide !');
        }
    });
    
    // 6. Messages créatifs
    game.crocotive('comments', {
        messages: [
            "Excellent tir !",
            "Continue comme ça !",
            "Attention, ils arrivent !"
        ]
    }, function(data) {
        const randomMsg = data.data.messages[Math.floor(Math.random() * data.data.messages.length)];
        return { message: randomMsg, speaker: 'Narrateur' };
    });
}

// Initialisation du jeu complet
setupCompleteGame();

// Démarrage et test
game.startGame();
game.activateGameMode('survival');
game.equipArmor('regen');
game.spawnCharacter('helper');

// Simulation de gameplay
setInterval(() => {
    if (game.isGameRunning) {
        game.crocokill();
        game.triggerCombo('killStreak');
        
        if (Math.random() < 0.3) {
            game.triggerCreativeMessage('comments');
        }
    }
}, 2000);
```

## Contribution

Toutes les idées et contributions sont les bienvenues ! N'hésitez pas à ouvrir des issues ou à soumettre des pull requests sur le dépôt GitHub.

## Changelog v1.2.0

- ✨ Ajout de `crocom()` pour les systèmes de combos
- ✨ Ajout de `crocomode()` pour les modes de jeux personnalisés  
- ✨ Ajout de `crocorpes()` pour les armures spécialisées
- ✨ Ajout de `crocodial()` pour le système de dialogues
- ✨ Ajout de `crocomise()` pour les missions et quêtes
- ✨ Ajout de `crocomons()` pour le système économique complet
- ✨ Ajout de `crocodym()` pour les environnements dynamiques
- ✨ Ajout de `crocopay()` pour la personnalisation d'assets
- ✨ Ajout de `crocia()` pour l'IA avancée des crocodiles
- ✨ Ajout de `crocohab()` pour les collectibles et succès
- ✨ Ajout de `crocotive()` pour les messages créatifs
- ✨ Ajout de `croconage()` pour les personnages personnalisés
- 📡 Plus de 20 nouveaux événements pour toutes les nouvelles fonctionnalités
- 🎮 Possibilités de personnalisation quasi-infinies pour les développeurs

**Lien de notre documentation officielle** :

https://croco-combat-arena.lovable.app/

