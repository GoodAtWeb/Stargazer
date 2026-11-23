import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from '../locales/en.json'
import ko from '../locales/ko.json'

const STORAGE_KEY = 'stargazer.lang'
const LANGS = ['ko', 'en']

// 저장된 언어가 있으면 그 언어, 처음 방문이면 브라우저 언어(한국어면 한국어, 아니면 영어)로 시작함
const detectLang = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (LANGS.includes(saved)) return saved
  } catch {
    // 저장소를 못 쓰는 환경이면 브라우저 언어를 사용함
  }
  return navigator.language?.toLowerCase().startsWith('ko') ? 'ko' : 'en'
}

i18n.use(initReactI18next).init({
  resources: { ko: { translation: ko }, en: { translation: en } },
  lng: detectLang(),
  fallbackLng: 'ko',
  keySeparator: false, // 'nav.home' 같은 키를 그대로 사용함
  nsSeparator: false,
  returnEmptyString: true, // 영어에서 일부러 비워둔 문구(예: 단위 '개')가 한국어로 대체되지 않게 함
  interpolation: { prefix: '{', suffix: '}', escapeValue: false }, // '{count}개' 형식을 그대로 사용함
})

// 언어가 바뀌면 선택을 기억하고 <html lang>을 갱신함 (스크린 리더·브라우저용)
const onLanguageChanged = (lang) => {
  document.documentElement.lang = lang
  try {
    localStorage.setItem(STORAGE_KEY, lang)
  } catch {
    // 저장 실패는 무시함
  }
}
i18n.on('languageChanged', onLanguageChanged)
onLanguageChanged(i18n.language)

// 컴포넌트 밖(유틸)에서 쓰는 번역 함수와 현재 언어
export const t = (key, params) => i18n.t(key, params)
export const getLang = () => i18n.language

export default i18n
