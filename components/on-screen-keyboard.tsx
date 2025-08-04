"use client"

import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

interface OnScreenKeyboardProps {
  onLetterClick: (letter: string) => void
  guessedLetters: Set<string>
  disabled: boolean
}

export function OnScreenKeyboard({ onLetterClick, guessedLetters, disabled }: OnScreenKeyboardProps) {
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

  useEffect(() => {
    // Check if device supports touch
    const checkTouchDevice = () => {
      setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0)
    }

    checkTouchDevice()
    window.addEventListener("resize", checkTouchDevice)

    return () => window.removeEventListener("resize", checkTouchDevice)
  }, [])

  // Hide keyboard on desktop devices
  if (!isTouchDevice) {
    return (
      <div className="text-center text-muted-foreground">
        <p className="text-sm">Use your keyboard to guess letters</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-6 sm:grid-cols-9 gap-2 max-w-2xl mx-auto">
      {letters.map((letter) => (
        <Button
          key={letter}
          variant={guessedLetters.has(letter) ? "secondary" : "outline"}
          size="sm"
          onClick={() => onLetterClick(letter)}
          disabled={disabled || guessedLetters.has(letter)}
          className="aspect-square text-sm font-semibold transition-all duration-200 hover:scale-105"
        >
          {letter}
        </Button>
      ))}
    </div>
  )
}
