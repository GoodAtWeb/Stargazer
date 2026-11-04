import horoscopes from '../data/horoscopes.json'

const icons = import.meta.glob('../assets/constellations/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
})

// id로 오늘의 운세 한 개를 찾아 반환 (없으면 undefined)
export const getHoroscopeById = (id) => horoscopes.find((h) => h.id === id)

// 점수가 높은 순으로 정렬한 12별자리 운세 목록을 반환
export const getRankedHoroscopes = () =>
  [...horoscopes].sort((a, b) => b.score - a.score)

// 별자리 id의 아이콘 주소를 반환 (active면 강조 아이콘)
export const getConstellationIcon = (id, active = false) =>
  icons[`../assets/constellations/${id}${active ? '_active' : ''}.svg`]
