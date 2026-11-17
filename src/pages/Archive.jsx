import { AnimatePresence, motion } from 'framer-motion'
import { Link, useSearchParams } from 'react-router-dom'
import FavoriteCard from '../components/FavoriteCard'
import PhotoRecordCard from '../components/PhotoRecordCard'
import TopNav from '../components/TopNav'
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
  { key: 'favorites', label: '즐겨찾기' },
  { key: 'photos', label: '사진 기록' },
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
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') === 'photos' ? 'photos' : 'favorites'
  const [favorites, toggleFavorite] = useFavorites()
  const photoRecords = useArchiveStore((s) => s.photoRecords)
  const hydrated = useArchiveStore((s) => s.hydrated)
  const items = favorites.map((id) => itemsById[id]).filter(Boolean)
  const counts = { favorites: items.length, photos: photoRecords.length }

  return (
    <div className="archive-page">
      <TopNav />
      <main className="archive">
        <h1 className="archive__title">나의 기록</h1>

        <div className="archive__tabs" role="tablist" aria-label="기록 종류">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              className={`archive__tab${tab === key ? ' archive__tab--active' : ''}`}
              onClick={() => setParams(key === 'favorites' ? {} : { tab: key }, { replace: true })}
            >
              {label} {hydrated && counts[key]}
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
                title="아직 즐겨찾기한 별자리가 없어요"
                text="별자리 목록에서 ✦를 눌러 마음에 드는 별자리를 모아 보세요"
                to="/constellations"
                button="별자리 보러 가기"
              />
            )}
          </>
        ) : (
          <>
            <ul className="archive__grid">
              <AnimatePresence>
                {photoRecords.map((record, index) => (
                  <PhotoRecordCard key={record.id} record={record} index={index} />
                ))}
              </AnimatePresence>
            </ul>

            {hydrated && photoRecords.length === 0 && (
              <EmptyState
                title="아직 저장한 사진이 없어요"
                text="사진 분석 결과에서 '나의 기록에 저장'을 눌러 사진을 모아 보세요"
                to="/photo"
                button="사진 분석하러 가기"
              />
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default Archive
