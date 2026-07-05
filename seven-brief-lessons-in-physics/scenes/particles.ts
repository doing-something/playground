import { ctx, pointer, W, H } from "../engine/state.js";
import type { Scene } from "../engine/types.js";
import { TAU, rnd, clamp, copper } from "../engine/utils.js";

interface FieldParticle {
  x: number;
  y: number;
  hx: number;
  hy: number;
  vx: number;
  vy: number;
  size: number;
  col: string;
  alpha: number;
  exc: number;
  ep: number;
  es: number;
  tw: number;
  tws: number;
}

export function makeParticles(): Scene {
  // the dust IS the field. a click is an event: the quanta already there
  // burst outward like sparks, glittering, then drift back as they calm.
  let ps: FieldParticle[] = [];

  return {
    trail: 0.62,
    enter() {
      ps = [];
      const n = Math.min(1700, Math.floor((W * H) / 720));
      for (let i = 0; i < n; i++) {
        const x = rnd(0, W);
        const y = rnd(0, H);
        ps.push({
          x,
          y,
          hx: x,
          hy: y,
          vx: 0,
          vy: 0,
          size: rnd(0.8, 1.9),
          col: copper(),
          alpha: rnd(0.35, 0.8),
          exc: 0,
          ep: rnd(0, TAU),
          es: rnd(8, 16), // excitation + fast-glitter phase
          tw: rnd(0, TAU),
          tws: rnd(0.3, 1.4),
        });
      }
    },
    pointerdown() {
      // the event bursts: the quanta already there fly out like sparks
      for (const p of ps) {
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 24000) {
          const d = Math.sqrt(d2) || 1;
          const k = 1 - d / 155;
          p.exc = Math.min(1.4, p.exc + k * rnd(1.1, 1.5));
          const a = Math.atan2(dy, dx) + rnd(-0.35, 0.35); // ragged spray, not a clean ring
          const sp = k * rnd(260, 520);
          p.vx += Math.cos(a) * sp;
          p.vy += Math.sin(a) * sp;
        }
      }
    },
    update(dt) {
      const drag = Math.exp(-1.6 * dt);
      for (const p of ps) {
        // excited quanta tremble hard, then calm down; nothing new is added
        const jig = 14 + p.exc * 480;
        p.vx = (p.vx + ((p.hx - p.x) * 0.9 + rnd(-1, 1) * jig) * dt) * drag;
        p.vy = (p.vy + ((p.hy - p.y) * 0.9 + rnd(-1, 1) * jig) * dt) * drag;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.exc *= Math.exp(-1.6 * dt); // burn bright, then settle
      }
    },
    draw(t) {
      for (const p of ps) {
        const e = clamp(p.exc, 0, 1);
        let a = p.alpha * (0.7 + 0.3 * Math.sin(p.tw + t * p.tws));
        if (e > 0.05) {
          // hard glitter while excited: fully lit or nearly dark
          const on = Math.sin(p.ep + t * p.es) > -0.2;
          a = a * (1 - e) + e * (on ? 1 : 0.12);
          ctx.fillStyle = e > 0.9 ? "#fff3dd" : e > 0.35 && on ? "#ffd9a0" : p.col;
        } else {
          ctx.fillStyle = p.col;
        }
        ctx.globalAlpha = clamp(a, 0, 1);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 + e * 1.5), 0, TAU);
        ctx.fill();
      }
      // the observer's probe — a small ring riding the cursor, like the original
      if (pointer.x > -999) {
        ctx.globalAlpha = 0.85;
        ctx.strokeStyle = "#efe9dd";
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, 11, 0, TAU);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    },
  };
}
