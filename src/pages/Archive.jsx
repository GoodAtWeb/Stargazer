import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, useSearchParams } from 'react-router-dom'
import FavoriteCard from '../components/FavoriteCard'
import PhotoRecordCard from '../components/PhotoRecordCard'
import PhotoRecordViewer from '../components/PhotoRecordViewer'
import TopNav from '../components/TopNav'
import { useTranslation } from 'react-i18next'
import { constellationItems } from '../utils/constellationList'
import { getConstellationById } from '../utils/constellations'
import { useArchiveStore } from '../stores/archiveStore'
import { useFavorites } from '../utils/favorites'
import { getRankedHoroscopes } from '../utils/horoscopes'
import './Archive.css'

const itemsById = Object.fromEntries(constellationItems.map((item) => [item.id, item]))
const fortunesById = Object.fromEntries(
  getRankedHoroscopes().map((h, index) => [h.id, { score: h.score, rank: index + 1 }]),
)

const TABS = [
  { key: 'favorites', label: 'archive.tabFavorites' },
  { key: 'photos', label: 'archive.tabPhotos' },
]

function EmptyState({ title, text, to, button }) {
  return (
    // 마지막 카드가 사라진 뒤에 나타나도록 지연
    <motion.div
      className="archive__empty"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.35, ease: 'easeOut' }}
    >
      <p className="archive__empty-title">{title}</p>
      <p className="archive__empty-text">{text}</p>
      <Link to={to} className="archive__empty-button">
        {button}
      </Link>
    </motion.div>
  )
}

function Archive() {
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') === 'photos' ? 'photos' : 'favorites'
  const [favorites, toggleFavorite] = useFavorites()
  const photoRecords = useArchiveStore((s) => s.photoRecords)
  const hydrated = useArchiveStore((s) => s.hydrated)
  const [openId, setOpenId] = useState(null)
  const openRecord = photoRecords.find((r) => r.id === openId)
  const items = favorites.map((id) => itemsById[id]).filter(Boolean)
  const counts = { favorites: items.length, photos: photoRecords.length }

  return (
    <div className="archive-page">
      <TopNav />
      <main className="archive">
        <h1 className="archive__title">{t('archive.title')}</h1>

        <div className="archive__tabs" role="tablist" aria-label={t('archive.kind')}>
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              className={`archive__tab${tab === key ? ' archive__tab--active' : ''}`}
              onClick={() => setParams(key === 'favorites' ? {} : { tab: key }, { replace: true })}
            >
              {t(label)} {hydrated && counts[key]}
            </button>
          ))}
        </div>

        {tab === 'favorites' ? (
          <>
            <ul className="archive__grid">
              <AnimatePresence>
                {items.map((item, index) => (
                  <FavoriteCard
                    key={item.id}
                    item={item}
                    period={getConstellationById(item.id)?.period}
                    fortune={fortunesById[item.id]}
                    index={index}
                    onRemove={toggleFavorite}
                  />
                ))}
              </AnimatePresence>
            </ul>

            {hydrated && items.length === 0 && (
              <EmptyState
                title={t('archive.favEmptyTitle')}
                text={t('archive.favEmptyText')}
                to="/constellations"
                button={t('archive.favEmptyButton')}
              />
            )}
          </>
        ) : (
          <>
            <ul className="archive__grid">
              <AnimatePresence>
                {photoRecords.map((record, index) => (
                  <PhotoRecordCard
                    key={record.id}
                    record={record}
                    index={index}
                    onOpen={setOpenId}
                  />
                ))}
              </AnimatePresence>
            </ul>

            {hydrated && photoRecords.length === 0 && (
              <EmptyState
                title={t('archive.photoEmptyTitle')}
                text={t('archive.photoEmptyText')}
                to="/photo"
                button={t('archive.photoEmptyButton')}
              />
            )}
          </>
        )}
      </main>

      <AnimatePresence>
        {openRecord && (
          <PhotoRecordViewer
            key={openRecord.id}
            record={openRecord}
            onClose={() => setOpenId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default Archive
