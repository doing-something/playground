import { ctx, pointer, W, H } from "../engine/state.js";
import type { Scene } from "../engine/types.js";
import { TAU, rnd, clamp } from "../engine/utils.js";

interface EmberParticle {
  hx: number;
  hy: number;
  x: number;
  y: number;
  wx: number;
  wy: number;
  base: number; // frozen above, embers below
  heat: number; // extra heat from the visitor's touch
  size: number;
  tw: number;
  tws: number;
}

const coldC = [136, 130, 120];
const warmC = [217, 142, 74];
const hotC = [255, 209, 148];

function shade(h: number): string {
  let a: number[];
  let b: number[];
  let k: number;
  if (h < 0.5) {
    a = coldC;
    b = warmC;
    k = h / 0.5;
  } else {
    a = warmC;
    b = hotC;
    k = (h - 0.5) / 0.5;
  }
  return `rgb(${(a[0] + (b[0] - a[0]) * k) | 0},${(a[1] + (b[1] - a[1]) * k) | 0},${(a[2] + (b[2] - a[2]) * k) | 0})`;
}

export function makeHeat(): Scene {
  // a cold sky over a bed of embers. press to ignite: sparks flare golden,
  // rise, cool, and go out — and never come back down. that is time.
  let ps: EmberParticle[] = [];

  return {
    trail: 0.5,
    enter() {
      ps = [];
      const n = Math.min(2600, Math.floor((W * H) / 440));
      for (let i = 0; i < n; i++) {
        const x = rnd(0, W);
        const y = rnd(0, H);
        ps.push({
          hx: x,
          hy: y,
          x,
          y,
          wx: 0,
          wy: 0,
          base: clamp(Math.pow(y / H, 2.1) * 0.72 + rnd(-0.04, 0.04), 0, 0.75),
          heat: 0,
          size: rnd(0.7, 1.7),
          tw: rnd(0, TAU),
          tws: rnd(0.4, 1.6),
        });
      }
    },
    update(dt) {
      const damp = Math.exp(-2.2 * dt);
      for (const p of ps) {
        // press to ignite what is near the hand
        if (pointer.down && pointer.x > -999) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 15000) p.heat = Math.min(1.2, p.heat + (1 - Math.sqrt(d2) / 123) * 3.2 * dt);
        }
        const temp = clamp(p.base + p.heat, 0, 1.4);
        // heat is motion: the cold barely stir, the embers seethe
        p.wx = (p.wx + rnd(-1, 1) * (35 + temp * 1650) * dt) * damp;
        p.wy = (p.wy + rnd(-1, 1) * (35 + temp * 1650) * dt) * damp;
        // sparks rise as they burn, and settle home as they cool
        const lift = p.heat * 34;
        p.x += (p.wx + (p.hx - p.x) * 0.55) * dt;
        p.y += (p.wy - lift + (p.hy - p.y) * 0.55) * dt;
        p.heat *= Math.exp(-0.55 * dt); // burning out, one way only
      }
    },
    draw(t) {
      for (const p of ps) {
        const temp = clamp(p.base + p.heat, 0, 1);
        ctx.fillStyle = shade(temp);
        // hot dust flickers fast; cold dust glows steady and dim
        ctx.globalAlpha = (0.28 + temp * 0.65) * (0.75 + 0.25 * Math.sin(p.tw + t * p.tws * (1 + temp * 2.5)));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (0.85 + temp * 0.55), 0, TAU);
        ctx.fill();
      }
      // observer's ring
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
