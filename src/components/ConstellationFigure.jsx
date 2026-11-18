import './ConstellationFigure.css'

// 별 좌표(0~100)와 연결선으로 별자리 모양을 작게 그려 줌
function ConstellationFigure({ figure }) {
  return (
    <svg className="constellation-figure" viewBox="0 0 100 100" aria-hidden="true">
      {figure.paths.map((path) => {
        const points = path.map(([x, y]) => `${x},${y}`).join(' ')
        return <polyline key={points} className="constellation-figure__line" points={points} />
      })}
      {figure.points.map((p) => (
        <g key={`${p.x},${p.y}`}>
          <circle className="constellation-figure__glow" cx={p.x} cy={p.y} r={p.r * 2.6} />
          <circle className="constellation-figure__star" cx={p.x} cy={p.y} r={p.r} />
        </g>
      ))}
    </svg>
  )
}

export default ConstellationFigure
