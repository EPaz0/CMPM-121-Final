import { CELL_MAX_SUNLIGHT } from "./game-config.ts";
import { UIManager } from "./ui-manager.ts";

type SpecialEventTypeName =
  | "Heatwave"
  | "Storm"
  | "Baby Boom"
  | "Parasite Outbreak";

interface SpecialEventType {
  typeName: SpecialEventTypeName;
  effects: SpecialEffects;
  onActive: (effects: SpecialEffects, uiManager: UIManager) => void;
}

export type SpecialEventOutline = [number, string, number];

export interface SpecialEvent {
  activationDay: number;
  type: SpecialEventType;
  duration: number;
}

export interface SpecialEffects {
  minSunlight: number;
  maxSunlight: number;
  reproductionBoost: number;
  deathChance: number;
}

export function createSpecialEffects(): SpecialEffects {
  return {
    minSunlight: 1,
    maxSunlight: CELL_MAX_SUNLIGHT,
    reproductionBoost: 0,
    deathChance: 0,
  };
}

function changeSpecialEffects(
  effects: SpecialEffects,
  newEffects: SpecialEffects,
) {
  effects.minSunlight = newEffects.minSunlight;
  effects.maxSunlight = newEffects.maxSunlight;
  effects.reproductionBoost = newEffects.reproductionBoost;
  effects.deathChance = newEffects.deathChance;
}

const SpecialEventEffects = {
  heatwave: {
    minSunlight: 8,
    maxSunlight: CELL_MAX_SUNLIGHT,
    reproductionBoost: 0.1,
    deathChance: 0,
  },
  storm: {
    minSunlight: 1,
    maxSunlight: 4,
    reproductionBoost: 0,
    deathChance: 0,
  },
};

export const SpecialEventTypes: { [key: string]: SpecialEventType } = {
  heatwave: {
    typeName: "Heatwave",
    effects: SpecialEventEffects.heatwave,
    onActive: (effects: SpecialEffects, uiManager: UIManager) => {
      changeSpecialEffects(effects, SpecialEventEffects.heatwave);
      uiManager.updateHeader();
    },
  },
  storm: {
    typeName: "Storm",
    effects: SpecialEventEffects.storm,
    onActive: (effects: SpecialEffects, uiManager: UIManager) => {
      changeSpecialEffects(effects, SpecialEventEffects.storm);
      uiManager.updateHeader();
    },
  },
};
