import { Cell } from "./cell.ts";
import { fishTypes } from "./fish.ts";
import { getLuck } from "./utils.ts";
import {
  CELL_MAX_CAPACITY,
  CELL_MAX_FOOD,
  CELL_MAX_SUNLIGHT,
  CELL_SIZE,
  GRID_OFFSET,
  SEEDS,
} from "./game-config.ts";

function getRandomSeed() {
  return Math.floor(Math.random() * SEEDS + 1);
}

export class Grid {
  seed: number;
  rows: number;
  cols: number;
  cells: Cell[][];
  state: Uint8Array;

  constructor(size: { rows: number; cols: number }) {
    this.seed = getRandomSeed();
    this.rows = size.rows;
    this.cols = size.cols;
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
        cell.details.state.sunlight = getLuck(
          [cell.x, cell.y, this.seed, "sun"],
          1,
          CELL_MAX_SUNLIGHT,
        );
        cell.details.state.food = getLuck(
          [cell.x, cell.y, this.seed, "food"],
          1,
          CELL_MAX_FOOD,
        );
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
        this.state[index++] = cell.details.state.sunlight;
        this.state[index++] = cell.details.state.food;
        this.state[index++] = cell.details.population.length;

        // Encode fish data
        for (let i = 0; i < CELL_MAX_CAPACITY; i++) {
          if (i < cell.details.population.length) {
            const fish = cell.details.population[i];
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
        cell.details.state.sunlight = this.state[index++];
        cell.details.state.food = this.state[index++];
        const populationCount = this.state[index++];

        // Clear current fish population
        cell.details.population = [];

        // Decode fish data
        for (let i = 0; i < populationCount; i++) {
          const typeIndex = this.state[index++];
          const type = fishTypes[typeIndex];
          const growth = this.state[index++];
          const food = this.state[index++];
          const value = this.state[index++];
          cell.details.population.push({ type, growth, food, value });
        }

        // Skip unused fish slots
        index += (CELL_MAX_CAPACITY - populationCount) * 4;
      }
    }
  }
}
