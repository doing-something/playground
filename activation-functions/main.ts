import { getCanvasContext } from "../shared/canvas2d.js";
import { renderDemoShell } from "../shared/demo-shell.js";
import {
  ACTIVATION_TABS,
  CANVAS_ID,
  DEFAULT_STATE,
  type ActivationState,
  type ActivationTab,
} from "./data.js";
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
  let currentState = getInitialState();

  setupActivationControls(currentState, (nextState) => {
    currentState = { ...nextState };
    renderCurrent(canvas, ctx, currentState);
  });

  renderCurrent(canvas, ctx, currentState);
}

main();

function getInitialState(): ActivationState {
  return {
    ...DEFAULT_STATE,
    tab: getTabFromHash() ?? DEFAULT_STATE.tab,
  };
}

function getTabFromHash(): ActivationTab | null {
  const tab = window.location.hash.replace(/^#/, "");

  return ACTIVATION_TABS.includes(tab as ActivationTab)
    ? tab as ActivationTab
    : null;
}

function renderAnalysis(state: ActivationState) {
  const formula = getRequiredElement("activation-formula");
  const substitution = getRequiredElement("activation-substitution");
  const interpretation = getRequiredElement("activation-interpretation");

  if (state.tab === "sigmoid") {
    const value = sigmoid(state.sigmoidX);
    formula.innerHTML = `
      <div class="math-line">σ(x) = 1 / (1 + e<sup>-x</sup>)</div>
      <p class="math-note">입력 x가 커질수록 출력은 1에 가까워지고, 작아질수록 0에 가까워집니다.</p>
    `;
    substitution.innerHTML = `
      <div class="math-line">x = <strong>${formatNumber(state.sigmoidX)}</strong></div>
      <div class="math-line">σ(${formatNumber(state.sigmoidX)}) = 1 / (1 + e<sup>${formatNumber(-state.sigmoidX)}</sup>) = <strong>${formatNumber(value)}</strong></div>
    `;
    interpretation.textContent = `현재 출력은 ${formatNumber(value)}입니다. 이 값은 0과 1 사이로 압축된 점수라서 확률처럼 읽을 수 있습니다.`;
    return;
  }

  if (state.tab === "relu") {
    const value = Math.max(0, state.reluX);
    formula.innerHTML = `
      <div class="math-line">ReLU(x) = max(0, x)</div>
      <div class="math-line">x &lt; 0 이면 0, x ≥ 0 이면 x</div>
      <p class="math-note">음수 입력은 모두 0으로 잘라내고, 양수 입력은 그대로 통과시킵니다.</p>
    `;
    substitution.innerHTML = `
      <div class="math-line">x = <strong>${formatNumber(state.reluX)}</strong></div>
      <div class="math-line">ReLU(${formatNumber(state.reluX)}) = max(0, ${formatNumber(state.reluX)}) = <strong>${formatNumber(value)}</strong></div>
    `;
    interpretation.textContent = state.reluX < 0
      ? "현재 입력은 음수이므로 ReLU가 0으로 바꿉니다. 그래프에서 왼쪽 구간이 바닥에 붙어 있는 이유입니다."
      : "현재 입력은 0 이상이므로 ReLU가 값을 그대로 내보냅니다. 그래프에서 오른쪽 구간이 직선으로 올라가는 이유입니다.";
    return;
  }

  const probabilities = softmax(state.softmaxLogits);
  const expValues = state.softmaxLogits.map((value) => Math.exp(value));
  const expSum = expValues.reduce((acc, value) => acc + value, 0);
  formula.innerHTML = `
    <div class="math-line">softmax(z<sub>i</sub>) = e<sup>z<sub>i</sub></sup> / Σ e<sup>z<sub>j</sub></sup></div>
    <p class="math-note">각 logit을 양수 점수로 바꾼 뒤, 전체 합으로 나눠 확률 분포를 만듭니다.</p>
  `;
  substitution.innerHTML = `
    <div class="math-line">z = [${state.softmaxLogits.map(formatNumber).join(", ")}]</div>
    <div class="math-line">Σe<sup>z</sup> ≈ ${expValues.map(formatNumber).join(" + ")} = <strong>${formatNumber(expSum)}</strong></div>
    <div class="math-line">p ≈ [${probabilities.map(formatNumber).join(", ")}]</div>
  `;
  interpretation.textContent = `세 확률의 합은 ${formatNumber(probabilities.reduce((acc, value) => acc + value, 0))}입니다. 가장 큰 확률은 ${getSoftmaxLabel(probabilities)}이고, 현재 모델이 그 클래스를 가장 강하게 선택합니다.`;
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

function getSoftmaxLabel(probabilities: readonly number[]): string {
  const labels = ["A", "B", "C"];
  let bestIndex = 0;

  for (let index = 1; index < probabilities.length; index += 1) {
    if (probabilities[index] > probabilities[bestIndex]) {
      bestIndex = index;
    }
  }

  return `${labels[bestIndex]} (${formatNumber(probabilities[bestIndex])})`;
}

function getRequiredElement(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (!(element instanceof HTMLElement)) {
    throw new Error(`${id} 요소를 찾을 수 없습니다.`);
  }

  return element;
}
