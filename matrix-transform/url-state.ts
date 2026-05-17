import { cloneMatrix, isSameMatrix } from "../shared/matrix.js";
import type { Matrix } from "../shared/types.js";

/**
 * URL 쿼리스트링에서 2x2 행렬 상태를 읽는다.
 *
 * a, b, c, d 네 값이 모두 유효한 숫자일 때만 URL 상태를 사용하고,
 * 하나라도 없거나 잘못되었으면 기본 행렬로 되돌린다.
 *
 * @param fallbackMatrix URL 값이 없거나 잘못된 경우 사용할 기본 행렬
 * @returns 쿼리스트링에서 복원한 행렬 또는 기본 행렬
 */
export function readMatrixFromQuery(fallbackMatrix: Matrix): Matrix {
  const params = new URLSearchParams(window.location.search);
  const values = [
    params.get("a"),
    params.get("b"),
    params.get("c"),
    params.get("d"),
  ];

  if (values.some((value) => value === null)) {
    return cloneMatrix(fallbackMatrix);
  }

  const numbers = values.map((value) => Number(value));
  if (numbers.some((value) => Number.isNaN(value) || !Number.isFinite(value))) {
    return cloneMatrix(fallbackMatrix);
  }

  return [
    [numbers[0], numbers[1]],
    [numbers[2], numbers[3]],
  ];
}

/**
 * 현재 행렬 상태를 URL 쿼리스트링에 저장한다.
 *
 * 기본 행렬과 같다면 쿼리스트링을 비워 주소를 간단하게 유지한다.
 * 다른 쿼리 파라미터가 있다면 그대로 보존한다.
 *
 * @param matrix 현재 공유할 2x2 행렬
 * @param defaultMatrix 기본 상태를 나타내는 2x2 행렬
 */
export function writeMatrixToQuery(matrix: Matrix, defaultMatrix: Matrix) {
  const nextUrl = new URL(window.location.href);

  if (isSameMatrix(matrix, defaultMatrix)) {
    nextUrl.searchParams.delete("a");
    nextUrl.searchParams.delete("b");
    nextUrl.searchParams.delete("c");
    nextUrl.searchParams.delete("d");
  } else {
    nextUrl.searchParams.set("a", String(matrix[0][0]));
    nextUrl.searchParams.set("b", String(matrix[0][1]));
    nextUrl.searchParams.set("c", String(matrix[1][0]));
    nextUrl.searchParams.set("d", String(matrix[1][1]));
  }

  window.history.replaceState(null, "", nextUrl);
}

