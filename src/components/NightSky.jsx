import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, animate, motion, useMotionValue, useMotionValueEvent, useTransform } from 'framer-motion'
import { getDirectionName } from '../utils/sky'
import './NightSky.css'

const WIDTH = 1200
const HEIGHT = 500
const HORIZON = 450 // 지평선의 y 위치
const PPD = 5.5 // 1도당 픽셀
const RAD = Math.PI / 180
const COPIES = [-1, 0, 1] // 360도를 이어 붙여 좌우로 끝없이 돌릴 수 있게 세 번 그림
const VIEWS = [
  { label: '북', az: 0 },
  { label: '동', az: 90 },
  { label: '남', az: 180 },
  { label: '서', az: 270 },
]

const toX = (az) => az * PPD
const toY = (alt) => HORIZON - alt * PPD

// 각도를 0~360도 사이로 맞춤
const wrap360 = (angle) => ((angle % 360) + 360) % 360

// 각도 차이를 -180~180도 사이로 맞춤
const wrapAngle = (angle) => ((angle + 540) % 360) - 180

const starRadius = (mag, min, max, base, slope) => Math.min(max, Math.max(min, base - slope * mag))

// 360도를 한 바퀴 돌아도 끊기지 않는 산 능선
const RIDGE = (() => {
  const points = []
  for (let az = -360; az <= 720; az += 3) {
    const height =
      14 + 8 * Math.sin(az * 3 * RAD + 1) + 5 * Math.sin(az * 7 * RAD + 2) + 3 * Math.sin(az * 13 * RAD + 0.5)
    points.push(`${toX(az).toFixed(1)} ${(HORIZON - height).toFixed(1)}`)
  }
  return `M${toX(-360)} ${HEIGHT} L${points.join(' L')} L${toX(720)} ${HEIGHT} Z`
})()

// 달의 밝은 부분 모양 (밝기 비율 0~1)
const moonLitPath = (radius, fraction) => {
  const k = 1 - 2 * fraction
  const rx = Math.abs(k) * radius
  return `M0 ${-radius} A${radius} ${radius} 0 0 1 0 ${radius} A${rx} ${radius} 0 0 ${k > 0 ? 0 : 1} 0 ${-radius}Z`
}

// 한 바퀴(360도) 분량의 별, 별자리, 달을 그림
const SkyLayer = memo(function SkyLayer({ sky, copy, activeId, onActive }) {
  const { constellations, background, moon, limitMagnitude, moonInfo } = sky

  return (
    <g aria-hidden={copy !== 0}>
      {background
        .filter((star) => star.mag <= limitMagnitude)
        .map((star, i) => (
          <circle
            key={i}
            cx={toX(star.az)}
            cy={toY(star.alt)}
            r={starRadius(star.mag, 0.5, 1.7, 2.3, 0.28)}
            fill="#fff"
            opacity={Math.min(1, 1.3 - star.mag * 0.16)}
          />
        ))}

      {constellations.map((c) => {
        const shown = c.stars.filter((s) => s.alt > 0)
        if (shown.length === 0) return null
        // 별자리 중심을 기준으로 방위를 풀고, 높이 뜰수록 가로 폭을 줄여 모양이 늘어나지 않게 함
        const spread = Math.cos(c.alt * RAD)
        const point = (s) => ({ x: toX(c.az) + wrapAngle(s.az - c.az) * spread * PPD, y: toY(s.alt) })
        const byId = Object.fromEntries(shown.map((s) => [s.id, point(s)]))
        const xs = shown.map((s) => byId[s.id].x)
        const ys = shown.map((s) => byId[s.id].y)
        const minX = Math.min(...xs)
        const minY = Math.min(...ys)
        const labelY = Math.max(24, minY - 14)

        return (
          <g
            key={c.id}
            className={
              activeId === c.id
                ? 'night-sky__constellation night-sky__constellation--active'
                : 'night-sky__constellation'
            }
            onPointerEnter={() => onActive(c.id)}
            onPointerLeave={() => onActive(null)}
            onFocus={() => onActive(c.id)}
            onBlur={() => onActive(null)}
            tabIndex={copy === 0 ? 0 : -1}
            aria-label={c.nameKo}
          >
            <rect
              className="night-sky__hit"
              x={minX - 14}
              y={minY - 18}
              width={Math.max(...xs) - minX + 28}
              height={Math.max(...ys) - minY + 36}
            />
            <g className="night-sky__figure">
              {c.lines.map(([a, b]) =>
                byId[a] && byId[b] ? (
                  <line key={`${a}-${b}`} x1={byId[a].x} y1={byId[a].y} x2={byId[b].x} y2={byId[b].y} />
                ) : null,
              )}
              <text x={(minX + Math.max(...xs)) / 2} y={labelY} textAnchor="middle">
                {c.nameKo}
              </text>
            </g>
            {shown.map((s) => (
              <circle
                key={s.id}
                cx={byId[s.id].x}
                cy={byId[s.id].y}
                r={starRadius(s.magnitude ?? 4, 1.2, 3.8, 4.4, 0.9)}
              />
            ))}
          </g>
        )
      })}

      {moon && moon.alt > 0 && (
        <g transform={`translate(${toX(moon.az)} ${toY(moon.alt)})`}>
          <circle r="46" fill="url(#night-sky-moon-glow)" opacity={0.25 + moonInfo.percent / 140} />
          <circle r="13" fill="#2b3358" />
          <path
            d={moonLitPath(13, moonInfo.percent / 100)}
            fill="#f4f1de"
            transform={moonInfo.waxing ? undefined : 'scale(-1 1)'}
          />
        </g>
      )}
    </g>
  )
})

// 지평선 위 방향 표시
const COMPASS = [
  { label: '북', az: 0 },
  { label: '동', az: 90 },
  { label: '남', az: 180 },
  { label: '서', az: 270 },
]

// 지금 바라보는 방향과 각도 (예: 남동 · 135°)
function HeadingText({ center }) {
  const text = useTransform(center, (c) => {
    const az = wrap360(c)
    return `${getDirectionName(az).replace('쪽', '')} · ${Math.round(az)}°`
  })
  return <motion.span className="night-sky__heading">{text}</motion.span>
}

// 북·동·남·서로 바로 돌려주는 버튼
function ViewButtons({ activeView, onTurn }) {
  return (
    <div className="night-sky__views" role="group" aria-label="바라보는 방향">
      {VIEWS.map(({ label, az }) => (
        <button
          key={az}
          type="button"
          className={activeView === az ? 'night-sky__view night-sky__view--active' : 'night-sky__view'}
          onClick={() => onTurn(az)}
          aria-pressed={activeView === az}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

// 모든 별자리의 선과 이름을 한 번에 보여주는 스위치
function LabelToggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={checked ? 'night-sky__toggle night-sky__toggle--on' : 'night-sky__toggle'}
      onClick={() => onChange(!checked)}
    >
      <span className="night-sky__switch" />
      별자리 모두 보기
    </button>
  )
}

// 마우스로 잡고 끌어서 하늘을 돌리는 동작 (놓으면 관성으로 조금 더 미끄러짐)
function useSkyDrag(controls, enabled) {
  const ref = useRef(null)
  const drag = useRef(null)
  const dragged = useRef(false)

  const onPointerDown = (e) => {
    if (!enabled || e.button !== 0) return
    controls.stop()
    controls.normalize()
    dragged.current = false
    drag.current = {
      x: e.clientX,
      start: controls.center.get(),
      moved: false,
      scale: 1,
      samples: [{ x: e.clientX, t: e.timeStamp }],
    }
  }

  const onPointerMove = (e) => {
    const state = drag.current
    if (!state) return
    const dx = e.clientX - state.x
    if (!state.moved) {
      if (Math.abs(dx) < 5) return // 클릭과 구분하기 위해 조금 움직여야 드래그로 봄
      state.moved = true
      dragged.current = true
      ref.current.setPointerCapture(e.pointerId)
    }
    const rect = ref.current.getBoundingClientRect()
    state.scale = Math.max(rect.width / WIDTH, rect.height / HEIGHT)
    controls.center.set(wrap360(state.start - dx / (state.scale * PPD)))
    state.samples.push({ x: e.clientX, t: e.timeStamp })
    while (state.samples.length > 2 && e.timeStamp - state.samples[0].t > 100) state.samples.shift()
  }

  const onPointerUp = (e) => {
    const state = drag.current
    drag.current = null
    if (!state?.moved) return
    ref.current.releasePointerCapture?.(e.pointerId)
    const first = state.samples[0]
    const last = state.samples[state.samples.length - 1]
    const seconds = (last.t - first.t) / 1000
    if (seconds > 0) controls.inertia(-(last.x - first.x) / seconds / (state.scale * PPD))
  }

  // 드래그를 끝낸 직후의 클릭은 별자리 이동으로 처리하지 않음
  const onClickCapture = (e) => {
    if (dragged.current) {
      e.stopPropagation()
      dragged.current = false
    }
  }

  return { ref, handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp, onClickCapture } }
}

// 하늘 그림 한 장 (일반 화면과 전체 화면에서 같이 씀)
function SkyScene({ sky, skyKey, controls, expanded, showAll, activeId, onActive, onToggleExpand }) {
  const x = useTransform(controls.center, (c) => WIDTH / 2 - c * PPD)
  const { ref, handlers } = useSkyDrag(controls, expanded)

  const isDaytime = sky.darkness < 0.3
  const starOpacity = Math.pow(sky.darkness, 1.4)
  const glow = Math.min(1, Math.max(0, (6.6 - sky.limitMagnitude) / 3.2))
  const className = ['night-sky__panel', expanded && 'night-sky__panel--full', showAll && 'night-sky__panel--all']
    .filter(Boolean)
    .join(' ')

  return (
    <div ref={ref} className={className} onDoubleClick={onToggleExpand} {...handlers}>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio={expanded ? 'xMidYMid slice' : 'xMidYMax slice'}
        role="img"
        aria-label="선택한 시간의 밤하늘"
      >
        <defs>
          <linearGradient id="night-sky-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#070b20" />
            <stop offset="0.6" stopColor="#121c4a" />
            <stop offset="1" stopColor="#2b3b78" />
          </linearGradient>
          <linearGradient id="night-sky-glow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffa26b" stopOpacity="0" />
            <stop offset="1" stopColor="#ffa26b" stopOpacity="0.4" />
          </linearGradient>
          <radialGradient id="night-sky-moon-glow">
            <stop offset="0" stopColor="#fff6d8" stopOpacity="0.9" />
            <stop offset="1" stopColor="#fff6d8" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width={WIDTH} height={HEIGHT} fill="url(#night-sky-bg)" />
        <rect y={HORIZON - 150} width={WIDTH} height="150" fill="url(#night-sky-glow)" opacity={glow} />

        <motion.g style={{ x }}>
          <motion.g
            key={skyKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: starOpacity }}
            transition={{ duration: 0.6 }}
          >
            {COPIES.map((k) => (
              <g key={k} transform={`translate(${k * 360 * PPD} 0)`}>
                <SkyLayer sky={sky} copy={k} activeId={activeId} onActive={onActive} />
              </g>
            ))}
          </motion.g>
          <path d={RIDGE} fill="#04060f" />
          {COPIES.flatMap((k) =>
            COMPASS.map(({ label, az }) => (
              <text
                key={`${k}-${az}`}
                className="night-sky__compass"
                x={toX(az + k * 360)}
                y={HORIZON + 34}
                textAnchor="middle"
              >
                {label}
              </text>
            )),
          )}
        </motion.g>
      </svg>

      <div className="night-sky__clouds" style={{ opacity: (sky.cloud / 100) * 0.7 }} />
      <div className="night-sky__dusk" style={{ opacity: 1 - sky.darkness }} />
      {isDaytime && <p className="night-sky__notice">해가 떠 있는 시간이에요. 18시 이후를 골라 보세요.</p>}
    </div>
  )
}

// 선택한 지역, 날짜, 시간의 밤하늘을 보여주는 섹션. 더블클릭하면 전체 화면에서 마우스로 돌려볼 수 있음
function NightSky({ sky, skyKey, activeId, onActive, focus }) {
  const [expanded, setExpanded] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const [activeView, setActiveView] = useState(180)
  const center = useMotionValue(180)
  const frame = useRef(null)
  const animation = useRef(null)
  const section = useRef(null)

  // 하늘을 돌리는 동작 모음 (버튼 이동, 드래그 후 관성, 멈추기)
  const controls = useMemo(() => {
    const stop = () => {
      cancelAnimationFrame(frame.current)
      animation.current?.stop()
      animation.current = null
    }
    // 360도마다 같은 그림이 반복되므로 값을 0~360도로 되돌려도 눈에 띄지 않음
    const normalize = () => center.jump(wrap360(center.get()))
    const turnTo = (az) => {
      stop()
      normalize()
      const now = center.get()
      const target = [az - 360, az, az + 360].reduce((best, t) => (Math.abs(t - now) < Math.abs(best - now) ? t : best))
      animation.current = animate(center, target, { type: 'spring', stiffness: 70, damping: 18 })
    }
    const inertia = (velocity) => {
      stop()
      let speed = velocity
      let last = performance.now()
      const tick = (now) => {
        const seconds = (now - last) / 1000
        last = now
        speed *= Math.exp(-3 * seconds)
        center.set(wrap360(center.get() + speed * seconds))
        if (Math.abs(speed) > 1.5) frame.current = requestAnimationFrame(tick)
      }
      frame.current = requestAnimationFrame(tick)
    }
    return { center, stop, normalize, turnTo, inertia }
  }, [center])

  // 바라보는 방향이 동서남북 중 하나에 가까우면 그 버튼을 강조
  useMotionValueEvent(center, 'change', (c) => {
    const az = wrap360(c)
    const near = VIEWS.find((v) => Math.abs(wrapAngle(az - v.az)) < 20)
    setActiveView(near ? near.az : null)
  })

  const toggleExpand = () => {
    setExpanded((value) => !value)
  }

  // 목록에서 '하늘에서 찾기'를 누르면 그 별자리 쪽으로 돌리고 지도가 보이게 스크롤
  useEffect(() => {
    if (!focus) return
    const target = sky.constellations.find((c) => c.id === focus.id)
    if (target) controls.turnTo(target.az)
    section.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [focus]) // eslint-disable-line react-hooks/exhaustive-deps

  // 전체 화면에서는 Esc로 나가고 페이지 스크롤은 잠금
  useEffect(() => {
    if (!expanded) return undefined
    const onKeyDown = (e) => e.key === 'Escape' && setExpanded(false)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [expanded])

  useEffect(
    () => () => {
      controls.stop()
    },
    [controls],
  )

  const scene = (isFull) => (
    <SkyScene
      sky={sky}
      skyKey={skyKey}
      controls={controls}
      expanded={isFull}
      showAll={showAll}
      activeId={activeId}
      onActive={onActive}
      onToggleExpand={toggleExpand}
    />
  )

  return (
    <section ref={section} className="forecast-card night-sky">
      <header className="night-sky__head">
        <div>
          <h2>밤하늘 미리보기</h2>
          <p>별자리에 마우스를 올려 보세요. 더블클릭하면 크게 보면서 직접 돌려볼 수 있어요</p>
        </div>
        <div className="night-sky__controls">
          <HeadingText center={center} />
          <LabelToggle checked={showAll} onChange={setShowAll} />
          <ViewButtons activeView={activeView} onTurn={controls.turnTo} />
        </div>
      </header>

      {scene(false)}

      {createPortal(
        <AnimatePresence>
          {expanded && (
            <motion.div
              className="night-sky-full"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 200, damping: 28 }}
            >
              {scene(true)}
              <button
                type="button"
                className="night-sky-full__back"
                onClick={() => setExpanded(false)}
                aria-label="돌아가기"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M15 5l-7 7 7 7" />
                </svg>
              </button>
              <p className="night-sky-full__hint">마우스로 끌어서 돌려 보세요 · 더블클릭하거나 Esc를 누르면 나가요</p>
              <div className="night-sky-full__bar">
                <HeadingText center={center} />
                <ViewButtons activeView={activeView} onTurn={controls.turnTo} />
                <LabelToggle checked={showAll} onChange={setShowAll} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </section>
  )
}

export default NightSky
