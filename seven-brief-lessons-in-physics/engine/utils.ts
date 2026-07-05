export const TAU = Math.PI * 2;

export const COPPER = ['#f2c18d', '#e39a5b', '#c87d3f', '#a05c2a', '#8a4a20', '#f7d9b0', '#d98e4a'];

export const rnd = (a: number, b: number): number => a + Math.random() * (b - a);

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const copper = (): string => pick(COPPER);

export const clamp = (v: number, a: number, b: number): number => (v < a ? a : v > b ? b : v);

// sum of three uniforms → approximate standard normal, centered at 0
export const gauss = (): number => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
