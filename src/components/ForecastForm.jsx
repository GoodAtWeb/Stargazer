import { motion } from 'framer-motion'
import { regions } from '../utils/forecast'
import { useTranslation } from 'react-i18next'
import { getRegionLabel } from '../i18n/data'
import './ForecastForm.css'

// 지역, 날짜, 시간을 입력받는 폼
function ForecastForm({ values, onChange, onSubmit }) {
  const { t } = useTranslation()
  return (
    <form className="forecast-form" onSubmit={onSubmit}>
      <label className="forecast-form__field forecast-form__field--region">
        <span>{t('form.region')}</span>
        <input
          type="text"
          list="forecast-regions"
          value={values.region}
          onChange={(e) => onChange('region', e.target.value)}
          placeholder={t('form.regionPh')}
          required
        />
        <datalist id="forecast-regions">
          {regions.map(({ name }) => (
            <option key={name} value={getRegionLabel(name)} />
          ))}
        </datalist>
      </label>
      <label className="forecast-form__field">
        <span>{t('form.date')}</span>
        <input
          type="date"
          value={values.date}
          onChange={(e) => onChange('date', e.target.value)}
          required
        />
      </label>
      <label className="forecast-form__field">
        <span>{t('form.time')}</span>
        <input
          type="time"
          step="3600"
          value={values.time}
          onChange={(e) => onChange('time', e.target.value)}
          required
        />
      </label>
      <motion.button
        type="submit"
        className="forecast-form__submit"
        whileTap={{ scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        {t('form.submit')}
      </motion.button>
    </form>
  )
}

export default ForecastForm
