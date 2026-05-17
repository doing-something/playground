import type { Vector } from "../shared/types.js";
import {
  IDENTITY_AFFINE,
  multiplyAffine,
  rotateMatrix,
  scaleMatrix,
  translateMatrix,
  type AffineMatrix,
} from "./affine.js";

export const CANVAS_ID = "canvas-matrix-canvas";

export const UNIT_SQUARE: Vector[] = [
  [0, 0],
  [1, 0],
  [1, 1],
  [0, 1],
];

export type Step =
  | { type: "translate"; tx: number; ty: number }
  | { type: "rotate"; degrees: number }
  | { type: "scale"; sx: number; sy: number };

export const DEFAULT_STEPS: Step[] = [
  { type: "translate", tx: 1.5, ty: 0.5 },
  { type: "rotate", degrees: 45 },
];

export function stepToMatrix(step: Step): AffineMatrix {
  switch (step.type) {
    case "translate":
      return translateMatrix(step.tx, step.ty);
    case "rotate":
      return rotateMatrix(step.degrees);
    case "scale":
      return scaleMatrix(step.sx, step.sy);
  }
}

/**
 * 변환 단계들을 순서대로 누적해 하나의 affine 행렬로 만든다.
 *
 * Canvas API와 같은 방향(curr · new)으로 곱한다. 즉 배열 위쪽 단계가
 * 행렬 곱셈에서는 왼쪽에 오고, 도형에 적용될 때는 가장 나중에 적용된다.
 */
export function accumulateMatrix(steps: Step[]): AffineMatrix {
  return steps.reduce(
    (acc, step) => multiplyAffine(acc, stepToMatrix(step)),
    IDENTITY_AFFINE,
  );
}
