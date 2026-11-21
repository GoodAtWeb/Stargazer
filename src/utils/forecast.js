import forecastData from '../data/forecastData.json'
import { getDirectionName, getSky } from './sky'
import { t } from '../i18n'
import { getLang } from '../i18n'
import { getWeekdayName, getMonthName, getRegionLabel, resolveRegion } from '../i18n/data'

// 시간대별 그래프에 보여줄 시간 (24는 자정 00시, 28은 새벽 04시)
export const HOURS = [18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28]
export const regions = forecastData.regions

const SYNODIC_MONTH = 29.530588 // 달의 한 주기(일)

const pad = (n) => String(n).padStart(2, '0')
const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

// ── 시간 ────────────────────────────────────────────────────

// 오늘 날짜를 'YYYY-MM-DD'로 반환
export const getTodayString = () => {
  const now = new Date()
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

// 24시간 이후 값(24~28)도 시계 표기로 바꿔 '00:00' 형태로 반환
export const formatHour = (hour) => `${pad(hour % 24)}:00`

// 그래프에서 쓰는 '22시' 표기를 반환
export const formatHourShort = (hour) => t('fc.hourShort', { hour: pad(hour % 24) })

// '22:00' 입력값을 그래프 기준 시간(0~4시는 24~28)으로 바꿔 반환
export const timeToHour = (time) => {
  const hour = Number(time.split(':')[0])
  return hour <= 6 ? hour + 24 : hour
}

// 그래프 기준 시간을 '22:00' 입력값으로 바꿔 반환
export const hourToTime = (hour) => formatHour(hour)

// 해가 진 정도 (0: 낮, 1: 완전한 밤)
const getDarkness = (hour) => {
  const h = hour % 24
  if (h >= 20 || h <= 4) return 1
  if (h === 19) return 0.65
  if (h === 18) return 0.3
  if (h === 5) return 0.7
  if (h === 6) return 0.3
  return 0
}

// ── 달 ──────────────────────────────────────────────────────
// forecastData.json의 moons 값을 쓰고, 없는 날짜는 평균 주기로 대략 계산함

const parseClock = (text) => {
  const [h, m] = text.split(':').map(Number)
  return h + m / 60
}

const formatClock = (decimalHour) => {
  const total = Math.round((decimalHour % 24) * 60)
  return `${pad(Math.floor(total / 60) % 24)}:${pad(total % 60)}`
}

// 날짜로 달의 위상, 밝기, 뜨고 지는 시각을 대략 계산해 반환
const estimateMoon = (date) => {
  const [year, month, day] = date.split('-').map(Number)
  const julianDay = Date.UTC(year, month - 1, day, 13) / 86400000 + 2440587.5
  const raw = (julianDay - 2451550.26) % SYNODIC_MONTH
  const age = raw < 0 ? raw + SYNODIC_MONTH : raw
  const rise = (6 + (age * 50) / 60) % 24 // 신월에 오전 6시쯤 떠서 하루에 50분씩 늦어짐
  let phase = '그믐달' // i18n-ignore
  if (age < 1.8 || age >= 27.7) phase = '신월' // i18n-ignore
  else if (age < 7.4) phase = '초승달' // i18n-ignore
  else if (age < 9.2) phase = '상현달' // i18n-ignore
  else if (age < 13.8) phase = '차오르는 달' // i18n-ignore
  else if (age < 15.8) phase = '보름달' // i18n-ignore
  else if (age < 20.4) phase = '기우는 달' // i18n-ignore
  else if (age < 22.2) phase = '하현달' // i18n-ignore
  return {
    phase,
    illumination: Math.round(((1 - Math.cos((2 * Math.PI * age) / SYNODIC_MONTH)) / 2) * 100),
    rise: formatClock(rise),
    set: formatClock(rise + 12),
  }
}

// 그 시간에 달이 떠 있는지 반환
const isMoonUp = (hour, rise, set) => {
  const h = hour % 24
  return rise < set ? h >= rise && h < set : h >= rise || h < set
}

// 달 조건 카드에 쓸 밝기, 떠 있는지, 단계, 설명을 반환
const getMoon = (date, hour) => {
  const data = forecastData.moons[date] ?? estimateMoon(date)
  const rise = parseClock(data.rise)
  const set = parseClock(data.set)
  const percent = data.illumination
  const up = isMoonUp(hour, rise, set)
  const upFlags = HOURS.map((h) => isMoonUp(h, rise, set))

  const phase = t(`fc.phase.${data.phase}`)
  let description = t('fc.moon.none', { phase })
  if (upFlags.every(Boolean)) {
    description = t('fc.moon.all', { phase })
  } else if (upFlags.some(Boolean)) {
    description = upFlags[0]
      ? t('fc.moon.sets', { phase, time: data.set })
      : t('fc.moon.rises', { phase, time: data.rise })
  }

  let level = { tone: 'good', label: t('fc.level.good') }
  if (up && percent >= 60) level = { tone: 'bad', label: t('fc.level.bad') }
  else if (up && percent >= 25) level = { tone: 'normal', label: t('fc.level.normal') }

  const waxing = ['초승달', '상현달', '차오르는 달'].includes(data.phase) // i18n-ignore
  return { percent, up, level, quality: 100 - percent, description, rise, set, waxing }
}

// ── 구름·습도 ──────────────────────────────────────────────
// forecastData.json의 weather 값 (18시~04시 시간별 값)

// 지역+날짜 값 → 지역 기본값 → 전체 기본값 순서로 찾아 반환
const getWeather = (region, date) => {
  const byRegion = forecastData.weather[region]
  return byRegion?.[date] ?? byRegion?.default ?? forecastData.weather.default
}

// 시간별 배열(18시부터 한 칸씩)에서 해당 시간의 값을 꺼냄 (범위 밖은 양 끝 값)
const valueAt = (list, hour) => list[clamp(hour - HOURS[0], 0, list.length - 1)]

// 구름 조건 카드에 쓸 구름양, 단계, 설명을 반환
const getCloudCard = (weather, hour) => {
  const percent = valueAt(weather.cloud, hour)
  const later = valueAt(weather.cloud, hour + 3)

  let summary = t('fc.cloud.clear')
  if (percent >= 75) summary = t('fc.cloud.overcast')
  else if (percent >= 50) summary = t('fc.cloud.cloudy')
  else if (percent >= 20) summary = t('fc.cloud.few')

  let trend = ''
  if (later <= percent - 8) trend = t('fc.cloud.clearing')
  else if (later >= percent + 8) trend = t('fc.cloud.thickening')

  let level = { tone: 'good', label: t('fc.level.good') }
  if (percent >= 60) level = { tone: 'bad', label: t('fc.level.bad') }
  else if (percent >= 30) level = { tone: 'normal', label: t('fc.level.normal') }

  return { percent, level, quality: 100 - percent, description: `${summary}${trend}` }
}

// 습도 조건 카드에 쓸 습도, 단계, 설명을 반환
const getHumidityCard = (weather, hour) => {
  const percent = valueAt(weather.humidity, hour)
  const visibility = Math.round(clamp(35 - percent * 0.3, 3, 30))
  const fogHour = HOURS.find((h) => valueAt(weather.humidity, h) >= 80)

  let note = t('fc.hum.clear')
  if (fogHour !== undefined) note = t(fogHour % 24 <= 6 ? 'fc.hum.fogDawn' : 'fc.hum.fogNight')

  let level = { tone: 'good', label: t('fc.level.good') }
  if (percent >= 80) level = { tone: 'bad', label: t('fc.level.bad') }
  else if (percent >= 60) level = { tone: 'normal', label: t('fc.level.normal') }

  return {
    percent,
    level,
    quality: clamp((100 - percent) * 1.5, 0, 100),
    description: t('fc.hum.desc', { note, km: visibility }),
  }
}

// ── 빛공해 ──────────────────────────────────────────────────

// 지역의 Bortle 등급을 반환 (없으면 5)
const getBortle = (region) => forecastData.regions.find((r) => r.name === region)?.bortle ?? 5

// 빛공해 조건 카드에 쓸 등급, 단계, 설명을 반환
const getBortleCard = (region) => {
  const grade = getBortle(region)
  let description = t('fc.bortle.city')
  if (grade <= 2) description = t('fc.bortle.dark')
  else if (grade === 3) description = t('fc.bortle.rural')
  else if (grade === 4) description = t('fc.bortle.edge')
  else if (grade <= 6) description = t('fc.bortle.suburb')

  let level = { tone: 'good', label: t('fc.level.good') }
  if (grade >= 6) level = { tone: 'bad', label: t('fc.level.bad') }
  else if (grade >= 4) level = { tone: 'normal', label: t('fc.level.normal') }

  return { grade, level, quality: ((10 - grade) / 9) * 100, description }
}

// ── 점수 ────────────────────────────────────────────────────

// 달, 구름, 빛공해, 습도, 어두운 정도로 관측 점수(0~100)를 계산해 반환
const calcScore = ({ moon, cloud, bortle, humidity, darkness }) => {
  const moonPenalty = moon.up ? (moon.percent / 100) * 30 : 0
  const humidityPenalty = Math.max(0, humidity - 60) * 0.25
  const raw = 100 - moonPenalty - cloud * 0.55 - (bortle - 1) * 3 - humidityPenalty
  return Math.round(clamp(raw, 0, 100) * darkness)
}

// 점수에 맞는 상태 이름과 안내 문구를 반환
const getStatus = (score, darkness) => {
  if (darkness < 0.3) {
    return { tone: 'bad', label: t('fc.status.day'), message: t('fc.status.dayMsg') }
  }
  if (score >= 80) {
    return { tone: 'good', label: t('fc.status.good'), message: t('fc.status.goodMsg') }
  }
  if (score >= 60) {
    return { tone: 'normal', label: t('fc.status.normal'), message: t('fc.status.normalMsg') }
  }
  if (score >= 40) {
    return { tone: 'poor', label: t('fc.status.poor'), message: t('fc.status.poorMsg') }
  }
  return { tone: 'bad', label: t('fc.status.bad'), message: t('fc.status.badMsg') }
}

// ── 예보 결과 ──────────────────────────────────────────────

// 하늘에서 어느 정도 높이 떠 있는 별자리를 높은 순서대로 목록으로 만듦 (밤하늘 지도와 같은 데이터)
const getVisibleConstellations = (sky) =>
  (sky.darkness < 0.6 ? [] : sky.constellations)
    .filter((c) => c.alt >= 12)
    .sort((a, b) => b.alt - a.alt)
    .map(({ id, name, shape, az, stars, lines }) => ({
      id,
      name,
      shape,
      direction: getDirectionName(az),
      stars,
      lines,
    }))

// 지역 위치(위도·경도)를 반환 (없으면 서울 근처)
const getRegionPlace = (region) =>
  forecastData.regions.find((r) => r.name === region) ?? { lat: 37.5, lon: 127 }

// 별 개수에 쓸 한계 등급을 반환 (빛공해가 심할수록 어두운 별이 안 보임)
const getLimitMagnitude = (bortleGrade) => 6.6 - 0.4 * (bortleGrade - 1)

// 지역, 날짜, 시간을 받아 별 예보 결과 전체를 만들어 반환
export const getForecast = ({ region: inputRegion, date, time }) => {
  const region = resolveRegion(inputRegion)
  const hour = timeToHour(time)
  const weather = getWeather(region, date)
  const moon = getMoon(date, hour)
  const cloud = getCloudCard(weather, hour)
  const humidity = getHumidityCard(weather, hour)
  const bortle = getBortleCard(region)

  const scoreAt = (h) =>
    calcScore({
      moon: getMoon(date, h),
      cloud: valueAt(weather.cloud, h),
      bortle: bortle.grade,
      humidity: valueAt(weather.humidity, h),
      darkness: getDarkness(h),
    })

  const hourly = HOURS.map((h) => ({ hour: h, score: scoreAt(h) }))
  const best = hourly.reduce((a, b) => (b.score > a.score ? b : a))
  const score = scoreAt(hour)
  const place = getRegionPlace(region)
  const darkness = getDarkness(hour)
  const sky = {
    ...getSky({ lat: place.lat, lon: place.lon, date, hour, moon }),
    darkness,
    cloud: cloud.percent,
    limitMagnitude: getLimitMagnitude(bortle.grade),
    moonInfo: { percent: moon.percent, waxing: moon.waxing },
  }

  const [, month, day] = date.split('-').map(Number)
  const [year] = date.split('-').map(Number)
  const weekday = getWeekdayName(new Date(year, month - 1, day).getDay())
  const placeName = getRegionLabel(region, true)
  const dateText = t('fc.dateWeekday', { month: getLang() === 'en' ? getMonthName(month, true) : month, day, weekday })

  return {
    hour,
    score,
    status: getStatus(score, getDarkness(hour)),
    summary: t('fc.summary', { place: placeName, date: dateText, time: formatHour(hour) }),
    conditions: { moon, cloud, bortle, humidity },
    hourly,
    best,
    sky,
    constellations: getVisibleConstellations(sky),
  }
}
