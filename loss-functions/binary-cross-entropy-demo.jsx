const BCE = window.BinaryCrossEntropyMath;

function BinaryProbabilitySlider({ probability, onChange }) {
  return (
    <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">예측 확률 조절</h3>
        <p className="mt-1 text-sm text-slate-600">
          모델이 이 메일을 스팸이라고 판단한 확률 <span className="font-semibold text-slate-900">p</span>를 조절합니다.
        </p>
      </div>

      <label className="grid gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="font-semibold text-slate-900">이 메일이 스팸일 확률</div>
            <div className="text-xs text-slate-500">sigmoid 출력값 p</div>
          </div>
          <output className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
            {BCE.formatProbability(probability)}
          </output>
        </div>
        <input
          type="range"
          min="0.01"
          max="0.99"
          step="0.01"
          value={probability}
          onChange={(event) => onChange(Number(event.target.value))}
        />
      </label>

      <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
        현재 모델 출력: 스팸 확률 p = {BCE.formatProbability(probability)}, 정상 확률 1-p = {BCE.formatProbability(1 - probability)}
      </div>
    </section>
  );
}

function BinaryLossBreakdownCard({ breakdown, probability }) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-5 lg:p-6">
      <div className="mb-4">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Step By Step</p>
        <h3 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-900">계산 과정</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          BCE는 <span className="font-semibold text-slate-900">y·ln(p)</span>와
          <span className="font-semibold text-slate-900"> (1-y)·ln(1-p)</span> 두 항을 더한 뒤 부호를 뒤집습니다.
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">1단계 - y · ln(p)</div>
          <div className="mt-2 font-mono text-sm text-slate-700">
            {breakdown.label} × ln({BCE.formatProbability(probability)}) = {BCE.formatSigned(breakdown.stepOneValue)}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">2단계 - (1-y) · ln(1-p)</div>
          <div className="mt-2 font-mono text-sm text-slate-700">
            {breakdown.oneMinusLabel} × ln({BCE.formatProbability(breakdown.oneMinusProbability)}) = {BCE.formatSigned(breakdown.stepTwoValue)}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">3단계 - 합산</div>
          <div className="mt-2 font-mono text-sm text-slate-700">{BCE.formatSigned(breakdown.summedValue)}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">4단계 - 부호 뒤집기</div>
          <div className="mt-2 font-mono text-sm text-slate-700">{BCE.formatSigned(breakdown.loss)}</div>
        </div>
      </div>
    </section>
  );
}

function BinaryLossCurveCard({ graph, label }) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Loss Curve</p>
        <h3 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-900">-ln(x) 그래프</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          정답이 스팸이면 <span className="font-semibold text-slate-900">p</span> 위치를,
          정답이 정상이면 <span className="font-semibold text-slate-900">1-p</span> 위치를 곡선 위에 표시합니다.
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
          ({label}, {graph.point.loss.toFixed(2)})
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
          <li>binary cross-entropy는 정답이 1이면 -ln(p), 0이면 -ln(1-p)를 씁니다.</li>
          <li>둘 중 하나의 항만 살아남는 구조라서 식이 깔끔하게 단순화됩니다.</li>
          <li>sigmoid 출력 + binary cross-entropy가 이진 분류의 기본 조합입니다.</li>
        </ul>
      </div>
    </section>
  );
}

function BinaryCrossEntropyDemo() {
  const [label, setLabel] = React.useState(1);
  const [probability, setProbability] = React.useState(BCE.DEFAULT_PROBABILITY);

  const breakdown = React.useMemo(
    () => BCE.computeLossBreakdown(label, probability),
    [label, probability],
  );
  const graph = React.useMemo(() => {
    const model = BCE.buildGraphModel(breakdown.keptProbability);
    return {
      ...model,
      point: {
        ...model.point,
        probability: breakdown.keptProbability,
      },
    };
  }, [breakdown.keptProbability]);
  const lossTone = BCE.getLossTone(breakdown.loss);
  const selectedClass = BCE.CLASSES.find((item) => item.y === label) ?? BCE.CLASSES[0];

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Binary Loss Demo</p>
          <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-900">스팸 메일 채점기</h2>
          <p className="mt-3 leading-7 text-slate-600">
            모델이 이메일을 보고 스팸일 확률 <span className="font-semibold text-slate-900">p</span> 하나를 출력했다고 가정합니다.
            binary cross-entropy는 정답이 1이면 <span className="font-semibold text-slate-900">-ln(p)</span>를,
            정답이 0이면 <span className="font-semibold text-slate-900">-ln(1-p)</span>를 손실로 사용합니다.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
          <div className="font-semibold text-slate-900">현재 정답 레이블</div>
          <div className="mt-1 text-base font-semibold text-blue-700">{selectedClass.shortLabel}</div>
          <div className="mt-1">y = {label}, 1-y = {breakdown.oneMinusLabel}</div>
        </div>
      </div>

      <section className="grid gap-8 xl:grid-cols-[minmax(0,1.12fr)_minmax(320px,0.88fr)]">
        <div className="grid gap-6">
          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">정답 선택</h3>
                  <p className="mt-1 text-sm text-slate-600">이 이메일의 실제 레이블 y를 선택합니다.</p>
                </div>
                <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                  y = {label}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {BCE.CLASSES.map((item) => {
                  const isActive = label === item.y;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setLabel(item.y)}
                      className={`grid gap-2 rounded-2xl border px-4 py-5 text-left transition ${
                        isActive
                          ? "border-sky-500 bg-sky-50 text-sky-900 shadow-[inset_0_0_0_1px_rgba(14,165,233,0.1)]"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <span className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">label</span>
                      <span className="text-lg font-semibold">{item.label}</span>
                      <span className="text-sm text-slate-500">y = {item.y}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            <BinaryProbabilitySlider probability={probability} onChange={setProbability} />
          </div>

          <BinaryLossBreakdownCard breakdown={breakdown} probability={probability} />
        </div>

        <div className="grid gap-6">
          <section
            className="rounded-[28px] border px-5 py-5 shadow-sm"
            style={{ backgroundColor: lossTone.background, borderColor: lossTone.border, color: lossTone.text }}
          >
            <p className="text-sm font-bold uppercase tracking-[0.2em]">최종 손실값</p>
            <div className="mt-3 text-5xl font-black tracking-[-0.05em]">{breakdown.loss.toFixed(3)}</div>
            <p className="mt-3 text-sm">
              정답이 <span className="font-semibold">{selectedClass.shortLabel}</span>이라서
              살아남는 항은 <span className="font-semibold">{breakdown.keptProbabilityLabel}</span> 입니다.
              현재 값 {BCE.formatProbability(breakdown.keptProbability)}에 대해 손실이 계산됩니다.
            </p>
          </section>

          <BinaryLossCurveCard
            graph={graph}
            label={`${breakdown.keptProbabilityLabel}=${BCE.formatProbability(breakdown.keptProbability)}`}
          />
        </div>
      </section>
    </div>
  );
}

window.BinaryCrossEntropyDemo = BinaryCrossEntropyDemo;
