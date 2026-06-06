import {
  PLAY_BUTTON_ID,
  RESET_BUTTON_ID,
  STEP_BUTTON_ID,
  type TrainingState,
  type Vector2,
} from "./data.js";
import { calculateMeanSquaredDistance } from "./learning.js";

type Controls = {
  playButton: HTMLButtonElement;
  resetButton: HTMLButtonElement;
  stepButton: HTMLButtonElement;
};

type InfoElements = {
  gradient: HTMLElement;
  loss: HTMLElement;
  m: HTMLElement;
  selected: HTMLElement;
  status: HTMLElement;
  step: HTMLElement;
  update: HTMLElement;
  v: HTMLElement;
};

export function setupControls(options: {
  onPlayToggle: () => void;
  onReset: () => void;
  onStep: () => void;
}) {
  const controls = getControls();
  controls.playButton.addEventListener("click", options.onPlayToggle);
  controls.resetButton.addEventListener("click", options.onReset);
  controls.stepButton.addEventListener("click", options.onStep);
}

export function renderInfo(state: TrainingState) {
  const elements = getInfoElements();
  const selectedParticle = state.particles[state.selectedParticleIndex];

  elements.step.textContent = String(state.stepCount);
  elements.loss.textContent = formatNumber(calculateMeanSquaredDistance(state.particles));
  elements.selected.textContent = String(state.selectedParticleIndex);
  elements.status.textContent = state.statusMessage;

  if (selectedParticle) {
    elements.gradient.textContent = formatVector(selectedParticle.trace.gradient);
    elements.m.textContent = formatVector(selectedParticle.trace.m);
    elements.v.textContent = formatVector(selectedParticle.trace.v);
    elements.update.textContent = formatVector(selectedParticle.trace.update);
  }

  getControls().playButton.textContent = state.isPlaying ? "Pause" : "Play";
}

function getControls(): Controls {
  return {
    playButton: getRequiredButton(PLAY_BUTTON_ID),
    resetButton: getRequiredButton(RESET_BUTTON_ID),
    stepButton: getRequiredButton(STEP_BUTTON_ID),
  };
}

function getInfoElements(): InfoElements {
  return {
    gradient: getRequiredElement("info-gradient"),
    loss: getRequiredElement("info-loss"),
    m: getRequiredElement("info-m"),
    selected: getRequiredElement("info-selected"),
    status: getRequiredElement("info-status"),
    step: getRequiredElement("info-step"),
    update: getRequiredElement("info-update"),
    v: getRequiredElement("info-v"),
  };
}

function formatVector(vector: Vector2): string {
  return `[${formatNumber(vector.x)}, ${formatNumber(vector.y)}]`;
}

function formatNumber(value: number): string {
  if (Math.abs(value) < 0.0005) {
    return "0.000";
  }

  return value.toFixed(3);
}

function getRequiredButton(id: string): HTMLButtonElement {
  const element = document.getElementById(id);
  if (!(element instanceof HTMLButtonElement)) {
    throw new Error(`#${id} button 요소를 찾을 수 없습니다.`);
  }

  return element;
}

function getRequiredElement(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (!(element instanceof HTMLElement)) {
    throw new Error(`#${id} 요소를 찾을 수 없습니다.`);
  }

  return element;
}
