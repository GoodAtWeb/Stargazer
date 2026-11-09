import { useMemo } from 'react'
import Particles, { ParticlesProvider } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'

// init은 앱 전체에서 같은 함수여야 함
const initEngine = (engine) => loadSlim(engine)

function StarField({ className }) {
  const options = useMemo(
    () => ({
      fullScreen: { enable: false },
      background: { color: 'transparent' },
      detectRetina: true,
      fpsLimit: 60,
      particles: {
        number: { value: 70, density: { enable: true } },
        color: { value: ['#ffffff', '#eaf6ff', '#ede8fd'] },
        shape: { type: 'circle' },
        size: { value: { min: 0.4, max: 1.6 } },
        opacity: {
          value: { min: 0.1, max: 0.8 },
          animation: { enable: true, speed: 0.6, sync: false },
        },
        move: { enable: true, speed: 0.05, direction: 'none', random: true, outModes: 'out' },
      },
      interactivity: {
        events: { onHover: { enable: true, mode: 'bubble' } },
        modes: { bubble: { distance: 120, size: 2.4, opacity: 1, duration: 1.5 } },
      },
    }),
    [],
  )

  return (
    <ParticlesProvider init={initEngine}>
      <Particles id="home-stars" className={className} options={options} />
    </ParticlesProvider>
  )
}

export default StarField
