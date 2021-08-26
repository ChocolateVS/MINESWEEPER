/***************************Main Menu***************************/
generateMenu();
connect();

function generateMenu() {
    //Buttons
    newElement("buttons_div", "buttons_div", "div", "", [], id("menu"), true);
    newElement("saveBtn", "resetBtn", "button", "**SAVE**", [["onclick", "save()"]], id("buttons_div"), true);
    newElement("resetBtn", "resetBtn", "button", "NEW GAME (N)", [["onclick", "reset(0)"]], id("buttons_div"), true);
    newElement("restartBtn", "resetBtn", "button", "PLAY AGAIN (R)", [["onclick", "reset(1)"]], id("buttons_div"), true);
    newElement("closeBtn", "resetBtn", "button", "CLOSE MENU", [["onclick", "menu(1)"]], id("buttons_div"), true);
}

function newElement(id, classname, type, text, att, appendTo, append) {
    let element = document.createElement(type);
    if (att.length > 0) att.forEach((e) => { element.setAttribute(e[0], e[1]) } );
    if (type == "h1" || type == "h2") element.innerHTML = text;
    if (classname == "resetBtn") element.textContent = text;
    element.id = id;
    element.className = classname;
    if (append) appendTo.appendChild(element); 
    else return element;
}

function save() {
    width = id("widthSlider").value;
    height = id("heightSlider").value;
    size = width * height;
    temp_height = height;
    temp_width = width;
    mines = id("minesSlider").value;
    estDiff(1);
    get_new_game();
}

function estDiff(t) {
    let p = Math.round(id("minesSlider").value / ((id("widthSlider").value * id("heightSlider").value)) * 100);;
    let d;

    if (p <= 5) d = 0;
    else if (p <= 10) d = 1;
    else if (p <= 15) d = 2;
    else if (p <= 20) d = 3;
    else if (p <= 25) d = 4;
    else if (p <= 30) d = 5;
    else if (p <= 40) d = 6;
    else if (p <= 50) d = 7;
    else if (p <= 80) d = 8;
    else d = 9;

    if (t == 1) {
        minePer = p;
        mineDiff = diff[d];
    }
    id("percentage").textContent = "MINES: ~ " + p + " %";
    id("difficulty").textContent = "DIFFICULTY: " + diff[d];

}
function menu(i) {
    if (i == 1) {
        id("menu").style.visibility = "hidden";
        return;
    }
    id("menu").style.visibility = "visible";
    id("mineCount").textContent = mines;
    id("widthCount").textContent = width;
    id("heightCount").textContent = height;
    id("minesSlider").value = mines;
    id("widthSlider").value = width;
    id("heightSlider").value = height;
    id("percentage").textContent = "MINES: ~ " + minePer  + " %";
    id("difficulty").textContent = "DIFFICULTY: " + mineDiff;
}

id("minesSlider").addEventListener("input", function() {
    id("mineCount").textContent = id("minesSlider").value;
    estDiff();
}, false);

id("widthSlider").addEventListener("input", function() {
    id("widthCount").textContent = id("widthSlider").value;
    temp_width = id("widthSlider").value;
    id("minesSlider").setAttribute("max", (temp_width * temp_height) - 1 );
    id("mineCount").textContent = id("minesSlider").value;
    estDiff();
}, false);

id("heightSlider").addEventListener("input", function() {
    id("heightCount").textContent = id("heightSlider").value;
    temp_height = id("heightSlider").value;
    id("minesSlider").setAttribute("max", (temp_width * temp_height) - 1);
    id("mineCount").textContent = id("minesSlider").value;
    estDiff();
}, false);

function host_menu(i) {
    if (i == 0) visible("host_menu");
    else if (i == 1) hidden("host_menu");
}

function join_menu(i) {
    if (i == 0) visible("join_menu");
    else if (i == 1) hidden("join_menu");
}
