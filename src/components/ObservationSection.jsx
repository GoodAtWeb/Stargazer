import { useTranslation } from 'react-i18next'
import './ObservationSection.css'

// 별자리가 언제, 어디서, 몇 시에 잘 보이는지 안내하는 섹션
function ObservationSection({ observation }) {
  const { t } = useTranslation()
  if (!observation) return null

  const items = [
    { label: t('obs.bestSeason'), value: observation.season, sub: t('obs.bestMonth', { month: observation.bestMonth }) },
    {
      label: t('obs.time'),
      value: observation.time,
      sub: observation.region === 'south' ? t('obs.basisSouth') : t('obs.basisKorea'),
    },
    { label: t('obs.position'), value: observation.position, sub: t('obs.fist') },
  ]

  return (
    <section className="observation">
      <h2>{t('obs.title')}</h2>
      <dl className="observation__grid">
        {items.map(({ label, value, sub }) => (
          <div key={label} className="observation__item">
            <dt>{label}</dt>
            <dd>{value}</dd>
            <p>{sub}</p>
          </div>
        ))}
      </dl>
      <p className="observation__tip">
        <strong>{t('obs.tip')}</strong> {observation.tip}
      </p>
    </section>
  )
}

export default ObservationSection
