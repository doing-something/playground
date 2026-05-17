import type { Matrix } from "../shared/types.js";

type ExplanationElements = {
  matrixA: HTMLElement;
  matrixB: HTMLElement;
  matrixC: HTMLElement;
};

/**
 * 현재 A, B, C(=A·B)를 분석 패널에 표시한다.
 */
export function renderExplanation(a: Matrix, b: Matrix, c: Matrix) {
  const elements = getExplanationElements();

  elements.matrixA.textContent = formatMatrix(a);
  elements.matrixB.textContent = formatMatrix(b);
  elements.matrixC.textContent = formatMatrix(c);
}

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

function getExplanationElements(): ExplanationElements {
  return {
    matrixA: getRequiredElement("matrix-A-display"),
    matrixB: getRequiredElement("matrix-B-display"),
    matrixC: getRequiredElement("matrix-C-display"),
  };
}

function getRequiredElement(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (!(element instanceof HTMLElement)) {
    throw new Error(`${id} 요소를 찾을 수 없습니다.`);
  }

  return element;
}
