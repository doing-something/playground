import { getRotationDegrees } from "../shared/matrix.js";
import type { Matrix } from "../shared/types.js";

type ExplanationElements = {
  matrixDisplay: HTMLElement;
  transposeDisplay: HTMLElement;
  summary: HTMLElement;
};

/**
 * 현재 A와 Aᵀ를 화면에 표시하고, 두 행렬의 관계를 한 줄로 설명한다.
 */
export function renderExplanation(matrix: Matrix, transposeMatrix: Matrix) {
  const elements = getExplanationElements();

  elements.matrixDisplay.textContent = formatMatrix(matrix);
  elements.transposeDisplay.textContent = formatMatrix(transposeMatrix);
  elements.summary.textContent = buildSummary(matrix, transposeMatrix);
}

/**
 * 행렬 모양에 맞춰 학습용 한 줄 설명을 만든다.
 *
 * 대칭/회전/shear/일반 네 가지 분기로 나눈다.
 */
function buildSummary(matrix: Matrix, transposeMatrix: Matrix): string {
  if (isSameMatrix(matrix, transposeMatrix)) {
    return "대칭행렬: A = Aᵀ. 전치해도 같은 행렬이라 두 도형이 완전히 겹칩니다.";
  }

  const rotationDegrees = getRotationDegrees(matrix);
  if (rotationDegrees !== null && rotationDegrees !== 0) {
    return `회전 행렬은 Aᵀ = A⁻¹입니다. 전치는 ${formatDegrees(-rotationDegrees)}도 회전(반대 방향)이 됩니다.`;
  }

  const [[a, b], [c, d]] = matrix;
  if (a === 1 && d === 1 && b !== 0 && c === 0) {
    return "x-shear(위쪽 변이 옆으로 밀림). 전치하면 오른쪽 변이 위로 밀리는 y-shear가 됩니다.";
  }
  if (a === 1 && d === 1 && c !== 0 && b === 0) {
    return "y-shear(오른쪽 변이 위로 밀림). 전치하면 x-shear가 됩니다.";
  }

  return "Aᵀ는 A의 성분 b와 c를 뒤바꿉니다. 일반적으로 다른 변환이 되며, 길이·방향이 함께 달라집니다.";
}

/**
 * 2x2 행렬을 한 줄 문자열로 만든다.
 */
function formatMatrix(matrix: Matrix): string {
  return `[[${formatRow(matrix[0])}], [${formatRow(matrix[1])}]]`;
}

function formatRow(row: number[]): string {
  return row.map(formatNumber).join(", ");
}

function formatNumber(value: number): string {
  return Number.isInteger(value)
    ? String(value)
    : value.toFixed(4).replace(/\.?0+$/, "");
}

function formatDegrees(degrees: number): string {
  return Number.isInteger(degrees)
    ? String(degrees)
    : degrees.toFixed(1).replace(/\.?0+$/, "");
}

function isSameMatrix(left: Matrix, right: Matrix): boolean {
  return left.every((row, rowIndex) =>
    row.every((value, columnIndex) => value === right[rowIndex][columnIndex]),
  );
}

function getExplanationElements(): ExplanationElements {
  return {
    matrixDisplay: getRequiredElement("matrix-display"),
    transposeDisplay: getRequiredElement("transpose-display"),
    summary: getRequiredElement("transpose-summary"),
  };
}

function getRequiredElement(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (!(element instanceof HTMLElement)) {
    throw new Error(`${id} 요소를 찾을 수 없습니다.`);
  }

  return element;
}
