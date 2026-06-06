import { INITIAL_STATUS, type AdamTrace, type Particle, type TrainingState, type Vector2 } from "./data.js";

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

/**
 * TODO: Adam의 핵심 로직을 직접 구현할 자리.
 *
 * 추천 순서:
 * 1. loss = (x - targetX)^2 + (y - targetY)^2 라고 둘 때 gradient를 구한다.
 * 2. m = beta1 * m + (1 - beta1) * gradient
 * 3. v = beta2 * v + (1 - beta2) * gradient^2
 * 4. mHat, vHat으로 bias correction을 적용한다.
 * 5. current - learningRate * mHat / (sqrt(vHat) + epsilon)으로 위치를 업데이트한다.
 */
export function applyAdamStep(input: AdamStepInput): AdamStepResult {
  void input;

  return {
    nextPosition: input.current,
    nextTrace: input.previousTrace,
  };
}

export function runTrainingStep(state: TrainingState): TrainingState {
  const t = state.stepCount + 1;
  const particles = state.particles.map((particle) => runParticleStep(particle, t));

  return {
    ...state,
    particles,
    statusMessage:
      t === 1
        ? "Step은 연결되어 있습니다. 이제 learning.ts의 applyAdamStep을 채우면 점들이 움직입니다."
        : INITIAL_STATUS,
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
