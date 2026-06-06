import { DATA_POINTS, type TrainingState } from "./data.js";

type PlotBounds = {
  maxX: number;
  maxY: number;
  minX: number;
  minY: number;
};

const PADDING = {
  bottom: 48,
  left: 56,
  right: 28,
  top: 28,
};

const PLOT_BOUNDS: PlotBounds = {
  maxX: 5.6,
  maxY: 6.8,
  minX: 0,
  minY: 0,
};

export function renderScene(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  state: TrainingState,
) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPlotBackground(canvas, ctx);
  drawPredictionLine(canvas, ctx, state);
  drawDataPoints(canvas, ctx, state);
}

function drawPlotBackground(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(203, 213, 225, 0.72)";
  ctx.lineWidth = 1;
  ctx.font = '12px -apple-system, "Segoe UI", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif';
  ctx.fillStyle = "#64748b";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let x = 0; x <= 5; x += 1) {
    const point = toCanvasPoint(canvas, x, PLOT_BOUNDS.minY);
    const top = toCanvasPoint(canvas, x, PLOT_BOUNDS.maxY);

    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    ctx.lineTo(top.x, top.y);
    ctx.stroke();
    ctx.fillText(String(x), point.x, canvas.height - 24);
  }

  ctx.textAlign = "right";
  for (let y = 0; y <= 6; y += 1) {
    const point = toCanvasPoint(canvas, PLOT_BOUNDS.minX, y);
    const right = toCanvasPoint(canvas, PLOT_BOUNDS.maxX, y);

    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    ctx.lineTo(right.x, right.y);
    ctx.stroke();
    ctx.fillText(String(y), 40, point.y);
  }

  const origin = toCanvasPoint(canvas, PLOT_BOUNDS.minX, PLOT_BOUNDS.minY);
  const yAxisTop = toCanvasPoint(canvas, PLOT_BOUNDS.minX, PLOT_BOUNDS.maxY);
  const xAxisRight = toCanvasPoint(canvas, PLOT_BOUNDS.maxX, PLOT_BOUNDS.minY);

  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(origin.x, origin.y);
  ctx.lineTo(xAxisRight.x, xAxisRight.y);
  ctx.moveTo(origin.x, origin.y);
  ctx.lineTo(yAxisTop.x, yAxisTop.y);
  ctx.stroke();
  ctx.restore();
}

function drawPredictionLine(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  state: TrainingState,
) {
  const [slope, bias] = state.weights;
  const startX = PLOT_BOUNDS.minX;
  const endX = PLOT_BOUNDS.maxX;
  const start = toCanvasPoint(canvas, startX, slope * startX + bias);
  const end = toCanvasPoint(canvas, endX, slope * endX + bias);

  ctx.save();
  ctx.strokeStyle = "#2563eb";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();
  ctx.restore();
}

function drawDataPoints(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  state: TrainingState,
) {
  const usedIndexSet = new Set(state.lastUsedIndices);

  DATA_POINTS.forEach((point, index) => {
    const canvasPoint = toCanvasPoint(canvas, point.x, point.y);
    const isUsed = usedIndexSet.has(index);

    ctx.save();
    ctx.beginPath();
    ctx.arc(canvasPoint.x, canvasPoint.y, isUsed ? 9 : 6, 0, Math.PI * 2);
    ctx.fillStyle = isUsed ? "#f97316" : "#0f766e";
    ctx.fill();
    ctx.lineWidth = isUsed ? 4 : 2;
    ctx.strokeStyle = isUsed ? "rgba(251, 146, 60, 0.45)" : "rgba(15, 118, 110, 0.28)";
    ctx.stroke();

    ctx.fillStyle = "#0f172a";
    ctx.font = '12px -apple-system, "Segoe UI", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText(String(index), canvasPoint.x, canvasPoint.y - 12);
    ctx.restore();
  });
}

function toCanvasPoint(canvas: HTMLCanvasElement, x: number, y: number) {
  const plotWidth = canvas.width - PADDING.left - PADDING.right;
  const plotHeight = canvas.height - PADDING.top - PADDING.bottom;
  const normalizedX = (x - PLOT_BOUNDS.minX) / (PLOT_BOUNDS.maxX - PLOT_BOUNDS.minX);
  const normalizedY = (y - PLOT_BOUNDS.minY) / (PLOT_BOUNDS.maxY - PLOT_BOUNDS.minY);

  return {
    x: PADDING.left + normalizedX * plotWidth,
    y: PADDING.top + (1 - normalizedY) * plotHeight,
  };
}
