import type { Step } from "./data.js";

type StepsChangeHandler = (steps: Step[]) => void;

/**
 * 변환 단계 목록 UI를 초기화한다.
 *
 * 단계 추가/삭제 시에만 카드들을 다시 렌더링하고, 단계 안의 값 변경 때는
 * input 포커스 유지를 위해 카드 재렌더링 없이 상태와 콜백만 갱신한다.
 */
export function setupStepControls(
  initialSteps: Step[],
  onStepsChange: StepsChangeHandler,
) {
  let steps: Step[] = initialSteps.map((s) => ({ ...s }));
  const container = getStepsContainer();

  const renderCards = () => {
    container.replaceChildren();
    steps.forEach((step, index) => {
      container.appendChild(createStepCard(step, index, updateStep, removeStep));
    });
  };

  const updateStep = (index: number, updated: Step) => {
    steps = steps.map((s, i) => (i === index ? updated : s));
    onStepsChange(steps);
  };

  const removeStep = (index: number) => {
    steps = steps.filter((_, i) => i !== index);
    renderCards();
    onStepsChange(steps);
  };

  const addStep = (step: Step) => {
    steps = [...steps, step];
    renderCards();
    onStepsChange(steps);
  };

  getRequiredButton("add-translate").addEventListener("click", () =>
    addStep({ type: "translate", tx: 1, ty: 0 }),
  );
  getRequiredButton("add-rotate").addEventListener("click", () =>
    addStep({ type: "rotate", degrees: 30 }),
  );
  getRequiredButton("add-scale").addEventListener("click", () =>
    addStep({ type: "scale", sx: 2, sy: 1 }),
  );

  renderCards();
  onStepsChange(steps);
}

function createStepCard(
  step: Step,
  index: number,
  onUpdate: (index: number, updated: Step) => void,
  onRemove: (index: number) => void,
): HTMLElement {
  const card = document.createElement("div");
  card.className = "step-card";

  const head = document.createElement("div");
  head.className = "step-head";

  const title = document.createElement("strong");
  title.textContent = `${index + 1}. ${stepLabel(step)}`;
  head.appendChild(title);

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.className = "step-remove";
  removeButton.textContent = "×";
  removeButton.setAttribute("aria-label", "단계 삭제");
  removeButton.addEventListener("click", () => onRemove(index));
  head.appendChild(removeButton);

  card.appendChild(head);

  const inputs = document.createElement("div");
  inputs.className = "step-inputs";

  switch (step.type) {
    case "translate":
      inputs.appendChild(
        makeNumberInput("tx", step.tx, (value) =>
          onUpdate(index, { ...step, tx: value }),
        ),
      );
      inputs.appendChild(
        makeNumberInput("ty", step.ty, (value) =>
          onUpdate(index, { ...step, ty: value }),
        ),
      );
      break;
    case "rotate":
      inputs.appendChild(
        makeNumberInput("도", step.degrees, (value) =>
          onUpdate(index, { ...step, degrees: value }),
        ),
      );
      break;
    case "scale":
      inputs.appendChild(
        makeNumberInput("sx", step.sx, (value) =>
          onUpdate(index, { ...step, sx: value }),
        ),
      );
      inputs.appendChild(
        makeNumberInput("sy", step.sy, (value) =>
          onUpdate(index, { ...step, sy: value }),
        ),
      );
      break;
  }

  card.appendChild(inputs);

  return card;
}

function makeNumberInput(
  label: string,
  value: number,
  onChange: (next: number) => void,
): HTMLElement {
  const wrapper = document.createElement("label");
  wrapper.className = "step-input";

  const labelText = document.createElement("span");
  labelText.textContent = label;
  wrapper.appendChild(labelText);

  const input = document.createElement("input");
  input.type = "number";
  input.step = "any";
  input.value = String(value);
  input.addEventListener("input", () => {
    const next = input.valueAsNumber;
    onChange(Number.isNaN(next) ? 0 : next);
  });
  wrapper.appendChild(input);

  return wrapper;
}

function stepLabel(step: Step): string {
  switch (step.type) {
    case "translate":
      return "translate";
    case "rotate":
      return "rotate";
    case "scale":
      return "scale";
  }
}

function getStepsContainer(): HTMLElement {
  const element = document.getElementById("step-list");
  if (!(element instanceof HTMLElement)) {
    throw new Error("step-list 요소를 찾을 수 없습니다.");
  }
  return element;
}

function getRequiredButton(id: string): HTMLButtonElement {
  const element = document.getElementById(id);
  if (!(element instanceof HTMLButtonElement)) {
    throw new Error(`${id} 버튼을 찾을 수 없습니다.`);
  }
  return element;
}
