import { isValidReshape, shapeLabel, type Shape } from "./data.js";
import { reshape } from "./reshape.js";

type SceneInput = {
  originalHeight: number;
  originalWidth: number;
  shape: Shape;
};

const TITLE_FONT = '14px -apple-system, "Segoe UI", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif';

/**
 * 같은 1D 데이터([0..N-1])를 두 가지 모양으로 좌·우 격자에 그린다.
 *
 * 원본 격자도, 새 격자도 모두 같은 1D 인덱스 배열을 reshape() 한 결과다.
 * 각 셀의 색(hue 그라데이션)과 번호는 데이터 그 자체이므로
 * "메모리 순서는 같고 모양만 바뀐다"는 사실이 그림에 그대로 드러난다.
 */
export function renderScene(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  input: SceneInput,
) {
  const { originalHeight, originalWidth, shape } = input;
  const total = originalHeight * originalWidth;
  const data = Array.from({ length: total }, (_, index) => index);
  const originalMatrix = reshape(data, originalHeight, originalWidth);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const margin = 36;
  const gap = 56;
  const titleHeight = 28;
  const halfWidth = (canvas.width - margin * 2 - gap) / 2;
  const gridHeight = canvas.height - margin * 2 - titleHeight;

  drawIndexedGrid(ctx, {
    x: margin,
    y: margin + titleHeight,
    maxWidth: halfWidth,
    maxHeight: gridHeight,
    matrix: originalMatrix,
    total,
    title: `원본 (${originalHeight}, ${originalWidth})`,
  });

  if (isValidReshape(shape)) {
    const targetMatrix = reshape(data, shape.rows, shape.cols);

    drawIndexedGrid(ctx, {
      x: margin + halfWidth + gap,
      y: margin + titleHeight,
      maxWidth: halfWidth,
      maxHeight: gridHeight,
      matrix: targetMatrix,
      total,
      title: `reshape ${shapeLabel(shape)}`,
    });

    drawArrow(
      ctx,
      margin + halfWidth + 10,
      canvas.height / 2,
      margin + halfWidth + gap - 10,
      canvas.height / 2,
    );
  } else {
    drawError(
      ctx,
      margin + halfWidth + gap,
      margin + titleHeight,
      halfWidth,
      gridHeight,
      `(${shape.rows} × ${shape.cols} = ${shape.rows * shape.cols}) ≠ ${total}`,
    );
  }
}

type GridOptions = {
  x: number;
  y: number;
  maxWidth: number;
  maxHeight: number;
  matrix: number[][];
  total: number;
  title: string;
};

function drawIndexedGrid(ctx: CanvasRenderingContext2D, options: GridOptions) {
  const { x, y, maxWidth, maxHeight, matrix, total, title } = options;
  const rows = matrix.length;
  const cols = matrix[0]?.length ?? 0;

  const cellSize = Math.min(maxWidth / cols, maxHeight / rows);
  const gridWidth = cellSize * cols;
  const gridHeight = cellSize * rows;
  const gridX = x + (maxWidth - gridWidth) / 2;
  const gridY = y + (maxHeight - gridHeight) / 2;

  ctx.save();
  ctx.font = TITLE_FONT;
  ctx.textAlign = "center";
  ctx.fillStyle = "#0f172a";
  ctx.fillText(title, x + maxWidth / 2, y - 12);
  ctx.restore();

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const value = matrix[row][col];
      const cx = gridX + col * cellSize;
      const cy = gridY + row * cellSize;

      const hue = (360 * value) / total;
      ctx.fillStyle = `hsl(${hue}, 62%, 70%)`;
      ctx.fillRect(cx, cy, cellSize, cellSize);

      ctx.strokeStyle = "rgba(15, 23, 42, 0.35)";
      ctx.lineWidth = 1;
      ctx.strokeRect(cx, cy, cellSize, cellSize);

      const fontSize = Math.min(cellSize * 0.42, 18);
      if (fontSize >= 9) {
        ctx.save();
        ctx.fillStyle = "#0f172a";
        ctx.font = `${fontSize}px -apple-system, "SF Mono", "Consolas", monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(value), cx + cellSize / 2, cy + cellSize / 2);
        ctx.restore();
      }
    }
  }
}

function drawArrow(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
) {
  ctx.save();
  ctx.strokeStyle = "#475569";
  ctx.fillStyle = "#475569";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  const headLength = 10;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - headLength, y2 - 6);
  ctx.lineTo(x2 - headLength, y2 + 6);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawError(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  message: string,
) {
  ctx.save();
  ctx.strokeStyle = "rgba(220, 38, 38, 0.45)";
  ctx.fillStyle = "rgba(254, 226, 226, 0.6)";
  ctx.lineWidth = 1;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.fillStyle = "#b91c1c";
  ctx.font = TITLE_FONT;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("차원 불일치", x + width / 2, y + height / 2 - 12);
  ctx.font = '13px -apple-system, "SF Mono", "Consolas", monospace';
  ctx.fillText(message, x + width / 2, y + height / 2 + 12);
  ctx.restore();
}
