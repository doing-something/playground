import type { Matrix, Vector } from "./types.js";

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
