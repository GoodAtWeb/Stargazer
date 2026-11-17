import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { formatDateLabel } from '../utils/photoRecord'
import RecordOverlay from './RecordOverlay'
import './PhotoRecordCard.css'

const SLOW_OUT = [0.16, 1, 0.3, 1]
const APPEAR_GAP = 0.08

function PhotoRecordCard({ record, index, onOpen }) {
  const { title, date, photo, aspect, constellations } = record

  return (
    <motion.li
      className="photo-record"
      layout
      initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
      animate={{
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: { duration: 0.8, delay: index * APPEAR_GAP, ease: SLOW_OUT },
      }}
      exit={{
        opacity: 0,
        scale: 0.92,
        filter: 'blur(6px)',
        transition: { duration: 0.35, ease: 'easeIn' },
      }}
      transition={{ layout: { type: 'spring', stiffness: 260, damping: 30 } }}
    >
      <button
        type="button"
        className="photo-record__thumb"
        aria-label={`${title} 크게 보기`}
        onClick={() => onOpen(record.id)}
      >
        <img src={photo} alt="" />
        <RecordOverlay aspect={aspect} constellations={constellations} />
      </button>

      <div className="photo-record__body">
        <h2 className="photo-record__title">
          <button type="button" onClick={() => onOpen(record.id)}>
            {title}
          </button>
        </h2>
        <p className="photo-record__date">{formatDateLabel(date)}</p>
        {constellations.length > 0 ? (
          <ul className="photo-record__tags">
            {constellations.map((c) => (
              <li key={c.id}>
                <Link
                  to={`/constellations/${c.id}`}
                  state={{ from: '/archive?tab=photos' }}
                  className="photo-record__tag"
                >
                  {c.nameKo}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="photo-record__none">별자리 없이 저장한 사진</p>
        )}
      </div>
    </motion.li>
  )
}

export default PhotoRecordCard
