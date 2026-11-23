import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getLang } from '../i18n'
import { getMonthName, getWeekdayName } from '../i18n/data'
import { getTodayString } from '../utils/forecast'
import './DatePicker.css'

const pad = (n) => String(n).padStart(2, '0')

// 'YYYY-MM-DD' 값을 연, 월, 일 숫자로 나눠 반환
const parseDate = (value) => {
  const [year, month, day] = value.split('-').map(Number)
  return { year, month, day }
}

// 연, 월 제목: 2026년 11월 / November 2026
const formatTitle = (year, month) => (getLang() === 'en' ? `${getMonthName(month)} ${year}` : `${year}년 ${month}월`)

// 브라우저 기본 날짜 선택창은 언어 설정을 따라가지 않아서 직접 만든 달력 (한국어/영어 전환)
function DatePicker({ value, onChange }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [view, setView] = useState(() => parseDate(value)) // 달력에 보이는 연, 월
  const box = useRef(null)
  const today = getTodayString()
  const selected = parseDate(value)

  // 달력 밖을 누르거나 Esc를 누르면 닫음
  useEffect(() => {
    if (!open) return undefined
    const onDown = (e) => {
      if (!box.current?.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const toggle = () => {
    if (!open) setView({ year: selected.year, month: selected.month }) // 열 때 선택한 날짜의 달부터 보여줌
    setOpen((v) => !v)
  }

  // 이전 달(-1), 다음 달(1)로 이동
  const move = (step) => {
    const date = new Date(view.year, view.month - 1 + step, 1)
    setView({ year: date.getFullYear(), month: date.getMonth() + 1 })
  }

  const pick = (nextValue) => {
    onChange(nextValue)
    setOpen(false)
  }

  const firstWeekday = new Date(view.year, view.month - 1, 1).getDay()
  const dayCount = new Date(view.year, view.month, 0).getDate()
  const cells = [...Array(firstWeekday).fill(null), ...Array.from({ length: dayCount }, (_, i) => i + 1)]

  return (
    <div className="date-picker" ref={box}>
      <button type="button" className="date-picker__button" aria-haspopup="dialog" aria-expanded={open} onClick={toggle}>
        {value}
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
          <path d="M3.5 10h17M8 3v4M16 3v4" />
        </svg>
      </button>
      {open && (
        <div className="date-picker__popup" role="dialog" aria-label={t('form.date')}>
          <div className="date-picker__head">
            <strong>{formatTitle(view.year, view.month)}</strong>
            <div className="date-picker__nav">
              <button type="button" aria-label={t('form.prevMonth')} onClick={() => move(-1)}>
                ↑
              </button>
              <button type="button" aria-label={t('form.nextMonth')} onClick={() => move(1)}>
                ↓
              </button>
            </div>
          </div>
          <div className="date-picker__grid">
            {Array.from({ length: 7 }, (_, i) => (
              <small key={i}>{getWeekdayName(i)}</small>
            ))}
            {cells.map((day, i) => {
              if (day === null) return <i key={`blank-${i}`} />
              const dayValue = `${view.year}-${pad(view.month)}-${pad(day)}`
              const classes = ['date-picker__day']
              if (dayValue === value) classes.push('date-picker__day--selected')
              if (dayValue === today) classes.push('date-picker__day--today')
              return (
                <button key={dayValue} type="button" className={classes.join(' ')} onClick={() => pick(dayValue)}>
                  {day}
                </button>
              )
            })}
          </div>
          <button type="button" className="date-picker__today" onClick={() => pick(today)}>
            {t('form.today')}
          </button>
        </div>
      )}
    </div>
  )
}

export default DatePicker
