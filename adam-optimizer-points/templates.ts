import { CANVAS_ID, PLAY_BUTTON_ID, RESET_BUTTON_ID, STEP_BUTTON_ID } from "./data.js";

export const INTRO_HTML = `
  랜덤한 점들의 위치를 parameter로 보고, 각 점이 ADAM 글자의 target 위치로 이동하는 Adam 복습용 데모입니다.<br>
  화면과 상태 표시는 준비되어 있고, optimizer 핵심 계산은 <code>learning.ts</code>에 직접 채우는 구조입니다.
`;

export const CONTROLS_HTML = `
  <section class="control-panel" aria-labelledby="adam-controls-title">
    <h2 id="adam-controls-title">Controls</h2>
    <p>Step은 Adam 업데이트 1회를 실행하고, Play는 Step을 반복합니다.</p>
    <div class="action-row">
      <button id="${STEP_BUTTON_ID}" class="primary-button" type="button">Step</button>
      <button id="${PLAY_BUTTON_ID}" class="secondary-button" type="button">Play</button>
      <button id="${RESET_BUTTON_ID}" class="secondary-button" type="button">Reset</button>
    </div>
  </section>
`;

export const CANVAS_HTML = `
  <section class="canvas-panel">
    <canvas id="${CANVAS_ID}" width="760" height="520"></canvas>
  </section>
`;

export const INFO_HTML = `
  <section class="explanation-panel" aria-labelledby="adam-info-title">
    <h2 id="adam-info-title">Adam State</h2>
    <dl class="metric-grid">
      <div class="metric-item">
        <dt>step</dt>
        <dd id="info-step">0</dd>
      </div>
      <div class="metric-item">
        <dt>mean distance²</dt>
        <dd id="info-loss">-</dd>
      </div>
      <div class="metric-item">
        <dt>selected point</dt>
        <dd id="info-selected">0</dd>
      </div>
      <div class="metric-item">
        <dt>gradient</dt>
        <dd id="info-gradient">[0.000, 0.000]</dd>
      </div>
      <div class="metric-item">
        <dt>m</dt>
        <dd id="info-m">[0.000, 0.000]</dd>
      </div>
      <div class="metric-item">
        <dt>v</dt>
        <dd id="info-v">[0.000, 0.000]</dd>
      </div>
      <div class="metric-item">
        <dt>update</dt>
        <dd id="info-update">[0.000, 0.000]</dd>
      </div>
    </dl>
    <div class="analysis-card">
      <h3>Status</h3>
      <p id="info-status" class="summary-text">
        learning.ts의 TODO를 채우면 Step과 Play에서 Adam 업데이트가 동작합니다.
      </p>
    </div>
  </section>
`;
