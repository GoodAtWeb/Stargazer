import { ANALYSIS_STEPS } from '../utils/photoAnalysis'
import './AnalysisProgress.css'

// 진행률과 단계별 상태(완료/진행 중/대기)를 보여주는 분석 중 패널
function AnalysisProgress({ progress, onCancel }) {
  const percent = Math.round(progress)
  const currentIndex = ANALYSIS_STEPS.findIndex((step) => progress < step.until)

  return (
    <aside className="analysis">
      <div className="analysis__card">
        <h2>별자리를 찾고 있어요</h2>
        <p className="analysis__desc">사진 속 별의 위치를 하나씩 비교하는 중이에요.</p>

        <div className="analysis__bar-head">
          <span>진행률</span>
          <strong>{percent}%</strong>
        </div>
        <div
          className="analysis__bar"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-label="분석 진행률"
        >
          <span style={{ width: `${percent}%` }} />
        </div>

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
                {step.label}
              </li>
            )
          })}
        </ol>
      </div>

      <button type="button" className="analysis__cancel" onClick={onCancel}>
        취소하기
      </button>
    </aside>
  )
}

export default AnalysisProgress
