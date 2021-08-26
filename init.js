//WEBSOCKET
let client_id;
let game_id;

let time_synced = true;

let loaded = false;

let sounds = {
    explosion_sound: new Audio("sounds/explosion.mp3"),
    click_sound: new Audio("sounds/click.wav"),
    clear_sound: new Audio("sounds/clear.wav"),
    flag_on_sound: new Audio("sounds/flag.wav"),
    flag_off_sound: new Audio("sounds/unflag.wav"),
    win_sound: new Audio("sounds/gameWin.wav"),
    middle_click: new Audio("sounds/middleClick.wav"),
    middle_un_click: new Audio("sounds/middleClickOff.wav")
}

let images = {
    blank: "images/bg.png",
    red_flag: "images/flag_red.png",
    wrong_flag: "images/flag_wrong.png",
    mine: "images/mine.png",
    green_mine: "images/mine_green.png",
    red_mine: "images/red_mine.png",
    question: "images/question.png"
}
//Id Function Returns element of given id
function id(id) { return document.getElementById(id)}

//Place where cells are put!
let grid = id("grid");

//Screen Width
let screen_width;
let screen_height;

//Game Area Width
var width = id("widthSlider").value;
var height = id("heightSlider").value;;
let size = width * height;

//General game variables
var mines = id("minesSlider").value;;
var minesArray = [];
let score;

//Stores recursive empty cells shown
var blankShown = [];
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
id("details").appendChild(timer_elem);