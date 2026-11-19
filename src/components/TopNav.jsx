import { useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useRevisitStore } from '../stores/revisitStore'
import LanguageSwitch from './LanguageSwitch'
import './TopNav.css'

const MENUS = [
  { to: '/', label: 'nav.home', end: true },
  { to: '/constellations', label: 'nav.constellations' },
  { to: '/forecast', label: 'nav.forecast' },
  { to: '/photo', label: 'nav.photo' },
  { to: '/archive', label: 'nav.archive' },
]

// 로고, 페이지 이동 메뉴, 언어 표시로 이루어진 상단 메뉴바
function TopNav() {
  const { t } = useTranslation()
  const location = useLocation()
  const inConstellations = location.pathname.startsWith('/constellations')
  const lastPage = useRevisitStore((s) => s.lastPage)
  const setLastPage = useRevisitStore((s) => s.setLastPage)

  useEffect(() => {
    if (inConstellations) setLastPage(location)
  }, [inConstellations, location, setLastPage])

  return (
    <nav className="top-nav" aria-label={t('nav.label')}>
      <NavLink to="/" className="top-nav__logo">
        Stargazer
      </NavLink>
      <ul className="top-nav__menu">
        {MENUS.map(({ to, label, end }) => (
          <li key={to}>
            <NavLink
              to={
                to === '/constellations' && !inConstellations && lastPage
                  ? lastPage.pathname + lastPage.search
                  : to
              }
              state={
                to === '/constellations' && !inConstellations && lastPage
                  ? { ...lastPage.state, restore: true }
                  : undefined
              }
              end={end}
              className={({ isActive }) =>
                `top-nav__link${isActive ? ' top-nav__link--active' : ''}`
              }
            >
              {t(label)}
            </NavLink>
          </li>
        ))}
      </ul>
      <LanguageSwitch />
    </nav>
  )
}

export default TopNav
