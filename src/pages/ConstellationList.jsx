import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import ConstellationCard from '../components/ConstellationCard'
import TopNav from '../components/TopNav'
import { useFavorites } from '../utils/favorites'
import {
  PAGE_SIZE,
  SEASONS,
  TABS,
  constellationItems,
  countByTab,
  filterConstellations,
} from '../utils/constellationList'
import './ConstellationList.css'

const tabCounts = countByTab()

// 탭·계절·페이지를 주소(쿼리)에 담아 목록 상태를 만들고, 바꾸는 함수를 함께 반환
function useListQuery() {
  const [params, setParams] = useSearchParams()
  const tab = TABS.some((t) => t.key === params.get('tab')) ? params.get('tab') : 'all'
  const season = SEASONS.includes(params.get('season')) ? params.get('season') : null
  const requestedPage = Number(params.get('page')) || 1

  const move = (next) => {
    const merged = { tab, season, page: 1, ...next }
    const query = {}
    if (merged.tab !== 'all') query.tab = merged.tab
    if (merged.season) query.season = merged.season
    if (merged.page > 1) query.page = String(merged.page)
    setParams(query)
  }

  return { tab, season, requestedPage, move }
}

// 별자리를 탭·계절로 거르고 5개씩 2줄, 페이지 단위로 보여 주는 목록 화면
function ConstellationList() {
  const { tab, season, requestedPage, move } = useListQuery()
  const [favorites, toggleFavorite] = useFavorites()

  const filtered = useMemo(() => filterConstellations({ tab, season }), [tab, season])
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const page = Math.min(Math.max(requestedPage, 1), pageCount)
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="list-page">
      <TopNav />
      <main className="list">
        <header className="list__header">
          <h1>별자리</h1>
          <p>{constellationItems.length}개 별자리를 모두 둘러보고 눌러서 자세히 확인해 보세요</p>
        </header>

        <div className="list__filters">
          <div className="list__tabs" role="group" aria-label="별자리 종류">
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                className={`list__tab${tab === key ? ' list__tab--active' : ''}`}
                aria-pressed={tab === key}
                onClick={() => move({ tab: key, page: 1 })}
              >
                {label} {tabCounts[key]}
              </button>
            ))}
          </div>
          <div className="list__chips" role="group" aria-label="계절·지역">
            {SEASONS.map((name) => (
              <button
                key={name}
                type="button"
                className={`list__chip${season === name ? ' list__chip--active' : ''}`}
                aria-pressed={season === name}
                onClick={() => move({ season: season === name ? null : name, page: 1 })}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {visible.length > 0 ? (
          <ul className="list__grid">
            {visible.map((item) => (
              <ConstellationCard
                key={item.id}
                item={item}
                favorite={favorites.includes(item.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </ul>
        ) : (
          <p className="list__empty">조건에 맞는 별자리가 없어요.</p>
        )}

        {pageCount > 1 && (
          <nav className="list__pages" aria-label="페이지">
            <button
              type="button"
              className="list__page"
              aria-label="이전 페이지"
              disabled={page === 1}
              onClick={() => move({ page: page - 1 })}
            >
              ‹
            </button>
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                className={`list__page${n === page ? ' list__page--active' : ''}`}
                aria-current={n === page ? 'page' : undefined}
                onClick={() => move({ page: n })}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              className="list__page"
              aria-label="다음 페이지"
              disabled={page === pageCount}
              onClick={() => move({ page: page + 1 })}
            >
              ›
            </button>
          </nav>
        )}
      </main>
    </div>
  )
}

export default ConstellationList
