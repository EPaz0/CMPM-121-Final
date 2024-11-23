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
document.body.appendChild(popup);

const headerDiv = document.querySelector<HTMLDivElement>("#header")!;
const shopDiv = document.querySelector<HTMLDivElement>("#shop")!;

createHeading({
  text: "Game Name TBD",
  div: headerDiv,
  size: "h1",
});

let money = 0;
const moneyDisplay = createHeading({
  text: `💵: ${money}`,
  div: headerDiv,
  size: "h2",
});

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

interface Fish {
  type: "Green" | "Yellow" | "Red";
  growth: number; // 0-10
  food: number; // 0-3
}

const fishTypes = {
  Green: { cost: 5, growthMultiplier: 1, valueRange: [15, 35] },
  Yellow: { cost: 10, growthMultiplier: 0.75, valueRange: [30, 50] },
  Red: { cost: 20, growthMultiplier: 0.5, valueRange: [50, 70] },
};

// Create shop buttons
createButton({
  text: "Buy Green Fish",
  div: shopDiv,
  onClick: () => {
  },
});
createButton({
  text: "Buy Yellow Fish",
  div: shopDiv,
  onClick: () => {
  },
});
createButton({
  text: "Buy Red Fish",
  div: shopDiv,
  onClick: () => {
  },
});

const rows = 4;
const cols = 5;
const gridSize = 150; // Size of each grid cell
canvas.width = cols * gridSize; // Set canvas width based on grid
canvas.height = rows * gridSize; // Set canvas height based on grid

const grid: Cell[][] = Array.from(
  { length: rows },
  (_, rowIndex) =>
    Array.from({ length: cols }, (_, colIndex) => ({
      x: colIndex * gridSize,
      y: rowIndex * gridSize,
      sunlight: Math.floor(Math.random() * 10) + 1,
      food: Math.floor(Math.random() * 10) + 1,
      population: [],
    })),
);

function drawCell(ctx: CanvasRenderingContext2D, cell: Cell) {
  if (ctx) {
    ctx.fillStyle = "Green";
    ctx.strokeRect(cell.x, cell.y, gridSize, gridSize);
    ctx.strokeText(`☀${cell.sunlight}`, cell.x + 5, cell.y + 15);
    ctx.strokeText(`🍎${cell.food}`, cell.x + 5, cell.y + 30);
    ctx.strokeText(`🐟${cell.population.length}`, cell.x + 5, cell.y + 45);
  }
}

function drawGrid(ctx: CanvasRenderingContext2D) {
  grid.forEach((row) => row.forEach((cell) => drawCell(ctx, cell)));
}

function drawPlayer(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "Red";
  const cellX = playerCoordinates.col * gridSize + 50;
  const cellY = playerCoordinates.row * gridSize;
  ctx.fillRect(cellX, cellY, 50, 50);
}

function updateCellInfo(cell: Cell) {
  const cellInfoDiv = document.getElementById("cell-info");
  if (cellInfoDiv) {
    cellInfoDiv.innerText =
      `Cell ${playerCoordinates.row}, ${playerCoordinates.col}:
    ☀Sunlight: ${cell.sunlight}
    🍎Food: ${cell.food}
    🐟Fish: ${cell.population.length}`;
    if (cell.population.length > 0) {
      cell.population.forEach((fish) => {
        cellInfoDiv.innerText +=
          `\nFish Type: ${fish.type}, Growth: ${fish.growth}, Food: ${fish.food}`;
      });
    }
  }
}

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
      const change = Math.random() < 0.5 ? -1 : 1; // Randomly decide to increase or decrease sunlight
      cell.sunlight = Math.max(1, Math.min(10, cell.sunlight + change)); // Ensure sunlight is between 1 and 10
    });
  });
}

function regenerateFood() {
  grid.forEach((row) => {
    row.forEach((cell) => {
      cell.food = Math.min(10, cell.food + Math.floor(cell.sunlight / 2)); // Food is proportional to sunlight
    });
  });
}

function addFish(cell: Cell, type: "Green" | "Yellow" | "Red", num: number) {
  for (let i = 0; i < num; i++) {
    const fish = {
      type: type,
      growth: 0,
      food: 3, // Start with full food
    };
    cell.population.push(fish);
  }
}

function updateFishGrowth() {
  grid.forEach((row) => {
    row.forEach((cell) => {
      cell.population.forEach((fish) => {
        if (cell.food > 0) {
          fish.food = Math.min(3, fish.food + 1); // Fish food level capped at 3
          cell.food--;

          // Growth depends on fish type and food level
          const growthRate = fishTypes[fish.type].growthMultiplier;
          if (fish.food === 3) fish.growth += 3 * growthRate;
          else if (fish.food === 2) fish.growth += 2 * growthRate;
          else if (fish.food === 1) fish.growth += 1 * growthRate;

          fish.growth = Math.min(10, fish.growth); // Cap growth at 10
        } else {
          // If no food, fish dies
          fish.food -= 1;
          if (fish.food <= 0) {
            const index = cell.population.indexOf(fish);
            cell.population.splice(index, 1);
          }
        }
      });
    });
  });
}

// Returns an array of a certain type of fish in a given cell
function getFishOfType(cell: Cell, type: string) {
  const fish: Fish[] = [];
  for (let i = 0; i < cell.population.length; i++) {
    if (cell.population[i].type == type) {
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
        addFish(cell, "Green", newGreen); // Add one green fish per green fish pair
        addFish(cell, "Yellow", newYellow); // Add one yellow fish per yellow fish pair
        addFish(cell, "Red", newRed); // Add one red fish per red fish pair
      }
    });
  });
}

// Initialize starting fish at random
grid.forEach((row) => {
  row.forEach((cell) => {
    if (Math.random() > 0.5) { // 50% chance to add a fish
      addFish(cell, "Green", 2);
    }
    if (Math.random() > 0.65) { // 25% chance to add a fish
      addFish(cell, "Yellow", 1);
    }

    if (Math.random() > 0.98) { // 2% chance to add a fish
      addFish(cell, "Red", 1);
    }
  });
});

function update() {
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx);
    drawPlayer(ctx);

    requestAnimationFrame(update);
  }
}

updateCellInfo(grid[playerCoordinates.row][playerCoordinates.col]);
update();

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

canvas.addEventListener("click", (event) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  const clickedCol = Math.floor(mouseX / gridSize);
  const clickedRow = Math.floor(mouseY / gridSize);

  const clickedCell = grid[clickedRow][clickedCol];

  if (clickedCell.population.length > 0) {
    const fishDetails = clickedCell.population.map((fish) =>
      `${fish.type} Fish | Growth: ${fish.growth}/10, Food: ${fish.food}/3`
    ).join("<br>");

    popup.innerHTML =
      `<strong>Cell (${clickedRow}, ${clickedCol})</strong><br>${fishDetails}`;
  } else {
    popup.innerHTML =
      `<strong>Cell (${clickedRow}, ${clickedCol})</strong><br>No fish in this cell.`;
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
