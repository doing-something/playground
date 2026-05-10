import { CANVAS_ID, matrix, triangle } from "./data.js";
import { getCanvasContext, renderScene } from "./canvas.js";
import { transformShape } from "./math.js";
import type { Matrix } from "./types.js";
import { setupMatrixControls } from "./ui.js";

/**
 * 2차원 행렬을 값까지 복사한 새 배열로 만든다.
 *
 * 입력 UI가 값을 바꿔도 기본 행렬 상수가 직접 수정되지 않게 분리한다.
 *
 * @param source 복사할 행렬
 * @returns 같은 값을 가진 새 행렬
 */
function cloneMatrix(source: Matrix): Matrix {
  return source.map((row) => [...row]);
}

/**
 * 현재 행렬 상태를 기준으로 장면을 다시 계산하고 렌더링한다.
 *
 * @param currentMatrix 원본 삼각형에 적용할 현재 변환 행렬
 * @param canvas 그리기 대상 캔버스
 * @param ctx 2D 렌더링 컨텍스트
 */
function renderCurrentMatrix(
  currentMatrix: Matrix,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
) {
  const transformedTriangle = transformShape(triangle, currentMatrix);

  renderScene(canvas, ctx, triangle, transformedTriangle);
}

function main() {
  const { canvas, ctx } = getCanvasContext(CANVAS_ID);
  let currentMatrix = cloneMatrix(matrix);

  setupMatrixControls(currentMatrix, (nextMatrix) => {
    currentMatrix = cloneMatrix(nextMatrix);
    renderCurrentMatrix(currentMatrix, canvas, ctx);
  });

  renderCurrentMatrix(currentMatrix, canvas, ctx);
}

main();
