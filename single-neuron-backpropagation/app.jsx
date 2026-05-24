const {
  DATASET,
  DEFAULT_PARAMS,
  applyGradientStep,
  buildEpochTrace,
  formatFixed,
} = window.SingleNeuronBackpropMath;

function formatPercent(value) {
  return `${Math.round(value * 100)}%`;
}

function describeCase(row) {
  const absError = Math.abs(row.error);

  if (row.error > 0.2) {
    return {
      caseLabel: "예측이 꽤 높음",
      lesson: "출력을 내려야 하는 경우를 보기 좋습니다.",
      tone: "orange",
    };
  }

  if (row.error > 0) {
    return {
      caseLabel: "예측이 조금 높음",
      lesson: "출력이 조금만 내려가도 되는 경우입니다.",
      tone: "amber",
    };
  }

  if (absError < 0.05) {
    return {
      caseLabel: "거의 맞음",
      lesson: "이미 꽤 맞는 경우라 수정 폭이 작아집니다.",
      tone: "emerald",
    };
  }

  return {
    caseLabel: "예측이 낮음",
    lesson: "출력을 올려야 하는 경우를 보기 좋습니다.",
    tone: "sky",
  };
}

function caseToneClasses(tone, active) {
  const palette = {
    amber: active
      ? "border-amber-300 bg-amber-50 text-amber-900"
      : "border-slate-200 bg-white text-slate-700 hover:border-amber-200 hover:bg-amber-50/60",
    emerald: active
      ? "border-emerald-300 bg-emerald-50 text-emerald-900"
      : "border-slate-200 bg-white text-slate-700 hover:border-emerald-200 hover:bg-emerald-50/60",
    orange: active
      ? "border-orange-300 bg-orange-50 text-orange-900"
      : "border-slate-200 bg-white text-slate-700 hover:border-orange-200 hover:bg-orange-50/60",
    sky: active
      ? "border-sky-300 bg-sky-50 text-sky-900"
      : "border-slate-200 bg-white text-slate-700 hover:border-sky-200 hover:bg-sky-50/60",
  };

  return palette[tone];
}

function shapeOfMatrix(matrix) {
  return `(${matrix.length}, ${matrix[0]?.length ?? 0})`;
}

function shapeOfVector(vector) {
  return `(${vector.length},)`;
}

function vectorToText(values, digits = 4) {
  return `[${values.map((value) => formatFixed(value, digits)).join(", ")}]`;
}

function matrixRowToText(values, digits = 2) {
  return `[${values.map((value) => formatFixed(value, digits)).join(", ")}]`;
}

function StageOverview() {
  const steps = [
    {
      label: "1. Predict",
      text: "현재 weight와 bias로 예측을 만듭니다.",
    },
    {
      label: "2. Measure",
      text: "예측이 정답보다 높은지 낮은지 봅니다.",
    },
    {
      label: "3. Adjust Direction",
      text: "오차를 줄이려면 어느 방향으로 고쳐야 하는지 계산합니다.",
    },
    {
      label: "4. Update",
      text: "weight와 bias를 조금 바꾸고 다시 예측합니다.",
    },
  ];

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-xs font-bold uppercase tracking-[0.18em] text-sky-700">핵심 흐름</div>
      <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-900">single-neuron backpropagation은 이 네 단계의 흐름으로 이해하는 것이 가장 쉽습니다</h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
        먼저 큰 흐름을 잡고, 그다음 각 단계에서 어떤 계산이 일어나는지 내려가 보면 훨씬 덜 복잡하게 느껴집니다.
      </p>
      <div className="mt-5 grid gap-3 lg:grid-cols-4">
        {steps.map((step) => (
          <div key={step.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <div className="text-sm font-bold text-slate-900">{step.label}</div>
            <div className="mt-2 text-sm leading-6 text-slate-600">{step.text}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SampleChooser({ rows, selectedId, onSelect }) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-xs font-bold uppercase tracking-[0.18em] text-sky-700">사례 선택</div>
      <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-900">값이 달라지면 어떤 학습 상황이 생기는지 비교해 봅니다</h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
        여기서 고르는 것은 학생 자체가 아니라 <span className="font-semibold text-slate-900">관찰할 학습 사례</span>입니다.
        어떤 샘플은 예측이 너무 높고, 어떤 샘플은 거의 맞고, 어떤 샘플은 출력을 올려야 합니다.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {rows.map((row) => {
        const isActive = row.id === selectedId;
        const detail = describeCase(row);
        return (
          <button
            key={row.id}
            type="button"
            onClick={() => onSelect(row.id)}
            className={`rounded-2xl border px-4 py-4 text-left transition ${caseToneClasses(detail.tone, isActive)}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{row.name}</div>
              <div className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold">{detail.caseLabel}</div>
            </div>
            <div className="mt-3 text-sm">x = [{formatFixed(row.hours, 1)}, {formatFixed(row.attendance, 2)}]</div>
            <div className="mt-1 text-sm">정답 y = {row.label}, 예측 {formatFixed(row.probability, 4)}</div>
            <div className="mt-3 text-sm leading-6">{detail.lesson}</div>
          </button>
        );
      })}
      </div>
    </section>
  );
}

function ParameterPanel({ onParamChange, params }) {
  const controls = [
    ["weightHours", "공부 시간 weight", -2, 4, "0.0001"],
    ["weightAttendance", "출석률 weight", -1, 6, "0.0001"],
    ["bias", "bias", -8, 2, "0.0001"],
    ["learningRate", "learning rate", 0.05, 1, "0.01"],
  ];

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-xs font-bold uppercase tracking-[0.18em] text-sky-700">파라미터</div>
      <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-900">현재 뉴런 상태</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {controls.map(([key, label, min, max, step]) => (
          <label key={key} className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="font-semibold text-slate-900">{label}</div>
              <div className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-700">
                {formatFixed(params[key], key === "learningRate" ? 2 : 4)}
              </div>
            </div>
            <input
              type="range"
              min={String(min)}
              max={String(max)}
              step={step}
              value={params[key]}
              onChange={(event) => onParamChange(key, Number(event.target.value))}
            />
          </label>
        ))}
      </div>
    </section>
  );
}

function FormulaFocusPanel({ params, selectedRow, trace }) {
  const predictionTooHigh = selectedRow.error > 0;
  const directionText = predictionTooHigh ? "예측이 정답보다 높습니다." : "예측이 정답보다 낮습니다.";
  const outputTarget = predictionTooHigh ? "출력이 내려가야 합니다." : "출력이 올라가야 합니다.";
  const weightDirection = predictionTooHigh ? "줄어드는 방향" : "커지는 방향";
  const arrow = predictionTooHigh ? "↓" : "↑";
  const detail = describeCase(selectedRow);
  const hoursContribution = selectedRow.hours * params.weightHours;
  const attendanceContribution = selectedRow.attendance * params.weightAttendance;
  const sensitivityStep = 0.1;
  const hoursImpact = selectedRow.hours * sensitivityStep;
  const attendanceImpact = selectedRow.attendance * sensitivityStep;
  const biasImpact = sensitivityStep;

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-xs font-bold uppercase tracking-[0.18em] text-sky-700">한 눈에 보기</div>
      <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-900">선택한 사례에서 지금 어떤 식이 적용되고, 무엇이 바뀌어야 하는가</h2>
      <div className="mt-5 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">현재 사례</div>
                <div className="mt-2 text-xl font-bold text-slate-900">{selectedRow.name}</div>
              </div>
              <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700">{detail.caseLabel}</div>
            </div>
            <div className="mt-4 grid gap-2 text-sm text-slate-700">
              <div>x = [{formatFixed(selectedRow.hours, 1)}, {formatFixed(selectedRow.attendance, 2)}]</div>
              <div>정답 y = {selectedRow.label}</div>
              <div>배울 포인트: {detail.lesson}</div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
            <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">현재 적용 식</div>
            <div className="mt-4 grid gap-3 font-mono text-sm leading-7 text-slate-800">
              <div>
                z = ({formatFixed(selectedRow.hours, 1)} × {formatFixed(params.weightHours, 4)}) + ({formatFixed(selectedRow.attendance, 2)} × {formatFixed(params.weightAttendance, 4)}) + {formatFixed(params.bias, 4)}
              </div>
              <div className="text-lg font-bold text-slate-900">= {formatFixed(hoursContribution, 4)} + {formatFixed(attendanceContribution, 4)} + {formatFixed(params.bias, 4)} = {formatFixed(selectedRow.z, 4)}</div>
              <div>y_pred = sigmoid({formatFixed(selectedRow.z, 4)}) = {formatFixed(selectedRow.probability, 4)}</div>
              <div>error = y_pred - y = {formatFixed(selectedRow.probability, 4)} - {selectedRow.label} = {formatFixed(selectedRow.error, 4)}</div>
              <div>sample loss = (y_pred - y)^2 = {formatFixed(selectedRow.sampleMSE, 6)}</div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">공부 시간 기여</div>
              <div className="mt-2 text-sm text-slate-700">{formatFixed(selectedRow.hours, 1)} × {formatFixed(params.weightHours, 4)}</div>
              <div className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-900">{formatFixed(hoursContribution, 4)}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">출석률 기여</div>
              <div className="mt-2 text-sm text-slate-700">{formatFixed(selectedRow.attendance, 2)} × {formatFixed(params.weightAttendance, 4)}</div>
              <div className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-900">{formatFixed(attendanceContribution, 4)}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">bias 기여</div>
              <div className="mt-2 text-sm text-slate-700">그대로 더해짐</div>
              <div className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-900">{formatFixed(params.bias, 4)}</div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
            <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">값을 올리면 무엇이 바뀌나</div>
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 px-4 py-4">
                <div className="text-sm font-semibold text-slate-900">weight_hours + 0.1</div>
                <div className="mt-2 text-sm text-slate-700">이 샘플의 z는 {formatFixed(hoursImpact, 4)} 만큼 {hoursImpact >= 0 ? "증가" : "감소"}합니다.</div>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-4">
                <div className="text-sm font-semibold text-slate-900">weight_attendance + 0.1</div>
                <div className="mt-2 text-sm text-slate-700">이 샘플의 z는 {formatFixed(attendanceImpact, 4)} 만큼 {attendanceImpact >= 0 ? "증가" : "감소"}합니다.</div>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-4">
                <div className="text-sm font-semibold text-slate-900">bias + 0.1</div>
                <div className="mt-2 text-sm text-slate-700">이 샘플의 z는 {formatFixed(biasImpact, 4)} 만큼 증가합니다.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
            <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">지금 해석</div>
            <div className={`mt-3 text-3xl font-black tracking-[-0.04em] ${predictionTooHigh ? "text-orange-600" : "text-sky-700"}`}>
              {formatFixed(selectedRow.error, 4)}
            </div>
            <div className="mt-3 text-sm leading-6 text-slate-700">
              {directionText} {outputTarget}
            </div>
            <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
              이 샘플에서는 입력값이 모두 양수이므로, 현재 예측이 너무 높다면 weight와 bias가 {weightDirection}으로 가야 하고,
              예측이 너무 낮다면 반대로 가야 합니다.
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
            <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">수정 방향 요약</div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 px-4 py-4 text-center">
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">weight_hours</div>
                <div className={`mt-2 text-4xl font-black ${predictionTooHigh ? "text-orange-600" : "text-sky-700"}`}>{arrow}</div>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-4 text-center">
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">weight_attendance</div>
                <div className={`mt-2 text-4xl font-black ${predictionTooHigh ? "text-orange-600" : "text-sky-700"}`}>{arrow}</div>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-4 text-center">
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">bias</div>
                <div className={`mt-2 text-4xl font-black ${predictionTooHigh ? "text-orange-600" : "text-sky-700"}`}>{arrow}</div>
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
              gradient는 이 방향을 수치로 정밀하게 계산한 것입니다. 지금은 먼저 “왜 이쪽으로 움직여야 하는가”를 직관적으로 이해하는 것이 더 중요합니다.
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
            <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">전체 학습 상태</div>
            <div className="mt-3 text-sm text-slate-700">전체 데이터셋 mean MSE = {formatFixed(trace.meanMSE, 6)}</div>
            <div className="mt-2 text-sm text-slate-600">샘플 하나를 보며 직관을 잡되, 업데이트는 전체 평균 손실을 기준으로 계산합니다.</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function UpdateResultPanel({ selectedAfterRow, selectedBeforeRow, updateResult }) {
  const improved = updateResult.meanMSEAfter < updateResult.meanMSEBefore;
  const sampleImproved = selectedAfterRow.sampleMSE < selectedBeforeRow.sampleMSE;

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-xs font-bold uppercase tracking-[0.18em] text-sky-700">4. Update</div>
      <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-900">한 번 업데이트하면 실제로 어떻게 달라지는가</h2>
      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr_0.9fr]">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
          <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Before</div>
          <div className="mt-3 grid gap-2 text-sm text-slate-700">
            <div>z = {formatFixed(selectedBeforeRow.z, 4)}</div>
            <div>y_pred = {formatFixed(selectedBeforeRow.probability, 4)}</div>
            <div>sample error = {formatFixed(selectedBeforeRow.error, 4)}</div>
            <div>sample MSE = {formatFixed(selectedBeforeRow.sampleMSE, 6)}</div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
          <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">After 1 Update</div>
          <div className="mt-3 grid gap-2 text-sm text-slate-700">
            <div>z = {formatFixed(selectedAfterRow.z, 4)}</div>
            <div>y_pred = {formatFixed(selectedAfterRow.probability, 4)}</div>
            <div>sample error = {formatFixed(selectedAfterRow.error, 4)}</div>
            <div>sample MSE = {formatFixed(selectedAfterRow.sampleMSE, 6)}</div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
          <div className={`rounded-full px-4 py-2 text-sm font-semibold ${improved ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700"}`}>
            {improved ? "Loss decreased" : "Loss did not decrease"}
          </div>
          <div className="mt-4 grid gap-2 text-sm text-slate-700">
            <div>mean MSE before = {formatFixed(updateResult.meanMSEBefore, 6)}</div>
            <div>mean MSE after = {formatFixed(updateResult.meanMSEAfter, 6)}</div>
          </div>
          <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
            backpropagation의 목적은 이 한 번의 업데이트가 <span className="font-semibold text-slate-900">전체 데이터셋 기준</span> loss를 줄이는 방향으로 가도록 만드는 것입니다.
            {sampleImproved
              ? " 선택한 샘플의 손실도 이번에는 함께 줄었습니다."
              : " 그래서 선택한 샘플 하나의 손실은 잠깐 늘어날 수도 있지만, 전체 평균은 더 좋아질 수 있습니다."}
          </div>
        </div>
      </div>
    </section>
  );
}

function DetailsPanel({ trace, updateResult }) {
  const codeLines = [
    "z = features @ weights + bias",
    "y_pred = torch.sigmoid(z)",
    "mse = torch.mean((y_pred - labels) ** 2)",
    "error = y_pred - labels",
    "sigmoid_grad = y_pred * (1 - y_pred)",
    "error_signal = (2 / n) * error * sigmoid_grad",
    "grad_w = features.T @ error_signal",
    "grad_b = error_signal.sum()",
    "weights = weights - learning_rate * grad_w",
    "bias = bias - learning_rate * grad_b.item()",
  ];

  return (
    <details className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <summary className="cursor-pointer list-none text-lg font-bold text-slate-900">
        자세히 보기: 수식, 벡터, 코드 연결
      </summary>
      <div className="mt-5 grid gap-6">
        <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Tensor Shapes</div>
            <div className="mt-3 grid gap-2 font-mono text-sm text-slate-700">
              <div>features shape = {shapeOfMatrix(trace.features)}</div>
              <div>labels shape = {shapeOfVector(trace.labels)}</div>
              <div>weights shape = {shapeOfVector(trace.weights)}</div>
            </div>
            <div className="mt-4 rounded-2xl bg-white px-4 py-4 font-mono text-sm text-slate-700">
              features = {trace.features.map((row) => matrixRowToText(row)).join(", ")}
              <br />
              labels = {vectorToText(trace.labels, 1)}
              <br />
              weights = {vectorToText(trace.weights, 4)}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-slate-950 p-4 text-slate-100">
            <div className="text-xs font-bold uppercase tracking-[0.14em] text-sky-300">Implementation View</div>
            <pre className="mt-3 overflow-x-auto text-sm leading-7 text-slate-300">
              {codeLines.map((line, index) => (
                <div key={line}>
                  <span className="mr-3 inline-block w-6 text-right text-slate-500">{index + 1}</span>
                  <span>{line}</span>
                </div>
              ))}
            </pre>
          </section>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">핵심 backprop 계산</div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 px-4 py-4 font-mono text-sm leading-7 text-slate-700">
              error = {vectorToText(trace.error, 6)}
              <br />
              sigmoid_grad = {vectorToText(trace.sigmoidGrad, 6)}
              <br />
              error_signal = {vectorToText(trace.errorSignal, 6)}
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-4 font-mono text-sm leading-7 text-slate-700">
              grad_w = {vectorToText(trace.gradW, 6)}
              <br />
              grad_b = {formatFixed(trace.gradB, 6)}
              <br />
              mean MSE: {formatFixed(updateResult.meanMSEBefore, 6)} -> {formatFixed(updateResult.meanMSEAfter, 6)}
            </div>
          </div>
        </section>
      </div>
    </details>
  );
}

function Controls({ onApplyUpdate, onReset }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="text-sm text-slate-500">메인 화면에서는 직관을 먼저 보고, 자세한 수식과 코드는 아래에서 확인합니다.</div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onReset}
          className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={onApplyUpdate}
          className="rounded-full bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
        >
          Apply 1 update
        </button>
      </div>
    </div>
  );
}

function CompactWorkbench({ afterRow, flashKeys, onApplyUpdate, onParamChange, onReset, onSelectSample, params, rows, selectedId, selectedRow, updateResult }) {
  const detail = describeCase(selectedRow);
  const predictionTooHigh = selectedRow.error > 0;
  const direction = predictionTooHigh ? "내려야 함" : "올려야 함";
  const arrow = predictionTooHigh ? "↓" : "↑";
  const directionTone = predictionTooHigh ? "text-orange-600" : "text-sky-700";
  const hoursContribution = selectedRow.hours * params.weightHours;
  const attendanceContribution = selectedRow.attendance * params.weightAttendance;
  const sampleImproved = afterRow.sampleMSE < selectedRow.sampleMSE;
  const controls = [
    ["weightHours", "공부 시간 가중치", "w_hours", -2, 4, 0.1],
    ["weightAttendance", "출석률 가중치", "w_att", -1, 6, 0.1],
    ["bias", "bias", "b", -8, 2, 0.1],
    ["learningRate", "learning rate", "lr", 0.05, 1, 0.05],
  ];
  function nudgeParam(key, min, max, amount) {
    const nextValue = Math.min(max, Math.max(min, params[key] + amount));
    onParamChange(key, Number(nextValue.toFixed(4)));
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 grid gap-3 xl:grid-cols-[minmax(300px,460px)_1fr]">
        <div>
          <label className="grid gap-1">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700">관찰할 입력 선택</span>
            <div className="relative">
              <select
                className="w-full appearance-none rounded-lg border border-sky-300 bg-sky-50 px-3 py-2 pr-10 text-sm font-semibold text-slate-900 shadow-sm"
                value={selectedId}
                onChange={(event) => onSelectSample(event.target.value)}
              >
                {rows.map((row) => {
                  const rowDetail = describeCase(row);
                  return (
                    <option key={row.id} value={row.id}>
                      {rowDetail.caseLabel} | 입력 x=[{formatFixed(row.hours, 1)}, {formatFixed(row.attendance, 2)}], 정답 y={row.label}
                    </option>
                  );
                })}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-sky-700">▼</span>
            </div>
          </label>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {controls.map(([key, label, symbol, min, max, step]) => {
            const isFlashing = flashKeys.includes(key);

            return (
              <div
                key={key}
                className={`grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-lg border px-2 py-2 transition-colors duration-300 ${
                  isFlashing ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-white"
                }`}
              >
                <button
                  type="button"
                  onClick={() => nudgeParam(key, min, max, -step)}
                  className="h-7 w-7 rounded-md border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50"
                  aria-label={`${label} decrease`}
                >
                  -
                </button>
                <div className="min-w-24 text-center">
                  <div className="font-mono text-xs font-bold text-slate-900">{symbol}</div>
                  <div className="text-xs text-slate-500">{label}</div>
                  <div className={`font-mono text-sm font-bold transition-colors duration-300 ${isFlashing ? "text-emerald-700" : "text-slate-900"}`}>
                    {formatFixed(params[key], key === "learningRate" ? 2 : 3)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => nudgeParam(key, min, max, step)}
                  className="h-7 w-7 rounded-md border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50"
                  aria-label={`${label} increase`}
                >
                  +
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_300px]">
        <div className="grid gap-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Input -> Formula -> Output</div>
                <h2 className="mt-1 text-xl font-bold text-slate-900">값이 어디에 들어가고 무엇을 바꾸는지</h2>
              </div>
              <div className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-700">{detail.caseLabel}</div>
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              <div className="rounded-lg bg-white p-3">
                <div className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Input</div>
                <div className="mt-2 font-mono text-sm text-slate-900">x = [{formatFixed(selectedRow.hours, 1)}, {formatFixed(selectedRow.attendance, 2)}]</div>
                <div className="mt-1 font-mono text-sm text-slate-900">y = {selectedRow.label}</div>
              </div>
              <div className="rounded-lg bg-white p-3 lg:col-span-2">
                <div className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Applied Formula</div>
                <div className="mt-2 grid gap-2 font-mono text-sm leading-7 text-slate-900">
                  <div>
                    z = x_hours × w_hours + x_att × w_att + b
                  </div>
                  <div className="font-sans text-xs text-slate-500">입력값과 가중치를 곱해 뉴런의 점수 z를 만듭니다.</div>
                  <div>
                    y_pred = σ(z) = 1 / (1 + e<sup>-z</sup>)
                  </div>
                  <div className="font-sans text-xs text-slate-500">점수 z를 0과 1 사이의 예측값으로 바꿉니다.</div>
                  <div>
                    loss = (y_pred - y)<sup>2</sup>
                  </div>
                  <div className="font-sans text-xs text-slate-500">예측값이 정답에서 얼마나 떨어졌는지 잽니다.</div>
                  <div className="border-t border-slate-200 pt-2">
                  z = ({formatFixed(selectedRow.hours, 1)} x {formatFixed(params.weightHours, 3)}) + ({formatFixed(selectedRow.attendance, 2)} x {formatFixed(params.weightAttendance, 3)}) + {formatFixed(params.bias, 3)}
                  </div>
                  <div>
                    z = {formatFixed(hoursContribution, 3)} + {formatFixed(attendanceContribution, 3)} + {formatFixed(params.bias, 3)} = <span className="font-bold">{formatFixed(selectedRow.z, 4)}</span>
                  </div>
                  <div>
                    y_pred = σ({formatFixed(selectedRow.z, 4)}) = <span className="font-bold">{formatFixed(selectedRow.probability, 4)}</span>
                  </div>
                  <div>
                    loss = ({formatFixed(selectedRow.probability, 4)} - {selectedRow.label})<sup>2</sup> = <span className="font-bold">{formatFixed(selectedRow.sampleMSE, 6)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 grid gap-3 lg:grid-cols-4">
              <div className="rounded-lg bg-white p-3">
                <div className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">공부 시간 영향</div>
                <div className="mt-2 font-mono text-sm leading-6 text-slate-900">
                  x_hours × w_hours
                  <br />
                  {formatFixed(selectedRow.hours, 1)} x {formatFixed(params.weightHours, 3)} = <span className="font-bold">{formatFixed(hoursContribution, 4)}</span>
                </div>
                <div className="mt-2 border-t border-slate-200 pt-2 font-mono text-xs text-slate-500">
                  w_hours +0.1 -> z +{formatFixed(selectedRow.hours * 0.1, 3)}
                </div>
              </div>
              <div className="rounded-lg bg-white p-3">
                <div className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">출석률 영향</div>
                <div className="mt-2 font-mono text-sm leading-6 text-slate-900">
                  x_att × w_att
                  <br />
                  {formatFixed(selectedRow.attendance, 2)} x {formatFixed(params.weightAttendance, 3)} = <span className="font-bold">{formatFixed(attendanceContribution, 4)}</span>
                </div>
                <div className="mt-2 border-t border-slate-200 pt-2 font-mono text-xs text-slate-500">
                  w_att +0.1 -> z +{formatFixed(selectedRow.attendance * 0.1, 3)}
                </div>
              </div>
              <div className="rounded-lg bg-white p-3">
                <div className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">bias contribution</div>
                <div className="mt-2 font-mono text-sm leading-6 text-slate-900">
                  + b
                  <br />
                  <span className="font-bold">{formatFixed(params.bias, 4)}</span>
                </div>
                <div className="mt-2 border-t border-slate-200 pt-2 font-mono text-xs text-slate-500">
                  Δz = Δb = 0.100
                </div>
              </div>
              <div className="rounded-lg bg-white p-3">
                <div className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Error</div>
                <div className="mt-2 font-mono text-sm leading-6 text-slate-900">
                  y_pred - y
                  <br />
                  {formatFixed(selectedRow.probability, 4)} - {selectedRow.label} = <span className={`font-bold ${directionTone}`}>{formatFixed(selectedRow.error, 4)}</span>
                </div>
                <div className="mt-2 border-t border-slate-200 pt-2 text-xs text-slate-500">출력 {direction}</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="grid gap-3 lg:grid-cols-[1fr_auto_1fr]">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Before</div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                  <div><span className="text-slate-500">pred</span><br /><span className="font-mono font-bold">{formatFixed(selectedRow.probability, 4)}</span></div>
                  <div><span className="text-slate-500">error</span><br /><span className="font-mono font-bold">{formatFixed(selectedRow.error, 4)}</span></div>
                  <div><span className="text-slate-500">loss</span><br /><span className="font-mono font-bold">{formatFixed(selectedRow.sampleMSE, 6)}</span></div>
                </div>
              </div>
              <div className={`flex items-center justify-center text-3xl font-black ${directionTone}`}>{arrow}</div>
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">After 1 Update</div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                  <div><span className="text-slate-500">pred</span><br /><span className="font-mono font-bold">{formatFixed(afterRow.probability, 4)}</span></div>
                  <div><span className="text-slate-500">error</span><br /><span className="font-mono font-bold">{formatFixed(afterRow.error, 4)}</span></div>
                  <div><span className="text-slate-500">loss</span><br /><span className="font-mono font-bold">{formatFixed(afterRow.sampleMSE, 6)}</span></div>
                </div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-3 text-sm">
              <span className="text-slate-600">mean MSE: {formatFixed(updateResult.meanMSEBefore, 6)} -> {formatFixed(updateResult.meanMSEAfter, 6)}</span>
              <span className={sampleImproved ? "text-emerald-700" : "text-orange-700"}>
                {sampleImproved ? "선택 사례도 개선됨" : "선택 사례는 나빠질 수 있음, 전체 평균 기준으로 업데이트"}
              </span>
            </div>
          </div>
        </div>

        <aside className="grid gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Direction</div>
            <div className={`mt-3 text-5xl font-black ${directionTone}`}>{arrow}</div>
            <div className="mt-3 text-sm leading-6 text-slate-700">
              예측이 정답보다 {predictionTooHigh ? "높아서" : "낮아서"} 출력이 {direction}입니다.
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-lg bg-slate-50 p-2">공부 시간<br /><span className={`text-2xl font-black ${directionTone}`}>{arrow}</span></div>
              <div className="rounded-lg bg-slate-50 p-2">출석률<br /><span className={`text-2xl font-black ${directionTone}`}>{arrow}</span></div>
              <div className="rounded-lg bg-slate-50 p-2">bias<br /><span className={`text-2xl font-black ${directionTone}`}>{arrow}</span></div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">현재값 -> 적용값</div>
            <div className="mt-3 grid gap-2 font-mono text-sm text-slate-800">
              <div className="flex items-center justify-between gap-3">
                <span>w_hours</span>
                <span>{formatFixed(params.weightHours, 3)} → {formatFixed(updateResult.after.weightHours, 3)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>w_att</span>
                <span>{formatFixed(params.weightAttendance, 3)} → {formatFixed(updateResult.after.weightAttendance, 3)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>b</span>
                <span>{formatFixed(params.bias, 3)} → {formatFixed(updateResult.after.bias, 3)}</span>
              </div>
            </div>
            <div className="mt-3 text-xs leading-5 text-slate-500">
              버튼을 누르면 오른쪽 값이 현재 뉴런 값이 됩니다.
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onReset}
              className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              초기값으로 되돌리기
            </button>
            <button
              type="button"
              onClick={onApplyUpdate}
              className="rounded-lg bg-sky-600 px-4 py-3 text-sm font-semibold text-white hover:bg-sky-700"
            >
              이 업데이트 적용
            </button>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-3 text-xs leading-5 text-slate-600">
            누르면 예상된 업데이트를 현재 <span className="font-mono font-semibold text-slate-900">w_hours</span>, <span className="font-mono font-semibold text-slate-900">w_att</span>, <span className="font-mono font-semibold text-slate-900">b</span>에 반영합니다.
          </div>
        </aside>
      </div>
    </section>
  );
}

function SingleNeuronBackpropDemo() {
  const [params, setParams] = React.useState(DEFAULT_PARAMS);
  const [selectedSampleId, setSelectedSampleId] = React.useState(DATASET[1].id);
  const [flashKeys, setFlashKeys] = React.useState([]);

  const trace = React.useMemo(
    () => buildEpochTrace(params),
    [params.bias, params.learningRate, params.weightAttendance, params.weightHours],
  );
  const updateResult = React.useMemo(
    () => applyGradientStep(params),
    [params.bias, params.learningRate, params.weightAttendance, params.weightHours],
  );
  const afterTrace = React.useMemo(
    () => buildEpochTrace(updateResult.after),
    [updateResult.after.bias, updateResult.after.learningRate, updateResult.after.weightAttendance, updateResult.after.weightHours],
  );

  const selectedBeforeRow = trace.rows.find((row) => row.id === selectedSampleId) ?? trace.rows[0];
  const selectedAfterRow = afterTrace.rows.find((row) => row.id === selectedSampleId) ?? afterTrace.rows[0];

  function updateParam(key, value) {
    setParams((current) => ({ ...current, [key]: value }));
  }

  function applyOneUpdate() {
    setParams(updateResult.after);
    setFlashKeys(["weightHours", "weightAttendance", "bias"]);
  }

  function resetDemo() {
    setParams(DEFAULT_PARAMS);
    setSelectedSampleId(DATASET[1].id);
    setFlashKeys([]);
  }

  React.useEffect(() => {
    if (flashKeys.length === 0) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setFlashKeys([]), 900);
    return () => window.clearTimeout(timeoutId);
  }, [flashKeys]);

  return (
    <main className="mx-auto my-10 w-[min(1280px,calc(100%-32px))] rounded-3xl border border-slate-200/70 bg-white/90 p-7 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
      <a className="mb-4 inline-block text-sm text-sky-700 hover:underline" href="../">
        ← 데모 목록으로
      </a>
      <h1 className="mb-3 text-[clamp(2rem,4vw,2.8rem)] font-bold tracking-[-0.04em] text-slate-900">
        How a Single Neuron Learns
      </h1>
      <p className="mb-3 max-w-4xl leading-7 text-slate-600">
        이 데모는 단일 뉴런이 어떻게 예측을 만들고, 오차를 측정하고, 그 오차를 줄이는 방향으로 weight와 bias를 수정하는지
        이해하도록 돕습니다.
      </p>
      <p className="mb-6 max-w-4xl text-sm leading-6 text-slate-500">
        입력, 파라미터, 적용 식, 출력, 업데이트 결과를 한 화면에서 같이 봅니다.
      </p>

      <div className="grid gap-6">
        <CompactWorkbench
          afterRow={selectedAfterRow}
          flashKeys={flashKeys}
          onApplyUpdate={applyOneUpdate}
          onParamChange={updateParam}
          onReset={resetDemo}
          onSelectSample={setSelectedSampleId}
          params={params}
          rows={trace.rows}
          selectedId={selectedSampleId}
          selectedRow={selectedBeforeRow}
          updateResult={updateResult}
        />
      </div>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("react-root")).render(<SingleNeuronBackpropDemo />);
