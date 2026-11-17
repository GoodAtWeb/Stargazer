import { useArchiveStore } from '../stores/archiveStore'

export function useFavorites() {
  const ids = useArchiveStore((s) => s.favorites)
  const toggle = useArchiveStore((s) => s.toggleFavorite)
  return [ids, toggle]
}
