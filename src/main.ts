import "./style.css";

// Import useful functions
import { createButton, createHeading } from "./utils.ts";

const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");
const popup = document.createElement("div");
popup.style.position = "absolute";
popup.style.backgroundColor = "white";
popup.style.border = "1px solid black";
popup.style.padding = "10px";
popup.style.display = "none";
document.body.append(popup);

const headerDiv = document.querySelector<HTMLDivElement>("#header")!;
const shopDiv = document.querySelector<HTMLDivElement>("#shop")!;
const objectivesDiv = document.querySelector<HTMLDivElement>("#objectives")!;

// Modifiable gameplay values
const STARTING_MONEY = 15;
const BASE_FISH_COST = 15;
const REPRODUCTION_CHANCE = 0.2;
const SUNLIGHT_CHANGE_CHANCE = 0.4;
const FISH_MAX_FOOD = 3;
const FISH_MAX_GROWTH = 10;
const CELL_FISH_CAPACITY = 5; // The threshold at which fish can no longer reach max size
const CAPACITY_PENALTY = 2; // The amount by which max growth decreases for each fish above capacity
const CELL_MAX_FOOD = 10;
const CELL_MAX_SUNLIGHT = 10;

// Game title heading
createHeading({
  text: "Fish Farm",
  div: headerDiv,
  size: "h1",
});

createHeading({
  text: "Shop",
  div: shopDiv,
  size: "h2",
});

createHeading({ text: "Objectives", div: objectivesDiv, size: "h2" });

let day = 0;
const dayDisplay = createHeading({
  text: `Day ${day}`,
  div: headerDiv,
  size: "h3",
});
dayDisplay.style.display = "inline";
dayDisplay.style.marginRight = "20px";

createButton({
  text: "Next Day",
  div: headerDiv,
  onClick: () => {
    nextDay();
  },
});

let money = STARTING_MONEY;

const moneyDisplay = createHeading({
  text: `💵 ${money}`,
  div: headerDiv,
  size: "h2",
});
moneyDisplay.style.display = "inline";

function changeMoney(change: number) {
  money += change;
  moneyDisplay.innerHTML = `💵 ${money}`;
}

const playerCoordinates = { col: 0, row: 0 };

interface Cell {
  x: number;
  y: number;
  sunlight: number;
  food: number;
  population: Fish[];
}

type FishTypeName = "Green" | "Yellow" | "Red";

interface FishType {
  typeName: FishTypeName;
  cost: number;
  growthMultiplier: number;
  minValueGain: number;
  maxValueGain: number;
}

interface Fish {
  type: FishType;
  growth: number;
  food: number;
  value: number;
}

const fishTypes: FishType[] = [
  {
    typeName: "Green",
    cost: BASE_FISH_COST,
    growthMultiplier: 1,
    minValueGain: 1,
    maxValueGain: 3,
  },
  {
    typeName: "Yellow",
    cost: BASE_FISH_COST * 2,
    growthMultiplier: .75,
    minValueGain: 2,
    maxValueGain: 4,
  },
  {
    typeName: "Red",
    cost: BASE_FISH_COST * 3,
    growthMultiplier: .5,
    minValueGain: 3,
    maxValueGain: 5,
  },
];

const rows = 4;
const cols = 5;
const cellSize = 150; // Size of each grid cell
const gridOffset = 10;
canvas.width = cols * cellSize + gridOffset; // Set canvas width based on grid
canvas.height = rows * cellSize + gridOffset; // Set canvas height based on grid

const grid: Cell[][] = Array.from(
  { length: rows },
  (_, rowIndex) =>
    Array.from({ length: cols }, (_, colIndex) => ({
      x: colIndex * cellSize + gridOffset / 2,
      y: rowIndex * cellSize + gridOffset / 2,
      sunlight: Math.floor(Math.random() * CELL_MAX_SUNLIGHT) + 1,
      food: Math.floor(Math.random() * CELL_MAX_FOOD) + 1,
      population: [],
    })),
);

function drawCell(ctx: CanvasRenderingContext2D, cell: Cell) {
  if (ctx) {
    ctx.lineWidth = 4;
    ctx.strokeStyle = "lightblue";
    ctx.fillStyle = "lightcyan";
    ctx.strokeRect(cell.x, cell.y, cellSize, cellSize);
    ctx.fillRect(cell.x, cell.y, cellSize, cellSize);
    ctx.font = "20px arial";
    ctx.lineWidth = 1;
    ctx.strokeStyle = "orange";
    ctx.strokeText(`☀️ ${cell.sunlight}`, cell.x + 10, cell.y + 30);
    ctx.strokeStyle = "red";
    ctx.strokeText(`🍎 ${cell.food}`, cell.x + 10, cell.y + 50);
    ctx.strokeStyle = "blue";
    ctx.strokeText(`🐟 ${cell.population.length}`, cell.x + 10, cell.y + 70);
  }
}

function drawGrid(ctx: CanvasRenderingContext2D) {
  grid.forEach((row) => row.forEach((cell) => drawCell(ctx, cell)));
}

function drawPlayer(ctx: CanvasRenderingContext2D) {
  const cellX = playerCoordinates.col * cellSize + gridOffset / 2;
  const cellY = playerCoordinates.row * cellSize + gridOffset / 2;
  ctx.strokeStyle = "limegreen";
  ctx.lineWidth = 8;
  ctx.strokeRect(cellX, cellY, cellSize, cellSize);
}

function fishToString(fish: Fish) {
  return `\n${fish.type.typeName} Fish | Growth: ${fish.growth}/${FISH_MAX_GROWTH}, Food: ${fish.food}/${FISH_MAX_FOOD}, Value: ${fish.value}`;
}

function updateCellInfo(cell: Cell) {
  const cellInfoDiv = document.getElementById("cell-info");
  if (cellInfoDiv) {
    cellInfoDiv.innerText =
      `Cell (${playerCoordinates.row}, ${playerCoordinates.col})
    ☀️ Sunlight: ${cell.sunlight}
    🍎 Food: ${cell.food}
    🐟 Fish: ${cell.population.length}`;
    if (cell.population.length > 0) {
      cell.population.forEach((fish) => {
        cellInfoDiv.innerText += fishToString(fish);
      });
    }
  }
}

function addFish(cell: Cell, type: FishType, num: number) {
  for (let i = 0; i < num; i++) {
    const fish = {
      type: type,
      growth: 0,
      food: 0, // Start with empty food
      value: Math.floor(type.cost / 2), // Value starts at half of what you bought it for
    };
    cell.population.push(fish);
  }
}

// Create shop
fishTypes.forEach((fishType) => {
  const costDisplay = createHeading({
    text: `💵 ${fishType.cost}`,
    div: shopDiv,
    size: "h5",
  });
  createButton({
    text: `Buy ${fishType.typeName} Fish`,
    div: shopDiv,
    onClick: () => {
      if (money >= fishType.cost) {
        changeMoney(-fishType.cost);
        const currentCell = grid[playerCoordinates.row][playerCoordinates.col];
        addFish(currentCell, fishType, 1);
        updateCellInfo(currentCell);
      }
    },
  }).append(costDisplay);
});

function playerMovement(event: KeyboardEvent) {
  let newRow = playerCoordinates.row;
  let newCol = playerCoordinates.col;

  switch (event.key) {
    case "ArrowRight":
    case "d":
    case "D":
      newCol += 1;
      break;
    case "ArrowLeft":
    case "a":
    case "A":
      newCol -= 1;
      break;
    case "ArrowUp":
    case "w":
    case "W":
      newRow -= 1;
      break;
    case "ArrowDown":
    case "s":
    case "S":
      newRow += 1;
      break;
  }

  if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
    playerCoordinates.row = newRow;
    playerCoordinates.col = newCol;
  }
  const currentCell = grid[newRow][newCol];
  updateCellInfo(currentCell);
  popup.style.display = "none"; // Remove popup when player moves
}
document.addEventListener("keydown", playerMovement);

function updateSunlight() {
  grid.forEach((row) => {
    row.forEach((cell) => {
      // Randomly decide to increase or decrease sunlight, or keep it the same
      const randChange = Math.random() < 0.5 ? -1 : 1;
      const change = Math.random() < SUNLIGHT_CHANGE_CHANCE ? 0 : randChange;
      // Ensure sunlight is between 1 and maximum
      cell.sunlight = Math.max(
        1,
        Math.min(CELL_MAX_SUNLIGHT, cell.sunlight + change),
      );
    });
  });
}

function regenerateFood() {
  grid.forEach((row) => {
    row.forEach((cell) => {
      cell.food = Math.min(CELL_MAX_FOOD, cell.food + cell.sunlight); // Food is proportional to sunlight
    });
  });
}

function updateFishGrowth() {
  grid.forEach((row) => {
    row.forEach((cell) => {
      cell.population.forEach((fish) => {
        if (cell.food > 0) {
          fish.food = Math.min(FISH_MAX_FOOD, fish.food + 1); // Fish food level capped at 3
          cell.food--;

          // Growth depends on fish type, food level, and amount of fish in cell
          const fishOverMax = cell.population.length - CELL_FISH_CAPACITY;
          // Max growth goes down for every fish over the maximum cell capacity
          const maxGrowth = fishOverMax > 0
            ? Math.max(0, FISH_MAX_GROWTH - fishOverMax * CAPACITY_PENALTY)
            : FISH_MAX_GROWTH;
          const growthRate = fish.type.growthMultiplier;
          const prevFishGrowth = fish.growth;
          if (prevFishGrowth < maxGrowth) {
            fish.growth += fish.food * growthRate;
            fish.growth = Math.min(maxGrowth, fish.growth);
          }

          // Add a random amount of value for each growth level gained
          for (let i = 0; i < fish.growth - prevFishGrowth; i++) {
            fish.value += Math.floor(
              Math.random() *
                  (fish.type.maxValueGain - fish.type.minValueGain + 1) +
                fish.type.minValueGain,
            );
          }
        } else {
          // If no food, fish dies
          fish.food -= 1;
          if (fish.food < 0) {
            const index = cell.population.indexOf(fish);
            cell.population.splice(index, 1);
          }
        }
      });
    });
  });
}

// Returns an array of a certain type of fish in a given cell
function getFishOfType(cell: Cell, typeName: FishTypeName) {
  const fish: Fish[] = [];
  for (let i = 0; i < cell.population.length; i++) {
    if (cell.population[i].type.typeName == typeName) {
      fish.push(cell.population[i]);
    }
  }
  return fish;
}

function updateFishReproduction() {
  grid.forEach((row) => {
    row.forEach((cell) => {
      if (cell.population.length >= 2 && cell.food > 0) {
        const pairs = [];
        // Number of pairs for each kind of fish
        pairs.push(Math.floor(getFishOfType(cell, "Green").length / 2));
        pairs.push(Math.floor(getFishOfType(cell, "Yellow").length / 2));
        pairs.push(Math.floor(getFishOfType(cell, "Red").length / 2));
        // Loop through number of pairs for each kind of fish to determine who reproduces
        for (let i = 0; i < pairs.length; i++) {
          for (let j = 0; j < pairs[i]; j++) {
            if (Math.random() < REPRODUCTION_CHANCE) {
              addFish(cell, fishTypes[i], 1); // 50% chance of adding one fish per pair
            }
          }
        }
      }
    });
  });
}

function draw() {
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx);
    drawPlayer(ctx);
    requestAnimationFrame(draw);
  }
}

updateCellInfo(grid[playerCoordinates.row][playerCoordinates.col]);
draw();

function nextDay() {
  regenerateFood();
  updateFishGrowth();
  updateFishReproduction();
  updateSunlight();
  updateCellInfo(grid[playerCoordinates.row][playerCoordinates.col]);
  day++;
  dayDisplay.innerHTML = `Day ${day}`;
}

document.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    nextDay();
  }
});

function sellFish(cell: Cell, fish: Fish) {
  changeMoney(fish.value);
  const fishIndex = cell.population.indexOf(fish);
  cell.population.splice(fishIndex, 1);
  updateCellInfo(cell);
}

function fillPopup(cell: Cell) {
  popup.innerHTML = "";
  if (cell.population.length > 0) {
    cell.population.forEach((fish) => {
      createHeading({
        text: fishToString(fish),
        div: popup,
        size: "h5",
      });
      createButton({
        text: "Sell",
        div: popup,
        onClick: () => {
          sellFish(cell, fish);
        },
      });
    });
  } else {
    createHeading({
      text: "No fish in this cell.",
      div: popup,
      size: "h5",
    });
  }
}

let clickedCell: Cell;
canvas.addEventListener("click", (event) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.x - rect.left;
  const mouseY = event.y - rect.top;

  const clickedCol = Math.floor(mouseX / cellSize);
  const clickedRow = Math.floor(mouseY / cellSize);

  clickedCell = grid[clickedRow][clickedCol];

  fillPopup(clickedCell);

  popup.style.left = `${event.x + 10}px`;
  popup.style.top = `${event.y + 10}px`;
  popup.style.display = "block";
});

document.addEventListener("click", (event) => {
  const element = event.target as HTMLElement;
  console.log(element.tagName);
  // If the player clicks something that isn't the canvas or shop buttons, remove popup
  if (
    element != canvas && element.tagName != "BUTTON" && element.tagName != "H5"
  ) {
    popup.style.display = "none";
  } else if (
    // Update the popup if it describes current player cell
    clickedCell == grid[playerCoordinates.row][playerCoordinates.col]
  ) {
    fillPopup(clickedCell);
  }
});
