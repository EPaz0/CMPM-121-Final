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

createHeading({
  text: "Game Name TBD",
  div: headerDiv,
  size: "h1",
});

const STARTING_MONEY = 100;
let money = STARTING_MONEY;

const moneyDisplay = createHeading({
  text: `💵 ${money}`,
  div: headerDiv,
  size: "h2",
});

function changeMoney(change: number) {
  money += change;
  moneyDisplay.innerHTML = `💵: ${money}`;
}

createHeading({
  text: "Shop",
  div: shopDiv,
  size: "h2",
});

createButton({
  text: "Next Day",
  div: headerDiv,
  onClick: () => {
    dailyUpdate();
  },
});

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
  growth: number; // 0-10
  food: number; // 0-3
  value: number;
}

const fishTypes: FishType[] = [
  {
    typeName: "Green",
    cost: 5,
    growthMultiplier: 1,
    minValueGain: 1,
    maxValueGain: 3,
  },
  {
    typeName: "Yellow",
    cost: 10,
    growthMultiplier: .75,
    minValueGain: 2,
    maxValueGain: 4,
  },
  {
    typeName: "Red",
    cost: 20,
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
      sunlight: Math.floor(Math.random() * 10) + 1,
      food: Math.floor(Math.random() * 10) + 1,
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
  return `\n${fish.type.typeName} Fish | Growth: ${fish.growth}/10, Food: ${fish.food}/3, Value: ${fish.value}`;
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
      food: 3, // Start with full food
      value: Math.floor(type.cost / 2), // Value starts at half of what you bought it for
    };
    cell.population.push(fish);
  }
}

// Create shop buttons
fishTypes.forEach((fishType) => {
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
  });
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
}
document.addEventListener("keydown", playerMovement);

function updateSunlight() {
  grid.forEach((row) => {
    row.forEach((cell) => {
      const change = Math.random() < 0.5 ? 0 : Math.random() < 0.5 ? -1 : 1; // Randomly decide to increase or decrease sunlight, or keep it the same
      cell.sunlight = Math.max(1, Math.min(10, cell.sunlight + change)); // Ensure sunlight is between 1 and 10
    });
  });
}

function regenerateFood() {
  grid.forEach((row) => {
    row.forEach((cell) => {
      cell.food = Math.min(10, cell.food + cell.sunlight); // Food is proportional to sunlight
    });
  });
}

function updateFishGrowth() {
  grid.forEach((row) => {
    row.forEach((cell) => {
      cell.population.forEach((fish) => {
        if (cell.food > 0) {
          fish.food = Math.min(3, fish.food + 1); // Fish food level capped at 3
          cell.food--;

          // Growth depends on fish type and food level
          const growthRate = fish.type.growthMultiplier;
          const prevFishGrowth = fish.growth;
          fish.growth += fish.food * growthRate;
          fish.growth = Math.min(10, fish.growth); // Cap growth at 10

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
        const newGreen = Math.floor(getFishOfType(cell, "Green").length / 2);
        const newYellow = Math.floor(getFishOfType(cell, "Yellow").length / 2);
        const newRed = Math.floor(getFishOfType(cell, "Red").length / 2);
        addFish(cell, fishTypes[0], newGreen); // Add one green fish per green fish pair
        addFish(cell, fishTypes[1], newYellow); // Add one yellow fish per yellow fish pair
        addFish(cell, fishTypes[3], newRed); // Add one red fish per red fish pair
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

function dailyUpdate() {
  regenerateFood();
  updateFishGrowth();
  updateFishReproduction();
  updateSunlight();
  updateCellInfo(grid[playerCoordinates.row][playerCoordinates.col]);
}

document.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    dailyUpdate();
  }
});

function sellFish(cell: Cell, fish: Fish) {
  changeMoney(fish.value);
  const fishIndex = cell.population.indexOf(fish);
  cell.population.splice(fishIndex, 1);
  updateCellInfo(cell);
}

canvas.addEventListener("click", (event) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  const clickedCol = Math.floor(mouseX / cellSize);
  const clickedRow = Math.floor(mouseY / cellSize);

  const clickedCell = grid[clickedRow][clickedCol];

  if (clickedCell.population.length > 0) {
    popup.innerHTML = "";
    clickedCell.population.forEach((fish) => {
      createHeading({
        text: fishToString(fish),
        div: popup,
        size: "h5",
      });
      createButton({
        text: "Sell",
        div: popup,
        onClick: () => {
          sellFish(clickedCell, fish);
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

  popup.style.left = `${event.clientX + 10}px`;
  popup.style.top = `${event.clientY + 10}px`;
  popup.style.display = "block";
});

document.addEventListener("click", (event) => {
  if (event.target !== canvas) {
    popup.style.display = "none";
  }
});
