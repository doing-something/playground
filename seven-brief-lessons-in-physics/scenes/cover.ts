import { ctx, pointer, W, H } from "../engine/state.js";
import type { Scene } from "../engine/types.js";
import { TAU, rnd, clamp, copper, gauss } from "../engine/utils.js";

interface CoverParticle {
  a: number;
  r: number;
  w: number;
  jA: number;
  jf: number;
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  size: number;
  alpha: number;
  col: string;
  tw: number;
  tws: number;
  ph: number;
  amp: number;
  sp: number;
  ox: number;
  oy: number;
  x: number;
  y: number;
}

export function makeCover(onBegin: () => void): Scene {
  let ps: CoverParticle[] = [];

  return {
    trail: 0.75,
    pointerdown() {
      onBegin();
    },
    enter() {
      ps = [];
      // soft gaussian halo, sized so the ring's dense zone reaches the text block's height
      let ey = Math.min(W, H) * 0.4;
      const box = document.getElementById("cover-title");
      if (box && box.children.length) {
        let tp = 1e9;
        let bt = -1e9;
        for (const el of Array.from(box.children)) {
          const b = el.getBoundingClientRect();
          if (!b.width) continue;
          tp = Math.min(tp, b.top);
          bt = Math.max(bt, b.bottom);
        }
        if (bt > tp) ey = (bt - tp) / 2 + 40;
      }
      const R = Math.max(ey * 2.17, Math.min(W, H) * 0.72);
      const n = Math.min(3000, Math.floor((W * H) / 320));
      for (let i = 0; i < n; i++) {
        const r = clamp(R * (0.46 + gauss() * 0.27), R * 0.06, R);
        ps.push({
          a: rnd(0, TAU),
          r,
          w: 0.015 * (1.25 - (r / R) * 0.7) * rnd(0.8, 1.25), // barely-there drift
          jA: rnd(3, 9),
          jf: rnd(0.4, 1.1), // per-particle brownian-ish wander
          q1: rnd(0, TAU),
          q2: rnd(0, TAU),
          q3: rnd(0, TAU),
          q4: rnd(0, TAU),
          size: Math.pow(Math.random(), 2.6) * 2.8 + 0.8, // mostly small, a few slightly chunky — all sharp
          alpha: rnd(0.45, 0.95),
          col: copper(),
          tw: rnd(0, TAU),
          tws: rnd(0.2, 1),
          ph: rnd(0, TAU),
          amp: rnd(2, 8),
          sp: rnd(0.1, 0.5),
          ox: 0,
          oy: 0,
          x: 0,
          y: 0,
        });
      }
    },
    update(dt, t) {
      const cx = W / 2;
      const cy = H / 2;
      for (const p of ps) {
        p.a += p.w * dt; // barely-there drift around the title
        const r = p.r + Math.sin(p.ph + t * p.sp) * p.amp;
        // each particle quivers on its own — the dominant motion
        const jx = (Math.sin(t * p.jf + p.q1) + 0.6 * Math.sin(t * p.jf * 1.83 + p.q2)) * p.jA * 0.6;
        const jy = (Math.sin(t * p.jf * 0.91 + p.q3) + 0.6 * Math.sin(t * p.jf * 2.13 + p.q4)) * p.jA * 0.6;
        const bx = cx + Math.cos(p.a) * r + jx;
        const by = cy + Math.sin(p.a) * r + jy;
        const dx = bx + p.ox - pointer.x;
        const dy = by + p.oy - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 12000) {
          const d = Math.sqrt(d2) || 1;
          const f = (1 - d / 110) * 260;
          p.ox += (dx / d) * f * dt;
          p.oy += (dy / d) * f * dt;
        }
        p.ox *= 0.92;
        p.oy *= 0.92;
        p.x = bx + p.ox;
        p.y = by + p.oy;
      }
    },
    draw(t) {
      for (const p of ps) {
        ctx.globalAlpha = p.alpha * (0.8 + 0.2 * Math.sin(p.tw + t * p.tws));
        ctx.fillStyle = p.col;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    },
  };
}
