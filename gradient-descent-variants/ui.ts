import {
  METHOD_SELECT_ID,
  METHODS,
  RESET_BUTTON_ID,
  STEP_BUTTON_ID,
  type GradientMethod,
  type TrainingState,
} from "./data.js";

type Controls = {
  methodSelect: HTMLSelectElement;
  resetButton: HTMLButtonElement;
  stepButton: HTMLButtonElement;
};

type InfoElements = {
  count: HTMLElement;
  indices: HTMLElement;
  method: HTMLElement;
  status: HTMLElement;
  weights: HTMLElement;
};

export function setupControls(options: {
  initialMethod: GradientMethod;
  onMethodChange: (method: GradientMethod) => void;
  onReset: () => void;
  onStep: () => void;
}) {
  const controls = getControls();
  controls.methodSelect.value = options.initialMethod;
  controls.methodSelect.addEventListener("change", () => {
    options.onMethodChange(readMethod(controls.methodSelect));
  });
  controls.stepButton.addEventListener("click", options.onStep);
  controls.resetButton.addEventListener("click", options.onReset);
}

export function renderInfo(state: TrainingState) {
  const elements = getInfoElements();
  elements.method.textContent = getMethodLabel(state.method);
  elements.indices.textContent = formatIndices(state.lastUsedIndices);
  elements.weights.textContent = formatWeights(state.weights);
  elements.count.textContent = String(state.updateCount);
  elements.status.textContent = state.statusMessage;
}

function getControls(): Controls {
  return {
    methodSelect: getRequiredSelect(METHOD_SELECT_ID),
    resetButton: getRequiredButton(RESET_BUTTON_ID),
    stepButton: getRequiredButton(STEP_BUTTON_ID),
  };
}

function getInfoElements(): InfoElements {
  return {
    count: getRequiredElement("info-count"),
    indices: getRequiredElement("info-indices"),
    method: getRequiredElement("info-method"),
    status: getRequiredElement("info-status"),
    weights: getRequiredElement("info-weights"),
  };
}

function readMethod(select: HTMLSelectElement): GradientMethod {
  const method = select.value;
  if (isGradientMethod(method)) {
    return method;
  }

  throw new Error(`알 수 없는 gradient method입니다: ${method}`);
}

function isGradientMethod(value: string): value is GradientMethod {
  return METHODS.some((method) => method.value === value);
}

function getMethodLabel(value: GradientMethod): string {
  return METHODS.find((method) => method.value === value)?.label ?? value;
}

function formatIndices(indices: number[]): string {
  return indices.length === 0 ? "-" : `[${indices.join(", ")}]`;
}

function formatWeights([slope, bias]: [number, number]): string {
  return `[${formatNumber(slope)}, ${formatNumber(bias)}]`;
}

function formatNumber(value: number): string {
  if (Math.abs(value) < 0.0005) {
    return "0.000";
  }

  return value.toFixed(3);
}

function getRequiredSelect(id: string): HTMLSelectElement {
  const element = document.getElementById(id);
  if (!(element instanceof HTMLSelectElement)) {
    throw new Error(`#${id} select 요소를 찾을 수 없습니다.`);
  }

  return element;
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
