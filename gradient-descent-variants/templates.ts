import {
  CANVAS_ID,
  LEARNING_RATE,
  METHOD_SELECT_ID,
  METHODS,
  MINI_BATCH_SIZE,
  RESET_BUTTON_ID,
  STEP_BUTTON_ID,
} from "./data.js";

export const INTRO_HTML = `
  같은 업데이트 공식에서 바뀌는 것은 gradient 계산에 쓰는 데이터 묶음입니다.
  <code>batch_size = ${MINI_BATCH_SIZE}</code>, <code>learning_rate = ${LEARNING_RATE}</code>
`;

export const CONTROLS_HTML = `
  <section class="control-panel" aria-labelledby="gradient-controls-title">
    <h2 id="gradient-controls-title">Controls</h2>
    <label class="method-field" for="${METHOD_SELECT_ID}">
      Method
      <select id="${METHOD_SELECT_ID}" autocomplete="off">
        ${METHODS.map((method) => `<option value="${method.value}"${method.value === "batch" ? " selected" : ""}>${method.label}</option>`).join("")}
      </select>
    </label>
    <div class="action-row">
      <button id="${STEP_BUTTON_ID}" class="primary-button" type="button">weights 1회 업데이트</button>
      <button id="${RESET_BUTTON_ID}" class="secondary-button" type="button">weights 초기화</button>
    </div>
  </section>
`;

export const CANVAS_HTML = `
  <section class="canvas-panel">
    <canvas id="${CANVAS_ID}" width="760" height="520"></canvas>
  </section>
`;

export const INFO_HTML = `
  <section class="explanation-panel" aria-labelledby="gradient-info-title">
    <h2 id="gradient-info-title">Info</h2>
    <dl class="metric-grid">
      <div class="metric-item">
        <dt>method</dt>
        <dd id="info-method">Batch</dd>
      </div>
      <div class="metric-item">
        <dt>sample index</dt>
        <dd id="info-indices">-</dd>
      </div>
      <div class="metric-item">
        <dt>weights [slope, bias]</dt>
        <dd id="info-weights">[0.15, 0.40]</dd>
      </div>
      <div class="metric-item">
        <dt>update count</dt>
        <dd id="info-count">0</dd>
      </div>
    </dl>
    <div class="analysis-card">
      <h3>Status</h3>
      <p id="info-status" class="summary-text">
        learning.ts의 TODO를 채우면 Step이 weights를 업데이트합니다.
      </p>
    </div>
  </section>
`;
