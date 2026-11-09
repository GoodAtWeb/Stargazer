import { useEffect } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'
import './ScoreCard.css'

const RADIUS = 96
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

// 관측 적합도 점수를 원형 게이지와 한 줄 설명으로 보여주는 카드
function ScoreCard({ score, status, summary }) {
  // 숫자와 게이지가 같은 스프링 값을 따라 함께 부드럽게 움직임
  const animated = useSpring(0, { stiffness: 80, damping: 18 })
  const rounded = useTransform(animated, (v) => Math.round(v))
  const offset = useTransform(animated, (v) => CIRCUMFERENCE * (1 - v / 100))

  useEffect(() => {
    animated.set(score)
  }, [animated, score])

  return (
    <section className={`forecast-card score-card score-card--${status.tone}`}>
      <div className="score-card__ring">
        <svg viewBox="0 0 200 200" aria-hidden="true">
          <g transform="rotate(-90 100 100)">
            <circle className="score-card__track" cx="100" cy="100" r={RADIUS} />
            <motion.circle
              className="score-card__arc"
              cx="100"
              cy="100"
              r={RADIUS}
              strokeDasharray={CIRCUMFERENCE}
              style={{ strokeDashoffset: offset }}
            />
          </g>
        </svg>
        <div className="score-card__value">
          <motion.strong>{rounded}</motion.strong>
          <span>/100점</span>
        </div>
      </div>
      <p className="score-card__status">{status.label}</p>
      <p className="score-card__summary">{summary}</p>
      <p className="score-card__message">{status.message}</p>
    </section>
  )
}

export default ScoreCard
