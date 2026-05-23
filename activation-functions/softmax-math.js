/**
 * 선호도 슬라이더의 최솟값이다.
 * 메뉴에 대한 강한 비선호도까지 표현하기 위해 음수 범위를 허용한다.
 */
const SOFTMAX_SCORE_MIN = -5;

/**
 * 선호도 슬라이더의 최댓값이다.
 * 강한 선호도를 충분히 줄 수 있도록 10까지 허용한다.
 */
const SOFTMAX_SCORE_MAX = 10;

/**
 * temperature 슬라이더의 최솟값이다.
 * 너무 0에 가까우면 수치적으로 불안정하고 과도하게 뾰족해져 0.1로 둔다.
 */
const SOFTMAX_TEMPERATURE_MIN = 0.1;

/**
 * temperature 슬라이더의 최댓값이다.
 * 충분히 완만하게 퍼지는 효과를 보기 위해 3까지 허용한다.
 */
const SOFTMAX_TEMPERATURE_MAX = 3;

/**
 * 점수 배열과 temperature를 받아 softmax 확률 분포를 계산한다.
 *
 * temperature가 낮을수록 점수 차이가 더 크게 증폭되고,
 * 높을수록 분포가 평평해진다. 수치 안정성을 위해 최대 점수를 먼저 빼고
 * 지수 함수를 적용한다.
 *
 * @param {number[]} scores 메뉴별 선호도 점수 배열
 * @param {number} temperature 확신 정도를 조절하는 온도
 * @returns {number[]} 메뉴별 확률 배열. 전체 합은 1이다
 */
function computeSoftmax(scores, temperature) {
  const normalizedScores = scores.map((score) => score / temperature);
  const maxScore = Math.max(...normalizedScores);
  const exps = normalizedScores.map((score) => Math.exp(score - maxScore));
  const sum = exps.reduce((acc, value) => acc + value, 0);

  return exps.map((value) => value / sum);
}

/**
 * 확률이 가장 큰 메뉴의 인덱스를 찾는다.
 *
 * softmax 결과에서 가장 큰 값은 현재 모델이 가장 추천하는 후보를 뜻한다.
 *
 * @param {number[]} probabilities softmax 확률 배열
 * @returns {number} 가장 큰 확률을 가진 메뉴의 인덱스
 */
function getTopIndex(probabilities) {
  let bestIndex = 0;

  for (let index = 1; index < probabilities.length; index += 1) {
    if (probabilities[index] > probabilities[bestIndex]) {
      bestIndex = index;
    }
  }

  return bestIndex;
}

/**
 * 파이 차트용 SVG 호(path) 문자열을 만든다.
 *
 * softmax 확률을 시각화할 때 각 메뉴가 차지하는 비중을 원형 조각으로 표현한다.
 * 각 조각은 시작 각도와 끝 각도를 받아 SVG의 arc 명령으로 생성한다.
 *
 * @param {number} centerX 원 중심 x좌표
 * @param {number} centerY 원 중심 y좌표
 * @param {number} radius 반지름
 * @param {number} startAngle 시작 각도(라디안)
 * @param {number} endAngle 끝 각도(라디안)
 * @returns {string} SVG path d 문자열
 */
function buildArcPath(centerX, centerY, radius, startAngle, endAngle) {
  const startX = centerX + radius * Math.cos(startAngle);
  const startY = centerY + radius * Math.sin(startAngle);
  const endX = centerX + radius * Math.cos(endAngle);
  const endY = centerY + radius * Math.sin(endAngle);
  const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

  return [
    `M ${centerX} ${centerY}`,
    `L ${startX} ${startY}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
    "Z",
  ].join(" ");
}

window.SoftmaxMath = {
  SOFTMAX_SCORE_MAX,
  SOFTMAX_SCORE_MIN,
  SOFTMAX_TEMPERATURE_MAX,
  SOFTMAX_TEMPERATURE_MIN,
  buildArcPath,
  computeSoftmax,
  getTopIndex,
};
