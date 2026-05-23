/**
 * 공부 시간 축의 최솟값이다.
 * 0시간부터 시작해야 "전혀 공부하지 않은 학생"도 시나리오에 포함할 수 있다.
 */
const HOURS_MIN = 0;

/**
 * 공부 시간 축의 최댓값이다.
 * 하루 단위 학습 데모로 보기 좋은 0~10시간 범위를 사용한다.
 */
const HOURS_MAX = 10;

/**
 * 시그모이드 곡선을 샘플링할 점 개수다.
 * SVG 선이 충분히 매끄럽게 보이도록 200개를 사용한다.
 */
const CURVE_SAMPLES = 200;

/**
 * 선형 모델의 출력 z = weight * x + bias 를 계산한다.
 *
 * 시그모이드 분류기는 먼저 입력 x를 선형 결합으로 바꾼 뒤,
 * 그 결과를 시그모이드 함수에 통과시켜 확률을 만든다.
 * 따라서 "학습이란 weight와 bias를 조절해 데이터에 맞는 z를 만드는 과정"이라는 점을
 * 이해하려면 이 단계가 별도 함수로 드러나야 한다.
 *
 * @param {number} hours 학생의 공부 시간 x
 * @param {number} weight 입력 특징의 영향력
 * @param {number} bias decision boundary를 좌우로 옮기는 절편
 * @returns {number} 시그모이드에 들어가기 직전의 선형 출력 z
 */
function computeLogit(hours, weight, bias) {
  return weight * hours + bias;
}

/**
 * 시그모이드 함수를 직접 구현한다.
 *
 * 어떤 실수 z가 들어와도 0과 1 사이 값으로 압축한다.
 * 이 때문에 이진 분류에서 결과를 "확률처럼" 해석하고 싶을 때 자주 사용한다.
 *
 * 공식:
 * sigmoid(z) = 1 / (1 + Math.exp(-z))
 *
 * @param {number} z 선형 모델의 출력값
 * @returns {number} 0 이상 1 이하의 확률형 출력
 */
function sigmoid(z) {
  return 1 / (1 + Math.exp(-z));
}

/**
 * 확률을 이진 판정으로 바꾼다.
 *
 * 이 데모에서는 확률이 0.5 이상이면 합격, 미만이면 불합격으로 본다.
 * 이 기준은 그래프의 y = 0.5 수평선과 직접 연결된다.
 *
 * @param {number} probability 모델이 예측한 합격 확률
 * @returns {0 | 1} 예측 클래스. 1은 합격, 0은 불합격
 */
function classifyProbability(probability) {
  return probability >= 0.5 ? 1 : 0;
}

/**
 * 현재 weight와 bias가 만드는 decision boundary를 계산한다.
 *
 * 시그모이드 출력이 0.5가 되는 지점은 z = 0인 지점과 같다.
 * 선형식 z = weight * x + bias 에서 z = 0을 풀면
 * x = -bias / weight 이므로, 이 값이 "합격 기준 공부 시간"이 된다.
 *
 * @param {number} weight 선형 계수
 * @param {number} bias 선형 절편
 * @returns {number} 확률이 정확히 0.5가 되는 공부 시간
 */
function computeDecisionBoundary(weight, bias) {
  return -bias / weight;
}

/**
 * 시그모이드 곡선을 그리기 위한 샘플 점 목록을 생성한다.
 *
 * SVG path를 그리려면 x축 전체 범위에 대해 충분한 점이 필요하다.
 * 이 함수는 공부 시간 0~10 구간을 균일하게 샘플링하고,
 * 각 지점에서 확률을 계산해 곡선을 그릴 수 있게 만든다.
 *
 * @param {number} weight 현재 weight 값
 * @param {number} bias 현재 bias 값
 * @param {number} sampleCount 곡선을 몇 조각으로 나눌지 결정하는 개수
 * @returns {{ hours: number, probability: number }[]} 곡선 샘플 배열
 */
function buildSigmoidCurve(weight, bias, sampleCount = CURVE_SAMPLES) {
  return Array.from({ length: sampleCount + 1 }, (_, index) => {
    const ratio = index / sampleCount;
    const hours = HOURS_MIN + (HOURS_MAX - HOURS_MIN) * ratio;
    const probability = sigmoid(computeLogit(hours, weight, bias));

    return { hours, probability };
  });
}

/**
 * 그래프 데이터 좌표를 SVG 좌표로 투영한다.
 *
 * 데이터 공간에서는 x축이 공부 시간, y축이 확률이며 y가 클수록 위에 있어야 한다.
 * 하지만 SVG는 y가 아래로 증가하므로 반전 보간이 필요하다.
 * 이 함수를 분리하면 그래프 로직과 수학 로직을 섞지 않아도 된다.
 *
 * @param {number} hours x축 값
 * @param {number} probability y축 값
 * @param {{ left: number, top: number, width: number, height: number }} frame 그래프 내부 사각형
 * @returns {{ x: number, y: number }} SVG 픽셀 좌표
 */
function toSvgPoint(hours, probability, frame) {
  const xRatio = (hours - HOURS_MIN) / (HOURS_MAX - HOURS_MIN);

  return {
    x: frame.left + xRatio * frame.width,
    y: frame.top + (1 - probability) * frame.height,
  };
}

/**
 * 곡선 샘플 배열을 SVG path `d` 문자열로 바꾼다.
 *
 * path를 직접 조립하는 작업은 렌더링 세부사항이므로,
 * 수학 계산 함수와 분리해 두면 학습용 코드가 훨씬 읽기 쉬워진다.
 *
 * @param {{ hours: number, probability: number }[]} points 곡선 샘플 목록
 * @param {{ left: number, top: number, width: number, height: number }} frame 그래프 내부 사각형
 * @returns {string} SVG path 명령 문자열
 */
function buildPathData(points, frame) {
  return points
    .map((point, index) => {
      const svgPoint = toSvgPoint(point.hours, point.probability, frame);
      return `${index === 0 ? "M" : "L"} ${svgPoint.x} ${svgPoint.y}`;
    })
    .join(" ");
}

/**
 * 현재 모델이 학생 데이터에 대해 얼마나 잘 맞는지 평가한다.
 *
 * 각 학생에 대해 확률, 예측 클래스, 정답 여부를 계산해 붙여 준다.
 * 동시에 정확도와 맞춘 개수도 함께 집계한다.
 *
 * 이 함수가 학습용으로 중요한 이유는,
 * weight와 bias를 움직이는 행위가 단순한 그래프 변형이 아니라
 * "모델 성능 변화"라는 사실을 즉시 보여 주기 때문이다.
 *
 * @param {{ hours: number, id: string, name: string, passed: 0 | 1 }[]} students 학생 데이터셋
 * @param {number} weight 현재 weight 값
 * @param {number} bias 현재 bias 값
 * @returns {{
 *   accuracy: number,
 *   correctCount: number,
 *   rows: {
 *     actualLabel: "합격" | "불합격",
 *     hours: number,
 *     id: string,
 *     isCorrect: boolean,
 *     name: string,
 *     predictedLabel: "합격" | "불합격",
 *     predictedProbability: number,
 *   }[],
 *   wrongCount: number,
 * }} 평가 결과
 */
function evaluateStudents(students, weight, bias) {
  const rows = students.map((student) => {
    const predictedProbability = sigmoid(computeLogit(student.hours, weight, bias));
    const predictedClass = classifyProbability(predictedProbability);
    const isCorrect = predictedClass === student.passed;

    return {
      actualLabel: student.passed === 1 ? "합격" : "불합격",
      hours: student.hours,
      id: student.id,
      isCorrect,
      name: student.name,
      predictedLabel: predictedClass === 1 ? "합격" : "불합격",
      predictedProbability,
    };
  });

  const correctCount = rows.filter((row) => row.isCorrect).length;
  const wrongCount = rows.length - correctCount;

  return {
    accuracy: correctCount / rows.length,
    correctCount,
    rows,
    wrongCount,
  };
}

window.SigmoidMath = {
  HOURS_MAX,
  HOURS_MIN,
  buildPathData,
  buildSigmoidCurve,
  classifyProbability,
  computeDecisionBoundary,
  computeLogit,
  evaluateStudents,
  sigmoid,
  toSvgPoint,
};
