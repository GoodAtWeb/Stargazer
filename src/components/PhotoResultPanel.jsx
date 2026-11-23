import { useNavigate } from 'react-router-dom'
import { getConstellationIcon } from '../utils/horoscopes'
import { useTranslation } from 'react-i18next'
import { getConstellationById } from '../i18n/data'
import './PhotoResultPanel.css'

// 유래 글에서 앞의 두 문장만 잘라 요약으로 반환
const summarize = (text) => text.split(/(?<=[.!?])\s+/).slice(0, 2).join(' ')

// 별자리에서 가장 밝은 별을 반환
const getBrightestStar = (stars) =>
  stars.reduce((a, b) => (b.magnitude < a.magnitude ? b : a))

// 찾은 별자리 목록, 선택한 별자리 설명, 다시 분석/저장 버튼으로 이루어진 결과 패널
function PhotoResultPanel({
  detected,
  starCount,
  selectedId,
  onSelect,
  onReset,
  onSave,
  isSaving,
  onRecord,
}) {
  const { t } = useTranslation()
  const actions = (
    <div className="result-panel__actions">
      <button type="button" className="result-panel__btn" onClick={onReset}>
        {t('result.another')}
      </button>
      <button
        type="button"
        className="result-panel__btn result-panel__btn--primary"
        onClick={onSave}
        disabled={isSaving}
      >
        {isSaving ? t('result.saving') : t('result.save')}
      </button>
      <button
        type="button"
        className="result-panel__btn result-panel__btn--record"
        onClick={onRecord}
      >
        {t('result.saveRecord')}
      </button>
    </div>
  )

  // 별은 찾았지만 별자리 모양과 맞는 별 묶음이 없을 때
  if (detected.length === 0) {
    return (
      <aside className="result-panel">
        <section className="result-panel__card result-panel__empty">
          <h2>{t('result.noneTitle')}</h2>
          <p>{t('result.noneText', { n: starCount })}</p>
        </section>
        {actions}
      </aside>
    )
  }

  return <ResultDetail detected={detected} selectedId={selectedId} onSelect={onSelect} actions={actions} />
}

// 찾은 별자리 목록과 선택한 별자리 설명을 보여주는 부분
function ResultDetail({ detected, selectedId, onSelect, actions }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const selected = detected.find((item) => item.id === selectedId) ?? detected[0]
  const constellation = getConstellationById(selected.constellation.id)
  const brightest = getBrightestStar(constellation.stars)

  return (
    <aside className="result-panel">
      <section className="result-panel__card">
        <div className="result-panel__head">
          <h2>{t('result.found')}</h2>
          <span className="result-panel__count">{t('result.count', { n: detected.length })}</span>
        </div>
        <ul className="result-list">
          {detected.map((item) => {
            const isActive = item.id === selected.id
            const icon = getConstellationIcon(item.id, isActive)
            const c = getConstellationById(item.constellation.id)
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
                    <strong>{c.name}</strong>
                    <small>
                      {t('result.matched', { name: c.subName || c.name, total: c.stars.length, matched: item.matched })}
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
        <h2>{constellation.name}</h2>
        <p className="result-panel__en">{constellation.subName}</p>
        <p className="result-panel__summary">{summarize(constellation.origin)}</p>
        <ul className="result-panel__facts">
          <li>
            <span>{t('result.brightStar')}</span>
            {brightest.name} ({brightest.brightness})
          </li>
          <li>
            <span>{t('result.bestTime')}</span>
            {constellation.observation.bestMonth} ({constellation.observation.season})
          </li>
          <li>
            <span>{t('result.position')}</span>
            {constellation.observation.position}
          </li>
        </ul>
        <button
          type="button"
          className="result-panel__more"
          onClick={() => navigate(`/constellations/${constellation.id}`, { state: { from: '/photo' } })}
        >
          {t('result.more')}
        </button>
      </section>

      {actions}
    </aside>
  )
}

export default PhotoResultPanel
