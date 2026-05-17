import { getCanvasContext } from "../shared/canvas2d.js";
import { renderDemoShell } from "../shared/demo-shell.js";
import {
  accumulateMatrix,
  CANVAS_ID,
  DEFAULT_STEPS,
  UNIT_SQUARE,
  type Step,
} from "./data.js";
import { renderExplanation } from "./explain.js";
import { renderScene } from "./render.js";
import {
  ANALYSIS_HTML,
  CANVAS_HTML,
  CONTROLS_HTML,
  INTRO_HTML,
} from "./templates.js";
import { setupStepControls } from "./ui.js";

function renderCurrent(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  steps: Step[],
) {
  const matrix = accumulateMatrix(steps);
  renderScene(canvas, ctx, { matrix, unitSquare: UNIT_SQUARE });
  renderExplanation(matrix, steps);
}

function main() {
  renderDemoShell({
    title: "Canvas 행렬 살펴보기",
    intro: INTRO_HTML,
    controls: CONTROLS_HTML,
    canvas: CANVAS_HTML,
    analysis: ANALYSIS_HTML,
  });

  const { canvas, ctx } = getCanvasContext(CANVAS_ID);

  setupStepControls(DEFAULT_STEPS, (steps) => {
    renderCurrent(canvas, ctx, steps);
  });
}

main();
