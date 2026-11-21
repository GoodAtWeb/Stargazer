import { useNavigate } from 'react-router-dom'
import {
  getConstellationIcon,
  getHoroscopeById,
  getRankedHoroscopes,
} from '../utils/horoscopes'
import { useTranslation } from 'react-i18next'
import './FortuneSection.css'

const CATEGORIES = [
  { key: 'love', label: 'fortune.love' },
  { key: 'money', label: 'fortune.money' },
  { key: 'work', label: 'fortune.work' },
  { key: 'health', label: 'fortune.health' },
]

const RING_RADIUS = 52
const RING_LENGTH = 2 * Math.PI * RING_RADIUS

// 점수(0~100)를 별 5개 중 채워진 개수로 환산해 채운 별과 빈 별 요소 목록을 반환
const toStars = (score) => {
  const filled = Math.round(score / 20)
  return Array.from({ length: 5 }, (_, i) => i + 1).map((order) => (
    <span key={order} className={order <= filled ? 'star-on' : 'star-off'}>
      ★
    </span>
  ))
}

// 오늘의 총점을 보여주는 원형 게이지
function ScoreRing({ score }) {
  const { t } = useTranslation()
  return (
    <div className="score-ring" role="img" aria-label={t('fortune.scoreAria', { score })}>
      <svg viewBox="0 0 120 120">
        <circle className="score-ring__track" cx="60" cy="60" r={RING_RADIUS} />
        <circle
          className="score-ring__value"
          cx="60"
          cy="60"
          r={RING_RADIUS}
          strokeDasharray={RING_LENGTH}
          strokeDashoffset={RING_LENGTH * (1 - score / 100)}
        />
      </svg>
      <p className="score-ring__text">
        <strong>{score}</strong>
      </p>
    </div>
  )
}

// 별자리 하나를 아이콘과 이름으로 보여주는 버튼
function SignButton({ id, name, rank, caption, comment, active, onSelect }) {
  const { t } = useTranslation()
  return (
    <button
      type="button"
      className={`sign-button${active ? ' sign-button--active' : ''}`}
      onClick={() => onSelect(id)}
      aria-current={active ? 'page' : undefined}
    >
      {rank && (
        <span className={`sign-button__rank sign-button__rank--${rank <= 3 ? rank : 'etc'}`}>
          {t('fortune.rank', { rank })}
        </span>
      )}
      <img src={getConstellationIcon(id, active)} alt="" />
      <span className="sign-button__name">{name}</span>
      {caption && <span className="sign-button__caption">{caption}</span>}
      {comment && <span className="sign-button__comment">{comment}</span>}
    </button>
  )
}

// 오늘의 운세, 행운 정보, 궁합, 12별자리 순위를 보여주는 섹션
function FortuneSection({ constellationId }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const horoscope = getHoroscopeById(constellationId)
  const ranked = getRankedHoroscopes()

  if (!horoscope) return null

  const goTo = (id) => navigate(`/constellations/${id}`)
  const nameOf = (id) => ranked.find((h) => h.id === id)?.name

  return (
    <section className="fortune" aria-label={t('fortune.aria')}>
      <div className="fortune__top">
        <div className="fortune__score">
          <h2>{t('fortune.title')}</h2>
          <ScoreRing score={horoscope.score} />
          <p className="fortune__summary">{horoscope.summary}</p>
        </div>

        <ul className="fortune__categories">
          {CATEGORIES.map(({ key, label }) => (
            <li key={key}>
              <span className="fortune__label">{t(label)}</span>
              <span className="fortune__stars" aria-label={t('fortune.pts', { score: horoscope[key].score })}>
                {toStars(horoscope[key].score)}
              </span>
              <span className="fortune__comment">{horoscope[key].comment}</span>
            </li>
          ))}
        </ul>

        <div className="fortune__side">
          <dl className="fortune__lucky">
            <div>
              <dt>{t('fortune.luckyColor')}</dt>
              <dd>
                <i style={{ background: horoscope.luckyColor.hex }} />
                {horoscope.luckyColor.name}
              </dd>
            </div>
            <div>
              <dt>{t('fortune.luckyNumbers')}</dt>
              <dd>{horoscope.luckyNumbers.join(', ')}</dd>
            </div>
            <div>
              <dt>{t('fortune.luckyTime')}</dt>
              <dd>{horoscope.luckyTime}</dd>
            </div>
          </dl>

          <div className="fortune__match">
            <h3>{t('fortune.match')}</h3>
            <div className="fortune__match-list">
              {horoscope.compatibility.map(({ id, percent, comment }) => (
                <SignButton
                  key={id}
                  id={id}
                  name={nameOf(id)}
                  caption={`${percent}%`}
                  comment={comment}
                  onSelect={goTo}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="fortune__rank">
        <h3>{t('fortune.ranking')}</h3>
        <div className="fortune__rank-grid">
          {ranked.map((item, i) => (
            <SignButton
              key={item.id}
              id={item.id}
              name={item.name}
              rank={i + 1}
              caption={t('fortune.pts', { score: item.score })}
              active={item.id === constellationId}
              onSelect={goTo}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default FortuneSection
