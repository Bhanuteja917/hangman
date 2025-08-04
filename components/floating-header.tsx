"use client"

interface FloatingHeaderProps {
  logoSrc?: string
  logoAlt?: string
  companyName?: string
}

export function FloatingHeader({
  logoSrc = "/placeholder.svg?height=40&width=120&text=Company+Logo",
  logoAlt = "Company Logo",
  companyName = "UBS",
}: FloatingHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/20 dark:border-gray-700/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center space-x-3">
            <img src={logoSrc || "/placeholder.svg"} alt={logoAlt} className="h-8 w-auto object-contain" />
            <span className="text-lg font-semibold text-gray-900 dark:text-white hidden sm:block">{companyName}</span>
          </div>

          {/* Optional Navigation or Actions */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 dark:text-gray-300 hidden md:block">{"Developer Community Tech Unleashed"}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
