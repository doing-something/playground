import {
  basisVectors,
  CANVAS_ID,
  getMatchingPresetLabel,
  matrix,
  triangle,
} from "./data.js";
import { getCanvasContext, renderScene } from "./canvas.js";
import { renderExplanation } from "./explain.js";
import { getRotationDegrees, transformBasisVectors, transformShape } from "./math.js";
import type { Matrix } from "../shared/types.js";
import { setupMatrixControls } from "./ui.js";
import { readMatrixFromQuery, writeMatrixToQuery } from "./url-state.js";

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
 * @param transformName 현재 행렬에 붙일 학습용 이름
 * @param currentMatrix 원본 삼각형에 적용할 현재 변환 행렬
 * @param canvas 그리기 대상 캔버스
 * @param ctx 2D 렌더링 컨텍스트
 */
function renderCurrentMatrix(
  transformName: string,
  currentMatrix: Matrix,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
) {
  const transformedBasis = transformBasisVectors(currentMatrix, basisVectors);
  const transformedTriangle = transformShape(triangle, currentMatrix);

  renderScene(
    canvas,
    ctx,
    currentMatrix,
    triangle,
    transformedTriangle,
    basisVectors,
    transformedBasis,
  );
  renderExplanation(
    transformName,
    currentMatrix,
    triangle,
    transformedTriangle,
    basisVectors,
    transformedBasis,
  );
}

/**
 * 현재 행렬에 맞는 설명용 변환 이름을 만든다.
 *
 * 회전 행렬이면 각도를 포함해 보여주고, 아니면 프리셋 이름이나 직접 입력 상태를 쓴다.
 *
 * @param currentMatrix 현재 2x2 행렬
 * @returns 설명 패널에 보여줄 변환 이름
 */
function getTransformName(currentMatrix: Matrix): string {
  const rotationDegrees = getRotationDegrees(currentMatrix);

  if (rotationDegrees !== null) {
    return `회전 (${formatDegrees(rotationDegrees)}도)`;
  }

  return getMatchingPresetLabel(currentMatrix) ?? "직접 입력";
}

/**
 * 각도를 화면 표시용 문자열로 정리한다.
 *
 * @param degrees 표시할 각도
 * @returns 정수면 정수로, 아니면 소수 첫째 자리까지 남긴 문자열
 */
function formatDegrees(degrees: number): string {
  return Number.isInteger(degrees)
    ? String(degrees)
    : degrees.toFixed(1).replace(/\.?0+$/, "");
}

function main() {
  const { canvas, ctx } = getCanvasContext(CANVAS_ID);
  let currentMatrix = readMatrixFromQuery(matrix);
  let currentTransformName = getTransformName(currentMatrix);

  setupMatrixControls(currentMatrix, (nextMatrix, nextTransformName) => {
    currentMatrix = cloneMatrix(nextMatrix);
    currentTransformName = nextTransformName;
    writeMatrixToQuery(currentMatrix, matrix);
    renderCurrentMatrix(currentTransformName, currentMatrix, canvas, ctx);
  });

  renderCurrentMatrix(currentTransformName, currentMatrix, canvas, ctx);
}

main();
