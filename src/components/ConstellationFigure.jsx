import './ConstellationFigure.css'

// 별 좌표(0~100)와 연결선으로 별자리 모양을 작게 그려 줌
function ConstellationFigure({ figure }) {
  return (
    <svg className="constellation-figure" viewBox="0 0 100 100" aria-hidden="true">
      {figure.paths.map((path, i) => (
        <polyline
          key={i}
          className="constellation-figure__line"
          points={path.map(([x, y]) => `${x},${y}`).join(' ')}
        />
      ))}
      {figure.points.map((p, i) => (
        <g key={i}>
          <circle className="constellation-figure__glow" cx={p.x} cy={p.y} r={p.r * 2.6} />
          <circle className="constellation-figure__star" cx={p.x} cy={p.y} r={p.r} />
        </g>
      ))}
    </svg>
  )
}

export default ConstellationFigure
