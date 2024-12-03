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
const STARTING_MONEY = 30;
const OBJECTIVE_MONEY = 500;
const BASE_FISH_COST = 15;
const REPRODUCTION_CHANCE = 0.2;
const SUNLIGHT_CHANGE_CHANCE = 0.4;
const FISH_MAX_FOOD = 3;
const FISH_MAX_GROWTH = 10;
const CELL_MAX_CAPACITY = 10; // The maximum amount of fish a cell can hold
const CELL_CAPACITY_THRESHOLD = 5; // The threshold at which fish can no longer reach max size
const CAPACITY_PENALTY = 2; // The amount by which max growth decreases for each fish above capacity
const CELL_MAX_FOOD = 10;
const CELL_MAX_SUNLIGHT = 10;

// Game state variables
const playerCoordinates = { col: 0, row: 0 };
let day = 0;
let money = STARTING_MONEY;

interface GameState {
  day: number;
  money: number;
  gridState: number[];
}
let gameStates: GameState[] = []; // An array of game states going all the way back to the start of play
const redoStates: GameState[] = []; // Array of game states that can be re-instantiated

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

createHeading({ text: "Objective", div: objectivesDiv, size: "h2" });
const objectiveDisplay = createHeading({
  text: `Make 💵 ${OBJECTIVE_MONEY}`,
  div: objectivesDiv,
  size: "h4",
});

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

const moneyDisplay = createHeading({
  text: `💵 ${money}`,
  div: headerDiv,
  size: "h2",
});
moneyDisplay.style.display = "inline";

let objectiveReached = false;
function changeMoney(change: number) {
  money += change;
  moneyDisplay.innerHTML = `💵 ${money}`;
  // Check if objective reached
  if (money >= OBJECTIVE_MONEY && !objectiveReached) {
    objectiveReached = true;
    objectiveDisplay.innerHTML =
      `<strike>Make 💵 ${OBJECTIVE_MONEY}</strike> You won in ${day} days!`;
  }
}

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

const bytesPerCell = 3 + CELL_MAX_CAPACITY * 4; // 3 for cell data, 4 per fish
const gridStateBuffer = new ArrayBuffer(rows * cols * bytesPerCell);
const gridStateView = new Uint8Array(gridStateBuffer);

// Encodes grid state into the byte array
function encodeGridState() {
  let index = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cell = grid[row][col];
      gridStateView[index++] = cell.sunlight;
      gridStateView[index++] = cell.food;
      gridStateView[index++] = cell.population.length;

      // Encode fish data
      for (let i = 0; i < CELL_MAX_CAPACITY; i++) {
        if (i < cell.population.length) {
          const fish = cell.population[i];
          gridStateView[index++] = fish.type.typeName === "Green"
            ? 0
            : fish.type.typeName === "Yellow"
            ? 1
            : 2;
          gridStateView[index++] = fish.growth;
          gridStateView[index++] = fish.food;
          gridStateView[index++] = fish.value;
        } else {
          // Fill unused fish slots with zeros
          gridStateView[index++] = 0; // Type
          gridStateView[index++] = 0; // Growth
          gridStateView[index++] = 0; // Food
          gridStateView[index++] = 0; // Value
        }
      }
    }
  }
}

// Decodes the byte array back into the grid
function decodeGridState() {
  let index = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cell = grid[row][col];
      cell.sunlight = gridStateView[index++];
      cell.food = gridStateView[index++];
      const populationCount = gridStateView[index++];

      // Clear current fish population
      cell.population = [];

      // Decode fish data
      for (let i = 0; i < populationCount; i++) {
        const typeIndex = gridStateView[index++];
        const type = fishTypes[typeIndex];
        const growth = gridStateView[index++];
        const food = gridStateView[index++];
        const value = gridStateView[index++];
        cell.population.push({ type, growth, food, value });
      }

      // Skip unused fish slots
      index += (CELL_MAX_CAPACITY - populationCount) * 4;
    }
  }
}

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
        autoSave(); // Autosave when fish is bought
      }
    },
  }).append(costDisplay);
});

function movePlayer(newRow: number, newCol: number) {
  playerCoordinates.row = newRow;
  playerCoordinates.col = newCol;
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
    movePlayer(newRow, newCol);
  }

  const newCell = grid[newRow][newCol];
  updateCellInfo(newCell);
  popup.style.display = "none"; // Remove popup when player moves using keyboard
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
          const fishOverThreshold = cell.population.length -
            CELL_CAPACITY_THRESHOLD;
          // Max growth goes down for every fish over the maximum cell capacity
          const maxGrowth = fishOverThreshold > 0
            ? Math.max(
              0,
              FISH_MAX_GROWTH - fishOverThreshold * CAPACITY_PENALTY,
            )
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

// Ensure initial encoding
encodeGridState();

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
            if (
              Math.random() < REPRODUCTION_CHANCE &&
              cell.population.length < CELL_MAX_CAPACITY
            ) {
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

if (localStorage.getItem("FishFarm_AutoSave")) {
  if (confirm("Do you want to load the autosave?")) {
    loadGame("AutoSave"); // Load the autosave
  } else {
    // Optional: Allow user to start fresh but keep the existing AutoSave
    alert(
      "Starting a new game. Autosave will overwrite existing autosave.",
    );
  }
} else {
  alert("No autosave found. Starting a new game.");
  autoSave(); // Create the first autosave
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
  autoSave(); // Autosave at the end of each day
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
  autoSave(); // Autosave when fish is sold
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

let clickedCell: Cell = grid[0][0];
canvas.addEventListener("click", (event) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.x - rect.left;
  const mouseY = event.y - rect.top;

  const clickedCol = Math.floor(mouseX / cellSize);
  const clickedRow = Math.floor(mouseY / cellSize);

  clickedCell = grid[clickedRow][clickedCol];
  movePlayer(clickedRow, clickedCol);
  updateCellInfo(clickedCell);

  fillPopup(clickedCell);

  popup.style.left = `${event.x + 10}px`;
  popup.style.top = `${event.y + 10}px`;
  popup.style.display = "block";
});

document.addEventListener("click", (event) => {
  const element = event.target as HTMLElement;
  // If the player clicks something that isn't the canvas or shop buttons, remove popup
  if (
    element != canvas && element.tagName != "BUTTON" && element.tagName != "H5"
  ) {
    popup.style.display = "none";
  } else { // Otherwise, update the popup to reflect current state
    fillPopup(clickedCell);
  }
});

// Create a button container and style it
const buttonContainer = document.createElement("div");
buttonContainer.style.position = "absolute";
buttonContainer.style.top = "10px"; // Adjust distance from the top
buttonContainer.style.right = "10px"; // Adjust distance from the right
buttonContainer.style.display = "flex";
buttonContainer.style.flexDirection = "row"; // Keep buttons horizontal
buttonContainer.style.gap = "10px"; // Add spacing between buttons
document.body.appendChild(buttonContainer);

createButton({
  text: "↩️", // Undo
  div: buttonContainer,
  onClick: () => {
    if (gameStates.length > 1) {
      const prevState = gameStates.pop();
      redoStates.push(prevState!);
      const newState = gameStates.pop();
      restoreGameState(newState!);
      autoSave();
    }
  },
});

createButton({
  text: "↪️", // Redo
  div: buttonContainer,
  onClick: () => {
    if (redoStates.length > 0) {
      const newState = redoStates.pop();
      restoreGameState(newState!);
      autoSave();
    }
  },
});

createButton({
  text: "Save Game",
  div: buttonContainer, // Append to the button container
  onClick: () => {
    const slot = prompt("Enter save slot name (e.g., Slot1):");
    if (slot) saveGame(slot);
  },
});

createButton({
  text: "Load Game",
  div: buttonContainer, // Append to the button container
  onClick: () => {
    const slot = prompt("Enter save slot name to load (e.g., Slot1):");
    if (slot) loadGame(slot);
  },
});

createButton({
  text: "List Save Slots",
  div: buttonContainer, // Append to the button container
  onClick: listSaveSlots,
});

createButton({
  text: "Delete Save Slot",
  div: buttonContainer, // Append to the button container
  onClick: deleteSaveSlot,
});

function getGameState(): GameState {
  encodeGridState(); // Encode the current grid state before returning a representation of the game state
  return {
    day: day,
    money: money,
    gridState: Array.from(gridStateView), // Convert byte array to a regular array
  };
}

function addGameState() {
  const gameState = getGameState();
  gameStates.push(gameState);
  console.log(gameStates);
}

function autoSave() {
  addGameState();
  saveGame("AutoSave");
}

function saveGame(slot: string) {
  // Save array of stringified game states to local storage rather than a single game state
  localStorage.setItem(`FishFarm_${slot}`, JSON.stringify(gameStates));
  console.log(`saved current state with day ${day} and money ${money}`);
  if (slot === "AutoSave") return;
  alert(`Game saved to slot "${slot}".`);
}

function updateGameUI() {
  dayDisplay.innerHTML = `Day ${day}`;
  moneyDisplay.innerHTML = `💵 ${money}`;
  updateCellInfo(grid[playerCoordinates.row][playerCoordinates.col]);
}

function restoreGameState(savedState: GameState) {
  day = savedState.day;
  money = savedState.money;
  gridStateView.set(savedState.gridState); // Restore the byte array
  decodeGridState(); // Rebuild the grid
  console.log(
    `restored game state with day ${savedState.day} and money ${savedState.money}`,
  );
  updateGameUI();
}

function loadGame(slot: string) {
  const savedData = localStorage.getItem(`FishFarm_${slot}`);
  if (!savedData) {
    alert(`No save data found for slot "${slot}".`);
    return;
  }

  const savedStates = JSON.parse(savedData);
  gameStates = savedStates.map((state: GameState) => ({
    day: state.day,
    money: state.money,
    gridState: state.gridState,
  }));
  const currState = gameStates[gameStates.length - 1];
  console.log(gameStates);
  restoreGameState(currState);

  alert(`Game loaded from slot "${slot}".`);
}

function listSaveSlots() {
  const slots = Object.keys(localStorage).filter((key) =>
    key.startsWith("FishFarm_")
  );
  alert(
    `Available save slots:\n${
      slots.map((slot) => slot.replace("FishFarm_", "")).join(", ")
    }`,
  );
}

function deleteSaveSlot() {
  const slot = prompt("Enter save slot to delete (e.g., Slot1):");
  if (!slot) return;
  const savedData = localStorage.getItem(`FishFarm_${slot}`);
  if (savedData) {
    localStorage.removeItem(`FishFarm_${slot}`);
    alert(`Save slot "${slot}" deleted.`);
  } else {
    alert(`No save data found for slot "${slot}".`);
  }
}
