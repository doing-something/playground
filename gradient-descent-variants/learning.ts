import {
  DATA_POINTS,
  LEARNING_RATE,
  type DataPoint,
  type GradientMethod,
  type TrainingState,
  type Weights,
} from "./data.js";

type BatchSelection = {
  indices: number[];
  nextMiniBatchCursor: number;
  nextStochasticCursor: number;
};

/**
 * TODO(직접 구현):
 * method에 따라 이번 Step에서 사용할 sample index를 고른다.
 *
 * Batch: 전체 index
 * Stochastic: 현재 stochasticCursor가 가리키는 index 1개
 * Mini-Batch: 현재 miniBatchCursor가 가리키는 연속 index 2개
 */
export function selectBatchIndices(
  method: GradientMethod,
  state: TrainingState,
  sampleCount: number,
): BatchSelection {
  void method;
  void state;
  void sampleCount;

  throw new Error("TODO: selectBatchIndices를 직접 구현하세요.");
}

/**
 * TODO(직접 구현):
 * 아래 공통 공식으로 weights를 한 번 업데이트한다.
 *
 * y_pred = X_batch @ weights
 * error = y_pred - y_batch
 * gradient = (2 / batch_size) * X_batch.T @ error
 * weights = weights - learning_rate * gradient
 */
export function applyGradientStep(
  weights: Weights,
  batch: DataPoint[],
  learningRate: number,
): Weights {
  void weights;
  void batch;
  void learningRate;

  throw new Error("TODO: applyGradientStep을 직접 구현하세요.");
}

export function runTrainingStep(
  state: TrainingState,
  dataPoints: DataPoint[] = DATA_POINTS,
  learningRate = LEARNING_RATE,
): TrainingState {
  const selection = selectBatchIndices(state.method, state, dataPoints.length);
  const batch = selection.indices.map((index) => dataPoints[index]);
  const nextWeights = applyGradientStep(state.weights, batch, learningRate);

  return {
    ...state,
    lastUsedIndices: selection.indices,
    miniBatchCursor: selection.nextMiniBatchCursor,
    statusMessage: "업데이트 완료",
    stochasticCursor: selection.nextStochasticCursor,
    updateCount: state.updateCount + 1,
    weights: nextWeights,
  };
}
