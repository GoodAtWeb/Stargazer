import { motion } from 'framer-motion'
import { SCAN_DURATION } from '../utils/photoAnalysis'
import './PhotoStage.css'

const SCAN_SECONDS = SCAN_DURATION / 1000
const BRIGHT_SPOT = 0.6 // 상대 밝기가 이 이상이면 밝은 별로 강조

// 등급이 작을수록(밝을수록) 큰 반지름을 반환
const getStarRadius = (magnitude) => 0.35 + (4 - magnitude) * 0.12

// 올린 사진 위에 분석 중에는 스캔 효과를, 분석이 끝나면 찾은 별자리를 겹쳐 보여줌
function PhotoStage({ photoUrl, aspect, status, spots, result, selectedId, onSelect }) {
  const viewHeight = 100 / aspect
  const isAnalyzing = status === 'analyzing'
  // 별을 다 찾은 뒤에 스캔을 시작해야 빛줄기와 별 표시 시점이 맞음
  const isScanning = isAnalyzing && spots !== null

  return (
    <div className="photo-stage">
      <div className="photo-stage__frame" style={{ '--aspect': aspect }}>
        <img className="photo-stage__img" src={photoUrl} alt="올린 밤하늘 사진" />

        <svg
          className="photo-stage__overlay"
          viewBox={`0 0 100 ${viewHeight}`}
          aria-hidden={isAnalyzing}
        >
          {isScanning &&
            spots.map((p, i) => {
              const delay = (p.y / 100) * SCAN_SECONDS
              const isBright = p.b >= BRIGHT_SPOT
              return (
                <circle
                  key={i}
                  className={`photo-stage__spot${isBright ? ' photo-stage__spot--bright' : ''}`}
                  cx={p.x}
                  cy={(p.y / 100) * viewHeight}
                  r={0.6 + p.b * 1.1}
                  style={{ animationDelay: `${delay}s, ${delay + 0.6}s` }}
                />
              )
            })}

          {result?.detected.map((item, index) => {
            const stars = item.placed
            const isActive = item.id === selectedId

            return (
              <g
                key={item.id}
                className={`photo-stage__group${isActive ? ' photo-stage__group--active' : ''}`}
                onClick={() => onSelect(item.id)}
              >
                {/* 사진에서 못 찾은 별(모양으로 추정한 위치)도 실제 별자리처럼 실선으로 이음 */}
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
          const stars = Object.values(item.placed)
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

        {isScanning && (
          <div className="photo-stage__scan" aria-hidden="true">
            <div
              className="photo-stage__beam"
              style={{ animationDuration: `${SCAN_SECONDS}s` }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default PhotoStage
