# Seven Brief Lessons on Physics — Interactive

Carlo Rovelli의 책 *Seven Brief Lessons on Physics*를 위해 Penguin Press의
Creative Developer Mathieu Triay가 만든 인터랙티브 사이트를, 스크린샷과 제작
인터뷰 설명을 참고해 따라 만들어본 개인 학습 프로젝트입니다.

이 저장소의 다른 데모들과는 독립된 프로젝트라 홈 화면 목록(`../home.jsx`)에는
포함하지 않았습니다.

## 구조

```text
index.html       마크업 + 스타일
main.ts          엔트리포인트
engine/          재사용 가능한 캔버스 미니 엔진 (rAF 루프, 씬 전환, 포인터/리사이즈 배선)
scenes/          7개 레슨 + 커버, 각각 독립된 씬 모듈
ui.ts            DOM 바인딩 (내비게이션, 텍스트, 커서)
```

## 실행

저장소 루트에서:

```bash
npm run build   # 또는 npm run watch
npm run serve
```

브라우저에서 `http://127.0.0.1:4173/seven-brief-lessons-in-physics/`를 엽니다.
