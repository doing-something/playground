import { type AdamTrace, type Particle, type TrainingState, type Vector2 } from "./data.js";

type AdamStepInput = {
  current: Vector2;
  previousTrace: AdamTrace;
  target: Vector2;
  t: number;
};

type AdamStepResult = {
  nextPosition: Vector2;
  nextTrace: AdamTrace;
};

const CONVERGED_MEAN_SQUARED_DISTANCE = 4;
const MAX_STEP_COUNT = 1_000;

/**
 * 추천 순서:
 * 1. loss = (x - targetX)^2 + (y - targetY)^2 라고 둘 때 gradient를 구한다.
 * 2. m = beta1 * m + (1 - beta1) * gradient
 * 3. v = beta2 * v + (1 - beta2) * gradient^2
 * 4. mHat, vHat으로 bias correction을 적용한다.
 * 5. current - learningRate * mHat / (sqrt(vHat) + epsilon)으로 위치를 업데이트한다.
 * 
 * @param input.current 현재 위치. Adam에서 학습할 parameter에 해당한다.
 * @param input.previousTrace 이전 Adam trace (m, v). 이전 step까지 누적된 Adam 내부 상태. m, v는 이전 gradient 흐름과 gradient 크기 흐름을 기억한다.
 * @param input.target 목표 위치. loss = (current.x - target.x)^2 + (current.y - target.y)^2 기준이 된다.
 * @param input.t 몇 번째 업데이트인지 나타내는 step 번호. Adam bias correction에서 beta1^t, beta2^t 계산에 사용한다.
 * 
 */
export function applyAdamStep(input: AdamStepInput): AdamStepResult {
  const learningRate = 1.2;
  // 이전 m을 90% 유지, 현재 gradient를 10% 반영
  const beta1 = 0.9;
  // 이전 v를 99.9% 유지, 현재 gradient 제곱을 0.1% 반영
  const beta2 = 0.999;
  const epsilon = 1e-8;
  // MSE를 미분해서 나온 상수
  const mseDerivativeScale = 2;

  // 1. gradient
  const gradient: Vector2 = {
    x: mseDerivativeScale * (input.current.x - input.target.x),
    y: mseDerivativeScale * (input.current.y - input.target.y),
  };

  // 2. first moment: gradient의 이동 평균을 계산
  const m: Vector2 = {
    x: beta1 * input.previousTrace.m.x + (1 - beta1) * gradient.x,
    y: beta1 * input.previousTrace.m.y + (1 - beta1) * gradient.y,
  };

  // 3. second moment: gradient 제곱의 이동 평균을 계산
  const v: Vector2 = {
    x: beta2 * input.previousTrace.v.x + (1 - beta2) * gradient.x ** 2,
    y: beta2 * input.previousTrace.v.y + (1 - beta2) * gradient.y ** 2,
  };

  // 4. bias correction: 초반에 m과 v가 너무 작게 계산되는 문제를 보정
  const mHat: Vector2 = {
    x: m.x / (1 - beta1 ** input.t),
    y: m.y / (1 - beta1 ** input.t),
  };
  const vHat: Vector2 = {
    x: v.x / (1 - beta2 ** input.t),
    y: v.y / (1 - beta2 ** input.t),
  };

  // 5. update: 앞에서 구한 mHat, vHat을 이용해서 실제로 parameter를 얼마나 움직일지 정하고 업데이트

  // 이번 step에서 빼 줄 변화량
  const stepDelta: Vector2 = {
    x: learningRate * mHat.x / (Math.sqrt(vHat.x) + epsilon),
    y: learningRate * mHat.y / (Math.sqrt(vHat.y) + epsilon),
  };
  // current - stepDelta
  const nextPosition: Vector2 = {
    x: input.current.x - stepDelta.x,
    y: input.current.y - stepDelta.y,
  };

  return {
    nextPosition,
    nextTrace: {
      m,
      v,
      stepDelta,
      gradient,
      mHat,
      vHat,
    },
  };
}

export function runTrainingStep(state: TrainingState): TrainingState {
  const t = state.stepCount + 1;
  const particles = state.particles.map((particle) => runParticleStep(particle, t));
  const meanSquaredDistance = calculateMeanSquaredDistance(particles);
  const isConverged = meanSquaredDistance <= CONVERGED_MEAN_SQUARED_DISTANCE;
  const reachedStepLimit = t >= MAX_STEP_COUNT;

  return {
    ...state,
    isPlaying: state.isPlaying && !isConverged && !reachedStepLimit,
    particles,
    statusMessage: getStepStatusMessage(isConverged, reachedStepLimit),
    stepCount: t,
  };
}

function runParticleStep(particle: Particle, t: number): Particle {
  const result = applyAdamStep({
    current: particle.current,
    previousTrace: particle.trace,
    target: particle.target,
    t,
  });

  return {
    ...particle,
    current: result.nextPosition,
    trace: result.nextTrace,
  };
}

export function calculateMeanSquaredDistance(particles: Particle[]): number {
  const total = particles.reduce((sum, particle) => {
    const dx = particle.current.x - particle.target.x;
    const dy = particle.current.y - particle.target.y;
    return sum + dx * dx + dy * dy;
  }, 0);

  return total / particles.length;
}

function getStepStatusMessage(isConverged: boolean, reachedStepLimit: boolean): string {
  if (isConverged) {
    return "점들이 target에 충분히 가까워져 자동으로 멈춘다.";
  }

  if (reachedStepLimit) {
    return "최대 step에 도달해 자동으로 멈춘다.";
  }

  return "Adam step을 실행한다. gradient, m, v, stepDelta가 갱신된다.";
}
