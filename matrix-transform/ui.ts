import { getMatchingPresetLabel, matrixPresets } from "./data.js";
import { cloneMatrix, createRotationMatrix, getRotationDegrees } from "../shared/matrix.js";
import type { Matrix } from "../shared/types.js";

type MatrixChangeHandler = (matrix: Matrix, transformName: string) => void;

type MatrixInputMap = {
  a: HTMLInputElement;
  b: HTMLInputElement;
  c: HTMLInputElement;
  d: HTMLInputElement;
};

type RotationControls = {
  shortcutButtons: HTMLButtonElement[];
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
  updateRotationShortcutSelection(rotationControls, initialRotationDegrees);
  renderPresetButtons(presetContainer, presetButtons, (presetMatrix, presetLabel) => {
    writeMatrixToInputs(inputs, presetMatrix);
    applyMatrixChange(
      presetMatrix,
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
    updateRotationShortcutSelection(rotationControls, initialRotationDegrees);
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

  for (const button of rotationControls.shortcutButtons) {
    button.addEventListener("click", () => {
      const angle = Number(button.dataset.angle);
      const nextMatrix = createRotationMatrix(angle);
      writeMatrixToInputs(inputs, nextMatrix);
      applyMatrixChange(
        nextMatrix,
        null,
        preview,
        presetButtons,
        rotationControls,
        onMatrixChange,
      );
    });
  }
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
 * 프리셋 상태, 회전 버튼 상태, 미리보기를 한 번에 갱신하고 콜백을 호출한다.
 *
 * @param matrix 현재 반영할 행렬
 * @param activePresetLabel 활성 프리셋 이름. 프리셋이 없으면 null
 * @param preview 행렬 미리보기 요소
 * @param presetButtons 프리셋 버튼 매핑
 * @param rotationControls 회전 각도 버튼 요소
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
  updateRotationShortcutSelection(rotationControls, rotationDegrees);
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
 * 회전 각도 버튼들을 DOM에서 찾는다.
 *
 * @returns 회전 컨트롤 요소 묶음
 * @throws {Error} 필요한 회전 컨트롤 요소를 찾지 못한 경우
 */
function getRotationControls(): RotationControls {
  const shortcutButtons = Array.from(
    document.querySelectorAll<HTMLButtonElement>(".rotation-shortcut"),
  );

  if (shortcutButtons.length === 0) {
    throw new Error("회전 빠른 각도 버튼을 찾을 수 없습니다.");
  }

  return {
    shortcutButtons,
  };
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
 * @param matrix 검사할 2x2 행렬
 * @returns 활성 프리셋 이름. 없으면 null
 */
function getActivePresetLabel(matrix: Matrix): string | null {
  return getMatchingPresetLabel(matrix);
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

  if (rotationDegrees !== null) {
    return `회전 (${formatDegrees(rotationDegrees)}도)`;
  }

  return activePresetLabel ?? "직접 입력";
}

/**
 * 현재 회전 각도에 맞는 빠른 각도 버튼을 활성화한다.
 *
 * 대표 각도와 정확히 일치하지 않으면 모든 버튼 활성 표시를 제거한다.
 *
 * @param controls 회전 컨트롤 관련 요소
 * @param degrees 현재 회전 각도. 회전이 아니면 null
 */
function updateRotationShortcutSelection(
  controls: RotationControls,
  degrees: number | null,
) {
  const activeAngle = degrees === null ? null : formatDegrees(degrees);

  for (const button of controls.shortcutButtons) {
    const angle = button.dataset.angle;
    const isActive = angle === activeAngle;

    button.classList.toggle("rotation-shortcut-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  }
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
