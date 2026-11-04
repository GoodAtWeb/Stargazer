import { motion } from 'framer-motion'
import './StarInfoCard.css'

const STATS = [
  { key: 'brightness', label: '밝기' },
  { key: 'distance', label: '거리' },
  { key: 'temperature', label: '표면 온도' },
  { key: 'size', label: '크기' },
]

// 선택한 별의 이름, 수치, 설명을 보여주는 카드
function StarInfoCard({ star, top, onMeasure, onClose }) {
  return (
    <motion.aside
      className="star-card"
      ref={(el) => el && onMeasure(el.offsetHeight)}
      style={{ top }}
      initial={{ opacity: 0, x: -12, y: '-50%' }}
      animate={{ opacity: 1, x: 0, y: '-50%' }}
      exit={{ opacity: 0, x: -12, y: '-50%' }}
      transition={{ duration: 0.25 }}
      aria-label={`${star.nameKo} 정보`}
    >
      <button type="button" className="star-card__close" onClick={onClose} aria-label="닫기">
        ×
      </button>

      <div className="star-card__head">
        <div>
          <h2>{star.nameKo}</h2>
          <p className="star-card__bayer">{star.bayer}</p>
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
            <dt>{label}</dt>
            <dd>{star[key] ?? '정보 없음'}</dd>
          </div>
        ))}
      </dl>

      <p className="star-card__desc">{star.description}</p>
    </motion.aside>
  )
}

export default StarInfoCard
