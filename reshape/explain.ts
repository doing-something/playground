import {
  ORIGINAL_HEIGHT,
  ORIGINAL_WIDTH,
  TOTAL_ELEMENTS,
  isValidReshape,
  shapeLabel,
  type Shape,
} from "./data.js";

type ExplanationElements = {
  originalShape: HTMLElement;
  newShape: HTMLElement;
  product: HTMLElement;
  status: HTMLElement;
};

export function renderExplanation(shape: Shape) {
  const elements = getExplanationElements();
  const product = shape.rows * shape.cols;
  const ok = isValidReshape(shape);

  elements.originalShape.textContent = `(${ORIGINAL_HEIGHT}, ${ORIGINAL_WIDTH})`;
  elements.newShape.textContent = shapeLabel(shape);
  elements.product.textContent = `${shape.rows} × ${shape.cols} = ${product}`;

  if (ok) {
    elements.status.textContent = `OK: 원본의 ${TOTAL_ELEMENTS}개 원소와 정확히 맞습니다.`;
    elements.status.classList.remove("status-error");
    elements.status.classList.add("status-ok");
  } else {
    elements.status.textContent = `차원 불일치: 원본 ${TOTAL_ELEMENTS}개와 다릅니다. PyTorch도 같은 경우 RuntimeError를 던집니다.`;
    elements.status.classList.remove("status-ok");
    elements.status.classList.add("status-error");
  }
}

function getExplanationElements(): ExplanationElements {
  return {
    originalShape: getRequiredElement("original-shape"),
    newShape: getRequiredElement("new-shape"),
    product: getRequiredElement("shape-product"),
    status: getRequiredElement("shape-status"),
  };
}

function getRequiredElement(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (!(element instanceof HTMLElement)) {
    throw new Error(`${id} 요소를 찾을 수 없습니다.`);
  }

  return element;
}
