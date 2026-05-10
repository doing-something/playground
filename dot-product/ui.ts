import {
  DEFAULT_ROTATION_DEGREES,
  getMatchingPresetLabel,
  matrixPresets,
} from "./data.js";
import { createRotationMatrix, getRotationDegrees } from "./math.js";
import type { Matrix } from "./types.js";

type MatrixChangeHandler = (matrix: Matrix, transformName: string) => void;

type MatrixInputMap = {
  a: HTMLInputElement;
  b: HTMLInputElement;
  c: HTMLInputElement;
  d: HTMLInputElement;
};

type RotationControls = {
  resetButton: HTMLButtonElement;
  slider: HTMLInputElement;
  value: HTMLElement;
};

/**
 * 행렬 입력 UI를 초기화하고, 값이 바뀔 때마다 콜백을 호출한다.
 *
 * @param initialMatrix 입력칸에 표시할 초기 2x2 행렬
 * @param onMatrixChange 사용자가 값을 바꿨을 때 호출할 함수. 두 번째 인자는 현재 변환 이름이다.
 */
export function setupMatrixControls(
  initialMatrix: Matrix,
  onMatrixChange: MatrixChangeHandler,
) {
  const inputs = getMatrixInputs();
  const preview = getMatrixPreview();
  const presetContainer = getPresetContainer();
  const presetButtons = new Map<string, HTMLButtonElement>();
  const rotationControls = getRotationControls();
  const initialActivePreset = getActivePresetLabel(initialMatrix);
  const initialRotationDegrees = getRotationDegrees(initialMatrix);

  writeMatrixToInputs(inputs, initialMatrix);
  updateRotationSlider(rotationControls, DEFAULT_ROTATION_DEGREES);
  renderPresetButtons(presetContainer, presetButtons, (presetMatrix, presetLabel) => {
    const nextMatrix = presetLabel === "회전"
      ? createRotationMatrix(readRotationSliderValue(rotationControls.slider))
      : presetMatrix;

    writeMatrixToInputs(inputs, nextMatrix);
    applyMatrixChange(
      nextMatrix,
      presetLabel,
      preview,
      presetButtons,
      rotationControls,
      onMatrixChange,
    );
  });
  updateMatrixPreview(preview, initialMatrix);
  updatePresetSelection(presetButtons, initialActivePreset);
  if (initialRotationDegrees !== null) {
    updateRotationSlider(rotationControls, initialRotationDegrees);
  }

  const emitMatrixChange = () => {
    const nextMatrix = readMatrixFromInputs(inputs);
    applyMatrixChange(
      nextMatrix,
      getActivePresetLabel(nextMatrix),
      preview,
      presetButtons,
      rotationControls,
      onMatrixChange,
    );
  };

  for (const input of Object.values(inputs)) {
    input.addEventListener("input", emitMatrixChange);
  }

  rotationControls.slider.addEventListener("input", () => {
    const nextMatrix = createRotationMatrix(readRotationSliderValue(rotationControls.slider));
    writeMatrixToInputs(inputs, nextMatrix);
    applyMatrixChange(
      nextMatrix,
      "회전",
      preview,
      presetButtons,
      rotationControls,
      onMatrixChange,
    );
  });

  rotationControls.resetButton.addEventListener("click", () => {
    const nextMatrix = createRotationMatrix(0);
    writeMatrixToInputs(inputs, nextMatrix);
    applyMatrixChange(
      nextMatrix,
      getActivePresetLabel(nextMatrix),
      preview,
      presetButtons,
      rotationControls,
      onMatrixChange,
    );
  });
}

/**
 * 화면에 표시된 행렬을 사람이 읽기 쉬운 문자열로 바꾼다.
 *
 * @param matrix 문자열로 바꿀 2x2 행렬
 * @returns 코드 블록에 넣을 행렬 문자열
 */
function formatMatrix(matrix: Matrix): string {
  return `[[${matrix[0].map(formatNumber).join(", ")}], [${matrix[1].map(formatNumber).join(", ")}]]`;
}

/**
 * 행렬 미리보기 텍스트를 현재 값으로 갱신한다.
 *
 * @param preview 행렬 문자열을 보여주는 요소
 * @param matrix 현재 2x2 행렬
 */
function updateMatrixPreview(preview: HTMLElement, matrix: Matrix) {
  preview.textContent = formatMatrix(matrix);
}

/**
 * 숫자를 짧고 읽기 쉬운 문자열로 바꾼다.
 *
 * @param value 표시할 숫자
 * @returns 정수는 그대로, 소수는 넷째 자리까지 정리한 문자열
 */
function formatNumber(value: number): string {
  return Number.isInteger(value)
    ? String(value)
    : value.toFixed(4).replace(/\.?0+$/, "");
}

/**
 * 프리셋 상태, 회전 슬라이더, 미리보기를 한 번에 갱신하고 콜백을 호출한다.
 *
 * @param matrix 현재 반영할 행렬
 * @param activePresetLabel 활성 프리셋 이름. 프리셋이 없으면 null
 * @param preview 행렬 미리보기 요소
 * @param presetButtons 프리셋 버튼 매핑
 * @param rotationControls 회전 슬라이더와 각도 표시 요소
 * @param onMatrixChange 상태 변경 콜백
 */
function applyMatrixChange(
  matrix: Matrix,
  activePresetLabel: string | null,
  preview: HTMLElement,
  presetButtons: Map<string, HTMLButtonElement>,
  rotationControls: RotationControls,
  onMatrixChange: MatrixChangeHandler,
) {
  const transformName = formatTransformName(matrix, activePresetLabel);
  const rotationDegrees = getRotationDegrees(matrix);

  updateMatrixPreview(preview, matrix);
  updatePresetSelection(presetButtons, activePresetLabel);
  if (rotationDegrees !== null) {
    updateRotationSlider(rotationControls, rotationDegrees);
  }
  onMatrixChange(matrix, transformName);
}

/**
 * 입력칸 네 개를 읽어서 2x2 행렬로 만든다.
 *
 * 비어 있는 값은 0으로 간주해서, 입력 도중에도 데모가 계속 동작하게 한다.
 *
 * @param inputs 행렬 원소 입력칸 묶음
 * @returns 입력값으로 만들어진 2x2 행렬
 */
function readMatrixFromInputs(inputs: MatrixInputMap): Matrix {
  return [
    [readNumberInput(inputs.a), readNumberInput(inputs.b)],
    [readNumberInput(inputs.c), readNumberInput(inputs.d)],
  ];
}

/**
 * 주어진 행렬 값을 입력칸 네 개에 채운다.
 *
 * @param inputs 행렬 원소 입력칸 묶음
 * @param matrix 입력칸에 보여줄 2x2 행렬
 */
function writeMatrixToInputs(inputs: MatrixInputMap, matrix: Matrix) {
  inputs.a.value = String(matrix[0][0]);
  inputs.b.value = String(matrix[0][1]);
  inputs.c.value = String(matrix[1][0]);
  inputs.d.value = String(matrix[1][1]);
}

/**
 * 숫자 입력칸 값을 읽어 Number로 변환한다.
 *
 * @param input 읽을 input 요소
 * @returns 유효한 숫자 값. 비어 있거나 잘못된 값이면 0
 */
function readNumberInput(input: HTMLInputElement): number {
  return Number.isNaN(input.valueAsNumber) ? 0 : input.valueAsNumber;
}

/**
 * 행렬 입력칸 네 개를 DOM에서 찾는다.
 *
 * @returns a, b, c, d 입력 요소 묶음
 * @throws {Error} 필요한 입력 요소를 찾지 못한 경우
 */
function getMatrixInputs(): MatrixInputMap {
  return {
    a: getRequiredInput("matrix-a"),
    b: getRequiredInput("matrix-b"),
    c: getRequiredInput("matrix-c"),
    d: getRequiredInput("matrix-d"),
  };
}

/**
 * 현재 행렬을 보여줄 미리보기 요소를 DOM에서 찾는다.
 *
 * @returns 행렬 문자열을 표시하는 요소
 * @throws {Error} 필요한 미리보기 요소를 찾지 못한 경우
 */
function getMatrixPreview(): HTMLElement {
  const preview = document.getElementById("matrix-preview");
  if (!(preview instanceof HTMLElement)) {
    throw new Error("행렬 미리보기 요소를 찾을 수 없습니다.");
  }

  return preview;
}

/**
 * 프리셋 버튼이 들어갈 컨테이너를 DOM에서 찾는다.
 *
 * @returns 프리셋 버튼 영역 요소
 * @throws {Error} 필요한 컨테이너 요소를 찾지 못한 경우
 */
function getPresetContainer(): HTMLElement {
  const container = document.getElementById("matrix-presets");
  if (!(container instanceof HTMLElement)) {
    throw new Error("프리셋 컨테이너 요소를 찾을 수 없습니다.");
  }

  return container;
}

/**
 * 회전 각도 슬라이더와 각도 표시 요소를 DOM에서 찾는다.
 *
 * @returns 회전 슬라이더 관련 요소 묶음
 * @throws {Error} 필요한 회전 컨트롤 요소를 찾지 못한 경우
 */
function getRotationControls(): RotationControls {
  const resetButton = document.getElementById("rotation-reset");
  const slider = document.getElementById("rotation-angle");
  const value = document.getElementById("rotation-angle-value");

  if (!(resetButton instanceof HTMLButtonElement)) {
    throw new Error("회전 초기화 버튼을 찾을 수 없습니다.");
  }

  if (!(slider instanceof HTMLInputElement)) {
    throw new Error("회전 각도 슬라이더를 찾을 수 없습니다.");
  }

  if (!(value instanceof HTMLElement)) {
    throw new Error("회전 각도 표시 요소를 찾을 수 없습니다.");
  }

  return { resetButton, slider, value };
}

/**
 * 대표 행렬을 한 번에 적용할 수 있는 프리셋 버튼들을 만든다.
 *
 * @param container 버튼을 렌더링할 부모 요소
 * @param buttonMap 프리셋 이름과 버튼 요소를 저장할 매핑
 * @param onPresetSelect 프리셋을 눌렀을 때 호출할 함수
 */
function renderPresetButtons(
  container: HTMLElement,
  buttonMap: Map<string, HTMLButtonElement>,
  onPresetSelect: (matrix: Matrix, label: string) => void,
) {
  container.replaceChildren();
  buttonMap.clear();

  for (const preset of matrixPresets) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "preset-button";
    button.textContent = preset.label;
    button.addEventListener("click", () => {
      onPresetSelect(cloneMatrix(preset.matrix), preset.label);
    });
    buttonMap.set(preset.label, button);
    container.appendChild(button);
  }
}

/**
 * 현재 선택 상태에 맞춰 프리셋 버튼의 활성 스타일을 갱신한다.
 *
 * 프리셋과 일치하지 않는 직접 입력 상태라면 모든 버튼의 활성 표시를 제거한다.
 *
 * @param buttonMap 프리셋 이름과 버튼 요소 매핑
 * @param transformName 현재 변환 이름
 */
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

/**
 * 현재 행렬이 어떤 프리셋에 해당하는지 판단한다.
 *
 * 정확히 일치하는 프리셋이 우선이며, 그렇지 않아도 순수 회전이면 `회전`으로 취급한다.
 *
 * @param matrix 검사할 2x2 행렬
 * @returns 활성 프리셋 이름. 없으면 null
 */
function getActivePresetLabel(matrix: Matrix): string | null {
  return getMatchingPresetLabel(matrix) ?? (getRotationDegrees(matrix) !== null ? "회전" : null);
}

/**
 * 설명 패널에 보여줄 현재 변환 이름을 만든다.
 *
 * @param matrix 현재 2x2 행렬
 * @param activePresetLabel 활성 프리셋 이름
 * @returns 사용자가 읽을 변환 이름
 */
function formatTransformName(matrix: Matrix, activePresetLabel: string | null): string {
  const rotationDegrees = getRotationDegrees(matrix);

  if (activePresetLabel === "회전" && rotationDegrees !== null) {
    return `회전 (${formatDegrees(rotationDegrees)}도)`;
  }

  return activePresetLabel ?? "직접 입력";
}

/**
 * 회전 슬라이더 값을 읽어 도 단위 숫자로 돌려준다.
 *
 * @param slider 회전 각도 range input
 * @returns 현재 슬라이더 각도
 */
function readRotationSliderValue(slider: HTMLInputElement): number {
  return Number.isNaN(slider.valueAsNumber) ? DEFAULT_ROTATION_DEGREES : slider.valueAsNumber;
}

/**
 * 회전 슬라이더와 각도 표시를 같은 값으로 맞춘다.
 *
 * @param controls 회전 슬라이더 관련 요소
 * @param degrees 표시할 회전 각도
 */
function updateRotationSlider(controls: RotationControls, degrees: number) {
  controls.slider.value = String(degrees);
  controls.value.textContent = `${formatDegrees(degrees)}도`;
}

/**
 * 각도를 화면 표시용 문자열로 정리한다.
 *
 * @param degrees 표시할 각도
 * @returns 정수면 정수로, 아니면 소수 첫째 자리까지 남긴 문자열
 */
function formatDegrees(degrees: number): string {
  return Number.isInteger(degrees)
    ? String(degrees)
    : degrees.toFixed(1).replace(/\.?0+$/, "");
}

/**
 * 행렬 값을 독립적인 새 배열로 복사한다.
 *
 * @param matrix 복사할 2x2 행렬
 * @returns 같은 값을 가진 새 행렬
 */
function cloneMatrix(matrix: Matrix): Matrix {
  return matrix.map((row) => [...row]);
}

/**
 * 주어진 id의 input 요소를 찾고, 없으면 예외를 던진다.
 *
 * @param id 찾을 input 요소의 id
 * @returns 찾은 input 요소
 * @throws {Error} input 요소를 찾지 못한 경우
 */
function getRequiredInput(id: string): HTMLInputElement {
  const element = document.getElementById(id);
  if (!(element instanceof HTMLInputElement)) {
    throw new Error(`${id} 입력 요소를 찾을 수 없습니다.`);
  }

  return element;
}
