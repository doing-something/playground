import { determinant2x2 } from "./math.js";
import type { Matrix, Vector } from "./types.js";

const EPSILON = 1e-9;

type ExplanationElements = {
  areaScale: HTMLElement;
  basisRows: HTMLTableSectionElement;
  determinant: HTMLElement;
  matrix: HTMLElement;
  summary: HTMLElement;
  transformName: HTMLElement;
  vertexRows: HTMLTableSectionElement;
};

/**
 * 현재 행렬과 정점 계산 결과를 설명 패널에 렌더링한다.
 *
 * @param transformName 현재 행렬에 붙일 학습용 이름
 * @param matrix 현재 적용 중인 2x2 변환 행렬
 * @param originalShape 원본 도형의 정점 목록
 * @param transformedShape 변환된 도형의 정점 목록
 * @param originalBasis 원본 기저벡터 목록
 * @param transformedBasis 변환된 기저벡터 목록
 */
export function renderExplanation(
  transformName: string,
  matrix: Matrix,
  originalShape: Vector[],
  transformedShape: Vector[],
  originalBasis: Vector[],
  transformedBasis: Vector[],
) {
  const elements = getExplanationElements();
  const determinant = determinant2x2(matrix);

  elements.transformName.textContent = transformName;
  elements.matrix.textContent = formatMatrix(matrix);
  elements.determinant.textContent = formatNumber(determinant);
  elements.areaScale.textContent = formatAreaScale(determinant);
  elements.summary.textContent = summarizeTransform(matrix, determinant);
  elements.basisRows.innerHTML = buildBasisRows(originalBasis, transformedBasis);
  elements.vertexRows.innerHTML = buildVertexRows(matrix, originalShape, transformedShape);
}

/**
 * 기저벡터 변화 결과를 표 행 문자열로 만든다.
 *
 * @param originalBasis 원본 기저벡터 목록
 * @param transformedBasis 변환된 기저벡터 목록
 * @returns tbody 안에 넣을 HTML 문자열
 */
function buildBasisRows(originalBasis: Vector[], transformedBasis: Vector[]): string {
  return originalBasis
    .map((originalVector, index) => {
      const transformedVector = transformedBasis[index];
      const label = `e${index + 1}`;

      return `
        <tr>
          <th scope="row">${label}</th>
          <td>${formatVector(originalVector)}</td>
          <td>${formatVector(transformedVector)}</td>
        </tr>
      `;
    })
    .join("");
}

/**
 * 정점별 계산 결과를 표 행 문자열로 만든다.
 *
 * @param matrix 현재 적용 중인 2x2 변환 행렬
 * @param originalShape 원본 정점 목록
 * @param transformedShape 변환 후 정점 목록
 * @returns tbody 안에 넣을 HTML 문자열
 */
function buildVertexRows(
  matrix: Matrix,
  originalShape: Vector[],
  transformedShape: Vector[],
): string {
  return originalShape
    .map((originalVertex, index) => {
      const transformedVertex = transformedShape[index];

      return `
        <tr>
          <th scope="row">${getVertexLabel(index)}</th>
          <td>${formatVector(originalVertex)}</td>
          <td>${formatCalculation(matrix, originalVertex)}</td>
          <td>${formatVector(transformedVertex)}</td>
        </tr>
      `;
    })
    .join("");
}

/**
 * 현재 행렬이 어떤 변환인지 짧은 문장으로 설명한다.
 *
 * @param matrix 현재 적용 중인 2x2 행렬
 * @param determinant 행렬식 값
 * @returns 학습용 요약 문장
 */
function summarizeTransform(matrix: Matrix, determinant: number): string {
  const [[a, b], [c, d]] = matrix;

  if (approximatelyEqual(determinant, 0)) {
    return "이 행렬은 도형을 한 직선 방향으로 눌러 면적을 0으로 만듭니다.";
  }

  if (approximatelyEqual(b, 0) && approximatelyEqual(c, 0)) {
    if (approximatelyEqual(a, d)) {
      return `${formatNumber(a)}배의 균일한 확대/축소가 일어나며, 면적은 ${formatAreaScale(determinant)}로 바뀝니다.`;
    }

    return `x축은 ${formatNumber(a)}배, y축은 ${formatNumber(d)}배로 독립적으로 늘어나거나 줄어듭니다.`;
  }

  if (approximatelyEqual(a, 1) && approximatelyEqual(d, 1)) {
    return `축이 서로 섞여 기울이기 성분이 생깁니다. 면적은 ${formatAreaScale(determinant)}로 바뀝니다.`;
  }

  if (determinant < 0) {
    return "방향이 뒤집히는 반사 성분이 포함되어 있습니다.";
  }

  return `회전 또는 기울이기 성분이 포함된 일반적인 선형변환입니다. 면적은 ${formatAreaScale(determinant)}로 바뀝니다.`;
}

/**
 * 정점 하나에 대한 행렬 곱 계산식을 사람이 읽기 쉬운 문자열로 만든다.
 *
 * @param matrix 현재 적용 중인 2x2 행렬
 * @param vertex 계산 대상 정점
 * @returns 계산식 문자열
 */
function formatCalculation(matrix: Matrix, vertex: Vector): string {
  const [[a, b], [c, d]] = matrix;
  const [x, y] = vertex;

  return `[${formatTerm(a, x, b, y)}, ${formatTerm(c, x, d, y)}]`;
}

/**
 * 두 항의 합으로 이루어진 계산식을 문자열로 만든다.
 *
 * @param leftFactor 첫 번째 계수
 * @param leftValue 첫 번째 곱셈 대상 값
 * @param rightFactor 두 번째 계수
 * @param rightValue 두 번째 곱셈 대상 값
 * @returns 예: "2×1 + 0×2"
 */
function formatTerm(
  leftFactor: number,
  leftValue: number,
  rightFactor: number,
  rightValue: number,
): string {
  return `${formatNumber(leftFactor)}×${formatNumber(leftValue)} + ${formatNumber(rightFactor)}×${formatNumber(rightValue)}`;
}

/**
 * 도형 정점 번호를 A, B, C 형태의 라벨로 바꾼다.
 *
 * @param index 정점 순서
 * @returns 정점 라벨
 */
function getVertexLabel(index: number): string {
  return String.fromCharCode("A".charCodeAt(0) + index);
}

/**
 * 숫자를 화면 표시용 문자열로 정리한다.
 *
 * 소수점 오차를 줄이기 위해 필요한 경우 소수 둘째 자리까지 반올림한다.
 *
 * @param value 표시할 숫자
 * @returns 사람이 읽기 쉬운 숫자 문자열
 */
function formatNumber(value: number): string {
  const normalized = approximatelyEqual(value, 0) ? 0 : value;
  return Number.isInteger(normalized)
    ? String(normalized)
    : normalized.toFixed(2).replace(/\.?0+$/, "");
}

/**
 * 벡터를 "[x, y]" 형태 문자열로 바꾼다.
 *
 * @param vector 문자열로 바꿀 벡터
 * @returns 벡터 문자열
 */
function formatVector(vector: Vector): string {
  return `[${vector.map((value) => formatNumber(value)).join(", ")}]`;
}

/**
 * 2x2 행렬을 한 줄 문자열로 바꾼다.
 *
 * @param matrix 문자열로 바꿀 2x2 행렬
 * @returns 행렬 문자열
 */
function formatMatrix(matrix: Matrix): string {
  return `[[${matrix[0].map((value) => formatNumber(value)).join(", ")}], [${matrix[1].map((value) => formatNumber(value)).join(", ")}]]`;
}

/**
 * determinant를 면적 배율 설명으로 바꾼다.
 *
 * @param determinant 현재 행렬식 값
 * @returns 예: "4배", "0.5배", "0배"
 */
function formatAreaScale(determinant: number): string {
  return `${formatNumber(Math.abs(determinant))}배`;
}

/**
 * 두 숫자가 충분히 같은지 판단한다.
 *
 * @param left 비교할 첫 번째 값
 * @param right 비교할 두 번째 값
 * @returns 오차 범위 안에서 같으면 true
 */
function approximatelyEqual(left: number, right: number): boolean {
  return Math.abs(left - right) < EPSILON;
}

/**
 * 설명 패널에서 갱신할 DOM 요소들을 찾는다.
 *
 * @returns 설명 패널의 주요 요소 묶음
 * @throws {Error} 필요한 DOM 요소를 찾지 못한 경우
 */
function getExplanationElements(): ExplanationElements {
  return {
    areaScale: getRequiredElement("area-scale-value"),
    basisRows: getRequiredTableSection("basis-results"),
    determinant: getRequiredElement("determinant-value"),
    matrix: getRequiredElement("analysis-matrix"),
    summary: getRequiredElement("transform-summary"),
    transformName: getRequiredElement("transform-name-value"),
    vertexRows: getRequiredTableSection("vertex-results"),
  };
}

/**
 * 주어진 id의 일반 HTMLElement를 찾는다.
 *
 * @param id 찾을 요소의 id
 * @returns 찾은 요소
 * @throws {Error} 요소를 찾지 못한 경우
 */
function getRequiredElement(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (!(element instanceof HTMLElement)) {
    throw new Error(`${id} 요소를 찾을 수 없습니다.`);
  }

  return element;
}

/**
 * 주어진 id의 tbody 요소를 찾는다.
 *
 * @param id 찾을 tbody 요소의 id
 * @returns 찾은 tbody 요소
 * @throws {Error} tbody 요소를 찾지 못한 경우
 */
function getRequiredTableSection(id: string): HTMLTableSectionElement {
  const element = document.getElementById(id);
  if (!(element instanceof HTMLTableSectionElement)) {
    throw new Error(`${id} 표 영역을 찾을 수 없습니다.`);
  }

  return element;
}
