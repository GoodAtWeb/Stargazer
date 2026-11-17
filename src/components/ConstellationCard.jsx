import { Link } from 'react-router-dom'
import ConstellationFigure from './ConstellationFigure'
import './ConstellationCard.css'

// 반짝이는 4갈래 별 모양 아이콘
const SPARKLE = 'M12 2Q12 12 22 12Q12 12 12 22Q12 12 2 12Q12 12 12 2Z'

// 별자리 모양, 이름, 계절·대표 별을 보여 주고 누르면 상세 화면으로 이동하는 카드
function ConstellationCard({ item, favorite, onToggleFavorite }) {
  const { id, nameKo, nameEn, season, brightStar, figure } = item

  return (
    <li className="constellation-card">
      <Link to={`/constellations/${id}`} className="constellation-card__link">
        <div className="constellation-card__figure">
          <ConstellationFigure figure={figure} />
        </div>
        <h2 className="constellation-card__name">{nameKo}</h2>
        <p className="constellation-card__latin">{nameEn}</p>
        <p className="constellation-card__meta">
          {season}
          {brightStar && <> · {brightStar}</>}
        </p>
      </Link>
      <button
        type="button"
        className={`constellation-card__fav${favorite ? ' constellation-card__fav--on' : ''}`}
        aria-label={`${nameKo} 즐겨찾기`}
        aria-pressed={favorite}
        onClick={() => onToggleFavorite(id)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d={SPARKLE} />
        </svg>
      </button>
    </li>
  )
}

export default ConstellationCard
