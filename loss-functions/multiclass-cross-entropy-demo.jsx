const MCCE = window.MulticlassCrossEntropyMath;

function ProbabilitySlider({ animal, index, onChange, probability }) {
  return (
    <label className="grid gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden="true">{animal.emoji}</span>
          <div>
            <div className="font-semibold text-slate-900">{animal.label}</div>
            <div className="text-xs text-slate-500">예측 확률</div>
          </div>
        </div>
        <output className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
          {MCCE.formatProbability(probability)}
        </output>
      </div>
      <input
        type="range"
        min="0"
        max="0.99"
        step="0.01"
        value={probability}
        onChange={(event) => onChange(index, Number(event.target.value))}
      />
    </label>
  );
}

function LossBreakdownCard({ lossBreakdown, probabilities }) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-5 lg:p-6">
      <div className="mb-4">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Step By Step</p>
        <h3 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-900">계산 과정</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          슬라이더를 움직이면 각 클래스의 로그값이 바뀌고, 정답 클래스만 남긴 뒤 합산해서 손실을 계산합니다.
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">1단계 - 로그 씌우기</div>
          <div className="mt-2 font-mono text-sm text-slate-700">
            [{probabilities.map((value) => MCCE.formatProbability(value)).join(", ")}] → [
            {lossBreakdown.loggedProbabilities.map((value) => MCCE.formatSigned(value)).join(", ")}]
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">2단계 - 정답 곱하기</div>
          <div className="mt-2 font-mono text-sm text-slate-700">
            × [{lossBreakdown.oneHot.join(", ")}] → [
            {lossBreakdown.multipliedValues.map((value) => MCCE.formatSigned(value)).join(", ")}]
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">3단계 - 합산</div>
          <div className="mt-2 font-mono text-sm text-slate-700">{MCCE.formatSigned(lossBreakdown.summedValue)}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">4단계 - 부호 뒤집기</div>
          <div className="mt-2 font-mono text-sm text-slate-700">{MCCE.formatSigned(lossBreakdown.loss)}</div>
        </div>
      </div>
    </section>
  );
}

function LossCurveCard({ graph }) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Loss Curve</p>
        <h3 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-900">-ln(x) 그래프</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          정답 클래스 확률이 낮아질수록 손실이 절벽처럼 치솟는 위치를 눈으로 확인할 수 있습니다.
        </p>
      </div>

      <svg viewBox={`0 0 ${graph.width} ${graph.height}`} className="w-full overflow-visible">
        <path
          d={`M ${graph.padding.left} ${graph.height - graph.padding.bottom} L ${graph.width - graph.padding.right} ${graph.height - graph.padding.bottom}`}
          stroke="#cbd5e1"
          strokeWidth="1.5"
        />
        <path
          d={`M ${graph.padding.left} ${graph.padding.top} L ${graph.padding.left} ${graph.height - graph.padding.bottom}`}
          stroke="#cbd5e1"
          strokeWidth="1.5"
        />
        <path d={graph.path} fill="none" stroke="#0ea5e9" strokeWidth="4" strokeLinecap="round" />
        <line
          x1={graph.point.x}
          y1={graph.height - graph.padding.bottom}
          x2={graph.point.x}
          y2={graph.point.y}
          stroke="#f97316"
          strokeDasharray="5 5"
          strokeWidth="2"
        />
        <circle cx={graph.point.x} cy={graph.point.y} r="7" fill="#ef4444" />
        <text x={graph.point.x + 10} y={graph.point.y - 10} fill="#0f172a" fontSize="12" fontWeight="700">
          ({MCCE.formatProbability(graph.point.probability ?? 0)}, {graph.point.loss.toFixed(2)})
        </text>
        <text x={graph.padding.left - 10} y={graph.padding.top + 4} fill="#64748b" fontSize="12" textAnchor="end">
          5
        </text>
        <text x={graph.padding.left - 10} y={graph.height - graph.padding.bottom + 4} fill="#64748b" fontSize="12" textAnchor="end">
          0
        </text>
        <text x={graph.padding.left} y={graph.height - graph.padding.bottom + 22} fill="#64748b" fontSize="12">
          0.01
        </text>
        <text x={graph.width - graph.padding.right} y={graph.height - graph.padding.bottom + 22} fill="#64748b" fontSize="12" textAnchor="end">
          1.00
        </text>
      </svg>

      <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-700">
        <div className="font-semibold text-slate-900">학습 포인트</div>
        <ul className="mt-2 grid gap-2">
          <li>손실 = 정답 클래스에 준 확률의 -log 입니다.</li>
          <li>정답 확률이 낮아질수록 손실이 빠르게 커집니다.</li>
          <li>모델 학습은 이 손실을 줄이는 방향으로 진행됩니다.</li>
        </ul>
      </div>
    </section>
  );
}

function MulticlassCrossEntropyDemo() {
  const [selectedAnswerIndex, setSelectedAnswerIndex] = React.useState(0);
  const [probabilities, setProbabilities] = React.useState(MCCE.DEFAULT_PROBABILITIES);

  const lossBreakdown = React.useMemo(
    () => MCCE.computeLossBreakdown(probabilities, selectedAnswerIndex),
    [probabilities, selectedAnswerIndex],
  );
  const graph = React.useMemo(() => {
    const model = MCCE.buildGraphModel(lossBreakdown.selectedProbability);
    return {
      ...model,
      point: {
        ...model.point,
        probability: lossBreakdown.selectedProbability,
      },
    };
  }, [lossBreakdown.selectedProbability]);
  const lossTone = MCCE.getLossTone(lossBreakdown.loss);
  const selectedAnimal = MCCE.ANIMALS[selectedAnswerIndex];

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Multiclass Loss Demo</p>
          <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-900">AI 채점기</h2>
          <p className="mt-3 leading-7 text-slate-600">
            모델이 동물 사진을 보고 어떤 동물인지 확률로 답했다고 가정합니다. 정답 클래스에 준 확률만 골라
            <span className="font-semibold text-slate-900"> -log </span>
            를 씌우면 손실이 됩니다.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
          <div className="font-semibold text-slate-900">현재 정답 클래스</div>
          <div className="mt-1 text-base font-semibold text-blue-700">{selectedAnimal.label}</div>
          <div className="mt-1">원-핫 벡터 [{lossBreakdown.oneHot.join(", ")}]</div>
        </div>
      </div>

      <section className="grid gap-8 xl:grid-cols-[minmax(0,1.12fr)_minmax(320px,0.88fr)]">
        <div className="grid gap-6">
          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">정답 선택</h3>
                  <p className="mt-1 text-sm text-slate-600">하나를 누르면 원-핫 벡터가 바뀝니다.</p>
                </div>
                <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                  [{lossBreakdown.oneHot.join(", ")}]
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {MCCE.ANIMALS.map((animal, index) => {
                  const isActive = selectedAnswerIndex === index;

                  return (
                    <button
                      key={animal.id}
                      type="button"
                      onClick={() => setSelectedAnswerIndex(index)}
                      className={`grid place-items-center gap-2 rounded-2xl border px-4 py-5 text-center transition ${
                        isActive
                          ? "border-sky-500 bg-sky-50 text-sky-900 shadow-[inset_0_0_0_1px_rgba(14,165,233,0.1)]"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <span className="text-4xl" aria-hidden="true">{animal.emoji}</span>
                      <span className="font-semibold">{animal.label}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-slate-900">예측 확률 조절</h3>
                <p className="mt-1 text-sm text-slate-600">
                  한 슬라이더를 움직이면 나머지 둘이 자동 보정되어 합이 항상 1이 됩니다.
                </p>
              </div>

              <div className="grid gap-4">
                {MCCE.ANIMALS.map((animal, index) => (
                  <ProbabilitySlider
                    key={animal.id}
                    animal={animal}
                    index={index}
                    probability={probabilities[index]}
                    onChange={(targetIndex, nextValue) => {
                      setProbabilities((currentProbabilities) =>
                        MCCE.rebalanceProbabilities(currentProbabilities, targetIndex, nextValue),
                      );
                    }}
                  />
                ))}
              </div>

              <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                현재 예측 벡터: [{" "}
                {probabilities.map((value) => MCCE.formatProbability(value)).join(", ")}
                {" ]"}
              </div>
            </section>
          </div>

          <LossBreakdownCard lossBreakdown={lossBreakdown} probabilities={probabilities} />
        </div>

        <div className="grid gap-6">
          <section
            className="rounded-[28px] border px-5 py-5 shadow-sm"
            style={{ backgroundColor: lossTone.background, borderColor: lossTone.border, color: lossTone.text }}
          >
            <p className="text-sm font-bold uppercase tracking-[0.2em]">최종 손실값</p>
            <div className="mt-3 text-5xl font-black tracking-[-0.05em]">{lossBreakdown.loss.toFixed(3)}</div>
            <p className="mt-3 text-sm">
              정답인 <span className="font-semibold">{selectedAnimal.label}</span>에
              {` ${MCCE.formatProbability(lossBreakdown.selectedProbability)}`}를 줬기 때문에 손실이 이 값으로 계산됩니다.
            </p>
          </section>

          <LossCurveCard graph={graph} />
        </div>
      </section>
    </div>
  );
}

window.MulticlassCrossEntropyDemo = MulticlassCrossEntropyDemo;
