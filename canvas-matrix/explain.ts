import type { AffineMatrix } from "./affine.js";
import type { Step } from "./data.js";

/**
 * 누적 행렬을 세 가지 표현으로 보여준다:
 * - 3x3 행렬 (우리 표기)
 * - DOMMatrix 필드 {a..f} (Canvas API 표기)
 * - 동등한 Canvas 코드 시퀀스
 */
export function renderExplanation(matrix: AffineMatrix, steps: Step[]) {
  const matrixEl = getRequiredElement("affine-matrix");
  const domMatrixEl = getRequiredElement("dom-matrix");
  const codeEl = getRequiredElement("equivalent-code");

  matrixEl.textContent = formatMatrix(matrix);
  domMatrixEl.textContent = formatDOMMatrix(matrix);
  codeEl.textContent = stepsToCanvasCode(steps);
}

function formatMatrix(matrix: AffineMatrix): string {
  const rows = matrix.map((row) =>
    "[ " + row.map((v) => padNumber(v)).join(", ") + " ]",
  );
  return rows.join("\n");
}

/**
 * DOMMatrix는 열 우선이라 우리 표기와 위치가 다르다:
 *   a = m[0][0]   c = m[0][1]   e = m[0][2]
 *   b = m[1][0]   d = m[1][1]   f = m[1][2]
 */
function formatDOMMatrix(matrix: AffineMatrix): string {
  const a = formatNumber(matrix[0][0]);
  const b = formatNumber(matrix[1][0]);
  const c = formatNumber(matrix[0][1]);
  const d = formatNumber(matrix[1][1]);
  const e = formatNumber(matrix[0][2]);
  const f = formatNumber(matrix[1][2]);
  return `{
  a: ${a}, b: ${b},
  c: ${c}, d: ${d},
  e: ${e}, f: ${f}
}`;
}

function stepsToCanvasCode(steps: Step[]): string {
  if (steps.length === 0) {
    return "// (변환 단계 없음)";
  }
  return steps
    .map((step) => {
      switch (step.type) {
        case "translate":
          return `ctx.translate(${formatNumber(step.tx)}, ${formatNumber(step.ty)});`;
        case "rotate":
          return `ctx.rotate(${formatNumber((step.degrees * Math.PI) / 180)});  // ${formatNumber(step.degrees)}°`;
        case "scale":
          return `ctx.scale(${formatNumber(step.sx)}, ${formatNumber(step.sy)});`;
      }
    })
    .join("\n");
}

function formatNumber(value: number): string {
  if (Number.isInteger(value)) {
    return String(value);
  }
  const rounded = Math.round(value * 10000) / 10000;
  return rounded.toFixed(4).replace(/\.?0+$/, "");
}

function padNumber(value: number): string {
  const text = formatNumber(value);
  return text.padStart(5, " ");
}

function getRequiredElement(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (!(element instanceof HTMLElement)) {
    throw new Error(`${id} 요소를 찾을 수 없습니다.`);
  }

  return element;
}
