import { getCanvasContext } from "../shared/canvas2d.js";
import { renderDemoShell } from "../shared/demo-shell.js";
import { CANVAS_ID, createInitialTrainingState, type TrainingState } from "./data.js";
import { runTrainingStep } from "./learning.js";
import { renderScene } from "./render.js";
import { CANVAS_HTML, CONTROLS_HTML, INFO_HTML, INTRO_HTML } from "./templates.js";
import { renderInfo, setupControls } from "./ui.js";

function main() {
  renderDemoShell({
    title: "Gradient Descent Variants",
    intro: INTRO_HTML,
    controls: CONTROLS_HTML,
    canvas: CANVAS_HTML,
    analysis: INFO_HTML,
  });

  const { canvas, ctx } = getCanvasContext(CANVAS_ID);
  let state: TrainingState = createInitialTrainingState();

  const render = () => {
    renderScene(canvas, ctx, state);
    renderInfo(state);
  };

  setupControls({
    initialMethod: state.method,
    onMethodChange: (method) => {
      state = {
        ...createInitialTrainingState(method),
        statusMessage: "method를 바꿔 초기 상태로 돌아왔습니다.",
      };
      render();
    },
    onReset: () => {
      state = {
        ...createInitialTrainingState(state.method),
        statusMessage: "초기 weights로 되돌렸습니다.",
      };
      render();
    },
    onStep: () => {
      try {
        state = runTrainingStep(state);
      } catch (error) {
        state = {
          ...state,
          statusMessage: error instanceof Error ? error.message : "Step 처리 중 오류가 발생했습니다.",
        };
      }
      render();
    },
  });

  render();
}

main();
