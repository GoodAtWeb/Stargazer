import { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import AnalysisProgress from '../components/AnalysisProgress'
import PhotoResultPanel from '../components/PhotoResultPanel'
import PhotoStage from '../components/PhotoStage'
import PhotoUploader from '../components/PhotoUploader'
import SaveRecordDialog from '../components/SaveRecordDialog'
import TopNav from '../components/TopNav'
import {
  ANALYSIS_DURATION,
  SCAN_DURATION,
  createAnalysisResult,
  detectStars,
  downloadResultImage,
  loadImage,
} from '../utils/photoAnalysis'
import { useTranslation } from 'react-i18next'
import { getConstellationById, getLocalizedStar } from '../i18n/data'
import './PhotoAnalysis.css'

const INITIAL = {
  status: 'idle',
  file: null,
  photoUrl: null,
  aspect: 16 / 9,
  spots: null,
  foundCount: 0,
  progress: 0,
  result: null,
}

// 다른 페이지(별자리 상세보기 등)에 갔다가 돌아와도 마지막 분석 화면을 그대로 보여주기 위한 값
let lastPhoto = null

// 저장해둔 상태를 되살림
const restoreState = () => {
  if (!lastPhoto) return INITIAL
  const saved = lastPhoto.state
  if (saved.status === 'analyzing') return { ...saved, spots: null, foundCount: 0, progress: 0 }
  return saved
}

// 사진 업로드 → 분석 중(스캔) → 결과 확인 순서로 진행되는 사진 분석 페이지
function PhotoAnalysis() {
  const { t } = useTranslation()
  const [state, setState] = useState(restoreState)
  const [selectedId, setSelectedId] = useState(() => lastPhoto?.selectedId ?? null)
  const [loadError, setLoadError] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const { status, file, photoUrl, aspect, spots, foundCount, progress, result } = state

  // 사진을 올린 뒤의 상태는 계속 기억해두고, 처음 화면(업로드)으로 돌아가면 지움
  useEffect(() => {
    lastPhoto = status === 'idle' ? null : { state, selectedId }
  }, [state, selectedId, status])

  // 사진에서 별을 먼저 찾은 뒤 스캔을 시작하고, 빛줄기가 지나간 만큼 찾은 별 개수를 늘림
  useEffect(() => {
    if (status !== 'analyzing') return
    const run = { cancelled: false, frame: 0 }

    loadImage(photoUrl)
      .then((img) => {
        if (run.cancelled) return
        const aspect = img.naturalWidth / img.naturalHeight
        const found = detectStars(img)
        // 찾은 별들과 별자리 모양을 맞춰보는 계산은 스캔 전에 미리 끝내둠
        const analysis = createAnalysisResult(found.points, found.count, aspect)
        setState((s) => ({ ...s, aspect, spots: found.points }))

        // 빛줄기 아래쪽 끝이 각 별의 높이에 닿는 시각(ms)
        const revealAt = found.points.map((p) => (p.y / 100) * SCAN_DURATION)
        const start = performance.now()
        const tick = (now) => {
          const elapsed = now - start
          const next = Math.min(100, (elapsed / ANALYSIS_DURATION) * 100)
          const foundCount =
            elapsed >= SCAN_DURATION ? found.count : revealAt.filter((t) => t <= elapsed).length
          setState((s) => ({ ...s, progress: next, foundCount }))
          if (next < 100) {
            run.frame = requestAnimationFrame(tick)
            return
          }
          setSelectedId(analysis.detected[0]?.id ?? null)
          setState((s) => ({ ...s, status: 'done', result: analysis }))
        }
        run.frame = requestAnimationFrame(tick)
      })
      .catch(() => {
        if (run.cancelled) return
        URL.revokeObjectURL(photoUrl)
        setState(INITIAL)
        setLoadError('photo.loadError')
      })

    return () => {
      run.cancelled = true
      cancelAnimationFrame(run.frame)
    }
  }, [status, photoUrl])

  const handleSelect = (nextFile) => {
    setLoadError(null)
    setState({
      ...INITIAL,
      status: 'analyzing',
      file: nextFile,
      photoUrl: URL.createObjectURL(nextFile),
    })
  }

  const handleReset = () => {
    if (photoUrl) URL.revokeObjectURL(photoUrl)
    setState(INITIAL)
    setSelectedId(null)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await downloadResultImage(photoUrl, result, file.name)
    } finally {
      setIsSaving(false)
    }
  }

  const brightest = result?.brightest && getLocalizedStar(result.brightest.constellationId, result.brightest.id)
  const direction = result?.firstConstellationId
    ? getConstellationById(result.firstConstellationId).observation.position.split(' (')[0]
    : null

  return (
    <div className="photo-page">
      <TopNav />
      <main className="photo">
        <header className="photo__header">
          <h1>{t('photo.title')}</h1>
          <p>{t('photo.desc')}</p>
        </header>

        {status === 'idle' ? (
          <PhotoUploader onSelect={handleSelect} loadError={loadError} />
        ) : (
          <div className="photo__workspace">
            <div className="photo__main">
              <PhotoStage
                photoUrl={photoUrl}
                aspect={aspect}
                status={status}
                spots={spots}
                result={result}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />

              {result && (
                <dl className="photo__stats">
                  <div>
                    <dt>{t('photo.statStars')}</dt>
                    <dd>
                      {result.starCount}
                      <small>{t('photo.statCount')}</small>
                    </dd>
                  </div>
                  <div>
                    <dt>{t('photo.statBrightest')}</dt>
                    <dd>
                      {result.brightest ? (
                        <>
                          {brightest.name}
                          <small>{brightest.brightness}</small>
                        </>
                      ) : (
                        '-'
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt>{t('photo.statDirection')}</dt>
                    <dd>{direction ?? '-'}</dd>
                  </div>
                </dl>
              )}
            </div>

            {status === 'analyzing' ? (
              <AnalysisProgress
                progress={progress}
                foundCount={foundCount}
                onCancel={handleReset}
              />
            ) : (
              <PhotoResultPanel
                detected={result.detected}
                starCount={result.starCount}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onReset={handleReset}
                onSave={handleSave}
                isSaving={isSaving}
                onRecord={() => setIsRecording(true)}
              />
            )}
          </div>
        )}
      </main>

      <AnimatePresence>
        {isRecording && result && (
          <SaveRecordDialog
            photoUrl={photoUrl}
            file={file}
            aspect={aspect}
            detected={result.detected}
            onClose={() => setIsRecording(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default PhotoAnalysis
