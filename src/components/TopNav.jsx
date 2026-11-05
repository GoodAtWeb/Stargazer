import { NavLink } from 'react-router-dom'
import './TopNav.css'

const MENUS = [
  { to: '/', label: '홈', end: true },
  { to: '/constellations', label: '별자리' },
  { to: '/forecast', label: '별 예보' },
  { to: '/photo', label: '사진 분석' },
]

// 로고, 페이지 이동 메뉴, 언어 표시로 이루어진 상단 메뉴바
function TopNav() {
  return (
    <nav className="top-nav" aria-label="주 메뉴">
      <NavLink to="/" className="top-nav__logo">
        Stargazer
      </NavLink>
      <ul className="top-nav__menu">
        {MENUS.map(({ to, label, end }) => (
          <li key={to}>
            <NavLink
              to={to}
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
