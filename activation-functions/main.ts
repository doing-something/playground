import { getCanvasContext } from "../shared/canvas2d.js";
import { renderDemoShell } from "../shared/demo-shell.js";
import { CANVAS_ID, DEFAULT_STATE, type ActivationState } from "./data.js";
import { renderActivationDemo } from "./render.js";
import { ANALYSIS_HTML, CANVAS_HTML, CONTROLS_HTML, INTRO_HTML } from "./templates.js";
import { setupActivationControls } from "./ui.js";

function renderCurrent(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  state: ActivationState,
) {
  renderActivationDemo(canvas, ctx, state);
  renderAnalysis(state);
}

function main() {
  renderDemoShell({
    title: "Activation Functions 데모",
    intro: INTRO_HTML,
    controls: CONTROLS_HTML,
    canvas: CANVAS_HTML,
    analysis: ANALYSIS_HTML,
  });

  const { canvas, ctx } = getCanvasContext(CANVAS_ID);
  let currentState = { ...DEFAULT_STATE };

  setupActivationControls(currentState, (nextState) => {
    currentState = { ...nextState };
    renderCurrent(canvas, ctx, currentState);
  });

  renderCurrent(canvas, ctx, currentState);
}

main();

function renderAnalysis(state: ActivationState) {
  const formula = getRequiredElement("activation-formula");
  const input = getRequiredElement("activation-input");
  const output = getRequiredElement("activation-output");

  if (state.tab === "sigmoid") {
    const value = sigmoid(state.sigmoidX);
    formula.textContent = "σ(x) = 1 / (1 + e^-x)";
    input.textContent = `x = ${formatNumber(state.sigmoidX)}`;
    output.textContent = `σ(x) = ${formatNumber(value)}`;
    return;
  }

  if (state.tab === "relu") {
    const value = Math.max(0, state.reluX);
    formula.textContent = "ReLU(x) = max(0, x)";
    input.textContent = `x = ${formatNumber(state.reluX)}`;
    output.textContent = `ReLU(x) = ${formatNumber(value)}`;
    return;
  }

  const probabilities = softmax(state.softmaxLogits);
  formula.textContent = "softmax(zᵢ) = e^zᵢ / Σe^z";
  input.textContent = `logits = [${state.softmaxLogits.map(formatNumber).join(", ")}]`;
  output.textContent = `p = [${probabilities.map(formatNumber).join(", ")}]`;
}

function sigmoid(value: number): number {
  return 1 / (1 + Math.exp(-value));
}

function softmax(values: readonly number[]): number[] {
  const maxValue = Math.max(...values);
  const exps = values.map((value) => Math.exp(value - maxValue));
  const sum = exps.reduce((acc, value) => acc + value, 0);

  return exps.map((value) => value / sum);
}

function formatNumber(value: number): string {
  return Number.isInteger(value)
    ? String(value)
    : value.toFixed(3).replace(/\.?0+$/, "");
}

function getRequiredElement(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (!(element instanceof HTMLElement)) {
    throw new Error(`${id} 요소를 찾을 수 없습니다.`);
  }

  return element;
}
