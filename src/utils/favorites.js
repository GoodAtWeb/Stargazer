import { useArchiveStore } from '../stores/archiveStore'

// 즐겨찾기 id 목록과 토글 함수를 반환하고 바뀔 때마다 브라우저에 저장
export function useFavorites() {
  const ids = useArchiveStore((s) => s.favorites)
  const toggle = useArchiveStore((s) => s.toggleFavorite)
  return [ids, toggle]
}
