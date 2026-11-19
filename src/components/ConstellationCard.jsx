import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getBrightStarName, getConstellationName, getConstellationSubName, translateSeason } from '../i18n/data'
import ConstellationFigure from './ConstellationFigure'
import './ConstellationCard.css'

// 반짝이는 4갈래 별 모양 아이콘
const SPARKLE = 'M12 2Q12 12 22 12Q12 12 12 22Q12 12 2 12Q12 12 12 2Z'

// 별자리 모양, 이름, 계절·대표 별을 보여 주고 누르면 상세 화면으로 이동하는 카드
function ConstellationCard({ item, favorite, onToggleFavorite }) {
  const { t } = useTranslation()
  const { id, season, brightStar, figure } = item
  const name = getConstellationName(id)
  const subName = getConstellationSubName(id)
  const brightStarName = getBrightStarName(id, brightStar)
  const { search } = useLocation()

  return (
    <li className="constellation-card">
      <Link
        to={`/constellations/${id}`}
        state={{ from: `/constellations${search}` }}
        className="constellation-card__link"
      >
        <div className="constellation-card__figure">
          <ConstellationFigure figure={figure} />
        </div>
        <h2 className="constellation-card__name">{name}</h2>
        {subName && <p className="constellation-card__latin">{subName}</p>}
        <p className="constellation-card__meta">
          {translateSeason(season)}
          {brightStarName && <> · {brightStarName}</>}
        </p>
      </Link>
      <button
        type="button"
        className={`constellation-card__fav${favorite ? ' constellation-card__fav--on' : ''}`}
        aria-label={t('card.favorite', { name })}
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
