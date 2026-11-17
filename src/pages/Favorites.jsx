import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import FavoriteCard from '../components/FavoriteCard'
import TopNav from '../components/TopNav'
import { constellationItems } from '../utils/constellationList'
import { getConstellationById } from '../utils/constellations'
import { useArchiveStore } from '../stores/archiveStore'
import { useFavorites } from '../utils/favorites'
import { getRankedHoroscopes } from '../utils/horoscopes'
import './Favorites.css'

const itemsById = Object.fromEntries(constellationItems.map((item) => [item.id, item]))
const fortunesById = Object.fromEntries(
  getRankedHoroscopes().map((h, index) => [h.id, { score: h.score, rank: index + 1 }]),
)

function Favorites() {
  const [favorites, toggleFavorite] = useFavorites()
  const hydrated = useArchiveStore((s) => s.hydrated)
  const items = favorites.map((id) => itemsById[id]).filter(Boolean)

  return (
    <div className="favorites-page">
      <TopNav />
      <main className="favorites">
        <h1 className="favorites__title">즐겨찾기</h1>

        <ul className="favorites__grid">
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
          // 마지막 카드가 사라진 뒤에 나타나도록 지연
          <motion.div
            className="favorites__empty"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35, ease: 'easeOut' }}
          >
            <p className="favorites__empty-title">아직 즐겨찾기한 별자리가 없어요</p>
            <p className="favorites__empty-text">
              별자리 목록에서 ✦를 눌러 마음에 드는 별자리를 모아 보세요
            </p>
            <Link to="/constellations" className="favorites__empty-button">
              별자리 보러 가기
            </Link>
          </motion.div>
        )}
      </main>
    </div>
  )
}

export default Favorites
