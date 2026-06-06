import { type Particle, type TrainingState, type Vector2 } from "./data.js";

export function renderScene(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  state: TrainingState,
) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground(canvas, ctx);
  drawTargets(ctx, state.particles);
  drawParticles(ctx, state);
  drawSelectedVectors(ctx, state);
}

function drawBackground(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(203, 213, 225, 0.42)";
  ctx.lineWidth = 1;

  for (let x = 40; x < canvas.width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  for (let y = 40; y < canvas.height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  ctx.restore();
}

function drawTargets(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  ctx.save();
  ctx.fillStyle = "rgba(15, 23, 42, 0.13)";
  for (const particle of particles) {
    ctx.beginPath();
    ctx.arc(particle.target.x, particle.target.y, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawParticles(ctx: CanvasRenderingContext2D, state: TrainingState) {
  ctx.save();
  state.particles.forEach((particle, index) => {
    const isSelected = index === state.selectedParticleIndex;
    ctx.beginPath();
    ctx.arc(particle.current.x, particle.current.y, isSelected ? 6 : 3, 0, Math.PI * 2);
    ctx.fillStyle = isSelected ? "#f97316" : "#2563eb";
    ctx.fill();

    if (isSelected) {
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(249, 115, 22, 0.28)";
      ctx.stroke();
    }
  });
  ctx.restore();
}

function drawSelectedVectors(ctx: CanvasRenderingContext2D, state: TrainingState) {
  const particle = state.particles[state.selectedParticleIndex];
  if (!particle) {
    return;
  }

  drawLine(ctx, particle.current, particle.target, "rgba(15, 118, 110, 0.42)");
  drawVector(ctx, particle.current, particle.trace.gradient, "#dc2626", 0.08);
  drawVector(ctx, particle.current, particle.trace.m, "#7c3aed", 0.18);
  drawVector(ctx, particle.current, particle.trace.update, "#059669", 18);
}

function drawLine(ctx: CanvasRenderingContext2D, from: Vector2, to: Vector2, color: string) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 8]);
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
  ctx.restore();
}

function drawVector(
  ctx: CanvasRenderingContext2D,
  origin: Vector2,
  vector: Vector2,
  color: string,
  scale: number,
) {
  const end = {
    x: origin.x + vector.x * scale,
    y: origin.y + vector.y * scale,
  };

  if (Math.hypot(end.x - origin.x, end.y - origin.y) < 0.5) {
    return;
  }

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(origin.x, origin.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(end.x, end.y, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
