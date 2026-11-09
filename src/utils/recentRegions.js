const STORAGE_KEY = 'stargazer.forecast.recentRegions'
const MAX_COUNT = 5

// 최근 검색한 지역 목록을 읽어옴 (저장소를 못 쓰는 환경이면 빈 목록)
export const getRecentRegions = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

const saveRecentRegions = (list) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    // 저장에 실패해도 화면은 그대로 동작
  }
  return list
}

// 검색한 지역을 맨 앞에 추가하고 (중복은 제거, 최대 5개) 새 목록을 반환
export const addRecentRegion = (region) =>
  saveRecentRegions([region, ...getRecentRegions().filter((r) => r !== region)].slice(0, MAX_COUNT))

// 지역 하나를 목록에서 지우고 새 목록을 반환
export const removeRecentRegion = (region) =>
  saveRecentRegions(getRecentRegions().filter((r) => r !== region))
