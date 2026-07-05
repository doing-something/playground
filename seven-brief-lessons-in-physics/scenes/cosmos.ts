import { ctx, W, H } from "../engine/state.js";
import type { Scene } from "../engine/types.js";
import { TAU, rnd, pick, clamp, copper } from "../engine/utils.js";

interface Star {
  x: number;
  y: number;
  s: number;
  a: number;
  tw: number;
}

interface GalaxyDot {
  r: number;
  th: number;
  w: number;
  size: number;
  col: string;
  tw: number;
  tws: number;
}

interface UniverseDot {
  x: number;
  y: number;
  s: number;
  a: number;
  col: string;
  tw: number;
  tws: number;
}

const CAPTIONS = ["땅 위에서 올려다본 하늘", "우주에 떠 있는 돌 — 지구", "천억 개의 별 — 우리 은하", "천억 개의 은하 — 우주"];

export function makeCosmos(): Scene {
  // Rovelli's third lesson: start on the ground under the sky,
  // then step back, and back again, until the universe is a sea of galaxies
  let stars: Star[] = [];
  let gal: GalaxyDot[] = [];
  let unis: UniverseDot[] = [];
  let stage = 0;
  let from = 0;
  let prog = 1;
  let rot = 0;

  return {
    trail: 0.45,
    enter() {
      stars = [];
      gal = [];
      unis = [];
      stage = 0;
      from = 0;
      prog = 1;
      rot = 0;
      for (let i = 0; i < 320; i++)
        stars.push({ x: rnd(0, W), y: rnd(0, H), s: rnd(0.3, 1.3), a: rnd(0.08, 0.5), tw: rnd(0, TAU) });
      const R = Math.min(W, H) * 0.44;
      const n = Math.min(1400, Math.floor((W * H) / 700));
      for (let i = 0; i < n; i++) {
        const halo = Math.random() < 0.12;
        const r = Math.pow(Math.random(), halo ? 0.9 : 0.62) * R + 6;
        const arm = i % 2;
        const spread = halo ? rnd(-1.4, 1.4) : rnd(-0.26, 0.26) * (0.4 + r / R);
        const th = arm * Math.PI + r * 0.016 + spread;
        gal.push({
          r,
          th,
          w: 26 / (r + 30),
          size: clamp(2.4 - (r / R) * 1.8, 0.5, 2.4) * rnd(0.7, 1.3),
          col: r < R * 0.25 ? pick(["#f7d9b0", "#f2c18d", "#e8b477"]) : copper(),
          tw: rnd(0, TAU),
          tws: rnd(0.3, 1.6),
        });
      }
      for (let i = 0; i < 420; i++)
        unis.push({
          x: rnd(-0.6, 0.6), // relative to centre, in screen units
          y: rnd(-0.6, 0.6),
          s: rnd(0.6, 2.2),
          a: rnd(0.15, 0.6),
          col: Math.random() < 0.3 ? "#d8cfc4" : copper(),
          tw: rnd(0, TAU),
          tws: rnd(0.2, 0.9),
        });
    },
    pointerdown() {
      if (prog >= 1) {
        from = stage;
        stage = (stage + 1) % 4;
        prog = 0;
      }
    },
    update(dt) {
      prog = Math.min(1, prog + dt / 1.5);
      rot += 0.05 * dt;
      for (const g of gal) g.th += g.w * dt * 0.5;
    },
    draw(t) {
      const u = prog * prog * (3 - 2 * prog); // smooth zoom
      const drawStage = (idx: number, alpha: number, scale: number): void => {
        if (alpha <= 0.01) return;
        const cx = W / 2;
        if (idx === 0 || idx === 1) {
          // the sky first — the planet body will cover the stars below the horizon
          for (const s of stars) {
            ctx.globalAlpha = alpha * s.a * (0.6 + 0.4 * Math.sin(s.tw + t * 0.8));
            ctx.fillStyle = "#d8cfc4";
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.s, 0, TAU);
            ctx.fill();
          }
          const R = idx === 0 ? W * 1.5 * scale : Math.min(W, H) * 0.15 * scale;
          const cy = idx === 0 ? H * 0.62 + R : H * 0.58;
          const glow = ctx.createRadialGradient(cx, cy, R, cx, cy, R + 26);
          glow.addColorStop(0, `rgba(233,226,212,${0.18 * alpha})`);
          glow.addColorStop(1, "rgba(233,226,212,0)");
          ctx.globalAlpha = 1;
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(cx, cy, R + 26, 0, TAU);
          ctx.fill();
          ctx.globalAlpha = alpha;
          ctx.fillStyle = "#0d0c0a";
          ctx.beginPath();
          ctx.arc(cx, cy, R, 0, TAU);
          ctx.fill();
          ctx.globalAlpha = alpha * 0.75;
          ctx.strokeStyle = "#e9e2d4";
          ctx.lineWidth = 1.1;
          ctx.beginPath();
          ctx.arc(cx, cy, R, 0, TAU);
          ctx.stroke();
        } else if (idx === 2) {
          const cy = H * 0.48;
          const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(W, H) * 0.15 * scale);
          grd.addColorStop(0, `rgba(247,217,176,${0.5 * alpha})`);
          grd.addColorStop(0.4, `rgba(217,142,74,${0.16 * alpha})`);
          grd.addColorStop(1, "rgba(217,142,74,0)");
          ctx.globalAlpha = 1;
          ctx.fillStyle = grd;
          ctx.beginPath();
          ctx.arc(cx, cy, Math.min(W, H) * 0.15 * scale, 0, TAU);
          ctx.fill();
          for (const g of gal) {
            const a = g.th + rot;
            const x = cx + Math.cos(a) * g.r * scale;
            const y = cy + Math.sin(a) * g.r * 0.5 * scale;
            ctx.globalAlpha = alpha * (0.35 + 0.65 * Math.abs(Math.sin(g.tw + t * g.tws)));
            ctx.fillStyle = g.col;
            ctx.beginPath();
            ctx.arc(x, y, g.size * clamp(scale, 0.5, 1.4), 0, TAU);
            ctx.fill();
          }
        } else {
          const cy = H / 2;
          for (const gx of unis) {
            const x = cx + gx.x * W * scale;
            const y = cy + gx.y * H * scale;
            if (x < -10 || x > W + 10 || y < -10 || y > H + 10) continue;
            ctx.globalAlpha = alpha * gx.a * (0.6 + 0.4 * Math.sin(gx.tw + t * gx.tws));
            ctx.fillStyle = gx.col;
            ctx.beginPath();
            ctx.arc(x, y, gx.s, 0, TAU);
            ctx.fill();
          }
        }
        ctx.globalAlpha = 1;
      };
      if (prog < 1) drawStage(from, 1 - u, 1 - u * 0.8);
      drawStage(stage, u, 1 + (1 - u) * 2.2);
      // caption for the settled stage
      const capA = clamp((prog - 0.55) / 0.45, 0, 1);
      if (capA > 0) {
        ctx.globalAlpha = capA * 0.85;
        ctx.fillStyle = "#c98a4b";
        ctx.font = "12px Georgia, 'Noto Serif KR'";
        ctx.textAlign = "center";
        ctx.fillText(CAPTIONS[stage].split("").join(" "), W / 2, H * 0.14);
        ctx.textAlign = "left";
        ctx.globalAlpha = 1;
      }
    },
  };
}
