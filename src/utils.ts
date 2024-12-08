// Helpful functions whose implementations don't need to be seen in main program
import luck from "./luck.ts";

interface ButtonConfig {
  text: string;
  div: HTMLDivElement;
  onClick: () => void;
}

// Create and return a button with a name and click function in a certain div
export function createButton(config: ButtonConfig): HTMLButtonElement {
  const newButton = document.createElement("button");
  newButton.innerHTML = config.text;
  config.div.append(newButton);
  newButton.addEventListener("click", config.onClick);
  return newButton;
}

interface HeadingConfig {
  text: string;
  div: HTMLDivElement;
  size: string;
}

// Create and return a heading from size h1 to h6 with an optional change function in a certain div
export function createHeading(config: HeadingConfig): HTMLElement {
  const newHeading = document.createElement(config.size);
  newHeading.innerHTML = config.text;
  config.div.append(newHeading);
  return newHeading;
}

export function getLuck(
  factors: (string | number)[],
  min?: number,
  max?: number,
) {
  if (min && max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(
      luck(factors.toString()) * (maxFloored - minCeiled + 1) + minCeiled,
    );
  } else {
    return luck(factors.toString());
  }
}
