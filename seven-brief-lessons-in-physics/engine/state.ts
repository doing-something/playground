import type { Pointer } from "./types.js";

export let W = 0;
export let H = 0;
export let DPR = 1;

export const canvas = document.getElementById("c") as HTMLCanvasElement;
export const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

export const pointer: Pointer = { x: -9999, y: -9999, px: -9999, py: -9999, down: false };

export function resize(): void {
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  W = innerWidth;
  H = innerHeight;
  canvas.width = W * DPR;
  canvas.height = H * DPR;
  canvas.style.width = W + "px";
  canvas.style.height = H + "px";
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}
