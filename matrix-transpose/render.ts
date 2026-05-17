import {
  createGridLines,
  drawArrowVector,
  drawAxes,
  drawGridLines,
  drawShape,
  getScaleToFitShapes,
} from "../shared/canvas2d.js";
import { transformShape } from "../shared/matrix.js";
import type { Matrix, Vector } from "../shared/types.js";

const GRID_EXTENT = 3;

type SceneInput = {
  matrix: Matrix;
  transposeMatrix: Matrix;
  unitSquare: Vector[];
  basisVectors: Vector[];
};

/**
 * 원본 / A 적용 / Aᵀ 적용 결과를 한 캔버스에 겹쳐 그린다.
 *
 * 대칭 행렬이면 A와 Aᵀ 도형이 완전히 겹쳐 두 색이 한 자리에 보이도록 한다.
 */
export function renderScene(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  input: SceneInput,
) {
  const { matrix, transposeMatrix, unitSquare, basisVectors } = input;

  const matrixSquare = transformShape(unitSquare, matrix);
  const transposeSquare = transformShape(unitSquare, transposeMatrix);
  const matrixBasis = transformShape(basisVectors, matrix);
  const transposeBasis = transformShape(basisVectors, transposeMatrix);

  const scale = getScaleToFitShapes(canvas, [
    unitSquare,
    matrixSquare,
    transposeSquare,
    basisVectors,
    matrixBasis,
    transposeBasis,
  ]);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGridLines(ctx, canvas, scale, createGridLines(GRID_EXTENT), "rgba(203, 213, 225, 0.7)", 1);
  drawAxes(ctx, canvas);

  drawShape(ctx, canvas, scale, unitSquare, {
    strokeStyle: "rgba(100, 116, 139, 0.55)",
    fillStyle: "rgba(148, 163, 184, 0.16)",
  });

  drawShape(ctx, canvas, scale, matrixSquare, {
    strokeStyle: "#2563eb",
    fillStyle: "rgba(37, 99, 235, 0.28)",
  });

  drawShape(ctx, canvas, scale, transposeSquare, {
    strokeStyle: "#ea580c",
    fillStyle: "rgba(234, 88, 12, 0.28)",
  });

  drawArrowVector(ctx, canvas, scale, matrixBasis[0], { color: "#2563eb", label: "A·î" });
  drawArrowVector(ctx, canvas, scale, matrixBasis[1], { color: "#1d4ed8", label: "A·ĵ" });
  drawArrowVector(ctx, canvas, scale, transposeBasis[0], { color: "#ea580c", label: "Aᵀ·î" });
  drawArrowVector(ctx, canvas, scale, transposeBasis[1], { color: "#c2410c", label: "Aᵀ·ĵ" });

  drawLegend(ctx);
}

/**
 * 세 도형의 색 의미를 화면 좌상단에 표시한다.
 */
function drawLegend(ctx: CanvasRenderingContext2D) {
  const items = [
    { label: "원본 단위 정사각형", color: "rgba(148, 163, 184, 0.7)" },
    { label: "A 적용", color: "#2563eb" },
    { label: "Aᵀ 적용", color: "#ea580c" },
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
