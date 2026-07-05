import type { SceneFactory } from "../engine/types.js";
import { makeCover } from "./cover.js";
import { makeRelativity } from "./relativity.js";
import { makeQuanta } from "./quanta.js";
import { makeCosmos } from "./cosmos.js";
import { makeParticles } from "./particles.js";
import { makeGrains } from "./grains.js";
import { makeHeat } from "./heat.js";
import { makeOurselves } from "./ourselves.js";

export { LESSONS } from "./lessons.js";
export type { LessonMeta } from "./lessons.js";

export function createSceneFactories(onCoverBegin: () => void): SceneFactory[] {
  return [
    () => makeCover(onCoverBegin),
    makeRelativity,
    makeQuanta,
    makeCosmos,
    makeParticles,
    makeGrains,
    makeHeat,
    makeOurselves,
  ];
}
