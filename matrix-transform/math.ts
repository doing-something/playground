import type { Matrix, Vector } from "../shared/types.js";

const EPSILON = 1e-4;

/**
 * 두 벡터의 내적(dot product)을 계산한다.
 * 내적은 두 벡터가 "얼마나 같은 방향을 향하는가"를 나타내는 스칼라 값이다.
 * - 양수: 예각 (비슷한 방향)
 * - 0: 직각 (수직)
 * - 음수: 둔각 (반대 방향)
 *
 * 계산식: vec1·vec2 = Σ vec1[i] * vec2[i] = |vec1| * |vec2| * cos(θ)
 */
export function dot(vec1: Vector, vec2: Vector) {
  if (vec1.length !== vec2.length) {
    throw new Error("벡터의 길이가 다릅니다.");
  }
  return vec1.reduce((sum, val, idx) => sum + val * vec2[idx], 0);
}

/**
 * 행렬과 벡터를 곱해 새로운 벡터를 만든다.
 *
 * 각 행(row)을 벡터와 내적해서 결과 벡터의 각 원소를 계산한다.
 *
 * @param matrix 곱할 행렬
 * @param vector 곱할 벡터
 * @returns 행렬과 벡터의 곱으로 만들어진 새 벡터
 * @throws {Error} 행렬이 비어 있는 경우
 * @throws {Error} 행렬의 각 행 길이가 서로 다른 경우
 * @throws {Error} 행렬의 열 수와 벡터의 길이가 다른 경우
 */
export function multiplyMatrixVector(matrix: Matrix, vector: Vector) {
  if (matrix.length === 0) {
    throw new Error("행렬이 비어 있습니다.");
  }

  const columnCount = matrix[0].length;
  if (columnCount !== vector.length) {
    throw new Error("행렬의 열 수와 벡터의 길이가 다릅니다.");
  }

  if (!matrix.every((row) => row.length === columnCount)) {
    throw new Error("행렬의 각 행 길이가 일치하지 않습니다.");
  }

  return matrix.map((row) => dot(row, vector));
}

/**
 * 도형의 각 정점에 변환 행렬을 적용한다.
 */
export function transformShape(shape: Vector[], transform: Matrix): Vector[] {
  return shape.map((vertex) => multiplyMatrixVector(transform, vertex));
}

/**
 * 표준 기저벡터 e1, e2에 변환 행렬을 적용한다.
 *
 * 2차원 행렬은 결국 x축 단위벡터와 y축 단위벡터를 어디로 보내는지로
 * 해석할 수 있으므로, 학습용 시각화에서 중요한 정보다.
 *
 * @param transform 기저벡터에 적용할 2x2 행렬
 * @param basisVectors 원본 기저벡터 목록
 * @returns 변환된 기저벡터 목록
 */
export function transformBasisVectors(
  transform: Matrix,
  basisVectors: Vector[],
): Vector[] {
  return basisVectors.map((vector) => multiplyMatrixVector(transform, vector));
}

/**
 * 2x2 행렬의 determinant(행렬식)를 계산한다.
 *
 * determinant는 면적이 얼마나 커지거나 작아지는지,
 * 그리고 방향이 뒤집히는지 판단할 때 사용한다.
 *
 * @param matrix determinant를 계산할 2x2 행렬
 * @returns 행렬식 값
 * @throws {Error} 2x2 행렬이 아닌 경우
 */
export function determinant2x2(matrix: Matrix): number {
  if (matrix.length !== 2 || matrix.some((row) => row.length !== 2)) {
    throw new Error("determinant2x2는 2x2 행렬만 계산할 수 있습니다.");
  }

  const [[a, b], [c, d]] = matrix;
  return a * d - b * c;
}

/**
 * 주어진 각도(도 단위)에 해당하는 2차원 회전 행렬을 만든다.
 *
 * @param degrees 반시계 방향 회전 각도(도)
 * @returns 2x2 회전 행렬
 */
export function createRotationMatrix(degrees: number): Matrix {
  const radians = (degrees * Math.PI) / 180;
  const cosine = roundMatrixValue(Math.cos(radians));
  const sine = roundMatrixValue(Math.sin(radians));

  return [
    [cosine, -sine],
    [sine, cosine],
  ];
}

/**
 * 2x2 행렬이 순수 회전 행렬이면 그 각도를 도 단위로 돌려준다.
 *
 * @param matrix 검사할 2x2 행렬
 * @returns 회전 각도(도). 순수 회전이 아니면 null
 */
export function getRotationDegrees(matrix: Matrix): number | null {
  if (matrix.length !== 2 || matrix.some((row) => row.length !== 2)) {
    return null;
  }

  const [[a, b], [c, d]] = matrix;
  const angle = (Math.atan2(c, a) * 180) / Math.PI;
  const normalizedAngle = normalizeDegrees(angle);
  const expectedMatrix = createRotationMatrix(normalizedAngle);

  if (!approximatelyEqual(determinant2x2(matrix), 1)) {
    return null;
  }

  return isSameMatrix(matrix, expectedMatrix) ? normalizedAngle : null;
}

/**
 * 두 행렬이 오차 범위 안에서 같은지 비교한다.
 *
 * @param left 첫 번째 2x2 행렬
 * @param right 두 번째 2x2 행렬
 * @returns 네 원소가 모두 거의 같으면 true
 */
function isSameMatrix(left: Matrix, right: Matrix): boolean {
  return left.every((row, rowIndex) =>
    row.every((value, columnIndex) =>
      approximatelyEqual(value, right[rowIndex][columnIndex]),
    ),
  );
}

/**
 * 부동소수점 오차 때문에 생긴 아주 작은 값을 0으로 정리한다.
 *
 * @param value 정리할 숫자
 * @returns 0에 충분히 가까우면 0, 아니면 원래 값
 */
function normalizeNearZero(value: number): number {
  return approximatelyEqual(value, 0) ? 0 : value;
}

/**
 * 행렬 원소를 보기 쉬운 소수 자리수로 정리한다.
 *
 * @param value 정리할 숫자
 * @returns 0 근처 오차를 제거하고 소수 넷째 자리까지 반올림한 값
 */
function roundMatrixValue(value: number): number {
  const rounded = Math.round(value * 10_000) / 10_000;
  return normalizeNearZero(rounded);
}

/**
 * 각도를 -180도 초과 180도 이하 범위로 정규화한다.
 *
 * @param value 정규화할 각도
 * @returns 보기 쉬운 범위로 정리된 각도
 */
function normalizeDegrees(value: number): number {
  const normalized = ((value + 180) % 360 + 360) % 360 - 180;
  return approximatelyEqual(normalized, -180) ? 180 : normalizeNearZero(normalized);
}

/**
 * 두 숫자가 오차 범위 안에서 같은지 비교한다.
 *
 * @param left 첫 번째 숫자
 * @param right 두 번째 숫자
 * @returns 충분히 같으면 true
 */
function approximatelyEqual(left: number, right: number): boolean {
  return Math.abs(left - right) < EPSILON;
}
