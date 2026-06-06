export const CANVAS_ID = "gradient-descent-canvas";
export const METHOD_SELECT_ID = "gradient-method";
export const STEP_BUTTON_ID = "gradient-step";
export const RESET_BUTTON_ID = "gradient-reset";

export const LEARNING_RATE = 0.015;
export const MINI_BATCH_SIZE = 2;

export const METHODS = [
  { value: "batch", label: "Batch" },
  { value: "stochastic", label: "Stochastic" },
  { value: "mini-batch", label: "Mini-Batch" },
] as const;

export type GradientMethod = (typeof METHODS)[number]["value"];

export type DataPoint = {
  x: number;
  y: number;
};

export type Weights = [slope: number, bias: number];

export type TrainingState = {
  lastUsedIndices: number[];
  method: GradientMethod;
  miniBatchCursor: number;
  statusMessage: string;
  stochasticCursor: number;
  updateCount: number;
  weights: Weights;
};

export const DATA_POINTS: DataPoint[] = [
  { x: 0.4, y: 1.3 },
  { x: 1.0, y: 1.8 },
  { x: 1.6, y: 2.8 },
  { x: 2.3, y: 3.0 },
  { x: 3.1, y: 4.4 },
  { x: 3.8, y: 4.6 },
  { x: 4.5, y: 5.7 },
  { x: 5.2, y: 6.0 },
];

export const INITIAL_WEIGHTS: Weights = [0.15, 0.4];

export function createInitialTrainingState(method: GradientMethod = "batch"): TrainingState {
  return {
    lastUsedIndices: [],
    method,
    miniBatchCursor: 0,
    statusMessage: "learning.ts의 TODO를 채우면 Step이 weights를 업데이트합니다.",
    stochasticCursor: 0,
    updateCount: 0,
    weights: [...INITIAL_WEIGHTS],
  };
}
