const arts = import.meta.glob('../assets/art/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
})

const PLACEMENTS = {
  scorpio: { x: -1.5, y: 15.3, size: 78 },
  aries: { x: 0, y: 0, size: 100 },
  taurus: { x: 0, y: 0, size: 100 },
  gemini: { x: 0, y: 0, size: 100 },
  cancer: { x: 0, y: 0, size: 100 },
  leo: { x: 0, y: 0, size: 100 },
  virgo: { x: 0, y: 0, size: 100 },
  libra: { x: 0, y: 0, size: 100 },
  sagittarius: { x: 0, y: 0, size: 100 },
  capricorn: { x: 0, y: 0, size: 100 },
  aquarius: { x: 0, y: 0, size: 100 },
  pisces: { x: 0, y: 0, size: 100 },
}

// 별자리 id에 맞는 배경 그림을 별 좌표계(0~100)에 맞춰 반환 (없으면 아무것도 그리지 않음)
function ConstellationArt({ id }) {
  const href = arts[`../assets/art/${id}.svg`]
  const placement = PLACEMENTS[id]
  if (!href || !placement) return null

  return (
    <image
      className="constellation-art"
      href={href}
      x={placement.x}
      y={placement.y}
      width={placement.size}
      height={placement.size}
      aria-hidden="true"
    />
  )
}

export default ConstellationArt
