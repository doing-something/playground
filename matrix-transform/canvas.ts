import {
  createGridLines,
  drawArrowVector,
  drawAxes,
  drawGridLines,
  drawShape,
  getScaleToFitShapes,
  transformLineSegments,
  type VectorStyle,
} from "../shared/canvas2d.js";
import type { Matrix, Vector } from "../shared/types.js";

const GRID_EXTENT = 3;

/**
 * 원본 도형과 변환 도형을 구분하기 위한 범례를 그린다.
 *
 * @param ctx 2D 렌더링 컨텍스트
 */
function drawLegend(ctx: CanvasRenderingContext2D) {
  const items = [
    { label: "원본 격자", color: "#cbd5e1" },
    { label: "변환된 격자", color: "#f59e0b" },
    { label: "원본 삼각형", color: "#2563eb" },
    { label: "변환된 삼각형", color: "#dc2626" },
    { label: "원본 e1", color: "#0f766e" },
    { label: "원본 e2", color: "#0284c7" },
    { label: "변환된 A e1", color: "#6d28d9" },
    { label: "변환된 A e2", color: "#db2777" },
  ];

  ctx.save();
  ctx.font = '14px -apple-system, "Segoe UI", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif';
  ctx.textBaseline = "middle";

  items.forEach((item, index) => {
    const x = 28;
    const y = 30 + index * 24;

    ctx.fillStyle = item.color;
    ctx.fillRect(x, y - 6, 18, 12);
    ctx.fillStyle = "#0f172a";
    ctx.fillText(item.label, x + 28, y);
  });

  ctx.restore();
}

/**
 * 원본과 변환된 기저벡터를 화살표로 그린다.
 *
 * @param ctx 2D 렌더링 컨텍스트
 * @param canvas 좌표 변환 기준이 되는 캔버스
 * @param scale 수학 좌표를 화면 좌표로 바꾸는 축척
 * @param originalBasis 원본 기저벡터 목록
 * @param transformedBasis 변환된 기저벡터 목록
 */
function drawBasisVectors(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  scale: number,
  originalBasis: Vector[],
  transformedBasis: Vector[],
) {
  const originalStyles: VectorStyle[] = [
    { color: "#0f766e", label: "e1" },
    { color: "#0284c7", label: "e2" },
  ];
  const transformedStyles: VectorStyle[] = [
    { color: "#6d28d9", label: "A e1" },
    { color: "#db2777", label: "A e2" },
  ];

  originalBasis.forEach((vector, index) => {
    drawArrowVector(ctx, canvas, scale, vector, originalStyles[index]);
  });

  transformedBasis.forEach((vector, index) => {
    drawArrowVector(ctx, canvas, scale, vector, transformedStyles[index]);
  });
}

/**
 * 현재 장면 전체를 다시 그린다.
 *
 * 이전 프레임을 지우고, 축, 원본 도형, 변환된 도형, 범례 순서로 렌더링한다.
 *
 * @param canvas 그리기 대상 캔버스
 * @param ctx 2D 렌더링 컨텍스트
 * @param transform 현재 적용 중인 2x2 변환 행렬
 * @param originalShape 원본 도형의 정점 목록
 * @param transformedShape 변환된 도형의 정점 목록
 * @param originalBasis 원본 기저벡터 목록
 * @param transformedBasis 변환된 기저벡터 목록
 */
export function renderScene(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  transform: Matrix,
  originalShape: Vector[],
  transformedShape: Vector[],
  originalBasis: Vector[],
  transformedBasis: Vector[],
) {
  const originalGridLines = createGridLines(GRID_EXTENT);
  const transformedGridLines = transformLineSegments(transform, originalGridLines);
  const scale = getScaleToFitShapes(canvas, [
    originalShape,
    transformedShape,
    originalBasis,
    transformedBasis,
  ]);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGridLines(ctx, canvas, scale, originalGridLines, "rgba(203, 213, 225, 0.85)", 1);
  drawGridLines(ctx, canvas, scale, transformedGridLines, "rgba(245, 158, 11, 0.8)", 1.2);
  drawAxes(ctx, canvas);
  drawShape(ctx, canvas, scale, originalShape, {
    strokeStyle: "#2563eb",
    fillStyle: "rgba(37, 99, 235, 0.10)",
  });
  drawShape(ctx, canvas, scale, transformedShape, {
    strokeStyle: "#dc2626",
    fillStyle: "rgba(220, 38, 38, 0.08)",
  });
  drawBasisVectors(ctx, canvas, scale, originalBasis, transformedBasis);
  drawLegend(ctx);
}
