import { CELL_SIZE, GRID_OFFSET } from "./game-config.ts";

export class Player {
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
