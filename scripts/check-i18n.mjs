// 번역 누락을 찾아 주는 검사 스크립트 (npm run check:i18n)
//  1) ko / en 사전의 키가 서로 같은지
//  2) 코드에서 쓰는 t('키') 가 사전에 있는지
//  3) 코드(주석 제외)에 번역 없이 직접 적어 둔 한글이 없는지
//     - 의도적으로 한글을 남겨야 하면 그 줄 끝에 `// i18n-ignore` 를 붙여요
//     - src/i18n, src/locales, src/data 폴더는 번역 자료라서 검사하지 않아요
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

const root = process.cwd()
const srcDir = join(root, 'src')
const HANGUL = /[ㄱ-ㆎ가-힣]/
const SKIP_DIRS = ['i18n', 'locales', 'data', 'assets'].map((d) => join(srcDir, d))

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return SKIP_DIRS.includes(path) ? [] : walk(path)
    return /\.(js|jsx)$/.test(name) ? [path] : []
  })

const problems = []
const report = (kind, where, detail) => problems.push(`[${kind}] ${where}  ${detail}`)

// 1) 사전 키 비교
const ko = JSON.parse(readFileSync(join(srcDir, 'locales/ko.json'), 'utf8'))
const en = JSON.parse(readFileSync(join(srcDir, 'locales/en.json'), 'utf8'))
for (const key of Object.keys(ko)) if (!(key in en)) report('사전', key, 'en.json에 없어요')
for (const key of Object.keys(en)) if (!(key in ko)) report('사전', key, 'ko.json에 없어요')
for (const [key, value] of Object.entries(en)) {
  if (HANGUL.test(value)) report('사전', key, 'en.json 값에 한글이 있어요')
  const koHolders = ko[key]?.match(/\{\w+\}/g) ?? []
  const enHolders = value.match(/\{\w+\}/g) ?? []
  const missing = enHolders.filter((h) => !koHolders.includes(h))
  if (missing.length) report('사전', key, `en에만 있는 자리표시자: ${missing.join(', ')}`)
}

// 주석을 지운 코드 (줄 번호는 유지)
const stripComments = (code) =>
  code.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' ')).replace(/(^|[^:'"`\\])\/\/.*$/gm, '$1')

const namespaces = new Set(Object.keys(ko).map((k) => k.split('.')[0]))
const keyLike = new RegExp(`^(${[...namespaces].join('|')})\\.[\\w.-]+$`)

for (const file of walk(srcDir)) {
  const rel = relative(root, file).split(sep).join('/')
  const original = readFileSync(file, 'utf8').split(/\r?\n/)
  const stripped = stripComments(readFileSync(file, 'utf8')).split(/\r?\n/)

  stripped.forEach((line, i) => {
    if (original[i].includes('i18n-ignore')) return
    if (HANGUL.test(line)) report('한글', `${rel}:${i + 1}`, original[i].trim().slice(0, 80))
  })

  // 2) 사용한 키 확인 (t('a.b') 와 'a.b' 모양의 문자열)
  const code = stripped.join('\n')
  for (const m of code.matchAll(/['"]([\w-]+\.[\w.-]+)['"]/g)) {
    const key = m[1]
    if (keyLike.test(key) && !(key in ko)) report('키', rel, `'${key}' 가 사전에 없어요`)
  }
}

if (problems.length) {
  console.log(problems.join('\n'))
  console.log(`\n문제 ${problems.length}개를 찾았어요.`)
  process.exit(1)
}
console.log(`번역 검사 통과 ✓  (사전 ${Object.keys(ko).length}개 문장)`)
