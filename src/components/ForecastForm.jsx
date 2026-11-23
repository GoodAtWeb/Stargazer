import { motion } from 'framer-motion'
import { regions } from '../utils/forecast'
import { useTranslation } from 'react-i18next'
import { getRegionLabel } from '../i18n/data'
import DatePicker from './DatePicker'
import './ForecastForm.css'

// 시간 선택 목록 ('00:00' ~ '23:00', 브라우저 기본 시간 입력은 언어 설정을 따라가지 않아 직접 만듦)
const TIME_OPTIONS = Array.from({ length: 24 }, (_, hour) => `${String(hour).padStart(2, '0')}:00`)

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
      <div className="forecast-form__field">
        <span>{t('form.date')}</span>
        <DatePicker value={values.date} onChange={(date) => onChange('date', date)} />
      </div>
      <label className="forecast-form__field">
        <span>{t('form.time')}</span>
        <select value={values.time} onChange={(e) => onChange('time', e.target.value)} required>
          {TIME_OPTIONS.map((time) => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </select>
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
