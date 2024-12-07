import "./style.css";
import luck from "./luck.ts";
import { createButton, createHeading } from "./utils.ts";
import { setLanguage, getText } from "./i18nHelper.ts";

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
  return `\n${getText(fish.type.typeName)} ${getText("fish")} | ${getText("growth")}: ${fish.growth}/${FISH_MAX_GROWTH}, ${getText("food")}: ${fish.food}/${FISH_MAX_FOOD}, ${getText("value")}: ${fish.value}`;
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
      // Display the localized info for the current cell
      cellInfoDiv.innerText = `${getText("cell")} (${gameManager.player.coords.row}, ${gameManager.player.coords.col})
      ${getText("sunlight")}: ${this.sunlight}
      ${getText("food")}: ${this.food}
      ${getText("fish")}: ${this.population.length}`;
  
      // If the cell has a population, append localized details about its fish
      if (this.population.length > 0) {
        this.population.forEach((fish) => {
          const localizedFish = `${getText(fish.type.typeName)} ${getText("fish")} | ${getText("growth")}: ${fish.growth}/${FISH_MAX_GROWTH}, ${getText("food")}: ${fish.food}/${FISH_MAX_FOOD}, ${getText("value")}: ${fish.value}`;
          cellInfoDiv.innerText += `\n${localizedFish}`;
        });
      }
    }
  }

  updatePopupUI() {
    popup.innerHTML = "";
  
    if (this.population.length > 0) {
      this.population.forEach((fish) => {
        createHeading({
          text: fishToString(fish), // Add localization to fishToString separately if necessary
          div: popup,
          size: "h5",
        });
  
        createButton({
          text: getText("sell"), // Localized "Sell" button
          div: popup,
          onClick: () => {
            sellFish(this, fish);
          },
        });
      });
    } else {
      createHeading({
        text: getText("noFishInCell"), // Localized "No fish in this cell" message
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
      alert(getText("noSaveData", { slot })); // Localized error message
      return;
    }
    const saveData = JSON.parse(rawData);
    this.restoreGameSave(saveData);
    alert(getText("gameLoaded", { slot })); // Localized success message
  }

  deleteSlot(slot: string) {
    const savedData = localStorage.getItem(`FishFarm_${slot}`);
    if (savedData) {
      localStorage.removeItem(`FishFarm_${slot}`);
      alert(getText("slotDeleted", { slot })); // Localized success message
    } else {
      alert(getText("noSaveData", { slot })); // Localized error message
    }
  }

  displaySaveSlots() {
    const slots = Object.keys(localStorage).filter((key) =>
      key.startsWith("FishFarm_")
    );
    const availableSlots = slots.map((slot) => slot.replace("FishFarm_", "")).join(", ");
    alert(getText("availableSlots", { slots: availableSlots })); // Localized listing of save slots
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
    updateDayDisplay(); 
    this.autoSave(true); // Autosave at the end of each day
  }

  updateGameUI() {
    updateDayDisplay();
    updateMoneyDisplay();
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


createLanguageDropdown(); // Set up language options
updateHeader();
// Game title heading
/*createHeading({
  text: "Fish Farm",
  div: headerDiv,
  size: "h1",
});*/

/*createHeading({
  text: "Shop",
  div: shopDiv,
  size: "h2",
});

createHeading({ text: "Objective", div: objectivesDiv, size: "h2" });
const objectiveDisplay = createHeading({
  text: `Make 💵 ${OBJECTIVE_MONEY}`,
  div: objectivesDiv,
  size: "h4",
});*/

/*const dayDisplay = createHeading({
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
});*/

/*const moneyDisplay = createHeading({
  text: `💵 ${gameManager.currState.money}`,
  div: headerDiv,
  size: "h2",
});
moneyDisplay.style.display = "inline";*/

//updateHeader(); 

function updateObjectiveUI() {
  const objectiveDisplay = document.querySelector<HTMLHeadingElement>("#objectives h4");
  if (objectiveDisplay) {
    if (gameManager.currState.won) {
      // Update the display with completed objective (localized)
      objectiveDisplay.innerHTML = `<strike>${getText("objectiveText", {
        amount: OBJECTIVE_MONEY,
      })}</strike> ${getText("wonText", { days: gameManager.currState.dayWon })}`;
    } else {
      // Update display to show the active objective
      objectiveDisplay.textContent = getText("objectiveText", { amount: OBJECTIVE_MONEY });
    }
  }
}

function updateObjective() {
  // Check if the objective is reached
  if (gameManager.currState.money >= OBJECTIVE_MONEY && !gameManager.currState.won) {
    gameManager.currState.won = true;
    gameManager.currState.dayWon = gameManager.currState.day;
  }

  // Check if the objective is no longer fulfilled (e.g., money drops below requirement)
  if (gameManager.currState.money < OBJECTIVE_MONEY && gameManager.currState.won) {
    gameManager.currState.won = false;
    gameManager.currState.dayWon = 0;
  }

  // Dynamically update the objective display
  const objectiveDisplay = document.querySelector<HTMLHeadingElement>("#objectives h4");
  if (objectiveDisplay) {
    if (gameManager.currState.won) {
      // Show completed objective with strike-through
      objectiveDisplay.innerHTML = `<strike>${getText("objectiveText", {
        amount: OBJECTIVE_MONEY,
      })}</strike> ${getText("wonText", { days: gameManager.currState.dayWon })}`;
    } else {
      // Show current objective in progress
      objectiveDisplay.textContent = getText("objectiveText", { amount: OBJECTIVE_MONEY });
    }
  }
}

function changeMoney(change: number) {
  // Update the money state
  gameManager.currState.money += change;

  // Dynamically refresh the money display in the header
  updateMoneyDisplay();

  // Re-evaluate and update objectives
  updateObjective();
}

// Create shop
/*fishTypes.forEach((fishType) => {
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
        updateMoneyDisplay(); 
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
});*/

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
  text: getText("saveGame"), // Localized on initial creation
  div: buttonContainer,
  onClick: () => {
    const slot = prompt(getText("savePrompt"));
    if (slot) gameManager.saveToSlot(slot);
  },
}).setAttribute("data-button", "saveGame"); // Add "saveGame" identifier

createButton({
  text: getText("loadGame"), // Localized on initial creation
  div: buttonContainer,
  onClick: () => {
    const slot = prompt(getText("loadPrompt"));
    if (slot) gameManager.loadFromSlot(slot);
  },
}).setAttribute("data-button", "loadGame"); // Add "loadGame" identifier

createButton({
  text: getText("listSaveSlots"), // Localized on initial creation
  div: buttonContainer,
  onClick: () => {
    gameManager.displaySaveSlots();
  },
}).setAttribute("data-button", "listSaveSlots"); // Add "listSaveSlots" identifier

createButton({
  text: getText("deleteSaveSlot"), // Localized on initial creation
  div: buttonContainer,
  onClick: () => {
    const slot = prompt(getText("deletePrompt"));
    if (slot) gameManager.deleteSlot(slot);
  },
}).setAttribute("data-button", "deleteSaveSlot"); // Add "deleteSaveSlot" identifier



function createLanguageDropdown() {
  const dropdown = document.createElement("select");

  // Add language options
  const languages = [
    { code: "en", label: "English" },
    { code: "es", label: "Español" },
    { code: "ar", label: "العربية" },
  ];

  languages.forEach((lang) => {
    const option = document.createElement("option");
    option.value = lang.code; // The language code
    option.textContent = lang.label; // The display label
    dropdown.appendChild(option);
  });

  // Get saved language or default to English
  const savedLanguage = localStorage.getItem("language") || "en";
  dropdown.value = savedLanguage; // Set dropdown to the saved language
  setLanguage(savedLanguage); // Apply the saved language immediately
  updateHeader(); // Update the header with the selected language
  //updateGameUI(); // Update all UI elements with the selected language

  // Add an event listener for language changes
  dropdown.addEventListener("change", (event) => {
    const selectedCode = (event.target as HTMLSelectElement).value;
    setLanguage(selectedCode); // Update the current language setting
    localStorage.setItem("language", selectedCode); // Save the language preference
    updateHeader(); // Dynamically update the header text
    //updateGameUI(); // Refresh the rest of the UI to reflect the selected language
    updateButtonsText(buttonContainer); // Refresh button texts
    createShop(); // Refresh shop button texts
  });

  // Add the dropdown to the page (e.g., as the first element in the body)
  document.body.prepend(dropdown);
}

function updateHeader() {
  const headerDiv = document.querySelector<HTMLDivElement>("#header")!;
  const shopDiv = document.querySelector<HTMLDivElement>("#shop")!;
  const objectivesDiv = document.querySelector<HTMLDivElement>("#objectives")!;

  // Clear existing content in the header sections
  headerDiv.innerHTML = "";
  objectivesDiv.innerHTML = "";

  // Update the game's main title
  createHeading({
    text: getText("title"), // Localized "Fish Farm"
    div: headerDiv,
    size: "h1",
  });

  
  // Update the Objective/Day displays
  createHeading({
    text: getText("objective"), // Localized "Objective"
    div: objectivesDiv,
    size: "h2",
  });

  const _objectiveDisplay = createHeading({
    text: getText("objectiveText", { amount: OBJECTIVE_MONEY }), // Localized "Make 💵 X"
    div: objectivesDiv,
    size: "h4",
  });

  const dayDisplay = createHeading({
    text: `${getText("day")} ${gameManager.currState.day}`, // Localized "Day X"
    div: headerDiv,
    size: "h3",
  });
  dayDisplay.style.display = "inline";
  dayDisplay.style.marginRight = "20px";

  // Add the "Next Day" button
  createButton({
    text: getText("nextDay"), // Localized "Next Day"
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

  createShop();
}

function createShop() {
  // Clear the shop div to prevent duplicates
  shopDiv.innerHTML = "";

  createHeading({
  text: getText("shop"), // Localized "Shop"
  div: shopDiv,
  size: "h2",
  });

  // Dynamically add fish buttons and costs
  fishTypes.forEach((fishType) => {
    const costDisplay = createHeading({
      text: `💵 ${fishType.cost}`,
      div: shopDiv,
      size: "h5",
    });

    createButton({
      text: `${getText("buy")} ${getText(fishType.typeName)} ${getText("fish")}`, // Use translated "Buy X Fish"
      div: shopDiv,
      onClick: () => {
        if (gameManager.currState.money >= fishType.cost) {
          changeMoney(-fishType.cost);
          updateMoneyDisplay();
          const currentCell = gameManager.grid.cells[gameManager.player.coords.row][gameManager.player.coords.col];
          addFish(currentCell, fishType, 1);
          currentCell.updateInfoUI();
          gameManager.autoSave(true); // Autosave when fish is bought
        }
      },
    }).append(costDisplay);
  });
}

function updateMoneyDisplay() {
  const moneyDisplay = document.querySelector<HTMLHeadingElement>("#header h2");
  if (moneyDisplay) {
    moneyDisplay.textContent = `💵 ${gameManager.currState.money}`;
  }
}

function updateDayDisplay() {
  const dayDisplay = document.querySelector<HTMLHeadingElement>("#header h3"); // Select the day display element from the header
  if (dayDisplay) {
    dayDisplay.textContent = `${getText("day")} ${gameManager.currState.day}`;
  }
}




function updateButtonsText(buttonsContainer: HTMLElement) {
  // Update the text for the "Save Game" button
  const saveGameButton = buttonsContainer.querySelector<HTMLButtonElement>('[data-button="saveGame"]');
  if (saveGameButton) {
    saveGameButton.textContent = getText("saveGame"); // Localized "Save Game"
  }

  // Update the text for the "Load Game" button
  const loadGameButton = buttonsContainer.querySelector<HTMLButtonElement>('[data-button="loadGame"]');
  if (loadGameButton) {
    loadGameButton.textContent = getText("loadGame"); // Localized "Load Game"
  }

  // Update the text for the "List Save Slots" button
  const listSaveSlotsButton = buttonsContainer.querySelector<HTMLButtonElement>('[data-button="listSaveSlots"]');
  if (listSaveSlotsButton) {
    listSaveSlotsButton.textContent = getText("listSaveSlots"); // Localized "List Save Slots"
  }

  // Update the text for the "Delete Save Slot" button
  const deleteSaveSlotButton = buttonsContainer.querySelector<HTMLButtonElement>('[data-button="deleteSaveSlot"]');
  if (deleteSaveSlotButton) {
    deleteSaveSlotButton.textContent = getText("deleteSaveSlot"); // Localized "Delete Save Slot"
  }
}

