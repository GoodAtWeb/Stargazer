import { useState } from 'react'
import { useParams } from 'react-router-dom'
import ConstellationMap from '../components/ConstellationMap'
import FortuneSection from '../components/FortuneSection'
import TopNav from '../components/TopNav'
import { getConstellationById } from '../utils/constellations'
import './ConstellationDetail.css'

// '10-23' 형태의 날짜를 '10월 23일'로 변환
const formatMonthDay = (value) => {
  const [month, day] = value.split('-').map(Number)
  return `${month}월 ${day}일`
}

// 별자리 정보, 지도, 오늘의 운세를 한 페이지에 이어서 보여주고 선택된 별 상태를 관리
function ConstellationView({ constellation }) {
  const [selectedId, setSelectedId] = useState(null)
  const { nameKo, nameEn, symbol, element, rulingPlanet, season, period, origin } =
    constellation

  return (
    <div className="detail-page">
      <TopNav />
      <main className="detail">
        <header className="detail__header">
          <h1>{nameKo}</h1>
          <p className="detail__meta">
            상징: {symbol} &nbsp; 원소: {element} &nbsp; 수호성: {rulingPlanet}
            {season && <> &nbsp; 계절: {season}</>}
          </p>
          <p className="detail__period">
            {nameEn} · {formatMonthDay(period.start)} ~ {formatMonthDay(period.end)}
          </p>
        </header>

        <section className="detail__origin">
          <h2>별자리 유래</h2>
          <p>{origin}</p>
        </section>

        <section className={`detail__stage${selectedId ? ' detail__stage--selected' : ''}`}>
          <ConstellationMap
            constellation={constellation}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </section>
      </main>

      <FortuneSection constellationId={constellation.id} />
    </div>
  )
}

// 주소의 id로 별자리를 찾아 상세 화면을 보여주는 페이지
function ConstellationDetail() {
  const { id } = useParams()
  const constellation = getConstellationById(id)

  if (!constellation) {
    return (
      <main className="detail detail--empty">
        <p>존재하지 않는 별자리예요.</p>
      </main>
    )
  }

  return <ConstellationView key={constellation.id} constellation={constellation} />
}

export default ConstellationDetail
