import constellations from '../data/constellations.json'
import { getConstellationName } from '../i18n/data'

export const MAX_FILE_SIZE = 20 * 1024 * 1024
export const ANALYSIS_DURATION = 5200
export const SCAN_DURATION = 2400 // 빛줄기가 사진을 한 번 훑는 시간(ms)

// 분석 단계와 각 단계가 끝나는 진행률(%)
export const ANALYSIS_STEPS = [
  { label: 'photo.step.load', until: 15 },
  { label: 'photo.step.stars', until: 50 },
  { label: 'photo.step.match', until: 85 },
  { label: 'photo.step.result', until: 100 },
]

// 이미지 주소를 불러와 HTMLImageElement로 반환
export const loadImage = (url) =>
  new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })

// 별 찾기 기준값 (0~255 밝기 기준)
const DETECT_WIDTH = 1200 // 이 너비로 줄여서 분석 (작은 별이 뭉개지지 않을 만큼)
const NOISE_K = 5 // 주변보다 노이즈의 몇 배 이상 밝아야 별 후보
const MIN_CONTRAST = 60 // 주변보다 최소 이만큼은 밝아야 별 후보 (높일수록 눈에 띄는 별만 남음)
const MAX_LOCAL_BG = 45 // 바로 주변이 이보다 밝으면 (불빛, 건물) 제외
const MAX_WIDE_BG = 30 // 넓은 영역 평균이 이보다 밝으면 하늘이 아닌 곳으로 봄
const RING = 4 // 점 모양 검사에 쓰는 고리 반지름(px)

// 사진에서 별을 찾아 위치(%), 상대 밝기(0~1), 전체 개수를 반환
// 1) 주변 배경보다 확 밝은 점만 후보로 삼고  2) 둘레가 모두 어두운 '점'만 남기고
// 3) 건물·땅처럼 넓게 밝은 곳(지평선 아래)은 제외
export const detectStars = (img, maxPoints = 150) => {
  const width = Math.min(DETECT_WIDTH, img.naturalWidth)
  const height = Math.max(1, Math.round((img.naturalHeight / img.naturalWidth) * width))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, 0, 0, width, height)
  const { data } = ctx.getImageData(0, 0, width, height)
  const size = width * height

  const lum = new Float32Array(size)
  for (let i = 0; i < size; i++) {
    lum[i] = data[i * 4] * 0.299 + data[i * 4 + 1] * 0.587 + data[i * 4 + 2] * 0.114
  }

  // 누적합 표를 만들어 두면 어떤 사각형의 평균 밝기든 바로 구할 수 있음
  const W1 = width + 1
  const integral = new Float64Array(W1 * (height + 1))
  for (let y = 0; y < height; y++) {
    let row = 0
    for (let x = 0; x < width; x++) {
      row += lum[y * width + x]
      integral[(y + 1) * W1 + x + 1] = integral[y * W1 + x + 1] + row
    }
  }
  const boxMean = (x, y, r) => {
    const x0 = Math.max(0, x - r)
    const y0 = Math.max(0, y - r)
    const x1 = Math.min(width, x + r + 1)
    const y1 = Math.min(height, y + r + 1)
    const total =
      integral[y1 * W1 + x1] - integral[y0 * W1 + x1] - integral[y1 * W1 + x0] + integral[y0 * W1 + x0]
    return total / ((x1 - x0) * (y1 - y0))
  }

  const localR = Math.max(6, Math.round(width / 80))
  const wideR = Math.round(width / 20)

  // 각 픽셀이 주변 배경보다 얼마나 밝은지(res)
  const bg = new Float32Array(size)
  const res = new Float32Array(size)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x
      bg[i] = boxMean(x, y, localR)
      res[i] = lum[i] - bg[i]
    }
  }

  // 어두운 하늘의 노이즈 크기를 재서 사진마다 기준을 맞춤
  let noiseSum = 0
  let noiseCount = 0
  for (let i = 0; i < size; i += 7) {
    if (bg[i] < MAX_LOCAL_BG) {
      noiseSum += Math.abs(res[i])
      noiseCount++
    }
  }
  const sigma = Math.max(1, (noiseSum / Math.max(1, noiseCount)) * 1.25)
  const threshold = Math.max(NOISE_K * sigma, MIN_CONTRAST)

  // 세로줄마다 위에서부터 내려가다 넓게 밝은 곳이 나오면 그 아래는 땅으로 봄
  const rawHorizon = new Int32Array(width).fill(height)
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y += 2) {
      if (boxMean(x, y, wideR) > MAX_WIDE_BG) {
        rawHorizon[x] = y
        break
      }
    }
  }
  const horizon = new Int32Array(width)
  for (let x = 0; x < width; x++) {
    let min = height
    for (let k = Math.max(0, x - wideR); k < Math.min(width, x + wideR + 1); k++) {
      min = Math.min(min, rawHorizon[k])
    }
    horizon[x] = min
  }

  const ring = Array.from({ length: 16 }, (_, a) => {
    const t = (a * Math.PI) / 8
    return Math.round(RING * Math.sin(t)) * width + Math.round(RING * Math.cos(t))
  })

  const candidates = []
  for (let y = RING; y < height - RING; y++) {
    for (let x = RING; x < width - RING; x++) {
      const i = y * width + x
      const r = res[i]
      if (r < threshold || bg[i] > MAX_LOCAL_BG) continue
      if (y > horizon[x] - wideR / 2 || boxMean(x, y, wideR) > MAX_WIDE_BG) continue

      // 주변 5x5에서 가장 밝은 픽셀이어야 함
      let isPeak = true
      for (let dy = -2; dy <= 2 && isPeak; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          if (res[i + dy * width + dx] > r) {
            isPeak = false
            break
          }
        }
      }
      if (!isPeak) continue

      // 별은 둘레가 모두 어둡고, 모서리·선은 한쪽이 밝음
      let ringSum = 0
      let ringMax = -Infinity
      for (const offset of ring) {
        ringSum += res[i + offset]
        ringMax = Math.max(ringMax, res[i + offset])
      }
      if (ringSum / ring.length > r * 0.35 || ringMax > r * 0.5) continue

      candidates.push({ x, y, r })
    }
  }

  // 밝은 순으로 보면서 이미 고른 별과 너무 가까운 후보는 제외
  candidates.sort((a, b) => b.r - a.r)
  const minDist2 = Math.max(4, width / 150) ** 2
  const picked = []
  for (const c of candidates) {
    if (picked.every((p) => (p.x - c.x) ** 2 + (p.y - c.y) ** 2 >= minDist2)) picked.push(c)
  }

  const brightest = picked[0]?.r ?? 1
  return {
    count: picked.length,
    points: picked.slice(0, maxPoints).map((p) => ({
      x: (p.x / width) * 100,
      y: (p.y / height) * 100,
      b: Math.sqrt(p.r / brightest),
    })),
  }
}

// 별자리 맞추기 기준값
const MATCH = {
  anchorStars: 4, // 별자리에서 기준으로 삼을 밝은 별 수
  anchorPoints: 20, // 사진에서 기준으로 삼을 밝은 별 수
  searchPoints: 60, // 맞춰볼 때 비교할 사진 속 별 수 (밝은 순)
  minSize: 12, // 별자리 크기 최소 (사진 가로 대비 %)
  maxSize: 60, // 별자리 크기 최대
  tolerance: 0.06, // 별자리 크기 대비 허용 오차 (이 안에 사진 속 별이 있으면 일치)
  minMatched: 4, // 최소 이만큼은 실제 별과 겹쳐야 찾은 것으로 인정
  minRatio: 0.6, // 별자리 별 중 이 비율 이상이 겹쳐야 인정
  maxOverlap: 0.15, // 다른 별자리 영역과 이 비율 이상 겹치면 제외
  fitsPerConstellation: 6, // 별자리마다 남겨 둘 후보 자리 수
  maxResults: 3,
}

// 별자리 좌표(0~100)를 회전·확대·이동해 사진 좌표로 옮기는 함수를 만듦
const makeTransform = (t1, p1, scale, angle) => {
  const cos = Math.cos(angle) * scale
  const sin = Math.sin(angle) * scale
  return (s) => ({
    X: p1.X + cos * (s.x - t1.x) - sin * (s.y - t1.y),
    Y: p1.Y + sin * (s.x - t1.x) + cos * (s.y - t1.y),
  })
}

// 별들을 감싸는 사각형 영역
const getBox = (stars) => ({
  x0: Math.min(...stars.map((s) => s.px)),
  x1: Math.max(...stars.map((s) => s.px)),
  y0: Math.min(...stars.map((s) => s.py)),
  y1: Math.max(...stars.map((s) => s.py)),
})

// 두 영역이 겹치는 넓이를 작은 쪽 넓이에 대한 비율(0~1)로 반환
const getOverlap = (a, b) => {
  const w = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0)
  const h = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0)
  if (w <= 0 || h <= 0) return 0
  const area = (box) => Math.max(1, (box.x1 - box.x0) * (box.y1 - box.y0))
  return (w * h) / Math.min(area(a), area(b))
}

// 별자리 하나를 사진 속 별들에 맞춰 보고, 잘 겹치는 위치·크기·각도 후보를 좋은 순으로 반환
// (가장 좋은 자리가 다른 별자리와 겹칠 수 있어서 후보를 여러 개 남겨 둠)
const fitConstellation = (constellation, pts, anchors) => {
  const { stars } = constellation
  const tmplAnchors = [...stars].sort((a, b) => a.magnitude - b.magnitude).slice(0, MATCH.anchorStars)
  const top = []
  const minToKeep = () =>
    top.length < MATCH.fitsPerConstellation ? MATCH.minMatched : top[top.length - 1].matched

  for (const t1 of tmplAnchors) {
    for (const t2 of tmplAnchors) {
      if (t1 === t2) continue
      const lt = Math.hypot(t2.x - t1.x, t2.y - t1.y)
      if (lt < 1) continue
      const at = Math.atan2(t2.y - t1.y, t2.x - t1.x)

      for (const p1 of anchors) {
        for (const p2 of anchors) {
          if (p1 === p2) continue
          const scale = Math.hypot(p2.X - p1.X, p2.Y - p1.Y) / lt
          const size = scale * 100
          if (size < MATCH.minSize || size > MATCH.maxSize) continue

          const angle = Math.atan2(p2.Y - p1.Y, p2.X - p1.X) - at
          const transform = makeTransform(t1, p1, scale, angle)
          const tol = Math.max(1, size * MATCH.tolerance)
          const used = new Set()
          const hits = []
          let matched = 0
          let err = 0

          for (let k = 0; k < stars.length; k++) {
            const { X, Y } = transform(stars[k])
            let nearest = -1
            let nearestD = tol
            for (let j = 0; j < pts.length; j++) {
              if (used.has(j)) continue
              const d = Math.hypot(pts[j].X - X, pts[j].Y - Y)
              if (d <= nearestD) {
                nearestD = d
                nearest = j
              }
            }
            hits.push(nearest)
            if (nearest >= 0) {
              used.add(nearest)
              matched++
              err += nearestD / tol
            }
            // 남은 별이 다 맞아도 남겨 둔 후보보다 나을 수 없으면 중단
            if (matched + (stars.length - k - 1) < minToKeep()) break
          }
          if (hits.length < stars.length || matched < MATCH.minMatched) continue

          // 같은 별 묶음을 다른 순서로 맞춘 경우는 하나만 남김
          const key = hits.filter((h) => h >= 0).sort((a, b) => a - b).join(',')
          const score = matched - err * 0.5
          const same = top.findIndex((f) => f.key === key)
          if (same >= 0) {
            if (top[same].score >= score) continue
            top.splice(same, 1)
          }
          top.push({ key, score, matched, err, transform, hits })
          top.sort((a, b) => b.score - a.score)
          if (top.length > MATCH.fitsPerConstellation) top.pop()
        }
      }
    }
  }
  return top
}

// 사진 속 별(위치 %)과 별자리 데이터를 맞춰 보고, 실제 별 위에 놓인 별자리를 결과로 만듦
export const createAnalysisResult = (points, starCount, aspect) => {
  // 가로·세로를 같은 단위로 맞춰야 별자리 모양이 찌그러지지 않음 (가로 100 기준)
  const pts = [...points]
    .sort((a, b) => b.b - a.b)
    .slice(0, MATCH.searchPoints)
    .map((p) => ({ X: p.x, Y: (p.y / 100) * (100 / aspect), b: p.b }))
  const anchors = pts.slice(0, MATCH.anchorPoints)

  const fits = constellations
    .flatMap((constellation) =>
      fitConstellation(constellation, pts, anchors).map((fit) => {
        const ratio = fit.matched / constellation.stars.length
        const quality = 1 - fit.err / fit.matched
        return { constellation, fit, ratio, confidence: Math.round(100 * ratio * (0.6 + 0.4 * quality)) }
      }),
    )
    .filter(({ ratio }) => ratio >= MATCH.minRatio)
    .sort((a, b) => b.confidence - a.confidence || b.fit.matched - a.fit.matched)

  // 신뢰도 높은 순으로 고르되, 이미 고른 별자리와 별을 함께 쓰거나 영역이 많이 겹치면 제외
  const usedPoints = new Set()
  const boxes = []
  const detected = []
  for (const { constellation, fit, confidence } of fits) {
    if (detected.length >= MATCH.maxResults) break
    if (detected.some((item) => item.id === constellation.id)) continue
    const own = fit.hits.filter((h) => h >= 0)
    if (own.some((h) => usedPoints.has(h))) continue

    // 찾은 별은 사진 속 실제 위치에, 못 찾은 별은 별자리 모양대로 계산한 위치에 둠
    const placed = Object.fromEntries(
      constellation.stars.map((s, k) => {
        const hit = fit.hits[k]
        const pos = hit >= 0 ? { X: pts[hit].X, Y: pts[hit].Y } : fit.transform(s)
        return [s.id, { ...s, px: pos.X, py: pos.Y, found: hit >= 0 }]
      }),
    )
    const box = getBox(Object.values(placed))
    if (boxes.some((other) => getOverlap(box, other) > MATCH.maxOverlap)) continue

    own.forEach((h) => usedPoints.add(h))
    boxes.push(box)
    detected.push({
      id: constellation.id,
      constellation,
      confidence,
      matched: own.length,
      placed,
      x: (box.x0 + box.x1) / 2,
    })
  }

  const foundStars = detected.flatMap((item) =>
    Object.values(item.placed)
      .filter((s) => s.found)
      .map((s) => ({ ...s, constellationId: item.constellation.id })),
  )
  const brightest = foundStars.length
    ? foundStars.reduce((a, b) => (b.magnitude < a.magnitude ? b : a))
    : null

  return {
    detected,
    starCount,
    brightest,
    firstConstellationId: detected[0]?.constellation.id ?? null,
  }
}

// 사진 위에 별자리 선과 이름을 그린 PNG를 내려받음
export const downloadResultImage = async (photoUrl, result, fileName = 'stargazer') => {
  const img = await loadImage(photoUrl)
  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0)

  // 별자리 좌표는 가로 100 기준 단위라 가로·세로 모두 같은 배율을 곱함
  const unit = canvas.width / 100

  result.detected.forEach((item, index) => {
    const stars = item.placed
    const color = index === 0 ? '#ffcf8b' : 'rgba(255, 255, 255, 0.8)'

    ctx.strokeStyle = color
    ctx.globalAlpha = 0.85
    ctx.lineWidth = Math.max(1.5, unit * 0.18)
    item.constellation.lines.forEach(([from, to]) => {
      ctx.beginPath()
      ctx.moveTo(stars[from].px * unit, stars[from].py * unit)
      ctx.lineTo(stars[to].px * unit, stars[to].py * unit)
      ctx.stroke()
    })

    // 사진에서 못 찾은 별(모양으로 추정한 위치)도 같은 점으로 그림
    ctx.globalAlpha = 1
    ctx.fillStyle = '#fff'
    Object.values(stars).forEach((s) => {
      ctx.beginPath()
      ctx.arc(s.px * unit, s.py * unit, Math.max(2, unit * 0.35), 0, Math.PI * 2)
      ctx.fill()
    })

    const top = Math.min(...Object.values(stars).map((s) => s.py))
    ctx.fillStyle = color
    ctx.font = `700 ${Math.max(14, unit * 1.6)}px Pretendard, 'Malgun Gothic', sans-serif`
    ctx.textAlign = 'center'
    ctx.fillText(getConstellationName(item.constellation.id), item.x * unit, top * unit - unit * 1.5)
  })

  const link = document.createElement('a')
  link.download = `${fileName.replace(/\.[^.]+$/, '')}_stargazer.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}
