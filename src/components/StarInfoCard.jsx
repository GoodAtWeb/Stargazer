import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import './StarInfoCard.css'

const STATS = [
  { key: 'brightness', label: 'star.brightness' },
  { key: 'distance', label: 'star.distance' },
  { key: 'temperature', label: 'star.temperature' },
  { key: 'size', label: 'star.size' },
]

// 선택한 별의 이름, 수치, 설명을 보여주는 카드
function StarInfoCard({ star, top, onMeasure, onClose }) {
  const { t } = useTranslation()
  return (
    <motion.aside
      className="star-card"
      ref={(el) => el && onMeasure(el.offsetHeight)}
      style={{ top }}
      initial={{ opacity: 0, x: -12, y: '-50%' }}
      animate={{ opacity: 1, x: 0, y: '-50%' }}
      exit={{ opacity: 0, x: -12, y: '-50%' }}
      transition={{ duration: 0.25 }}
      aria-label={t('star.info', { name: star.name })}
    >
      <button type="button" className="star-card__close" onClick={onClose} aria-label={t('star.close')}>
        ×
      </button>

      <div className="star-card__head">
        <div>
          <h2>{star.name}</h2>
          {star.designation && <p className="star-card__bayer">{star.designation}</p>}
        </div>
        {(star.badge || star.tagline) && (
          <p className="star-card__badge">
            {star.badge && <strong>{star.badge}</strong>}
            {star.tagline && <span>{star.tagline}</span>}
          </p>
        )}
      </div>

      <dl className="star-card__stats">
        {STATS.map(({ key, label }) => (
          <div key={key}>
            <dt>{t(label)}</dt>
            <dd>{star[key] ?? t('star.noInfo')}</dd>
          </div>
        ))}
      </dl>

      <p className="star-card__desc">{star.description}</p>
    </motion.aside>
  )
}

export default StarInfoCard
