import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useArchiveStore } from '../stores/archiveStore'
import { getConstellationIcon } from '../utils/horoscopes'
import {
  compressPhoto,
  getDefaultTitle,
  readTakenDate,
  toDateValue,
  toRecordConstellation,
} from '../utils/photoRecord'
import RecordOverlay from './RecordOverlay'
import './SaveRecordDialog.css'

function SaveRecordDialog({ photoUrl, file, aspect, detected, onClose }) {
  const navigate = useNavigate()
  const addPhotoRecord = useArchiveStore((s) => s.addPhotoRecord)
  const [dateValue, setDateValue] = useState(() => toDateValue(new Date()))
  const [dateSource, setDateSource] = useState('today')
  const [title, setTitle] = useState(() => getDefaultTitle(toDateValue(new Date())))
  const [titleEdited, setTitleEdited] = useState(false)
  const [selected, setSelected] = useState(() => detected.map((d) => d.id))
  const [status, setStatus] = useState('editing')

  useEffect(() => {
    let cancelled = false
    readTakenDate(file).then((taken) => {
      if (cancelled || !taken) return
      const value = toDateValue(taken)
      const todayTitle = getDefaultTitle(toDateValue(new Date()))
      setDateValue(value)
      setDateSource('taken')
      // 사용자가 제목을 아직 안 바꿨을 때만 촬영일 제목으로
      setTitle((current) => (current === todayTitle ? getDefaultTitle(value) : current))
    })
    return () => {
      cancelled = true
    }
  }, [file])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleDate = (value) => {
    setDateValue(value)
    setDateSource('custom')
    if (!titleEdited) setTitle(getDefaultTitle(value))
  }

  const toggle = (id) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  const chosen = detected.filter((d) => selected.includes(d.id)).map(toRecordConstellation)

  const handleSave = async () => {
    setStatus('saving')
    try {
      addPhotoRecord({
        id: crypto.randomUUID(),
        title: title.trim() || getDefaultTitle(dateValue),
        date: dateValue,
        savedAt: Date.now(),
        photo: await compressPhoto(photoUrl),
        aspect,
        constellations: chosen,
      })
      setStatus('saved')
    } catch {
      setStatus('error')
    }
  }

  const sourceLabel = { taken: '사진 촬영일', today: '오늘 날짜', custom: '직접 입력' }[dateSource]

  return (
    <motion.div
      className="save-record"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="save-record__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-record-title"
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <h2 id="save-record-title" className="save-record__heading">
          나의 기록에 저장
        </h2>

        <div className="save-record__preview" style={{ aspectRatio: aspect }}>
          <img src={photoUrl} alt="" />
          <RecordOverlay aspect={aspect} constellations={chosen} />
        </div>

        {status === 'saved' ? (
          <div className="save-record__done">
            <p>나의 기록에 저장했어요</p>
            <div className="save-record__actions">
              <button type="button" className="save-record__btn" onClick={onClose}>
                닫기
              </button>
              <button
                type="button"
                className="save-record__btn save-record__btn--primary"
                onClick={() => navigate('/archive?tab=photos')}
              >
                보러 가기
              </button>
            </div>
          </div>
        ) : (
          <>
            <label className="save-record__section">
              <span className="save-record__label">제목</span>
              <input
                type="text"
                value={title}
                maxLength={40}
                onChange={(e) => {
                  setTitle(e.target.value)
                  setTitleEdited(true)
                }}
              />
            </label>

            <label className="save-record__section">
              <span className="save-record__label">
                날짜 <span>{sourceLabel}</span>
              </span>
              <input
                type="date"
                value={dateValue}
                required
                onChange={(e) => e.target.value && handleDate(e.target.value)}
              />
            </label>

            <fieldset className="save-record__section">
              <legend className="save-record__label">
                함께 저장할 별자리 <span>{selected.length}개</span>
              </legend>
              {detected.length === 0 ? (
                <p className="save-record__note">찾은 별자리가 없어 사진만 저장돼요</p>
              ) : (
                <ul className="save-record__list">
                  {detected.map((d) => {
                    const checked = selected.includes(d.id)
                    const icon = getConstellationIcon(d.id, checked)
                    return (
                      <li key={d.id}>
                        <label
                          className={`save-record__item${checked ? ' save-record__item--on' : ''}`}
                        >
                          {icon ? (
                            <img className="save-record__icon" src={icon} alt="" />
                          ) : (
                            <span className="save-record__icon save-record__icon--text">
                              {d.constellation.abbr}
                            </span>
                          )}
                          <span className="save-record__name">{d.constellation.nameKo}</span>
                          <input type="checkbox" checked={checked} onChange={() => toggle(d.id)} />
                        </label>
                      </li>
                    )
                  })}
                </ul>
              )}
            </fieldset>

            {status === 'error' && (
              <p className="save-record__error">저장하지 못했어요. 다시 시도해 주세요.</p>
            )}

            <div className="save-record__actions">
              <button type="button" className="save-record__btn" onClick={onClose}>
                취소
              </button>
              <button
                type="button"
                className="save-record__btn save-record__btn--primary"
                onClick={handleSave}
                disabled={status === 'saving'}
              >
                {status === 'saving' ? '저장 중…' : '저장'}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}

export default SaveRecordDialog
