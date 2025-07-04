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

    /**
     * crocom: Permet d'écrire des systèmes de combo qui augmentent le score ou déclenchent des effets spéciaux.
     * @param {string} comboType - Type de combo (ex: 'killStreak', 'perfectAim', 'rapidKills')
     * @param {Function} comboLogic - Logique du combo qui gère le déclenchement et les effets
     * @param {Object} [options] - Options du combo (seuil, multiplicateur, durée, etc.)
     */
    crocom(comboType, comboLogic, options = {}) {
        if (typeof comboLogic !== 'function') {
            throw new Error("crocom: comboLogic doit être une fonction.");
        }
        
        if (!this.combos) {
            this.combos = {};
            this.comboCounters = {};
        }
        
        this.combos[comboType] = {
            logic: comboLogic,
            options: { 
                threshold: 3, 
                multiplier: 1.5, 
                resetTime: 5000, 
                maxLevel: 10,
                ...options 
            },
            isActive: false,
            level: 0
        };
        
        this.comboCounters[comboType] = 0;
        
        this.emit('comboRegistered', { type: comboType, options });
        console.log(`[Crocobras] Combo '${comboType}' enregistré.`);
    }

    /**
     * Déclenche la vérification d'un combo
     * @param {string} comboType - Type de combo à vérifier
     * @param {Object} [context] - Contexte pour la logique du combo
     */
    triggerCombo(comboType, context = {}) {
        if (!this.combos || !this.combos[comboType]) return false;
        
        const combo = this.combos[comboType];
        this.comboCounters[comboType]++;
        
        const result = combo.logic.call(this, this.comboCounters[comboType], combo.options, context);
        
        if (result && this.comboCounters[comboType] >= combo.options.threshold) {
            combo.isActive = true;
            combo.level = Math.min(combo.level + 1, combo.options.maxLevel);
            
            this.emit('comboTriggered', { 
                type: comboType, 
                level: combo.level, 
                counter: this.comboCounters[comboType],
                result: result
            });
            
            console.log(`[Crocobras] Combo '${comboType}' niveau ${combo.level} déclenché !`);
            
            // Reset automatique après un délai
            setTimeout(() => {
                this.resetCombo(comboType);
            }, combo.options.resetTime);
        }
        
        return result;
    }

    /**
     * Remet à zéro un combo
     * @param {string} comboType - Type de combo à reset
     */
    resetCombo(comboType) {
        if (this.combos && this.combos[comboType]) {
            this.combos[comboType].isActive = false;
            this.combos[comboType].level = 0;
            this.comboCounters[comboType] = 0;
            
            this.emit('comboReset', { type: comboType });
            console.log(`[Crocobras] Combo '${comboType}' remis à zéro.`);
        }
    }

    /**
     * crocomode: Permet aux développeurs de créer leurs propres modes de défis.
     * @param {string} modeName - Nom du mode de défi
     * @param {Function} modeLogic - Logique personnalisée du mode
     * @param {Object} [settings] - Paramètres spécifiques au mode
     */
    crocomode(modeName, modeLogic, settings = {}) {
        if (typeof modeLogic !== 'function') {
            throw new Error("crocomode: modeLogic doit être une fonction.");
        }
        
        if (!this.gameModes) {
            this.gameModes = {};
        }
        
        this.gameModes[modeName] = {
            logic: modeLogic,
            settings: {
                timeLimit: null,
                objectives: [],
                rewards: {},
                difficulty: 'normal',
                ...settings
            },
            isActive: false,
            progress: {}
        };
        
        this.emit('gameModeRegistered', { name: modeName, settings });
        console.log(`[Crocobras] Mode de jeu '${modeName}' enregistré.`);
    }

    /**
     * Active un mode de jeu spécifique
     * @param {string} modeName - Nom du mode à activer
     * @param {Object} [parameters] - Paramètres d'activation
     */
    activateGameMode(modeName, parameters = {}) {
        if (!this.gameModes || !this.gameModes[modeName]) {
            console.warn(`[Crocobras] Mode '${modeName}' non trouvé.`);
            return false;
        }
        
        const mode = this.gameModes[modeName];
        mode.isActive = true;
        mode.progress = { startTime: Date.now(), ...parameters };
        
        mode.logic.call(this, mode.settings, mode.progress);
        
        this.emit('gameModeActivated', { name: modeName, settings: mode.settings, progress: mode.progress });
        console.log(`[Crocobras] Mode '${modeName}' activé !`);
        return true;
    }

    /**
     * crocorpes: Permet aux développeurs de créer des armures avec des propriétés spéciales.
     * @param {string} armorType - Type d'armure
     * @param {Object} properties - Propriétés de l'armure
     * @param {Function} [armorLogic] - Logique personnalisée de l'armure
     */
    crocorpes(armorType, properties, armorLogic = null) {
        if (!this.armors) {
            this.armors = {};
            this.equippedArmor = null;
        }
        
        this.armors[armorType] = {
            properties: {
                defense: 0,
                resistance: {},
                effects: [],
                durability: 100,
                ...properties
            },
            logic: armorLogic,
            isEquipped: false
        };
        
        this.emit('armorCreated', { type: armorType, properties });
        console.log(`[Crocobras] Armure '${armorType}' créée.`);
    }

    /**
     * Équipe une armure
     * @param {string} armorType - Type d'armure à équiper
     */
    equipArmor(armorType) {
        if (!this.armors || !this.armors[armorType]) return false;
        
        // Déséquiper l'armure actuelle
        if (this.equippedArmor) {
            this.armors[this.equippedArmor].isEquipped = false;
        }
        
        // Équiper la nouvelle armure
        this.armors[armorType].isEquipped = true;
        this.equippedArmor = armorType;
        
        // Appliquer la logique de l'armure si elle existe
        if (this.armors[armorType].logic) {
            this.armors[armorType].logic.call(this, this.armors[armorType].properties);
        }
        
        this.emit('armorEquipped', { type: armorType, properties: this.armors[armorType].properties });
        console.log(`[Crocobras] Armure '${armorType}' équipée.`);
        return true;
    }

    /**
     * crocodial: Permet aux développeurs de créer leurs propres dialogues personnalisés.
     * @param {string} dialogueId - Identifiant unique du dialogue
     * @param {Object} dialogueData - Données du dialogue (textes, choix, conditions)
     * @param {Function} [dialogueLogic] - Logique personnalisée du dialogue
     */
    crocodial(dialogueId, dialogueData, dialogueLogic = null) {
        if (!this.dialogues) {
            this.dialogues = {};
            this.currentDialogue = null;
        }
        
        this.dialogues[dialogueId] = {
            data: {
                texts: [],
                choices: [],
                conditions: {},
                speaker: 'narrator',
                ...dialogueData
            },
            logic: dialogueLogic,
            isActive: false,
            currentStep: 0
        };
        
        this.emit('dialogueCreated', { id: dialogueId, data: dialogueData });
        console.log(`[Crocobras] Dialogue '${dialogueId}' créé.`);
    }

    /**
     * Lance un dialogue
     * @param {string} dialogueId - ID du dialogue à lancer
     * @param {Object} [context] - Contexte pour le dialogue
     */
    startDialogue(dialogueId, context = {}) {
        if (!this.dialogues || !this.dialogues[dialogueId]) return false;
        
        const dialogue = this.dialogues[dialogueId];
        dialogue.isActive = true;
        dialogue.currentStep = 0;
        this.currentDialogue = dialogueId;
        
        if (dialogue.logic) {
            dialogue.logic.call(this, dialogue.data, context);
        }
        
        this.emit('dialogueStarted', { 
            id: dialogueId, 
            data: dialogue.data, 
            context: context 
        });
        
        console.log(`[Crocobras] Dialogue '${dialogueId}' démarré.`);
        return true;
    }

    /**
     * crocomise: Permet aux développeurs d'écrire des logiques de missions ou quêtes.
     * @param {string} missionId - ID unique de la mission
     * @param {Object} missionData - Données de la mission (objectifs, récompenses, etc.)
     * @param {Function} missionLogic - Logique personnalisée de la mission
     */
    crocomise(missionId, missionData, missionLogic) {
        if (typeof missionLogic !== 'function') {
            throw new Error("crocomise: missionLogic doit être une fonction.");
        }
        
        if (!this.missions) {
            this.missions = {};
            this.activeMissions = [];
            this.completedMissions = [];
        }
        
        this.missions[missionId] = {
            data: {
                title: 'Mission sans titre',
                description: '',
                objectives: [],
                rewards: {},
                difficulty: 'normal',
                timeLimit: null,
                ...missionData
            },
            logic: missionLogic,
            status: 'available', // available, active, completed, failed
            progress: {},
            startTime: null
        };
        
        this.emit('missionCreated', { id: missionId, data: missionData });
        console.log(`[Crocobras] Mission '${missionId}' créée.`);
    }

    /**
     * Démarre une mission
     * @param {string} missionId - ID de la mission à démarrer
     */
    startMission(missionId) {
        if (!this.missions || !this.missions[missionId]) return false;
        
        const mission = this.missions[missionId];
        if (mission.status !== 'available') return false;
        
        mission.status = 'active';
        mission.startTime = Date.now();
        mission.progress = {};
        this.activeMissions.push(missionId);
        
        mission.logic.call(this, mission.data, mission.progress);
        
        this.emit('missionStarted', { 
            id: missionId, 
            data: mission.data, 
            progress: mission.progress 
        });
        
        console.log(`[Crocobras] Mission '${missionId}' démarrée.`);
        return true;
    }

    /**
     * Complète une mission
     * @param {string} missionId - ID de la mission à compléter
     * @param {Object} [results] - Résultats de la mission
     */
    completeMission(missionId, results = {}) {
        if (!this.missions || !this.missions[missionId]) return false;
        
        const mission = this.missions[missionId];
        if (mission.status !== 'active') return false;
        
        mission.status = 'completed';
        this.activeMissions = this.activeMissions.filter(id => id !== missionId);
        this.completedMissions.push(missionId);
        
        this.emit('missionCompleted', { 
            id: missionId, 
            data: mission.data, 
            results: results,
            rewards: mission.data.rewards
        });
        
        console.log(`[Crocobras] Mission '${missionId}' terminée !`);
        return true;
    }

    /**
     * crocomons: Permet aux développeurs de créer leurs propres systèmes de monnaie et boutique.
     * @param {string} currencyName - Nom de la monnaie
     * @param {Object} shopData - Données de la boutique (articles, prix, etc.)
     * @param {Function} purchaseLogic - Logique d'achat personnalisée
     */
    crocomons(currencyName, shopData, purchaseLogic) {
        if (typeof purchaseLogic !== 'function') {
            throw new Error("crocomons: purchaseLogic doit être une fonction.");
        }
        
        if (!this.economy) {
            this.economy = {
                currencies: {},
                shop: {},
                inventory: {},
                transactions: []
            };
        }
        
        this.economy.currencies[currencyName] = {
            amount: shopData.startingAmount || 0,
            properties: shopData.currencyProperties || {}
        };
        
        this.economy.shop[currencyName] = {
            items: shopData.items || [],
            logic: purchaseLogic,
            settings: shopData.settings || {}
        };
        
        this.emit('economySystemCreated', { currency: currencyName, shopData });
        console.log(`[Crocobras] Système économique '${currencyName}' créé.`);
    }

    /**
     * Effectue un achat dans la boutique
     * @param {string} currencyName - Nom de la monnaie utilisée
     * @param {string} itemId - ID de l'article à acheter
     * @param {number} [quantity] - Quantité à acheter
     */
    purchase(currencyName, itemId, quantity = 1) {
        if (!this.economy || !this.economy.shop[currencyName]) return false;
        
        const shop = this.economy.shop[currencyName];
        const currency = this.economy.currencies[currencyName];
        
        const result = shop.logic.call(this, {
            itemId: itemId,
            quantity: quantity,
            currency: currency,
            inventory: this.economy.inventory,
            shop: shop
        });
        
        if (result.success) {
            this.economy.transactions.push({
                timestamp: Date.now(),
                type: 'purchase',
                currencyName: currencyName,
                itemId: itemId,
                quantity: quantity,
                cost: result.cost
            });
            
            this.emit('purchaseCompleted', { 
                currencyName, 
                itemId, 
                quantity, 
                result 
            });
            
            console.log(`[Crocobras] Achat réussi: ${quantity}x ${itemId}`);
        }
        
        return result;
    }

    /**
     * crocodym: Permet aux développeurs de coder des logiques de changements environnementaux.
     * @param {string} environmentId - ID de l'environnement
     * @param {Object} environmentData - Données de l'environnement
     * @param {Function} environmentLogic - Logique des changements environnementaux
     */
    crocodym(environmentId, environmentData, environmentLogic) {
        if (typeof environmentLogic !== 'function') {
            throw new Error("crocodym: environmentLogic doit être une fonction.");
        }
        
        if (!this.environments) {
            this.environments = {};
            this.currentEnvironment = null;
        }
        
        this.environments[environmentId] = {
            data: {
                obstacles: [],
                effects: [],
                climate: 'normal',
                visibility: 1.0,
                ...environmentData
            },
            logic: environmentLogic,
            isActive: false,
            lastUpdate: Date.now()
        };
        
        this.emit('environmentCreated', { id: environmentId, data: environmentData });
        console.log(`[Crocobras] Environnement '${environmentId}' créé.`);
    }

    /**
     * Active un environnement
     * @param {string} environmentId - ID de l'environnement à activer
     * @param {Object} [parameters] - Paramètres d'activation
     */
    activateEnvironment(environmentId, parameters = {}) {
        if (!this.environments || !this.environments[environmentId]) return false;
        
        // Désactiver l'environnement actuel
        if (this.currentEnvironment) {
            this.environments[this.currentEnvironment].isActive = false;
        }
        
        const environment = this.environments[environmentId];
        environment.isActive = true;
        environment.lastUpdate = Date.now();
        this.currentEnvironment = environmentId;
        
        environment.logic.call(this, environment.data, parameters);
        
        this.emit('environmentActivated', { 
            id: environmentId, 
            data: environment.data, 
            parameters 
        });
        
        console.log(`[Crocobras] Environnement '${environmentId}' activé.`);
        return true;
    }

    /**
     * crocopay: Permet aux développeurs de scripter des logiques pour des changements d'assets personnalisés.
     * @param {string} assetType - Type d'asset (background, crocodile, arm, etc.)
     * @param {Object} assetData - Données de l'asset
     * @param {Function} customizationLogic - Logique de personnalisation
     */
    crocopay(assetType, assetData, customizationLogic) {
        if (typeof customizationLogic !== 'function') {
            throw new Error("crocopay: customizationLogic doit être une fonction.");
        }
        
        if (!this.assetCustomization) {
            this.assetCustomization = {};
            this.equippedAssets = {};
        }
        
        if (!this.assetCustomization[assetType]) {
            this.assetCustomization[assetType] = {};
        }
        
        const assetId = assetData.id || `${assetType}_${Date.now()}`;
        
        this.assetCustomization[assetType][assetId] = {
            data: {
                name: assetData.name || 'Asset sans nom',
                rarity: assetData.rarity || 'common',
                unlocked: assetData.unlocked || false,
                price: assetData.price || 0,
                ...assetData
            },
            logic: customizationLogic,
            isEquipped: false
        };
        
        this.emit('assetCreated', { type: assetType, id: assetId, data: assetData });
        console.log(`[Crocobras] Asset '${assetId}' de type '${assetType}' créé.`);
    }

    /**
     * Équipe un asset personnalisé
     * @param {string} assetType - Type d'asset
     * @param {string} assetId - ID de l'asset à équiper
     */
    equipAsset(assetType, assetId) {
        if (!this.assetCustomization || !this.assetCustomization[assetType] || !this.assetCustomization[assetType][assetId]) {
            return false;
        }
        
        const asset = this.assetCustomization[assetType][assetId];
        if (!asset.data.unlocked) return false;
        
        // Déséquiper l'asset actuel du même type
        if (this.equippedAssets[assetType]) {
            const currentAsset = this.assetCustomization[assetType][this.equippedAssets[assetType]];
            if (currentAsset) currentAsset.isEquipped = false;
        }
        
        // Équiper le nouvel asset
        asset.isEquipped = true;
        this.equippedAssets[assetType] = assetId;
        
        asset.logic.call(this, asset.data);
        
        this.emit('assetEquipped', { type: assetType, id: assetId, data: asset.data });
        console.log(`[Crocobras] Asset '${assetId}' équipé pour '${assetType}'.`);
        return true;
    }

    /**
     * crocia: Permet aux développeurs de coder des comportements IA personnalisés pour les crocodiles.
     * @param {number} crocoId - ID du crocodile
     * @param {string} aiType - Type d'IA (aggressive, defensive, smart, random, etc.)
     * @param {Function} aiLogic - Logique de l'IA personnalisée
     * @param {Object} [aiSettings] - Paramètres de l'IA
     */
    crocia(crocoId, aiType, aiLogic, aiSettings = {}) {
        if (typeof aiLogic !== 'function') {
            throw new Error("crocia: aiLogic doit être une fonction.");
        }
        
        if (!this.crocodileAI) {
            this.crocodileAI = {};
        }
        
        this.crocodileAI[crocoId] = {
            type: aiType,
            logic: aiLogic,
            settings: {
                aggressiveness: 0.5,
                intelligence: 0.5,
                adaptability: 0.3,
                memory: [],
                ...aiSettings
            },
            state: 'idle',
            lastDecision: Date.now(),
            decisions: []
        };
        
        this.emit('crocodileAISet', { crocoId, aiType, settings: aiSettings });
        console.log(`[Crocobras] IA '${aiType}' configurée pour le crocodile ${crocoId}.`);
    }

    /**
     * Met à jour l'IA d'un crocodile
     * @param {number} crocoId - ID du crocodile
     * @param {Object} [context] - Contexte pour la prise de décision
     */
    updateCrocodileAI(crocoId, context = {}) {
        if (!this.crocodileAI || !this.crocodileAI[crocoId]) return;
        
        const ai = this.crocodileAI[crocoId];
        const gameState = this.getGameState();
        
        const decision = ai.logic.call(this, {
            crocoId: crocoId,
            gameState: gameState,
            aiState: ai.state,
            settings: ai.settings,
            memory: ai.settings.memory,
            context: context
        });
        
        if (decision) {
            ai.state = decision.newState || ai.state;
            ai.lastDecision = Date.now();
            ai.decisions.push({
                timestamp: Date.now(),
                decision: decision,
                context: context
            });
            
            // Garder seulement les 10 dernières décisions en mémoire
            if (ai.decisions.length > 10) {
                ai.decisions.shift();
            }
            
            this.emit('crocodileAIDecision', { 
                crocoId, 
                decision, 
                aiType: ai.type, 
                context 
            });
        }
    }

    /**
     * crocohab: Permet aux développeurs de scripter des logiques d'accessoires à collecter ou de succès.
     * @param {string} collectibleType - Type de collectible (achievement, item, trophy, etc.)
     * @param {Object} collectibleData - Données du collectible
     * @param {Function} collectibleLogic - Logique de collecte personnalisée
     */
    crocohab(collectibleType, collectibleData, collectibleLogic) {
        if (typeof collectibleLogic !== 'function') {
            throw new Error("crocohab: collectibleLogic doit être une fonction.");
        }
        
        if (!this.collectibles) {
            this.collectibles = {};
            this.unlockedCollectibles = [];
        }
        
        if (!this.collectibles[collectibleType]) {
            this.collectibles[collectibleType] = {};
        }
        
        const collectibleId = collectibleData.id || `${collectibleType}_${Date.now()}`;
        
        this.collectibles[collectibleType][collectibleId] = {
            data: {
                name: collectibleData.name || 'Collectible sans nom',
                description: collectibleData.description || '',
                rarity: collectibleData.rarity || 'common',
                rewards: collectibleData.rewards || {},
                requirements: collectibleData.requirements || {},
                ...collectibleData
            },
            logic: collectibleLogic,
            isUnlocked: false,
            unlockedAt: null,
            progress: {}
        };
        
        this.emit('collectibleCreated', { type: collectibleType, id: collectibleId, data: collectibleData });
        console.log(`[Crocobras] Collectible '${collectibleId}' de type '${collectibleType}' créé.`);
    }

    /**
     * Vérifie et débloque des collectibles
     * @param {string} collectibleType - Type de collectible à vérifier
     * @param {Object} [context] - Contexte pour la vérification
     */
    checkCollectibles(collectibleType, context = {}) {
        if (!this.collectibles || !this.collectibles[collectibleType]) return;
        
        Object.entries(this.collectibles[collectibleType]).forEach(([id, collectible]) => {
            if (!collectible.isUnlocked) {
                const result = collectible.logic.call(this, {
                    collectibleData: collectible.data,
                    gameState: this.getGameState(),
                    context: context,
                    progress: collectible.progress
                });
                
                if (result && result.unlocked) {
                    collectible.isUnlocked = true;
                    collectible.unlockedAt = Date.now();
                    collectible.progress = result.progress || {};
                    this.unlockedCollectibles.push(`${collectibleType}:${id}`);
                    
                    this.emit('collectibleUnlocked', { 
                        type: collectibleType, 
                        id: id, 
                        data: collectible.data,
                        rewards: collectible.data.rewards
                    });
                    
                    console.log(`[Crocobras] Collectible '${id}' débloqué !`);
                }
            }
        });
    }

    /**
     * crocotive: Fonction créative pour des messages aléatoires envoyés par différents personnages.
     * @param {string} messageType - Type de message (crocodile, arm, narrator, etc.)
     * @param {Object} messageData - Données des messages
     * @param {Function} messageLogic - Logique de sélection des messages
     */
    crocotive(messageType, messageData, messageLogic) {
        if (typeof messageLogic !== 'function') {
            throw new Error("crocotive: messageLogic doit être une fonction.");
        }
        
        if (!this.creativeMessages) {
            this.creativeMessages = {};
        }
        
        this.creativeMessages[messageType] = {
            data: {
                messages: messageData.messages || [],
                frequency: messageData.frequency || 'random',
                conditions: messageData.conditions || {},
                speakers: messageData.speakers || [messageType],
                ...messageData
            },
            logic: messageLogic,
            lastMessage: null,
            messageHistory: []
        };
        
        this.emit('creativeMessagesRegistered', { type: messageType, data: messageData });
        console.log(`[Crocobras] Messages créatifs '${messageType}' enregistrés.`);
    }

    /**
     * Déclenche un message créatif
     * @param {string} messageType - Type de message à déclencher
     * @param {Object} [context] - Contexte pour la sélection du message
     */
    triggerCreativeMessage(messageType, context = {}) {
        if (!this.creativeMessages || !this.creativeMessages[messageType]) return null;
        
        const messageSystem = this.creativeMessages[messageType];
        const gameState = this.getGameState();
        
        const result = messageSystem.logic.call(this, {
            messageData: messageSystem.data,
            gameState: gameState,
            context: context,
            history: messageSystem.messageHistory
        });
        
        if (result && result.message) {
            messageSystem.lastMessage = {
                timestamp: Date.now(),
                message: result.message,
                speaker: result.speaker || messageType,
                context: context
            };
            
            messageSystem.messageHistory.push(messageSystem.lastMessage);
            
            // Garder seulement les 20 derniers messages
            if (messageSystem.messageHistory.length > 20) {
                messageSystem.messageHistory.shift();
            }
            
            this.emit('creativeMessageTriggered', { 
                type: messageType, 
                message: result.message,
                speaker: result.speaker,
                context: context
            });
            
            console.log(`[Crocobras] Message créatif (${result.speaker}): ${result.message}`);
            return result;
        }
        
        return null;
    }

    /**
     * croconage: Permet aux développeurs de créer leurs propres personnages personnalisés.
     * @param {string} characterId - ID unique du personnage
     * @param {Object} characterData - Données du personnage
     * @param {Function} characterLogic - Logique de comportement du personnage
     */
    croconage(characterId, characterData, characterLogic) {
        if (typeof characterLogic !== 'function') {
            throw new Error("croconage: characterLogic doit être une fonction.");
        }
        
        if (!this.customCharacters) {
            this.customCharacters = {};
            this.activeCharacters = [];
        }
        
        this.customCharacters[characterId] = {
            data: {
                name: characterData.name || 'Personnage sans nom',
                type: characterData.type || 'neutral',
                health: characterData.health || 100,
                abilities: characterData.abilities || [],
                appearance: characterData.appearance || {},
                personality: characterData.personality || {},
                ...characterData
            },
            logic: characterLogic,
            isActive: false,
            state: 'idle',
            interactions: [],
            lastUpdate: Date.now()
        };
        
        this.emit('customCharacterCreated', { id: characterId, data: characterData });
        console.log(`[Crocobras] Personnage personnalisé '${characterId}' créé.`);
    }

    /**
     * Active un personnage personnalisé
     * @param {string} characterId - ID du personnage à activer
     * @param {Object} [spawnData] - Données d'apparition
     */
    spawnCharacter(characterId, spawnData = {}) {
        if (!this.customCharacters || !this.customCharacters[characterId]) return false;
        
        const character = this.customCharacters[characterId];
        if (character.isActive) return false;
        
        character.isActive = true;
        character.state = spawnData.initialState || 'idle';
        character.lastUpdate = Date.now();
        
        if (!this.activeCharacters.includes(characterId)) {
            this.activeCharacters.push(characterId);
        }
        
        character.logic.call(this, {
            characterData: character.data,
            gameState: this.getGameState(),
            spawnData: spawnData,
            action: 'spawn'
        });
        
        this.emit('characterSpawned', { 
            id: characterId, 
            data: character.data, 
            spawnData: spawnData 
        });
        
        console.log(`[Crocobras] Personnage '${characterId}' apparu dans le jeu.`);
        return true;
    }

    /**
     * Met à jour un personnage personnalisé
     * @param {string} characterId - ID du personnage à mettre à jour
     * @param {Object} [updateData] - Données de mise à jour
     */
    updateCharacter(characterId, updateData = {}) {
        if (!this.customCharacters || !this.customCharacters[characterId] || !this.customCharacters[characterId].isActive) {
            return;
        }
        
        const character = this.customCharacters[characterId];
        character.lastUpdate = Date.now();
        
        const result = character.logic.call(this, {
            characterData: character.data,
            gameState: this.getGameState(),
            updateData: updateData,
            currentState: character.state,
            action: 'update'
        });
        
        if (result) {
            character.state = result.newState || character.state;
            
            if (result.interaction) {
                character.interactions.push({
                    timestamp: Date.now(),
                    interaction: result.interaction,
                    context: updateData
                });
            }
            
            this.emit('characterUpdated', { 
                id: characterId, 
                state: character.state, 
                result: result 
            });
        }
    }

    // ================= NOUVELLES FONCTIONNALITÉS v1.3.0 =================

    /**
     * crocojom: Permet aux développeurs de créer des quêtes et missions dynamiques qui s'adaptent aux choix des joueurs.
     * @param {string} questId - ID unique de la quête
     * @param {Object} questData - Données de la quête (objectifs, branches, récompenses)
     * @param {Function} questLogic - Logique personnalisée de la quête dynamique
     */
    crocojom(questId, questData, questLogic) {
        if (typeof questLogic !== 'function') {
            throw new Error("crocojom: questLogic doit être une fonction.");
        }
        
        if (!this.dynamicQuests) {
            this.dynamicQuests = {};
            this.activeQuests = [];
        }
        
        this.dynamicQuests[questId] = {
            data: {
                title: questData.title || 'Quête dynamique',
                description: questData.description || '',
                branches: questData.branches || {},
                currentBranch: questData.startBranch || 'start',
                playerChoices: [],
                rewards: questData.rewards || {},
                conditions: questData.conditions || {},
                ...questData
            },
            logic: questLogic,
            isActive: false,
            progress: {}
        };
        
        this.emit('dynamicQuestCreated', { questId, data: questData });
        console.log(`[Crocobras] Quête dynamique '${questId}' créée.`);
    }

    /**
     * Démarre une quête dynamique
     * @param {string} questId - ID de la quête à démarrer
     * @param {Object} [initialChoices] - Choix initiaux du joueur
     */
    startDynamicQuest(questId, initialChoices = {}) {
        if (!this.dynamicQuests || !this.dynamicQuests[questId]) return false;
        
        const quest = this.dynamicQuests[questId];
        quest.isActive = true;
        quest.data.playerChoices = [initialChoices];
        quest.progress = { startTime: Date.now() };
        
        this.activeQuests.push(questId);
        
        quest.logic.call(this, quest.data, quest.progress, 'start');
        
        this.emit('dynamicQuestStarted', { questId, choices: initialChoices });
        console.log(`[Crocobras] Quête dynamique '${questId}' démarrée.`);
        return true;
    }

    /**
     * Effectue un choix dans une quête dynamique
     * @param {string} questId - ID de la quête
     * @param {Object} choice - Choix du joueur
     */
    makeDynamicQuestChoice(questId, choice) {
        if (!this.dynamicQuests || !this.dynamicQuests[questId] || !this.dynamicQuests[questId].isActive) {
            return false;
        }
        
        const quest = this.dynamicQuests[questId];
        quest.data.playerChoices.push(choice);
        
        const result = quest.logic.call(this, quest.data, quest.progress, 'choice', choice);
        
        if (result && result.newBranch) {
            quest.data.currentBranch = result.newBranch;
        }
        
        this.emit('dynamicQuestChoice', { questId, choice, result });
        console.log(`[Crocobras] Choix effectué dans la quête '${questId}': ${JSON.stringify(choice)}`);
        return result;
    }

    /**
     * crocera: Permet aux développeurs de créer leur propre système de climat qui interagit avec le comportement des crocodiles ou du bras.
     * @param {string} weatherId - ID unique du climat
     * @param {Object} weatherData - Données météorologiques
     * @param {Function} weatherLogic - Logique personnalisée du climat
     */
    crocera(weatherId, weatherData, weatherLogic) {
        if (typeof weatherLogic !== 'function') {
            throw new Error("crocera: weatherLogic doit être une fonction.");
        }
        
        if (!this.weatherSystems) {
            this.weatherSystems = {};
            this.currentWeather = null;
        }
        
        this.weatherSystems[weatherId] = {
            data: {
                name: weatherData.name || 'Climat personnalisé',
                effects: weatherData.effects || {},
                intensity: weatherData.intensity || 1.0,
                duration: weatherData.duration || 30000,
                crocodileEffects: weatherData.crocodileEffects || {},
                armEffects: weatherData.armEffects || {},
                visualEffects: weatherData.visualEffects || {},
                ...weatherData
            },
            logic: weatherLogic,
            isActive: false,
            startTime: null
        };
        
        this.emit('weatherSystemCreated', { weatherId, data: weatherData });
        console.log(`[Crocobras] Système climatique '${weatherId}' créé.`);
    }

    /**
     * Active un système climatique
     * @param {string} weatherId - ID du climat à activer
     */
    activateWeather(weatherId) {
        if (!this.weatherSystems || !this.weatherSystems[weatherId]) return false;
        
        // Désactiver le climat actuel
        if (this.currentWeather) {
            this.weatherSystems[this.currentWeather].isActive = false;
        }
        
        const weather = this.weatherSystems[weatherId];
        weather.isActive = true;
        weather.startTime = Date.now();
        this.currentWeather = weatherId;
        
        weather.logic.call(this, weather.data, this.getGameState());
        
        this.emit('weatherActivated', { weatherId, data: weather.data });
        console.log(`[Crocobras] Climat '${weatherId}' activé.`);
        
        // Désactiver automatiquement après la durée
        if (weather.data.duration > 0) {
            setTimeout(() => {
                this.deactivateWeather(weatherId);
            }, weather.data.duration);
        }
        
        return true;
    }

    /**
     * Désactive un système climatique
     * @param {string} weatherId - ID du climat à désactiver
     */
    deactivateWeather(weatherId) {
        if (!this.weatherSystems || !this.weatherSystems[weatherId]) return false;
        
        this.weatherSystems[weatherId].isActive = false;
        if (this.currentWeather === weatherId) {
            this.currentWeather = null;
        }
        
        this.emit('weatherDeactivated', { weatherId });
        console.log(`[Crocobras] Climat '${weatherId}' désactivé.`);
        return true;
    }

    /**
     * crocogiw: Permet aux développeurs de créer des crocodiles ou des événements spéciaux qui n'apparaissent qu'à certains moments clés.
     * @param {string} specialId - ID de l'élément spécial
     * @param {Object} specialData - Données de l'élément spécial
     * @param {Function} specialLogic - Logique de déclenchement personnalisée
     */
    crocogiw(specialId, specialData, specialLogic) {
        if (typeof specialLogic !== 'function') {
            throw new Error("crocogiw: specialLogic doit être une fonction.");
        }
        
        if (!this.specialElements) {
            this.specialElements = {};
        }
        
        this.specialElements[specialId] = {
            data: {
                type: specialData.type || 'crocodile',
                triggerConditions: specialData.triggerConditions || {},
                behavior: specialData.behavior || {},
                rewards: specialData.rewards || {},
                rarity: specialData.rarity || 'rare',
                cooldown: specialData.cooldown || 0,
                ...specialData
            },
            logic: specialLogic,
            isActive: false,
            lastTriggered: null,
            triggerCount: 0
        };
        
        this.emit('specialElementCreated', { specialId, data: specialData });
        console.log(`[Crocobras] Élément spécial '${specialId}' créé.`);
    }

    /**
     * Vérifie et déclenche les éléments spéciaux selon les conditions
     * @param {Object} [gameContext] - Contexte du jeu pour les vérifications
     */
    checkSpecialElements(gameContext = {}) {
        if (!this.specialElements) return;
        
        Object.entries(this.specialElements).forEach(([specialId, element]) => {
            if (element.isActive) return;
            
            const now = Date.now();
            const cooldownPassed = !element.lastTriggered || 
                (now - element.lastTriggered) >= element.data.cooldown;
            
            if (cooldownPassed) {
                const shouldTrigger = element.logic.call(this, element.data, {
                    ...this.getGameState(),
                    ...gameContext
                });
                
                if (shouldTrigger) {
                    this.triggerSpecialElement(specialId);
                }
            }
        });
    }

    /**
     * Déclenche un élément spécial
     * @param {string} specialId - ID de l'élément spécial à déclencher
     */
    triggerSpecialElement(specialId) {
        if (!this.specialElements || !this.specialElements[specialId]) return false;
        
        const element = this.specialElements[specialId];
        element.isActive = true;
        element.lastTriggered = Date.now();
        element.triggerCount++;
        
        this.emit('specialElementTriggered', { 
            specialId, 
            data: element.data, 
            triggerCount: element.triggerCount 
        });
        
        console.log(`[Crocobras] Élément spécial '${specialId}' déclenché !`);
        return true;
    }

    /**
     * crocorin: Permet de définir des comportements IA avancés avec prise de décisions personnalisées pour les crocodiles.
     * @param {number} crocoId - ID du crocodile
     * @param {Object} aiConfig - Configuration de l'IA avancée
     * @param {Function} decisionLogic - Logique de prise de décision personnalisée
     */
    crocorin(crocoId, aiConfig, decisionLogic) {
        if (typeof decisionLogic !== 'function') {
            throw new Error("crocorin: decisionLogic doit être une fonction.");
        }
        
        if (!this.advancedCrocodileAI) {
            this.advancedCrocodileAI = {};
        }
        
        this.advancedCrocodileAI[crocoId] = {
            config: {
                learningRate: aiConfig.learningRate || 0.1,
                memorySize: aiConfig.memorySize || 50,
                decisionFrequency: aiConfig.decisionFrequency || 1000,
                personalityTraits: aiConfig.personalityTraits || {},
                adaptiveRules: aiConfig.adaptiveRules || [],
                ...aiConfig
            },
            decisionLogic: decisionLogic,
            memory: [],
            currentDecision: null,
            decisionHistory: [],
            learningData: {}
        };
        
        this.emit('advancedAICreated', { crocoId, config: aiConfig });
        console.log(`[Crocobras] IA avancée configurée pour le crocodile ${crocoId}.`);
    }

    /**
     * Exécute la prise de décision IA avancée pour un crocodile
     * @param {number} crocoId - ID du crocodile
     * @param {Object} [situation] - Situation actuelle pour la prise de décision
     */
    executeAdvancedAIDecision(crocoId, situation = {}) {
        if (!this.advancedCrocodileAI || !this.advancedCrocodileAI[crocoId]) return null;
        
        const ai = this.advancedCrocodileAI[crocoId];
        const gameState = this.getGameState();
        
        const decision = ai.decisionLogic.call(this, {
            crocoId: crocoId,
            config: ai.config,
            memory: ai.memory,
            gameState: gameState,
            situation: situation,
            learningData: ai.learningData
        });
        
        if (decision) {
            ai.currentDecision = decision;
            ai.decisionHistory.push({
                timestamp: Date.now(),
                decision: decision,
                situation: situation,
                gameState: { ...gameState }
            });
            
            // Ajouter à la mémoire
            ai.memory.push({
                timestamp: Date.now(),
                type: 'decision',
                data: decision,
                context: situation
            });
            
            // Limiter la taille de la mémoire
            if (ai.memory.length > ai.config.memorySize) {
                ai.memory.shift();
            }
            
            this.emit('advancedAIDecision', { crocoId, decision, situation });
            console.log(`[Crocobras] Décision IA avancée pour crocodile ${crocoId}: ${JSON.stringify(decision)}`);
        }
        
        return decision;
    }

    /**
     * crocomp: Permet d'analyser les données du jeu selon la personnalisation JavaScript du développeur.
     * @param {string} analysisId - ID de l'analyse
     * @param {Object} analysisConfig - Configuration de l'analyse
     * @param {Function} analysisLogic - Logique d'analyse personnalisée
     */
    crocomp(analysisId, analysisConfig, analysisLogic) {
        if (typeof analysisLogic !== 'function') {
            throw new Error("crocomp: analysisLogic doit être une fonction.");
        }
        
        if (!this.gameAnalytics) {
            this.gameAnalytics = {};
            this.analyticsData = {};
        }
        
        this.gameAnalytics[analysisId] = {
            config: {
                dataPoints: analysisConfig.dataPoints || [],
                updateInterval: analysisConfig.updateInterval || 5000,
                reportFormat: analysisConfig.reportFormat || 'simple',
                triggers: analysisConfig.triggers || [],
                ...analysisConfig
            },
            logic: analysisLogic,
            lastUpdate: Date.now(),
            reports: []
        };
        
        this.analyticsData[analysisId] = {};
        
        this.emit('gameAnalyticsCreated', { analysisId, config: analysisConfig });
        console.log(`[Crocobras] Système d'analyse '${analysisId}' créé.`);
    }

    /**
     * Exécute une analyse des données de jeu
     * @param {string} analysisId - ID de l'analyse à exécuter
     * @param {Object} [customData] - Données personnalisées pour l'analyse
     */
    runGameAnalysis(analysisId, customData = {}) {
        if (!this.gameAnalytics || !this.gameAnalytics[analysisId]) return null;
        
        const analytics = this.gameAnalytics[analysisId];
        const gameState = this.getGameState();
        
        const report = analytics.logic.call(this, {
            config: analytics.config,
            gameState: gameState,
            analyticsData: this.analyticsData[analysisId],
            customData: customData,
            previousReports: analytics.reports
        });
        
        if (report) {
            analytics.reports.push({
                timestamp: Date.now(),
                report: report
            });
            analytics.lastUpdate = Date.now();
            
            this.emit('gameAnalysisCompleted', { analysisId, report });
            console.log(`[Crocobras] Analyse '${analysisId}' terminée.`);
        }
        
        return report;
    }

    /**
     * crocotina: Permet aux développeurs d'écrire leurs propres fonctions personnalisées en JavaScript pour leur code et leur jeu.
     * @param {string} functionName - Nom de la fonction personnalisée
     * @param {Function} customFunction - Fonction personnalisée du développeur
     * @param {Object} [options] - Options de la fonction
     */
    crocotina(functionName, customFunction, options = {}) {
        if (typeof customFunction !== 'function') {
            throw new Error("crocotina: customFunction doit être une fonction.");
        }
        
        if (!this.customFunctions) {
            this.customFunctions = {};
        }
        
        this.customFunctions[functionName] = {
            function: customFunction,
            options: {
                async: options.async || false,
                parameters: options.parameters || [],
                description: options.description || '',
                category: options.category || 'general',
                ...options
            },
            callCount: 0,
            lastCalled: null
        };
        
        this.emit('customFunctionRegistered', { functionName, options });
        console.log(`[Crocobras] Fonction personnalisée '${functionName}' enregistrée.`);
    }

    /**
     * Exécute une fonction personnalisée
     * @param {string} functionName - Nom de la fonction à exécuter
     * @param {...any} args - Arguments à passer à la fonction
     */
    executeCustomFunction(functionName, ...args) {
        if (!this.customFunctions || !this.customFunctions[functionName]) {
            console.warn(`[Crocobras] Fonction personnalisée '${functionName}' non trouvée.`);
            return null;
        }
        
        const customFunc = this.customFunctions[functionName];
        customFunc.callCount++;
        customFunc.lastCalled = Date.now();
        
        try {
            const result = customFunc.function.call(this, ...args);
            
            this.emit('customFunctionExecuted', { 
                functionName, 
                args, 
                result, 
                callCount: customFunc.callCount 
            });
            
            console.log(`[Crocobras] Fonction personnalisée '${functionName}' exécutée.`);
            return result;
        } catch (error) {
            this.emit('customFunctionError', { functionName, error: error.message });
            console.error(`[Crocobras] Erreur dans la fonction '${functionName}': ${error.message}`);
            return null;
        }
    }

    /**
     * crocofaf: Permet aux développeurs de créer des mini-jeux personnalisés de quiz pour tuer plus de crocodiles ou obtenir des points/monnaie.
     * @param {string} quizId - ID du quiz
     * @param {Object} quizData - Données du quiz
     * @param {Function} quizLogic - Logique personnalisée du quiz
     */
    crocofaf(quizId, quizData, quizLogic) {
        if (typeof quizLogic !== 'function') {
            throw new Error("crocofaf: quizLogic doit être une fonction.");
        }
        
        if (!this.miniGames) {
            this.miniGames = {};
        }
        
        this.miniGames[quizId] = {
            data: {
                title: quizData.title || 'Quiz Crocobras',
                questions: quizData.questions || [],
                rewards: quizData.rewards || {},
                timeLimit: quizData.timeLimit || 30000,
                difficulty: quizData.difficulty || 'normal',
                categories: quizData.categories || ['general'],
                ...quizData
            },
            logic: quizLogic,
            isActive: false,
            currentQuestion: 0,
            score: 0,
            startTime: null
        };
        
        this.emit('miniGameCreated', { quizId, data: quizData });
        console.log(`[Crocobras] Mini-jeu quiz '${quizId}' créé.`);
    }

    /**
     * Démarre un mini-jeu quiz
     * @param {string} quizId - ID du quiz à démarrer
     */
    startMiniGame(quizId) {
        if (!this.miniGames || !this.miniGames[quizId]) return false;
        
        const quiz = this.miniGames[quizId];
        quiz.isActive = true;
        quiz.currentQuestion = 0;
        quiz.score = 0;
        quiz.startTime = Date.now();
        
        quiz.logic.call(this, quiz.data, 'start');
        
        this.emit('miniGameStarted', { quizId, data: quiz.data });
        console.log(`[Crocobras] Mini-jeu '${quizId}' démarré.`);
        return true;
    }

    /**
     * Répond à une question du quiz
     * @param {string} quizId - ID du quiz
     * @param {any} answer - Réponse du joueur
     */
    answerQuizQuestion(quizId, answer) {
        if (!this.miniGames || !this.miniGames[quizId] || !this.miniGames[quizId].isActive) {
            return false;
        }
        
        const quiz = this.miniGames[quizId];
        const result = quiz.logic.call(this, quiz.data, 'answer', {
            answer: answer,
            currentQuestion: quiz.currentQuestion,
            score: quiz.score
        });
        
        if (result && result.correct) {
            quiz.score += result.points || 1;
        }
        
        quiz.currentQuestion++;
        
        this.emit('quizAnswered', { 
            quizId, 
            answer, 
            result, 
            score: quiz.score,
            question: quiz.currentQuestion 
        });
        
        return result;
    }

    /**
     * crocojup: Permet aux développeurs de créer et d'afficher des messages temporaires personnalisés.
     * @param {string} messageId - ID du message
     * @param {Object} messageData - Données du message
     * @param {Function} messageLogic - Logique personnalisée du message
     */
    crocojup(messageId, messageData, messageLogic) {
        if (typeof messageLogic !== 'function') {
            throw new Error("crocojup: messageLogic doit être une fonction.");
        }
        
        if (!this.temporaryMessages) {
            this.temporaryMessages = {};
            this.activeMessages = [];
        }
        
        this.temporaryMessages[messageId] = {
            data: {
                text: messageData.text || '',
                duration: messageData.duration || 3000,
                style: messageData.style || {},
                position: messageData.position || 'center',
                animation: messageData.animation || 'fade',
                triggers: messageData.triggers || [],
                ...messageData
            },
            logic: messageLogic,
            isActive: false,
            displayCount: 0
        };
        
        this.emit('temporaryMessageCreated', { messageId, data: messageData });
        console.log(`[Crocobras] Message temporaire '${messageId}' créé.`);
    }

    /**
     * Affiche un message temporaire
     * @param {string} messageId - ID du message à afficher
     * @param {Object} [context] - Contexte pour le message
     */
    showTemporaryMessage(messageId, context = {}) {
        if (!this.temporaryMessages || !this.temporaryMessages[messageId]) return false;
        
        const message = this.temporaryMessages[messageId];
        message.isActive = true;
        message.displayCount++;
        
        this.activeMessages.push(messageId);
        
        const result = message.logic.call(this, message.data, context);
        
        this.emit('temporaryMessageShown', { 
            messageId, 
            data: message.data, 
            context, 
            result,
            displayCount: message.displayCount 
        });
        
        console.log(`[Crocobras] Message temporaire '${messageId}' affiché.`);
        
        // Masquer automatiquement après la durée
        setTimeout(() => {
            this.hideTemporaryMessage(messageId);
        }, message.data.duration);
        
        return true;
    }

    /**
     * Masque un message temporaire
     * @param {string} messageId - ID du message à masquer
     */
    hideTemporaryMessage(messageId) {
        if (!this.temporaryMessages || !this.temporaryMessages[messageId]) return false;
        
        this.temporaryMessages[messageId].isActive = false;
        this.activeMessages = this.activeMessages.filter(id => id !== messageId);
        
        this.emit('temporaryMessageHidden', { messageId });
        console.log(`[Crocobras] Message temporaire '${messageId}' masqué.`);
        return true;
    }

    /**
     * crocodae: Permet aux développeurs de créer des power-ups temporaires personnalisés selon leur logique JavaScript.
     * @param {string} powerUpId - ID du power-up
     * @param {Object} powerUpData - Données du power-up
     * @param {Function} powerUpLogic - Logique personnalisée du power-up
     */
    crocodae(powerUpId, powerUpData, powerUpLogic) {
        if (typeof powerUpLogic !== 'function') {
            throw new Error("crocodae: powerUpLogic doit être une fonction.");
        }
        
        if (!this.temporaryPowerUps) {
            this.temporaryPowerUps = {};
            this.activePowerUps = [];
        }
        
        this.temporaryPowerUps[powerUpId] = {
            data: {
                name: powerUpData.name || 'Power-up temporaire',
                duration: powerUpData.duration || 10000,
                effects: powerUpData.effects || {},
                stackable: powerUpData.stackable || false,
                cooldown: powerUpData.cooldown || 5000,
                rarity: powerUpData.rarity || 'common',
                ...powerUpData
            },
            logic: powerUpLogic,
            isActive: false,
            activationTime: null,
            usageCount: 0
        };
        
        this.emit('temporaryPowerUpCreated', { powerUpId, data: powerUpData });
        console.log(`[Crocobras] Power-up temporaire '${powerUpId}' créé.`);
    }

    /**
     * Active un power-up temporaire
     * @param {string} powerUpId - ID du power-up à activer
     * @param {Object} [context] - Contexte d'activation
     */
    activateTemporaryPowerUp(powerUpId, context = {}) {
        if (!this.temporaryPowerUps || !this.temporaryPowerUps[powerUpId]) return false;
        
        const powerUp = this.temporaryPowerUps[powerUpId];
        
        // Vérifier si déjà actif et non stackable
        if (powerUp.isActive && !powerUp.data.stackable) return false;
        
        powerUp.isActive = true;
        powerUp.activationTime = Date.now();
        powerUp.usageCount++;
        
        if (!powerUp.data.stackable || !this.activePowerUps.includes(powerUpId)) {
            this.activePowerUps.push(powerUpId);
        }
        
        powerUp.logic.call(this, powerUp.data, context, 'activate');
        
        this.emit('temporaryPowerUpActivated', { 
            powerUpId, 
            data: powerUp.data, 
            context,
            usageCount: powerUp.usageCount 
        });
        
        console.log(`[Crocobras] Power-up temporaire '${powerUpId}' activé.`);
        
        // Désactiver automatiquement après la durée
        setTimeout(() => {
            this.deactivateTemporaryPowerUp(powerUpId);
        }, powerUp.data.duration);
        
        return true;
    }

    /**
     * Désactive un power-up temporaire
     * @param {string} powerUpId - ID du power-up à désactiver
     */
    deactivateTemporaryPowerUp(powerUpId) {
        if (!this.temporaryPowerUps || !this.temporaryPowerUps[powerUpId]) return false;
        
        const powerUp = this.temporaryPowerUps[powerUpId];
        powerUp.isActive = false;
        
        this.activePowerUps = this.activePowerUps.filter(id => id !== powerUpId);
        
        powerUp.logic.call(this, powerUp.data, {}, 'deactivate');
        
        this.emit('temporaryPowerUpDeactivated', { powerUpId });
        console.log(`[Crocobras] Power-up temporaire '${powerUpId}' désactivé.`);
        return true;
    }

    /**
     * crocolog: Permet aux développeurs de créer leurs propres logs personnalisés pour le jeu.
     * @param {string} logId - ID du système de log
     * @param {Object} logConfig - Configuration des logs
     * @param {Function} logLogic - Logique personnalisée des logs
     */
    crocolog(logId, logConfig, logLogic) {
        if (typeof logLogic !== 'function') {
            throw new Error("crocolog: logLogic doit être une fonction.");
        }
        
        if (!this.customLogs) {
            this.customLogs = {};
        }
        
        this.customLogs[logId] = {
            config: {
                prefix: logConfig.prefix || '[LOG]',
                colors: logConfig.colors || {},
                format: logConfig.format || 'simple',
                output: logConfig.output || 'console',
                shapes: logConfig.shapes || {},
                filters: logConfig.filters || [],
                ...logConfig
            },
            logic: logLogic,
            entries: [],
            lastLog: null
        };
        
        this.emit('customLogCreated', { logId, config: logConfig });
        console.log(`[Crocobras] Système de log personnalisé '${logId}' créé.`);
    }

    /**
     * Écrit un log personnalisé
     * @param {string} logId - ID du système de log
     * @param {string} message - Message à logger
     * @param {Object} [data] - Données supplémentaires
     */
    writeCustomLog(logId, message, data = {}) {
        if (!this.customLogs || !this.customLogs[logId]) return false;
        
        const logger = this.customLogs[logId];
        const logEntry = {
            timestamp: Date.now(),
            message: message,
            data: data,
            level: data.level || 'info'
        };
        
        logger.entries.push(logEntry);
        logger.lastLog = logEntry;
        
        const formattedLog = logger.logic.call(this, logger.config, logEntry);
        
        this.emit('customLogWritten', { logId, entry: logEntry, formatted: formattedLog });
        
        // Affichage selon la configuration
        if (logger.config.output === 'console') {
            console.log(formattedLog);
        }
        
        return true;
    }

    /**
     * crocojust: Permet aux développeurs de créer des logiques de clonage ou d'invocation pour les crocodiles.
     * @param {string} cloneId - ID du système de clonage
     * @param {Object} cloneData - Données de clonage
     * @param {Function} cloneLogic - Logique personnalisée de clonage
     */
    crocojust(cloneId, cloneData, cloneLogic) {
        if (typeof cloneLogic !== 'function') {
            throw new Error("crocojust: cloneLogic doit être une fonction.");
        }
        
        if (!this.crocodileCloning) {
            this.crocodileCloning = {};
        }
        
        this.crocodileCloning[cloneId] = {
            data: {
                maxClones: cloneData.maxClones || 3,
                cloneCooldown: cloneData.cloneCooldown || 5000,
                cloneConditions: cloneData.cloneConditions || {},
                cloneProperties: cloneData.cloneProperties || {},
                invocationRules: cloneData.invocationRules || {},
                ...cloneData
            },
            logic: cloneLogic,
            activeClones: [],
            lastCloneTime: null
        };
        
        this.emit('crocodileCloningCreated', { cloneId, data: cloneData });
        console.log(`[Crocobras] Système de clonage '${cloneId}' créé.`);
    }

    /**
     * Clone ou invoque des crocodiles
     * @param {string} cloneId - ID du système de clonage
     * @param {number} sourceCrocoId - ID du crocodile source
     * @param {Object} [context] - Contexte du clonage
     */
    cloneCrocodile(cloneId, sourceCrocoId, context = {}) {
        if (!this.crocodileCloning || !this.crocodileCloning[cloneId]) return false;
        
        const cloneSystem = this.crocodileCloning[cloneId];
        const now = Date.now();
        
        // Vérifier les limites et cooldowns
        if (cloneSystem.activeClones.length >= cloneSystem.data.maxClones) return false;
        if (cloneSystem.lastCloneTime && (now - cloneSystem.lastCloneTime) < cloneSystem.data.cloneCooldown) {
            return false;
        }
        
        const cloneResult = cloneSystem.logic.call(this, cloneSystem.data, {
            sourceCrocoId: sourceCrocoId,
            gameState: this.getGameState(),
            context: context
        });
        
        if (cloneResult && cloneResult.success) {
            const newCloneId = cloneResult.cloneId || Date.now();
            cloneSystem.activeClones.push({
                id: newCloneId,
                sourceId: sourceCrocoId,
                createdAt: now,
                properties: cloneResult.properties || {}
            });
            
            cloneSystem.lastCloneTime = now;
            
            this.emit('crocodileCloned', { 
                cloneId, 
                sourceId: sourceCrocoId, 
                newCloneId: newCloneId,
                result: cloneResult 
            });
            
            console.log(`[Crocobras] Crocodile ${sourceCrocoId} cloné avec l'ID ${newCloneId}.`);
            return newCloneId;
        }
        
        return false;
    }

    /**
     * crocorare: Permet aux développeurs de créer des crocodiles spéciaux rares avec des comportements spéciaux.
     * @param {string} rareId - ID du crocodile rare
     * @param {Object} rareData - Données du crocodile rare
     * @param {Function} rareLogic - Logique personnalisée du crocodile rare
     */
    crocorare(rareId, rareData, rareLogic) {
        if (typeof rareLogic !== 'function') {
            throw new Error("crocorare: rareLogic doit être une fonction.");
        }
        
        if (!this.rareCrocodiles) {
            this.rareCrocodiles = {};
        }
        
        this.rareCrocodiles[rareId] = {
            data: {
                name: rareData.name || 'Crocodile Rare',
                rarity: rareData.rarity || 'legendary',
                spawnChance: rareData.spawnChance || 0.01,
                specialAbilities: rareData.specialAbilities || [],
                rewards: rareData.rewards || {},
                appearance: rareData.appearance || {},
                behavior: rareData.behavior || {},
                ...rareData
            },
            logic: rareLogic,
            spawnCount: 0,
            lastSpawn: null,
            isActive: false
        };
        
        this.emit('rareCrocodileCreated', { rareId, data: rareData });
        console.log(`[Crocobras] Crocodile rare '${rareId}' créé.`);
    }

    /**
     * Vérifie et fait apparaître des crocodiles rares
     * @param {Object} [spawnContext] - Contexte d'apparition
     */
    checkRareCrocodileSpawn(spawnContext = {}) {
        if (!this.rareCrocodiles) return;
        
        Object.entries(this.rareCrocodiles).forEach(([rareId, rareCroco]) => {
            if (rareCroco.isActive) return;
            
            const shouldSpawn = Math.random() < rareCroco.data.spawnChance;
            
            if (shouldSpawn) {
                const spawnResult = rareCroco.logic.call(this, rareCroco.data, {
                    ...this.getGameState(),
                    ...spawnContext
                });
                
                if (spawnResult && spawnResult.spawn) {
                    rareCroco.isActive = true;
                    rareCroco.spawnCount++;
                    rareCroco.lastSpawn = Date.now();
                    
                    this.emit('rareCrocodileSpawned', { 
                        rareId, 
                        data: rareCroco.data,
                        spawnCount: rareCroco.spawnCount,
                        result: spawnResult 
                    });
                    
                    console.log(`[Crocobras] Crocodile rare '${rareId}' est apparu !`);
                }
            }
        });
    }

    /**
     * crocomd: Permet aux développeurs de créer des mini-tutoriels de démarrage sous forme de dialogues.
     * @param {string} tutorialId - ID du tutoriel
     * @param {Object} tutorialData - Données du tutoriel
     * @param {Function} tutorialLogic - Logique personnalisée du tutoriel
     */
    crocomd(tutorialId, tutorialData, tutorialLogic) {
        if (typeof tutorialLogic !== 'function') {
            throw new Error("crocomd: tutorialLogic doit être une fonction.");
        }
        
        if (!this.tutorials) {
            this.tutorials = {};
        }
        
        this.tutorials[tutorialId] = {
            data: {
                title: tutorialData.title || 'Tutoriel',
                steps: tutorialData.steps || [],
                targetLevels: tutorialData.targetLevels || [1],
                dialogues: tutorialData.dialogues || [],
                rewards: tutorialData.rewards || {},
                optional: tutorialData.optional || false,
                ...tutorialData
            },
            logic: tutorialLogic,
            isActive: false,
            currentStep: 0,
            completed: false
        };
        
        this.emit('tutorialCreated', { tutorialId, data: tutorialData });
        console.log(`[Crocobras] Tutoriel '${tutorialId}' créé.`);
    }

    /**
     * Démarre un tutoriel
     * @param {string} tutorialId - ID du tutoriel à démarrer
     */
    startTutorial(tutorialId) {
        if (!this.tutorials || !this.tutorials[tutorialId]) return false;
        
        const tutorial = this.tutorials[tutorialId];
        tutorial.isActive = true;
        tutorial.currentStep = 0;
        
        tutorial.logic.call(this, tutorial.data, 'start');
        
        this.emit('tutorialStarted', { tutorialId, data: tutorial.data });
        console.log(`[Crocobras] Tutoriel '${tutorialId}' démarré.`);
        return true;
    }

    /**
     * Avance à l'étape suivante du tutoriel
     * @param {string} tutorialId - ID du tutoriel
     */
    nextTutorialStep(tutorialId) {
        if (!this.tutorials || !this.tutorials[tutorialId] || !this.tutorials[tutorialId].isActive) {
            return false;
        }
        
        const tutorial = this.tutorials[tutorialId];
        tutorial.currentStep++;
        
        if (tutorial.currentStep >= tutorial.data.steps.length) {
            tutorial.completed = true;
            tutorial.isActive = false;
            
            this.emit('tutorialCompleted', { tutorialId, rewards: tutorial.data.rewards });
            console.log(`[Crocobras] Tutoriel '${tutorialId}' terminé !`);
        } else {
            tutorial.logic.call(this, tutorial.data, 'step', tutorial.currentStep);
            
            this.emit('tutorialStepChanged', { 
                tutorialId, 
                step: tutorial.currentStep,
                stepData: tutorial.data.steps[tutorial.currentStep] 
            });
        }
        
        return true;
    }

    /**
     * crocoglop: Permet aux développeurs de créer des événements facultatifs de personnalisation pour leurs crocodiles.
     * @param {number} crocoId - ID du crocodile
     * @param {Object} customData - Données de personnalisation
     * @param {Function} customLogic - Logique personnalisée
     */
    crocoglop(crocoId, customData, customLogic) {
        if (typeof customLogic !== 'function') {
            throw new Error("crocoglop: customLogic doit être une fonction.");
        }
        
        if (!this.crocodileCustomization) {
            this.crocodileCustomization = {};
        }
        
        this.crocodileCustomization[crocoId] = {
            data: {
                messages: customData.messages || [],
                messageInterval: customData.messageInterval || 2000,
                specialBehaviors: customData.specialBehaviors || {},
                visualEffects: customData.visualEffects || {},
                sounds: customData.sounds || {},
                ...customData
            },
            logic: customLogic,
            isActive: false,
            intervals: [],
            lastAction: Date.now()
        };
        
        this.emit('crocodileCustomizationCreated', { crocoId, data: customData });
        console.log(`[Crocobras] Personnalisation créée pour le crocodile ${crocoId}.`);
    }

    /**
     * Active la personnalisation d'un crocodile
     * @param {number} crocoId - ID du crocodile
     */
    activateCrocodileCustomization(crocoId) {
        if (!this.crocodileCustomization || !this.crocodileCustomization[crocoId]) return false;
        
        const customization = this.crocodileCustomization[crocoId];
        customization.isActive = true;
        
        // Démarrer les messages récurrents si configurés
        if (customization.data.messages.length > 0 && customization.data.messageInterval > 0) {
            const messageInterval = setInterval(() => {
                if (customization.isActive) {
                    const randomMessage = customization.data.messages[
                        Math.floor(Math.random() * customization.data.messages.length)
                    ];
                    
                    this.emit('crocodileCustomMessage', { 
                        crocoId, 
                        message: randomMessage 
                    });
                    
                    console.log(`[Crocobras] Crocodile ${crocoId}: ${randomMessage}`);
                } else {
                    clearInterval(messageInterval);
                }
            }, customization.data.messageInterval);
            
            customization.intervals.push(messageInterval);
        }
        
        customization.logic.call(this, customization.data, 'activate');
        
        this.emit('crocodileCustomizationActivated', { crocoId });
        console.log(`[Crocobras] Personnalisation activée pour le crocodile ${crocoId}.`);
        return true;
    }

    /**
     * crocofarm: Permet aux développeurs de créer des bébés crocodiles avec leurs logiques de naissance/apparition et comportements.
     * @param {string} babyId - ID du système de bébés crocodiles
     * @param {Object} babyData - Données des bébés crocodiles
     * @param {Function} babyLogic - Logique personnalisée des bébés
     */
    crocofarm(babyId, babyData, babyLogic) {
        if (typeof babyLogic !== 'function') {
            throw new Error("crocofarm: babyLogic doit être une fonction.");
        }
        
        if (!this.babyCrocodiles) {
            this.babyCrocodiles = {};
        }
        
        this.babyCrocodiles[babyId] = {
            data: {
                maxBabies: babyData.maxBabies || 5,
                spawnConditions: babyData.spawnConditions || {},
                growthTime: babyData.growthTime || 15000,
                babyBehavior: babyData.babyBehavior || {},
                parentInfluence: babyData.parentInfluence || {},
                appearance: babyData.appearance || {},
                ...babyData
            },
            logic: babyLogic,
            activeBabies: [],
            totalSpawned: 0
        };
        
        this.emit('babyCrocodileSystemCreated', { babyId, data: babyData });
        console.log(`[Crocobras] Système de bébés crocodiles '${babyId}' créé.`);
    }

    /**
     * Fait naître un bébé crocodile
     * @param {string} babyId - ID du système de bébés
     * @param {number} [parentId] - ID du parent (optionnel)
     * @param {Object} [birthContext] - Contexte de naissance
     */
    spawnBabyCrocodile(babyId, parentId = null, birthContext = {}) {
        if (!this.babyCrocodiles || !this.babyCrocodiles[babyId]) return false;
        
        const babySystem = this.babyCrocodiles[babyId];
        
        if (babySystem.activeBabies.length >= babySystem.data.maxBabies) return false;
        
        const babyResult = babySystem.logic.call(this, babySystem.data, {
            action: 'spawn',
            parentId: parentId,
            gameState: this.getGameState(),
            context: birthContext
        });
        
        if (babyResult && babyResult.success) {
            const newBabyId = babyResult.babyId || Date.now();
            const baby = {
                id: newBabyId,
                parentId: parentId,
                birthTime: Date.now(),
                isGrown: false,
                properties: babyResult.properties || {}
            };
            
            babySystem.activeBabies.push(baby);
            babySystem.totalSpawned++;
            
            this.emit('babyCrocodileSpawned', { 
                babyId, 
                baby: baby,
                parentId: parentId,
                result: babyResult 
            });
            
            console.log(`[Crocobras] Bébé crocodile ${newBabyId} né !`);
            
            // Programmer la croissance
            setTimeout(() => {
                this.growBabyCrocodile(babyId, newBabyId);
            }, babySystem.data.growthTime);
            
            return newBabyId;
        }
        
        return false;
    }

    /**
     * Fait grandir un bébé crocodile
     * @param {string} babyId - ID du système de bébés
     * @param {number} babyInstanceId - ID de l'instance du bébé
     */
    growBabyCrocodile(babyId, babyInstanceId) {
        if (!this.babyCrocodiles || !this.babyCrocodiles[babyId]) return false;
        
        const babySystem = this.babyCrocodiles[babyId];
        const baby = babySystem.activeBabies.find(b => b.id === babyInstanceId);
        
        if (!baby || baby.isGrown) return false;
        
        baby.isGrown = true;
        
        const growthResult = babySystem.logic.call(this, babySystem.data, {
            action: 'grow',
            baby: baby,
            gameState: this.getGameState()
        });
        
        this.emit('babyCrocodileGrown', { 
            babyId, 
            baby: baby,
            result: growthResult 
        });
        
        console.log(`[Crocobras] Bébé crocodile ${babyInstanceId} a grandi !`);
        return true;
    }

    /**
     * crocenvie: Permet aux développeurs de créer des systèmes d'envies pour les crocodiles.
     * @param {string} desireId - ID du système d'envies
     * @param {Object} desireData - Données des envies
     * @param {Function} desireLogic - Logique personnalisée des envies
     */
    crocenvie(desireId, desireData, desireLogic) {
        if (typeof desireLogic !== 'function') {
            throw new Error("crocenvie: desireLogic doit être une fonction.");
        }
        
        if (!this.crocodileDesires) {
            this.crocodileDesires = {};
        }
        
        this.crocodileDesires[desireId] = {
            data: {
                desires: desireData.desires || ['eat', 'hunt', 'play', 'rest'],
                desireWeights: desireData.desireWeights || {},
                satisfactionLevels: desireData.satisfactionLevels || {},
                desireDecay: desireData.desireDecay || 0.1,
                influences: desireData.influences || {},
                ...desireData
            },
            logic: desireLogic,
            crocodileDesires: {},
            lastUpdate: Date.now()
        };
        
        this.emit('crocodileDesireSystemCreated', { desireId, data: desireData });
        console.log(`[Crocobras] Système d'envies '${desireId}' créé.`);
    }

    /**
     * Met à jour les envies d'un crocodile
     * @param {string} desireId - ID du système d'envies
     * @param {number} crocoId - ID du crocodile
     * @param {Object} [context] - Contexte pour les envies
     */
    updateCrocodileDesires(desireId, crocoId, context = {}) {
        if (!this.crocodileDesires || !this.crocodileDesires[desireId]) return;
        
        const desireSystem = this.crocodileDesires[desireId];
        
        if (!desireSystem.crocodileDesires[crocoId]) {
            desireSystem.crocodileDesires[crocoId] = {};
            desireSystem.data.desires.forEach(desire => {
                desireSystem.crocodileDesires[crocoId][desire] = Math.random();
            });
        }
        
        const currentDesires = desireSystem.crocodileDesires[crocoId];
        
        const result = desireSystem.logic.call(this, desireSystem.data, {
            crocoId: crocoId,
            currentDesires: currentDesires,
            gameState: this.getGameState(),
            context: context
        });
        
        if (result) {
            // Mettre à jour les envies selon le résultat
            Object.keys(currentDesires).forEach(desire => {
                if (result[desire] !== undefined) {
                    currentDesires[desire] = Math.max(0, Math.min(1, result[desire]));
                }
            });
            
            desireSystem.lastUpdate = Date.now();
            
            this.emit('crocodileDesireUpdated', { 
                desireId, 
                crocoId, 
                desires: currentDesires,
                result: result 
            });
        }
    }

    /**
     * Obtient les envies actuelles d'un crocodile
     * @param {string} desireId - ID du système d'envies
     * @param {number} crocoId - ID du crocodile
     * @returns {Object|null} Envies actuelles du crocodile
     */
    getCrocodileDesires(desireId, crocoId) {
        if (!this.crocodileDesires || !this.crocodileDesires[desireId]) return null;
        
        const desireSystem = this.crocodileDesires[desireId];
        return desireSystem.crocodileDesires[crocoId] || null;
    }
}

// Exporte la classe du jeu
module.exports = CrocobrasGame;
