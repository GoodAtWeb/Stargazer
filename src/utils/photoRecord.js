import exifr from 'exifr'
import { loadImage } from './photoAnalysis'

const MAX_SIDE = 1600
const JPEG_QUALITY = 0.85

const pad = (n) => String(n).padStart(2, '0')

// Date → 'YYYY-MM-DD' (input[type=date] 값)
export const toDateValue = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

// 'YYYY-MM-DD' → 'YYYY년 M월 D일'
export const formatDateLabel = (dateValue) => {
  const [y, m, d] = dateValue.split('-').map(Number)
  return `${y}년 ${m}월 ${d}일`
}

// 'YYYY-MM-DD' → 'yy-mm-dd 별자리 사진'
export const getDefaultTitle = (dateValue) => `${dateValue.slice(2)} 별자리 사진`

// 사진 촬영일(EXIF)을 읽고, 없으면 null
export const readTakenDate = async (file) => {
  try {
    const exif = await exifr.parse(file, ['DateTimeOriginal', 'CreateDate'])
    const date = exif?.DateTimeOriginal ?? exif?.CreateDate
    return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null
  } catch {
    return null
  }
}

export const compressPhoto = async (photoUrl) => {
  const img = await loadImage(photoUrl)
  const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(img.naturalWidth * scale)
  canvas.height = Math.round(img.naturalHeight * scale)
  canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', JPEG_QUALITY)
}

// 분석 결과의 별자리 하나를 다시 그릴 수 있는 최소 정보로 정리
export const toRecordConstellation = ({ constellation, placed }) => ({
  id: constellation.id,
  nameKo: constellation.nameKo,
  lines: constellation.lines,
  stars: Object.fromEntries(Object.values(placed).map((s) => [s.id, [s.px, s.py]])),
})
