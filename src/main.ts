const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');

//let x = 0;

const playerCoordinates = {x: 0, y: 0}; 

const gridSize = 50; // Ensure this matches your player's movement step
function drawGrid() {
  if (ctx) {
    ctx.strokeStyle = '#ccc';
    for (let x = 0; x < canvas.width; x += gridSize) {
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.strokeRect(x, y, gridSize, gridSize);
      }
    }
  }
}

function playerMovement(event: KeyboardEvent) {
  switch(event.key) {
    case 'ArrowRight':
    case 'd':
    case 'D':
      if (playerCoordinates.x + 50 < canvas.width) { // Prevent moving beyond the right edge
        playerCoordinates.x += 50;
      }
      break;
    case 'ArrowLeft':
    case 'a':
    case 'A':
      if (playerCoordinates.x - 50 >= 0) { // Prevent moving beyond the left edge
        playerCoordinates.x -= 50;
      }
      break;
    case 'ArrowUp':
    case 'w':
    case 'W':
      if (playerCoordinates.y - 50 >= 0) { // Prevent moving beyond the top edge
        playerCoordinates.y -= 50;
      }
      break;
    case 'ArrowDown':
    case 's':
    case 'S':
      if (playerCoordinates.y + 50 < canvas.height) { // Prevent moving beyond the bottom edge
        playerCoordinates.y += 50;
      }
      break;
  }
}
document.addEventListener('keydown', playerMovement);

function update() {
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    ctx.fillStyle = 'red';
    ctx.fillRect(playerCoordinates.x, playerCoordinates.y, 50, 50);
    
    requestAnimationFrame(update);
  }
};

update();