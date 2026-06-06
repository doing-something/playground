import { CANVAS_ID, PLAY_BUTTON_ID, RESET_BUTTON_ID, STEP_BUTTON_ID } from "./data.js";

export const INTRO_HTML = `
  Adam은 현재 gradient만 보지 않고, 최근 gradient 방향의 평균인 m과 gradient 크기의 평균인 v를 함께 기억해 다음 이동을 정하는 optimizer다.<br>
  이 데모는 점의 위치를 parameter로 보고, 각 점이 자기 target에 가까워지며 ADAM 글자 모양을 만드는 과정을 보여준다.
`;

export const CONTROLS_HTML = `
  <section class="control-panel" aria-labelledby="adam-controls-title">
    <h2 id="adam-controls-title">Controls</h2>
    <p>Step은 Adam 업데이트 1회를 실행하고, Play는 Step을 반복한다.</p>
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
    <div class="analysis-card">
      <h3>그래프 읽는 방법</h3>
      <p class="summary-text">
        흐린 점들은 ADAM 글자 모양을 이루는 target 점들이다. 파란 점들은 현재 parameter이고, Step마다 자기 target 쪽으로 이동한다.<br>
        주황 점은 내부 계산을 자세히 보기 위해 대표로 선택한 parameter 하나다. 점선은 주황 점과 자기 target을 잇는 선이다.<br>
        색 선들은 주황 점에서 시작하는 방향 벡터다. 선 끝의 작은 색 점은 해당 벡터가 가리키는 끝점을 표시한다.<br>
        빨간선과 빨간점은 loss가 커지는 gradient 방향, 보라선은 최근 gradient 평균인 m 방향이다. Adam은 이 값을 빼서 loss를 줄이므로 초록선은 실제 이동 방향을 나타낸다.<br>
        mean distance²는 현재 점들과 target 사이의 평균 거리 제곱이다. 이 값이 작아질수록 점들이 정답 모양에 가까워진다.
      </p>
    </div>
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
        <dt>step delta</dt>
        <dd id="info-update">[0.000, 0.000]</dd>
      </div>
    </dl>
    <div class="analysis-card">
      <h3>Status</h3>
      <p id="info-status" class="summary-text">
        Step을 누르면 Adam 업데이트를 한 번 실행한다.
      </p>
    </div>
  </section>
`;
