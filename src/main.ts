const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');

let x = 0;

function update() {
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'red';
    ctx.fillRect(x, 200, 50, 50);
    x += 1;
    requestAnimationFrame(update);
  }
};

update();