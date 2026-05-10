import type { Vector } from "./types.js";

const CANVAS_PADDING = 48;

/**
 * 도형을 그릴 때 사용할 채우기색과 선색을 묶어 둔 스타일 정보다.
 */
type ShapeStyle = {
  fillStyle: string;
  strokeStyle: string;
};

/**
 * 주어진 id의 캔버스 요소와 2D 렌더링 컨텍스트를 가져온다.
 *
 * 캔버스 데모의 모든 그리기 작업은 이 컨텍스트를 통해 이루어진다.
 *
 * @param canvasId DOM에서 찾을 캔버스 요소의 id
 * @returns 캔버스 요소와 2D 렌더링 컨텍스트
 * @throws {Error} 캔버스 요소를 찾을 수 없는 경우
 * @throws {Error} 2D 렌더링 컨텍스트를 만들 수 없는 경우
 */
export function getCanvasContext(canvasId: string) {
  const canvas = document.getElementById(canvasId);
  if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error("캔버스 요소를 찾을 수 없습니다.");
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("2D 렌더링 컨텍스트를 만들 수 없습니다.");
  }

  return { canvas, ctx };
}

/**
 * 수학 좌표계를 캔버스 좌표계로 변환한다.
 *
 * 수학 좌표계는 원점이 중심에 있고 y축이 위로 증가하지만,
 * 캔버스 좌표계는 원점이 왼쪽 위에 있고 y축이 아래로 증가한다.
 * 그래서 중심 이동과 y축 반전이 함께 필요하다.
 *
 * @param scale 수학 좌표 1단위를 몇 픽셀로 그릴지 나타내는 축척
 * @param vertex 변환할 수학 좌표계의 점
 * @param canvas 좌표 변환 기준이 되는 캔버스
 * @returns 캔버스 위에서 사용할 수 있는 화면 좌표
 */
function toCanvasPoint(scale: number, vertex: Vector, canvas: HTMLCanvasElement): Vector {
  const [x, y] = vertex;
  const originX = canvas.width / 2;
  const originY = canvas.height / 2;

  return [
    originX + x * scale,
    originY - y * scale,
  ];
}

/**
 * 여러 도형이 모두 캔버스 안에 들어오도록 적절한 축척을 계산한다.
 *
 * x축과 y축을 그대로 중앙에 두기 위해, 원점에서 가장 멀리 떨어진 정점의 거리로
 * 필요한 최소 배율을 계산한다.
 *
 * @param canvas 축척 계산 기준이 되는 캔버스
 * @param shapes 화면에 함께 그릴 도형 목록
 * @returns 캔버스에 도형이 잘리지 않게 맞추는 픽셀 배율
 */
function getScaleToFitShapes(canvas: HTMLCanvasElement, shapes: Vector[][]): number {
  const vertices = shapes.flat();
  if (vertices.length === 0) {
    return 1;
  }

  const maxAbsX = Math.max(...vertices.map(([x]) => Math.abs(x)), 1);
  const maxAbsY = Math.max(...vertices.map(([, y]) => Math.abs(y)), 1);
  const availableWidth = canvas.width / 2 - CANVAS_PADDING;
  const availableHeight = canvas.height / 2 - CANVAS_PADDING;

  return Math.min(availableWidth / maxAbsX, availableHeight / maxAbsY);
}

/**
 * 캔버스 중앙을 기준으로 x축과 y축을 그린다.
 *
 * 도형이 어디에 놓였는지 직관적으로 읽을 수 있도록 기준선을 먼저 그린다.
 *
 * @param ctx 2D 렌더링 컨텍스트
 * @param canvas 축을 그릴 대상 캔버스
 */
function drawAxes(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
  ctx.save();
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(0, canvas.height / 2);
  ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();

  ctx.fillStyle = "#64748b";
  ctx.font = '12px -apple-system, "Segoe UI", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif';
  ctx.fillText("x", canvas.width - 18, canvas.height / 2 - 8);
  ctx.fillText("y", canvas.width / 2 + 8, 16);
  ctx.restore();
}

/**
 * 점들의 배열로 표현된 도형을 캔버스에 그린다.
 *
 * 도형의 외곽선을 그리고 내부를 채운 뒤, 각 정점을 원으로 표시한다.
 *
 * @param ctx 2D 렌더링 컨텍스트
 * @param canvas 좌표 변환 기준이 되는 캔버스
 * @param scale 수학 좌표를 화면 좌표로 바꾸는 축척
 * @param shape 그릴 도형의 정점 목록
 * @param style 선색과 채우기색 정보
 */
function drawShape(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  scale: number,
  shape: Vector[],
  style: ShapeStyle,
) {
  if (shape.length === 0) {
    return;
  }

  const [firstPoint, ...restPoints] = shape.map((vertex) =>
    toCanvasPoint(scale, vertex, canvas),
  );

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(firstPoint[0], firstPoint[1]);

  for (const point of restPoints) {
    ctx.lineTo(point[0], point[1]);
  }

  ctx.closePath();
  ctx.fillStyle = style.fillStyle;
  ctx.strokeStyle = style.strokeStyle;
  ctx.lineWidth = 3;
  ctx.fill();
  ctx.stroke();

  for (const point of [firstPoint, ...restPoints]) {
    ctx.beginPath();
    ctx.arc(point[0], point[1], 4, 0, Math.PI * 2);
    ctx.fillStyle = style.strokeStyle;
    ctx.fill();
  }

  ctx.restore();
}

/**
 * 원본 도형과 변환 도형을 구분하기 위한 범례를 그린다.
 *
 * @param ctx 2D 렌더링 컨텍스트
 */
function drawLegend(ctx: CanvasRenderingContext2D) {
  const items = [
    { label: "원본 삼각형", color: "#2563eb" },
    { label: "변환된 삼각형", color: "#dc2626" },
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
 * 현재 장면 전체를 다시 그린다.
 *
 * 이전 프레임을 지우고, 축, 원본 도형, 변환된 도형, 범례 순서로 렌더링한다.
 *
 * @param canvas 그리기 대상 캔버스
 * @param ctx 2D 렌더링 컨텍스트
 * @param originalShape 원본 도형의 정점 목록
 * @param transformedShape 변환된 도형의 정점 목록
 */
export function renderScene(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  originalShape: Vector[],
  transformedShape: Vector[],
) {
  const scale = getScaleToFitShapes(canvas, [originalShape, transformedShape]);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawAxes(ctx, canvas);
  drawShape(ctx, canvas, scale, originalShape, {
    strokeStyle: "#2563eb",
    fillStyle: "rgba(37, 99, 235, 0.18)",
  });
  drawShape(ctx, canvas, scale, transformedShape, {
    strokeStyle: "#dc2626",
    fillStyle: "rgba(220, 38, 38, 0.16)",
  });
  drawLegend(ctx);
}
