import type { Matrix, Vector } from "./types.js";

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
