import horoscopes from '../data/horoscopes.json'
import horoscopesEn from '../data/horoscopes.en.json'
import { getLang } from '../i18n'
import { getConstellationName } from '../i18n/data'

const icons = import.meta.glob('../assets/constellations/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
})

// "오전 10시~오후 12시" → "10 AM – 12 PM"
const toEnglishTime = (text) =>
  text
    .replace(/(오전|오후)\s*(\d+)시/g, (_, ap, h) => `${h} ${ap === '오전' ? 'AM' : 'PM'}`) // i18n-ignore
    .replace('~', ' – ')

// 운세 한 개를 현재 언어로 바꿔 반환 (영어는 번역 데이터를 덮어씌움)
const localize = (h) => {
  if (getLang() !== 'en') return { ...h, name: getConstellationName(h.id) }
  const en = horoscopesEn[h.id]
  if (!en) return { ...h, name: getConstellationName(h.id), luckyTime: toEnglishTime(h.luckyTime) }
  return {
    ...h,
    name: getConstellationName(h.id),
    summary: en.summary,
    love: { ...h.love, comment: en.love },
    money: { ...h.money, comment: en.money },
    work: { ...h.work, comment: en.work },
    health: { ...h.health, comment: en.health },
    luckyColor: { ...h.luckyColor, name: en.color },
    luckyTime: toEnglishTime(h.luckyTime),
    compatibility: h.compatibility.map((c, i) => ({ ...c, comment: en.compat[i] ?? c.comment })),
  }
}

// id로 오늘의 운세 한 개를 찾아 반환 (없으면 undefined)
export const getHoroscopeById = (id) => {
  const found = horoscopes.find((h) => h.id === id)
  return found && localize(found)
}

// 점수가 높은 순으로 정렬한 12별자리 운세 목록을 반환
export const getRankedHoroscopes = () =>
  [...horoscopes].sort((a, b) => b.score - a.score).map(localize)

// 별자리 id의 아이콘 주소를 반환 (active면 강조 아이콘)
export const getConstellationIcon = (id, active = false) =>
  icons[`../assets/constellations/${id}${active ? '_active' : ''}.svg`]
