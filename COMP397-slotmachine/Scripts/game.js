/// <reference path="typings/stats/stats.d.ts" />
/// <reference path="typings/easeljs/easeljs.d.ts" />
/// <reference path="typings/tweenjs/tweenjs.d.ts" />
/// <reference path="typings/soundjs/soundjs.d.ts" />
/// <reference path="typings/preloadjs/preloadjs.d.ts" />
/// <reference path="../config/constants.ts" />
/// <reference path="../objects/label.ts" />
/// <reference path="../objects/button.ts" />
// Game Framework Variables
var canvas = document.getElementById("canvas");
var stage;
var stats;
var tiles = [];
var reelContainers = [];
//Game constants
var NUM_REELS = 3;
var assets;
var manifest = [
    { id: "background", src: "assets/images/slotMachine.png" },
    { id: "clicked", src: "assets/audio/clicked.wav" }
];
var atlas = {
    "images": ["assets/images/myatlas.png"],
    "frames": [
        [2, 2, 64, 64],
        [2, 68, 64, 64],
        [2, 134, 64, 64],
        [200, 2, 49, 49],
        [200, 53, 49, 49],
        [200, 104, 49, 49],
        [68, 2, 64, 64],
        [134, 2, 64, 64],
        [68, 68, 64, 64],
        [134, 68, 64, 64],
        [134, 134, 49, 49],
        [68, 134, 64, 64],
        [185, 155, 49, 49]
    ],
    "animations": {
        "bananaSymbol": [0],
        "barSymbol": [1],
        "bellSymbol": [2],
        "betMaxButton": [3],
        "betOneButton": [4],
        "betTenButton": [5],
        "blankSymbol": [6],
        "cherrySymbol": [7],
        "grapesSymbol": [8],
        "orangeSymbol": [9],
        "resetButton": [10],
        "sevenSymbol": [11],
        "spinButton": [12]
    }
};
// Game Variables
var background;
var textureAtlas;
var mySpinButton;
var MyResetButton;
var myBetOneButton;
var myBetMaxButton;
var myBetTenButton;
var winMsgLabel;
var loseMsgLabel;
var myjackpotLabel;
var mybetMaxLabel;
var mybetOneLabel;
var myBetTenLabel;
var myplayerMoneyLabel;
//tally variable
var jackpot = 5000;
var playerMoney = 1000;
var grapes = 0;
//var bananas = 0;
var oranges = 0;
var cherries = 0;
var shells = 0;
var diamonds = 0;
var grapes = 0;
var cherries = 0;
var blanks = 0;
var sevens = 0;
var winnings = 0;
var turn = 0;
var playerBet = 0;
var winNumber = 0;
var lossNumber = 0;
var winRatio = 0;
var spinResult;
var fruits = "";
// Preloader Function
function preload() {
    assets = new createjs.LoadQueue();
    assets.installPlugin(createjs.Sound);
    // event listener triggers when assets are completely loaded
    assets.on("complete", init, this);
    assets.loadManifest(manifest);
    //Setup statistics object
    //lead texture atlas
    textureAtlas = new createjs.SpriteSheet(atlas);
    setupStats();
}
// Callback function that initializes game objects
function init() {
    stage = new createjs.Stage(canvas); // reference to the stage
    stage.enableMouseOver(20);
    createjs.Ticker.setFPS(60); // framerate 60 fps for the game
    // event listener triggers 60 times every second
    createjs.Ticker.on("tick", gameLoop);
    // calling main game function
    main();
}
// function to setup stat counting
function setupStats() {
    stats = new Stats();
    stats.setMode(0); // set to fps
    // align bottom-right
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '330px';
    stats.domElement.style.top = '10px';
    document.body.appendChild(stats.domElement);
}
// Callback function that creates our Main Game Loop - refreshed 60 fps
function gameLoop() {
    stats.begin(); // Begin measuring
    stage.update();
    stats.end(); // end measuring
}
/* Utility function to check if a value falls within a range of bounds */
function checkRange(value, lowerBounds, upperBounds) {
    if (value >= lowerBounds && value <= upperBounds) {
        return value;
    }
    else {
        return !value;
    }
}
/* When this function is called it determines the betLine results.
e.g. Bar - Orange - Banana */
function Reels() {
    var betLine = [" ", " ", " "];
    var outCome = [0, 0, 0];
    for (var spin = 0; spin < 3; spin++) {
        outCome[spin] = Math.floor((Math.random() * 65) + 1);
        switch (outCome[spin]) {
            case checkRange(outCome[spin], 1, 27):
                betLine[spin] = "blanksymbol";
                blanks++;
                break;
            case checkRange(outCome[spin], 28, 37):
                betLine[spin] = "barjackpot";
                shells++;
                break;
            case checkRange(outCome[spin], 38, 46):
                betLine[spin] = "belljackpot";
                grapes++;
                break;
            case checkRange(outCome[spin], 47, 54):
                betLine[spin] = "diamondjackpot";
                diamonds++;
                break;
            case checkRange(outCome[spin], 55, 59):
                betLine[spin] = "jackpotseven";
                sevens++;
                break;
            case checkRange(outCome[spin], 60, 62):
                betLine[spin] = "shelljackpot";
                shells++;
                break;
            case checkRange(outCome[spin], 63, 64):
                betLine[spin] = "grapesjackpot";
                grapes++;
                break;
            case checkRange(outCome[spin], 65, 65):
                betLine[spin] = "cherryjackpot";
                cherries++;
                break;
        }
    }
    return betLine;
}
/* This function calculates the player's winnings, if any */
function determineWinnings() {
    if (blanks == 0) {
        if (grapes == 3) {
            winnings = playerBet * 10;
        }
        else if (diamonds == 3) {
            winnings = playerBet * 20;
        }
        else if (sevens == 3) {
            winnings = playerBet * 30;
        }
        else if (cherries == 3) {
            winnings = playerBet * 40;
        }
        else if (shells == 3) {
            winnings = playerBet * 50;
        }
        else if (grapes == 3) {
            winnings = playerBet * 75;
        }
        else if (cherries == 3) {
            winnings = playerBet * 100;
        }
        else if (grapes == 2) {
            winnings = playerBet * 2;
        }
        else if (diamonds == 2) {
            winnings = playerBet * 2;
        }
        else if (sevens == 2) {
            winnings = playerBet * 3;
        }
        else if (cherries == 2) {
            winnings = playerBet * 4;
        }
        else if (shells == 2) {
            winnings = playerBet * 5;
        }
        else if (grapes == 2) {
            winnings = playerBet * 10;
        }
        else if (cherries == 2) {
            winnings = playerBet * 20;
        }
        else if (cherries == 1) {
            winnings = playerBet * 5;
        }
        else {
            winnings = playerBet * 1;
        }
        winNumber++;
        showWinMessage();
    }
    else {
        lossNumber++;
        showLossMessage();
    }
}
/* Utility function to show a loss message and reduce player money */
function showLossMessage() {
    playerMoney -= playerBet;
    //$("div#winOrLose>p").text("You Lost!");
    stage.removeChild(winMsgLabel);
    stage.removeChild(loseMsgLabel);
    loseMsgLabel = new objects.Label("OOPS....YOU LOSE", 90, 60, false);
    stage.addChild(loseMsgLabel);
    resetFruitTally();
}
/* Utility function to show a win message and increase player money */
function showWinMessage() {
    playerMoney += winnings;
    //$("div#winOrLose>p").text("You Won: $" + winnings);
    console.log("WINNER");
    stage.removeChild(loseMsgLabel);
    stage.removeChild(winMsgLabel);
    winMsgLabel = new objects.Label("BRAVO!!YOU WIN JACKPOT", 39, 60, false);
    stage.addChild(winMsgLabel);
    resetFruitTally();
    checkJackPot();
}
/* Check to see if the player won the jackpot */
function checkJackPot() {
    /* compare two random values */
    var jackPotTry = Math.floor(Math.random() * 51 + 1);
    var jackPotWin = Math.floor(Math.random() * 51 + 1);
    if (jackPotTry == jackPotWin) {
        stage.removeChild(loseMsgLabel);
        stage.removeChild(winMsgLabel);
        alert("You won jackpot");
        playerMoney += jackpot;
        jackpot = 1000;
    }
}
//function to set player bet
function setPlayerBet(bet) {
    playerBet = bet;
}
// Callback function that allows me to respond to button click events
function spinButtonClicked(event) {
    createjs.Sound.play("clicked");
    //  spinResult = Reels();
    //  fruits = spinResult[0] + " - " + spinResult[1] + " - " + spinResult[2];
    //  console.log(fruits);
    //new code to test functionality
    //  playerBet = $("div#betEntry>input").val();
    //playerBet = 20;
    if (playerMoney == 0) {
        if (confirm("You ran out of Money! \nDo you want to play again?")) {
            resetAll();
            showPlayerStats();
        }
    }
    else if (playerBet > playerMoney) {
        alert("You dont have enough money");
    }
    else if (playerBet < 0) {
        alert("All bets must be a positive $ amount.");
    }
    else if (playerBet <= playerMoney) {
        spinResult = Reels();
        fruits = spinResult[0] + " - " + spinResult[1] + " - " + spinResult[2];
        //$("div#result>p").text(fruits);
        determineWinnings();
        turn++;
        showPlayerStats();
    }
    else {
        alert("Please enter a valid bet amount");
    }
    // Iterate over the number of reels
    for (var index = 0; index < NUM_REELS; index++) {
        reelContainers[index].removeAllChildren();
        tiles[index] = new createjs.Bitmap("assets/images/" + spinResult[index] + ".png");
        reelContainers[index].addChild(tiles[index]);
    }
}
//function that will work on pressing reset button
function resetButtonClicked(event) {
    createjs.Sound.play("clicked");
    resetAll();
    showPlayerStats();
}
//function that will work when presset bet one button
function betOneButtonClicked(event) {
    createjs.Sound.play("clicked");
    setPlayerBet(1);
    stage.removeChild(mybetOneLabel);
    stage.removeChild(myBetTenLabel);
    stage.removeChild(mybetMaxLabel);
    mybetOneLabel = new objects.Label("$1", 140, 298, false);
    stage.addChild(mybetOneLabel);
}
//function that will work when pressed bet ten button
function betTenButtonClicked(event) {
    createjs.Sound.play("clicked");
    setPlayerBet(10);
    stage.removeChild(mybetOneLabel);
    stage.removeChild(myBetTenLabel);
    stage.removeChild(mybetMaxLabel);
    myBetTenLabel = new objects.Label("$10", 140, 298, false);
    stage.addChild(myBetTenLabel);
}
//function that will work when pressed bet max button
function betMaxButtonClicked(event) {
    createjs.Sound.play("clicked");
    setPlayerBet(playerMoney);
    stage.removeChild(mybetOneLabel);
    stage.removeChild(myBetTenLabel);
    stage.removeChild(mybetMaxLabel);
    mybetMaxLabel = new objects.Label("$" + playerMoney.toString(), 140, 298, false);
    stage.addChild(mybetMaxLabel);
}
/* Utility function to show Player Stats */
function showPlayerStats() {
    winRatio = winNumber / turn;
    // $("#jackpot").text("Jackpot: " + jackpot);
    stage.removeChild(myplayerMoneyLabel);
    stage.removeChild(myjackpotLabel);
    myjackpotLabel = new objects.Label("$" + jackpot.toString(), 135, 95, false);
    myplayerMoneyLabel = new objects.Label("$" + playerMoney.toString(), 20, 298, false);
    stage.addChild(myjackpotLabel);
    stage.addChild(myplayerMoneyLabel);
    // $("#playerMoney").text("Player Money: " + playerMoney);
    // $("#playerTurn").text("Turn: " + turn);
    //  $("#playerWins").text("Wins: " + winNumber);
    //   $("#playerLosses").text("Losses: " + lossNumber);
    //   $("#playerWinRatio").text("Win Ratio: " + (winRatio * 100).toFixed(2) + "%");
}
/* Utility function to reset all fruit tallies */
function resetFruitTally() {
    grapes = 0;
    //bananas = 0;
    diamonds = 0;
    sevens = 0;
    cherries = 0;
    shells = 0;
    grapes = 0;
    cherries = 0;
    blanks = 0;
}
/* Utility function to reset the player stats */
function resetAll() {
    playerMoney = 1000;
    winnings = 0;
    jackpot = 5000;
    turn = 0;
    playerBet = 0;
    winNumber = 0;
    lossNumber = 0;
    winRatio = 0;
}
// Our Main Game Function
function main() {
    createUI();
}
function createUI() {
    // add in slotmaachine grapics
    background = new createjs.Bitmap(assets.getResult("background"));
    stage.addChild(background);
    for (var index = 0; index < NUM_REELS; index++) {
        reelContainers[index] = new createjs.Container();
        stage.addChild(reelContainers[index]);
    }
    reelContainers[0].x = 52;
    reelContainers[0].y = 175;
    reelContainers[1].x = 129;
    reelContainers[1].y = 175;
    reelContainers[2].x = 204;
    reelContainers[2].y = 175;
    // add spin button
    mySpinButton = new objects.Button("spinButton", 255, 330, false);
    stage.addChild(mySpinButton);
    mySpinButton.on("click", spinButtonClicked, this);
    MyResetButton = new objects.Button("resetButton", 10, 330, false);
    stage.addChild(MyResetButton);
    MyResetButton.on("click", resetButtonClicked, this);
    myBetOneButton = new objects.Button("betOneButton", 71, 330, false);
    stage.addChild(myBetOneButton);
    myBetOneButton.on("click", betOneButtonClicked, this);
    myBetMaxButton = new objects.Button("betMaxButton", 133, 330, false);
    stage.addChild(myBetMaxButton);
    myBetMaxButton.on("click", betMaxButtonClicked, this);
    myBetTenButton = new objects.Button("betTenButton", 194, 330, false);
    stage.addChild(myBetTenButton);
    myBetTenButton.on("click", betTenButtonClicked, this);
}
//# sourceMappingURL=game.js.map