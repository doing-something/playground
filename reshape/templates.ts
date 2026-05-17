import { CANVAS_ID, ORIGINAL_HEIGHT, ORIGINAL_WIDTH, TOTAL_ELEMENTS } from "./data.js";

export const INTRO_HTML = `
  같은 데이터(${TOTAL_ELEMENTS}개 원소)를 어떻게 다른 모양으로 다시 볼 수 있는지 보여줍니다.
  원본 <code>(${ORIGINAL_HEIGHT}, ${ORIGINAL_WIDTH})</code> 격자의 각 셀에 색과 인덱스가 매겨져 있고,
  reshape 후에도 그 순서가 유지되는 게 핵심입니다.
  PyTorch의 <code>tensor.reshape(...)</code>나 <code>nn.Flatten</code>이 하는 일과 똑같습니다.
`;

export const CONTROLS_HTML = `
  <section class="control-panel" aria-labelledby="reshape-controls-title">
    <h2 id="reshape-controls-title">새 모양</h2>
    <p>
      reshape할 (rows, cols)를 직접 입력하거나 프리셋을 누르세요.
      원본 원소 수(${TOTAL_ELEMENTS})와 곱이 맞아야 reshape이 가능합니다.
    </p>
    <form id="shape-form" class="matrix-form">
      <div class="matrix-row">
        <label class="matrix-cell" for="shape-rows">
          rows
          <input id="shape-rows" name="shape-rows" type="number" min="1" step="1">
        </label>
        <label class="matrix-cell" for="shape-cols">
          cols
          <input id="shape-cols" name="shape-cols" type="number" min="1" step="1">
        </label>
      </div>
    </form>
    <div class="preset-group" aria-labelledby="preset-group-title">
      <h3 id="preset-group-title">프리셋</h3>
      <div id="shape-presets" class="preset-list"></div>
    </div>
  </section>
`;

export const CANVAS_HTML = `
  <section class="canvas-panel">
    <canvas id="${CANVAS_ID}" width="720" height="480"></canvas>
  </section>
`;

export const ANALYSIS_HTML = `
  <section class="explanation-panel" aria-labelledby="reshape-analysis-title">
    <h2 id="reshape-analysis-title">차원 검사</h2>
    <p class="summary-text">
      reshape은 데이터의 메모리 순서를 그대로 두고 모양만 다시 해석하는 연산입니다.
      그래서 원소 개수(<code>rows × cols</code>)가 원본과 같아야 합니다.
    </p>
    <div class="analysis-card">
      <h3>원본 shape</h3>
      <code id="original-shape">(${ORIGINAL_HEIGHT}, ${ORIGINAL_WIDTH})</code>
    </div>
    <div class="analysis-card">
      <h3>새 shape</h3>
      <code id="new-shape">(1, 16)</code>
    </div>
    <div class="analysis-card">
      <h3>새 shape의 원소 수</h3>
      <code id="shape-product">1 × 16 = 16</code>
    </div>
    <p id="shape-status" class="summary-text status-ok">
      OK
    </p>
  </section>
`;
