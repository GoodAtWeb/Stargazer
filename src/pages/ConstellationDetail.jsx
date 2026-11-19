import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import ConstellationMap from '../components/ConstellationMap'
import FortuneSection from '../components/FortuneSection'
import ObservationSection from '../components/ObservationSection'
import TopNav from '../components/TopNav'
import { useTranslation } from 'react-i18next'
import { formatMonthDay } from '../i18n/data'
import { useRevisitStore } from '../stores/revisitStore'
import { getConstellationById } from '../utils/constellations'
import './ConstellationDetail.css'

// '10-23' 형태의 날짜를 현재 언어의 '10월 23일' / 'October 23'으로 변환
const formatPeriodDate = (value) => {
  const [month, day] = value.split('-').map(Number)
  return formatMonthDay(month, day)
}

// 별자리 정보, 지도, 오늘의 운세를 한 페이지에 이어서 보여주고 선택된 별 상태를 관리
function ConstellationView({ constellation }) {
  const { t } = useTranslation()
  const location = useLocation()
  const remembered = useRevisitStore((s) => s.selectedStars[constellation.id])
  const setSelectedStar = useRevisitStore((s) => s.setSelectedStar)
  const [selectedId, setSelectedId] = useState(() =>
    location.state?.restore ? (remembered ?? null) : null,
  )
  useEffect(() => {
    setSelectedStar(constellation.id, selectedId)
  }, [constellation.id, selectedId, setSelectedStar])
  const { isZodiac, name, subName, symbol, element, rulingPlanet, season, period, origin } =
    constellation

  return (
    <div className="detail-page">
      <TopNav />
      <div className="detail__bar">
        <Link to={location.state?.from ?? '/constellations'} className="detail__back" aria-label={t('detail.back')}>
          ←
        </Link>
      </div>
      <main className="detail">
        <header className="detail__header">
          <h1>{name}</h1>
          <p className="detail__meta">
            {isZodiac && (
              <>
                {t('detail.symbol')}: {symbol} &nbsp; {t('detail.element')}: {element} &nbsp; {t('detail.ruler')}:{' '}
                {rulingPlanet}
                {season && <> &nbsp;</>}
              </>
            )}
            {season && (
              <>
                {t('detail.season')}: {season}
              </>
            )}
          </p>
          <p className="detail__period">
            {subName}
            {period && (
              <>
                {subName && ' · '}
                {formatPeriodDate(period.start)} ~ {formatPeriodDate(period.end)}
              </>
            )}
          </p>
        </header>

        <section className="detail__origin">
          <h2>{t('detail.origin')}</h2>
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

      <ObservationSection observation={constellation.observation} />

      <FortuneSection constellationId={constellation.id} />
    </div>
  )
}

// 주소의 id로 별자리를 찾아 상세 화면을 보여주는 페이지
function ConstellationDetail() {
  const { t } = useTranslation() // 언어가 바뀌면 다시 그려서 별자리 정보도 새 언어로 가져옴
  const { id } = useParams()
  const constellation = getConstellationById(id)

  if (!constellation) {
    return (
      <main className="detail detail--empty">
        <p>{t('detail.notFound')}</p>
      </main>
    )
  }

  return <ConstellationView key={constellation.id} constellation={constellation} />
}

export default ConstellationDetail
