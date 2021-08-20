//SOUNDS
let explosionSound = new Audio("sounds/explosion.mp3"); // buffers automatically when created
let clickSound = new Audio("sounds/click.wav");
let clearSound = new Audio("sounds/clear.wav");
let flagOnSound = new Audio("sounds/flag.wav");
let flagOffSound = new Audio("sounds/unflag.wav");
let winSound = new Audio("sounds/gameWin.wav");
let middleClick = new Audio("sounds/middleClick.wav");
let middleUnClick = new Audio("sounds/middleClickOff.wav");

//Id Function Returns element of given id
function id(id) { return document.getElementById(id)}

//Game Canvas Basically
let body = id("gameBody");

//Screen Width
let screen_width;
let screen_height;

//Game Area Width
var width;
var height;
var border_width;
var cell_width;

//General game variables
var size;
var mines;
var minesArray = [];
let score;

//Stores recursive empty cells shown
var blankShown = [];

//States for each button
var btnState = [];

//Game initial state
var game_state = 0;

//Number of shown cells
let shownCount = 0;

//Temp for when in un-saved menu
let temp_width;
let temp_height;

//Mine Percentage
let minePer = Math.round(id("minesSlider").value / ((id("widthSlider").value * id("heightSlider").value)) * 100);

//Difficulty
let mineDiff = "EEEKKKK";

//Difficulties
let diff = ["ONE CLICK...", "EEEEEZZZZ", "OK", "OK OK", "EEEEKKK", "BIG EEEEEK", "GENIUS", "r/MILDY INFURIATING", "IMPOSSIBLE", "GIVE. UP."];

//Number Colors
var colors = ["blue", "green", "red", "purple", "black", "gray", "maroon", "turquoise"];

//Darkened on middle click
let darkened = [];

//Timer Initialize
let paused = true;
let timer = new Stopwatch();
let timer_elem = timer.get();