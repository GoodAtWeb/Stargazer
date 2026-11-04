import { useNavigate } from 'react-router-dom'
import {
  getConstellationIcon,
  getHoroscopeById,
  getRankedHoroscopes,
} from '../utils/horoscopes'
import './FortuneSection.css'

const CATEGORIES = [
  { key: 'love', label: '애정운' },
  { key: 'money', label: '금전운' },
  { key: 'work', label: '학업·직장운' },
  { key: 'health', label: '건강운' },
]

const RING_RADIUS = 52
const RING_LENGTH = 2 * Math.PI * RING_RADIUS

// 점수(0~100)를 별 5개 중 채워진 개수로 환산해 별 문자열을 반환
const toStars = (score) => {
  const filled = Math.round(score / 20)
  return '★'.repeat(filled) + '☆'.repeat(5 - filled)
}

// 오늘의 총점을 원형 게이지로 보여줌
function ScoreRing({ score }) {
  return (
    <div className="score-ring" role="img" aria-label={`오늘의 운세 ${score}점`}>
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
        <span>점</span>
      </p>
    </div>
  )
}

// 별자리 하나를 아이콘과 이름으로 보여주는 버튼
function SignButton({ id, nameKo, rank, caption, active, onSelect }) {
  return (
    <button
      type="button"
      className={`sign-button${active ? ' sign-button--active' : ''}`}
      onClick={() => onSelect(id)}
      aria-current={active ? 'page' : undefined}
    >
      {rank && (
        <span className={`sign-button__rank sign-button__rank--${rank <= 3 ? rank : 'etc'}`}>
          {rank}위
        </span>
      )}
      <img src={getConstellationIcon(id, active)} alt="" />
      <span className="sign-button__name">{nameKo}</span>
      {caption && <span className="sign-button__caption">{caption}</span>}
    </button>
  )
}

// 오늘의 운세, 행운 정보, 궁합, 12별자리 순위를 보여주는 섹션
function FortuneSection({ constellationId }) {
  const navigate = useNavigate()
  const horoscope = getHoroscopeById(constellationId)
  const ranked = getRankedHoroscopes()

  if (!horoscope) return null

  const goTo = (id) => navigate(`/constellations/${id}`)
  const nameOf = (id) => ranked.find((h) => h.id === id)?.nameKo

  return (
    <section className="fortune" aria-label="오늘의 운세">
      <div className="fortune__top">
        <div className="fortune__score">
          <h2>오늘의 운세</h2>
          <ScoreRing score={horoscope.score} />
          <p className="fortune__summary">{horoscope.summary}</p>
        </div>

        <ul className="fortune__categories">
          {CATEGORIES.map(({ key, label }) => (
            <li key={key}>
              <span className="fortune__label">{label}</span>
              <span className="fortune__stars" aria-label={`${horoscope[key].score}점`}>
                {toStars(horoscope[key].score)}
              </span>
              <span className="fortune__comment">{horoscope[key].comment}</span>
            </li>
          ))}
        </ul>

        <div className="fortune__side">
          <dl className="fortune__lucky">
            <div>
              <dt>행운의 색</dt>
              <dd>
                <i style={{ background: horoscope.luckyColor.hex }} />
                {horoscope.luckyColor.name}
              </dd>
            </div>
            <div>
              <dt>행운의 숫자</dt>
              <dd>{horoscope.luckyNumbers.join(', ')}</dd>
            </div>
            <div>
              <dt>행운의 시간대</dt>
              <dd>{horoscope.luckyTime}</dd>
            </div>
          </dl>

          <div className="fortune__match">
            <h3>오늘의 궁합</h3>
            <div className="fortune__match-list">
              {horoscope.compatibility.map((id) => (
                <SignButton key={id} id={id} nameKo={nameOf(id)} onSelect={goTo} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="fortune__rank">
        <h3>12별자리 운세 순위</h3>
        <div className="fortune__rank-grid">
          {ranked.map((item, i) => (
            <SignButton
              key={item.id}
              id={item.id}
              nameKo={item.nameKo}
              rank={i + 1}
              caption={`${item.score}점`}
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
