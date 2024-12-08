import { Cell } from "./cell.ts";
import { getText } from "./i18nHelper.ts";
import {
  BASE_FISH_COST,
  FISH_MAX_FOOD,
  FISH_MAX_GROWTH,
} from "./game-config.ts";

export type FishTypeName = "Green" | "Yellow" | "Red";

export interface FishType {
  typeName: FishTypeName;
  cost: number;
  growthMultiplier: number;
  minValueGain: number;
  maxValueGain: number;
}

export interface Fish {
  type: FishType;
  growth: number;
  food: number;
  value: number;
}

export function fishToString(fish: Fish): string {
  return `\n${getText(fish.type.typeName)} ${getText("fish")} | ${
    getText("growth")
  }: ${fish.growth}/${FISH_MAX_GROWTH}, ${
    getText("food")
  }: ${fish.food}/${FISH_MAX_FOOD}, ${getText("value")}: ${fish.value}`;
}

export function addFish(cell: Cell, type: FishType, num: number) {
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
    if (cell.details.population[i].type.typeName == typeName) {
      fish.push(cell.details.population[i]);
    }
  }
  return fish;
}

export const fishTypes: FishType[] = [
  {
    typeName: "Green",
    cost: BASE_FISH_COST,
    growthMultiplier: 1,
    minValueGain: 1,
    maxValueGain: 3,
  },
  {
    typeName: "Yellow",
    cost: BASE_FISH_COST * 2,
    growthMultiplier: .75,
    minValueGain: 2,
    maxValueGain: 4,
  },
  {
    typeName: "Red",
    cost: BASE_FISH_COST * 3,
    growthMultiplier: .5,
    minValueGain: 3,
    maxValueGain: 5,
  },
];
