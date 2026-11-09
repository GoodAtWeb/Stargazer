import { useRef, useState } from 'react'
import { MAX_FILE_SIZE } from '../utils/photoAnalysis'
import './PhotoUploader.css'

const TIPS = [
  {
    title: '흔들리지 않게',
    text: '삼각대나 바닥에 폰을 고정하고, 야간 모드로 10초 이상 찍어요.',
  },
  {
    title: '어둡고 맑은 날',
    text: '달이 작고 구름이 없는 날이 좋아요. 별 예보에서 80점 이상인 날들을 골라보세요.',
  },
  {
    title: '넓게 담기',
    text: '별자리 전체가 들어오도록 광각(0.5x)으로 하늘을 넓게 찍어요.',
  },
]

// 사진 파일이 올바른지 확인하고 문제가 있으면 안내 문구를 반환
const validateFile = (file) => {
  if (!file.type.startsWith('image/')) return '이미지 파일만 올릴 수 있어요.'
  if (file.size > MAX_FILE_SIZE) return '20MB 이하의 사진만 올릴 수 있어요.'
  return null
}

// 사진을 끌어다 놓거나 골라서 올리는 영역과 촬영 팁
function PhotoUploader({ onSelect, loadError }) {
  const inputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState(null)

  const handleFile = (file) => {
    if (!file) return
    const message = validateFile(file)
    setError(message)
    if (!message) onSelect(file)
  }

  return (
    <>
      <div
        className={`uploader${isDragging ? ' uploader--dragging' : ''}`}
        role="button"
        tabIndex={0}
        aria-label="사진 올리기"
        onClick={() => inputRef.current.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            inputRef.current.click()
          }
        }}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragging(false)
          handleFile(e.dataTransfer.files[0])
        }}
      >
        <span className="uploader__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M12 16V4m0 0-5 5m5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
          </svg>
        </span>
        <p className="uploader__title">사진을 끌어다 놓거나 클릭해서 올려주세요</p>
        <p className="uploader__hint">JPG, PNG, WEBP 이미지 · 최대 20MB · 사진은 서버로 전송되지 않아요</p>
        <span className="uploader__button">사진 선택</span>
        {(error || loadError) && <p className="uploader__error">{error || loadError}</p>}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            handleFile(e.target.files[0])
            e.target.value = ''
          }}
        />
      </div>

      <section className="photo-tips">
        <h2>별 사진 잘 찍는 Tip</h2>
        <p>이렇게 찍으면 별자리를 더 정확하게 찾을 수 있어요</p>
        <ul>
          {TIPS.map(({ title, text }) => (
            <li key={title}>
              <strong>{title}</strong>
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}

export default PhotoUploader
