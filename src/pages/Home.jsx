import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import StarField from '../components/StarField'
import './Home.css'

const SLOW_OUT = [0.16, 1, 0.3, 1]

const MENUS = [
  { to: '/', label: '홈', active: true },
  { to: '/constellations', label: '별자리' },
  { to: '/forecast', label: '별 예보' },
  { to: '/photo', label: '사진 분석' },
]

function Home() {
  return (
    <div className="home">
      <StarField className="home__stars" />

      <div className="home__center">
        <motion.h1
          className="home__logo"
          initial={{ opacity: 0, y: 20, filter: 'blur(12px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{
            duration: 1.6,
            ease: SLOW_OUT,
            filter: { duration: 1.5, ease: 'easeOut' },
          }}
        >
          stargazer
        </motion.h1>

        <motion.nav
          className="home__menu"
          aria-label="주 메뉴"
          initial={{ opacity: 0, y: 10, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{
            duration: 1.2,
            delay: 0.7,
            ease: SLOW_OUT,
            filter: { duration: 1.1, delay: 0.7, ease: 'easeOut' },
          }}
        >
          {MENUS.map(({ to, label, active }) => (
            <Link
              key={to}
              to={to}
              className={`home__menu-link${active ? ' home__menu-link--active' : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              {label}
            </Link>
          ))}
        </motion.nav>
      </div>
    </div>
  )
}

export default Home
