import { Cell, CellDetails } from "./cell.ts";
import { GameManager } from "./game-manager.ts";
import { getText } from "./i18nHelper.ts";
import {
  CAPACITY_PENALTY,
  CELL_CAPACITY_THRESHOLD,
  FISH_MATURE_GROWTH,
  FISH_MAX_FOOD,
  FISH_MAX_GROWTH,
  FISH_VALUE_RANGE,
} from "./game-config.ts";
import { getLuck } from "./utils.ts";

export function fishToString(fish: Fish): string {
  return `\n${getText(fish.type.name)} ${getText("fish")} | ${
    getText("growth")
  }: ${fish.growth}/${FISH_MAX_GROWTH}, ${
    getText("food")
  }: ${fish.food}/${FISH_MAX_FOOD}, ${getText("value")}: ${fish.value}`;
}

export function addFish(cell: Cell, type: InternalFishType, num: number) {
  for (let i = 0; i < num; i++) {
    const fish = {
      type: type,
      growth: 0,
      food: 0, // Start with empty food
      value: Math.floor(type.cost / 2), // Value starts at half of what you bought it for
    };
    cell.details.population.push(fish);
  }
}

// Returns an array of a certain type of fish in a given cell
export function getFishOfType(cell: Cell, typeName: FishTypeName) {
  const fish: Fish[] = [];
  for (let i = 0; i < cell.details.population.length; i++) {
    if (cell.details.population[i].type.name == typeName) {
      fish.push(cell.details.population[i]);
    }
  }
  return fish;
}

export type FishTypeName = "Green" | "Yellow" | "Red";

export interface Fish {
  type: InternalFishType;
  growth: number;
  food: number;
  value: number;
}

export interface FishContext {
  fish: Fish;
  cell: CellDetails;
}

interface FishDefinitionLanguage {
  name(name: string): void;
  cost(cost: number): void;
  growthMultiplier(multiplier: number): void;
  minValueGain(minValue: number): void;
  growsWhen(growsWhen: (context: FishContext) => boolean): void;
}

const allFishDefinitions = [
  function green($: FishDefinitionLanguage) {
    $.name("Green");
    $.cost(15);
    $.growthMultiplier(1);
    $.minValueGain(1);
    $.growsWhen(({ fish, cell }) => {
      // Until growth 3, the fish grows as long as it has food
      if (fish.growth < FISH_MATURE_GROWTH) return true;
      // After this level, it must be living with at least 2 other fish of the same type
      // and the level of sunlight must be lower than 8
      const isHappy = cell.population
        .filter((neighbor) => neighbor !== fish) // Filter out this fish
        .filter((neighbor) => neighbor.type === fish.type).length >= 2;
      return isHappy && cell.state.sunlight < 8;
    });
  },
  function yellow($: FishDefinitionLanguage) {
    $.name("Yellow");
    $.cost(30);
    $.growthMultiplier(.75);
    $.minValueGain(2);
    $.growsWhen(({ fish, cell }) => {
      // Until growth 3, the fish grows as long as it has food
      if (fish.growth < FISH_MATURE_GROWTH) return true;
      // After this level, it must be living with at least 2 other fish of a different type
      // and the level of sunlight must be at least 7
      const isHappy = cell.population
        .filter((neighbor) => neighbor !== fish) // Filter out this fish
        .filter((neighbor) => neighbor.type !== fish.type).length >= 2;
      return isHappy && cell.state.sunlight >= 7;
    });
  },
  function red($: FishDefinitionLanguage) {
    $.name("Red");
    $.cost(45);
    $.growthMultiplier(.5);
    $.minValueGain(3);
    $.growsWhen(({ fish, cell }) => {
      // Until growth 3, the fish grows as long as it has food
      if (fish.growth < FISH_MATURE_GROWTH) return true;
      // After this level, it must be living with no fish of the same type
      // and the level of sunlight must be lower than 5
      const isHappy = cell.population
        .filter((neighbor) => neighbor !== fish) // Filter out this fish
        .filter((neighbor) => neighbor.type === fish.type).length == 0;
      return isHappy && cell.state.sunlight < 5;
    });
  },
];

export class InternalFishType {
  name: FishTypeName = "Green";
  cost: number = 0;
  growthMultiplier: number = 0;
  minValueGain: number = 0;
  grow!: (context: FishContext) => void;

  eat(ctx: FishContext) {
    if (ctx.cell.state.food > 0) {
      ctx.fish.food = Math.min(FISH_MAX_FOOD, ctx.fish.food + 1); // Fish food level capped at 3
      ctx.cell.state.food--;
    } else {
      // If no food, fish dies
      ctx.fish.food -= 1;
      if (ctx.fish.food < 0) {
        const index = ctx.cell.population.indexOf(ctx.fish);
        ctx.cell.population.splice(index, 1);
      }
    }
  }

  calculateValue(
    ctx: FishContext,
    gameManager: GameManager,
    prevGrowth: number,
  ) {
    // Add a random amount of value for each growth level gained
    for (let i = 0; i < ctx.fish.growth - prevGrowth; i++) {
      ctx.fish.value += getLuck(
        [
          ctx.cell.state.food,
          ctx.cell.population.length,
          gameManager.currState.day,
          i,
          gameManager.currSave.seed,
          "value",
        ],
        ctx.fish.type.minValueGain,
        ctx.fish.type.minValueGain + FISH_VALUE_RANGE,
      );
    }
  }
}

function internalFishTypeCompiler(
  program: ($: FishDefinitionLanguage) => void,
): InternalFishType {
  const internalFishType = new InternalFishType();
  const dsl: FishDefinitionLanguage = {
    name(name: FishTypeName): void {
      internalFishType.name = name;
    },
    cost(cost: number): void {
      internalFishType.cost = cost;
    },
    growthMultiplier(multiplier: number): void {
      internalFishType.growthMultiplier = multiplier;
    },
    minValueGain(minValue: number): void {
      internalFishType.minValueGain = minValue;
    },
    growsWhen(growsWhen: (context: FishContext) => boolean): void {
      internalFishType.grow = (ctx) => {
        // Calculate number of fish over the threshold
        const fishOverThreshold = ctx.cell.population.length -
          CELL_CAPACITY_THRESHOLD;
        // Max growth goes down for every fish over this threshold
        const maxGrowth = fishOverThreshold > 0
          ? Math.max(0, FISH_MAX_GROWTH - fishOverThreshold * CAPACITY_PENALTY)
          : FISH_MAX_GROWTH;
        const growthRate = internalFishType.growthMultiplier;
        const prevFishGrowth = ctx.fish.growth;
        // Calculate the amount the fish will grow (if it can grow)
        let newGrowth = 0;
        if (prevFishGrowth < maxGrowth) {
          newGrowth = ctx.fish.growth + ctx.fish.food * growthRate;
          newGrowth = Math.min(maxGrowth, newGrowth);
        }
        if (newGrowth == 0) return ctx.fish.growth;
        // Grow fish by calculated amount if its growth requirements are met
        if (growsWhen(ctx)) ctx.fish.growth = Math.min(maxGrowth, newGrowth);
      };
    },
  };
  program(dsl);
  return internalFishType;
}

export const fishTypes = allFishDefinitions.map(internalFishTypeCompiler);
