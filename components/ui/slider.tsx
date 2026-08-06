"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// ── Slider ─────────────────────────────────────────────────────────────────

interface SliderProps {
  value?: number[]
  defaultValue?: number[]
  min?: number
  max?: number
  step?: number
  onValueChange?: (value: number[]) => void
  className?: string
  disabled?: boolean
}

function Slider({
  value: valueProp,
  defaultValue = [50],
  min = 0,
  max = 100,
  step = 1,
  onValueChange,
  className,
  disabled,
}: SliderProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const isControlled = valueProp !== undefined
  const value = isControlled ? valueProp : internalValue

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = [Number(e.target.value)]
    if (!isControlled) setInternalValue(newVal)
    onValueChange?.(newVal)
  }

  const percentage = ((value[0] - min) / (max - min)) * 100

  return (
    <div className={cn("relative flex w-full touch-none select-none items-center", className)}>
      <div className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-secondary">
        <div
          className="absolute h-full bg-primary transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value[0]}
        disabled={disabled}
        onChange={handleChange}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        style={{ zIndex: 1 }}
      />
      <div
        className="absolute h-4 w-4 rounded-full border-2 border-primary bg-background shadow transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        style={{ left: `calc(${percentage}% - 8px)` }}
      />
    </div>
  )
}

export { Slider }
