# Stargazer
웹프레임워크[A] 웹잘알팀 프로젝트

## 디렉터리 구조

```
Stargazer/
├─ public/            # 빌드 시 그대로 복사되는 정적 파일 (favicon 등)
├─ src/
│  ├─ assets/         # 코드에서 import하는 이미지, 폰트 등
│  ├─ components/     # 여러 화면에서 재사용하는 UI 컴포넌트
│  ├─ data/           # 정적 데이터, 상수, mock 데이터
│  ├─ pages/          # 화면 단위 컴포넌트
│  ├─ utils/          # 공통으로 쓰는 함수
│  ├─ App.jsx         # 최상위 컴포넌트
│  ├─ main.jsx        # 앱 진입점
│  └─ index.css       # 전역 스타일
├─ index.html         # HTML 진입 파일
├─ vite.config.js     # Vite 설정
└─ package.json       # 의존성 및 실행 스크립트
```
