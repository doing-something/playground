import { createRotationMatrix, isSameMatrix } from "../shared/matrix.js";
import type { Matrix, Vector } from "../shared/types.js";

export const CANVAS_ID = "compose-canvas";

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

export const DEFAULT_MATRIX_A: Matrix = createRotationMatrix(45);
export const DEFAULT_MATRIX_B: Matrix = [
  [2, 0],
  [0, 1],
];

export type MatrixPairPreset = {
  label: string;
  a: Matrix;
  b: Matrix;
};

export const matrixPairPresets: MatrixPairPreset[] = [
  {
    label: "회전45° · x축2배확대",
    a: createRotationMatrix(45),
    b: [[2, 0], [0, 1]],
  },
  {
    label: "x축2배확대 · 회전45° (순서 차이)",
    a: [[2, 0], [0, 1]],
    b: createRotationMatrix(45),
  },
  {
    label: "회전90° · 회전45° (= 회전135°)",
    a: createRotationMatrix(90),
    b: createRotationMatrix(45),
  },
  {
    label: "shear · 균일 2배확대",
    a: [[1, 1], [0, 1]],
    b: [[2, 0], [0, 2]],
  },
  {
    label: "x축반사 · 회전90°",
    a: [[-1, 0], [0, 1]],
    b: createRotationMatrix(90),
  },
];

/**
 * 현재 (A, B) 쌍과 일치하는 프리셋이 있으면 그 이름을 돌려준다.
 */
export function getMatchingPairPresetLabel(targetA: Matrix, targetB: Matrix): string | null {
  const preset = matrixPairPresets.find(
    ({ a, b }) => isSameMatrix(a, targetA) && isSameMatrix(b, targetB),
  );
  return preset?.label ?? null;
}
