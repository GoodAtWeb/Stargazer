import detailed from '../data/constellations.json'
import list from '../data/constellationList.json'

export const PAGE_SIZE = 10
export const SEASONS = ['봄', '여름', '가을', '겨울', '남반구', '연중']
export const TABS = [
  { key: 'all', label: '전체' },
  { key: 'zodiac', label: '황도 12궁' },
  { key: 'other', label: '그 외' },
]

const detailedById = Object.fromEntries(detailed.map((c) => [c.id, c]))
const DEFAULT_RADIUS = 1.3

// 등급이 작을수록(밝을수록) 큰 반지름을 반환
const getRadius = (magnitude) => Math.min(2.6, Math.max(0.9, 0.9 + (4 - magnitude) * 0.25))

// 별 좌표를 0~100 정사각형 안에 비율을 유지한 채 가운데로 맞춰 반환
const fitToBox = (stars, lines) => {
  const xs = stars.map((s) => s.x)
  const ys = stars.map((s) => s.y)
  const x0 = Math.min(...xs)
  const y0 = Math.min(...ys)
  const scale = 84 / Math.max(Math.max(...xs) - x0, Math.max(...ys) - y0, 1)
  const offsetX = 50 - ((Math.max(...xs) - x0) / 2) * scale
  const offsetY = 50 - ((Math.max(...ys) - y0) / 2) * scale
  const place = (s) => ({ x: (s.x - x0) * scale + offsetX, y: (s.y - y0) * scale + offsetY })
  const byId = Object.fromEntries(stars.map((s) => [s.id, place(s)]))
  return {
    points: stars.map((s) => ({ ...byId[s.id], r: getRadius(s.magnitude) })),
    paths: lines.map(([from, to]) => [
      [byId[from].x, byId[from].y],
      [byId[to].x, byId[to].y],
    ]),
  }
}

// 상세 데이터가 있으면 상세 화면과 같은 별 모양·이름·계절을, 없으면 목록용 데이터를 사용
const toItem = (entry) => {
  const detail = detailedById[entry.id]
  if (!detail) {
    return {
      id: entry.id,
      nameKo: entry.nameKo,
      nameEn: entry.nameEn,
      season: entry.season,
      brightStar: entry.brightStar,
      isZodiac: entry.isZodiac,
      figure: {
        points: entry.points.map(([x, y]) => ({ x, y, r: DEFAULT_RADIUS })),
        paths: entry.paths,
      },
    }
  }
  return {
    id: entry.id,
    nameKo: detail.nameKo,
    nameEn: detail.nameEn,
    season: detail.season === '사계절' ? '연중' : detail.season,
    brightStar: entry.brightStar,
    isZodiac: detail.isZodiac,
    figure: fitToBox(detail.stars, detail.lines),
  }
}

export const constellationItems = list.map(toItem)

// 탭(전체·황도 12궁·그 외)별 개수를 반환
export const countByTab = () => ({
  all: constellationItems.length,
  zodiac: constellationItems.filter((c) => c.isZodiac).length,
  other: constellationItems.filter((c) => !c.isZodiac).length,
})

// 탭과 계절 조건에 맞는 별자리만 가나다순으로 반환
export const filterConstellations = ({ tab, season }) =>
  constellationItems.filter(
    (c) =>
      (tab === 'all' || (tab === 'zodiac') === c.isZodiac) && (!season || c.season === season),
  )
