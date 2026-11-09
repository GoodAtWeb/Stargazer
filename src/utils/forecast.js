import forecastData from '../data/forecastData.json'
import { getDirectionName, getSky } from './sky'

// 시간대별 그래프에 보여줄 시간 (24는 자정 00시, 28은 새벽 04시)
export const HOURS = [18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28]
export const regions = forecastData.regions

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
const SYNODIC_MONTH = 29.530588 // 달의 한 주기(일)

const pad = (n) => String(n).padStart(2, '0')
const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

// 오늘 날짜를 'YYYY-MM-DD'로 반환
export const getTodayString = () => {
  const now = new Date()
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

// 24시간 이후 값(24~28)도 시계 표기로 바꿔 '00:00' 형태로 반환
export const formatHour = (hour) => `${pad(hour % 24)}:00`

// 그래프에서 쓰는 '22시' 표기
export const formatHourShort = (hour) => `${pad(hour % 24)}시`

// '22:00' 입력값을 그래프 기준 시간(0~4시는 24~28)으로 변환
export const timeToHour = (time) => {
  const hour = Number(time.split(':')[0])
  return hour <= 6 ? hour + 24 : hour
}

// 그래프 기준 시간을 '22:00' 입력값으로 변환
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

// 달 (forecastData.json의 moons 값 사용, 없는 날짜는 평균 주기로 대략 계산)
const parseClock = (text) => {
  const [h, m] = text.split(':').map(Number)
  return h + m / 60
}

const formatClock = (decimalHour) => {
  const total = Math.round((decimalHour % 24) * 60)
  return `${pad(Math.floor(total / 60) % 24)}:${pad(total % 60)}`
}

const estimateMoon = (date) => {
  const [year, month, day] = date.split('-').map(Number)
  const julianDay = Date.UTC(year, month - 1, day, 13) / 86400000 + 2440587.5
  const raw = (julianDay - 2451550.26) % SYNODIC_MONTH
  const age = raw < 0 ? raw + SYNODIC_MONTH : raw
  const rise = (6 + (age * 50) / 60) % 24 // 신월에 오전 6시쯤 떠서 하루에 50분씩 늦어짐
  let phase = '그믐달'
  if (age < 1.8 || age >= 27.7) phase = '신월'
  else if (age < 7.4) phase = '초승달'
  else if (age < 9.2) phase = '상현달'
  else if (age < 13.8) phase = '차오르는 달'
  else if (age < 15.8) phase = '보름달'
  else if (age < 20.4) phase = '기우는 달'
  else if (age < 22.2) phase = '하현달'
  return {
    phase,
    illumination: Math.round(((1 - Math.cos((2 * Math.PI * age) / SYNODIC_MONTH)) / 2) * 100),
    rise: formatClock(rise),
    set: formatClock(rise + 12),
  }
}

const isMoonUp = (hour, rise, set) => {
  const h = hour % 24
  return rise < set ? h >= rise && h < set : h >= rise || h < set
}

const getMoon = (date, hour) => {
  const data = forecastData.moons[date] ?? estimateMoon(date)
  const rise = parseClock(data.rise)
  const set = parseClock(data.set)
  const percent = data.illumination
  const up = isMoonUp(hour, rise, set)
  const upFlags = HOURS.map((h) => isMoonUp(h, rise, set))

  let description = `${data.phase} · 밤새 달이 뜨지 않아 하늘이 어두워요`
  if (upFlags.every(Boolean)) {
    description = `${data.phase} · 밤새 떠 있어 하늘이 밝아요`
  } else if (upFlags.some(Boolean)) {
    description = upFlags[0]
      ? `${data.phase} · ${data.set}에 져서 이후 밤하늘이 어두워요`
      : `${data.phase} · ${data.rise}에 떠서 그 전까지 밤하늘이 어두워요`
  }

  let level = { tone: 'good', label: '좋음' }
  if (up && percent >= 60) level = { tone: 'bad', label: '나쁨' }
  else if (up && percent >= 25) level = { tone: 'normal', label: '보통' }

  const waxing = ['초승달', '상현달', '차오르는 달'].includes(data.phase)
  return { percent, up, level, quality: 100 - percent, description, rise, set, waxing }
}

// 구름, 습도 (forecastData.json의 weather: 18시~04시 시간별 값)
// 지역+날짜 값 → 지역 기본값 → 전체 기본값 순서로 찾음
const getWeather = (region, date) => {
  const byRegion = forecastData.weather[region]
  return byRegion?.[date] ?? byRegion?.default ?? forecastData.weather.default
}

// 시간별 배열(18시부터 한 칸씩)에서 해당 시간의 값을 꺼냄 (범위 밖은 양 끝 값)
const valueAt = (list, hour) => list[clamp(hour - HOURS[0], 0, list.length - 1)]

const getCloudCard = (weather, hour) => {
  const percent = valueAt(weather.cloud, hour)
  const later = valueAt(weather.cloud, hour + 3)

  let summary = '대체로 맑음'
  if (percent >= 75) summary = '흐려서 별이 잘 안 보여요'
  else if (percent >= 50) summary = '구름이 많아요'
  else if (percent >= 20) summary = '구름이 조금 있어요'

  let trend = ''
  if (later <= percent - 8) trend = ' · 이후 더 맑아져요'
  else if (later >= percent + 8) trend = ' · 이후 구름이 늘어요'

  let level = { tone: 'good', label: '좋음' }
  if (percent >= 60) level = { tone: 'bad', label: '나쁨' }
  else if (percent >= 30) level = { tone: 'normal', label: '보통' }

  return { percent, level, quality: 100 - percent, description: `${summary}${trend}` }
}

const getHumidityCard = (weather, hour) => {
  const percent = valueAt(weather.humidity, hour)
  const visibility = Math.round(clamp(35 - percent * 0.3, 3, 30))
  const fogHour = HOURS.find((h) => valueAt(weather.humidity, h) >= 80)

  let note = '공기가 맑아 멀리까지 보여요'
  if (fogHour !== undefined) note = `${fogHour % 24 <= 6 ? '새벽' : '밤'}에 안개가 낄 수 있어요`

  let level = { tone: 'good', label: '좋음' }
  if (percent >= 80) level = { tone: 'bad', label: '나쁨' }
  else if (percent >= 60) level = { tone: 'normal', label: '보통' }

  return {
    percent,
    level,
    quality: clamp((100 - percent) * 1.5, 0, 100),
    description: `${note} · 시정거리 ${visibility}km`,
  }
}

// 빛공해 (지역별 Bortle 등급)
const getBortle = (region) => forecastData.regions.find((r) => r.name === region)?.bortle ?? 5

const getBortleCard = (region) => {
  const grade = getBortle(region)
  let description = '도심 하늘 · 밝은 별만 보여요'
  if (grade <= 2) description = '거의 완전한 암흑 · 은하수가 선명해요'
  else if (grade === 3) description = '시골 하늘 수준 · 도시(7~9)보다 훨씬 어두워요'
  else if (grade === 4) description = '시골과 도시의 경계 · 은하수가 어렴풋이 보여요'
  else if (grade <= 6) description = '교외 하늘 · 밝은 별 위주로 보여요'

  let level = { tone: 'good', label: '좋음' }
  if (grade >= 6) level = { tone: 'bad', label: '나쁨' }
  else if (grade >= 4) level = { tone: 'normal', label: '보통' }

  return { grade, level, quality: ((10 - grade) / 9) * 100, description }
}

// 점수
const calcScore = ({ moon, cloud, bortle, humidity, darkness }) => {
  const moonPenalty = moon.up ? (moon.percent / 100) * 30 : 0
  const humidityPenalty = Math.max(0, humidity - 60) * 0.25
  const raw = 100 - moonPenalty - cloud * 0.55 - (bortle - 1) * 3 - humidityPenalty
  return Math.round(clamp(raw, 0, 100) * darkness)
}

const getStatus = (score, darkness) => {
  if (darkness < 0.3) {
    return { tone: 'bad', label: '낮 시간', message: '해가 떠 있는 시간이에요.\n18시부터 새벽 4시 사이를 골라 보세요.' }
  }
  if (score >= 80) {
    return { tone: 'good', label: '별 보기 좋음', message: '달빛과 구름이 거의 방해하지 않아요.\n별자리를 찾기 좋은 밤이에요.' }
  }
  if (score >= 60) {
    return { tone: 'normal', label: '별 보기 보통', message: '별은 보이지만 달빛이나 구름이 조금 방해해요.\n밝은 별자리부터 찾아보세요.' }
  }
  if (score >= 40) {
    return { tone: 'poor', label: '별 보기 아쉬움', message: '구름이나 밝은 달빛 때문에 별이 흐릿해요.\n밝은 별 몇 개만 보일 수 있어요.' }
  }
  return { tone: 'bad', label: '별 보기 어려움', message: '지금은 별을 보기 어려워요.\n다른 시간대를 골라 보세요.' }
}

// 하늘에서 어느 정도 높이 떠 있는 별자리를 높은 순서대로 목록으로 만듦 (밤하늘 지도와 같은 데이터)
const getVisibleConstellations = (sky) =>
  (sky.darkness < 0.6 ? [] : sky.constellations)
    .filter((c) => c.alt >= 12)
    .sort((a, b) => b.alt - a.alt)
    .map(({ id, nameKo, shape, az, stars, lines }) => ({
      id,
      nameKo,
      shape,
      direction: getDirectionName(az),
      stars,
      lines,
    }))

// 지역 위치와 별 개수에 쓸 한계 등급 (빛공해가 심할수록 어두운 별이 안 보임)
const getRegionPlace = (region) =>
  forecastData.regions.find((r) => r.name === region) ?? { lat: 37.5, lon: 127 }

const getLimitMagnitude = (bortleGrade) => 6.6 - 0.4 * (bortleGrade - 1)

// 지역, 날짜, 시간을 받아 별 예보 결과 전체를 만들어 반환
export const getForecast = ({ region, date, time }) => {
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
  const weekday = WEEKDAYS[new Date(year, month - 1, day).getDay()]
  const placeName = region.trim().split(/\s+/).pop()

  return {
    hour,
    score,
    status: getStatus(score, getDarkness(hour)),
    summary: `${placeName} · ${month}월 ${day}일(${weekday}) ${formatHour(hour)}`,
    conditions: { moon, cloud, bortle, humidity },
    hourly,
    best,
    sky,
    constellations: getVisibleConstellations(sky),
  }
}
