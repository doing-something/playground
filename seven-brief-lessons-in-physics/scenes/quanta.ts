import { ctx, pointer, W, H } from "../engine/state.js";
import type { Scene } from "../engine/types.js";
import { TAU, rnd, pick, clamp } from "../engine/utils.js";

const PALETTE = ["#f7d9b0", "#f2c18d", "#e8b477", "#d98e4a", "#c96f2f", "#e3d9c6"];

interface QuantumParticle {
  x: number;
  y: number;
  size: number;
  col: string;
  born: number;
  life: number;
  die: number;
  age: number;
  dead: number;
  tw: number;
  tws: number;
}

interface Ghost {
  x: number;
  y: number;
  size: number;
  col: string;
  life: number;
}

interface Ring {
  x: number;
  y: number;
  r: number;
  life: number;
}

interface Wave {
  active: boolean;
  timer: number;
  pos: number;
  end: number;
  dx: number;
  dy: number;
}

export function makeQuanta(): Scene {
  // particles exist only in flashes: they pop into being, hold, and vanish —
  // sometimes leaping to a new position with no path in between
  let ps: QuantumParticle[] = [];
  let ghosts: Ghost[] = [];
  let rings: Ring[] = [];
  const wave: Wave = { active: false, timer: 4, pos: 0, end: 0, dx: 1, dy: 0 };

  const fresh = (x?: number, y?: number): QuantumParticle => ({
    x: x === undefined ? rnd(0, W) : x,
    y: y === undefined ? rnd(0, H) : y,
    size: Math.pow(Math.random(), 2) * 4.6 + 0.9,
    col: pick(PALETTE),
    born: rnd(0.25, 0.5), // fade-in time
    life: rnd(1.2, 5), // time fully present
    die: rnd(0.3, 0.6), // fade-out time
    age: 0,
    dead: rnd(0, 2.5), // wait before first appearing
    tw: rnd(0, TAU),
    tws: rnd(0.3, 1.2),
  });

  return {
    trail: 0.7,
    enter() {
      ps = [];
      ghosts = [];
      rings = [];
      const n = Math.min(130, Math.floor((W * H) / 5200));
      for (let i = 0; i < n; i++) {
        const p = fresh();
        p.age = rnd(0, p.born + p.life); // start mid-cycle
        p.dead = 0;
        ps.push(p);
      }
    },
    pointerdown() {
      rings.push({ x: pointer.x, y: pointer.y, r: 8, life: 0.7 }); // measurement pulse
    },
    update(dt) {
      // an invisible wave sweeps through now and then — you only ever see it
      // as a front of particles flashing into existence along its crest
      wave.timer -= dt;
      if (!wave.active && wave.timer <= 0) {
        const th = rnd(0, TAU);
        wave.dx = Math.cos(th);
        wave.dy = Math.sin(th);
        const corners = [
          [0, 0],
          [W, 0],
          [0, H],
          [W, H],
        ].map(([x, y]) => x * wave.dx + y * wave.dy);
        wave.pos = Math.min(...corners) - 40;
        wave.end = Math.max(...corners) + 40;
        wave.active = true;
      }
      if (wave.active) {
        wave.pos += 200 * dt; // steady sweep
        const px = -wave.dy;
        const py = wave.dx;
        const L = W + H;
        const bx = W / 2 + wave.dx * (wave.pos - ((W / 2) * wave.dx + (H / 2) * wave.dy));
        const by = H / 2 + wave.dy * (wave.pos - ((W / 2) * wave.dx + (H / 2) * wave.dy));
        const k = Math.round(90 * dt) + 1;
        for (let i = 0; i < k; i++) {
          const s = rnd(-L / 2, L / 2);
          const off = ((Math.random() + Math.random() + Math.random() - 1.5) / 1.5) * 26;
          const x = bx + px * s + wave.dx * off;
          const y = by + py * s + wave.dy * off;
          if (x < 15 || x > W - 15 || y < 15 || y > H - 15) continue;
          const p = fresh(x, y);
          p.dead = 0;
          p.born = rnd(0.08, 0.2);
          p.life = rnd(0.3, 1.3);
          ps.push(p);
        }
        if (wave.pos > wave.end) {
          wave.active = false;
          wave.timer = rnd(5, 9);
        }
        while (ps.length > 320) ps.shift();
      }
      // observing: while held down, particles keep materialising under the gaze
      if (pointer.down && pointer.x > -999) {
        const k = Math.ceil(60 * dt);
        for (let i = 0; i < k; i++) {
          const a = rnd(0, TAU);
          const d = Math.sqrt(Math.random()) * 120;
          const p = fresh(pointer.x + Math.cos(a) * d, pointer.y + Math.sin(a) * d);
          p.dead = 0;
          p.born = rnd(0.06, 0.16);
          p.life = rnd(0.4, 1.6);
          ps.push(p);
        }
        while (ps.length > 340) ps.shift();
      }
      for (let i = rings.length - 1; i >= 0; i--) {
        const rg = rings[i];
        rg.r += 300 * dt;
        rg.life -= dt;
        if (rg.life <= 0) rings.splice(i, 1);
      }
      for (const p of ps) {
        if (p.dead > 0) {
          p.dead -= dt;
          continue;
        }
        p.age += dt;
        if (p.age > p.born + p.life + p.die) {
          if (Math.random() < 0.3) {
            // quantum leap: reappear somewhere else, no path in between
            const a = rnd(0, TAU);
            const d = rnd(80, 300);
            ghosts.push({ x: p.x, y: p.y, size: p.size, col: p.col, life: 0.4 });
            Object.assign(
              p,
              fresh(clamp(p.x + Math.cos(a) * d, 20, W - 20), clamp(p.y + Math.sin(a) * d, 20, H - 20)),
            );
            p.dead = 0;
            p.born = 0.12; // leap lands quickly
          } else {
            Object.assign(p, fresh()); // vanish, later reborn elsewhere
          }
        }
      }
      for (let i = ghosts.length - 1; i >= 0; i--) {
        ghosts[i].life -= dt;
        if (ghosts[i].life <= 0) ghosts.splice(i, 1);
      }
    },
    draw(t) {
      for (const rg of rings) {
        ctx.globalAlpha = clamp(rg.life / 0.7, 0, 1) * 0.5;
        ctx.strokeStyle = "#f7d9b0";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(rg.x, rg.y, rg.r, 0, TAU);
        ctx.stroke();
      }
      for (const g of ghosts) {
        ctx.globalAlpha = clamp(g.life / 0.4, 0, 1) * 0.35;
        ctx.fillStyle = g.col;
        ctx.beginPath();
        ctx.arc(g.x, g.y, g.size, 0, TAU);
        ctx.fill();
      }
      for (const p of ps) {
        if (p.dead > 0) continue;
        let a: number;
        if (p.age < p.born) a = p.age / p.born; // popping in
        else if (p.age < p.born + p.life) a = 1; // present
        else a = 1 - (p.age - p.born - p.life) / p.die; // dissolving
        a = clamp(a, 0, 1) * (0.75 + 0.25 * Math.sin(p.tw + t * p.tws));
        ctx.globalAlpha = a;
        ctx.fillStyle = p.col;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    },
  };
}
