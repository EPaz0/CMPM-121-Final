import "./style.css";
import { GameManager } from "./game-manager.ts";
import { getText, setLanguage } from "./i18nHelper.ts";
import { createButton } from "./utils.ts";
import { TranslationKeys } from "./translations.ts";
import { CELL_SIZE, GRID_OFFSET } from "./game-config.ts";

// Set up canvas
const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

// Create game manager
const gameManager = new GameManager();

function draw() {
  // Set up canvas based on grid size
  canvas.width = gameManager.grid.cols * CELL_SIZE + GRID_OFFSET;
  canvas.height = gameManager.grid.rows * CELL_SIZE + GRID_OFFSET;
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    gameManager.grid.draw(ctx);
    gameManager.player.draw(ctx);
    requestAnimationFrame(draw);
  }
}
draw();

// Listen for when to disable/update popup
document.addEventListener("click", (event) => {
  const element = event.target as HTMLElement;
  // If the player clicks something that isn't the canvas or shop buttons, remove popup
  if (
    element != canvas && element.tagName != "BUTTON" && element.tagName != "H5"
  ) {
    gameManager.uiManager.popup.style.display = "none";
  } else { // Otherwise, update the popup to reflect current state
    gameManager.uiManager.updatePopupUI(gameManager.clickedCell);
  }
});

// Look for an autosave and load it if approved
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
  gameManager.autoSave(false); // Create the first autosave
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
  gameManager.uiManager.popup.style.display = "none"; // Remove popup when player moves using keyboard
}

// Listen for player's keyboard movement
document.addEventListener("keydown", (e) => {
  handleKeyboardMovement(gameManager, e);
});

// Handle click-to-move
canvas.addEventListener("click", (event) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.x - rect.left;
  const mouseY = event.y - rect.top;

  const clickedCol = Math.floor(mouseX / CELL_SIZE);
  const clickedRow = Math.floor(mouseY / CELL_SIZE);

  gameManager.clickedCell = gameManager.grid.cells[clickedRow][clickedCol];
  gameManager.player.move(clickedRow, clickedCol);
  gameManager.uiManager.updatePopupUI(gameManager.clickedCell);

  gameManager.uiManager.popup.style.left = `${event.x + 10}px`;
  gameManager.uiManager.popup.style.top = `${event.y + 10}px`;
  gameManager.uiManager.popup.style.display = "block";
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

const localizedButtonConfigs: {
  key: TranslationKeys;
  text: string;
  div: HTMLDivElement;
  onClick: () => void;
}[] = [
  {
    key: "saveGame",
    text: getText("saveGame"),
    div: buttonContainer,
    onClick: () => {
      const slot = prompt(getText("savePrompt"));
      if (slot) gameManager.saveToSlot(slot);
    },
  },
  {
    key: "loadGame",
    text: getText("loadGame"), // Localized on initial creation
    div: buttonContainer,
    onClick: () => {
      const slot = prompt(getText("loadPrompt"));
      if (slot) gameManager.loadFromSlot(slot);
    },
  },
  {
    key: "listSaveSlots",
    text: getText("listSaveSlots"), // Localized on initial creation
    div: buttonContainer,
    onClick: () => {
      gameManager.displaySaveSlots();
    },
  },
  {
    key: "deleteSaveSlot",
    text: getText("deleteSaveSlot"), // Localized on initial creation
    div: buttonContainer,
    onClick: () => {
      const slot = prompt(getText("deletePrompt"));
      if (slot) gameManager.deleteSlot(slot);
    },
  },
];

// Create all localized buttons from button configs
const localizedButtons: HTMLButtonElement[] = [];
localizedButtonConfigs.forEach((button) => {
  const newButton = createButton({
    text: button.text,
    div: button.div,
    onClick: button.onClick,
  });
  localizedButtons.push(newButton);
});

function updateLocalizedButtons() {
  for (let i = 0; i < localizedButtons.length; i++) {
    localizedButtons[i].textContent = getText(localizedButtonConfigs[i].key);
  }
}

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
  gameManager.uiManager.updateGameUI(); // Update UI with the selected language

  // Add an event listener for language changes
  dropdown.addEventListener("change", (event) => {
    const selectedCode = (event.target as HTMLSelectElement).value;
    setLanguage(selectedCode); // Update the current language setting
    localStorage.setItem("language", selectedCode); // Save the language preference
    gameManager.uiManager.updateGameUI(); // Dynamically update the header text
    updateLocalizedButtons(); // Refresh button texts
    gameManager.uiManager.createShop(); // Refresh shop button texts
  });

  // Add the dropdown to the page (e.g., as the first element in the body)
  document.body.prepend(dropdown);
}

createLanguageDropdown(); // Set up language options
