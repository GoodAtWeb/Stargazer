import { motion } from 'framer-motion'
import { formatHour, formatHourShort } from '../utils/forecast'
import './HourlyChart.css'

const WIDTH = 1200 // 선과 면을 그리는 좌표 폭 (화면 폭에 맞춰 늘어남)
const HEIGHT = 200
const TOP = 40
const BOTTOM = 12

// 점들을 부드러운 곡선(베지어)으로 잇는 경로
const smoothPath = (points) =>
  points.reduce((d, p, i, list) => {
    if (i === 0) return `M${p.x} ${p.y}`
    const prev = list[i - 1]
    const before = list[i - 2] ?? prev
    const next = list[i + 1] ?? p
    const c1x = prev.x + (p.x - before.x) / 6
    const c1y = prev.y + (p.y - before.y) / 6
    const c2x = p.x - (next.x - prev.x) / 6
    const c2y = p.y - (next.y - prev.y) / 6
    return `${d} C${c1x} ${c1y} ${c2x} ${c2y} ${p.x} ${p.y}`
  }, '')

// 18시부터 새벽 4시까지 시간대별 점수를 곡선으로 보여주고, 시간을 누르면 그 시간으로 바꿈
function HourlyChart({ hourly, best, selectedHour, onSelect }) {
  const bestLabel = best.hour % 24 === 0 ? `자정 ${formatHour(best.hour)}` : formatHour(best.hour)
  const count = hourly.length

  // 점수 차이가 잘 보이도록 가장 낮은 점수 근처부터 그래프 바닥으로 삼음
  const scores = hourly.map((h) => h.score)
  const low = Math.max(0, Math.min(...scores) - 12)
  const points = hourly.map(({ hour, score }, i) => ({
    hour,
    score,
    x: ((i + 0.5) / count) * WIDTH,
    y: TOP + (1 - (score - low) / (100 - low)) * (HEIGHT - TOP - BOTTOM),
  }))
  const flat = points.map((p) => ({ ...p, y: HEIGHT - BOTTOM }))

  const line = smoothPath(points)
  const area = `${line} L${points[count - 1].x} ${HEIGHT} L${points[0].x} ${HEIGHT} Z`
  const flatLine = smoothPath(flat)
  const flatArea = `${flatLine} L${flat[count - 1].x} ${HEIGHT} L${flat[0].x} ${HEIGHT} Z`
  const spring = { type: 'spring', stiffness: 120, damping: 22 }

  return (
    <section className="forecast-card hourly-chart">
      <h2>시간대별 별 보기 점수</h2>
      <p className="hourly-chart__sub">
        가장 좋은 시간은{' '}
        <strong>
          {bestLabel} ({best.score}점)
        </strong>
        이에요.
      </p>

      <div className="hourly-chart__plot">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="hourly-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#8aa4ff" stopOpacity="0.42" />
              <stop offset="1" stopColor="#8aa4ff" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="hourly-line" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#7fc4ff" />
              <stop offset="0.55" stopColor="#a99bff" />
              <stop offset="1" stopColor="#d39bff" />
            </linearGradient>
          </defs>
          <motion.path fill="url(#hourly-area)" initial={{ d: flatArea }} animate={{ d: area }} transition={spring} />
          <motion.path
            fill="none"
            stroke="url(#hourly-line)"
            strokeWidth="3"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            initial={{ d: flatLine }}
            animate={{ d: line }}
            transition={spring}
          />
        </svg>

        <ul className="hourly-chart__columns">
          {points.map(({ hour, score, x, y }) => {
            const isBest = hour === best.hour
            const isSelected = hour === selectedHour
            return (
              <li key={hour}>
                <button
                  type="button"
                  className={`hourly-chart__item${isSelected ? ' hourly-chart__item--selected' : ''}`}
                  onClick={() => onSelect(hour)}
                  aria-label={`${formatHour(hour)} ${score}점`}
                  aria-pressed={isSelected}
                >
                  <motion.span
                    className="hourly-chart__point"
                    initial={{ top: HEIGHT - BOTTOM }}
                    animate={{ top: y }}
                    transition={spring}
                  >
                    <span className="hourly-chart__score">{isBest ? `★ ${score}` : isSelected ? score : ''}</span>
                    <span className="hourly-chart__dot" />
                    {isSelected && (
                      <motion.span
                        layoutId="hour-ring"
                        className="hourly-chart__ring"
                        transition={{ type: 'spring', stiffness: 260, damping: 30 }}
                      />
                    )}
                  </motion.span>
                  <span className="hourly-chart__hour">{formatHourShort(hour)}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

export default HourlyChart
