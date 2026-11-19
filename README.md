# Stargazer
웹프레임워크[A] 웹잘알팀 프로젝트

## 디렉터리 구조

```
Stargazer/
├─ public/                    # 빌드 시 그대로 복사되는 정적 파일 (favicon.svg: 탭 아이콘)
├─ src/
│  ├─ assets/
│  │  ├─ art/                 # 별자리 상세 지도 뒤에 깔리는 연한 배경 그림 (별자리 id.svg, 메인 화면 hover 그림으로도 사용)
│  │  ├─ bg/                  # 상세·메인 페이지 배경 사진 (milkyway.jpg)
│  │  └─ constellations/      # 별자리 아이콘 (id.svg, id_active.svg)
│  ├─ components/
│  │  ├─ ConstellationArt.jsx # 별자리 배경 그림을 별 좌표에 맞춰 표시
│  │  ├─ ConstellationCard.jsx # 별자리 목록의 카드 (모양, 이름, 계절·대표 별, 즐겨찾기)
│  │  ├─ ConstellationFigure.jsx # 별 좌표와 선으로 그리는 작은 별자리 모양 (목록 카드용)
│  │  ├─ ConstellationMap.jsx # 별과 선으로 그리는 SVG 별자리 지도 (별 클릭 선택)
│  │  ├─ FavoriteCard.jsx     # 즐겨찾기 카드 (모양, 이름, 기간, 오늘의 운세, 해제)
│  │  ├─ PhotoRecordCard.jsx  # 사진 기록 카드 (사진 + 별자리 선, 제목, 날짜, 별자리 이동)
│  │  ├─ PhotoRecordViewer.jsx # 사진 기록 크게 보기 (제목·날짜 수정, 삭제)
│  │  ├─ RecordOverlay.jsx    # 저장한 사진 위에 별자리 선을 다시 그림
│  │  ├─ SaveRecordDialog.jsx # 사진 분석 결과를 나의 기록에 저장하는 창 (제목, 날짜, 별자리 선택)
│  │  ├─ StarInfoCard.jsx     # 선택한 별의 정보 카드
│  │  ├─ ObservationSection.jsx # 관측 적기, 시간, 방향, 팁
│  │  ├─ FortuneSection.jsx   # 오늘의 운세, 궁합, 12궁 운세 순위
│  │  ├─ FloatingConstellation.jsx # 메인 화면에서 둥둥 떠다니는 별자리 (hover 확대, 클릭 이동)
│  │  ├─ StarField.jsx        # 메인 화면 배경 반짝이는 별 (tsparticles)
│  │  ├─ TopNav.jsx           # 상단 메뉴바 (홈, 별자리, 별 예보, 사진 분석, 나의 기록 이동, 언어 선택)
│  │  ├─ LanguageSwitch.jsx   # 한국어/English 선택 드롭다운 (메뉴바, 메인 화면 오른쪽 위)
│  │  ├─ ForecastForm.jsx     # 별 예보 입력 폼 (지역, 날짜, 시간)
│  │  ├─ RecentRegions.jsx    # 최근 검색한 지역 바로가기 (localStorage)
│  │  ├─ ScoreCard.jsx        # 관측 적합도 점수 원형 게이지
│  │  ├─ ConditionCard.jsx    # 달, 구름, 빛공해, 습도 조건 목록
│  │  ├─ HourlyChart.jsx      # 시간대별 점수 곡선 그래프
│  │  ├─ NightSky.jsx         # 선택한 시간의 밤하늘 (별, 별자리, 달, 방향 전환, 드래그, 전체 화면, 별자리 클릭 시 상세보기 이동)
│  │  ├─ TwinkleStars.jsx     # 별 예보 화면 배경에서 하나씩 반짝이는 별
│  │  └─ VisibleConstellations.jsx # 볼 수 있는 별자리 목록 (클릭 시 상세보기 이동, 돋보기로 밤하늘에서 위치 찾기)
│  ├─ data/
│  │  ├─ constellations.json  # 12별자리 + 대표 별자리 10개 별 상세 mock 데이터 (관측 정보 포함)
│  │  ├─ constellationList.json # 88개 별자리 목록 데이터 (모양, 계절, 대표 별)
│  │  ├─ horoscopes.json      # 12별자리 운세 mock 데이터
│  │  ├─ forecastData.json    # 별 예보 mock 데이터 (지역 위치와 빛공해, 달, 시간별 구름·습도)
│  │  ├─ skyData.json         # 밤하늘 mock 데이터 (별자리 중심 좌표, 배경 별)
│  │  ├─ constellations.en.json # 별자리 설명 영어 번역 (유래, 관측 팁, 별 설명, 별 한 줄 소개)
│  │  └─ horoscopes.en.json   # 12별자리 운세 영어 번역
│  ├─ i18n/
│  │  ├─ index.js             # react-i18next 설정 (언어 저장, <html lang>), 컴포넌트 밖에서 쓰는 t(), getLang()
│  │  └─ data.js              # 별자리·별 이름과 정보, 날짜·요일 표기, 지역 이름을 현재 언어로 바꿔 주는 도우미
│  ├─ locales/
│  │  ├─ ko.json, en.json     # 화면 문구 사전 (키 이름은 두 파일이 똑같아야 함)
│  ├─ dev/
│  │  ├─ detailPreview.jsx    # 별자리 목록·상세보기 등 화면 미리보기용 임시 진입점
│  │  └─ homePreview.jsx      # 메인 화면 단독 미리보기용 임시 진입점
│  ├─ pages/
│  │  ├─ Archive.jsx          # 나의 기록 화면 (즐겨찾기·사진 기록 탭, 빈 화면 안내)
│  │  ├─ ConstellationDetail.jsx  # 별자리 상세보기 화면 (유래, 지도, 관측 정보, 운세)
│  │  ├─ ConstellationList.jsx # 별자리 목록 화면 (탭·계절 필터, 10개씩 페이지, 즐겨찾기)
│  │  ├─ Home.jsx             # 메인 화면 (로고, 메뉴(나의 기록 포함), 12별자리 배치)
│  │  ├─ PhotoAnalysis.jsx    # 사진 분석 화면
│  │  └─ StarForecast.jsx     # 별 예보 화면 (입력 폼 + 점수, 조건, 밤하늘, 시간대별 그래프, 별자리)
│  ├─ stores/
│  │  └─ archiveStore.js      # 나의 기록 스토어 (Zustand + persist, IndexedDB에 즐겨찾기·사진 기록 저장)
│  ├─ utils/
│  │  ├─ constellations.js    # id로 별자리 데이터 조회
│  │  ├─ constellationList.js # 별자리 목록 데이터 가공 (탭·계절 필터, 페이지 계산)
│  │  ├─ favorites.js         # 즐겨찾기 별자리 목록과 토글 (나의 기록 스토어 사용)
│  │  ├─ photoRecord.js       # 사진 기록 도우미 (사진 줄이기, 촬영일 EXIF 읽기, 기본 제목)
│  │  ├─ horoscopes.js        # 운세 조회, 순위 계산, 아이콘 경로
│  │  ├─ forecast.js          # 별 예보 더미 계산 (점수, 달, 구름, 습도, 별자리)
│  │  ├─ recentRegions.js     # 최근 검색 지역 저장 (localStorage)
│  │  └─ sky.js               # 별 좌표(적경·적위)를 날짜, 시간, 지역에 맞는 하늘 위치로 계산
│  ├─ App.jsx                 # 라우터 설정 (페이지 주소 연결, 이동 시 스크롤 위치 관리)
│  ├─ main.jsx                # 앱 진입점
│  └─ index.css               # 전역 스타일 (body 여백 제거, 화면 꽉 채우기만 설정)
├─ scripts/
│  └─ check-i18n.mjs          # 번역 누락 검사 (npm run check:i18n)
├─ detail-dev.html            # 별자리 목록·상세보기 미리보기용 임시 HTML (src/dev와 함께 사용)
├─ home-dev.html              # 메인 화면 미리보기용 임시 HTML (src/dev와 함께 사용)
├─ index.html                 # HTML 진입 파일 (탭 제목: Stargazer)
├─ vite.config.js             # Vite 설정
└─ package.json               # 의존성 및 실행 스크립트
```

## 접속 방법

1. 의존성 설치 (처음 한 번, 패키지가 추가되면 다시)

   ```
   npm install
   ```

2. 개발 서버 실행

   ```
   npm run dev
   ```

3. 브라우저에서 `http://localhost:5173/` 로 접속하면 메인 화면이 열리고, 상단 메뉴로 다른 화면 이동

| 주소 | 화면 |
| --- | --- |
| `/` | 메인 화면 |
| `/constellations` | 별자리 목록 |
| `/forecast` | 별 예보 |
| `/photo` | 사진 분석 |
| `/archive` | 나의 기록 (즐겨찾기, `?tab=photos` 사진 기록). 예전 주소 `/favorites`는 여기로 이동 |
| `/constellations/:id` | 별자리 상세보기 (예: `/constellations/aries`) |

- 상단 메뉴의 "별자리"를 누르면 별자리 목록으로 이동하고, 카드를 누르면 상세보기로 이동 (상세보기 왼쪽 위 ← 버튼으로 목록 복귀)
- 별자리 목록에서 ✦를 누른 별자리가 나의 기록의 즐겨찾기 탭에 모이고, 카드의 ✦를 누르면 해제
- 사진 분석 결과에서 "나의 기록에 저장"을 누르면 제목·날짜(기본값: 사진 촬영일, 없으면 오늘)와 저장할 별자리를 골라 사진 기록 탭에 저장
- 사진 기록을 누르면 크게 보고 제목·날짜를 수정하거나 삭제할 수 있음
- 나의 기록은 브라우저 IndexedDB에 저장 (예전 localStorage 즐겨찾기는 처음 열 때 자동으로 옮겨짐)
- 없는 주소로 접속하면 메인 화면으로 이동
- 별자리 상세보기로 이동하면 맨 위부터 보이고, 별 예보는 갔다 돌아오면 보던 위치를 기억 (새로고침하면 초기화)
- 별 예보의 밤하늘이나 "오늘 밤 볼 수 있는 별자리" 목록에서 별자리를 누르면 해당 상세보기로 이동

아래 임시 진입점은 각 화면만 따로 확인하고 싶을 때 사용 (라우터 없이 `src/dev` 의 진입점으로 열림)

## 별자리 목록·상세보기 화면 임시 진입점

별자리 목록이 먼저 열리고, 카드를 누르면 상세보기로 이동 (상단 메뉴의 홈, 별 예보, 사진 분석도 이동 가능)

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

## 메인 화면 임시 진입점

별자리 클릭 시 상세보기 이동까지 확인 가능

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

## 별 예보 더미 데이터

더미 데이터는 `src/data/forecastData.json` 에서 고치면 점수와 그래프가 같이 바뀜

- `moons`: 날짜별 달 (밝기 %, 뜨는/지는 시각)
- `weather`: 지역 > 날짜별 구름, 습도 (18시~04시, 11칸). 없는 날짜는 지역의 `default`, 없는 지역은 맨 위 `default` 사용
- `regions`: 지역별 Bortle 등급

밤하늘(`NightSky`) 데이터 교체 방법

- `skyData.json` 의 `constellations`: 별자리 중심의 적경(ra), 적위(dec)(도 단위)와 크기(span). 별 모양은 `constellations.json` 의 x, y 그림을 이 중심 주위에 펼쳐서 그림
- 실제 별 좌표를 쓰려면 `constellations.json` 의 각 별에 `"ra"`, `"dec"`(도 단위)를 넣으면 그 좌표를 그대로 사용
- `skyData.json` 의 `background`: 배경 별 목록 `{ "ra", "dec", "mag" }`. 실제 별 카탈로그로 바꿔도 코드 수정 없이 동작

## 한국어 / English 전환

[react-i18next](https://react.i18next.com/) 로 구현. 메뉴바 오른쪽(메인 화면은 오른쪽 위)의 `KO ▾ / EN ▾` 에서 언어를 고르면 새로고침 없이 화면 전체가 바뀜. 고른 언어는 저장되고, 처음 접속하면 브라우저 언어(한국어면 한국어, 그 외 영어)로 시작

새 화면 문구를 추가하는 방법

1. `src/locales/ko.json`, `src/locales/en.json` 에 같은 키로 문장을 한 줄씩 추가 (`{name}` 처럼 쓰면 값이 들어감)
2. 컴포넌트에서 `const { t } = useTranslation()` (`react-i18next`) 로 `t('키')`, `t('키', { name })` 사용 (컴포넌트 밖 함수에서는 `import { t } from '../i18n'`)
3. 별자리·별 이름은 문구 사전이 아니라 `src/i18n/data.js` 의 `getConstellationName(id)`, `getStarName(star)`, `getConstellationById(id)` 사용
4. 날짜, 요일, 지역 이름도 `src/i18n/data.js` (`formatMonthDay`, `getWeekdayName`, `getRegionLabel` 등) 사용

새 별자리, 별 설명을 추가하면 영어 번역도 `src/data/constellations.en.json` 에 같이 추가 (없으면 그 글만 한국어로 보임). 운세는 `horoscopes.en.json`

번역 누락 검사

```
npm run check:i18n
```

- `ko.json` 과 `en.json` 의 키, `{자리표시자}` 가 맞는지
- 코드에서 쓴 `t('키')` 가 사전에 있는지
- 번역 없이 코드에 직접 적은 한글이 없는지 (의도한 한글은 줄 끝에 `// i18n-ignore`)

사용자가 직접 쓴 사진 기록 제목, 메모는 번역하지 않고 쓴 그대로 보여줌
