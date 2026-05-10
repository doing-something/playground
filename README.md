# Playground demos

이 저장소는 여러 개의 데모 예시를 모아두는 용도입니다. 현재 첫 번째 예시는 `matrix-transform`입니다.

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
<script src="/dist/new-demo/main.js"></script>
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
