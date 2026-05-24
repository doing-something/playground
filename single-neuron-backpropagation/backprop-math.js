const SingleNeuronBackpropMath = (() => {
  const DATASET = [
    { attendance: 0.35, hours: 1.5, id: "student-a", label: 0, name: "학생 A" },
    { attendance: 0.55, hours: 3.2, id: "student-b", label: 0, name: "학생 B" },
    { attendance: 0.72, hours: 5.4, id: "student-c", label: 1, name: "학생 C" },
    { attendance: 0.88, hours: 7.1, id: "student-d", label: 1, name: "학생 D" },
  ];

  const DEFAULT_PARAMS = {
    bias: -5.5,
    learningRate: 0.35,
    weightAttendance: 3.2,
    weightHours: 1.1,
  };

  /**
   * 작은 값을 보기 좋은 문자열로 고정 소수점 포맷한다.
   *
   * backpropagation 데모에서는 0.0000 근처 값이 자주 나오므로,
   * 화면에서 `-0.0000`처럼 보이는 잡음을 줄여야 수식 흐름이 읽히기 쉽다.
   *
   * @param {number} value 표시할 숫자
   * @param {number} digits 소수 자릿수
   * @returns {string} 반올림된 문자열
   */
  function formatFixed(value, digits = 4) {
    if (Math.abs(value) < 10 ** (-digits) / 2) {
      return (0).toFixed(digits);
    }

    return value.toFixed(digits);
  }

  /**
   * 시그모이드 함수를 계산한다.
   *
   * 공식:
   * `sigmoid(z) = 1 / (1 + exp(-z))`
   *
   * 선형 출력 z는 아직 확률이 아니다.
   * 이 함수를 통과시켜야 0~1 사이 값으로 압축되어
   * "이 학생이 합격할 확률"처럼 읽을 수 있다.
   *
   * @param {number} z 선형 결합 결과
   * @returns {number} 0 이상 1 이하의 확률형 출력
   */
  function sigmoid(z) {
    return 1 / (1 + Math.exp(-z));
  }

  /**
   * 데이터 1개에 대한 선형 결합 z를 계산한다.
   *
   * 공식:
   * `z = x1 * w1 + x2 * w2 + b`
   *
   * 여기서
   * - `x1`은 공부 시간
   * - `x2`는 출석률
   * - `w1`, `w2`는 각 특징의 중요도
   * - `b`는 기준선 이동량
   *
   * @param {{ attendance: number, hours: number }} sample 입력 샘플
   * @param {{ bias: number, weightAttendance: number, weightHours: number }} params 현재 파라미터
   * @returns {number} 시그모이드 직전의 점수 z
   */
  function computeLogit(sample, params) {
    return sample.hours * params.weightHours + sample.attendance * params.weightAttendance + params.bias;
  }

  /**
   * 데이터 1개에 대한 forward 결과를 계산한다.
   *
   * 이 함수는 한 샘플이 뉴런을 통과하면서 거치는 핵심 숫자를 한 번에 모은다.
   * 사용자는 이 값을 통해
   * `입력 -> 선형 결합 -> 시그모이드 -> 샘플 오차`
   * 흐름을 따라갈 수 있다.
   *
   * 계산 항목:
   * 1. `z = x1*w1 + x2*w2 + b`
   * 2. `y_pred = sigmoid(z)`
   * 3. `error = y_pred - y`
   * 4. `sampleMSE = (y_pred - y)^2`
   *
   * @param {{ attendance: number, hours: number, id: string, label: 0 | 1, name: string }} sample 입력 샘플
   * @param {{ bias: number, weightAttendance: number, weightHours: number }} params 현재 파라미터
   * @returns {{
   *   error: number,
   *   probability: number,
   *   sampleMSE: number,
   *   z: number
   * }} 한 샘플의 forward 결과
   */
  function evaluateSample(sample, params) {
    const z = computeLogit(sample, params);
    const probability = sigmoid(z);
    const error = probability - sample.label;
    const sampleMSE = error ** 2;

    return {
      error,
      probability,
      sampleMSE,
      z,
    };
  }

  /**
   * 현재 파라미터로 데이터셋 전체를 평가한다.
   *
   * backpropagation은 개별 샘플 오차만 보는 것이 아니라,
   * 전체 데이터셋 기준으로 평균 손실을 줄이도록 업데이트를 만든다.
   * 그래서 각 샘플의 forward 결과와 전체 평균 MSE를 함께 계산한다.
   *
   * 공식:
   * `MSE = (1 / n) * sum (y_pred_i - y_i)^2`
   *
   * @param {{ bias: number, weightAttendance: number, weightHours: number }} params 현재 파라미터
   * @param {Array<{ attendance: number, hours: number, id: string, label: 0 | 1, name: string }>} dataset 사용할 데이터셋
   * @returns {{
   *   meanMSE: number,
   *   rows: Array<{
   *     attendance: number,
   *     error: number,
   *     hours: number,
   *     id: string,
   *     label: 0 | 1,
   *     name: string,
   *     probability: number,
   *     sampleMSE: number,
   *     z: number
   *   }>
   * }} 데이터셋 평가 결과
   */
  function evaluateDataset(params, dataset = DATASET) {
    const rows = dataset.map((sample) => ({
      ...sample,
      ...evaluateSample(sample, params),
    }));
    const meanMSE = rows.reduce((sum, row) => sum + row.sampleMSE, 0) / rows.length;

    return {
      meanMSE,
      rows,
    };
  }

  /**
   * 시그모이드 출력에 대한 도함수 값을 계산한다.
   *
   * 공식:
   * `d sigmoid(z) / dz = sigmoid(z) * (1 - sigmoid(z))`
   *
   * 이 값은 현재 출력이 얼마나 쉽게 변할 수 있는지 나타낸다.
   * 예측이 0이나 1에 너무 가까우면 기울기가 작아지고,
   * 0.5 근처에서는 상대적으로 더 크게 반응한다.
   *
   * @param {number} probability 이미 계산된 `sigmoid(z)` 값
   * @returns {number} 시그모이드 기울기
   */
  function computeSigmoidGradient(probability) {
    return probability * (1 - probability);
  }

  /**
   * 데이터셋 전체에 대한 gradient를 계산한다.
   *
   * 이 데모의 핵심 공식은 아래 네 줄이다.
   *
   * `error_i = y_pred_i - y_i`
   * `sigmoid_grad_i = y_pred_i * (1 - y_pred_i)`
   * `error_signal_i = (2 / n) * error_i * sigmoid_grad_i`
   * `grad_w = X^T * error_signal`, `grad_b = sum(error_signal)`
   *
   * 의미를 풀면:
   * - `error_i`는 각 샘플이 얼마나 틀렸는지
   * - `sigmoid_grad_i`는 출력이 z 변화에 얼마나 민감한지
   * - `error_signal_i`는 "이 샘플이 파라미터를 어느 방향으로 얼마나 밀어야 하는가"를 담은 값
   * - `grad_w`, `grad_b`는 모든 샘플의 신호를 합쳐 만든 최종 업데이트 방향
   *
   * 여기서 `(2 / n)`이 붙는 이유는 MSE를 미분했기 때문이다.
   * MSE에 들어 있는 제곱항을 미분하면 2가 나오고,
   * 평균을 내고 있으므로 전체 샘플 수 n으로 나눈다.
   *
   * @param {{ bias: number, weightAttendance: number, weightHours: number }} params 현재 파라미터
   * @param {Array<{ attendance: number, hours: number, id: string, label: 0 | 1, name: string }>} dataset 사용할 데이터셋
   * @returns {{
   *   gradB: number,
   *   gradWeightAttendance: number,
   *   gradWeightHours: number,
   *   meanMSE: number,
   *   rows: Array<{
   *     attendance: number,
   *     error: number,
   *     errorSignal: number,
   *     hours: number,
   *     id: string,
   *     label: 0 | 1,
   *     name: string,
   *     probability: number,
   *     sampleMSE: number,
   *     sigmoidGradient: number,
   *     z: number
   *   }>
   * }} gradient와 샘플별 중간 계산값
   */
  function computeGradientBreakdown(params, dataset = DATASET) {
    const evaluation = evaluateDataset(params, dataset);
    const n = evaluation.rows.length;

    const rows = evaluation.rows.map((row) => {
      const sigmoidGradient = computeSigmoidGradient(row.probability);
      const errorSignal = (2 / n) * row.error * sigmoidGradient;

      return {
        ...row,
        errorSignal,
        sigmoidGradient,
      };
    });

    const gradWeightHours = rows.reduce((sum, row) => sum + row.hours * row.errorSignal, 0);
    const gradWeightAttendance = rows.reduce((sum, row) => sum + row.attendance * row.errorSignal, 0);
    const gradB = rows.reduce((sum, row) => sum + row.errorSignal, 0);

    return {
      gradB,
      gradWeightAttendance,
      gradWeightHours,
      meanMSE: evaluation.meanMSE,
      rows,
    };
  }

  /**
   * gradient descent 한 번을 적용한다.
   *
   * 공식:
   * `w_new = w_old - learning_rate * grad_w`
   * `b_new = b_old - learning_rate * grad_b`
   *
   * gradient는 "loss가 가장 빠르게 증가하는 방향"을 가리킨다.
   * 그래서 그 반대 방향으로 조금 움직여야 loss가 줄어든다.
   * learning rate는 그 한 걸음의 크기다.
   *
   * @param {{ bias: number, learningRate: number, weightAttendance: number, weightHours: number }} params 현재 파라미터
   * @param {Array<{ attendance: number, hours: number, id: string, label: 0 | 1, name: string }>} dataset 사용할 데이터셋
   * @returns {{
   *   after: { bias: number, learningRate: number, weightAttendance: number, weightHours: number },
   *   before: { bias: number, learningRate: number, weightAttendance: number, weightHours: number },
   *   gradient: ReturnType<typeof computeGradientBreakdown>,
   *   meanMSEAfter: number,
   *   meanMSEBefore: number,
   *   parameterDelta: {
   *     bias: number,
   *     weightAttendance: number,
   *     weightHours: number
   *   }
   * }} 업데이트 전후 비교 결과
   */
  function applyGradientStep(params, dataset = DATASET) {
    const gradient = computeGradientBreakdown(params, dataset);
    const before = { ...params };
    const after = {
      ...params,
      bias: params.bias - params.learningRate * gradient.gradB,
      weightAttendance: params.weightAttendance - params.learningRate * gradient.gradWeightAttendance,
      weightHours: params.weightHours - params.learningRate * gradient.gradWeightHours,
    };
    const meanMSEAfter = evaluateDataset(after, dataset).meanMSE;

    return {
      after,
      before,
      gradient,
      meanMSEAfter,
      meanMSEBefore: gradient.meanMSE,
      parameterDelta: {
        bias: after.bias - before.bias,
        weightAttendance: after.weightAttendance - before.weightAttendance,
        weightHours: after.weightHours - before.weightHours,
      },
    };
  }

  /**
   * 현재 파라미터로 한 epoch의 중간 텐서를 모두 모아 trace 객체를 만든다.
   *
   * 이 함수는 `train_neuron`의 한 바퀴를 "실행 추적"처럼 읽을 수 있게 하기 위한 도우미다.
   * 화면에서는 각 줄을 따로 보여 주지만, 실제로는 앞선 줄의 결과가 다음 줄 입력이 된다.
   * 따라서 아래 중간값을 한 번에 계산해 두면
   * - 현재 줄의 입력값
   * - 현재 줄의 출력값
   * - 전체 epoch 흐름에서 그 줄의 역할
   * 을 안정적으로 연결해 보여 줄 수 있다.
   *
   * trace에 포함되는 핵심 값은 다음과 같다.
   * - `features`: `(n_samples, n_features)` 입력 행렬
   * - `labels`: `(n_samples,)` 정답 벡터
   * - `weights`: `(n_features,)` 현재 가중치 벡터
   * - `z`: `(n_samples,)` 선형 출력 벡터
   * - `yPred`: `(n_samples,)` 시그모이드 출력 벡터
   * - `error`: `(n_samples,)` 예측 오차 벡터
   * - `sigmoidGrad`: `(n_samples,)` 시그모이드 미분 벡터
   * - `errorSignal`: `(n_samples,)` backprop 오차 신호 벡터
   * - `gradW`: `(n_features,)` 가중치 gradient
   * - `gradB`: `()` 편향 gradient
   *
   * @param {{ bias: number, learningRate: number, weightAttendance: number, weightHours: number }} params 현재 파라미터
   * @param {Array<{ attendance: number, hours: number, id: string, label: 0 | 1, name: string }>} dataset 사용할 데이터셋
   * @returns {{
   *   bias: number,
   *   error: number[],
   *   errorSignal: number[],
   *   featureNames: string[],
   *   features: number[][],
   *   gradB: number,
   *   gradW: number[],
   *   labels: number[],
   *   learningRate: number,
   *   meanMSE: number,
   *   n: number,
   *   rows: ReturnType<typeof computeGradientBreakdown>["rows"],
   *   selectedFeatureBreakdown: {
   *     attendance: { contributions: { featureValue: number, rowId: string, rowName: string, term: number }[], gradient: number },
   *     hours: { contributions: { featureValue: number, rowId: string, rowName: string, term: number }[], gradient: number }
   *   },
   *   sigmoidGrad: number[],
   *   weights: number[],
   *   yPred: number[],
   *   z: number[]
   * }} 한 epoch trace 객체
   */
  function buildEpochTrace(params, dataset = DATASET) {
    const gradient = computeGradientBreakdown(params, dataset);
    const features = dataset.map((sample) => [sample.hours, sample.attendance]);
    const labels = dataset.map((sample) => sample.label);
    const z = gradient.rows.map((row) => row.z);
    const yPred = gradient.rows.map((row) => row.probability);
    const error = gradient.rows.map((row) => row.error);
    const sigmoidGrad = gradient.rows.map((row) => row.sigmoidGradient);
    const errorSignal = gradient.rows.map((row) => row.errorSignal);

    return {
      bias: params.bias,
      error,
      errorSignal,
      featureNames: ["hours", "attendance"],
      features,
      gradB: gradient.gradB,
      gradW: [gradient.gradWeightHours, gradient.gradWeightAttendance],
      labels,
      learningRate: params.learningRate,
      meanMSE: gradient.meanMSE,
      n: dataset.length,
      rows: gradient.rows,
      selectedFeatureBreakdown: {
        attendance: {
          contributions: gradient.rows.map((row) => ({
            featureValue: row.attendance,
            rowId: row.id,
            rowName: row.name,
            term: row.attendance * row.errorSignal,
          })),
          gradient: gradient.gradWeightAttendance,
        },
        hours: {
          contributions: gradient.rows.map((row) => ({
            featureValue: row.hours,
            rowId: row.id,
            rowName: row.name,
            term: row.hours * row.errorSignal,
          })),
          gradient: gradient.gradWeightHours,
        },
      },
      sigmoidGrad,
      weights: [params.weightHours, params.weightAttendance],
      yPred,
      z,
    };
  }

  return {
    DATASET,
    DEFAULT_PARAMS,
    applyGradientStep,
    buildEpochTrace,
    computeGradientBreakdown,
    computeLogit,
    computeSigmoidGradient,
    evaluateDataset,
    evaluateSample,
    formatFixed,
    sigmoid,
  };
})();

window.SingleNeuronBackpropMath = SingleNeuronBackpropMath;
