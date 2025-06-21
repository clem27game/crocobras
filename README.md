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

## Installation

```bash
npm install crocobras
```

Assurez-vous d'avoir également nekomaths installé, car crocobras en dépend :

```
npm install nekomaths
```

**Utilisation**

crocobras exporte une classe CrocobrasGame. Vous devez instancier cette classe pour commencer à utiliser la logique du jeu.

```
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
// --- Fonctions de Personnalisation ---

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

**croconumber(targetCrocosPerLevel)**

Utilisez cette fonction pour personnaliser le nombre de crocodiles qu'il faut tuer pour passer au niveau suivant.
Par défaut, ce seuil est de 5 crocodiles par niveau.
// Exemple : Il faut 7 crocodiles pour passer au niveau suivant
game.croconumber(7);

crocoanm(soundType)
```

Cette fonction est un simple déclencheur d'événement. Le package ne joue pas de sons, mais il émet un événement playAnimationSound avec le soundType spécifié. C'est à votre application de mettre en place la lecture audio en réponse à cet événement.
Exemples de soundType : '
```

shot', 'crocoGrowl', 'musicLoop', 'gameOverSound'.
crocustom(customization)
```

Pour des personnalisations plus avancées. Vous pouvez passer une fonction qui recevra l'instance du jeu, vous permettant d'ajouter ou de modifier des comportements.

```
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

**Architecture de votre jeu**

Pour créer le jeu complet, vous aurez besoin de deux parties :
 * Le Backend (avec crocobras) :
   * Un serveur Node.js (par exemple avec Express) qui utilise crocobras pour gérer la logique du jeu.
   * Ce serveur peut exposer une API REST pour communiquer avec le frontend.
 * Le Frontend (UI et jeu visuel) :
   * HTML, CSS, JavaScript pour l'interface utilisateur.
   * Une bibliothèque ou un framework de jeu (comme Phaser.js, PixiJS, ou même le Canvas API HTML5 natif) pour dessiner le bras, les crocodiles, gérer les animations, les sons, et les interactions utilisateur.
   * Ce code frontend communiquerait avec votre backend Node.js pour envoyer les actions du joueur et recevoir les mises à jour de l'état du jeu.
   * 
**Contribution**

Toutes les idées et contributions sont les bienvenues ! N'hésitez pas à ouvrir des issues ou à soumettre des pull requests sur le dépôt GitHub.