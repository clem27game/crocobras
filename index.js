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
}

// Exporte la classe du jeu
module.exports = CrocobrasGame;
