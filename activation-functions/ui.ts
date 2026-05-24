import { ACTIVATION_TABS, type ActivationState, type ActivationTab } from "./data.js";

type ChangeHandler = (nextState: ActivationState) => void;

export function setupActivationControls(initialState: ActivationState, onChange: ChangeHandler) {
  const tabButtons = getTabButtons();
  const screens = getTabPanels();
  const inputs = getInputs();
  let state = { ...initialState };

  writeInputs(state, inputs);
  updateTabs(state.tab, tabButtons, screens);
  updateHash(state.tab, "replace");

  for (const button of tabButtons) {
    button.addEventListener("click", () => {
      const tab = button.dataset.tab as ActivationTab;
      state = applyTabChange(state, tab, tabButtons, screens, onChange);
      updateHash(tab, "push");
    });
  }

  const syncTabFromLocation = () => {
    const tab = getTabFromHash();
    if (!tab || tab === state.tab) {
      return;
    }

    state = applyTabChange(state, tab, tabButtons, screens, onChange);
  };

  window.addEventListener("hashchange", syncTabFromLocation);
  window.addEventListener("popstate", syncTabFromLocation);

  inputs.sigmoidX.addEventListener("input", () => {
    state = { ...state, sigmoidX: readNumberInput(inputs.sigmoidX) };
    writeInputs(state, inputs);
    onChange(state);
  });

  inputs.reluX.addEventListener("input", () => {
    state = { ...state, reluX: readNumberInput(inputs.reluX) };
    writeInputs(state, inputs);
    onChange(state);
  });

  inputs.softmaxA.addEventListener("input", () => {
    state = { ...state, softmaxLogits: [readNumberInput(inputs.softmaxA), state.softmaxLogits[1], state.softmaxLogits[2]] };
    writeInputs(state, inputs);
    onChange(state);
  });

  inputs.softmaxB.addEventListener("input", () => {
    state = { ...state, softmaxLogits: [state.softmaxLogits[0], readNumberInput(inputs.softmaxB), state.softmaxLogits[2]] };
    writeInputs(state, inputs);
    onChange(state);
  });

  inputs.softmaxC.addEventListener("input", () => {
    state = { ...state, softmaxLogits: [state.softmaxLogits[0], state.softmaxLogits[1], readNumberInput(inputs.softmaxC)] };
    writeInputs(state, inputs);
    onChange(state);
  });
}

function applyTabChange(
  state: ActivationState,
  tab: ActivationTab,
  tabButtons: HTMLButtonElement[],
  screens: HTMLElement[],
  onChange: ChangeHandler,
): ActivationState {
  const nextState = { ...state, tab };
  updateTabs(tab, tabButtons, screens);
  onChange(nextState);

  return nextState;
}

type ActivationInputs = {
  reluX: HTMLInputElement;
  reluXValue: HTMLOutputElement;
  sigmoidX: HTMLInputElement;
  sigmoidXValue: HTMLOutputElement;
  softmaxA: HTMLInputElement;
  softmaxAValue: HTMLOutputElement;
  softmaxB: HTMLInputElement;
  softmaxBValue: HTMLOutputElement;
  softmaxC: HTMLInputElement;
  softmaxCValue: HTMLOutputElement;
};

function updateTabs(
  activeTab: ActivationTab,
  buttons: HTMLButtonElement[],
  panels: HTMLElement[],
) {
  for (const button of buttons) {
    const isActive = button.dataset.tab === activeTab;
    button.classList.toggle("tab-button-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  }

  for (const panel of panels) {
    const isActive = panel.dataset.panel === activeTab;
    panel.classList.toggle("tab-screen-active", isActive);
    panel.hidden = !isActive;
  }
}

function updateHash(tab: ActivationTab, mode: "push" | "replace") {
  const nextHash = `#${tab}`;
  if (window.location.hash === nextHash) {
    return;
  }

  const nextUrl = `${window.location.pathname}${window.location.search}${nextHash}`;
  if (mode === "replace") {
    window.history.replaceState(null, "", nextUrl);
    return;
  }

  window.history.pushState(null, "", nextUrl);
}

function getTabFromHash(): ActivationTab | null {
  const tab = window.location.hash.replace(/^#/, "");

  return ACTIVATION_TABS.includes(tab as ActivationTab)
    ? tab as ActivationTab
    : null;
}

function getTabButtons() {
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>(".tab-button"));
  if (buttons.length === 0) {
    throw new Error("탭 버튼을 찾을 수 없습니다.");
  }

  return buttons;
}

function getTabPanels() {
  const panels = Array.from(document.querySelectorAll<HTMLElement>(".activation-panel"));
  if (panels.length === 0) {
    throw new Error("탭 패널을 찾을 수 없습니다.");
  }

  return panels;
}

function getInputs(): ActivationInputs {
  return {
    sigmoidX: getRequiredInput("sigmoid-x"),
    sigmoidXValue: getRequiredOutput("sigmoid-x-value"),
    reluX: getRequiredInput("relu-x"),
    reluXValue: getRequiredOutput("relu-x-value"),
    softmaxA: getRequiredInput("softmax-a"),
    softmaxAValue: getRequiredOutput("softmax-a-value"),
    softmaxB: getRequiredInput("softmax-b"),
    softmaxBValue: getRequiredOutput("softmax-b-value"),
    softmaxC: getRequiredInput("softmax-c"),
    softmaxCValue: getRequiredOutput("softmax-c-value"),
  };
}

function writeInputs(state: ActivationState, inputs: ActivationInputs) {
  inputs.sigmoidX.value = formatNumber(state.sigmoidX);
  inputs.sigmoidXValue.textContent = formatNumber(state.sigmoidX);
  inputs.reluX.value = formatNumber(state.reluX);
  inputs.reluXValue.textContent = formatNumber(state.reluX);
  inputs.softmaxA.value = formatNumber(state.softmaxLogits[0]);
  inputs.softmaxAValue.textContent = formatNumber(state.softmaxLogits[0]);
  inputs.softmaxB.value = formatNumber(state.softmaxLogits[1]);
  inputs.softmaxBValue.textContent = formatNumber(state.softmaxLogits[1]);
  inputs.softmaxC.value = formatNumber(state.softmaxLogits[2]);
  inputs.softmaxCValue.textContent = formatNumber(state.softmaxLogits[2]);
}

function readNumberInput(input: HTMLInputElement): number {
  return Number.isNaN(input.valueAsNumber) ? 0 : input.valueAsNumber;
}

function formatNumber(value: number): string {
  return Number.isInteger(value)
    ? String(value)
    : value.toFixed(3).replace(/\.?0+$/, "");
}

function getRequiredInput(id: string): HTMLInputElement {
  const element = document.getElementById(id);
  if (!(element instanceof HTMLInputElement)) {
    throw new Error(`${id} 입력 요소를 찾을 수 없습니다.`);
  }

  return element;
}

function getRequiredOutput(id: string): HTMLOutputElement {
  const element = document.getElementById(id);
  if (!(element instanceof HTMLOutputElement)) {
    throw new Error(`${id} 출력 요소를 찾을 수 없습니다.`);
  }

  return element;
}
