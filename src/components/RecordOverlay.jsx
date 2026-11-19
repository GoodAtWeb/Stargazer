import './RecordOverlay.css'

// 사진 위에 저장한 별자리 선과 별을 그림 (좌표는 가로 100 기준)
function RecordOverlay({ aspect, constellations }) {
  return (
    <svg
      className="record-overlay"
      viewBox={`0 0 100 ${100 / aspect}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      {constellations.map((c) => (
        <g key={c.id}>
          {c.lines.map(([from, to]) => (
            <line
              key={`${from}-${to}`}
              className="record-overlay__line"
              x1={c.stars[from][0]}
              y1={c.stars[from][1]}
              x2={c.stars[to][0]}
              y2={c.stars[to][1]}
            />
          ))}
          {Object.entries(c.stars).map(([id, [x, y]]) => (
            <circle key={id} className="record-overlay__star" cx={x} cy={y} r={0.55} />
          ))}
        </g>
      ))}
    </svg>
  )
}

export default RecordOverlay
