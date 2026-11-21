import { create } from 'zustand'

// 다른 페이지에 갔다가 돌아오면 보던 별자리 화면을 다시 열어주려고 기억함 (새로고침하면 사라짐)
export const useRevisitStore = create((setState) => ({
  lastPage: null,
  selectedStars: {},

  setLastPage: (page) => setState({ lastPage: page }),

  setSelectedStar: (constellationId, starId) =>
    setState((s) => ({ selectedStars: { ...s.selectedStars, [constellationId]: starId } })),
}))
