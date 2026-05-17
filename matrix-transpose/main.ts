import { getCanvasContext } from "../shared/canvas2d.js";
import { renderDemoShell } from "../shared/demo-shell.js";
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
import {
  ANALYSIS_HTML,
  CANVAS_HTML,
  CONTROLS_HTML,
  INTRO_HTML,
} from "./templates.js";
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
  renderDemoShell({
    title: "전치 시각화: A와 Aᵀ 비교",
    intro: INTRO_HTML,
    controls: CONTROLS_HTML,
    canvas: CANVAS_HTML,
    analysis: ANALYSIS_HTML,
  });

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
