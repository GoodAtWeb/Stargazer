# Stargazer

> 원하는 곳, 원하는 순간의 밤하늘을 펼쳐 보여주는 별자리 웹 애플리케이션

웹프레임워크1 [A] **웹잘알팀** 프로젝트

## 목차

1. [프로젝트 소개](#1-프로젝트-소개)
2. [팀원](#2-팀원)
3. [프로젝트 구조](#3-프로젝트-구조)
4. [실행 환경](#4-실행-환경)
5. [실행 방법](#5-실행-방법)
6. [주요 기능](#6-주요-기능)
7. [시연 순서](#7-시연-순서)
8. [기술 스택](#8-기술-스택)
9. [데이터와 저장 방식](#9-데이터와-저장-방식)
10. [개발 참고](#10-개발-참고)
11. [참고 자료 및 출처](#11-참고-자료-및-출처)

---

## 1. 프로젝트 소개

별을 보고 싶어도 기존 별 관측 서비스는 전문적인 정보와 복잡한 화면 때문에 처음 시작하기 어렵습니다.
Stargazer는 초심자도 쉽게 **언제, 어디서, 무엇을** 볼 수 있는지 확인하고, 마음에 드는 별자리와 직접 찍은 밤하늘 사진을 기록으로 남길 수 있도록 만든 웹 애플리케이션입니다.

| 화면 | 한 줄 설명 |
| --- | --- |
| 메인 | 탄생 별자리 12개가 떠다니는 밤하늘에서 원하는 별자리로 바로 이동 |
| 별자리 | 88개 별자리를 둘러보고, 별자리의 유래·별 정보·관측 시기·오늘의 운세 확인 |
| 별 예보 | 지역·날짜·시간을 고르면 별 보기 점수와 그 시간의 밤하늘, 볼 수 있는 별자리 안내 |
| 사진 분석 | 밤하늘 사진을 올리면 사진 속 별을 찾아 어떤 별자리가 찍혔는지 표시 |
| 나의 기록 | 즐겨찾기한 별자리와 저장한 사진 분석 결과를 한곳에서 다시 보기 |

화면의 모든 문구는 **한국어 / English** 로 전환할 수 있습니다.

## 2. 팀원

| 이름 | 학번 | 역할 | 담당 |
| --- | --- | --- | --- |
| 박소정 | 2471290 | 팀장 | 별 예보 화면, 한국어/영어 전환 |
| 문인선 | 2471093 | 팀원 | 별자리 목록·상세보기 화면, 별자리 데이터 |
| 신채희 | 2471288 | 팀원 | 메인 화면, 나의 기록 화면 |
| 이재청 | 2271118 | 팀원 | 사진 분석 화면 |

## 3. 프로젝트 구조

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
│  │  ├─ PhotoRecordViewer.jsx # 사진 기록 크게 보기 (제목·날짜·별자리 수정, 삭제)
│  │  ├─ RecordOverlay.jsx    # 저장한 사진 위에 별자리 선을 다시 그림
│  │  ├─ SaveRecordDialog.jsx # 사진 분석 결과를 나의 기록에 저장하는 창 (제목, 날짜, 별자리 선택)
│  │  ├─ StarInfoCard.jsx     # 선택한 별의 정보 카드
│  │  ├─ ObservationSection.jsx # 관측 적기, 시간, 방향, 팁
│  │  ├─ FortuneSection.jsx   # 오늘의 운세, 궁합, 12궁 운세 순위
│  │  ├─ FloatingConstellation.jsx # 메인 화면에서 둥둥 떠다니는 별자리 (hover 확대·이름 표시, 클릭 이동)
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
│  │  ├─ VisibleConstellations.jsx # 볼 수 있는 별자리 목록 (클릭 시 상세보기 이동, 돋보기로 밤하늘에서 위치 찾기)
│  │  ├─ PhotoUploader.jsx    # 사진 올리기 (끌어다 놓기, 파일 선택)
│  │  ├─ AnalysisProgress.jsx # 사진 분석 진행률과 단계 표시
│  │  ├─ PhotoStage.jsx       # 올린 사진 위 스캔 효과와 찾은 별자리 선
│  │  └─ PhotoResultPanel.jsx # 찾은 별자리 목록, 설명, 결과 저장·나의 기록 저장 버튼
│  ├─ data/
│  │  ├─ constellations.json  # 별자리 별 상세 mock 데이터 (관측 정보 포함)
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
│  │  ├─ homePreview.jsx      # 메인 화면 단독 미리보기용 임시 진입점
│  │  └─ photoPreview.jsx     # 사진 분석 화면 단독 미리보기용 임시 진입점
│  ├─ pages/
│  │  ├─ Archive.jsx          # 나의 기록 화면 (즐겨찾기·사진 기록 탭, 빈 화면 안내)
│  │  ├─ ConstellationDetail.jsx  # 별자리 상세보기 화면 (유래, 지도, 관측 정보, 운세)
│  │  ├─ ConstellationList.jsx # 별자리 목록 화면 (탭·계절 필터, 10개씩 페이지, 즐겨찾기)
│  │  ├─ Home.jsx             # 메인 화면 (로고, 메뉴(나의 기록 포함), 12별자리 배치)
│  │  ├─ PhotoAnalysis.jsx    # 사진 분석 화면
│  │  └─ StarForecast.jsx     # 별 예보 화면 (입력 폼 + 점수, 조건, 밤하늘, 시간대별 그래프, 별자리)
│  ├─ stores/
│  │  ├─ archiveStore.js      # 나의 기록 스토어 (Zustand + persist, IndexedDB에 즐겨찾기·사진 기록 저장)
│  │  └─ revisitStore.js      # 별자리 메뉴로 돌아올 때 보던 목록·상세 화면 기억
│  ├─ utils/
│  │  ├─ constellations.js    # id로 별자리 데이터 조회
│  │  ├─ constellationList.js # 별자리 목록 데이터 가공 (탭·계절 필터, 페이지 계산)
│  │  ├─ favorites.js         # 즐겨찾기 별자리 목록과 토글 (나의 기록 스토어 사용)
│  │  ├─ photoAnalysis.js     # 사진 속 별 찾기, 별자리 모양 맞추기, 결과 이미지 만들기
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
├─ photo-dev.html             # 사진 분석 미리보기용 임시 HTML (src/dev와 함께 사용)
├─ index.html                 # HTML 진입 파일 (탭 제목: Stargazer)
├─ vite.config.js             # Vite 설정
└─ package.json               # 의존성 및 실행 스크립트 (npm start, npm run dev 등)
```

## 4. 실행 환경

| 항목 | 요구 사항 |
| --- | --- |
| Node.js | **20.19 이상** 또는 **22.12 이상** (Vite 8 요구 사항) |
| npm | Node.js에 포함된 버전 (10 이상 권장) |
| 브라우저 | Chrome, Edge 등 최신 브라우저 (Chrome 권장) |
| 운영체제 | Windows, macOS, Linux 모두 가능 |
| 인터넷 | 글꼴(Pretendard, DM Serif Display)을 CDN에서 불러옵니다. 연결이 없으면 기본 글꼴로 보이며 기능은 그대로 동작합니다. |

개발·테스트 환경: Windows 11, Node.js 24.19.0, npm 11.17.0, Chrome

Node.js 버전은 터미널에서 확인할 수 있습니다.

```bash
node -v
```

별도의 서버, 데이터베이스, API 키, 환경 변수 설정은 **필요하지 않습니다.** 모든 데이터는 프로젝트 안의 JSON 파일과 브라우저 저장소를 사용합니다.

## 5. 실행 방법

### 5-1. 기본 실행

압축을 푼 프로젝트 **최상위 폴더**(`package.json` 이 있는 폴더)에서 터미널을 열고 아래 두 명령을 차례로 실행합니다.

```bash
npm install
```

```bash
npm start
```

- `npm install`: 필요한 라이브러리를 `node_modules` 폴더에 설치합니다. (처음 한 번)
- `npm start`: 개발 서버를 실행하고 **브라우저에서 메인 화면을 자동으로 엽니다.**
- 브라우저가 자동으로 열리지 않으면 터미널에 표시된 주소(기본 `http://localhost:5173/`)로 직접 접속합니다.
- 종료하려면 터미널에서 `Ctrl + C` 를 누릅니다.

### 5-2. 그 밖의 명령

| 명령 | 설명 |
| --- | --- |
| `npm start` | 개발 서버 실행 + 브라우저 자동 열기 |
| `npm run dev` | 개발 서버만 실행 (브라우저는 직접 열기) |
| `npm run build` | 배포용 파일을 `dist` 폴더에 생성 |
| `npm run preview` | `build` 결과를 로컬에서 확인 (`npm run build` 후 실행) |
| `npm run lint` | 코드 검사 (oxlint) |
| `npm run check:i18n` | 한국어/영어 문구 누락 검사 |

### 5-3. 화면 주소

`npm start` 로 열린 메인 화면에서 상단 메뉴로 모든 화면에 이동할 수 있습니다. 주소로 바로 들어갈 수도 있습니다.

| 주소 | 화면 |
| --- | --- |
| `http://localhost:5173/` | 메인 |
| `http://localhost:5173/constellations` | 별자리 목록 |
| `http://localhost:5173/constellations/scorpio` | 별자리 상세보기 (예: 전갈자리) |
| `http://localhost:5173/forecast` | 별 예보 |
| `http://localhost:5173/photo` | 사진 분석 |
| `http://localhost:5173/archive` | 나의 기록 (즐겨찾기 탭) |
| `http://localhost:5173/archive?tab=photos` | 나의 기록 (사진 기록 탭) |

없는 주소로 접속하면 메인 화면으로 이동합니다.

### 5-4. 문제가 생겼을 때

| 증상 | 해결 방법 |
| --- | --- |
| `'vite'은(는) 내부 또는 외부 명령...이 아닙니다` 또는 `vite: command not found` | `npm install` 을 먼저 실행했는지 확인합니다. |
| Node.js 버전 관련 오류 | `node -v` 로 확인 후 Node.js 20.19 이상 또는 22.12 이상으로 설치합니다. ([nodejs.org](https://nodejs.org) 의 LTS 버전 권장) |
| `Port 5173 is in use` 등 포트가 이미 사용 중 | 다른 포트(예: 5174)로 자동 실행됩니다. 터미널에 표시된 주소로 접속합니다. |
| 브라우저가 자동으로 열리지 않음 | 터미널에 표시된 `Local:` 주소를 브라우저에 직접 입력합니다. |
| `npm install` 중 `npm warn allow-scripts ... @tsparticles/engine` 경고 | 설치 스크립트 승인 안내로, 무시해도 실행에 영향이 없습니다. |
| 즐겨찾기·사진 기록을 처음 상태로 지우고 싶음 | 브라우저 개발자 도구(F12) → Application → Storage → **Clear site data** |

## 6. 주요 기능

### 메인 화면 (`/`)

- 은하수 배경 위에 별이 반짝이고(tsparticles), 로고와 메뉴가 흐릿하게 나타났다가 선명해지는 인트로 애니메이션
- **탄생 별자리 12개**가 차례로 나타나 화면 위를 둥둥 떠다님
- 별자리에 마우스를 올리면 커지면서 밝아지고, 별자리 그림과 이름이 함께 표시됨
  - 커진 별자리는 로고·메뉴 영역과 화면 끝을 침범하지 않고, 주변 별자리는 겹치지 않을 만큼만 자연스럽게 비켜남
- 별자리를 누르면 해당 별자리 상세보기로 이동
- 휴대폰처럼 세로로 긴 화면에서는 별자리를 로고 위아래로 고르게 다시 배치

### 별자리 목록 (`/constellations`)

- **88개 별자리**를 카드로 보여주고, `전체 / 황도 12궁 / 그 외` 탭과 `봄 / 여름 / 가을 / 겨울 / 연중` 계절 필터로 골라 보기
- 10개씩 페이지로 나누어 보기 (탭·계절·페이지가 주소에 남아 뒤로 가기에도 유지)
- 카드의 ✦ 를 눌러 즐겨찾기 추가·해제

### 별자리 상세보기 (`/constellations/:id`)

- 별자리 이름, 상징·원소·수호성·계절, 별자리 유래
- 별과 선으로 그린 **별자리 지도**: 별을 누르면 밝기·거리·온도 등 별 정보 카드 표시
- 관측하기 좋은 달, 시간, 방향과 관측 팁
- 황도 12궁은 **오늘의 운세**(애정·금전·학업·건강운, 행운의 색·숫자·시간대, 궁합)와 12궁 운세 순위

### 별 예보 (`/forecast`)

- 지역·날짜·시간을 입력하면 **별 보기 점수(100점 만점)** 와 달·구름·빛공해·습도 조건 표시
- **시간대별 별 보기 점수** 그래프로 가장 좋은 시간 안내
- **밤하늘 미리보기**: 선택한 시간·지역의 하늘에 떠 있는 별자리와 달 표시, 방향 전환, 더블클릭하면 크게 보며 마우스로 끌어서 돌려보기
- **오늘 밤 볼 수 있는 별자리** 목록 (누르면 상세보기, 돋보기로 하늘에서 위치 찾기)
- 최근 검색한 지역 바로가기

### 사진 분석 (`/photo`)

- 밤하늘 사진을 끌어다 놓거나 선택해서 올리기 (JPG, PNG, WEBP · 최대 20MB · 사진은 서버로 전송되지 않고 브라우저 안에서만 분석)
- 사진의 밝은 점을 찾아 별 위치를 구하고, 별자리 모양과 맞춰 보는 과정을 스캔 애니메이션으로 표시
- 찾은 별자리를 사진 위에 선으로 그리고, 일치도(%)·찾은 별 개수·가장 밝은 별·추정 방향 표시
- 결과 이미지 다운로드, **나의 기록에 저장**
  - 제목(기본값: `yy-mm-dd 별자리 사진`), 날짜(기본값: 사진의 촬영일 EXIF, 없으면 오늘)를 정하고, 함께 저장할 별자리를 선택

### 나의 기록 (`/archive`)

- **즐겨찾기 탭**: 즐겨찾기한 별자리 카드 (별자리 모양, 기간, 오늘의 운세 점수·순위). ✦ 를 누르면 해제
- **사진 기록 탭**: 저장한 사진과 별자리 선, 제목, 날짜, 별자리 이름
  - 카드를 누르면 크게 보기, 제목·날짜 수정, 기록할 별자리 다시 선택(분석에서 찾은 별자리 중), 삭제
- 기록은 브라우저에 저장되어 새로고침하거나 다시 접속해도 남아 있음

### 공통

- 상단 메뉴바로 모든 화면 이동, 오른쪽 `KO ▾ / EN ▾` 에서 **한국어/영어 전환** (새로고침 없이 전체 화면 변경, 고른 언어 저장)
- 휴대폰·태블릿 화면 대응

## 7. 시연 순서

데모 영상과 같은 흐름으로 확인할 수 있는 순서입니다.

1. `npm start` → 메인 화면에서 인트로 애니메이션 확인, 별자리에 마우스를 올려 확대·이름 표시 확인
2. 메인 화면에서 별자리(예: 전갈자리) 클릭 → **상세보기**에서 별 클릭, 관측 정보·오늘의 운세 확인
3. 상단 메뉴 **별자리** → 탭·계절 필터 사용, 마음에 드는 별자리 ✦ 클릭(즐겨찾기)
4. 상단 메뉴 **별 예보** → 지역·날짜·시간 입력 → 점수, 시간대별 그래프, 밤하늘 미리보기, 볼 수 있는 별자리 확인
5. 상단 메뉴 **사진 분석** → 밤하늘 사진 업로드 → 찾은 별자리 확인 → **나의 기록에 저장**
6. 상단 메뉴 **나의 기록** → 즐겨찾기 탭과 사진 기록 탭 확인, 사진 기록 크게 보기·수정
7. 오른쪽 위 `KO ▾` → `EN` 으로 바꿔 영어 화면 확인

## 8. 기술 스택

### 8-1. 실행에 사용하는 라이브러리 (`dependencies`)

`npm install` 로 아래 버전이 설치됩니다. (`package-lock.json` 기준)

| 라이브러리 | 버전 | 용도 | 주로 사용하는 곳 |
| --- | --- | --- | --- |
| [react](https://react.dev) / react-dom | 19.3.1 | 화면 컴포넌트 구성과 렌더링 | 전체 |
| [react-router-dom](https://reactrouter.com) | 7.18.5 | 페이지 이동, 주소(쿼리)에 탭·필터·페이지 상태 유지, 상세보기로 이동 | `App.jsx`, 각 페이지, `TopNav.jsx` |
| [framer-motion](https://motion.dev) | 14.9.0 | 인트로, 별자리 떠다니기·hover 확대·주변 비켜나기, 카드 등장·삭제, 별 예보 화면 애니메이션 | `Home.jsx`, `FloatingConstellation.jsx`, `Archive.jsx`, `StarForecast.jsx`, `PhotoStage.jsx` 등 |
| [@tsparticles/react](https://particles.js.org) | 4.6.0 | 파티클 효과를 React 컴포넌트로 사용 | `StarField.jsx` |
| [@tsparticles/slim](https://particles.js.org) | 4.6.0 | 반짝이는 별 모양·깜빡임·마우스 반응 기능 묶음 | `StarField.jsx` |
| [zustand](https://zustand.docs.pmnd.rs) | 5.0.16 | 상태 관리. `persist` 로 즐겨찾기·사진 기록을 새로고침 후에도 유지, 별자리 메뉴로 돌아올 때 보던 화면 기억 | `stores/archiveStore.js`, `stores/revisitStore.js` |
| [idb-keyval](https://github.com/jakearchibald/idb-keyval) | 6.3.0 | 사진처럼 큰 데이터를 브라우저 IndexedDB에 저장 (Zustand persist의 저장소) | `stores/archiveStore.js` |
| [exifr](https://github.com/MikeKovarik/exifr) | 7.1.3 | 사진의 EXIF 정보에서 촬영일을 읽어 사진 기록의 기본 날짜로 사용 | `utils/photoRecord.js` |
| [i18next](https://www.i18next.com) | 27.2.2 | 다국어 문구 관리 (언어 저장, 문구 사전) | `i18n/index.js` |
| [react-i18next](https://react.i18next.com) | 18.0.3 | React 컴포넌트에서 `t('키')` 로 한국어/영어 문구 사용 | 전체 화면 |

### 8-2. 화면별 사용 라이브러리

| 라이브러리 | 메인 | 별자리 목록 | 별자리 상세 | 별 예보 | 사진 분석 | 나의 기록 |
| --- | :---: | :---: | :---: | :---: | :---: | :---: |
| react-router-dom | ● | ● | ● | ● | ● | ● |
| react-i18next / i18next | ● | ● | ● | ● | ● | ● |
| framer-motion | ● |  | ● | ● | ● | ● |
| @tsparticles/react, slim | ● |  |  |  |  |  |
| zustand |  | ● | ● |  | ● | ● |
| idb-keyval |  | ● |  |  | ● | ● |
| exifr |  |  |  |  | ● |  |

**메인 화면**

- `@tsparticles/react`, `@tsparticles/slim`: 배경에서 반짝이고 마우스에 반응하는 별 (`StarField.jsx`)
- `framer-motion`: 로고·메뉴 인트로, 별자리가 차례로 나타나 떠다니는 움직임, hover 확대와 주변 별자리 비켜나기 (`Home.jsx`, `FloatingConstellation.jsx`)
- `react-router-dom`: 메뉴 이동, 별자리 클릭 시 상세보기로 이동 (`Link`, `useNavigate`)
- `react-i18next`: 메뉴·별자리 이름, 오른쪽 위 언어 선택 (`LanguageSwitch.jsx`)

**별자리 목록**

- `react-router-dom`: 탭·계절·페이지를 주소(`?tab=&season=&page=`)에 저장해 뒤로 가기에도 유지 (`useSearchParams`), 카드 클릭 시 상세보기 이동 (`Link`)
- `zustand` + `idb-keyval`: 카드의 ✦ 즐겨찾기 추가·해제를 나의 기록 스토어에 저장 (`utils/favorites.js`)
- `react-i18next`: 탭·필터·카드 문구

**별자리 상세보기**

- `framer-motion`: 별자리 지도의 별·선이 그려지는 효과, 배경 그림이 서서히 나타남, 별 정보 카드 열고 닫기 (`ConstellationMap.jsx`, `ConstellationArt.jsx`, `StarInfoCard.jsx`)
- `react-router-dom`: 주소의 별자리 id 읽기 (`useParams`), 목록으로 돌아가기, 궁합·운세 순위의 별자리로 이동
- `zustand`: 별자리 메뉴로 다시 돌아올 때 보던 상세 화면 기억 (`stores/revisitStore.js`)
- `react-i18next`: 별자리 설명·관측 정보·운세 문구

**별 예보**

- `framer-motion`: 결과 카드 등장, 점수 게이지 숫자가 올라가는 효과(`useSpring`), 시간대별 그래프 그리기, 밤하늘 드래그 회전(`useMotionValue`), 최근 지역·볼 수 있는 별자리 목록 추가·삭제 (`StarForecast.jsx`, `ScoreCard.jsx`, `HourlyChart.jsx`, `NightSky.jsx` 등)
- `react-router-dom`: 밤하늘이나 별자리 목록에서 별자리를 누르면 상세보기로 이동
- `react-i18next`: 지역·날짜·조건 문구
- 최근 검색 지역은 라이브러리 없이 localStorage에 저장 (`utils/recentRegions.js`)

**사진 분석**

- `exifr`: 사진의 촬영일(EXIF)을 읽어 저장 창의 기본 날짜로 사용 (`utils/photoRecord.js`)
- `zustand` + `idb-keyval`: 분석 결과(사진, 제목, 날짜, 별자리)를 나의 기록에 저장 (`SaveRecordDialog.jsx`)
- `framer-motion`: 사진 위 스캔 효과와 별자리 선, 저장 창 열고 닫기 (`PhotoStage.jsx`, `SaveRecordDialog.jsx`)
- `react-router-dom`: 찾은 별자리의 상세보기로 이동, 저장 후 나의 기록(사진 기록 탭)으로 이동
- 사진 속 별 찾기는 라이브러리 없이 Canvas로 직접 구현 (`utils/photoAnalysis.js`)

**나의 기록**

- `zustand` + `idb-keyval`: 즐겨찾기·사진 기록을 IndexedDB에서 불러오고 수정·삭제 (`stores/archiveStore.js`, `persist`)
- `framer-motion`: 카드 등장·삭제 애니메이션(`AnimatePresence`), 사진 기록 크게 보기 창 (`Archive.jsx`, `FavoriteCard.jsx`, `PhotoRecordCard.jsx`, `PhotoRecordViewer.jsx`)
- `react-router-dom`: 즐겨찾기/사진 기록 탭을 주소(`?tab=photos`)에 저장, 카드에서 별자리 상세보기로 이동
- `react-i18next`: 탭·빈 화면 안내 문구

### 8-3. 개발에 사용하는 도구 (`devDependencies`)

| 도구 | 버전 | 용도 |
| --- | --- | --- |
| [vite](https://vite.dev) | 8.3.5 | 개발 서버(`npm start`, `npm run dev`), 빌드(`npm run build`) |
| @vitejs/plugin-react | 6.2.1 | Vite에서 React(JSX), 빠른 새로고침 지원 |
| [oxlint](https://oxc.rs) | 1.91.0 | 코드 검사 (`npm run lint`) |
| @types/react, @types/react-dom | 19.3.0 | 에디터 자동완성용 타입 정보 |

### 8-4. 라이브러리 없이 직접 구현한 부분

| 기능 | 구현 방법 | 파일 |
| --- | --- | --- |
| 별자리 지도, 별 클릭 정보 | SVG + React State | `ConstellationMap.jsx`, `StarInfoCard.jsx` |
| 밤하늘 위치 계산 | 별의 적경·적위를 날짜·시간·위도·경도로 고도·방위각으로 변환 | `utils/sky.js` |
| 밤하늘 미리보기 | SVG, 마우스 드래그로 시점 회전 | `NightSky.jsx` |
| 시간대별 별 보기 점수 그래프 | SVG 곡선 | `HourlyChart.jsx` |
| 별 보기 점수 원형 게이지 | SVG | `ScoreCard.jsx` |
| 사진 속 별 찾기, 별자리 모양 맞추기 | Canvas로 사진의 밝은 점을 찾고, 별자리 별 배치와 비교 | `utils/photoAnalysis.js` |
| 사진 올리기 (끌어다 놓기) | 브라우저 기본 Drag & Drop API | `PhotoUploader.jsx` |
| 별 예보 입력 폼 | React State + 브라우저 기본 날짜·시간 입력 | `ForecastForm.jsx` |
| 사진 기록 썸네일·저장 사진 | Canvas로 사진 크기 줄이기, SVG로 별자리 선 다시 그리기 | `utils/photoRecord.js`, `RecordOverlay.jsx` |

### 8-5. 계획 대비 변경 사항

프로젝트 계획 발표 때 정한 라이브러리 중 일부는, 구현하면서 필요한 기능이 작거나 직접 제어가 더 필요해 다음과 같이 바꿨습니다.

| 계획 | 실제 | 이유 |
| --- | --- | --- |
| astronomy-engine (천체 위치 계산) | `utils/sky.js` 직접 계산 | 별자리 위치만 필요해서 적경·적위 변환만 간단히 구현 |
| Recharts (시간대별 그래프) | SVG 직접 구현 | 그래프 하나뿐이라 화면 디자인에 맞춰 직접 그리는 편이 간단함 |
| React Hook Form, react-datepicker (입력 폼) | React State + 브라우저 기본 입력 | 입력 칸이 지역·날짜·시간 3개뿐이라 추가 라이브러리 없이 충분함 |
| react-dropzone (사진 업로드) | 브라우저 기본 Drag & Drop API | 사진 한 장 업로드에는 기본 기능으로 충분함 |
| Zustand + persist (즐겨찾기·기록) | 그대로 사용 + idb-keyval 추가 | 사진 기록은 용량이 커서 localStorage 대신 IndexedDB에 저장 |
| (계획에 없음) | i18next, react-i18next | 한국어/영어 전환 기능 추가 |

## 9. 데이터와 저장 방식

**별자리·예보 데이터** (`src/data/`)

- 별 위치와 별자리 선은 [d3-celestial](https://github.com/ofrohn/d3-celestial), 별 정보(밝기·거리·온도 등)는 [HYG Database](https://github.com/astronexus/HYG-Database) 오픈 데이터를 바탕으로 정리했습니다.
- 별자리 88개의 이름·계절, 운세, 별 예보 조건은 수업 프로젝트용으로 직접 정리한 **mock(예시) 데이터**입니다.
- 실제 날씨·천문 API는 호출하지 않으므로 인터넷 연결이나 API 키 없이 동작합니다.
- 별 예보의 밤하늘 위치는 별의 적경·적위를 선택한 날짜·시간·지역에 맞게 계산해서 그립니다 (`src/utils/sky.js`).

**사용자 기록** (브라우저 안에만 저장, 서버 전송 없음)

| 저장 내용 | 저장 위치 |
| --- | --- |
| 즐겨찾기, 사진 기록(사진, 제목, 날짜, 별자리) | IndexedDB (`keyval-store` → `stargazer.archive`) |
| 별 예보 최근 검색 지역 | localStorage (`stargazer.forecast.recentRegions`) |
| 선택한 언어 | localStorage |

- 사진 기록의 사진은 긴 변 1600px JPEG로 줄여서 저장합니다.
- 기록은 브라우저(그리고 주소)마다 따로 저장됩니다. 다른 브라우저나 시크릿 창에서는 빈 상태로 보입니다.

## 10. 개발 참고

팀 개발 중에 사용한 메모입니다. 실행에는 필요하지 않습니다.

### 화면 이동 동작

- 상단 메뉴의 "별자리"를 누르면 별자리 목록으로 이동하고, 카드를 누르면 상세보기로 이동 (상세보기 왼쪽 위 ← 버튼으로 목록 복귀)
- 별자리 목록에서 ✦를 누른 별자리가 나의 기록의 즐겨찾기 탭에 모이고, 카드의 ✦를 누르면 해제
- 사진 분석 결과에서 "나의 기록에 저장"을 누르면 제목·날짜(기본값: 사진 촬영일, 없으면 오늘)와 저장할 별자리를 골라 사진 기록 탭에 저장
- 사진 기록을 누르면 크게 보고 제목·날짜를 수정하거나 삭제할 수 있음
- 나의 기록은 브라우저 IndexedDB에 저장 (예전 localStorage 즐겨찾기는 처음 열 때 자동으로 옮겨짐)
- 예전 주소 `/favorites` 는 `/archive` 로 이동
- 별자리 상세보기로 이동하면 맨 위부터 보이고, 별 예보는 갔다 돌아오면 보던 위치를 기억 (새로고침하면 초기화)
- 별 예보의 밤하늘이나 "오늘 밤 볼 수 있는 별자리" 목록에서 별자리를 누르면 해당 상세보기로 이동

### 화면별 임시 진입점

라우터 없이 `src/dev` 의 진입점으로 각 화면만 따로 확인하고 싶을 때 사용합니다. `npm run dev` 실행 후 아래 주소로 접속합니다.

| 주소 | 내용 |
| --- | --- |
| `http://localhost:5173/detail-dev.html` | 별자리 목록이 먼저 열리고, 카드를 누르면 상세보기로 이동 (상단 메뉴의 홈, 별 예보, 사진 분석도 이동 가능) |
| `http://localhost:5173/home-dev.html` | 메인 화면 (별자리 클릭 시 상세보기 이동까지 확인 가능) |
| `http://localhost:5173/photo-dev.html` | 사진 분석 화면 |

### 별 예보 더미 데이터

더미 데이터는 `src/data/forecastData.json` 에서 고치면 점수와 그래프가 같이 바뀜

- `moons`: 날짜별 달 (밝기 %, 뜨는/지는 시각)
- `weather`: 지역 > 날짜별 구름, 습도 (18시~04시, 11칸). 없는 날짜는 지역의 `default`, 없는 지역은 맨 위 `default` 사용
- `regions`: 지역별 Bortle 등급

밤하늘(`NightSky`) 데이터 교체 방법

- `skyData.json` 의 `constellations`: 별자리 중심의 적경(ra), 적위(dec)(도 단위)와 크기(span). 별 모양은 `constellations.json` 의 x, y 그림을 이 중심 주위에 펼쳐서 그림
- 실제 별 좌표를 쓰려면 `constellations.json` 의 각 별에 `"ra"`, `"dec"`(도 단위)를 넣으면 그 좌표를 그대로 사용
- `skyData.json` 의 `background`: 배경 별 목록 `{ "ra", "dec", "mag" }`. 실제 별 카탈로그로 바꿔도 코드 수정 없이 동작

### 한국어 / English 전환

[react-i18next](https://react.i18next.com/) 로 구현. 메뉴바 오른쪽(메인 화면은 오른쪽 위)의 `KO ▾ / EN ▾` 에서 언어를 고르면 새로고침 없이 화면 전체가 바뀜. 고른 언어는 저장되고, 처음 접속하면 브라우저 언어(한국어면 한국어, 그 외 영어)로 시작

새 화면 문구를 추가하는 방법

1. `src/locales/ko.json`, `src/locales/en.json` 에 같은 키로 문장을 한 줄씩 추가 (`{name}` 처럼 쓰면 값이 들어감)
2. 컴포넌트에서 `const { t } = useTranslation()` (`react-i18next`) 로 `t('키')`, `t('키', { name })` 사용 (컴포넌트 밖 함수에서는 `import { t } from '../i18n'`)
3. 별자리·별 이름은 문구 사전이 아니라 `src/i18n/data.js` 의 `getConstellationName(id)`, `getStarName(star)`, `getConstellationById(id)` 사용
4. 날짜, 요일, 지역 이름도 `src/i18n/data.js` (`formatMonthDay`, `getWeekdayName`, `getRegionLabel` 등) 사용

새 별자리, 별 설명을 추가하면 영어 번역도 `src/data/constellations.en.json` 에 같이 추가 (없으면 그 글만 한국어로 보임). 운세는 `horoscopes.en.json`

번역 누락 검사

```bash
npm run check:i18n
```

- `ko.json` 과 `en.json` 의 키, `{자리표시자}` 가 맞는지
- 코드에서 쓴 `t('키')` 가 사전에 있는지
- 번역 없이 코드에 직접 적은 한글이 없는지 (의도한 한글은 줄 끝에 `// i18n-ignore`)

사용자가 직접 쓴 사진 기록 제목, 메모는 번역하지 않고 쓴 그대로 보여줌

## 11. 참고 자료 및 출처

### 글꼴

| 글꼴 | 사용한 곳 | 출처 | 라이선스 |
| --- | --- | --- | --- |
| Pretendard | 전체 화면 본문 | [orioncactus/pretendard](https://github.com/orioncactus/pretendard) (jsDelivr CDN, v1.3.9) | SIL Open Font License 1.1 |
| DM Serif Display | 메인 화면 로고 `stargazer` | [Google Fonts](https://fonts.google.com/specimen/DM+Serif+Display) | SIL Open Font License 1.1 |

### 데이터

| 자료 | 사용한 곳 | 출처 | 라이선스 |
| --- | --- | --- | --- |
| 별 위치, 별자리 데이터 | 별자리 지도·목록의 별자리 모양, 별 예보 밤하늘 | [d3-celestial](https://github.com/ofrohn/d3-celestial) (Olaf Frohn) | BSD 3-Clause |
| 별 정보 (밝기, 거리, 온도 등) | 별자리 상세보기의 별 정보 카드 | [HYG Database](https://github.com/astronexus/HYG-Database) (오픈 데이터) | CC BY-SA 4.0 |

### 이미지

| 자료 | 사용한 곳 | 출처 |
| --- | --- | --- |
| 배경 사진 `src/assets/bg/milkyway.jpg` | 메인·별자리 상세 배경 | AI(Claude)로 생성 |
| 별자리 그림·아이콘 `src/assets/art`, `src/assets/constellations` | 메인 화면 별자리, 상세보기 배경 그림, 운세·사진 분석 아이콘 | AI(Claude)로 제작 (외부 이미지 사용 없음) |

### 라이선스

이 프로젝트는 [MIT License](LICENSE) 를 따릅니다.
