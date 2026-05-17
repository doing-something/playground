import { CANVAS_ID } from "./data.js";

export const INTRO_HTML = `
  Canvas API의 <code>ctx.translate</code>, <code>ctx.rotate</code>, <code>ctx.scale</code>이
  내부에서 어떻게 3×3 affine 변환 행렬을 쌓아 가는지 살펴봅니다.
  단계를 추가·삭제·조정하면 누적 행렬, <code>ctx.getTransform()</code>이 돌려주는
  DOMMatrix, 그리고 단위 정사각형에 적용된 결과가 함께 갱신됩니다.
  affine 변환의 일반 정의는
  <a href="https://kr.mathworks.com/discovery/affine-transformation.html" target="_blank" rel="noopener noreferrer">MathWorks: Affine Transformation</a>
  참고.
`;

export const CONTROLS_HTML = `
  <section class="control-panel" aria-labelledby="steps-title">
    <h2 id="steps-title">변환 단계</h2>
    <p>
      위에서 아래 순서로 누적됩니다. <code>+</code> 버튼으로 단계를 추가하세요.
    </p>
    <div id="step-list" class="step-list"></div>
    <div class="step-add-buttons">
      <button id="add-translate" type="button" class="preset-button">+ translate</button>
      <button id="add-rotate" type="button" class="preset-button">+ rotate</button>
      <button id="add-scale" type="button" class="preset-button">+ scale</button>
    </div>
  </section>
`;

export const CANVAS_HTML = `
  <section class="canvas-panel">
    <canvas id="${CANVAS_ID}" width="720" height="480"></canvas>
  </section>
`;

export const ANALYSIS_HTML = `
  <section class="explanation-panel" aria-labelledby="canvas-matrix-analysis-title">
    <h2 id="canvas-matrix-analysis-title">누적 행렬</h2>
    <p class="summary-text">
      각 단계가 차례로 곱해져 만들어진 3×3 affine 행렬입니다.
      <code>ctx.getTransform()</code>이 돌려주는 DOMMatrix가 바로 이 행렬을
      열 우선으로 평탄화한 표현입니다.
    </p>
    <div class="analysis-card">
      <h3>3×3 affine 행렬</h3>
      <pre id="affine-matrix"></pre>
    </div>
    <div class="analysis-card">
      <h3>DOMMatrix.getTransform()</h3>
      <pre id="dom-matrix"></pre>
    </div>
    <div class="analysis-card">
      <h3>동등한 Canvas 코드</h3>
      <pre id="equivalent-code"></pre>
    </div>
  </section>
`;
