import { motion } from 'framer-motion'

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
  aquarius: { x: -10, y: -10, size: 120 },
  pisces: { x: 0, y: 0, size: 100 },
  orion: { x: 0, y: 0, size: 100 },
  'ursa-major': { x: -10, y: -10, size: 120 },
  'ursa-minor': { x: -10, y: -10, size: 120 },
  cassiopeia: { x: -10, y: -10, size: 120 },
  cygnus: { x: -10, y: -10, size: 120 },
  lyra: { x: 0, y: 0, size: 100 },
  aquila: { x: 0, y: 0, size: 100 },
  'canis-major': { x: -10, y: -10, size: 120 },
  pegasus: { x: 0, y: 0, size: 100 },
  perseus: { x: -10, y: -10, size: 120 },
  cetus: { x: 0, y: 0, size: 100 },
  puppis: { x: 0, y: 0, size: 100 },
  antlia: { x: 0, y: 0, size: 100 },
  pavo: { x: 0, y: 0, size: 100 },
  reticulum: { x: 0, y: 0, size: 100 },
  apus: { x: 0, y: 0, size: 100 },
  camelopardalis: { x: 0, y: 0, size: 100 },
  corvus: { x: 0, y: 0, size: 100 },
  pyxis: { x: 0, y: 0, size: 100 },
  volans: { x: 0, y: 0, size: 100 },
  crux: { x: 0, y: 0, size: 100 },
  'piscis-austrinus': { x: 0, y: 0, size: 100 },
  'triangulum-australe': { x: 0, y: 0, size: 100 },
  'corona-australis': { x: 0, y: 0, size: 100 },
  lacerta: { x: 0, y: 0, size: 100 },
  delphinus: { x: 0, y: 0, size: 100 },
  vela: { x: 0, y: 0, size: 100 },
  grus: { x: 0, y: 0, size: 100 },
  auriga: { x: -10, y: -10, size: 120 },
  telescopium: { x: 0, y: 0, size: 100 },
  'coma-berenices': { x: 0, y: 0, size: 100 },
  bootes: { x: 0, y: 0, size: 100 },
  hydrus: { x: -10, y: -10, size: 120 },
  hydra: { x: -10, y: -10, size: 120 },
  scutum: { x: 0, y: 0, size: 100 },
  serpens: { x: 0, y: 0, size: 100 },
  ophiuchus: { x: 0, y: 0, size: 100 },
  phoenix: { x: 0, y: 0, size: 100 },
  'corona-borealis': { x: -10, y: -10, size: 120 },
  columba: { x: 0, y: 0, size: 100 },
  'canes-venatici': { x: 0, y: 0, size: 100 },
  lynx: { x: 0, y: 0, size: 100 },
  triangulum: { x: 0, y: 0, size: 100 },
  cepheus: { x: 0, y: 0, size: 100 },
  centaurus: { x: 0, y: 0, size: 100 },
  horologium: { x: 0, y: 0, size: 100 },
  andromeda: { x: 0, y: 0, size: 100 },
  eridanus: { x: 0, y: 0, size: 100 },
  monoceros: { x: 0, y: 0, size: 100 },
  carina: { x: 0, y: 0, size: 100 },
  draco: { x: 0, y: 0, size: 100 },
  sextans: { x: 0, y: 0, size: 100 },
  lupus: { x: 0, y: 0, size: 100 },
  indus: { x: 0, y: 0, size: 100 },
  'canis-minor': { x: 0, y: 0, size: 100 },
  'leo-minor': { x: 0, y: 0, size: 100 },
  vulpecula: { x: 0, y: 0, size: 100 },
  ara: { x: 0, y: 0, size: 100 },
  sculptor: { x: 0, y: 0, size: 100 },
  caelum: { x: 0, y: 0, size: 100 },
  equuleus: { x: 0, y: 0, size: 100 },
  norma: { x: 0, y: 0, size: 100 },
  chamaeleon: { x: 0, y: 0, size: 100 },
  circinus: { x: 0, y: 0, size: 100 },
  crater: { x: 0, y: 0, size: 100 },
  tucana: { x: 0, y: 0, size: 100 },
  mensa: { x: 0, y: 0, size: 100 },
  lepus: { x: 0, y: 0, size: 100 },
  musca: { x: 0, y: 0, size: 100 },
  octans: { x: 0, y: 0, size: 100 },
  hercules: { x: 0, y: 0, size: 100 },
  microscopium: { x: 0, y: 0, size: 100 },
  pictor: { x: 0, y: 0, size: 100 },
  fornax: { x: 0, y: 0, size: 100 },
  sagitta: { x: 0, y: 0, size: 100 },
  dorado: { x: 0, y: 0, size: 100 },
}

// 별자리 id에 맞는 배경 그림을 별 좌표계(0~100)에 맞춰 delay초 뒤에 서서히 나타나게 반환 (없으면 아무것도 그리지 않음)
function ConstellationArt({ id, delay = 0 }) {
  const href = arts[`../assets/art/${id}.svg`]
  const placement = PLACEMENTS[id]
  if (!href || !placement) return null

  return (
    <motion.image
      className="constellation-art"
      href={href}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.4, delay, ease: 'easeOut' }}
      x={placement.x}
      y={placement.y}
      width={placement.size}
      height={placement.size}
      aria-hidden="true"
    />
  )
}

export default ConstellationArt
