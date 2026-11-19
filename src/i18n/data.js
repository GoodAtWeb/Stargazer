import constellations from '../data/constellations.json'
import overlay from '../data/constellations.en.json' // { taglines: {한국어: 영어}, constellations: { id: { origin, tip, stars: { 별id: 설명 } } } }
import { getLang } from './index'

const byId = Object.fromEntries(constellations.map((c) => [c.id, c]))

// ── 별자리 이름 ─────────────────────────────────────────────

// 화면에 크게 보여줄 이름 (한국어: 양자리, 영어: Aries)
export const getConstellationName = (id) => {
  const c = byId[id]
  if (!c) return id
  return getLang() === 'en' ? c.nameEn : c.nameKo
}

// 이름 아래에 작게 보여줄 보조 이름 (한국어: Aries, 영어: 라틴어 이름이 다를 때만 Scorpius)
export const getConstellationSubName = (id) => {
  const c = byId[id]
  if (!c) return ''
  if (getLang() === 'ko') return c.nameEn
  return c.nameLatin !== c.nameEn ? c.nameLatin : ''
}

// ── 별 이름과 정보 ──────────────────────────────────────────

// 영어 이름은 'Mesarthim · γ Arietis'의 앞부분, 이름이 없는 별은 'λ Geminorum' 같은 기호
export const getStarName = (star) => {
  if (getLang() === 'ko') return star.nameKo
  return star.bayer.split(' · ')[0]
}

// 이름 아래에 보여줄 별 기호 (영어는 이름과 기호가 같으면 생략)
export const getStarDesignation = (star) => {
  if (getLang() === 'ko') return star.bayer
  const [name, designation] = star.bayer.split(' · ')
  return designation ? `${name} · ${designation}` : ''
}

const BADGES = {
  '다중성계': 'Multiple star system',
  '삼중성계': 'Triple star system',
  '쌍성계': 'Binary system',
  '이중성': 'Double star',
  '분광 쌍성': 'Spectroscopic binary',
  '식쌍성': 'Eclipsing binary',
  '변광성': 'Variable star',
  '세페이드 변광성': 'Cepheid variable',
  '백색 변광성': 'White variable star',
  '백색 쌍성': 'White binary',
  '황색 거성 쌍성': 'Yellow giant binary',
}
const BADGE_COLORS = {
  '주황색': 'Orange', '백색': 'White', '황색': 'Yellow', '청백색': 'Blue-white',
  '황백색': 'Yellow-white', '적색': 'Red', '청색': 'Blue',
}
const BADGE_KINDS = {
  '별': 'star', '거성': 'giant', '준거성': 'subgiant', '초거성': 'supergiant',
  '밝은 거성': 'bright giant', '주계열성': 'main-sequence star',
}
const translateBadge = (ko) => {
  if (BADGES[ko]) return BADGES[ko]
  const [color, ...rest] = ko.split(' ')
  const kind = BADGE_KINDS[rest.join(' ')]
  return BADGE_COLORS[color] && kind ? `${BADGE_COLORS[color]} ${kind}` : ko
}

const num = '[-\\d.,]+'
// '약 0.85등급', '3.4~4.2등급(변광)' 같은 밝기 표기를 영어로
const translateBrightness = (ko) => {
  let en = ko
    .replace(new RegExp(`^약 (${num})~(${num})등급$`), 'About magnitude $1–$2')
    .replace(new RegExp(`^약 (${num})등급 \\((${num})~(${num}) 변광\\)$`), 'About magnitude $1 (varies $2–$3)')
    .replace(new RegExp(`^약 (${num})등급\\(변광\\)$`), 'About magnitude $1 (variable)')
    .replace(new RegExp(`^(${num})~(${num})등급\\(변광\\)$`), 'Magnitude $1–$2 (variable)')
    .replace(new RegExp(`^약 (${num})등급$`), 'About magnitude $1')
    .replace(new RegExp(`^(${num})~(${num})등급$`), 'Magnitude $1–$2')
    .replace(new RegExp(`^(${num})등급$`), 'Magnitude $1')
  return en
}
const translateDistance = (ko) => ko.replace(new RegExp(`^약 (${num})광년$`), 'About $1 light-years')
const translateTemperature = (ko) =>
  ko
    .replace(new RegExp(`^약 (${num})~(${num})K$`), 'About $1–$2 K')
    .replace(new RegExp(`^약 (${num})K$`), 'About $1 K')
const translateSize = (ko) =>
  ko
    .replace(new RegExp(`^태양의 약 (${num})~(${num})배$`), 'About $1–$2× the Sun')
    .replace(new RegExp(`^태양의 약 (${num})배$`), 'About $1× the Sun')

// ── 별자리 정보 ─────────────────────────────────────────────

const SYMBOLS = {
  '숫양': 'Ram', '황소': 'Bull', '쌍둥이': 'Twins', '게': 'Crab', '사자': 'Lion', '처녀': 'Maiden',
  '천칭': 'Scales', '전갈': 'Scorpion', '궁수': 'Archer', '염소': 'Sea-goat', '물병': 'Water bearer', '물고기': 'Fish',
}
const ELEMENTS = { '불': 'Fire', '흙': 'Earth', '바람': 'Air', '물': 'Water' }
const PLANETS = {
  '태양': 'Sun', '달': 'Moon', '수성': 'Mercury', '금성': 'Venus', '화성': 'Mars', '목성': 'Jupiter', '토성': 'Saturn',
}
const SEASONS = { '봄': 'Spring', '여름': 'Summer', '가을': 'Autumn', '겨울': 'Winter', '연중': 'Year-round', '사계절': 'Year-round' }

export const translateSeason = (ko) => (getLang() === 'en' ? (SEASONS[ko] ?? ko) : ko)

// '8월~10월 (남반구)', '일 년 내내 (특히 7월)', '1월 (남반구 기준)' 같은 달 표기를 영어로
const translateMonths = (ko, short) =>
  ko
    .replace(/(\d+)월~(\d+)월/g, (_, a, b) => `${getMonthName(a, short)}–${getMonthName(b, short)}`)
    .replace(/특히 (\d+)월/g, (_, m) => `especially ${getMonthName(m, short)}`)
    .replace(/거의 일 년 내내/g, 'almost year-round')
    .replace(/일 년 내내/g, 'Year-round')
    .replace(/(\d+)월/g, (_, m) => getMonthName(m, short))
    .replace(/남반구 기준/g, 'Southern Hemisphere')
    .replace(/남반구/g, 'Southern Hemisphere')

const POSITIONS = [
  ['한국에서는 볼 수 없는 남쪽 하늘', 'Southern sky, not visible from Korea'],
  ['북쪽 하늘 (북극 근처)', 'Northern sky (near the celestial pole)'],
  ['머리 위 가까이 북쪽', 'Near overhead, to the north'],
  ['머리 위 가까이', 'Near overhead'],
  ['남쪽 지평선 가까이', 'Near the southern horizon'],
  ['남쪽 낮은 하늘', 'Low in the southern sky'],
  ['남쪽 하늘', 'Southern sky'],
  ['북쪽 하늘', 'Northern sky'],
]
const translatePosition = (ko) => {
  const found = POSITIONS.find(([prefix]) => ko.startsWith(prefix))
  if (!found) return ko
  const rest = ko.slice(found[0].length).replace(/\(고도 약 (\d+)°\)/, '(altitude about $1°)')
  return `${found[1]}${rest}`
}
const TIMES = { '저녁 9시 무렵': 'Around 9 PM', '해가 진 뒤 언제든': 'Any time after sunset' }

const cache = new Map()

// 별 하나를 현재 언어로 바꿔서 반환 (원본 필드는 그대로 두고 화면용 필드를 덮어씀)
const localizeStar = (star, constellationId) => {
  if (getLang() === 'ko') return { ...star, name: star.nameKo, designation: star.bayer }
  return {
    ...star,
    name: getStarName(star),
    designation: getStarDesignation(star),
    badge: translateBadge(star.badge),
    tagline: overlay.taglines?.[star.tagline] ?? star.tagline,
    brightness: star.brightness && translateBrightness(star.brightness),
    distance: star.distance && translateDistance(star.distance),
    temperature: star.temperature && translateTemperature(star.temperature),
    size: star.size && translateSize(star.size),
    description: overlay.constellations?.[constellationId]?.stars?.[star.id] ?? star.description,
  }
}

// 별자리 상세 데이터를 현재 언어로 바꿔 반환 (없으면 undefined). 같은 언어·id는 같은 객체를 돌려줌
export const getConstellationById = (id) => {
  const lang = getLang()
  const key = `${lang}:${id}`
  if (cache.has(key)) return cache.get(key)
  const c = byId[id]
  if (!c) return undefined
  let result
  if (lang === 'ko') {
    result = { ...c, name: c.nameKo, subName: c.nameEn, stars: c.stars.map((s) => localizeStar(s, id)) }
  } else {
    const o = c.observation
    result = {
      ...c,
      name: c.nameEn,
      subName: getConstellationSubName(id),
      symbol: SYMBOLS[c.symbol] ?? c.symbol,
      element: ELEMENTS[c.element] ?? c.element,
      rulingPlanet: PLANETS[c.rulingPlanet] ?? c.rulingPlanet,
      season: translateSeason(c.season),
      origin: overlay.constellations?.[id]?.origin ?? c.origin,
      observation: {
        ...o,
        bestMonth: translateMonths(o.bestMonth, false),
        season: translateMonths(o.season, true),
        time: TIMES[o.time] ?? o.time,
        position: translatePosition(o.position),
        tip: overlay.constellations?.[id]?.tip ?? o.tip,
      },
      stars: c.stars.map((s) => localizeStar(s, id)),
    }
  }
  cache.set(key, result)
  return result
}

const BRIGHT_STAR_NAMES = {
  '미잔': 'Mizan', '페르시안': 'Persian', '프라에시푸아': 'Praecipua', '앤서': 'Anser', '라브룸': 'Labrum',
}

// 대표(가장 밝은) 별 이름: 영어는 별 데이터의 이름을 찾아 쓰고, 이미 기호(α Ant)면 그대로 씀
export const getBrightStarName = (id, ko) => {
  if (!ko || getLang() === 'ko') return ko
  const star = byId[id]?.stars.find((s) => s.nameKo === ko)
  if (star) return getStarName(star)
  return BRIGHT_STAR_NAMES[ko] ?? ko
}

// 별자리 id와 별 id로 현재 언어의 별 하나를 찾음 (사진 분석처럼 원본 별만 가진 곳에서 사용)
export const getLocalizedStar = (constellationId, starId) =>
  getConstellationById(constellationId)?.stars.find((s) => s.id === starId)

// 모든 별자리 id (원본 순서)
export const allConstellationIds = constellations.map((c) => c.id)

// ── 날짜·시간 표기 ───────────────────────────────────────────
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const MONTHS_SHORT = MONTHS.map((m) => m.slice(0, 3))
const WEEKDAYS = {
  ko: ['일', '월', '화', '수', '목', '금', '토'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
}

export const getMonthName = (month, short = false) =>
  (short ? MONTHS_SHORT : MONTHS)[month - 1]

// 요일 (0=일요일)
export const getWeekdayName = (weekday) => WEEKDAYS[getLang()][weekday]

// 10월 23일 / October 23
export const formatMonthDay = (month, day) =>
  getLang() === 'en' ? `${MONTHS[month - 1]} ${day}` : `${month}월 ${day}일`

// 2026년 10월 23일 / October 23, 2026
export const formatFullDate = (year, month, day) =>
  getLang() === 'en' ? `${MONTHS[month - 1]} ${day}, ${year}` : `${year}년 ${month}월 ${day}일`

// 22:00 → 22시 / 22:00 (그래프 눈금용)
export const formatHourLabel = (hour) => {
  const h = String(hour % 24).padStart(2, '0')
  return getLang() === 'en' ? `${h}:00` : `${h}시`
}

// ── 지역 이름 ───────────────────────────────────────────────
// 예보 데이터는 한국어 지역 이름을 기준으로 저장돼 있어서, 영어 이름을 같은 지역으로 연결해 줌
const REGION_EN = {
  '서울특별시 성북구': { full: 'Seongbuk-gu, Seoul', short: 'Seongbuk-gu' },
  '서울특별시 종로구': { full: 'Jongno-gu, Seoul', short: 'Jongno-gu' },
  '경기도 가평군': { full: 'Gapyeong-gun, Gyeonggi-do', short: 'Gapyeong-gun' },
  '강원특별자치도 영월군': { full: 'Yeongwol-gun, Gangwon', short: 'Yeongwol-gun' },
  '경상북도 영천시': { full: 'Yeongcheon-si, Gyeongsangbuk-do', short: 'Yeongcheon-si' },
  '부산광역시 해운대구': { full: 'Haeundae-gu, Busan', short: 'Haeundae-gu' },
  '전라남도 신안군': { full: 'Sinan-gun, Jeollanam-do', short: 'Sinan-gun' },
  '제주특별자치도 제주시': { full: 'Jeju-si, Jeju', short: 'Jeju-si' },
}

const normalize = (text) => text.trim().toLowerCase()

// 한국어/영어 어느 쪽으로 입력해도 데이터에 있는 한국어 지역 이름으로 바꿔 줌 (없으면 입력 그대로)
export const resolveRegion = (input) => {
  const key = normalize(input)
  const found = Object.entries(REGION_EN).find(
    ([ko, en]) => normalize(ko) === key || normalize(en.full) === key || normalize(en.short) === key,
  )
  return found ? found[0] : input.trim()
}

// 현재 언어로 보여줄 지역 이름 (full: 전체, short: 짧은 이름)
export const getRegionLabel = (koName, short = false) => {
  const en = REGION_EN[koName]
  if (getLang() === 'en' && en) return short ? en.short : en.full
  return short ? koName.trim().split(/\s+/).pop() : koName
}
