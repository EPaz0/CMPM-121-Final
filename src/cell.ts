import {
  Fish,
  FishContext,
  FishTypeName,
  fishTypes,
  InternalFishType,
} from "./fish.ts";
import { getLuck } from "./utils.ts";
import {
  CELL_MAX_CAPACITY,
  CELL_MAX_FOOD,
  CELL_MAX_SUNLIGHT,
  CELL_SIZE,
  FISH_MATURE_GROWTH,
  REPRODUCTION_CHANCE,
  SUNLIGHT_CHANGE_CHANCE,
} from "./game-config.ts";
import { GameManager } from "./game-manager.ts";

// Returns an array mature fish of a certain type in a certain cell
function getMatureFishOfType(cellDetails: CellDetails, typeName: FishTypeName) {
  const matureFish: Fish[] = [];
  for (let i = 0; i < cellDetails.population.length; i++) {
    const fish = cellDetails.population[i];
    if (fish.type.name == typeName && fish.growth >= FISH_MATURE_GROWTH) {
      matureFish.push(cellDetails.population[i]);
    }
  }
  return matureFish;
}

interface CellState {
  sunlight: number;
  food: number;
}

function createCellState(): CellState {
  const state = { sunlight: 0, food: 0 };
  return state;
}

export interface CellDetails {
  state: CellState;
  population: Fish[];
}

function createCellDetails(): CellDetails {
  const details: CellDetails = { state: createCellState(), population: [] };
  return details;
}

export class Cell {
  x: number;
  y: number;
  details: CellDetails;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.details = createCellDetails();
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
    ctx.strokeText(
      `☀️ ${this.details.state.sunlight}`,
      this.x + 10,
      this.y + 30,
    );
    ctx.strokeStyle = "red";
    ctx.strokeText(`🍎 ${this.details.state.food}`, this.x + 10, this.y + 50);
    ctx.strokeStyle = "blue";
    ctx.strokeText(
      `🐟 ${this.details.population.length}`,
      this.x + 10,
      this.y + 70,
    );
  }

  updateSunlight(day: number, seed: number) {
    // Randomly decide to increase or decrease sunlight, or keep it the same
    const randChange = getLuck([this.x, this.y, day, seed, "randchange"]) < 0.5
      ? -1
      : 1;
    const change = getLuck([this.x, this.y, day, seed, "realchange"]) <
        SUNLIGHT_CHANGE_CHANCE
      ? 0
      : randChange;
    // Ensure sunlight is between 1 and maximum
    this.details.state.sunlight = Math.max(
      1,
      Math.min(CELL_MAX_SUNLIGHT, this.details.state.sunlight + change),
    );
  }

  updateFood() {
    this.details.state.food = Math.min(
      CELL_MAX_FOOD,
      this.details.state.food + this.details.state.sunlight,
    ); // Food is proportional to sunlight
  }

  updateFish(gameManager: GameManager) {
    this.details.population.forEach((fish) => {
      const ctx: FishContext = { fish: fish, cell: this.details };
      const prevGrowth = fish.growth;
      fish.type.eat(ctx);
      fish.type.grow(ctx);
      fish.type.calculateValue(ctx, gameManager, prevGrowth);
    });
  }

  addFish(type: InternalFishType, num: number) {
    for (let i = 0; i < num; i++) {
      const fish = {
        type: type,
        growth: 0,
        food: 0, // Start with empty food
        value: Math.floor(type.cost / 2), // Value starts at half of what you bought it for
      };
      this.details.population.push(fish);
    }
  }

  updatePopulation(day: number, seed: number) {
    if (this.details.population.length >= 2 && this.details.state.food > 0) {
      const pairs = [];
      // Get the number of pairs of mature fish for each type
      pairs.push(
        Math.floor(getMatureFishOfType(this.details, "Green").length / 2),
      );
      pairs.push(
        Math.floor(getMatureFishOfType(this.details, "Yellow").length / 2),
      );
      pairs.push(
        Math.floor(getMatureFishOfType(this.details, "Red").length / 2),
      );
      // Loop through number of pairs for each kind of fish to determine who reproduces
      for (let i = 0; i < pairs.length; i++) {
        for (let j = 0; j < pairs[i]; j++) {
          if (
            getLuck([this.x, this.y, i, j, day, seed, "reproduction"]) <
              REPRODUCTION_CHANCE &&
            this.details.population.length < CELL_MAX_CAPACITY
          ) {
            this.addFish(fishTypes[i], 1); // 50% chance of adding one fish per pair
          }
        }
      }
    }
  }

  removeFish(fish: Fish) {
    const fishIndex = this.details.population.indexOf(fish);
    this.details.population.splice(fishIndex, 1);
  }
}
