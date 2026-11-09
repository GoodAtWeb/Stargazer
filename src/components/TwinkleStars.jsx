import './TwinkleStars.css'

// 같은 값이 나오는 간단한 난수 (새로고침해도 별 위치가 그대로)
const makeRandom = (seed) => () => {
  seed = (seed * 16807) % 2147483647
  return seed / 2147483647
}

const COLORS = ['#ffffff', '#ffffff', '#ffe9c4', '#dcd2ff']

// 별마다 위치, 크기, 박자를 따로 정해서 하나씩 제각각 반짝이게 함
const random = makeRandom(20261109)
const STARS = Array.from({ length: 70 }, (_, i) => {
  const big = i % 10 === 0
  return {
    left: random() * 100,
    top: random() * 100,
    size: big ? 4 + random() * 2 : 1.5 + random() * 1.8,
    color: COLORS[Math.floor(random() * COLORS.length)],
    duration: 3 + random() * 6,
    delay: -random() * 9,
    big,
  }
})

// 페이지 배경에 깔리는 반짝이는 별
function TwinkleStars() {
  return (
    <div className="twinkle-stars" aria-hidden="true">
      {STARS.map((star, i) => (
        <span
          key={i}
          className={star.big ? 'twinkle-stars__star twinkle-stars__star--big' : 'twinkle-stars__star'}
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: star.size,
            height: star.size,
            color: star.color,
            animationDuration: `${star.duration}s`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

export default TwinkleStars
