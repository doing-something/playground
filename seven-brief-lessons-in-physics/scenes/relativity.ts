import { ctx, pointer, W, H } from "../engine/state.js";
import type { Scene } from "../engine/types.js";
import { TAU, rnd, clamp } from "../engine/utils.js";

interface LatticePoint {
  hx: number;
  hy: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  col: string;
  size: number;
  alpha: number;
}

interface Mass {
  x: number;
  y: number;
  m: number;
  life: number;
  held: boolean;
}

interface Well {
  x: number;
  y: number;
  s: number;
}

export function makeRelativity(): Scene {
  let ps: LatticePoint[] = [];
  let masses: Mass[] = [];
  let s = 20;
  let sigma = 200;

  function drop(): void {
    const m = masses.find((m) => m.held);
    if (m) {
      m.x = pointer.x;
      m.y = pointer.y;
    } else {
      masses.push({ x: pointer.x, y: pointer.y, m: rnd(1.8, 2.6), life: 6, held: true });
      if (masses.length > 3) masses.shift();
    }
  }

  return {
    trail: 0.65,
    enter() {
      ps = [];
      masses = [];
      // dense dot lattice, no lines — the warp shows through displacement alone
      s = Math.max(14, Math.min(W, H) / 42);
      let cols = Math.ceil(W / s) + 2;
      let rows = Math.ceil(H / s) + 2;
      while (cols * rows > 7000) {
        s *= 1.12;
        cols = Math.ceil(W / s) + 2;
        rows = Math.ceil(H / s) + 2;
      }
      sigma = Math.min(W, H) * 0.26;
      // vertical tint: sage-grey at the top, pale gold mid, warm copper-orange below
      const shade = (tt: number): string => {
        const c1 = [146, 155, 132];
        const c2 = [214, 172, 112];
        const c3 = [198, 100, 45];
        const a = tt < 0.55 ? c1 : c2;
        const b = tt < 0.55 ? c2 : c3;
        const k = tt < 0.55 ? tt / 0.55 : (tt - 0.55) / 0.45;
        return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * k)).join(",")})`;
      };
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          const hx = c * s - s / 2;
          const hy = r * s - s / 2;
          const tt = clamp(hy / H + rnd(-0.12, 0.12), 0, 1);
          ps.push({
            hx,
            hy,
            x: hx,
            y: hy,
            vx: 0,
            vy: 0,
            col: shade(tt),
            size: rnd(1.1, 1.9),
            alpha: (0.3 + tt * 0.45) * rnd(0.75, 1.15),
          });
        }
    },
    pointerdown() {
      drop();
    },
    pointermove() {
      if (pointer.down) drop();
    },
    pointerup() {
      for (const m of masses) m.held = false;
    },
    update(dt, t) {
      for (let i = masses.length - 1; i >= 0; i--) {
        const m = masses[i];
        if (!m.held) m.life -= dt;
        if (m.life <= 0) masses.splice(i, 1);
      }
      // invisible masses roam the screen, sending slow waves through the lattice
      const wells: Well[] = [
        { x: W / 2 + Math.sin(t * 0.16) * W * 0.3, y: H / 2 + Math.sin(t * 0.11 + 1.7) * H * 0.26, s: 1 },
        { x: W / 2 + Math.sin(t * 0.07 + 3.1) * W * 0.38, y: H / 2 + Math.sin(t * 0.13 + 0.6) * H * 0.32, s: 0.8 },
        { x: W / 2 + Math.sin(t * 0.21 + 1.2) * W * 0.34, y: H / 2 + Math.sin(t * 0.055 + 4.1) * H * 0.3, s: 0.6 },
      ];
      for (const m of masses) wells.push({ x: m.x, y: m.y, s: clamp(m.life / 1.2, 0, 1) });
      // under-damped spring toward the warped target: dots overshoot and ripple,
      // bunching into bright arcs and leaving dark lanes behind — like the original
      const K = 46;
      const damp = Math.exp(-4.2 * dt);
      for (const p of ps) {
        let tx = p.hx;
        let ty = p.hy;
        for (const w of wells) {
          const vx = tx - w.x;
          const vy = ty - w.y;
          const d = Math.sqrt(vx * vx + vy * vy) || 1;
          const P = 60 * (d / (d + 60)) * Math.exp(-(d * d) / (2 * sigma * sigma)) * w.s;
          const k = (d - P) / d; // radial contraction, never folds
          tx = w.x + vx * k;
          ty = w.y + vy * k;
        }
        p.vx = (p.vx + (tx - p.x) * K * dt) * damp;
        p.vy = (p.vy + (ty - p.y) * K * dt) * damp;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
      }
    },
    draw() {
      for (const p of ps) {
        const dx = p.x - p.hx;
        const dy = p.y - p.hy;
        const disp = dx * dx + dy * dy;
        ctx.globalAlpha = clamp(p.alpha + disp * 0.0004, 0, 1);
        ctx.fillStyle = p.col;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      // soft light only while a mass is held — no hard glyph, like the original
      for (const m of masses) {
        if (!m.held) continue;
        const grd = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 90);
        grd.addColorStop(0, "rgba(247,217,176,0.16)");
        grd.addColorStop(1, "rgba(247,217,176,0)");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(m.x, m.y, 90, 0, TAU);
        ctx.fill();
      }
    },
  };
}
