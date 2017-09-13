window.addEventListener('load', pageLoaded);

var keys = {
    keyP1Up: false,
    keyP1Down: false,
    keyP1Right: false,
    keyP1Left: false,
    keyP1Bomb: false,
    keyP2Up: false,
    keyP2Down: false,
    keyP2Right: false,
    keyP2Left: false,
    keyP2Bomb: false,
    muteSound: false
};
var bombTimer = 1000;
var gameSound;
var myText;
var game = {};
var tiles = null;
var playerOne;
var playerTwo;
var playerOneLives = 2;
var playerTwoLives = 2;
var playerOneWinText;
var playerTwoWinText;
// var playerOneLivesText;
// var playerTwoLivesText;
var level = 0;
var playerOnePowerUps = {
    speed: 7,
    bombs: 3,
    power: 4,
    point: 0
}
var playerTwoPowerUps = {
    speed: 7,
    bombs: 3,
    power: 4,
    point: 0
}
var bomb = {
    width: 59,
    height: 59
}
var playerOneBombs = [];
var playerTwoBombs = [];
var gameEngine = false;
var restartButton;

function pageLoaded() {
    console.log("loaded")
    game.stage = new createjs.Stage("myFirst");
    preLoader();
}

function loadProgress(e) {
    console.log(Math.round(e.progress * 100));
    myText.text = Math.round(e.progress * 100) + "%";
    game.stage.update();
}
/*--------------------
    Preloader
--------------------*/
function preLoader() {

    myText = new createjs.Text('0%', '30px Arial', '#FFF');
    game.stage.addChild(myText);
    game.q = new createjs.LoadQueue(true);
    game.q.on("progress", loadProgress);
    game.q.on("complete", gameLoaded);
    game.q.installPlugin(createjs.Sound);
    game.q.loadManifest([
        {
            id: "gameAudio",
            src: "sound/game.mp3"
        },
        {
            id: "playerOneWin",
            src: "sound/player1.mp3"
        },
        {
            id: "playerTwoWin",
            src: "sound/player2.mp3"
        },
        {
            id: "bombAudio",
            src: "sound/bomb.mp3"
        },
        {
            id: "tiles",
            src: "gfx/tiles.PNG"
        },
        {
            id: "char",
            src: "data/players.json"
        },
        {
            id: "fire",
            src: "data/fire.json"
        },
        {
            id: "bomb",
            src: "data/bomb.json"
        },
        {
            id: "bonus",
            src: "data/bonus.json"
        },
        {
            id: "platforms",
            src: "data/platform.json"
        }
    ]);
}


function gameLoaded(e) {
    console.log("Everything is loaded");
    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener('tick', tock);
    game.q.installPlugin(createjs.Sound);
    game.platform = game.q.getResult("platforms");
    // prepare tiles
    game.tiles = new createjs.SpriteSheet({
        "images": [game.q.getResult("tiles")],
        "frames": {
            "width": 60,
            "height": 60,
            "regX": 0,
            "regY": 0
        },
        "dirtGrass": [0],
        "dirt": [1],
        "stone": [2],
        "water": [3],
        "sand": [4],
        "tree": [5],
        "moss": [6],
        "tnt": [7],
        "blizzard": [8],
        "yellowStone": [9],
        "blueStone": [10],
        "redStone": [11],
        "wall": [12],
        "blackStone": [13]
    });
    // Prepare Sprites
    // Player One
    var playerSprite = new createjs.SpriteSheet(game.q.getResult('char')[0]);
    console.log("player one here");
    playerOne = new createjs.Sprite(playerSprite, 'down');
    playerOne.height = 60;
    playerOne.width = 60;
    game.stage.addChild(playerOne);

    // Player Two
    var playerSprite = new createjs.SpriteSheet(game.q.getResult('char')[1]);
    console.log("player two here");
    playerTwo = new createjs.Sprite(playerSprite, 'up');
    playerTwo.height = 60;
    playerTwo.width = 60;
    game.stage.addChild(playerTwo);
    createTiles(level);

    playerOneWinText = new createjs.Text("", "75px Verdana", "#ff0000");
    game.stage.addChild(playerOneWinText);
    playerTwoWinText = new createjs.Text("", "75px Verdana", "#0000ff");
    game.stage.addChild(playerTwoWinText);

    //    playerOnePointText = new createjs.Text("score " + playerOnePowerUps.point, "25px Verdana", "#ff0000");
    //    game.stage.addChild(playerOneLivesText);
    //    playerTwoLivesText = new createjs.Text("score " + playerTwoPowerUps.point, "25px Verdana", "#0000ff");
    //    game.stage.addChild(playerTwoLivesText);

    restartButton = document.getElementById("restartButton");
    restartButton.addEventListener("click", gameRestart);
}



/*--------------------
    Map creation
--------------------*/
// Taget fra Peter
function createTiles(level) {
    tiles = [];

    let map = game.platform[level].map;

    for (let y = 0; y < map.length; y++) {
        tiles[y] = [];
        for (let x = 0; x < map[y].length; x++) {

            let type = map[y][x];

            let tile = new createjs.Sprite(game.tiles, type);
            tile.type = type;
            tile.gotoAndStop(type);
            tile.gridX = x;
            tile.gridY = y;

            tile.x = x * 60;
            tile.y = y * 60;
            if (tile.type != 6) {
                tiles[y][x] = tile;
            }
            game.stage.addChild(tile);
        }
    }
    playerOne.x = game.platform[level].p1.x;
    playerOne.y = game.platform[level].p1.y;
    game.stage.addChild(playerOne);
    playerTwo.x = game.platform[level].p2.x;
    playerTwo.y = game.platform[level].p2.y;
    game.stage.addChild(playerTwo);
}
// Her ned til
/*--------------------
    Movement
--------------------*/
window.addEventListener('keyup', function (event) {
    if (event.keyCode === 13) {
        keys.keyP1Bomb = true;
        bombPlayerOne();
        console.log("player 1 place bomb");
    }
    // bomb
    else if (event.keyCode === 32) {
        keys.keyP2Bomb = true;
        bombPlayerTwo();
        console.log("player 2 place bomb");
    }
    if (event.keyCode === 37) {
        keys.keyP1Left = false;
        console.log("player 1 left");
    }
    //right key
    else if (event.keyCode === 39) {
        keys.keyP1Right = false;
        console.log("player 1 right");
    }
    //up key
    else if (event.keyCode === 38) {
        keys.keyP1Up = false;
        console.log("player 1 up");
    }
    //down
    else if (event.keyCode === 40) {
        keys.keyP1Down = false;
        console.log("player 1 down");
    }
    //left key
    if (event.keyCode === 65) {
        keys.keyP2Left = false;
        console.log("player 2 left");
    }
    //right key
    else if (event.keyCode === 68) {
        keys.keyP2Right = false;
        console.log("player 2 right");
    }
    //up key
    else if (event.keyCode === 87) {
        keys.keyP2Up = false;
        console.log("player 2 up");
    }
    //down
    else if (event.keyCode === 83) {
        keys.keyP2Down = false;
        console.log("player 2 down");
    }
});
//control system
window.addEventListener('keydown', function (event) {
    //console.log(event.keyCode)
    //left key
    if (event.keyCode === 37) {
        keys.keyP1Left = true;
        console.log("player 1 left");
    }
    //right key
    else if (event.keyCode === 39) {
        keys.keyP1Right = true;
        console.log("player 1 right");
    }
    //up key
    else if (event.keyCode === 38) {
        keys.keyP1Up = true;
        console.log("player 1 up");
    }
    //down
    else if (event.keyCode === 40) {
        keys.keyP1Down = true;
        console.log("player 1 down");
    }
    //left key
    if (event.keyCode === 65) {
        keys.keyP2Left = true;
        console.log("player 2 left");
    }
    //right key
    else if (event.keyCode === 68) {
        keys.keyP2Right = true;
        console.log("player 2 right");
    }
    //up key
    else if (event.keyCode === 87) {
        keys.keyP2Up = true;
        console.log("player 2 up");
    }
    //down
    else if (event.keyCode === 83) {
        keys.keyP2Down = true;
        console.log("player 2 down");
    }
    if (event.keyCode === 77) {
        if (!createjs.Sound.muted) {
            gameSound.pause();
        } else {
            gameSound.play();
        }
        createjs.Sound.muted = !createjs.Sound.muted;
        console.log("gameSound", !createjs.Sound.muted);
    }
});
// Fået fra Peter
function movePlayers() {
    "use strict";
    if (keys.keyP1Left) {
        if (canWalkOnMap(playerOne.x, playerOne.y, "left")) {
            playerOne.x -= playerOnePowerUps.speed;
            if (playerOne.currentDirection != "left") {
                playerOne.gotoAndPlay('left');
                playerOne.currentDirection = "left";
            }
        }
    }
    if (keys.keyP1Right) {
        if (canWalkOnMap(playerOne.x, playerOne.y, "right")) {
            playerOne.x += playerOnePowerUps.speed;
            if (playerOne.currentDirection != "right") {
                playerOne.gotoAndPlay('right');
                playerOne.currentDirection = "right";
            }
        }
    }
    if (keys.keyP1Up) {
        if (canWalkOnMap(playerOne.x, playerOne.y, "up")) {
            playerOne.y -= playerOnePowerUps.speed;
            if (playerOne.currentDirection != "up") {
                playerOne.gotoAndPlay('up');
                playerOne.currentDirection = "up";
            }
        }
    }
    if (keys.keyP1Down) {
        if (canWalkOnMap(playerOne.x, playerOne.y, "down")) {
            playerOne.y += playerOnePowerUps.speed;
            if (playerOne.currentDirection != "down") {
                playerOne.gotoAndPlay('down');
                playerOne.currentDirection = "down";
            }
        }
    }
    if (keys.keyP2Left) {
        if (canWalkOnMap(playerTwo.x, playerTwo.y, "left")) {
            playerTwo.x -= playerTwoPowerUps.speed;
            if (playerTwo.currentDirection != "left") {
                playerTwo.gotoAndPlay('left');
                playerTwo.currentDirection = "left";
            }
        }

    }
    if (keys.keyP2Right) {
        if (canWalkOnMap(playerTwo.x, playerTwo.y, "right")) {
            playerTwo.x += playerTwoPowerUps.speed;
            if (playerTwo.currentDirection != "right") {
                playerTwo.gotoAndPlay('right');
                playerTwo.currentDirection = "right";
            }

        }
    }
    if (keys.keyP2Up) {
        if (canWalkOnMap(playerTwo.x, playerTwo.y, "up")) {
            playerTwo.y -= playerTwoPowerUps.speed;
            if (playerTwo.currentDirection != "up") {
                playerTwo.gotoAndPlay('up');
                playerTwo.currentDirection = "up";
            }
        }

    }
    if (keys.keyP2Down) {
        if (canWalkOnMap(playerTwo.x, playerTwo.y, "down")) {
            playerTwo.y += playerTwoPowerUps.speed;
            if (playerTwo.currentDirection != "down") {
                playerTwo.gotoAndPlay('down');
                playerTwo.currentDirection = "down";
            }
        }

    }
}
// slutter her

// Fået lidt hjælp af en ven og inspiration fra Peter
function getTileAt(gridx, gridy) {
    const tilesMap = game.platform[level].map;
    const type = tilesMap[gridy][gridx];
    return type;
}

/*--------------------
    Where to walk  
--------------------*/
function canWalkOnMap(xpos, ypos, direction) {
    let gridx = Math.round(xpos / 60);
    let gridy = Math.round(ypos / 60);

    switch (direction) {
    case "left":
        gridx--;
        break;
    case "right":
        gridx++;
        break;
    case "up":
        gridy--;
        break;
    case "down":
        gridy++;
        break;
    }

    let tile = getTileAt(gridx, gridy);
    let canwalk = tile != 12;

    //  console.log("xpos:", xpos, "ypos:", ypos, "- gridx:", gridx, "- gridy:", gridy, "- tile:", tile);

    return canwalk;
}
// Ned til her

/*--------------------
    place Bomb
--------------------*/
function bombPlayerOne() {
    if (playerOneBombs.length < playerOnePowerUps.bombs) {
        let ss = new createjs.SpriteSheet(game.q.getResult('bomb'));
        let temp = new createjs.Sprite(ss, "bombIt");
        temp.width = 59;
        temp.height = 59;
        temp.x = playerOne.x;
        temp.y = playerOne.y;
        game.stage.addChild(temp);
        playerOneBombs.push(temp);
        console.log("player one placed a bomb");
        setTimeout(function () {
            explosion(temp);
            playerOneBombs.pop();
        }, bombTimer);
    }
}

function bombPlayerTwo() {
    if (playerTwoBombs.length < playerTwoPowerUps.bombs) {
        let ss = new createjs.SpriteSheet(game.q.getResult('bomb'));
        let temp = new createjs.Sprite(ss, "bombIt");
        temp.width = 59;
        temp.height = 59;
        temp.x = playerTwo.x;
        temp.y = playerTwo.y;
        game.stage.addChild(temp);
        playerTwoBombs.push(temp);
        console.log("player two placed a bomb");
        setTimeout(function () {
            explosion(temp);
            playerTwoBombs.pop();
        }, bombTimer);
    }
}

/*--------------------
    Explosion
--------------------*/
function explosion(bomb) {
    game.stage.removeChild(bomb);
    createjs.Sound.play('bombAudio');
    console.log('Explosion sound');

    for (let i = 0; i < playerOnePowerUps.power; i++) {
        let explosionSS = new createjs.SpriteSheet(game.q.getResult('fire'));
        let bombExplosion = new createjs.Sprite(explosionSS, "fire");
        game.stage.addChild(bombExplosion);
        bombExplosion.width = 60;
        bombExplosion.height = 60;
        bombExplosion.x = bomb.x - 60 * i;
        bombExplosion.y = bomb.y;
        bombExplosion.addEventListener('animationend', (e) => {
            console.log(game.stage, bombExplosion);
            game.stage.removeChild(e.target); // ved brug af parameter (e) peger jeg på target -> bombExplosion... istedet for at skrive 'bombExplosion'...
        });
        if (hitTest(playerOne, bombExplosion)) {
            gotHit(playerOne);
        }
        if (hitTest(playerTwo, bombExplosion)) {

            gotHit(playerTwo);
        }
    }
    for (let i = 0; i < playerOnePowerUps.power; i++) {
        let explosionSS = new createjs.SpriteSheet(game.q.getResult('fire'));
        let bombExplosion = new createjs.Sprite(explosionSS, "fire");
        game.stage.addChild(bombExplosion);
        bombExplosion.width = 60;
        bombExplosion.height = 60;
        bombExplosion.x = bomb.x + 60 * i;
        bombExplosion.y = bomb.y;
        bombExplosion.addEventListener('animationend', function () {
            //console.log("explosion over");
            game.stage.removeChild(bombExplosion);
        });
        if (hitTest(playerOne, bombExplosion)) {
            gotHit(playerOne);
        }
        if (hitTest(playerTwo, bombExplosion)) {

            gotHit(playerTwo);
        }
    }
    for (let i = 0; i < playerOnePowerUps.power; i++) {
        let explosionSS = new createjs.SpriteSheet(game.q.getResult('fire'));
        let bombExplosion = new createjs.Sprite(explosionSS, "fire");
        game.stage.addChild(bombExplosion);
        bombExplosion.width = 60;
        bombExplosion.height = 60;
        bombExplosion.x = bomb.x;
        bombExplosion.y = bomb.y - 60 * i;
        bombExplosion.addEventListener('animationend', function () {
            //console.log("explosion over");
            game.stage.removeChild(bombExplosion);
        });
        if (hitTest(playerOne, bombExplosion)) {
            gotHit(playerOne);
        }
        if (hitTest(playerTwo, bombExplosion)) {

            gotHit(playerTwo);
        }
    }
    for (let i = 0; i < playerOnePowerUps.power; i++) {
        let explosionSS = new createjs.SpriteSheet(game.q.getResult('fire'));
        let bombExplosion = new createjs.Sprite(explosionSS, "fire");
        game.stage.addChild(bombExplosion);
        bombExplosion.width = 60;
        bombExplosion.height = 60;
        bombExplosion.x = bomb.x;
        bombExplosion.y = bomb.y + 60 * i;
        bombExplosion.addEventListener('animationend', function () {
            //console.log("explosion over");
            game.stage.removeChild(bombExplosion);
        });
        if (hitTest(playerOne, bombExplosion)) {
            gotHit(playerOne);
        }
        if (hitTest(playerTwo, bombExplosion)) {

            gotHit(playerTwo);
        }
    }



    for (let i = 0; i < playerTwoPowerUps.power; i++) {
        let explosionSS = new createjs.SpriteSheet(game.q.getResult('fire'));
        let bombExplosion = new createjs.Sprite(explosionSS, "fire");
        game.stage.addChild(bombExplosion);
        bombExplosion.width = 60;
        bombExplosion.height = 60;
        bombExplosion.x = bomb.x - 60 * i;
        bombExplosion.y = bomb.y;
        bombExplosion.addEventListener('animationend', function () {
            //console.log("explosion over");
            game.stage.removeChild(bombExplosion);
        });
        if (hitTest(playerOne, bombExplosion)) {
            gotHit(playerOne);
        }
        if (hitTest(playerTwo, bombExplosion)) {

            gotHit(playerTwo);
        }
    }
    for (let i = 0; i < playerTwoPowerUps.power; i++) {
        let explosionSS = new createjs.SpriteSheet(game.q.getResult('fire'));
        let bombExplosion = new createjs.Sprite(explosionSS, "fire");
        game.stage.addChild(bombExplosion);
        bombExplosion.width = 60;
        bombExplosion.height = 60;
        bombExplosion.x = bomb.x + 60 * i;
        bombExplosion.y = bomb.y;
        bombExplosion.addEventListener('animationend', function () {
            game.stage.removeChild(bombExplosion);
        });
        if (hitTest(playerOne, bombExplosion)) {
            gotHit(playerOne);
        }
        if (hitTest(playerTwo, bombExplosion)) {

            gotHit(playerTwo);
        }
    }
    for (let i = 0; i < playerTwoPowerUps.power; i++) {
        let explosionSS = new createjs.SpriteSheet(game.q.getResult('fire'));
        let bombExplosion = new createjs.Sprite(explosionSS, "fire");
        game.stage.addChild(bombExplosion);
        bombExplosion.width = 60;
        bombExplosion.height = 60;
        bombExplosion.x = bomb.x;
        bombExplosion.y = bomb.y - 60 * i;
        bombExplosion.addEventListener('animationend', function () {
            game.stage.removeChild(bombExplosion);
        });
        if (hitTest(playerOne, bombExplosion)) {
            gotHit(playerOne);
        }
        if (hitTest(playerTwo, bombExplosion)) {

            gotHit(playerTwo);
        }
    }
    for (let i = 0; i < playerTwoPowerUps.power; i++) {
        let explosionSS = new createjs.SpriteSheet(game.q.getResult('fire'));
        let bombExplosion = new createjs.Sprite(explosionSS, "fire");
        game.stage.addChild(bombExplosion);
        bombExplosion.width = 60;
        bombExplosion.height = 60;
        bombExplosion.x = bomb.x;
        bombExplosion.y = bomb.y + 60 * i;
        bombExplosion.addEventListener('animationend', function () {
            game.stage.removeChild(bombExplosion);
        });
        if (hitTest(playerOne, bombExplosion)) {
            gotHit(playerOne);
        }
        if (hitTest(playerTwo, bombExplosion)) {

            gotHit(playerTwo);
        }
    }


}
/*--------------------
   Bomb hit player
--------------------*/
function hitTest(circle1, rect2) {
    if (circle1.x >= rect2.x + rect2.width || circle1.x + circle1.width <= rect2.x || circle1.y >= rect2.y + rect2.height || circle1.y + circle1.height <= rect2.y) {
        return false;
    }
    return true;
}

function gotHit(player) {

    if (player === playerOne) {
        console.log(playerOneLives, "player 1 lost a life");
        playerOneLives--;
        if (playerOneLives <= -1) {
            playerOne.gotoAndPlay('dead');
            playerOne.currentDirection = "dead";
            console.log("player 1 is dead!");
            //change text
            playerTwoWinText.text = "Player 2 Wins!";
            //put it to the right
            playerTwoWinText.x = -200;
            playerTwoWinText.y = -200;
            playerTwoWinText.textAlign = "center";
            playerTwoWinText.textBaseline = "middle";
            //animate in
            createjs.Tween.get(playerTwoWinText).to({
                x: 450,
                y: 290
            }, 2000, createjs.Ease.bounceInOut).wait(5000).to({
                x: 1500,
                y: -200
            }, 1000)

            createjs.Sound.play('playerTwoWin');
            console.log("player 2 sound");
            // playerTwoPowerUps.point = playerTwoPowerUps.point + 1;
            // TODO : - Player 2 wins
            restartButton.style.display = "inline";
            gameEngine = true;
        }

    }
    if (player === playerTwo) {
        console.log(playerTwoLives, "player 2 lost a life");
        playerTwoLives--;
        if (playerTwoLives <= -1) {
            playerTwo.gotoAndPlay('dead');
            playerTwo.currentDirection = "dead";
            console.log("player 2 is dead!");
            //change text
            playerOneWinText.text = "Player 1 Wins!";
            //put it to the left
            playerOneWinText.x = -200;
            playerOneWinText.y = -200;
            playerOneWinText.textAlign = "center";
            playerOneWinText.textBaseline = "middle";
            //animate in
            createjs.Tween.get(playerOneWinText).to({
                x: 450,
                y: 290
            }, 2000, createjs.Ease.bounceInOut).wait(5000).to({
                x: 1500,
                y: -200
            }, 1000)
            createjs.Sound.play('playerOneWin');
            console.log("player 1 sound");
            //  playerOnePowerUps.point = playerOnePowerUps.point + 1;
            // TODO : - Player 1 wins  
            restartButton.style.display = "inline";
            gameEngine = true;

        }
    }

}
/*--------------------
    Point
--------------------*/
//function playerOneUpdatePointText(score) {
//    playerOnePointText = "score " + score;
//}
//
//function playerTwoUpdatePointText(score) {
//    playerTwoPointText = "score " + score;
//}


/*--------------------
    Add Box
--------------------*/


/*--------------------
    Destroy box
--------------------*/
/* remove box */


/* add grass */


/*--------------------
    power Ups
--------------------*/


/*--------------------
    Win / Lose
--------------------*/
/* player 1 wins */


/* player two wins */


/*--------------------
    Game Menu
--------------------*/
function showhide() {
    var div = document.getElementById("mainMenu");
    if (div.style.display !== "none") {
        div.style.display = "none";
    } else {
        div.style.display = "block";
    }
}

/*--------------------
    Sound
--------------------*/
// Fået fra stackoverflow - https://stackoverflow.com/questions/3273552/html5-audio-looping
gameSound = new Audio('sound/game.mp3');
gameSound.addEventListener('ended', function () {
    this.currentTime = 0;
    this.play();
}, false);
gameSound.play();

console.log("Sound loaded");
// Her ned til



/*--------------------
    *Scoreboard
--------------------*/



/*--------------------
    *Time
--------------------*/
// TODO : Hvis jeg har tid så lav en timer


/*--------------------
    *Sudden Death
--------------------*/


/*--------------------
    Restart
--------------------*/
function gameRestart() {
    pageLoaded();
    restartButton.style.display = "none";
    gameEngine = false;
}

/*--------------------
    Stage update
--------------------*/
function tock(e) {
    "use strict";
    if (playerOneLives === 0 || playerTwoLives === 0) {
        gameRestart
    }
    if (gameEngine === false) {
        movePlayers();
    }
    //    playerOneUpdatePointText(playerOnePowerUps.point);
    //    playerTwoUpdatePointText(playerTwoPowerUps.point);

    game.stage.update(e);
}