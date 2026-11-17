import { useEffect, useLayoutEffect, useRef } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Archive from './pages/Archive'
import ConstellationDetail from './pages/ConstellationDetail'
import ConstellationList from './pages/ConstellationList'
import Home from './pages/Home'
import PhotoAnalysis from './pages/PhotoAnalysis'
import StarForecast from './pages/StarForecast'

// 스크롤 위치를 기억해 둘 페이지 (별 예보는 갔다 와도 보던 자리 그대로)
const KEEP_SCROLL = ['/forecast']
const savedScroll = {}

// 페이지가 바뀌면 맨 위부터, 단 KEEP_SCROLL 페이지는 마지막 위치로
function ScrollManager() {
  const { pathname } = useLocation()
  const current = useRef(pathname)
  current.current = pathname // 렌더 시점에 갱신 → 새 페이지의 스크롤이 이전 페이지 기록을 덮지 않음

  useEffect(() => {
    const onScroll = () => {
      savedScroll[current.current] = window.scrollY
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useLayoutEffect(() => {
    const y = KEEP_SCROLL.includes(pathname) ? savedScroll[pathname] || 0 : 0
    window.scrollTo(0, y)
  }, [pathname])

  return null
}

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
