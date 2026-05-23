const RMSEMath = (() => {
  const HOUSES = [
    { id: "apt-river", label: "한강뷰 아파트", actualPrice: 4.2 },
    { id: "town-yard", label: "마당 있는 타운하우스", actualPrice: 5.6 },
    { id: "villa-campus", label: "역세권 빌라", actualPrice: 3.4 },
    { id: "duplex-hill", label: "언덕 위 복층집", actualPrice: 6.1 },
  ];

  const DEFAULT_PREDICTIONS = [4.8, 5.1, 3.9, 5.7];

  /**
   * 숫자를 지정 범위 안으로 자른다.
   *
   * 집값 슬라이더는 현실적인 범위 안에서만 움직이게 해야 하므로
   * 예측 가격 입력을 clamp한 뒤 계산에 사용한다.
   *
   * @param {number} value 검사할 값
   * @param {number} min 최솟값
   * @param {number} max 최댓값
   * @returns {number} [min, max] 범위로 잘린 값
   */
  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  /**
   * 억 원 단위 숫자를 표시용 문자열로 바꾼다.
   *
   * @param {number} value 억 원 단위 값
   * @returns {string} 소수 첫째 자리 문자열
   */
  function formatBillions(value) {
    return `${value.toFixed(1)}억`;
  }

  /**
   * 오차나 RMSE 같은 값을 표시용 문자열로 바꾼다.
   *
   * @param {number} value 화면에 보여줄 값
   * @returns {string} 소수 둘째 자리 문자열
   */
  function formatSigned(value) {
    if (Math.abs(value) < 0.005) {
      return "0.00";
    }

    return value.toFixed(2);
  }

  /**
   * 예측 집값 배열로부터 RMSE 계산에 필요한 단계별 값을 만든다.
   *
   * RMSE 공식:
   * `RMSE = sqrt( (1 / n) * sum_{i=1}^{n} (y_hat_i - y_i)^2 )`
   *
   * 여기서
   * `y_i`는 실제 집값,
   * `y_hat_i`는 모델이 예측한 집값이다.
   *
   * 계산 흐름은 다음과 같다.
   * 1. 오차 계산: `e_i = y_hat_i - y_i`
   * 2. 제곱 오차 계산: `e_i^2`
   * 3. 평균 제곱 오차 계산: `MSE = (1/n) sum e_i^2`
   * 4. 제곱근 적용: `RMSE = sqrt(MSE)`
   *
   * 제곱을 하는 이유는 음수/양수 오차가 상쇄되지 않게 하고,
   * 큰 실수에 더 큰 벌점을 주기 위해서다.
   * 마지막에 루트를 씌우는 이유는 단위를 원래 집값 단위(억 원)로 되돌리기 위해서다.
   *
   * @param {number[]} predictions 각 집의 예측 가격 배열
   * @returns {{
   *   meanSquaredError: number,
   *   rmse: number,
   *   rows: Array<{
   *     actualPrice: number,
   *     error: number,
   *     id: string,
   *     label: string,
   *     prediction: number,
   *     squaredError: number
   *   }>,
   *   squaredErrorSum: number
   * }} 단계별 RMSE 계산 결과
   */
  function computeRMSEBreakdown(predictions) {
    const rows = HOUSES.map((house, index) => {
      const prediction = predictions[index];
      const error = prediction - house.actualPrice;
      const squaredError = error ** 2;

      return {
        actualPrice: house.actualPrice,
        error,
        id: house.id,
        label: house.label,
        prediction,
        squaredError,
      };
    });

    const squaredErrorSum = rows.reduce((sum, row) => sum + row.squaredError, 0);
    const meanSquaredError = squaredErrorSum / rows.length;
    const rmse = Math.sqrt(meanSquaredError);

    return {
      meanSquaredError,
      rmse,
      rows,
      squaredErrorSum,
    };
  }

  /**
   * 손실 크기를 카드 색상으로 바꾼다.
   *
   * RMSE가 낮으면 초록, 높으면 빨강이 되도록 해서
   * 예측이 실제 가격에 가까울수록 좋은 상태임을 바로 읽게 한다.
   *
   * @param {number} rmse 최종 RMSE 값
   * @returns {{background: string, border: string, text: string}} 카드 색상 세트
   */
  function getLossTone(rmse) {
    const normalized = clamp(rmse / 2.5, 0, 1);
    const hue = 140 - normalized * 140;

    return {
      background: `hsla(${hue}, 85%, 92%, 1)`,
      border: `hsla(${hue}, 72%, 45%, 0.34)`,
      text: `hsl(${hue}, 72%, 28%)`,
    };
  }

  /**
   * 오차 막대 시각화에 쓸 좌우 길이 비율을 계산한다.
   *
   * 집마다 오차 절댓값을 0~1로 정규화해 막대 길이를 만들고,
   * 부호는 따로 유지해서 실제 가격보다 높게 예측했는지 낮게 예측했는지 보여 준다.
   *
   * @param {number} error 집 하나의 오차값
   * @param {number} maxAbsError 전체 집 중 최대 절댓값 오차
   * @returns {{direction: "left" | "right", magnitude: number}} 오차 막대 방향과 크기
   */
  function buildErrorBar(error, maxAbsError) {
    const magnitude = maxAbsError <= 0 ? 0 : Math.abs(error) / maxAbsError;

    return {
      direction: error < 0 ? "left" : "right",
      magnitude,
    };
  }

  return {
    DEFAULT_PREDICTIONS,
    HOUSES,
    buildErrorBar,
    clamp,
    computeRMSEBreakdown,
    formatBillions,
    formatSigned,
    getLossTone,
  };
})();

window.RMSEMath = RMSEMath;
