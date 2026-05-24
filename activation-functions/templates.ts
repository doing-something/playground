export const INTRO_HTML = `
  Sigmoid, ReLU, Softmax가 입력값을 어떻게 바꾸는지 그래프와 숫자로 확인합니다.
  탭을 바꾸고 입력을 조정하면 함수별 출력이 바로 갱신됩니다.
`;

export const CONTROLS_HTML = `
  <section class="activation-tabs">
    <div class="tab-list" role="tablist" aria-label="Activation functions">
      <button class="tab-button tab-button-active" id="tab-sigmoid" data-tab="sigmoid" type="button" role="tab" aria-selected="true" aria-controls="panel-sigmoid">Sigmoid</button>
      <button class="tab-button" id="tab-relu" data-tab="relu" type="button" role="tab" aria-selected="false" aria-controls="panel-relu">ReLU</button>
      <button class="tab-button" id="tab-softmax" data-tab="softmax" type="button" role="tab" aria-selected="false" aria-controls="panel-softmax">Softmax</button>
    </div>
  </section>
  <section class="control-panel activation-controls">
    <div>
      <h2>입력 조정</h2>
      <p>현재 선택한 활성화 함수의 입력값을 바꿉니다.</p>
    </div>
    <section class="activation-panel" id="panel-sigmoid" data-panel="sigmoid" role="tabpanel" aria-labelledby="tab-sigmoid">
      <label class="range-control" for="sigmoid-x">
        <span class="range-head"><span>x</span><output id="sigmoid-x-value">0</output></span>
        <input id="sigmoid-x" type="range" min="-8" max="8" step="0.1">
      </label>
    </section>
    <section class="activation-panel" id="panel-relu" data-panel="relu" role="tabpanel" aria-labelledby="tab-relu" hidden>
      <label class="range-control" for="relu-x">
        <span class="range-head"><span>x</span><output id="relu-x-value">1.5</output></span>
        <input id="relu-x" type="range" min="-8" max="8" step="0.1">
      </label>
    </section>
    <section class="activation-panel" id="panel-softmax" data-panel="softmax" role="tabpanel" aria-labelledby="tab-softmax" hidden>
      <div class="input-grid">
        <label class="range-control" for="softmax-a">
          <span class="range-head"><span>logit A</span><output id="softmax-a-value">2</output></span>
          <input id="softmax-a" type="range" min="-4" max="6" step="0.1">
        </label>
        <label class="range-control" for="softmax-b">
          <span class="range-head"><span>logit B</span><output id="softmax-b-value">1</output></span>
          <input id="softmax-b" type="range" min="-4" max="6" step="0.1">
        </label>
        <label class="range-control" for="softmax-c">
          <span class="range-head"><span>logit C</span><output id="softmax-c-value">0.2</output></span>
          <input id="softmax-c" type="range" min="-4" max="6" step="0.1">
        </label>
      </div>
    </section>
  </section>
`;

export const CANVAS_HTML = `
  <section class="canvas-panel">
    <canvas id="activation-canvas" width="760" height="420" aria-label="Activation function graph"></canvas>
  </section>
`;

export const ANALYSIS_HTML = `
  <section class="explanation-panel activation-analysis">
    <article class="analysis-card">
      <h3>공식</h3>
      <div class="math-display" id="activation-formula"></div>
    </article>
    <article class="analysis-card">
      <h3>현재 값 대입</h3>
      <div class="math-display" id="activation-substitution"></div>
    </article>
    <article class="analysis-card">
      <h3>해석</h3>
      <p class="summary-text" id="activation-interpretation"></p>
    </article>
  </section>
`;
