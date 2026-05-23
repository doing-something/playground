const MulticlassCrossEntropyMath = (() => {
  const ANIMALS = [
    { emoji: "🐱", id: "cat", label: "고양이" },
    { emoji: "🐶", id: "dog", label: "강아지" },
    { emoji: "🐦", id: "bird", label: "새" },
  ];

  const DEFAULT_PROBABILITIES = [0.7, 0.2, 0.1];
  const GRAPH_FRAME = {
    height: 280,
    padding: { bottom: 34, left: 46, right: 18, top: 18 },
    width: 420,
  };
  const GRAPH_MAX_X = 1;
  const GRAPH_MAX_Y = 5;
  const GRAPH_MIN_X = 0.01;
  const LOG_EPSILON = 0.001;

  /**
   * 숫자를 지정 구간으로 자른다.
   *
   * 확률 슬라이더와 그래프 좌표 계산은 허용 범위를 벗어나면
   * 의미가 깨지므로 공통 clamp를 둔다.
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
   * 확률값을 UI 표시용 문자열로 바꾼다.
   *
   * 데모에서는 확률 벡터의 상대적 크기가 중요하므로
   * 소수 둘째 자리까지만 노출한다.
   *
   * @param {number} value 화면에 보여줄 확률
   * @returns {string} 소수 둘째 자리 문자열
   */
  function formatProbability(value) {
    return value.toFixed(2);
  }

  /**
   * 로그값이나 손실값을 부호 포함 고정 소수점 문자열로 바꾼다.
   *
   * 계산 과정에서는 `-0.00` 같은 표기가 오히려 혼란을 주므로,
   * 절댓값이 매우 작은 경우는 0.00으로 정리한다.
   *
   * @param {number} value 화면에 보여줄 signed 값
   * @returns {string} 소수 둘째 자리 문자열
   */
  function formatSigned(value) {
    if (Math.abs(value) < 0.005) {
      return "0.00";
    }

    return value.toFixed(2);
  }

  /**
   * 정답 클래스 인덱스를 원-핫 벡터로 바꾼다.
   *
   * 예를 들어 정답이 두 번째 클래스면 `[0, 1, 0]`이 된다.
   * cross-entropy를 전개했을 때
   * `y = [y1, ..., yK]`는 정답 분포,
   * `y_hat = [p1, ..., pK]`는 모델 예측 확률 분포다.
   *
   * @param {number} index 정답 클래스 인덱스
   * @returns {number[]} 원-핫 정답 벡터
   */
  function buildOneHot(index) {
    return ANIMALS.map((_, animalIndex) => (animalIndex === index ? 1 : 0));
  }

  /**
   * 임의의 양수 벡터를 합이 1인 확률 분포로 정규화한다.
   *
   * 데모 슬라이더는 사용자가 한 값을 움직일 때
   * 나머지 값이 비례 조정된 뒤 마지막으로 다시 합 1을 맞춘다.
   *
   * @param {number[]} probabilities 정규화할 값들
   * @returns {number[]} 합이 1인 확률 벡터
   */
  function normalizeProbabilities(probabilities) {
    const total = probabilities.reduce((sum, value) => sum + value, 0);

    if (total <= 0) {
      return [1, 0, 0];
    }

    return probabilities.map((value) => value / total);
  }

  /**
   * 한 클래스의 확률을 직접 조정했을 때 나머지 클래스 확률을 자동 보정한다.
   *
   * 목표는 항상 `sum(p_i) = 1`을 유지하는 것이다.
   * 사용자가 한 값을 `p_t'`로 바꾸면 나머지 클래스는
   * 기존 비율을 보존한 채 `(1 - p_t')`를 나눠 가진다.
   *
   * 즉, 다른 클래스 `i != t`에 대해:
   * `p_i' = (p_i / sum_{j != t} p_j) * (1 - p_t')`
   *
   * 이 방식은 softmax 자체를 다시 계산하는 것은 아니지만,
   * "확률 분포의 합은 1"이라는 제약을 직관적으로 체험하게 해 준다.
   *
   * @param {number[]} probabilities 현재 확률 벡터
   * @param {number} targetIndex 사용자가 조정한 클래스 인덱스
   * @param {number} nextValue targetIndex에 넣을 새 확률값
   * @returns {number[]} 합이 1이 되도록 재조정된 확률 벡터
   */
  function rebalanceProbabilities(probabilities, targetIndex, nextValue) {
    const clampedValue = clamp(nextValue, 0, 0.99);
    const remaining = 1 - clampedValue;
    const otherIndices = probabilities.map((_, index) => index).filter((index) => index !== targetIndex);
    const otherTotal = otherIndices.reduce((sum, index) => sum + probabilities[index], 0);
    const nextProbabilities = [...probabilities];

    nextProbabilities[targetIndex] = clampedValue;

    if (otherTotal <= 0) {
      const evenSplit = remaining / otherIndices.length;
      otherIndices.forEach((index) => {
        nextProbabilities[index] = evenSplit;
      });
    } else {
      otherIndices.forEach((index) => {
        nextProbabilities[index] = (probabilities[index] / otherTotal) * remaining;
      });
    }

    return normalizeProbabilities(nextProbabilities);
  }

  /**
   * multiclass cross-entropy 손실을 단계별 중간값과 함께 계산한다.
   *
   * 기본 공식:
   * `L = - sum_{i=1}^{K} y_i log(p_i)`
   *
   * 여기서
   * `y_i`는 정답 원-핫 벡터의 i번째 값,
   * `p_i`는 모델이 i번째 클래스에 준 확률이다.
   *
   * 원-핫 벡터에서는 정답 클래스만 1이고 나머지는 0이므로,
   * 실제로는 다음과 같이 단순화된다.
   * `L = -log(p_correct)`
   *
   * 이 데모가 4단계로 보여 주는 값은 정확히 이 전개다.
   * 1. `log(p_i)` 계산
   * 2. `y_i`와 곱해서 정답 클래스만 남김
   * 3. 합산
   * 4. 앞에 `-`를 붙여 최종 손실 계산
   *
   * `log(0)`은 정의되지 않으므로, 실제 구현에서는
   * `max(p_i, LOG_EPSILON)`을 사용해 수치적으로 안전하게 만든다.
   *
   * @param {number[]} probabilities 예측 확률 벡터 `p`
   * @param {number} selectedAnswerIndex 정답 클래스 인덱스
   * @returns {{
   *   loggedProbabilities: number[],
   *   loss: number,
   *   multipliedValues: number[],
   *   oneHot: number[],
   *   selectedProbability: number,
   *   summedValue: number
   * }} 단계별 계산 결과
   */
  function computeLossBreakdown(probabilities, selectedAnswerIndex) {
    const oneHot = buildOneHot(selectedAnswerIndex);
    const loggedProbabilities = probabilities.map((value) => Math.log(Math.max(value, LOG_EPSILON)));
    const multipliedValues = loggedProbabilities.map((value, index) => value * oneHot[index]);
    const summedValue = multipliedValues.reduce((sum, value) => sum + value, 0);
    const loss = -summedValue;
    const selectedProbability = probabilities[selectedAnswerIndex];

    return {
      loggedProbabilities,
      loss,
      multipliedValues,
      oneHot,
      selectedProbability,
      summedValue,
    };
  }

  /**
   * 손실 크기를 색상 톤으로 바꾼다.
   *
   * 손실이 작으면 초록, 크면 빨강으로 보이게 해서
   * "정답 확률이 높을수록 좋다"를 즉시 읽을 수 있게 만든다.
   * 시각화용 함수이지만 입력은 수학 계산 결과인 loss다.
   *
   * @param {number} loss 최종 손실값
   * @returns {{background: string, border: string, text: string}} 카드 스타일 색상 세트
   */
  function getLossTone(loss) {
    const normalized = clamp(loss / 3, 0, 1);
    const hue = 140 - normalized * 140;

    return {
      background: `hsla(${hue}, 85%, 92%, 1)`,
      border: `hsla(${hue}, 72%, 45%, 0.34)`,
      text: `hsl(${hue}, 72%, 28%)`,
    };
  }

  /**
   * 정답 확률 하나를 `-ln(x)` 그래프 위 좌표로 바꾼다.
   *
   * 그래프의 함수는
   * `y = -log(x)`
   * 이다.
   *
   * 여기서 x축은 "정답 클래스에 준 확률",
   * y축은 "그때의 손실"이다.
   *
   * 따라서 확률 `p_correct`를 입력하면 점 `(p_correct, -log(p_correct))`가 된다.
   * 이 점이 바로 cross-entropy가 "정답 클래스 확률 하나만으로 결정된다"는 사실을
   * 눈으로 보여 준다.
   *
   * @param {number} probability 정답 클래스 확률
   * @param {{width: number, height: number, padding: {top: number, right: number, bottom: number, left: number}}} [frame=GRAPH_FRAME]
   *   SVG 좌표계 프레임
   * @returns {{loss: number, x: number, y: number}} 그래프 위 점 좌표
   */
  function toGraphPoint(probability, frame = GRAPH_FRAME) {
    const safeProbability = clamp(Math.max(probability, LOG_EPSILON), GRAPH_MIN_X, GRAPH_MAX_X);
    const loss = Math.min(-Math.log(safeProbability), GRAPH_MAX_Y);
    const x = frame.padding.left
      + ((safeProbability - GRAPH_MIN_X) / (GRAPH_MAX_X - GRAPH_MIN_X))
      * (frame.width - frame.padding.left - frame.padding.right);
    const y = frame.height - frame.padding.bottom
      - (loss / GRAPH_MAX_Y) * (frame.height - frame.padding.top - frame.padding.bottom);

    return { loss, x, y };
  }

  /**
   * `y = -ln(x)` 곡선 전체를 SVG path 문자열로 만든다.
   *
   * x를 `GRAPH_MIN_X`부터 `1`까지 균일 샘플링하고,
   * 각 지점의 손실 `-log(x)`를 계산해서 선분으로 이어 붙인다.
   * 결과 path는 "정답 확률이 낮아질수록 손실이 급격히 커진다"는
   * 형태를 시각화하는 데 사용된다.
   *
   * @param {{width: number, height: number, padding: {top: number, right: number, bottom: number, left: number}}} [frame=GRAPH_FRAME]
   *   SVG 좌표계 프레임
   * @returns {string} SVG `<path>`의 d 속성 문자열
   */
  function buildLogCurvePath(frame = GRAPH_FRAME) {
    const points = [];

    for (let step = 0; step <= 100; step += 1) {
      const xValue = GRAPH_MIN_X + ((GRAPH_MAX_X - GRAPH_MIN_X) * step) / 100;
      const point = toGraphPoint(xValue, frame);
      points.push(`${step === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`);
    }

    return points.join(" ");
  }

  /**
   * 특정 확률값을 강조 표시하기 위한 그래프 렌더링 모델을 만든다.
   *
   * UI는 이 모델만 받아서 곡선(path)과 현재 정답 확률 위치(point)를 그린다.
   * 수학 계산과 렌더링 데이터를 이어 주는 어댑터 역할이다.
   *
   * @param {number} probability 현재 정답 클래스 확률
   * @returns {{
   *   width: number,
   *   height: number,
   *   padding: {top: number, right: number, bottom: number, left: number},
   *   path: string,
   *   point: {loss: number, x: number, y: number}
   * }} 그래프 렌더링 모델
   */
  function buildGraphModel(probability) {
    return {
      ...GRAPH_FRAME,
      path: buildLogCurvePath(GRAPH_FRAME),
      point: toGraphPoint(probability, GRAPH_FRAME),
    };
  }

  return {
    ANIMALS,
    DEFAULT_PROBABILITIES,
    buildGraphModel,
    buildOneHot,
    clamp,
    computeLossBreakdown,
    formatProbability,
    formatSigned,
    getLossTone,
    rebalanceProbabilities,
  };
})();

window.MulticlassCrossEntropyMath = MulticlassCrossEntropyMath;
