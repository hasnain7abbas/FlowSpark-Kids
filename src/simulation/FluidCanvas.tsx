import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react'
import type { SimulationMetrics, ToolId } from '../types'

interface FluidCanvasProps {
  selectedTool: ToolId
  onToolAction: (tool: ToolId) => void
  onMetricsChange: (metrics: SimulationMetrics) => void
}

export interface FluidCanvasHandle {
  reset: () => void
  capture: () => string | undefined
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  radius: number
  kind: 'water' | 'pollution' | 'smoke' | 'heat' | 'ice'
}

interface SceneObject {
  x: number
  y: number
  kind: ToolId
  size: number
  angle: number
}

interface RainCloud {
  x: number
  y: number
  until: number
}

const particleColors: Record<Particle['kind'], string> = {
  water: 'rgba(22, 153, 205, 0.52)',
  pollution: 'rgba(105, 62, 158, 0.58)',
  smoke: 'rgba(91, 78, 123, 0.34)',
  heat: 'rgba(244, 115, 76, 0.42)',
  ice: 'rgba(95, 197, 225, 0.38)',
}

const distanceToSegment = (
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
) => {
  const dx = bx - ax
  const dy = by - ay
  const lengthSquared = dx * dx + dy * dy || 1
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lengthSquared))
  const x = ax + t * dx
  const y = ay + t * dy
  return {
    distance: Math.hypot(px - x, py - y),
    closestX: x,
    closestY: y,
  }
}

const FluidCanvas = forwardRef<FluidCanvasHandle, FluidCanvasProps>(
  ({ selectedTool, onToolAction, onMetricsChange }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const particlesRef = useRef<Particle[]>([])
    const objectsRef = useRef<SceneObject[]>([])
    const rainCloudsRef = useRef<RainCloud[]>([])
    const selectedToolRef = useRef(selectedTool)
    const onToolActionRef = useRef(onToolAction)
    const onMetricsChangeRef = useRef(onMetricsChange)
    const pointerRef = useRef({ down: false, x: 0, y: 0 })
    const rainUntilRef = useRef(0)
    const lastMetricsTimeRef = useRef(0)

    useEffect(() => {
      selectedToolRef.current = selectedTool
    }, [selectedTool])

    useEffect(() => {
      onToolActionRef.current = onToolAction
    }, [onToolAction])

    useEffect(() => {
      onMetricsChangeRef.current = onMetricsChange
    }, [onMetricsChange])

    const reset = () => {
      particlesRef.current = []
      objectsRef.current = []
      rainCloudsRef.current = []
      rainUntilRef.current = 0
    }

    useImperativeHandle(ref, () => ({
      reset,
      capture: () => canvasRef.current?.toDataURL('image/png'),
    }))

    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      const context = canvas.getContext('2d')
      if (!context) return

      let animationFrame = 0
      let width = 0
      let height = 0
      let lastTime = performance.now()

      const resize = () => {
        const rect = canvas.getBoundingClientRect()
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
        width = rect.width
        height = rect.height
        canvas.width = Math.round(width * pixelRatio)
        canvas.height = Math.round(height * pixelRatio)
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      }

      const addParticles = (
        x: number,
        y: number,
        kind: Particle['kind'],
        count = 16,
        pushX = 0,
        pushY = 0,
      ) => {
        for (let index = 0; index < count; index += 1) {
          const angle = Math.random() * Math.PI * 2
          const speed = 0.15 + Math.random() * 0.6
          particlesRef.current.push({
            x: x + (Math.random() - 0.5) * 16,
            y: y + (Math.random() - 0.5) * 16,
            vx: Math.cos(angle) * speed + pushX,
            vy: Math.sin(angle) * speed + pushY,
            life: 420 + Math.random() * 340,
            radius: 7 + Math.random() * 13,
            kind,
          })
        }
        particlesRef.current = particlesRef.current.slice(-900)
      }

      const drawBackground = () => {
        const gradient = context.createLinearGradient(0, 0, width, height)
        gradient.addColorStop(0, '#cceef1')
        gradient.addColorStop(0.48, '#a9dfe8')
        gradient.addColorStop(1, '#91d0df')
        context.fillStyle = gradient
        context.fillRect(0, 0, width, height)

        context.strokeStyle = 'rgba(255, 255, 255, 0.18)'
        context.lineWidth = 1
        for (let x = 24; x < width; x += 36) {
          context.beginPath()
          context.moveTo(x, 0)
          context.lineTo(x, height)
          context.stroke()
        }
        for (let y = 24; y < height; y += 36) {
          context.beginPath()
          context.moveTo(0, y)
          context.lineTo(width, y)
          context.stroke()
        }

        const mountain = context.createLinearGradient(0, 0, 100, 100)
        mountain.addColorStop(0, 'rgba(87, 143, 126, 0.43)')
        mountain.addColorStop(1, 'rgba(61, 127, 111, 0.12)')
        context.fillStyle = mountain
        context.beginPath()
        context.moveTo(0, height * 0.16)
        context.lineTo(width * 0.11, height * 0.52)
        context.lineTo(width * 0.2, height * 0.25)
        context.lineTo(width * 0.29, height * 0.6)
        context.lineTo(0, height * 0.7)
        context.closePath()
        context.fill()

        const ocean = context.createLinearGradient(width * 0.83, 0, width, 0)
        ocean.addColorStop(0, 'rgba(16, 130, 178, 0)')
        ocean.addColorStop(1, 'rgba(4, 109, 159, 0.28)')
        context.fillStyle = ocean
        context.fillRect(width * 0.78, 0, width * 0.22, height)

        context.save()
        context.translate(width * 0.62, height * 0.78)
        context.fillStyle = 'rgba(255, 244, 214, 0.88)'
        context.strokeStyle = 'rgba(117, 91, 45, 0.2)'
        context.lineWidth = 2
        context.beginPath()
        context.roundRect(-32, -18, 64, 36, 8)
        context.fill()
        context.stroke()
        context.fillStyle = '#9d7255'
        context.fillRect(-26, -5, 12, 23)
        context.fillRect(-5, -2, 12, 20)
        context.fillRect(16, -8, 12, 26)
        context.fillStyle = '#d95c55'
        context.beginPath()
        context.moveTo(-35, -18)
        context.lineTo(-22, -32)
        context.lineTo(-9, -18)
        context.closePath()
        context.fill()
        context.beginPath()
        context.moveTo(-14, -18)
        context.lineTo(1, -33)
        context.lineTo(16, -18)
        context.closePath()
        context.fill()
        context.beginPath()
        context.moveTo(7, -18)
        context.lineTo(23, -35)
        context.lineTo(39, -18)
        context.closePath()
        context.fill()
        context.fillStyle = 'rgba(23, 50, 77, 0.75)'
        context.font = '700 10px sans-serif'
        context.fillText('village', -20, 36)
        context.restore()
      }

      const applyForces = (particle: Particle) => {
        objectsRef.current.forEach((object) => {
          const dx = particle.x - object.x
          const dy = particle.y - object.y
          const distance = Math.hypot(dx, dy) || 1
          const range = object.size * 2.6

          if (object.kind === 'fan' && distance < range * 2.2) {
            particle.vx += 0.052
            if (particle.kind === 'smoke') particle.life += 0.6
          }
          if (object.kind === 'heater' && distance < range * 1.8) {
            particle.vy -= 0.054
            particle.vx += Math.sin(distance) * 0.005
          }
          if (object.kind === 'ice' && distance < range * 1.8) {
            particle.vy += 0.046
          }
          if (object.kind === 'drain' && distance < range * 2.6) {
            particle.vx -= (dx / distance) * 0.06
            particle.vy -= (dy / distance) * 0.06
            if (distance < object.size * 0.9) particle.life -= 14
          }
          if (object.kind === 'tree' && distance < range * 1.25) {
            particle.vx *= 0.88
            particle.vy *= 0.88
            if (particle.kind === 'water' && distance < object.size * 1.35) {
              particle.life -= 3.2
            }
          }
          if (object.kind === 'filter') {
            const filterHit = distanceToSegment(
              particle.x,
              particle.y,
              object.x,
              object.y - object.size * 1.45,
              object.x,
              object.y + object.size * 1.45,
            )
            if (filterHit.distance < particle.radius + 6) {
              if (particle.kind === 'pollution') particle.life -= 20
              particle.vx *= 0.78
            }
          }

          if (object.kind === 'rock' && distance < object.size * 1.6 + particle.radius) {
            const force = (object.size * 1.6 - distance + particle.radius) * 0.04
            particle.vx += (dx / distance) * force
            particle.vy += (dy / distance) * force
            if (particle.kind === 'water') particle.vx += 0.012
          }

          if (object.kind === 'wall') {
            const halfLength = object.size * 2.3
            const ax = object.x - Math.cos(object.angle) * halfLength
            const ay = object.y - Math.sin(object.angle) * halfLength
            const bx = object.x + Math.cos(object.angle) * halfLength
            const by = object.y + Math.sin(object.angle) * halfLength
            const hit = distanceToSegment(particle.x, particle.y, ax, ay, bx, by)
            if (hit.distance < particle.radius + 9) {
              const nx = (particle.x - hit.closestX) / (hit.distance || 1)
              const ny = (particle.y - hit.closestY) / (hit.distance || 1)
              const push = (particle.radius + 11 - hit.distance) * 0.07
              particle.vx += nx * push
              particle.vy += ny * push
              particle.vx *= 0.76
              particle.vy *= 0.76
            }
          }
        })
      }

      const drawParticles = () => {
        context.globalCompositeOperation = 'source-over'
        particlesRef.current.forEach((particle) => {
          context.beginPath()
          context.fillStyle = particleColors[particle.kind]
          context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
          context.fill()

          context.beginPath()
          context.fillStyle = particleColors[particle.kind].replace(
            /[\d.]+\)$/,
            '0.18)',
          )
          context.arc(
            particle.x - particle.vx * 6,
            particle.y - particle.vy * 6,
            particle.radius * 1.45,
            0,
            Math.PI * 2,
          )
          context.fill()
        })
      }

      const drawObject = (object: SceneObject) => {
        context.save()
        context.translate(object.x, object.y)

        if (object.kind === 'rock') {
          context.fillStyle = '#667c86'
          context.beginPath()
          context.moveTo(-object.size, object.size * 0.6)
          context.quadraticCurveTo(
            -object.size * 0.7,
            -object.size,
            0,
            -object.size * 0.88,
          )
          context.quadraticCurveTo(
            object.size * 0.8,
            -object.size * 0.6,
            object.size,
            object.size * 0.65,
          )
          context.closePath()
          context.fill()
        } else if (object.kind === 'wall') {
          context.rotate(object.angle)
          context.fillStyle = '#7c8e91'
          context.fillRect(-object.size * 2.3, -8, object.size * 4.6, 16)
          context.strokeStyle = 'rgba(255,255,255,.32)'
          context.strokeRect(-object.size * 2.3, -8, object.size * 4.6, 16)
        } else if (object.kind === 'tree') {
          context.fillStyle = '#745a3b'
          context.fillRect(-3, 3, 6, object.size * 0.8)
          context.fillStyle = '#3e9564'
          context.beginPath()
          context.arc(0, -5, object.size * 0.75, 0, Math.PI * 2)
          context.fill()
        } else if (object.kind === 'fan') {
          context.strokeStyle = '#8a6c18'
          context.lineWidth = 3
          context.beginPath()
          context.arc(0, 0, object.size * 0.7, 0, Math.PI * 2)
          context.stroke()
          context.fillStyle = '#f2c64f'
          for (let index = 0; index < 3; index += 1) {
            context.rotate((Math.PI * 2) / 3)
            context.beginPath()
            context.ellipse(0, -8, 5, 10, 0.4, 0, Math.PI * 2)
            context.fill()
          }
        } else if (object.kind === 'filter') {
          context.strokeStyle = '#3c9262'
          context.lineWidth = 3
          context.strokeRect(-6, -object.size, 12, object.size * 2)
          context.lineWidth = 1
          for (let y = -object.size + 5; y < object.size; y += 6) {
            context.beginPath()
            context.moveTo(-6, y)
            context.lineTo(6, y)
            context.stroke()
          }
        } else if (object.kind === 'drain') {
          context.strokeStyle = '#526e78'
          context.lineWidth = 3
          context.beginPath()
          context.arc(0, 0, object.size * 0.7, 0, Math.PI * 2)
          context.stroke()
          context.lineWidth = 1
          context.beginPath()
          context.arc(0, 0, object.size * 0.35, 0, Math.PI * 2)
          context.stroke()
        } else if (object.kind === 'heater') {
          context.fillStyle = '#f07955'
          context.fillRect(-object.size * 0.7, -6, object.size * 1.4, 12)
          context.fillStyle = '#ffd36a'
          context.fillRect(-object.size * 0.45, -3, object.size * 0.9, 6)
        } else if (object.kind === 'ice') {
          context.fillStyle = 'rgba(218, 248, 255, 0.85)'
          context.strokeStyle = '#77c9dc'
          context.lineWidth = 2
          context.fillRect(
            -object.size * 0.65,
            -object.size * 0.65,
            object.size * 1.3,
            object.size * 1.3,
          )
          context.strokeRect(
            -object.size * 0.65,
            -object.size * 0.65,
            object.size * 1.3,
            object.size * 1.3,
          )
        }

        context.restore()
      }

      const animate = (time: number) => {
        const delta = Math.min((time - lastTime) / 16.67, 2)
        lastTime = time

        rainCloudsRef.current = rainCloudsRef.current.filter(
          (cloud) => cloud.until > time,
        )
        rainCloudsRef.current.forEach((cloud) => {
          addParticles(
            cloud.x + (Math.random() - 0.5) * 95,
            Math.max(10, cloud.y + 18),
            'water',
            3,
            (Math.random() - 0.5) * 0.08,
            1.4,
          )
        })

        drawBackground()

        particlesRef.current.forEach((particle) => {
          applyForces(particle)
          particle.vx += Math.sin(particle.y * 0.018 + time * 0.00045) * 0.002
          particle.vy += Math.cos(particle.x * 0.015 + time * 0.0004) * 0.0015

          if (particle.kind === 'smoke' || particle.kind === 'heat') {
            particle.vy -= 0.006
          } else {
            particle.vy += 0.0018
          }

          particle.vx *= 0.994
          particle.vy *= 0.994
          particle.x += particle.vx * delta
          particle.y += particle.vy * delta
          particle.life -= delta

          if (particle.x < particle.radius || particle.x > width - particle.radius) {
            particle.vx *= -0.65
            particle.x = Math.max(
              particle.radius,
              Math.min(width - particle.radius, particle.x),
            )
          }
          if (particle.y < particle.radius || particle.y > height - particle.radius) {
            particle.vy *= -0.65
            particle.y = Math.max(
              particle.radius,
              Math.min(height - particle.radius, particle.y),
            )
          }
        })

        particlesRef.current = particlesRef.current.filter(
          (particle) => particle.life > 0,
        )

        if (time - lastMetricsTimeRef.current > 450) {
          lastMetricsTimeRef.current = time
          const metrics = particlesRef.current.reduce<SimulationMetrics>(
            (total, particle) => {
              if (particle.kind === 'water' && particle.x > width * 0.78) {
                total.waterInOcean += 1
              }
              if (
                particle.kind === 'water' &&
                particle.x > width * 0.54 &&
                particle.x < width * 0.7 &&
                particle.y > height * 0.68
              ) {
                total.waterNearVillage += 1
              }
              if (particle.kind === 'pollution') {
                total.pollutionRemaining += 1
              }
              if (particle.kind === 'smoke' && particle.x > width * 0.58) {
                total.smokeToRight += 1
              }
              if (
                particle.kind === 'heat' &&
                particle.y < height * 0.42 &&
                particle.vy < 0
              ) {
                total.warmRising += 1
              }
              if (
                particle.kind === 'ice' &&
                particle.y > height * 0.58 &&
                particle.vy > 0
              ) {
                total.cooledSinking += 1
              }
              return total
            },
            {
              waterInOcean: 0,
              waterNearVillage: 0,
              pollutionRemaining: 0,
              smokeToRight: 0,
              warmRising: 0,
              cooledSinking: 0,
            },
          )
          onMetricsChangeRef.current(metrics)
        }

        drawParticles()
        rainCloudsRef.current.forEach((cloud) => {
          context.save()
          context.translate(cloud.x, cloud.y)
          context.fillStyle = 'rgba(255, 255, 255, 0.86)'
          context.strokeStyle = 'rgba(37, 118, 151, 0.18)'
          context.lineWidth = 2
          context.beginPath()
          context.arc(-22, 0, 16, Math.PI * 0.85, Math.PI * 2.05)
          context.arc(0, -8, 21, Math.PI, Math.PI * 2.05)
          context.arc(24, 0, 16, Math.PI * 1.15, Math.PI * 0.15)
          context.closePath()
          context.fill()
          context.stroke()
          context.strokeStyle = 'rgba(26, 168, 217, 0.55)'
          context.lineWidth = 3
          for (let index = -1; index <= 1; index += 1) {
            context.beginPath()
            context.moveTo(index * 18, 24)
            context.lineTo(index * 18 - 6, 39)
            context.stroke()
          }
          context.restore()
        })
        objectsRef.current.forEach(drawObject)

        animationFrame = requestAnimationFrame(animate)
      }

      const getPoint = (event: PointerEvent) => {
        const rect = canvas.getBoundingClientRect()
        return { x: event.clientX - rect.left, y: event.clientY - rect.top }
      }

      const applyTool = (x: number, y: number, tool: ToolId, dragging = false) => {
        if (tool === 'water' || tool === 'pollution' || tool === 'smoke') {
          addParticles(
            x,
            y,
            tool,
            dragging ? 5 : 24,
            (Math.random() - 0.5) * 0.6,
            tool === 'smoke' ? -0.2 : 0,
          )
        } else if (tool === 'rain') {
          rainUntilRef.current = performance.now() + 6500
          rainCloudsRef.current.push({
            x,
            y: Math.max(30, Math.min(y, height * 0.36)),
            until: rainUntilRef.current,
          })
          rainCloudsRef.current = rainCloudsRef.current.slice(-4)
        } else {
          objectsRef.current.push({
            x,
            y,
            kind: tool,
            size: tool === 'wall' ? 28 : tool === 'rock' ? 24 : 20,
            angle:
              tool === 'wall'
                ? Math.sin(objectsRef.current.length * 1.7) * 0.32
                : 0,
          })
          objectsRef.current = objectsRef.current.slice(-36)

          if (tool === 'heater') addParticles(x, y - 20, 'heat', 18, 0, -0.3)
          if (tool === 'ice') addParticles(x, y + 10, 'ice', 16, 0, 0.2)
        }
      }

      const handlePointerDown = (event: PointerEvent) => {
        canvas.setPointerCapture(event.pointerId)
        const point = getPoint(event)
        pointerRef.current = { down: true, ...point }
        applyTool(point.x, point.y, selectedToolRef.current)
        onToolActionRef.current(selectedToolRef.current)
      }

      const handlePointerMove = (event: PointerEvent) => {
        if (!pointerRef.current.down) return
        const point = getPoint(event)
        const dx = point.x - pointerRef.current.x
        const dy = point.y - pointerRef.current.y

        if (
          selectedToolRef.current === 'water' ||
          selectedToolRef.current === 'pollution' ||
          selectedToolRef.current === 'smoke'
        ) {
          applyTool(point.x, point.y, selectedToolRef.current, true)
        } else {
          particlesRef.current.forEach((particle) => {
            const distance = Math.hypot(particle.x - point.x, particle.y - point.y)
            if (distance < 75) {
              particle.vx += dx * 0.018
              particle.vy += dy * 0.018
            }
          })
        }

        pointerRef.current = { down: true, ...point }
      }

      const handlePointerUp = () => {
        pointerRef.current.down = false
      }

      resize()
      const observer = new ResizeObserver(resize)
      observer.observe(canvas)
      canvas.addEventListener('pointerdown', handlePointerDown)
      canvas.addEventListener('pointermove', handlePointerMove)
      canvas.addEventListener('pointerup', handlePointerUp)
      canvas.addEventListener('pointercancel', handlePointerUp)
      animationFrame = requestAnimationFrame(animate)

      return () => {
        cancelAnimationFrame(animationFrame)
        observer.disconnect()
        canvas.removeEventListener('pointerdown', handlePointerDown)
        canvas.removeEventListener('pointermove', handlePointerMove)
        canvas.removeEventListener('pointerup', handlePointerUp)
        canvas.removeEventListener('pointercancel', handlePointerUp)
      }
    }, [])

    return (
      <canvas
        ref={canvasRef}
        className="fluid-canvas"
        aria-label="Interactive water and air simulation. Select a tool, then click or drag here."
      />
    )
  },
)

FluidCanvas.displayName = 'FluidCanvas'

export { FluidCanvas }
