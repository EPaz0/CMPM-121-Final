import { getText } from "./i18nHelper.ts";
import { GameManager } from "./game-manager.ts";
import { createButton, createHeading } from "./utils.ts";
import { FishType, FishTypeName, fishTypes } from "./fish.ts";
import { Scenario, scenarios } from "./game-manager.ts";
import { Cell } from "./cell.ts";
import { fishToString } from "./fish.ts";
import { FISH_MAX_FOOD, FISH_MAX_GROWTH } from "./game-config.ts";

function createPopup(): HTMLDivElement {
  const popup = document.createElement("div");
  popup.style.position = "absolute";
  popup.style.backgroundColor = "white";
  popup.style.border = "1px solid black";
  popup.style.padding = "10px";
  popup.style.display = "none";
  document.body.append(popup);
  return popup;
}

function fishTypeIsAvailable(
  scenario: Scenario,
  fishType: FishTypeName,
): boolean {
  for (let i = 0; i < scenario.availableFishTypes.length; i++) {
    if (scenario.availableFishTypes[i] == fishType) return true;
  }
  return false;
}

export class UIManager {
  gameManager: GameManager;
  popup: HTMLDivElement;

  constructor(gameManager: GameManager) {
    this.gameManager = gameManager;
    this.popup = createPopup();
  }

  updateHeader() {
    const headerDiv = document.querySelector<HTMLDivElement>("#header")!;

    // Clear existing content
    headerDiv.innerHTML = "";

    // Update the game's main title
    createHeading({
      text: getText("title"), // Localized "Fish Farm"
      div: headerDiv,
      size: "h1",
    });

    const dayDisplay = createHeading({
      text: `${getText("day")} ${this.gameManager.currState.day}`, // Localized "Day X"
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
        this.gameManager.nextDay();
      },
    });

    const moneyDisplay = createHeading({
      text: `💵 ${this.gameManager.currState.money}`,
      div: headerDiv,
      size: "h2",
    });
    moneyDisplay.style.display = "inline";
  }

  updateMoneyUI(money: number) {
    const moneyDisplay = document.querySelector<HTMLHeadingElement>(
      "#header h2",
    );
    if (moneyDisplay) {
      moneyDisplay.textContent = `💵 ${money}`;
    }
  }

  updateDayUI(day: number) {
    const dayDisplay = document.querySelector<HTMLHeadingElement>("#header h3"); // Select the day display element from the header
    if (dayDisplay) {
      dayDisplay.textContent = `${getText("day")} ${day}`;
    }
  }

  updateObjectiveUI() {
    // Dynamically update the objective display
    const objectivesDiv = document.querySelector<HTMLDivElement>(
      "#objectives",
    )!;
    objectivesDiv.innerHTML = ""; // First clear objectives div

    // Create the objective title
    createHeading({
      text: this.gameManager.currState.scenarioIndex == 0
        ? getText("tutorialObjective")
        : getText("objective", {
          level: this.gameManager.currState.scenarioIndex,
        }), // Localized "Objective"
      div: objectivesDiv,
      size: "h2",
    });

    // Create the objective instructions
    createHeading({
      text: this.gameManager.currState.won
        ? `<strike>${
          getText("objectiveText", {
            amount: this.gameManager.scenario.objectiveMoney,
          })
        }</strike> ${
          getText("wonText", { days: this.gameManager.currState.dayWon })
        }`
        : getText("objectiveText", {
          amount: this.gameManager.scenario.objectiveMoney,
        }), // Localized "Make 💵 X"
      div: objectivesDiv,
      size: "h4",
    });

    // If the level objective is complete (and there is another level), players have the option to go to the next level
    if (
      this.gameManager.currState.won &&
      this.gameManager.currState.scenarioIndex < scenarios.length - 1
    ) {
      const objectivesDiv = document.querySelector<HTMLDivElement>(
        "#objectives",
      )!;
      createButton({
        text: "Next Level",
        div: objectivesDiv,
        onClick: () => {
          this.gameManager.nextScenario();
          this.gameManager.autoSave(true);
        },
      });
    } else if (
      this.gameManager.currState.won &&
      this.gameManager.currState.scenarioIndex >= scenarios.length - 1
    ) {
      createHeading({
        text: getText("gameWon"),
        div: objectivesDiv,
        size: "h3",
      });
    }
  }

  updateInfoUI(cell: Cell) {
    const cellInfoDiv = document.getElementById("cell-info");
    if (cellInfoDiv) {
      // Display the localized info for the current cell
      cellInfoDiv.innerText = `${
        getText("cell")
      } (${this.gameManager.player.coords.row}, ${this.gameManager.player.coords.col})
      ${getText("sunlight")}: ${cell.details.state.sunlight}
      ${getText("food")}: ${cell.details.state.food}
      ${getText("fish")}: ${cell.details.population.length}`;

      // If the cell has a population, append localized details about its fish
      if (cell.details.population.length > 0) {
        cell.details.population.forEach((fish) => {
          const localizedFish = `${getText(fish.type.typeName)} ${
            getText("fish")
          } | ${getText("growth")}: ${fish.growth}/${FISH_MAX_GROWTH}, ${
            getText("food")
          }: ${fish.food}/${FISH_MAX_FOOD}, ${getText("value")}: ${fish.value}`;
          cellInfoDiv.innerText += `\n${localizedFish}`;
        });
      }
    }
  }

  updatePopupUI(cell: Cell) {
    this.popup.innerHTML = "";

    if (cell.details.population.length > 0) {
      cell.details.population.forEach((fish) => {
        createHeading({
          text: fishToString(fish), // Add localization to fishToString separately if necessary
          div: this.popup,
          size: "h5",
        });

        createButton({
          text: getText("sell"), // Localized "Sell" button
          div: this.popup,
          onClick: () => {
            this.gameManager.sellFish(cell, fish);
          },
        });
      });
    } else {
      createHeading({
        text: getText("noFishInCell"), // Localized "No fish in this cell" message
        div: this.popup,
        size: "h5",
      });
    }
  }

  createFishButton(
    gameManager: GameManager,
    div: HTMLDivElement,
    fishType: FishType,
  ) {
    const costDisplay = createHeading({
      text: `💵 ${fishType.cost}`,
      div: div,
      size: "h5",
    });

    createButton({
      text: `${getText("buy")} ${getText(fishType.typeName)} ${
        getText("fish")
      }`, // Use translated "Buy X Fish"
      div: div,
      onClick: () => {
        if (gameManager.currState.money >= fishType.cost) {
          gameManager.changeMoney(-fishType.cost);
          const currentCell = gameManager.grid
            .cells[gameManager.player.coords.row][
              gameManager.player.coords.col
            ];
          currentCell.addFish(fishType, 1);
          this.updateInfoUI(currentCell);
          gameManager.autoSave(true); // Autosave when fish is bought
        }
      },
    }).append(costDisplay);
  }

  createShop() {
    const shopDiv = document.querySelector<HTMLDivElement>("#shop")!;

    // Clear the shop div to prevent duplicates
    shopDiv.innerHTML = "";

    createHeading({
      text: getText("shop"), // Localized "Shop"
      div: shopDiv,
      size: "h2",
    });

    // Dynamically add fish buttons and costs
    fishTypes.forEach((fishType) => {
      if (fishTypeIsAvailable(this.gameManager.scenario, fishType.typeName)) {
        this.createFishButton(this.gameManager, shopDiv, fishType);
      }
    });
  }

  updateGameUI() {
    this.updateHeader();
    this.createShop();
    this.gameManager.updateObjective();
  }
}
