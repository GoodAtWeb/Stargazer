import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import './LanguageSwitch.css'

const OPTIONS = [
  { lang: 'ko', short: 'KO', label: '한국어' }, // i18n-ignore
  { lang: 'en', short: 'EN', label: 'English' },
]

// 한국어 / English를 고르는 언어 선택 메뉴 (상단 메뉴바와 메인 화면에서 사용)
function LanguageSwitch({ className = '' }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  // 바깥을 누르거나 Esc를 누르면 닫음
  useEffect(() => {
    if (!open) return undefined
    const onPointerDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false)
    }
    const onKeyDown = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const current = OPTIONS.find((o) => o.lang === lang) ?? OPTIONS[0]

  return (
    <div className={`lang-switch ${className}`} ref={rootRef}>
      <button
        type="button"
        className="lang-switch__button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('lang.label')}
        onClick={() => setOpen((v) => !v)}
      >
        {current.short} ▾
      </button>
      {open && (
        <ul className="lang-switch__menu" role="listbox" aria-label={t('lang.label')}>
          {OPTIONS.map((o) => (
            <li key={o.lang} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={o.lang === lang}
                className={`lang-switch__option${o.lang === lang ? ' lang-switch__option--active' : ''}`}
                onClick={() => {
                  i18n.changeLanguage(o.lang)
                  setOpen(false)
                }}
              >
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default LanguageSwitch
