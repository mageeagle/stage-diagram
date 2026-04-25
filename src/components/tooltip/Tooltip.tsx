import { useState, useEffect } from 'react'

interface TooltipProps {
  position: 'top' | 'right' | 'bottom' | 'left'
  isVisible: boolean
  content: React.ReactNode
  className?: string
}

export function Tooltip({ position, isVisible, content, className }: TooltipProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 150)
    return () => clearTimeout(timer)
  }, [isVisible])

  if (!isVisible || !mounted) {
    return null
  }

  return (
    <div
      className={`absolute z-50 rounded-md bg-stone-50 dark:bg-stone-700 px-2 py-1 text-xs border border-stone-200 dark:border-stone-600 shadow-sm transition-opacity duration-150 ${className}`}
      role="tooltip"
      data-tooltip-position={position}
    >
      {content}
    </div>
  )
}
