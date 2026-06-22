import { useEffect, useRef } from 'react'
import './dog.css'

const PAWS = ['🐾', '🐾', '🐾', '🐾', '🐾', '🐾', '🐾', '🐾']

// 발바닥 리워드 폭죽 애니메이션
export default function PawReward({ count = 5, onDone }) {
  const ref = useRef()

  useEffect(() => {
    const timer = setTimeout(() => onDone?.(), 1600)
    return () => clearTimeout(timer)
  }, [onDone])

  const particles = Array.from({ length: Math.min(count, 12) }, (_, i) => {
    const angle = (i / Math.min(count, 12)) * 360 + Math.random() * 30 - 15
    const dist = 60 + Math.random() * 50
    const rad = (angle * Math.PI) / 180
    const px = Math.round(Math.sin(rad) * dist)
    const py = Math.round(-Math.cos(rad) * dist - 20)
    const pr = Math.round(angle - 90)
    const delay = (i * 0.06).toFixed(2)
    return { px, py, pr, delay, paw: PAWS[i % PAWS.length] }
  })

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 100,
      }}
      aria-hidden="true"
    >
      {particles.map((p, i) => (
        <span
          key={i}
          className="paw-particle"
          style={{
            position: 'absolute',
            fontSize: '22px',
            '--px': `${p.px}px`,
            '--py': `${p.py}px`,
            '--pr': `${p.pr}deg`,
            animationDelay: `${p.delay}s`,
          }}
        >
          {p.paw}
        </span>
      ))}
      <span style={{ fontSize: '36px', animation: 'badge-pop 0.5s ease-out forwards' }}>🐾</span>
    </div>
  )
}
