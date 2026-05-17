import { createRotationMatrix } from "../shared/matrix.js";
import type { Matrix, Vector } from "../shared/types.js";

export const CANVAS_ID = "transpose-canvas";

export const UNIT_SQUARE: Vector[] = [
  [0, 0],
  [1, 0],
  [1, 1],
  [0, 1],
];

export const BASIS_VECTORS: Vector[] = [
  [1, 0],
  [0, 1],
];

export const DEFAULT_MATRIX: Matrix = [
  [1, 1],
  [0, 1],
];

export type MatrixPreset = {
  label: string;
  matrix: Matrix;
};

export const matrixPresets: MatrixPreset[] = [
  { label: "단위행렬", matrix: [[1, 0], [0, 1]] },
  { label: "회전 45도", matrix: createRotationMatrix(45) },
  { label: "회전 90도", matrix: createRotationMatrix(90) },
  { label: "x-shear", matrix: [[1, 1], [0, 1]] },
  { label: "대칭행렬", matrix: [[2, 1], [1, 3]] },
  { label: "반사", matrix: [[-1, 0], [0, 1]] },
  { label: "일반 행렬", matrix: [[2, 1], [0, 3]] },
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
