import type { ActivationState } from "./data.js";

const PADDING = { top: 36, right: 28, bottom: 56, left: 64 };
const COLORS = {
  axis: "#64748b",
  grid: "#dbe4f0",
  point: "#0f172a",
  relu: "#ea580c",
  sigmoid: "#2563eb",
  softmaxA: "#2563eb",
  softmaxB: "#f59e0b",
  softmaxC: "#10b981",
  text: "#0f172a",
};

export function renderActivationDemo(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  state: ActivationState,
) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (state.tab === "softmax") {
    drawSoftmax(canvas, ctx, state.softmaxLogits);
    return;
  }

  drawCurveAxes(canvas, ctx, state.tab === "sigmoid" ? [-8, 8] : [-8, 8], [0, state.tab === "sigmoid" ? 1 : 8]);

  if (state.tab === "sigmoid") {
    drawCurve(canvas, ctx, -8, 8, 0, 1, sigmoid, COLORS.sigmoid);
    const y = sigmoid(state.sigmoidX);
    drawPoint(canvas, ctx, -8, 8, 0, 1, state.sigmoidX, y, COLORS.sigmoid);
    drawLegend(ctx, "S-curve", COLORS.sigmoid, 88, 38);
    return;
  }

  drawCurve(canvas, ctx, -8, 8, 0, 8, relu, COLORS.relu);
  const y = relu(state.reluX);
  drawPoint(canvas, ctx, -8, 8, 0, 8, state.reluX, y, COLORS.relu);
  drawLegend(ctx, "max(0, x)", COLORS.relu, 88, 38);
}

function drawCurveAxes(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  xDomain: [number, number],
  yDomain: [number, number],
) {
  const chart = getChartBounds(canvas);
  ctx.save();
  ctx.strokeStyle = COLORS.grid;
  ctx.lineWidth = 1;

  for (let i = 0; i <= 4; i += 1) {
    const y = chart.top + (chart.height / 4) * i;
    ctx.beginPath();
    ctx.moveTo(chart.left, y);
    ctx.lineTo(chart.right, y);
    ctx.stroke();
  }

  for (let i = 0; i <= 8; i += 1) {
    const x = chart.left + (chart.width / 8) * i;
    ctx.beginPath();
    ctx.moveTo(x, chart.top);
    ctx.lineTo(x, chart.bottom);
    ctx.stroke();
  }

  ctx.strokeStyle = COLORS.axis;
  ctx.lineWidth = 1.5;

  const zeroX = projectX(0, xDomain, chart.left, chart.width);
  const zeroY = projectY(0, yDomain, chart.top, chart.height);

  ctx.beginPath();
  ctx.moveTo(chart.left, zeroY);
  ctx.lineTo(chart.right, zeroY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(zeroX, chart.top);
  ctx.lineTo(zeroX, chart.bottom);
  ctx.stroke();

  ctx.fillStyle = COLORS.axis;
  ctx.font = '12px -apple-system, "Segoe UI", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif';
  ctx.fillText("x", chart.right + 8, zeroY + 4);
  ctx.fillText("y", zeroX + 8, chart.top - 10);
  ctx.restore();
}

function drawCurve(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  fn: (x: number) => number,
  color: string,
) {
  const chart = getChartBounds(canvas);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.beginPath();

  for (let i = 0; i <= 240; i += 1) {
    const t = i / 240;
    const x = xMin + (xMax - xMin) * t;
    const y = fn(x);
    const px = projectX(x, [xMin, xMax], chart.left, chart.width);
    const py = projectY(y, [yMin, yMax], chart.top, chart.height);

    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }

  ctx.stroke();
  ctx.restore();
}

function drawPoint(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  x: number,
  y: number,
  color: string,
) {
  const chart = getChartBounds(canvas);
  const px = projectX(x, [xMin, xMax], chart.left, chart.width);
  const py = projectY(y, [yMin, yMax], chart.top, chart.height);

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = "#ffffff";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(px, py, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = COLORS.point;
  ctx.font = '13px -apple-system, "Segoe UI", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif';
  ctx.fillText(`(${formatNumber(x)}, ${formatNumber(y)})`, px + 12, py - 10);
  ctx.restore();
}

function drawSoftmax(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  logits: [number, number, number],
) {
  const probs = softmax(logits);
  const chart = getChartBounds(canvas);

  ctx.save();
  ctx.strokeStyle = COLORS.grid;
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i += 1) {
    const y = chart.top + (chart.height / 4) * i;
    ctx.beginPath();
    ctx.moveTo(chart.left, y);
    ctx.lineTo(chart.right, y);
    ctx.stroke();
  }

  ctx.strokeStyle = COLORS.axis;
  ctx.beginPath();
  ctx.moveTo(chart.left, chart.bottom);
  ctx.lineTo(chart.right, chart.bottom);
  ctx.stroke();
  ctx.restore();

  const colors = [COLORS.softmaxA, COLORS.softmaxB, COLORS.softmaxC];
  const labels = ["A", "B", "C"];
  const gap = 28;
  const barWidth = (chart.width - gap * 2) / 3;

  probs.forEach((value, index) => {
    const x = chart.left + index * (barWidth + gap);
    const y = projectY(value, [0, 1], chart.top, chart.height);
    const height = chart.bottom - y;

    ctx.save();
    ctx.fillStyle = colors[index];
    ctx.globalAlpha = 0.92;
    ctx.fillRect(x, y, barWidth, height);
    ctx.globalAlpha = 1;
    ctx.fillStyle = COLORS.text;
    ctx.font = '13px -apple-system, "Segoe UI", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif';
    ctx.fillText(labels[index], x + barWidth / 2 - 4, chart.bottom + 22);
    ctx.fillText(formatNumber(value), x + 8, y - 10);
    ctx.fillText(`logit ${formatNumber(logits[index])}`, x + 8, chart.top - 12);
    ctx.restore();
  });

  drawLegend(ctx, "Probabilities sum to 1", "#334155", 92, 38);
}

function drawLegend(
  ctx: CanvasRenderingContext2D,
  text: string,
  color: string,
  x: number,
  y: number,
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + 26, y);
  ctx.stroke();
  ctx.fillStyle = COLORS.text;
  ctx.font = '13px -apple-system, "Segoe UI", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif';
  ctx.fillText(text, x + 34, y + 4);
  ctx.restore();
}

function getChartBounds(canvas: HTMLCanvasElement) {
  const left = PADDING.left;
  const top = PADDING.top;
  const right = canvas.width - PADDING.right;
  const bottom = canvas.height - PADDING.bottom;

  return {
    bottom,
    height: bottom - top,
    left,
    right,
    top,
    width: right - left,
  };
}

function projectX(value: number, domain: [number, number], left: number, width: number) {
  return left + ((value - domain[0]) / (domain[1] - domain[0])) * width;
}

function projectY(value: number, domain: [number, number], top: number, height: number) {
  return top + (1 - (value - domain[0]) / (domain[1] - domain[0])) * height;
}

export function sigmoid(x: number) {
  return 1 / (1 + Math.exp(-x));
}

export function relu(x: number) {
  return Math.max(0, x);
}

export function softmax(logits: [number, number, number]) {
  const peak = Math.max(...logits);
  const exps = logits.map((value) => Math.exp(value - peak));
  const sum = exps.reduce((acc, value) => acc + value, 0);
  return exps.map((value) => value / sum) as [number, number, number];
}

export function formatNumber(value: number) {
  return value.toFixed(4).replace(/\.?0+$/, "");
}

