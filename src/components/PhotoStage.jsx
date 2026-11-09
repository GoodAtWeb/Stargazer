import { motion } from 'framer-motion'
import { placeStars } from '../utils/photoAnalysis'
import './PhotoStage.css'

const SCAN_DURATION = 2.4

// 등급이 작을수록(밝을수록) 큰 반지름을 반환
const getStarRadius = (magnitude) => 0.35 + (4 - magnitude) * 0.12

// 올린 사진 위에 분석 중에는 스캔 효과를, 분석이 끝나면 찾은 별자리를 겹쳐 보여줌
function PhotoStage({ photoUrl, aspect, status, spots, result, selectedId, onSelect }) {
  const viewHeight = 100 / aspect
  const isAnalyzing = status === 'analyzing'

  return (
    <div className="photo-stage">
      <div className="photo-stage__frame" style={{ '--aspect': aspect }}>
        <img className="photo-stage__img" src={photoUrl} alt="올린 밤하늘 사진" />

        <svg
          className="photo-stage__overlay"
          viewBox={`0 0 100 ${viewHeight}`}
          aria-hidden={isAnalyzing}
        >
          {isAnalyzing &&
            spots.map((p, i) => (
              <circle
                key={i}
                className="photo-stage__spot"
                cx={p.x}
                cy={(p.y / 100) * viewHeight}
                r={0.9}
                style={{ animationDelay: `${(p.y / 100) * SCAN_DURATION}s` }}
              />
            ))}

          {result?.detected.map((item, index) => {
            const stars = placeStars(item, viewHeight)
            const isActive = item.id === selectedId

            return (
              <g
                key={item.id}
                className={`photo-stage__group${isActive ? ' photo-stage__group--active' : ''}`}
                onClick={() => onSelect(item.id)}
              >
                {item.constellation.lines.map(([from, to], i) => (
                  <motion.line
                    key={`${from}-${to}`}
                    className="photo-stage__line"
                    x1={stars[from].px}
                    y1={stars[from].py}
                    x2={stars[to].px}
                    y2={stars[to].py}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.6, delay: index * 0.4 + i * 0.06 }}
                  />
                ))}
                {Object.values(stars).map((s) => (
                  <circle
                    key={s.id}
                    className="photo-stage__star"
                    cx={s.px}
                    cy={s.py}
                    r={getStarRadius(s.magnitude)}
                  />
                ))}
              </g>
            )
          })}
        </svg>

        {result?.detected.map((item, index) => {
          const stars = Object.values(placeStars(item, viewHeight))
          const top = Math.min(...stars.map((s) => s.py))
          const isActive = item.id === selectedId

          return (
            <motion.button
              key={item.id}
              type="button"
              className={`photo-stage__label${isActive ? ' photo-stage__label--active' : ''}`}
              style={{ left: `${item.x}%`, top: `${(top / viewHeight) * 100}%` }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.4 + 0.5 }}
              onClick={() => onSelect(item.id)}
            >
              {item.constellation.nameKo}
            </motion.button>
          )
        })}

        {isAnalyzing && (
          <div className="photo-stage__scan" aria-hidden="true">
            <div
              className="photo-stage__beam"
              style={{ animationDuration: `${SCAN_DURATION}s` }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default PhotoStage
