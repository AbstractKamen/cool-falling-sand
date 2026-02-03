const DEFAULT_CANVAS_WIDTH = window.innerWidth;
const DEFAULT_CANVAS_HEIGHT = window.innerHeight;

var cellSize = 2;
var brushSize = 4;
var density = 4;

var RED;
var WHITE;
var PURPLE;
var colorPicker;

const cells = [];
var placeTakenGrid;
var mousePressedOnTaken = false;
var cellMousePressedOnType;

class Cell {
    constructor(x, y, color, index, cellType) {
        this.index = index;
        this.x = x;
        this.y = y;
        this.canMove = cellType === SAND_CELL;
        this.cellType = cellType;

        this.color = color;
        let a = alpha(color);
        this.minAlpha = Math.floor(random(a >> 1, a))
    }
}

var cellTypeSelect;
const PLATFORM_CELL = '1';
const SAND_CELL = '0';

var paintTypeSelect;
const PAINT_BRUSH = '11';
const PAINT_SPRAY = '00';

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
        let newSize = Math.max(cellSize >> 1, 2);
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
    });
    decreaseBrush.mousePressed(() => {
        brushSize = Math.max(brushSize >> 1, 1)
    });
    let brushSizeColWidth = Math.max(increaseBrush.width, decreaseBrush.width);
    // brush density
    let increaseBrushDensity = createButton('Increase Brush Density');
    let decreaseBrushDensity = createButton('Decrease Brush Density');
    increaseBrushDensity.position(colorPicker.width + 5 + cellSizeColWidth + brushSizeColWidth, DEFAULT_CANVAS_HEIGHT);
    decreaseBrushDensity.position(colorPicker.width + 5 + cellSizeColWidth + brushSizeColWidth, DEFAULT_CANVAS_HEIGHT + increaseBrushDensity.height);
    increaseBrushDensity.mousePressed(() => {
        density = Math.min(density << 1, brushSize);
    });
    decreaseBrushDensity.mousePressed(() => {
        density = Math.max(density >> 1, 1)
    });
    // select cell type
    cellTypeSelect = createSelect();
    cellTypeSelect.option('Paint Sand Cell', SAND_CELL);
    cellTypeSelect.option('Paint Platform Cell', PLATFORM_CELL);
    cellTypeSelect.selected(SAND_CELL);
    cellTypeSelect.position(0, DEFAULT_CANVAS_HEIGHT + increaseBrushDensity.height * 2);
    // select paint type
    paintTypeSelect = createSelect();
    paintTypeSelect.option('Paint Brush', PAINT_BRUSH);
    paintTypeSelect.option('Paint Spray', PAINT_SPRAY);
    paintTypeSelect.selected(PAINT_BRUSH);
    paintTypeSelect.position(0 + increaseBrushDensity.width, DEFAULT_CANVAS_HEIGHT + increaseBrushDensity.height * 2);

}

function draw() {
    ifMouseIsPressed();

    updateCells();
    updateCells();
    background('#181818FF');
    noStroke();
    for (const cell of cells) {
        fill(cell.color);
        rect(cell.x * cellSize, cell.y * cellSize, cellSize, cellSize);
    }
    // debugGrid();
}

function touchStarted(e) {
    e.preventDefault()
}

function touchMoved(e) {
    e.preventDefault()
}

function touchEnde(e) {
    e.preventDefault()
}

function mousePressed() {
    let x = Math.floor(mouseX / cellSize);
    let y = Math.floor(mouseY / cellSize);
    if (0 <= y && y < placeTakenGrid.length && 0 <= x && x < placeTakenGrid[0].length) {
        let index = placeTakenGrid[y][x];
        if (index > 0) {
            mousePressedOnTaken = true;
            cellMousePressedOnType = cells[index].cellType;
        }
    }
}

function mouseReleased() {
    mousePressedOnTaken = false;
    cellMousePressedOnType = undefined;
}

function ifMouseIsPressed() {
    if (mouseIsPressed === true) {
        let x = Math.floor(mouseX / cellSize);
        let y = Math.floor(mouseY / cellSize);
        if (0 <= y && y < placeTakenGrid.length && 0 <= x && x < placeTakenGrid[0].length) {
            paintCells(x, y, density, brushSize >> 1);
        }
    }
}

function paintCells(centerX, centerY, times, area) {
    if (paintTypeSelect.selected() === PAINT_SPRAY) {
        if (mousePressedOnTaken === true) {
            removeCellsSpray(centerX, centerY, times, area);
        } else {
            addCellsSpray(centerX, centerY, times, area);
        }
    } else if (paintTypeSelect.selected() === PAINT_BRUSH) {
        if (mousePressedOnTaken === true) {
            cellsBrush(centerX, centerY, times, area, brushRemoveStep, brushPostIterRemoveCells);
        } else {
            cellsBrush(centerX, centerY, times, area, doCellAdd);
        }
    }
}

function cellsBrush(centerX, centerY, times, brushDiameter, funcOnStep, postStepIter = () => {
}) {
    let r = Math.max(1, brushDiameter >> 1);
    if (r === 1) {
        funcOnStep(centerY, centerX);
    } else if (r === 2) {
        funcOnStep(centerY, centerX);
        if (centerY + 1 < placeTakenGrid.length && centerX + 1 < placeTakenGrid[centerY + 1].length) {
            funcOnStep(centerY + 1, centerX + 1);
        }
    } else {
        let r_2 = r * r;

        for (let i = -r; i < r; i++) {
            for (let j = -r; j < r; j++) {
                let dX = centerX + j;
                let dY = centerY + i;
                if (0 <= dX && 0 <= dY
                    && dY < placeTakenGrid.length
                    && dX < placeTakenGrid[dY].length
                    // pythagoras og
                    && i * i + j * j <= r_2) {
                    funcOnStep(dY, dX);
                }
            }
        }
    }
    postStepIter();
}

function addCellsSpray(centerX, centerY, times, sprayAreaFactor) {
    for (let i = 0; i < times; i++) {
        let y = centerY;
        let x = centerX;
        if (sprayAreaFactor > 1) {
            y = Math.floor(random(Math.max(0, centerY - sprayAreaFactor), Math.min(centerY + sprayAreaFactor, placeTakenGrid.length - 1)));
            x = Math.floor(random(Math.max(0, centerX - sprayAreaFactor), Math.min(centerX + sprayAreaFactor, placeTakenGrid[0].length - 1)));
        }

        let index = placeTakenGrid[y][x];
        if (index < 0) {
            doCellAdd(y, x);
        }
    }
}

function doCellAdd(dY, dX) {
    let index = placeTakenGrid[dY][dX];
    if (index < 0) {
        let cellType = cellTypeSelect.selected();
        let color = colorPicker.color();
        let newCell = new Cell(dX, dY, color, cells.length, cellType);
        cells.push(newCell)
        takeSpot(newCell);
    }
}

function brushRemoveStep(y, x) {
    let index = placeTakenGrid[y][x];
    if (index >= 0 && cellMousePressedOnType === cells[index].cellType) {
        toRemove.push(index);
    }
}

function brushPostIterRemoveCells() {
    while (!toRemove.isEmpty()) {
        let i = toRemove.pop();
        removeCell(i);
    }
}

const descendingComparator = (a, b) => a - b;
const toRemove = new BinaryHeap(descendingComparator);
const duplicates = new Set();

function removeCellsSpray(centerX, centerY, times, sprayAreaFactor) {
    for (let i = 0; i < times; i++) {
        let y = Math.round(random(Math.max(0, centerY - sprayAreaFactor), Math.min(centerY + sprayAreaFactor, placeTakenGrid.length - 1)));
        let x = Math.round(random(Math.max(0, centerX - sprayAreaFactor), Math.min(centerX + sprayAreaFactor, placeTakenGrid[0].length - 1)))
        let index = placeTakenGrid[y][x];
        if (index >= 0 && !duplicates.has(index) && cellMousePressedOnType === cells[index].cellType) {
            duplicates.add(index);
            toRemove.push(index);
        } else {
            let shrinkingFactor = sprayAreaFactor >> 1;
            for (let attempt = 0; attempt < 5; attempt++) {
                y = Math.round(random(Math.max(0, centerY - shrinkingFactor), Math.min(centerY + shrinkingFactor, placeTakenGrid.length - 1)));
                x = Math.round(random(Math.max(0, centerX - shrinkingFactor), Math.min(centerX + shrinkingFactor, placeTakenGrid[0].length - 1)))
                index = placeTakenGrid[y][x];
                if (index >= 0 && !duplicates.has(index) && cellMousePressedOnType === cells[index].cellType) {
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

function updateNeighboursCanMove(cell) {
    if (0 <= cell.y - 1) {
        let topNeighbourIndex = placeTakenGrid[cell.y - 1][cell.x];
        if (topNeighbourIndex > -1) {
            let topNeighbour = cells[topNeighbourIndex];
            if (topNeighbour.cellType === SAND_CELL) topNeighbour.canMove = true;
        }
        if (0 <= cell.x - 1) {
            let topLeftNeighbourIndex = placeTakenGrid[cell.y - 1][cell.x - 1];
            if (topLeftNeighbourIndex > -1) {
                let topLeftNeighbour = cells[topLeftNeighbourIndex];
                if (topLeftNeighbour.cellType === SAND_CELL) topLeftNeighbour.canMove = true;
            }
        }
        if (cell.x + 1 < placeTakenGrid[cell.y - 1].length) {
            let topRightNeighbourIndex = placeTakenGrid[cell.y - 1][cell.x + 1];
            if (topRightNeighbourIndex > -1) {
                let topRightNeighbour = cells[topRightNeighbourIndex];
                if (topRightNeighbour.cellType === SAND_CELL) topRightNeighbour.canMove = true;
            }
        }
    }
}

function removeCell(index) {
    let toSwap = cells[cells.length - 1];
    cells[cells.length - 1] = cells[index];
    cells[index] = toSwap;
    cells[index].index = index;
    takeSpot(toSwap);
    let removed = cells.pop();
    releaseSpot(removed);
    updateNeighboursCanMove(removed);
}

function updateCell(cell) {
    if (!cell.canMove) return;
    if (placeTakenGrid.length <= cell.y + 1) {
        cell.canMove = false;
        return;
    }
    if (updateDown(cell)) return;
    if (deltaTime % 2 > 0) {
        if (updateDownLeft(cell)) return;
        if (updateDownRight(cell)) return;
    } else {
        if (updateDownRight(cell)) return;
        if (updateDownLeft(cell)) return
    }
    // if we reach here it means we are stuck and there is a cell bellow
    let bottomCellIndex = placeTakenGrid[cell.y + 1][cell.x];
    let bottomCell = cells[bottomCellIndex];
    if (!bottomCell.canMove) {
        cell.canMove = false;
    }
    bottomCell.color.setAlpha(Math.max(alpha(bottomCell.color) - 8, cell.minAlpha));

    if (0 <= cell.x - 1) {
        let bottomLeftCellIndex = placeTakenGrid[cell.y + 1][cell.x - 1];
        let bottomLeftCell = cells[bottomLeftCellIndex];
        if (!bottomLeftCell.canMove) {
            cell.canMove = false;
        }
        bottomLeftCell.color.setAlpha(Math.max(alpha(bottomLeftCell.color) - 8, cell.minAlpha));
    }
    if (cell.x + 1 < placeTakenGrid[cell.y + 1].length) {
        let bottomRightCellIndex = placeTakenGrid[cell.y + 1][cell.x + 1];
        let bottomRightCell = cells[bottomRightCellIndex];
        if (!bottomRightCell.canMove) {
            cell.canMove = false;
        }
        bottomRightCell.color.setAlpha(Math.max(alpha(bottomRightCell.color) - 8, cell.minAlpha));
    }


    function updateDown(cell) {
        if (!downSpotIsTaken(cell)) {
            updateNeighboursCanMove(cell);
            releaseSpot(cell);
            cell.y += 1;
            takeSpot(cell);
            return true;
        }
        return false;
    }

    function updateDownLeft(cell) {
        if (0 <= cell.x - 1 && !downLeftSpotIsTaken(cell)) {
            updateNeighboursCanMove(cell);
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
            updateNeighboursCanMove(cell);
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