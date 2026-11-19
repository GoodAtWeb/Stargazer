import { ANALYSIS_STEPS } from '../utils/photoAnalysis'
import './AnalysisProgress.css'
import { useTranslation } from 'react-i18next'

// 진행률과 단계별 상태(완료/진행 중/대기)를 보여주는 분석 중 패널
function AnalysisProgress({ progress, foundCount, onCancel }) {
  const { t } = useTranslation()
  const percent = Math.round(progress)
  const currentIndex = ANALYSIS_STEPS.findIndex((step) => progress < step.until)

  return (
    <aside className="analysis">
      <div className="analysis__card">
        <h2>{t('photo.analyzing')}</h2>
        <p className="analysis__desc">{t('photo.analyzingDesc')}</p>

        <div className="analysis__bar-head">
          <span>{t('photo.progress')}</span>
          <strong>{percent}%</strong>
        </div>
        <div
          className="analysis__bar"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-label={t('photo.progressAria')}
        >
          <span style={{ width: `${percent}%` }} />
        </div>

        <p className="analysis__found" aria-live="polite">
          <span className="analysis__found-dot" aria-hidden="true" />
          {t('photo.foundStars', { n: foundCount })}
        </p>

        <ol className="analysis__steps">
          {ANALYSIS_STEPS.map((step, i) => {
            const state =
              currentIndex === -1 || i < currentIndex
                ? 'done'
                : i === currentIndex
                  ? 'current'
                  : 'waiting'
            return (
              <li key={step.label} className={`analysis__step analysis__step--${state}`}>
                <span className="analysis__dot" aria-hidden="true" />
                {t(step.label)}
              </li>
            )
          })}
        </ol>
      </div>

      <button type="button" className="analysis__cancel" onClick={onCancel}>
        {t('photo.cancel')}
      </button>
    </aside>
  )
}

export default AnalysisProgress
