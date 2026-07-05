import { canvas, ctx, pointer, resize, W, H } from "./state.js";
import type { Scene, SceneFactory } from "./types.js";

export interface Engine {
  switchTo(i: number): void;
  getSceneIndex(): number;
  start(factories: SceneFactory[], onSceneChange?: (index: number) => void): void;
}

export function createEngine(): Engine {
  let factories: SceneFactory[] = [];
  let onSceneChange: ((index: number) => void) | undefined;

  let sceneIdx = 0;
  let scene: Scene | null = null;
  let fade = 0; // 1 → black, animates to 0

  function switchTo(i: number): void {
    i = Math.max(0, Math.min(factories.length - 1, i));
    if (i === sceneIdx && scene) return;
    sceneIdx = i;
    fade = 1;
    scene = factories[i]();
    scene.enter();
    onSceneChange?.(sceneIdx);
  }

  function getSceneIndex(): number {
    return sceneIdx;
  }

  addEventListener("resize", () => {
    resize();
    scene?.enter();
  });

  canvas.addEventListener("pointerdown", (e) => {
    pointer.down = true;
    pointer.px = pointer.x = e.clientX;
    pointer.py = pointer.y = e.clientY;
    scene?.pointerdown?.();
  });
  canvas.addEventListener("pointermove", (e) => {
    pointer.px = pointer.x;
    pointer.py = pointer.y;
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    scene?.pointermove?.();
  });
  addEventListener("pointerup", () => {
    pointer.down = false;
    scene?.pointerup?.();
  });
  canvas.addEventListener("pointerleave", () => {
    pointer.x = -9999;
    pointer.y = -9999;
  });

  let last = performance.now();
  function loop(now: number): void {
    const raw = (now - last) / 1000;
    const dt = Math.min(raw, 0.033);
    last = now;
    const t = now / 1000;

    if (scene) {
      ctx.fillStyle = `rgba(10,9,8,${scene.trail})`;
      ctx.fillRect(0, 0, W, H);
      scene.update(dt, t);
      scene.draw(t);
    }

    if (fade > 0) {
      fade = Math.max(0, fade - raw * 1.8); // real elapsed time, so throttled tabs still clear
      ctx.fillStyle = `rgba(10,9,8,${fade})`;
      ctx.fillRect(0, 0, W, H);
    }
    requestAnimationFrame(loop);
  }

  function start(f: SceneFactory[], cb?: (index: number) => void): void {
    factories = f;
    onSceneChange = cb;
    resize();
    switchTo(0);
    fade = 1;
    requestAnimationFrame(loop);
  }

  return { switchTo, getSceneIndex, start };
}
