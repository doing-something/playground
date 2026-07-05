import { ctx, pointer, W, H } from "../engine/state.js";
import type { Scene } from "../engine/types.js";
import { TAU, rnd, pick, clamp, copper, gauss } from "../engine/utils.js";

interface Node {
  X: number;
  Y: number;
  Z: number;
  jp: number;
  js: number;
  ja: number;
  sizeb: number;
  lvl: number; // quantised volume level
  jumpT: number;
  flash: number;
  dorm: number;
  col: string;
  tw: number;
  tws: number;
  nb: number[];
  x: number;
  y: number;
  s: number;
  depth: number;
  ex: number;
}

interface Link {
  a: number;
  b: number;
  age: number;
  max: number;
}

export function makeGrains(): Scene {
  // grains of space as a true 3D cloud: dense at the core, thinning outward,
  // slowly tumbling in space — stitched by flickering spin-network links
  let nodes: Node[] = [];
  let links: Link[] = [];
  let rotY = 0;
  let rotX = -0.25;
  let vY = 0.1;
  let vX = 0;

  return {
    trail: 0.6,
    enter() {
      nodes = [];
      links = [];
      rotY = 0;
      rotX = -0.25;
      vY = 0.1;
      vX = 0;
      const S = Math.min(W, H) * 0.34;
      const n = Math.min(1100, Math.floor((W * H) / 800));
      for (let i = 0; i < n; i++) {
        const X = gauss() * S;
        const Y = gauss() * S;
        const Z = gauss() * S;
        nodes.push({
          X,
          Y,
          Z,
          jp: rnd(0, TAU),
          js: rnd(0.8, 2.4),
          ja: rnd(1, 3), // calm at rest — the probe stirs it up
          sizeb: rnd(0.9, 2),
          lvl: Math.floor(rnd(0, 3)),
          jumpT: rnd(0.5, 6),
          flash: 0,
          dorm: 0,
          col: copper(),
          tw: rnd(0, TAU),
          tws: rnd(0.4, 1.8),
          nb: [],
          x: 0,
          y: 0,
          s: 1,
          depth: 0,
          ex: 1,
        });
      }
      // neighbour lists in 3D, once
      const lim2 = S * 0.34 * (S * 0.34);
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length && a.nb.length < 6; j++) {
          const b = nodes[j];
          const dx = a.X - b.X;
          const dy = a.Y - b.Y;
          const dz = a.Z - b.Z;
          if (dx * dx + dy * dy + dz * dz < lim2) {
            a.nb.push(j);
            if (b.nb.length < 6) b.nb.push(i);
          }
        }
      }
    },
    pointermove() {
      if (pointer.down) {
        const dx = clamp(pointer.x - pointer.px, -18, 18);
        const dy = clamp(pointer.y - pointer.py, -18, 18);
        rotY += dx * 0.005;
        rotX += dy * 0.005;
        vY = vY * 0.7 + dx * 0.005 * 60 * 0.3;
        vX = vX * 0.7 + dy * 0.005 * 60 * 0.3;
      }
    },
    update(dt, t) {
      if (!pointer.down) {
        vY = clamp(vY, -3, 3) * Math.pow(0.4, dt);
        vX = clamp(vX, -3, 3) * Math.pow(0.4, dt);
        rotY += (vY + 0.1) * dt; // idle tumble
        rotX += vX * dt;
      }
      rotX = clamp(rotX, -1.2, 1.2);
      const cy = Math.cos(rotY);
      const sy = Math.sin(rotY);
      const cxr = Math.cos(rotX);
      const sxr = Math.sin(rotX);
      const f = Math.min(W, H) * 1.15;
      for (const nd of nodes) {
        // the probed region boils: jitter grows where the cursor touches space
        const pdx = nd.x - pointer.x;
        const pdy = nd.y - pointer.y;
        const ex = 1 + 8 * Math.exp(-(pdx * pdx + pdy * pdy) / 9000);
        nd.ex = ex;
        // volume jumps between discrete levels — more often where space is probed
        nd.jumpT -= dt * ex;
        if (nd.jumpT <= 0) {
          nd.jumpT = rnd(1.5, 6);
          if (Math.random() < 0.16) nd.dorm = rnd(0.3, 1.2); // winks out of existence
          else {
            nd.lvl = (nd.lvl + 1 + Math.floor(rnd(0, 2))) % 3;
            nd.flash = 0.5;
          }
        }
        if (nd.dorm > 0) nd.dorm -= dt;
        if (nd.flash > 0) nd.flash -= dt;
        const j = Math.sin(nd.jp + t * nd.js) * nd.ja * ex;
        const X = nd.X + j;
        const Y = nd.Y - j * 0.7;
        const Z = nd.Z + j * 0.5;
        // rotate around Y, then X
        const x1 = X * cy + Z * sy;
        const z1 = -X * sy + Z * cy;
        const y2 = Y * cxr - z1 * sxr;
        const z2 = Y * sxr + z1 * cxr;
        const p = f / (f + z2 + Math.min(W, H) * 0.05);
        nd.x = W / 2 + x1 * p;
        nd.y = H / 2 + y2 * p;
        nd.s = p;
        nd.depth = clamp(1.25 - z2 / (Math.min(W, H) * 0.5), 0.25, 1.15);
      }
      // relations, not things: links keep re-forming — briskly where space is probed
      for (let k = 0; k < 8 && links.length < 170; k++) {
        let i = Math.floor(Math.random() * nodes.length);
        if (k >= 4) {
          for (let c = 0; c < 8; c++) {
            const cand = Math.floor(Math.random() * nodes.length);
            const dx = nodes[cand].x - pointer.x;
            const dy = nodes[cand].y - pointer.y;
            if (dx * dx + dy * dy < 16900) {
              i = cand;
              break;
            }
          }
        }
        const nb = nodes[i].nb;
        if (nb.length) links.push({ a: i, b: pick(nb), age: 0, max: rnd(0.8, 2.2) });
      }
      for (let i = links.length - 1; i >= 0; i--) {
        links[i].age += dt;
        if (links[i].age >= links[i].max) links.splice(i, 1);
      }
    },
    draw(t) {
      ctx.lineWidth = 0.7;
      for (const l of links) {
        const A = nodes[l.a];
        const B = nodes[l.b];
        if (A.dorm > 0 || B.dorm > 0) continue;
        ctx.globalAlpha = Math.sin((Math.PI * l.age) / l.max) * 0.16 * Math.min(A.depth, B.depth);
        ctx.strokeStyle = "#d98e4a";
        ctx.beginPath();
        ctx.moveTo(A.x, A.y);
        ctx.lineTo(B.x, B.y);
        ctx.stroke();
      }
      for (const nd of nodes) {
        if (nd.dorm > 0) continue;
        const heat = (nd.ex - 1) / 8; // 0 far from the cursor, 1 right under it
        const size = Math.max(0.4, nd.sizeb * (0.55 + nd.lvl * 0.5) * (1 + heat * 0.35) * nd.s);
        const base = clamp((0.35 + 0.65 * Math.abs(Math.sin(nd.tw + t * nd.tws))) * nd.depth, 0, 1);
        if (heat > 0.1) {
          // ember halo: hot grains glow amber instead of washing out white
          ctx.globalAlpha = 0.16 * heat * nd.depth;
          ctx.fillStyle = "#e8a86b";
          ctx.beginPath();
          ctx.arc(nd.x, nd.y, size * 2.2, 0, TAU);
          ctx.fill();
        }
        ctx.globalAlpha = clamp(base + (nd.flash > 0 ? nd.flash * 1.6 : 0), 0, 1);
        ctx.fillStyle = nd.flash > 0.15 ? "#ffd9a0" : nd.col;
        ctx.beginPath();
        ctx.arc(nd.x, nd.y, size, 0, TAU);
        ctx.fill();
        if (heat > 0.1) {
          // and blush toward molten gold the closer they are to the probe
          ctx.globalAlpha = clamp(heat * 0.55 * base, 0, 1);
          ctx.fillStyle = "#f7c98f";
          ctx.beginPath();
          ctx.arc(nd.x, nd.y, size, 0, TAU);
          ctx.fill();
        }
      }
      // observer's ring, as in the original
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
