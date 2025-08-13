"use client"

import { Button } from "@/components/ui/button"
import { Trophy } from "lucide-react"

interface FloatingHeaderProps {
  logoSrc: string
  logoAlt: string
  companyName: string
  onLeaderboardClick?: () => void
}

export function FloatingHeader({ logoSrc, logoAlt, companyName, onLeaderboardClick }: FloatingHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center space-x-3">
          <img src={logoSrc || "/placeholder.svg"} alt={logoAlt} className="h-8 w-auto" />
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{companyName}</span>
        </div>

        {onLeaderboardClick && (
          <Button
            variant="outline"
            size="sm"
            onClick={onLeaderboardClick}
            className="flex items-center gap-2 bg-transparent"
          >
            <Trophy className="w-4 h-4" />
            Leaderboard
          </Button>
        )}
      </div>
    </header>
  )
}
