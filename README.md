


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

### Fonctionnalités v1.2.0
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

### 🆕 Nouveautés v1.3.0
* **Quêtes dynamiques adaptatives** avec `crocojom` - Missions qui s'adaptent aux choix des joueurs
* **Système climatique interactif** avec `crocera` - Climat qui affecte le comportement des crocodiles et du bras
* **Événements spéciaux conditionnels** avec `crocogiw` - Crocodiles/événements rares selon des conditions
* **IA avancée avec prise de décision** avec `crocorin` - Comportements IA personnalisés et adaptatifs
* **Analyse de données de jeu** avec `crocomp` - Système d'analytics personnalisé
* **Fonctions JavaScript personnalisées** avec `crocotina` - Créez vos propres fonctions intégrées
* **Mini-jeux de quiz créatifs** avec `crocofaf` - Quiz pour gagner points/monnaie/kills
* **Messages temporaires personnalisés** avec `crocojup` - Notifications temporaires configurables
* **Power-ups temporaires avancés** avec `crocodae` - System de buffs temporaires personnalisés
* **Logs personnalisés créatifs** avec `crocolog` - Système de logging avec formes et couleurs
* **Clonage et invocation de crocodiles** avec `crocojust` - Duplication et invocation de crocodiles
* **Crocodiles rares spéciaux** avec `crocorare` - Crocodiles légendaires avec comportements uniques
* **Tutoriels interactifs** avec `crocomd` - Mini-tutoriels de démarrage par dialogues
* **Personnalisation comportementale** avec `crocoglop` - Comportements et messages spéciaux par crocodile
* **Système de bébés crocodiles** avec `crocofarm` - Naissance et croissance de jeunes crocodiles
* **Système d'envies des crocodiles** avec `crocenvie` - Motivations complexes au-delà de manger le bras

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

## 🆕 Nouvelles fonctionnalités v1.3.0

### `crocojom(questId, questData, questLogic)` - Quêtes dynamiques adaptatives

Créez des quêtes qui s'adaptent aux choix des joueurs en temps réel.

```javascript
// Quête qui change selon les choix du joueur
game.crocojom('adaptive_quest', {
    title: 'Le Mystère du Marécage',
    branches: {
        start: { text: 'Vous entrez dans le marécage...', choices: ['explorer', 'fuir'] },
        explorer: { text: 'Vous découvrez une grotte mystérieuse', choices: ['entrer', 'contourner'] },
        fuir: { text: 'Vous rebroussez chemin mais...', choices: ['courage', 'panic'] }
    },
    rewards: { coins: 100, experience: 50 }
}, function(questData, progress, action, choice) {
    if (action === 'choice') {
        if (choice.action === 'explorer') {
            // Augmenter la difficulté mais aussi les récompenses
            this.settings.crocoPerLevel += 1;
            questData.rewards.coins *= 1.5;
            return { newBranch: 'explorer', difficulty: 'increased' };
        } else if (choice.action === 'fuir') {
            // Chemin plus sûr mais moins récompensé
            questData.rewards.coins *= 0.8;
            return { newBranch: 'fuir', difficulty: 'reduced' };
        }
    }
});

// Démarrer la quête
game.startDynamicQuest('adaptive_quest');

// Faire un choix
game.makeDynamicQuestChoice('adaptive_quest', { action: 'explorer' });
```

### `crocera(weatherId, weatherData, weatherLogic)` - Système climatique interactif

Créez des conditions météorologiques qui influencent le gameplay.

```javascript
// Tempête qui rend les crocodiles plus agressifs mais ralentit le joueur
game.crocera('storm', {
    name: 'Tempête Électrique',
    duration: 30000, // 30 secondes
    intensity: 0.8,
    crocodileEffects: { speed: 1.3, aggression: 1.5 },
    armEffects: { visibility: 0.6, movement: 0.7 }
}, function(weatherData, gameState) {
    console.log(`⛈️ ${weatherData.name} activée !`);
    
    // Effet sur les crocodiles existants
    if (this.crocodileSpeeds) {
        Object.keys(this.crocodileSpeeds).forEach(crocoId => {
            const currentSpeed = this.crocodileSpeeds[crocoId].currentSpeed;
            this.crocodileSpeeds[crocoId].currentSpeed = currentSpeed * weatherData.crocodileEffects.speed;
        });
    }
    
    // Réduire la visibilité du joueur
    this.emit('weatherEffect', {
        type: 'visibility',
        value: weatherData.armEffects.visibility
    });
    
    // Éclairs aléatoires
    const lightningInterval = setInterval(() => {
        if (this.currentWeather === 'storm') {
            if (Math.random() < 0.2) {
                // Éclair aide le joueur (tue un crocodile)
                this.crocokill();
                console.log('⚡ Un éclair élimine un crocodile !');
            }
        } else {
            clearInterval(lightningInterval);
        }
    }, 3000);
});

// Activer la tempête
game.activateWeather('storm');
```

### `crocogiw(specialId, specialData, specialLogic)` - Événements spéciaux conditionnels

Créez des crocodiles ou événements rares qui n'apparaissent que dans certaines conditions.

```javascript
// Crocodile boss qui n'apparaît qu'au niveau 5+ avec moins de 50% de vie
game.crocogiw('boss_croco', {
    type: 'crocodile',
    rarity: 'legendary',
    triggerConditions: {
        minLevel: 5,
        maxArmHealthPercent: 0.5
    },
    rewards: { coins: 500, experience: 200 }
}, function(specialData, gameState) {
    const healthPercent = gameState.armHealth / this.settings.initialArmHealth;
    const meetsConditions = gameState.currentLevel >= specialData.triggerConditions.minLevel &&
                           healthPercent <= specialData.triggerConditions.maxArmHealthPercent;
    
    if (meetsConditions && Math.random() < 0.1) { // 10% de chance
        console.log('👑 BOSS CROCODILE LÉGENDAIRE APPARAÎT !');
        
        // Créer un super crocodile
        this.crocolife(999, 300); // 300 HP
        this.crocoarmure(999, 50); // Armure élevée
        this.crocia(999, 'legendary_boss', (aiData) => {
            return { action: 'ultimate_attack', newState: 'berserker' };
        });
        
        return true; // Déclencher l'événement
    }
    
    return false;
});

// Vérifier les événements spéciaux à chaque kill
game.on('crocoKilled', () => {
    game.checkSpecialElements();
});
```

### `crocorin(crocoId, aiConfig, decisionLogic)` - IA avancée avec prise de décision

Créez des IA qui apprennent et s'adaptent au comportement du joueur.

```javascript
// IA qui apprend les patterns de tir du joueur
game.crocorin(1, {
    learningRate: 0.15,
    memorySize: 30,
    personalityTraits: { patience: 0.7, cunning: 0.9 },
    decisionFrequency: 2000
}, function(aiData) {
    const { crocoId, memory, gameState, situation, learningData } = aiData;
    
    // Analyser les patterns de tir du joueur
    const recentShots = memory.filter(m => m.type === 'decision' && m.timestamp > Date.now() - 10000);
    const shotPattern = recentShots.length > 0 ? recentShots.reduce((acc, shot) => {
        const interval = shot.timestamp - (recentShots[recentShots.indexOf(shot) - 1]?.timestamp || shot.timestamp);
        acc.push(interval);
        return acc;
    }, []) : [];
    
    const avgShotInterval = shotPattern.length > 0 ? 
        shotPattern.reduce((a, b) => a + b, 0) / shotPattern.length : 3000;
    
    // Décision basée sur l'apprentissage
    if (avgShotInterval < 1500) {
        // Joueur tire rapidement -> être plus défensif
        return {
            action: 'defensive_pattern',
            strategy: 'zigzag',
            confidence: 0.8
        };
    } else if (gameState.armHealth < 30) {
        // Bras faible -> attaque coordonnée
        return {
            action: 'final_assault',
            strategy: 'aggressive_rush',
            confidence: 0.95
        };
    } else {
        // Comportement adaptatif
        return {
            action: 'adaptive_hunt',
            strategy: 'patient_stalking',
            confidence: 0.6
        };
    }
});

// Mettre à jour l'IA régulièrement
setInterval(() => {
    if (game.isGameRunning) {
        game.executeAdvancedAIDecision(1, { 
            playerActivity: 'shooting',
            timeElapsed: Date.now() 
        });
    }
}, 2000);
```

### `crocomp(analysisId, analysisConfig, analysisLogic)` - Analyse de données de jeu

Analysez les performances et comportements des joueurs.

```javascript
// Système d'analyse de la performance du joueur
game.crocomp('player_performance', {
    dataPoints: ['accuracy', 'survival_time', 'level_progression', 'death_causes'],
    updateInterval: 10000, // Toutes les 10 secondes
    reportFormat: 'detailed'
}, function(analysisData) {
    const { gameState, analyticsData, previousReports } = analysisData;
    
    // Calculer la précision
    const totalShots = this.totalShots || 0;
    const totalKills = this.killedCrocodilesThisLevel || 0;
    const accuracy = totalShots > 0 ? (totalKills / totalShots) * 100 : 0;
    
    // Temps de survie
    const survivalTime = this.gameStartTime ? Date.now() - this.gameStartTime : 0;
    
    // Analyser les tendances
    const report = {
        timestamp: Date.now(),
        accuracy: accuracy,
        survivalTime: survivalTime,
        currentLevel: gameState.currentLevel,
        armHealth: gameState.armHealth,
        recommendations: []
    };
    
    // Recommandations basées sur les performances
    if (accuracy < 50) {
        report.recommendations.push('Améliorer la précision de tir');
    }
    if (gameState.armHealth < 50) {
        report.recommendations.push('Jouer plus défensivement');
    }
    if (gameState.currentLevel > 3 && accuracy > 80) {
        report.recommendations.push('Excellent ! Continuez ainsi !');
    }
    
    console.log(`📊 Rapport de performance: Précision ${accuracy.toFixed(1)}%, Niveau ${gameState.currentLevel}`);
    
    return report;
});

// Lancer l'analyse automatique
setInterval(() => {
    if (game.isGameRunning) {
        game.runGameAnalysis('player_performance');
    }
}, 10000);
```

### `crocotina(functionName, customFunction, options)` - Fonctions JavaScript personnalisées

Intégrez vos propres fonctions directement dans le moteur de jeu.

```javascript
// Fonction personnalisée pour calculer des bonus de score
game.crocotina('calculateScoreBonus', function(baseScore, multiplier, levelBonus) {
    const bonus = baseScore * multiplier + (this.currentLevel * levelBonus);
    this.emit('scoreBonusCalculated', { baseScore, multiplier, levelBonus, bonus });
    return Math.floor(bonus);
}, {
    description: 'Calcule les bonus de score avec multiplicateurs',
    parameters: ['baseScore', 'multiplier', 'levelBonus'],
    category: 'scoring'
});

// Fonction de téléportation d'urgence du bras
game.crocotina('emergencyArmTeleport', function(safetyThreshold = 20) {
    if (this.armHealth <= safetyThreshold) {
        const oldHealth = this.armHealth;
        this.armHealth = Math.min(this.armHealth + 30, this.settings.initialArmHealth);
        
        console.log(`🚨 Téléportation d'urgence ! Vie: ${oldHealth} → ${this.armHealth}`);
        this.emit('emergencyTeleport', { oldHealth, newHealth: this.armHealth });
        
        return { success: true, healthRestored: this.armHealth - oldHealth };
    }
    
    return { success: false, reason: 'Seuil de sécurité non atteint' };
}, {
    description: 'Téléporte le bras en sécurité si la vie est critique',
    parameters: ['safetyThreshold'],
    category: 'emergency'
});

// Utiliser les fonctions personnalisées
const scoreBonus = game.executeCustomFunction('calculateScoreBonus', 100, 1.5, 10);
const teleportResult = game.executeCustomFunction('emergencyArmTeleport', 25);

console.log(`Bonus calculé: ${scoreBonus}`);
console.log(`Téléportation: ${teleportResult.success ? 'Réussie' : 'Échouée'}`);
```

### `crocofaf(quizId, quizData, quizLogic)` - Mini-jeux de quiz créatifs

Créez des quiz pour gagner des récompenses en tuant des crocodiles.

```javascript
// Quiz sur les crocodiles pour gagner des kills bonus
game.crocofaf('croco_quiz', {
    title: 'Quiz des Crocodiles',
    questions: [
        {
            question: 'Combien de dents a un crocodile adulte ?',
            answers: ['24', '64', '80', '32'],
            correct: 2, // Index de la bonne réponse
            killReward: 3
        },
        {
            question: 'Dans quel milieu vivent les crocodiles ?',
            answers: ['Désert', 'Forêt', 'Zones humides', 'Montagne'],
            correct: 2,
            killReward: 2
        },
        {
            question: 'Quelle est la vitesse maximale d\'un crocodile sur terre ?',
            answers: ['15 km/h', '25 km/h', '35 km/h', '45 km/h'],
            correct: 1,
            killReward: 4
        }
    ],
    timeLimit: 15000, // 15 secondes par question
    rewards: { coins: 50, experience: 25 }
}, function(quizData, action, context) {
    if (action === 'start') {
        console.log(`🧠 ${quizData.title} commence !`);
        this.emit('quizQuestionReady', {
            question: quizData.questions[0],
            timeLimit: quizData.timeLimit
        });
    } else if (action === 'answer') {
        const question = quizData.questions[context.currentQuestion];
        const isCorrect = context.answer === question.correct;
        
        if (isCorrect) {
            console.log(`✅ Bonne réponse ! ${question.killReward} crocodiles éliminés !`);
            
            // Tuer des crocodiles comme récompense
            for (let i = 0; i < question.killReward; i++) {
                this.crocokill();
            }
            
            return { 
                correct: true, 
                points: question.killReward,
                message: `${question.killReward} crocodiles éliminés !`
            };
        } else {
            console.log(`❌ Mauvaise réponse... La bonne réponse était: ${question.answers[question.correct]}`);
            return { 
                correct: false, 
                points: 0,
                message: 'Aucune récompense cette fois.'
            };
        }
    }
});

// Démarrer le quiz
game.startMiniGame('croco_quiz');

// Répondre à une question
game.answerQuizQuestion('croco_quiz', 2); // Réponse C
```

### `crocojup(messageId, messageData, messageLogic)` - Messages temporaires personnalisés

Affichez des notifications temporaires personnalisées.

```javascript
// Message de félicitations pour les level ups
game.crocojup('levelup_celebration', {
    text: 'NIVEAU SUPÉRIEUR !',
    duration: 3000,
    style: { color: 'gold', size: 'large', effect: 'glow' },
    position: 'center',
    animation: 'bounce'
}, function(messageData, context) {
    const level = context.level || this.currentLevel;
    const customText = `🎉 NIVEAU ${level} ATTEINT ! 🎉`;
    
    this.emit('celebrationMessage', {
        text: customText,
        style: messageData.style,
        position: messageData.position,
        animation: messageData.animation
    });
    
    // Animation de bonus
    if (level % 5 === 0) {
        // Tous les 5 niveaux, message spécial
        setTimeout(() => {
            this.showTemporaryMessage('milestone_bonus', { level });
        }, 1500);
    }
    
    return { enhanced: true, bonusMessage: level % 5 === 0 };
});

// Message de bonus de milestone
game.crocojup('milestone_bonus', {
    text: 'BONUS MILESTONE !',
    duration: 4000,
    style: { color: 'rainbow', size: 'huge', effect: 'sparkle' },
    animation: 'explosion'
}, function(messageData, context) {
    const bonusReward = context.level * 10;
    
    // Ajouter des pièces bonus
    if (this.economy && this.economy.currencies.gold) {
        this.economy.currencies.gold.amount += bonusReward;
    }
    
    console.log(`💰 Bonus milestone: ${bonusReward} pièces d'or !`);
    
    return { coinsAwarded: bonusReward };
});

// Déclencher automatiquement lors des level ups
game.on('levelUp', (data) => {
    game.showTemporaryMessage('levelup_celebration', { level: data.newLevel });
});
```

### `crocodae(powerUpId, powerUpData, powerUpLogic)` - Power-ups temporaires avancés

Créez des power-ups temporaires avec des effets complexes.

```javascript
// Power-up "Temps Ralenti" qui affecte tout le jeu
game.crocodae('bullet_time', {
    name: 'Temps Ralenti',
    duration: 8000,
    effects: {
        timeMultiplier: 0.5,
        playerSpeedBoost: 1.5,
        crocodileSlowDown: 0.3
    },
    cooldown: 20000,
    rarity: 'epic'
}, function(powerUpData, context, action) {
    if (action === 'activate') {
        console.log('⏰ TEMPS RALENTI ACTIVÉ !');
        
        // Ralentir tous les crocodiles
        if (this.crocodileSpeeds) {
            Object.keys(this.crocodileSpeeds).forEach(crocoId => {
                const croco = this.crocodileSpeeds[crocoId];
                croco.originalSpeed = croco.currentSpeed;
                croco.currentSpeed *= powerUpData.effects.crocodileSlowDown;
            });
        }
        
        // Effet visuel
        this.emit('bulletTimeStart', {
            timeMultiplier: powerUpData.effects.timeMultiplier,
            duration: powerUpData.duration
        });
        
        // Son ralenti
        this.emit('playSound', { sound: 'bullet_time_start', pitch: 0.7 });
        
    } else if (action === 'deactivate') {
        console.log('⏰ Temps normal rétabli.');
        
        // Restaurer la vitesse normale des crocodiles
        if (this.crocodileSpeeds) {
            Object.keys(this.crocodileSpeeds).forEach(crocoId => {
                const croco = this.crocodileSpeeds[crocoId];
                if (croco.originalSpeed) {
                    croco.currentSpeed = croco.originalSpeed;
                    delete croco.originalSpeed;
                }
            });
        }
        
        this.emit('bulletTimeEnd');
    }
});

// Power-up "Berserker" qui augmente tout
game.crocodae('berserker_mode', {
    name: 'Mode Berserker',
    duration: 12000,
    effects: {
        damageMultiplier: 3,
        speedBoost: 2,
        killsToWin: 0.5 // Divise par 2 le nombre de kills nécessaires
    },
    stackable: false,
    cooldown: 30000
}, function(powerUpData, context, action) {
    if (action === 'activate') {
        console.log('🔥 MODE BERSERKER ACTIVÉ !');
        
        // Stocker les valeurs originales
        this.originalSettings = {
            levelUpThreshold: this.settings.levelUpThreshold
        };
        
        // Réduire le nombre de crocodiles nécessaires pour level up
        this.settings.levelUpThreshold = Math.ceil(this.settings.levelUpThreshold * powerUpData.effects.killsToWin);
        
        this.emit('berserkerModeStart', {
            effects: powerUpData.effects,
            visualEffect: 'red_aura'
        });
        
    } else if (action === 'deactivate') {
        console.log('🔥 Mode Berserker terminé.');
        
        // Restaurer les paramètres
        if (this.originalSettings) {
            this.settings.levelUpThreshold = this.originalSettings.levelUpThreshold;
            delete this.originalSettings;
        }
        
        this.emit('berserkerModeEnd');
    }
});

// Activer les power-ups selon certaines conditions
game.on('crocoKilled', (data) => {
    if (data.killedCount % 10 === 0) { // Tous les 10 kills
        if (Math.random() < 0.3) { // 30% de chance
            game.activateTemporaryPowerUp('bullet_time');
        }
    }
    
    if (this.armHealth < 30 && Math.random() < 0.2) { // 20% si vie critique
        game.activateTemporaryPowerUp('berserker_mode');
    }
});
```

### `crocolog(logId, logConfig, logLogic)` - Logs personnalisés créatifs

Créez un système de logging avec des formes et des couleurs.

```javascript
// Système de log avec formes ASCII et couleurs
game.crocolog('ascii_logger', {
    prefix: '🐊',
    colors: {
        info: '\x1b[36m',    // Cyan
        warning: '\x1b[33m', // Jaune
        error: '\x1b[31m',   // Rouge
        success: '\x1b[32m', // Vert
        reset: '\x1b[0m'     // Reset
    },
    shapes: {
        box: '█',
        triangle: '▲',
        diamond: '◆',
        star: '★',
        heart: '♥'
    },
    format: 'creative'
}, function(logConfig, logEntry) {
    const { colors, shapes, prefix } = logConfig;
    const { message, data, level, timestamp } = logEntry;
    
    // Créer un motif selon le niveau
    let pattern = '';
    let color = colors[level] || colors.info;
    
    switch (level) {
        case 'success':
            pattern = shapes.star.repeat(3);
            break;
        case 'error':
            pattern = shapes.triangle.repeat(5);
            break;
        case 'warning':
            pattern = shapes.diamond.repeat(4);
            break;
        default:
            pattern = shapes.box.repeat(2);
    }
    
    // Format créatif avec timestamp
    const timeStr = new Date(timestamp).toLocaleTimeString();
    const formattedMessage = `${color}${pattern} ${prefix} [${timeStr}] ${message} ${pattern}${colors.reset}`;
    
    // Ajouter des données supplémentaires si présentes
    if (data.shape) {
        const customShape = shapes[data.shape] || '?';
        return formattedMessage + `\n${color}${customShape.repeat(10)}${colors.reset}`;
    }
    
    return formattedMessage;
});

// Logger de combat avec statistiques visuelles
game.crocolog('combat_stats', {
    prefix: '⚔️',
    format: 'stats',
    shapes: {
        health: '♥',
        kill: '💀',
        level: '⭐'
    }
}, function(logConfig, logEntry) {
    const { message, data } = logEntry;
    const { shapes } = logConfig;
    
    if (data.type === 'combat_summary') {
        const healthBar = shapes.health.repeat(Math.floor(data.armHealth / 10));
        const killCount = shapes.kill.repeat(Math.min(data.kills, 10));
        const levelStars = shapes.level.repeat(data.level);
        
        return `
╔══════════════════════════════════╗
║ ${message.padEnd(32)} ║
║ Vie: ${healthBar.padEnd(20)} ║
║ Kills: ${killCount.padEnd(18)} ║
║ Niveau: ${levelStars.padEnd(15)} ║
╚══════════════════════════════════╝`;
    }
    
    return `⚔️ ${message}`;
});

// Utiliser les logs personnalisés
game.writeCustomLog('ascii_logger', 'Crocodile éliminé !', { level: 'success', shape: 'star' });
game.writeCustomLog('ascii_logger', 'Attention, bras en danger !', { level: 'warning' });

// Log automatique des statistiques de combat
game.on('levelUp', (data) => {
    game.writeCustomLog('combat_stats', 'NIVEAU SUPÉRIEUR !', {
        type: 'combat_summary',
        armHealth: game.armHealth,
        kills: game.killedCrocodilesThisLevel,
        level: data.newLevel
    });
});
```

### `crocojust(cloneId, cloneData, cloneLogic)` - Clonage et invocation de crocodiles

Permettez aux crocodiles de se dupliquer ou d'invoquer des alliés.

```javascript
// Système de clonage pour crocodiles alpha
game.crocojust('alpha_cloning', {
    maxClones: 2,
    cloneCooldown: 8000,
    cloneConditions: { minLevel: 3, healthThreshold: 0.5 },
    cloneProperties: { health: 0.7, speed: 1.2, lifespan: 15000 },
    invocationRules: { maxInvocations: 3 }
}, function(cloneData, context) {
    const { sourceCrocoId, gameState, context: cloneContext } = context;
    
    // Vérifier si les conditions de clonage sont remplies
    const canClone = gameState.currentLevel >= cloneData.cloneConditions.minLevel;
    const sourceHealth = this.crocodileHealths && this.crocodileHealths[sourceCrocoId] ? 
                        this.crocodileHealths[sourceCrocoId].currentHealth : 100;
    const healthOk = sourceHealth >= 50; // Santé minimale pour cloner
    
    if (canClone && healthOk && Math.random() < 0.3) { // 30% de chance
        const cloneId = Date.now() + Math.random();
        
        // Créer le clone avec propriétés réduites
        this.crocolife(cloneId, Math.floor(sourceHealth * cloneData.cloneProperties.health));
        this.crocorap(cloneId, 1.0 * cloneData.cloneProperties.speed);
        
        console.log(`🧬 Crocodile ${sourceCrocoId} se clone ! Clone ID: ${cloneId}`);
        
        // Le clone disparaît automatiquement après un délai
        setTimeout(() => {
            if (this.crocodileHealths && this.crocodileHealths[cloneId]) {
                delete this.crocodileHealths[cloneId];
                this.emit('cloneExpired', { cloneId, sourceId: sourceCrocoId });
                console.log(`💨 Clone ${cloneId} disparaît.`);
            }
        }, cloneData.cloneProperties.lifespan);
        
        return { 
            success: true, 
            cloneId: cloneId,
            properties: {
                health: Math.floor(sourceHealth * cloneData.cloneProperties.health),
                speed: cloneData.cloneProperties.speed,
                temporary: true
            }
        };
    }
    
    return { success: false, reason: 'Conditions non remplies' };
});

// Invocation de crocodiles minions
game.crocojust('necro_summoning', {
    maxClones: 5,
    cloneCooldown: 12000,
    invocationRules: {
        minionType: 'skeleton_croco',
        minionHealth: 30,
        minionCount: 3
    }
}, function(cloneData, context) {
    const { sourceCrocoId } = context;
    const summonedMinions = [];
    
    console.log(`🧙‍♂️ Crocodile nécromancien ${sourceCrocoId} invoque des squelettes !`);
    
    for (let i = 0; i < cloneData.invocationRules.minionCount; i++) {
        const minionId = Date.now() + i;
        
        // Créer un minion squelette
        this.crocolife(minionId, cloneData.invocationRules.minionHealth);
        this.crocoarmure(minionId, 10); // Fragile
        this.crocorap(minionId, 0.8); // Lent
        
        // Comportement spécial des minions
        this.crocia(minionId, 'minion', (aiData) => {
            return { action: 'swarm_attack', newState: 'swarming' };
        });
        
        summonedMinions.push(minionId);
    }
    
    return { 
        success: true, 
        cloneId: 'multiple',
        summonedMinions: summonedMinions,
        properties: { type: 'necromancy', count: summonedMinions.length }
    };
});

// Déclencher le clonage automatiquement
game.on('crocoKilled', (data) => {
    // Chance de clonage pour les crocodiles survivants
    if (Math.random() < 0.15) { // 15% de chance
        game.cloneCrocodile('alpha_cloning', 1);
    }
    
    // Invocation nécromantique si beaucoup de crocodiles morts
    if (data.killedCount > 10 && data.killedCount % 7 === 0) {
        game.cloneCrocodile('necro_summoning', 666); // ID du nécromancien
    }
});
```

### Et 6 autres fonctionnalités innovantes...

Les fonctionnalités restantes (`crocorare`, `crocomd`, `crocoglop`, `crocofarm`, `crocenvie`) offrent des possibilités infinies pour créer des expériences de jeu uniques avec des crocodiles rares, des tutoriels interactifs, des personnalisations comportementales, des systèmes de reproduction et des motivations complexes pour vos crocodiles.

## Événements v1.3.0

Les nouvelles fonctionnalités émettent de nombreux nouveaux événements :

```javascript
// Événements des quêtes dynamiques
game.on('dynamicQuestStarted', (data) => {
    console.log(`Quête dynamique ${data.questId} démarrée !`);
});

// Événements climatiques
game.on('weatherActivated', (data) => {
    console.log(`Climat ${data.weatherId} activé !`);
});

// Événements IA avancée
game.on('advancedAIDecision', (data) => {
    console.log(`IA ${data.crocoId}: ${JSON.stringify(data.decision)}`);
});

// Et plus de 50 nouveaux événements...
```

## Exemple complet v1.3.0

```javascript
const CrocobrasGame = require('crocobras');
const game = new CrocobrasGame();

// Configuration complète avec les nouvelles fonctionnalités
function setupAdvancedGame() {
    // 1. Quête adaptative
    game.crocojom('main_quest', {
        title: 'La Grande Chasse',
        branches: { start: { choices: ['brave', 'careful'] } }
    }, (questData, progress, action, choice) => {
        if (choice?.action === 'brave') {
            game.activateWeather('storm');
        }
    });
    
    // 2. Climat dynamique
    game.crocera('fog', {
        duration: 20000,
        crocodileEffects: { stealth: 1.5 }
    }, (weatherData) => {
        console.log('🌫️ Brouillard épais !');
    });
    
    // 3. IA avancée
    game.crocorin(1, { learningRate: 0.2 }, (aiData) => {
        return { action: 'adaptive_hunt', confidence: 0.8 };
    });
    
    // 4. Messages temporaires
    game.crocojup('achievement', {
        text: 'SUCCÈS DÉBLOQUÉ !',
        duration: 2000
    }, (data) => ({ enhanced: true }));
    
    // 5. Logs créatifs
    game.crocolog('game_logger', {
        colors: { info: '\x1b[36m' },
        shapes: { star: '★' }
    }, (config, entry) => {
        return `${config.colors.info}★ ${entry.message} ★\x1b[0m`;
    });
}

setupAdvancedGame();
game.startGame();

// Démarrer une quête dynamique
game.startDynamicQuest('main_quest');

console.log('🚀 Jeu Crocobras v1.3.0 avec toutes les fonctionnalités avancées !');
```

## Contribution

Toutes les idées et contributions sont les bienvenues ! N'hésitez pas à ouvrir des issues ou à soumettre des pull requests sur le dépôt GitHub.

## Changelog v1.3.0

- ✨ Ajout de `crocojom()` pour les quêtes dynamiques adaptatives
- ✨ Ajout de `crocera()` pour le système climatique interactif
- ✨ Ajout de `crocogiw()` pour les événements spéciaux conditionnels
- ✨ Ajout de `crocorin()` pour l'IA avancée avec prise de décision
- ✨ Ajout de `crocomp()` pour l'analyse de données de jeu
- ✨ Ajout de `crocotina()` pour les fonctions JavaScript personnalisées
- ✨ Ajout de `crocofaf()` pour les mini-jeux de quiz créatifs
- ✨ Ajout de `crocojup()` pour les messages temporaires personnalisés
- ✨ Ajout de `crocodae()` pour les power-ups temporaires avançés
- ✨ Ajout de `crocolog()` pour les logs personnalisés créatifs
- ✨ Ajout de `crocojust()` pour le clonage et l'invocation de crocodiles
- ✨ Ajout de `crocorare()` pour les crocodiles rares spéciaux
- ✨ Ajout de `crocomd()` pour les tutoriels interactifs
- ✨ Ajout de `crocoglop()` pour la personnalisation comportementale
- ✨ Ajout de `crocofarm()` pour le système de bébés crocodiles
- ✨ Ajout de `crocenvie()` pour le système d'envies des crocodiles
- 📡 Plus de 50 nouveaux événements pour toutes les nouvelles fonctionnalités
- 🎮 Possibilités créatives infinies pour les développeurs
- 🧠 IA et systèmes adaptatifs révolutionnaires
- 🌟 Gameplay dynamique et évolutif

**Lien de notre documentation officielle** :

https://croco-combat-arena.lovable.app/


