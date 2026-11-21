import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import ConditionCard from '../components/ConditionCard'
import TwinkleStars from '../components/TwinkleStars'
import ForecastForm from '../components/ForecastForm'
import HourlyChart from '../components/HourlyChart'
import NightSky from '../components/NightSky'
import RecentRegions from '../components/RecentRegions'
import ScoreCard from '../components/ScoreCard'
import TopNav from '../components/TopNav'
import VisibleConstellations from '../components/VisibleConstellations'
import { useTranslation } from 'react-i18next'
import { getRegionLabel, resolveRegion } from '../i18n/data'
import { getForecast, getTodayString, hourToTime } from '../utils/forecast'
import { addRecentRegion, getRecentRegions, removeRecentRegion } from '../utils/recentRegions'
import './StarForecast.css'

const DEFAULT_REGION = '서울특별시 성북구' // i18n-ignore 데이터에 저장된 기준 이름

// 처음 화면의 기본 검색값 (기본 지역, 오늘, 22시)
const makeDefaultQuery = () => ({
  region: getRegionLabel(DEFAULT_REGION),
  date: getTodayString(),
  time: '22:00',
})

// 다른 페이지에 갔다가 돌아와도 마지막 검색 결과를 그대로 보여주기 위한 값
// 모듈 변수라서 새로고침하면 사라지고, 페이지 이동에는 남아 있음
let lastSearch = null

const SPRING = { type: 'spring', stiffness: 90, damping: 20 }

// 지역, 날짜, 시간을 입력하면 그 순간의 관측 점수와 조건, 볼 수 있는 별자리를 보여주는 별 예보 페이지
// 처음엔 검색창만 보이고, 검색하면 검색창이 위로 올라가며 결과가 나타남
function StarForecast() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const [draft, setDraft] = useState(() => lastSearch?.draft ?? makeDefaultQuery())
  const [query, setQuery] = useState(() => lastSearch?.query ?? draft)
  const [recentRegions, setRecentRegions] = useState(getRecentRegions)
  const [searched, setSearched] = useState(() => lastSearch !== null) // 한 번이라도 검색했는지 (처음엔 검색창만 보여줌)
  const [activeId, setActiveId] = useState(null) // 밤하늘 지도와 목록이 같이 강조할 별자리
  const [focus, setFocus] = useState(null) // 지도에서 찾을 별자리 (누를 때마다 새로 요청)
  // 언어를 바꾸면 입력된 지역 이름도 그 언어로 바꿔서 보여줌 (목록에 있는 지역만)
  useEffect(() => {
    const localize = (q) => {
      const label = getRegionLabel(resolveRegion(q.region))
      return label === q.region ? q : { ...q, region: label }
    }
    setDraft(localize)
    setQuery(localize)
  }, [lang])
  useEffect(() => {
    if (searched) lastSearch = { draft, query }
  }, [searched, draft, query])

  const forecast = useMemo(() => getForecast(query), [query, lang])
  const { moon, cloud, bortle, humidity } = forecast.conditions

  const handleChange = (field, value) => setDraft((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!draft.region.trim() || !draft.date || !draft.time) return
    const next = { ...draft, region: draft.region.trim() }
    setDraft(next)
    setQuery(next)
    setSearched(true)
    setRecentRegions(addRecentRegion(next.region))
  }

  // 최근 검색한 지역을 누르면 날짜와 시간은 그대로 두고 그 지역으로 바로 검색함
  const handleSelectRecent = (region) => {
    const next = { ...draft, region }
    setDraft(next)
    setQuery(next)
    setSearched(true)
    setRecentRegions(addRecentRegion(region))
  }

  // 그래프의 막대를 누르면 그 시간으로 바로 다시 계산함
  const handleSelectHour = (hour) => {
    const next = { ...query, time: hourToTime(hour) }
    setDraft(next)
    setQuery(next)
  }

  return (
    <div className="forecast-page">
      <TwinkleStars />
      <TopNav />
      <main className={searched ? 'forecast' : 'forecast forecast--intro'}>
        <motion.div layout="position" transition={SPRING} className="forecast__top">
          <header className="forecast__header">
            <h1>{t('forecast.title')}</h1>
            <p>{t('forecast.desc')}</p>
          </header>

          <div className="forecast__search">
            <ForecastForm values={draft} onChange={handleChange} onSubmit={handleSubmit} />
            <RecentRegions
              regions={recentRegions}
              onSelect={handleSelectRecent}
              onRemove={(region) => setRecentRegions(removeRecentRegion(region))}
            />
          </div>
        </motion.div>

        <AnimatePresence initial={false}>
          {searched && (
            <motion.div
              className="forecast__results"
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 90, damping: 20, delay: 0.12 }}
            >
              <div className="forecast__grid">
                <ScoreCard score={forecast.score} status={forecast.status} summary={forecast.summary} />
                <div className="forecast__conditions">
                  <ConditionCard
                    title={t('forecast.moon')}
                    value={`${moon.percent}%`}
                    unit={t('forecast.moonUnit')}
                    level={moon.level}
                    quality={moon.quality}
                    description={moon.description}
                  />
                  <ConditionCard
                    title={t('forecast.cloud')}
                    value={`${cloud.percent}%`}
                    unit={t('forecast.cloudUnit')}
                    level={cloud.level}
                    quality={cloud.quality}
                    description={cloud.description}
                  />
                  <ConditionCard
                    title={t('forecast.light')}
                    value={bortle.grade}
                    unit={t('forecast.lightUnit')}
                    level={bortle.level}
                    quality={bortle.quality}
                    description={bortle.description}
                  />
                  <ConditionCard
                    title={t('forecast.humidity')}
                    value={`${humidity.percent}%`}
                    unit={t('forecast.humidityUnit')}
                    level={humidity.level}
                    quality={humidity.quality}
                    description={humidity.description}
                  />
                </div>
              </div>

              <NightSky
                sky={forecast.sky}
                skyKey={`${query.region}|${query.date}|${query.time}`}
                activeId={activeId}
                onActive={setActiveId}
                focus={focus}
              />

              <HourlyChart
                hourly={forecast.hourly}
                best={forecast.best}
                selectedHour={forecast.hour}
                onSelect={handleSelectHour}
              />

              <VisibleConstellations
                items={forecast.constellations}
                activeId={activeId}
                onActive={setActiveId}
                onFind={(id) => setFocus({ id, n: Date.now() })}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

export default StarForecast
