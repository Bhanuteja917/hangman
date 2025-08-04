"use client"

interface HangmanDrawingProps {
  wrongGuesses: number
  maxWrongGuesses: number
}

export function HangmanDrawing({ wrongGuesses, maxWrongGuesses }: HangmanDrawingProps) {
  const parts = [
    // Gallows base
    <line key="base" x1="10" y1="190" x2="70" y2="190" stroke="currentColor" strokeWidth="3" />,
    // Gallows pole
    <line key="pole" x1="30" y1="190" x2="30" y2="20" stroke="currentColor" strokeWidth="3" />,
    // Gallows top
    <line key="top" x1="30" y1="20" x2="100" y2="20" stroke="currentColor" strokeWidth="3" />,
    // Noose
    <line key="noose" x1="100" y1="20" x2="100" y2="40" stroke="currentColor" strokeWidth="3" />,
    // Head
    <circle key="head" cx="100" cy="50" r="10" stroke="currentColor" strokeWidth="3" fill="none" />,
    // Body
    <line key="body" x1="100" y1="60" x2="100" y2="130" stroke="currentColor" strokeWidth="3" />,
    // Left arm
    <line key="leftArm" x1="100" y1="80" x2="80" y2="100" stroke="currentColor" strokeWidth="3" />,
    // Right arm
    <line key="rightArm" x1="100" y1="80" x2="120" y2="100" stroke="currentColor" strokeWidth="3" />,
    // Left leg
    <line key="leftLeg" x1="100" y1="130" x2="80" y2="160" stroke="currentColor" strokeWidth="3" />,
    // Right leg
    <line key="rightLeg" x1="100" y1="130" x2="120" y2="160" stroke="currentColor" strokeWidth="3" />,
  ]

  // Calculate how many parts to show based on wrong guesses and max wrong guesses
  // Ensure the hangman is fully drawn when maxWrongGuesses is reached
  const totalParts = parts.length
  const partsToShow = Math.min(Math.ceil((wrongGuesses / maxWrongGuesses) * totalParts), totalParts)

  return (
    <div className="flex justify-center">
      <svg width="150" height="200" className="text-foreground">
        {parts.slice(0, partsToShow).map((part, index) => (
          <g key={index} className="animate-in fade-in duration-300">
            {part}
          </g>
        ))}
      </svg>
    </div>
  )
}
