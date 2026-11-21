import { useEffect, useLayoutEffect, useRef } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Archive from './pages/Archive'
import ConstellationDetail from './pages/ConstellationDetail'
import ConstellationList from './pages/ConstellationList'
import Home from './pages/Home'
import PhotoAnalysis from './pages/PhotoAnalysis'
import StarForecast from './pages/StarForecast'

// 스크롤 위치를 기억해둘 페이지 (별 예보, 사진 분석은 갔다 와도 보던 자리 그대로)
// 별자리 상세는 상단 메뉴로 돌아왔을 때(state.restore)만 보던 자리로 돌려놓음
const KEEP_SCROLL = ['/forecast', '/photo']
const savedScroll = {}

// 페이지가 바뀌면 맨 위로 올리고, KEEP_SCROLL 페이지는 마지막 위치로 되돌림
function ScrollManager() {
  const { pathname, state } = useLocation()
  const current = useRef(pathname)
  current.current = pathname // 렌더 시점에 갱신해서 새 페이지의 스크롤이 이전 페이지 기록을 덮지 않게 함

  useEffect(() => {
    const onScroll = () => {
      savedScroll[current.current] = window.scrollY
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useLayoutEffect(() => {
    const keep =
      KEEP_SCROLL.includes(pathname) ||
      (pathname.startsWith('/constellations/') && state?.restore)
    window.scrollTo(0, keep ? savedScroll[pathname] || 0 : 0)
  }, [pathname, state])

  return null
}

// 주소마다 보여줄 페이지를 연결하는 라우터 (스크롤 위치 관리 포함)
function App() {
  return (
    <BrowserRouter>
      <ScrollManager />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/forecast" element={<StarForecast />} />
        <Route path="/photo" element={<PhotoAnalysis />} />
        <Route path="/constellations" element={<ConstellationList />} />
        <Route path="/constellations/:id" element={<ConstellationDetail />} />
        <Route path="/archive" element={<Archive />} />
        <Route path="/favorites" element={<Navigate to="/archive" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
