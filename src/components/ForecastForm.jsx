import { motion } from 'framer-motion'
import { regions } from '../utils/forecast'
import './ForecastForm.css'

// 지역, 날짜, 시간을 입력받는 폼
function ForecastForm({ values, onChange, onSubmit }) {
  return (
    <form className="forecast-form" onSubmit={onSubmit}>
      <label className="forecast-form__field forecast-form__field--region">
        <span>지역</span>
        <input
          type="text"
          list="forecast-regions"
          value={values.region}
          onChange={(e) => onChange('region', e.target.value)}
          placeholder="지역을 입력하세요"
          required
        />
        <datalist id="forecast-regions">
          {regions.map(({ name }) => (
            <option key={name} value={name} />
          ))}
        </datalist>
      </label>
      <label className="forecast-form__field">
        <span>날짜</span>
        <input
          type="date"
          value={values.date}
          onChange={(e) => onChange('date', e.target.value)}
          required
        />
      </label>
      <label className="forecast-form__field">
        <span>시간</span>
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
        확인하기
      </motion.button>
    </form>
  )
}

export default ForecastForm
