import { CELL_MAX_SUNLIGHT } from "./game-config.ts";
import { UIManager } from "./ui-manager.ts";

type SpecialEventTypeName =
  | "heatwave"
  | "storm";

interface SpecialEventType {
  name: SpecialEventTypeName;
  effects: SpecialEffects;
  activate: (effects: SpecialEffects, uiManager: UIManager) => void;
  deactivate: (effects: SpecialEffects, uiManager: UIManager) => void;
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
  reproductionModifier: number;
}

export function createSpecialEffects(): SpecialEffects {
  return {
    minSunlight: 1,
    maxSunlight: CELL_MAX_SUNLIGHT,
    reproductionModifier: 0,
  };
}

const defaultSpecialEffects: SpecialEffects = createSpecialEffects();

function changeSpecialEffects(
  effects: SpecialEffects,
  newEffects: SpecialEffects,
) {
  effects.minSunlight = newEffects.minSunlight;
  effects.maxSunlight = newEffects.maxSunlight;
  effects.reproductionModifier = newEffects.reproductionModifier;
}

const SpecialEventEffects: { [key: string]: SpecialEffects } = {
  heatwave: {
    minSunlight: 8,
    maxSunlight: CELL_MAX_SUNLIGHT,
    reproductionModifier: 0.2,
  },
  storm: {
    minSunlight: 1,
    maxSunlight: 4,
    reproductionModifier: -0.2,
  },
};

function deactivateSpecialEvent(effects: SpecialEffects, uiManager: UIManager) {
  changeSpecialEffects(effects, defaultSpecialEffects);
  uiManager.updateHeader();
}

export const SpecialEventTypes: { [key: string]: SpecialEventType } = {
  heatwave: {
    name: "heatwave",
    effects: SpecialEventEffects.heatwave,
    activate: (effects: SpecialEffects, uiManager: UIManager) => {
      changeSpecialEffects(effects, SpecialEventEffects.heatwave);
      uiManager.updateHeader();
    },
    deactivate: deactivateSpecialEvent,
  },
  storm: {
    name: "storm",
    effects: SpecialEventEffects.storm,
    activate: (effects: SpecialEffects, uiManager: UIManager) => {
      changeSpecialEffects(effects, SpecialEventEffects.storm);
      uiManager.updateHeader();
    },
    deactivate: deactivateSpecialEvent,
  },
};
