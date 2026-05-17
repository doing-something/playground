import { isSameShape, shapeLabel, shapePresets, type Shape } from "./data.js";

type ShapeChangeHandler = (shape: Shape) => void;

type ShapeInputs = {
  rows: HTMLInputElement;
  cols: HTMLInputElement;
};

/**
 * (rows, cols) 직접 입력 + 프리셋 버튼을 초기화하고
 * 값이 바뀔 때마다 콜백을 호출한다.
 */
export function setupShapeControls(
  initialShape: Shape,
  onShapeChange: ShapeChangeHandler,
) {
  const inputs = getShapeInputs();
  const presetContainer = getPresetContainer();
  const presetButtons = new Map<string, HTMLButtonElement>();

  writeShapeToInputs(inputs, initialShape);
  renderPresetButtons(presetContainer, presetButtons, (presetShape) => {
    writeShapeToInputs(inputs, presetShape);
    applyChange(presetShape, presetButtons, onShapeChange);
  });
  updatePresetSelection(presetButtons, initialShape);

  const emitChange = () => {
    const nextShape = readShapeFromInputs(inputs);
    applyChange(nextShape, presetButtons, onShapeChange);
  };

  inputs.rows.addEventListener("input", emitChange);
  inputs.cols.addEventListener("input", emitChange);
}

function applyChange(
  shape: Shape,
  presetButtons: Map<string, HTMLButtonElement>,
  onShapeChange: ShapeChangeHandler,
) {
  updatePresetSelection(presetButtons, shape);
  onShapeChange(shape);
}

function renderPresetButtons(
  container: HTMLElement,
  buttonMap: Map<string, HTMLButtonElement>,
  onSelect: (shape: Shape) => void,
) {
  container.replaceChildren();
  buttonMap.clear();

  for (const preset of shapePresets) {
    const label = shapeLabel(preset);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "preset-button";
    button.textContent = label;
    button.addEventListener("click", () => {
      onSelect({ rows: preset.rows, cols: preset.cols });
    });
    buttonMap.set(label, button);
    container.appendChild(button);
  }
}

function updatePresetSelection(
  buttonMap: Map<string, HTMLButtonElement>,
  currentShape: Shape,
) {
  for (const [label, button] of buttonMap) {
    const preset = shapePresets.find((s) => shapeLabel(s) === label);
    const isActive = preset !== undefined && isSameShape(preset, currentShape);
    button.classList.toggle("preset-button-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  }
}

function readShapeFromInputs(inputs: ShapeInputs): Shape {
  return {
    rows: readIntegerInput(inputs.rows),
    cols: readIntegerInput(inputs.cols),
  };
}

function writeShapeToInputs(inputs: ShapeInputs, shape: Shape) {
  inputs.rows.value = String(shape.rows);
  inputs.cols.value = String(shape.cols);
}

function readIntegerInput(input: HTMLInputElement): number {
  const value = input.valueAsNumber;
  if (Number.isNaN(value) || !Number.isFinite(value) || value < 1) {
    return 0;
  }
  return Math.floor(value);
}

function getShapeInputs(): ShapeInputs {
  return {
    rows: getRequiredInput("shape-rows"),
    cols: getRequiredInput("shape-cols"),
  };
}

function getPresetContainer(): HTMLElement {
  const container = document.getElementById("shape-presets");
  if (!(container instanceof HTMLElement)) {
    throw new Error("프리셋 컨테이너 요소를 찾을 수 없습니다.");
  }

  return container;
}

function getRequiredInput(id: string): HTMLInputElement {
  const element = document.getElementById(id);
  if (!(element instanceof HTMLInputElement)) {
    throw new Error(`${id} 입력 요소를 찾을 수 없습니다.`);
  }

  return element;
}
