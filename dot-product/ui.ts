import type { Matrix } from "./types.js";

type MatrixChangeHandler = (matrix: Matrix) => void;

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
 * @param onMatrixChange 사용자가 값을 바꿨을 때 호출할 함수
 */
export function setupMatrixControls(
  initialMatrix: Matrix,
  onMatrixChange: MatrixChangeHandler,
) {
  const inputs = getMatrixInputs();
  const preview = getMatrixPreview();

  writeMatrixToInputs(inputs, initialMatrix);
  updateMatrixPreview(preview, initialMatrix);

  const emitMatrixChange = () => {
    const nextMatrix = readMatrixFromInputs(inputs);
    updateMatrixPreview(preview, nextMatrix);
    onMatrixChange(nextMatrix);
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
