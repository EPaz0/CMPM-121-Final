const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');
// Add a popup element to your HTML file
const popup = document.createElement('div');
popup.style.position = 'absolute';
popup.style.backgroundColor = 'white';
popup.style.border = '1px solid black';
popup.style.padding = '10px';
popup.style.display = 'none'; // Initially hidden
document.body.appendChild(popup);
//let x = 0;

const playerCoordinates = {col: 0, row: 0}; 

interface Cell{
  x: number;
  y: number;
  sunlight: number;
  food: number;
  fishPopulation: Fish[];
}

interface Fish {
  type: 'green' | 'yellow' | 'red';
  growth: number; // 0-10
  food: number; // 0-3
}

const fishTypes = {
  green: { cost: 5, growthMultiplier: 1, valueRange: [15, 35] },
  yellow: { cost: 10, growthMultiplier: 0.75, valueRange: [30, 50] },
  red: { cost: 20, growthMultiplier: 0.5, valueRange: [50, 70] },
};

const rows = 4
const cols = 5
const gridSize = 150; // Size of each grid cell
canvas.width = cols * gridSize; // Set canvas width based on grid
canvas.height = rows * gridSize; // Set canvas height based on grid

const grid: Cell[][] = Array.from({ length: rows }, (_, rowIndex) =>
  Array.from({ length: cols }, (_, colIndex) => ({
    x: colIndex * gridSize,
    y: rowIndex * gridSize,
    sunlight: Math.floor(Math.random() * 10) + 1,
    food: Math.floor(Math.random() * 10) + 1, 
    fishPopulation: []
  }))
);

function drawCell(ctx: CanvasRenderingContext2D, cell: Cell) {
  if(ctx){
    ctx.fillStyle = 'green';
    ctx.strokeRect(cell.x, cell.y, gridSize, gridSize);
    ctx.strokeText(`☀${cell.sunlight}`, cell.x + 5, cell.y + 15);
    ctx.strokeText(`🍎${cell.food}`, cell.x + 5, cell.y + 30);
    ctx.strokeText(`🐟${cell.fishPopulation.length}`, cell.x + 5, cell.y + 45);
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

function updateCellInfo(cell: Cell) {
  const cellInfoDiv = document.getElementById('cell-info');
  if (cellInfoDiv) {
    cellInfoDiv.innerText = `Cell Info:
Row: ${playerCoordinates.row}
Col: ${playerCoordinates.col}`;
  }
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
  const currentCell = grid[newRow][newCol];
  updateCellInfo(currentCell);
}
document.addEventListener('keydown', playerMovement);

function updateSunlight() {
  grid.forEach(row => {
    row.forEach(cell => {
      const change = Math.random() < 0.5 ? -1 : 1; // Randomly decide to increase or decrease sunlight
      cell.sunlight = Math.max(1, Math.min(10, cell.sunlight + change)); // Ensure sunlight is between 1 and 10
    });
  });
}

function regenerateFood() {
  grid.forEach(row => {
    row.forEach(cell => {
      cell.food = Math.min(10, cell.food + Math.floor(cell.sunlight / 2)); // Food is proportional to sunlight
    });
  });
}

function addFish(cell: Cell, type: 'green' | 'yellow' | 'red') {
  const fish = {
    type: type,
    growth: 0,
    food: 3, // Start with full food
  };
  cell.fishPopulation.push(fish);
}

function updateFishGrowth() {
  grid.forEach(row => {
    row.forEach(cell => {
      cell.fishPopulation.forEach(fish => {
        if (cell.food > 0) {
          fish.food = Math.max(0, fish.food - 1); // Fish eat food
          cell.food = Math.max(0, cell.food - 1);

          // Growth depends on fish type and food level
          const growthRate = fishTypes[fish.type].growthMultiplier;
          if (fish.food === 3) fish.growth += 3 * growthRate;
          else if (fish.food === 2) fish.growth += 2 * growthRate;
          else if (fish.food === 1) fish.growth += 1 * growthRate;

          fish.growth = Math.min(10, fish.growth); // Cap growth at 10
        } else {
          // If no food, fish die
          fish.food -= 1;
          if (fish.food <= 0) {
            const index = cell.fishPopulation.indexOf(fish);
            cell.fishPopulation.splice(index, 1); // Remove fish
          }
        }
      });
    });
  });
}

function updateFishReproduction() {
  grid.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell.fishPopulation.length >= 2 && cell.food > 0) {
        // Check for enough food in neighboring cells for reproduction
        const neighbors = [
          grid[rowIndex - 1]?.[colIndex], // Top
          grid[rowIndex + 1]?.[colIndex], // Bottom
          grid[rowIndex]?.[colIndex - 1], // Left
          grid[rowIndex]?.[colIndex + 1], // Right
        ].filter(Boolean); // Filter out undefined neighbors

        neighbors.forEach(neighbor => {
          if (neighbor && neighbor.food > 0) {
            addFish(neighbor, 'green'); // Add a green fish (or other logic for type)
            neighbor.food--; // Deduct food for the new fish
          }
        });
      }
    });
  });
}

grid.forEach(row => {
  row.forEach(cell => {
    if (Math.random() > 0.5) { // 50% chance to add a fish
      addFish(cell, 'green');
    }
    if (Math.random() > 0.65) { // 25% chance to add a fish
      addFish(cell, 'yellow');
    }

    if (Math.random() > 0.98) { // 2% chance to add a fish
      addFish(cell, 'red');
    }

  });
});


function update() {
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx); 
    drawPlayer(ctx);
    
    requestAnimationFrame(update);
  }
};

updateCellInfo(grid[playerCoordinates.row][playerCoordinates.col]);
update();

function dailyUpdate() {
  updateSunlight(); // Adjust sunlight for all tiles
  regenerateFood(); // Replenish food based on sunlight
  updateFishGrowth();
  updateFishReproduction();
}

// Handle time advancement when the spacebar is pressed
document.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    dailyUpdate();
  }
});

// Click Event to see fish details in cell
canvas.addEventListener('click', (event) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left; // X coordinate relative to canvas
  const mouseY = event.clientY - rect.top;  // Y coordinate relative to canvas

  // Calculate the clicked grid cell
  const clickedCol = Math.floor(mouseX / gridSize);
  const clickedRow = Math.floor(mouseY / gridSize);

  // Get the clicked cell
  const clickedCell = grid[clickedRow][clickedCol];

  // Display fish details in the popup
  if (clickedCell.fishPopulation.length > 0) {
    const fishDetails = clickedCell.fishPopulation.map((fish, index) =>
      `Fish ${index + 1}: Type=${fish.type}, Growth=${fish.growth}, Food=${fish.food}`
    ).join('<br>');

    popup.innerHTML = `<strong>Cell (${clickedRow}, ${clickedCol})</strong><br>${fishDetails}`;
  } else {
    popup.innerHTML = `<strong>Cell (${clickedRow}, ${clickedCol})</strong><br>No fish in this cell.`;
  }

  // Position the popup near the mouse cursor
  popup.style.left = `${event.clientX + 10}px`;
  popup.style.top = `${event.clientY + 10}px`;
  popup.style.display = 'block'; // Show the popup
});

// Hide the popup when clicking anywhere else
document.addEventListener('click', (event) => {
  if (event.target !== canvas) {
    popup.style.display = 'none'; // Hide the popup
  }
});