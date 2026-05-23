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
    description: "이 탭 안에 회귀용 입력과 시각화 콘텐츠를 추가하면 됩니다.",
    id: "rmse",
    inputHint: "예: 예측값 배열, 실제값 배열",
    resultHint: "예: 오차 막대, 제곱 오차 평균, 루트 결과",
    title: "Root Mean Square Error (RMSE)",
  },
];

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
  const [activeTab, setActiveTab] = React.useState("mcce");
  const activeScreen = LOSS_TABS.find((tab) => tab.id === activeTab) ?? LOSS_TABS[0];

  return (
    <main className="mx-auto my-10 w-[min(1180px,calc(100%-32px))] rounded-3xl border border-slate-200/70 bg-white/85 p-7 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
      <a className="mb-4 inline-block text-sm text-blue-700 hover:underline" href="../">
        ← 데모 목록으로
      </a>
      <h1 className="mb-3 text-[clamp(2rem,4vw,2.8rem)] font-bold tracking-[-0.04em] text-slate-900">
        Loss Functions
      </h1>
      <p className="mb-6 max-w-3xl leading-7 text-slate-600">
        손실 함수의 핵심 직관을 눈으로 확인하는 학습용 페이지입니다.
        첫 탭에서는 동물 분류 시나리오로 multiclass cross-entropy loss를 직접 조작해 볼 수 있습니다.
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
                onClick={() => setActiveTab(tab.id)}
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
              : <PlaceholderScreen screen={activeScreen} />}
        </section>
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("react-root")).render(<LossFunctionsPage />);
