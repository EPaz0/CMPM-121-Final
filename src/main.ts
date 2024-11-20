const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');

//let x = 0;

const playerCoordinates = {col: 0, row: 0}; 

interface Cell{
  x: number;
  y: number;
}

const rows = (canvas.height / 50); 
const cols = (canvas.width / 50);
const gridSize = 50;

const grid: Cell[][] = Array.from({ length: rows }, (_, rowIndex) =>
  Array.from({ length: cols }, (_, colIndex) => ({
    x: colIndex * gridSize,
    y: rowIndex * gridSize
  }))
);

function drawCell(ctx: CanvasRenderingContext2D, cell: Cell) {
  if(ctx){
    ctx.fillStyle = 'green';
    ctx.strokeRect(cell.x, cell.y, gridSize, gridSize);
  }
}

function drawGrid(ctx : CanvasRenderingContext2D) {
  grid.forEach(row => row.forEach(cell => drawCell(ctx, cell)));
}

function drawPlayer(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = 'red';
  const cellX = playerCoordinates.col * gridSize;
  const cellY = playerCoordinates.row * gridSize;
  ctx.fillRect(cellX, cellY, gridSize, gridSize);
}

function playerMovement(event: KeyboardEvent) {
  let newRow = playerCoordinates.row;
  let newCol = playerCoordinates.col;
  
  switch(event.key) {
    case 'ArrowRight':
    case 'd':
    case 'D':
      newCol += 1;
      break;
    case 'ArrowLeft':
    case 'a':
    case 'A':
      newCol -= 1;
      break;
    case 'ArrowUp':
    case 'w':
    case 'W':
      newRow -= 1;
      break;
    case 'ArrowDown':
    case 's':
    case 'S':
      newRow += 1;
      break;
  }

  if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols ) {
    playerCoordinates.row = newRow;
    playerCoordinates.col = newCol;
  }
}
document.addEventListener('keydown', playerMovement);

function update() {
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx); 
    drawPlayer(ctx);
    
    requestAnimationFrame(update);
  }
};

update();