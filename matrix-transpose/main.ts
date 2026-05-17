import { getCanvasContext } from "../shared/canvas2d.js";
import { transpose } from "../shared/matrix.js";
import type { Matrix } from "../shared/types.js";
import {
  BASIS_VECTORS,
  CANVAS_ID,
  DEFAULT_MATRIX,
  UNIT_SQUARE,
} from "./data.js";
import { renderExplanation } from "./explain.js";
import { renderScene } from "./render.js";
import { setupMatrixControls } from "./ui.js";

function renderCurrent(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  matrix: Matrix,
) {
  const transposeMatrix = transpose(matrix);

  renderScene(canvas, ctx, {
    matrix,
    transposeMatrix,
    unitSquare: UNIT_SQUARE,
    basisVectors: BASIS_VECTORS,
  });
  renderExplanation(matrix, transposeMatrix);
}

function main() {
  const { canvas, ctx } = getCanvasContext(CANVAS_ID);
  let currentMatrix = cloneMatrix(DEFAULT_MATRIX);

  setupMatrixControls(currentMatrix, (nextMatrix) => {
    currentMatrix = cloneMatrix(nextMatrix);
    renderCurrent(canvas, ctx, currentMatrix);
  });

  renderCurrent(canvas, ctx, currentMatrix);
}

function cloneMatrix(source: Matrix): Matrix {
  return source.map((row) => [...row]);
}

main();
