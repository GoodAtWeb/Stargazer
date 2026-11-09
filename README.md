# Stargazer
웹프레임워크[A] 웹잘알팀 프로젝트

## 디렉터리 구조

```
Stargazer/
├─ public/                    # 빌드 시 그대로 복사되는 정적 파일 (favicon 등)
├─ src/
│  ├─ assets/
│  │  ├─ art/                 # 별자리 상세 지도 뒤에 깔리는 연한 배경 그림 (별자리 id.svg, 메인 화면 hover 그림으로도 사용)
│  │  ├─ bg/                  # 상세·메인 페이지 배경 사진 (milkyway.jpg)
│  │  └─ constellations/      # 별자리 아이콘 (id.svg, id_active.svg)
│  ├─ components/
│  │  ├─ ConstellationArt.jsx # 별자리 배경 그림을 별 좌표에 맞춰 표시
│  │  ├─ ConstellationMap.jsx # 별과 선으로 그리는 SVG 별자리 지도 (별 클릭 선택)
│  │  ├─ StarInfoCard.jsx     # 선택한 별의 정보 카드
│  │  ├─ ObservationSection.jsx # 관측 적기, 시간, 방향, 팁
│  │  ├─ FortuneSection.jsx   # 오늘의 운세, 궁합, 12궁 운세 순위
│  │  ├─ FloatingConstellation.jsx # 메인 화면에서 둥둥 떠다니는 별자리 (hover 확대, 클릭 이동)
│  │  ├─ StarField.jsx        # 메인 화면 배경 반짝이는 별 (tsparticles)
│  │  └─ TopNav.jsx           # 상단 메뉴바 (구색만 갖춤)
│  ├─ data/
│  │  ├─ constellations.json  # 12별자리 + 대표 별자리 별 mock 데이터
│  │  └─ horoscopes.json      # 12별자리 운세 mock 데이터
│  ├─ dev/
│  │  ├─ detailPreview.jsx    # 상세보기 화면 단독 미리보기용 임시 진입점
│  │  └─ homePreview.jsx      # 메인 화면 단독 미리보기용 임시 진입점
│  ├─ pages/
│  │  ├─ ConstellationDetail.jsx  # 별자리 상세보기 화면 (유래, 지도, 관측 정보, 운세)
│  │  └─ Home.jsx             # 메인 화면 (로고, 메뉴, 12별자리 배치)
│  ├─ utils/
│  │  ├─ constellations.js    # id로 별자리 데이터 조회
│  │  └─ horoscopes.js        # 운세 조회, 순위 계산, 아이콘 경로
│  ├─ App.jsx                 # 최상위 컴포넌트
│  ├─ main.jsx                # 앱 진입점
│  └─ index.css               # 전역 스타일
├─ detail-dev.html            # 상세보기 미리보기용 임시 HTML (src/dev와 함께 사용)
├─ home-dev.html              # 메인 화면 미리보기용 임시 HTML (src/dev와 함께 사용)
├─ index.html                 # HTML 진입 파일
├─ vite.config.js             # Vite 설정
└─ package.json               # 의존성 및 실행 스크립트
```

## 별자리 상세보기 화면 접속 방법

메인 화면과 목록 화면이 아직 없어서, 상세보기 화면은 임시 진입점으로 따로 확인

1. 의존성 설치

   ```
   npm install
   ```

2. 개발 서버 실행

   ```
   npm run dev
   ```

3. 브라우저에서 아래 주소로 접속

   ```
   http://localhost:5173/detail-dev.html
   ```

## 메인 화면 접속 방법

전체 라우터 연결 전이라, 메인 화면도 임시 진입점으로 따로 확인 (별자리 클릭 시 상세보기 이동까지 확인 가능)

1. 의존성 설치

   ```
   npm install
   ```

2. 개발 서버 실행

   ```
   npm run dev
   ```

3. 브라우저에서 아래 주소로 접속

   ```
   http://localhost:5173/home-dev.html
   ```
