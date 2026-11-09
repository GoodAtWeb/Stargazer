import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import FloatingConstellation from '../components/FloatingConstellation'
import StarField from '../components/StarField'
import { getConstellationById } from '../utils/constellations'
import { getConstellationIcon } from '../utils/horoscopes'
import './Home.css'

const SLOW_OUT = [0.16, 1, 0.3, 1]

const MENUS = [
  { to: '/', label: '홈', active: true },
  { to: '/constellations', label: '별자리' },
  { to: '/forecast', label: '별 예보' },
  { to: '/photo', label: '사진 분석' },
]

// x, y: 시안 기준 중심 좌표(%) / mobile: 세로 화면용 좌표(%), 로고 위아래로 엇갈리게
// spread: 아이콘 안 별들의 가로·세로 반경 (버튼 크기 대비)
const LAYOUT = [
  { id: 'aquarius', x: 10.8, y: 27.6, mobile: [2, 2], spread: [0.22, 0.34] },
  { id: 'aries', x: 29.3, y: 24.9, mobile: [62, 0], spread: [0.31, 0.17] },
  { id: 'cancer', x: 47.3, y: 17.5, mobile: [98, 12], spread: [0.19, 0.29] },
  { id: 'capricorn', x: 69, y: 26.7, mobile: [6, 28], spread: [0.34, 0.28] },
  { id: 'gemini', x: 87.5, y: 24.9, mobile: [68, 27], spread: [0.24, 0.33] },
  { id: 'taurus', x: 21.5, y: 59, mobile: [30, 14], spread: [0.33, 0.26] },
  { id: 'sagittarius', x: 76.5, y: 55.3, mobile: [36, 72], spread: [0.34, 0.29] },
  { id: 'leo', x: 10, y: 83, mobile: [100, 74], spread: [0.34, 0.29] },
  { id: 'libra', x: 33.5, y: 84.8, mobile: [0, 86], spread: [0.33, 0.26] },
  { id: 'pisces', x: 51, y: 74.7, mobile: [30, 100], spread: [0.36, 0.33] },
  { id: 'virgo', x: 68, y: 80.2, mobile: [66, 88], spread: [0.31, 0.34] },
  { id: 'scorpio', x: 86.5, y: 77.4, mobile: [96, 100], spread: [0.33, 0.34] },
]

const APPEAR_ORDER = [3, 8, 0, 6, 10, 2, 7, 4, 9, 1, 11, 5]
const APPEAR_START = 1.2
const APPEAR_GAP = 0.1

const artFiles = import.meta.glob('../assets/art/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
})

// 버튼 크기 대비 %, 기본은 아이콘과 같은 크기
const DEFAULT_ART_PLACEMENT = { x: 0, y: 0, size: 100 }
const ART_PLACEMENTS = {
  scorpio: { x: 2, y: 4, size: 98 },
}

const getArt = (id) => {
  const src = artFiles[`../assets/art/${id}.svg`]
  return src ? { src, ...(ART_PLACEMENTS[id] ?? DEFAULT_ART_PLACEMENT) } : null
}

const CONSTELLATIONS = LAYOUT.map((item, index) => ({
  ...item,
  name: getConstellationById(item.id)?.nameKo ?? item.id,
  icon: getConstellationIcon(item.id),
  activeIcon: getConstellationIcon(item.id, true),
  art: getArt(item.id),
  introDelay: APPEAR_START + APPEAR_ORDER.indexOf(index) * APPEAR_GAP,
  float: {
    amplitude: 6 + ((index * 7) % 5),
    duration: 4 + ((index * 13) % 21) / 10,
    phase: ((index * 37) % 20) / 10,
  },
}))

const NO_OFFSET = { x: 0, y: 0 }
const HOVER_SCALE = 1.4
// 커진 별자리 높이 상한 (화면 높이 대비)
const HOVER_MAX_HEIGHT = 0.42
// 커질 때 제자리에서 움직일 수 있는 최대 거리 (별자리 크기 대비)
const HOVER_MAX_SHIFT = 0.3
// 별 빛 번짐 여유 / 커졌을 때 그림까지 포함한 반경 (버튼 크기 대비)
const GLOW = 0.05
const ART_RADIUS = 0.46
// 로고·메뉴 여백 (둥둥 떠오르는 높이 포함)
const BLOCK_PADDING = 22
// 화면 끝 여백 (화면 대비, 최소 px)
const SAFE_X = 0.05
const SAFE_Y = 0.06
const SAFE_MIN = 24

const getRange = (values) => [Math.min(...values), Math.max(...values)]
const X_RANGE = getRange(LAYOUT.map((c) => c.x))
const Y_RANGE = getRange(LAYOUT.map((c) => c.y))
const MOBILE_RANGE = [0, 100]

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

const getSafeArea = (width, height) => {
  const padX = Math.max(SAFE_MIN, width * SAFE_X)
  const padY = Math.max(SAFE_MIN, height * SAFE_Y)
  return { left: padX, right: width - padX, top: padY, bottom: height - padY }
}

// 별들이 차지하는 가로·세로 반경(px)
const getHalf = (constellation, size, scale = 1) => ({
  x: (constellation.spread[0] + GLOW) * size * scale,
  y: (constellation.spread[1] + GLOW) * size * scale,
})

const clampToSafe = (point, half, safe) => ({
  x: clamp(point.x, safe.left + half.x, safe.right - half.x),
  y: clamp(point.y, safe.top + half.y, safe.bottom - half.y),
})

// 로고·메뉴 영역에 겹치면 가장 가까운 바깥쪽으로 옮김 (여백 밖으로 나가는 방향은 제외)
const moveOutOfBlock = (point, half, edgeHalf, block, safe) => {
  const left = block.left - half.x
  const right = block.right + half.x
  const top = block.top - half.y
  const bottom = block.bottom + half.y
  if (point.x <= left || point.x >= right || point.y <= top || point.y >= bottom) return point

  const candidates = [
    { x: left, y: point.y },
    { x: right, y: point.y },
    { x: point.x, y: top },
    { x: point.x, y: bottom },
  ].filter(
    (c) =>
      c.x >= safe.left + edgeHalf.x &&
      c.x <= safe.right - edgeHalf.x &&
      c.y >= safe.top + edgeHalf.y &&
      c.y <= safe.bottom - edgeHalf.y,
  )
  if (candidates.length === 0) return null
  return candidates.reduce((best, c) =>
    Math.hypot(c.x - point.x, c.y - point.y) < Math.hypot(best.x - point.x, best.y - point.y)
      ? c
      : best,
  )
}

// 겹치는 별자리끼리 몇 번에 걸쳐 서로 밀어냄 (fixed는 움직이지 않음)
const separate = (points, fixed, gapFor, safe, block, size) => {
  for (let round = 0; round < 12; round += 1) {
    for (let i = 0; i < points.length; i += 1) {
      for (let j = i + 1; j < points.length; j += 1) {
        const a = points[i]
        const b = points[j]
        const dx = b.x - a.x
        const dy = b.y - a.y
        const distance = Math.hypot(dx, dy) || 1
        const overlap = gapFor(i, j) - distance
        if (overlap <= 0) continue

        const ux = (dx / distance) * overlap
        const uy = (dy / distance) * overlap
        const aShare = a === fixed ? 0 : b === fixed ? 1 : 0.5
        a.x -= ux * aShare
        a.y -= uy * aShare
        b.x += ux * (1 - aShare)
        b.y += uy * (1 - aShare)
      }
    }
    points.forEach((p, i) => {
      if (p === fixed) return
      const half = getHalf(CONSTELLATIONS[i], size)
      Object.assign(p, clampToSafe(p, half, safe))
      const placed = moveOutOfBlock(p, half, half, block, safe)
      if (placed) Object.assign(p, placed)
    })
  }
}

const getRadius = (constellation, size, scale = 1) =>
  (Math.max(...constellation.spread) + GLOW) * size * scale

// 평소 위치: 시안 좌표를 여백 안쪽에 맞추고 로고·메뉴를 피함
const getRestPositions = (width, height, size, block, portrait) => {
  const safe = getSafeArea(width, height)
  const toRange = (value, [min, max], start, end, half) =>
    start + half + ((value - min) / (max - min)) * (end - start - half * 2)

  const points = CONSTELLATIONS.map((c) => {
    const half = getHalf(c, size)
    const [x, y] = portrait ? c.mobile : [c.x, c.y]
    return {
      id: c.id,
      x: toRange(x, portrait ? MOBILE_RANGE : X_RANGE, safe.left, safe.right, half.x),
      y: toRange(y, portrait ? MOBILE_RANGE : Y_RANGE, safe.top, safe.bottom, half.y),
    }
  })
  const origin = points.map((p) => ({ ...p }))
  const gapFor = (i, j) =>
    Math.min(size * 0.85, Math.hypot(origin[i].x - origin[j].x, origin[i].y - origin[j].y))
  separate(points, null, gapFor, safe, block, size)
  return points
}

// 커진 별자리는 제자리 근처에서만 움직이고, 공간이 부족하면 배율을 줄임
const getHoverLayout = (hoveredId, rest, width, height, size, block) => {
  const offsets = {}
  const index = rest.findIndex((p) => p.id === hoveredId)
  if (index < 0) return { offsets, hoverScale: 1 }

  const safe = getSafeArea(width, height)
  const target = CONSTELLATIONS[index]
  const points = rest.map((p) => ({ ...p }))
  const hovered = points[index]
  const maxScale = Math.min(HOVER_SCALE, (height * HOVER_MAX_HEIGHT) / (size * 2 * ART_RADIUS))
  let hoverScale = 1

  // 별은 여백 안, 그림은 화면 안에 들어오게
  const screen = { left: 0, right: width, top: 0, bottom: height }
  for (let scale = maxScale; scale > 1; scale -= 0.05) {
    const half = getHalf(target, size, scale)
    const artHalf = { x: size * ART_RADIUS * scale, y: size * ART_RADIUS * scale }
    const start = clampToSafe(clampToSafe(rest[index], artHalf, screen), half, safe)
    const placed = moveOutOfBlock(start, half, half, block, safe)
    const shift = placed && Math.hypot(placed.x - rest[index].x, placed.y - rest[index].y)
    if (placed && shift <= size * HOVER_MAX_SHIFT) {
      Object.assign(hovered, placed)
      hoverScale = scale
      break
    }
  }

  const gapFor = (i, j) => {
    if (i === index || j === index) {
      const other = CONSTELLATIONS[i === index ? j : i]
      return getRadius(target, size, hoverScale) + getRadius(other, size)
    }
    return Math.min(size * 0.85, Math.hypot(rest[i].x - rest[j].x, rest[i].y - rest[j].y))
  }
  separate(points, hovered, gapFor, safe, block, size)

  points.forEach((p, i) => {
    const dx = p.x - rest[i].x
    const dy = p.y - rest[i].y
    if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) offsets[p.id] = { x: dx, y: dy }
  })
  return { offsets, hoverScale }
}

function Home() {
  const navigate = useNavigate()
  const homeRef = useRef(null)
  const centerRef = useRef(null)
  const [area, setArea] = useState({ width: 0, height: 0, block: null })
  const [hoveredId, setHoveredId] = useState(null)

  useEffect(() => {
    const home = homeRef.current
    const center = centerRef.current
    if (!home || !center) return
    const measure = () => {
      const homeRect = home.getBoundingClientRect()
      const rect = center.getBoundingClientRect()
      setArea({
        width: homeRect.width,
        height: homeRect.height,
        block: {
          left: rect.left - homeRect.left - BLOCK_PADDING,
          right: rect.right - homeRect.left + BLOCK_PADDING,
          top: rect.top - homeRect.top - BLOCK_PADDING,
          bottom: rect.bottom - homeRect.top + BLOCK_PADDING,
        },
      })
    }
    const observer = new ResizeObserver(measure)
    observer.observe(home)
    observer.observe(center)
    return () => observer.disconnect()
  }, [])

  // 세로로 긴 화면은 별도 좌표로 로고 위아래에 배치
  const portrait = area.width < area.height
  const size = portrait
    ? Math.min(area.width * 0.3, area.height * 0.16)
    : Math.min(area.width * 0.18, area.height * 0.32)
  const rest = useMemo(
    () =>
      area.block ? getRestPositions(area.width, area.height, size, area.block, portrait) : null,
    [area.width, area.height, size, area.block, portrait],
  )
  const { offsets, hoverScale } = useMemo(
    () =>
      rest
        ? getHoverLayout(hoveredId, rest, area.width, area.height, size, area.block)
        : { offsets: {}, hoverScale: 1 },
    [hoveredId, rest, area.width, area.height, size, area.block],
  )

  return (
    <div className="home" ref={homeRef}>
      <StarField className="home__stars" />

      {rest &&
        CONSTELLATIONS.map((c, index) => (
          <FloatingConstellation
            key={c.id}
            name={c.name}
            icon={c.icon}
            activeIcon={c.activeIcon}
            art={c.art}
            x={rest[index].x}
            y={rest[index].y}
            size={size}
            offset={offsets[c.id] ?? NO_OFFSET}
            hovered={hoveredId === c.id}
            hoverScale={hoverScale}
            introDelay={c.introDelay}
            float={c.float}
            onHoverChange={(isHovered) =>
              setHoveredId((current) => (isHovered ? c.id : current === c.id ? null : current))
            }
            onSelect={() => navigate(`/constellations/${c.id}`)}
          />
        ))}

      <div className="home__center" ref={centerRef}>
        <motion.h1
          className="home__logo"
          initial={{ opacity: 0, y: 20, filter: 'blur(12px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{
            duration: 1.6,
            ease: SLOW_OUT,
            filter: { duration: 1.5, ease: 'easeOut' },
          }}
        >
          stargazer
        </motion.h1>

        <motion.nav
          className="home__menu"
          aria-label="주 메뉴"
          initial={{ opacity: 0, y: 10, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{
            duration: 1.2,
            delay: 0.7,
            ease: SLOW_OUT,
            filter: { duration: 1.1, delay: 0.7, ease: 'easeOut' },
          }}
        >
          {MENUS.map(({ to, label, active }) => (
            <Link
              key={to}
              to={to}
              className={`home__menu-link${active ? ' home__menu-link--active' : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              {label}
            </Link>
          ))}
        </motion.nav>
      </div>
    </div>
  )
}

export default Home
