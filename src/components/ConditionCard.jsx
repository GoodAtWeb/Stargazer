import { motion } from 'framer-motion'
import './ConditionCard.css'

// 달, 구름, 빛공해, 습도처럼 관측 조건 하나를 값과 상태 막대로 보여주는 카드
function ConditionCard({ title, value, unit, level, quality, description }) {
  return (
    <section className="forecast-card condition-card">
      <header className="condition-card__head">
        <h2>{title}</h2>
        <span className={`condition-card__badge condition-card__badge--${level.tone}`}>
          {level.label}
        </span>
      </header>
      <p className="condition-card__value">
        <strong>{value}</strong> {unit}
      </p>
      <div className="condition-card__body">
        <div className={`condition-card__bar condition-card__bar--${level.tone}`}>
          <motion.span
            initial={{ width: 0 }}
            animate={{ width: `${quality}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 22 }}
          />
        </div>
        <p className="condition-card__desc">{description}</p>
      </div>
    </section>
  )
}

export default ConditionCard
