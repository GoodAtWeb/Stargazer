import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useArchiveStore } from '../stores/archiveStore'
import { getConstellationById } from '../utils/constellations'
import { getConstellationIcon } from '../utils/horoscopes'
import { formatDateLabel, getDefaultTitle } from '../utils/photoRecord'
import RecordOverlay from './RecordOverlay'
import './PhotoRecordViewer.css'
import { useTranslation } from 'react-i18next'
import { getConstellationName } from '../i18n/data'

function PhotoRecordViewer({ record, onClose }) {
  const { t } = useTranslation()
  const updatePhotoRecord = useArchiveStore((s) => s.updatePhotoRecord)
  const removePhotoRecord = useArchiveStore((s) => s.removePhotoRecord)
  const [mode, setMode] = useState('view')
  const [title, setTitle] = useState(record.title)
  const [dateValue, setDateValue] = useState(record.date)
  const [selectedIds, setSelectedIds] = useState(() => record.constellations.map((c) => c.id))
  const { photo, aspect, constellations } = record
  // 예전 기록에는 분석 전체 목록이 없어서 저장한 별자리 안에서만 선택
  const options = record.detected ?? constellations
  const editing = mode === 'edit'
  const shown = editing ? options.filter((c) => selectedIds.includes(c.id)) : constellations

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const startEdit = () => {
    setTitle(record.title)
    setDateValue(record.date)
    setSelectedIds(record.constellations.map((c) => c.id))
    setMode('edit')
  }

  const toggle = (id) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  const saveEdit = () => {
    updatePhotoRecord(record.id, {
      title: title.trim() || getDefaultTitle(dateValue),
      date: dateValue,
      constellations: options.filter((c) => selectedIds.includes(c.id)),
    })
    setMode('view')
  }

  const remove = () => {
    removePhotoRecord(record.id)
    onClose()
  }

  return (
    <motion.div
      className="record-viewer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="record-viewer__panel"
        role="dialog"
        aria-modal="true"
        aria-label={record.title}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <div
          className={`record-viewer__photo${editing ? ' record-viewer__photo--small' : ''}`}
          style={{ aspectRatio: aspect, '--aspect': aspect }}
        >
          <img src={photo} alt="" />
          <RecordOverlay aspect={aspect} constellations={shown} />
        </div>

        {editing ? (
          <div className="record-viewer__section">
            <label className="record-viewer__field">
              <span>{t('record.title')}</span>
              <input
                type="text"
                value={title}
                maxLength={40}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>
            <label className="record-viewer__field">
              <span>{t('record.date')}</span>
              <input
                type="date"
                value={dateValue}
                required
                onChange={(e) => e.target.value && setDateValue(e.target.value)}
              />
            </label>
            <fieldset className="record-viewer__choose">
              <legend className="record-viewer__label">
                {t('record.chooseLabel')} <span>{t('record.countN', { n: selectedIds.length })}</span>
              </legend>
              {options.length === 0 ? (
                <p className="record-viewer__note">{t('record.chooseNone')}</p>
              ) : (
                <ul className="record-viewer__list">
                  {options.map((c) => {
                    const checked = selectedIds.includes(c.id)
                    const icon = getConstellationIcon(c.id, checked)
                    return (
                      <li key={c.id}>
                        <label
                          className={`record-viewer__item record-viewer__item--check${
                            checked ? ' record-viewer__item--on' : ''
                          }`}
                        >
                          {icon ? (
                            <img className="record-viewer__icon" src={icon} alt="" />
                          ) : (
                            <span className="record-viewer__icon record-viewer__icon--text">
                              {getConstellationById(c.id)?.abbr}
                            </span>
                          )}
                          <span className="record-viewer__name">{getConstellationName(c.id)}</span>
                          <input type="checkbox" checked={checked} onChange={() => toggle(c.id)} />
                        </label>
                      </li>
                    )
                  })}
                </ul>
              )}
            </fieldset>
            <div className="record-viewer__actions">
              <button type="button" className="record-viewer__btn" onClick={() => setMode('view')}>
                {t('record.cancel')}
              </button>
              <button
                type="button"
                className="record-viewer__btn record-viewer__btn--primary"
                onClick={saveEdit}
              >
                {t('record.saveBtn')}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="record-viewer__section">
              <h2 className="record-viewer__title">{record.title}</h2>
              <p className="record-viewer__date">{formatDateLabel(record.date)}</p>
            </div>

            <div className="record-viewer__section">
              <p className="record-viewer__label">
                {t('record.savedLabel')} <span>{t('record.countN', { n: constellations.length })}</span>
              </p>
              {constellations.length === 0 ? (
                <p className="record-viewer__note">{t('record.savedNone')}</p>
              ) : (
                <ul className="record-viewer__list">
                  {constellations.map((c) => {
                    const icon = getConstellationIcon(c.id)
                    return (
                      <li key={c.id}>
                        <Link
                          to={`/constellations/${c.id}`}
                          state={{ from: '/archive?tab=photos' }}
                          className="record-viewer__item"
                        >
                          {icon ? (
                            <img className="record-viewer__icon" src={icon} alt="" />
                          ) : (
                            <span className="record-viewer__icon record-viewer__icon--text">
                              {getConstellationById(c.id)?.abbr}
                            </span>
                          )}
                          <span className="record-viewer__name">{getConstellationName(c.id)}</span>
                          <span className="record-viewer__more">{t('result.more')}</span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            {mode === 'confirm' ? (
              <div className="record-viewer__confirm">
                <p>{t('record.confirmDelete')}</p>
                <div className="record-viewer__actions">
                  <button type="button" className="record-viewer__btn" onClick={() => setMode('view')}>
                    {t('record.cancel')}
                  </button>
                  <button
                    type="button"
                    className="record-viewer__btn record-viewer__btn--danger"
                    onClick={remove}
                  >
                    {t('record.delete')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="record-viewer__actions record-viewer__actions--three">
                <button
                  type="button"
                  className="record-viewer__btn record-viewer__btn--text"
                  onClick={() => setMode('confirm')}
                >
                  {t('record.delete')}
                </button>
                <button type="button" className="record-viewer__btn" onClick={startEdit}>
                  {t('record.edit')}
                </button>
                <button
                  type="button"
                  className="record-viewer__btn record-viewer__btn--primary"
                  onClick={onClose}
                >
                  {t('record.close')}
                </button>
              </div>
            )}
          </>
        )}
      </motion.div>
    </motion.div>
  )
}

export default PhotoRecordViewer
