import { useRef, useState } from 'react'
import { MAX_FILE_SIZE } from '../utils/photoAnalysis'
import './PhotoUploader.css'
import { useTranslation } from 'react-i18next'

const TIPS = [
  {
    title: 'upload.tip1.title',
    text: 'upload.tip1.text',
  },
  {
    title: 'upload.tip2.title',
    text: 'upload.tip2.text',
  },
  {
    title: 'upload.tip3.title',
    text: 'upload.tip3.text',
  },
]

// 사진 파일이 올바른지 확인하고 문제가 있으면 안내 문구를 반환
const validateFile = (file) => {
  if (!file.type.startsWith('image/')) return 'upload.errType'
  if (file.size > MAX_FILE_SIZE) return 'upload.errSize'
  return null
}

// 사진을 끌어다 놓거나 골라서 올리는 영역과 촬영 팁
function PhotoUploader({ onSelect, loadError }) {
  const { t } = useTranslation()
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
        aria-label={t('upload.aria')}
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
        <p className="uploader__title">{t('upload.title')}</p>
        <p className="uploader__hint">{t('upload.hint')}</p>
        <span className="uploader__button">{t('upload.button')}</span>
        {(error || loadError) && <p className="uploader__error">{t(error || loadError)}</p>}
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
        <h2>{t('upload.tipsTitle')}</h2>
        <p>{t('upload.tipsDesc')}</p>
        <ul>
          {TIPS.map(({ title, text }) => (
            <li key={title}>
              <strong>{t(title)}</strong>
              <span>{t(text)}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}

export default PhotoUploader
