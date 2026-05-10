import type { Matrix, Vector } from "./types.js";

export type MatrixPreset = {
  label: string;
  matrix: Matrix;
};

export const triangle: Vector[] = [
  [0, 2],
  [-1, 0],
  [1, 0],
];

export const basisVectors: Vector[] = [
  [1, 0],
  [0, 1],
];

// 2배 확대 행렬
export const matrix: Matrix = [
  [2, 0],
  [0, 2],
];

export const CANVAS_ID = "triangle-canvas";

export const matrixPresets: MatrixPreset[] = [
  { label: "단위행렬", matrix: [[1, 0], [0, 1]] },
  { label: "균일 확대", matrix: [[2, 0], [0, 2]] },
  { label: "x축 확대", matrix: [[2, 0], [0, 1]] },
  { label: "y축 확대", matrix: [[1, 0], [0, 2]] },
  { label: "shear", matrix: [[1, 1], [0, 1]] },
  { label: "반사", matrix: [[-1, 0], [0, 1]] },
  { label: "90도 회전", matrix: [[0, -1], [1, 0]] },
];

/**
 * 현재 행렬과 정확히 같은 프리셋이 있으면 그 이름을 돌려준다.
 *
 * @param target 비교할 2x2 행렬
 * @returns 일치하는 프리셋 이름. 없으면 null
 */
export function getMatchingPresetLabel(target: Matrix): string | null {
  const preset = matrixPresets.find(({ matrix }) => isSameMatrix(matrix, target));
  return preset?.label ?? null;
}

/**
 * 두 2x2 행렬이 같은 값을 가지는지 비교한다.
 *
 * @param left 첫 번째 행렬
 * @param right 두 번째 행렬
 * @returns 네 원소가 모두 같으면 true
 */
function isSameMatrix(left: Matrix, right: Matrix): boolean {
  return left.every((row, rowIndex) =>
    row.every((value, columnIndex) => value === right[rowIndex][columnIndex]),
  );
}
