import { del, get, set } from 'idb-keyval'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

const STORE_KEY = 'stargazer.archive'
const LEGACY_FAVORITES_KEY = 'stargazer.favorites'

// 사진 용량 때문에 localStorage 대신 IndexedDB 사용
const idbStorage = {
  getItem: async (name) => (await get(name)) ?? null,
  setItem: (name, value) => set(name, value),
  removeItem: (name) => del(name),
}

const readLegacyFavorites = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(LEGACY_FAVORITES_KEY))
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

export const useArchiveStore = create(
  persist(
    (setState) => ({
      hydrated: false,
      legacyMigrated: false,
      favorites: [],
      photoRecords: [],

      toggleFavorite: (id) =>
        setState((s) => ({
          favorites: s.favorites.includes(id)
            ? s.favorites.filter((x) => x !== id)
            : [...s.favorites, id],
        })),

      addPhotoRecord: (record) => setState((s) => ({ photoRecords: [record, ...s.photoRecords] })),

      updatePhotoRecord: (id, changes) =>
        setState((s) => ({
          photoRecords: s.photoRecords.map((r) => (r.id === id ? { ...r, ...changes } : r)),
        })),

      removePhotoRecord: (id) =>
        setState((s) => ({ photoRecords: s.photoRecords.filter((r) => r.id !== id) })),
    }),
    {
      name: STORE_KEY,
      storage: createJSONStorage(() => idbStorage),
      partialize: ({ legacyMigrated, favorites, photoRecords }) => ({
        legacyMigrated,
        favorites,
        photoRecords,
      }),
      onRehydrateStorage: () => (state) => {
        const changes = { hydrated: true }
        // 스토어 도입 전 localStorage 즐겨찾기는 한 번만 옮김
        if (!state?.legacyMigrated) {
          const legacy = readLegacyFavorites()
          const current = state?.favorites ?? []
          changes.favorites = [...current, ...legacy.filter((id) => !current.includes(id))]
          changes.legacyMigrated = true
          try {
            localStorage.removeItem(LEGACY_FAVORITES_KEY)
          } catch {
            // 무시
          }
        }
        useArchiveStore.setState(changes)
      },
    },
  ),
)
