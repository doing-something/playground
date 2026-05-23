const LOSS_TABS = [
  {
    description: "이 탭 안에 다중 분류용 입력과 시각화 콘텐츠를 추가하면 됩니다.",
    id: "mcce",
    inputHint: "예: 클래스 logits, 정답 클래스 선택",
    resultHint: "예: 확률 분포, 손실 계산 과정, 최종 loss 값",
    title: "Multi-class Cross-Entropy Loss",
  },
  {
    description: "이 탭 안에 이진 분류용 입력과 시각화 콘텐츠를 추가하면 됩니다.",
    id: "bce",
    inputHint: "예: 예측 확률, 정답 라벨(0/1)",
    resultHint: "예: BCE 공식, log penalty 곡선, loss 값",
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

function LossFunctionsPage() {
  const [activeTab, setActiveTab] = React.useState("mcce");
  const activeScreen = LOSS_TABS.find((tab) => tab.id === activeTab) ?? LOSS_TABS[0];

  return (
    <main className="mx-auto my-10 w-[min(1180px,calc(100%-32px))] rounded-3xl border border-slate-200/70 bg-white/85 p-7 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
      <a className="back-link" href="../">← 데모 목록으로</a>
      <h1>Loss Functions</h1>
      <p>
        Loss function 학습용 페이지 골격입니다.
        Multi-class cross-entropy, binary cross-entropy, RMSE를 탭으로 분리해 두었습니다.
      </p>

      <section className="loss-shell">
        <div className="tab-list" role="tablist" aria-label="Loss functions">
          {LOSS_TABS.map((tab) => {
            const isActive = tab.id === activeTab;

            return (
              <button
                key={tab.id}
                className={`tab-button ${isActive ? "tab-button-active" : ""}`}
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
          className="tab-screen"
          id={`panel-${activeScreen.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeScreen.id}`}
        >
          <div className="screen-header">
            <p className="screen-kicker">Loss Function</p>
            <h2>{activeScreen.title}</h2>
            <p className="screen-description">{activeScreen.description}</p>
          </div>

          <div className="screen-grid">
            <section className="placeholder-card">
              <h3>입력 영역</h3>
              <p>{activeScreen.inputHint}</p>
            </section>
            <section className="placeholder-card placeholder-stage">
              <h3>시각화 / 결과 영역</h3>
              <p>{activeScreen.resultHint}</p>
            </section>
          </div>
        </section>
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("react-root")).render(<LossFunctionsPage />);
