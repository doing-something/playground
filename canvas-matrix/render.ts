import {
  createGridLines,
  drawAxes,
  drawGridLines,
  drawShape,
  getScaleToFitShapes,
} from "../shared/canvas2d.js";
import type { Vector } from "../shared/types.js";
import { transformPointAffine, type AffineMatrix } from "./affine.js";

const GRID_EXTENT = 4;

type SceneInput = {
  matrix: AffineMatrix;
  unitSquare: Vector[];
};

export function renderScene(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  input: SceneInput,
) {
  const { matrix, unitSquare } = input;
  const transformed = unitSquare.map((p) => transformPointAffine(matrix, p));

  const scale = getScaleToFitShapes(canvas, [unitSquare, transformed]);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGridLines(ctx, canvas, scale, createGridLines(GRID_EXTENT), "rgba(203, 213, 225, 0.7)", 1);
  drawAxes(ctx, canvas);

  drawShape(ctx, canvas, scale, unitSquare, {
    strokeStyle: "rgba(100, 116, 139, 0.55)",
    fillStyle: "rgba(148, 163, 184, 0.16)",
  });

  drawShape(ctx, canvas, scale, transformed, {
    strokeStyle: "#2563eb",
    fillStyle: "rgba(37, 99, 235, 0.28)",
  });

  drawLegend(ctx);
}

function drawLegend(ctx: CanvasRenderingContext2D) {
  const items = [
    { label: "원본 단위 정사각형", color: "rgba(148, 163, 184, 0.7)" },
    { label: "변환 누적 결과", color: "#2563eb" },
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
