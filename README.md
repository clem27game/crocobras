
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
* **Nouveau v1.1.0** : Système de power-ups personnalisés avec `crocopow`
* **Nouveau v1.1.0** : Système de boosts temporaires avec `crocoboost`
* **Nouveau v1.1.0** : Système de points de vie pour crocodiles avec `crocolife`
* **Nouveau v1.1.0** : Système d'armure/force des crocodiles avec `crocoarmure`
* **Nouveau v1.1.0** : Personnalisation de la vitesse des crocodiles avec `crocorap`
* **Nouveau v1.1.0** : Système de danse/esquive avec `crocopop`
* **Nouveau v1.1.0** : Explosions de crocodiles avec `crocoexplose`

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
// Vous pouvez passer des paramètres de configuration optionnels.
const game = new CrocobrasGame({
    initialArmHealth: 200, // Le bras est plus résistant !
    crocoDamage: 20,       // Moins de dégâts par croco
    crocoPerLevel: 2,      // Plus de crocos par niveau
    levelUpThreshold: 10   // 10 crocos pour passer de niveau
});

// Écoutez les événements du jeu pour mettre à jour votre UI ou jouer des sons
game.on('gameStarted', (data) => {
    console.log(`Partie démarrée ! Niveau: ${data.level}, Vie du bras: ${data.armHealth}`);
    // Ici, vous lanceriez la musique de fond
    game.crocoanm('musicLoop'); // Demande au développeur de jouer le son
});

game.on('levelInitialized', (data) => {
    console.log(`Niveau ${data.level} initialisé. Tuez ${data.crocodilesToKill} crocos.`);
    // Mettez à jour votre UI de niveau et le compteur de crocos
});

game.on('crocoKilled', (data) => {
    console.log(`Un croco tué ! Restant : ${data.remainingCount}/${data.killedCount + data.remainingCount}`);
    // Jouez un son de "crocodile mort"
    game.crocoanm('crocoGrowl'); // Événement pour le son
    // Mettez à jour le compteur de crocos restants sur votre UI
});

game.on('armEaten', (data) => {
    console.warn(`Aïe ! Le bras a été mordu. Vie restante : ${data.currentHealth}`);
    // Jouez un son de "morsure"
});

game.on('levelUp', (data) => {
    console.log(`Félicitations ! Vous êtes au niveau ${data.newLevel} !`);
    // Mettez à jour votre UI pour le nouveau niveau
});

game.on('gameOver', (data) => {
    console.error(`GAME OVER ! Atteint le niveau ${data.finalLevel}. Raison : ${data.reason}`);
    // Affichez un écran de game over, jouez un son de défaite
    game.crocoanm('gameOverSound'); // Événement pour le son
});

game.on('shotFired', () => {
    console.log("BOUM ! Coup de fusil tiré.");
    // Jouez un son de tir
    game.crocoanm('shot'); // Événement pour le son
});

// --- Démarrer le jeu ---
game.startGame();

// --- Simuler la logique du jeu (vous feriez cela en réponse aux actions du joueur sur votre UI) ---

// Simuler le joueur qui tire et touche un croco
// Cela devrait être déclenché par un événement de clic/touche sur votre UI du jeu
setTimeout(() => {
    game.crocotire(); // Simule le tir
    // Après détection de collision dans votre moteur de jeu :
    game.crocokill(); // Simule la mort d'un croco
}, 1000);

// Simuler un crocodile qui atteint le bras
// Cela devrait être déclenché par une détection de collision dans votre moteur de jeu
setTimeout(() => {
    game.crocobouffe();
}, 2000);

// Redémarrer le jeu après un certain temps (ou après un clic sur "recommencer")
setTimeout(() => {
    if (game.isGameOver) {
        game.crocoreset();
        game.startGame(); // On doit démarrer après un reset
    }
}, 5000);
```

## Fonctions de Personnalisation

### `crocofuls(customGunLogic)`
Cette fonction vous permet de définir une logique personnalisée pour la détection des coups de feu. Le package n'implémente pas la détection de collision visuelle. C'est à vous de le faire dans votre code côté client/moteur de jeu, puis d'appeler `game.crocokill()` lorsque vous détectez qu'un crocodile a été touché.

```javascript
// Exemple d'utilisation (dans votre code côté client)
// Supposez que vous avez une fonction `detectCollision(bullet, crocodile)`
// Si detectCollision renvoie true, alors vous appelez :
game.crocotire(); // Tir visuel, son
// ... (votre logique de détection de collision ici)
// if (collisionDetected) {
//    game.crocokill(); // Dit au package que le croco est mort
// }
```

### `croconumber(targetCrocosPerLevel)`

Utilisez cette fonction pour personnaliser le nombre de crocodiles qu'il faut tuer pour passer au niveau suivant.
Par défaut, ce seuil est de 5 crocodiles par niveau.

```javascript
// Exemple : Il faut 7 crocodiles pour passer au niveau suivant
game.croconumber(7);
```

### `crocoanm(soundType)`

Cette fonction est un simple déclencheur d'événement. Le package ne joue pas de sons, mais il émet un événement playAnimationSound avec le soundType spécifié. C'est à votre application de mettre en place la lecture audio en réponse à cet événement.
Exemples de soundType : 'shot', 'crocoGrowl', 'musicLoop', 'gameOverSound'.

### `crocustom(customization)`

Pour des personnalisations plus avancées. Vous pouvez passer une fonction qui recevra l'instance du jeu, vous permettant d'ajouter ou de modifier des comportements.

```javascript
game.crocustom((gameInstance) => {
    // Exemple : Ajouter une fonction spéciale au jeu
    gameInstance.cheatCode = () => {
        gameInstance.currentLevel = 10;
        gameInstance.emit('cheatActivated', { newLevel: 10 });
        gameInstance.initializeLevel(10); // Redémarre le niveau 10
        console.log("Cheat code activé ! Niveau 10 !");
    };

    // Exemple : Modifier une méthode existante
    const originalStartGame = gameInstance.startGame;
    gameInstance.startGame = function() {
        console.log("Bienvenue dans le bras d'un mec (version personnalisée) !");
        originalStartGame.apply(this, arguments);
    };
});

// Appeler la nouvelle fonction ou la méthode modifiée
// game.cheatCode();
// game.startGame(); // Appellera la version modifiée
```

## Nouvelles fonctionnalités v1.1.0

### `crocopow(powerUpType, powerUpLogic, options)` - Power-ups personnalisés

Créez vos propres power-ups avec une logique JavaScript personnalisée.

```javascript
// Définir un power-up de santé
game.crocopow('superHealth', function(options) {
    this.armHealth += options.value;
    console.log(`Power-up de santé activé ! +${options.value} PV`);
}, { value: 50, duration: 0 });

// Définir un power-up de tir rapide
game.crocopow('rapidFire', function(options) {
    this.rapidFireActive = true;
    setTimeout(() => {
        this.rapidFireActive = false;
        console.log('Tir rapide désactivé');
    }, options.duration);
}, { duration: 5000 });

// Activer un power-up
game.activatePowerUp('superHealth');
game.activatePowerUp('rapidFire');
```

### `crocoboost(boostType, value, duration, onExpire)` - Boosts temporaires

Créez des systèmes de boost temporaires ou de cadeaux personnalisés.

```javascript
// Boost de vitesse temporaire
game.crocoboost('speedBoost', 2.0, 3000, () => {
    console.log('Le boost de vitesse a expiré !');
});

// Boost de dégâts
game.crocoboost('damageBoost', 50, 10000);

// Vérifier si un boost est actif
if (game.getActiveBoost('speedBoost')) {
    console.log('Boost de vitesse actif !');
}
```

### `crocolife(crocoId, health, options)` - Points de vie des crocodiles

Définissez un système de points de vie pour les crocodiles avant qu'ils meurent.

```javascript
// Donner 100 PV au crocodile #1
game.crocolife(1, 100, { 
    maxHealth: 100, 
    regeneration: 5 // 5 PV de régénération par seconde
});

// Infliger des dégâts à un crocodile spécifique
const crocoMort = game.damageCrocodile(1, 25); // Inflige 25 dégâts
if (crocoMort) {
    console.log('Le crocodile est mort !');
}
```

### `crocoarmure(crocoId, strength, strengthLogic)` - Force/Armure des crocodiles

Personnalisez la force des crocodiles avec une logique d'augmentation automatique.

```javascript
// Crocodile avec force qui augmente selon le niveau
game.crocoarmure(1, 10, function(currentStrength, context) {
    // La force augmente de 5 à chaque niveau
    return currentStrength + (context.level * 5);
});

// Mettre à jour la force avec le contexte actuel
game.updateCrocodileStrength(1, { level: game.currentLevel });
```

### `crocorap(crocoId, speed, speedModifier)` - Vitesse des crocodiles

Personnalisez la vitesse des crocodiles avec des modificateurs dynamiques.

```javascript
// Crocodile dont la vitesse augmente avec le temps
game.crocorap(1, 1.0, function(baseSpeed, factors) {
    const timeMultiplier = factors.timeElapsed ? 1 + (factors.timeElapsed / 10000) : 1;
    return baseSpeed * timeMultiplier;
});

// Mettre à jour la vitesse
game.updateCrocodileSpeed(1, { timeElapsed: 5000 });
```

### `crocopop(crocoId, danceType, danceLogic, options)` - Système de danse/esquive

Créez des systèmes d'esquive et de mouvements spéciaux pour les crocodiles.

```javascript
// Système d'esquive avec probabilité
game.crocopop(1, 'dodge', function(crocoId, options) {
    const dodgeSuccess = Math.random() < options.dodgeChance;
    if (dodgeSuccess) {
        console.log(`Crocodile ${crocoId} esquive l'attaque !`);
        return 'dodged';
    }
    return 'hit';
}, { dodgeChance: 0.3, duration: 1000 });

// Déclencher une esquive
const dodged = game.triggerCrocodileDance(1, 'dodge');
if (dodged) {
    console.log('Le crocodile tente une esquive !');
}
```

### `crocoexplose(crocoId, explosionDamage, explosionRadius, explosionLogic)` - Explosions

Faites exploser des crocodiles à leur mort, infligeant des dégâts de zone.

```javascript
// Explosion simple qui endommage le bras
game.crocoexplose(1, 30, 50);

// Explosion personnalisée avec logique spéciale
game.crocoexplose(2, 40, 75, function(explosion) {
    // Logique personnalisée d'explosion
    console.log(`Explosion massive ! Dégâts: ${explosion.damage}`);
    
    // Infliger des dégâts à d'autres crocodiles dans le rayon
    // (implémentation dépendante de votre système de positionnement)
    
    // Infliger des dégâts au bras
    this.armHealth -= explosion.damage * 0.3;
});
```

## Événements supplémentaires v1.1.0

Les nouvelles fonctionnalités émettent également leurs propres événements :

```javascript
// Événements des power-ups
game.on('customPowerUpRegistered', (data) => {
    console.log(`Power-up '${data.type}' enregistré`);
});

game.on('powerUpActivated', (data) => {
    console.log(`Power-up '${data.type}' activé !`);
});

// Événements des boosts
game.on('boostActivated', (data) => {
    console.log(`Boost '${data.type}' activé pour ${data.duration}ms`);
});

game.on('boostExpired', (data) => {
    console.log(`Boost '${data.type}' expiré`);
});

// Événements des crocodiles
game.on('crocodileHealthSet', (data) => {
    console.log(`Crocodile ${data.crocoId} a ${data.health} PV`);
});

game.on('crocodileDamaged', (data) => {
    console.log(`Crocodile ${data.crocoId} endommagé: ${data.remainingHealth} PV restants`);
});

game.on('crocodileExploded', (data) => {
    console.log(`Crocodile ${data.crocoId} a explosé !`);
});

game.on('crocodileDanceTriggered', (data) => {
    console.log(`Crocodile ${data.crocoId} exécute: ${data.danceType}`);
});
```

## Architecture de votre jeu

Pour créer le jeu complet, vous aurez besoin de deux parties :

**Le Backend (avec crocobras) :**
* Un serveur Node.js (par exemple avec Express) qui utilise crocobras pour gérer la logique du jeu.
* Ce serveur peut exposer une API REST pour communiquer avec le frontend.

**Le Frontend (UI et jeu visuel) :**
* HTML, CSS, JavaScript pour l'interface utilisateur.
* Une bibliothèque ou un framework de jeu (comme Phaser.js, PixiJS, ou même le Canvas API HTML5 natif) pour dessiner le bras, les crocodiles, gérer les animations, les sons, et les interactions utilisateur.
* Ce code frontend communiquerait avec votre backend Node.js pour envoyer les actions du joueur et recevoir les mises à jour de l'état du jeu.

## Exemple complet avec les nouvelles fonctionnalités

```javascript
const CrocobrasGame = require('crocobras');

const game = new CrocobrasGame();

// Configurer des crocodiles avec différentes caractéristiques
function setupCrocodile(id) {
    // Points de vie basés sur le niveau
    game.crocolife(id, 50 + (game.currentLevel * 25));
    
    // Force qui augmente avec le niveau
    game.crocoarmure(id, 10, function(currentStrength, context) {
        return currentStrength + (context.level * 3);
    });
    
    // Vitesse qui augmente avec le temps
    game.crocorap(id, 1.0, function(baseSpeed, factors) {
        return baseSpeed * (1 + factors.level * 0.1);
    });
    
    // Esquive avec plus de chance aux niveaux élevés
    game.crocopop(id, 'dodge', function(crocoId, options) {
        return Math.random() < options.dodgeChance;
    }, { 
        dodgeChance: 0.1 + (game.currentLevel * 0.05), 
        duration: 1000 
    });
}

// Power-up de bombe qui fait exploser tous les crocodiles
game.crocopow('bomb', function(options) {
    console.log('BOMBE ACTIVÉE ! Tous les crocodiles explosent !');
    // Ici vous feriez exploser tous les crocodiles actifs
    for (let i = 1; i <= 5; i++) {
        game.crocoexplose(i, 25, 100);
    }
});

// Démarrer le jeu et configurer les crocodiles
game.startGame();
for (let i = 1; i <= 3; i++) {
    setupCrocodile(i);
}

// Activer la bombe après 10 secondes
setTimeout(() => {
    game.activatePowerUp('bomb');
}, 10000);
```

## Contribution

Toutes les idées et contributions sont les bienvenues ! N'hésitez pas à ouvrir des issues ou à soumettre des pull requests sur le dépôt GitHub.

## Changelog v1.1.0

- ✨ Ajout de `crocopow()` pour les power-ups personnalisés
- ✨ Ajout de `crocoboost()` pour les boosts temporaires
- ✨ Ajout de `crocolife()` pour les points de vie des crocodiles
- ✨ Ajout de `crocoarmure()` pour la force/armure des crocodiles
- ✨ Ajout de `crocorap()` pour la vitesse personnalisée des crocodiles
- ✨ Ajout de `crocopop()` pour les systèmes de danse/esquive
- ✨ Ajout de `crocoexplose()` pour les explosions de crocodiles
- 🔧 Nouvelle fonction `crocokillAdvanced()` qui prend en compte les nouvelles mécaniques
- 📡 Nouveaux événements pour toutes les nouvelles fonctionnalités

**Lien de notre documentation officielle** :

https://croco-combat-arena.lovable.app/