import { multiplyMatrixVector } from "./matrix.js";
import type { Matrix, Vector } from "./types.js";

const CANVAS_PADDING = 48;

/**
 * 도형을 그릴 때 사용할 채우기색과 선색을 묶어 둔 스타일 정보다.
 */
export type ShapeStyle = {
  fillStyle: string;
  strokeStyle: string;
};

/**
 * 화살표 벡터를 그릴 때 사용할 색과 라벨 정보를 담는다.
 */
export type VectorStyle = {
  color: string;
  label: string;
};

/**
 * 격자선 한 개를 수학 좌표계의 시작점과 끝점으로 표현한다.
 */
export type LineSegment = {
  end: Vector;
  start: Vector;
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
export function toCanvasPoint(scale: number, vertex: Vector, canvas: HTMLCanvasElement): Vector {
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
export function getScaleToFitShapes(canvas: HTMLCanvasElement, shapes: Vector[][]): number {
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
 * 지정한 범위의 원본 격자선을 만든다.
 *
 * @param extent 원점에서 각 축 방향으로 몇 칸까지 격자를 만들지 나타내는 범위
 * @returns 원본 격자선 목록
 */
export function createGridLines(extent: number): LineSegment[] {
  const lines: LineSegment[] = [];

  for (let value = -extent; value <= extent; value += 1) {
    if (value === 0) {
      continue;
    }

    lines.push({
      start: [value, -extent],
      end: [value, extent],
    });
    lines.push({
      start: [-extent, value],
      end: [extent, value],
    });
  }

  return lines;
}

/**
 * 격자선의 시작점과 끝점에 행렬을 적용한다.
 *
 * 선형변환에서는 직선이 여전히 직선으로 가므로, 양 끝점만 변환해도
 * 화면에서는 변환된 격자선을 그릴 수 있다.
 *
 * @param transform 격자선에 적용할 2x2 변환 행렬
 * @param segments 변환할 격자선 목록
 * @returns 변환된 격자선 목록
 */
export function transformLineSegments(transform: Matrix, segments: LineSegment[]): LineSegment[] {
  return segments.map((segment) => ({
    start: multiplyMatrixVector(transform, segment.start),
    end: multiplyMatrixVector(transform, segment.end),
  }));
}

/**
 * 격자선 목록의 모든 끝점을 한 배열로 모은다.
 *
 * 축척 계산 시 격자가 화면 밖으로 잘리지 않게 하기 위해 사용한다.
 *
 * @param segments 끝점을 펼칠 격자선 목록
 * @returns 모든 시작점과 끝점을 담은 벡터 목록
 */
export function getLineSegmentVertices(segments: LineSegment[]): Vector[] {
  return segments.flatMap((segment) => [segment.start, segment.end]);
}

/**
 * 캔버스 중앙을 기준으로 x축과 y축을 그린다.
 *
 * 도형이 어디에 놓였는지 직관적으로 읽을 수 있도록 기준선을 먼저 그린다.
 *
 * @param ctx 2D 렌더링 컨텍스트
 * @param canvas 축을 그릴 대상 캔버스
 */
export function drawAxes(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
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
 * 격자선 목록을 캔버스에 그린다.
 *
 * @param ctx 2D 렌더링 컨텍스트
 * @param canvas 좌표 변환 기준이 되는 캔버스
 * @param scale 수학 좌표를 화면 좌표로 바꾸는 축척
 * @param segments 그릴 격자선 목록
 * @param strokeStyle 격자선 색
 * @param lineWidth 격자선 두께
 */
export function drawGridLines(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  scale: number,
  segments: LineSegment[],
  strokeStyle: string,
  lineWidth: number,
) {
  ctx.save();
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;

  for (const segment of segments) {
    const [startX, startY] = toCanvasPoint(scale, segment.start, canvas);
    const [endX, endY] = toCanvasPoint(scale, segment.end, canvas);

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }

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
export function drawShape(
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
 * 원점에서 시작하는 벡터를 화살표로 그린다.
 *
 * @param ctx 2D 렌더링 컨텍스트
 * @param canvas 좌표 변환 기준이 되는 캔버스
 * @param scale 수학 좌표를 화면 좌표로 바꾸는 축척
 * @param vector 그릴 벡터
 * @param style 선색과 라벨 정보
 */
export function drawArrowVector(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  scale: number,
  vector: Vector,
  style: VectorStyle,
) {
  const [originX, originY] = toCanvasPoint(scale, [0, 0], canvas);
  const [targetX, targetY] = toCanvasPoint(scale, vector, canvas);
  const angle = Math.atan2(targetY - originY, targetX - originX);
  const arrowHeadLength = 12;

  ctx.save();
  ctx.strokeStyle = style.color;
  ctx.fillStyle = style.color;
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.moveTo(originX, originY);
  ctx.lineTo(targetX, targetY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(targetX, targetY);
  ctx.lineTo(
    targetX - arrowHeadLength * Math.cos(angle - Math.PI / 6),
    targetY - arrowHeadLength * Math.sin(angle - Math.PI / 6),
  );
  ctx.lineTo(
    targetX - arrowHeadLength * Math.cos(angle + Math.PI / 6),
    targetY - arrowHeadLength * Math.sin(angle + Math.PI / 6),
  );
  ctx.closePath();
  ctx.fill();

  const labelX = targetX + 10;
  const labelY = targetY - 10;

  ctx.font = '15px -apple-system, "Segoe UI", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif';
  const metrics = ctx.measureText(style.label);
  const labelWidth = metrics.width + 14;
  const labelHeight = 26;

  ctx.fillStyle = "rgba(255, 255, 255, 0.98)";
  ctx.strokeStyle = "rgba(100, 116, 139, 0.7)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(labelX - 6, labelY - 18, labelWidth, labelHeight, 9);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = style.color;
  ctx.font = '15px -apple-system, "Segoe UI", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif';
  ctx.fillText(style.label, labelX, labelY);
  ctx.restore();
}
