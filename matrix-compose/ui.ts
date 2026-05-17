import { getMatchingPairPresetLabel, matrixPairPresets } from "./data.js";
import { cloneMatrix } from "../shared/matrix.js";
import type { Matrix } from "../shared/types.js";

type MatrixPairChangeHandler = (a: Matrix, b: Matrix) => void;

type MatrixInputMap = {
  a: HTMLInputElement;
  b: HTMLInputElement;
  c: HTMLInputElement;
  d: HTMLInputElement;
};

/**
 * 행렬 A, B 입력 4칸 두 세트와 페어 프리셋 버튼을 초기화한다.
 * 어느 칸이라도 값이 바뀌면 콜백이 (A, B) 두 행렬을 함께 전달한다.
 */
export function setupMatrixControls(
  initialA: Matrix,
  initialB: Matrix,
  onPairChange: MatrixPairChangeHandler,
) {
  const inputsA = getMatrixInputs("matrix-A");
  const inputsB = getMatrixInputs("matrix-B");
  const presetContainer = getPresetContainer();
  const presetButtons = new Map<string, HTMLButtonElement>();

  writeMatrixToInputs(inputsA, initialA);
  writeMatrixToInputs(inputsB, initialB);

  renderPresetButtons(presetContainer, presetButtons, (presetA, presetB) => {
    writeMatrixToInputs(inputsA, presetA);
    writeMatrixToInputs(inputsB, presetB);
    applyChange(presetA, presetB, presetButtons, onPairChange);
  });
  updatePresetSelection(presetButtons, getMatchingPairPresetLabel(initialA, initialB));

  const emitChange = () => {
    const nextA = readMatrixFromInputs(inputsA);
    const nextB = readMatrixFromInputs(inputsB);
    applyChange(nextA, nextB, presetButtons, onPairChange);
  };

  for (const input of [...Object.values(inputsA), ...Object.values(inputsB)]) {
    input.addEventListener("input", emitChange);
  }
}

function applyChange(
  a: Matrix,
  b: Matrix,
  presetButtons: Map<string, HTMLButtonElement>,
  onPairChange: MatrixPairChangeHandler,
) {
  updatePresetSelection(presetButtons, getMatchingPairPresetLabel(a, b));
  onPairChange(a, b);
}

function renderPresetButtons(
  container: HTMLElement,
  buttonMap: Map<string, HTMLButtonElement>,
  onSelect: (a: Matrix, b: Matrix) => void,
) {
  container.replaceChildren();
  buttonMap.clear();

  for (const preset of matrixPairPresets) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "preset-button";
    button.textContent = preset.label;
    button.addEventListener("click", () => {
      onSelect(cloneMatrix(preset.a), cloneMatrix(preset.b));
    });
    buttonMap.set(preset.label, button);
    container.appendChild(button);
  }
}

function updatePresetSelection(
  buttonMap: Map<string, HTMLButtonElement>,
  activeLabel: string | null,
) {
  for (const [label, button] of buttonMap) {
    const isActive = label === activeLabel;
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

function getMatrixInputs(idPrefix: string): MatrixInputMap {
  return {
    a: getRequiredInput(`${idPrefix}-a`),
    b: getRequiredInput(`${idPrefix}-b`),
    c: getRequiredInput(`${idPrefix}-c`),
    d: getRequiredInput(`${idPrefix}-d`),
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
