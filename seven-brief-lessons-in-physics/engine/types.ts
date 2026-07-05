export interface Pointer {
  x: number;
  y: number;
  px: number;
  py: number;
  down: boolean;
}

export interface Scene {
  trail: number;
  enter(): void;
  update(dt: number, t: number): void;
  draw(t: number): void;
  pointerdown?(): void;
  pointermove?(): void;
  pointerup?(): void;
}

export type SceneFactory = () => Scene;
