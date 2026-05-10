type Vector = number[];
type Matrix = number[][];

const triangle: Vector[] = [
  [0, 2],
  [-1, 0],
  [1, 0],
];

// 2배 확대 행렬
const matrix = [
  [2, 0],
  [0, 2],
];


function main() {
  const transformed = transformShape(triangle, matrix);
  console.log(transformed);
}

main();

/**
 * 두 벡터의 내적(dot product)을 계산한다.
 * 내적은 두 벡터가 "얼마나 같은 방향을 향하는가"를 나타내는 스칼라 값이다.
 * - 양수: 예각 (비슷한 방향)
 * - 0: 직각 (수직)
 * - 음수: 둔각 (반대 방향)
 * 
 * 계산식: vec1·vec2 = Σ vec1[i] * vec2[i] = |vec1| * |vec2| * cos(θ)
 */
function dot(vec1: Vector, vec2: Vector) {
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
function multiplyMatrixVector(matrix: Matrix, vector: Vector) {
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
function transformShape(shape: Vector[], transform: Matrix): Vector[] {
  return shape.map((vertex) => multiplyMatrixVector(transform, vertex));
}
