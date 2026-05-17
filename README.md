# Playground demos

선형대수와 변환을 손으로 만져 보는 작은 데모 모음.
GitHub Pages로 배포되어 있어 아래 링크에서 바로 열 수 있습니다.

## 배포된 데모

- **데모 목록 홈**: https://doing-something.github.io/playground/
- [matrix-transform](https://doing-something.github.io/playground/matrix-transform/) — 2x2 행렬로 삼각형이 어떻게 변하는지
- [matrix-transpose](https://doing-something.github.io/playground/matrix-transpose/) — A와 Aᵀ를 한 화면에서 비교
- [matrix-compose](https://doing-something.github.io/playground/matrix-compose/) — 행렬 곱 = 변환의 합성
- [reshape](https://doing-something.github.io/playground/reshape/) — 같은 데이터를 다른 모양으로 reshape
- [canvas-matrix](https://doing-something.github.io/playground/canvas-matrix/) — Canvas API가 내부에서 쌓는 3×3 affine 행렬

## 시작

```bash
npm install
npm run dev
```

브라우저에서 `http://127.0.0.1:4173/matrix-transform/`를 열면 됩니다.

## 스크립트

```bash
npm run build      # 타입스크립트 1회 컴파일
npm run watch      # 타입스크립트 감시 컴파일
npm run serve      # 정적 서버만 실행
npm run dev        # 감시 컴파일 + 정적 서버 실행
npm run typecheck  # 타입 체크만 실행
```

## 데모 추가 방법

새 데모는 아래 구조로 추가하면 됩니다.

```text
new-demo/
  index.html
  main.ts
```

`index.html` 안에서는 컴파일된 파일을 아래처럼 연결합니다.

```html
<script src="../dist/new-demo/main.js"></script>
```

## 현재 선택

이 저장소는 지금 기준으로 `npm + tsc + 간단한 정적 서버`만 사용합니다.

- `vite`는 아직 넣지 않았습니다. 현재 데모는 번들링, HMR, 프론트엔드 프레임워크 통합이 필요 없어서 설정만 늘어납니다.
- `pnpm`도 아직 불필요합니다. 패키지가 거의 없고 워크스페이스/모노레포 요구가 없어서 기본 `npm`이면 충분합니다.

아래 조건이 생기면 그때 `vite` 도입을 검토하면 됩니다.

- 브라우저에서 npm 패키지 import가 많아짐
- 여러 데모가 공통 모듈을 많이 공유함
- 개발 중 자동 새로고침과 빠른 번들링이 중요해짐
- React, Vue 같은 프레임워크를 붙일 계획이 생김
