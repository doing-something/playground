/**
 * 1D 데이터를 (rows, cols) 모양의 2D 행렬로 다시 해석한다.
 *
 * 메모리 순서는 row-major: 인덱스 i의 원소가 (Math.floor(i/cols), i%cols)
 * 자리로 들어간다. 즉 데이터는 그대로 두고 모양만 바꾸는 연산으로,
 * PyTorch의 tensor.reshape(rows, cols)와 같은 효과를 낸다.
 *
 * @throws {Error} 원소 수가 rows * cols와 다른 경우. PyTorch도 같은 상황에서
 *                 RuntimeError를 던진다.
 */
export function reshape<T>(data: T[], rows: number, cols: number): T[][] {
  if (data.length !== rows * cols) {
    throw new Error(`차원 불일치: ${data.length} ≠ ${rows} × ${cols}`);
  }

  return Array.from({ length: rows }, (_, rowIndex) =>
    data.slice(rowIndex * cols, rowIndex * cols + cols),
  );
}
