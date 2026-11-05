import './ObservationSection.css'

// 별자리가 언제, 어디서, 몇 시에 잘 보이는지 안내하는 섹션
function ObservationSection({ observation }) {
  if (!observation) return null

  const items = [
    { label: '관측 적기', value: observation.season, sub: `가장 잘 보이는 달: ${observation.bestMonth}` },
    { label: '관측 시간', value: observation.time, sub: '한국 기준' },
    { label: '보이는 방향과 높이', value: observation.position, sub: '주먹 하나가 하늘에서 약 10°예요' },
  ]

  return (
    <section className="observation">
      <h2>관측 정보</h2>
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
        <strong>관측 팁</strong> {observation.tip}
      </p>
    </section>
  )
}

export default ObservationSection
