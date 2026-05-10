import { getMatchingPresetLabel, matrixPresets } from "./data.js";
import type { Matrix } from "./types.js";

type MatrixChangeHandler = (matrix: Matrix, transformName: string) => void;

type MatrixInputMap = {
  a: HTMLInputElement;
  b: HTMLInputElement;
  c: HTMLInputElement;
  d: HTMLInputElement;
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

  writeMatrixToInputs(inputs, initialMatrix);
  updateMatrixPreview(preview, initialMatrix);
  renderPresetButtons(presetContainer, presetButtons, (presetMatrix, presetLabel) => {
    writeMatrixToInputs(inputs, presetMatrix);
    updateMatrixPreview(preview, presetMatrix);
    updatePresetSelection(presetButtons, presetLabel);
    onMatrixChange(presetMatrix, presetLabel);
  });
  updatePresetSelection(presetButtons, getMatchingPresetLabel(initialMatrix) ?? "직접 입력");

  const emitMatrixChange = () => {
    const nextMatrix = readMatrixFromInputs(inputs);
    const transformName = getMatchingPresetLabel(nextMatrix) ?? "직접 입력";

    updateMatrixPreview(preview, nextMatrix);
    updatePresetSelection(presetButtons, transformName);
    onMatrixChange(nextMatrix, transformName);
  };

  for (const input of Object.values(inputs)) {
    input.addEventListener("input", emitMatrixChange);
  }
}

/**
 * 화면에 표시된 행렬을 사람이 읽기 쉬운 문자열로 바꾼다.
 *
 * @param matrix 문자열로 바꿀 2x2 행렬
 * @returns 코드 블록에 넣을 행렬 문자열
 */
function formatMatrix(matrix: Matrix): string {
  return `[[${matrix[0][0]}, ${matrix[0][1]}], [${matrix[1][0]}, ${matrix[1][1]}]]`;
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
  transformName: string,
) {
  for (const [label, button] of buttonMap) {
    const isActive = label === transformName;
    button.classList.toggle("preset-button-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  }
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
