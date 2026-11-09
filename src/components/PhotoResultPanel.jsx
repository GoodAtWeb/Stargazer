import { useNavigate } from 'react-router-dom'
import { getConstellationIcon } from '../utils/horoscopes'
import './PhotoResultPanel.css'

// 유래 글에서 앞의 두 문장만 잘라 요약으로 사용
const summarize = (text) => text.split(/(?<=[.!?])\s+/).slice(0, 2).join(' ')

// 별자리에서 가장 밝은 별을 반환
const getBrightestStar = (stars) =>
  stars.reduce((a, b) => (b.magnitude < a.magnitude ? b : a))

// 찾은 별자리 목록, 선택한 별자리 설명, 다시 분석/저장 버튼으로 이루어진 결과 패널
function PhotoResultPanel({ detected, selectedId, onSelect, onReset, onSave, isSaving }) {
  const navigate = useNavigate()
  const selected = detected.find((item) => item.id === selectedId) ?? detected[0]
  const { constellation } = selected
  const brightest = getBrightestStar(constellation.stars)

  return (
    <aside className="result-panel">
      <section className="result-panel__card">
        <div className="result-panel__head">
          <h2>발견된 별자리</h2>
          <span className="result-panel__count">{detected.length}개</span>
        </div>
        <ul className="result-list">
          {detected.map((item) => {
            const isActive = item.id === selected.id
            const icon = getConstellationIcon(item.id, isActive)
            const c = item.constellation
            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={`result-list__item${isActive ? ' result-list__item--active' : ''}`}
                  aria-pressed={isActive}
                  onClick={() => onSelect(item.id)}
                >
                  {icon ? (
                    <img className="result-list__icon" src={icon} alt="" />
                  ) : (
                    <span className="result-list__icon result-list__icon--text">{c.abbr}</span>
                  )}
                  <span className="result-list__name">
                    <strong>{c.nameKo}</strong>
                    <small>
                      {c.nameEn} · 별 {c.stars.length}개 일치
                    </small>
                  </span>
                  <span className="result-list__confidence">{item.confidence}%</span>
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="result-panel__card result-panel__info" aria-live="polite">
        <h2>{constellation.nameKo}</h2>
        <p className="result-panel__en">{constellation.nameEn}</p>
        <p className="result-panel__summary">{summarize(constellation.origin)}</p>
        <ul className="result-panel__facts">
          <li>
            <span>대표 별</span>
            {brightest.nameKo} ({brightest.brightness})
          </li>
          <li>
            <span>관측 적기</span>
            {constellation.observation.bestMonth} ({constellation.observation.season})
          </li>
          <li>
            <span>위치</span>
            {constellation.observation.position}
          </li>
        </ul>
        <button
          type="button"
          className="result-panel__more"
          onClick={() => navigate(`/constellations/${constellation.id}`)}
        >
          자세히 보기 →
        </button>
      </section>

      <div className="result-panel__actions">
        <button type="button" className="result-panel__btn" onClick={onReset}>
          다른 사진 분석
        </button>
        <button
          type="button"
          className="result-panel__btn result-panel__btn--primary"
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? '저장 중…' : '결과 저장'}
        </button>
      </div>
    </aside>
  )
}

export default PhotoResultPanel
