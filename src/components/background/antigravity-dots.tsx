"use client"

import { useEffect, useRef } from "react"

type Dot = {
  baseX: number
  baseY: number
  x: number
  y: number
  vx: number
  vy: number
  radius: number
}

const SPACING = 36
const MOUSE_RADIUS = 140
const REPULSION = 0.55
const SPRING = 0.04
const DAMPING = 0.82
const DRIFT = -0.04

export function AntigravityDots() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: -1000, y: -1000, active: false })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationId = 0
    let dots: Dot[] = []
    let width = 0
    let height = 0
    let dpr = 1

    const buildGrid = () => {
      dots = []
      const cols = Math.ceil(width / SPACING) + 2
      const rows = Math.ceil(height / SPACING) + 2

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const baseX = col * SPACING + SPACING / 2
          const baseY = row * SPACING + SPACING / 2
          dots.push({
            baseX,
            baseY,
            x: baseX,
            y: baseY,
            vx: 0,
            vy: 0,
            radius: 1.6,
          })
        }
      }
    }

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      buildGrid()
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      const gradient = ctx.createLinearGradient(0, 0, width, height)
      gradient.addColorStop(0, "#f8fafc")
      gradient.addColorStop(0.5, "#f5f3ff")
      gradient.addColorStop(1, "#eff6ff")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

      const mouse = mouseRef.current

      for (const dot of dots) {
        dot.vy += DRIFT

        if (mouse.active) {
          const dx = dot.x - mouse.x
          const dy = dot.y - mouse.y
          const distance = Math.hypot(dx, dy)

          if (distance < MOUSE_RADIUS && distance > 0) {
            const force = (1 - distance / MOUSE_RADIUS) * REPULSION
            dot.vx += (dx / distance) * force * 8
            dot.vy += (dy / distance) * force * 8
          }
        }

        const springX = (dot.baseX - dot.x) * SPRING
        const springY = (dot.baseY - dot.y) * SPRING
        dot.vx += springX
        dot.vy += springY

        dot.vx *= DAMPING
        dot.vy *= DAMPING
        dot.x += dot.vx
        dot.y += dot.vy

        const offset = Math.hypot(dot.x - dot.baseX, dot.y - dot.baseY)
        const alpha = Math.min(0.15 + offset * 0.02, 0.65)

        ctx.beginPath()
        ctx.arc(dot.x, dot.y, dot.radius + offset * 0.02, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(99, 102, 241, ${alpha})`
        ctx.fill()
      }

      animationId = window.requestAnimationFrame(draw)
    }

    const onMouseMove = (event: MouseEvent) => {
      mouseRef.current = { x: event.clientX, y: event.clientY, active: true }
    }

    const onMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000, active: false }
    }

    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0]
      if (!touch) return
      mouseRef.current = { x: touch.clientX, y: touch.clientY, active: true }
    }

    const onTouchEnd = () => {
      mouseRef.current = { x: -1000, y: -1000, active: false }
    }

    resize()
    draw()

    window.addEventListener("resize", resize)
    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseleave", onMouseLeave)
    window.addEventListener("touchmove", onTouchMove, { passive: true })
    window.addEventListener("touchend", onTouchEnd)

    return () => {
      window.cancelAnimationFrame(animationId)
      window.removeEventListener("resize", resize)
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseleave", onMouseLeave)
      window.removeEventListener("touchmove", onTouchMove)
      window.removeEventListener("touchend", onTouchEnd)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  )
}
