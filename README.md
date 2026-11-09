# Stargazer
웹프레임워크[A] 웹잘알팀 프로젝트

## 디렉터리 구조

```
Stargazer/
├─ public/                    # 빌드 시 그대로 복사되는 정적 파일 (favicon 등)
├─ src/
│  ├─ assets/
│  │  ├─ art/                 # 별자리 상세 지도 뒤에 깔리는 연한 배경 그림 (별자리 id.svg)
│  │  ├─ bg/                  # 상세 페이지 배경 사진 (milkyway.jpg)
│  │  └─ constellations/      # 별자리 아이콘 (id.svg, id_active.svg)
│  ├─ components/
│  │  ├─ ConstellationArt.jsx # 별자리 배경 그림을 별 좌표에 맞춰 표시
│  │  ├─ ConstellationMap.jsx # 별과 선으로 그리는 SVG 별자리 지도 (별 클릭 선택)
│  │  ├─ StarInfoCard.jsx     # 선택한 별의 정보 카드
│  │  ├─ ObservationSection.jsx # 관측 적기, 시간, 방향, 팁
│  │  ├─ FortuneSection.jsx   # 오늘의 운세, 궁합, 12궁 운세 순위
│  │  ├─ TopNav.jsx           # 상단 메뉴바 (구색만 갖춤)
│  │  ├─ ForecastForm.jsx     # 별 예보 입력 폼 (지역, 날짜, 시간)
│  │  ├─ RecentRegions.jsx    # 최근 검색한 지역 바로가기 (localStorage)
│  │  ├─ ScoreCard.jsx        # 관측 적합도 점수 원형 게이지
│  │  ├─ ConditionCard.jsx    # 달, 구름, 빛공해, 습도 조건 카드
│  │  ├─ HourlyChart.jsx      # 시간대별 점수 막대 그래프
│  │  ├─ NightSky.jsx         # 선택한 시간의 밤하늘 (별, 별자리, 달, 방향 전환)
│  │  └─ VisibleConstellations.jsx # 볼 수 있는 별자리 목록
│  ├─ data/
│  │  ├─ constellations.json  # 12별자리 + 대표 별자리 별 mock 데이터
│  │  ├─ horoscopes.json      # 12별자리 운세 mock 데이터
│  │  ├─ forecastData.json    # 별 예보 mock 데이터 (지역 위치와 빛공해, 달, 시간별 구름·습도)
│  │  └─ skyData.json         # 밤하늘 mock 데이터 (별자리 중심 좌표, 배경 별)
│  ├─ dev/
│  │  ├─ detailPreview.jsx    # 상세보기 화면 단독 미리보기용 임시 진입점
│  │  └─ forecastPreview.jsx  # 별 예보 화면 단독 미리보기용 임시 진입점
│  ├─ pages/
│  │  ├─ ConstellationDetail.jsx  # 별자리 상세보기 화면 (유래, 지도, 관측 정보, 운세)
│  │  └─ StarForecast.jsx     # 별 예보 화면 (입력 폼 + 점수, 조건, 시간대별 그래프, 별자리)
│  ├─ utils/
│  │  ├─ constellations.js    # id로 별자리 데이터 조회
│  │  ├─ horoscopes.js        # 운세 조회, 순위 계산, 아이콘 경로
│  │  ├─ forecast.js          # 별 예보 더미 계산 (점수, 달, 구름, 습도, 별자리)
│  │  ├─ recentRegions.js     # 최근 검색 지역 저장 (localStorage)
│  │  └─ sky.js               # 별 좌표(적경·적위)를 날짜, 시간, 지역에 맞는 하늘 위치로 계산
│  ├─ App.jsx                 # 최상위 컴포넌트
│  ├─ main.jsx                # 앱 진입점
│  └─ index.css               # 전역 스타일
├─ detail-dev.html            # 상세보기 미리보기용 임시 HTML (src/dev와 함께 사용)
├─ forecast-dev.html          # 별 예보 미리보기용 임시 HTML (src/dev와 함께 사용)
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

## 별 예보 화면 접속 방법

위와 같이 `npm run dev` 후 아래 주소로 접속

```
http://localhost:5173/forecast-dev.html
```

더미 데이터는 `src/data/forecastData.json` 에서 고치면 점수와 그래프가 같이 바뀜

- `moons`: 날짜별 달 (밝기 %, 뜨는/지는 시각)
- `weather`: 지역 > 날짜별 구름, 습도 (18시~04시, 11칸). 없는 날짜는 지역의 `default`, 없는 지역은 맨 위 `default` 사용
- `regions`: 지역별 Bortle 등급

밤하늘(`NightSky`) 데이터 교체 방법

- `skyData.json` 의 `constellations`: 별자리 중심의 적경(ra), 적위(dec)(도 단위)와 크기(span). 별 모양은 `constellations.json` 의 x, y 그림을 이 중심 주위에 펼쳐서 그림
- 실제 별 좌표를 쓰려면 `constellations.json` 의 각 별에 `"ra"`, `"dec"`(도 단위)를 넣으면 그 좌표를 그대로 사용
- `skyData.json` 의 `background`: 배경 별 목록 `{ "ra", "dec", "mag" }`. 실제 별 카탈로그로 바꿔도 코드 수정 없이 동작
