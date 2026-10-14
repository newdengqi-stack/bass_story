'use client'

import { useEffect } from 'react'

/**
 * 流星雨动效
 * 流星本体与运动方向共用同一条轴线：先旋转，再沿自身轴线 translateX，
 * 保证尾迹始终在运动方向的正后方，呈直线划过。
 */
export function MeteorShower() {
  useEffect(() => {
    const container = document.getElementById('meteor-shower')
    if (!container) return

    const ANGLE_DEG = 35

    const createMeteor = () => {
      const meteor = document.createElement('div')
      const startLeft = -10 + Math.random() * 80
      const startTop = -10 + Math.random() * 30
      const duration = 1.2 + Math.random() * 1.0
      const delay = Math.random() * 2
      const opacity = 0.5 + Math.random() * 0.5
      const length = 90 + Math.random() * 60

      meteor.className = 'meteor'
      meteor.style.cssText = `
        position: fixed;
        left: ${startLeft}vw;
        top: ${startTop}vh;
        width: ${length}px;
        height: 1.5px;
        border-radius: 9999px;
        background: linear-gradient(90deg, rgba(150,180,255,0) 0%, rgba(200,220,255,${opacity * 0.6}) 70%, rgba(255,255,255,${opacity}) 100%);
        filter: drop-shadow(0 0 4px rgba(170,195,255,${opacity * 0.8}));
        pointer-events: none;
        opacity: 0;
        transform-origin: right center;
        --meteor-angle: ${ANGLE_DEG}deg;
        animation: meteor-fall ${duration}s linear ${delay}s forwards;
      `

      container.appendChild(meteor)

      setTimeout(() => meteor.remove(), (duration + delay) * 1000 + 100)
    }

    const keyframes = `
      @keyframes meteor-fall {
        0% {
          transform: rotate(var(--meteor-angle)) translateX(0);
          opacity: 0;
        }
        10% {
          opacity: 1;
        }
        100% {
          transform: rotate(var(--meteor-angle)) translateX(120vmax);
          opacity: 0;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .meteor { display: none; }
      }
    `

    const style = document.createElement('style')
    style.textContent = keyframes
    document.head.appendChild(style)

    const timers: ReturnType<typeof setTimeout>[] = []
    const spawnRate = 3000

    const spawn = () => {
      createMeteor()
      timers.push(setTimeout(spawn, spawnRate))
    }

    spawn()

    return () => {
      timers.forEach(clearTimeout)
      style.remove()
      container.innerHTML = ''
    }
  }, [])

  return (
    <div
      id="meteor-shower"
      className="pointer-events-none fixed top-0 left-0 h-screen w-screen z-10 overflow-hidden"
      aria-hidden="true"
    />
  )
}
