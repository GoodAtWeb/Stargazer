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
import { useTranslation } from 'react-i18next'
import { getConstellationName } from '../i18n/data'
import RecordOverlay from './RecordOverlay'
import './SaveRecordDialog.css'

function SaveRecordDialog({ photoUrl, file, aspect, detected, onClose }) {
  const { t } = useTranslation()
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
        // 나중에 수정할 때 다시 고를 수 있도록 분석된 별자리 전체도 저장
        detected: detected.map(toRecordConstellation),
      })
      setStatus('saved')
    } catch {
      setStatus('error')
    }
  }

  const sourceLabel = { taken: t('save.srcTaken'), today: t('save.srcToday'), custom: t('save.srcCustom') }[dateSource]

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
          {t('save.heading')}
        </h2>

        <div
          className="save-record__preview"
          style={{ aspectRatio: aspect, '--aspect': aspect }}
        >
          <img src={photoUrl} alt="" />
          <RecordOverlay aspect={aspect} constellations={chosen} />
        </div>

        {status === 'saved' ? (
          <div className="save-record__done">
            <p>{t('save.saved')}</p>
            <div className="save-record__actions">
              <button type="button" className="save-record__btn" onClick={onClose}>
                {t('save.close')}
              </button>
              <button
                type="button"
                className="save-record__btn save-record__btn--primary"
                onClick={() => navigate('/archive?tab=photos')}
              >
                {t('save.view')}
              </button>
            </div>
          </div>
        ) : (
          <>
            <label className="save-record__section">
              <span className="save-record__label">{t('save.titleLabel')}</span>
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
                {t('save.dateLabel')} <span>{sourceLabel}</span>
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
                {t('save.choose')} <span>{t('record.countN', { n: selected.length })}</span>
              </legend>
              {detected.length === 0 ? (
                <p className="save-record__note">{t('save.none')}</p>
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
                          <span className="save-record__name">{getConstellationName(d.constellation.id)}</span>
                          <input type="checkbox" checked={checked} onChange={() => toggle(d.id)} />
                        </label>
                      </li>
                    )
                  })}
                </ul>
              )}
            </fieldset>

            {status === 'error' && (
              <p className="save-record__error">{t('save.error')}</p>
            )}

            <div className="save-record__actions">
              <button type="button" className="save-record__btn" onClick={onClose}>
                {t('save.cancel')}
              </button>
              <button
                type="button"
                className="save-record__btn save-record__btn--primary"
                onClick={handleSave}
                disabled={status === 'saving'}
              >
                {status === 'saving' ? t('save.saving') : t('save.save')}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}

export default SaveRecordDialog
