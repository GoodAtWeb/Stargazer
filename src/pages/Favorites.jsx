import TopNav from '../components/TopNav'
import './Favorites.css'

function Favorites() {
  return (
    <div className="favorites-page">
      <TopNav />
      <main className="favorites">
        <h1 className="favorites__title">즐겨찾기</h1>
      </main>
    </div>
  )
}

export default Favorites
