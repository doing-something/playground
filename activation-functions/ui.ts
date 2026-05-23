import type { ActivationTab } from "./data.js";

type ChangeHandler = (nextTab: ActivationTab) => void;

export function setupActivationControls(initialTab: ActivationTab, onChange: ChangeHandler) {
  const tabButtons = getTabButtons();
  const screens = getTabPanels();

  updateTabs(initialTab, tabButtons, screens);

  for (const button of tabButtons) {
    button.addEventListener("click", () => {
      const tab = button.dataset.tab as ActivationTab;
      initialTab = tab;
      updateTabs(tab, tabButtons, screens);
      onChange(tab);
    });
  }
}

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

function getTabButtons() {
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>(".tab-button"));
  if (buttons.length === 0) {
    throw new Error("탭 버튼을 찾을 수 없습니다.");
  }

  return buttons;
}

function getTabPanels() {
  const panels = Array.from(document.querySelectorAll<HTMLElement>(".tab-screen"));
  if (panels.length === 0) {
    throw new Error("탭 패널을 찾을 수 없습니다.");
  }

  return panels;
}
