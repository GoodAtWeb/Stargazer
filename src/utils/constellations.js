import constellations from '../data/constellations.json'

// id로 별자리 한 개를 찾아 반환 (없으면 undefined)
export const getConstellationById = (id) =>
  constellations.find((c) => c.id === id)
