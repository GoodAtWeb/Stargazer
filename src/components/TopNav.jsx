import { NavLink, useLocation } from 'react-router-dom'
import './TopNav.css'

const MENUS = [
  { to: '/', label: '홈', end: true },
  { to: '/constellations', label: '별자리' },
  { to: '/forecast', label: '별 예보' },
  { to: '/photo', label: '사진 분석' },
  { to: '/archive', label: '나의 기록' },
]

// 다른 페이지에 갔다가 별자리 메뉴로 돌아오면 보던 목록·상세 화면으로 이동하기 위한 값
// 모듈 변수라서 새로고침하면 사라지고, 페이지 이동에는 남아 있음
let lastConstellationPage = null

// 로고, 페이지 이동 메뉴, 언어 표시로 이루어진 상단 메뉴바
function TopNav() {
  const location = useLocation()
  const inConstellations = location.pathname.startsWith('/constellations')
  if (inConstellations) lastConstellationPage = location

  return (
    <nav className="top-nav" aria-label="주 메뉴">
      <NavLink to="/" className="top-nav__logo">
        Stargazer
      </NavLink>
      <ul className="top-nav__menu">
        {MENUS.map(({ to, label, end }) => (
          <li key={to}>
            <NavLink
              to={
                to === '/constellations' && !inConstellations && lastConstellationPage
                  ? lastConstellationPage.pathname + lastConstellationPage.search
                  : to
              }
              state={
                to === '/constellations' && !inConstellations && lastConstellationPage
                  ? { ...lastConstellationPage.state, restore: true }
                  : undefined
              }
              end={end}
              className={({ isActive }) =>
                `top-nav__link${isActive ? ' top-nav__link--active' : ''}`
              }
            >
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
      <span className="top-nav__lang">KO ▾</span>
    </nav>
  )
}

export default TopNav
