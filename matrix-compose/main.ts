import { getCanvasContext } from "../shared/canvas2d.js";
import { renderDemoShell } from "../shared/demo-shell.js";
import { cloneMatrix, multiplyMatrices } from "../shared/matrix.js";
import type { Matrix } from "../shared/types.js";
import {
  CANVAS_ID,
  DEFAULT_MATRIX_A,
  DEFAULT_MATRIX_B,
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
  a: Matrix,
  b: Matrix,
) {
  const c = multiplyMatrices(a, b);

  renderScene(canvas, ctx, {
    a,
    b,
    unitSquare: UNIT_SQUARE,
  });
  renderExplanation(a, b, c);
}

function main() {
  renderDemoShell({
    title: "행렬 곱셈 = 변환의 합성",
    intro: INTRO_HTML,
    controls: CONTROLS_HTML,
    canvas: CANVAS_HTML,
    analysis: ANALYSIS_HTML,
  });

  const { canvas, ctx } = getCanvasContext(CANVAS_ID);
  let currentA = cloneMatrix(DEFAULT_MATRIX_A);
  let currentB = cloneMatrix(DEFAULT_MATRIX_B);

  setupMatrixControls(currentA, currentB, (nextA, nextB) => {
    currentA = cloneMatrix(nextA);
    currentB = cloneMatrix(nextB);
    renderCurrent(canvas, ctx, currentA, currentB);
  });

  renderCurrent(canvas, ctx, currentA, currentB);
}

main();
