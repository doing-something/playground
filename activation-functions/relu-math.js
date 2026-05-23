/**
 * 데이터 사용량 슬라이더의 최솟값이다.
 * 모바일 데이터는 0GB부터 시작한다고 가정한다.
 */
const RELU_USAGE_MIN = 0;

/**
 * 데이터 사용량 슬라이더의 최댓값이다.
 * 학습용 데모에서 변화가 잘 보이는 20GB까지를 사용한다.
 */
const RELU_USAGE_MAX = 20;

/**
 * 기본 제공량 슬라이더의 최솟값이다.
 * 0GB 요금제도 설명 가능하도록 0부터 시작한다.
 */
const RELU_ALLOWANCE_MIN = 0;

/**
 * 기본 제공량 슬라이더의 최댓값이다.
 * 작은 요금제 예시로 10GB까지 허용한다.
 */
const RELU_ALLOWANCE_MAX = 10;

/**
 * GB당 단가다.
 * 계산 결과가 눈에 잘 들어오도록 1GB당 1,800원으로 둔다.
 */
const RELU_PRICE_PER_GB = 1800;

/**
 * 기본 제공량을 뺀 초과 사용량을 계산한다.
 *
 * ReLU를 적용하기 전의 원시 입력값 역할을 한다.
 * 음수일 수도 있으므로 아직 "과금 대상"으로 보지 않는다.
 *
 * @param {number} usage 현재 사용량(GB)
 * @param {number} allowance 기본 제공량(GB)
 * @returns {number} 초과량 후보값. 음수면 아직 제공량 이내다
 */
function computeUsageDelta(usage, allowance) {
  return usage - allowance;
}

/**
 * ReLU 함수를 직접 구현한다.
 *
 * ReLU는 max(0, x)와 같아서, 음수는 모두 0으로 잘라내고
 * 양수는 그대로 통과시킨다. 이 데모에서는 "기본 제공량 이하는 무료,
 * 초과분만 과금"이라는 규칙과 정확히 대응된다.
 *
 * @param {number} value ReLU에 넣을 입력값
 * @returns {number} 0 미만이면 0, 아니면 원래 값
 */
function relu(value) {
  return Math.max(0, value);
}

/**
 * ReLU를 적용한 뒤 실제 과금 대상 사용량을 계산한다.
 *
 * usage - allowance 값이 음수면 과금 대상은 0GB,
 * 양수면 그 초과분만 그대로 과금 대상으로 남는다.
 *
 * @param {number} usage 현재 사용량(GB)
 * @param {number} allowance 기본 제공량(GB)
 * @returns {number} 과금 대상 사용량(GB)
 */
function computeChargeableUsage(usage, allowance) {
  return relu(computeUsageDelta(usage, allowance));
}

/**
 * 과금 대상 사용량으로 실제 요금을 계산한다.
 *
 * 학습용 데모이므로 복잡한 할인/구간제 없이
 * 단순히 GB당 단가를 곱하는 선형 요금 모델을 사용한다.
 *
 * @param {number} chargeableUsage ReLU를 통과한 과금 대상 사용량
 * @param {number} unitPrice GB당 단가
 * @returns {number} 총 요금(원)
 */
function computeCharge(chargeableUsage, unitPrice = RELU_PRICE_PER_GB) {
  return chargeableUsage * unitPrice;
}

window.ReLUMath = {
  RELU_ALLOWANCE_MAX,
  RELU_ALLOWANCE_MIN,
  RELU_PRICE_PER_GB,
  RELU_USAGE_MAX,
  RELU_USAGE_MIN,
  computeCharge,
  computeChargeableUsage,
  computeUsageDelta,
  relu,
};
