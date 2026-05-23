const RMSE = window.RMSEMath;

function PriceSliderCard({ house, index, prediction, onChange }) {
  return (
    <label className="grid gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-semibold text-slate-900">{house.label}</div>
          <div className="text-xs text-slate-500">실제 가격 {RMSE.formatBillions(house.actualPrice)}</div>
        </div>
        <output className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
          {RMSE.formatBillions(prediction)}
        </output>
      </div>
      <input
        type="range"
        min="2.0"
        max="8.0"
        step="0.1"
        value={prediction}
        onChange={(event) => onChange(index, Number(event.target.value))}
      />
    </label>
  );
}

function ErrorBarsCard({ rows }) {
  const maxAbsError = rows.reduce((max, row) => Math.max(max, Math.abs(row.error)), 0);

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Error Bars</p>
        <h3 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-900">집별 오차 시각화</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          가운데 기준선이 실제 가격입니다. 오른쪽으로 길수록 높게 예측했고, 왼쪽으로 길수록 낮게 예측했습니다.
        </p>
      </div>

      <div className="grid gap-4">
        {rows.map((row) => {
          const bar = RMSE.buildErrorBar(row.error, maxAbsError);

          return (
            <div key={row.id} className="grid gap-2">
              <div className="flex items-center justify-between gap-3 text-sm">
                <div className="font-semibold text-slate-900">{row.label}</div>
                <div className="text-slate-600">
                  예측 {RMSE.formatBillions(row.prediction)} / 실제 {RMSE.formatBillions(row.actualPrice)} / 오차 {RMSE.formatSigned(row.error)}억
                </div>
              </div>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                <div className="relative h-4 rounded-full bg-slate-100">
                  {bar.direction === "left" ? (
                    <div
                      className="absolute right-0 top-0 h-4 rounded-full bg-orange-400"
                      style={{ width: `${bar.magnitude * 100}%` }}
                    />
                  ) : null}
                </div>
                <div className="h-6 w-[2px] bg-slate-400" />
                <div className="relative h-4 rounded-full bg-slate-100">
                  {bar.direction === "right" ? (
                    <div
                      className="absolute left-0 top-0 h-4 rounded-full bg-blue-500"
                      style={{ width: `${bar.magnitude * 100}%` }}
                    />
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function RMSEBreakdownCard({ breakdown }) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-5 lg:p-6">
      <div className="mb-4">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Step By Step</p>
        <h3 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-900">계산 과정</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          각 집의 오차를 제곱해 더한 뒤 평균을 내고, 마지막에 루트를 씌워 집값 단위로 되돌립니다.
        </p>
      </div>

      <div className="grid gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">1단계 - 오차</div>
          <div className="mt-2 grid gap-2 font-mono text-sm text-slate-700">
            {breakdown.rows.map((row) => (
              <div key={row.id}>
                {RMSE.formatBillions(row.prediction)} - {RMSE.formatBillions(row.actualPrice)} = {RMSE.formatSigned(row.error)}억
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">2단계 - 제곱</div>
          <div className="mt-2 grid gap-2 font-mono text-sm text-slate-700">
            {breakdown.rows.map((row) => (
              <div key={row.id}>
                ({RMSE.formatSigned(row.error)})² = {RMSE.formatSigned(row.squaredError)}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">3단계 - 평균</div>
          <div className="mt-2 font-mono text-sm text-slate-700">
            ({breakdown.rows.map((row) => RMSE.formatSigned(row.squaredError)).join(" + ")}) / {breakdown.rows.length} = {RMSE.formatSigned(breakdown.meanSquaredError)}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">4단계 - 루트</div>
          <div className="mt-2 font-mono text-sm text-slate-700">
            √{RMSE.formatSigned(breakdown.meanSquaredError)} = {RMSE.formatSigned(breakdown.rmse)}억
          </div>
        </div>
      </div>
    </section>
  );
}

function RMSEDemo() {
  const [predictions, setPredictions] = React.useState(RMSE.DEFAULT_PREDICTIONS);

  const breakdown = React.useMemo(() => RMSE.computeRMSEBreakdown(predictions), [predictions]);
  const lossTone = RMSE.getLossTone(breakdown.rmse);

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Regression Loss Demo</p>
          <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-900">집값 예측기</h2>
          <p className="mt-3 leading-7 text-slate-600">
            모델이 여러 집의 가격을 예측한다고 가정합니다. RMSE는 각 집의 예측과 실제 가격 차이를 제곱해 평균내고,
            마지막에 루트를 씌워 다시 <span className="font-semibold text-slate-900">억 원</span> 단위로 돌려줍니다.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
          <div className="font-semibold text-slate-900">현재 평균 제곱 오차</div>
          <div className="mt-1 text-base font-semibold text-blue-700">{RMSE.formatSigned(breakdown.meanSquaredError)}</div>
          <div className="mt-1">집 {breakdown.rows.length}채의 제곱 오차 평균</div>
        </div>
      </div>

      <section className="grid gap-8 xl:grid-cols-[minmax(0,1.12fr)_minmax(320px,0.88fr)]">
        <div className="grid gap-6">
          <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-900">예측 가격 조절</h3>
              <p className="mt-1 text-sm text-slate-600">
                각 슬라이더로 모델의 집값 예측을 바꾸면 오차와 RMSE가 실시간으로 갱신됩니다.
              </p>
            </div>

            <div className="grid gap-4">
              {RMSE.HOUSES.map((house, index) => (
                <PriceSliderCard
                  key={house.id}
                  house={house}
                  index={index}
                  prediction={predictions[index]}
                  onChange={(targetIndex, nextValue) => {
                    setPredictions((current) =>
                      current.map((value, valueIndex) =>
                        valueIndex === targetIndex ? RMSE.clamp(nextValue, 2, 8) : value,
                      ),
                    );
                  }}
                />
              ))}
            </div>
          </section>

          <ErrorBarsCard rows={breakdown.rows} />
          <RMSEBreakdownCard breakdown={breakdown} />
        </div>

        <div className="grid gap-6">
          <section
            className="rounded-[28px] border px-5 py-5 shadow-sm"
            style={{ backgroundColor: lossTone.background, borderColor: lossTone.border, color: lossTone.text }}
          >
            <p className="text-sm font-bold uppercase tracking-[0.2em]">최종 RMSE</p>
            <div className="mt-3 text-5xl font-black tracking-[-0.05em]">{breakdown.rmse.toFixed(3)}억</div>
            <p className="mt-3 text-sm">
              모든 집을 정확히 맞추면 RMSE는 0이 됩니다. 큰 오차 하나가 생기면 제곱 때문에 RMSE가 빠르게 커집니다.
            </p>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Why RMSE</p>
              <h3 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-900">학습 포인트</h3>
            </div>

            <div className="grid gap-4 text-sm leading-6 text-slate-700">
              <div className="rounded-2xl bg-slate-50 px-4 py-4">
                <div className="font-semibold text-slate-900">왜 제곱을 하나?</div>
                <p className="mt-1">
                  오차를 그냥 평균내면 높은 예측과 낮은 예측이 서로 상쇄될 수 있습니다. 제곱을 하면 모두 양수가 되고,
                  특히 큰 실수에 더 큰 벌점을 줄 수 있습니다.
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-4">
                <div className="font-semibold text-slate-900">왜 마지막에 루트를 씌우나?</div>
                <p className="mt-1">
                  제곱 오차 평균의 단위는 `억²`이라 직관적이지 않습니다. 루트를 씌우면 다시 `억 원` 단위로 돌아와서
                  모델이 평균적으로 얼마만큼 빗나가는지 읽기 쉬워집니다.
                </p>
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

window.RMSEDemo = RMSEDemo;
