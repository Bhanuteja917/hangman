"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { X } from "lucide-react"

export interface LeaderboardEntry {
  gpn: number
  timeTaken: number
  score: number
  date: string
  difficulty: string
  category: string
}

interface LeaderboardOverlayProps {
  isOpen: boolean
  onClose: () => void
  entries: LeaderboardEntry[]
}

// Dummy data for demonstration
const dummyEntries: LeaderboardEntry[] = [
  {
    gpn: 1,
    timeTaken: 145,
    score: 95,
    date: "2024-01-15T10:30:00Z",
    difficulty: "Hard",
    category: "Movies",
  },
  {
    gpn: 2,
    timeTaken: 180,
    score: 88,
    date: "2024-01-15T11:15:00Z",
    difficulty: "Medium",
    category: "Fruits",
  },
  {
    gpn: 3,
    timeTaken: 120,
    score: 82,
    date: "2024-01-15T14:20:00Z",
    difficulty: "Hard",
    category: "Programming Terms",
  },
  {
    gpn: 4,
    timeTaken: 200,
    score: 75,
    date: "2024-01-15T15:45:00Z",
    difficulty: "Easy",
    category: "Animals",
  },
  {
    gpn: 5,
    timeTaken: 165,
    score: 70,
    date: "2024-01-15T16:30:00Z",
    difficulty: "Medium",
    category: "Countries",
  },
  {
    gpn: 6,
    timeTaken: 190,
    score: 65,
    date: "2024-01-15T17:10:00Z",
    difficulty: "Easy",
    category: "Technology",
  },
  {
    gpn: 7,
    timeTaken: 210,
    score: 58,
    date: "2024-01-15T18:00:00Z",
    difficulty: "Medium",
    category: "Food",
  },
  {
    gpn: 8,
    timeTaken: 240,
    score: 45,
    date: "2024-01-15T19:15:00Z",
    difficulty: "Easy",
    category: "Sports",
  },
]

export function LeaderboardOverlay({ isOpen, onClose, entries }: LeaderboardOverlayProps) {
  if (!isOpen) return null

  // Use dummy data for now
  const displayEntries = dummyEntries.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return a.timeTaken - b.timeTaken
  })

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "hard":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getRankDisplay = (index: number) => {
    switch (index) {
      case 0:
        return "🥇"
      case 1:
        return "🥈"
      case 2:
        return "🥉"
      default:
        return `#${index + 1}`
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-2xl font-bold">🏆 Leaderboard</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="overflow-auto max-h-[60vh]">
          {displayEntries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-lg">No games completed yet!</p>
              <p className="text-sm">Start playing to see your scores here.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead className="w-16">GPN</TableHead>
                  <TableHead className="w-20">Time</TableHead>
                  <TableHead className="w-20">Score</TableHead>
                  <TableHead className="w-24">Difficulty</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="w-24">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayEntries.map((entry, index) => (
                  <TableRow
                    key={`${entry.gpn}-${entry.date}`}
                    className={
                      index < 3
                        ? "bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20"
                        : ""
                    }
                  >
                    <TableCell className="font-medium text-lg">{getRankDisplay(index)}</TableCell>
                    <TableCell className="font-mono">{entry.gpn}</TableCell>
                    <TableCell className="font-mono">{formatTime(entry.timeTaken)}</TableCell>
                    <TableCell className="font-bold">{entry.score}</TableCell>
                    <TableCell>
                      <Badge className={getDifficultyColor(entry.difficulty)}>{entry.difficulty}</Badge>
                    </TableCell>
                    <TableCell>{entry.category}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(entry.date)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
