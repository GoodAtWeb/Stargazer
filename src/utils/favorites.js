import { useEffect, useState } from 'react'

const STORAGE_KEY = 'stargazer.favorites'

// 브라우저에 저장된 즐겨찾기 별자리 id 목록을 읽어 반환
const loadFavorites = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

// 즐겨찾기 id 목록과 토글 함수를 반환하고 바뀔 때마다 브라우저에 저장
export function useFavorites() {
  const [ids, setIds] = useState(loadFavorites)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
    } catch {
      return
    }
  }, [ids])

  const toggle = (id) =>
    setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  return [ids, toggle]
}
