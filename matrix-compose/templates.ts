import { matrix2x2FormHTML } from "../shared/demo-shell.js";
import { CANVAS_ID } from "./data.js";

export const INTRO_HTML = `
  두 행렬 <code>A</code>와 <code>B</code>를 고르면 그 곱 <code>C = A·B</code>를 계산합니다.
  단위 정사각형에 B를 적용한 뒤 A를 다시 적용한 결과(빨강)와
  C를 한 번 적용한 결과(점선)가 같은 자리에 있는지 확인하세요.
  같다는 사실이 곧 "행렬 곱셈 = 변환의 합성"입니다.
`;

export const CONTROLS_HTML = `
  <section class="control-panel" aria-labelledby="compose-controls-title">
    <h2 id="compose-controls-title">두 행렬</h2>
    <p>
      <code>A</code>와 <code>B</code> 각 칸의 값을 바꾸거나 프리셋을 눌러보세요.
    </p>
    <div class="matrix-input-group">
      <h3 class="matrix-input-title">A</h3>
      ${matrix2x2FormHTML({ formId: "form-A", inputPrefix: "matrix-A" })}
    </div>
    <div class="matrix-input-group">
      <h3 class="matrix-input-title">B</h3>
      ${matrix2x2FormHTML({ formId: "form-B", inputPrefix: "matrix-B" })}
    </div>
    <div class="preset-group" aria-labelledby="preset-group-title">
      <h3 id="preset-group-title">프리셋 (A · B 쌍)</h3>
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
  <section class="explanation-panel" aria-labelledby="compose-analysis-title">
    <h2 id="compose-analysis-title">A, B, 그리고 C</h2>
    <p class="summary-text">
      행렬 곱 <code>A·B</code>는 "B 적용 → A 적용"이라는 두 단계 변환을
      한 행렬로 압축한 것입니다.
      PyTorch의 <code>A @ B</code>도 같은 의미입니다.
    </p>
    <div class="analysis-card">
      <h3>A</h3>
      <code id="matrix-A-display">[[1, 0], [0, 1]]</code>
    </div>
    <div class="analysis-card">
      <h3>B</h3>
      <code id="matrix-B-display">[[1, 0], [0, 1]]</code>
    </div>
    <div class="analysis-card">
      <h3>C = A · B</h3>
      <code id="matrix-C-display">[[1, 0], [0, 1]]</code>
    </div>
  </section>
`;
