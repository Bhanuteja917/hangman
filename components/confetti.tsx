"use client"

import { useEffect, useState } from "react"

interface ConfettiProps {
  active: boolean
  duration?: number
}

interface ConfettiPiece {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  rotation: number
  rotationSpeed: number
  color: string
  size: number
}

export function Confetti({ active, duration = 3000 }: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([])

  useEffect(() => {
    if (!active) {
      setPieces([])
      return
    }

    const colors = [
      "#ff6b6b",
      "#4ecdc4",
      "#45b7d1",
      "#96ceb4",
      "#ffeaa7",
      "#dda0dd",
      "#98d8c8",
      "#f7dc6f",
      "#bb8fce",
      "#85c1e9",
    ]

    // Create initial confetti pieces
    const initialPieces: ConfettiPiece[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: -10,
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 3 + 2,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
    }))

    setPieces(initialPieces)

    const animationFrame = () => {
      setPieces((currentPieces) =>
        currentPieces
          .map((piece) => ({
            ...piece,
            x: piece.x + piece.vx,
            y: piece.y + piece.vy,
            vy: piece.vy + 0.1, // gravity
            rotation: piece.rotation + piece.rotationSpeed,
          }))
          .filter((piece) => piece.y < window.innerHeight + 10),
      )
    }

    const intervalId = setInterval(animationFrame, 16) // ~60fps

    const timeoutId = setTimeout(() => {
      clearInterval(intervalId)
      setPieces([])
    }, duration)

    return () => {
      clearInterval(intervalId)
      clearTimeout(timeoutId)
    }
  }, [active, duration])

  if (!active || pieces.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute"
          style={{
            left: `${piece.x}px`,
            top: `${piece.y}px`,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotation}deg)`,
            borderRadius: "2px",
          }}
        />
      ))}
    </div>
  )
}
