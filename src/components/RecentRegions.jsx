import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { getRegionLabel, resolveRegion } from '../i18n/data'
import './RecentRegions.css'

// 최근 검색한 지역을 바로가기로 보여주고, 누르면 그 지역으로 바로 검색
function RecentRegions({ regions, onSelect, onRemove }) {
  const { t } = useTranslation()
  if (regions.length === 0) return null

  return (
    <div className="recent-regions">
      <span className="recent-regions__label">{t('recent.label')}</span>
      <ul>
        <AnimatePresence initial={false}>
          {regions.map((region) => (
            <motion.li
              key={region}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            >
              <button type="button" className="recent-regions__item" onClick={() => onSelect(region)}>
                {getRegionLabel(resolveRegion(region))}
              </button>
              <button
                type="button"
                className="recent-regions__remove"
                onClick={() => onRemove(region)}
                aria-label={t('recent.remove', { region: getRegionLabel(resolveRegion(region)) })}
              >
                ×
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  )
}

export default RecentRegions
