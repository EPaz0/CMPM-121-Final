import "./style.css";
import luck from "./luck.ts";
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
const SEEDS = 10000; // The number of random seeds there are
const STARTING_MONEY = 30;
const OBJECTIVE_MONEY = 500;
const GRID_SIZE = { rows: 4, cols: 5 };
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

// Modifiable visual values
const CELL_SIZE = 150; // Size of each grid cell
const GRID_OFFSET = 10;

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

function fishToString(fish: Fish) {
  return `\n${fish.type.typeName} Fish | Growth: ${fish.growth}/${FISH_MAX_GROWTH}, Food: ${fish.food}/${FISH_MAX_FOOD}, Value: ${fish.value}`;
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

class Cell {
  x: number;
  y: number;
  sunlight: number;
  food: number;
  population: Fish[];

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.sunlight = 0;
    this.food = 0;
    this.population = [];
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.lineWidth = 4;
    ctx.strokeStyle = "lightblue";
    ctx.fillStyle = "lightcyan";
    ctx.strokeRect(this.x, this.y, CELL_SIZE, CELL_SIZE);
    ctx.fillRect(this.x, this.y, CELL_SIZE, CELL_SIZE);
    ctx.font = "20px arial";
    ctx.lineWidth = 1;
    ctx.strokeStyle = "orange";
    ctx.strokeText(`☀️ ${this.sunlight}`, this.x + 10, this.y + 30);
    ctx.strokeStyle = "red";
    ctx.strokeText(`🍎 ${this.food}`, this.x + 10, this.y + 50);
    ctx.strokeStyle = "blue";
    ctx.strokeText(
      `🐟 ${this.population.length}`,
      this.x + 10,
      this.y + 70,
    );
  }

  updateSunlight(day: number, seed: number) {
    // Randomly decide to increase or decrease sunlight, or keep it the same
    const randChange =
      luck([this.x, this.y, day, seed, "randchange"].toString()) < 0.5 ? -1 : 1;
    const change = luck([this.x, this.y, day, seed, "realchange"].toString()) <
      SUNLIGHT_CHANGE_CHANCE
      ? 0
      : randChange;
    // Ensure sunlight is between 1 and maximum
    this.sunlight = Math.max(
      1,
      Math.min(CELL_MAX_SUNLIGHT, this.sunlight + change),
    );
  }

  updateFood() {
    this.food = Math.min(CELL_MAX_FOOD, this.food + this.sunlight); // Food is proportional to sunlight
  }

  updateFishGrowth(day: number, seed: number) {
    this.population.forEach((fish) => {
      if (this.food > 0) {
        fish.food = Math.min(FISH_MAX_FOOD, fish.food + 1); // Fish food level capped at 3
        this.food--;

        // Growth depends on fish type, food level, and amount of fish in cell
        const fishOverThreshold = this.population.length -
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
            luck(
              [this.food, this.population.length, day, i, seed, "value"]
                .toString(),
            ) *
            (fish.type.maxValueGain - fish.type.minValueGain + 1) +
            fish.type.minValueGain,
          );
        }
      } else {
        // If no food, fish dies
        fish.food -= 1;
        if (fish.food < 0) {
          const index = this.population.indexOf(fish);
          this.population.splice(index, 1);
        }
      }
    });
  }

  updatePopulation(day: number, seed: number) {
    if (this.population.length >= 2 && this.food > 0) {
      const pairs = [];
      // Number of pairs for each kind of fish
      pairs.push(Math.floor(getFishOfType(this, "Green").length / 2));
      pairs.push(Math.floor(getFishOfType(this, "Yellow").length / 2));
      pairs.push(Math.floor(getFishOfType(this, "Red").length / 2));
      // Loop through number of pairs for each kind of fish to determine who reproduces
      for (let i = 0; i < pairs.length; i++) {
        for (let j = 0; j < pairs[i]; j++) {
          if (
            luck(
              [this.x, this.y, i, j, day, seed, "reproduction"].toString(),
            ) <
            REPRODUCTION_CHANCE &&
            this.population.length < CELL_MAX_CAPACITY
          ) {
            addFish(this, fishTypes[i], 1); // 50% chance of adding one fish per pair
          }
        }
      }
    }
  }

  updateInfoUI() {
    const cellInfoDiv = document.getElementById("cell-info");
    if (cellInfoDiv) {
      cellInfoDiv.innerText =
        `Cell (${gameManager.player.coords.row}, ${gameManager.player.coords.col})
    ☀️ Sunlight: ${this.sunlight}
    🍎 Food: ${this.food}
    🐟 Fish: ${this.population.length}`;
      if (this.population.length > 0) {
        this.population.forEach((fish) => {
          cellInfoDiv.innerText += fishToString(fish);
        });
      }
    }
  }

  updatePopupUI() {
    popup.innerHTML = "";
    if (this.population.length > 0) {
      this.population.forEach((fish) => {
        createHeading({
          text: fishToString(fish),
          div: popup,
          size: "h5",
        });
        createButton({
          text: "Sell",
          div: popup,
          onClick: () => {
            sellFish(this, fish);
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
}

class Grid {
  seed: number;
  rows: number;
  cols: number;
  cells: Cell[][];
  state: Uint8Array;

  constructor() {
    this.seed = getRandomSeed(SEEDS);
    this.rows = GRID_SIZE.rows;
    this.cols = GRID_SIZE.cols;
    this.cells = Array.from(
      { length: this.rows },
      (_, rowIndex) =>
        Array.from({ length: this.cols }, (_, colIndex) => (
          new Cell(
            colIndex * CELL_SIZE + GRID_OFFSET / 2,
            rowIndex * CELL_SIZE + GRID_OFFSET / 2,
          )
        )),
    );
    const bytesPerCell = 3 + CELL_MAX_CAPACITY * 4; // 3 for cell data, 4 per fish
    const buffer = new ArrayBuffer(this.rows * this.cols * bytesPerCell);
    this.state = new Uint8Array(buffer);
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.cells.forEach((row) =>
      row.forEach((cell) => {
        cell.draw(ctx);
      })
    );
  }

  setInitialCellStats() {
    this.cells.forEach((row) =>
      row.forEach((cell) => {
        const sSeed = [cell.x, cell.y, this.seed, "sun"].toString();
        const fSeed = [cell.x, cell.y, this.seed, "food"].toString();
        cell.sunlight = Math.floor(luck(sSeed) * CELL_MAX_SUNLIGHT) + 1;
        cell.food = Math.floor(luck(fSeed) * CELL_MAX_FOOD) + 1;
      })
    );
    this.encode();
  }

  // Encodes grid state into the byte array
  encode() {
    let index = 0;
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const cell = this.cells[row][col];
        this.state[index++] = cell.sunlight;
        this.state[index++] = cell.food;
        this.state[index++] = cell.population.length;

        // Encode fish data
        for (let i = 0; i < CELL_MAX_CAPACITY; i++) {
          if (i < cell.population.length) {
            const fish = cell.population[i];
            this.state[index++] = fish.type.typeName === "Green"
              ? 0
              : fish.type.typeName === "Yellow"
                ? 1
                : 2;
            this.state[index++] = fish.growth;
            this.state[index++] = fish.food;
            this.state[index++] = fish.value;
          } else {
            // Fill unused fish slots with zeros
            this.state[index++] = 0; // Type
            this.state[index++] = 0; // Growth
            this.state[index++] = 0; // Food
            this.state[index++] = 0; // Value
          }
        }
      }
    }
  }

  // Decodes the byte array back into the grid
  decode() {
    let index = 0;
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const cell = this.cells[row][col];
        cell.sunlight = this.state[index++];
        cell.food = this.state[index++];
        const populationCount = this.state[index++];

        // Clear current fish population
        cell.population = [];

        // Decode fish data
        for (let i = 0; i < populationCount; i++) {
          const typeIndex = this.state[index++];
          const type = fishTypes[typeIndex];
          const growth = this.state[index++];
          const food = this.state[index++];
          const value = this.state[index++];
          cell.population.push({ type, growth, food, value });
        }

        // Skip unused fish slots
        index += (CELL_MAX_CAPACITY - populationCount) * 4;
      }
    }
  }
}

interface GameState {
  day: number;
  money: number;
  won: boolean;
  dayWon: number;
  gridState: number[];
}

function createGameState(grid: Grid) {
  return {
    day: 0,
    money: STARTING_MONEY,
    won: false,
    dayWon: 0,
    gridState: Array.from(grid.state),
  };
}

class Player {
  coords: { row: number; col: number };

  constructor() {
    this.coords = { row: 0, col: 0 };
  }

  draw(ctx: CanvasRenderingContext2D) {
    const cellX = this.coords.col * CELL_SIZE + GRID_OFFSET / 2;
    const cellY = this.coords.row * CELL_SIZE + GRID_OFFSET / 2;
    ctx.strokeStyle = "limegreen";
    ctx.lineWidth = 8;
    ctx.strokeRect(cellX, cellY, CELL_SIZE, CELL_SIZE);
  }

  move(newRow: number, newCol: number) {
    this.coords.row = newRow;
    this.coords.col = newCol;
  }
}

interface GameSave {
  seed: number;
  gameStates: GameState[];
}

function getRandomSeed(max: number) {
  return Math.floor(Math.random() * max + 1);
}

class GameManager {
  grid: Grid;
  player: Player;
  currSave: GameSave;
  currState: GameState;
  redoStates: GameState[]; // Array of game states that can be re-instantiated

  constructor() {
    this.grid = new Grid();
    this.grid.setInitialCellStats();
    this.player = new Player();
    this.currSave = {
      seed: this.grid.seed,
      gameStates: [createGameState(this.grid)],
    };
    this.currState = createGameState(this.grid);
    this.redoStates = [];

    // Set up canvas based on grid size
    canvas.width = this.grid.cols * CELL_SIZE + GRID_OFFSET;
    canvas.height = this.grid.rows * CELL_SIZE + GRID_OFFSET;
    // Listen for player's keyboard movement
    document.addEventListener("keydown", (e) => {
      handleKeyboardMovement(this, e);
    });
  }

  restoreGameState(gameState: GameState) {
    this.currState.day = gameState.day;
    this.currState.money = gameState.money;
    this.currState.won = gameState.won;
    this.currState.dayWon = gameState.dayWon;
    this.grid.state.set(gameState.gridState); // Restore the byte array
    this.grid.decode(); // Rebuild the grid
    updateObjective();
    this.updateGameUI();
  }

  restoreGameSave(gameSave: GameSave) {
    this.currSave.seed = gameSave.seed;
    this.currSave.gameStates = gameSave.gameStates.map((
      state: GameState,
    ) => ({
      day: state.day,
      money: state.money,
      won: state.won,
      dayWon: state.dayWon,
      gridState: state.gridState,
    }));
    this.currState =
      this.currSave.gameStates[this.currSave.gameStates.length - 1];
    this.restoreGameState(this.currState);
  }

  saveToSlot(slot: string) {
    // Save game save object with a seed and array of game states
    localStorage.setItem(
      `FishFarm_${slot}`,
      JSON.stringify(this.currSave),
    );
    if (slot === "AutoSave") return;
    alert(`Game saved to slot "${slot}".`);
  }

  autoSave(clearRedos: boolean) {
    this.grid.encode(); // Encode the current grid state before returning a representation of the game state
    const gameState = {
      day: this.currState.day,
      money: this.currState.money,
      won: this.currState.won,
      dayWon: this.currState.dayWon,
      gridState: Array.from(this.grid.state), // Convert byte array to a regular array
    };
    this.currSave.gameStates.push(gameState);
    this.saveToSlot("AutoSave");
    if (clearRedos) {
      this.redoStates = [];
    }
  }

  loadFromSlot(slot: string) {
    const rawData = localStorage.getItem(`FishFarm_${slot}`);
    if (!rawData) {
      alert(`No save data found for slot "${slot}".`);
      return;
    }
    const saveData = JSON.parse(rawData);
    this.restoreGameSave(saveData);
    alert(`Game loaded from slot "${slot}".`);
  }

  deleteSlot(slot: string) {
    const savedData = localStorage.getItem(`FishFarm_${slot}`);
    if (savedData) {
      localStorage.removeItem(`FishFarm_${slot}`);
      alert(`Save slot "${slot}" deleted.`);
    } else {
      alert(`No save data found for slot "${slot}".`);
    }
  }

  displaySaveSlots() {
    const slots = Object.keys(localStorage).filter((key) =>
      key.startsWith("FishFarm_")
    );
    alert(
      `Available save slots:\n${slots.map((slot) => slot.replace("FishFarm_", "")).join(", ")
      }`,
    );
  }

  undo() {
    if (this.currSave.gameStates.length > 1) {
      const prevState = this.currSave.gameStates.pop();
      this.redoStates.push(prevState!);
      const newState = this.currSave.gameStates.pop();
      this.restoreGameState(newState!);
      this.autoSave(false);
    }
  }

  redo() {
    if (this.redoStates.length > 0) {
      const newState = this.redoStates.pop();
      this.restoreGameState(newState!);
      this.autoSave(false);
    }
  }

  nextDay() {
    this.grid.cells.forEach((row) =>
      row.forEach((cell) => {
        cell.updateFood();
        cell.updateFishGrowth(this.currState.day, this.currSave.seed);
        cell.updatePopulation(this.currState.day, this.currSave.seed);
        cell.updateSunlight(this.currState.day, this.currSave.seed);
        cell.updateInfoUI();
      })
    );
    this.currState.day++;
    dayDisplay.innerHTML = `Day ${this.currState.day}`;
    this.autoSave(true); // Autosave at the end of each day
  }

  updateGameUI() {
    dayDisplay.innerHTML = `Day ${this.currState.day}`;
    moneyDisplay.innerHTML = `💵 ${this.currState.money}`;
    const currentCell =
      this.grid.cells[this.player.coords.row][this.player.coords.col];
    currentCell.updateInfoUI();
  }
}

function handleKeyboardMovement(
  gameManager: GameManager,
  event: KeyboardEvent,
) {
  let newRow = gameManager.player.coords.row;
  let newCol = gameManager.player.coords.col;

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

  if (
    newRow >= 0 && newRow < gameManager.grid.rows && newCol >= 0 &&
    newCol < gameManager.grid.cols
  ) {
    gameManager.player.move(newRow, newCol);
  }

  const newCell = gameManager.grid.cells[newRow][newCol];
  newCell.updateInfoUI();
  popup.style.display = "none"; // Remove popup when player moves using keyboard
}

const gameManager = new GameManager();

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
  text: `Day ${gameManager.currState.day}`,
  div: headerDiv,
  size: "h3",
});
dayDisplay.style.display = "inline";
dayDisplay.style.marginRight = "20px";

createButton({
  text: "Next Day",
  div: headerDiv,
  onClick: () => {
    gameManager.nextDay();
  },
});

const moneyDisplay = createHeading({
  text: `💵 ${gameManager.currState.money}`,
  div: headerDiv,
  size: "h2",
});
moneyDisplay.style.display = "inline";

function updateObjectiveUI() {
  if (gameManager.currState.won) {
    objectiveDisplay.innerHTML =
      `<strike>Make 💵 ${OBJECTIVE_MONEY}</strike> You won in ${gameManager.currState.dayWon} days!`;
  } else {
    objectiveDisplay.innerHTML = `Make 💵 ${OBJECTIVE_MONEY}`;
  }
}

function updateObjective() {
  // Check if objective reached
  if (
    gameManager.currState.money >= OBJECTIVE_MONEY && !gameManager.currState.won
  ) {
    gameManager.currState.won = true;
    gameManager.currState.dayWon = gameManager.currState.day;
  }
  // Check if objective is no longer fulfilled
  if (
    gameManager.currState.money < OBJECTIVE_MONEY && gameManager.currState.won
  ) {
    gameManager.currState.won = false;
    gameManager.currState.dayWon = 0;
  }
  updateObjectiveUI();
}

function changeMoney(change: number) {
  gameManager.currState.money += change;
  moneyDisplay.innerHTML = `💵 ${gameManager.currState.money}`;
  updateObjective();
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
      if (gameManager.currState.money >= fishType.cost) {
        changeMoney(-fishType.cost);
        const currentCell = gameManager.grid
          .cells[gameManager.player.coords.row][
          gameManager.player.coords.col
        ];
        addFish(currentCell, fishType, 1);
        currentCell.updateInfoUI();
        gameManager.autoSave(true); // Autosave when fish is bought
      }
    },
  }).append(costDisplay);
});

function draw() {
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    gameManager.grid.draw(ctx);
    gameManager.player.draw(ctx);
    requestAnimationFrame(draw);
  }
}
draw();

if (localStorage.getItem("FishFarm_AutoSave")) {
  if (confirm("Do you want to load the autosave?")) {
    gameManager.loadFromSlot("AutoSave"); // Load the autosave
  } else {
    // Optional: Allow user to start fresh but keep the existing AutoSave
    alert(
      "Starting a new game. Autosave will overwrite existing autosave.",
    );
  }
} else {
  alert("No autosave found. Starting a new game.");
  gameManager.saveToSlot("AutoSave"); // Create the first autosave
}

document.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    gameManager.nextDay();
  }
});

function sellFish(cell: Cell, fish: Fish) {
  changeMoney(fish.value);
  const fishIndex = cell.population.indexOf(fish);
  cell.population.splice(fishIndex, 1);
  cell.updateInfoUI();
  gameManager.autoSave(true); // Autosave when fish is sold
}

let clickedCell: Cell = gameManager.grid.cells[0][0];
canvas.addEventListener("click", (event) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.x - rect.left;
  const mouseY = event.y - rect.top;

  const clickedCol = Math.floor(mouseX / CELL_SIZE);
  const clickedRow = Math.floor(mouseY / CELL_SIZE);

  clickedCell = gameManager.grid.cells[clickedRow][clickedCol];
  gameManager.player.move(clickedRow, clickedCol);
  clickedCell.updateInfoUI();
  clickedCell.updatePopupUI();

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
    clickedCell.updatePopupUI();
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
    gameManager.undo();
  },
});

createButton({
  text: "↪️", // Redo
  div: buttonContainer,
  onClick: () => {
    gameManager.redo();
  },
});

createButton({
  text: "Save Game",
  div: buttonContainer, // Append to the button container
  onClick: () => {
    const slot = prompt("Enter save slot name to save to (e.g., Slot1):");
    if (slot) gameManager.saveToSlot(slot);
  },
});

createButton({
  text: "Load Game",
  div: buttonContainer, // Append to the button container
  onClick: () => {
    const slot = prompt("Enter save slot name to load from (e.g., Slot1):");
    if (slot) gameManager.loadFromSlot(slot);
  },
});

createButton({
  text: "List Save Slots",
  div: buttonContainer, // Append to the button container
  onClick: gameManager.displaySaveSlots,
});

createButton({
  text: "Delete Save Slot",
  div: buttonContainer, // Append to the button container
  onClick: () => {
    const slot = prompt("Enter save slot name to delete (e.g., Slot1):");
    if (slot) gameManager.deleteSlot(slot);
  },
});
