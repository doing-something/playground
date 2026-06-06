import {
  DATA_POINTS,
  LEARNING_RATE,
  MINI_BATCH_SIZE,
  type DataPoint,
  type GradientMethod,
  type TrainingState,
  type Weights,
} from "./data.js";
import { multiplyMatrixVector, transpose } from "../shared/matrix.js";

type BatchSelection = {
  indices: number[];
  nextMiniBatchCursor: number;
  nextStochasticCursor: number;
};

/**
 * method에 따라 이번 Step에서 사용할 sample index를 고른다.
 *
 * Batch: 전체 index
 * Stochastic: 현재 stochasticCursor가 가리키는 index 1개
 * Mini-Batch: 현재 miniBatchCursor가 가리키는 연속 index MINI_BATCH_SIZE개
 * 
 * @sampleCount는 전체 데이터셋의 크기
 */
export function selectBatchIndices(
  method: GradientMethod,
  state: TrainingState,
  sampleCount: number,
): BatchSelection {
  /**
   * Batch:
   * startIndex = 0
   * batchSize = sampleCount

   * Stochastic:
   * startIndex = state.stochasticCursor
   * batchSize = 1

   * Mini-Batch:
   * startIndex = state.miniBatchCursor
   * batchSize = MINI_BATCH_SIZE
   */

  const startIndex = 
    method === "batch" 
      ? 0
      : method === "stochastic"
        ? state.stochasticCursor
        : state.miniBatchCursor;

  const batchSize = 
    method === "batch"
      ? sampleCount
      : method === "stochastic"
        ? 1
        : MINI_BATCH_SIZE;

  const indices = Array.from({ length: batchSize }, (_, i) => startIndex + i);
  const nextCursor = (startIndex + batchSize) % sampleCount;
  
  return {
    indices,
    nextMiniBatchCursor: method === "mini-batch" ? nextCursor : state.miniBatchCursor,
    nextStochasticCursor: method === "stochastic" ? nextCursor : state.stochasticCursor,
  }
}

/**
 * 선택된 batch 데이터로 gradient를 계산해서 weights [slope, bias]를 한 번 업데이트한다.
 * 아래 공통 공식 사용.
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
  // MSE를 미분해서 나온 상수
  const mseDerivativeScale = 2;
  const batchSize = batch.length;

  const xBatch = batch.map((point) => [point.x, 1]); // [x, 1] @ [slope, bias] 형태로 만들기
  const yBatch = batch.map((point) => point.y);

  const predictions = multiplyMatrixVector(xBatch, weights);
  const errors = predictions.map((pred, i) => pred - yBatch[i]);
  const gradientBase = multiplyMatrixVector(transpose(xBatch), errors);
  const gradient = gradientBase.map((value) => (mseDerivativeScale / batchSize) * value);

  return [
    weights[0] - learningRate * gradient[0],
    weights[1] - learningRate * gradient[1],
  ]
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
