import { getMatchingPresetLabel, matrixPresets } from "./data.js";
import { cloneMatrix } from "../shared/matrix.js";
import type { Matrix } from "../shared/types.js";

type MatrixChangeHandler = (matrix: Matrix) => void;

type MatrixInputMap = {
  a: HTMLInputElement;
  b: HTMLInputElement;
  c: HTMLInputElement;
  d: HTMLInputElement;
};

/**
 * 행렬 입력 4칸과 프리셋 버튼을 초기화하고, 값이 바뀔 때마다 콜백을 호출한다.
 */
export function setupMatrixControls(
  initialMatrix: Matrix,
  onMatrixChange: MatrixChangeHandler,
) {
  const inputs = getMatrixInputs();
  const presetContainer = getPresetContainer();
  const presetButtons = new Map<string, HTMLButtonElement>();

  writeMatrixToInputs(inputs, initialMatrix);
  renderPresetButtons(presetContainer, presetButtons, (presetMatrix) => {
    writeMatrixToInputs(inputs, presetMatrix);
    applyChange(presetMatrix, presetButtons, onMatrixChange);
  });
  updatePresetSelection(presetButtons, getMatchingPresetLabel(initialMatrix));

  const emitChange = () => {
    const nextMatrix = readMatrixFromInputs(inputs);
    applyChange(nextMatrix, presetButtons, onMatrixChange);
  };

  for (const input of Object.values(inputs)) {
    input.addEventListener("input", emitChange);
  }
}

function applyChange(
  matrix: Matrix,
  presetButtons: Map<string, HTMLButtonElement>,
  onMatrixChange: MatrixChangeHandler,
) {
  updatePresetSelection(presetButtons, getMatchingPresetLabel(matrix));
  onMatrixChange(matrix);
}

function renderPresetButtons(
  container: HTMLElement,
  buttonMap: Map<string, HTMLButtonElement>,
  onPresetSelect: (matrix: Matrix) => void,
) {
  container.replaceChildren();
  buttonMap.clear();

  for (const preset of matrixPresets) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "preset-button";
    button.textContent = preset.label;
    button.addEventListener("click", () => {
      onPresetSelect(cloneMatrix(preset.matrix));
    });
    buttonMap.set(preset.label, button);
    container.appendChild(button);
  }
}

function updatePresetSelection(
  buttonMap: Map<string, HTMLButtonElement>,
  activePresetLabel: string | null,
) {
  for (const [label, button] of buttonMap) {
    const isActive = label === activePresetLabel;
    button.classList.toggle("preset-button-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  }
}

function readMatrixFromInputs(inputs: MatrixInputMap): Matrix {
  return [
    [readNumberInput(inputs.a), readNumberInput(inputs.b)],
    [readNumberInput(inputs.c), readNumberInput(inputs.d)],
  ];
}

function writeMatrixToInputs(inputs: MatrixInputMap, matrix: Matrix) {
  inputs.a.value = formatNumber(matrix[0][0]);
  inputs.b.value = formatNumber(matrix[0][1]);
  inputs.c.value = formatNumber(matrix[1][0]);
  inputs.d.value = formatNumber(matrix[1][1]);
}

function readNumberInput(input: HTMLInputElement): number {
  return Number.isNaN(input.valueAsNumber) ? 0 : input.valueAsNumber;
}

function formatNumber(value: number): string {
  return Number.isInteger(value)
    ? String(value)
    : value.toFixed(4).replace(/\.?0+$/, "");
}

function getMatrixInputs(): MatrixInputMap {
  return {
    a: getRequiredInput("matrix-a"),
    b: getRequiredInput("matrix-b"),
    c: getRequiredInput("matrix-c"),
    d: getRequiredInput("matrix-d"),
  };
}

function getPresetContainer(): HTMLElement {
  const container = document.getElementById("matrix-presets");
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
