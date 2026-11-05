import { AnimatePresence, motion } from 'framer-motion'
import { useLayoutEffect, useRef, useState } from 'react'
import ConstellationArt from './ConstellationArt'
import StarInfoCard from './StarInfoCard'
import './ConstellationMap.css'

const PADDING = 10
const DEFAULT_CARD_HEIGHT = 380
const CONNECTOR_INSET = 28

// 별 좌표 전체를 감싸는 SVG viewBox 범위를 계산
const getBounds = (stars) => {
  const xs = stars.map((s) => s.x)
  const ys = stars.map((s) => s.y)
  const x = Math.min(...xs) - PADDING
  const y = Math.min(...ys) - PADDING
  return {
    x,
    y,
    width: Math.max(...xs) + PADDING - x,
    height: Math.max(...ys) + PADDING - y,
  }
}

// 등급이 작을수록(밝을수록) 큰 반지름을 반환
const getStarRadius = (magnitude) => 0.5 + (4 - magnitude) * 0.2

// 중심 좌표와 반지름으로 4갈래로 반짝이는 별 모양 path를 만듦
const getSparklePath = (cx, cy, r) =>
  `M${cx} ${cy - r}Q${cx} ${cy} ${cx + r} ${cy}Q${cx} ${cy} ${cx} ${cy + r}Q${cx} ${cy} ${cx - r} ${cy}Q${cx} ${cy} ${cx} ${cy - r}Z`

// 값을 min~max 범위 안으로 제한해 반환
const clamp = (value, min, max) => Math.max(min, Math.min(value, max))

// 별과 연결선을 SVG로 그리고, 선택한 별의 정보 카드를 함께 보여주는 지도
function ConstellationMap({ constellation, selectedId, onSelect }) {
  const { stars, lines, nameKo } = constellation
  const bounds = getBounds(stars)
  const starById = Object.fromEntries(stars.map((s) => [s.id, s]))
  const selected = starById[selectedId]
  const mapRef = useRef(null)
  const [mapHeight, setMapHeight] = useState(0)
  const [cardHeight, setCardHeight] = useState(DEFAULT_CARD_HEIGHT)

  useLayoutEffect(() => {
    const observer = new ResizeObserver(([entry]) =>
      setMapHeight(entry.contentRect.height),
    )
    observer.observe(mapRef.current)
    return () => observer.disconnect()
  }, [])

  const starY = selected ? ((selected.y - bounds.y) / bounds.height) * mapHeight : 0
  const cardCenter = Math.max(cardHeight / 2, Math.min(starY, mapHeight - cardHeight / 2))
  const connectorY = clamp(
    starY,
    cardCenter - cardHeight / 2 + CONNECTOR_INSET,
    cardCenter + cardHeight / 2 - CONNECTOR_INSET,
  )
  const connectorSvgY = bounds.y + (connectorY / (mapHeight || 1)) * bounds.height

  return (
    <div
      ref={mapRef}
      className="constellation-map"
      style={{ aspectRatio: `${bounds.width} / ${bounds.height}` }}
    >
      <svg
        viewBox={`${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}`}
        role="group"
        aria-label={`${nameKo} 별자리 지도`}
      >
        <ConstellationArt id={constellation.id} />

        {lines.map(([from, to], i) => (
          <motion.line
            key={`${from}-${to}`}
            className="constellation-map__line"
            x1={starById[from].x}
            y1={starById[from].y}
            x2={starById[to].x}
            y2={starById[to].y}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: i * 0.08 }}
          />
        ))}

        {selected && (
          <line
            className="constellation-map__connector"
            x1={selected.x + getStarRadius(selected.magnitude) * 3}
            y1={selected.y}
            x2={bounds.x + bounds.width}
            y2={connectorSvgY}
          />
        )}

        {stars.map((star, i) => {
          const r = getStarRadius(star.magnitude)
          const isSelected = star.id === selectedId

          return (
            <g
              key={star.id}
              className="star"
              role="button"
              tabIndex={0}
              aria-label={`${star.nameKo} 정보 보기`}
              aria-pressed={isSelected}
              onClick={() => onSelect(star.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onSelect(star.id)
                }
              }}
            >
              <circle
                className="star__halo"
                cx={star.x}
                cy={star.y}
                r={r * 2.6}
                style={{ animationDelay: `${(i % 6) * 0.5}s` }}
              />
              <path className="star__core" d={getSparklePath(star.x, star.y, r * 2.2)} />
              <circle className="star__dot" cx={star.x} cy={star.y} r={r * 0.55} />
              <circle className="star__hit" cx={star.x} cy={star.y} r={Math.max(r * 2.4, 1.6)} />
              {isSelected && (
                <>
                  <circle className="star__ring" cx={star.x} cy={star.y} r={r * 3} />
                  <text className="star__label" x={star.x} y={star.y - r * 4}>
                    {star.nameKo}
                  </text>
                </>
              )}
            </g>
          )
        })}
      </svg>

      <AnimatePresence mode="wait">
        {selected && (
          <StarInfoCard
            key={selected.id}
            star={selected}
            top={cardCenter}
            onMeasure={setCardHeight}
            onClose={() => onSelect(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default ConstellationMap
