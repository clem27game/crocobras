// crocobras/index.js

const EventEmitter = require('events');
const nekomaths = require('nekomaths'); // Pour les nombres aléatoires

// --- Configuration du jeu (peut être personnalisé par le développeur utilisateur) ---
const DEFAULT_GAME_SETTINGS = {
    initialArmHealth: 100, // Exemple de vie du bras
    crocoDamage: 25,       // Dégâts d'un croco qui mange le bras
    initialCrocodiles: 1,  // Nombre de crocos au niveau 1
    crocoPerLevel: 1,      // Crocos supplémentaires par niveau
    crocoSpeedMultiplier: 1.1, // Crocos plus rapides à chaque niveau
    levelUpThreshold: 5    // Crocos à tuer pour passer au niveau suivant (modifiable via croconumber)
};

class CrocobrasGame extends EventEmitter {
    constructor(settings = {}) {
        super();
        this.settings = { ...DEFAULT_GAME_SETTINGS, ...settings };

        this.armHealth = this.settings.initialArmHealth;
        this.currentLevel = 1;
        this.crocodilesRemaining = 0; // Nombre de crocos à tuer pour le niveau actuel
        this.crocodilesSpawnedThisLevel = 0; // Crocos déjà apparus ce niveau
        this.killedCrocodilesThisLevel = 0; // Crocos tués dans le niveau actuel
        this.isGameOver = false;
        this.isGameRunning = false;

        // Stocke les crocos actifs pour la logique de collision
        // En vrai jeu, ce serait un tableau d'objets avec position, vitesse, etc.
        // Ici, on gère juste le nombre.
        this.activeCrocodiles = [];

        this.initializeLevel();
    }

    /**
     * Initialise le niveau actuel : détermine le nombre de crocodiles à tuer.
     * Peut être appelé manuellement par crocolevel.
     * @param {number} [level] - Niveau spécifique à initialiser. Si non fourni, utilise currentLevel.
     */
    initializeLevel(level = this.currentLevel) {
        this.currentLevel = level;
        this.killedCrocodilesThisLevel = 0;
        this.crocodilesSpawnedThisLevel = 0;
        
        // Calcul du nombre total de crocos pour ce niveau
        // Tu as dit "un crocodile de plus que le niveau suivant arrive en même temps"
        // Interprétation: Niveau 1 -> 1 croco, Niveau 2 -> 2 crocos, etc.
        this.crocodilesToSpawnTotal = this.settings.initialCrocodiles + (this.currentLevel - 1) * this.settings.crocoPerLevel;
        this.crocodilesRemaining = this.crocodilesToSpawnTotal; // Pour l'UI du développeur utilisateur

        this.emit('levelInitialized', {
            level: this.currentLevel,
            crocodilesToKill: this.crocodilesToSpawnTotal,
            armHealth: this.armHealth
        });
        console.log(`[Crocobras] Niveau ${this.currentLevel} initialisé. Crocodiles à tuer : ${this.crocodilesToSpawnTotal}`);
    }

    /**
     * Démarre la partie.
     * @returns {boolean} True si le jeu a démarré, false s'il était déjà en cours.
     */
    startGame() {
        if (this.isGameRunning) {
            this.emit('gameAlreadyRunning');
            return false;
        }
        this.isGameRunning = true;
        this.isGameOver = false;
        this.armHealth = this.settings.initialArmHealth;
        this.currentLevel = 1;
        this.initializeLevel(1);
        this.emit('gameStarted', { level: this.currentLevel, armHealth: this.armHealth });
        console.log("[Crocobras] Partie démarrée !");
        return true;
    }

    /**
     * Gère la fin de partie.
     * @fires CrocobrasGame#gameOver
     * @returns {boolean} True si le jeu est terminé, false sinon (si déjà game over).
     */
    crocover() {
        if (this.isGameOver) return false;
        this.isGameOver = true;
        this.isGameRunning = false;
        this.emit('gameOver', { finalLevel: this.currentLevel, reason: 'Arm eaten' });
        console.log("[Crocobras] GAME OVER ! Le bras a été mangé.");
        return true;
    }

    /**
     * Redémarre le jeu au niveau 1.
     * @fires CrocobrasGame#gameReset
     */
    crocoreset() {
        this.armHealth = this.settings.initialArmHealth;
        this.currentLevel = 1;
        this.correctGuesses = 0; // Si jamais tu as une logique de devinette cachée
        this.isGameOver = false;
        this.isGameRunning = false; // Ne pas démarrer automatiquement, l'utilisateur appellera startGame()
        this.killedCrocodilesThisLevel = 0;
        this.crocodilesSpawnedThisLevel = 0;
        this.activeCrocodiles = []; // Vide les crocos actifs
        this.initializeLevel(1); // Réinitialise le premier niveau
        this.emit('gameReset', { level: this.currentLevel, armHealth: this.armHealth });
        console.log("[Crocobras] Jeu réinitialisé au niveau 1.");
    }

    /**
     * Simule un crocodile mangeant le bras.
     * Déclenche la perte de points de vie ou le game over.
     * @fires CrocobrasGame#armEaten
     * @fires CrocobrasGame#gameOver
     */
    crocobouffe() {
        if (!this.isGameRunning || this.isGameOver) {
            console.log("[Crocobras] Ignoré: le jeu n'est pas en cours ou est terminé.");
            return;
        }

        this.armHealth = nekomaths.neksub(this.armHealth, this.settings.crocoDamage);
        this.emit('armEaten', {
            currentHealth: this.armHealth,
            damageTaken: this.settings.crocoDamage
        });
        console.log(`[Crocobras] Un crocodile a mangé le bras ! Vie restante : ${this.armHealth}`);

        if (this.armHealth <= 0) {
            this.crocover();
        }
    }

    /**
     * Simule un coup de feu tiré. Ne gère pas si la cible est touchée.
     * Les développeurs utilisent `crocofuls` pour la logique de détection.
     * @fires CrocobrasGame#shotFired
     */
    crocotire() {
        if (!this.isGameRunning || this.isGameOver) {
            this.emit('gameNotRunning');
            return;
        }
        this.emit('shotFired');
        console.log("[Crocobras] Coup de feu tiré !");
    }

    /**
     * Simule la mort d'un crocodile.
     * @fires CrocobrasGame#crocoKilled
     * @fires CrocobrasGame#levelUp
     * @returns {boolean} True si un crocodile a été tué, false si aucun n'est à tuer.
     */
    crocokill() {
        if (!this.isGameRunning || this.isGameOver) {
            this.emit('gameNotRunning');
            return false;
        }
        if (this.killedCrocodilesThisLevel < this.crocodilesToSpawnTotal) {
            this.killedCrocodilesThisLevel = nekomaths.nekadd(this.killedCrocodilesThisLevel, 1);
            this.crocodilesRemaining = nekomaths.neksub(this.crocodilesToSpawnTotal, this.killedCrocodilesThisLevel);

            this.emit('crocoKilled', {
                killedCount: this.killedCrocodilesThisLevel,
                remainingCount: this.crocodilesRemaining,
                level: this.currentLevel
            });
            console.log(`[Crocobras] Crocodile tué ! Restant : ${this.crocodilesRemaining}/${this.crocodilesToSpawnTotal}`);

            if (this.killedCrocodilesThisLevel >= this.crocodilesToSpawnTotal) {
                this.levelUp(); // Passe au niveau suivant
            }
            return true;
        } else {
            this.emit('noMoreCrocosToKill');
            console.log("[Crocobras] Tous les crocodiles du niveau actuel sont déjà tués.");
            return false;
        }
    }

    /**
     * Permet aux développeurs de définir le nombre de crocos à tuer pour un niveau donné.
     * OU de définir le seuil pour le passage de niveau.
     * @param {number} [targetCrocosPerLevel] - Nombre de crocodiles requis pour passer le niveau actuel.
     * @param {number} [levelToApply] - Le niveau auquel appliquer ce seuil. Si non fourni, applique à levelUpThreshold.
     */
    croconumber(targetCrocosPerLevel = DEFAULT_GAME_SETTINGS.levelUpThreshold) {
        // Cette fonction peut être interprétée de deux façons:
        // 1. Définir le nombre de crocos à tuer pour le level up (ce que tu as dit "double pour le niveau suivant")
        // 2. Définir le nombre de crocos qui apparaissent
        // Je vais opter pour la 1ère (seuil de level up) comme le plus utile pour la personnalisation.
        // La quantité de crocos qui apparaissent est déjà gérée par initializeLevel.

        this.settings.levelUpThreshold = targetCrocosPerLevel;
        this.emit('levelUpThresholdUpdated', targetCrocosPerLevel);
        console.log(`[Crocobras] Seuil de crocos à tuer pour passer le niveau mis à jour : ${targetCrocosPerLevel}`);
    }


    /**
     * Fait monter le jeu de niveau.
     * @fires CrocobrasGame#levelUp
     */
    levelUp() {
        if (this.isGameOver) {
            this.emit('gameNotRunning');
            return;
        }
        this.currentLevel = nekomaths.nekadd(this.currentLevel, 1);
        this.emit('levelUp', { newLevel: this.currentLevel });
        console.log(`[Crocobras] BRAVO ! Vous passez au niveau ${this.currentLevel} !`);
        this.initializeLevel(this.currentLevel); // Réinitialise les compteurs pour le nouveau niveau
    }

    // --- Fonctions d'accès aux états (pour l'UI) ---
    getGameState() {
        return {
            armHealth: this.armHealth,
            currentLevel: this.currentLevel,
            crocodilesRemaining: this.crocodilesRemaining,
            crocodilesToSpawnTotal: this.crocodilesToSpawnTotal,
            killedCrocodilesThisLevel: this.killedCrocodilesThisLevel,
            isGameOver: this.isGameOver,
            isGameRunning: this.isGameRunning
        };
    }

    /**
     * crocofuls: Permet de définir une logique de détection de tir personnalisée.
     * Cette fonction ne fait rien directement, elle est là comme un hook ou un concept.
     * C'est au développeur d'appeler `crocokill()` si sa logique de `crocofuls` détecte un coup réussi.
     * @param {Function} customGunLogic - Une fonction de callback que le développeur fournira.
     */
    crocofuls(customGunLogic) {
        if (typeof customGunLogic === 'function') {
            this.emit('customGunLogicDefined', customGunLogic);
            console.log("[Crocobras] Logique de tir personnalisée définie. Le développeur doit l'appeler !");
        } else {
            throw new Error("crocofuls: L'argument doit être une fonction.");
        }
    }

    /**
     * crocoanm: Ce package ne gère PAS les sons/musiques directement.
     * Cette fonction est un simple émetteur d'événements pour indiquer au développeur
     * qu'il est temps de jouer un son ou une musique.
     * @param {string} soundType - Le type de son ('shot', 'crocoGrowl', 'musicLoop', 'gameOverSound').
     */
    crocoanm(soundType) {
        this.emit('playAnimationSound', soundType);
        console.log(`[Crocobras] Événement de son émis : ${soundType}.`);
    }

    /**
     * crocustom: Permet aux développeurs d'étendre la logique du jeu avec leurs propres fonctions.
     * C'est une fonction "fourre-tout" pour la personnalisation avancée.
     * Le développeur peut passer un objet de nouvelles fonctions ou un callback pour modifier le jeu.
     * @param {Function|object} customization - Une fonction ou un objet contenant des personnalisations.
     */
    crocustom(customization) {
        if (typeof customization === 'function') {
            customization(this); // Passe l'instance du jeu au développeur pour qu'il puisse interagir.
            this.emit('gameCustomized', 'function');
        } else if (typeof customization === 'object' && customization !== null) {
            Object.assign(this, customization); // Fusionne les propriétés dans l'instance du jeu
            this.emit('gameCustomized', 'object');
        } else {
            throw new Error("crocustom: L'argument doit être une fonction ou un objet.");
        }
        console.log("[Crocobras] Personnalisation avancée appliquée via crocustom.");
    }

    /**
     * crocopow: Permet au développeur de créer ses propres power-ups avec sa logique JavaScript.
     * @param {string} powerUpType - Type/nom du power-up personnalisé
     * @param {Function} powerUpLogic - Fonction qui définit l'effet du power-up
     * @param {Object} [options] - Options supplémentaires (durée, valeur, etc.)
     */
    crocopow(powerUpType, powerUpLogic, options = {}) {
        if (typeof powerUpLogic !== 'function') {
            throw new Error("crocopow: powerUpLogic doit être une fonction.");
        }
        
        if (!this.customPowerUps) {
            this.customPowerUps = {};
        }
        
        this.customPowerUps[powerUpType] = {
            logic: powerUpLogic,
            options: { duration: 5000, value: 1, ...options }
        };
        
        this.emit('customPowerUpRegistered', { type: powerUpType, options });
        console.log(`[Crocobras] Power-up personnalisé '${powerUpType}' enregistré.`);
    }

    /**
     * Déclenche un power-up personnalisé
     * @param {string} powerUpType - Type du power-up à activer
     */
    activatePowerUp(powerUpType) {
        if (!this.customPowerUps || !this.customPowerUps[powerUpType]) {
            console.warn(`[Crocobras] Power-up '${powerUpType}' non trouvé.`);
            return false;
        }
        
        const powerUp = this.customPowerUps[powerUpType];
        powerUp.logic.call(this, powerUp.options);
        this.emit('powerUpActivated', { type: powerUpType, options: powerUp.options });
        console.log(`[Crocobras] Power-up '${powerUpType}' activé !`);
        return true;
    }

    /**
     * crocoboost: Permet au développeur de créer des systèmes de boost temporaires ou de cadeaux.
     * @param {string} boostType - Type de boost (ex: 'speedBoost', 'damageBoost', 'healthBoost')
     * @param {number} value - Valeur du boost
     * @param {number} duration - Durée en millisecondes
     * @param {Function} [onExpire] - Callback appelé quand le boost expire
     */
    crocoboost(boostType, value, duration, onExpire = null) {
        if (!this.activeBoosts) {
            this.activeBoosts = {};
        }
        
        // Appliquer le boost
        this.activeBoosts[boostType] = {
            value: value,
            startTime: Date.now(),
            duration: duration,
            onExpire: onExpire
        };
        
        this.emit('boostActivated', { type: boostType, value, duration });
        console.log(`[Crocobras] Boost '${boostType}' activé pour ${duration}ms avec valeur ${value}.`);
        
        // Programmer l'expiration du boost
        setTimeout(() => {
            if (this.activeBoosts && this.activeBoosts[boostType]) {
                delete this.activeBoosts[boostType];
                if (onExpire) onExpire();
                this.emit('boostExpired', { type: boostType });
                console.log(`[Crocobras] Boost '${boostType}' expiré.`);
            }
        }, duration);
    }

    /**
     * Vérifie si un boost est actif
     * @param {string} boostType - Type de boost à vérifier
     * @returns {boolean|Object} False si inactif, sinon retourne les données du boost
     */
    getActiveBoost(boostType) {
        return this.activeBoosts && this.activeBoosts[boostType] ? this.activeBoosts[boostType] : false;
    }

    /**
     * crocolife: Permet au développeur de définir un système de points de vie pour les crocodiles.
     * @param {number} crocoId - ID unique du crocodile
     * @param {number} health - Points de vie du crocodile
     * @param {Object} [options] - Options supplémentaires (maxHealth, regeneration, etc.)
     */
    crocolife(crocoId, health, options = {}) {
        if (!this.crocodileHealths) {
            this.crocodileHealths = {};
        }
        
        this.crocodileHealths[crocoId] = {
            currentHealth: health,
            maxHealth: options.maxHealth || health,
            regeneration: options.regeneration || 0,
            lastRegenTime: Date.now(),
            ...options
        };
        
        this.emit('crocodileHealthSet', { crocoId, health, options });
        console.log(`[Crocobras] Crocodile ${crocoId} a maintenant ${health} points de vie.`);
    }

    /**
     * Inflige des dégâts à un crocodile spécifique
     * @param {number} crocoId - ID du crocodile
     * @param {number} damage - Dégâts à infliger
     * @returns {boolean} True si le crocodile est mort, false sinon
     */
    damageCrocodile(crocoId, damage) {
        if (!this.crocodileHealths || !this.crocodileHealths[crocoId]) {
            // Si pas de système de vie défini, comportement par défaut (mort en 1 coup)
            return this.crocokill();
        }
        
        const croco = this.crocodileHealths[crocoId];
        croco.currentHealth = nekomaths.neksub(croco.currentHealth, damage);
        
        this.emit('crocodileDamaged', { crocoId, damage, remainingHealth: croco.currentHealth });
        console.log(`[Crocobras] Crocodile ${crocoId} reçoit ${damage} dégâts. Vie restante: ${croco.currentHealth}`);
        
        if (croco.currentHealth <= 0) {
            delete this.crocodileHealths[crocoId];
            this.emit('crocodileKilledByDamage', { crocoId });
            return this.crocokill();
        }
        
        return false;
    }

    /**
     * crocoarmure: Permet au développeur de personnaliser la force des crocodiles.
     * @param {number} crocoId - ID du crocodile
     * @param {number} strength - Force/armure du crocodile
     * @param {Function} [strengthLogic] - Logique personnalisée pour calculer la force
     */
    crocoarmure(crocoId, strength, strengthLogic = null) {
        if (!this.crocodileStrengths) {
            this.crocodileStrengths = {};
        }
        
        this.crocodileStrengths[crocoId] = {
            baseStrength: strength,
            currentStrength: strength,
            strengthLogic: strengthLogic,
            lastUpdate: Date.now()
        };
        
        this.emit('crocodileStrengthSet', { crocoId, strength });
        console.log(`[Crocobras] Crocodile ${crocoId} a maintenant une force de ${strength}.`);
    }

    /**
     * Met à jour la force d'un crocodile selon sa logique personnalisée
     * @param {number} crocoId - ID du crocodile
     * @param {Object} [context] - Contexte pour la logique (niveau, temps, etc.)
     */
    updateCrocodileStrength(crocoId, context = {}) {
        if (!this.crocodileStrengths || !this.crocodileStrengths[crocoId]) return;
        
        const croco = this.crocodileStrengths[crocoId];
        if (croco.strengthLogic) {
            const newStrength = croco.strengthLogic.call(this, croco.currentStrength, context);
            croco.currentStrength = newStrength;
            croco.lastUpdate = Date.now();
            
            this.emit('crocodileStrengthUpdated', { crocoId, newStrength, context });
            console.log(`[Crocobras] Force du crocodile ${crocoId} mise à jour: ${newStrength}`);
        }
    }

    /**
     * crocorap: Permet aux développeurs de personnaliser la vitesse des crocodiles.
     * @param {number} crocoId - ID du crocodile
     * @param {number} speed - Vitesse du crocodile
     * @param {Function} [speedModifier] - Fonction pour modifier la vitesse dynamiquement
     */
    crocorap(crocoId, speed, speedModifier = null) {
        if (!this.crocodileSpeeds) {
            this.crocodileSpeeds = {};
        }
        
        this.crocodileSpeeds[crocoId] = {
            baseSpeed: speed,
            currentSpeed: speed,
            speedModifier: speedModifier,
            lastUpdate: Date.now()
        };
        
        this.emit('crocodileSpeedSet', { crocoId, speed });
        console.log(`[Crocobras] Crocodile ${crocoId} a maintenant une vitesse de ${speed}.`);
    }

    /**
     * Met à jour la vitesse d'un crocodile
     * @param {number} crocoId - ID du crocodile
     * @param {Object} [factors] - Facteurs influençant la vitesse (niveau, boosts, etc.)
     */
    updateCrocodileSpeed(crocoId, factors = {}) {
        if (!this.crocodileSpeeds || !this.crocodileSpeeds[crocoId]) return;
        
        const croco = this.crocodileSpeeds[crocoId];
        if (croco.speedModifier) {
            const newSpeed = croco.speedModifier.call(this, croco.baseSpeed, factors);
            croco.currentSpeed = newSpeed;
            croco.lastUpdate = Date.now();
            
            this.emit('crocodileSpeedUpdated', { crocoId, newSpeed, factors });
            console.log(`[Crocobras] Vitesse du crocodile ${crocoId} mise à jour: ${newSpeed}`);
        }
    }

    /**
     * crocopop: Permet au développeur de créer des systèmes de danse/esquive sur les crocodiles.
     * @param {number} crocoId - ID du crocodile
     * @param {string} danceType - Type de danse/mouvement ('dodge', 'spin', 'jump', etc.)
     * @param {Function} danceLogic - Logique de la danse/esquive
     * @param {Object} [options] - Options (durée, probabilité d'esquive, etc.)
     */
    crocopop(crocoId, danceType, danceLogic, options = {}) {
        if (typeof danceLogic !== 'function') {
            throw new Error("crocopop: danceLogic doit être une fonction.");
        }
        
        if (!this.crocodileDances) {
            this.crocodileDances = {};
        }
        
        if (!this.crocodileDances[crocoId]) {
            this.crocodileDances[crocoId] = {};
        }
        
        this.crocodileDances[crocoId][danceType] = {
            logic: danceLogic,
            options: { duration: 1000, dodgeChance: 0.3, ...options },
            isActive: false
        };
        
        this.emit('crocodileDanceRegistered', { crocoId, danceType, options });
        console.log(`[Crocobras] Danse '${danceType}' enregistrée pour le crocodile ${crocoId}.`);
    }

    /**
     * Déclenche une danse/esquive pour un crocodile
     * @param {number} crocoId - ID du crocodile
     * @param {string} danceType - Type de danse à exécuter
     * @returns {boolean} True si la danse a été déclenchée, false sinon
     */
    triggerCrocodileDance(crocoId, danceType) {
        if (!this.crocodileDances || !this.crocodileDances[crocoId] || !this.crocodileDances[crocoId][danceType]) {
            return false;
        }
        
        const dance = this.crocodileDances[crocoId][danceType];
        if (dance.isActive) return false; // Déjà en cours
        
        dance.isActive = true;
        const result = dance.logic.call(this, crocoId, dance.options);
        
        this.emit('crocodileDanceTriggered', { crocoId, danceType, result });
        console.log(`[Crocobras] Crocodile ${crocoId} exécute la danse '${danceType}'.`);
        
        // Fin automatique de la danse après la durée
        setTimeout(() => {
            if (this.crocodileDances && this.crocodileDances[crocoId] && this.crocodileDances[crocoId][danceType]) {
                this.crocodileDances[crocoId][danceType].isActive = false;
                this.emit('crocodileDanceEnded', { crocoId, danceType });
            }
        }, dance.options.duration);
        
        return true;
    }

    /**
     * crocoexplose: Fait exploser un crocodile à sa mort, infligeant des dégâts de zone.
     * @param {number} crocoId - ID du crocodile qui explose
     * @param {number} explosionDamage - Dégâts de l'explosion
     * @param {number} explosionRadius - Rayon de l'explosion
     * @param {Function} [explosionLogic] - Logique personnalisée d'explosion
     */
    crocoexplose(crocoId, explosionDamage, explosionRadius, explosionLogic = null) {
        const explosion = {
            damage: explosionDamage,
            radius: explosionRadius,
            logic: explosionLogic,
            source: crocoId
        };
        
        // Si logique personnalisée fournie, l'utiliser
        if (explosionLogic && typeof explosionLogic === 'function') {
            explosionLogic.call(this, explosion);
        } else {
            // Logique par défaut : dégâts au bras si dans le rayon
            this.handleDefaultExplosion(explosion);
        }
        
        this.emit('crocodileExploded', { 
            crocoId, 
            damage: explosionDamage, 
            radius: explosionRadius 
        });
        console.log(`[Crocobras] Crocodile ${crocoId} explose ! Dégâts: ${explosionDamage}, Rayon: ${explosionRadius}`);
    }

    /**
     * Gère l'explosion par défaut (dégâts au bras)
     * @private
     */
    handleDefaultExplosion(explosion) {
        // Dans un vrai jeu, on vérifierait la distance entre l'explosion et les cibles
        // Ici, on simule des dégâts au bras
        const armDamage = Math.floor(explosion.damage * 0.5); // 50% des dégâts à l'explosion
        this.armHealth = nekomaths.neksub(this.armHealth, armDamage);
        
        this.emit('explosionDamageToArm', { 
            damage: armDamage, 
            source: explosion.source,
            currentArmHealth: this.armHealth 
        });
        
        console.log(`[Crocobras] L'explosion inflige ${armDamage} dégâts au bras. Vie restante: ${this.armHealth}`);
        
        if (this.armHealth <= 0) {
            this.crocover();
        }
    }

    /**
     * Version améliorée de crocokill qui prend en compte les nouvelles mécaniques
     * @param {number} [crocoId] - ID spécifique du crocodile tué (optionnel)
     * @returns {boolean} True si un crocodile a été tué, false sinon
     */
    crocokillAdvanced(crocoId = null) {
        const killed = this.crocokill(); // Appel de la fonction originale
        
        if (killed && crocoId) {
            // Nettoyer les données du crocodile mort
            if (this.crocodileHealths && this.crocodileHealths[crocoId]) {
                delete this.crocodileHealths[crocoId];
            }
            if (this.crocodileStrengths && this.crocodileStrengths[crocoId]) {
                delete this.crocodileStrengths[crocoId];
            }
            if (this.crocodileSpeeds && this.crocodileSpeeds[crocoId]) {
                delete this.crocodileSpeeds[crocoId];
            }
            if (this.crocodileDances && this.crocodileDances[crocoId]) {
                delete this.crocodileDances[crocoId];
            }
            
            this.emit('crocodileDataCleared', { crocoId });
        }
        
        return killed;
    }
}

// Exporte la classe du jeu
module.exports = CrocobrasGame;
