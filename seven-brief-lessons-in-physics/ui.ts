import { canvas } from "./engine/state.js";
import type { Engine } from "./engine/loop.js";
import { LESSONS } from "./scenes/lessons.js";

const infoEl = document.getElementById("info") as HTMLElement;
const coverEl = document.getElementById("cover-title") as HTMLElement;
const dotsEl = document.getElementById("dots") as HTMLElement;
const prevBtn = document.getElementById("prev") as HTMLButtonElement;
const nextBtn = document.getElementById("next") as HTMLButtonElement;
const numEl = document.getElementById("num") as HTMLElement;
const titleEl = document.getElementById("title") as HTMLElement;
const subEl = document.getElementById("sub") as HTMLElement;
const hintEl = document.getElementById("hint") as HTMLElement;

export interface UIController {
  onSceneChange(sceneIdx: number): void;
}

export function setupUI(engine: Engine, sceneCount: number): UIController {
  for (let i = 0; i < sceneCount; i++) {
    const b = document.createElement("button");
    b.addEventListener("click", () => engine.switchTo(i));
    dotsEl.appendChild(b);
  }

  prevBtn.addEventListener("click", () => engine.switchTo(engine.getSceneIndex() - 1));
  nextBtn.addEventListener("click", () => engine.switchTo(engine.getSceneIndex() + 1));
  addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") engine.switchTo(engine.getSceneIndex() + 1);
    if (e.key === "ArrowLeft") engine.switchTo(engine.getSceneIndex() - 1);
  });

  function onSceneChange(sceneIdx: number): void {
    const L = LESSONS[sceneIdx];
    coverEl.style.opacity = sceneIdx === 0 ? "1" : "0";
    infoEl.style.opacity = sceneIdx === 0 ? "0" : "1";
    if (sceneIdx > 0) {
      numEl.textContent = L.num;
      titleEl.textContent = L.title;
      subEl.textContent = L.sub;
      hintEl.textContent = L.hint;
    }
    prevBtn.disabled = sceneIdx === 0;
    nextBtn.disabled = sceneIdx === sceneCount - 1;
    Array.from(dotsEl.children).forEach((d, i) => d.classList.toggle("on", i === sceneIdx));
    canvas.style.cursor = sceneIdx === 0 ? "pointer" : "default";
  }

  return { onSceneChange };
}
