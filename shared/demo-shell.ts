type DemoShellOptions = {
  title: string;
  intro: string;
  controls: string;
  canvas: string;
  analysis?: string;
  backLinkHref?: string;
};

/**
 * 데모 페이지 외곽 마크업(main, back-link, h1, intro, layout 그리드)을 #app에 채운다.
 *
 * 각 데모 index.html은 `<div id="app"></div>`와 `<script>`만 두고,
 * main.ts에서 이 함수를 호출해 슬롯별 HTML을 주입한다.
 *
 * 인자 문자열은 모두 데모 내부 하드코딩에서만 들어온다는 전제로 그대로 innerHTML에 쓴다.
 * 사용자 입력은 여기로 흘려보내지 말 것.
 */
export function renderDemoShell(options: DemoShellOptions) {
  const root = document.getElementById("app");
  if (!(root instanceof HTMLElement)) {
    throw new Error(
      "#app 컨테이너 요소를 찾을 수 없습니다. <div id=\"app\"></div>를 body에 두세요.",
    );
  }

  const backLink = options.backLinkHref ?? "../";
  root.innerHTML = `
    <main>
      <a class="back-link" href="${backLink}">← 데모 목록으로</a>
      <h1>${options.title}</h1>
      <p>${options.intro}</p>
      <div class="layout">
        ${options.controls}
        ${options.canvas}
        ${options.analysis ?? ""}
      </div>
    </main>
  `;
}

type Matrix2x2FormOptions = {
  formId?: string;
  inputPrefix?: string;
};

/**
 * 2x2 행렬 입력칸 4개(a, b, c, d)를 담은 form 마크업을 만든다.
 *
 * inputPrefix를 지정하면 id가 `${prefix}-a` 형태가 되어 한 페이지에
 * 여러 행렬 form을 둘 수 있다(예: 합성 데모의 A와 B).
 */
export function matrix2x2FormHTML(options: Matrix2x2FormOptions = {}): string {
  const formId = options.formId ?? "matrix-form";
  const prefix = options.inputPrefix ?? "matrix";

  return `
    <form id="${formId}" class="matrix-form">
      <div class="matrix-row">
        ${matrix2x2CellHTML(`${prefix}-a`, "a")}
        ${matrix2x2CellHTML(`${prefix}-b`, "b")}
      </div>
      <div class="matrix-row">
        ${matrix2x2CellHTML(`${prefix}-c`, "c")}
        ${matrix2x2CellHTML(`${prefix}-d`, "d")}
      </div>
    </form>
  `;
}

function matrix2x2CellHTML(id: string, label: string): string {
  return `
    <label class="matrix-cell" for="${id}">
      ${label}
      <input id="${id}" name="${id}" type="number" step="any">
    </label>
  `;
}
