import type { Vector } from "../shared/types.js";

/**
 * 2D affine 변환을 표현하는 3x3 행렬.
 *
 * 마지막 행은 항상 [0, 0, 1]로 고정이지만, 곱셈 일관성을 위해 그대로 둔다.
 * Canvas의 DOMMatrix와 같은 의미. 우리 표기는 행 우선(row-major)이고,
 * DOMMatrix의 {a, b, c, d, e, f}는 열 우선(column-major)이라 인덱스가 다르다.
 */
export type AffineMatrix = [
  [number, number, number],
  [number, number, number],
  [number, number, number],
];

export const IDENTITY_AFFINE: AffineMatrix = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
];

export function translateMatrix(tx: number, ty: number): AffineMatrix {
  return [
    [1, 0, tx],
    [0, 1, ty],
    [0, 0, 1],
  ];
}

export function rotateMatrix(degrees: number): AffineMatrix {
  const theta = (degrees * Math.PI) / 180;
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  return [
    [c, -s, 0],
    [s, c, 0],
    [0, 0, 1],
  ];
}

export function scaleMatrix(sx: number, sy: number): AffineMatrix {
  return [
    [sx, 0, 0],
    [0, sy, 0],
    [0, 0, 1],
  ];
}

/**
 * 두 3x3 affine 행렬을 곱한다. 결과 = left · right.
 *
 * Canvas API는 새 변환을 호출할 때마다 현재 행렬의 오른쪽에 곱한다:
 *     currentMatrix = currentMatrix · newStepMatrix
 * 그래서 코드 위쪽의 호출이 도형에는 가장 나중에 적용되는 것처럼 보인다.
 */
export function multiplyAffine(left: AffineMatrix, right: AffineMatrix): AffineMatrix {
  const result: number[][] = [];
  for (let row = 0; row < 3; row += 1) {
    const newRow: number[] = [];
    for (let col = 0; col < 3; col += 1) {
      let sum = 0;
      for (let k = 0; k < 3; k += 1) {
        sum += left[row][k] * right[k][col];
      }
      newRow.push(sum);
    }
    result.push(newRow);
  }
  return result as AffineMatrix;
}

/**
 * 2D 점에 affine 변환을 적용한다.
 *
 * 동질 좌표 [x, y, 1]에 행렬을 곱한 결과의 앞 두 성분을 돌려준다.
 * 평행이동 성분(e, f)이 결과에 더해진다는 점이 2x2 선형 변환과 다르다.
 */
export function transformPointAffine(matrix: AffineMatrix, point: Vector): Vector {
  const [x, y] = point;
  return [
    matrix[0][0] * x + matrix[0][1] * y + matrix[0][2],
    matrix[1][0] * x + matrix[1][1] * y + matrix[1][2],
  ];
}
