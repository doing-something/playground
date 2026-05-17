import { matrix2x2FormHTML } from "../shared/demo-shell.js";
import { CANVAS_ID } from "./data.js";

export const INTRO_HTML = `
  같은 단위 정사각형에 행렬 <code>A</code>와 그 전치 <code>Aᵀ</code>를 적용한 결과를
  한 화면에서 비교합니다. 회전 행렬, shear, 대칭 행렬에서 전치가
  기하적으로 어떤 의미인지 한눈에 확인하세요.
`;

export const CONTROLS_HTML = `
  <section class="control-panel" aria-labelledby="matrix-controls-title">
    <h2 id="matrix-controls-title">행렬 입력</h2>
    <p>
      2x2 행렬 <code>A</code>의 네 원소입니다. 값을 바꾸거나 프리셋을 눌러보세요.
    </p>
    ${matrix2x2FormHTML()}
    <div class="preset-group" aria-labelledby="preset-group-title">
      <h3 id="preset-group-title">프리셋</h3>
      <div id="matrix-presets" class="preset-list"></div>
    </div>
  </section>
`;

export const CANVAS_HTML = `
  <section class="canvas-panel">
    <canvas id="${CANVAS_ID}" width="720" height="480"></canvas>
  </section>
`;

export const ANALYSIS_HTML = `
  <section class="explanation-panel" aria-labelledby="transpose-analysis-title">
    <h2 id="transpose-analysis-title">A와 Aᵀ</h2>
    <p id="transpose-summary" class="summary-text">
      A를 적용한 도형(파랑)과 Aᵀ를 적용한 도형(주황)을 비교하세요.
    </p>
    <div class="analysis-card">
      <h3>A</h3>
      <code id="matrix-display">[[1, 1], [0, 1]]</code>
    </div>
    <div class="analysis-card">
      <h3>Aᵀ</h3>
      <code id="transpose-display">[[1, 0], [1, 1]]</code>
    </div>
  </section>
`;
