import FavoriteCard from '../components/FavoriteCard'
import TopNav from '../components/TopNav'
import { constellationItems } from '../utils/constellationList'
import { getConstellationById } from '../utils/constellations'
import { useFavorites } from '../utils/favorites'
import { getRankedHoroscopes } from '../utils/horoscopes'
import './Favorites.css'

const itemsById = Object.fromEntries(constellationItems.map((item) => [item.id, item]))
const fortunesById = Object.fromEntries(
  getRankedHoroscopes().map((h, index) => [h.id, { score: h.score, rank: index + 1 }]),
)

function Favorites() {
  const [favorites, toggleFavorite] = useFavorites()
  const items = favorites.map((id) => itemsById[id]).filter(Boolean)

  return (
    <div className="favorites-page">
      <TopNav />
      <main className="favorites">
        <h1 className="favorites__title">즐겨찾기</h1>

        <ul className="favorites__grid">
          {items.map((item) => (
            <FavoriteCard
              key={item.id}
              item={item}
              period={getConstellationById(item.id)?.period}
              fortune={fortunesById[item.id]}
              onRemove={toggleFavorite}
            />
          ))}
        </ul>
      </main>
    </div>
  )
}

export default Favorites
