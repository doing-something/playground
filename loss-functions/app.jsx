const LOSS_TABS = [
  {
    description: "동물 사진 분류 시나리오로 multiclass cross-entropy loss를 단계별로 따라갑니다.",
    id: "mcce",
    title: "Multiclass Cross-Entropy Loss",
  },
  {
    description: "이메일 스팸 분류 시나리오로 binary cross-entropy loss를 단계별로 따라갑니다.",
    id: "bce",
    title: "Binary Cross-Entropy Loss",
  },
  {
    description: "집값 예측 시나리오로 RMSE 계산 과정을 단계별로 따라갑니다.",
    id: "rmse",
    title: "Root Mean Square Error (RMSE)",
  },
];

function getTabFromHash() {
  const tab = window.location.hash.replace(/^#/, "");
  return LOSS_TABS.some((item) => item.id === tab) ? tab : null;
}

function updateHash(tab, mode) {
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

function PlaceholderScreen({ screen }) {
  return (
    <>
      <div className="screen-header">
        <p className="screen-kicker">Loss Function</p>
        <h2>{screen.title}</h2>
        <p className="screen-description">{screen.description}</p>
      </div>

      <div className="screen-grid">
        <section className="placeholder-card">
          <h3>입력 영역</h3>
          <p>{screen.inputHint}</p>
        </section>
        <section className="placeholder-card placeholder-stage">
          <h3>시각화 / 결과 영역</h3>
          <p>{screen.resultHint}</p>
        </section>
      </div>
    </>
  );
}

function LossFunctionsPage() {
  const [activeTab, setActiveTab] = React.useState(() => getTabFromHash() ?? "mcce");
  const activeScreen = LOSS_TABS.find((tab) => tab.id === activeTab) ?? LOSS_TABS[0];

  React.useEffect(() => {
    updateHash(activeTab, "replace");
  }, []);

  React.useEffect(() => {
    const syncTabFromLocation = () => {
      const tab = getTabFromHash();
      if (tab) {
        setActiveTab(tab);
      }
    };

    window.addEventListener("hashchange", syncTabFromLocation);
    window.addEventListener("popstate", syncTabFromLocation);

    return () => {
      window.removeEventListener("hashchange", syncTabFromLocation);
      window.removeEventListener("popstate", syncTabFromLocation);
    };
  }, []);

  function selectTab(tab) {
    setActiveTab(tab);
    updateHash(tab, "push");
  }

  return (
    <main className="mx-auto my-10 w-[min(1180px,calc(100%-32px))] rounded-3xl border border-slate-200/70 bg-white/85 p-7 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
      <a className="mb-4 inline-block text-sm text-blue-700 hover:underline" href="../">
        ← 데모 목록으로
      </a>
      <h1 className="mb-3 text-[clamp(2rem,4vw,2.8rem)] font-bold tracking-[-0.04em] text-slate-900">
        Loss Functions
      </h1>
      <p className="mb-6 max-w-3xl leading-7 text-slate-600">
        Multiclass cross-entropy, binary cross-entropy, RMSE를 각각 조작해 보며,
        손실이 어떻게 계산되고 왜 커지거나 작아지는지 눈으로 익히는 학습용 페이지입니다.
      </p>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <div className="flex flex-wrap border-b border-slate-200" role="tablist" aria-label="Loss functions">
          {LOSS_TABS.map((tab) => {
            const isActive = tab.id === activeTab;

            return (
              <button
                key={tab.id}
                className={`border-b-2 px-5 py-4 text-sm font-semibold transition ${
                  isActive
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                }`}
                id={`tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                onClick={() => selectTab(tab.id)}
              >
                {tab.title}
              </button>
            );
          })}
        </div>

        <section
          className="grid gap-8 p-6 lg:p-8"
          id={`panel-${activeScreen.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeScreen.id}`}
        >
          {activeScreen.id === "mcce"
            ? <window.MulticlassCrossEntropyDemo />
            : activeScreen.id === "bce"
              ? <window.BinaryCrossEntropyDemo />
              : activeScreen.id === "rmse"
                ? <window.RMSEDemo />
                : <PlaceholderScreen screen={activeScreen} />}
        </section>
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("react-root")).render(<LossFunctionsPage />);
