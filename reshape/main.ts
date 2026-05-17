import { getCanvasContext } from "../shared/canvas2d.js";
import { renderDemoShell } from "../shared/demo-shell.js";
import {
  CANVAS_ID,
  DEFAULT_SHAPE,
  ORIGINAL_HEIGHT,
  ORIGINAL_WIDTH,
  type Shape,
} from "./data.js";
import { renderExplanation } from "./explain.js";
import { renderScene } from "./render.js";
import {
  ANALYSIS_HTML,
  CANVAS_HTML,
  CONTROLS_HTML,
  INTRO_HTML,
} from "./templates.js";
import { setupShapeControls } from "./ui.js";

function renderCurrent(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  shape: Shape,
) {
  renderScene(canvas, ctx, {
    originalHeight: ORIGINAL_HEIGHT,
    originalWidth: ORIGINAL_WIDTH,
    shape,
  });
  renderExplanation(shape);
}

function main() {
  renderDemoShell({
    title: "reshape 시각화",
    intro: INTRO_HTML,
    controls: CONTROLS_HTML,
    canvas: CANVAS_HTML,
    analysis: ANALYSIS_HTML,
  });

  const { canvas, ctx } = getCanvasContext(CANVAS_ID);
  let currentShape: Shape = { ...DEFAULT_SHAPE };

  setupShapeControls(currentShape, (nextShape) => {
    currentShape = nextShape;
    renderCurrent(canvas, ctx, currentShape);
  });

  renderCurrent(canvas, ctx, currentShape);
}

main();
