const SigmoidMath = window.SigmoidMath;

/**
 * weight 슬라이더의 최솟값이다.
 * 너무 작으면 거의 평평해져 학습 포인트가 흐려지므로 0.3부터 시작한다.
 */
const WEIGHT_MIN = 0.3;

/**
 * weight 슬라이더의 최댓값이다.
 * 너무 크면 거의 계단처럼 보여서 적당한 학습 범위인 3으로 제한한다.
 */
const WEIGHT_MAX = 3;

/**
 * bias 슬라이더의 최솟값이다.
 * decision boundary를 왼쪽으로 충분히 이동시킬 수 있는 범위다.
 */
const BIAS_MIN = -15;

/**
 * bias 슬라이더의 최댓값이다.
 * decision boundary를 오른쪽으로 충분히 이동시킬 수 있는 범위다.
 */
const BIAS_MAX = 5;

/**
 * 기본 파라미터다.
 * 처음 열었을 때 데이터와 어느 정도 맞으면서도, 조정 여지가 남아 있게 잡았다.
 */
const DEFAULT_SIGMOID_STATE = {
  bias: -8.2,
  weight: 1.45,
};

/**
 * 공부 시간으로 합격 여부를 예측하는 고정 학생 데이터셋이다.
 *
 * 완전히 선형 분리되지 않도록 일부 예외 데이터를 섞어 두었다.
 * 이런 점들이 있어야 사용자가 weight를 과하게 키우거나 bias를 지나치게 옮길 때
 * 정확도가 오히려 떨어지는 현상을 체감할 수 있다.
 *
 * passed 값은 1이면 합격, 0이면 불합격이다.
 */
const STUDENTS = [
  { hours: 1.0, id: "s1", name: "학생 A", passed: 0 },
  { hours: 1.8, id: "s2", name: "학생 B", passed: 0 },
  { hours: 2.7, id: "s3", name: "학생 C", passed: 0 },
  { hours: 3.4, id: "s4", name: "학생 D", passed: 0 },
  { hours: 4.2, id: "s5", name: "학생 E", passed: 0 },
  { hours: 4.8, id: "s6", name: "학생 F", passed: 1 },
  { hours: 5.4, id: "s7", name: "학생 G", passed: 0 },
  { hours: 6.1, id: "s8", name: "학생 H", passed: 1 },
  { hours: 6.9, id: "s9", name: "학생 I", passed: 1 },
  { hours: 7.8, id: "s10", name: "학생 J", passed: 1 },
  { hours: 8.5, id: "s11", name: "학생 K", passed: 1 },
];

/**
 * 시그모이드 외 탭에 사용할 placeholder 정보다.
 */
const TAB_PLACEHOLDERS = {
  relu: {
    description: "ReLU 탭은 다음 단계에서 입력값과 꺾인 선 그래프를 추가하면 됩니다.",
    title: "ReLU",
  },
  softmax: {
    description: "Softmax 탭은 다음 단계에서 여러 logit 입력과 확률 막대 그래프를 추가하면 됩니다.",
    title: "Softmax",
  },
};

/**
 * x축 눈금 목록이다.
 * 2시간 간격으로 두면 공부 시간 변화와 decision boundary 위치를 읽기 쉽다.
 */
const X_TICKS = [0, 2, 4, 6, 8, 10];

/**
 * y축 눈금 목록이다.
 * 시그모이드 출력이 확률이므로 0부터 1까지 대표값만 사용한다.
 */
const Y_TICKS = [0, 0.25, 0.5, 0.75, 1];

/**
 * 숫자를 고정 소수점 문자열로 바꾼다.
 *
 * 학습용 UI에서는 자릿수가 과도하게 길면 수식의 흐름보다 잡음이 더 눈에 띈다.
 * 이 함수는 표시 자릿수를 통제해 값의 방향성과 의미에 집중하게 만든다.
 *
 * @param {number} value 화면에 보여줄 숫자
 * @param {number} digits 소수점 이하 자릿수
 * @returns {string} 반올림된 문자열
 */
function formatFixed(value, digits) {
  return value.toFixed(digits);
}

/**
 * 입력 확률을 설명 텍스트로 바꾼다.
 *
 * 학습용 UI에서는 숫자만 보여주는 것보다,
 * 그 숫자가 "모델이 얼마나 자신 있어 하는가"를 한 줄로 덧붙이는 편이 이해가 빠르다.
 *
 * @param {number} probability 합격 확률
 * @returns {string} 확률 해석 문장
 */
function describeConfidence(probability) {
  if (probability >= 0.8) {
    return "모델이 꽤 자신 있게 합격으로 보고 있습니다.";
  }

  if (probability >= 0.5) {
    return "합격 쪽으로 기울어 있지만 경계에 비교적 가깝습니다.";
  }

  if (probability >= 0.2) {
    return "불합격 쪽이지만 아직 경계와 아주 멀지는 않습니다.";
  }

  return "모델이 꽤 자신 있게 불합격으로 보고 있습니다.";
}

function SigmoidJudgeDemo() {
  const [activeTab, setActiveTab] = React.useState("sigmoid");
  const [weight, setWeight] = React.useState(DEFAULT_SIGMOID_STATE.weight);
  const [bias, setBias] = React.useState(DEFAULT_SIGMOID_STATE.bias);
  const [selectedStudentId, setSelectedStudentId] = React.useState(STUDENTS[5].id);

  const frame = { height: 300, left: 72, top: 28, width: 700 };

  const curve = React.useMemo(() => SigmoidMath.buildSigmoidCurve(weight, bias), [weight, bias]);
  const pathData = React.useMemo(() => SigmoidMath.buildPathData(curve, frame), [curve]);
  const evaluation = React.useMemo(() => SigmoidMath.evaluateStudents(STUDENTS, weight, bias), [weight, bias]);
  const decisionBoundary = React.useMemo(() => SigmoidMath.computeDecisionBoundary(weight, bias), [weight, bias]);
  const thresholdY = React.useMemo(() => SigmoidMath.toSvgPoint(SigmoidMath.HOURS_MIN, 0.5, frame).y, []);
  const selectedStudent = React.useMemo(
    () => evaluation.rows.find((row) => row.id === selectedStudentId) ?? evaluation.rows[0],
    [evaluation.rows, selectedStudentId],
  );
  const selectedPoint = React.useMemo(
    () => SigmoidMath.toSvgPoint(selectedStudent.hours, selectedStudent.predictedProbability, frame),
    [selectedStudent],
  );

  return (
    <main className="mx-auto my-10 w-[min(1180px,calc(100%-32px))] rounded-3xl border border-slate-200/70 bg-white/85 p-7 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
      <a className="mb-4 inline-block text-sm text-blue-700 hover:underline" href="../">
        ← 데모 목록으로
      </a>
      <h1 className="mb-3 text-[clamp(2rem,4vw,2.8rem)] font-bold tracking-[-0.04em] text-slate-900">
        공부 시간으로 합격 예측하기
      </h1>
      <p className="mb-6 max-w-3xl leading-7 text-slate-600">
        학생 데이터를 그래프에 찍어두고, <span className="font-semibold text-slate-900">weight</span>와{" "}
        <span className="font-semibold text-slate-900">bias</span>를 직접 움직이며 시그모이드 곡선이 데이터를 얼마나 잘 설명하는지 확인합니다.
        weight는 전환이 얼마나 급한지, bias는 합격 기준선이 어디에 놓일지를 정합니다. 좋은 파라미터를 찾는 과정이 곧 학습입니다.
      </p>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <div className="flex border-b border-slate-200">
          {["sigmoid", "relu", "softmax"].map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`border-b-2 px-5 py-4 text-sm font-semibold transition ${
                  isActive
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "sigmoid" ? "Sigmoid" : tab === "relu" ? "ReLU" : "Softmax"}
              </button>
            );
          })}
        </div>

        {activeTab === "sigmoid" ? (
          <section className="grid gap-8 p-6 lg:p-8">
            <div className="grid gap-4 lg:grid-cols-2">
              <SliderControl
                description="커브 기울기 — 클수록 확률 전환이 더 급격해집니다"
                digits={2}
                id="weight"
                label="weight"
                max={WEIGHT_MAX}
                min={WEIGHT_MIN}
                step={0.01}
                unit=""
                value={weight}
                onChange={setWeight}
              />
              <SliderControl
                description="기준점 이동 — 오른쪽으로 갈수록 더 오래 공부해야 합격합니다"
                digits={1}
                id="bias"
                label="bias"
                max={BIAS_MAX}
                min={BIAS_MIN}
                step={0.1}
                unit=""
                value={bias}
                onChange={setBias}
              />
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-4 lg:p-6">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Sigmoid Graph</p>
                  <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-900">데이터와 합격 확률 곡선</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    채워진 점은 실제 결과입니다. 빈 원은 같은 학생에 대해 모델이 계산한 합격 확률 위치이고,
                    두 점을 잇는 세로선은 예측이 실제와 얼마나 차이나는지 보여줍니다. 세로 점선 경계는 합격 확률이 50%가 되는 공부 시간입니다.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                  <div className="font-semibold text-slate-900">현재 합격 기준</div>
                  <div className="mt-1">
                    약 <span className="font-semibold text-slate-900">{formatFixed(decisionBoundary, 2)}시간</span> 공부하면
                    합격 확률이 50%가 됩니다.
                  </div>
                  <div className="mt-1">
                    `weight`는 경계의 급함을, `bias`는 경계의 위치를 바꿉니다.
                  </div>
                </div>
              </div>

              <div className="mb-4 flex flex-wrap gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-blue-600" />
                  <span>실제 합격</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-orange-500" />
                  <span>실제 불합격</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full border-2 border-slate-900 bg-white" />
                  <span>모델 예측 확률</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-px w-5 border-t-2 border-dashed border-slate-500" />
                  <span>실제값과 예측값의 차이</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-px w-5 border-t-2 border-dashed border-slate-900" />
                  <span>합격 기준 공부 시간</span>
                </div>
              </div>

              <svg viewBox="0 0 840 390" className="h-auto w-full overflow-visible">
                <defs>
                  <linearGradient id="passRegion" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#dbeafe" />
                    <stop offset="100%" stopColor="#eff6ff" />
                  </linearGradient>
                  <linearGradient id="failRegion" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#fff7ed" />
                    <stop offset="100%" stopColor="#ffedd5" />
                  </linearGradient>
                </defs>

                <rect x={frame.left} y={frame.top} width={frame.width} height={thresholdY - frame.top} fill="url(#passRegion)" rx="20" />
                <rect x={frame.left} y={thresholdY} width={frame.width} height={frame.top + frame.height - thresholdY} fill="url(#failRegion)" rx="20" />

                {Y_TICKS.map((tick) => {
                  const y = SigmoidMath.toSvgPoint(SigmoidMath.HOURS_MIN, tick, frame).y;
                  return (
                    <g key={tick}>
                      <line
                        x1={frame.left}
                        x2={frame.left + frame.width}
                        y1={y}
                        y2={y}
                        stroke={tick === 0.5 ? "#2563eb" : "#cbd5e1"}
                        strokeDasharray={tick === 0.5 ? "6 6" : "4 6"}
                        strokeWidth={tick === 0.5 ? 2 : 1}
                      />
                      <text x={frame.left - 14} y={y + 4} textAnchor="end" className="fill-slate-500 text-[12px]">
                        {tick.toFixed(2).replace(/0+$/, "").replace(/\.$/, "")}
                      </text>
                    </g>
                  );
                })}

                {X_TICKS.map((tick) => {
                  const x = SigmoidMath.toSvgPoint(tick, 0, frame).x;
                  return (
                    <g key={tick}>
                      <line x1={x} x2={x} y1={frame.top} y2={frame.top + frame.height} stroke="#e2e8f0" strokeDasharray="4 8" />
                      <text x={x} y={frame.top + frame.height + 24} textAnchor="middle" className="fill-slate-500 text-[12px]">
                        {tick}h
                      </text>
                    </g>
                  );
                })}

                <line x1={frame.left} x2={frame.left + frame.width} y1={frame.top + frame.height} y2={frame.top + frame.height} stroke="#64748b" strokeWidth="1.5" />
                <line x1={frame.left} x2={frame.left} y1={frame.top} y2={frame.top + frame.height} stroke="#64748b" strokeWidth="1.5" />

                <path d={pathData} fill="none" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" />

                {Number.isFinite(decisionBoundary)
                && decisionBoundary >= SigmoidMath.HOURS_MIN
                && decisionBoundary <= SigmoidMath.HOURS_MAX ? (
                  <line
                    x1={SigmoidMath.toSvgPoint(decisionBoundary, 0, frame).x}
                    x2={SigmoidMath.toSvgPoint(decisionBoundary, 0, frame).x}
                    y1={frame.top}
                    y2={frame.top + frame.height}
                    stroke="#1e293b"
                    strokeDasharray="8 8"
                    strokeWidth="2"
                  />
                ) : null}

                {evaluation.rows.map((student) => {
                  const actualY = student.actualLabel === "합격" ? 1 : 0;
                  const actualPoint = SigmoidMath.toSvgPoint(student.hours, actualY, frame);
                  const predictedPoint = SigmoidMath.toSvgPoint(
                    student.hours,
                    student.predictedProbability,
                    frame,
                  );
                  const isSelected = student.id === selectedStudent.id;

                  return (
                    <g key={student.id}>
                      <line
                        x1={actualPoint.x}
                        x2={predictedPoint.x}
                        y1={actualPoint.y}
                        y2={predictedPoint.y}
                        stroke={isSelected ? "#0f172a" : "#94a3b8"}
                        strokeDasharray="5 5"
                        strokeWidth={isSelected ? 2.5 : 1.5}
                      />
                      <circle
                        cx={actualPoint.x}
                        cy={actualPoint.y}
                        r={isSelected ? 12 : 8}
                        fill={student.actualLabel === "합격" ? "#2563eb" : "#f97316"}
                        stroke="#fff"
                        strokeWidth="3"
                        className="cursor-pointer"
                        onMouseEnter={() => setSelectedStudentId(student.id)}
                        onClick={() => setSelectedStudentId(student.id)}
                      />
                      <circle
                        cx={predictedPoint.x}
                        cy={predictedPoint.y}
                        r={isSelected ? 10 : 6}
                        fill="#fff"
                        stroke={isSelected ? "#0f172a" : "#334155"}
                        strokeWidth={isSelected ? 3 : 2}
                        className="cursor-pointer"
                        onMouseEnter={() => setSelectedStudentId(student.id)}
                        onClick={() => setSelectedStudentId(student.id)}
                      />
                    </g>
                  );
                })}

                <line x1={selectedPoint.x} x2={selectedPoint.x} y1={selectedPoint.y} y2={frame.top + frame.height} stroke="#0f172a" strokeDasharray="6 6" />
                <line x1={frame.left} x2={selectedPoint.x} y1={selectedPoint.y} y2={selectedPoint.y} stroke="#0f172a" strokeDasharray="6 6" />
                <circle cx={selectedPoint.x} cy={selectedPoint.y} fill="white" r="12" stroke="#0f172a" strokeWidth="3" />
                <circle cx={selectedPoint.x} cy={selectedPoint.y} fill="#0f172a" r="6" />

                <text x={selectedPoint.x + 16} y={selectedPoint.y - 12} className="fill-slate-900 text-[13px] font-semibold">
                  {selectedStudent.name}: {formatFixed(selectedStudent.predictedProbability, 3)}
                </text>

                <text x={frame.left + frame.width + 18} y={frame.top + frame.height + 6} className="fill-slate-600 text-[13px]">
                  공부 시간
                </text>
                <text x={frame.left - 12} y={frame.top - 10} className="fill-slate-600 text-[13px]">
                  확률
                </text>
                <text x={frame.left + frame.width - 6} y={thresholdY - 10} textAnchor="end" className="fill-blue-700 text-[12px] font-semibold">
                  기준선 y = 0.5
                </text>
                <text x={frame.left - 10} y={frame.top + frame.height + 4} textAnchor="end" className="fill-orange-600 text-[12px] font-semibold">
                  실제 불합격 = 0
                </text>
                <text x={frame.left - 10} y={frame.top + 4} textAnchor="end" className="fill-blue-700 text-[12px] font-semibold">
                  실제 합격 = 1
                </text>
              </svg>
            </div>

            <div className="grid gap-4 lg:grid-cols-[0.95fr,1.05fr]">
              <section className="rounded-[24px] border border-slate-200 bg-white p-6">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Model Fit</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <MetricCard label="정확도" value={`${formatFixed(evaluation.accuracy * 100, 1)}%`} />
                  <MetricCard label="맞춘 학생" value={`${evaluation.correctCount}명`} />
                  <MetricCard label="틀린 학생" value={`${evaluation.wrongCount}명`} />
                </div>

                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-sm font-semibold text-slate-900">{selectedStudent.name}</div>
                  <div className="mt-2 text-sm leading-6 text-slate-600">
                    실제 결과는 <span className="font-semibold text-slate-900">{selectedStudent.actualLabel}</span>,
                    모델 예측은 <span className="font-semibold text-slate-900">{selectedStudent.predictedLabel}</span>입니다.
                  </div>
                  <div className="mt-2 text-sm leading-6 text-slate-600">
                    채워진 점은 실제 라벨 위치이고, 빈 원은 같은 학생을 곡선에 넣었을 때 얻는 예측 확률 위치입니다.
                  </div>
                  <div className="mt-2 text-sm leading-6 text-slate-600">
                    공부 시간은 <span className="font-semibold text-slate-900">{formatFixed(selectedStudent.hours, 1)}시간</span>,
                    예측 확률은 <span className="font-semibold text-slate-900">{formatFixed(selectedStudent.predictedProbability * 100, 1)}%</span>입니다.
                  </div>
                  <div className="mt-2 text-sm leading-6 text-slate-600">
                    {describeConfidence(selectedStudent.predictedProbability)}
                  </div>
                </div>
              </section>

              <section className="rounded-[24px] border border-slate-200 bg-slate-50 p-6">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Why Sigmoid</p>
                <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-7 text-slate-600">
                  <p>
                    선형식 <span className="font-semibold text-slate-900">z = wx + b</span> 는 공부 시간을 하나의 점수로 바꿉니다.
                    하지만 이 값만으로는 확률처럼 읽기 어렵습니다.
                  </p>
                  <p className="mt-3">
                    그래서 <span className="font-semibold text-slate-900">sigmoid</span> 를 적용해 모든 값을
                    <span className="font-semibold text-slate-900"> 0과 1 사이</span>로 압축합니다. 그래프의 S자 곡선이 바로 그 변환입니다.
                  </p>
                  <p className="mt-3">
                    곡선의 가운데인 <span className="font-semibold text-slate-900">y = 0.5</span> 는
                    합격과 불합격을 가르는 기준선이고, 이때의 공부 시간이 현재 모델의 decision boundary 입니다.
                  </p>
                  <p className="mt-3">
                    즉 이 데모는 <span className="font-semibold text-slate-900">공부 시간 → 선형 점수 z → sigmoid 확률 → 합격/불합격 판정</span>
                    순서로 모델이 동작하는 과정을 한 화면에서 보여줍니다.
                  </p>
                </div>
              </section>

              <section className="rounded-[24px] border border-slate-200 bg-slate-50 p-6">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Math</p>
                <div className="mt-4 space-y-4 text-slate-700">
                  <MathCard>
                    <math display="block">
                      <mrow>
                        <mi>z</mi>
                        <mo>=</mo>
                        <mi>w</mi>
                        <mi>x</mi>
                        <mo>+</mo>
                        <mi>b</mi>
                      </mrow>
                    </math>
                  </MathCard>
                  <MathCard>
                    <math display="block">
                      <mrow>
                        <mi>&sigma;</mi>
                        <mo>(</mo>
                        <mi>z</mi>
                        <mo>)</mo>
                        <mo>=</mo>
                        <mfrac>
                          <mn>1</mn>
                          <mrow>
                            <mn>1</mn>
                            <mo>+</mo>
                            <msup>
                              <mi>e</mi>
                              <mrow>
                                <mo>-</mo>
                                <mi>z</mi>
                              </mrow>
                            </msup>
                          </mrow>
                        </mfrac>
                      </mrow>
                    </math>
                  </MathCard>
                  <MathCard>
                    <math display="block">
                      <mrow>
                        <mi>x</mi>
                        <mo>=</mo>
                        <mfrac>
                          <mrow>
                            <mo>-</mo>
                            <mi>b</mi>
                          </mrow>
                          <mi>w</mi>
                        </mfrac>
                        <mo>=</mo>
                        <mfrac>
                          <mrow>
                            <mo>-</mo>
                            <mn>{formatFixed(bias, 1)}</mn>
                          </mrow>
                          <mn>{formatFixed(weight, 2)}</mn>
                        </mfrac>
                        <mo>&approx;</mo>
                        <mn>{formatFixed(decisionBoundary, 2)}</mn>
                      </mrow>
                    </math>
                  </MathCard>
                </div>
              </section>
            </div>

            <section className="rounded-[24px] border border-slate-200 bg-white p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Dataset</p>
                  <h3 className="mt-2 text-xl font-bold tracking-[-0.02em] text-slate-900">학생별 예측 결과</h3>
                </div>
                <p className="text-sm text-slate-600">
                  표의 행에 마우스를 올리면 그래프에서 해당 학생을 강조합니다.
                </p>
              </div>

              <div className="mt-5 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-slate-200 text-slate-500">
                    <tr>
                      <th className="px-3 py-3 font-semibold">학생</th>
                      <th className="px-3 py-3 font-semibold">공부 시간</th>
                      <th className="px-3 py-3 font-semibold">실제</th>
                      <th className="px-3 py-3 font-semibold">예측 확률</th>
                      <th className="px-3 py-3 font-semibold">예측</th>
                      <th className="px-3 py-3 font-semibold">실제와 일치</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evaluation.rows.map((row) => (
                      <tr
                        key={row.id}
                        className={`border-b border-slate-100 ${
                          row.id === selectedStudent.id ? "bg-blue-50/70" : "hover:bg-slate-50"
                        }`}
                        onMouseEnter={() => setSelectedStudentId(row.id)}
                      >
                        <td className="px-3 py-3 font-medium text-slate-900">{row.name}</td>
                        <td className="px-3 py-3 text-slate-600">{formatFixed(row.hours, 1)}h</td>
                        <td className="px-3 py-3 text-slate-600">{row.actualLabel}</td>
                        <td className="px-3 py-3 text-slate-600">{formatFixed(row.predictedProbability * 100, 1)}%</td>
                        <td className="px-3 py-3 text-slate-600">{row.predictedLabel}</td>
                        <td className="px-3 py-3">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              row.isCorrect
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-rose-100 text-rose-700"
                            }`}
                          >
                            {row.isCorrect ? "일치" : "불일치"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </section>
        ) : (
          <PlaceholderTab {...TAB_PLACEHOLDERS[activeTab]} />
        )}
      </section>
    </main>
  );
}

/**
 * 공통 슬라이더 카드 컴포넌트다.
 *
 * weight와 bias는 동일한 구조를 가지므로 공통 컴포넌트로 뽑아 두는 편이 낫다.
 * 이렇게 하면 데모의 핵심인 수식과 데이터 평가 로직이 UI 반복에 묻히지 않는다.
 *
 * @param {{
 *   description: string,
 *   digits: number,
 *   id: string,
 *   label: string,
 *   max: number,
 *   min: number,
 *   onChange: (value: number) => void,
 *   step: number,
 *   unit: string,
 *   value: number
 * }} props 슬라이더 표시와 동작에 필요한 속성
 * @returns {JSX.Element} 슬라이더 카드
 */
function SliderControl(props) {
  const {
    description,
    digits,
    id,
    label,
    max,
    min,
    onChange,
    step,
    unit,
    value,
  } = props;

  return (
    <label className="grid gap-3 rounded-[24px] border border-slate-200 bg-slate-50 p-5" htmlFor={id}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-slate-900">{label}</span>
        <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-blue-700 shadow-sm">
          {formatFixed(value, digits)}
          {unit}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        className="w-full accent-blue-600"
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <p className="text-sm leading-6 text-slate-600">{description}</p>
    </label>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
      <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-900">{value}</div>
    </div>
  );
}

function MathCard({ children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-lg">
      {children}
    </div>
  );
}

function PlaceholderTab({ description, title }) {
  return (
    <section className="grid gap-6 p-6 lg:p-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Activation Function</p>
        <h2 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-slate-900">{title}</h2>
        <p className="mt-3 max-w-2xl leading-7 text-slate-600">{description}</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <section className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
          <h3 className="text-base font-semibold text-slate-900">입력 영역</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">여기에 탭 전용 슬라이더나 입력 필드를 추가하면 됩니다.</p>
        </section>
        <section className="min-h-[320px] rounded-[24px] border border-slate-200 bg-slate-50 p-5">
          <h3 className="text-base font-semibold text-slate-900">시각화 / 결과 영역</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">여기에 그래프, 수식, 결과 출력을 추가하면 됩니다.</p>
        </section>
      </div>
    </section>
  );
}

ReactDOM.createRoot(document.getElementById("react-root")).render(<SigmoidJudgeDemo />);
