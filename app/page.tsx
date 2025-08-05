"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { HangmanDrawing } from "@/components/hangman-drawing"
import { OnScreenKeyboard } from "@/components/on-screen-keyboard"
import { FloatingHeader } from "@/components/floating-header"
import { Confetti } from "@/components/confetti"
import { Clock, Trophy, Target, Lightbulb } from "lucide-react"
import hangmanConfig from "../hangman.config.json"

type GameState = "setup" | "playing" | "roundComplete" | "gameComplete"
type WordData = { word: string; hints: string[] }

export default function HangmanGame() {
  // Game setup state
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("")
  const [gameState, setGameState] = useState<GameState>("setup")

  // Game state
  const [currentRound, setCurrentRound] = useState(1)
  const [currentWord, setCurrentWord] = useState<WordData>({ word: "", hints: [] })
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set())
  const [wrongGuesses, setWrongGuesses] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [score, setScore] = useState(0)
  const [usedWords, setUsedWords] = useState<Set<string>>(new Set())

  // Add these new state variables after the existing state declarations:
  const [hint1Used, setHint1Used] = useState(false)
  const [hint2Used, setHint2Used] = useState(false)
  const [showHint1, setShowHint1] = useState(false)
  const [showHint2, setShowHint2] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  const difficultySettings = selectedDifficulty
    ? hangmanConfig.difficulty[selectedDifficulty as keyof typeof hangmanConfig.difficulty]
    : hangmanConfig.difficulty.Easy

  const maxWrongGuesses = difficultySettings.maxWrongGuesses
  const timePerQuestion = difficultySettings.timePerQuestion

  // Check if word is complete
  const isWordComplete = currentWord.word.split("").every((letter) => letter === " " || guessedLetters.has(letter))

  // Check if game is lost
  const isGameLost = wrongGuesses >= maxWrongGuesses || timeLeft <= 0

  // Calculate score based on configuration
  const calculateScore = useCallback(() => {
    if (!isWordComplete || isGameLost) return 0

    const { baseScore, timeBonus, timeBonusMultiplier, difficultyMultiplier } = difficultySettings
    const { hintBonus, hint1Penalty, hint2Penalty, wrongGuessPenalty } = hangmanConfig.scoring

    let finalScore = baseScore

    // Add time bonus if enabled
    if (timeBonus) {
      const timeBonusPoints = Math.floor((timeLeft / timePerQuestion) * 100 * timeBonusMultiplier)
      finalScore += timeBonusPoints
    }

    // Apply difficulty multiplier
    finalScore *= difficultyMultiplier

    // Apply hint penalties/bonuses
    if (hint1Used) {
      finalScore -= hint1Penalty // This will be 0 (no penalty) or negative (penalty)
    }
    if (hint2Used) {
      finalScore -= hint2Penalty // This will be 0 (no penalty) or negative (penalty)
    }

    // Add hint bonus if no hints were used
    if (!hint1Used) {
      finalScore += hintBonus
    }

    // Subtract wrong guess penalty (multiply wrong guesses by penalty)
    const wrongGuessPenaltyTotal = wrongGuesses * wrongGuessPenalty
    finalScore -= wrongGuessPenaltyTotal

    return Math.max(0, finalScore) // Ensure score doesn't go negative
  }, [isWordComplete, isGameLost, timeLeft, timePerQuestion, difficultySettings, hint1Used, hint2Used, wrongGuesses])

  // Get a random word from selected category
  const getRandomWord = useCallback(() => {
    if (!selectedCategory) return { word: "", hints: [] }

    const categoryWords = hangmanConfig.categories[selectedCategory as keyof typeof hangmanConfig.categories]
    const availableWords = categoryWords.filter((wordData) => !usedWords.has(wordData.word))

    if (availableWords.length === 0) {
      // Reset used words if all have been used
      setUsedWords(new Set())
      return categoryWords[Math.floor(Math.random() * categoryWords.length)]
    }

    return availableWords[Math.floor(Math.random() * availableWords.length)]
  }, [selectedCategory, usedWords])

  // Start new round
  const startNewRound = useCallback(() => {
    const newWord = getRandomWord()
    setCurrentWord(newWord)
    setGuessedLetters(new Set())
    setWrongGuesses(0)
    setTimeLeft(timePerQuestion)
    setHint1Used(false)
    setHint2Used(false)
    setShowHint1(false)
    setShowHint2(false)
    setUsedWords((prev) => new Set([...prev, newWord.word]))
    setGameState("playing")
  }, [getRandomWord, timePerQuestion])

  // Handle letter guess
  const handleLetterGuess = useCallback(
    (letter: string) => {
      if (gameState !== "playing" || guessedLetters.has(letter)) return

      const newGuessedLetters = new Set([...guessedLetters, letter])
      setGuessedLetters(newGuessedLetters)

      if (!currentWord.word.includes(letter)) {
        setWrongGuesses((prev) => prev + 1)
      }
    },
    [gameState, guessedLetters, currentWord.word],
  )

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const letter = event.key.toUpperCase()
      if (letter >= "A" && letter <= "Z") {
        handleLetterGuess(letter)
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [handleLetterGuess])

  // Timer effect
  useEffect(() => {
    if (gameState === "playing" && timeLeft > 0 && !isWordComplete && !isGameLost) {
      const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [gameState, timeLeft, isWordComplete, isGameLost])

  // Update the scoring calculation in the round completion effect:
  useEffect(() => {
    if (gameState === "playing" && (isWordComplete || isGameLost)) {
      if (isWordComplete && !isGameLost) {
        const roundScore = calculateScore()
        setScore((prev) => prev + roundScore)
      } else if (isGameLost && timeLeft <= 0) {
        // Apply timeout penalty
        const penalty = hangmanConfig.scoring.timeoutPenalty
        setScore((prev) => Math.max(0, prev - penalty))
      }

      setTimeout(() => {
        if (currentRound >= hangmanConfig.gameSettings.roundsPerSession) {
          setGameState("gameComplete")
        } else {
          setGameState("roundComplete")
        }
      }, 250)
    }
  }, [gameState, isWordComplete, isGameLost, timeLeft, currentRound, calculateScore])

  // Check for confetti when game completes
  useEffect(() => {
    if (gameState === "gameComplete") {
      const confettiThreshold = difficultySettings.confettiThreshold
      if (score >= confettiThreshold) {
        // Delay confetti slightly to let the overlay animate in
        setTimeout(() => {
          setShowConfetti(true)
        }, 500)
      }
    }
  }, [gameState, score, difficultySettings.confettiThreshold])

  // Start game
  const startGame = () => {
    setCurrentRound(1)
    setScore(0)
    setUsedWords(new Set())
    setShowConfetti(false)
    startNewRound()
  }

  // Next round with animation
  const nextRound = () => {
    setIsExiting(true)
    setTimeout(() => {
      setCurrentRound((prev) => prev + 1)
      setIsExiting(false)
      startNewRound()
    }, 700) // Match the animation duration
  }

  // Reset game
  const resetGame = () => {
    setGameState("setup")
    setSelectedCategory("")
    setSelectedDifficulty("")
    setCurrentRound(1)
    setScore(0)
    setUsedWords(new Set())
    setShowConfetti(false)
  }

  // Render word with guessed letters
  const renderWord = () => {
    return currentWord.word.split("").map((letter, index) => (
      <span key={index} className="inline-block w-8 h-10 mx-1 text-2xl font-bold text-center border-b-2 border-primary">
        {letter === " " ? " " : guessedLetters.has(letter) ? letter : ""}
      </span>
    ))
  }

  // Add a new function to handle hint showing:
  const handleShowHint1 = () => {
    setHint1Used(true)
    setShowHint1(true)
  }

  const handleShowHint2 = () => {
    setHint2Used(true)
    setShowHint2(true)
  }

  // Get animation classes for round complete overlay
  const getRoundCompleteClasses = () => {
    const baseClasses =
      "fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center z-50"
    const animationClasses = isExiting
      ? "animate-out slide-out-to-top-full duration-1000 ease-out"
      : "animate-in slide-in-from-bottom-full duration-700 ease-in"
    return `${baseClasses} ${animationClasses}`
  }

  return (
    <>
      {/* Confetti Animation */}
      <Confetti active={showConfetti} duration={4000} />

      {/* Floating Header */}
      <FloatingHeader
        logoSrc="/placeholder.svg?height=40&width=120&text=Your+Company"
        logoAlt="Your Company Logo"
        companyName="UBS"
      />

      {gameState === "setup" && (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 pt-20">
          <div className="max-w-2xl mx-auto pt-20">
            <Card className="shadow-2xl">
              <CardHeader className="text-center">
                <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Hangman Game
                </CardTitle>
                <p className="text-muted-foreground mt-2">Guess the word before time runs out!</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium ml-1 mb-0">Select Category</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-full mt-px">
                        <SelectValue placeholder="Choose a category..." />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(hangmanConfig.categories).map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium ml-1">Select Difficulty</label>
                    <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose difficulty..." />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(hangmanConfig.difficulty).map(([level, settings]) => (
                          <SelectItem key={level} value={level}>
                            {level} (Base: {settings.baseScore} pts, {settings.timePerQuestion}s,{" "}
                            {settings.maxWrongGuesses} wrong guesses, Confetti: {settings.confettiThreshold}+ pts)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Game Rules:</h3>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• {hangmanConfig.gameSettings.roundsPerSession} rounds per game</li>
                    <li>• Guess letters using keyboard or on-screen buttons</li>
                    <li>• Complete words before time runs out</li>
                    <li>• Higher difficulty = more points!</li>
                    <li>• Wrong guess penalty: -{hangmanConfig.scoring.wrongGuessPenalty} pts per wrong guess</li>
                    <li>• Timeout penalty: -{hangmanConfig.scoring.timeoutPenalty} pts</li>
                    <li>• Hint bonus: +{hangmanConfig.scoring.hintBonus} pts (if no hints used)</li>
                  </ul>
                </div>

                <Button
                  onClick={startGame}
                  disabled={!selectedCategory || !selectedDifficulty}
                  className="w-full text-lg py-6"
                  size="lg"
                >
                  🎮 Start Game
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {gameState === "playing" && (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 pt-20">
          <div className="max-w-4xl mx-auto flex flex-col items-center my-auto">
            {/* Centered Timer */}
            <div className="flex items-center gap-2 mb-8">
              <Clock className="w-8 h-8" />
              <span className={`text-4xl font-bold ${timeLeft <= 10 ? "text-red-500 animate-pulse" : ""}`}>
                {timeLeft}s
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-md mb-6">
              <Progress value={(timeLeft / timePerQuestion) * 100} className="h-2" />
            </div>

            {/* Game Info Badges */}
            <div className="flex items-center gap-4 mb-6">
              <Badge variant="outline" className="text-lg px-3 py-1">
                <Target className="w-4 h-4 mr-1" />
                Round {currentRound}/{hangmanConfig.gameSettings.roundsPerSession}
              </Badge>
              <Badge variant="outline" className="text-lg px-3 py-1">
                <Trophy className="w-4 h-4 mr-1" />
                Score: {score}
              </Badge>
            </div>

            {/* Centered Main Game Card */}
            <Card className="shadow-2xl w-full max-w-4xl">
              <CardHeader className="text-center">
                <div className="flex justify-between items-center">
                  <Badge variant="secondary">{selectedCategory}</Badge>
                  <Badge variant="secondary">{selectedDifficulty}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-3 gap-8">
                  {/* Word Display - Cells A and B (spans 2 columns) */}
                  <div className="col-span-2 flex flex-col items-center justify-center space-y-6 min-h-[200px]">
                    <div className="text-center w-full">
                      <div className="mb-4">{renderWord()}</div>

                      {/* Hint Buttons */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 justify-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleShowHint1}
                            disabled={hint1Used}
                            className="mb-2 bg-transparent"
                          >
                            <Lightbulb className="w-4 h-4 mr-1" />
                            Hint 1 {hint1Used && "✓"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleShowHint2}
                            disabled={hint2Used || !hint1Used}
                            className="mb-2 bg-transparent"
                          >
                            <Lightbulb className="w-4 h-4 mr-1" />
                            Hint 2 {hint2Used && "✓"}{" "}
                            {!hint1Used &&
                              hangmanConfig.scoring.hint2Penalty > 0 &&
                              `(-${hangmanConfig.scoring.hint2Penalty})`}
                          </Button>
                        </div>

                        {showHint1 && hint1Used && (
                          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                              💡 Hint 1: {currentWord.hints[0]}
                            </p>
                          </div>
                        )}

                        {showHint2 && hint2Used && (
                          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                              💡 Hint 2: {currentWord.hints[1]}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Game Status
                    {isWordComplete && (
                      <div className="text-center animate-in fade-in duration-500">
                        <p className="text-2xl font-bold text-green-600">🎉 Correct!</p>
                        <p className="text-sm text-muted-foreground">
                          +{calculateScore()} points
                          {wrongGuesses > 0 && (
                            <span className="block text-red-500 text-xs">
                              -{wrongGuesses * hangmanConfig.scoring.wrongGuessPenalty} pts wrong guess penalty
                            </span>
                          )}
                          {!hint1Used && (
                            <span className="block text-green-500 text-xs">
                              +{hangmanConfig.scoring.hintBonus} pts no hint bonus!
                            </span>
                          )}
                        </p>
                      </div>
                    )}

                    {isGameLost && (
                      <div className="text-center animate-in fade-in duration-500">
                        <p className="text-2xl font-bold text-red-600">💀 Game Over!</p>
                        <p className="text-lg">
                          The word was: <span className="font-bold">{currentWord.word}</span>
                        </p>
                        {timeLeft <= 0 && (
                          <p className="text-sm text-red-500">
                            -{hangmanConfig.scoring.timeoutPenalty} pts timeout penalty
                          </p>
                        )}
                        {wrongGuesses > 0 && (
                          <p className="text-sm text-red-500">
                            -{wrongGuesses * hangmanConfig.scoring.wrongGuessPenalty} pts wrong guess penalty
                          </p>
                        )}
                      </div>
                    )} */}
                  </div>

                  {/* Hangman Drawing - Cell C */}
                  <div className="col-span-1 flex flex-col items-center space-y-4">
                    <HangmanDrawing wrongGuesses={wrongGuesses} maxWrongGuesses={maxWrongGuesses} />
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        Wrong guesses: {wrongGuesses}/{maxWrongGuesses}
                      </p>
                      <p className="text-xs text-red-500">
                        Total wrong: {wrongGuesses} (-{wrongGuesses * hangmanConfig.scoring.wrongGuessPenalty} pts)
                      </p>
                    </div>
                  </div>
                </div>

                {/* On-Screen Keyboard */}
                <div className="space-y-4">
                  <OnScreenKeyboard
                    onLetterClick={handleLetterGuess}
                    guessedLetters={guessedLetters}
                    disabled={isWordComplete || isGameLost}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {gameState === "roundComplete" && (
        <div className={getRoundCompleteClasses()}>
          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center space-y-8">
            <div className="space-y-12">
              <p className="text-lg text-muted-foreground font-medium">
                Round {currentRound}/{hangmanConfig.gameSettings.roundsPerSession}
              </p>

              <div className="space-y-4">
                <p className="text-2xl text-foreground font-medium">{isWordComplete ? "Correct!" : "Missed"}</p>
                <h1 className="text-6xl font-bold text-foreground leading-tight">{currentWord.word.toLowerCase()}</h1>
                <p className="text-xl text-muted-foreground">
                  {isWordComplete ? `+${calculateScore()} points` : "Better luck next time"}
                </p>
              </div>

              <div className="pt-8">
                <Button onClick={nextRound} className="px-8 py-3 text-lg font-medium rounded-lg shadow-lg" size="lg">
                  {currentRound >= hangmanConfig.gameSettings.roundsPerSession ? "Final Results" : "Next Round"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {gameState === "gameComplete" && (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center z-40 animate-in slide-in-from-top-full duration-700 ease-out">
          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center space-y-8">
            <div className="space-y-12">
              <p className="text-lg text-muted-foreground font-medium">Game Complete</p>

              <div className="space-y-4">
                <p className="text-2xl text-foreground font-medium">Final Score</p>
                <h1 className="text-6xl font-bold text-foreground leading-tight">{score}</h1>
                <p className="text-sm text-muted-foreground">
                  You scored {score} points
                </p>
              </div>

              <div className="pt-8">
                <Button
                  onClick={() => window.location.reload()}
                  className="px-8 py-3 text-lg font-medium rounded-lg shadow-lg"
                  size="lg"
                >
                  🏠 Back to Home
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
