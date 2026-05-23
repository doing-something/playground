export const INTRO_HTML = `
  학습용 골격만 먼저 잡아 둔 페이지입니다.
  Sigmoid, ReLU, Softmax를 탭으로 분리해 두었고, 각 탭 안에 입력과 결과 영역을 따로 둘 수 있게 구성했습니다.
`;

export const CONTROLS_HTML = "";

export const CANVAS_HTML = `
  <section class="canvas-panel activation-canvas-panel">
    <div class="tab-list" role="tablist" aria-label="Activation functions">
      <button class="tab-button tab-button-active" id="tab-sigmoid" data-tab="sigmoid" role="tab" aria-selected="true" aria-controls="panel-sigmoid">Sigmoid</button>
      <button class="tab-button" id="tab-relu" data-tab="relu" role="tab" aria-selected="false" aria-controls="panel-relu">ReLU</button>
      <button class="tab-button" id="tab-softmax" data-tab="softmax" role="tab" aria-selected="false" aria-controls="panel-softmax">Softmax</button>
    </div>
    <section class="tab-screen tab-screen-active" id="panel-sigmoid" data-panel="sigmoid" role="tabpanel" aria-labelledby="tab-sigmoid">
      <div class="screen-header">
        <p class="screen-kicker">Activation Function</p>
        <h2>Sigmoid</h2>
        <p class="screen-description">이 탭 안에 Sigmoid 전용 입력과 시각화 코드를 넣으면 됩니다.</p>
      </div>
      <div class="screen-grid">
        <section class="placeholder-card">
          <h3>입력 영역</h3>
          <p>예: slider, number input, preset 버튼</p>
        </section>
        <section class="placeholder-card placeholder-stage">
          <h3>시각화 / 결과 영역</h3>
          <p>예: 그래프, 공식, 출력값</p>
        </section>
      </div>
    </section>
    <section class="tab-screen" id="panel-relu" data-panel="relu" role="tabpanel" aria-labelledby="tab-relu" hidden>
      <div class="screen-header">
        <p class="screen-kicker">Activation Function</p>
        <h2>ReLU</h2>
        <p class="screen-description">이 탭 안에 ReLU 전용 입력과 시각화 코드를 넣으면 됩니다.</p>
      </div>
      <div class="screen-grid">
        <section class="placeholder-card">
          <h3>입력 영역</h3>
          <p>예: x 값 입력, 케이스 선택</p>
        </section>
        <section class="placeholder-card placeholder-stage">
          <h3>시각화 / 결과 영역</h3>
          <p>예: 꺾인 선 그래프, 출력값 표시</p>
        </section>
      </div>
    </section>
    <section class="tab-screen" id="panel-softmax" data-panel="softmax" role="tabpanel" aria-labelledby="tab-softmax" hidden>
      <div class="screen-header">
        <p class="screen-kicker">Activation Function</p>
        <h2>Softmax</h2>
        <p class="screen-description">이 탭 안에 Softmax 전용 입력과 시각화 코드를 넣으면 됩니다.</p>
      </div>
      <div class="screen-grid">
        <section class="placeholder-card">
          <h3>입력 영역</h3>
          <p>예: logit 배열 입력, 클래스 수 선택</p>
        </section>
        <section class="placeholder-card placeholder-stage">
          <h3>시각화 / 결과 영역</h3>
          <p>예: 확률 bar chart, 합계 1 표시</p>
        </section>
      </div>
    </section>
  </section>
`;

export const ANALYSIS_HTML = "";
