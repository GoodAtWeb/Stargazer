import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { formatMonthDay, getBrightStarName, getConstellationName, getConstellationSubName, translateSeason } from '../i18n/data'
import ConstellationFigure from './ConstellationFigure'
import './FavoriteCard.css'

const SPARKLE = 'M12 2Q12 12 22 12Q12 12 12 22Q12 12 2 12Q12 12 12 2Z'
const HIGH_SCORE = 80
const SLOW_OUT = [0.16, 1, 0.3, 1]
const APPEAR_GAP = 0.08

// '10-23' → '10월 23일' / 'October 23'
const formatPeriodDate = (value) => {
  const [month, day] = value.split('-').map(Number)
  return formatMonthDay(month, day)
}

function FavoriteCard({ item, period, fortune, index, onRemove }) {
  const { t } = useTranslation()
  const { id, season, brightStar, figure } = item
  const name = getConstellationName(id)
  const subName = getConstellationSubName(id)
  const subtitle = period
    ? `${formatPeriodDate(period.start)} ~ ${formatPeriodDate(period.end)}`
    : season === '연중' // i18n-ignore
      ? t('card.yearRound')
      : t('card.seasonConstellation', { season: translateSeason(season) })

  return (
    <motion.li
      className="favorite-card"
      layout
      initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
      animate={{
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: { duration: 0.8, delay: index * APPEAR_GAP, ease: SLOW_OUT },
      }}
      exit={{
        opacity: 0,
        scale: 0.92,
        filter: 'blur(6px)',
        transition: { duration: 0.35, ease: 'easeIn' },
      }}
      transition={{ layout: { type: 'spring', stiffness: 260, damping: 30 } }}
    >
      <Link
        to={`/constellations/${id}`}
        state={{ from: '/archive' }}
        className="favorite-card__link"
      >
        <div className="favorite-card__top">
          <div className="favorite-card__figure">
            <ConstellationFigure figure={figure} />
          </div>
          <div className="favorite-card__info">
            <h2 className="favorite-card__name">{name}</h2>
            {subName && <p className="favorite-card__latin">{subName}</p>}
            <p className="favorite-card__period">{subtitle}</p>
          </div>
        </div>

        <div className="favorite-card__bottom">
          {fortune ? (
            <>
              <span>{t('card.fortune')}</span>
              <strong
                className={`favorite-card__score${
                  fortune.score >= HIGH_SCORE ? ' favorite-card__score--high' : ''
                }`}
              >
                {t('card.fortuneScore', { score: fortune.score, rank: fortune.rank })}
              </strong>
            </>
          ) : (
            <>
              <span>{t('card.brightStar')}</span>
              <strong className="favorite-card__score">{getBrightStarName(id, brightStar) ?? '-'}</strong>
            </>
          )}
        </div>
      </Link>

      <button
        type="button"
        className="favorite-card__fav"
        aria-label={t('card.unfavorite', { name })}
        onClick={() => onRemove(id)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d={SPARKLE} />
        </svg>
      </button>
    </motion.li>
  )
}

export default FavoriteCard
