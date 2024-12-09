import { Grid } from "./grid.ts";
import { Player } from "./player.ts";
import { Cell } from "./cell.ts";
import { Fish, FishTypeName } from "./fish.ts";
import { getText } from "./i18nHelper.ts";
import { UIManager } from "./ui-manager.ts";
import { STARTING_MONEY } from "./game-config.ts";
import {
  createSpecialEffects,
  SpecialEffects,
  SpecialEvent,
  SpecialEventOutline,
  SpecialEventTypes,
} from "./special-events.ts";

// Get scenarios from JSON file (converted from YAML file)
import scenariosJSON from "./scenarios.json" with { type: "json" };
// deno-lint-ignore no-explicit-any
export const scenarios: any[] = [];
for (const key in scenariosJSON) {
  // deno-lint-ignore no-explicit-any
  scenarios.push((scenariosJSON as { [key: string]: any })[key]);
}

// Scenario values
export interface Scenario {
  index: number;
  objectiveMoney: number;
  gridSize: { rows: number; cols: number };
  availableFishTypes: FishTypeName[];
  specialEvents: SpecialEvent[];
}

function createScenario(index: number): Scenario {
  const objectiveMoney = scenarios[index].objective;
  const gridSize = {
    rows: scenarios[index].grid_size[0],
    cols: scenarios[index].grid_size[1],
  };
  const availableFishTypes = scenarios[index].available_fish_types.slice();
  const specialEvents = Array.from(
    scenarios[index].special_events,
    (event: SpecialEventOutline) => ({
      activationDay: event[0],
      type: SpecialEventTypes[event[1]],
      duration: event[2],
    }),
  );

  return {
    index: index,
    objectiveMoney: objectiveMoney,
    gridSize: gridSize,
    availableFishTypes: availableFishTypes,
    specialEvents: specialEvents,
  };
}

interface GameState {
  day: number;
  money: number;
  won: boolean;
  dayWon: number;
  gridState: number[];
  scenarioIndex: number;
  initialScenarioDay: number;
}

function createGameState(
  grid: Grid,
  scenarioIndex: number,
  day?: number,
  money?: number,
  initDay?: number,
) {
  return {
    day: day != undefined ? day : 0,
    money: money != undefined ? money : STARTING_MONEY,
    won: false,
    dayWon: 0,
    gridState: Array.from(grid.state),
    scenarioIndex: scenarioIndex,
    initialScenarioDay: initDay != undefined ? initDay : 0,
  };
}

interface GameSave {
  seed: number;
  gameStates: GameState[];
}

export class GameManager {
  scenario: Scenario;
  grid: Grid;
  player: Player;
  clickedCell: Cell;
  currSave: GameSave;
  currState: GameState;
  redoStates: GameState[]; // Array of game states that can be re-instantiated
  uiManager: UIManager;
  activeEvent: SpecialEvent | null;
  specialEffects: SpecialEffects;

  constructor() {
    this.scenario = createScenario(0);
    this.grid = new Grid(this.scenario.gridSize);
    this.grid.setInitialCellStats();
    this.player = new Player();
    this.clickedCell = this.grid.cells[0][0];
    this.currSave = {
      seed: this.grid.seed,
      gameStates: [],
    };
    this.currState = createGameState(this.grid, 0);
    this.redoStates = [];
    this.uiManager = new UIManager(this);
    this.activeEvent = null;
    this.specialEffects = createSpecialEffects();
  }

  getActiveSpecialEvent(): SpecialEvent | null {
    for (let i = 0; i < this.scenario.specialEvents.length; i++) {
      const event = this.scenario.specialEvents[i];
      const activationDay = this.currState.initialScenarioDay +
        event.activationDay;
      console.log(
        `Initial scenario day: ${this.currState.initialScenarioDay} Activation day: ${activationDay}`,
      );
      if (
        this.currState.day >= activationDay &&
        this.currState.day <= activationDay + event.duration
      ) {
        console.log(`event ${event.type.name} is active`);
        return event;
      }
    }
    console.log("no event is active");
    return null;
  }

  updateSpecialEvent() {
    const event = this.getActiveSpecialEvent();
    if (event && !this.activeEvent) {
      this.activeEvent = event;
      event.type.activate(this.specialEffects, this.uiManager);
    } else if (!event && this.activeEvent) {
      const prevEvent = this.activeEvent;
      this.activeEvent = null;
      prevEvent.type.deactivate(this.specialEffects, this.uiManager);
    }
  }

  setScenario() {
    // Rebuild grid with correct size for given scenario if it is different
    if (this.scenario.index != this.currState.scenarioIndex) {
      this.scenario = createScenario(this.currState.scenarioIndex);
      this.grid = new Grid(this.scenario.gridSize);
      // Reset the clicked cell
      this.clickedCell = this.grid.cells[0][0];
      this.player.move(0, 0);
      this.uiManager.popup.style.display = "none"; // Remove popup when player goes to next level
    }
    this.grid.seed = this.currSave.seed;
    this.grid.setInitialCellStats();
    this.currState = createGameState(
      this.grid,
      this.currState.scenarioIndex,
      this.currState.day,
      this.currState.money,
      this.currState.initialScenarioDay,
    );
    this.updateSpecialEvent();
    this.uiManager.updateGameUI();
  }

  nextScenario() {
    this.currState.scenarioIndex++;
    // Update the initial day of this scenario (used for event activation)
    this.currState.initialScenarioDay = this.currState.day;
    this.setScenario();
  }

  restoreGameState(gameState: GameState) {
    this.currState.day = gameState.day;
    this.currState.money = gameState.money;
    this.currState.won = gameState.won;
    this.currState.dayWon = gameState.dayWon;
    this.currState.scenarioIndex = gameState.scenarioIndex;
    this.setScenario();
    this.grid.state.set(gameState.gridState); // Restore the byte array
    this.grid.decode(); // Rebuild the grid
  }

  restoreGameSave(gameSave: GameSave) {
    this.grid.seed = gameSave.seed;
    this.currSave.seed = gameSave.seed;
    this.currSave.gameStates = gameSave.gameStates.map((
      state: GameState,
    ) => ({
      day: state.day,
      money: state.money,
      won: state.won,
      dayWon: state.dayWon,
      gridState: state.gridState,
      scenarioIndex: state.scenarioIndex,
      initialScenarioDay: state.initialScenarioDay,
    }));
    const savedState =
      this.currSave.gameStates[this.currSave.gameStates.length - 1];
    this.currState = {
      day: savedState.day,
      money: savedState.money,
      won: savedState.won,
      dayWon: savedState.dayWon,
      gridState: savedState.gridState,
      scenarioIndex: savedState.scenarioIndex,
      initialScenarioDay: savedState.initialScenarioDay,
    };
    this.restoreGameState(this.currState);
  }

  saveToSlot(slot: string) {
    // Save game save object with a seed and array of game states
    localStorage.setItem(
      `FishFarm_${slot}`,
      JSON.stringify(this.currSave),
    );
    if (slot === "AutoSave") return;
    alert(`Game saved to slot "${slot}".`);
  }

  autoSave(clearRedos: boolean) {
    this.grid.encode(); // Encode the current grid state before returning a representation of the game state
    const gameState = {
      day: this.currState.day,
      money: this.currState.money,
      won: this.currState.won,
      dayWon: this.currState.dayWon,
      gridState: Array.from(this.grid.state), // Convert byte array to a regular array
      scenarioIndex: this.currState.scenarioIndex,
      initialScenarioDay: this.currState.initialScenarioDay,
    };
    this.currSave.gameStates.push(gameState);
    this.saveToSlot("AutoSave");
    if (clearRedos) {
      this.redoStates = [];
    }
  }

  loadFromSlot(slot: string) {
    const rawData = localStorage.getItem(`FishFarm_${slot}`);
    if (!rawData) {
      alert(getText("noSaveData", { slot })); // Localized error message
      return;
    }
    const saveData = JSON.parse(rawData);
    this.restoreGameSave(saveData);
    alert(getText("gameLoaded", { slot })); // Localized success message
  }

  deleteSlot(slot: string) {
    const savedData = localStorage.getItem(`FishFarm_${slot}`);
    if (savedData) {
      localStorage.removeItem(`FishFarm_${slot}`);
      alert(getText("slotDeleted", { slot })); // Localized success message
    } else {
      alert(getText("noSaveData", { slot })); // Localized error message
    }
  }

  displaySaveSlots() {
    const slots = Object.keys(localStorage).filter((key) =>
      key.startsWith("FishFarm_")
    );
    const availableSlots = slots.map((slot) => slot.replace("FishFarm_", ""))
      .join(", ");
    alert(getText("availableSlots", { slots: availableSlots })); // Localized listing of save slots
  }

  undo() {
    if (this.currSave.gameStates.length > 1) {
      const prevState = this.currSave.gameStates.pop();
      this.redoStates.push(prevState!);
      const newState = this.currSave.gameStates.pop();
      this.restoreGameState(newState!);
      this.autoSave(false);
    }
  }

  redo() {
    if (this.redoStates.length > 0) {
      const newState = this.redoStates.pop();
      this.restoreGameState(newState!);
      this.autoSave(false);
    }
  }

  nextDay() {
    this.currState.day++;
    this.updateSpecialEvent();
    this.grid.cells.forEach((row) =>
      row.forEach((cell) => {
        cell.updateFood();
        cell.updateFish(this);
        cell.updatePopulation(this);
        cell.updateSunlight(this);
      })
    );
    this.uiManager.updateDayUI(this.currState.day);
    this.autoSave(true); // Autosave at the end of each day
  }

  updateObjective() {
    // Check if the objective is reached
    if (
      this.currState.money >= this.scenario.objectiveMoney &&
      !this.currState.won
    ) {
      this.currState.won = true;
      this.currState.dayWon = this.currState.day;
    }
    this.uiManager.updateObjectiveUI();
  }

  changeMoney(change: number) {
    // Update the money state
    this.currState.money += change;

    // Dynamically refresh the money display in the header
    this.uiManager.updateMoneyUI(this.currState.money);

    // Re-evaluate and update objectives
    this.updateObjective();
  }

  sellFish(cell: Cell, fish: Fish) {
    this.changeMoney(fish.value);
    cell.removeFish(fish);
    this.autoSave(true); // Autosave when fish is sold
  }
}
