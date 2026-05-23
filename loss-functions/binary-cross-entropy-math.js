const BinaryCrossEntropyMath = (() => {
  const CLASSES = [
    { id: 1, label: "스팸이다", shortLabel: "스팸", y: 1 },
    { id: 0, label: "정상이다", shortLabel: "정상", y: 0 },
  ];

  const DEFAULT_PROBABILITY = 0.9;
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
   * BCE 데모에서는 확률 `p`가 항상 `(0, 1)` 안에 있어야 하므로
   * 슬라이더 입력과 그래프 좌표 계산에서 공통으로 사용한다.
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
   * 확률을 표시용 문자열로 바꾼다.
   *
   * @param {number} value 화면에 보여줄 확률
   * @returns {string} 소수 둘째 자리 문자열
   */
  function formatProbability(value) {
    return value.toFixed(2);
  }

  /**
   * 로그나 손실 같은 signed 값을 표시용 문자열로 바꾼다.
   *
   * 수치 오차 때문에 `-0.00`이 보이면 계산 구조를 읽기 어려워지므로
   * 거의 0인 값은 `0.00`으로 정리한다.
   *
   * @param {number} value 화면에 보여줄 값
   * @returns {string} 소수 셋째 자리까지 반올림한 문자열
   */
  function formatSigned(value) {
    if (Math.abs(value) < 0.0005) {
      return "0.000";
    }

    return value.toFixed(3);
  }

  /**
   * binary cross-entropy 손실을 단계별 중간값과 함께 계산한다.
   *
   * 기본 공식:
   * `L = - ( y log(p) + (1 - y) log(1 - p) )`
   *
   * 여기서
   * `y`는 정답 레이블로 0 또는 1,
   * `p`는 모델이 "스팸일 확률"로 출력한 값이다.
   *
   * 이 식은 두 경우로 나뉜다.
   * `y = 1`이면:
   * `L = -log(p)`
   *
   * `y = 0`이면:
   * `L = -log(1 - p)`
   *
   * 즉 둘 중 하나의 항만 살아남는다.
   * 이 데모는 그 구조를 보여 주기 위해
   * `y log(p)`와 `(1-y) log(1-p)`를 따로 계산해서 노출한다.
   *
   * `log(0)`은 정의되지 않으므로 실제 구현에서는
   * `p`와 `1-p` 모두 `LOG_EPSILON` 이상으로 잘라서 계산한다.
   *
   * @param {number} label 정답 레이블 `y`, 0 또는 1
   * @param {number} probability 모델이 예측한 스팸 확률 `p`
   * @returns {{
   *   keptProbability: number,
   *   keptProbabilityLabel: string,
   *   label: number,
   *   loss: number,
   *   negativeLogOneMinusP: number,
   *   negativeLogP: number,
   *   oneMinusLabel: number,
   *   oneMinusProbability: number,
   *   stepOneValue: number,
   *   stepTwoValue: number,
   *   summedValue: number
   * }} 단계별 계산 결과
   */
  function computeLossBreakdown(label, probability) {
    const clampedProbability = clamp(probability, 0.01, 0.99);
    const oneMinusProbability = 1 - clampedProbability;
    const safeProbability = Math.max(clampedProbability, LOG_EPSILON);
    const safeOneMinusProbability = Math.max(oneMinusProbability, LOG_EPSILON);
    const oneMinusLabel = 1 - label;
    const negativeLogP = Math.log(safeProbability);
    const negativeLogOneMinusP = Math.log(safeOneMinusProbability);
    const stepOneValue = label * negativeLogP;
    const stepTwoValue = oneMinusLabel * negativeLogOneMinusP;
    const summedValue = stepOneValue + stepTwoValue;
    const loss = -summedValue;
    const keptProbability = label === 1 ? clampedProbability : oneMinusProbability;
    const keptProbabilityLabel = label === 1 ? "p" : "1-p";

    return {
      keptProbability,
      keptProbabilityLabel,
      label,
      loss,
      negativeLogOneMinusP,
      negativeLogP,
      oneMinusLabel,
      oneMinusProbability,
      stepOneValue,
      stepTwoValue,
      summedValue,
    };
  }

  /**
   * 손실 크기를 색상 톤으로 바꾼다.
   *
   * 손실이 낮으면 초록, 높으면 빨강이 되도록 해서
   * "정답과 잘 맞을수록 좋은 상태"를 직관적으로 보여 준다.
   *
   * @param {number} loss 최종 손실값
   * @returns {{background: string, border: string, text: string}} 카드 색상 세트
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
   * BCE에서 실제로 살아남는 확률값을 `-ln(x)` 그래프 점으로 바꾼다.
   *
   * `y = 1`이면 손실은 `-ln(p)`이므로 x축에는 `p`를 쓴다.
   * `y = 0`이면 손실은 `-ln(1-p)`이므로 x축에는 `1-p`를 쓴다.
   *
   * 따라서 그래프 위 점은
   * `y = 1`일 때 `(p, -ln(p))`,
   * `y = 0`일 때 `(1-p, -ln(1-p))`
   * 가 된다.
   *
   * @param {number} probability BCE에서 살아남는 확률값
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
   * BCE도 최종적으로는 `-ln(p)` 또는 `-ln(1-p)` 중 하나를 쓰므로
   * multiclass의 정답 확률 곡선과 같은 함수 형태를 갖는다.
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
   * BCE 손실 곡선 렌더링에 필요한 path와 현재 점을 묶어 반환한다.
   *
   * @param {number} probability 현재 BCE에서 살아남는 확률값
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
    CLASSES,
    DEFAULT_PROBABILITY,
    buildGraphModel,
    clamp,
    computeLossBreakdown,
    formatProbability,
    formatSigned,
    getLossTone,
  };
})();

window.BinaryCrossEntropyMath = BinaryCrossEntropyMath;
