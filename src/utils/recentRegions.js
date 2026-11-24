import { resolveRegion } from '../i18n/data'

const STORAGE_KEY = 'stargazer.forecast.recentRegions'
const MAX_COUNT = 5

// 최근 검색한 지역 목록을 읽어옴 (저장소를 못 쓰는 환경이면 빈 목록)
export const getRecentRegions = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (!Array.isArray(saved)) return []
    // 한국어·영어로 따로 저장된 같은 지역은 기준 이름으로 합침
    return [...new Set(saved.map(resolveRegion))]
  } catch {
    return []
  }
}

// 지역 목록을 브라우저에 저장하고 그 목록을 반환
const saveRecentRegions = (list) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    // 저장에 실패해도 화면은 그대로 동작함
  }
  return list
}

// 검색한 지역을 맨 앞에 추가하고 (중복은 제거, 최대 5개) 새 목록을 반환
export const addRecentRegion = (input) => {
  const region = resolveRegion(input) // 언어와 상관없이 기준 이름으로 저장
  return saveRecentRegions([region, ...getRecentRegions().filter((r) => r !== region)].slice(0, MAX_COUNT))
}

// 지역 하나를 목록에서 지우고 새 목록을 반환
export const removeRecentRegion = (region) =>
  saveRecentRegions(getRecentRegions().filter((r) => r !== region))
