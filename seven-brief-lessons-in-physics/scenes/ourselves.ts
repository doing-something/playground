import { ctx, pointer, W, H } from "../engine/state.js";
import type { Scene } from "../engine/types.js";
import { TAU, rnd, copper } from "../engine/utils.js";

interface Star {
  x: number;
  y: number;
  s: number;
  a: number;
  tw: number;
}

interface SilhouetteParticle {
  tx: number;
  ty: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  col: string;
  size: number;
  tw: number;
  tws: number;
  jA: number; // never quite still
  jf: number;
  q1: number;
  q2: number;
  away: number; // takes leave now and then
  awayT: number;
  dvx: number;
  dvy: number;
}

export function makeOurselves(): Scene {
  let ps: SilhouetteParticle[] = [];
  let stars: Star[] = [];

  return {
    trail: 0.45,
    enter() {
      ps = [];
      stars = [];
      for (let i = 0; i < 160; i++)
        stars.push({ x: rnd(0, W), y: rnd(0, H), s: rnd(0.3, 1), a: rnd(0.04, 0.3), tw: rnd(0, TAU) });

      // sample a human silhouette from an offscreen canvas
      const ow = 200;
      const oh = 310;
      const oc = document.createElement("canvas");
      oc.width = ow;
      oc.height = oh;
      const o = oc.getContext("2d") as CanvasRenderingContext2D;
      o.fillStyle = "#fff";
      o.beginPath();
      o.arc(100, 42, 24, 0, TAU);
      o.fill(); // head
      o.beginPath();
      o.roundRect(70, 74, 60, 92, 22);
      o.fill(); // torso
      o.beginPath();
      o.roundRect(48, 80, 16, 78, 8);
      o.fill(); // left arm
      o.beginPath();
      o.roundRect(136, 80, 16, 78, 8);
      o.fill(); // right arm
      o.beginPath();
      o.roundRect(74, 162, 21, 108, 10);
      o.fill(); // left leg
      o.beginPath();
      o.roundRect(105, 162, 21, 108, 10);
      o.fill(); // right leg
      const img = o.getImageData(0, 0, ow, oh).data;

      const targets: [number, number][] = [];
      const step = 4;
      for (let y = 0; y < oh; y += step)
        for (let x = 0; x < ow; x += step) if (img[(y * ow + x) * 4 + 3] > 100) targets.push([x, y]);

      const scale = (H * 0.62) / oh;
      const offX = W / 2 - (ow * scale) / 2;
      const offY = H / 2 - (oh * scale) / 2 + H * 0.02;
      // subsample if too dense
      const maxN = 950;
      const keep = targets.length > maxN ? maxN / targets.length : 1;
      for (const [tx, ty] of targets) {
        if (Math.random() > keep) continue;
        ps.push({
          tx: offX + tx * scale + rnd(-1.5, 1.5),
          ty: offY + ty * scale + rnd(-1.5, 1.5),
          x: rnd(0, W),
          y: rnd(0, H),
          vx: 0,
          vy: 0,
          col: copper(),
          size: rnd(0.7, 1.7),
          tw: rnd(0, TAU),
          tws: rnd(0.4, 1.8),
          jA: rnd(1.5, 4.5),
          jf: rnd(0.5, 1.3),
          q1: rnd(0, TAU),
          q2: rnd(0, TAU),
          away: 0,
          awayT: rnd(4, 18),
          dvx: 0,
          dvy: 0,
        });
      }
    },
    update(dt, t) {
      const breathe = Math.sin(t * 0.9) * 3;
      for (const p of ps) {
        // we are temporary arrangements: particles drift off and are replaced
        if (p.away > 0) {
          p.away -= dt;
          p.dvx += rnd(-1, 1) * 40 * dt;
          p.dvy += (rnd(-1, 1) * 40 - 8) * dt; // faintly rising, like breath
          p.x += p.dvx * dt * 6;
          p.y += p.dvy * dt * 6;
          continue;
        }
        p.awayT -= dt;
        if (p.awayT <= 0) {
          p.awayT = rnd(6, 20);
          p.away = rnd(2, 4.5);
          p.dvx = rnd(-14, 14);
          p.dvy = rnd(-18, 2);
          continue;
        }
        const jx = Math.sin(t * p.jf + p.q1) * p.jA;
        const jy = Math.sin(t * p.jf * 1.7 + p.q2) * p.jA;
        let fx = (p.tx + jx - p.x) * 5;
        let fy = (p.ty + jy + breathe - p.y) * 5;
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 16000) {
          const d = Math.sqrt(d2) || 1;
          const k = (1 - d / 127) * 5200;
          fx += (dx / d) * k;
          fy += (dy / d) * k;
        }
        p.vx = (p.vx + fx * dt) * 0.86;
        p.vy = (p.vy + fy * dt) * 0.86;
        p.x += p.vx * dt * 6;
        p.y += p.vy * dt * 6;
      }
    },
    draw(t) {
      for (const s of stars) {
        ctx.globalAlpha = s.a * (0.6 + 0.4 * Math.sin(s.tw + t));
        ctx.fillStyle = "#d8cfc4";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.s, 0, TAU);
        ctx.fill();
      }
      for (const p of ps) {
        const a = 0.45 + 0.55 * Math.abs(Math.sin(p.tw + t * p.tws));
        ctx.globalAlpha = p.away > 0 ? a * 0.5 : a;
        ctx.fillStyle = p.col;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    },
  };
}
