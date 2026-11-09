import skyData from '../data/skyData.json'
import constellations from '../data/constellations.json'

const RAD = Math.PI / 180
const DIRECTIONS = ['북쪽', '북동쪽', '동쪽', '남동쪽', '남쪽', '남서쪽', '서쪽', '북서쪽']

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

// 한국 시간(UTC+9)의 날짜와 시간을 율리우스일로 바꿈
const getJulianDate = (date, hour) => {
  const [year, month, day] = date.split('-').map(Number)
  return Date.UTC(year, month - 1, day, hour - 9) / 86400000 + 2440587.5
}

// 적경(ra), 적위(dec)를 관측 지점과 시각에 맞는 고도(alt)와 방위(az, 북=0 동=90)로 바꿈
const toHorizontal = (ra, dec, lat, localSiderealTime) => {
  const hourAngle = (localSiderealTime - ra) * RAD
  const d = dec * RAD
  const phi = lat * RAD
  const sinAlt = Math.sin(d) * Math.sin(phi) + Math.cos(d) * Math.cos(phi) * Math.cos(hourAngle)
  const alt = Math.asin(clamp(sinAlt, -1, 1)) / RAD
  const az =
    (Math.atan2(Math.sin(hourAngle), Math.cos(hourAngle) * Math.sin(phi) - Math.tan(d) * Math.cos(phi)) / RAD +
      540) %
    360
  return { alt, az }
}

// 방위를 '남동쪽' 같은 말로 바꿈
export const getDirectionName = (az) => DIRECTIONS[Math.round(az / 45) % 8]

// 별 하나의 적경, 적위를 구함. 별에 ra/dec가 있으면(실제 좌표) 그대로 쓰고, 없으면 별자리 중심에서 그림 위치만큼 떨어뜨림
const resolveStar = (star, center, box) => {
  if (star.ra !== undefined && star.dec !== undefined) return { ra: star.ra, dec: star.dec }
  const degreesPerUnit = center.span / box.extent
  const dec = center.dec + (box.cy - star.y) * degreesPerUnit
  const ra = center.ra + ((box.cx - star.x) * degreesPerUnit) / Math.max(Math.cos(dec * RAD), 0.3)
  return { ra, dec }
}

// 달은 뜨는 시각과 지는 시각 사이를 동쪽에서 서쪽으로 지나가는 호로 단순하게 표현
const getMoonPosition = (hour, moon) => {
  const length = (moon.set - moon.rise + 24) % 24
  const passed = (((hour % 24) - moon.rise + 24) % 24) / length
  if (passed > 1) return null
  return { az: 90 + 180 * passed, alt: 62 * Math.sin(Math.PI * passed) }
}

// 지점, 날짜, 시간에 보이는 밤하늘(별자리, 배경 별, 달)을 하늘 좌표로 계산해 반환
export const getSky = ({ lat, lon, date, hour, moon }) => {
  const julianDay = getJulianDate(date, hour)
  const greenwichSiderealTime = (280.46061837 + 360.98564736629 * (julianDay - 2451545)) % 360
  const localSiderealTime = greenwichSiderealTime + lon

  const visibleConstellations = constellations
    .filter((c) => skyData.constellations[c.id])
    .map((c) => {
      const center = skyData.constellations[c.id]
      const xs = c.stars.map((s) => s.x)
      const ys = c.stars.map((s) => s.y)
      const box = {
        cx: (Math.min(...xs) + Math.max(...xs)) / 2,
        cy: (Math.min(...ys) + Math.max(...ys)) / 2,
        extent: Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys), 1),
      }
      const stars = c.stars.map((star) => {
        const { ra, dec } = resolveStar(star, center, box)
        return { ...star, ...toHorizontal(ra, dec, lat, localSiderealTime) }
      })
      const middle = toHorizontal(center.ra, center.dec, lat, localSiderealTime)
      return { id: c.id, nameKo: c.nameKo, shape: center.shape, lines: c.lines, stars, ...middle }
    })
    .filter((c) => c.alt > 3)

  const background = skyData.background
    .map(({ ra, dec, mag }) => ({ ...toHorizontal(ra, dec, lat, localSiderealTime), mag }))
    .filter((s) => s.alt > 0)

  return { constellations: visibleConstellations, background, moon: getMoonPosition(hour, moon) }
}
