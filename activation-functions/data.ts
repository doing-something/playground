export const CANVAS_ID = "activation-canvas";

export const ACTIVATION_TABS = ["sigmoid", "relu", "softmax"] as const;

export type ActivationTab = (typeof ACTIVATION_TABS)[number];

export type ActivationState = {
  reluX: number;
  sigmoidX: number;
  softmaxLogits: [number, number, number];
  tab: ActivationTab;
};

export const DEFAULT_STATE: ActivationState = {
  tab: "sigmoid",
  sigmoidX: 0,
  reluX: 1.5,
  softmaxLogits: [2, 1, 0.2],
};

