const DEFAULT_CANVAS_WIDTH = window.innerWidth;
const DEFAULT_CANVAS_HEIGHT = window.innerHeight;

var cellSize = 4;
var brushSize = 16;
var density = 16;

var RED;
var WHITE;
var PURPLE;
var colorPicker;

const cells = [];
var placeTakenGrid;
var mousePressedOnTaken = false;

class Cell {
    constructor(x, y, color, index) {
        this.index = index;
        this.x = x;
        this.y = y;
        this.color = color;
    }
}

function setup() {
    RED = color('red');
    WHITE = color('white');
    PURPLE = color('purple');
    colorPicker = createColorPicker(RED);
    colorPicker.position(0, DEFAULT_CANVAS_HEIGHT);
    placeTakenGrid = makeGrid(Math.floor(DEFAULT_CANVAS_WIDTH / cellSize), Math.floor(DEFAULT_CANVAS_HEIGHT / cellSize));
    createCanvas(DEFAULT_CANVAS_WIDTH, DEFAULT_CANVAS_HEIGHT);
    frameRate(60);
    // cell size
    let increaseCellSize = createButton('Increase Cell Size');
    let decreaseCellSize = createButton('Decrease Cell Size');
    increaseCellSize.position(colorPicker.width + 5, DEFAULT_CANVAS_HEIGHT);
    decreaseCellSize.position(colorPicker.width + 5, DEFAULT_CANVAS_HEIGHT + increaseCellSize.height);
    increaseCellSize.mousePressed(() => {
        let newSize = Math.min(cellSize << 1, 64);
        cells.length = 0;
        cellSize = newSize;
        placeTakenGrid = makeGrid(Math.floor(DEFAULT_CANVAS_WIDTH / cellSize), Math.floor(DEFAULT_CANVAS_HEIGHT / cellSize));
    });
    decreaseCellSize.mousePressed(() => {
        let newSize = Math.max(cellSize >> 1, 4);
        cells.length = 0;
        cellSize = newSize;
        placeTakenGrid = makeGrid(Math.floor(DEFAULT_CANVAS_WIDTH / cellSize), Math.floor(DEFAULT_CANVAS_HEIGHT / cellSize));
    });
    let cellSizeColWidth = Math.max(increaseCellSize.width, decreaseCellSize.width);
    // brush size
    let increaseBrush = createButton('Increase Brush Size');
    let decreaseBrush = createButton('Decrease Brush Size');
    increaseBrush.position(colorPicker.width + 5 + cellSizeColWidth, DEFAULT_CANVAS_HEIGHT);
    decreaseBrush.position(colorPicker.width + 5 + cellSizeColWidth, DEFAULT_CANVAS_HEIGHT + increaseBrush.height);
    increaseBrush.mousePressed(() => {
        brushSize = Math.min(brushSize << 1, 64)
    })
    decreaseBrush.mousePressed(() => {
        brushSize = Math.max(brushSize >> 1, 1)
    })
    let brushSizeColWidth = Math.max(increaseBrush.width, decreaseBrush.width);
    // brush density
    let increaseBrushDensity = createButton('Increase Brush Density');
    let decreaseBrushDensity = createButton('Decrease Brush Density');
    increaseBrushDensity.position(colorPicker.width + 5 + cellSizeColWidth + brushSizeColWidth, DEFAULT_CANVAS_HEIGHT);
    decreaseBrushDensity.position(colorPicker.width + 5 + cellSizeColWidth + brushSizeColWidth, DEFAULT_CANVAS_HEIGHT + increaseBrushDensity.height);
    increaseBrushDensity.mousePressed(() => {
        density = Math.min(density << 1, brushSize);
    })
    decreaseBrushDensity.mousePressed(() => {
        density = Math.max(density >> 1, 1)
    })
}

function draw() {
    ifMouseIsPressed();
    updateCells();
    background('#181818FF');
    noStroke();
    for (const cell of cells) {
        fill(cell.color);
        rect(cell.x * cellSize, cell.y * cellSize, cellSize, cellSize);
    }
    // debugGrid();
}

function mousePressed() {
    let x = Math.floor(mouseX / cellSize);
    let y = Math.floor(mouseY / cellSize);
    if (0 <= y && y < placeTakenGrid.length && 0 <= x && x < placeTakenGrid[0].length) {
        let index = placeTakenGrid[y][x];
        if (index > 0) {
            mousePressedOnTaken = true;
        }
    }
}

function mouseReleased() {
    mousePressedOnTaken = false;
}

function ifMouseIsPressed() {
    if (mouseIsPressed === true) {
        let x = Math.floor(mouseX / cellSize);
        let y = Math.floor(mouseY / cellSize);
        if (0 <= y && y < placeTakenGrid.length && 0 <= x && x < placeTakenGrid[0].length) {
            spray(x, y, density, brushSize);
        }
    }
}

function spray(centerX, centerY, times, sprayAreaFactor) {
    if (mousePressedOnTaken === true) {
        removeCells(times, centerY, sprayAreaFactor, centerX);
    } else {
        addCells(times, centerY, sprayAreaFactor, centerX);
    }
}

function addCells(times, centerY, sprayAreaFactor, centerX) {
    for (let i = 0; i < times; i++) {
        let y = Math.floor(random(Math.max(0, centerY - sprayAreaFactor), Math.min(centerY + sprayAreaFactor, placeTakenGrid.length - 1)));
        let x = Math.floor(random(Math.max(0, centerX - sprayAreaFactor), Math.min(centerX + sprayAreaFactor, placeTakenGrid[0].length - 1)))
        let index = placeTakenGrid[y][x];
        if (index < 0) {
            let newCell = new Cell(x, y, colorPicker.color(), cells.length);
            cells.push(newCell)
            takeSpot(newCell);
        }
    }
}

const descendingComparator = (a, b) => a - b;
const toRemove = new BinaryHeap(descendingComparator);
const duplicates = new Set();

function removeCells(times, centerY, sprayAreaFactor, centerX) {
    for (let i = 0; i < times; i++) {
        let y = Math.round(random(Math.max(0, centerY - sprayAreaFactor), Math.min(centerY + sprayAreaFactor, placeTakenGrid.length - 1)));
        let x = Math.round(random(Math.max(0, centerX - sprayAreaFactor), Math.min(centerX + sprayAreaFactor, placeTakenGrid[0].length - 1)))
        let index = placeTakenGrid[y][x];
        if (index >= 0 && !duplicates.has(index)) {
            duplicates.add(index);
            toRemove.push(index);
        } else {
            let shrinkingFactor = sprayAreaFactor >> 1;
            for (let attempt = 0; attempt < 5; attempt++) {
                y = Math.round(random(Math.max(0, centerY - shrinkingFactor), Math.min(centerY + shrinkingFactor, placeTakenGrid.length - 1)));
                x = Math.round(random(Math.max(0, centerX - shrinkingFactor), Math.min(centerX + shrinkingFactor, placeTakenGrid[0].length - 1)))
                index = placeTakenGrid[y][x];
                if (index >= 0 && !duplicates.has(index)) {
                    duplicates.add(index);
                    toRemove.push(index);
                    break;
                }
                shrinkingFactor = shrinkingFactor >> 1;
            }
        }
    }
    duplicates.clear();
    while (!toRemove.isEmpty()) {
        let i = toRemove.pop();
        removeCell(i);
    }
}

// cool shite
//     [a, b, c]
//     [0, 1, 2]
//     [0, 2, 1]
//     [0, 2]
//
//     [-1,  0, -1 ]
//     [ 1,  1,  2 ]
//     [-1, -1, -1 ]
//
//     [-1,  0, -1 ]
//     [ 1, -1,  1 ]
//     [-1, -1, -1 ]

function removeCell(index) {
    let toSwap = cells[cells.length - 1];
    cells[cells.length - 1] = cells[index];
    cells[index] = toSwap;
    cells[index].index = index;
    takeSpot(toSwap);
    releaseSpot(cells.pop());
}

function updateCell(cell) {
    if (placeTakenGrid.length <= cell.y + 1) return;
    if (updateDown(cell)) return;
    if (deltaTime % 2 > 0) {
        if (updateDownLeft(cell)) return;
        updateDownRight(cell);
    } else {
        if (updateDownRight(cell)) return;
        updateDownLeft(cell);
    }

    function updateDown(cell) {
        if (!downSpotIsTaken(cell)) {
            releaseSpot(cell);
            cell.y += 1;
            takeSpot(cell);
            return true;
        }
        return false;
    }

    function updateDownLeft(cell) {
        if (0 <= cell.x - 1 && !downLeftSpotIsTaken(cell)) {
            releaseSpot(cell);
            cell.y += 1;
            cell.x -= 1;
            takeSpot(cell);
            return true;
        }
        return false;
    }

    function updateDownRight(cell) {
        if (cell.x + 1 < placeTakenGrid[cell.y].length && !downRightSpotIsTaken(cell)) {
            releaseSpot(cell);
            cell.y += 1;
            cell.x += 1;
            takeSpot(cell);
            return true;
        }
        return false;
    }
}

function takeSpot(cell) {
    placeTakenGrid[cell.y][cell.x] = cell.index;
}

function releaseSpot(cell) {
    placeTakenGrid[cell.y][cell.x] = -1;
}

function updateCells() {
    for (const cell of cells) {
        updateCell(cell);
    }
}

function makeGrid(width, height) {
    const res = new Array(height);
    for (let y = 0; y < height; y++) {
        res[y] = new Array(width);
        for (let x = 0; x < width; x++) {
            res[y][x] = -1;
        }
    }
    return res;
}


function downRightSpotIsTaken(cell) {
    return placeTakenGrid[cell.y + 1][cell.x + 1] >= 0;
}

function downLeftSpotIsTaken(cell) {
    return placeTakenGrid[cell.y + 1][cell.x - 1] >= 0;
}

function downSpotIsTaken(cell) {
    return placeTakenGrid[cell.y + 1][cell.x] >= 0;
}

function debugGrid() {
    push();
    stroke(WHITE);
    fill(WHITE);
    strokeWeight(0.2);
    textSize(10);
    for (let i = 0; i < placeTakenGrid[0].length; i++) {
        line(i * cellSize, 0, i * cellSize, placeTakenGrid.length * cellSize);
        text(i, i * cellSize, (placeTakenGrid.length * cellSize) - 15);
    }
    for (let i = 0; i < placeTakenGrid.length; i++) {
        line(0, i * cellSize, placeTakenGrid[0].length * cellSize, i * cellSize);
        text(i, 0, (i * cellSize) - 15);
    }
    pop();
}