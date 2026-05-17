export const CANVAS_ID = "reshape-canvas";

export const ORIGINAL_HEIGHT = 4;
export const ORIGINAL_WIDTH = 4;
export const TOTAL_ELEMENTS = ORIGINAL_HEIGHT * ORIGINAL_WIDTH;

export type Shape = { rows: number; cols: number };

export const DEFAULT_SHAPE: Shape = { rows: 1, cols: 16 };

export const shapePresets: Shape[] = [
  { rows: 1, cols: 16 },
  { rows: 2, cols: 8 },
  { rows: 4, cols: 4 },
  { rows: 8, cols: 2 },
  { rows: 16, cols: 1 },
];

export function shapeLabel(shape: Shape): string {
  return `(${shape.rows}, ${shape.cols})`;
}

export function isValidReshape(shape: Shape): boolean {
  return shape.rows * shape.cols === TOTAL_ELEMENTS;
}

export function isSameShape(left: Shape, right: Shape): boolean {
  return left.rows === right.rows && left.cols === right.cols;
}
