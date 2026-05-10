import { CANVAS_ID, matrix, triangle } from "./data.js";
import { getCanvasContext, renderScene } from "./canvas.js";
import { transformShape } from "./math.js";

function main() {
  const { canvas, ctx } = getCanvasContext(CANVAS_ID);
  const transformedTriangle = transformShape(triangle, matrix);

  renderScene(canvas, ctx, triangle, transformedTriangle);
  console.log({
    originalTriangle: triangle,
    transformedTriangle,
  });
}

main();
