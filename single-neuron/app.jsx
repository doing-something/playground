const STUDENTS = [
  { attendance: 0.35, hours: 1.5, id: "student-a", label: 0, name: "학생 A" },
  { attendance: 0.55, hours: 3.2, id: "student-b", label: 0, name: "학생 B" },
  { attendance: 0.72, hours: 5.4, id: "student-c", label: 1, name: "학생 C" },
  { attendance: 0.88, hours: 7.1, id: "student-d", label: 1, name: "학생 D" },
];

const DEFAULT_STATE = {
  bias: -5.5,
  selectedStudentId: "student-c",
  step: 0,
  weightAttendance: 3.2,
  weightHours: 1.1,
};

const STEP_COPY = [
  {
    description: "뉴런은 먼저 여러 입력값을 받습니다. 여기서는 공부 시간과 출석률을 보고 합격 가능성을 판단합니다.",
    title: "입력은 뉴런이 판단에 사용하는 재료입니다.",
  },
  {
    description: "각 입력은 같은 비중으로 쓰이지 않습니다. weight는 중요도를, bias는 기준선을 정합니다.",
    title: "가중합은 여러 입력을 하나의 점수 z로 압축합니다.",
  },
  {
    description: "가중합 z는 아직 확률이 아닙니다. sigmoid가 그 점수를 0~1 사이 값으로 눌러 확률처럼 읽히게 만듭니다.",
    title: "활성화 함수는 점수를 해석 가능한 출력으로 바꿉니다.",
  },
  {
    description: "손실은 뉴런의 출력이 정답과 얼마나 다른지 재는 숫자입니다. 이번 데모에서는 MSE를 사용합니다.",
    title: "손실은 뉴런이 얼마나 잘하고 있는지 평가합니다.",
  },
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function sigmoid(value) {
  return 1 / (1 + Math.exp(-value));
}

function formatFixed(value, digits = 2) {
  if (Math.abs(value) < 10 ** (-digits) / 2) {
    return (0).toFixed(digits);
  }

  return value.toFixed(digits);
}

function formatPercent(value) {
  return `${Math.round(value * 100)}%`;
}

function evaluateStudent(student, params) {
  const z = student.hours * params.weightHours + student.attendance * params.weightAttendance + params.bias;
  const probability = sigmoid(z);
  const mse = (probability - student.label) ** 2;

  return { mse, probability, z };
}

function evaluateDataset(params) {
  const rows = STUDENTS.map((student) => ({
    ...student,
    ...evaluateStudent(student, params),
  }));
  const meanMSE = rows.reduce((sum, row) => sum + row.mse, 0) / rows.length;
  return { meanMSE, rows };
}

function buildSigmoidPath(frame) {
  const points = [];

  for (let step = 0; step <= 120; step += 1) {
    const xValue = -10 + (20 * step) / 120;
    const probability = sigmoid(xValue);
    const x = frame.left + ((xValue + 10) / 20) * frame.width;
    const y = frame.top + (1 - probability) * frame.height;
    points.push(`${step === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`);
  }

  return points.join(" ");
}

function sigmoidPoint(z, probability, frame) {
  const x = frame.left + ((clamp(z, -10, 10) + 10) / 20) * frame.width;
  const y = frame.top + (1 - probability) * frame.height;
  return { x, y };
}

function toneFromLoss(loss) {
  const normalized = clamp(loss / 0.3, 0, 1);
  const hue = 140 - normalized * 140;

  return {
    background: `hsla(${hue}, 85%, 92%, 1)`,
    border: `hsla(${hue}, 72%, 45%, 0.34)`,
    text: `hsl(${hue}, 72%, 28%)`,
  };
}

function StepProgress({ step }) {
  return (
    <div className="mb-8 grid gap-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Neuron Walkthrough</p>
          <div className="mt-2 text-sm font-semibold text-slate-500">{step + 1} / 4</div>
        </div>
        <div className="max-w-2xl">
          <div className="text-base font-semibold text-slate-900">{STEP_COPY[step].title}</div>
          <div className="mt-1 text-sm leading-6 text-slate-600">{STEP_COPY[step].description}</div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {STEP_COPY.map((item, index) => (
          <div key={item.title} className={`h-2 rounded-full ${index <= step ? "bg-blue-600" : "bg-slate-200"}`} />
        ))}
      </div>
    </div>
  );
}

function StudentSelector({ selectedStudentId, onSelect }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {STUDENTS.map((student) => {
        const isActive = student.id === selectedStudentId;
        return (
          <button
            key={student.id}
            type="button"
            onClick={() => onSelect(student.id)}
            className={`grid gap-2 rounded-2xl border px-4 py-4 text-left transition ${
              isActive
                ? "border-blue-600 bg-blue-50 text-blue-900 shadow-[inset_0_0_0_1px_rgba(37,99,235,0.08)]"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{student.name}</span>
            <span className="text-sm">공부 시간 {formatFixed(student.hours, 1)}h</span>
            <span className="text-sm">출석률 {formatPercent(student.attendance)}</span>
            <span className="text-sm">정답 라벨 y = {student.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function StepInput({ selectedStudent, onSelect }) {
  return (
    <section className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-bold tracking-[-0.03em] text-slate-900">Step 1. 입력</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          한 학생의 입력값은 두 개입니다. `공부 시간`과 `출석률`이 뉴런으로 들어가서 합격 확률 계산의 재료가 됩니다.
        </p>
        <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-700">
          <div className="font-semibold text-slate-900">현재 선택한 입력</div>
          <div className="mt-2">x₁ = 공부 시간 = {formatFixed(selectedStudent.hours, 1)}시간</div>
          <div>x₂ = 출석률 = {formatPercent(selectedStudent.attendance)}</div>
          <div>정답 y = {selectedStudent.label}</div>
        </div>
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-600">
          여기서 중요한 점:
          <br />
          뉴런은 처음부터 "합격/불합격"을 아는 게 아니라, 입력값 두 개를 보고 스스로 점수를 계산해야 합니다.
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">학생 데이터 포인트</h3>
        <p className="mt-1 text-sm text-slate-600">하나를 클릭하면 이후 단계에서 같은 입력이 계속 사용됩니다.</p>
        <div className="mt-4">
          <StudentSelector selectedStudentId={selectedStudent.id} onSelect={onSelect} />
        </div>
      </div>
    </section>
  );
}

function SliderControl({ id, label, value, description, onChange }) {
  const positive = value >= 0;

  return (
    <label className="grid gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-semibold text-slate-900">{label}</div>
          <div className="text-xs text-slate-500">{description}</div>
        </div>
        <output
          htmlFor={id}
          className={`rounded-full px-3 py-1 text-sm font-semibold ${
            positive ? "bg-blue-50 text-blue-700" : "bg-orange-50 text-orange-700"
          }`}
        >
          {positive ? "+" : ""}
          {formatFixed(value, 1)}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min="-6"
        max="6"
        step="0.1"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function StepWeightedSum({ output, params, student, onParamChange }) {
  const attendancePercent = student.attendance * 100;

  return (
    <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-bold tracking-[-0.03em] text-slate-900">Step 2. 가중합</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          뉴런은 입력을 그대로 쓰지 않고, 각 입력의 중요도를 반영해 하나의 점수 <span className="font-semibold text-slate-900">z</span>를 만듭니다.
        </p>

        <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50/80 p-5">
          <svg viewBox="0 0 760 260" className="w-full">
            <defs>
              <linearGradient id="signalLine" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#93c5fd" />
                <stop offset="100%" stopColor="#2563eb" />
              </linearGradient>
              <marker id="arrowHead" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#2563eb" />
              </marker>
            </defs>

            <circle cx="150" cy="80" r="44" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
            <circle cx="150" cy="180" r="44" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
            <circle cx="470" cy="130" r="72" fill="#eff6ff" stroke="#2563eb" strokeWidth="3" />

            <line x1="194" y1="80" x2="395" y2="112" stroke="url(#signalLine)" strokeWidth="6" markerEnd="url(#arrowHead)" />
            <line x1="194" y1="180" x2="395" y2="148" stroke="url(#signalLine)" strokeWidth="6" markerEnd="url(#arrowHead)" />
            <line x1="470" y1="28" x2="470" y2="58" stroke="#f97316" strokeWidth="5" markerEnd="url(#arrowHead)" />

            <text x="150" y="68" textAnchor="middle" className="fill-slate-500 text-[13px] font-semibold">공부 시간</text>
            <text x="150" y="92" textAnchor="middle" className="fill-slate-900 text-[24px] font-bold">{formatFixed(student.hours, 1)}h</text>
            <text x="150" y="168" textAnchor="middle" className="fill-slate-500 text-[13px] font-semibold">출석률</text>
            <text x="150" y="192" textAnchor="middle" className="fill-slate-900 text-[24px] font-bold">{attendancePercent.toFixed(0)}%</text>

            <text x="300" y="72" textAnchor="middle" className="fill-blue-700 text-[18px] font-semibold">
              w₁ = {formatFixed(params.weightHours, 1)}
            </text>
            <text x="300" y="198" textAnchor="middle" className="fill-blue-700 text-[18px] font-semibold">
              w₂ = {formatFixed(params.weightAttendance, 1)}
            </text>
            <text x="520" y="32" className="fill-orange-600 text-[18px] font-semibold">
              bias = {formatFixed(params.bias, 1)}
            </text>

            <text x="470" y="138" textAnchor="middle" className="fill-blue-700 text-[34px] font-bold">z</text>
          </svg>
        </div>

        <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-4 font-mono text-sm text-slate-700">
          z = ({formatFixed(params.weightHours, 1)} × {formatFixed(student.hours, 1)}) + ({formatFixed(params.weightAttendance, 1)} × {formatFixed(student.attendance, 2)}) + {formatFixed(params.bias, 1)} ={" "}
          <span className={`font-bold ${output.z >= 0 ? "text-blue-700" : "text-orange-700"}`}>{formatFixed(output.z, 3)}</span>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-600">
          이 단계의 의미:
          <br />
          뉴런은 "공부 시간은 얼마나 중요하게 볼까?", "출석률은 얼마나 중요하게 볼까?", "전체 기준은 얼마나 엄격할까?"를 숫자로 표현합니다.
        </div>
      </div>

      <div className="grid gap-4">
        <SliderControl
          id="weight-hours"
          label="공부 시간 weight"
          description="공부 시간을 더 중요하게 볼수록 커집니다."
          value={params.weightHours}
          onChange={(value) => onParamChange("weightHours", value)}
        />
        <SliderControl
          id="weight-attendance"
          label="출석률 weight"
          description="출석률을 더 중요하게 볼수록 커집니다."
          value={params.weightAttendance}
          onChange={(value) => onParamChange("weightAttendance", value)}
        />
        <SliderControl
          id="bias"
          label="bias"
          description="합격 기준을 더 엄격하거나 느슨하게 만듭니다."
          value={params.bias}
          onChange={(value) => onParamChange("bias", value)}
        />
      </div>
    </section>
  );
}

function StepActivation({ output }) {
  const frame = { height: 260, left: 58, top: 18, width: 560 };
  const path = buildSigmoidPath(frame);
  const point = sigmoidPoint(output.z, output.probability, frame);
  const xTicks = [-10, -5, 0, 5, 10];
  const yTicks = [0, 0.5, 1];

  return (
    <section className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-bold tracking-[-0.03em] text-slate-900">Step 3. 시그모이드 활성화</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          z는 단순 점수라서 해석이 어렵습니다. sigmoid를 통과시키면 0~1 사이 값이 되어 "합격 확률"처럼 읽을 수 있습니다.
        </p>

        <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50/80 p-5">
          <svg viewBox="0 0 660 320" className="w-full overflow-visible">
            {yTicks.map((tick) => {
              const y = frame.top + (1 - tick) * frame.height;
              return (
                <g key={tick}>
                  <line x1={frame.left} x2={frame.left + frame.width} y1={y} y2={y} stroke={tick === 0.5 ? "#2563eb" : "#cbd5e1"} strokeDasharray="5 6" />
                  <text x={frame.left - 12} y={y + 4} textAnchor="end" className="fill-slate-500 text-[12px]">
                    {tick}
                  </text>
                </g>
              );
            })}

            {xTicks.map((tick) => {
              const x = frame.left + ((tick + 10) / 20) * frame.width;
              return (
                <g key={tick}>
                  <line x1={x} x2={x} y1={frame.top} y2={frame.top + frame.height} stroke="#e2e8f0" strokeDasharray="5 8" />
                  <text x={x} y={frame.top + frame.height + 24} textAnchor="middle" className="fill-slate-500 text-[12px]">
                    {tick}
                  </text>
                </g>
              );
            })}

            <line x1={frame.left} x2={frame.left + frame.width} y1={frame.top + frame.height} y2={frame.top + frame.height} stroke="#64748b" strokeWidth="1.5" />
            <line x1={frame.left} x2={frame.left} y1={frame.top} y2={frame.top + frame.height} stroke="#64748b" strokeWidth="1.5" />
            <path d={path} fill="none" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" />
            <line x1={point.x} x2={point.x} y1={frame.top + frame.height} y2={point.y} stroke="#f97316" strokeDasharray="6 6" strokeWidth="2" />
            <circle cx={point.x} cy={point.y} r="8" fill="#ef4444" />
            <text x={point.x + 12} y={point.y - 10} className="fill-slate-900 text-[13px] font-semibold">
              z={formatFixed(output.z, 2)}, σ(z)={formatFixed(output.probability, 4)}
            </text>
          </svg>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Current Output</div>
          <div className="mt-3 text-5xl font-black tracking-[-0.05em] text-slate-900">{formatFixed(output.probability, 4)}</div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            현재 뉴런은 이 학생이 합격할 확률을 이 값으로 보고 있습니다.
          </p>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-5 font-mono text-sm text-slate-700 shadow-sm">
          σ(z) = 1 / (1 + e^(-z))
          <br />
          = 1 / (1 + e^(-{formatFixed(output.z, 3)}))
          <br />
          = {formatFixed(output.probability, 4)}
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-600 shadow-sm">
          이 단계의 의미:
          <br />
          뉴런은 점수를 만든 뒤 끝나는 게 아니라, 그 점수를 사람이 읽기 쉬운 확률 형태로 바꿔서 출력합니다.
        </div>
      </div>
    </section>
  );
}

function StepLoss({ metrics, output, selectedStudent }) {
  const tone = toneFromLoss(metrics.meanMSE);
  const predictionHeight = `${Math.max(output.probability * 100, 3)}%`;
  const labelHeight = `${Math.max(selectedStudent.label * 100, 3)}%`;

  return (
    <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <div className="grid gap-6">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-2xl font-bold tracking-[-0.03em] text-slate-900">Step 4. MSE 손실</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            이제 뉴런의 출력이 정답과 얼마나 다른지 재봅니다. MSE는 예측과 정답의 차이를 제곱해서 손실로 만듭니다.
          </p>

          <div className="mt-6 grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="grid h-56 grid-cols-2 items-end gap-4">
                <div className="flex h-full flex-col justify-end gap-3">
                  <div className="rounded-t-2xl bg-blue-500/85" style={{ height: predictionHeight }} />
                  <div className="text-center text-sm font-semibold text-slate-700">예측 {formatFixed(output.probability, 4)}</div>
                </div>
                <div className="flex h-full flex-col justify-end gap-3">
                  <div className="rounded-t-2xl bg-slate-900/85" style={{ height: labelHeight }} />
                  <div className="text-center text-sm font-semibold text-slate-700">정답 {selectedStudent.label}</div>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 font-mono text-sm text-slate-700">
                MSE(sample) = ({formatFixed(output.probability, 4)} - {selectedStudent.label})² = {formatFixed(output.mse, 6)}
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-600">
                왜 제곱을 하나?
                <br />
                차이가 크면 더 큰 벌점을 주기 위해서입니다. 예측이 정답에서 멀수록 손실이 빠르게 커집니다.
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Dataset MSE</div>
              <h3 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-900">전체 학생 평균 MSE</h3>
            </div>
            <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
              Mean MSE = {formatFixed(metrics.meanMSE, 6)}
            </div>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-slate-200 text-left text-slate-500">
                <tr>
                  <th className="pb-3 font-semibold">학생</th>
                  <th className="pb-3 font-semibold">입력</th>
                  <th className="pb-3 font-semibold">정답</th>
                  <th className="pb-3 font-semibold">예측 확률</th>
                  <th className="pb-3 font-semibold">샘플 MSE</th>
                </tr>
              </thead>
              <tbody>
                {metrics.rows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 text-slate-700">
                    <td className="py-3 font-medium">{row.name}</td>
                    <td className="py-3">{formatFixed(row.hours, 1)}h / {formatPercent(row.attendance)}</td>
                    <td className="py-3">{row.label}</td>
                    <td className="py-3">{formatFixed(row.probability, 4)}</td>
                    <td className="py-3">{formatFixed(row.mse, 6)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        <section
          className="rounded-[28px] border px-5 py-5 shadow-sm"
          style={{ backgroundColor: tone.background, borderColor: tone.border, color: tone.text }}
        >
          <p className="text-sm font-bold uppercase tracking-[0.2em]">전체 평균 MSE</p>
          <div className="mt-3 text-5xl font-black tracking-[-0.05em]">{formatFixed(metrics.meanMSE, 4)}</div>
          <p className="mt-3 text-sm">
            0에 가까울수록 현재 뉴런이 전체 학생 데이터를 더 잘 설명합니다.
          </p>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Guide</div>
          <h3 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-900">이 단계에서 이해할 것</h3>
          <ul className="mt-4 grid gap-3 text-sm leading-6 text-slate-700">
            <li>가중합과 sigmoid는 뉴런의 출력까지 만드는 과정입니다.</li>
            <li>MSE는 그 출력이 정답과 얼마나 다른지 재는 평가 도구입니다.</li>
            <li>학습은 결국 weight와 bias를 조정해 이 평균 MSE를 줄이는 과정입니다.</li>
          </ul>
        </section>
      </div>
    </section>
  );
}

function SingleNeuronDemo() {
  const [state, setState] = React.useState(DEFAULT_STATE);
  const selectedStudent = STUDENTS.find((student) => student.id === state.selectedStudentId) ?? STUDENTS[0];
  const params = {
    bias: state.bias,
    weightAttendance: state.weightAttendance,
    weightHours: state.weightHours,
  };
  const output = React.useMemo(
    () => evaluateStudent(selectedStudent, params),
    [params.bias, params.weightAttendance, params.weightHours, selectedStudent],
  );
  const metrics = React.useMemo(
    () => evaluateDataset(params),
    [params.bias, params.weightAttendance, params.weightHours],
  );

  function updateParam(key, value) {
    setState((current) => ({ ...current, [key]: value }));
  }

  function renderStep() {
    if (state.step === 0) {
      return <StepInput selectedStudent={selectedStudent} onSelect={(selectedStudentId) => setState((current) => ({ ...current, selectedStudentId }))} />;
    }

    if (state.step === 1) {
      return <StepWeightedSum output={output} params={params} student={selectedStudent} onParamChange={updateParam} />;
    }

    if (state.step === 2) {
      return <StepActivation output={output} />;
    }

    return <StepLoss metrics={metrics} output={output} selectedStudent={selectedStudent} />;
  }

  return (
    <main className="mx-auto my-10 w-[min(1180px,calc(100%-32px))] rounded-3xl border border-slate-200/70 bg-white/85 p-7 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
      <a className="mb-4 inline-block text-sm text-blue-700 hover:underline" href="../">
        ← 데모 목록으로
      </a>
      <h1 className="mb-3 text-[clamp(2rem,4vw,2.8rem)] font-bold tracking-[-0.04em] text-slate-900">
        Single Neuron
      </h1>
      <p className="mb-6 max-w-3xl leading-7 text-slate-600">
        단일 뉴런이 입력을 받아 하나의 점수를 만들고, 그 점수를 확률로 바꾼 뒤, 마지막에 손실로 평가받는 과정을 4단계로 따라갑니다.
      </p>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 lg:p-8">
        <StepProgress step={state.step} />
        {renderStep()}

        <div className="mt-8 flex items-center justify-between gap-4 border-t border-slate-200 pt-6">
          <button
            type="button"
            disabled={state.step === 0}
            onClick={() => setState((current) => ({ ...current, step: Math.max(0, current.step - 1) }))}
            className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Prev
          </button>

          <div className="text-sm text-slate-500">선택한 학생, weight, bias 값은 단계가 바뀌어도 그대로 유지됩니다.</div>

          <button
            type="button"
            disabled={state.step === 3}
            onClick={() => setState((current) => ({ ...current, step: Math.min(3, current.step + 1) }))}
            className="rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("react-root")).render(<SingleNeuronDemo />);
