
class CrocobrasAgent {
    constructor() {
        this.knowledgeBase = this.initializeKnowledgeBase();
        this.patterns = this.initializePatterns();
        this.codeTemplates = this.initializeCodeTemplates();
    }

    initializeKnowledgeBase() {
        return {
            // Fonctions de base
            basic: {
                startGame: "game.startGame() - Démarre une nouvelle partie",
                crocokill: "game.crocokill() - Tue un crocodile",
                crocotire: "game.crocotire() - Tire un coup de feu",
                crocobouffe: "game.crocobouffe() - Un crocodile mange le bras",
                crocover: "game.crocover() - Termine la partie (Game Over)",
                crocoreset: "game.crocoreset() - Remet le jeu à zéro"
            },
            
            // Fonctions avancées v1.1.0
            advanced_v1_1: {
                crocopow: "game.crocopow(type, logic, options) - Crée des power-ups personnalisés",
                crocoboost: "game.crocoboost(type, value, duration, onExpire) - Système de boosts temporaires",
                crocolife: "game.crocolife(crocoId, health, options) - Donne des HP aux crocodiles",
                crocoarmure: "game.crocoarmure(crocoId, strength, logic) - Force/armure des crocodiles",
                crocorap: "game.crocorap(crocoId, speed, modifier) - Vitesse des crocodiles",
                crocopop: "game.crocopop(crocoId, danceType, logic, options) - Danses/esquives",
                crocoexplose: "game.crocoexplose(crocoId, damage, radius, logic) - Explosions"
            },
            
            // Nouvelles fonctions v1.2.0
            advanced_v1_2: {
                crocom: "game.crocom(comboType, logic, options) - Système de combos",
                crocomode: "game.crocomode(modeName, logic, settings) - Modes de jeu personnalisés",
                crocorpes: "game.crocorpes(armorType, properties, logic) - Armures spécialisées",
                crocodial: "game.crocodial(dialogueId, data, logic) - Système de dialogues",
                crocomise: "game.crocomise(missionId, data, logic) - Missions et quêtes",
                crocomons: "game.crocomons(currency, shopData, logic) - Système économique",
                crocodym: "game.crocodym(envId, data, logic) - Environnements dynamiques",
                crocopay: "game.crocopay(assetType, data, logic) - Personnalisation d'assets",
                crocia: "game.crocia(crocoId, aiType, logic, settings) - IA des crocodiles",
                crocohab: "game.crocohab(type, data, logic) - Collectibles et succès",
                crocotive: "game.crocotive(messageType, data, logic) - Messages créatifs",
                croconage: "game.croconage(characterId, data, logic) - Personnages personnalisés"
            },
            
            // Événements principaux
            events: {
                gameStarted: "Partie démarrée",
                crocoKilled: "Crocodile tué",
                levelUp: "Passage de niveau",
                armEaten: "Bras mangé",
                gameOver: "Fin de partie",
                powerUpActivated: "Power-up activé",
                comboTriggered: "Combo déclenché",
                missionCompleted: "Mission terminée"
            }
        };
    }

    initializePatterns() {
        return [
            // Patterns pour combos
            {
                keywords: ["combo", "killstreak", "enchaîner", "chaîne", "succession"],
                category: "combo",
                template: "combo_system"
            },
            
            // Patterns pour power-ups
            {
                keywords: ["power-up", "powerup", "boost", "amélioration", "bonus", "vitesse", "force"],
                category: "powerup",
                template: "powerup_system"
            },
            
            // Patterns pour crocodiles
            {
                keywords: ["crocodile", "croco", "hp", "vie", "santé", "boss", "force", "armure"],
                category: "crocodile",
                template: "crocodile_advanced"
            },
            
            // Patterns pour missions
            {
                keywords: ["mission", "quête", "objectif", "défi", "survie", "temps limité"],
                category: "mission",
                template: "mission_system"
            },
            
            // Patterns pour boutique/économie
            {
                keywords: ["boutique", "acheter", "vendre", "monnaie", "pièces", "or", "argent", "économie"],
                category: "economy",
                template: "economy_system"
            },
            
            // Patterns pour IA
            {
                keywords: ["ia", "intelligence", "comportement", "esquive", "agressive", "smart"],
                category: "ai",
                template: "ai_system"
            },
            
            // Patterns pour environnement
            {
                keywords: ["environnement", "décor", "obstacle", "terrain", "climat", "dynamique"],
                category: "environment",
                template: "environment_system"
            },
            
            // Patterns pour dialogues
            {
                keywords: ["dialogue", "texte", "parler", "conversation", "narratif"],
                category: "dialogue",
                template: "dialogue_system"
            }
        ];
    }

    initializeCodeTemplates() {
        return {
            basic_setup: `const CrocobrasGame = require('crocobras');

// Configuration du jeu
const game = new CrocobrasGame({
    initialArmHealth: 100,
    crocoDamage: 25,
    crocoPerLevel: 1,
    levelUpThreshold: 5
});

// Événements de base
game.on('gameStarted', (data) => {
    console.log(\`Partie démarrée ! Niveau: \${data.level}\`);
});

game.on('crocoKilled', (data) => {
    console.log(\`Crocodile tué ! Restant: \${data.remainingCount}\`);
});

// Démarrer le jeu
game.startGame();`,

            combo_system: `// Système de combo killstreak
game.crocom('killStreak', (counter, options, context) => {
    if (counter >= options.threshold) {
        // Effet spécial selon le niveau de combo
        const multiplier = Math.min(counter / options.threshold, options.maxLevel);
        
        console.log(\`Combo x\${multiplier} ! \${counter} kills d'affilée !\`);
        
        // Récompenses selon le niveau
        if (multiplier >= 2) {
            console.log("🔥 Combo de feu ! Dégâts doublés !");
        }
        if (multiplier >= 3) {
            console.log("⚡ COMBO ÉLECTRIQUE ! Vitesse augmentée !");
        }
        
        return { multiplier, bonusScore: counter * 100 };
    }
    return false;
}, {
    threshold: 3,      // 3 kills pour déclencher
    maxLevel: 5,       // Niveau max du combo
    resetTime: 5000    // Reset après 5 secondes
});

// Déclencher le combo à chaque kill
game.on('crocoKilled', () => {
    game.triggerCombo('killStreak');
});`,

            powerup_system: `// Power-up de vitesse
game.crocopow('speedBoost', (options) => {
    console.log(\`💨 Speed Boost activé ! Vitesse x\${options.multiplier} pendant \${options.duration}ms\`);
    
    // Logique personnalisée du power-up
    const originalSpeed = game.playerSpeed || 1;
    game.playerSpeed = originalSpeed * options.multiplier;
    
    // Effet visuel (à implémenter côté UI)
    game.emit('speedEffectStart', options);
    
    // Restaurer la vitesse après expiration
    setTimeout(() => {
        game.playerSpeed = originalSpeed;
        game.emit('speedEffectEnd');
        console.log("Speed Boost terminé !");
    }, options.duration);
    
}, {
    multiplier: 2,     // Double la vitesse
    duration: 10000,   // 10 secondes
    cooldown: 15000    // 15s de cooldown
});

// Activer le power-up
game.activatePowerUp('speedBoost');`,

            crocodile_advanced: `// Crocodile boss avec HP et explosion
const bossId = 1;

// Donner des HP au boss
game.crocolife(bossId, 500, {
    maxHealth: 500,
    regeneration: 2  // 2 HP par seconde
});

// Armure du boss
game.crocoarmure(bossId, 100, (currentStrength, context) => {
    // L'armure augmente avec le niveau
    return currentStrength + (context.level * 10);
});

// IA agressive pour le boss
game.crocia(bossId, 'aggressive', (aiData) => {
    const { gameState, settings } = aiData;
    
    // Comportement selon les HP restants
    const healthPercent = game.crocodileHealths[bossId]?.currentHealth / 500;
    
    if (healthPercent < 0.3) {
        // Mode berserk quand HP < 30%
        return {
            newState: 'berserk',
            action: 'rushPlayer',
            speed: settings.aggressiveness * 2
        };
    } else if (healthPercent < 0.6) {
        // Mode agressif quand HP < 60%
        return {
            newState: 'aggressive',
            action: 'chargeAttack',
            speed: settings.aggressiveness * 1.5
        };
    }
    
    return {
        newState: 'hunting',
        action: 'patrol',
        speed: settings.aggressiveness
    };
}, {
    aggressiveness: 0.8,
    intelligence: 0.9
});

// Explosion à la mort
game.on('crocoKilled', (data) => {
    if (data.crocoId === bossId) {
        game.crocoexplose(bossId, 150, 200, (explosion) => {
            console.log(\`💥 BOSS EXPLOSION ! Dégâts: \${explosion.damage}\`);
            // Dégâts de zone personnalisés
            game.emit('bossExplosion', explosion);
        });
    }
});`,

            mission_system: `// Mission de survie
game.crocomise('survivalMission', {
    title: 'Survie Ultime',
    description: 'Survivez 2 minutes en tuant 50 crocodiles',
    objectives: [
        { type: 'kill', target: 50, current: 0 },
        { type: 'survive', duration: 120000, startTime: null }
    ],
    rewards: {
        coins: 1000,
        experience: 500,
        unlocks: ['golden_armor']
    },
    timeLimit: 120000 // 2 minutes
}, (missionData, progress) => {
    console.log(\`🎯 Mission: \${missionData.title} démarrée !\`);
    
    progress.startTime = Date.now();
    progress.killCount = 0;
    
    // Timer de la mission
    const missionTimer = setInterval(() => {
        const elapsed = Date.now() - progress.startTime;
        const remaining = missionData.timeLimit - elapsed;
        
        if (remaining <= 0) {
            clearInterval(missionTimer);
            console.log("⏰ Temps écoulé ! Mission échouée.");
            game.emit('missionFailed', { id: 'survivalMission', reason: 'timeout' });
        } else {
            game.emit('missionTimer', { remaining: Math.ceil(remaining / 1000) });
        }
    }, 1000);
    
    // Écouter les kills
    const killListener = () => {
        progress.killCount++;
        
        if (progress.killCount >= 50) {
            clearInterval(missionTimer);
            game.completeMission('survivalMission', {
                killCount: progress.killCount,
                timeUsed: Date.now() - progress.startTime
            });
        }
    };
    
    game.on('crocoKilled', killListener);
});

// Démarrer la mission
game.startMission('survivalMission');`,

            economy_system: `// Système économique avec boutique
game.crocomons('goldCoins', {
    startingAmount: 100,
    currencyProperties: {
        icon: '🪙',
        name: 'Pièces d\'Or'
    },
    items: [
        { id: 'steel_armor', name: 'Armure d\'Acier', price: 500, type: 'armor' },
        { id: 'power_shot', name: 'Tir Puissant', price: 200, type: 'powerup' },
        { id: 'health_potion', name: 'Potion de Vie', price: 150, type: 'consumable' }
    ],
    settings: {
        taxRate: 0.05, // 5% de taxe
        discounts: true
    }
}, (purchaseData) => {
    const { itemId, quantity, currency, shop } = purchaseData;
    const item = shop.items.find(i => i.id === itemId);
    
    if (!item) {
        return { success: false, error: 'Article non trouvé' };
    }
    
    const totalCost = item.price * quantity;
    
    if (currency.amount < totalCost) {
        return { success: false, error: 'Pas assez de pièces' };
    }
    
    // Déduire le coût
    currency.amount -= totalCost;
    
    // Ajouter à l'inventaire
    if (!game.economy.inventory[itemId]) {
        game.economy.inventory[itemId] = 0;
    }
    game.economy.inventory[itemId] += quantity;
    
    console.log(\`🛒 Acheté: \${quantity}x \${item.name} pour \${totalCost} pièces\`);
    
    return {
        success: true,
        cost: totalCost,
        newBalance: currency.amount,
        item: item
    };
});

// Effectuer un achat
game.purchase('goldCoins', 'steel_armor', 1);`,

            ai_system: `// IA d'esquive pour crocodile
const smartCrocoId = 2;

game.crocia(smartCrocoId, 'evasive', (aiData) => {
    const { crocoId, gameState, context } = aiData;
    
    // Détection des tirs (simulation)
    if (context.shotFired) {
        const dodgeChance = 0.4; // 40% de chance d'esquiver
        
        if (Math.random() < dodgeChance) {
            // Déclencher l'esquive
            game.triggerCrocodileDance(crocoId, 'dodge');
            
            return {
                newState: 'dodging',
                action: 'evade',
                success: true
            };
        }
    }
    
    // Comportement normal : se rapprocher du joueur
    return {
        newState: 'approaching',
        action: 'moveToPlayer',
        speed: 1.2
    };
}, {
    intelligence: 0.8,
    reflexes: 0.7,
    memory: []
});

// Animation d'esquive
game.crocopop(smartCrocoId, 'dodge', (crocoId, options) => {
    console.log(\`🤸 Crocodile \${crocoId} esquive !\`);
    
    // Effet visuel d'esquive (à implémenter côté UI)
    game.emit('crocodileDodge', { 
        crocoId: crocoId,
        duration: options.duration,
        success: true
    });
    
    return { dodged: true, invulnerable: true };
}, {
    duration: 800,      // 0.8 secondes d'esquive
    dodgeChance: 0.4,   // Déjà géré dans l'IA
    cooldown: 3000      // 3 secondes entre les esquives
});

// Écouter les tirs pour l'IA
game.on('shotFired', () => {
    game.updateCrocodileAI(smartCrocoId, { shotFired: true });
});`,

            environment_system: `// Environnement dynamique - Marécage
game.crocodym('swampland', {
    obstacles: ['fallen_log', 'mud_pit', 'water_hole'],
    effects: ['slow_movement', 'reduced_visibility'],
    climate: 'humid',
    visibility: 0.7
}, (environmentData, parameters) => {
    console.log(\`🌿 Environnement Marécage activé !\`);
    
    // Effets sur le gameplay
    const originalSpeed = game.playerSpeed || 1;
    game.playerSpeed = originalSpeed * 0.8; // 20% plus lent
    
    // Obstacles dynamiques
    const createObstacle = () => {
        const obstacles = environmentData.obstacles;
        const randomObstacle = obstacles[Math.floor(Math.random() * obstacles.length)];
        
        game.emit('obstacleSpawned', {
            type: randomObstacle,
            position: { x: Math.random() * 800, y: Math.random() * 600 },
            duration: 5000
        });
    };
    
    // Créer un obstacle toutes les 3 secondes
    const obstacleInterval = setInterval(createObstacle, 3000);
    
    // Nettoyer après 30 secondes
    setTimeout(() => {
        clearInterval(obstacleInterval);
        game.playerSpeed = originalSpeed;
        console.log("🌿 Effets de marécage terminés");
    }, 30000);
});

// Activer l'environnement
game.activateEnvironment('swampland');`,

            dialogue_system: `// Système de dialogue narratif
game.crocodial('intro_dialogue', {
    texts: [
        "Un étrange bruit se fait entendre dans les marécages...",
        "Les crocodiles semblent plus agressifs que d'habitude.",
        "Votre bras commence à trembler de peur.",
        "Il est temps de montrer de quoi vous êtes capable !"
    ],
    speaker: 'narrator',
    choices: [
        { text: "Commencer le combat", action: 'start_fight' },
        { text: "Fuir en courant", action: 'run_away' }
    ],
    conditions: { level: 1, firstTime: true }
}, (dialogueData, context) => {
    console.log(\`💬 Dialogue: \${dialogueData.speaker}\`);
    
    // Afficher les textes un par un
    dialogueData.texts.forEach((text, index) => {
        setTimeout(() => {
            game.emit('dialogueText', {
                speaker: dialogueData.speaker,
                text: text,
                index: index
            });
        }, index * 2000);
    });
    
    // Afficher les choix après tous les textes
    setTimeout(() => {
        game.emit('dialogueChoices', {
            choices: dialogueData.choices
        });
    }, dialogueData.texts.length * 2000);
});

// Gérer les choix du joueur
game.on('dialogueChoice', (choice) => {
    if (choice.action === 'start_fight') {
        console.log("🗡️ Le combat commence !");
        game.startGame();
    } else if (choice.action === 'run_away') {
        console.log("🏃 Vous fuyez comme un lâche...");
        game.emit('gameAborted');
    }
});

// Démarrer le dialogue
game.startDialogue('intro_dialogue');`
        };
    }

    analyzeQuery(query) {
        const lowerQuery = query.toLowerCase();
        const matchedPatterns = [];
        
        // Analyser les patterns
        for (const pattern of this.patterns) {
            const matches = pattern.keywords.filter(keyword => 
                lowerQuery.includes(keyword.toLowerCase())
            );
            
            if (matches.length > 0) {
                matchedPatterns.push({
                    ...pattern,
                    matchCount: matches.length,
                    matchedKeywords: matches
                });
            }
        }
        
        // Trier par nombre de correspondances
        matchedPatterns.sort((a, b) => b.matchCount - a.matchCount);
        
        return matchedPatterns;
    }

    extractParameters(query) {
        const params = {};
        
        // Extraire des nombres
        const numbers = query.match(/\d+/g);
        if (numbers) {
            params.numbers = numbers.map(n => parseInt(n));
        }
        
        // Extraire des durées
        const timeRegex = /(\d+)\s*(seconde|minute|hour|s|m|h)/gi;
        const timeMatches = [...query.matchAll(timeRegex)];
        if (timeMatches.length > 0) {
            params.durations = timeMatches.map(match => {
                const value = parseInt(match[1]);
                const unit = match[2].toLowerCase();
                const multiplier = unit.startsWith('m') ? 60000 : 
                                 unit.startsWith('h') ? 3600000 : 1000;
                return value * multiplier;
            });
        }
        
        // Extraire des noms/identifiants
        const nameRegex = /["']([^"']+)["']/g;
        const nameMatches = [...query.matchAll(nameRegex)];
        if (nameMatches.length > 0) {
            params.names = nameMatches.map(match => match[1]);
        }
        
        return params;
    }

    generateResponse(query) {
        const patterns = this.analyzeQuery(query);
        const params = this.extractParameters(query);
        
        if (patterns.length === 0) {
            return this.generateGenericHelp();
        }
        
        const primaryPattern = patterns[0];
        const template = this.codeTemplates[primaryPattern.template];
        
        let response = `🐊 **Analyse de votre requête :**\n`;
        response += `Catégorie détectée: ${primaryPattern.category}\n`;
        response += `Mots-clés trouvés: ${primaryPattern.matchedKeywords.join(', ')}\n\n`;
        
        // Ajouter des explications spécifiques
        response += this.generateExplanation(primaryPattern, params);
        
        // Ajouter le code
        response += `\n📝 **Code généré :**\n\n`;
        response += this.customizeTemplate(template, params, primaryPattern);
        
        // Ajouter des conseils
        response += `\n\n💡 **Conseils supplémentaires :**\n`;
        response += this.generateTips(primaryPattern, params);
        
        return response;
    }

    generateExplanation(pattern, params) {
        const explanations = {
            combo: `🎯 **Système de Combos :**
Les combos permettent de créer des effets spéciaux quand le joueur enchaîne des actions.
Fonction utilisée: \`crocom(comboType, logic, options)\`
- comboType: nom unique du combo
- logic: fonction qui gère les effets
- options: seuil, multiplicateur, durée, etc.`,

            powerup: `⚡ **Power-ups :**
Les power-ups donnent des capacités temporaires au joueur.
Fonction utilisée: \`crocopow(type, logic, options)\`
- type: nom du power-up
- logic: fonction qui applique l'effet
- options: durée, valeur, cooldown, etc.`,

            crocodile: `🐊 **Crocodiles Avancés :**
Créez des crocodiles avec HP, armure, vitesse et IA personnalisées.
Fonctions principales:
- \`crocolife()\`: Points de vie
- \`crocoarmure()\`: Force/résistance
- \`crocorap()\`: Vitesse
- \`crocia()\`: Intelligence artificielle`,

            mission: `🎯 **Système de Missions :**
Créez des objectifs avec récompenses et conditions.
Fonction utilisée: \`crocomise(missionId, data, logic)\`
- missionId: identifiant unique
- data: objectifs, récompenses, limite de temps
- logic: gestion de la progression`,

            economy: `💰 **Système Économique :**
Gérez une monnaie et une boutique dans votre jeu.
Fonction utilisée: \`crocomons(currency, shopData, logic)\`
- currency: nom de la monnaie
- shopData: articles et prix
- logic: gestion des achats`,

            ai: `🧠 **Intelligence Artificielle :**
Donnez des comportements intelligents aux crocodiles.
Fonction utilisée: \`crocia(crocoId, aiType, logic, settings)\`
- crocoId: identifiant du crocodile
- aiType: type de comportement
- logic: prise de décision
- settings: paramètres (agressivité, intelligence)`,

            environment: `🌿 **Environnements Dynamiques :**
Créez des environnements qui changent le gameplay.
Fonction utilisée: \`crocodym(envId, data, logic)\`
- envId: identifiant de l'environnement
- data: obstacles, effets, climat
- logic: gestion des changements`,

            dialogue: `💬 **Système de Dialogues :**
Ajoutez des textes narratifs et des choix.
Fonction utilisée: \`crocodial(dialogueId, data, logic)\`
- dialogueId: identifiant unique
- data: textes, choix, conditions
- logic: gestion des interactions`
        };

        return explanations[pattern.category] || "Fonctionnalité de Crocobras détectée.";
    }

    customizeTemplate(template, params, pattern) {
        if (!template) {
            return "// Template non trouvé, voici un exemple de base :\n" + this.codeTemplates.basic_setup;
        }

        let customizedCode = template;
        
        // Personnaliser avec les paramètres extraits
        if (params.numbers && params.numbers.length > 0) {
            // Remplacer les valeurs numériques par celles de la requête
            if (pattern.category === 'crocodile' && params.numbers[0]) {
                customizedCode = customizedCode.replace(/500/g, params.numbers[0]);
            }
            if (pattern.category === 'powerup' && params.durations && params.durations[0]) {
                customizedCode = customizedCode.replace(/10000/g, params.durations[0]);
            }
        }
        
        if (params.names && params.names.length > 0) {
            // Utiliser les noms spécifiés
            const firstName = params.names[0];
            customizedCode = customizedCode.replace(/'[^']*'/g, `'${firstName}'`);
        }
        
        return customizedCode;
    }

    generateTips(pattern, params) {
        const tips = {
            combo: `- Utilisez \`triggerCombo()\` pour déclencher manuellement
- Écoutez l'événement 'comboTriggered' pour les effets visuels
- Ajustez le seuil selon la difficulté souhaitée`,

            powerup: `- Stockez les power-ups dans un tableau pour les gérer
- Utilisez des cooldowns pour équilibrer le gameplay
- Émettez des événements pour synchroniser avec l'UI`,

            crocodile: `- Assignez des IDs uniques à chaque crocodile
- Combinez plusieurs fonctions pour des boss complexes
- Testez l'équilibrage des HP et dégâts`,

            mission: `- Utilisez des timers pour les missions temporisées
- Sauvegardez la progression dans une base de données
- Récompensez généreusement pour motiver les joueurs`,

            economy: `- Équilibrez les prix selon la difficulté
- Ajoutez des articles rares pour la progression
- Implémentez un système de remises`,

            ai: `- Testez différents niveaux d'intelligence
- Variez les comportements selon la situation
- Utilisez la mémoire pour des IA adaptatives`,

            environment: `- Limitez la durée des effets pour éviter la frustration
- Prévenez le joueur des changements d'environnement
- Équilibrez les malus avec des bonus`,

            dialogue: `- Gardez les textes courts et impactants
- Offrez des choix significatifs au joueur
- Utilisez les dialogues pour expliquer les mécaniques`
        };

        return tips[pattern.category] || "- Consultez la documentation pour plus d'options\n- Testez le code étape par étape\n- N'hésitez pas à personnaliser selon vos besoins";
    }

    generateGenericHelp() {
        return `🐊 **Agent IA Crocobras - Aide Générale**

Je peux vous aider avec toutes les fonctionnalités de Crocobras v1.2.0 !

**🎯 Que puis-je faire pour vous ?**

**Fonctionnalités de base :**
- Démarrer/arrêter le jeu
- Gérer les crocodiles et le bras
- Système de niveaux

**Fonctionnalités avancées v1.1.0 :**
- Power-ups personnalisés (crocopow)
- Système de boost (crocoboost)
- HP des crocodiles (crocolife)
- Armure et vitesse (crocoarmure, crocorap)
- Danses et explosions (crocopop, crocoexplose)

**🆕 Nouveautés v1.2.0 :**
- Combos (crocom)
- Modes de jeu (crocomode)
- Armures spécialisées (crocorpes)
- Dialogues (crocodial)
- Missions (crocomise)
- Économie (crocomons)
- Environnements dynamiques (crocodym)
- Personnalisation d'assets (crocopay)
- IA avancée (crocia)
- Collectibles (crocohab)
- Messages créatifs (crocotive)
- Personnages (croconage)

**💡 Exemples de requêtes :**
- "Comment créer un combo killstreak ?"
- "Génère un crocodile boss avec 200 HP"
- "Système de boutique avec pièces d'or"
- "IA qui esquive les tirs"
- "Mission de survie 2 minutes"

Décrivez ce que vous voulez créer et je générerai le code correspondant !`;
    }
}

// Instance globale de l'agent
const agent = new CrocobrasAgent();

// Fonctions de l'interface
function processQuery() {
    const userInput = document.getElementById('userInput').value.trim();
    
    if (!userInput) {
        alert('Veuillez saisir une requête !');
        return;
    }
    
    // Afficher le loading
    document.getElementById('loading').style.display = 'block';
    document.getElementById('responseArea').innerHTML = '';
    
    // Simuler un délai de traitement pour l'effet IA
    setTimeout(() => {
        try {
            const response = agent.generateResponse(userInput);
            displayResponse(response);
        } catch (error) {
            displayResponse(`❌ **Erreur :**
Une erreur s'est produite lors de l'analyse de votre requête.
Erreur: ${error.message}

Veuillez reformuler votre demande ou utiliser les exemples fournis.`);
        }
        
        document.getElementById('loading').style.display = 'none';
    }, 1500);
}

function displayResponse(text) {
    const responseArea = document.getElementById('responseArea');
    
    // Formatage du texte avec coloration syntaxique basique
    let formattedText = text
        .replace(/\*\*(.*?)\*\*/g, '<span class="highlight">$1</span>')
        .replace(/`([^`]+)`/g, '<span class="code-block">$1</span>')
        .replace(/```[\s\S]*?```/g, match => {
            const code = match.slice(3, -3);
            return `<div class="code-block">${code}</div>`;
        });
    
    responseArea.innerHTML = formattedText;
    responseArea.scrollTop = 0;
}

function clearAll() {
    document.getElementById('userInput').value = '';
    document.getElementById('responseArea').innerHTML = 'Posez votre question pour recevoir du code et des explications personnalisées...';
    document.getElementById('loading').style.display = 'none';
}

function setExample(example) {
    document.getElementById('userInput').value = example;
    document.getElementById('userInput').focus();
}

// Gérer l'entrée avec Enter
document.getElementById('userInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && e.ctrlKey) {
        processQuery();
    }
});

// Message de bienvenue
window.addEventListener('load', () => {
    setTimeout(() => {
        const welcome = `🐊 **Bienvenue dans l'Agent IA Crocobras !**

Je suis votre assistant intelligent pour le package Crocobras v1.2.0.

**🚀 Comment utiliser l'agent :**
1. Décrivez ce que vous voulez créer dans la zone de texte
2. Cliquez sur "Analyser & Générer" 
3. Recevez du code personnalisé et des explications détaillées

**💡 Astuce :** Utilisez Ctrl+Entrée pour analyser rapidement votre requête !

Essayez un des exemples ci-dessous ou posez votre propre question !`;
        
        displayResponse(welcome);
    }, 500);
});
