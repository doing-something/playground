import { getCanvasContext } from "../shared/canvas2d.js";
import { renderDemoShell } from "../shared/demo-shell.js";
import { CANVAS_ID, createInitialTrainingState, type TrainingState } from "./data.js";
import { runTrainingStep } from "./learning.js";
import { renderScene } from "./render.js";
import { CANVAS_HTML, CONTROLS_HTML, INFO_HTML, INTRO_HTML } from "./templates.js";
import { renderInfo, setupControls } from "./ui.js";

const PLAY_INTERVAL_MS = 24;

function main() {
  renderDemoShell({
    title: "Adam Optimizer Points",
    intro: INTRO_HTML,
    controls: CONTROLS_HTML,
    canvas: CANVAS_HTML,
    analysis: INFO_HTML,
  });

  const { canvas, ctx } = getCanvasContext(CANVAS_ID);
  let state: TrainingState = createInitialTrainingState();
  let playTimer: number | undefined;

  const render = () => {
    renderScene(canvas, ctx, state);
    renderInfo(state);
  };

  const stopPlaying = () => {
    if (playTimer !== undefined) {
      window.clearInterval(playTimer);
      playTimer = undefined;
    }
    state = { ...state, isPlaying: false };
  };

  const step = () => {
    state = runTrainingStep(state);
    render();

    if (!state.isPlaying && playTimer !== undefined) {
      window.clearInterval(playTimer);
      playTimer = undefined;
    }
  };

  const stepWhilePlaying = () => {
    if (!state.isPlaying) {
      return;
    }

    step();
  };

  setupControls({
    onPlayToggle: () => {
      if (state.isPlaying) {
        stopPlaying();
        render();
        return;
      }

      state = { ...state, isPlaying: true };
      step();
      playTimer = window.setInterval(stepWhilePlaying, PLAY_INTERVAL_MS);
      render();
    },
    onReset: () => {
      stopPlaying();
      state = createInitialTrainingState();
      render();
    },
    onStep: () => {
      stopPlaying();
      step();
    },
  });

  render();
}

main();
