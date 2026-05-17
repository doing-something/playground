import { matrix2x2FormHTML } from "../shared/demo-shell.js";
import { CANVAS_ID } from "./data.js";

export const INTRO_HTML = `
  행렬 값을 바꾸거나 회전 각도를 선택해, 도형과 좌표계가 어떻게 변하는지 비교해보세요.
  현재 행렬: <code id="matrix-preview">[[2, 0], [0, 2]]</code>
`;

export const CONTROLS_HTML = `
  <section class="control-panel" aria-labelledby="matrix-controls-title">
    <h2 id="matrix-controls-title">행렬 입력</h2>
    <p>
      각 칸은 2x2 변환 행렬의 원소입니다.
      값을 바꿔서 삼각형이 어떻게 달라지는지 먼저 확인합니다.
    </p>
    ${matrix2x2FormHTML()}
    <div class="preset-group" aria-labelledby="preset-group-title">
      <h3 id="preset-group-title">프리셋</h3>
      <div id="matrix-presets" class="preset-list"></div>
    </div>
    <div class="rotation-group" aria-labelledby="rotation-group-title">
      <div class="rotation-header">
        <h3 id="rotation-group-title">회전 각도</h3>
      </div>
      <div class="rotation-shortcuts" aria-label="회전 빠른 각도">
        <button class="rotation-shortcut" type="button" data-angle="-90">-90도</button>
        <button class="rotation-shortcut" type="button" data-angle="-45">-45도</button>
        <button class="rotation-shortcut" type="button" data-angle="0">0도</button>
        <button class="rotation-shortcut" type="button" data-angle="45">45도</button>
        <button class="rotation-shortcut" type="button" data-angle="90">90도</button>
      </div>
      <p>대표 각도를 눌러 회전이 어떻게 달라지는지 빠르게 비교합니다.</p>
    </div>
  </section>
`;

export const CANVAS_HTML = `
  <section class="canvas-panel">
    <canvas id="${CANVAS_ID}" width="720" height="480"></canvas>
  </section>
`;

export const ANALYSIS_HTML = `
  <section class="explanation-panel" aria-labelledby="matrix-analysis-title">
    <h2 id="matrix-analysis-title">계산 설명</h2>
    <p id="transform-summary" class="explanation-summary">
      2배의 균일한 확대/축소가 일어나며, 면적은 4배로 바뀝니다.
    </p>
    <div class="analysis-card">
      <h3>현재 행렬</h3>
      <code id="analysis-matrix">[[2, 0], [0, 2]]</code>
    </div>
    <dl class="metric-grid">
      <div class="metric-item">
        <dt>현재 변환</dt>
        <dd id="transform-name-value">균일 확대</dd>
      </div>
      <div class="metric-item">
        <dt>det(A)</dt>
        <dd id="determinant-value">4</dd>
      </div>
      <div class="metric-item">
        <dt>면적 배율</dt>
        <dd id="area-scale-value">4배</dd>
      </div>
    </dl>
    <div class="analysis-card">
      <h3>기저벡터 변화</h3>
      <p class="explanation-summary">
        <code>e1 = [1, 0]</code> 은 원래 x축 기준벡터,
        <code>e2 = [0, 1]</code> 은 원래 y축 기준벡터입니다.
        <code>A e1</code>, <code>A e2</code> 는 행렬을 적용한 뒤의 새 기준벡터입니다.
      </p>
      <table class="vertex-table">
        <thead>
          <tr>
            <th scope="col">벡터</th>
            <th scope="col">원본</th>
            <th scope="col">결과</th>
          </tr>
        </thead>
        <tbody id="basis-results">
          <tr>
            <th scope="row">e1<br><small>원래 x축 기준</small></th>
            <td>[1, 0]</td>
            <td>[2, 0]</td>
          </tr>
          <tr>
            <th scope="row">e2<br><small>원래 y축 기준</small></th>
            <td>[0, 1]</td>
            <td>[0, 2]</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="analysis-card">
      <h3>꼭지점 계산</h3>
      <table class="vertex-table">
        <thead>
          <tr>
            <th scope="col">정점</th>
            <th scope="col">원본</th>
            <th scope="col">계산</th>
            <th scope="col">결과</th>
          </tr>
        </thead>
        <tbody id="vertex-results">
          <tr>
            <th scope="row">A</th>
            <td>[0, 2]</td>
            <td>[2×0 + 0×2, 0×0 + 2×2]</td>
            <td>[0, 4]</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
`;
