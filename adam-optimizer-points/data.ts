export const CANVAS_ID = "adam-points-canvas";
export const PLAY_BUTTON_ID = "adam-play";
export const RESET_BUTTON_ID = "adam-reset";
export const STEP_BUTTON_ID = "adam-step";

export const POINT_COUNT = 420;
export const CANVAS_WIDTH = 760;
export const CANVAS_HEIGHT = 520;

export type Vector2 = {
  x: number;
  y: number;
};

export type AdamTrace = {
  gradient: Vector2;
  m: Vector2;
  mHat: Vector2;
  stepDelta: Vector2;
  v: Vector2;
  vHat: Vector2;
};

export type Particle = {
  current: Vector2;
  target: Vector2;
  trace: AdamTrace;
};

export type TrainingState = {
  isPlaying: boolean;
  particles: Particle[];
  selectedParticleIndex: number;
  statusMessage: string;
  stepCount: number;
};

export const ZERO_VECTOR: Vector2 = { x: 0, y: 0 };

export const INITIAL_STATUS =
  "Step을 누르면 Adam 업데이트를 한 번 실행한다.";

export function createInitialTrainingState(): TrainingState {
  return {
    isPlaying: false,
    particles: createInitialParticles(),
    selectedParticleIndex: 0,
    statusMessage: INITIAL_STATUS,
    stepCount: 0,
  };
}

function createInitialParticles(): Particle[] {
  const targets = createAdamTextTargets(POINT_COUNT);

  return targets.map((target, index) => ({
    current: createSeededRandomPoint(index),
    target,
    trace: createEmptyTrace(),
  }));
}

function createEmptyTrace(): AdamTrace {
  return {
    gradient: { ...ZERO_VECTOR },
    m: { ...ZERO_VECTOR },
    mHat: { ...ZERO_VECTOR },
    stepDelta: { ...ZERO_VECTOR },
    v: { ...ZERO_VECTOR },
    vHat: { ...ZERO_VECTOR },
  };
}

function createSeededRandomPoint(index: number): Vector2 {
  return {
    x: 54 + pseudoRandom(index * 2 + 1) * (CANVAS_WIDTH - 108),
    y: 58 + pseudoRandom(index * 2 + 2) * (CANVAS_HEIGHT - 116),
  };
}

function pseudoRandom(seed: number): number {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function createAdamTextTargets(pointCount: number): Vector2[] {
  const offscreenCanvas = document.createElement("canvas");
  offscreenCanvas.width = CANVAS_WIDTH;
  offscreenCanvas.height = CANVAS_HEIGHT;

  const ctx = offscreenCanvas.getContext("2d");
  if (!ctx) {
    throw new Error("ADAM target을 만들 canvas context를 찾을 수 없습니다.");
  }

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = "#0f172a";
  ctx.font = "700 136px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("ADAM", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 12);

  const imageData = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  const candidates: Vector2[] = [];

  for (let y = 0; y < CANVAS_HEIGHT; y += 6) {
    for (let x = 0; x < CANVAS_WIDTH; x += 6) {
      const offset = (y * CANVAS_WIDTH + x) * 4;
      const red = imageData.data[offset] ?? 255;
      if (red < 120) {
        candidates.push({ x, y });
      }
    }
  }

  if (candidates.length === 0) {
    throw new Error("ADAM target point를 만들 수 없습니다.");
  }

  return Array.from({ length: pointCount }, (_, index) => {
    const candidateIndex = Math.floor((index / pointCount) * candidates.length);
    return candidates[candidateIndex] ?? candidates[candidates.length - 1];
  });
}
