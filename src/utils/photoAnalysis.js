import { getConstellationById } from './constellations'

export const MAX_FILE_SIZE = 20 * 1024 * 1024
export const ANALYSIS_DURATION = 5200

// 분석 단계와 각 단계가 끝나는 진행률(%)
export const ANALYSIS_STEPS = [
  { label: '사진 불러오기', until: 15 },
  { label: '별 찾기', until: 50 },
  { label: '별 자리 모양 맞추기', until: 85 },
  { label: '결과 정리하기', until: 100 },
]

// 실제 인식 대신 쓰는 mock 시나리오 (x, y: 사진 가로/세로 %, size: 사진 가로 대비 %)
const SCENARIOS = [
  [
    { id: 'orion', confidence: 96, x: 50, y: 52, size: 34 },
    { id: 'taurus', confidence: 84, x: 80, y: 30, size: 26 },
    { id: 'canis-major', confidence: 71, x: 20, y: 62, size: 24 },
  ],
  [
    { id: 'lyra', confidence: 93, x: 24, y: 34, size: 20 },
    { id: 'cygnus', confidence: 88, x: 55, y: 40, size: 32 },
    { id: 'aquila', confidence: 76, x: 82, y: 62, size: 24 },
  ],
  [
    { id: 'ursa-major', confidence: 95, x: 28, y: 42, size: 36 },
    { id: 'ursa-minor', confidence: 82, x: 58, y: 48, size: 22 },
    { id: 'cassiopeia', confidence: 74, x: 82, y: 34, size: 24 },
  ],
  [
    { id: 'scorpio', confidence: 94, x: 34, y: 54, size: 38 },
    { id: 'sagittarius', confidence: 81, x: 72, y: 50, size: 30 },
  ],
]

// 이미지 주소를 불러와 HTMLImageElement로 반환
export const loadImage = (url) =>
  new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })

// 사진을 작게 줄여 밝은 점(별 후보)을 찾고, 위치(%)와 개수를 반환
export const detectBrightSpots = (img, maxPoints = 60) => {
  const width = 320
  const height = Math.max(1, Math.round((img.naturalHeight / img.naturalWidth) * width))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(img, 0, 0, width, height)
  const { data } = ctx.getImageData(0, 0, width, height)

  const lum = new Float32Array(width * height)
  let sum = 0
  for (let i = 0; i < lum.length; i++) {
    const v = data[i * 4] * 0.299 + data[i * 4 + 1] * 0.587 + data[i * 4 + 2] * 0.114
    lum[i] = v
    sum += v
  }
  const mean = sum / lum.length
  let variance = 0
  for (const v of lum) variance += (v - mean) ** 2
  const std = Math.sqrt(variance / lum.length)
  const threshold = Math.min(245, Math.max(90, mean + std * 2.5))

  // 주변 5x5에서 가장 밝은 픽셀만 후보로 삼음
  const candidates = []
  for (let y = 2; y < height - 2; y++) {
    for (let x = 2; x < width - 2; x++) {
      const v = lum[y * width + x]
      if (v < threshold) continue
      let isPeak = true
      for (let dy = -2; dy <= 2 && isPeak; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          if (lum[(y + dy) * width + x + dx] > v) {
            isPeak = false
            break
          }
        }
      }
      if (isPeak) candidates.push({ x, y, v })
    }
  }

  // 밝은 순으로 보면서 이미 고른 점과 너무 가까운 후보는 제외
  candidates.sort((a, b) => b.v - a.v)
  const picked = []
  for (const c of candidates) {
    if (picked.every((p) => (p.x - c.x) ** 2 + (p.y - c.y) ** 2 > 16)) picked.push(c)
  }

  return {
    count: picked.length,
    points: picked.slice(0, maxPoints).map((p) => ({
      x: (p.x / width) * 100,
      y: (p.y / height) * 100,
    })),
  }
}

// 파일 이름과 크기로 시나리오를 골라, 같은 사진은 항상 같은 결과가 나오게 함
const pickScenario = (file) => {
  const key = `${file.name}:${file.size}`
  let hash = 0
  for (const ch of key) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
  return SCENARIOS[hash % SCENARIOS.length]
}

// mock 시나리오와 별 개수로 분석 결과를 만듦
export const createAnalysisResult = (file, starCount) => {
  const detected = pickScenario(file)
    .map((item) => ({ ...item, constellation: getConstellationById(item.id) }))
    .filter((item) => item.constellation)

  const brightest = detected
    .flatMap((item) => item.constellation.stars)
    .reduce((a, b) => (b.magnitude < a.magnitude ? b : a))
  const main = detected[0].constellation

  return {
    detected,
    starCount,
    brightest,
    direction: main.observation.position.split(' (')[0],
  }
}

// 별자리 별 좌표(0~100)를 사진 위 좌표(가로 100 기준)로 옮김
export const placeStars = ({ constellation, x, y, size }, viewHeight) =>
  Object.fromEntries(
    constellation.stars.map((s) => [
      s.id,
      {
        ...s,
        px: x + ((s.x - 50) / 100) * size,
        py: (y / 100) * viewHeight + ((s.y - 50) / 100) * size,
      },
    ]),
  )

// 사진 위에 별자리 선과 이름을 그린 PNG를 내려받음
export const downloadResultImage = async (photoUrl, result, fileName = 'stargazer') => {
  const img = await loadImage(photoUrl)
  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0)

  const unit = canvas.width / 100
  const viewHeight = (canvas.height / canvas.width) * 100

  result.detected.forEach((item, index) => {
    const stars = placeStars(item, viewHeight)
    const color = index === 0 ? '#ffd34d' : '#9fdcff'

    ctx.strokeStyle = color
    ctx.globalAlpha = 0.85
    ctx.lineWidth = Math.max(1.5, unit * 0.18)
    item.constellation.lines.forEach(([from, to]) => {
      ctx.beginPath()
      ctx.moveTo(stars[from].px * unit, stars[from].py * unit)
      ctx.lineTo(stars[to].px * unit, stars[to].py * unit)
      ctx.stroke()
    })

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
    ctx.fillText(item.constellation.nameKo, item.x * unit, top * unit - unit * 1.5)
  })

  const link = document.createElement('a')
  link.download = `${fileName.replace(/\.[^.]+$/, '')}_stargazer.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}
