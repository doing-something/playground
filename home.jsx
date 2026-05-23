const DEMOS = [
  {
    description:
      "2x2 행렬 하나로 삼각형이 어떻게 변하는지 확인합니다. 회전·확대·shear·반사를 직접 조정하며 직관을 잡습니다.",
    href: "./matrix-transform/",
    title: "matrix-transform",
  },
  {
    description:
      "같은 단위 정사각형에 A와 Aᵀ를 적용해 한 화면에서 비교합니다. 대칭·회전·shear의 전치가 시각적으로 무엇인지 확인합니다.",
    href: "./matrix-transpose/",
    title: "matrix-transpose",
  },
  {
    description:
      "두 행렬의 곱 C = A·B가 변환의 합성과 같다는 사실을 보여줍니다. \"B 다음 A\"의 단계적 결과와 C 한 번 적용 결과가 같은 자리에 있는지 확인합니다.",
    href: "./matrix-compose/",
    title: "matrix-compose",
  },
  {
    description:
      "같은 16개 데이터를 (1, 16) / (2, 8) / (4, 4) 등 다른 모양으로 다시 보는 모습. PyTorch tensor.reshape와 nn.Flatten이 무엇인지 이해할 수 있습니다.",
    href: "./reshape/",
    title: "reshape",
  },
  {
    description:
      "Canvas API의 translate / rotate / scale이 내부에서 어떻게 3×3 affine 행렬을 누적하는지, 평행이동까지 포함한 변환 합성을 살펴봅니다.",
    href: "./canvas-matrix/",
    title: "canvas-matrix",
  },
  {
    description:
      "Sigmoid, ReLU, Softmax를 탭으로 전환하며 입력값과 출력의 관계를 시각적으로 확인합니다. 분류 확률과 비선형성이 어떻게 생기는지 빠르게 감을 잡을 수 있습니다.",
    href: "./activation-functions/",
    title: "activation-functions",
  },
  {
    description:
      "Multi-class cross-entropy, binary cross-entropy, RMSE를 탭으로 분리한 학습용 레이아웃입니다. 각 loss 함수별 데모 콘텐츠를 채워 넣을 수 있는 빈 골격만 제공합니다.",
    href: "./loss-functions/",
    title: "loss-functions",
  },
];

function HomePage() {
  return (
    <main>
      <h1>Playground Demos</h1>
      <p className="intro">선형대수와 변환을 손으로 만져 보는 작은 데모 모음.</p>
      <ul>
        {DEMOS.map((demo) => (
          <li key={demo.href}>
            <a href={demo.href}>
              <span className="demo-title">{demo.title}</span>
              <span className="demo-description">{demo.description}</span>
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("react-root")).render(<HomePage />);
