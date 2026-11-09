import { useEffect, useState } from 'react'
import AnalysisProgress from '../components/AnalysisProgress'
import PhotoResultPanel from '../components/PhotoResultPanel'
import PhotoStage from '../components/PhotoStage'
import PhotoUploader from '../components/PhotoUploader'
import TopNav from '../components/TopNav'
import {
  ANALYSIS_DURATION,
  createAnalysisResult,
  detectBrightSpots,
  downloadResultImage,
  loadImage,
} from '../utils/photoAnalysis'
import './PhotoAnalysis.css'

const INITIAL = {
  status: 'idle',
  file: null,
  photoUrl: null,
  aspect: 16 / 9,
  spots: [],
  progress: 0,
  result: null,
}

// 사진 업로드 → 분석 중(스캔) → 결과 확인 순서로 진행되는 사진 분석 페이지
function PhotoAnalysis() {
  const [state, setState] = useState(INITIAL)
  const [selectedId, setSelectedId] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const { status, file, photoUrl, aspect, spots, progress, result } = state

  // 분석 중일 때 진행률을 올리고, 사진의 밝은 점을 찾은 뒤 결과를 만듦
  useEffect(() => {
    if (status !== 'analyzing') return
    const run = { cancelled: false, frame: 0 }

    const detection = loadImage(photoUrl).then((img) => {
      const found = detectBrightSpots(img)
      if (!run.cancelled) {
        setState((s) => ({
          ...s,
          aspect: img.naturalWidth / img.naturalHeight,
          spots: found.points,
        }))
      }
      return found.count
    })

    detection.catch(() => {
      if (run.cancelled) return
      URL.revokeObjectURL(photoUrl)
      setState(INITIAL)
      setLoadError('사진을 읽을 수 없어요. JPG나 PNG 사진으로 다시 시도해 주세요.')
    })

    const start = performance.now()
    const tick = (now) => {
      const next = Math.min(100, ((now - start) / ANALYSIS_DURATION) * 100)
      setState((s) => ({ ...s, progress: next }))
      if (next < 100) {
        run.frame = requestAnimationFrame(tick)
        return
      }
      detection.then((count) => {
        if (run.cancelled) return
        const analysis = createAnalysisResult(file, count)
        setSelectedId(analysis.detected[0].id)
        setState((s) => ({ ...s, status: 'done', result: analysis }))
      }, () => {})
    }
    run.frame = requestAnimationFrame(tick)

    return () => {
      run.cancelled = true
      cancelAnimationFrame(run.frame)
    }
  }, [status, photoUrl, file])

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

  return (
    <div className="photo-page">
      <TopNav />
      <main className="photo">
        <header className="photo__header">
          <h1>사진 분석</h1>
          <p>밤하늘 사진을 올리면 어떤 별자리가 찍혔는지 찾아드려요.</p>
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
                    <dt>찾은 별</dt>
                    <dd>
                      {result.starCount}
                      <small>개</small>
                    </dd>
                  </div>
                  <div>
                    <dt>가장 밝은 별</dt>
                    <dd>
                      {result.brightest.nameKo}
                      <small>{result.brightest.brightness}</small>
                    </dd>
                  </div>
                  <div>
                    <dt>추정 방향</dt>
                    <dd>{result.direction}</dd>
                  </div>
                </dl>
              )}
            </div>

            {status === 'analyzing' ? (
              <AnalysisProgress progress={progress} onCancel={handleReset} />
            ) : (
              <PhotoResultPanel
                detected={result.detected}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onReset={handleReset}
                onSave={handleSave}
                isSaving={isSaving}
              />
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default PhotoAnalysis
