import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './VisibleConstellations.css'

// 별 좌표의 범위에 맞춰 작은 별자리 아이콘을 그림
function ConstellationIcon({ stars, lines }) {
  const xs = stars.map((s) => s.x)
  const ys = stars.map((s) => s.y)
  const minX = Math.min(...xs)
  const minY = Math.min(...ys)
  const scale = 28 / Math.max(Math.max(...xs) - minX, Math.max(...ys) - minY, 1)
  const offsetX = (32 - (Math.max(...xs) - minX) * scale) / 2
  const offsetY = (32 - (Math.max(...ys) - minY) * scale) / 2
  const point = (s) => ({ x: (s.x - minX) * scale + offsetX, y: (s.y - minY) * scale + offsetY })
  const byId = Object.fromEntries(stars.map((s) => [s.id, point(s)]))

  return (
    <svg className="visible-list__icon" viewBox="0 0 32 32" aria-hidden="true">
      {lines.map(([a, b]) => (
        <line key={`${a}-${b}`} x1={byId[a].x} y1={byId[a].y} x2={byId[b].x} y2={byId[b].y} />
      ))}
      {stars.map((s) => (
        <circle key={s.id} cx={byId[s.id].x} cy={byId[s.id].y} r="1.8" />
      ))}
    </svg>
  )
}

// 선택한 시간에 볼 수 있는 별자리를 보여주고, 누르면 상세 페이지로 이동
function VisibleConstellations({ items, activeId, onActive, onFind }) {
  const { t } = useTranslation()
  return (
    <section className="forecast-card visible-list">
      <h2>{t('visible.title')}</h2>
      {items.length === 0 ? (
        <p className="visible-list__empty">{t('visible.empty')}</p>
      ) : (
        <ul className="visible-list__items">
          <AnimatePresence mode="popLayout" initial={false}>
            {items.map(({ id, name, direction, stars, lines }) => (
              <motion.li
                key={id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ type: 'spring', stiffness: 220, damping: 26 }}
              >
                <div
                  className={activeId === id ? 'visible-list__item visible-list__item--active' : 'visible-list__item'}
                  onPointerEnter={() => onActive(id)}
                  onPointerLeave={() => onActive(null)}
                >
                  <Link to={`/constellations/${id}`} className="visible-list__link">
                    <ConstellationIcon stars={stars} lines={lines} />
                    <span>
                      <strong>{name}</strong>
                      <small>{direction}</small>
                    </span>
                  </Link>
                  <button
                    type="button"
                    className="visible-list__find"
                    onClick={() => onFind(id)}
                    aria-label={t('visible.findAria', { name })}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <circle cx="10.5" cy="10.5" r="6" />
                      <path d="M15 15l5 5" />
                    </svg>
                  </button>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </section>
  )
}

export default VisibleConstellations
