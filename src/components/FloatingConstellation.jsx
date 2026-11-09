import { motion, useReducedMotion } from 'framer-motion'
import './FloatingConstellation.css'

const SLOW_OUT = [0.16, 1, 0.3, 1]
const SPRING = { type: 'spring', stiffness: 140, damping: 20 }

function FloatingConstellation({
  name,
  icon,
  activeIcon,
  art,
  x,
  y,
  size,
  offset,
  hovered,
  hoverScale,
  introDelay,
  float,
  onHoverChange,
  onSelect,
}) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      className="floating-constellation"
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        zIndex: hovered ? 2 : 1,
      }}
      animate={{ x: offset.x, y: offset.y }}
      transition={SPRING}
    >
      <motion.div
        className="floating-constellation__layer"
        initial={{ opacity: 0, scale: 0.7, filter: 'blur(8px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        transition={{ duration: 1, delay: introDelay, ease: SLOW_OUT }}
      >
        <motion.div
          className="floating-constellation__layer"
          animate={reduceMotion ? undefined : { y: [0, -float.amplitude, 0] }}
          transition={{
            duration: float.duration,
            delay: float.phase,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <motion.button
            type="button"
            className="floating-constellation__button"
            aria-label={name}
            animate={{ scale: hovered ? hoverScale : 1 }}
            transition={SPRING}
            onMouseEnter={() => onHoverChange(true)}
            onMouseLeave={() => onHoverChange(false)}
            onFocus={() => onHoverChange(true)}
            onBlur={() => onHoverChange(false)}
            onClick={onSelect}
          >
            {art && (
              <motion.img
                className="floating-constellation__art"
                src={art.src}
                alt=""
                style={{ left: `${art.x}%`, top: `${art.y}%`, width: `${art.size}%` }}
                initial={{ opacity: 0 }}
                animate={{ opacity: hovered ? 0.9 : 0 }}
                transition={{ duration: 0.4 }}
              />
            )}
            <motion.img
              className="floating-constellation__icon"
              src={icon}
              alt=""
              animate={{ opacity: hovered ? 0 : 1 }}
              transition={{ duration: 0.3 }}
            />
            <motion.img
              className="floating-constellation__icon"
              src={activeIcon}
              alt=""
              initial={false}
              animate={{ opacity: hovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            />
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export default FloatingConstellation
