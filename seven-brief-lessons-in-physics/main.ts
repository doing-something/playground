import { createEngine } from "./engine/loop.js";
import { createSceneFactories } from "./scenes/index.js";
import { setupUI } from "./ui.js";

function main(): void {
  const engine = createEngine();
  const factories = createSceneFactories(() => engine.switchTo(1));
  const ui = setupUI(engine, factories.length);
  engine.start(factories, (idx) => ui.onSceneChange(idx));
}

main();
