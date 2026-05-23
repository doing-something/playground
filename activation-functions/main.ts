import { renderDemoShell } from "../shared/demo-shell.js";
import { DEFAULT_STATE } from "./data.js";
import { ANALYSIS_HTML, CANVAS_HTML, CONTROLS_HTML, INTRO_HTML } from "./templates.js";
import { setupActivationControls } from "./ui.js";

function main() {
  renderDemoShell({
    title: "Activation Functions 데모",
    intro: INTRO_HTML,
    controls: CONTROLS_HTML,
    canvas: CANVAS_HTML,
    analysis: ANALYSIS_HTML,
  });

  setupActivationControls(DEFAULT_STATE.tab, () => {});
}

main();
