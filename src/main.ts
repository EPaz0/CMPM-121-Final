const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');

//let x = 0;

const playerCoordinates = {x: 0, y: 0}; 

function playerMovement(event: KeyboardEvent) {
  switch(event.key) {
    case 'ArrowRight':
    case 'd':
    case 'D':
      playerCoordinates.x += 50;
      break;
    case 'ArrowLeft':
    case 'a':
    case 'A':
      playerCoordinates.x -= 50;
      break;
    case 'ArrowUp':
    case 'w':
    case 'W':
      playerCoordinates.y -= 50;
      break;
    case 'ArrowDown':
    case 's':
    case 'S':
      playerCoordinates.y += 50;
      break;
  }
}
document.addEventListener('keydown', playerMovement);

function update() {
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'red';
    ctx.fillRect(playerCoordinates.x, playerCoordinates.y, 50, 50);
    
    requestAnimationFrame(update);
  }
};

update();