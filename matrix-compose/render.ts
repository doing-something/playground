import {
  createGridLines,
  drawAxes,
  drawGridLines,
  drawShape,
  getScaleToFitShapes,
  toCanvasPoint,
} from "../shared/canvas2d.js";
import { multiplyMatrices, transformShape } from "../shared/matrix.js";
import type { Matrix, Vector } from "../shared/types.js";

const GRID_EXTENT = 3;

type SceneInput = {
  a: Matrix;
  b: Matrix;
  unitSquare: Vector[];
};

/**
 * 원본 / B 적용 / A·B 단계 적용 / C=A·B 한 번 적용을 한 캔버스에 겹쳐 그린다.
 *
 * "A·B 단계 적용"(빨강 채움)과 "C 한 번 적용"(검은 점선)이 같은 자리에 있어야
 * 행렬 곱이 곧 변환 합성이라는 사실이 시각적으로 검증된다.
 */
export function renderScene(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  input: SceneInput,
) {
  const { a, b, unitSquare } = input;
  const c = multiplyMatrices(a, b);

  const afterB = transformShape(unitSquare, b);
  const afterAB = transformShape(afterB, a);
  const afterC = transformShape(unitSquare, c);

  const scale = getScaleToFitShapes(canvas, [
    unitSquare,
    afterB,
    afterAB,
    afterC,
  ]);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGridLines(ctx, canvas, scale, createGridLines(GRID_EXTENT), "rgba(203, 213, 225, 0.7)", 1);
  drawAxes(ctx, canvas);

  drawShape(ctx, canvas, scale, unitSquare, {
    strokeStyle: "rgba(100, 116, 139, 0.55)",
    fillStyle: "rgba(148, 163, 184, 0.16)",
  });

  drawShape(ctx, canvas, scale, afterB, {
    strokeStyle: "#2563eb",
    fillStyle: "rgba(37, 99, 235, 0.18)",
  });

  drawShape(ctx, canvas, scale, afterAB, {
    strokeStyle: "#dc2626",
    fillStyle: "rgba(220, 38, 38, 0.32)",
  });

  drawDashedOutline(ctx, canvas, scale, afterC, "#0f172a");

  drawLegend(ctx);
}

/**
 * 채우기 없이 점선 외곽선만 그린다. 같은 자리에 있는 다른 도형 위에 겹쳐
 * "이 자리가 결과 자리"라는 걸 시각적으로 강조하는 용도.
 */
function drawDashedOutline(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  scale: number,
  shape: Vector[],
  color: string,
) {
  if (shape.length === 0) {
    return;
  }

  const points = shape.map((vertex) => toCanvasPoint(scale, vertex, canvas));

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.setLineDash([7, 5]);
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let index = 1; index < points.length; index += 1) {
    ctx.lineTo(points[index][0], points[index][1]);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function drawLegend(ctx: CanvasRenderingContext2D) {
  const items = [
    { label: "원본 단위 정사각형", color: "rgba(148, 163, 184, 0.7)" },
    { label: "B 적용 (중간 단계)", color: "#2563eb" },
    { label: "그 다음 A 적용 (단계적 결과)", color: "#dc2626" },
    { label: "C = A·B 한 번 적용 (점선)", color: "#0f172a" },
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
